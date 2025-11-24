/**
 * Production Environment Configuration
 * Following the SDK pattern: https://fn7.io/.fn7-sdk/frontend/latest/docs
 */

export const environment = {
  firebase: {
    apiKey: 'your-prod-api-key',
    authDomain: 'your-prod-auth-domain',
    databaseURL: 'your-prod-database-url',
    projectId: 'your-prod-project-id',
    storageBucket: 'your-prod-storage-bucket',
    messagingSenderId: 'your-prod-sender-id',
    appId: 'your-prod-app-id',
    measurementId: 'your-prod-measurement-id',
  },
  // Production environment - backend calls enabled
  apiBaseUrl: 'https://api.prod.fn7.io',
};

