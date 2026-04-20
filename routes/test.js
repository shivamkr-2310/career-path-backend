const express = require('express');
const { generateQuestions, getAIAdvice, seedQuestions } = require('../controllers/testController');
const router = express.Router();

// Using POST for generation as requested in the new logic
router.post('/generate-questions', generateQuestions);
router.post('/ai-advice', getAIAdvice);
router.post('/seed', seedQuestions);

module.exports = router;
