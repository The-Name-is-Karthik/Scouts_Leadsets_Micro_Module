from google.cloud import storage
from dotenv import load_dotenv
import os

load_dotenv()

# Initialize client
# It will use GOOGLE_APPLICATION_CREDENTIALS from env (set by load_dotenv if in .env)
# But .env is not loaded by default in script unless we do it.
# And main.py loads it.
# FN7SDK sets it up? No, FN7SDK calls initialize_firebase_admin.
# StorageClient uses storage.Client().
# storage.Client() looks for GOOGLE_APPLICATION_CREDENTIALS.

# I need to make sure GOOGLE_APPLICATION_CREDENTIALS is set.
# main.py does `load_dotenv()`.
# If .env has it, great.
# If not, FN7SDK might set it?
# Let's check `firebase_init.py` in fn7_sdk.

try:
    client = storage.Client()
    buckets = list(client.list_buckets())
    print(f"Found {len(buckets)} buckets:")
    for bucket in buckets:
        print(f"- {bucket.name}")
except Exception as e:
    print(f"Error listing buckets: {e}")
