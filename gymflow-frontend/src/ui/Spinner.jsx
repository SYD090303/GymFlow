import React from 'react';

/**
 * Generic spinner component.
 * Props:
 * - size: 'sm' | 'md' | 'lg' | number (px)
 * - label?: optional text shown next to the spinner
 * - className?: extra classes
 */
export default function Spinner({ size = 'md', label, className = '' }) {
  const preset = {
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-4',
  }[size] || '';

  const customSize = typeof size === 'number' ? { width: size, height: size, borderWidth: Math.max(2, Math.round(size / 8)) } : null;

  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite" aria-busy="true">
      <span
        className={`inline-block animate-spin rounded-full border-solid border-gray-300 border-t-indigo-600 ${preset}`}
        style={customSize || undefined}
      />
      {label ? <span className="text-sm text-gray-500">{label}</span> : <span className="sr-only">Loading…</span>}
    </div>
  );
}
