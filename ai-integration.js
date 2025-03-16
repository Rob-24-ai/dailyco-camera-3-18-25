/**
 * AI Integration Module
 * Handles communication between the camera feed and AI services
 */

// Configuration for AI services
const AI_CONFIG = {
  vision: {
    endpoint: 'http://localhost:3000/api/vision/analyze',
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
    const response = await fetch(AI_CONFIG.vision.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageData })
    });
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error analyzing image:', error);
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
    try {
      // Update UI to show loading state
      analyzeBtn.disabled = true;
      aiResponse.textContent = 'Analyzing image...';
      
      // Capture current frame from video
      const imageData = captureFrame(videoElement);
      
      if (!imageData) {
        aiResponse.textContent = 'Error: Unable to capture image from camera.';
        analyzeBtn.disabled = false;
        return;
      }
      
      // Send to AI for analysis
      const result = await analyzeImage(imageData);
      
      // Display results
      aiResponse.textContent = result.text;
    } catch (error) {
      // Handle errors
      aiResponse.textContent = `Error: ${error.message}`;
    } finally {
      // Re-enable button
      analyzeBtn.disabled = false;
    }
  });
  
  console.log('AI integration initialized');
}
