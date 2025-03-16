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
 * Captures current frame from video element and returns as a square Blob
 * @param {HTMLVideoElement} videoElement - Video element to capture from
 * @returns {Promise<Blob>} - Square image blob for more efficient transfer
 */
async function captureFrame(videoElement) {
  // Create a canvas element for square capture
  const canvas = document.createElement('canvas');
  const width = videoElement.videoWidth;
  const height = videoElement.videoHeight;
  
  // If video doesn't have dimensions yet, return null
  if (!width || !height) return Promise.resolve(null);
  
  // Calculate the square dimensions (use smaller dimension)
  const size = Math.min(width, height);
  
  // Calculate center point of the video to crop from center
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Get the top-left corner coordinates of the square
  const startX = centerX - (size / 2);
  const startY = centerY - (size / 2);
  
  // Determine if we need to resize the square
  const targetSize = size > AI_CONFIG.vision.maxWidth ? 
    AI_CONFIG.vision.maxWidth : size;
  
  // Set canvas to square format
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  // Log details about the capture for debugging
  console.log(`Square capture: ${targetSize}x${targetSize} from video ${width}x${height}`);
  
  // Draw the current video frame to the canvas, cropping to a square
  const ctx = canvas.getContext('2d');
  ctx.drawImage(
    videoElement,
    startX, startY, size, size, // Source rectangle (crop)
    0, 0, targetSize, targetSize // Destination rectangle (with possible resizing)
  );
  
  // Convert canvas to Blob (more efficient than base64 data URL)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      'image/jpeg', 
      AI_CONFIG.vision.imageQuality
    );
  });
}

/**
 * Resets the view from captured image back to live video feed
 * @param {HTMLImageElement} capturedImage - The main captured image element
 * @param {HTMLVideoElement} mainVideo - The main video element
 * @param {HTMLVideoElement} thumbnailVideo - The thumbnail video element
 * @param {HTMLElement} thumbnailContainer - The thumbnail container element
 */
function resetToVideoView(capturedImage, mainVideo, thumbnailVideo, thumbnailContainer) {
  // Hide the captured image
  capturedImage.style.display = 'none';
  
  // Show the main video
  mainVideo.style.display = 'block';
  
  // Hide the thumbnail elements
  thumbnailVideo.style.display = 'none';
  thumbnailContainer.style.display = 'none';
  
  // Clear the srcObject if needed to prevent duplicate streams
  thumbnailVideo.srcObject = null;
  
  console.log('✅ Reset to video view - returned to camera feed');
}

/**
 * Sends image data to vision API for analysis
 * @param {Blob} imageBlob - Image blob from canvas
 * @returns {Promise<Object>} - AI analysis response
 */
