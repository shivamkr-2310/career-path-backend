const { pool } = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  const { name, email, password, level, stream, course, branch, semester, clerkId } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      'INSERT INTO users (clerk_id, name, email, password, level, stream, course, branch, semester) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
      [clerkId || null, name, email, hashedPassword, level || '', stream || '', course || '', branch || '', semester || '']
    );

    const user = newUser.rows[0];

    res.status(201).json({
      _id: user.id,
      clerkId: user.clerk_id,
      name: user.name,
      email: user.email,
      level: user.level,
      stream: user.stream,
      course: user.course,
      branch: user.branch,
      semester: user.semester,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Input validation
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      _id: user.id,
      clerkId: user.clerk_id,
      name: user.name,
      email: user.email,
      level: user.level,
      stream: user.stream,
      course: user.course,
      branch: user.branch,
      semester: user.semester,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
};

const updateProfile = async (req, res) => {
  const { userId, level, stream, course, branch, semester } = req.body;
  
  // Input validation
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET level = $1, stream = $2, course = $3, branch = $4, semester = $5 WHERE id = $6 RETURNING id, name, email, level, stream, course, branch, semester',
      [level || '', stream || '', course || '', branch || '', semester || '', userId]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Profile update failed. Please try again.' });
  }
};

module.exports = { registerUser, loginUser, updateProfile };
