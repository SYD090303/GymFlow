import React from 'react';
import Spinner from './Spinner';

/** Fullscreen loading overlay */
export default function LoadingScreen({ label = 'Loading…' }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/70 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <div className="text-sm text-gray-600">{label}</div>
      </div>
    </div>
  );
}