async function analyzeImage(imageBlob) {
  try {
    // Log blob size in KB for performance monitoring
    console.log('🔍 Analyzing image - size:', Math.round(imageBlob.size / 1024), 'KB');
    console.log('🔗 Sending to endpoint:', AI_CONFIG.vision.endpoint);
    
    // Create FormData for more efficient multipart upload
    const formData = new FormData();
    formData.append('image', imageBlob, 'image.jpg');
    
    // Send FormData to API endpoint
    const response = await fetch(AI_CONFIG.vision.endpoint, {
      method: 'POST',
      // No Content-Type header - browser sets it automatically with boundary for FormData
      body: formData
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
  const captureBtn = document.getElementById('captureButton');
  
  // Add click handler for the capture button (thumbnail switcheroo testing)
  if (captureBtn) {
    captureBtn.addEventListener('click', async () => {
      try {
        // Capture current frame from video
        const imageBlob = await captureFrame(videoElement);
        
        if (!imageBlob) {
          console.error('❌ Failed to capture image from camera');
          return;
        }
        
        console.log('✅ Frame captured for thumbnail switcheroo test');
        
        // Use the same display logic as in analyze function
        // THUMBNAIL SWITCHEROO: Display captured image in main view and move video to thumbnail
        const capturedImage = document.getElementById('capturedImage');
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        const thumbnailVideo = document.getElementById('thumbnailVideo');
        const mainVideo = videoElement; // The main video element passed to the function
        
        if (capturedImage && thumbnailContainer && thumbnailVideo) {
          // Create an object URL from the blob for the main image
          capturedImage.src = URL.createObjectURL(imageBlob);
          
          // Set up cleanup and display logic
          capturedImage.onload = () => {
            // Show the captured image in the main view
            mainVideo.style.display = 'none';
            capturedImage.style.display = 'block';
            
            // Move video feed to thumbnail if not already there
            if (thumbnailVideo.srcObject !== mainVideo.srcObject) {
              thumbnailVideo.srcObject = mainVideo.srcObject;
              thumbnailVideo.style.display = 'block';
              thumbnailContainer.style.display = 'block';
            }
            
            // Clean up the object URL to prevent memory leaks
            URL.revokeObjectURL(capturedImage.src);
            
            // Add click handler to return to camera view when clicking on the image
            capturedImage.onclick = () => resetToVideoView(capturedImage, mainVideo, thumbnailVideo, thumbnailContainer);
            
            console.log('✅ Thumbnail switcheroo complete - still image in main view, video in thumbnail');
          };
        }
      } catch (error) {
        console.error('❌ Error in capture button handler:', error);
      }
    });
  }
  
  // Add click handler for analysis button
  analyzeBtn.addEventListener('click', async () => {
    console.group('📷 AI Analysis Request');
    try {
      // Update UI to show loading state
      analyzeBtn.disabled = true;
      aiResponse.textContent = 'Analyzing image...';
      
      console.log('📷 Capturing frame from video...');
      // Capture current frame from video as Blob
      const imageBlob = await captureFrame(videoElement);
      
      if (!imageBlob) {
        console.error('❌ Failed to capture image from camera');
        aiResponse.textContent = 'Error: Unable to capture image from camera.';
        analyzeBtn.disabled = false;
        return;
      }
      
      console.log('✅ Frame captured successfully');
      
      // THUMBNAIL SWITCHEROO: Display captured image in main view and move video to thumbnail
      const capturedImage = document.getElementById('capturedImage');
      const thumbnailContainer = document.getElementById('thumbnailContainer');
      const thumbnailVideo = document.getElementById('thumbnailVideo');
      const mainVideo = videoElement; // The main video element passed to the function
      
      if (capturedImage && thumbnailContainer && thumbnailVideo) {
        // Create an object URL from the blob for the main image
        capturedImage.src = URL.createObjectURL(imageBlob);
        
        // Set up cleanup and display logic
        capturedImage.onload = () => {
          // Show the captured image in the main view
          mainVideo.style.display = 'none';
          capturedImage.style.display = 'block';
          
          // Move video feed to thumbnail if not already there
          if (thumbnailVideo.srcObject !== mainVideo.srcObject) {
            thumbnailVideo.srcObject = mainVideo.srcObject;
            thumbnailVideo.style.display = 'block';
            thumbnailContainer.style.display = 'block';
          }
          
          // Clean up the object URL to prevent memory leaks
          URL.revokeObjectURL(capturedImage.src);
          
          console.log('✅ Thumbnail switcheroo complete - still image in main view, video in thumbnail');
        };
      } else {
        console.warn('Required elements for thumbnail switcheroo not found in DOM');
      }
      
      // Send to AI for analysis
      console.log('📣 Sending to AI for analysis...');
      const result = await analyzeImage(imageBlob);
      
      console.log('✅ Analysis complete:', result);
      
      // Display results - supporting both new multimodal format and legacy format
      let analysisText = '';
      
      // First check if we have the new modalities structure
      if (result.modalities && result.primary && result.modalities[result.primary]) {
        // Get content from the primary modality (currently 'text')
        const primaryModality = result.modalities[result.primary];
        analysisText = primaryModality.content || '';
        
        console.log(`📝 Using ${result.primary} modality from v${result.version} response`);
      } 
      // Fallback to legacy format
      else if (result.text) {
        analysisText = result.text;
        console.log('📝 Using legacy text response format');
      }
      
      // Update UI with the analysis results
      aiResponse.textContent = analysisText || 'No analysis text returned from the server.';
      
      // Save complete result in case we need to access other modalities later
      aiResponse.dataset.fullResponse = JSON.stringify(result);
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
