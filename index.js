require('dotenv').config(); // Load environment variables

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { processAIRequest } = require('./controllers/AIController'); // Import AI controller
const { processFileUpload } = require('./controllers/DocumentReaderController'); // Import document reader controller

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup Multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Sample route to check server status
app.get('/', (req, res) => {
    res.send('Server is running');
});

// Route to handle document reading (extraction of content from uploaded files)
app.post('/api/read-document', upload.single('file'), processFileUpload);

// Route to handle AI interactions (processing prompt + extracted document content)
// No need to re-upload the file here; just pass the extracted content and prompt.
app.post('/api/ai-process', processAIRequest);

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
