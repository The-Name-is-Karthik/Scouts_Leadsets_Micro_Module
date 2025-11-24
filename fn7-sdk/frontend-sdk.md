# FN7 SDK

FN7 SDK is a JavaScript/TypeScript library that provides Firebase operations and context helpers for FN7 applications. It's framework-agnostic and can be used in React, Vue, Angular, or vanilla JavaScript applications.

## Installation

### From CDN (Production)

**Latest Version:**
```html
<script src="https://fn7.io/.fn7-sdk/frontend/latest/sdk.min.js"></script>
```

**Specific Version:**
```html
<script src="https://fn7.io/.fn7-sdk/frontend/v1.0.0/sdk.min.js"></script>
```

**ES Modules (Latest):**
```html
<script type="module">
  import { SDK } from 'https://fn7.io/.fn7-sdk/frontend/latest/sdk.esm.js';
</script>
```

### From npm (Coming Soon)

```bash
npm install @fn7/sdk
```

### Local Development (Testing)

For local testing, you can serve the SDK from a local server:

```bash
cd packages/frontend/dist
python3 -m http.server 8082
# or
npx serve -p 8082
```

Then import in your code:

```javascript
const SDK = await import('http://localhost:8082/sdk.esm.js');
```

## Quick Start

### Browser (UMD)

```html
<script src="https://fn7.io/.fn7-sdk/frontend/latest/sdk.min.js"></script>
<script>
  const firebaseConfig = {
    apiKey: 'YOUR_API_KEY',
    authDomain: 'YOUR_AUTH_DOMAIN',
    projectId: 'YOUR_PROJECT_ID',
    storageBucket: 'YOUR_STORAGE_BUCKET',
    messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
    appId: 'YOUR_APP_ID',
  };
  const sdk = new FN7SDK.default(undefined, firebaseConfig);

  // Use SDK functions
  sdk
    .getFirebaseData('Users', 'user123')
    .then((data) => console.log(data))
    .catch((err) => console.error(err));
</script>
```

### ES Modules

```javascript
import FN7SDK from '@fn7/sdk';
import { environment } from './config/environment';

const sdk = new FN7SDK(environment.apiBaseUrl, environment.firebase);

// Use SDK functions
const data = await sdk.getFirebaseData('Users', 'user123');
console.log(data);
```

### CommonJS

```javascript
const FN7SDK = require('@fn7/sdk');

const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_AUTH_DOMAIN',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_STORAGE_BUCKET',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

const sdk = new FN7SDK(undefined, firebaseConfig);

// Use SDK functions
sdk
  .getFirebaseData('Users', 'user123')
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
```

## Environment Configuration

The SDK requires explicit Firebase configuration. Use environment-specific configuration files (`environment.{env}.ts`) to manage different configurations for local, dev, and production environments. Your deployment pipeline will select the appropriate file during the build process.

### Standardized Configuration Pattern

Create separate environment configuration files for each environment. The deployment pipeline will bundle the correct configuration during the build process.

#### Step 1: Environment Configuration File Structure

Each environment configuration file follows this structure. Create separate files for each environment (see Step 2):

```typescript
export const environment = {
  firebase: {
    apiKey: ...,
    authDomain: ...,
    databaseURL: ...,
    projectId: ...,
    storageBucket: ...,
    messagingSenderId: ...,
    appId: ...,
    measurementId: ...,
  },
  apiBaseUrl: ...,
};
```

#### Step 2: Create Environment-Specific Configuration Files

Create separate `environment.ts` files for each environment:

**Local Development (`src/config/environment.local.ts`):**
```typescript
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
  apiBaseUrl: 'https://atlas.dev2.app.fn7.io',
};
```

**Development (`src/config/environment.dev.ts`):**
```typescript
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
  apiBaseUrl: 'https://atlas.dev2.app.fn7.io',
};
```

**Production (`src/config/environment.prod.ts`):**
```typescript
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
  apiBaseUrl: 'https://api.prod.fn7.io',
};
```

