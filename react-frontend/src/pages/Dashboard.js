import React, { useState, useEffect } from 'react';
import sdk from '../sdk.js';
import LeadsetCard from '../components/LeadsetCard';
import { colors, typography, spacing } from '../theme.js';

function Dashboard() {
    const [leadsets, setLeadsets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadLeadsets();
    }, []);

    const loadLeadsets = async () => {
        try {
            setLoading(true);

            // Use FN7 SDK to search all leadsets
            // Correct signature: searchFirebaseData(queryConstraints, limit)
            console.log('Fetching leadsets...');
            const data = await sdk.searchFirebaseData({ doc_type: 'leadsets' }, 100);
            console.log('Fetched leadsets:', data);

            setLeadsets(data);
            setError(null);
        } catch (err) {
            console.error('Error loading leadsets:', err);
            setError('Failed to load leadsets. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: spacing['3xl'],
        fontFamily: typography.fontFamily
    };

    const headerStyle = {
        marginBottom: spacing['3xl']
    };

    const titleStyle = {
        color: colors.primary,
        fontSize: typography.sizes['3xl'],
        fontWeight: typography.weights.bold,
        marginBottom: spacing.md
    };

    const subtitleStyle = {
        color: colors.secondary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.normal
    };

    const gridStyle = {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: spacing['2xl'],
        marginTop: spacing['2xl']
    };

    const loadingStyle = {
        textAlign: 'center',
        padding: spacing['4xl'],
        color: colors.secondary,
        fontSize: typography.sizes.lg
    };

    const errorStyle = {
        textAlign: 'center',
        padding: spacing['4xl'],
        color: colors.error,
        fontSize: typography.sizes.base,
        backgroundColor: '#FFEBEE',
        borderRadius: '8px',
        border: `1px solid ${colors.error}`
    };

    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={loadingStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        hourglass_empty
                    </span>
                    Loading leadsets...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={errorStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        error_outline
                    </span>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <header style={headerStyle}>
                <h1 style={titleStyle}>Scout Leadsets</h1>
                <p style={subtitleStyle}>
                    Browse potential customer groups and unlock contact details
                </p>
            </header>

            {leadsets.length === 0 ? (
                <div style={loadingStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        inbox
                    </span>
                    No leadsets available
                </div>
            ) : (
                <div style={gridStyle}>
                    {leadsets.map(leadset => (
                        <LeadsetCard key={leadset.id} leadset={leadset} />
                    ))}
                </div>
            )}
        </div>
    );
}

export default Dashboard;