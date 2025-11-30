import React from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../theme.js';

function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', loading = false }) {
    if (!isOpen) return null;

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
        marginBottom: spacing['2xl'],
        color: colors.secondary,
        fontSize: typography.sizes.base,
        lineHeight: '1.5'
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
                    <h2 style={titleStyle}>{title}</h2>
                    <button style={closeButtonStyle} onClick={onClose}>
                        <span className="material-icons">close</span>
                    </button>
                </div>

                <div style={contentStyle}>
                    {message}
                </div>

                <div style={buttonContainerStyle}>
                    <button style={cancelButtonStyle} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button style={confirmButtonStyle} onClick={onConfirm} disabled={loading}>
                        {loading ? 'Processing...' : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmationModal;
