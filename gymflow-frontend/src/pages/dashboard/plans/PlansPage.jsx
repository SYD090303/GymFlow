import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { getMembershipPlans, createMembershipPlan, updateMembershipPlan, deleteMembershipPlan, activateMembershipPlan, deactivateMembershipPlan } from '../../../services/membershipPlanService';
import toast from 'react-hot-toast';
import PlanModal from '../../../components/dashboard/plans/PlanModal';
import ConfirmationModal from '../../../components/dashboard/members/ConfirmationModal';

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
      if (!signal?.aborted) toast.error('Failed to load plans');
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
    } catch {
      toast.error('Failed to update status');
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
        } catch {
          toast.error('Failed to delete plan');
        } finally {
          setConfirm({ open: false });
        }
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Membership Plans</h1>
        <button onClick={() => { setEditing(null); setIsOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700">Add Plan</button>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 md:p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Search</label>
            <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by type or description" className="w-full border rounded-md px-3 py-2 text-sm" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-x-auto">
        <table className="min-w-[760px] w-full table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-56">Plan Type</th>
              <th className="p-3 text-left w-40 hidden md:table-cell">Duration</th>
              <th className="p-3 text-left w-32">Price</th>
              <th className="p-3 text-left w-28 hidden md:table-cell">Status</th>
              <th className="p-3 text-left">Description</th>
              <th className="p-3 text-right w-64">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td className="p-4" colSpan={5}>Loading...</td></tr>
            ) : filtered(plans, search).length === 0 ? (
              <tr><td className="p-4" colSpan={5}>No plans found</td></tr>
            ) : (
              filtered(plans, search).map((p, i) => (
                <motion.tr key={p.id} {...variants.tableRow} transition={{ ...variants.tableRow.transition, delay: i * 0.03 }} className="hover:bg-gray-50">
                  <td className="p-3 truncate">{p.planType}</td>
                  <td className="p-3 hidden md:table-cell">{p.duration}</td>
                  <td className="p-3">₹ {p.price}</td>
                  <td className="p-3 hidden md:table-cell">
                    <span className={`px-2 py-0.5 rounded-full border text-xs ${p.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>{p.status || 'INACTIVE'}</span>
                  </td>
                  <td className="p-3 truncate" title={p.description}>{p.description}</td>
                  <td className="p-3 text-right">
                    <div className="hidden xl:flex justify-end gap-2">
                      <button onClick={()=>{ setEditing(p); setIsOpen(true); }} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md shadow-sm">Edit</button>
                      <button onClick={()=>toggleStatus(p)} className="px-3 py-1 text-xs bg-yellow-500 text-white rounded-md shadow-sm">{p.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
                      <button onClick={()=>confirmDelete(p)} className="px-3 py-1 text-xs bg-red-600 text-white rounded-md shadow-sm">Delete</button>
                    </div>
                    <div className="xl:hidden flex justify-end gap-2">
                      <button onClick={()=>{ setEditing(p); setIsOpen(true); }} className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md">Edit</button>
                      <MoreActions plan={p} onToggleStatus={toggleStatus} onDelete={confirmDelete} />
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
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
          } catch {
            toast.error('Failed to save plan');
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

const MoreActions = ({ plan, onToggleStatus, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button onClick={()=>setOpen(o=>!o)} className="px-2.5 py-1 text-xs border rounded">More</button>
      <AnimatePresence>
        {open && (
          <motion.div {...variants.scaleIn} className="absolute right-0 mt-1 w-40 bg-white border rounded shadow z-10">
            <button onClick={()=>{ setOpen(false); onToggleStatus(plan); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50">{plan.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}</button>
            <button onClick={()=>{ setOpen(false); onDelete(plan); }} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-gray-50">Delete</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
