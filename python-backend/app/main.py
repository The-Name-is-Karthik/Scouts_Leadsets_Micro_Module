"""
Main Application Entry Point
FastAPI server with FN7 SDK integration
"""

from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fn7_sdk import FN7SDK
import os
from dotenv import load_dotenv
from typing import Optional

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="FN7 Python Backend", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SDK
sdk = None
try:
    sdk = FN7SDK()
    print("✅ FN7 SDK initialized successfully")
except Exception as e:
    print(f"⚠️  Warning: Failed to initialize SDK: {e}")
    print("   Make sure FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH is set")


def extract_jwt_token(authorization: Optional[str] = Header(None)):
    """
    Extract JWT token from Authorization header (optional in local mode)
    Token format: "Bearer <token>"

    In local, token is optional and SDK uses hardcoded dev token.
    """
    if not authorization:
        # In local mode, return None - SDK will use hardcoded token
        return None

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid Authorization header format")

    return authorization[7:]  # Remove "Bearer " prefix


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "sdk_initialized": sdk is not None}


# Example endpoint
@app.get("/api/users/{user_id}")
async def get_user(user_id: str, authorization: Optional[str] = Header(None)):
    """
    Get user data
    In local, authorization header is optional.
    SDK automatically uses hardcoded dev token if jwt_token is None.
    """
    if not sdk:
        raise HTTPException(status_code=500, detail="SDK not initialized")

    jwt_token = extract_jwt_token(authorization)

    try:
        # Token is optional - SDK handles it automatically in local mode
        user_data = sdk.get_firebase_data("Users", user_id, jwt_token)
        return user_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")

    uvicorn.run(app, host=host, port=port, reload=True)

