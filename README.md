# Mobile Camera Web App

A clean, lightweight web application that enables access to a mobile device's rear and front cameras with picture-in-picture functionality.

## Overview

This application:
1. Runs under HTTPS (required by all modern mobile browsers for camera access)
2. Displays a live video feed from both **rear (environment-facing)** and **front (user-facing)** cameras of a mobile device
3. Provides comprehensive error handling for situations like permission denial or unsupported browsers
4. Includes UI enhancements with status messages and camera control buttons
5. Features picture-in-picture functionality to capture and display images
6. Applies proper mirroring for front-facing camera for natural user experience

## Technical Requirements

1. **Modern Web Browser**: Safari (iOS), Chrome (Android), or other modern mobile browsers
2. **HTTPS**: Camera access requires a secure context (HTTPS)
3. **Device Permissions**: Camera access and microphone permissions must be granted
4. **API Keys**: API keys for AI services (securely managed through backend)
5. **Backend Server**: Simple Express server for secure API communication

## Development Journey & Challenges

### Local Development Challenges

During development, we encountered several challenges:

1. **HTTPS Requirement**: Mobile browsers require HTTPS for camera access, making local testing difficult
2. **Certificate Issues**: Self-signed certificates are not trusted by iOS Safari
3. **Network Connectivity**: Testing between development machine and mobile device required careful network configuration
4. **Permission Handling**: Different browsers and devices handle camera permissions differently

### Code Evolution

The application evolved through several iterations:

1. **Basic Implementation**: Initial implementation using `getUserMedia` with environment-facing camera constraint
2. **Enhanced Error Handling**: Added fallback options when exact constraints fail
3. **UI Improvements**: Added status messages and visual feedback for different states
4. **Camera Controls**: Added ability to retry camera access and switch between front/rear cameras

## Implementation Details

### Key Components

1. **HTML Structure**: Clean UI with status area and video container
2. **CSS Styling**: Mobile-first responsive design
3. **JavaScript Camera Access**:
   - Uses the MediaDevices API (`getUserMedia`)
   - Implements fallback strategies when exact constraints fail
   - Provides clear error messages

### Camera API Usage

The application uses the `getUserMedia` API with different constraint options:

```javascript
// Try with preferred camera first (exact constraint)
let constraints = {
  video: useRear ? 
    { facingMode: { exact: 'environment' } } : 
    { facingMode: { exact: 'user' } },
  audio: false
};

// If 'exact' fails, try without 'exact' constraint
constraints.video = useRear ? 
  { facingMode: 'environment' } : 
  { facingMode: 'user' };
```

## Deployment

For proper functionality, this application must be deployed with HTTPS enabled. The recommended deployment approach is:

### Vercel Deployment

1. Go to [Vercel.com](https://vercel.com/)
2. Sign in with your GitHub account
3. Click "Add New" or "Import Project"
4. Select this repository
5. Use the default settings (Vite will be auto-detected)
6. Click "Deploy"

Vercel provides:
- Automatic HTTPS setup
- Global CDN distribution
- Continuous deployment from GitHub

## Local Development

If you want to run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Note: For camera testing on mobile devices, you'll need to access via HTTPS. Options include:
- Using Vercel's preview deployments
- Setting up a secure tunnel (ngrok, localtunnel, etc.)
- Using a service like GitHub Pages

## Testing Tips

1. Ensure your device has granted camera permissions to your browser
2. Check that you're accessing the app via HTTPS
3. If camera access fails, use the "Try Again" button
4. Different devices may have different camera capabilities

## Architecture & Technical Design

### Current Architecture (Camera Module)

The application follows a modular design pattern:

```
index.html              # Core HTML structure and UI elements
├── main.js             # Camera functionality and UI interaction
└── styles (inline)     # CSS for responsive mobile-first design
```

### Configuration System

A centralized configuration object manages application behavior:

```javascript
const CONFIG = {
  startWithRearCamera: true,  // Start with rear camera by default
  mirrorFrontCamera: true,    // Apply mirroring effect to front camera
  initTimeout: 500,           // Safe timeout for device initialization
  fastStartup: false,         // Option for faster startup on capable devices
  debug: true                 // Enable verbose logging for development
};
```

### Camera Implementation Details

1. **Device Detection & Fallbacks**:
   - Primary attempt uses `{facingMode: {exact: 'environment'}}` constraint
   - Falls back to non-exact constraint if needed
   - Applies appropriate UI feedback during each state

2. **Stream Management**:
   - Properly stops all media tracks when switching cameras
   - Ensures video elements are correctly reset
   - Implements consistent mirroring behavior

3. **Error Handling**:
   - Provides user-friendly error messages
   - Enables retry functionality
   - Logs detailed errors in debug mode

## AI Integration Roadmap

### Phase 1: Enhanced Client + Minimal Backend

**Target Implementation:** [IN PROGRESS]

```
index.html              # Enhanced with AI conversation UI
├── main.js             # Camera functionality (unchanged)
├── ai-integration.js   # AI functionality and speech recognition
├── server.js           # Simple Express backend for secure API calls
└── styles (inline)     # Enhanced CSS for AI interface
```

**Key Features:**
1. **Frame Capture**: Extract images from camera feed
2. **Continuous Speech Recognition**: Real-time transcription
3. **AI Analysis**: Send frames to AI services for analysis
4. **Conversation Interface**: Display AI responses and transcripts

**Technical Components:**
- Web Speech API for voice input/output
- Canvas API for frame capture
- Secure backend proxy for API keys
- Real-time conversation history

### Phase 2: Advanced Integration (Future)

**Target Implementation:** [PLANNED]

```
/                       # Root directory
├── client/             # Front-end code
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   └── services/       # Client-side services
├── server/             # Backend code
│   ├── api/            # API routes
│   ├── services/       # AI service integrations
│   └── utils/          # Helper functions
└── config/             # Configuration files
```

**Advanced Features:**
1. **RTVI Integration**: Real-time Voice Inference standard
2. **Pipecat Integration**: For sophisticated AI agent capabilities
3. **Enhanced Media Processing**: Better handling of audio/video streams
4. **Conversation Memory**: Persistent conversation history

## iPhone-Specific Considerations

This application has been specifically tested and optimized for iPhone devices:

1. **iOS Safari Compatibility**: 
   - Ensures camera access works correctly in Safari
   - Handles iOS-specific permission patterns

2. **Performance Optimization**:
   - Careful timeout management for reliable camera initialization
   - Efficient media stream handling to preserve battery

3. **UI/UX for iOS**:
   - Touch-friendly buttons sized appropriately for iOS devices
   - Proper viewport configuration to prevent zooming/scaling issues

## Workspace Guidelines

### Development Principles

1. **Camera Functionality Priority**:
   - Never compromise the core camera functionality
   - Test all changes on actual iPhone devices
   - Maintain consistent camera switching and mirroring

2. **Incremental Development**:
   - Implement features in small, testable increments
   - Validate each change on mobile devices
   - Document all assumptions and edge cases

3. **Security First**:
   - Never expose API keys in client code
   - Use secure transport (HTTPS) for all communication
   - Validate all user inputs

4. **Performance Awareness**:
   - Optimize for mobile device constraints
   - Monitor memory usage with media streams
   - Use efficient frame capture techniques

### Branch Management

- `main`: Stable, production-ready code
- `AI-integration`: Current development for AI features
- Create feature branches for experimental work

## License

ROB

