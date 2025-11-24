# FN7 SDK for Python

FN7 SDK for Python provides Firebase operations with security rules enforcement for backend services.

## Installation

### Using pip (Simple PyPI Index - Recommended)

```bash
pip install fn7-sdk --index-url https://fn7.io/.fn7-sdk/python/
```

### Direct Download (Latest Version)

```bash
# Download wheel file
wget https://fn7.io/.fn7-sdk/python/latest/fn7_sdk-*-py3-none-any.whl

# Install locally
pip install fn7_sdk-*-py3-none-any.whl
```

### Direct Download (Specific Version)

```bash
# Replace VERSION with desired version (e.g., 1.0.0)
wget https://fn7.io/.fn7-sdk/python/vVERSION/fn7_sdk-VERSION-py3-none-any.whl
pip install fn7_sdk-VERSION-py3-none-any.whl
```

## Quick Start

```python
from fn7_sdk import FN7SDK
import firebase_admin
import os

# Initialize Firebase Admin SDK (one-time setup)
# Option 1: From environment variable (recommended for production)
service_account_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH")
if service_account_path:
    cred = firebase_admin.credentials.Certificate(service_account_path)
    firebase_admin.initialize_app(cred)
else:
    # Option 2: From JSON string in environment variable
    import json
    service_account_json = os.getenv("FIREBASE_SERVICE_ACCOUNT_JSON")
    if service_account_json:
        cred = firebase_admin.credentials.Certificate(json.loads(service_account_json))
        firebase_admin.initialize_app(cred)
    else:
        # Option 3: Local file (for development)
        cred = firebase_admin.credentials.Certificate("path/to/service-account.json")
        firebase_admin.initialize_app(cred)

# Initialize FN7 SDK
storage_bucket = os.getenv("FIREBASE_STORAGE_BUCKET")  # Optional
sdk = FN7SDK(storage_bucket_name=storage_bucket)

# Use SDK with JWT token (pass token to each method for parallel request handling)
jwt_token = "your-jwt-token-here"  # Typically extracted from request headers

# Read data
data = sdk.get_firebase_data("Users", "user123", jwt_token)

# Create data
new_data = sdk.create_firebase_data("Chats", "chat456", {"message": "Hello"}, jwt_token)

# Update data
updated = sdk.update_firebase_data("Chats", "chat456", {"message": "Updated"}, jwt_token)

# Delete data
sdk.delete_firebase_data("Chats", "chat456", jwt_token)
```

## Environment Configuration

The SDK requires Firebase Admin SDK to be initialized. Firebase configuration should come from environment variables:

- **Local Development**: Use `.env` file or environment-specific config file
- **Dev/Prod**: Environment variables are already set in the deployment environment

### Required Environment Variables

- `FIREBASE_SERVICE_ACCOUNT_PATH`: Path to Firebase service account JSON file, OR
- `FIREBASE_SERVICE_ACCOUNT_JSON`: Firebase service account JSON as a string
- `FIREBASE_STORAGE_BUCKET`: (Optional) Firebase Storage bucket name for storage operations

## API Reference

### Initialization

```python
sdk = FN7SDK()
```

The SDK uses Firebase Admin SDK which must be initialized separately before use.

### Firebase Operations

All methods require a `jwt_token` parameter for authentication and context extraction.

For JWT token please contact the team.

#### get_firebase_data

Read data from Firebase.

```python
data = sdk.get_firebase_data(doc_type, doc_id, jwt_token)
```

#### create_firebase_data

Create a new document in Firebase.

```python
result = sdk.create_firebase_data(doc_type, doc_id, data, jwt_token)
```

#### update_firebase_data

Update an existing document in Firebase.

```python
result = sdk.update_firebase_data(doc_type, doc_id, data, jwt_token)
```

#### delete_firebase_data

Delete a document from Firebase.

```python
sdk.delete_firebase_data(doc_type, doc_id, jwt_token)
```

## Security

The SDK implements all Firebase security rules in code. All operations are validated before execution to ensure:

- Collection access control
- Organization isolation (org_hkey matching)
- Mandatory field validation
- Protected field protection
- Document ID format validation

## Requirements

- Python 3.8+
- Firebase Admin SDK credentials (service account JSON) - from environment variables
- JWT token with required claims (user_id, org_hkey, application_id, etc.)

## Building a Backend Server

To build a Python backend server using this SDK, see `BACKEND_SERVER_PROMPT.md` for a complete guide and prompt template.
