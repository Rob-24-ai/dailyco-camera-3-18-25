# Daily.co Pipecat Integration Project

## Overview

This project integrates a custom rear camera implementation with Daily.co's Pipecat framework to create an AI-powered application capable of analyzing artwork through the device's rear camera and providing interactive voice responses.

## Core Architecture

The implementation follows a "camera-first, Pipecat-second" approach:

1. **Custom Rear Camera** - Our robust camera implementation initializes and controls the rear-facing camera
2. **Pipecat Integration** - Daily.co's Pipecat framework connects to our initialized camera for AI functionality
3. **Visual Analysis** - Sonnet LLM processes camera frames to understand and analyze artwork
4. **Voice Interaction** - Cartesia TTS enables natural voice responses to user queries

## Key Documents

### Implementation Guide
- [**CAMERA_PIPECAT_INTEGRATION.md**](./CAMERA_PIPECAT_INTEGRATION.md) - Core integration strategy for connecting our camera with Pipecat
- [**DAILY_INTEGRATION_PLAN.md**](./DAILY_INTEGRATION_PLAN.md) - Step-by-step implementation plan with milestones

### Technical Documentation
- [**DAILY_INTEGRATION_AUDIT.md**](./DAILY_INTEGRATION_AUDIT.md) - Analysis of current codebase compatibility with Daily.co
- [**DEPENDENCY_UPGRADE_PLAN.md**](./DEPENDENCY_UPGRADE_PLAN.md) - Required package updates for Pipecat integration
- [**COMPATIBILITY_MATRIX.md**](./COMPATIBILITY_MATRIX.md) - Browser and device compatibility information
- [**BROWSER_IMPLEMENTATION_ADVICE.md**](./BROWSER_IMPLEMENTATION_ADVICE.md) - Platform-specific implementation guidance

### Reference
- [**DAILY_INTEGRATION_LEARNINGS.md**](./DAILY_INTEGRATION_LEARNINGS.md) - Insights and discoveries from implementation attempts
- [**VOICE_IMPLEMENTATION.md**](./VOICE_IMPLEMENTATION.md) - Specific implementation details for voice functionality

## Current Implementation Approach

Our refined approach focuses on balancing control between our custom camera implementation and Pipecat:

### What Our Camera Code Controls
- **Camera Selection** - Always use the rear-facing (environment) camera
- **Camera Initialization** - Handle device-specific initialization and fallbacks
- **Camera Constraints** - Manage video constraints for reliable operation

### What Pipecat Controls
- **Frame Capture** - Autonomous capturing of frames when needed for analysis
- **AI Processing** - Visual analysis of artwork through Sonnet LLM
- **Voice Interaction** - Text-to-speech via Cartesia and conversation flow

### Key Integration Points

1. **Initialize Rear Camera First**
   - Establish working rear camera feed before Pipecat initialization
   - Handle permission requests and device-specific quirks

2. **Configure Pipecat For External Camera**
   - Initialize with options to prevent camera switching
   - Connect to our pre-initialized video element

3. **Enable Both Manual & Autonomous Frame Capture**
   - Support explicit user-triggered image captures
   - Allow AI to autonomously capture frames when conversationally appropriate

4. **Maintain Existing Camera Reliability**
   - Preserve all fallback mechanisms for camera initialization
   - Ensure consistent operation across browsers and devices

## Next Steps

1. Implement the minimal viable Pipecat integration with our camera
2. Test on various mobile devices with rear cameras
3. Refine the integration based on testing feedback
4. Extend with additional features once core functionality is stable
