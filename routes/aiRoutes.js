// server/routes/aiRoutes.js
const express = require('express');
const router = express.Router();
const { processAIRequest } = require('../controllers/AIController');

router.post('/process', processAIRequest);

module.exports = router;
