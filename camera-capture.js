/**
 * Camera Capture Module
 * Handles capturing frames from the camera and picture-in-picture functionality
 * 
 * KNOWN ISSUES:
 * - Front camera (selfie view) does not properly mirror in the captured/frozen picture,
 *   even though mirroring works correctly in the live feed. We're focusing on the
 *   rear camera functionality for now and not addressing this issue.
 */

// Configuration for image capture
const CAPTURE_CONFIG = {
  imageQuality: 0.8,
  maxWidth: 800,  // Resize large images to this width to reduce payload size
};

/**
 * Captures current frame from video element and returns as a square Blob
 * @param {HTMLVideoElement} videoElement - Video element to capture from
 * @returns {Promise<Blob>} - Square image blob
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
  const targetSize = size > CAPTURE_CONFIG.maxWidth ? 
    CAPTURE_CONFIG.maxWidth : size;
  
  // Set canvas to square format
  canvas.width = targetSize;
  canvas.height = targetSize;
  
  // Log details about the capture for debugging
  console.log(`Square capture: ${targetSize}x${targetSize} from video ${width}x${height}`);
  
  // Use the camera state from window object (set in main.js)
  // This is more reliable than checking CSS classes directly
  const cameraState = window.cameraState || { isFrontCamera: false, isMirrored: false };
  const isFrontCamera = cameraState.isFrontCamera;
  const isMirrored = cameraState.isMirrored;
  
  console.log(`CAPTURE: Camera=${isFrontCamera ? 'FRONT' : 'REAR'}, Mirrored=${isMirrored}`);
  
  // Get the canvas context for drawing
  const ctx = canvas.getContext('2d');
  
  // Draw the current video frame to the canvas, cropping to a square
  ctx.drawImage(
    videoElement,
    startX, startY, size, size, // Source rectangle (crop)
    0, 0, targetSize, targetSize // Destination rectangle (with possible resizing)
  );
  
  // Convert canvas to Blob (more efficient than base64 data URL)
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        console.log(`Created blob: ${blob.size} bytes, isMirrored: ${isMirrored}`);
        resolve(blob);
      },
      'image/jpeg', 
      CAPTURE_CONFIG.imageQuality
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
  capturedImage.src = ''; // Clear image source
  
  // Show the main video
  mainVideo.style.display = 'block';
  
  // Hide the thumbnail elements
  thumbnailVideo.style.display = 'none';
  thumbnailContainer.style.display = 'none';
  
  // Clear the srcObject if needed to prevent duplicate streams
  thumbnailVideo.srcObject = null;
  
  // Clean up click handlers to avoid memory leaks
  capturedImage.onclick = null;
  thumbnailVideo.onclick = null;
  
  console.log('✅ Reset to video view - returned to camera feed');
}

/**
 * Initialize camera capture functionality 
 * @param {HTMLVideoElement} videoElement - Video element with camera feed
 */
export function initCameraCapture(videoElement) {
  // Get UI elements
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
        
        // THUMBNAIL SWITCHEROO: Display captured image in main view and move video to thumbnail
        const capturedImage = document.getElementById('capturedImage');
        const thumbnailContainer = document.getElementById('thumbnailContainer');
        const thumbnailVideo = document.getElementById('thumbnailVideo');
        const mainVideo = videoElement; // The main video element passed to the function
        
        if (capturedImage && thumbnailContainer && thumbnailVideo) {
          // Create an object URL from the blob for the main image
          capturedImage.src = URL.createObjectURL(imageBlob);
          
          // Get camera state for mirroring decisions
          const cameraState = window.cameraState || { isFrontCamera: false, isMirrored: false };
          const isUsingFrontCam = cameraState.isFrontCamera;
          
          // Always mirror front camera images, regardless of the video mirroring state
          // This is the simplest solution to ensure selfies appear as expected
          console.log(`FRONT CAMERA: ${isUsingFrontCam}, applying mirror class`);
          capturedImage.classList.remove('mirrored'); // First remove any existing class
          
          if (isUsingFrontCam) {
            // For front camera, we ALWAYS want to mirror the captured image
            capturedImage.classList.add('mirrored');
            console.log('Added mirrored class to capturedImage for front camera');
          }
          
          // Set up cleanup and display logic
          capturedImage.onload = () => {
            // Show the captured image in the main view
            mainVideo.style.display = 'none';
            capturedImage.style.display = 'block';
            
            // Always update thumbnail with current video stream (handles camera switching)
            thumbnailVideo.srcObject = mainVideo.srcObject;
            thumbnailVideo.style.display = 'block';
            thumbnailContainer.style.display = 'block';
            
            // Make sure thumbnail video has same mirroring state as main video
            thumbnailVideo.className = mainVideo.className;
            
            // Clean up the object URL to prevent memory leaks
            URL.revokeObjectURL(capturedImage.src);
            
            // Add click handler to return to camera view when clicking on the image
            capturedImage.onclick = () => resetToVideoView(capturedImage, mainVideo, thumbnailVideo, thumbnailContainer);
            
            // Add click handler to the thumbnail video to also reset to camera view
            thumbnailVideo.onclick = () => resetToVideoView(capturedImage, mainVideo, thumbnailVideo, thumbnailContainer);
            thumbnailVideo.style.cursor = 'pointer'; // Show it's clickable
            
            console.log('✅ Thumbnail switcheroo complete - still image in main view, video in thumbnail');
          };
        }
      } catch (error) {
        console.error('❌ Error in capture button handler:', error);
      }
    });
  }
}
