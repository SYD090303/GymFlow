import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import PageHeader from '../../../components/dashboard/PageHeader';
import StatCard from '../../../components/dashboard/StatCard';
import { getMembers } from '../../../services/memberService';
import { getReceptionists } from '../../../services/receptionistService';
import { listToday } from '../../../services/attendanceService';
import { FaUsers, FaUserCheck, FaUserTie, FaUserClock } from 'react-icons/fa';
import { FiBell, FiRefreshCcw, FiCheck } from 'react-icons/fi';
import { FiActivity, FiLogIn, FiLogOut, FiUserCheck, FiUserX } from 'react-icons/fi';
import { FaUserPlus } from 'react-icons/fa';
import LiveCheckedInList from '../../../components/dashboard/attendance/LiveCheckedInList';
import StatusChip from '../../../components/common/StatusChip';
import { formatDate } from '../../../utils/date';
import SectionCard from '../../../components/common/SectionCard';
import MetricCard from '../../../components/common/MetricCard';
import AvatarInitial from '../../../components/common/AvatarInitial';
import { Link } from 'react-router-dom';
import Spinner from '../../../ui/Spinner';

const Overview = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    receptionists: 0,
    expiredMemberships: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [receptionists, setReceptionists] = useState([]);
  const [daysAhead, setDaysAhead] = useState(7);
  const [showAllEnding, setShowAllEnding] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [query, setQuery] = useState('');
  const [todayLogs, setTodayLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);

  async function loadData() {
    const [membersData, receptionistsData, logs] = await Promise.all([
      getMembers(),
      getReceptionists(),
      listToday(),
    ]);
    // Calculate stats
    const totalMembers = membersData.length;
    const activeMembers = membersData.filter(m => m.membershipStatus === 'ACTIVE').length;
    const expiredMemberships = membersData.filter(m => m.membershipStatus === 'EXPIRED').length;
    const receptionistsCount = receptionistsData.length;
    const activeReceptionists = receptionistsData.filter(r => r.status === 'ACTIVE').length;
    const inactiveReceptionists = receptionistsCount - activeReceptionists;
    setStats({ totalMembers, activeMembers, receptionists: receptionistsCount, expiredMemberships, activeReceptionists, inactiveReceptionists });
    setMembers(membersData);
    setReceptionists(Array.isArray(receptionistsData) ? receptionistsData : []);
    setTodayLogs(Array.isArray(logs) ? logs : []);

    const getDate = (m) => m.createdAt || m.startDate || '1970-01-01';
    const sortedMembers = [...membersData].sort((a, b) => new Date(getDate(b)) - new Date(getDate(a)));
    setRecentMembers(sortedMembers);
  }

  async function loadNotifications() {
    try {
      setNotifLoading(true);
      const mod = await import('../../../services/notificationService');
      const data = await mod.getOwnerNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } finally {
      setNotifLoading(false);
    }
  }

  const refresh = async () => {
    setLoading(true);
    try {
      await loadData();
      await loadNotifications();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Refresh failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadData();
      } catch (e) {
        if (mounted) console.error('Failed to fetch dashboard data', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    (async () => {
      try {
        await loadNotifications();
      } catch (e) {
        if (mounted) console.error('Failed to load notifications', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Search normalization
  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  // Filtered members for both sections
  const filteredMembers = useMemo(() => {
    if (!normalizedQuery) return members;
    return members.filter(m => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      const email = (m.email || '').toLowerCase();
      const plan = (m.membershipPlan?.name || m.membershipPlan?.planType || '').toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery) || plan.includes(normalizedQuery);
    });
  }, [members, normalizedQuery]);

  // Ending soon computations
  const endingSoonAll = useMemo(() => {
    const today = new Date();
    const cutoff = new Date();
    cutoff.setDate(today.getDate() + daysAhead);
    return filteredMembers
      .filter(m => !!m.endDate)
      .filter(m => {
        const end = new Date(m.endDate);
        return end >= today && end <= cutoff;
      })
      .sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
  }, [filteredMembers, daysAhead]);

  const endingSoon = useMemo(() => (
    showAllEnding ? endingSoonAll : endingSoonAll.slice(0, 10)
  ), [endingSoonAll, showAllEnding]);

  // Recent members computations
  const filteredRecent = useMemo(() => {
    if (!normalizedQuery) return recentMembers;
    return recentMembers.filter(m => {
      const name = `${m.firstName || ''} ${m.lastName || ''}`.toLowerCase();
      const email = (m.email || '').toLowerCase();
      return name.includes(normalizedQuery) || email.includes(normalizedQuery);
    });
  }, [recentMembers, normalizedQuery]);

  const recentToDisplay = useMemo(() => (
    showAllRecent ? filteredRecent : filteredRecent.slice(0, 3)
  ), [filteredRecent, showAllRecent]);

  const recentTotal = filteredRecent.length;
  const recentShown = recentToDisplay.length;

  // Simple height approximations for smooth-ish collapse/expand
  const HEADER_H = 56; // px
  const ROW_H = 56; // px
  const recentCollapsedMax = HEADER_H + ROW_H * 3;
  const endingCollapsedMax = HEADER_H + ROW_H * 10;

  const memberCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: <FaUsers className="w-8 h-8" /> },
    { title: 'Active Members', value: stats.activeMembers, icon: <FaUserCheck className="w-8 h-8" /> },
    { title: 'Expired Memberships', value: stats.expiredMemberships, icon: <FaUserClock className="w-8 h-8" /> },
  ];

  // Live today stats
  const openSessions = useMemo(() => todayLogs.filter(l => !l.checkOutTime), [todayLogs]);
  const totalCheckIns = todayLogs.length;
  const totalCheckOuts = todayLogs.filter(l => l.checkOutTime).length;
  const newMembersToday = useMemo(() => {
    const todayStr = new Date().toDateString();
    return members.filter(m => {
      const d = m.createdAt || m.startDate;
      return d && new Date(d).toDateString() === todayStr;
    }).length;
  }, [members]);

  // Map of memberId -> member for quick lookups in live list
  const memberById = useMemo(() => {
    const map = new Map();
    for (const m of members) map.set(m.id, m);
    return map;
  }, [members]);

  // time helpers moved to utils/date and used in LiveCheckedInList

  if (loading) {
    return (
      <div className="min-h-[50vh] grid place-items-center">
        <Spinner label="Loading dashboard…" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="relative overflow-hidden rounded-b-2xl md:rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-indigo-600 text-white shadow-md">
        <div className="p-5 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FiActivity className="opacity-90" />
              <h1 className="text-xl md:text-2xl font-semibold">Owner Dashboard</h1>
            </div>
            <p className="text-white/90 text-sm mt-1">A live snapshot of your gym: members, sessions, and renewals.</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Link
              to="/dashboard/notifications"
              className="relative inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/20 hover:bg-white/25 transition"
              title="Notifications"
            >
              <FiBell />
              {notifications.some(n => !n.read) && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-xs grid place-items-center">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </Link>
            <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search members" className="w-full md:w-64 border border-white/30 bg-white/20 placeholder-white/80 text-white rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/60" />
          </div>
        </div>
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-56 h-56 rounded-full bg-white/10 blur-2xl" />
      </div>

      {/* Main layout: content only (left previously 2/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 lg:col-start-1 lg:col-end-4 lg:space-y-4 space-y-4">
          {/* Today metrics */}
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-900">Today</h3>
              <button onClick={refresh} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <FiRefreshCcw className={notifLoading ? 'animate-spin' : ''} /> Refresh
              </button>
            </div>
            {loading ? (
              <div className="py-8 grid place-items-center">
                <Spinner label="Loading…" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Checked-in now</div>
                  <div className="text-lg font-semibold text-gray-900">{openSessions.length}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Check-ins today</div>
                  <div className="text-lg font-semibold text-gray-900">{totalCheckIns}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Check-outs today</div>
                  <div className="text-lg font-semibold text-gray-900">{totalCheckOuts}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">New members today</div>
                  <div className="text-lg font-semibold text-gray-900">{newMembersToday}</div>
                </div>
              </div>
            )}
          </div>

          {/* Checked-in Members */}
          <div className="mt-2 px-4">
            <SectionCard title="Checked-in Members">
              {loading ? (
                <div className="text-sm text-gray-500">Loading…</div>
              ) : (
                <LiveCheckedInList openSessions={openSessions} memberById={memberById} />
              )}
            </SectionCard>
          </div>

          {/* Members stats */}
          <h2 className="mt-6 px-4 text-sm font-semibold text-gray-600">Members</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 px-4">
            {memberCards.map((stat, index) => (
              <motion.div key={stat.title} {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: index * 0.05 }}>
                <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
              </motion.div>
            ))}
          </div>

          <div className="mt-4 px-4">
            <SectionCard title="Recently Joined Members" actions={<div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">Showing {recentShown} of {recentTotal}{recentTotal > 3 && (
                  <button onClick={() => setShowAllRecent(v => !v)} className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50 ml-2">
                    {showAllRecent ? 'Show less' : 'Show more'}
                  </button>
                )}</div>}>
              {/* Mobile list */}
              <div className="md:hidden divide-y">
                {recentToDisplay.map((member) => (
                  <div key={member.id} className="py-3">
                    <div className="flex items-center gap-3">
                      <AvatarInitial name={member.firstName} />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">{member.firstName} {member.lastName}</div>
                        <div className="text-xs text-gray-500 truncate">{member.email}</div>
                      </div>
                      <div className="ml-auto"><StatusChip status={member.membershipStatus} /></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">Joined {formatDate(member.createdAt || member.startDate)}</div>
                  </div>
                ))}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: showAllRecent ? 9999 : recentCollapsedMax }}>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Membership</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined On</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentToDisplay.map((member, i) => (
                      <motion.tr key={member.id} {...variants.tableRow} transition={{ ...variants.tableRow.transition, delay: i * 0.03 }}>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{member.firstName} {member.lastName}</td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{member.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200"><StatusChip status={member.membershipStatus} /></td>
                        <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{formatDate(member.createdAt || member.startDate)}</td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>

          <div className="mt-4 px-4">
            <SectionCard title="Ending Soon" actions={<div className="flex flex-wrap items-center gap-3"><label className="text-sm text-gray-600 flex items-center gap-2">Window:
                  <select value={daysAhead} onChange={(e) => setDaysAhead(parseInt(e.target.value, 10))} className="border rounded-md px-2 py-1 text-sm">
                    <option value={3}>3 days</option>
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                  </select>
                </label>
                <div className="text-sm text-gray-500">Showing {endingSoon.length} of {endingSoonAll.length} upcoming</div>
                {endingSoonAll.length > 10 && (
                  <button onClick={() => setShowAllEnding(v => !v)} className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50">
                    {showAllEnding ? 'Show less' : 'Show all'}
                  </button>
                )}</div>}>
              {/* Mobile list */}
              <div className="md:hidden divide-y">
                {endingSoon.length === 0 && (
                  <div className="px-4 py-3 text-sm text-gray-500">No memberships ending in the next {daysAhead} days.</div>
                )}
                {endingSoon.map((m) => {
                  const end = new Date(m.endDate);
                  const diffMs = end - new Date();
                  const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                  return (
                    <div key={m.id} className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <AvatarInitial name={m.firstName} />
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{m.firstName} {m.lastName}</div>
                          <div className="text-xs text-gray-500 truncate">{m.membershipPlan?.name || m.membershipPlan?.planType || '-'}</div>
                        </div>
                        <div className="ml-auto text-xs inline-flex items-center px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">{daysLeft}d</div>
                      </div>
                      <div className="mt-1 text-xs text-gray-600">Ends {formatDate(m.endDate)}</div>
                    </div>
                  );
                })}
              </div>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: showAllEnding ? 9999 : endingCollapsedMax }}>
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Days Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endingSoon.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-gray-500">No memberships ending in the next {daysAhead} days.</td>
                      </tr>
                    )}
                    {endingSoon.map((m, i) => {
                      const end = new Date(m.endDate);
                      const diffMs = end - new Date();
                      const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
                      return (
                        <motion.tr key={m.id} {...variants.tableRow} transition={{ ...variants.tableRow.transition, delay: i * 0.03 }}>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{m.firstName} {m.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{m.membershipPlan?.name || m.membershipPlan?.planType || '-'}</td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{formatDate(m.endDate)}</td>
                          <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-right">{daysLeft}d</td>
                        </motion.tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>

      {/* Receptionists section moved to end */}
      <div className="space-y-4">
        <h2 className="mt-2 px-4 text-sm font-semibold text-gray-600">Receptionists</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 px-4">
          <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.05 }}>
            <MetricCard label="Active Receptionists" value={stats.activeReceptionists ?? 0} icon={<FiUserCheck />} tone="emerald" />
          </motion.div>
          <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.1 }}>
            <MetricCard label="Inactive Receptionists" value={stats.inactiveReceptionists ?? 0} icon={<FiUserX />} tone="rose" />
          </motion.div>
          <motion.div {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: 0.15 }}>
            <MetricCard label="Total Receptionists" value={stats.receptionists ?? 0} icon={<FaUserTie />} tone="sky" />
          </motion.div>
        </div>

        <div className="mt-2 px-4">
          <SectionCard title="New Receptionists" actions={<Link to="/dashboard/receptionists" className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50">Manage</Link>}>
            <div className="overflow-hidden">
              <table className="w-full table-fixed">
                <colgroup>
                  <col className="w-[45%]" />
                  <col className="w-[55%]" />
                </colgroup>
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {([...receptionists]
                    .sort((a,b)=>{
                      const da = a.createdAt ? new Date(a.createdAt) : 0;
                      const db = b.createdAt ? new Date(b.createdAt) : 0;
                      return db - da;
                    })
                    .slice(0,5)).map((r, i) => (
                    <motion.tr key={r.id || i} {...variants.tableRow} transition={{ ...variants.tableRow.transition, delay: i * 0.03 }}>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                        <div className="flex items-center gap-2 min-w-0">
                          <AvatarInitial name={r.firstName} />
                          <span className="truncate" title={`${r.firstName || ''} ${r.lastName || ''}`.trim()}>{r.firstName} {r.lastName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                        <span className="block max-w-[320px] truncate" title={r.email || '-'}>{r.email || '-'}</span>
                      </td>
                    </motion.tr>
                  ))}
                  {receptionists.length === 0 && (
                    <tr><td colSpan={2} className="px-6 py-4 text-gray-500">No receptionist records</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default Overview;
