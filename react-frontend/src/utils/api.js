const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

class API {
    /**
     * Start a new run for a leadset
     */
    static async startRun(leadsetId) {
        const response = await fetch(`${API_BASE_URL}/leadsets/${leadsetId}/run`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to start run: ${response.statusText}`);
        }

        return response.json();
    }

    // /**
    //  * Get all runs for a leadset
    //  */
    // static async getLeadsetRuns(leadsetId) {
    //     const response = await fetch(`${API_BASE_URL}/leadsets/${leadsetId}/runs`);

    //     if (!response.ok) {
    //         throw new Error(`Failed to fetch runs: ${response.statusText}`);
    //     }

    //     return response.json();
    // }

    /**
     * Get run details
     */
    static async getRunDetails(leadsetId, runId) {
        const response = await fetch(`${API_BASE_URL}/leadsets/${leadsetId}/runs/${runId}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch run details: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Enrich selected items
     */
    static async enrichContacts(leadsetId, runId, itemIds, enrichmentTypes = ['email', 'phone', 'linkedin_url']) {
        const response = await fetch(`${API_BASE_URL}/leadsets/${leadsetId}/runs/${runId}/enrich`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                itemIds: itemIds,
                enrichment_types: enrichmentTypes
            })
        });

        if (!response.ok) {
            throw new Error(`Failed to enrich contacts: ${response.statusText}`);
        }

        return response.json();
    }

    /**
     * Export run as CSV
     */
    static async exportRunCSV(leadsetId, runId) {
        const response = await fetch(`${API_BASE_URL}/leadsets/${leadsetId}/runs/${runId}/export`);

        if (!response.ok) {
            throw new Error(`Failed to export CSV: ${response.statusText}`);
        }

        return response.json();
    }

}

export default API;