**Note:** Your deployment pipeline should select the appropriate `environment.{env}.ts` file during the build process based on the target environment. The build process will bundle the correct configuration into your application.

#### Step 3: Use in Your App

Import the appropriate environment configuration and initialize the SDK:

```typescript
import FN7SDK from '@fn7/sdk';
// Import the appropriate environment file based on your build configuration
import { environment } from './config/environment.local'; // or .dev, .prod

// Initialize SDK with config from environment
const sdk = new FN7SDK(environment.apiBaseUrl, environment.firebase);

// Use SDK
const data = await sdk.getFirebaseData('Users', 'user123');
```

**Note:** Configure your build process to automatically select the correct environment file (e.g., `environment.prod.ts` for production builds, `environment.dev.ts` for dev builds).

### Configuration Properties Reference

**Required Firebase Properties:**
- `apiKey` - Firebase API key
- `authDomain` - Firebase authentication domain
- `projectId` - Firebase project ID
- `storageBucket` - Firebase storage bucket name
- `messagingSenderId` - Firebase messaging sender ID
- `appId` - Firebase app ID

**Optional Firebase Properties:**
- `databaseURL` - Firebase Realtime Database URL (if used)
- `measurementId` - Google Analytics measurement ID (if used)

**API Configuration:**
- `apiBaseUrl` - FN7 API base URL (defaults to dev if not set)

**Note:** All configuration values are stored in your `environment.{env}.ts` files. Your deployment pipeline should select the appropriate file during the build process.

### Benefits of This Pattern

✅ **Same code everywhere** - Environment config files work identically across all environments
✅ **Type-safe** - TypeScript ensures correct config structure
✅ **Environment-aware** - Separate `environment.{env}.ts` files for local/dev/prod
✅ **Build-time configuration** - Configuration is bundled at build time, no runtime env vars needed
✅ **Deployment-ready** - Deployment pipeline selects the correct environment file during build

## API Reference

### Initialization

```javascript
const sdk = new FN7SDK(baseUrl?, firebaseConfig);
```

**Parameters:**

- `baseUrl` (optional): Base URL for API calls. Defaults to dev if not provided.
- `firebaseConfig` (required): Firebase configuration object.

**Example:**

```javascript
import { environment } from './config/environment';

// Initialize with config from environment
const sdk = new FN7SDK(environment.apiBaseUrl, environment.firebase);

// Or pass values directly
const sdk = new FN7SDK('https://api.example.com', {
  apiKey: '...',
  authDomain: '...',
  // ...
});
```

**Firebase Config Structure:**

```javascript
{
  apiKey: string;              // Required
  authDomain: string;          // Required
  projectId: string;           // Required
  storageBucket: string;       // Required
  messagingSenderId: string;   // Required
  appId: string;               // Required
  databaseURL?: string;        // Optional
  measurementId?: string;      // Optional
}
```

---

## Firebase Operations

### getFirebaseData

Read data from Firebase.

```javascript
const data = await sdk.getFirebaseData(doc_type, doc_id, customHeaders?);
```

**Parameters:**

- `doc_type` (string): Document type (e.g., 'Users', 'Chats')
- `doc_id` (string): Document ID
- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any> - The document data

**Example:**

```javascript
const userData = await sdk.getFirebaseData('Users', 'user123');
console.log(userData);
```

---

### createFirebaseData

Create a new document in Firebase.

```javascript
const result = await sdk.createFirebaseData(doc_type, doc_id, data, customHeaders?);
```

**Parameters:**

- `doc_type` (string): Document type
- `doc_id` (string): Document ID
- `data` (object): Data to create
- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any> - The created document

**Example:**

```javascript
const newUser = await sdk.createFirebaseData('Users', 'user456', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

---

### updateFirebaseData

Update an existing document in Firebase.

```javascript
const result = await sdk.updateFirebaseData(doc_type, doc_id, data, customHeaders?);
```

**Parameters:**

- `doc_type` (string): Document type
- `doc_id` (string): Document ID
- `data` (object): Data to update (can include increment markers from `getFirestoreUtilities()`)
- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any> - The updated document with actual values from Firestore

**Note:** After updating, the document is refetched from Firestore to return actual values. This is especially important when using increment operations - you'll receive the actual incremented numbers, not increment objects.

**Example:**

```javascript
const updated = await sdk.updateFirebaseData('Users', 'user123', {
  name: 'Jane Doe',
});
console.log(updated.name); // 'Jane Doe'

