const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');
const fileType = require('file-type');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const XLSX = require('xlsx');
const admin = require('firebase-admin');

const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization;

    if (!idToken) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        req.user = decodedToken;
        next();
    } catch (error) {
        console.error('Error verifying token:', error);
        return res.status(403).json({ error: 'Unauthorized' });
    }
};

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
            return file.buffer.toString('utf8');
        }
    } else {
        return file.buffer.toString('utf8');
    }
};

const processFileUpload = async (req, res) => {
    const files = req.files;
    const userId = req.userId; // Firebase UID from verifyToken

    if (!files || files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    const db = await connectToDatabase();
    try {
        const uploadedDocuments = [];
        let extractedContentArray = [];

        for (let file of files) {
            const content = await extractFileContent(file);
            extractedContentArray.push(content);

            const documentRecord = {
                userId, // Associate document with user
                documentName: file.originalname,
                documentContent: content,
                uploadDate: new Date(),
            };

            const result = await db.collection('documents').insertOne(documentRecord);
            uploadedDocuments.push(result.insertedId);
        }

        res.json({ success: true, documentIds: uploadedDocuments, contents: extractedContentArray });
    } catch (error) {
        console.error('Error uploading documents:', error);
        res.status(500).json({ error: 'Failed to upload documents' });
    }
};

const getUploadedDocuments = async (req, res) => {
    const userId = req.userId; // Firebase UID

    const db = await connectToDatabase();
    try {
        const documents = await db.collection('documents').find({ userId }).toArray(); // Fetch only the documents of this user
        res.json({ success: true, documents });
    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
};


const deleteDocuments = async (req, res) => {
    const { documentIds } = req.body;

    if (!documentIds || !Array.isArray(documentIds)) {
        return res.status(400).json({ error: 'Invalid document IDs' });
    }

    const db = await connectToDatabase();
    try {
        const result = await db.collection('documents').deleteMany({ _id: { $in: documentIds.map(id => new ObjectId(id)) }, userId: req.userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Documents not found or unauthorized' });
        }

        res.json({ success: true, message: `${result.deletedCount} documents deleted` });
    } catch (error) {
        console.error('Error deleting documents:', error);
        res.status(500).json({ error: 'Failed to delete documents' });
    }
};


module.exports = { processFileUpload, getUploadedDocuments, deleteDocuments, verifyToken };
