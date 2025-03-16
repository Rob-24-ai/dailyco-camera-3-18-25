// Vercel Serverless Function for Vision API

// Add startup console log to confirm function is loaded
console.log('Vision API serverless function initialized');

// Import axios using ES module syntax since we've set type:module in package.json
import axios from 'axios';
console.log('✅ Using axios with ES modules');

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
    
    // Log API key presence (but not the actual key)
    console.log('🔑 OpenAI API Key present:', !!process.env.OPENAI_API_KEY);
    
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
    
    // Only log a small portion of the payload to avoid overwhelming logs
    console.log('Request payload structure (truncated):', 
      JSON.stringify({
        model: requestPayload.model,
        messages: [{ role: 'user', content: '[Image content truncated for logging]' }],
        max_tokens: requestPayload.max_tokens
      }));
    
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
    
    // Get the response content
    const analysisText = response.data.choices[0].message.content;
    
    // Return a structured response format that can accommodate multiple modalities
    return res.status(200).json({
      // Version for tracking response format changes
      version: "1.0",
      
      // Response data organized by modality for future extensibility
      modalities: {
        // Text modality (currently used)
        text: {
          content: analysisText,
          format: "plain_text"
        },
        
        // Voice modality (placeholder for future implementation)
        // voice: {
        //   url: null,  // Would contain URL to audio file
        //   format: "mp3", 
        //   duration: null
        // }
      },
      
      // Main response content - currently points to text modality
      // Frontend can use this as the default content to display
      primary: "text",
      
      // Legacy support
      text: analysisText,
      result: analysisText
    });
    
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Check for specific error types
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Error details:', error.response.data);
      
      // Return the actual error from OpenAI for better debugging
      return res.status(500).json({ 
        error: `OpenAI API error (${error.response.status}): ${JSON.stringify(error.response.data)}`,
        details: error.response.data
      });
    }
    
    // Check if it's an API key issue
    if (error.message.includes('API key')) {
      console.error('🔑 API Key error detected');
      return res.status(500).json({ 
        error: 'Missing or invalid OpenAI API key. Please check your environment variables.',
        hint: 'Make sure OPENAI_API_KEY is properly set in your Vercel project settings.'
      });
    }
    
    // Check for network/timeout issues
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return res.status(500).json({ 
        error: 'Request to OpenAI timed out. The image might be too large or the service might be experiencing high load.',
        hint: 'Try with a smaller image or retry later.'
      });
    }
    
    // Generic error fallback
    return res.status(500).json({ 
      error: `Failed to analyze image: ${error.message}`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
