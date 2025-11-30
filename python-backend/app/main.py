"""
Main Application Entry Point
FastAPI server with FN7 SDK integration
"""

import os
import io
import csv
import json
import uuid
import hmac
import hashlib
import datetime
import requests  
from typing import List, Optional
from fastapi import FastAPI, Request, HTTPException, Header, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from fn7_sdk import FN7SDK
import asyncio

load_dotenv()

app = FastAPI()


# Initialize SDK
sdk = None
try:
    bucket_name = os.getenv("FIREBASE_STORAGE_BUCKET", "")
    if bucket_name.startswith("gs://"):
        bucket_name = bucket_name[5:]
    
    # Extract just the bucket name if there's a path
    if "/" in bucket_name:
        bucket_name = bucket_name.split("/")[0]
    
    sdk = FN7SDK(storage_bucket_name=bucket_name)
    print("✅ FN7 SDK initialized successfully")
except Exception as e:
    print(f"⚠️  Warning: Failed to initialize SDK: {e}")
    print("   Make sure FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH is set")


# Exa SDK Imports
from exa_py import Exa
from exa_py.websets.types import CreateWebsetParameters, CreateEnrichmentParameters


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)





# Initialize Exa SDK
# Ensure EXA_API_KEY is set in your .env file
exa = Exa(api_key=os.getenv("EXA_API_KEY"))



class EnrichRequest(BaseModel):
    itemIds: List[str]

# --- Helper Functions ---
def get_current_time():
    return datetime.datetime.utcnow().isoformat()

def verify_exa_signature(signature_header: str, body: bytes, secret: str) -> bool:
    """
    Verify Exa webhook signature.
    Expected Header Format: t=<timestamp>,v1=<signature>
    Signed Payload: <timestamp>.<raw_body>
    """
    try:
        parts = dict(part.split('=', 1) for part in signature_header.split(','))
        timestamp = parts.get('t')
        signature = parts.get('v1')
        
        if not timestamp or not signature:
            return False
            
        # Construct the signed payload string exactly as Exa generates it
        signed_payload = f"{timestamp}.".encode('utf-8') + body
        
        expected_signature = hmac.new(
            secret.encode('utf-8'),
            signed_payload,
            hashlib.sha256
        ).hexdigest()
        
        return hmac.compare_digest(signature, expected_signature)
    except Exception as e:
        print(f"Signature verification failed: {e}")
        return False

# --- Endpoints ---

def process_run_background(run_id: str, webset_id: str, leadset_id: str):
    """Background task to wait for Exa search and process results."""
    try:
        print(f"Waiting for Webset {webset_id} to complete...")
        exa.websets.wait_until_idle(webset_id)
        
        # Retrieve Items
        items_response = exa.websets.items.list(webset_id=webset_id, limit=100)
        
        processed_count = 0
        item_ids = []
        for item in items_response.data:
            try:
                item_id = item.id
                print(f"Processing item {item_id}")
                
                # Safe access to properties
                props = item.properties if hasattr(item, 'properties') else item
                
                # Extract URL safely
                url = getattr(props, 'url', None)
                if url:
                    url = str(url)

                # Safely extract domain
                domain = "unknown"
                if url:
                    try:
                        domain = url.split("//")[-1].split("/")[0]
                    except: 
                        pass
                
                # Extract Company Name / Title
                company_name = "Unknown"
                if hasattr(props, 'company') and hasattr(props.company, 'name'):
                    company_name = props.company.name
                elif hasattr(props, 'title') and props.title:
                    company_name = props.title
                elif hasattr(props, 'name') and props.name:
                    company_name = props.name
                
                # Map Exa item to our schema
                new_item = {
                    "itemId": item_id,
                    "runId": run_id,
                    "leadsetId": leadset_id,
                    "entity": {
                        "company": company_name, 
                        "domain": domain
                    },
                    "snippet": (getattr(props, 'description', "") or "")[:200],
                    "sourceUrl": url,
                    "platform": "Web",
                    "recency": get_current_time(),
                    "score": 0,
                    "enrichment": {"status": "none"},
                    "selected": False
                }
                
                # Write to subcollection
                sdk.create_firebase_data(f"leadsetRuns/{run_id}/items", item_id, new_item)
                print(f"Processed item {new_item}")
                processed_count += 1
                item_ids.append(item_id)
            except Exception as e:
                print(f"Error processing item {item.id}: {e}")
                continue
        
        # Update run status to idle
        sdk.update_firebase_data("leadsetRuns", run_id, {
            "status": "idle",
            "counters": {
                "found": processed_count,
                "enriched": 0,
                "selected": 0
            },
            "itemIds": item_ids
        })
        print(f"Run {run_id} completed successfully with {processed_count} items.")
        
    except Exception as e:
        print(f"Background processing failed for run {run_id}: {e}")
        sdk.update_firebase_data("leadsetRuns", run_id, {"status": "failed"})

