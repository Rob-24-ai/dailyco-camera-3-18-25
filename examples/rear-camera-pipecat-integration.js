/**
 * Example implementation of camera-first Pipecat integration
 * 
 * This code demonstrates how to:
 * 1. Initialize our custom rear camera first
 * 2. Initialize Pipecat with camera controls disabled
 * 3. Connect our camera to Pipecat
 */

// Import necessary modules (adjust paths as needed)
import { RearCamera } from '../src/rear-camera.js';
import { Pipecat } from '@daily-co/pipecat-js';

/**
 * Initialize the application with a camera-first approach
 */
async function initializeApp() {
  // Step 1: Get DOM elements
  const videoElement = document.getElementById('cameraPreview');
  const statusElement = document.getElementById('statusMessage');

  // Show initial status
  updateStatus('Initializing camera...', 'pending');

  try {
    // Step 2: Initialize rear camera FIRST
    const rearCamera = new RearCamera(videoElement, {
      useFacingMode: 'environment',  // Force rear camera
      mirrorFrontCamera: false,      // Don't mirror the front camera
      enableSwitching: true          // Allow switching between front/rear
    });

    // Initialize camera and wait for it to be ready
    const cameraInitialized = await rearCamera.initialize();
    
    if (!cameraInitialized) {
      throw new Error('Camera initialization failed');
    }

    updateStatus('Camera initialized successfully', 'success');
    
    // Step 3: Initialize Pipecat AFTER camera is ready
    updateStatus('Initializing AI services...', 'pending');
    
    // Get API keys from environment
    const dailyApiKey = process.env.DAILY_API_KEY;
    const sonnetApiKey = process.env.SONNET_API_KEY;
    const cartesiaApiKey = process.env.CARTESIA_API_KEY;
    
    // Configure Pipecat to NOT control camera
    const pipecat = new Pipecat({
      apiKey: dailyApiKey,
      llm: {
        provider: 'sonnet',
        model: 'sonnet-3.5-turbo',
        apiKey: sonnetApiKey
      },
      tts: {
        provider: 'cartesia',
        apiKey: cartesiaApiKey
      },
      // CRITICAL: Disable Pipecat's internal camera management
      video: {
        autoInitCamera: false,      // Don't auto-initialize camera
        switchingDisabled: true,    // Disable camera switching
        resolution: 'standard'      // Use standard quality for analysis
      }
    });
    
    // Initialize Pipecat
    await pipecat.initialize();
    updateStatus('AI services initialized', 'success');
    
    // Step 4: Connect our camera to Pipecat
    updateStatus('Connecting camera to AI services...', 'pending');
    
    // Set the video element that Pipecat should use
    // This is the element our camera is already streaming to
    pipecat.setVideoElement(videoElement);
    
    // If Pipecat requires the MediaStream object directly
    if (typeof pipecat.setVideoStream === 'function') {
      const stream = rearCamera.getStream();
      pipecat.setVideoStream(stream);
    }
    
    updateStatus('Camera connected to AI services', 'success');
    
    // Step 5: Set up UI controls and event listeners
    setupUIControls(rearCamera, pipecat);
    
    // Return the initialized objects for use in other parts of the app
    return {
      rearCamera,
      pipecat
    };
    
  } catch (error) {
    console.error('Initialization error:', error);
    updateStatus(`Error: ${error.message}`, 'error');
    return null;
  }
}

/**
 * Set up UI controls for the application
 */
function setupUIControls(rearCamera, pipecat) {
  // Add camera switching functionality
  const switchCameraButton = document.getElementById('switchCameraButton');
  if (switchCameraButton) {
    switchCameraButton.addEventListener('click', async () => {
      await rearCamera.switchCamera();
    });
  }
  
  // Add manual frame capture functionality
  const captureButton = document.getElementById('captureButton');
  if (captureButton) {
    captureButton.addEventListener('click', async () => {
      // Disable button during processing
      captureButton.disabled = true;
      updateStatus('Processing image...', 'pending');
      
      try {
        // Process the current frame
        // This triggers Pipecat to analyze what the camera sees
        await pipecat.processCurrentFrame();
      } catch (error) {
        console.error('Frame processing error:', error);
        updateStatus('Frame processing failed', 'error');
      } finally {
        // Re-enable the button
        captureButton.disabled = false;
      }
    });
  }
  
  // Add autonomous frame capture
  setupAutonomousCapture(pipecat);
}

/**
 * Configure Pipecat to recognize when it needs to capture a frame
 */
function setupAutonomousCapture(pipecat) {
  // Listen for visual analysis intent from the AI
  pipecat.on('visual-analysis-intent', async () => {
    updateStatus('AI is analyzing what it sees...', 'pending');
    
    try {
      // Process the current frame
      await pipecat.processCurrentFrame();
      updateStatus('Analysis complete', 'success');
    } catch (error) {
      console.error('Autonomous capture error:', error);
      updateStatus('Analysis failed', 'error');
    }
  });
}

/**
 * Update the status message shown to the user
 */
function updateStatus(message, status) {
  const statusElement = document.getElementById('statusMessage');
  if (!statusElement) return;
  
  // Clear previous status classes
  statusElement.classList.remove('pending', 'success', 'error');
  
  // Add appropriate status class
  if (status) {
    statusElement.classList.add(status);
  }
  
  // Update text
  statusElement.textContent = message;
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);

// Export for use in other modules if needed
export { initializeApp };
