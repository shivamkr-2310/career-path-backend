const express = require('express');
const { registerUser, loginUser, updateProfile, syncClerkUser } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', updateProfile);
router.post('/sync-clerk', syncClerkUser);

module.exports = router;
