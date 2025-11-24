# FN7 Python Backend

Backend server built with FN7 SDK for Python, providing Firebase operations with security rules enforcement.

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- Firebase project with service account
- pip

### Installation

1. **Create and activate virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   # Install fn7-sdk from custom registry
   pip install fn7-sdk --extra-index-url https://fn7.io/.fn7-sdk/python/

   # Install other dependencies
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Firebase service account JSON:
   ```bash
   FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
   FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
   ```

4. **Run the server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   Or use the Python module:
   ```bash
   python -m app.main
   ```

   The server will start on `http://localhost:8000`

## 📋 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_JSON` | ✅ Yes* | Firebase service account JSON as a string |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | ✅ Yes* | Path to Firebase service account JSON file |
| `FIREBASE_STORAGE_BUCKET` | ❌ No | Firebase Storage bucket name (optional) |
| `PORT` | ❌ No | Server port (default: 8000) |
| `HOST` | ❌ No | Server host (default: 0.0.0.0) |

*Either `FIREBASE_SERVICE_ACCOUNT_JSON` or `FIREBASE_SERVICE_ACCOUNT_PATH` is required.

### Local Mode

- Makes JWT tokens optional in all methods
- Uses hardcoded dev token if no token provided
- No need to extract/pass JWT tokens from request headers
- Faster development iteration


# In your code - token is optional!
data = sdk.get_firebase_data("Users", "user123")  # No token needed
```

### Getting Firebase Service Account JSON

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Copy the entire JSON object and paste it as a single-line string in `.env`

**Important:** Never commit `.env` file or service account JSON files to version control!

## 🔧 Usage Examples

### Basic CRUD Operations

```python
from fn7_sdk import FN7SDK

sdk = FN7SDK()
jwt_token = "your-jwt-token"  # Extract from request headers

# Read data
user = sdk.get_firebase_data("Users", "user123", jwt_token)

# Create data
new_chat = sdk.create_firebase_data("Chats", "chat456", {
    "message": "Hello",
    "timestamp": "2024-01-01T00:00:00Z"
}, jwt_token)

# Update data
updated = sdk.update_firebase_data("Chats", "chat456", {
    "message": "Updated message"
}, jwt_token)

# Delete data
sdk.delete_firebase_data("Chats", "chat456", jwt_token)
```

### Atomic Increments

```python
from fn7_sdk import FN7SDK

sdk = FN7SDK()
utils = sdk.get_firestore_utilities()
jwt_token = None  # Optional in local mode

sdk.update_firebase_data("Users", "user123", {
    "login_count": utils.increment(1),
    "score": utils.increment(10)
}, jwt_token)
```

### Storage Operations

```python
jwt_token = None  # Optional in local mode

# Upload files
file_names = ["image.jpg", "document.pdf"]
file_buffers = [buffer1, buffer2]  # List of bytes or base64 strings
urls = sdk.upload_to_storage(file_names, file_buffers, jwt_token)

# Get download URL
download_url = sdk.get_from_storage("assets", "image.jpg", jwt_token)

# Get file as bytes
file_buffer = sdk.get_blob_from_storage("assets", "document.pdf", jwt_token)
```

## 📚 API Endpoints

### Health Check
- `GET /health` - Server health status

### Users
- `GET /api/users/{user_id}` - Get user data
- `POST /api/users/{user_id}` - Create user data
- `PUT /api/users/{user_id}` - Update user data
- `DELETE /api/users/{user_id}` - Delete user data

### Storage
- `POST /api/storage/upload` - Upload files to Firebase Storage

## 🔐 Authentication

### Local Mode (for Development)

- JWT tokens are **optional** in all API endpoints
- SDK automatically uses hardcoded dev token if no token provided
- No need to pass `Authorization` header
- Works immediately out of the box

### Dev/Prod Mode

When Local Mode is disabled:
- All API endpoints require a JWT token in the `Authorization` header:
  ```
  Authorization: Bearer <your-jwt-token>
  ```
- The JWT token should contain the following claims:
  - `user_id`
  - `org_hkey`
  - `application_id`
  - Other claims as required by your Firebase security rules

## 🛠️ Development

### Scripts

- `uvicorn app.main:app --reload` - Start development server with hot reload
- `python -m app.main` - Run the application directly
- `uvicorn app.main:app --host 0.0.0.0 --port 8000` - Start production server

### Project Structure

```
app/
├── __init__.py
├── main.py          # FastAPI application
├── routes/          # API routes (optional)
├── middleware/      # Custom middleware (optional)
└── utils/          # Utility functions (optional)
```

## 🐳 Docker

### Build and run with Docker

```bash
docker build -t fn7-python-backend .
docker run -p 8000:8000 --env-file .env fn7-python-backend
```

### Using Docker Compose

```bash
docker-compose up
```

## 📖 Documentation

- [Main Template README](../README.md) - For complete micro module setup guide
- [FN7 Python SDK](../fn7-sdk/python-sdk.md) - Complete Python SDK documentation
- [FN7 Frontend SDK](../fn7-sdk/frontend-sdk.md) - Frontend SDK documentation

## 🗑️ Don't Need Python Backend?

If your micro module doesn't need a Python backend, you can safely delete this entire `python-backend/` folder.
