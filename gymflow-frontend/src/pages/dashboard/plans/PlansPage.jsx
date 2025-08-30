import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiPower, FiMoreVertical, FiLayers } from 'react-icons/fi';
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan, deleteMembershipPlan, activateMembershipPlan, deactivateMembershipPlan } from '../../../services/membershipPlanService';
import toast from 'react-hot-toast';
import { extractErrorMessage } from '../../../utils/errors';
import PlanModal from '../../../components/dashboard/plans/PlanModal';
import ConfirmationModal from '../../../components/dashboard/members/ConfirmationModal';
import PageHeader from '../../../components/dashboard/PageHeader';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, title: '', description: '', onConfirm: null });
  const [search, setSearch] = useState('');

  const load = async (signal) => {
    setLoading(true);
    try {
      const data = await getMembershipPlans();
      if (!signal?.aborted) setPlans(Array.isArray(data) ? data : []);
    } catch (e) {
      if (!signal?.aborted) toast.error(extractErrorMessage(e, 'Failed to load plans'));
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);

  const toggleStatus = async (plan) => {
    try {
      if (plan.status === 'ACTIVE') {
        await deactivateMembershipPlan(plan.id);
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'INACTIVE' } : p));
        toast.success('Plan deactivated');
      } else {
        await activateMembershipPlan(plan.id);
        setPlans(prev => prev.map(p => p.id === plan.id ? { ...p, status: 'ACTIVE' } : p));
        toast.success('Plan activated');
      }
    } catch (e) {
      toast.error(extractErrorMessage(e, 'Failed to update status'));
    }
  };

  const confirmDelete = (plan) => {
    setConfirm({
      open: true,
      title: 'Delete Plan',
      description: `Delete plan ${plan.planType}? This cannot be undone.`,
      onConfirm: async () => {
        try {
          await deleteMembershipPlan(plan.id);
          setPlans(prev => prev.filter(p => p.id !== plan.id));
          toast.success('Plan deleted');
        } catch (e) {
          toast.error(extractErrorMessage(e, 'Failed to delete plan'));
        } finally {
          setConfirm({ open: false });
        }
      }
    });
  };

  return (
    <div className="p-6">
      <PageHeader icon={<FiLayers />} title="Membership Plans" subtitle="Create, edit, and manage plans and pricing.">
        <button
          onClick={() => { setEditing(null); setIsOpen(true); }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm hover:from-indigo-700 hover:to-violet-700"
        >
          <FiPlus /> Add Plan
        </button>
      </PageHeader>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 md:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] uppercase tracking-wider text-gray-500 mb-1">Search</label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e)=>setSearch(e.target.value)}
                placeholder="Search by type or description"
                className="w-full border rounded-lg pl-10 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden divide-y">
        {loading ? (
          <div className="p-4 text-sm text-gray-500">Loading plans…</div>
        ) : filtered(plans, search).length === 0 ? (
          <div className="p-6 text-sm text-gray-500">No plans found. Try a different search.</div>
        ) : (
          filtered(plans, search).map((p) => (
            <div key={p.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-gray-900 truncate">{nice(p.planType || '-')}</div>
                  <div className="text-sm text-gray-700 mt-0.5">₹ {p.price} {p.duration ? `• ${p.duration}` : ''}</div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-medium ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {p.status || 'INACTIVE'}
                    </span>
                  </div>
                </div>
              </div>
              {p.description && (
                <div className="mt-2 text-sm text-gray-700 line-clamp-3">{p.description}</div>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => { setEditing(p); setIsOpen(true); }}
                  className="px-3 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                >Edit</button>
                <button
                  onClick={() => toggleStatus(p)}
                  className="px-3 py-1.5 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600"
                >{p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                <button
                  onClick={() => confirmDelete(p)}
                  className="px-3 py-1.5 text-xs rounded-md bg-rose-600 text-white hover:bg-rose-700"
                >Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop/tablet table */}
      <div className="hidden md:block bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full table-auto border-separate border-spacing-0">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr className="text-gray-600">
                <th className="px-4 py-3 text-left font-medium">Plan Type</th>
                <th className="px-4 py-3 text-left hidden md:table-cell font-medium">Duration</th>
                <th className="px-4 py-3 text-left font-medium">Price</th>
                <th className="px-4 py-3 text-left hidden md:table-cell font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Description</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="p-4 text-sm text-gray-500" colSpan={6}>Loading plans…</td></tr>
              ) : filtered(plans, search).length === 0 ? (
                <tr><td className="p-6 text-sm text-gray-500" colSpan={6}>No plans found. Try a different search.</td></tr>
              ) : (
                filtered(plans, search).map((p, i) => (
                  <motion.tr key={p.id} {...variants.tableRow} transition={{ ...variants.tableRow.transition, delay: i * 0.03 }} className="hover:bg-gray-50/60">
                    <td className="px-4 py-3 font-medium text-gray-800 border-t border-gray-100">{nice(p.planType || '-')}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-gray-700 border-t border-gray-100">{nice(p.duration || '-')}</td>
                    <td className="px-4 py-3 font-semibold text-gray-900 border-t border-gray-100 whitespace-nowrap">₹ {p.price}</td>
                    <td className="px-4 py-3 hidden md:table-cell border-t border-gray-100">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${p.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {p.status || 'INACTIVE'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700 border-t border-gray-100 whitespace-normal break-words">
                      <div className="max-w-[700px]">{p.description}</div>
                    </td>
                    <td className="px-4 py-3 border-t border-gray-100">
                      <div className="hidden lg:flex justify-end gap-2 flex-wrap">
                        <button
                          onClick={()=>{ setEditing(p); setIsOpen(true); }}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                          title="Edit"
                        >
                          <FiEdit2 /> Edit
                        </button>
                        <button
                          onClick={()=>toggleStatus(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                          title={p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        >
                          <FiPower /> {p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={()=>confirmDelete(p)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md bg-rose-600 text-white hover:bg-rose-700 shadow-sm"
                          title="Delete"
                        >
                          <FiTrash2 /> Delete
                        </button>
                      </div>
                      <div className="lg:hidden flex justify-end">
                        <MoreActions plan={p} onToggleStatus={toggleStatus} onDelete={confirmDelete} />
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PlanModal
        isOpen={isOpen}
        onClose={()=>setIsOpen(false)}
        initial={editing}
        onSubmit={async (payload)=>{
          try {
            if (editing) {
              const updated = await updateMembershipPlan(editing.id, payload);
              setPlans((prev)=>prev.map(pl=>pl.id===editing.id? updated: pl));
              toast.success('Plan updated');
            } else {
              const created = await createMembershipPlan(payload);
              setPlans((prev)=>[created, ...prev]);
              toast.success('Plan created');
            }
          } catch (e) {
            toast.error(extractErrorMessage(e, 'Failed to save plan'));
          }
        }}
      />

      <ConfirmationModal
        isOpen={confirm.open}
        onClose={()=>setConfirm({open:false})}
        title={confirm.title}
        description={confirm.description}
        onConfirm={confirm.onConfirm}
        confirmText="Confirm"
      />
    </div>
  );
};

export default PlansPage;

// Helpers
const filtered = (plans, search) => {
  const term = search.trim().toLowerCase();
  if (!term) return plans;
  return plans.filter(p =>
    (p.planType || '').toLowerCase().includes(term) ||
    (p.description || '').toLowerCase().includes(term)
  );
};

const nice = (s='') => String(s).replace(/_/g,' ').toLowerCase().replace(/\b\w/g,m=>m.toUpperCase());

const MoreActions = ({ plan, onToggleStatus, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        onClick={()=>setOpen(o=>!o)}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs border rounded-md hover:bg-gray-50"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <FiMoreVertical /> More
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...variants.scaleIn} className="absolute right-0 mt-1 w-44 bg-white border rounded-lg shadow-lg z-20 overflow-hidden">
            <button onClick={()=>{ setOpen(false); onToggleStatus(plan); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 inline-flex items-center gap-2">
              <FiPower className="text-amber-600" /> {plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
            </button>
            <button onClick={()=>{ setOpen(false); onDelete(plan); }} className="w-full text-left px-3 py-2 text-xs text-rose-600 hover:bg-gray-50 inline-flex items-center gap-2">
              <FiTrash2 /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