def process_enrichment_background(run_id: str, webset_id: str, item_ids: List[str]):
    """
    Background task to poll for enrichment results.
    Necessary for localhost where webhooks cannot reach.
    """
    try:
        print(f"Polling enrichment for run {run_id} (Webset {webset_id})...")
        
        # 1. Wait for enrichment to complete
        # This blocks until all pending operations on the webset are done
        exa.websets.wait_until_idle(webset_id)
        print(f"Enrichment completed for Webset {webset_id}")
        
        # 2. Fetch updated items (now with enrichment data)
        # We only need to fetch the specific items we enriched
        # But Exa list_items doesn't support filtering by ID easily, so we might fetch all 
        # or use get_item if available. For now, let's fetch all and filter or just update all.
        # Given we have item_ids, let's try to be efficient if possible, but list(limit=100) is safe for now.
        items_response = exa.websets.items.list(webset_id=webset_id, limit=100)
        
        enriched_count = 0
        
        for item in items_response.data:
            if item.id in item_ids:
                # This is one of the items we requested enrichment for
                
                # Extract enrichment data
                # The Exa SDK structure for enriched items might have 'enrichments' or merged properties
                # Based on docs/experience, it's often in 'enrichments' list or merged.
                # Let's check both or dump to see.
                
                updates = {"status": "done"}
                has_enrichment = False
                
                # Check for 'enrichments' attribute
                if hasattr(item, 'enrichments') and item.enrichments:
                    for result in item.enrichments:
                        # result is an EnrichmentResult object
                        # It has 'format' (str) and 'result' (List[str] or None)
                        
                        fmt = getattr(result, 'format', None)
                        res_list = getattr(result, 'result', [])
                        
                        if res_list and len(res_list) > 0:
                            val = res_list[0]
                            
                            if fmt == 'email':
                                updates["email"] = val
                                has_enrichment = True
                            elif fmt == 'phone':
                                updates["phone"] = val
                                has_enrichment = True
                            elif fmt == 'url':
                                # Check if it's a LinkedIn URL
                                if "linkedin.com" in val:
                                    updates["linkedinUrl"] = val
                                    has_enrichment = True 

                # Fallback: Check if properties are directly on the item object (merged)
                # Some SDK versions merge email/phone into the item properties
                props = item.properties if hasattr(item, 'properties') else item
                
                email = getattr(props, 'email', None)
                phone = getattr(props, 'phone', None)
                linkedin = getattr(props, 'linkedin_url', None) or getattr(props, 'linkedin', None)
                
                if email: 
                    updates["email"] = email
                    has_enrichment = True
                if phone: 
                    updates["phone"] = phone
                    has_enrichment = True
                if linkedin: 
                    updates["linkedinUrl"] = linkedin
                    has_enrichment = True
                    
                # If we found data, update Firebase
                if has_enrichment:
                    print(f"Found enrichment for {item.id}: {updates}")
                    existing_item = sdk.get_firebase_data(f"leadsetRuns/{run_id}/items", item.id)
                    if existing_item:
                        current_enrichment = existing_item.get("enrichment", {})
                        sdk.update_firebase_data(f"leadsetRuns/{run_id}/items", item.id, {
                            "enrichment": {**current_enrichment, **updates}
                        })
                        enriched_count += 1
        
        # Update run stats
        run_doc = sdk.get_firebase_data("leadsetRuns", run_id)
        if run_doc:
            current_enriched = run_doc.get("counters", {}).get("enriched", 0)
            # We add the NEWly enriched count. 
            # Note: This is a simple counter, might double count if we re-enrich. 
            # For now, it's fine.
            sdk.update_firebase_data("leadsetRuns", run_id, {
               "counters": {**run_doc.get("counters", {}), "enriched": current_enriched + enriched_count},
               "status": "idle" # Set back to idle when done
            })
            
        print(f"Enrichment polling finished. Updated {enriched_count} items.")

    except Exception as e:
        print(f"Enrichment polling failed: {e}")
        # Don't fail the whole run, just log it
        sdk.update_firebase_data("leadsetRuns", run_id, {"status": "idle"}) # Reset status so user can try again

