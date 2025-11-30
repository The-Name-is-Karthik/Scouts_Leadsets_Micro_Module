from fn7_sdk import FN7SDK
from dotenv import load_dotenv
import firebase_admin

load_dotenv()

try:
    sdk = FN7SDK()
    app = firebase_admin.get_app()
    print(f"Project ID: {app.project_id}")
except Exception as e:
    print(f"Error: {e}")
