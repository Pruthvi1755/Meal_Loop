import React from 'react';

/**
 * Subtle Loading Skeleton - Clean, restrained pulse without liquid sheen
 */
export default function LoadingSkeleton({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-sm)',
  className = '',
  style = {}
}) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
}
