import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Overview from './overview/Overview';
import ReceptionistDashboard from './receptionist/ReceptionistDashboard';
import MemberDashboard from './member/MemberDashboard';

const DashboardIndex = () => {
  const { user } = useAuth();
  const role = user?.role;

  if (role === 'RECEPTIONIST') return <ReceptionistDashboard />;
  if (role === 'MEMBER') return <MemberDashboard />;
  // Default to admin/owner overview
  return <Overview />;
};

export default DashboardIndex;
