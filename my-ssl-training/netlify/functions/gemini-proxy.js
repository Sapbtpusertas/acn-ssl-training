// netlify/functions/gemini-proxy.js
const fetch = require('node-fetch'); // Make sure to install node-fetch if you haven't: npm install node-fetch

exports.handler = async (event, context) => {
    // Ensure it's a POST request
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    }

    // Get the API key from Netlify's environment variables
    // This is where YOUR_API_KEY from Netlify UI is securely accessed
    const apiKey = process.env.YOUR_API_KEY;

    if (!apiKey) {
        console.error('Gemini API Key is not set in Netlify Environment Variables!');
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Server configuration error: API Key missing.' }),
        };
    }

    // Parse the request body coming from your frontend
    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON body.' }),
        };
    }

    // Construct the Gemini API URL with the API key
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        // Forward the request to the Gemini API
        const geminiResponse = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody), // Send the entire payload received from frontend
        });

        const geminiResult = await geminiResponse.json();

        // Return the Gemini API's response back to the frontend
        return {
            statusCode: geminiResponse.status,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiResult),
        };
    } catch (error) {
        console.error('Error calling Gemini API from Netlify Function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Failed to connect to Gemini API: ${error.message}` }),
        };
    }
};
