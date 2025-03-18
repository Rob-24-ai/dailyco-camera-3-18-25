/**
 * RearCamera class
 * 
 * A minimal implementation of a camera controller that prioritizes the rear camera
 * This class is designed to work with the Pipecat framework while maintaining full
 * control over camera selection and switching.
 */
class RearCamera {
  /**
   * Constructor for the RearCamera class
   * 
   * @param {HTMLVideoElement} videoElement - The video element to attach the camera stream to
   * @param {Object} options - Configuration options for the camera
   * @param {string} options.useFacingMode - The initial camera to use ('environment' or 'user')
   * @param {boolean} options.mirrorFrontCamera - Whether to mirror the front-facing camera
   * @param {boolean} options.enableSwitching - Whether to allow camera switching
   * @param {number} options.width - The desired width of the camera feed
   * @param {number} options.height - The desired height of the camera feed
   */
  constructor(videoElement, options = {}) {
    // Store the video element
    this.videoElement = videoElement;
    
    // Set default options
    this.options = {
      useFacingMode: 'environment', // Default to rear camera
      mirrorFrontCamera: true,      // Mirror front camera by default
      enableSwitching: true,        // Allow camera switching by default
      width: 1280,                  // Default width
      height: 720,                  // Default height
      ...options                    // Override with provided options
    };
    
    // Initialize state
    this.stream = null;
    this.currentFacingMode = this.options.useFacingMode;
    this.isInitialized = false;
    this.devices = [];
    
    // Bind methods to this instance
    this.initialize = this.initialize.bind(this);
    this.switchCamera = this.switchCamera.bind(this);
    this.stop = this.stop.bind(this);
    this._getConstraints = this._getConstraints.bind(this);
    
    // Apply mirror effect based on initial camera
    this._updateMirrorEffect();
  }
  
  /**
   * Initialize the camera
   * 
   * @returns {Promise<boolean>} A promise that resolves to true if camera was initialized successfully
   */
  async initialize() {
    try {
      // Request permission to access media devices
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      // Get available camera devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.devices = devices.filter(device => device.kind === 'videoinput');
      
      // Get camera stream
      const constraints = this._getConstraints();
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Attach the stream to the video element
      this.videoElement.srcObject = this.stream;
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        this.videoElement.onloadedmetadata = () => {
          resolve();
        };
      });
      
      // Start playing the video
      await this.videoElement.play();
      
      // Update status
      this.isInitialized = true;
      console.log(`Camera initialized with facing mode: ${this.currentFacingMode}`);
      
      return true;
    } catch (error) {
      console.error('Camera initialization error:', error);
      return false;
    }
  }
  
  /**
   * Switch between front and rear cameras
   * 
   * @returns {Promise<boolean>} A promise that resolves to true if camera was switched successfully
   */
  async switchCamera() {
    if (!this.isInitialized || !this.options.enableSwitching) {
      console.warn('Camera switching is not available');
      return false;
    }
    
    try {
      // Stop the current stream
      this.stop();
      
      // Toggle facing mode
      this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
      
      // Get new constraints based on updated facing mode
      const constraints = this._getConstraints();
      
      // Get new stream
      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Attach new stream to video element
      this.videoElement.srcObject = this.stream;
      
      // Update the mirror effect
      this._updateMirrorEffect();
      
      console.log(`Camera switched to facing mode: ${this.currentFacingMode}`);
      return true;
    } catch (error) {
      console.error('Camera switching error:', error);
      
      // Try to restore the previous camera
      this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
      await this.initialize();
      
      return false;
    }
  }
  
  /**
   * Stop all camera streams
   */
  stop() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        track.stop();
      });
      
      this.videoElement.srcObject = null;
      this.stream = null;
      this.isInitialized = false;
    }
  }
  
  /**
   * Get the video element
   * 
   * @returns {HTMLVideoElement} The video element
   */
  getVideoElement() {
    return this.videoElement;
  }
  
  /**
   * Get the current media stream
   * 
   * @returns {MediaStream} The current media stream
   */
  getStream() {
    return this.stream;
  }
  
  /**
   * Get the current facing mode
   * 
   * @returns {string} The current facing mode ('environment' or 'user')
   */
  getCurrentFacingMode() {
    return this.currentFacingMode;
  }
  
  /**
   * Check if using the rear (environment) camera
   * 
   * @returns {boolean} True if using rear camera
   */
  isUsingRearCamera() {
    return this.currentFacingMode === 'environment';
  }
  
  /**
   * Generate constraints for getUserMedia
   * 
   * @returns {Object} The constraints object
   * @private
   */
  _getConstraints() {
    const facingMode = this.currentFacingMode;
    
    // Create constraint object based on current facing mode
    return {
      audio: false,
      video: {
        facingMode: { ideal: facingMode },
        width: { ideal: this.options.width },
        height: { ideal: this.options.height }
      }
    };
  }
  
  /**
   * Update the mirror effect based on current camera
   * 
   * @private
   */
  _updateMirrorEffect() {
    // Apply mirroring only to front camera if option is enabled
    const shouldMirror = this.currentFacingMode === 'user' && this.options.mirrorFrontCamera;
    
    // Apply or remove the CSS transform
    this.videoElement.style.transform = shouldMirror ? 'scaleX(-1)' : 'scaleX(1)';
  }
}

// Export the class
export { RearCamera };
