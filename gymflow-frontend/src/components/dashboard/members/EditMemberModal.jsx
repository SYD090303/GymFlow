import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { getMembershipPlans } from '../../../services/membershipPlanService';

const EditMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '', // optional; fallback will be used if left empty
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
        password: '',
        membershipPlanId: member.membershipPlan?.id || '',
        startDate: member.startDate || '',
        autoRenew: !!member.autoRenew,
        height: member.height ?? '',
        weight: member.weight ?? '',
        medicalConditions: member.medicalConditions || '',
        injuries: member.injuries || '',
        allergies: member.allergies || '',
      });
    }
  }, [member]);

  const handleChange = (e) => {
    const { name, type, value, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        email: (form.email || '').trim(),
        firstName: (form.firstName || '').trim(),
        lastName: (form.lastName || '').trim(),
        password: form.password && form.password.length >= 8 ? form.password : 'Temp@1234',
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={onClose}>
        <motion.div className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <h2 className="text-2xl font-bold mb-6">Edit Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="First Name" required pattern="^[A-Za-z]+$" className="w-full px-4 py-2 border rounded-lg" />
              <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Last Name" required pattern="^[A-Za-z]+$" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="w-full px-4 py-2 border rounded-lg" />
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone (10 digits)" pattern="^[0-9]{10}$" maxLength={10} required className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Membership Plan</label>
                <select name="membershipPlanId" value={form.membershipPlanId} onChange={handleChange} required disabled={plansLoading} className="w-full px-4 py-2 border rounded-lg">
                  <option value="">{plansLoading ? 'Loading plans…' : 'Select a plan'}</option>
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.planType} • {p.duration} • ₹{p.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input name="startDate" type="date" value={form.startDate || ''} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input id="autoRenew" name="autoRenew" type="checkbox" checked={!!form.autoRenew} onChange={handleChange} className="h-4 w-4" />
              <label htmlFor="autoRenew" className="text-sm">Enable Auto-renew</label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input name="height" type="number" step="0.1" min="50" max="250" value={form.height} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input name="weight" type="number" step="0.1" min="20" max="300" value={form.weight} onChange={handleChange} required className="w-full px-4 py-2 border rounded-lg" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input name="medicalConditions" value={form.medicalConditions} onChange={handleChange} placeholder="Medical conditions (optional)" className="w-full px-4 py-2 border rounded-lg" />
              <input name="injuries" value={form.injuries} onChange={handleChange} placeholder="Injuries (optional)" className="w-full px-4 py-2 border rounded-lg" />
              <input name="allergies" value={form.allergies} onChange={handleChange} placeholder="Allergies (optional)" className="w-full px-4 py-2 border rounded-lg" />
            </div>
            <p className="text-xs text-gray-500">Note: Password is required by validation; if left empty a temporary one will be used.</p>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Set new password (optional)" className="w-full px-4 py-2 border rounded-lg" />
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">{loading ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default EditMemberModal;
