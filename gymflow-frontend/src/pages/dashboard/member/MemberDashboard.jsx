import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getMemberByEmail } from '../../../services/memberService';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import { listByMember } from '../../../services/attendanceService';
import { formatDate, formatTime } from '../../../utils/date';

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
  const [attendance, setAttendance] = useState([]);
  const [attLoading, setAttLoading] = useState(false);
  const email = user?.sub || user?.username || user?.email; // JWT subject is email per backend

  useEffect(() => {
    const load = async () => {
      if (!email) { setLoading(false); return; }
      try {
        const data = await getMemberByEmail(email);
        setMe(data);
        if (data?.id) {
          setAttLoading(true);
          try {
            const logs = await listByMember(data.id);
            setAttendance(Array.isArray(logs) ? logs : []);
          } finally {
            setAttLoading(false);
          }
        }
      } catch (e) {
        console.error('Failed to load member profile', e);
        toast.error(extractErrorMessage(e, 'Failed to load your profile'));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [email]);

  const last7DaysCount = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return attendance.filter(a => new Date(a.checkInTime) >= sevenDaysAgo).length;
  }, [attendance]);

  const expiryBadge = useMemo(() => {
    if (!me?.endDate) return null;
    const end = new Date(me.endDate);
    const today = new Date();
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    if ((me.membershipStatus || '').toUpperCase() === 'EXPIRED' || diffDays < 0) {
      return <span className="ml-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">Expired</span>;
    }
    if (diffDays <= 7) {
      return <span className="ml-2 text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Ends in {diffDays}d</span>;
    }
    return null;
  }, [me]);

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
              <li><span className="text-gray-500">Start Date:</span> {formatDate(me.startDate) ?? '-'}</li>
              <li><span className="text-gray-500">End Date:</span> {formatDate(me.endDate) ?? '-'} {expiryBadge}</li>
              <li><span className="text-gray-500">Status:</span> {me.membershipStatus ?? '-'}</li>
            </ul>
          </Box>
          <Box title="Payments">
            <ul className="text-sm text-gray-700 space-y-1">
              <li><span className="text-gray-500">Outstanding:</span> {me.outstandingBalance != null ? `₹${me.outstandingBalance}` : '—'}</li>
              <li><span className="text-gray-500">Last Payment:</span> {me.lastPaymentDate ?? '—'}</li>
            </ul>
          </Box>
          <Box title="Attendance">
            {attLoading ? (
              <div className="text-sm text-gray-600">Loading attendance…</div>
            ) : attendance.length === 0 ? (
              <div className="text-sm text-gray-600">No attendance records yet.</div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border bg-gray-50">
                    <div className="text-xs text-gray-500">Last 7 days</div>
                    <div className="text-xl font-semibold">{last7DaysCount}</div>
                  </div>
                  <div className="p-3 rounded-lg border bg-gray-50">
                    <div className="text-xs text-gray-500">Total records</div>
                    <div className="text-xl font-semibold">{attendance.length}</div>
                  </div>
                </div>
                <div className="max-h-64 overflow-auto border rounded-md">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr className="text-gray-600">
                        <th className="text-left font-medium px-3 py-2">Date</th>
                        <th className="text-left font-medium px-3 py-2">Check-in</th>
                        <th className="text-left font-medium px-3 py-2">Check-out</th>
                        <th className="text-left font-medium px-3 py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.slice(0, 12).map((a) => (
                        <tr key={a.id} className="border-t">
                          <td className="px-3 py-1.5">{formatDate(a.checkInTime)}</td>
                          <td className="px-3 py-1.5">{formatTime(a.checkInTime)}</td>
                          <td className="px-3 py-1.5">{a.checkOutTime ? formatTime(a.checkOutTime) : '—'}</td>
                          <td className="px-3 py-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full border text-xs bg-white">
                              {a.attendanceStatus || 'PRESENT'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Box>
        </div>
      )}
    </div>
  );
};

export default MemberDashboard;
