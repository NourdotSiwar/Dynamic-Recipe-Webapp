const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5001;

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust as needed for security)
app.use(express.json()); // Parse incoming JSON requests

// Health Check Endpoint (Optional)
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// API Endpoint to handle chat completions
app.post('/api/chat', async (req, res) => {

  const { messages } = req.body;

  // Validate the request body
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request: messages field is required and should be an array.' });
  }

  try {
    // Make a POST request to the groqcloud API
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.1-70b-versatile',
        messages,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`, // Securely use the API key from environment variables
        },
      }
    );

    // Send the API response back to the frontend
    res.json(response.data);
  } catch (error) {
    console.error('Error calling groqcloud API:', error.response?.data || error.message);

    // Determine the status code to send back
    const status = error.response?.status || 500;

    // Send a detailed error message back to the frontend for debugging
    res.status(status).json({
      error: error.response?.data || 'An error occurred while processing your request.',
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Backend server is listening on port ${port}`);
});