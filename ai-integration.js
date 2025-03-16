/**
 * AI Integration Module
 * Handles communication between the camera feed and AI services
 */

// Configuration for AI services
const AI_CONFIG = {
  vision: {
    // Updated for Vercel deployment - use relative path for API endpoint
    endpoint: '/api/vision',
    imageQuality: 0.8,
    maxWidth: 800,  // Resize large images to this width to reduce payload size
  }
};

/**
 * Captures current frame from video element and returns as a data URL
 * @param {HTMLVideoElement} videoElement - Video element to capture from
 * @returns {string} - Data URL of captured image
 */
function captureFrame(videoElement) {
  // Create a canvas element at the same size as the video
  const canvas = document.createElement('canvas');
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;
  
  // If video doesn't have dimensions yet, return null
  if (!width || !height) return null;
  
  // Calculate resize dimensions while maintaining aspect ratio
  let targetWidth = width;
  let targetHeight = height;
  
  if (width > AI_CONFIG.vision.maxWidth) {
    const ratio = AI_CONFIG.vision.maxWidth / width;
    targetWidth = AI_CONFIG.vision.maxWidth;
    targetHeight = height * ratio;
  }
  
  // Set canvas dimensions to target size
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  
  // Draw the current video frame to the canvas, resizing in the process
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoElement, 0, 0, targetWidth, targetHeight);
  
  // Convert canvas to data URL (JPEG with specified quality)
  return canvas.toDataURL('image/jpeg', AI_CONFIG.vision.imageQuality);
}

/**
 * Sends image data to vision API for analysis
 * @param {string} imageData - Base64 image data
 * @returns {Promise<Object>} - AI analysis response
 */
async function analyzeImage(imageData) {
  try {
    console.log('🔍 Analyzing image - length:', imageData.length);
    console.log('🔗 Sending to endpoint:', AI_CONFIG.vision.endpoint);
    
    // Check if imageData is a valid data URL or base64 string
    if (!imageData.startsWith('data:image')) {
      console.warn('⚠️ Image data does not start with data:image - might need format adjustment');
    }
    
    const response = await fetch(AI_CONFIG.vision.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData })
    });
    
    console.log('📥 Response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Server response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('📄 Error details:', errorText);
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const jsonResponse = await response.json();
    console.log('✅ Response received:', jsonResponse);
    return jsonResponse;
  } catch (error) {
    console.error('❌ Error analyzing image:', error);
    throw error;
  }
}

/**
 * Initialize AI integration with the camera feed
 * @param {HTMLVideoElement} videoElement - Video element with camera feed
 */
export function initAI(videoElement) {
  // Get UI elements
  const analyzeBtn = document.getElementById('analyze-btn');
  const aiResponse = document.getElementById('ai-response');
  
  // Add click handler for analysis button
  analyzeBtn.addEventListener('click', async () => {
    console.group('📷 AI Analysis Request');
    try {
      // Update UI to show loading state
      analyzeBtn.disabled = true;
      aiResponse.textContent = 'Analyzing image...';
      
      console.log('📷 Capturing frame from video...');
      // Capture current frame from video
      const imageData = captureFrame(videoElement);
      
      if (!imageData) {
        console.error('❌ Failed to capture image from camera');
        aiResponse.textContent = 'Error: Unable to capture image from camera.';
        analyzeBtn.disabled = false;
        return;
      }
      
      console.log('✅ Frame captured successfully');
      
      // Create a debug indicator to show the captured image
      const debugImg = document.createElement('img');
      debugImg.src = imageData;
      debugImg.style.width = '150px';
      debugImg.style.display = 'block';
      debugImg.style.marginTop = '10px';
      
      // Replace any previous debug image
      const existingDebug = document.getElementById('debug-img');
      if (existingDebug) existingDebug.remove();
      
      debugImg.id = 'debug-img';
      aiResponse.after(debugImg);
      
      // Send to AI for analysis
      console.log('📣 Sending to AI for analysis...');
      const result = await analyzeImage(imageData);
      
      console.log('✅ Analysis complete:', result);
      
      // Display results
      aiResponse.textContent = result.text || 'No analysis text returned from the server.';
    } catch (error) {
      // Handle errors
      console.error('❌ Analysis error:', error);
      aiResponse.textContent = `Error: ${error.message}`;
    } finally {
      // Re-enable button
      analyzeBtn.disabled = false;
      console.groupEnd();
    }
  });
  
  console.log('AI integration initialized');
}