// With increment operations
const utils = sdk.getFirestoreUtilities();
const result = await sdk.updateFirebaseData('Users', 'user123', {
  loginCount: utils.increment(1)
});
console.log(result.loginCount); // Actual number (e.g., 42), not an increment object
```

---

### deleteFirebaseData

Delete a document from Firebase.

```javascript
const result = await sdk.deleteFirebaseData(doc_type, doc_id, customHeaders?);
```

**Parameters:**

- `doc_type` (string): Document type
- `doc_id` (string): Document ID
- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any> - Deletion result

**Example:**

```javascript
await sdk.deleteFirebaseData('Users', 'user123');
```

---

### searchFirebaseData

Search Firebase documents with query constraints.

```javascript
const results = await sdk.searchFirebaseData(queryConstraints, limit, orderBy?, customHeaders?);
```

**Parameters:**

- `queryConstraints` (object): Query constraints (AND/OR conditions)
- `limit` (number): Maximum number of results
- `orderBy` (string, optional): Field to order by
- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any[]> - Array of matching documents

**Example:**

```javascript
const users = await sdk.searchFirebaseData(
  {
    AND: [
      ['doc_type', '==', 'Users'],
      ['status', '==', 'active'],
    ],
  },
  10,
  'created_at'
);
```

---

### getCustomFirebaseToken

Get a custom Firebase authentication token.

```javascript
const token = await sdk.getCustomFirebaseToken(customHeaders?);
```

**Parameters:**

- `customHeaders` (object, optional): Custom HTTP headers

**Returns:** Promise<any> - Token object

**Example:**

```javascript
const tokenData = await sdk.getCustomFirebaseToken();
console.log(tokenData.token);
```

---

### getFirestoreUtilities

Get Firestore utility functions for advanced operations like atomic increments.

```javascript
const utils = sdk.getFirestoreUtilities();
```

**Returns:** Object with utility functions:
- `increment(amount?)`: Creates an increment marker for atomic updates
- `updateDoc(path, data)`: Updates a document by path string

**Example - Atomic Increment:**

```javascript
const utils = sdk.getFirestoreUtilities();

// Increment a counter field atomically
await sdk.updateFirebaseData('Users', 'user123', {
  loginCount: utils.increment(1),  // Atomically increments by 1
  score: utils.increment(5)        // Atomically increments by 5
});
```

**Example - Update by Path:**

```javascript
const utils = sdk.getFirestoreUtilities();

// Update using path string instead of separate doc_type/doc_id
await utils.updateDoc('org.app/Users.user123', {
  name: 'John Doe',
  loginCount: utils.increment(1)
});
```

**Note:** The `increment()` function returns a special marker object that is processed by `updateFirebaseData` and converted to Firestore's native atomic increment operation. This prevents race conditions when multiple clients update the same field simultaneously.

---

### startFirebaseListener

Start a Firebase real-time listener that emits data whenever the document changes.

```typescript
const subscription = sdk.startFirebaseListener(doc_type, doc_id, options?).subscribe((data) => {
  // Receives updates when document changes
});
```

**Parameters:**

- `doc_type` (string): Document type
- `doc_id` (string): Document ID
- `options` (object, optional):
  - `customHeaders` (object): Custom HTTP headers
  - `isSystemCall` (boolean): Whether this is a system call

**Returns:** `Observable<any>` - Observable that emits document data on each change

**Example:**

```typescript
import { FN7SDK } from '@fn7/sdk';

const sdk = new FN7SDK(baseUrl, firebaseConfig);

// Subscribe to real-time updates
const subscription = sdk.startFirebaseListener('Chats', 'chat123').subscribe({
  next: (data) => {
    console.log('Document updated:', data);
  },
  error: (error) => {
    console.error('Listener error:', error);
  }
});

