import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import SidebarNav from './SidebarNav';
import UserProfile from './UserProfile';

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="flex flex-col w-64 h-full bg-white/95 backdrop-blur border-r border-gray-100">
      <div className="h-16 flex items-center px-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white grid place-items-center font-bold shadow-sm">GF</div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Gym Flow</h1>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {user && <SidebarNav role={user.role} />}
      </div>
      <div className="p-3 border-t border-gray-100">
        {user && <UserProfile user={user} />}
      </div>
    </aside>
  );
};

export default Sidebar;
