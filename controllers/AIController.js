const axios = require('axios');

// Controller to handle AI requests
const processAIRequest = async (req, res) => {
    const { api, prompt, documentContent } = req.body; // Extract the API selection, prompt, and document content

    try {
        let finalPrompt = prompt;

        // If document content is available, combine it with the user-provided prompt
        if (documentContent) {
            finalPrompt = `${documentContent}\n\n${prompt}`;
        }

        let response;

        // AI Model Selection
        if (api === 'openai') {
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
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
                }
            });

        } else if (api === 'claude') {
            console.log('Sending request to Claude AI...');

            response = await axios.post('https://api.claudeai.com/v1/engines/default/completions', {
                prompt: finalPrompt,
                max_tokens: 100,
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`
                }
            });

        } else if (api === 'custom') {
            console.log('Sending request to Custom Model...');
            // Handle custom AI model request here
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
        res.json({ data: response.data });

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
