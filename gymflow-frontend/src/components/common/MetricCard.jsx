import React from 'react';

const MetricCard = ({ icon, label, value, trend, tone = 'emerald' }) => {
  const toneCfg = {
    emerald: ['bg-emerald-50 text-emerald-600', 'text-emerald-700'],
    indigo: ['bg-indigo-50 text-indigo-600', 'text-indigo-700'],
    amber: ['bg-amber-50 text-amber-600', 'text-amber-700'],
    rose: ['bg-rose-50 text-rose-600', 'text-rose-700'],
    sky: ['bg-sky-50 text-sky-600', 'text-sky-700'],
  }[tone] || ['bg-gray-50 text-gray-600', 'text-gray-700'];
  return (
    <div className="rounded-2xl bg-white/70 backdrop-blur-md border border-white/30 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
          <div className={`text-2xl font-semibold ${toneCfg[1]}`}>{value}</div>
          {trend && <div className="text-xs text-gray-500 mt-0.5">{trend}</div>}
        </div>
        <div className={`w-10 h-10 rounded-full grid place-items-center ${toneCfg[0]}`}>{icon}</div>
      </div>
    </div>
  );
};

export default MetricCard;
