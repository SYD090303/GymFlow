import React from 'react';

const EmptyState = ({ title = 'Nothing here yet', description = 'Try adjusting your filters or add a new item.', action }) => {
  return (
    <div className="text-center py-10 text-gray-600">
      <div className="text-base font-medium">{title}</div>
      {description && <div className="text-sm text-gray-500 mt-1">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};

export default EmptyState;
