import React, { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../../components/dashboard/PageHeader';
import { FiUsers, FiUserPlus, FiUserCheck, FiAlertTriangle } from 'react-icons/fi';
import { getMembers, updateMember, deleteMember, activateMember, deactivateMember, renewMembership } from '../../../services/memberService';
import { logAttendance as logAttendanceApi } from '../../../services/attendanceService';
import MemberTable from '../../../components/dashboard/members/MemberTable';
import AddMemberModal from '../../../components/dashboard/members/AddMemberModal';
import EditMemberModal from '../../../components/dashboard/members/EditMemberModal';
import ConfirmationModal from '../../../components/dashboard/members/ConfirmationModal';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import MetricCard from '../../../components/common/MetricCard';
import EmptyState from '../../../components/common/EmptyState';
import SkeletonTable from '../../../components/common/SkeletonTable';
import Spinner from '../../../ui/Spinner';

const MembersPage = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmConfig, setConfirmConfig] = useState({ title: '', description: '', onConfirm: null });
  // signal attendance panel to refresh after actions
  const [attendanceRefreshKey, setAttendanceRefreshKey] = useState(0);
  // Filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ACTIVE | INACTIVE | ALL
  const [membershipStatusFilter, setMembershipStatusFilter] = useState('ALL'); // ACTIVE | EXPIRED | CANCELLED | ALL
  const [endBefore, setEndBefore] = useState(''); // YYYY-MM-DD

  const load = async (signal) => {
    setLoading(true);
    try {
      const data = await getMembers();
      if (signal?.aborted) return;
      setMembers(data);
    } catch (e) {
      if (!signal?.aborted) toast.error(extractErrorMessage(e, 'Failed to load members'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setMembershipStatusFilter('ALL');
    setEndBefore('');
  };

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return members.filter(m => {
      // search by name or email
      const matchesSearch = term === '' || (
        `${m.firstName ?? ''} ${m.lastName ?? ''}`.toLowerCase().includes(term) ||
        (m.email ?? '').toLowerCase().includes(term)
      );
      const matchesStatus = statusFilter === 'ALL' || (m.status === statusFilter);
      const matchesMembership = membershipStatusFilter === 'ALL' || (m.membershipStatus === membershipStatusFilter);
      const matchesEndBefore = endBefore === '' || (!m.endDate ? false : m.endDate <= endBefore);
      return matchesSearch && matchesStatus && matchesMembership && matchesEndBefore;
    });
  }, [members, searchTerm, statusFilter, membershipStatusFilter, endBefore]);

  const handleEdit = (member) => { setSelectedMember(member); setIsEditOpen(true); };

  const handleSaveEdit = async (updates) => {
    if (!selectedMember) return;
    try {
      const updated = await updateMember(selectedMember.id, updates);
      setMembers((prev) => prev.map((m) => (m.id === selectedMember.id ? updated : m)));
      toast.success('Member updated');
    } catch (e) {
  toast.error(extractErrorMessage(e, 'Failed to update member'));
  // Rethrow so the modal can keep itself open and highlight fields
  throw e;
    }
  };

  const handleToggleStatus = (member) => {
    setSelectedMember(member);
    const activate = member.status !== 'ACTIVE';
    setConfirmConfig({
      title: `${activate ? 'Activate' : 'Deactivate'} Member`,
      description: `Are you sure you want to ${activate ? 'activate' : 'deactivate'} ${member.firstName}?`,
      onConfirm: async () => {
            try {
              const updated = activate ? await activateMember(member.id) : await deactivateMember(member.id);
              setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
              toast.success(`Member ${activate ? 'activated' : 'deactivated'}`);
            } catch (e) {
              toast.error(extractErrorMessage(e, 'Failed to change status'));
        } finally {
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const handleDelete = (member) => {
    setSelectedMember(member);
    setConfirmConfig({
      title: 'Archive Member',
      description: `Archive ${member.firstName}? This is a soft delete and can be reactivated later.`,
      onConfirm: async () => {
        try {
          await deleteMember(member.id);
          setMembers((prev) => prev.filter((m) => m.id !== member.id));
          toast.success('Member archived');
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Failed to archive member'));
        } finally {
          setIsConfirmOpen(false);
        }
      },
    });
    setIsConfirmOpen(true);
  };

  const activeCount = useMemo(() => members.filter(m => m.status === 'ACTIVE').length, [members]);
  const expiredCount = useMemo(() => members.filter(m => m.membershipStatus === 'EXPIRED').length, [members]);

  return (
    <div className="p-6">
      <PageHeader icon={<FiUsers />} title="Members" subtitle="Manage your members and their memberships.">
        <button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700">
          <FiUserPlus /> Add Member
        </button>
      </PageHeader>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MetricCard label="Active Members" value={activeCount} icon={<FiUserCheck />} tone="emerald" />
        <MetricCard label="Expired Memberships" value={expiredCount} icon={<FiAlertTriangle />} tone="amber" />
        <MetricCard label="Total Members" value={members.length} icon={<FiUsers />} tone="sky" />
      </div>
      <div className="flex flex-col gap-4 mb-6">
        {/* Filters & search */}
    <div className="bg-white shadow-md rounded-xl border border-gray-100 p-3 md:p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Search</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email"
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Membership Status</label>
              <select
                value={membershipStatusFilter}
                onChange={(e) => setMembershipStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">Active</option>
                <option value="EXPIRED">Expired</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ending Before</label>
              <input
                type="date"
                value={endBefore}
                onChange={(e) => setEndBefore(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={resetFilters}
      className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
            <div className="text-xs text-gray-500 self-center">Showing {filteredMembers.length} of {members.length}</div>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="py-16 grid place-items-center">
          <Spinner label="Loading members…" />
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md border border-gray-100">
          <EmptyState title="No members found" description="Try changing filters or add a new member." action={<button onClick={() => setIsAddOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"><FiUserPlus /> Add Member</button>} />
        </div>
      ) : (
        <MemberTable
          members={filteredMembers}
          attendanceRefreshKey={attendanceRefreshKey}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onDelete={handleDelete}
          onRenew={(member) => {
          setSelectedMember(member);
          setConfirmConfig({
            title: 'Renew Membership',
            description: 'Renew membership starting today? This will recalculate end date based on the current plan.',
            onConfirm: async () => {
              try {
                const today = new Date().toISOString().slice(0, 10);
                const updated = await renewMembership(member.id, today);
                setMembers((prev) => prev.map((m) => (m.id === member.id ? updated : m)));
                toast.success('Membership renewed');
              } catch (e) {
                toast.error(extractErrorMessage(e, 'Failed to renew membership'));
              } finally {
                setIsConfirmOpen(false);
              }
            },
          });
          setIsConfirmOpen(true);
        }}
          onLogAttendance={async (member) => {
          setSelectedMember(member);
          const now = new Date();
          const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setConfirmConfig({
            title: 'Mark Attendance',
            description: `This will record a check-in for ${member.firstName} at ${time}.\nNote: This action records the current time and can be checked out later. Continue?`,
            onConfirm: async () => {
              try {
                await logAttendanceApi(member.id, 'RECEPTIONIST');
                const done = new Date();
                const doneTime = done.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                toast.success(`Attendance marked for ${member.firstName} at ${doneTime}`);
                setAttendanceRefreshKey((k) => k + 1);
              } catch (e) {
                toast.error(extractErrorMessage(e, 'Failed to log attendance'));
              } finally {
                setIsConfirmOpen(false);
              }
            },
          });
          setIsConfirmOpen(true);
        }}
        />
      )}

      <AddMemberModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onMemberAdded={load} />

      <EditMemberModal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} member={selectedMember} onSave={handleSaveEdit} />

  <ConfirmationModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={confirmConfig.onConfirm} title={confirmConfig.title} description={confirmConfig.description} confirmText="Confirm" />
    </div>
  );
};

export default MembersPage;
