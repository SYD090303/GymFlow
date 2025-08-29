import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import Header from '../../../components/dashboard/Header';
import StatCard from '../../../components/dashboard/StatCard';
import { getMembers } from '../../../services/memberService';
import { getReceptionists } from '../../../services/receptionistService';
import { listToday } from '../../../services/attendanceService';
import { FaUsers, FaUserCheck, FaUserTie, FaUserClock } from 'react-icons/fa';
import { FiActivity, FiLogIn, FiLogOut } from 'react-icons/fi';
import { FaUserPlus } from 'react-icons/fa';

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
  const [daysAhead, setDaysAhead] = useState(7);
  const [showAllEnding, setShowAllEnding] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [query, setQuery] = useState('');
  const [todayLogs, setTodayLogs] = useState([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const [membersData, receptionistsData, logs] = await Promise.all([
          getMembers(),
          getReceptionists(),
          listToday(),
        ]);
        if (!mounted) return;

        // Calculate stats
        const totalMembers = membersData.length;
        const activeMembers = membersData.filter(m => m.membershipStatus === 'ACTIVE').length;
        const expiredMemberships = membersData.filter(m => m.membershipStatus === 'EXPIRED').length;
        const receptionists = receptionistsData.length;

        setStats({ totalMembers, activeMembers, receptionists, expiredMemberships });
  setMembers(membersData);
  setTodayLogs(Array.isArray(logs) ? logs : []);

        // Get recent members (store full sorted list; slice in render by toggle)
        const getDate = (m) => m.createdAt || m.startDate || '1970-01-01';
        const sortedMembers = [...membersData].sort((a, b) => new Date(getDate(b)) - new Date(getDate(a)));
        setRecentMembers(sortedMembers);
      } catch (error) {
        if (mounted) console.error('Failed to fetch dashboard data', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
  fetchData();
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

  const statCards = [
    { title: 'Total Members', value: stats.totalMembers, icon: <FaUsers className="w-8 h-8" /> },
    { title: 'Active Members', value: stats.activeMembers, icon: <FaUserCheck className="w-8 h-8" /> },
    { title: 'Receptionists', value: stats.receptionists, icon: <FaUserTie className="w-8 h-8" /> },
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

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      <Header title="Overview" searchValue={query} onSearch={setQuery} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} {...variants.fadeUp} transition={{ ...variants.fadeUp.transition, delay: index * 0.05 }}>
            <StatCard title={stat.title} value={stat.value} icon={stat.icon} />
          </motion.div>
        ))}
      </div>

      {/* Live Today */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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
              <FaUserPlus />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Recently Joined Members</h3>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500">Showing {recentShown} of {recentTotal}</div>
            {recentTotal > 3 && (
              <button onClick={() => setShowAllRecent(v => !v)} className="text-sm border rounded-md px-3 py-1 hover:bg-gray-50">
                {showAllRecent ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: showAllRecent ? 9999 : recentCollapsedMax }}>
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
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                    {(() => {
                      const ms = member.membershipStatus;
                      const cls = ms === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : ms === 'EXPIRED'
                        ? 'bg-red-100 text-red-800'
                        : ms === 'PENDING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800';
                      return (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cls}`}>
                          {ms || '-'}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{(() => { const d = member.createdAt || member.startDate; return d ? new Date(d).toLocaleDateString() : '-'; })()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Ending Soon</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 flex items-center gap-2">
              Window:
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
            )}
          </div>
        </div>
        <div className="overflow-x-auto overflow-hidden transition-[max-height] duration-300 ease-in-out" style={{ maxHeight: showAllEnding ? 9999 : endingCollapsedMax }}>
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
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">{new Date(m.endDate).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200 text-right">{daysLeft}d</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Overview;
