import React from 'react';

const SkeletonRow = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-3">
        <div className="h-4 bg-gray-200/70 rounded animate-pulse" />
      </td>
    ))}
  </tr>
);

const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  return (
    <tbody className="divide-y">
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </tbody>
  );
};

export default SkeletonTable;
