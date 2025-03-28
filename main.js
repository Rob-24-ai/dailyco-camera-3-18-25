// Import camera capture module
import { initCameraCapture } from './camera-capture.js';

// Configuration object for easy future modifications
// NOTE: We're currently focusing on rear camera functionality. The front camera (selfie view)
// has known issues with mirroring in captured images and is not prioritized for this implementation.
const CONFIG = {
  startWithRearCamera: true,  // IMPORTANT: Always start with rear camera by default
  mirrorFrontCamera: true,    // For selfie view (front camera) - has issues with captured images
  mirrorRearCamera: false,    // Don't mirror rear camera by default
  initTimeout: 500,           // Default safe timeout
  fastStartup: false,         // Set to true for faster startup (100ms) on capable devices
  debug: true,                // Enable console logging for development
  desktopTesting: true        // Enable desktop testing fallbacks for easier development
};

// Get DOM references
const videoElement = document.getElementById('cameraPreview');
const statusMessage = document.getElementById('statusMessage');
const retryButton = document.getElementById('retryButton');
const switchCameraButton = document.getElementById('switchCameraButton');

// Track which camera we're using
let usingRearCamera = CONFIG.startWithRearCamera;
let currentStream = null;

// Update status with visual feedback
function updateStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  
  // Only show status element for errors (success and info are hidden)
  if (type === 'error') {
    statusMessage.classList.add('error');
    statusMessage.style.display = 'block';
  } else {
    statusMessage.style.display = 'none';
    
    // Log non-error messages to console when in debug mode
    if (CONFIG.debug) {
      console.log(`Status (${type}): ${message}`);
    }
  }
}

// Stop any active stream
function stopCurrentStream() {
  if (currentStream) {
    // Enhanced track stopping - ensure all tracks are explicitly stopped
    currentStream.getTracks().forEach(track => {
      if (CONFIG.debug) console.log(`Stopping track: ${track.kind} [${track.id}]`);
      track.stop();
    });
    
    // Ensure video element is properly reset
    if (videoElement.srcObject) {
      videoElement.srcObject = null;
    }
    currentStream = null;
  }
}

// Helper function to ensure consistent mirroring state
function updateMirroringState(isFrontCamera) {
  // Clear any existing classes first
  videoElement.classList.remove('mirrored');
  
  // Apply mirroring only for front camera when configured
  if (isFrontCamera && CONFIG.mirrorFrontCamera) {
    videoElement.classList.add('mirrored');
  }
}

// Attempt to start the camera with various fallback options
async function startCamera(useRear = true) {
  stopCurrentStream();
  usingRearCamera = useRear;
  
  updateStatus(useRear ? 
    'Accessing rear camera...' : 
    'Accessing front camera...'
  );
  
  // Hide retry button while we're connecting
  retryButton.style.display = 'none';
  // Switch button is always visible in the new UI
  
  try {
    // Try with preferred camera first - with desktop testing fallbacks
    let constraints = {
      video: useRear ? 
        { facingMode: { exact: 'environment' } } : 
        { facingMode: { exact: 'user' } },
      audio: false
    };
    
    try {
      if (CONFIG.debug) console.log('Attempting camera access with exact constraints:', constraints);
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (exactError) {
      if (CONFIG.debug) console.log('Exact mode failed, trying without exact:', exactError);
      
      // If 'exact' fails, try without 'exact' constraint
      constraints.video = useRear ? 
        { facingMode: 'environment' } : 
        { facingMode: 'user' };
      
      try {
        if (CONFIG.debug) console.log('Attempting camera access with relaxed constraints:', constraints);  
        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (relaxedError) {
        if (CONFIG.debug) console.log('Relaxed constraints failed:', relaxedError);
        
        if (CONFIG.desktopTesting) {
          // Desktop testing fallback - just get any video device
          if (CONFIG.debug) console.log('Trying desktop testing fallback - any camera');
          constraints.video = true;
          currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        } else {
          // Re-throw the error if desktop testing is disabled
          throw relaxedError;
        }
      }
    }
    
    // Set the stream to video element
    videoElement.srcObject = currentStream;
    
    // Apply mirroring for front camera only with enhanced consistency
    updateMirroringState(!useRear);
    
    // Show success message
    updateStatus(
      useRear ? 'Rear camera active' : 'Front camera active', 
      'success'
    );
    
    // Initialize camera capture functionality when camera is ready
    initCameraCapture(videoElement);
    
    // Switch camera button is always visible in the new UI
  } catch (error) {
    console.error('Camera access error:', error);
    
    updateStatus(
      `Camera error: ${error.message || 'Could not access camera'}. ` +
      'Check permissions or try a different browser.', 
      'error'
    );
    
    // Show retry button
    retryButton.style.display = 'block';
  }
}

// Event listeners for buttons
retryButton.addEventListener('click', () => {
  startCamera(usingRearCamera);
});

switchCameraButton.addEventListener('click', () => {
  startCamera(!usingRearCamera); // Toggle camera
});

// Check browser support and start the camera
if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  // Add a small delay to ensure the DOM is fully loaded
  setTimeout(() => {
    startCamera(CONFIG.startWithRearCamera);
  }, CONFIG.fastStartup ? 100 : CONFIG.initTimeout);
} else {
  updateStatus('Camera API not supported in this browser.', 'error');
}
