import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';

const PLAN_TYPES = [
  'HARDCORE',
  'CARDIO',
  'PREMIUM_FEATURES',
];

const DURATIONS = [
  'ONE_MONTH',
  'THREE_MONTHS',
  'SIX_MONTHS',
  'TWELVE_MONTHS',
];

const nice = (s) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (m) => m.toUpperCase());

const PlanModal = ({ isOpen, onClose, onSubmit, initial }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    planType: '',
    price: '',
    description: '',
    duration: '',
  });
  const [autoDescription, setAutoDescription] = useState(true);

  const suggestedPriceMap = {
    HARDCORE: { ONE_MONTH: 999, THREE_MONTHS: 2699, SIX_MONTHS: 4999, TWELVE_MONTHS: 8999 },
    CARDIO: { ONE_MONTH: 799, THREE_MONTHS: 2099, SIX_MONTHS: 3899, TWELVE_MONTHS: 6999 },
    PREMIUM_FEATURES: { ONE_MONTH: 1499, THREE_MONTHS: 4299, SIX_MONTHS: 7999, TWELVE_MONTHS: 14999 },
  };

  useEffect(() => {
    if (initial) {
      setForm({
        planType: initial.planType ?? '',
        price: initial.price ?? '',
        description: initial.description ?? '',
        duration: initial.duration ?? '',
      });
      setAutoDescription(!initial.description || String(initial.description).trim() === '');
    } else {
      setForm({ planType: '', price: '', description: '', duration: '' });
      setAutoDescription(true);
    }
  }, [initial, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'description') {
      setAutoDescription(false);
    }
    setForm((f) => ({ ...f, [name]: value }));
  };

  // Generate description text based on selected planType and duration
  const generateDescription = (planType, duration) => {
    const pt = nice(planType);
    const durationLabels = {
      ONE_MONTH: '1 Month',
      THREE_MONTHS: '3 Months',
      SIX_MONTHS: '6 Months',
      TWELVE_MONTHS: '12 Months',
    };
    const typeDescriptions = {
      HARDCORE: 'High-intensity strength program focused on building muscle and strength.',
      CARDIO: 'Cardio-focused plan to improve stamina and aid weight loss.',
      PREMIUM_FEATURES: 'Premium plan with added perks like priority bookings and extra services.',
    };
    const durText = durationLabels[duration] || nice(duration);
    const typeDesc = typeDescriptions[planType] || '';
    return `${pt} — ${durText}: ${typeDesc}`;
  };

  // Auto-update description when planType/duration change and still auto-managed
  useEffect(() => {
    if (!autoDescription) return;
    if (!form.planType || !form.duration) return;
    setForm((prev) => ({ ...prev, description: generateDescription(prev.planType, prev.duration) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.planType, form.duration, autoDescription]);

  // Suggest price on planType/duration change if not set
  useEffect(() => {
    const suggested = suggestedPriceMap[form.planType]?.[form.duration];
    if (!suggested) return;
    const priceNum = parseFloat(String(form.price || ''));
    if (!form.price || isNaN(priceNum) || priceNum <= 0) {
      setForm((prev) => ({ ...prev, price: String(suggested) }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.planType, form.duration]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        planType: form.planType,
        price: form.price ? parseFloat(form.price) : null,
        description: form.description,
        duration: form.duration,
      };
      await onSubmit(payload);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={onClose}>
        <motion.div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-4">{initial ? 'Edit Plan' : 'Create Plan'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Plan Type</label>
              <select name="planType" value={form.planType} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Select Type</option>
                {PLAN_TYPES.map((t) => (
                  <option key={t} value={t}>{nice(t)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (₹)</label>
              <input type="number" name="price" min="0" step="0.01" value={form.price} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-gray-500">Price suggestions are auto-filled based on plan and duration. You can override.</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <select name="duration" value={form.duration} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm">
                <option value="">Select Duration</option>
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{nice(d)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
              <p className="mt-1 text-xs text-gray-500">{autoDescription ? 'Auto-generated from Plan Type & Duration. Edit to customize.' : 'You edited the description manually.'}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-md">Cancel</button>
              <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50">{loading ? 'Saving...' : (initial ? 'Save Changes' : 'Create Plan')}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PlanModal;
