import React from 'react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getMemberByEmail } from '../../../services/memberService';

const Box = ({ title, children }) => (
  <div className="bg-white rounded-lg shadow p-4">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {children}
  </div>
);

const MemberDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState(null);
  const email = user?.sub || user?.username || user?.email; // JWT subject is email per backend

  useEffect(() => {
    const load = async () => {
      if (!email) { setLoading(false); return; }
      try {
        const data = await getMemberByEmail(email);
        setMe(data);
      } catch (e) {
        console.error('Failed to load member profile', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email]);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Member Dashboard</h1>

      {loading ? (
        <div className="text-sm text-gray-600">Loading your profile…</div>
      ) : !me ? (
        <div className="text-sm text-gray-600">We couldn't find your member record.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Box title="My Membership">
            <ul className="text-sm text-gray-700 space-y-1">
              <li><span className="text-gray-500">Plan:</span> {me.membershipPlan?.name ?? me.membershipPlan?.planType ?? '-'}</li>
              <li><span className="text-gray-500">Duration:</span> {me.membershipPlan?.durationMonths ? `${me.membershipPlan.durationMonths} months` : me.duration || '-'}</li>
              <li><span className="text-gray-500">Price:</span> {me.membershipPlan?.price != null ? `₹${me.membershipPlan.price}` : '-'}</li>
              <li><span className="text-gray-500">Start Date:</span> {me.startDate ?? '-'}</li>
              <li><span className="text-gray-500">End Date:</span> {me.endDate ?? '-'}</li>
              <li><span className="text-gray-500">Status:</span> {me.membershipStatus ?? '-'}</li>
            </ul>
          </Box>
          <Box title="Payments">
            <ul className="text-sm text-gray-700 space-y-1">
              <li><span className="text-gray-500">Outstanding:</span> {me.outstandingBalance != null ? `₹${me.outstandingBalance}` : '—'}</li>
              <li><span className="text-gray-500">Last Payment:</span> {me.lastPaymentDate ?? '—'}</li>
            </ul>
          </Box>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
