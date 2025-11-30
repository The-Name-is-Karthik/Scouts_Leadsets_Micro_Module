from google.cloud import storage
from dotenv import load_dotenv
import os

load_dotenv()

bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET")[5:] # remove "gs://" prefix
try:
    client = storage.Client()
    bucket = client.bucket(bucket_name)
    blob = bucket.blob("test_upload.txt")
    blob.upload_from_string("Hello World")
    print(f"Upload successful to {bucket_name}/test_upload.txt")
    print(f"Public URL: {blob.public_url}")
except Exception as e:
    print(f"Upload failed: {e}")
