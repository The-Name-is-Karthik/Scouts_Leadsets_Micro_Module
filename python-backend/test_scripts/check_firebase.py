from fn7_sdk import FN7SDK
import json
from dotenv import load_dotenv

load_dotenv()

sdk = FN7SDK()

def check_data():
    print("Checking Leadsets...")
    all_leadsets = sdk.search_firebase_data("leadsets", 100)
    leadsets = [ls for ls in all_leadsets if 'UK DTC Supplements' in ls.get('name', '')]
    print(f"Found {len(leadsets)} leadsets")
    print(json.dumps(all_leadsets, indent=2))
    # print(f"Total Leadsets: {len(all_leadsets)}")
    all_runs = sdk.search_firebase_data({'doc_type': 'leadsetRuns'}, 100) # Fetch all runs once
    
    for ls in leadsets:
        if not ls.get('id'): continue
        print(f"\nLeadset: {ls.get('id')} ({ls.get('name')})")
        
        # Check all runs for this leadset
        runs = [r for r in all_runs if r.get('leadsetId') == ls.get('id')] # Filter runs for the current leadset
        print(f"  Found {len(runs)} runs for this leadset")
        for run in runs:
            print(f"  Run {run.get('id')}:")
            print(f"    Status: {run.get('status')}")
            print(f"    Created: {run.get('startedAt')}")
        


if __name__ == "__main__":
    check_data()
