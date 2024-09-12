require('dotenv').config(); 

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const verifyToken = require('./middlewares/verifyToken');
const { processAIRequest } = require('./controllers/AIController');
const { processFileUpload, getUploadedDocuments, deleteDocuments } = require('./controllers/DocumentReaderController'); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Multer for handling file uploads (up to 10 files)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Sample route to check server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Route to handle document reading (extraction of content from uploaded files)
// This route accepts multiple file uploads (up to 10 files)
app.post('/api/read-document', upload.array('files', 10), processFileUpload);

// Route to get all uploaded documents
app.get('/api/uploaded-documents', getUploadedDocuments);

// Route to handle document deletion
app.delete('/api/delete-documents', deleteDocuments);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

// Protect this route
app.post('/api/send-to-ai', verifyToken, processAIRequest);