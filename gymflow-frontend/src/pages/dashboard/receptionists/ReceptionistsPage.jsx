import React, { useEffect, useMemo, useState } from 'react';
import { getReceptionists, createReceptionist, updateReceptionist, deleteReceptionist, activateReceptionist, deactivateReceptionist } from '../../../services/receptionistService';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import ReceptionistModal from '../../../components/dashboard/receptionists/ReceptionistModal';
import { FiUserPlus, FiEdit2, FiPower, FiTrash2, FiSearch, FiUser, FiUserCheck, FiUserX, FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../../../components/dashboard/PageHeader';
import AvatarInitial from '../../../components/common/AvatarInitial';
import StatusChip from '../../../components/common/StatusChip';
import SectionCard from '../../../components/common/SectionCard';
import MetricCard from '../../../components/common/MetricCard';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import EmptyState from '../../../components/common/EmptyState';
import SkeletonTable from '../../../components/common/SkeletonTable';
import Spinner from '../../../ui/Spinner';

const ReceptionistsPage = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL | ACTIVE | INACTIVE
  const [confirm, setConfirm] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [expandedId, setExpandedId] = useState(null);

  const load = async (signal) => {
    setLoading(true);
    try {
      const data = await getReceptionists();
      if (!signal?.aborted) setList(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!signal?.aborted) toast.error(extractErrorMessage(e, 'Failed to load receptionists'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const onToggleStatus = async (r) => {
    try {
      if (r.status === 'ACTIVE') {
        await deactivateReceptionist(r.id);
        toast.success('Receptionist deactivated');
      } else {
        await activateReceptionist(r.id);
        toast.success('Receptionist activated');
      }
  load(new AbortController().signal);
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Action failed'));
    }
  };

  const onDelete = async (id) => {
    setConfirm({
      open: true,
      title: 'Archive Receptionist',
      description: 'Archive this receptionist? This is a soft delete and can be reactivated later.',
      onConfirm: async () => {
        try {
          await deleteReceptionist(id);
          toast.success('Receptionist archived');
          load(new AbortController().signal);
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Archive failed'));
        } finally {
          setConfirm((c) => ({ ...c, open: false }));
        }
      }
    });
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let out = list;
    if (statusFilter !== 'ALL') {
      out = out.filter(r => (statusFilter === 'ACTIVE' ? r.status === 'ACTIVE' : r.status !== 'ACTIVE'));
    }
    if (!q) return out;
    return out.filter(r => `${r.firstName || ''} ${r.lastName || ''}`.toLowerCase().includes(q) || (r.email || '').toLowerCase().includes(q) || (r.shift || '').toLowerCase().includes(q));
  }, [list, search, statusFilter]);

  const activeCount = useMemo(() => list.filter(r => r.status === 'ACTIVE').length, [list]);
  const inactiveCount = useMemo(() => list.filter(r => r.status !== 'ACTIVE').length, [list]);

  return (
    <div className="p-6">
      <PageHeader icon={<FiUser />} title="Receptionists" subtitle="Manage receptionist accounts and shifts">
        <button onClick={() => { setEditing(null); setIsOpen(true); }} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"><FiUserPlus /> Add Receptionist</button>
      </PageHeader>
      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <MetricCard label="Active Receptionists" value={activeCount} icon={<FiUserCheck />} tone="emerald" />
        <MetricCard label="Inactive Receptionists" value={inactiveCount} icon={<FiUserX />} tone="rose" />
        <MetricCard label="Total Receptionists" value={list.length} icon={<FiUser />} tone="sky" />
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-xl shadow p-3 md:p-4 mb-4 border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-end gap-3">
          <div className="flex items-center gap-2">
            {['ALL','ACTIVE','INACTIVE'].map(s => (
              <button key={s} onClick={()=>setStatusFilter(s)} className={`px-3 py-1.5 text-sm rounded-md border ${statusFilter===s ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <div className="md:ml-auto w-full md:w-80">
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by name, email, or shift" className="w-full border rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
          </div>
          <div>
            <button onClick={()=>load(new AbortController().signal)} className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-gray-200 hover:bg-gray-50"><FiRefreshCw className={loading? 'animate-spin':''} /> Refresh</button>
          </div>
        </div>
      </div>

      <SectionCard title="Receptionists">
        {/* Mobile card list */}
        <div className="md:hidden divide-y">
          {loading ? (
            <div className="p-4 text-sm text-gray-500">
              <Spinner label="Loading…" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState title="No receptionists found" description="Try changing filters or add a new receptionist." action={<button onClick={() => { setEditing(null); setIsOpen(true); }} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"><FiUserPlus /> Add Receptionist</button>} />
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className="p-4">
                <div className="flex items-center gap-3">
                  <AvatarInitial name={`${r.firstName || ''} ${r.lastName || ''}`.trim() || 'R'} />
                  <div className="min-w-0">
                    <div className="font-medium text-gray-900 truncate">{r.firstName} {r.lastName}</div>
                    <div className="text-xs text-gray-500 truncate">{r.email || '-'}</div>
                  </div>
                  <div className="ml-auto"><StatusChip status={r.status} /></div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-gray-500">Shift:</span> {r.shift || '-'}</div>
                  <div><span className="text-gray-500">Joined:</span> {r.dateOfJoining || '-'}</div>
                  <div className="col-span-2"><span className="text-gray-500">Emergency:</span> {r.emergencyContactName || '-'} {r.emergencyContactPhone ? `• ${r.emergencyContactPhone}` : ''}</div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button onClick={() => { setEditing(r); setIsOpen(true); }} className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md">Edit</button>
                  <button onClick={() => onToggleStatus(r)} className="px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md">{r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                  <button onClick={() => onDelete(r.id)} className="px-3 py-1.5 text-xs bg-rose-600 text-white rounded-md">Archive</button>
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="px-3 py-1.5 text-xs border rounded-md"
                  >{expandedId === r.id ? 'Show less' : 'Show more'}</button>
                </div>
                {expandedId === r.id && (
                  <div className="mt-3 border rounded-lg p-3 bg-white">
                    <div className="grid grid-cols-1 gap-3 text-sm">
                      <div><span className="text-gray-500">Gender:</span> {r.gender || '-'}</div>
                      <div><span className="text-gray-500">DOB:</span> {r.dateOfBirth || '-'}</div>
                      <div><span className="text-gray-500">Salary:</span> {r.salary != null ? `₹${r.salary}` : '-'}</div>
                      <div><span className="text-gray-500">Address:</span> {[r.addressLine1, r.addressLine2, r.city, r.state, r.postalCode, r.country].filter(Boolean).join(', ') || '-'}</div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Desktop/tablet table */}
        <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">Shift</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <SkeletonTable rows={6} cols={5} />
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState title="No receptionists found" description="Try changing filters or add a new receptionist." action={<button onClick={() => { setEditing(null); setIsOpen(true); }} className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700"><FiUserPlus /> Add Receptionist</button>} />
                </td>
              </tr>
            ) : (
              filtered.map(r => (
                <React.Fragment key={r.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3 min-w-0">
                        <AvatarInitial name={`${r.firstName || ''} ${r.lastName || ''}`.trim() || 'R'} />
                        <span className="truncate" title={`${r.firstName || ''} ${r.lastName || ''}`}>
                          {r.firstName} {r.lastName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{r.email || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap"><StatusChip status={r.status} /></td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {r.shift ? (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded-md bg-blue-50 text-blue-700 border border-blue-200">{r.shift}</span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="hidden md:flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-md border transition-colors ${expandedId === r.id ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}`}
                        >
                          {expandedId === r.id ? 'Show less' : 'Show more'}
                        </button>
                        <button onClick={() => { setEditing(r); setIsOpen(true); }} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm"><FiEdit2 /> Edit</button>
                        <button onClick={() => onToggleStatus(r)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-amber-500 text-white rounded-md hover:bg-amber-600 shadow-sm"><FiPower /> {r.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                        <button onClick={() => onDelete(r.id)} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-rose-600 text-white rounded-md hover:bg-rose-700 shadow-sm"><FiTrash2 /> Archive</button>
                      </div>
                      <div className="md:hidden inline-flex items-center gap-1 justify-end">
                        <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="px-2 py-1 text-xs rounded-md border bg-white border-gray-200 text-gray-700">{expandedId === r.id ? 'Less' : 'More'}</button>
                        <button onClick={() => { setEditing(r); setIsOpen(true); }} className="p-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"><FiEdit2 /></button>
                        <button onClick={() => onToggleStatus(r)} className="p-2 rounded-md bg-amber-500 text-white hover:bg-amber-600"><FiPower /></button>
                        <button onClick={() => onDelete(r.id)} className="p-2 rounded-md bg-rose-600 text-white hover:bg-rose-700"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                  {expandedId === r.id && (
                    <tr className="bg-white/70">
                      <td colSpan={5} className="px-6 pb-4">
                        <div className="mt-0 border rounded-lg p-4 bg-white shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <div className="text-gray-500">Gender</div>
                              <div className="font-medium text-gray-800">{r.gender || '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Date of Birth</div>
                              <div className="font-medium text-gray-800">{r.dateOfBirth || '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Joined</div>
                              <div className="font-medium text-gray-800">{r.dateOfJoining || '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Shift</div>
                              <div className="font-medium text-gray-800">{r.shift || '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Salary</div>
                              <div className="font-medium text-gray-800">{r.salary != null ? `₹${r.salary}` : '-'}</div>
                            </div>
                            <div>
                              <div className="text-gray-500">Emergency Contact</div>
                              <div className="font-medium text-gray-800">{r.emergencyContactName || '-'} {r.emergencyContactPhone ? `• ${r.emergencyContactPhone}` : ''}</div>
                            </div>
                            <div className="md:col-span-3">
                              <div className="text-gray-500">Address</div>
                              <div className="font-medium text-gray-800">{[r.addressLine1, r.addressLine2, r.city, r.state, r.postalCode, r.country].filter(Boolean).join(', ') || '-'}</div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
  </div>
      </SectionCard>

      <ReceptionistModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        initial={editing}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              const updated = await updateReceptionist(editing.id, payload);
              setList(prev => prev.map(r => r.id === editing.id ? updated : r));
              toast.success('Receptionist updated');
            } else {
              const created = await createReceptionist(payload);
              setList(prev => [created, ...prev]);
              toast.success('Receptionist created');
            }
          } catch (e) {
            // Let the modal display inline field errors and keep it open
            throw e;
          } finally {
            setEditing(null);
          }
        }}
      />

      <ConfirmDialog
        isOpen={confirm.open}
        title={confirm.title}
        description={confirm.description}
        confirmText="Archive"
        onConfirm={confirm.onConfirm}
        onClose={() => setConfirm((c) => ({ ...c, open: false }))}
      />
    </div>
  );
};

export default ReceptionistsPage;
