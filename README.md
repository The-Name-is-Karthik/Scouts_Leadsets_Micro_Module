# Scout Leadsets Micro-Module

This project is a micro-module for the Scout application, designed to manage leadsets, trigger searches via Exa, enrich contact data, and export results.


## UI Screenshot
![UI]("UI_SLMM.png")


## Project Structure

The project consists of two main parts:

-   **`react-frontend/`**: A React-based frontend application.
-   **`python-backend/`**: A Python FastAPI backend application.

## Features

-   **Leadset Management**: View and manage leadsets.
-   **Search Runs**: Trigger new searches (runs) for leadsets using the Exa API.
-   **Enrichment**: Enrich buyer contact details (Email, Phone, LinkedIn) using Exa.
-   **Export**: Export run results to CSV.
-   **Real-time Updates**: The UI updates in real-time as runs process and data is enriched.

## Setup & Installation

### Prerequisites

-   Node.js and npm
-   Python 3.12+
-   Firebase Credentials (`serviceAccountKey.json`)
-   Exa API Key

### Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd python-backend
    ```
2.  Create a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```
3.  Install dependencies:
    ```bash
    # Install fn7-sdk from custom registry
    pip install fn7-sdk --extra-index-url https://fn7.io/.fn7-sdk/python/

    # Install other dependencies
    pip install -r requirements.txt

    cp .env.example .env

    ```
4.  Set up environment variables:
    -   Create a `.env` file based on `.env.example` (if available) or ensure the following are set:
        -   `FIREBASE_SERVICE_ACCOUNT_JSON`: Path to your service account key.
        -   `FIREBASE_STORAGE_BUCKET`: Your Firebase Storage bucket name.
        -   `EXA_API_KEY`: Your Exa API key.
5.  Run the server:
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```

### Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd react-frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Set up environment variables:
    -   Ensure `REACT_APP_BACKEND_URL` is set to `http://localhost:8000`.
4.  Run the application:
    ```bash
    npm start
    ```
    The app will be available at `http://localhost:3000`.

## Usage

1.  Open the dashboard to view available leadsets.
2.  Click "Open" on a leadset to view details.
3.  If no run exists, one will start automatically. You can also click "Restart Run" to trigger a fresh search.
4.  Select items and click "Unlock Contact Details" to enrich them.
5.  Click "Download CSV" to export the data.

## Troubleshooting

-   **Enrichment not working locally?** The backend uses a polling mechanism to bypass webhook limitations on localhost. Ensure the backend process is running and checking for updates.
-   **CSV Export fails?** Check the backend logs for permission errors or bucket configuration issues.
