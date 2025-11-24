	

Below is a **clear, code-free project specification** for the *Scout → Leadsets* micro-module using **Firebase as the datastore**, a **JavaScript-only front end**, and a small **Node or Python backend** that calls **Exa WebSets** (API key only on the backend). I’ve also included **seed data** you can import into Firebase.

> Taxonomy, insight families, and the Audience Segments + Intent Signals used here follow your canonical Scout materials. 
> Token names (e.g., segment_archetype, comparison_language) come from your unified insight list. 

---

# 1) Goal & scope

## What This Application Does (Simple Explanation)

This is a simple web application with **only 2 screens** that helps you find potential customers (we call them "buyers") for your business.

Think of it like this:
- **Scout** (another system) already found groups of potential buyers and saved them as "Leadsets"
- Our application shows these Leadsets and helps you get contact information for these buyers
- You can then reach out to these buyers to sell your product or service

## The Two Screens

### Screen 1: Dashboard (List of Leadsets)
**What you see:** A grid of cards, like tiles on your phone
**What each card shows:**
- Name of the buyer group (example: "US Beauty Brands looking for help")
- How many potential buyers are in this group
- What type of buyers they are (location, industry, size)
- One button: "Open" (to see the buyers inside)

**What you can do:**
- Look at all available Leadsets
- Click "Open" on any card to see the buyers inside
- That's it! No other actions on this screen

### Screen 2: Buyer Details (Inside a Leadset)
**What you see:** A table/list of potential buyers, like an Excel spreadsheet
**What the table shows for each buyer:**
- Company name
- Website
- Why they might buy from you (what they said online)
- How recently they showed interest
- A score (how good a match they are)

**What you can do:**
1. **Filter the list** - Show only buyers from certain locations or industries
2. **Select buyers** - Check boxes next to buyers you're interested in
3. **Unlock contact details** - Get email, phone, LinkedIn for selected buyers (costs money)
4. **Download** - Save the list as a CSV file (Excel format)

## Important Points

* **You cannot create new Leadsets** - Another system (Scout) does that
* **Everything updates automatically** - When new buyers are found, they appear instantly
* **Contact details cost money** - You pay only for the buyers you select
* **Simple and fast** - Only 2 screens, no complex navigation

## Technical Requirements (Simple Version)

* **Frontend:** React with **JavaScript only (no TypeScript)**
  * Uses FN7 SDK to connect to database
  * Beautiful design with Sora font and light colors
  * Orange-to-purple gradient for buttons
  
* **Backend:** Node.js with **JavaScript only (no TypeScript)**  
  * Connects to Exa API to find buyers
  * No user login needed (simplified for development)
  * Uses FN7 SDK for all database operations