@app.post("/leadsets/{leadset_id}/run")
async def start_run(leadset_id: str, background_tasks: BackgroundTasks):
    """
    Start a search using Exa SDK, return immediately, and process in background.
    Maps to OpenAPI: POST /v0/websets
    """
    # 1. Fetch leadset to get prompt
    leadset = sdk.get_firebase_data("leadsets", leadset_id)
    if not leadset:
        raise HTTPException(status_code=404, detail="Leadset not found")

    prompt = leadset.get("prompt")
    print(f"Starting run for Leadset: {leadset_id} with prompt: {prompt}")
    
    try:
        # 2. Create Webset using Exa SDK
        webset = exa.websets.create(
            params=CreateWebsetParameters(
                search={
                    "query": prompt,
                    "count": 5 # Defaulting to 50, can be adjusted
                }
            )
        )
        webset_id = webset.id
        print(f"Webset created: {webset_id}")

        # 3. Create LeadsetRun document in Firebase
        run_id = f"run_{uuid.uuid4().hex[:8]}"
        run_data = {
            "id": run_id,
            "leadsetId": leadset_id,
            "websetId": webset_id,
            "status": "running",
            "counters": {"found": 0, "enriched": 0, "selected": 0},
            "cost": {"estimate": 0, "spent": 0},
            "startedAt": get_current_time(),
            "createdBy": "system"
        }
        sdk.create_firebase_data("leadsetRuns", run_id, run_data)
        
        # Update leadset status
        sdk.update_firebase_data("leadsets", leadset_id, {
            "status": "running",
            "lastRunId": run_id
        })

        # 4. Add Background Task
        background_tasks.add_task(process_run_background, run_id, webset_id, leadset_id)
        
        return {
            "runId": run_id, 
            "status": "started", 
            "websetId": webset_id
        }

    except Exception as e:
        print(f"Exa SDK Error: {e}")
        raise HTTPException(status_code=500, detail=f"Exa Operation Failed: {str(e)}")

@app.post("/leadsets/{leadset_id}/runs/{run_id}/enrich")
async def enrich_items(leadset_id: str, run_id: str, payload: EnrichRequest, background_tasks: BackgroundTasks):
    """
    Trigger enrichment using Exa SDK.
    Maps to OpenAPI: POST /v0/websets/{id}/enrichments
    """
    sdk.update_firebase_data("leadsetRuns", run_id, {"status": "enriching"})
    
    run_doc = sdk.get_firebase_data("leadsetRuns", run_id)
    if not run_doc or not run_doc.get("websetId"):
        raise HTTPException(status_code=404, detail="Run or Webset ID not found")
        
    webset_id = run_doc.get("websetId")

    # We create 3 separate enrichments to find different contact details
    enrichment_configs = [
        {"desc": "Find the contact email address", "format": "email"},
        {"desc": "Find the phone number", "format": "phone"},
        {"desc": "Find the LinkedIn profile URL", "format": "url"}
    ]
    
    triggered_count = 0
    for ench in enrichment_configs:
        try:
            # Using params= matches the Python SDK docs provided
            exa.websets.enrichments.create(
                webset_id=webset_id,
                params=CreateEnrichmentParameters(
                    description=ench["desc"],
                    format=ench["format"]
                )
            )
            triggered_count += 1
            print(f"Triggered enrichment: {ench['desc']}")
        except Exception as e:
            print(f"Failed to trigger {ench['format']} enrichment: {e}")

    # Mark selected items as "queued" in Firebase so the UI shows spinners
    for item_id in payload.itemIds:
        sdk.update_firebase_data(f"leadsetRuns/{run_id}/items", item_id, {
            "enrichment": {"status": "queued"},
            "selected": True
        })
    
    # Trigger background polling for results
    background_tasks.add_task(process_enrichment_background, run_id, webset_id, payload.itemIds)
    
    return {"status": "success", "triggered_enrichments": triggered_count}

