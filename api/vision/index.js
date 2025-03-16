// Vercel Serverless Function for Vision API
import axios from 'axios';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Log request info
  console.log('📥 Received vision analysis request');
  
  try {
    // Get image data from request body
    const { imageData } = req.body;
    
    if (!imageData) {
      console.error('❌ No image data received');
      return res.status(400).json({ error: 'No image data provided' });
    }
    
    console.log(`📊 Image data type: ${typeof imageData}`);
    console.log(`📏 Image data length: ${imageData.length} characters`);
    console.log(`🔍 Image data starts with: ${imageData.substring(0, 50)}...`);
    
    // Ensure proper format for OpenAI's Vision API
    let processedImageData = imageData;
    
    // If it's a data URL, extract just the base64 part for debug logging
    if (imageData.startsWith('data:image')) {
      console.log(`🖼️ Image format: data URL (${imageData.split(';')[0]})`);
      // No need to modify - OpenAI accepts this format
    } else {
      // If it's just base64 without the data URL prefix, add it
      console.log('🖼️ Image format: appears to be raw base64 - adding data URL prefix');
      processedImageData = `data:image/jpeg;base64,${imageData}`;
    }
    
    console.log('🚀 Sending request to OpenAI Vision API...');
    
    // Call OpenAI Vision API
    // OpenAI's Vision API is officially accessed through the chat completions endpoint
    const apiEndpoint = 'https://api.openai.com/v1/chat/completions';
    console.log(`Using endpoint: ${apiEndpoint}`);
    
    // For debugging - log the entire request payload
    const requestPayload = {
      model: "gpt-4o", // Using the latest GPT-4o model which has vision capabilities
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image? Describe what you see briefly." },
            { type: "image_url", image_url: { url: processedImageData } }
          ]
        }
      ],
      max_tokens: 300
    };
    
    console.log('Request payload structure:', JSON.stringify(requestPayload).substring(0, 500) + '...');
    
    const response = await axios.post(
      apiEndpoint,
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        timeout: 30000 // 30 second timeout to avoid hanging on slow responses
      }
    );
    
    // Log successful response
    console.log(`✅ OpenAI API responded with status: ${response.status}`);
    
    // Validate that we received the expected data structure
    if (!response.data || !response.data.choices || !response.data.choices[0] || !response.data.choices[0].message) {
      console.error('❌ Unexpected response structure from OpenAI:', response.data);
      throw new Error('Unexpected response structure from OpenAI API');
    }
    
    console.log('✅ Received response from OpenAI');
    
    // Return the analysis result to the client
    return res.status(200).json({ 
      result: response.data.choices[0].message.content
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Check for specific error types
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
    }
    
    return res.status(500).json({ 
      error: `Failed to analyze image: ${error.message}` 
    });
  }
}
