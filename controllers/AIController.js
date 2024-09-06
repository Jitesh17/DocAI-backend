const axios = require('axios');
const { ObjectId } = require('mongodb'); // Required to work with MongoDB ObjectId
const { connectToDatabase } = require('../db');

// Controller to handle AI requests
const processAIRequest = async (req, res) => {
    const { api, prompt, documentIds, useFrontendApiKey, openAiApiKey, claudeApiKey } = req.body; // Accept multiple document IDs and keys

    try {
        const db = await connectToDatabase();
        const documents = await db.collection('documents').find({ _id: { $in: documentIds.map(id => new ObjectId(id)) } }).toArray();

        // Concatenate document contents
        const concatenatedContent = documents.map(doc => doc.documentContent).join('\n\n');

        // Combine the concatenated content with the prompt
        const finalPrompt = `${concatenatedContent}\n\n${prompt}`;

        let response;
        let apiKey;

        // AI Model Selection
        if (api === 'openai') {
            apiKey = useFrontendApiKey ? openAiApiKey : process.env.OPENAI_API_KEY; // Use frontend key if provided

            console.log('Sending request to OpenAI (gpt-3.5-turbo)...');
            response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: finalPrompt }
                ],
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

        } else if (api === 'claude') {
            apiKey = useFrontendApiKey ? claudeApiKey : process.env.CLAUDE_API_KEY; // Use frontend key if provided

            console.log('Sending request to Claude AI...');
            response = await axios.post('https://api.claudeai.com/v1/engines/default/completions', {
                prompt: finalPrompt,
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

        } else if (api === 'custom') {
            console.log('Sending request to Custom Model...');
            response = await axios.post('https://your-custom-model-api.com/process', {
                prompt: finalPrompt,
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.CUSTOM_API_KEY}`
                }
            });

        } else {
            return res.status(400).json({ error: 'Invalid API selection' });
        }

        // Return AI response
        res.json({ success: true, data: response.data });

    } catch (error) {
        if (error.response) {
            console.error('Response error:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            console.error('Request error:', error.request);
            res.status(500).json({ error: 'No response from the AI API' });
        } else {
            console.error('Unexpected error:', error.message);
            res.status(500).json({ error: 'Unexpected error' });
        }
    }
};

module.exports = { processAIRequest };
