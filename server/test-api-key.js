// Simple script to test OpenAI API key
require('dotenv').config();
const axios = require('axios');

const apiKey = process.env.OPENAI_API_KEY;

console.log(`Testing OpenAI API key: ${apiKey.substring(0, 12)}...`);

async function testApiKey() {
  try {
    // Make a simple request to the OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-3.5-turbo", // Using a basic model for testing
        messages: [
          {
            role: "user",
            content: "Hello, this is a test of my API key. Please respond with 'Your API key is working correctly.'"
          }
        ],
        max_tokens: 30
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    console.log('✅ API key is valid! Response:', response.data);
    console.log('✅ API access successful');
  } catch (error) {
    console.error('❌ API key test failed');
    
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
      
      // Specific error handling
      if (error.response.status === 401) {
        console.error('Your API key is invalid or has been revoked');
      } else if (error.response.status === 404) {
        console.error('The requested resource does not exist or the endpoint is incorrect');
      } else if (error.response.status === 429) {
        console.error('Rate limit exceeded or you have exceeded your quota');
      }
    } else if (error.request) {
      console.error('No response received from the server. Check your internet connection.');
    } else {
      console.error('Error setting up the request:', error.message);
    }
  }
}

testApiKey();
