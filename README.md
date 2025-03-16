# Mobile Rear Camera Web App

A minimal web application that enables access to a mobile device's rear (environment-facing) camera with fallback options and error handling.

## Overview

This application:
1. Runs under HTTPS (required by all modern mobile browsers for camera access)
2. Displays a live video feed from the **rear (environment-facing) camera** of a mobile device
3. Provides comprehensive error handling for situations like permission denial or unsupported browsers
4. Includes UI enhancements with status messages and camera control buttons

## Technical Requirements

1. **Modern Web Browser**: Safari (iOS), Chrome (Android), or other modern mobile browsers
2. **HTTPS**: Camera access requires a secure context (HTTPS)
3. **Device Permissions**: Camera access permissions must be granted

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

## License

MIT
