import React from 'react';

const PageHeader = ({ icon, title, subtitle, children }) => {
  return (
    <div className="mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white grid place-items-center shadow-sm">
          {icon}
        </div>
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
          {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      )}
    </div>
  );
};

export default PageHeader;
