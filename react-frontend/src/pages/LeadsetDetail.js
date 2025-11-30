import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import sdk from '../sdk';
import API from '../utils/api';
import LeadsetTable from '../components/LeadsetTable';
import UnlockModal from '../components/UnlockModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { colors, typography, spacing, borderRadius } from '../theme.js';

function LeadsetDetail() {
    const { leadsetId } = useParams();
    const navigate = useNavigate();

    // State
    const [leadset, setLeadset] = useState(null);
    const [run, setRun] = useState(null);
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [runStarting, setRunStarting] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(false);
    const [showRestartModal, setShowRestartModal] = useState(false);
    const [enriching, setEnriching] = useState(false);
    const [error, setError] = useState(null);

    // Refs
    const initialized = useRef(false);

    // Load initial data on mount
    useEffect(() => {
        if (initialized.current) return;
        initialized.current = true;

        loadData();

        // Cleanup listeners on unmount
        return () => {
            // FN7 SDK should handle cleanup internally
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [leadsetId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Step 1: Load leadset using FN7 SDK
            const leadsetData = await sdk.getFirebaseData('leadsets', leadsetId);

            if (!leadsetData) {
                setError('Leadset not found');
                return;
            }

            setLeadset(leadsetData);

            // Step 2: Check for existing runs (get latest one)
            const existingRuns = await sdk.searchFirebaseData({
                doc_type: 'leadsetRuns',
                leadsetId: leadsetId
            }, 100); // SDK doesn't support sorting in search yet, so we sort client-side

            // Sort by startedAt desc
            const sortedRuns = existingRuns?.sort((a, b) => {
                return new Date(b.startedAt || 0) - new Date(a.startedAt || 0);
            }) || [];

            const latestRun = sortedRuns[0];

            if (latestRun) {
                // Use existing run regardless of status
                console.log('Using existing run:', latestRun.id, latestRun.status);
                setRun(latestRun);
                await loadRunItems(latestRun.id);
                setupRealtimeListeners(latestRun.id);
            } else {
                // No runs exist at all, start a new one
                console.log('No existing runs, starting new one');
                await startNewRun();
            }
        } catch (error) {
            console.error('Error loading data:', error);
            setError('Failed to load leadset details');
        } finally {
            setLoading(false);
        }
    };

    const loadRunItems = async (runId, runData = null) => {
        try {
            // Check if run has itemIds (new method)
            // Use provided runData if available, otherwise check state or fetch
            let currentRun = runData;
            if (!currentRun) {
                currentRun = run && run.id === runId ? run : await sdk.getFirebaseData('leadsetRuns', runId);
            }

            if (currentRun && currentRun.itemIds && currentRun.itemIds.length > 0) {
                const itemPromises = currentRun.itemIds.map(itemId =>
                    sdk.getFirebaseData(`leadsetRuns/${runId}/items`, itemId)
                );
                const itemsData = await Promise.all(itemPromises);
                // Filter out nulls if any fetch failed
                const validItems = itemsData.filter(i => i);
                setItems(validItems);
            } else {
                // Fallback to search (legacy method)
                const itemsPath = `leadsetRuns/${runId}/items`;
                const itemsData = await sdk.searchFirebaseData({ doc_type: itemsPath }, 100);
                setItems(itemsData || []);
            }
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const startNewRun = async () => {
        try {
            setRunStarting(true);

            // Call backend API to start run
            const response = await API.startRun(leadsetId);

            if (response.runId) {
                setRun({
                    id: response.runId,
                    leadsetId: leadsetId,
                    websetId: response.websetId,
                    status: response.status,
                    counters: { found: 0, enriched: 0, selected: 0 }
                });

                // Set up real-time listeners for the new run
                setupRealtimeListeners(response.runId);
            }
        } catch (error) {
            console.error('Error starting run:', error);
            setError('Failed to start search. Please try again.');
        } finally {
            setRunStarting(false);
        }
    };

    const setupRealtimeListeners = (runId) => {
        // Listener 1: Listen for items updates using FN7 SDK
        const itemsPath = `leadsetRuns/${runId}/items`;

        const itemsSub = sdk.startFirebaseListener(itemsPath, {})
            .subscribe((updatedItems) => {
                console.log('Items updated in real-time:', updatedItems?.length || 0);
                if (updatedItems) {
                    setItems(updatedItems);
                }
            });

        // Listener 2: Listen for run status updates
        // Pass runId as string, not object
        const runSub = sdk.startFirebaseListener('leadsetRuns', runId)
            .subscribe((updatedRun) => {
                if (updatedRun) {
                    console.log('Run status updated:', updatedRun.status);
                    setRun(updatedRun);

                    // Trigger item load if itemIds are present
                    // This ensures we fetch items when the run completes and populates itemIds
                    if (updatedRun.itemIds && updatedRun.itemIds.length > 0) {
                        loadRunItems(updatedRun.id, updatedRun);
                    }
                }
            });

        // Polling for Local Dev (Sync with Exa)
        // If running but no items found after 5s, try to sync
        // const pollInterval = setInterval(async () => {
        //     if (runId && items.length === 0) {
        //         try {
        //             console.log('Polling for Exa results (Local Dev Sync)...');
        //             // await API.syncRun(leadsetId, runId);
        //         } catch (e) {
        //             console.warn('Sync failed:', e);
        //         }
        //     }
        // }, 5000);

        // Cleanup function
        // return () => {
        //     if (itemsSub && itemsSub.unsubscribe) itemsSub.unsubscribe();
        //     if (runSub && runSub.unsubscribe) runSub.unsubscribe();
        //     clearInterval(pollInterval);
        // };
    };

    // Selection handlers
    const handleSelectItem = (itemId) => {
        setSelectedItems(prev => {
            if (prev.includes(itemId)) {
                return prev.filter(id => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    const handleSelectAll = (selectAll) => {
        if (selectAll) {
            const allItemIds = items.map(item => item.itemId);
            setSelectedItems(allItemIds);
        } else {
            setSelectedItems([]);
        }
    };

    // Unlock modal handlers
    const handleUnlockClick = () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one buyer');
            return;
        }
        setShowUnlockModal(true);
    };

    const handleConfirmEnrich = async () => {
        if (!run || !run.id) {
            alert('No active run found');
            return;
        }

        try {
            setEnriching(true);

            // Call backend API to enrich contacts
            const response = await API.enrichContacts(
                leadsetId,
                run.id,
                selectedItems,
                ['email', 'phone', 'linkedin_url']
            );

            console.log('Enrichment started:', response);

            alert(`Enrichment started for ${selectedItems.length} buyers! Contact details will appear shortly.`);

            // Close modal and clear selection
            setShowUnlockModal(false);
            setSelectedItems([]);
        } catch (error) {
            console.error('Enrichment error:', error);
            alert('Failed to start enrichment. Please try again.');
        } finally {
            setEnriching(false);
        }
    };

    // CSV download handler
    const handleDownloadCSV = async () => {
        if (!run || !run.id) {
            alert('No run data available');
            return;
        }

        if (items.length === 0) {
            alert('No items to export');
            return;
        }

        try {
            const response = await API.exportRunCSV(leadsetId, run.id);

            if (response.url) {
                // Open download URL in new tab
                window.open(response.url, '_blank');
            } else {
                alert('CSV export failed. Please try again.');
            }
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export CSV. Please try again.');
        }
    };

    // Restart run handler
    const handleRestartRun = () => {
        setShowRestartModal(true);
    };

    const confirmRestartRun = async () => {
        setShowRestartModal(false);
        await startNewRun();
    };

    // ==================== STYLES ====================

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: spacing['3xl'],
        fontFamily: typography.fontFamily
    };

    const headerStyle = {
        marginBottom: spacing['3xl']
    };

    const backButtonStyle = {
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.sm,
        padding: `${spacing.sm} ${spacing.lg}`,
        backgroundColor: 'transparent',
        color: colors.secondary,
        border: 'none',
        cursor: 'pointer',
        fontSize: typography.sizes.sm,
        fontFamily: typography.fontFamily,
        marginBottom: spacing.lg,
        transition: 'color 0.2s ease'
    };

    const titleStyle = {
        color: colors.primary,
        fontSize: typography.sizes['2xl'],
        fontWeight: typography.weights.bold,
        marginBottom: spacing.lg
    };

    const statsContainerStyle = {
        display: 'flex',
        gap: spacing['2xl'],
        marginBottom: spacing['2xl'],
        flexWrap: 'wrap'
    };

    const statCardStyle = {
        backgroundColor: colors.bgPrimary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        flex: '1 1 200px',
        minWidth: '150px'
    };

    const statLabelStyle = {
        color: colors.secondary,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.sm,
        fontWeight: typography.weights.normal
    };

    const statValueStyle = {
        color: colors.primary,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.bold
    };

    const statusBadgeStyle = (status) => {
        const baseStyle = {
            display: 'inline-block',
            padding: `${spacing.xs} ${spacing.md}`,
            borderRadius: borderRadius.sm,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            textTransform: 'capitalize'
        };

        switch (status) {
            case 'running':
                return { ...baseStyle, backgroundColor: '#E3F2FD', color: colors.accentBlue };
            case 'enriching':
                return { ...baseStyle, backgroundColor: '#FFF3E0', color: '#E65100' };
            case 'idle':
                return { ...baseStyle, backgroundColor: '#E8F5E9', color: '#2E7D32' };
            case 'failed':
                return { ...baseStyle, backgroundColor: '#FFEBEE', color: colors.error };
            default:
                return { ...baseStyle, backgroundColor: colors.bgTertiary, color: colors.secondary };
        }
    };

    const toolbarStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl'],
        padding: spacing.lg,
        backgroundColor: colors.bgPrimary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: borderRadius.md,
        flexWrap: 'wrap',
        gap: spacing.md
    };

    const buttonPrimaryStyle = {
        padding: `${spacing.md} ${spacing['2xl']}`,
        background: colors.scoutGradient,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: borderRadius.base,
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing.sm,
        transition: 'opacity 0.2s ease'
    };

    const buttonSecondaryStyle = {
        ...buttonPrimaryStyle,
        background: colors.bgTertiary,
        color: colors.primary
    };

    const buttonDisabledStyle = {
        ...buttonPrimaryStyle,
        opacity: 0.5,
        cursor: 'not-allowed'
    };

    const loadingContainerStyle = {
        textAlign: 'center',
        padding: spacing['4xl'],
        color: colors.secondary
    };

    const errorContainerStyle = {
        textAlign: 'center',
        padding: spacing['4xl'],
        color: colors.error,
        backgroundColor: '#FFEBEE',
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.error}`
    };

    // ==================== RENDER ====================

    // Loading state
    if (loading) {
        return (
            <div style={containerStyle}>
                <div style={loadingContainerStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        hourglass_empty
                    </span>
                    <div style={{ fontSize: typography.sizes.lg }}>Loading leadset...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error || !leadset) {
        return (
            <div style={containerStyle}>
                <div style={errorContainerStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        error_outline
                    </span>
                    <div style={{ fontSize: typography.sizes.lg, marginBottom: spacing.md }}>
                        {error || 'Leadset not found'}
                    </div>
                    <button
                        style={{ ...buttonSecondaryStyle, marginTop: spacing.lg }}
                        onClick={() => navigate('/')}
                    >
                        <span className="material-icons">arrow_back</span>
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Main content
    return (
        <div style={containerStyle}>
            {/* Header */}
            <header style={headerStyle}>
                <button
                    style={backButtonStyle}
                    onClick={() => navigate('/')}
                    onMouseEnter={(e) => e.target.style.color = colors.primary}
                    onMouseLeave={(e) => e.target.style.color = colors.secondary}
                >
                    <span className="material-icons" style={{ fontSize: '20px' }}>arrow_back</span>
                    Back to Dashboard
                </button>

                <h1 style={titleStyle}>{leadset.name}</h1>

                {/* Stats Cards */}
                <div style={statsContainerStyle}>
                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                search
                            </span>
                            Found
                        </div>
                        <div style={statValueStyle}>
                            {run?.counters?.found || 0}
                        </div>
                    </div>

                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                verified
                            </span>
                            Enriched
                        </div>
                        <div style={statValueStyle}>
                            {run?.counters?.enriched || 0}
                        </div>
                    </div>

                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                check_circle
                            </span>
                            Selected
                        </div>
                        <div style={statValueStyle}>
                            {selectedItems.length}
                        </div>
                    </div>

                    <div style={statCardStyle}>
                        <div style={statLabelStyle}>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                info
                            </span>
                            Status
                        </div>
                        <div>
                            <span style={statusBadgeStyle(run?.status || 'idle')}>
                                {run?.status || 'idle'}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Toolbar */}
            <div style={toolbarStyle}>
                <div style={{ color: colors.secondary, fontSize: typography.sizes.sm, fontWeight: typography.weights.semibold }}>
                    {selectedItems.length > 0 ? (
                        <>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                check_box
                            </span>
                            {selectedItems.length} buyer{selectedItems.length !== 1 ? 's' : ''} selected
                        </>
                    ) : (
                        <>
                            <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.xs }}>
                                list
                            </span>
                            {items.length} buyer{items.length !== 1 ? 's' : ''} found
                        </>
                    )}
                </div>

                <div style={{ display: 'flex', gap: spacing.md, flexWrap: 'wrap' }}>
                    <button
                        style={items.length === 0 ? buttonDisabledStyle : buttonSecondaryStyle}
                        onClick={handleDownloadCSV}
                        disabled={items.length === 0}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>download</span>
                        Download CSV
                    </button>

                    <button
                        style={selectedItems.length === 0 ? buttonDisabledStyle : buttonPrimaryStyle}
                        onClick={handleUnlockClick}
                        disabled={selectedItems.length === 0}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>lock_open</span>
                        Unlock Contact Details
                    </button>

                    <button
                        style={runStarting ? buttonDisabledStyle : buttonSecondaryStyle}
                        onClick={handleRestartRun}
                        disabled={runStarting}
                    >
                        <span className="material-icons" style={{ fontSize: '18px' }}>refresh</span>
                        Restart Run
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {runStarting ? (
                <div style={loadingContainerStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg, animation: 'spin 2s linear infinite' }}>
                        search
                    </span>
                    <div style={{ fontSize: typography.sizes.lg }}>
                        Starting search for buyers...
                    </div>
                    <div style={{ fontSize: typography.sizes.sm, color: colors.secondary, marginTop: spacing.md }}>
                        This may take a few moments
                    </div>
                </div>
            ) : items.length === 0 && run?.status === 'running' ? (
                <div style={loadingContainerStyle}>
                    <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                        pending
                    </span>
                    <div style={{ fontSize: typography.sizes.lg }}>
                        Searching for buyers...
                    </div>
                    <div style={{ fontSize: typography.sizes.sm, color: colors.secondary, marginTop: spacing.md }}>
                        Results will appear here as they're found
                    </div>
                </div>
            ) : (
                <LeadsetTable
                    items={items}
                    selectedItems={selectedItems}
                    onSelectItem={handleSelectItem}
                    onSelectAll={handleSelectAll}
                />
            )}

            {/* Unlock Modal */}
            <UnlockModal
                isOpen={showUnlockModal}
                onClose={() => setShowUnlockModal(false)}
                selectedCount={selectedItems.length}
                onConfirm={handleConfirmEnrich}
                loading={enriching}
            />

            {/* Restart Confirmation Modal */}
            <ConfirmationModal
                isOpen={showRestartModal}
                onClose={() => setShowRestartModal(false)}
                onConfirm={confirmRestartRun}
                title="Restart Search"
                message="Are you sure you want to restart the search? This will start a new run and may take a few moments."
                confirmText="Restart Run"
            />

            {/* Add spinning animation for loading icon */}
            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default LeadsetDetail;