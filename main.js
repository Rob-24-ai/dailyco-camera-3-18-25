// Get DOM references
const videoElement = document.getElementById('cameraPreview');
const statusMessage = document.getElementById('statusMessage');
const retryButton = document.getElementById('retryButton');
const switchCameraButton = document.getElementById('switchCameraButton');

// Track which camera we're using
let usingRearCamera = true;
let currentStream = null;

// Update status with visual feedback
function updateStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = 'status';
  if (type === 'error') {
    statusMessage.classList.add('error');
  } else if (type === 'success') {
    statusMessage.classList.add('success');
  }
}

// Stop any active stream
function stopCurrentStream() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    videoElement.srcObject = null;
    currentStream = null;
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
  
  // Hide buttons while we're connecting
  retryButton.style.display = 'none';
  switchCameraButton.style.display = 'none';
  
  try {
    // Try with preferred camera first
    let constraints = {
      video: useRear ? 
        { facingMode: { exact: 'environment' } } : 
        { facingMode: { exact: 'user' } },
      audio: false
    };
    
    try {
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (exactError) {
      console.log('Exact mode failed, trying without exact:', exactError);
      
      // If 'exact' fails, try without 'exact' constraint
      constraints.video = useRear ? 
        { facingMode: 'environment' } : 
        { facingMode: 'user' };
        
      currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    }
    
    // Set the stream to video element
    videoElement.srcObject = currentStream;
    
    // Show success message
    updateStatus(
      useRear ? 'Rear camera active' : 'Front camera active', 
      'success'
    );
    
    // Show switch camera button for devices with multiple cameras
    switchCameraButton.style.display = 'inline-block';
  } catch (error) {
    console.error('Camera access error:', error);
    
    updateStatus(
      `Camera error: ${error.message || 'Could not access camera'}. ` +
      'Check permissions or try a different browser.', 
      'error'
    );
    
    // Show retry button
    retryButton.style.display = 'inline-block';
    switchCameraButton.style.display = 'inline-block';
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
    startCamera(true); // Start with rear camera
  }, 500);
} else {
  updateStatus('Camera API not supported in this browser.', 'error');
}
