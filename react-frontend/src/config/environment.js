/**
 * Local Development Environment Configuration
 * Following the SDK pattern: https://fn7.io/.fn7-sdk/frontend/latest/docs
 *
 * This file is for local development. For Create React App, you can also use
 * .env files with REACT_APP_ prefix, but this pattern allows for better
 * build-time configuration selection.
 *
 * Local Mode: Set apiBaseUrl to undefined to enable local mode.
 * In local mode, the SDK automatically uses hardcoded defaults for
 * user_context and app_context - no manual setup needed!
 */

export const environment = {
  firebase: {
    apiKey: 'your-local-api-key',
    authDomain: 'your-local-auth-domain',
    databaseURL: 'your-local-database-url',
    projectId: 'your-local-project-id',
    storageBucket: 'your-local-storage-bucket',
    messagingSenderId: 'your-local-sender-id',
    appId: 'your-local-app-id',
    measurementId: 'your-local-measurement-id',
  },
  // Set to undefined for local mode (no backend calls, automatic defaults)
  // Set to 'https://atlas.dev2.app.fn7.io' for dev environment
  // Set to 'https://api.prod.fn7.io' for production
  apiBaseUrl: undefined, // Local mode enabled
};

