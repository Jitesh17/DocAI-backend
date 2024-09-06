const { ObjectId } = require('mongodb'); 
const { connectToDatabase } = require('../db');
const fileType = require('file-type');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');

const extractFileContent = async (file) => {
    const fileTypeResult = await fileType.fromBuffer(file.buffer);

    if (fileTypeResult) {
        const ext = fileTypeResult.ext;

        if (ext === 'pdf') {
            return pdfParse(file.buffer).then(data => data.text);
        } else if (ext === 'docx') {
            const result = await mammoth.extractRawText({ buffer: file.buffer });
            return result.value;
        } else if (ext === 'xlsx') {
            const workbook = XLSX.read(file.buffer, { type: 'buffer' });
            let sheetData = '';
            workbook.SheetNames.forEach(sheetName => {
                sheetData += XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);
            });
            return sheetData;
        } else {
            return file.buffer.toString('utf8'); // Handle text files and others
        }
    } else {
        return file.buffer.toString('utf8'); // Fallback for text files
    }
};

const processFileUpload = async (req, res) => {
    const files = req.files;

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const db = await connectToDatabase();
    try {
        const uploadedDocuments = [];
        let extractedContentArray = []; // Initialize an array for extracted content

        for (let file of files) {
            const content = await extractFileContent(file); // Extract file content
            extractedContentArray.push(content); 

            const documentRecord = {
                documentName: file.originalname,
                documentContent: content,
                uploadDate: new Date(),
            };


            const result = await db.collection('documents').insertOne(documentRecord);
            uploadedDocuments.push(result.insertedId); // Store document ID
        }

        res.json({ success: true, documentIds: uploadedDocuments, contents: extractedContentArray });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Failed to upload documents' });
    }
};

const getUploadedDocuments = async (req, res) => {
    const db = await connectToDatabase();
    try {
        const documents = await db.collection('documents').find({}, { projection: { documentName: 1, _id: 1 } }).toArray();
        res.json({ success: true, documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};

// Function to delete multiple documents by their IDs
const deleteDocuments = async (req, res) => {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
        return res.status(400).json({ error: 'Invalid document IDs' });
    }

    const db = await connectToDatabase();

    try {
        const objectIds = documentIds.map(id => new ObjectId(id)); // Convert to ObjectId array
        const result = await db.collection('documents').deleteMany({ _id: { $in: objectIds } });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Documents not found' });
        }

        res.json({ success: true, message: `${result.deletedCount} documents deleted successfully` });
    } catch (error) {
        console.error('Error deleting documents:', error);
        res.status(500).json({ error: 'Failed to delete documents' });
    }
};

module.exports = { processFileUpload, getUploadedDocuments, deleteDocuments };
