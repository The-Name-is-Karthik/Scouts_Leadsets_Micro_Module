/**
 * SDK Initialization
 * Creates a singleton instance of FN7SDK for reuse across the application
 */

const { FN7SDK } = require('@fn7/sdk-node');

// Singleton pattern - create SDK instance once and reuse it
let sdkInstance = null;

/**
 * Get or create the FN7 SDK instance
 * @param {string} [storageBucket] - Optional storage bucket name (overrides env var)
 * @returns {FN7SDK} FN7SDK instance
 */
function getSDK(storageBucket) {
  if (!sdkInstance) {
    // Check if required environment variable is set
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT_JSON environment variable is not set. ' +
        'Please set it in your .env file or environment variables.'
      );
    }

    // Initialize SDK (Firebase Admin SDK is auto-initialized)
    sdkInstance = storageBucket
      ? new FN7SDK(storageBucket)
      : new FN7SDK(); // Will use FIREBASE_STORAGE_BUCKET env var if available

    console.log('✅ FN7 SDK initialized successfully');
  }

  return sdkInstance;
}

/**
 * Reset SDK instance (useful for testing)
 */
function resetSDK() {
  sdkInstance = null;
}

module.exports = { getSDK, resetSDK };

