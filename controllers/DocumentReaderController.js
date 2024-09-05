const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const xlsx = require('xlsx');

// Function to extract content from different file types
const extractFileContent = async (file) => {
    const fileBuffer = file.buffer;
    const fileType = file.mimetype;

    try {
        if (fileType === 'application/pdf') {
            const pdfData = await pdfParse(fileBuffer);
            return pdfData.text;  // Extract text from PDF

        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const docxData = await mammoth.extractRawText({ buffer: fileBuffer });
            return docxData.value;  // Extract text from DOCX

        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                   fileType === 'application/vnd.ms-excel') {
            const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
            let sheetData = '';

            workbook.SheetNames.forEach(sheetName => {
                const sheet = workbook.Sheets[sheetName];
                sheetData += xlsx.utils.sheet_to_csv(sheet);  // Convert sheet to CSV text
            });

            return sheetData;  // Return all sheets' data as CSV
        } else {
            return 'Unsupported file format. Please upload PDF, DOCX, or Excel files.';
        }
    } catch (error) {
        console.error('Error extracting file content:', error);
        throw new Error('Failed to read the uploaded document.');
    }
};

// Controller to handle file uploads and return extracted content
const processFileUpload = async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const fileContent = await extractFileContent(file);
        
        // Debugging: Log the extracted content
        console.log('Extracted Content:', fileContent);
        
        res.json({ content: fileContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { processFileUpload };
