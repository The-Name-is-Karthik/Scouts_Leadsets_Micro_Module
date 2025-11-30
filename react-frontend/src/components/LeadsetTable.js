import React from 'react';
import { colors, typography, spacing, borderRadius } from '../theme.js';

function LeadsetTable({ items, selectedItems, onSelectItem, onSelectAll }) {
    const tableContainerStyle = {
        backgroundColor: colors.bgPrimary,
        borderRadius: borderRadius.md,
        border: `1px solid ${colors.borderLight}`,
        overflow: 'hidden'
    };

    const tableStyle = {
        width: '100%',
        borderCollapse: 'collapse',
        fontFamily: typography.fontFamily
    };

    const headerStyle = {
        backgroundColor: colors.bgTertiary,
        borderBottom: `1px solid ${colors.borderLight}`
    };

    const thStyle = {
        padding: spacing.lg,
        textAlign: 'left',
        color: colors.primary,
        fontSize: typography.sizes.sm,
        fontWeight: typography.weights.semibold,
        whiteSpace: 'nowrap'
    };

    const getRowStyle = (isHovered) => ({
        backgroundColor: isHovered ? colors.bgSecondary : colors.bgPrimary,
        borderBottom: `1px solid ${colors.borderLight}`,
        transition: 'background-color 0.15s ease'
    });

    const tdStyle = {
        padding: spacing.lg,
        fontSize: typography.sizes.sm,
        color: colors.primary
    };

    const checkboxStyle = {
        width: '18px',
        height: '18px',
        cursor: 'pointer',
        accentColor: colors.accentBlue
    };

    const statusBadgeStyle = (status) => {
        const baseStyle = {
            padding: `${spacing.xs} ${spacing.md}`,
            borderRadius: borderRadius.sm,
            fontSize: typography.sizes.xs,
            fontWeight: typography.weights.semibold,
            display: 'inline-block'
        };

        switch (status) {
            case 'done':
                return { ...baseStyle, backgroundColor: '#E8F5E9', color: '#2E7D32' };
            case 'queued':
            case 'running':
                return { ...baseStyle, backgroundColor: '#FFF3E0', color: '#E65100' };
            case 'failed':
                return { ...baseStyle, backgroundColor: '#FFEBEE', color: colors.error };
            default:
                return { ...baseStyle, backgroundColor: colors.bgTertiary, color: colors.secondary };
        }
    };

    const [hoveredRow, setHoveredRow] = React.useState(null);

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const allSelected = items.length > 0 && items.every(item => selectedItems.includes(item.itemId));

    return (
        <div style={tableContainerStyle}>
            <table style={tableStyle}>
                <thead style={headerStyle}>
                    <tr>
                        <th style={thStyle}>
                            <input
                                type="checkbox"
                                style={checkboxStyle}
                                checked={allSelected}
                                onChange={() => onSelectAll(!allSelected)}
                            />
                        </th>
                        <th style={thStyle}>Company</th>
                        <th style={thStyle}>Domain</th>
                        <th style={thStyle}>Platform</th>
                        <th style={thStyle}>Recency</th>
                        <th style={thStyle}>Email</th>
                        <th style={thStyle}>Phone</th>
                        <th style={thStyle}>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {items.length === 0 ? (
                        <tr>
                            <td colSpan="10" style={{ ...tdStyle, textAlign: 'center', padding: spacing['4xl'], color: colors.secondary }}>
                                <span className="material-icons" style={{ fontSize: '48px', display: 'block', marginBottom: spacing.lg }}>
                                    search_off
                                </span>
                                No items found
                            </td>
                        </tr>
                    ) : (
                        items.map((item) => {
                            const isEnriching = item.enrichment?.status === 'queued' || item.enrichment?.status === 'enriching';
                            const isEnriched = item.enrichment?.status === 'done';
                            const isDisabled = isEnriching || isEnriched;

                            return (
                                <tr
                                    key={item.itemId}
                                    style={getRowStyle(hoveredRow === item.itemId)}
                                    onMouseEnter={() => setHoveredRow(item.itemId)}
                                    onMouseLeave={() => setHoveredRow(null)}
                                >
                                    <td style={tdStyle}>
                                        <input
                                            type="checkbox"
                                            style={{ ...checkboxStyle, cursor: isDisabled ? 'not-allowed' : 'pointer', opacity: isDisabled ? 0.5 : 1 }}
                                            checked={selectedItems.includes(item.itemId)}
                                            onChange={() => !isDisabled && onSelectItem(item.itemId)}
                                            disabled={isDisabled}
                                        />
                                    </td>
                                    <td style={tdStyle}>
                                        {item.entity?.company || 'Unknown'}
                                    </td>
                                    <td style={tdStyle}>
                                        {item.entity?.domain || 'N/A'}
                                    </td>
                                    <td style={tdStyle}>
                                        {item.platform || '-'}
                                    </td>
                                    <td style={tdStyle}>
                                        {formatDate(item.recency)}
                                    </td>
                                    <td style={tdStyle}>
                                        {item.enrichment?.email || '-'}
                                    </td>
                                    <td style={tdStyle}>
                                        {item.enrichment?.phone || '-'}
                                    </td>
                                    <td style={tdStyle}>
                                        <span style={statusBadgeStyle(item.enrichment?.status || 'none')}>
                                            {item.enrichment?.status || 'none'}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default LeadsetTable;