const axios = require('axios');
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('../db');
const { encoding_for_model } = require('@dqbd/tiktoken');

const estimateTokenCount = (text, model = 'gpt-3.5-turbo-16k') => {
    const enc = encoding_for_model(model);
    const tokens = enc.encode(text);
    const tokenCount = tokens.length;
    enc.free();
    return tokenCount;
};

const processAIRequest = async (req, res) => {
    let { api, prompt, selectedDocumentIds, useFrontendApiKey, openAiApiKey, claudeApiKey, maxTokens } = req.body;

    if (!maxTokens || typeof maxTokens !== 'number' || maxTokens <= 0) {
        maxTokens = 100;
    }
    if (!prompt || prompt.trim() === '') {
        prompt = 'Summarize'; 
    }
    if (!selectedDocumentIds || !Array.isArray(selectedDocumentIds) || selectedDocumentIds.length === 0) {
        return res.status(400).json({ error: 'No documents selected or invalid document IDs' });
    }
    if (!api || (api !== 'openai' && api !== 'claude' && api !== 'custom')) {
        return res.status(400).json({ error: 'Invalid API selection' });
    }
    try {
        const db = await connectToDatabase();
        const objectIds = selectedDocumentIds.map(id => ObjectId.createFromHexString(id));
        const documents = await db.collection('documents').find({ _id: { $in: objectIds } }).toArray();

        if (!documents || documents.length === 0) {
            return res.status(404).json({ error: 'No documents found for the provided IDs' });
        }

        const concatenatedContent = documents.map(doc => doc.documentContent).join('\n\n');
        const finalPrompt = `${concatenatedContent}\n\n${prompt}\n\nPlease format the response in markdown.`;

        let response, apiKey;
        if (api === 'openai') {
            apiKey = useFrontendApiKey ? openAiApiKey : process.env.OPENAI_API_KEY;
            const model = 'gpt-3.5-turbo-16k'; // Change this if using other models
            const MAX_TOKEN_LIMITS = {
                'gpt-3.5-turbo': 4096,
                'gpt-3.5-turbo-16k': 16384,
                'gpt-4': 8192, // Example for GPT-4
            };

            const inputTokens = estimateTokenCount(finalPrompt, model);
            const bufferTokens = 100; // Adding a buffer to stay within limits
            const maxTokenLimit = MAX_TOKEN_LIMITS[model];  
            const availableTokens = maxTokenLimit - inputTokens - bufferTokens;                  

            if (maxTokens > availableTokens) {
                maxTokens = availableTokens;
                console.log(`Reducing max tokens to ${maxTokens} to stay within the limit`);
            }
            console.log('Sending request to OpenAI (gpt-3.5-turbo-16k)...');
            
            response = await axios.post('https://api.openai.com/v1/chat/completions', {
                model: 'gpt-3.5-turbo-16k',
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: finalPrompt }
                ],
                max_tokens: maxTokens
            }, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json' 
                },
                timeout: 30000
            });
        
            const messageContent = response.data.choices[0].message.content;
            res.json({ success: true, message: messageContent });
        
        } else if (api === 'claude') {
            apiKey = useFrontendApiKey ? claudeApiKey : process.env.CLAUDE_API_KEY;
            console.log('Sending request to Claude...');
            
            response = await axios.post('https://api.anthropic.com/v1/completions', {
                model: 'claude-v1',
                prompt: finalPrompt,
                max_tokens_to_sample: 100,
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });
        
            const messageContent = response.data.choices[0].message.content;
            res.json({ success: true, message: messageContent });
        
        } else if (api === 'custom') {
            response = await axios.post('https://your-custom-model-api.com/process', {
                prompt: finalPrompt,
                max_tokens: 100,
            }, {
                headers: { 'Authorization': `Bearer ${process.env.CUSTOM_API_KEY}` }
            });
        
            const messageContent = response.data.choices[0].message.content || response.data.result;
            res.json({ success: true, message: messageContent });
        
        } else {
            return res.status(400).json({ error: 'Invalid API selection' });
        }
        
    } catch (error) {
        if (error.code === 'ECONNABORTED') {
            console.error('Request timed out');
            res.status(500).json({ error: 'AI service did not respond in time' });
        } else if (error.response) {
            console.error('Error response from AI service:', error.response.data);
            res.status(error.response.status).json({ error: error.response.data });
        } else if (error.request) {
            console.error('No response received from AI service:', error.request);
            res.status(500).json({ error: 'No response from AI service' });
        } else {
            console.error('Unexpected error:', error.message);
            res.status(500).json({ error: 'Unexpected error occurred' });
        }
    }
};

module.exports = { processAIRequest };
