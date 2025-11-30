import React from 'react';
import { useNavigate } from 'react-router-dom';
import { colors, typography, spacing, shadows, borderRadius } from '../theme.js';

function LeadsetCard({ leadset }) {
    const navigate = useNavigate();
    const [isHovered, setIsHovered] = React.useState(false);

    const handleOpen = () => {
        navigate(`/leadsets/${leadset.id}`);
    };

    const cardStyle = {
        backgroundColor: isHovered ? colors.bgSecondary : colors.bgPrimary,
        border: `1px solid ${colors.borderLight}`,
        borderRadius: borderRadius.md,
        padding: spacing['2xl'],
        fontFamily: typography.fontFamily,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isHovered ? shadows.md : shadows.sm,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    };

    const titleStyle = {
        color: colors.primary,
        fontSize: typography.sizes.lg,
        fontWeight: typography.weights.semibold,
        marginBottom: spacing.md,
        lineHeight: '1.4'
    };

    const descriptionStyle = {
        color: colors.secondary,
        fontSize: typography.sizes.sm,
        marginBottom: spacing.lg,
        lineHeight: '1.5',
        flex: 1
    };

    const chipContainerStyle = {
        display: 'flex',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.lg
    };

    const chipStyle = {
        backgroundColor: colors.bgTertiary,
        color: colors.secondary,
        padding: `${spacing.xs} ${spacing.md}`,
        borderRadius: borderRadius.sm,
        fontSize: typography.sizes.xs,
        fontWeight: typography.weights.normal
    };

    const intentChipStyle = {
        ...chipStyle,
        backgroundColor: '#E3F2FD',
        color: colors.accentBlue
    };

    const countStyle = {
        marginTop: spacing.lg,
        marginBottom: spacing.lg,
        color: colors.primary,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.bold
    };

    const buttonStyle = {
        width: '100%',
        padding: spacing.lg,
        background: colors.scoutGradient,
        color: '#FFFFFF',
        border: 'none',
        borderRadius: borderRadius.base,
        fontFamily: typography.fontFamily,
        fontSize: typography.sizes.base,
        fontWeight: typography.weights.semibold,
        cursor: 'pointer',
        transition: 'opacity 0.2s ease',
        opacity: isHovered ? 0.9 : 1
    };

    return (
        <div
            style={cardStyle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <h3 style={titleStyle}>{leadset.name}</h3>

            <p style={descriptionStyle}>{leadset.description}</p>

            {/* Segment Chips */}
            <div style={chipContainerStyle}>
                <span style={chipStyle}>
                    {leadset.segment.segment_archetype}
                </span>
                <span style={chipStyle}>
                    {leadset.segment.geo_region}
                </span>
                <span style={chipStyle}>
                    {leadset.segment.firmographic_company_size}
                </span>
            </div>

            {/* Intent Badges */}
            {leadset.intent.signals.length > 0 && (
                <div style={chipContainerStyle}>
                    {leadset.intent.signals.slice(0, 3).map((signal, idx) => (
                        <span key={idx} style={intentChipStyle}>
                            {signal.replace(/_/g, ' ')}
                        </span>
                    ))}
                </div>
            )}

            {/* Count & Status */}
            <div style={countStyle}>
                <span className="material-icons" style={{ fontSize: '16px', verticalAlign: 'middle', marginRight: '4px' }}>
                    people
                </span>
                ~{leadset.est_count} buyers
            </div>

            {/* Open Button */}
            <button onClick={handleOpen} style={buttonStyle}>
                Open
            </button>
        </div>
    );
}

export default LeadsetCard;