# Dependency Upgrade Plan for Daily.co Pipecat Integration

## Current Package Status

```json
{
  "dependencies": {
    "@daily-co/daily-js": "^0.76.0",
    "axios": "^1.6.2",
    "multiparty": "^4.2.3"
  },
  "devDependencies": {
    "vite": "^6.2.2"
  }
}
```

## Required Upgrades and Additions

### 1. Core Dependencies

| Package | Current | Target | Priority | Notes |
|---------|---------|--------|----------|-------|
| `@daily-co/daily-js` | 0.76.0 | 0.77.0+ | High | Required for latest Pipecat compatibility |
| `axios` | 1.6.2 | 1.6.2 | Low | Current version is sufficient |
| `multiparty` | 4.2.3 | 4.2.3 | Low | Current version is sufficient |

### 2. New Dependencies

| Package | Target Version | Priority | Purpose |
|---------|----------------|----------|---------|
| `@daily-co/pipecat-js` | latest | Critical | Core Pipecat framework (Note: Exact package name to be confirmed) |
| `@sonnet-ai/client` | 3.5.x | High | Sonnet LLM API client (Note: Specific package name to be confirmed) |
| `@cartesia/web-sdk` | latest | High | Cartesia TTS integration (Note: Specific package name to be confirmed) |

### 3. Development Dependencies

| Package | Current | Target | Priority | Notes |
|---------|---------|--------|----------|-------|
| `vite` | 6.2.2 | 6.2.2 | Low | Current version is sufficient |
| `vite-plugin-mkcert` | Not installed | latest | Medium | For local HTTPS development |
| `dotenv` | Not installed | latest | Medium | For managing API keys securely |

## Implementation Plan

### Step 1: Update package.json

```bash
# Update existing dependencies
npm update @daily-co/daily-js

# Add new dependencies
npm install @daily-co/pipecat-js @sonnet-ai/client @cartesia/web-sdk

# Add development dependencies
npm install --save-dev vite-plugin-mkcert dotenv
```

Note: Package names above are placeholders and should be verified against actual Daily.co documentation.

### Step 2: Configure Environment Variables

Create `.env` file:
```
DAILY_API_KEY=your_api_key
DAILY_DOMAIN=your_daily_domain
SONNET_API_KEY=your_sonnet_key
CARTESIA_API_KEY=your_cartesia_key
```

Update `.env.example`:
```
DAILY_API_KEY=your_daily_api_key_here
DAILY_DOMAIN=your_daily_domain_here
SONNET_API_KEY=your_sonnet_api_key_here
CARTESIA_API_KEY=your_cartesia_api_key_here
```

### Step 3: Configure Vite for HTTPS

Update `vite.config.js`:

```javascript
import { defineConfig } from 'vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
  server: {
    https: true
  },
  plugins: [mkcert()]
});
```

### Step 4: Update Import Statements

Modify existing code to use updated imports:

```javascript
// Before
import DailyIframe from '@daily-co/daily-js';

// After
import DailyIframe from '@daily-co/daily-js';
import { Pipecat } from '@daily-co/pipecat-js';
import { SonnetClient } from '@sonnet-ai/client';
import { CartesiaTTS } from '@cartesia/web-sdk';
```

## CDN Fallback Plan

If npm packages aren't available for all components, use CDN imports:

```html
<!-- Daily.co SDK -->
<script src="https://unpkg.com/@daily-co/daily-js"></script>

<!-- Pipecat SDK (placeholder URL - verify with Daily.co) -->
<script src="https://unpkg.com/@daily-co/pipecat-js"></script>

<!-- Sonnet SDK (placeholder URL - verify with provider) -->
<script src="https://cdn.example.com/sonnet-sdk.js"></script>

<!-- Cartesia SDK (placeholder URL - verify with provider) -->
<script src="https://cdn.example.com/cartesia-sdk.js"></script>
```

## Version Compatibility Matrix

| Daily.js Version | Pipecat Compatibility | Browser Minimum Versions |
|------------------|---------------------|--------------------------|
| 0.76.0 | Limited | Chrome 74+, Firefox 78+, Safari 14.1+ |
| 0.77.0+ | Full | Chrome 74+, Firefox 78+, Safari 14.1+ |

## Security Considerations

1. **API Key Management**
   - Never commit API keys to source control
   - Use environment variables for all sensitive credentials
   - Consider using a key rotation strategy for production

2. **Permission Handling**
   - Implement proper permission request flows
   - Handle permission denials gracefully
   - Provide clear user feedback for security restrictions

## Dependency Health Checks

Before deploying to production, verify:

1. All dependencies are actively maintained
2. No security vulnerabilities exist in the dependency tree
3. Licensing is compatible with your application

Run security audit:
```bash
npm audit
```

## Fallback Strategies

If a dependency is unavailable or causing issues:

1. **Daily.js Fallback**: Use direct WebRTC implementation if Daily.js has issues
2. **Pipecat Fallback**: Implement simplified voice pipeline without AI features
3. **Sonnet Fallback**: Use alternative LLM service with similar API
4. **Cartesia Fallback**: Use Web Speech API as fallback for TTS

---

This plan should be reviewed and updated as implementation progresses. The actual package names and versions should be verified with Daily.co documentation prior to implementation.
