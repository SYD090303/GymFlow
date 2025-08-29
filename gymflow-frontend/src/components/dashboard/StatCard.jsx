import React from 'react';

const StatCard = ({ title, value, icon }) => {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-md transition border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
        </div>
        <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 grid place-items-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
