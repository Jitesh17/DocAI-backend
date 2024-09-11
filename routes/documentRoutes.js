// server/routes/documentRoutes.js
const express = require('express');
const { processFileUpload, deleteDocuments } = require('../controllers/DocumentReaderController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Allow authenticated users to upload
router.post('/upload', authenticateToken, processFileUpload);

// Only admins can delete documents
router.delete('/delete', authenticateToken, authorizeRole('admin'), deleteDocuments);

module.exports = router;