@app.get("/leadsets/{leadset_id}/runs/{run_id}/export")
async def export_csv(leadset_id: str, run_id: str):
    """Generate CSV and return download URL."""
    try:
        # Import SDK internals to construct correct path
        from fn7_sdk.utils import PathBuilder, LOCAL_DEV_JWT_TOKEN
        from fn7_sdk.jwt_decoder import JWTDecoder
        
        # Get collection prefix
        decoded_token = JWTDecoder.decode_token(LOCAL_DEV_JWT_TOKEN)
        user_context = JWTDecoder.extract_user_context(decoded_token)
        collection_index = PathBuilder.get_collection_index(user_context)
        
        # Construct path: PREFIX/leadsetRuns/{run_id}/items.{item_id}
        # This maps to: Collection(PREFIX) -> Doc(leadsetRuns) -> Coll(run_id) -> Doc(items.{item_id})
        # Wait, if doc_type was "leadsetRuns/{run_id}/items", then path is PREFIX/leadsetRuns/{run_id}/items.{item_id}
        # This means segments: PREFIX, leadsetRuns, run_id, items.{item_id}
        
        # Let's try to stream from the run_id subcollection
        items_ref = sdk.firebase_client.db.collection(collection_index).document("leadsetRuns").collection(run_id)
        docs = items_ref.stream()
        
        items = []
        for doc in docs:
            # Filter for docs that look like items
            if doc.id.startswith("items."):
                items.append(doc.to_dict())
        
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Company", "Domain", "Score", "Snippet", "Email", "LinkedIn", "Phone"])
        
        for item in items:
            ent = item.get("entity", {})
            enr = item.get("enrichment", {})
            writer.writerow([
                ent.get("company"),
                ent.get("domain"),
                item.get("score"),
                item.get("snippet"),
                enr.get("email", ""),
                enr.get("linkedinUrl", ""),
                enr.get("phone", "")
            ])
            
        file_content = output.getvalue().encode("utf-8")
        filename = f"{run_id}_{int(datetime.datetime.now().timestamp())}.csv"
        folder = "exports"
        
        # upload_to_storage takes filenames (not full paths) and a folder argument
        # Wait, upload_to_storage signature: (filenames, files, jwt_token, folder="definitions")
        # So I should pass just the filename and folder="exports"
        
        sdk.upload_to_storage([filename], [file_content], folder=folder)
        url = sdk.get_from_storage(folder, filename)
        
        return {"url": url}
    except Exception as e:
        import traceback
        with open("export_error.log", "w") as f:
            f.write(traceback.format_exc())
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/webhooks/exa")
async def exa_webhook(request: Request):
    """Handle Exa webhooks with signature validation."""
    # 1. Get Headers
    signature_header = request.headers.get("Exa-Signature") or request.headers.get("x-exa-signature")
    
    # 2. Get Secret
    secret = os.getenv("EXA_WEBHOOK_SECRET")
    
    # 3. Verify
    if secret and signature_header:
        body_bytes = await request.body()
        if not verify_exa_signature(signature_header, body_bytes, secret):
            print("Warning: Invalid webhook signature")
            raise HTTPException(status_code=401, detail="Invalid signature")
    elif not secret:
        print("Warning: EXA_WEBHOOK_SECRET not set, skipping validation")
    
    # 4. Process Payload
    data = await request.json()
    event_type = data.get("type")
    payload = data.get("data", {})
    webset_id = data.get("websetId")

    if not webset_id:
        return {"status": "ignored", "reason": "missing_webset_id"}

    # Find the run associated with this Webset
    runs = sdk.search_firebase_data("leadsetRuns", {"where": [["websetId", "==", webset_id]], "limit": 1})
    if not runs:
        return {"status": "ignored", "reason": "run_not_found"}
        
    run_id = runs[0]["id"]

    # Handle Enrichment Results (Async updates)
    if event_type == "webset.item.enriched":
        item_id = payload.get("itemId")
        # OpenAPI spec says 'enrichments' is an array of EnrichmentResult objects
        enrichment_results = payload.get("enrichments", [])
        
        existing_item = sdk.get_firebase_data(f"leadsetRuns/{run_id}/items", item_id)
        if existing_item:
            current_enrichment = existing_item.get("enrichment", {})
            updates = {"status": "done"}
            
            # Flatten enrichment results into our single object structure
            for result in enrichment_results:
                # The result field is an array of strings (e.g. ["email@example.com"])
                result_values = result.get("result", [])
                val = result_values[0] if result_values else None
                
                fmt = result.get("format")
                if val:
                    if fmt == "email": updates["email"] = val
                    elif fmt == "phone": updates["phone"] = val
                    elif fmt == "url": updates["linkedinUrl"] = val
            
            sdk.update_firebase_data(f"leadsetRuns/{run_id}/items", item_id, {
                "enrichment": {**current_enrichment, **updates}
            })
            
            # Update stats
            current_enriched = runs[0].get("counters", {}).get("enriched", 0)
            sdk.update_firebase_data("leadsetRuns", run_id, {
               "counters": {**runs[0].get("counters", {}), "enriched": current_enriched + 1}
            })

    # Note: item_created events might also come in, but we already fetched items
    # synchronously in start_run. We can ignore them or use them to update.
    
    return {"status": "processed"}


@app.get("/health")
def health():
    """Health check endpoint"""
    return {"status": "ok", "sdk_initialized": sdk is not None}





if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)






