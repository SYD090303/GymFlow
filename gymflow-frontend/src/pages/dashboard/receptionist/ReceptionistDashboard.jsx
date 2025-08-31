import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { variants, list } from '../../../ui/motionPresets';
import { Link } from 'react-router-dom';
import { listToday, checkOut as checkOutApi } from '../../../services/attendanceService';
import { getMembers, getMembersEndingBefore } from '../../../services/memberService';
import { getReceptionists } from '../../../services/receptionistService';
import StatCard from '../../../components/dashboard/StatCard';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import { FiRefreshCw, FiLogOut, FiUsers as FiUsersOutline, FiActivity, FiLogIn, FiShield } from 'react-icons/fi';
import { FaUsers, FaUserCheck, FaUserTie, FaUserClock } from 'react-icons/fa';
import AvatarInitial from '../../../components/common/AvatarInitial';
import ConfirmationModal from '../../../components/dashboard/members/ConfirmationModal';
import { formatTime } from '../../../utils/date';
import Spinner from '../../../ui/Spinner';

const Card = ({ title, children }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-100"> 
    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
      <h3 className="text-base font-semibold text-gray-800">{title}</h3>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const ReceptionistDashboard = () => {
  const [todayLogs, setTodayLogs] = useState([]);
  const [members, setMembers] = useState([]);
  const [soonEnding, setSoonEnding] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reloading, setReloading] = useState(false);
  const [stats, setStats] = useState({ totalMembers: 0, activeMembers: 0, receptionists: 0, expiredMemberships: 0 });
  const [confirm, setConfirm] = useState({ open: false, title: '', description: '', onConfirm: null });

  const loadData = async (signal) => {
    setLoading(true);
    const results = await Promise.allSettled([
      listToday(),
      getMembers(),
      getReceptionists(),
    ]);
    if (signal?.aborted) return;

    const logs = results[0].status === 'fulfilled' ? results[0].value : [];
    const allMembers = results[1].status === 'fulfilled' ? results[1].value : [];
    const recs = results[2].status === 'fulfilled' ? results[2].value : [];

    setTodayLogs(Array.isArray(logs) ? logs : []);
    setMembers(Array.isArray(allMembers) ? allMembers : []);

    // Overview-like stats (tolerate missing data)
    const totalMembers = (allMembers || []).length;
    const activeMembers = (allMembers || []).filter(m => m.membershipStatus === 'ACTIVE').length;
    const expiredMemberships = (allMembers || []).filter(m => m.membershipStatus === 'EXPIRED').length;
    const receptionists = Array.isArray(recs) ? recs.length : 0;
    setStats({ totalMembers, activeMembers, receptionists, expiredMemberships });

    // Ending soon (next 7 days) – tolerate failure
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    try {
      const es = await getMembersEndingBefore(in7.toISOString().slice(0, 10));
      if (!signal?.aborted) setSoonEnding(Array.isArray(es) ? es.slice(0, 5) : []);
    } catch {
      if (!signal?.aborted) setSoonEnding([]);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    // Optional periodic refresh every 60s
    const id = setInterval(() => setReloading((r) => !r), 60000);
    return () => { clearInterval(id); controller.abort(); };
  }, []);

  useEffect(() => {
    if (!loading) {
      (async () => {
        try {
          const logs = await listToday();
          setTodayLogs(Array.isArray(logs) ? logs : []);
        } catch { /* ignore timed refresh errors */ }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloading]);

  const memberById = useMemo(() => {
    const map = new Map();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  const openSessions = useMemo(() => todayLogs.filter(l => !l.checkOutTime), [todayLogs]);
  const totalCheckIns = todayLogs.length;
  const totalCheckOuts = todayLogs.filter(l => l.checkOutTime).length;
  // More useful than unique members: new members created today
  const newMembersToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return members.filter(m => {
      const d = m.createdAt || m.startDate;
      return d && new Date(d).toDateString() === todayStr;
    }).length;
  }, [members]);

  const fmtTime = (dt) => formatTime(dt);
  const since = (start) => {
    if (!start) return '-';
    const ms = Date.now() - new Date(start).getTime();
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  const handleCheckOut = (log) => {
    const m = memberById.get(log.memberId);
    const name = m ? `${m.firstName} ${m.lastName || ''}`.trim() : 'member';
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConfirm({
      open: true,
      title: `Check-out ${name}?`,
      description: `This will record a check-out at ${time}.`,
      onConfirm: async () => {
        try {
          await checkOutApi(log.memberId);
          toast.success(`Checked out ${name}`);
          const logs = await listToday();
          setTodayLogs(Array.isArray(logs) ? logs : []);
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Failed to check-out'));
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-md">
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FiShield className="opacity-90" />
              <h1 className="text-xl md:text-2xl font-semibold">Receptionist Overview</h1>
            </div>
            <p className="text-white/90 text-sm mt-1">Track live sessions, today’s attendance, and expiring memberships.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { loadData(); toast.success('Overview refreshed'); }}
              className="px-3 py-2 rounded-md bg-white/90 text-gray-800 hover:bg-white shadow-sm inline-flex items-center gap-2"
            >
              <FiRefreshCw /> Refresh
            </button>
            <Link to="/dashboard/check-in" className="px-3 py-2 rounded-md bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm">Check-in/Check-out</Link>
            <Link to="/dashboard/members" className="px-3 py-2 rounded-md bg-indigo-700 hover:bg-indigo-800 text-white shadow-sm">Add Member</Link>
          </div>
        </div>
      </div>

      {/* Overview stats (same as Admin/Owner) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Members', value: stats.totalMembers, icon: <FaUsers className="w-8 h-8" /> },
          { title: 'Active Members', value: stats.activeMembers, icon: <FaUserCheck className="w-8 h-8" /> },
          { title: 'Receptionists', value: stats.receptionists, icon: <FaUserTie className="w-8 h-8" /> },
          { title: 'Expired Memberships', value: stats.expiredMemberships, icon: <FaUserClock className="w-8 h-8" /> },
        ].map((s, i) => (
          <motion.div key={s.title} {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: i * 0.05 }}>
            <StatCard title={s.title} value={loading ? '—' : s.value} icon={s.icon} />
          </motion.div>
        ))}
      </div>

      {/* Live attendance stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.05 }} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Checked-in now</div>
              <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : openSessions.length}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 grid place-items-center">
              <FiActivity />
            </div>
          </div>
        </motion.div>
        <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.1 }} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Check-ins today</div>
              <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : totalCheckIns}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 grid place-items-center">
              <FiLogIn />
            </div>
          </div>
        </motion.div>
        <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.15 }} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">Check-outs today</div>
              <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : totalCheckOuts}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 grid place-items-center">
              <FiLogOut />
            </div>
          </div>
        </motion.div>
        <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.2 }} className="bg-white rounded-xl shadow hover:shadow-md transition p-4 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs uppercase tracking-wide text-gray-500">New members today</div>
              <div className="text-2xl font-semibold text-gray-900">{loading ? '—' : newMembersToday}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 grid place-items-center">
              <FiUsersOutline />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Live now */}
        <Card title={`Live now (${openSessions.length})`}>
          {loading ? (
            <div className="py-8 grid place-items-center"><Spinner label="Loading…" /></div>
          ) : openSessions.length === 0 ? (
            <div className="text-sm text-gray-500">No one is currently checked in.</div>
          ) : (
            <ul className="divide-y">
              {openSessions.slice(0, 6).map((l, i) => {
                const m = memberById.get(l.memberId) || {};
                const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown';
                return (
                  <motion.li key={l.id} variants={list.item} initial="initial" animate="animate" transition={{ delay: i * 0.05 }} className="py-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <AvatarInitial name={m.firstName} />
                      <div>
                        <div className="font-medium text-gray-800">{name}</div>
                        <div className="text-xs text-gray-500">In at {fmtTime(l.checkInTime)} • <span className="inline-flex items-center px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{since(l.checkInTime)} live</span></div>
                      </div>
                    </div>
                    <button onClick={() => handleCheckOut(l)} className="px-2.5 py-1.5 text-xs bg-slate-800 text-white rounded-md hover:bg-slate-900 shadow-sm inline-flex items-center gap-1">
                      <FiLogOut /> Check-out
                    </button>
                  </motion.li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Today's check-ins */}
        <Card title="Today’s check-ins">
          {loading ? (
            <div className="py-8 grid place-items-center"><Spinner label="Loading…" /></div>
          ) : todayLogs.length === 0 ? (
            <div className="text-sm text-gray-500">No check-ins recorded yet today.</div>
          ) : (
            <div className="max-h-72 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left font-medium">Member</th>
                    <th className="text-left font-medium">In</th>
                    <th className="text-left font-medium">Out</th>
                  </tr>
                </thead>
                <tbody>
                  {todayLogs.slice(0, 12).map((l, i) => {
                    const m = memberById.get(l.memberId) || {};
                    const name = `${m.firstName || ''} ${m.lastName || ''}`.trim() || 'Unknown';
                    return (
                      <motion.tr key={l.id} variants={list.item} initial="initial" animate="animate" transition={{ delay: i * 0.03 }} className="border-t">
                        <td className="py-1">{name}</td>
                        <td className="py-1">{fmtTime(l.checkInTime)}</td>
                        <td className="py-1">{l.checkOutTime ? (<span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border">{fmtTime(l.checkOutTime)}</span>) : '-'}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Ending soon */}
        <Card title="Ending soon (7 days)">
          {loading ? (
            <div className="py-8 grid place-items-center"><Spinner label="Loading…" /></div>
          ) : soonEnding.length === 0 ? (
            <div className="text-sm text-gray-500">No memberships ending soon.</div>
          ) : (
            <ul className="text-sm text-gray-700 space-y-2">
              {soonEnding.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 grid place-items-center text-sm font-medium">
                      {(m.firstName?.[0] || 'U').toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{m.firstName} {m.lastName}</span>
                  </div>
                  <span className="text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-100">Ends {m.endDate || '-'}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        description={confirm.description}
        confirmText="Confirm"
      />
    </div>
  );
};

export default ReceptionistDashboard;
