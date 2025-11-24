/**
 * Development Environment Configuration
 * Following the SDK pattern: https://fn7.io/.fn7-sdk/frontend/latest/docs
 */

export const environment = {
  firebase: {
    apiKey: 'your-dev-api-key',
    authDomain: 'your-dev-auth-domain',
    databaseURL: 'your-dev-database-url',
    projectId: 'your-dev-project-id',
    storageBucket: 'your-dev-storage-bucket',
    messagingSenderId: 'your-dev-sender-id',
    appId: 'your-dev-app-id',
    measurementId: 'your-dev-measurement-id',
  },
  // Dev environment - backend calls enabled
  apiBaseUrl: 'https://atlas.dev2.app.fn7.io',
};

