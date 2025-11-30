from fn7_sdk import FN7SDK
import json
from dotenv import load_dotenv
import os

load_dotenv()

try:
    sdk = FN7SDK()
    print("SDK Initialized")
    
    # Search for leadsets
    # SDK signature: search_firebase_data(query_constraints, limit)
    # Note: SDK implementation seems to ignore query_constraints, so we fetch all and filter.
    all_docs = sdk.search_firebase_data({}, 100)
    print(f"Fetched {len(all_docs)} documents")
    
    leadsets = [d for d in all_docs if d.get('doc_type') == 'leadsets']
    print(f"Found {len(leadsets)} leadsets")
    print(json.dumps(leadsets, indent=2))

except Exception as e:
    print(f"Error: {e}")
