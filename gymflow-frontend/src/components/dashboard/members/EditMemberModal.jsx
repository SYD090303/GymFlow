import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { getMembershipPlans } from '../../../services/membershipPlanService';

import toast from 'react-hot-toast';
import { extractErrorMessage, extractFieldErrors } from '../../../utils/errors';

const EditMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    membershipPlanId: '',
    startDate: '',
    autoRenew: false,
    height: '',
    weight: '',
    medicalConditions: '',
    injuries: '',
    allergies: '',
  });
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isOpen) return;
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        const data = await getMembershipPlans();
        setPlans(data || []);
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, [isOpen]);

  useEffect(() => {
    if (member) {
      setForm({
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        membershipPlanId: member.membershipPlan?.id || '',
        startDate: member.startDate || '',
        autoRenew: !!member.autoRenew,
        height: member.height ?? '',
        weight: member.weight ?? '',
        medicalConditions: member.medicalConditions || '',
        injuries: member.injuries || '',
        allergies: member.allergies || '',
      });
  setFieldErrors({});
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFieldErrors({});
    try {
      const payload = {
        email: (form.email || '').trim(),
        firstName: (form.firstName || '').trim(),
        lastName: (form.lastName || '').trim(),
        phone: form.phone,
        membershipPlanId: form.membershipPlanId ? Number(form.membershipPlanId) : undefined,
        startDate: form.startDate,
        autoRenew: !!form.autoRenew,
        height: form.height ? parseFloat(form.height) : undefined,
        weight: form.weight ? parseFloat(form.weight) : undefined,
        medicalConditions: form.medicalConditions || '',
        injuries: form.injuries || '',
        allergies: form.allergies || '',
      };
      await onSave(payload);
      onClose();
    } catch (error) {
      const fe = extractFieldErrors(error);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
        // Focus first field with error
        const order = ['firstName','lastName','email','phone','membershipPlanId','startDate','height','weight','medicalConditions','injuries','allergies'];
        const first = order.find((k) => fe[k]);
        if (first) {
          setTimeout(() => {
            const node = document.querySelector(`[name="${first}"]`);
            node?.focus();
          }, 50);
        }
        toast.error('Please fix the highlighted fields');
      } else {
        toast.error(extractErrorMessage(error, 'Failed to save changes'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={onClose}>
        <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <h2 className="text-lg font-semibold">Edit Member</h2>
            <p className="text-xs text-white/80">Update details and plan</p>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required pattern="^[A-Za-z]+$" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.firstName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.firstName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required pattern="^[A-Za-z]+$" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.lastName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.lastName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" pattern="^[0-9]{10}$" maxLength={10} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.phone ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.phone && <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Membership Plan</label>
                <select name="membershipPlanId" value={form.membershipPlanId} onChange={handleChange} required disabled={plansLoading} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100 ${fieldErrors.membershipPlanId ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}>
                  <option value="">{plansLoading ? 'Loading plans…' : 'Select a plan'}</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planType} • {p.duration} • ₹{p.price}
                    </option>
                  ))}
                </select>
                {fieldErrors.membershipPlanId && <p className="mt-1 text-xs text-rose-600">{fieldErrors.membershipPlanId}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input name="startDate" type="date" value={form.startDate || ''} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.startDate ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.startDate && <p className="mt-1 text-xs text-rose-600">{fieldErrors.startDate}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="autoRenew" name="autoRenew" type="checkbox" checked={!!form.autoRenew} onChange={handleChange} className="h-4 w-4" />
              <label htmlFor="autoRenew" className="text-sm">Enable Auto-renew</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input name="height" type="number" step="0.1" min="50" max="250" value={form.height} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.height ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.height && <p className="mt-1 text-xs text-rose-600">{fieldErrors.height}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input name="weight" type="number" step="0.1" min="20" max="300" value={form.weight} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.weight ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.weight && <p className="mt-1 text-xs text-rose-600">{fieldErrors.weight}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input name="medicalConditions" value={form.medicalConditions} onChange={handleChange} placeholder="Medical conditions (optional)" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.medicalConditions ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.medicalConditions && <p className="mt-1 text-xs text-rose-600">{fieldErrors.medicalConditions}</p>}
              </div>
              <div>
                <input name="injuries" value={form.injuries} onChange={handleChange} placeholder="Injuries (optional)" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.injuries ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.injuries && <p className="mt-1 text-xs text-rose-600">{fieldErrors.injuries}</p>}
              </div>
              <div>
                <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Allergies (optional)" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.allergies ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.allergies && <p className="mt-1 text-xs text-rose-600">{fieldErrors.allergies}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditMemberModal;