// Unsubscribe when done
subscription.unsubscribe();
```

**Note:** The Observable emits the initial document data immediately, then emits again whenever the document changes in Firestore.

---

## Firebase Storage Operations

### uploadToStorage

Upload files to Firebase Storage.

```javascript
const urls = await sdk.uploadToStorage(filenames, files, folder?, appName?);
```

**Parameters:**

- `filenames` (string[]): Array of filenames
- `files` (File[] | Blob[]): Array of files to upload
- `folder` (string, optional): Folder path (default: 'definitions')
- `appName` (string, optional): App name (auto-detected if not provided)

**Returns:** Promise<string[]> - Array of download URLs

**Example:**

```javascript
const files = [file1, file2];
const filenames = ['image1.jpg', 'image2.png'];
const urls = await sdk.uploadToStorage(filenames, files, 'assets');
console.log(urls); // ['https://...', 'https://...']
```

---

### getFromStorage

Get download URL from Firebase Storage.

```javascript
const url = await sdk.getFromStorage(folderName, fileName, appName?);
```

**Parameters:**

- `folderName` (string): Folder name
- `fileName` (string): File name
- `appName` (string, optional): App name (auto-detected if not provided)

**Returns:** Promise<string> - Download URL

**Example:**

```javascript
const url = await sdk.getFromStorage('assets', 'image1.jpg');
console.log(url); // 'https://...'
```

---

### getBlobFromStorage

Get file as Blob from Firebase Storage.

```javascript
const blob = await sdk.getBlobFromStorage(folderName, fileName, appName?);
```

**Parameters:**

- `folderName` (string): Folder name
- `fileName` (string): File name
- `appName` (string, optional): App name (auto-detected if not provided)

**Returns:** Promise<Blob> - File blob

**Example:**

```javascript
const blob = await sdk.getBlobFromStorage('assets', 'document.pdf');
// Use blob for download or processing
```

---

## Context Helpers

### User Context

#### userContext()

Get the current user context from localStorage.

```javascript
const context = sdk.userContext();
// Returns: { user_id, org_hkey, user_role, org_role, ... }
```

#### getUserId()

Get the current user ID.

```javascript
const userId = sdk.getUserId();
// Returns: string | undefined
```

#### getUserOrgHkey()

Get the user's organization hkey.

```javascript
const orgHkey = sdk.getUserOrgHkey();
// Returns: string | undefined
```

#### getUserRole()

Get the user's role.

```javascript
const role = sdk.getUserRole();
// Returns: string | undefined
```

#### getOrgRole()

Get the organization role.

```javascript
const orgRole = sdk.getOrgRole();
// Returns: string | undefined
```

---

### Application Context

#### applicationMeta()

Get application metadata from localStorage.

```javascript
const meta = sdk.applicationMeta();
// Returns: { doc_id, org_hkey, application_url_prefix, ... }
```

#### applicationName()

Get the application name/URL prefix.

```javascript
const appName = sdk.applicationName();
// Returns: string | undefined
```

#### applicationId()

Get the application document ID.

```javascript
const appId = sdk.applicationId();
// Returns: string | undefined
```

#### getApplicationOrgHkey()

Get the application's organization hkey.

```javascript
const appOrgHkey = sdk.getApplicationOrgHkey();
// Returns: string | undefined
```

#### isBaseApp()

Check if the current application is the base app.

```javascript
const isBase = sdk.isBaseApp();
// Returns: boolean
```

---

### Organization Context

#### getOrgId(org_hkey?)

Extract organization ID from org_hkey.

```javascript
const orgId = sdk.getOrgId(); // Uses user's org_hkey
// or
const orgId = sdk.getOrgId('org.123.456'); // Uses provided org_hkey
// Returns: string | undefined
```

#### getApplicationPrimaryOrgId()

Get the primary organization ID from application context.

```javascript
const primaryOrgId = sdk.getApplicationPrimaryOrgId();
// Returns: string | undefined
```

#### getFirebaseIndex(doc_type, doc_id, isSystemCall?)

Get the Firebase index/path for a document.

```javascript
const index = sdk.getFirebaseIndex('Users', 'user123');
// Returns: string (e.g., "org.app/Users.user123")
```

---

## Complete Example

```javascript
import FN7SDK from '@fn7/sdk';
import { environment } from './config/environment';

