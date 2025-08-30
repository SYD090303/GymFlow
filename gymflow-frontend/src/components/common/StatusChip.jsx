import React from 'react';

const palette = {
  ACTIVE: {
    base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  EXPIRED: {
    base: 'bg-rose-50 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  PENDING: {
    base: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  DEFAULT: {
    base: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-400',
  },
};

const StatusChip = ({ status }) => {
  const key = status && palette[status] ? status : 'DEFAULT';
  const { base, dot } = palette[key];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${base}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status || '-'}
    </span>
  );
};

export default StatusChip;
