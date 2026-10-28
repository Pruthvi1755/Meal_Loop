import React from 'react';

/**
 * Apple-inspired Solid Badge
 */
export default function Badge({
  children,
  variant = 'neutral', // 'primary' | 'food' | 'success' | 'warning' | 'error' | 'neutral'
  icon: Icon,
  className = '',
  ...props
}) {
  return (
    <span className={`badge badge-${variant} ${className}`} {...props}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
}
