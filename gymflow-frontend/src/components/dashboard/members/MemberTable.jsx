import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { listByMember, checkOut as attendanceCheckOut } from '../../../services/attendanceService';
import toast from 'react-hot-toast';
import { FiRefreshCw } from 'react-icons/fi';
import { useCallback } from 'react';
import ConfirmationModal from './ConfirmationModal';

const MemberTable = ({ members, onEdit, onToggleStatus, onDelete, onRenew, onLogAttendance, attendanceRefreshKey }) => {
  const [expandedIds, setExpandedIds] = useState(new Set());
  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const RowActionMenu = ({ onToggleStatus, onRenew, onAttendance, onDelete }) => {
    const [open, setOpen] = useState(false);
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((v) => !v)}
          className="px-2.5 py-1 text-xs border rounded hover:bg-gray-50"
        >
          More
        </button>
        <AnimatePresence>
          {open && (
            <motion.div {...variants.scaleIn} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-10">
              <button onClick={() => { setOpen(false); onToggleStatus(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">{`Activate/Deactivate`}</button>
              <button onClick={() => { setOpen(false); onRenew(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Renew</button>
              <button onClick={() => { setOpen(false); onAttendance(); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">Attendance</button>
              <button onClick={() => { setOpen(false); onDelete(); }} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50">Delete</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
  return (
    <div className="bg-white shadow-md rounded-lg">
      <div className="overflow-x-auto">
  <table className="w-full min-w-[720px] table-fixed">
        <thead className="bg-gray-50">
          <tr className="text-left">
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">Name</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[220px]">Email</th>
            <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Phone</th>
    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px] hidden lg:table-cell">Start</th>
    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[110px] hidden xl:table-cell">End</th>
  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[120px]">Membership</th>
    <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-[200px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {members.map((member) => (
            <React.Fragment key={member.id}>
              <tr>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap flex items-center gap-2">
                  <button
                    aria-label="Toggle details"
                    onClick={() => toggleExpand(member.id)}
                    className="p-1 rounded hover:bg-gray-100"
                    title={expandedIds.has(member.id) ? 'Collapse' : 'Expand'}
                  >
                    {expandedIds.has(member.id) ? <FaChevronDown className="text-gray-600" /> : <FaChevronRight className="text-gray-600" />}
                  </button>
                  <span className="truncate max-w-[140px]" title={`${member.firstName} ${member.lastName}`}>{member.firstName} {member.lastName}</span>
                </td>
                <td className="px-4 md:px-6 py-4 truncate" title={member.email}>{member.email}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">{member.phone}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden lg:table-cell">{member.startDate || '-'}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap hidden xl:table-cell">{member.endDate || '-'}</td>
                <td className="px-4 md:px-6 py-4 whitespace-nowrap">
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
                <td className="px-4 md:px-6 py-4 whitespace-nowrap text-right relative">
                  {/* Full action set on xl+ */}
                  <div className="hidden xl:flex flex-wrap justify-end gap-1.5 max-w-full">
                    <button onClick={() => onEdit(member)} className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
                    <button onClick={() => onToggleStatus(member)} className="px-2.5 py-1 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600">{member.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                    <button onClick={() => onRenew(member)} className="px-2.5 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Renew</button>
                    <button onClick={() => onLogAttendance(member)} className="px-2.5 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700">Attend</button>
                    <button onClick={() => onDelete(member)} className="px-2.5 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                  </div>
                  {/* Compact action menu on < xl */}
                  <div className="xl:hidden flex justify-end gap-1.5">
                    <button onClick={() => onEdit(member)} className="px-2.5 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700">Edit</button>
                    <RowActionMenu
                      onToggleStatus={() => onToggleStatus(member)}
                      onRenew={() => onRenew(member)}
                      onAttendance={() => onLogAttendance(member)}
                      onDelete={() => onDelete(member)}
                    />
                  </div>
                </td>
              </tr>
              <AnimatePresence>
              {expandedIds.has(member.id) && (
                <motion.tr {...variants.fadeDown}>
                  <td colSpan={7} className="px-4 md:px-6 py-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Membership</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li>
                            <span className="text-gray-500">Plan:</span>{' '}
                            {member.membershipPlan
                              ? `${member.membershipPlan.name} • ₹${member.membershipPlan.price ?? '-'} • ${member.membershipPlan.durationMonths ?? '-'} mo`
                              : '-'}
                          </li>
                          <li><span className="text-gray-500">Start:</span> {member.startDate || '-'}</li>
                          <li><span className="text-gray-500">End:</span> {member.endDate || '-'}</li>
                          <li><span className="text-gray-500">Auto-renew:</span> {member.autoRenew ? 'Yes' : 'No'}</li>
                          <li><span className="text-gray-500">Status:</span> {member.membershipStatus || '-'}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Fitness</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li><span className="text-gray-500">Height:</span> {member.height != null ? `${member.height} cm` : '-'}</li>
                          <li><span className="text-gray-500">Weight:</span> {member.weight != null ? `${member.weight} kg` : '-'}</li>
                          <li><span className="text-gray-500">Medical:</span> {member.medicalConditions || '-'}</li>
                          <li><span className="text-gray-500">Injuries:</span> {member.injuries || '-'}</li>
                          <li><span className="text-gray-500">Allergies:</span> {member.allergies || '-'}</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Financial</h4>
                        <ul className="text-sm text-gray-700 space-y-1">
                          <li><span className="text-gray-500">Outstanding:</span> {member.outstandingBalance != null ? `₹${member.outstandingBalance}` : '-'}</li>
                          <li><span className="text-gray-500">Last payment:</span> {member.lastPaymentDate || '-'}</li>
                        </ul>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button onClick={() => onRenew(member)} className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700">Renew Now</button>
                          <button onClick={() => onLogAttendance(member)} className="px-3 py-1 text-xs bg-slate-600 text-white rounded hover:bg-slate-700">Log Attendance</button>
                        </div>
                      </div>
                    </div>

                    {/* Attendance panel */}
                    <div className="mt-6">
                      <AttendancePanel memberId={member.id} memberName={member.firstName} refreshKey={attendanceRefreshKey} />
                    </div>
                  </td>
                </motion.tr>
              )}
              </AnimatePresence>
            </React.Fragment>
          ))}
        </tbody>
  </table>
  </div>
    </div>
  );
};

export default MemberTable;

// Lightweight embedded panel for attendance history and live session
const AttendancePanel = ({ memberId, memberName, refreshKey = 0 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: null });

  // Loader reused by effects and actions
  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listByMember(memberId);
      setLogs(data || []);
    } catch (e) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useEffect(() => {
    let mounted = true;
    loadLogs().finally(() => { if (mounted) {/* state handled in loader */} });
    const iv = setInterval(() => setTick((t) => t + 1), 1000);
    return () => { mounted = false; clearInterval(iv); };
  }, [memberId, refreshKey, loadLogs]);

  const openLog = useMemo(() => logs.find(l => !l.checkOutTime), [logs]);

  const fmt = (dt) => dt ? new Date(dt).toLocaleString() : '-';
  const fmtTime = (dt) => dt ? new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
  const since = () => {
    if (!openLog?.checkInTime) return '-';
    const ms = Date.now() - new Date(openLog.checkInTime).getTime();
    const mins = Math.floor(ms / 60000);
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return hrs > 0 ? `${hrs}h ${rem}m` : `${rem}m`;
  };

  const handleCheckOut = async () => {
    try {
      await attendanceCheckOut(memberId);
      toast.success(`Checked out ${memberName}`);
      await loadLogs();
    } catch (e) {
      toast.error('Failed to check-out');
    }
  };

  const openCheckoutConfirm = () => {
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setConfirmConfig({
      title: 'Check-out',
      description: `This will record a check-out for ${memberName} at ${time}.
Note: This will close the current session and calculate the final duration. Continue?`,
      onConfirm: async () => {
        try {
          await handleCheckOut();
        } finally {
          setIsConfirmOpen(false);
        }
      }
    });
    setIsConfirmOpen(true);
  };

  return (
    <div className="bg-white border rounded-md p-4">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-800">Attendance</h4>
        <div>
          <button
            onClick={() => { loadLogs(); toast.success('Attendance refreshed'); }}
            title="Refresh"
            className="mr-2 px-2 py-1 text-xs border rounded hover:bg-gray-50 inline-flex items-center gap-1"
          >
            <FiRefreshCw /> Refresh
          </button>
          {openLog ? (
            <button onClick={openCheckoutConfirm} className="px-3 py-1 text-xs bg-slate-700 text-white rounded hover:bg-slate-800">Check-out</button>
          ) : null}
        </div>
      </div>
      <ConfirmationModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText="Confirm"
      />
      {loading ? (
        <div className="text-sm text-gray-500 mt-2">Loading...</div>
      ) : (
        <div className="mt-3 space-y-2">
          {openLog && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200">
              <div className="text-sm text-emerald-800">Checked-in at {fmtTime(openLog.checkInTime)} • Live: {since()}</div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-500 mb-1">Recent Sessions</div>
            <div className="max-h-40 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left font-medium">Check-in</th>
                    <th className="text-left font-medium">Check-out</th>
                    <th className="text-left font-medium hidden sm:table-cell">Status</th>
                    <th className="text-right font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 && (
                    <tr><td colSpan={4} className="text-gray-500 py-2">No records</td></tr>
                  )}
                  {logs.slice(0, 10).map((l) => (
                    <tr key={l.id} className="border-t">
                      <td className="py-1">{fmt(l.checkInTime)}</td>
                      <td className="py-1">{l.checkOutTime ? fmt(l.checkOutTime) : '-'}</td>
                      <td className="py-1 hidden sm:table-cell">{l.attendanceStatus}</td>
                      <td className="py-1 text-right">{l.durationMinutes != null ? `${l.durationMinutes}m` : (l.checkOutTime ? '-' : '—')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
