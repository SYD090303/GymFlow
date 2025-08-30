import React from 'react';

const SectionCard = ({ title, actions, children, className = '' }) => {
  return (
    <div className={`relative rounded-2xl border border-white/10 bg-white/60 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.08)] ${className}`}>
      <div className="px-4 md:px-5 py-3 border-b border-white/20 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className="p-4 md:p-5">
        {children}
      </div>
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/40" />
    </div>
  );
};

export default SectionCard;
