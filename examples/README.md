# Camera-First Pipecat Integration Examples

This directory contains example code demonstrating how to integrate a custom rear camera implementation with the Pipecat framework using a camera-first approach.

## Files

- **rear-camera-pipecat-demo.html**: A complete HTML demo page that shows the integration in action
- **rear-camera-pipecat-integration.js**: The main integration file that connects our camera to Pipecat
- **rear-camera.js**: A minimal implementation of our custom camera controller

## Integration Approach

These examples follow the camera-first integration strategy we've documented in the IMPLEMENTATION_NOTES. The key aspects of this approach are:

1. **Initialize our camera first** - We maintain full control over camera initialization, including device selection and constraints
2. **Initialize Pipecat second** - Configure Pipecat to not take control of the camera
3. **Connect our camera to Pipecat** - Feed our camera's video element and stream to Pipecat

## Usage

To use these examples:

1. Copy the example files to your project
2. Adjust the imports to match your project structure
3. Ensure you have the required dependencies installed:
   ```
   npm install @daily-co/pipecat-js
   ```
4. Set up your environment variables for API keys
5. Initialize the application as shown in `rear-camera-pipecat-integration.js`

## Implementation Notes

### Camera Initialization

The RearCamera class handles:
- Initializing the camera with proper constraints for the rear camera
- Managing camera switching if needed
- Providing access to the video element and MediaStream

### Pipecat Configuration

When initializing Pipecat, we disable its camera control features:
```javascript
const pipecat = new Pipecat({
  // ...other options
  video: {
    autoInitCamera: false,      // Don't auto-initialize camera
    switchingDisabled: true,    // Disable camera switching
    useExistingVideoElement: true // Use our video element
  }
});
```

### Camera-Pipecat Connection

After both the camera and Pipecat are initialized, we connect them:
```javascript
// Connect our video element to Pipecat
pipecat.setVideoElement(videoElement);

// Optionally connect the stream if needed
if (typeof pipecat.setVideoStream === 'function') {
  pipecat.setVideoStream(stream);
}
```

## Requirements

- Modern browser with getUserMedia support
- HTTPS connection (for camera access on mobile devices)
- Pipecat JS SDK

## Testing

These examples should be tested on actual mobile devices to verify rear camera access is working correctly. Emulators and desktop browsers may not provide accurate camera behavior.
