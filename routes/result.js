const express = require('express');
const { saveResult, getResults, generateRuleBasedResult } = require('../controllers/resultController');
const router = express.Router();

router.post('/', saveResult);
router.post('/calculate', generateRuleBasedResult);
router.get('/:userId', getResults);

module.exports = router;