// Initialize SDK with Firebase config
const sdk = new FN7SDK(undefined, environment.firebase);

// Get user context
const userId = sdk.getUserId();
const userRole = sdk.getUserRole();
console.log(`User: ${userId}, Role: ${userRole}`);

// Get application context
const appId = sdk.applicationId();
const appName = sdk.applicationName();
console.log(`App: ${appName} (${appId})`);

// Firebase operations
async function example() {
  try {
    // Read data
    const user = await sdk.getFirebaseData('Users', userId);
    console.log('User data:', user);

    // Create data
    const newChat = await sdk.createFirebaseData('Chats', 'chat123', {
      participants: [userId],
      created_at: new Date().toISOString(),
    });
    console.log('Created chat:', newChat);

    // Update data
    await sdk.updateFirebaseData('Chats', 'chat123', {
      last_message: 'Hello!',
    });

    // Search data
    const chats = await sdk.searchFirebaseData(
      {
        AND: [
          ['doc_type', '==', 'Chats'],
          ['participants', 'array-contains', userId],
        ],
      },
      10
    );
    console.log('User chats:', chats);

    // Upload files
    const files = [file1, file2];
    const filenames = ['image1.jpg', 'image2.png'];
    const urls = await sdk.uploadToStorage(filenames, files, 'assets');
    console.log('Uploaded files:', urls);

    // Get file URL
    const fileUrl = await sdk.getFromStorage('assets', 'image1.jpg');
    console.log('File URL:', fileUrl);
  } catch (error) {
    console.error('Error:', error);
  }
}

example();
```

---

## Requirements

### Browser Environment

The SDK requires:

- Modern browser with `fetch` API support
- `localStorage` API (for context functions)
- `window` object (for host detection)

### Authentication

The SDK automatically reads authentication tokens from `localStorage`:

- Looks for `user_context` in localStorage
- Extracts `id_token` from user context
- Adds `authorization` header to all requests
- Adds `x-fn7-host` header from `window.location.host`

### localStorage Structure

The SDK expects the following localStorage structure:

```javascript
// user_context
{
  "user_id": "user123",
  "org_hkey": "org.456",
  "user_role": "admin",
  "org_role": "owner",
  "id_token": "jwt-token-here"
}

// app_context
{
  "doc_id": "app789",
  "org_hkey": "org.456",
  "application_url_prefix": "my-app"
}
```

---

## Error Handling

All Firebase operations return Promises and can throw errors:

```javascript
try {
  const data = await sdk.getFirebaseData('Users', 'user123');
} catch (error) {
  console.error('Firebase error:', error);
  // Handle error (network, authentication, etc.)
}
```

---

## TypeScript Support

The SDK includes TypeScript definitions. Import types:

```typescript
import FN7SDK, { FirebaseConfig } from '@fn7/sdk';
import { environment } from './config/environment';

const sdk = new FN7SDK(undefined, environment.firebase);

// TypeScript will provide type hints
const userId: string | undefined = sdk.getUserId();
```

---

## Versioning

The SDK follows semantic versioning:

- **Major version**: Breaking changes
- **Minor version**: New features (backward compatible)
- **Patch version**: Bug fixes (backward compatible)

CDN URLs include version:

- `https://fn7.io/.fn7-sdk/frontend/latest/sdk.min.js` (always latest)
- `https://fn7.io/.fn7-sdk/frontend/v1.0.0/sdk.min.js` (specific version)
- `https://fn7.io/.fn7-sdk/frontend/v1.1.0/sdk.min.js` (specific version)
- `https://fn7.io/.fn7-sdk/frontend/v2.0.0/sdk.min.js` (breaking changes)

---

## Support

For issues or questions, please refer to the main FN7 documentation or contact the development team.
