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

// Parse the Firebase config from the JSON string if it exists
let firebaseConfig;
try {
  if (process.env.REACT_APP_FIREBASE_CONFIG) {
    firebaseConfig = JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG);
  }
} catch (e) {
  console.error('Error parsing REACT_APP_FIREBASE_CONFIG:', e);
}

// Fallback to individual variables if JSON config is missing or failed to parse
if (!firebaseConfig) {
  firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
  };
}

export const environment = {
  firebase: firebaseConfig,
  // Set to undefined for local mode (no backend calls, automatic defaults)
  // This aligns with the "No authentication" requirement in the assignment
  apiBaseUrl: undefined,
};

