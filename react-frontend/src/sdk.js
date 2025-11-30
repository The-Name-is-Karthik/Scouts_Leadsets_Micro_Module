/**
 * FN7 SDK Initialization
 * Configures and exports the FN7 SDK instance
 *
 * Following the SDK pattern: https://fn7.io/.fn7-sdk/frontend/latest/docs
 *
 * Local Mode: When apiBaseUrl is undefined, the SDK automatically:
 * - Uses hardcoded defaults for user_context and app_context
 * - Skips backend calls (no authentication endpoint)
 * - We populate localStorage with defaults so the app can access them
 *
 * To use environment-specific configs, update the import below:
 * - For local: import { environment } from './config/environment';
 * - For dev: import { environment } from './config/environment.dev';
 * - For prod: import { environment } from './config/environment.prod';
 */

// import FN7SDK from 'https://www.fn7.io/.fn7-sdk/frontend/latest/sdk.esm.js';
import FN7SDK from './sdk/sdk.esm.js';
// Import the appropriate environment file based on your build configuration
import { environment } from './config/environment'; // Change to .dev or .prod as needed

// Initialize SDK with apiBaseUrl and firebaseConfig from environment
// If apiBaseUrl is undefined, SDK automatically enables local mode
const sdk = new FN7SDK({
  apiBaseUrl: environment.apiBaseUrl,
  firebaseConfig: environment.firebase,
  mode: environment.apiBaseUrl ? 'server' : 'local'
});

// In local mode, populate localStorage with default values
// This allows the app to access user_context and app_context for other needs
// The SDK respects localStorage over hardcoded defaults
if (!environment.apiBaseUrl) {
  try {
    // Force update user_context to match backend defaults
    // We remove the check (!localStorage.getItem) to ensure we overwrite old/stale values
    localStorage.setItem('user_context', JSON.stringify({
      user_id: '0513467084',
      org_hkey: '7000000001.0742402695',
      user_role: 'admin',
      org_role: 'owner',
      application_id: '1000000001',
      id_token: 'local-dev-token'
    }));

    // Force update app_context
    localStorage.setItem('app_context', JSON.stringify({
      doc_id: '1000000001',
      org_hkey: '7000000001.0742402695',
      application_url_prefix: 'atlas'
    }));
  } catch (e) {
    console.warn('Could not set localStorage defaults:', e);
  }
}

export default sdk;

