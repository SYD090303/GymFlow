import React from 'react';

const AvatarInitial = ({ name = 'U', className = '' }) => {
  const getInitials = (n) => {
    if (!n || typeof n !== 'string') return 'U';
    const parts = n.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };
  const initials = getInitials(name);
  return (
    <div className={`w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 grid place-items-center font-medium ${className}`}>
      {initials}
    </div>
  );
};

export default AvatarInitial;
