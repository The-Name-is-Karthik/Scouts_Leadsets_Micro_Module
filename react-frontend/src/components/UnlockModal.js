import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../theme.js';

function UnlockModal({ isOpen, onClose, selectedCount, onConfirm, loading }) {
    if (!isOpen) return null;

    const estimatedCost = selectedCount * 0.50; // $0.50 per contact

    const overlayStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        fontFamily: typography.fontFamily
    };

    const modalStyle = {
        backgroundColor: colors.bgPrimary,
        borderRadius: borderRadius.md,
        boxShadow: shadows.lg,
        padding: spacing['3xl'],
        maxWidth: '500px',
        width: '90%'
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing['2xl']
    };

    const titleStyle = {
        color: colors.primary,
        fontSize: typography.sizes.xl,
        fontWeight: typography.weights.semibold
    };

    const closeButtonStyle = {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: spacing.sm,
        color: colors.secondary
    };

    const contentStyle = {
        marginBottom: spacing['2xl']
    };

    const infoRowStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        padding: `${spacing.md} 0`,
        borderBottom: `1px solid ${colors.borderLight}`,
        fontSize: typography.sizes.base
    };

    const labelStyle = {
        color: colors.secondary,
        fontWeight: typography.weights.normal
    };

    const valueStyle = {
        color: colors.primary,
        fontWeight: typography.weights.semibold
    };

    const costStyle = {
        ...valueStyle,
        fontSize: typography.sizes.xl,
        color: colors.accentBlue
    };

    const warningStyle = {
        backgroundColor: '#FFF3E0',
        border: `1px solid #FFB74D`,
        borderRadius: borderRadius.sm,
        padding: spacing.lg,
        marginTop: spacing.lg,
        fontSize: typography.sizes.sm,
        color: '#E65100'
    };

    const buttonContainerStyle = {
        display: 'flex',
        gap: spacing.md,
        justifyContent: 'flex-end'
    };

    const cancelButtonStyle = {
        padding: `${spacing.md} ${spacing['2xl']}`,
        backgroundColor: colors.bgTertiary,
        color: colors.primary,
        border: 'none',
        borderRadius: borderRadius.base,
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer'
    };

    const confirmButtonStyle = {
        padding: `${spacing.md} ${spacing['2xl']}`,
        background: colors.scoutGradient,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: borderRadius.base,
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1
    };

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
                <div style={headerStyle}>
                    <h2 style={titleStyle}>Unlock Contact Details</h2>
                    <button style={closeButtonStyle} onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div style={contentStyle}>
                    <div style={infoRowStyle}>
                        <span style={labelStyle}>Selected buyers</span>
                        <span style={valueStyle}>{selectedCount}</span>
                    </div>

                    <div style={infoRowStyle}>
                        <span style={labelStyle}>Enrichment types</span>
                        <span style={valueStyle}>Email, Phone, LinkedIn</span>
                    </div>

                    <div style={{ ...infoRowStyle, borderBottom: 'none', paddingTop: spacing.xl }}>
                        <span style={{ ...labelStyle, fontSize: typography.sizes.lg }}>Estimated cost</span>
                        <span style={costStyle}>${estimatedCost.toFixed(2)}</span>
                    </div>

                    <div style={warningStyle}>
                        <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: spacing.sm }}>
                            warning
                        </span>
                        This action will charge your account. Contact details will be available immediately after processing.
                    </div>
                </div>

                <div style={buttonContainerStyle}>
                    <button style={cancelButtonStyle} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button style={confirmButtonStyle} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processing...' : `Confirm & Pay $${estimatedCost.toFixed(2)}`}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default UnlockModal;