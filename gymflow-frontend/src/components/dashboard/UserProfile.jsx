import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const UserProfile = ({ user }) => {
  const { logout } = useAuth();

  return (
    <div className="flex items-center">
      <div className="flex-1">
        <p className="font-semibold">{user.firstName}</p>
        <p className="text-sm text-gray-500">{user.role}</p>
      </div>
      <button
        onClick={logout}
        className="ml-4 text-gray-500 hover:text-red-500 transition-colors"
        aria-label="Logout"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
      </button>
    </div>
  );
};

export default UserProfile;
