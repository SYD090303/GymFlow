import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { createMember } from '../../../services/memberService';
import { getMembershipPlans } from '../../../services/membershipPlanService';
import toast from 'react-hot-toast';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  // Controlled fields to support auto-fill of price from selected plan
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');

  useEffect(() => {
    if (!isOpen) return;
  // Reset form-specific state when opening
  setSelectedPlanId('');
  setAmountPaid('');
    const loadPlans = async () => {
      setPlansLoading(true);
      try {
        const data = await getMembershipPlans();
        setPlans(data || []);
      } catch (e) {
        toast.error('Failed to load membership plans');
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, [isOpen]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData(event.target);
    const raw = Object.fromEntries(formData.entries());
    // Build payload matching MemberRequestDto with proper types
    const payload = {
      email: (raw.email || '').trim(),
      firstName: (raw.firstName || '').trim(),
      lastName: (raw.lastName || '').trim(),
      password: raw.password,
      phone: raw.phone,
  membershipPlanId: raw.membershipPlanId ? Number(raw.membershipPlanId) : undefined,
      startDate: raw.startDate, // YYYY-MM-DD
      autoRenew: raw.autoRenew === 'on' || raw.autoRenew === 'true',
  amountPaid: raw.amountPaid ? parseFloat(raw.amountPaid) : undefined,
      paymentMethod: raw.paymentMethod, // CASH|CARD|UPI|WALLET|BANK_TRANSFER
      height: raw.height ? parseFloat(raw.height) : undefined,
      weight: raw.weight ? parseFloat(raw.weight) : undefined,
      medicalConditions: raw.medicalConditions || '',
      injuries: raw.injuries || '',
      allergies: raw.allergies || '',
    };

    try {
      const newMember = await createMember(payload);
      onMemberAdded(newMember);
      toast.success('Member added successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to add member.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
  <AnimatePresence>
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4"
      {...variants.backdrop}
      onClick={onClose}
    >
      <motion.div
        className="relative bg-white p-8 rounded-2xl shadow-2xl w-full max-w-lg"
        {...variants.scaleIn}
        onClick={(e) => e.stopPropagation()}
      >
                <h2 className="text-2xl font-bold mb-6">Add New Member</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input name="firstName" placeholder="First Name" required pattern="^[A-Za-z]+$" className="w-full px-4 py-2 border rounded-lg" />
                        <input name="lastName" placeholder="Last Name" required pattern="^[A-Za-z]+$" className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input name="email" type="email" placeholder="Email" required className="w-full px-4 py-2 border rounded-lg" />
                      <input name="password" type="password" placeholder="Temporary Password" required className="w-full px-4 py-2 border rounded-lg" />
                    </div>
                    <input name="phone" placeholder="Phone (10 digits)" pattern="^[0-9]{10}$" maxLength={10} required className="w-full px-4 py-2 border rounded-lg" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Membership Plan</label>
                        <select
                          name="membershipPlanId"
                          required
                          disabled={plansLoading}
                          className="w-full px-4 py-2 border rounded-lg"
                          value={selectedPlanId}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedPlanId(val);
                            const plan = plans.find(p => String(p.id) === String(val));
                            if (plan) {
                              // Prefer numeric price field; fallback if backend shape differs
                              const price = plan.price ?? plan.amount ?? '';
                              setAmountPaid(price !== '' && price != null ? String(price) : '');
                            } else {
                              setAmountPaid('');
                            }
                          }}
                        >
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
                        <input name="startDate" type="date" required className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
                        <input
                          name="amountPaid"
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          className="w-full px-4 py-2 border rounded-lg"
                          value={amountPaid}
                          onChange={(e) => setAmountPaid(e.target.value)}
                        />
                        <p className="mt-1 text-xs text-gray-500">Auto-filled from selected plan. You can adjust if needed.</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Method</label>
                        <select name="paymentMethod" required className="w-full px-4 py-2 border rounded-lg">
                          <option value="">Select method</option>
                          <option value="CASH">Cash</option>
                          <option value="CARD">Card</option>
                          <option value="UPI">UPI</option>
                          <option value="WALLET">Wallet</option>
                          <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="autoRenew" className="h-4 w-4" />
                          <span className="text-sm">Enable Auto-renew</span>
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Height (cm)</label>
                        <input name="height" type="number" step="0.1" min="50" max="250" required className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                        <input name="weight" type="number" step="0.1" min="20" max="300" required className="w-full px-4 py-2 border rounded-lg" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input name="medicalConditions" placeholder="Medical conditions (optional)" className="w-full px-4 py-2 border rounded-lg" />
                      <input name="injuries" placeholder="Injuries (optional)" className="w-full px-4 py-2 border rounded-lg" />
                      <input name="allergies" placeholder="Allergies (optional)" className="w-full px-4 py-2 border rounded-lg" />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50">
                            {loading ? 'Adding...' : 'Add Member'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default AddMemberModal;
