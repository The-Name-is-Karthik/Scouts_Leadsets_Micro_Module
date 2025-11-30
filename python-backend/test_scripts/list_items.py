from fn7_sdk import FN7SDK
from dotenv import load_dotenv

load_dotenv()

sdk = FN7SDK()

def list_items(run_id):
    # SDK doesn't have a direct method to stream subcollections easily without knowing the path structure
    # But we can use the underlying db client if exposed, or just use get_firebase_data if we know IDs.
    # Wait, SDK exposes `db`?
    # Let's check sdk.py or just try to access sdk.db
    # Or use the path directly if SDK supports it.
    
    # Fetch specific item
    item = sdk.get_firebase_data(f"leadsetRuns/{run_id}/items", "witem_01kba8aq4ebefydpsbbefydpsb")
    if item:
        print(f"Item ID: {item.get('itemId')}")
        print(f"Enrichment Status: {item.get('enrichment', {}).get('status')}")
        print(f"Email: {item.get('enrichment', {}).get('email')}")
    else:
        print("Item not found")

if __name__ == "__main__":
    list_items("run_84a21bba")
