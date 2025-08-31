import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome,
  FiUsers,
  FiLogIn,
  FiUserCheck,
  FiLayers,
  FiSettings,
  FiBell,
} from 'react-icons/fi';

const adminNavs = [
  { name: 'Overview', path: '/dashboard', icon: <FiHome /> },
  { name: 'Members', path: '/dashboard/members', icon: <FiUsers /> },
  { name: 'Check-in/Check-out', path: '/dashboard/check-in', icon: <FiLogIn /> },
  { name: 'Receptionists', path: '/dashboard/receptionists', icon: <FiUserCheck /> },
  { name: 'Membership Plans', path: '/dashboard/plans', icon: <FiLayers /> },
  { name: 'Notifications', path: '/dashboard/notifications', icon: <FiBell /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings /> },
];

const receptionistNavs = [
  { name: 'Overview', path: '/dashboard/receptionist', icon: <FiHome /> },
  { name: 'Members', path: '/dashboard/members', icon: <FiUsers /> },
  { name: 'Check-in/Check-out', path: '/dashboard/check-in', icon: <FiLogIn /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings /> },
];

const memberNavs = [
  { name: 'My Dashboard', path: '/dashboard/member', icon: <FiHome /> },
  { name: 'Settings', path: '/dashboard/settings', icon: <FiSettings /> },
];

const NavItem = ({ item }) => (
  <NavLink
    to={item.path}
    end={item.path === '/dashboard'}
    className={({ isActive }) =>
      [
        'group flex items-center gap-3 px-4 py-2.5 rounded-lg mx-3 my-1 text-sm transition-colors',
        'border border-transparent',
        isActive
          ? 'bg-indigo-50 text-indigo-700 border-indigo-100 shadow-sm'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
      ].join(' ')
    }
  >
    <span className="w-5 h-5 grid place-items-center text-current opacity-90">{item.icon}</span>
    <span className="font-medium tracking-tight">{item.name}</span>
    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 opacity-0 group-[.active]:opacity-100" />
  </NavLink>
);

const SidebarNav = ({ role }) => {
  const isAdmin = role === 'ADMIN' || role === 'OWNER';
  const navs = role === 'MEMBER' ? memberNavs : (isAdmin ? adminNavs : receptionistNavs);

  return (
    <nav className="mt-4">
      <div className="px-4 py-2 text-[11px] uppercase tracking-wider text-gray-400">Navigation</div>
      {navs.map((item) => (
        <NavItem key={item.name} item={item} />
      ))}
    </nav>
  );
};

export default SidebarNav;
