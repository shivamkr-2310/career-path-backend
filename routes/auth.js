const express = require('express');
const { registerUser, loginUser, updateProfile } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateProfile);

module.exports = router;