* **Database:** Firebase (Google's cloud database)
  * Stores all Leadsets and buyer information
  * Both frontend and backend use FN7 SDK to access it
  * Real-time updates (changes appear instantly)

* **Starting point:** Copy the fn7io/mircro-module-template repository and build from there

---

# 2) Architecture

**Frontend (React + JavaScript only)**

* React application using **JavaScript only - no TypeScript**
* **FN7 Frontend SDK** for all Firebase operations:
  * Load SDK from CDN: `<script src="https://fn7.io/.fn7-sdk/frontend/latest/sdk.min.js"></script>`
  * Or ES modules: `import { SDK } from 'https://fn7.io/.fn7-sdk/frontend/latest/sdk.esm.js'`
* SDK provides Firebase operations: `getFirebaseData`, `createFirebaseData`, `updateFirebaseData`, `deleteFirebaseData`, `searchFirebaseData`
* SDK provides **Firebase Storage operations**: `uploadToStorage`, `getStorageUrl`, `getStorageBlob`
* SDK provides real-time listeners: `startFirebaseListener` for live updates
* Context helpers from SDK: `userContext()`, `applicationMeta()`, etc.
* Only calls backend for Exa API operations
* **UI Design Requirements** (per FN7 template guidelines):
  * **Theme:** Light theme with white backgrounds (#FFFFFF)
  * **Font:** Sora font family for all text
  * **Colors:** 
    - Primary text: #000000
    - Backgrounds: #FAFAFA, #F4F4F4
    - Borders: #E6E6E6, #CCCCCC
    - Accent blue: #2a60ff, #003ef6
    - Error: #FF5533
  * **Scout Brand Gradient:** `linear-gradient(to right, #ff482ccc, #a245eecc)` for accent elements
  * **Icons:** Material Icons only (no emojis)
  * **No scrolling** on single-view pages
* Renders:
  * **Page A**: Leadsets Dashboard (grid of cards)
  * **Page B**: Leadset Detail (table of WebSets items, selection, unlock, download)

**Backend (Node.js + JavaScript only)**

* Simple Node.js service using **JavaScript only - no TypeScript** (Express or similar)
* **NO authentication or security validation** - processes all requests as valid
* **FN7 Backend SDK** for all Firebase operations (Node.js JavaScript version):
  * Provides same Firebase CRUD operations as frontend SDK
  * Provides Firebase Storage operations for server-side file handling
  * Handles Firebase Admin operations transparently
* Holds **EXA_API_KEY** in ENV (never exposed to client)
* **Minimal endpoints** (no auth required):

  1. `POST /leadsets/:id/run`
     * Reads prompt using FN7 SDK's `getFirebaseData()`
     * Calls Exa API to create WebSet
     * Updates Firebase with run metadata using FN7 SDK's `updateFirebaseData()`
     * Frontend receives updates via FN7 SDK listeners

  2. `POST /leadsets/:id/runs/:runId/enrich`
     * Accepts selected item IDs from frontend
     * Calls Exa API for enrichment (LinkedIn, email, phone)
     * Writes results using FN7 SDK's `updateFirebaseData()`
     * Frontend receives updates via FN7 SDK listeners

  3. `POST /webhooks/exa`
     * Receives Exa webhook events
     * **Validates webhook signature** per Exa security requirements (HMAC SHA256)
     * Updates Firebase using FN7 SDK's `createFirebaseData()` or `updateFirebaseData()`

  4. `GET /leadsets/:id/runs/:runId/export`
     * Reads data using FN7 SDK's `searchFirebaseData()`
     * Generates CSV file
     * Optionally stores CSV using FN7 SDK's `uploadToStorage()`
     * Returns file URL or direct download to frontend

**Firebase**

* **Configuration:** Developers set up their own Firebase project and provide config
* **Access Method:** **All Firebase operations must use FN7 SDKs** - no direct Firebase SDK usage
* **Firestore:** Stores Leadsets (from Scout), runs, items, and enrichment logs (see schema)
* **Real-time:** FN7 SDK's `startFirebaseListener` for live updates
* **Firebase Storage:** **All file/image/video storage via FN7 SDK**:
  * `uploadToStorage(file, path)` for uploading files
  * `getStorageUrl(path)` for getting download URLs
  * `getStorageBlob(path)` for retrieving file content
  * CSV exports, logs, and any media files stored via SDK
* **No security rules needed:** Development environment assumes trusted access

---

# 3) Data model (Firestore)

Collections & key fields (all strings unless noted):

### `leadsets` (created by Scout; **read-only** in this module)

* `id` (doc id)
* `name`, `description`
* `prompt` (string; the exact Exa search prompt Scout built)
* `segment`:

  * `segment_archetype`, `geo_region`, `firmographic_company_size`, `technographic_stack` (array), `tribe` (array)
* `intent`:

  * `signals` (array of tokens, e.g., `["help_seeking_question","comparison_language"]`), `intent_tier`
* `target`: `"dtc_brand"` or `"saas_founder"` (the buyer profile you want to sell Scout to)
* `est_count` (number), `createdAt`, `createdBy`
* `lastRunId` (nullable), `status` (`"idle"|"running"|"enriching"|"failed"`)

### `leadsetRuns` (top-level or subcollection under leadsets)

* `id` (doc id)
* `leadsetId`
* `websetId` (from Exa)
* `status` (`"running"|"idle"|"enriching"|"failed"`)
* `counters`: `{ found: number, enriched: number, selected: number }`
* `cost`: `{ estimate: number, spent: number }` (token/$)
* `startedAt`, `finishedAt`, `createdBy`
* `logLevel`: `"info"|"debug"`
* `exportUrl` (nullable, Firebase Storage URL for CSV export)

### `leadsetRunItems` (subcollection: `/leadsetRuns/{runId}/items`)

* `itemId` (from Exa), `runId`, `leadsetId`
* `entity`: `{ company: string, domain?: string }`
* `snippet`, `sourceUrl`, `platform`
* `recency` (ISO date), `score` (number), `scoreBreakdown` (object)
* `matches`: `{ segment: string[], intent: string[], tribe: string[] }`
* `verification`: `{ passed: boolean, details: string }`
* `enrichment`: `{ status: "none"|"queued"|"running"|"done"|"failed", linkedinUrl?: string, email?: string, phone?: string }`
* `selected` (boolean)

### `enrichments` (subcollection: `/leadsetRuns/{runId}/enrichments`)

* `enrichmentId` (from Exa), `format` (e.g., `"email","phone","url"`), `status`
* `selectionSize` (number), `itemIds` (array)
* `createdAt`, `finishedAt`, `cost` (number)

### `settings` (singleton doc)

* `scoringWeights`: `{ segment: 0.3, intent: 0.3, recency: 0.15, platform: 0.1, credibility: 0.1, verification: 0.05 }`
* `export`: `{ csv: true, storageBasePath: "exports/" }`
* `limits`: `{ maxSelectionPerEnrichment: 500, maxFileSize: 10485760 }` (10MB)

**Indexes**

* `/leadsetRuns` composite: `leadsetId + startedAt desc`
* `/leadsetRunItems` composite: `runId + score desc`, `runId + platform + recency desc`

**Data Access**

* Frontend uses **FN7 Frontend SDK** for all Firebase operations
* Backend uses **FN7 Backend SDK** for all Firebase operations
* Both use FN7 SDK's listener capabilities for real-time updates
* SDK handles Firebase index generation via `getFirebaseIndex(doc_type, doc_id)`
* No authentication or permission checks required (development mode)

---

# 4) Front-end UX (two pages)

## Page A — Leadsets Dashboard

* **Grid of cards** (no "create" button) - light theme with white background.
* Card styling:
  * Background: #FFFFFF with #E6E6E6 borders
  * Hover state: #FAFAFA background
  * Text: #000000 primary, #737373 secondary
  * Font: Sora
* Card content: name, short description, segment chips (archetype, geo), tribe chips, top 3 intent badges, est_count, last status, **Open** CTA.
* **Open** button: Scout gradient background (`linear-gradient(to right, #ff482ccc, #a245eecc)`), white text.
* **Open** navigates to Page B for that Leadset (and triggers a run if none active).

## Page B — Leadset Detail

* **Design:** Light theme (#FFFFFF background), Sora font throughout.
* Header: Leadset name + chips + status + counters (found/enriched).
  * Status badges: Use accent colors with appropriate backgrounds
  * Counters: Bold Sora font with #000000 color
* **Auto-run**: On first load (if no active run), call `POST /leadsets/:id/run` (backend uses the stored **prompt**).
* **Table (real-time updates via Firebase listeners)** of items:
  * Header row: #F4F4F4 background with #000000 text
  * Data rows: #FFFFFF with #E6E6E6 borders
  * Hover: #FAFAFA background
  * Columns: Company | Domain/Platform | Snippet (signal highlights) | Recency | Score | Enrichment status
* **Filters:** 
  * Filter chips: #F4F4F4 background, #737373 text
  * Active filters: #2a60ff background with white text
  * Segment facets (geo, stack, tribe), Intent facets (help_seeking, comparison, urgency, budget), Platform, Recency.
* **Selection:** Material Icons checkboxes, "Select page" and "Select all filtered".
* **Unlock contact details button:** 
  * Primary CTA: Scout gradient (`linear-gradient(to right, #ff482ccc, #a245eecc)`), white text, Sora font
  * Hover: Slightly darker gradient or opacity change
  * Opens confirmation modal:
    * Modal: White background with subtle shadow
    * Summary: N selected, enrichment types, **estimated cost** in bold
    * Error states: #FF5533 color for warnings
    * Confirm → `POST /leadsets/:id/runs/:runId/enrich`
* Progress indicators: Use Material Icons, no emojis.
* **Download CSV**: Secondary button style (#F4F4F4 background, #000000 text)

**Width constraint:** container **max-width ≈ 1200px** to match Engagement Strategies visual rhythm.
**No scrolling** on modals and single-view components.

---

# 5) Backend flows

### A) Start a run for a Leadset

* Input: `leadsetId` (no auth validation needed)
* Backend reads Leadset using **FN7 SDK's `getFirebaseData('leadsets', leadsetId)`**
* Call Exa API to create WebSet with `search.query = prompt`
* Write run metadata using **FN7 SDK's `createFirebaseData('leadsetRuns', runId, data)`**
* Frontend receives updates via **FN7 SDK's `startFirebaseListener()`**
* Setup webhook endpoint for Exa callbacks

### B) Ingest items

* Via **Exa webhooks**:
  * Backend receives webhook, **validates Exa signature** (HMAC SHA256)
  * Writes items using **FN7 SDK's `createFirebaseData()` or `updateFirebaseData()`**
  * Updates counters using **FN7 SDK's `updateFirebaseData()`**
  * Reads settings using **FN7 SDK's `getFirebaseData('settings', 'settings')`**
  * Frontend receives updates via **FN7 SDK listeners** (no polling needed)

### C) Enrichment (single consolidated action)

* Input: `runId`, array of **selected** item IDs (no auth check)
* Backend calls Exa API for enrichment:
  * `url` (LinkedIn profile) + `email` + `phone`
* Write enrichment status using **FN7 SDK's `updateFirebaseData()`**
* On webhook updates, **validate Exa signature** then write using **FN7 SDK**
* Frontend receives real-time updates via **FN7 SDK listeners**

### D) Export

* Backend reads data using **FN7 SDK's `searchFirebaseData()`**
* Assembles CSV file in memory
* Stores CSV using **FN7 SDK's `uploadToStorage(csvBuffer, 'exports/runId.csv')`**
* Gets download URL using **FN7 SDK's `getStorageUrl('exports/runId.csv')`**
* Returns signed URL to frontend for download

**Key implementation notes**

* **Mandatory: Use FN7 SDKs for ALL Firebase operations** - no direct Firebase SDK usage
* **All file storage operations must use FN7 SDK's Storage functions**:
  * `uploadToStorage()` for any file uploads (CSV, logs, images, etc.)
  * `getStorageUrl()` for generating download URLs
  * `getStorageBlob()` for retrieving file content
* Backend handles all Exa API calls (API key never exposed to frontend)
* **Exa webhooks must be validated** using HMAC SHA256 signature verification
* Frontend loads FN7 SDK from CDN or ES modules
* Backend uses Node.js JavaScript version of FN7 SDK
* Use FN7 SDK's listener functions for all real-time updates
* No authentication needed except for Exa webhook signature validation

---

# 6) Seeding data for Firebase

Import these docs into Firestore **`leadsets`** collection (6 examples).
All are **targets to sell Scout** (DTC brands or SaaS founders), **not individuals** inside this module; the **enrichment** step fetches contacts later.

### `leadsets` (JSON array)

```json
[
  {
    "id": "ls_dtc_us_beauty_cac_ugc",
    "name": "US DTC Beauty (0–$2M) — CAC & UGC asks",
    "description": "DTC beauty brands discussing CAC reduction, UGC sourcing, and budget constraints.",
    "prompt": "Find US DTC beauty brands under $2M revenue discussing CAC reduction, UGC briefs, influencer outreach, or creative testing problems on Shopify/Klaviyo. Prioritize founders/marketing leads asking for help, budgets, or X vs Y tool comparisons.",
    "segment": {
      "segment_archetype": "DTC brand (beauty)",
      "geo_region": "US",
      "firmographic_company_size": "0–2M",
      "technographic_stack": ["Shopify","Klaviyo"],
      "tribe": ["#cleanbeauty","#skincarebrand"]
    },
    "intent": {
      "signals": ["help_seeking_question","budget_mention","comparison_language"],
      "intent_tier": "High"
    },
    "target": "dtc_brand",
    "est_count": 400,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  },
  {
    "id": "ls_dtc_uk_supplements_adscale",
    "name": "UK DTC Supplements (0–$2M) — scaling ads & ROAS",
    "description": "Sleep/stress SKUs; brands seeking ROAS help or media buyers.",
    "prompt": "Find UK DTC supplement brands (sleep/stress/magnesium/adaptogens) under $2M discussing ROAS, CPA, creator briefs, or PMAX performance; request for help or comparisons.",
    "segment": {
      "segment_archetype": "DTC brand (supplements)",
      "geo_region": "UK",
      "firmographic_company_size": "0–2M",
      "technographic_stack": ["Shopify"],
      "tribe": ["#wellness","#ukdtc"]
    },
    "intent": {
      "signals": ["help_seeking_question","comparison_language","churn_risk_complaint"],
      "intent_tier": "Medium"
    },
    "target": "dtc_brand",
    "est_count": 260,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  },
  {
    "id": "ls_dtc_ca_wellness_attribution",
    "name": "Canada DTC Wellness (0–$2M) — attribution help",
    "description": "Brands asking about MER, tracking, creative testing.",
    "prompt": "Find Canadian DTC wellness brands under $2M asking for attribution/MER help, pixel/tracking, creative testing frameworks; founders or growth managers posting in forums and groups.",
    "segment": {
      "segment_archetype": "DTC brand (wellness)",
      "geo_region": "CA",
      "firmographic_company_size": "0–2M",
      "technographic_stack": ["Shopify"],
      "tribe": ["#canadadirecttoconsumer"]
    },
    "intent": {
      "signals": ["help_seeking_question","social_proof_seek","budget_mention"],
      "intent_tier": "Medium"
    },
    "target": "dtc_brand",
    "est_count": 180,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  },
  {
    "id": "ls_saas_seed_martech_social_listening",
    "name": "Seed SaaS founders (MarTech/AdTech) — social listening need",
    "description": "Founders seeking listening + lead gen; comparing tools; asking for intros.",
    "prompt": "Find seed-stage SaaS founders building MarTech/AdTech who ask for social listening or CAC insights; comparing tools; requesting intros or pilots; focus on US/EU startup communities.",
    "segment": {
      "segment_archetype": "SaaS founder (MarTech/AdTech)",
      "geo_region": "US/EU",
      "firmographic_company_size": "pre-seed/seed",
      "technographic_stack": [],
      "tribe": ["#buildinpublic","#founder"]
    },
    "intent": {
      "signals": ["help_seeking_question","comparison_language","urgency_timing"],
      "intent_tier": "High"
    },
    "target": "saas_founder",
    "est_count": 220,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  },
  {
    "id": "ls_saas_plg_analytics_trial_to_paid",
    "name": "PLG SaaS (analytics) — poor trial→paid",
    "description": "Founders/PMs asking why PLG converts poorly; exploring AI agents.",
    "prompt": "Find SaaS founders/leads in analytics/PLG discussing low trial-to-paid conversion, onboarding gaps, and need for audience research; interest in AI agents for GTM.",
    "segment": {
      "segment_archetype": "SaaS PLG (analytics)",
      "geo_region": "Global (EN)",
      "firmographic_company_size": "seed/series A",
      "technographic_stack": [],
      "tribe": ["#productled","#revops"]
    },
    "intent": {
      "signals": ["churn_risk_complaint","help_seeking_question","social_proof_seek"],
      "intent_tier": "Medium"
    },
    "target": "saas_founder",
    "est_count": 190,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  },
  {
    "id": "ls_dtc_apac_beauty_sensitive_creators",
    "name": "APAC DTC Beauty (sensitive skin) — creators in AU/NZ",
    "description": "Brands asking for UGC & before/after in hot/humid climates.",
    "prompt": "Find APAC DTC beauty brands (sensitive skin) in AU/NZ asking for creators or before/after proof; discussing budget tiers and UGC briefs; Shopify preferred.",
    "segment": {
      "segment_archetype": "DTC brand (beauty, sensitive skin)",
      "geo_region": "AU/NZ",
      "firmographic_company_size": "0–2M",
      "technographic_stack": ["Shopify"],
      "tribe": ["#ausbeauty","#skincarebrand"]
    },
    "intent": {
      "signals": ["social_proof_seek","budget_mention","help_seeking_question"],
      "intent_tier": "High"
    },
    "target": "dtc_brand",
    "est_count": 240,
    "createdAt": "2025-11-11T12:00:00Z",
    "status": "idle",
    "lastRunId": null
  }
]
```

### `settings` (single doc)

```json
{
  "id": "settings",
  "scoringWeights": { "segment": 0.3, "intent": 0.3, "recency": 0.15, "platform": 0.1, "credibility": 0.1, "verification": 0.05 },
  "limits": { "maxSelectionPerEnrichment": 500 },
  "export": { "csv": true }
}
```

---

# 7) Acceptance criteria

* **A1** Frontend lists Leadsets using **FN7 SDK's `searchFirebaseData()`**; **no create** control exists
* **A2** Opening a Leadset triggers backend API call; items update via **FN7 SDK listeners**
* **A3** User can **filter** & **select** rows; **Unlock contact details** calls backend for enrichment
* **A4** Frontend shows cost estimates; enrichment can be cancelled
* **A5** Data flows: Backend → Firebase (via FN7 SDK) → Frontend (via FN7 SDK listeners)
* **A6** CSV export uses FN7 SDK: data retrieval via `searchFirebaseData()`, storage via `uploadToStorage()`
* **A7** Width/spacing matches Engagement Strategies column (~1200px max width)
* **A8** UI follows FN7 design guidelines:
  * Light theme with #FFFFFF backgrounds
  * Sora font family throughout
  * Scout brand gradient (`linear-gradient(to right, #ff482ccc, #a245eecc)`) for primary CTAs
  * Material Icons only (no emojis)
  * Specific color palette (primary, accent, error colors)
  * No scrolling on single-view pages
* **A9** Only Exa API key on backend; Firebase config for FN7 SDKs on both tiers
* **A10** Both frontend and backend use JavaScript only (no TypeScript)
* **A11** No authentication except **Exa webhook signature validation** (HMAC SHA256)
* **A12** Exa webhooks properly secured with signature verification
* **A13** **All Firebase operations use FN7 SDKs** - no direct Firebase SDK usage allowed
* **A14** **All file storage operations** (CSV exports, logs, any media) use FN7 SDK's Storage functions

---

# 8) Environment & deployment

* **Frontend (React + JavaScript):** 
  * Firebase config via env vars for FN7 SDK initialization
  * FN7 Frontend SDK loaded from CDN or ES modules
  * localStorage setup for `user_context` and `app_context` (as per FN7 SDK requirements)
  * **UI Dependencies:**
    - Sora font from Google Fonts
    - Material Icons library
    - Light theme CSS variables
  * No Exa API keys
* **Backend (Node.js + JavaScript):**
  * `EXA_API_KEY` via ENV variable
  * `EXA_WEBHOOK_SECRET` via ENV variable (for webhook signature validation)
  * Firebase config for FN7 Backend SDK initialization
  * FN7 Backend SDK (Node.js JavaScript version) for all Firebase operations
  * No authentication middleware needed (except for Exa webhook signature)
* **Webhooks:** `POST /webhooks/exa` endpoint with **Exa signature validation** (HMAC SHA256)
* **Firebase:** Developers set up their own Firebase project; access only via FN7 SDKs
* **Storage:** Firebase Storage bucket configured; all file operations via FN7 SDK Storage functions

ProjectSpec.md
Displaying ProjectSpec.md.
