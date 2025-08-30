import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import { createMember } from '../../../services/memberService';
import { getMembershipPlans } from '../../../services/membershipPlanService';
import toast from 'react-hot-toast';
import { extractErrorMessage, extractFieldErrors } from '../../../utils/errors';

const AddMemberModal = ({ isOpen, onClose, onMemberAdded }) => {
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  // Controlled fields to support auto-fill of price from selected plan
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  // Multistep state
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = [useRef(null), useRef(null), useRef(null)];
  const steps = ['Personal Info', 'Plan & Payment', 'Fitness & Medical'];
  const [fieldErrors, setFieldErrors] = useState({});

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
  toast.error(extractErrorMessage(e, 'Failed to load membership plans'));
      } finally {
        setPlansLoading(false);
      }
    };
    loadPlans();
  }, [isOpen]);

  const validateCurrentStep = () => {
    const root = stepRefs[currentStep]?.current;
    if (!root) return true;
    const fields = root.querySelectorAll('input, select, textarea');
    for (const el of fields) {
      if (typeof el.checkValidity === 'function' && !el.checkValidity()) {
        if (typeof el.reportValidity === 'function') el.reportValidity();
        el.focus();
        return false;
      }
    }
    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFieldErrors({});

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
      const msg = extractErrorMessage(error, 'Failed to add member');
      const fe = extractFieldErrors(error);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
        // Focus first errored field across steps
        const order = ['firstName','lastName','email','password','phone','membershipPlanId','startDate','amountPaid','paymentMethod','height','weight','medicalConditions','injuries','allergies'];
        const first = order.find((k) => fe[k]);
        if (first) {
          // figure out which step has this input
          const findStepIndex = () => {
            for (let i = 0; i < stepRefs.length; i++) {
              const root = stepRefs[i]?.current;
              if (!root) continue;
              if (root.querySelector(`[name="${first}"]`)) return i;
            }
            return 0;
          };
          const idx = findStepIndex();
          setCurrentStep(idx);
          setTimeout(() => {
            const root = stepRefs[idx]?.current;
            const node = root?.querySelector(`[name="${first}"]`);
            node?.focus();
          }, 50);
        }
        toast.error('Please fix the highlighted fields');
      } else {
        toast.error(msg);
      }
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
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        {...variants.scaleIn}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
          <h2 className="text-lg font-semibold">Add New Member</h2>
          <div className="mt-3 flex items-center gap-2">
            {steps.map((label, idx) => (
              <div key={label} className="flex items-center">
                <div className={`w-6 h-6 rounded-full text-xs flex items-center justify-center border ${idx <= currentStep ? 'bg-white text-indigo-600 border-white' : 'bg-white/20 text-white border-white/30'}`}>{idx+1}</div>
                {idx < steps.length - 1 && (
                  <div className={`w-10 h-[2px] mx-2 ${idx < currentStep ? 'bg-white' : 'bg-white/40'}`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-xs text-white/80 mt-1">{steps[currentStep]}</p>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Step 1: Personal Info */}
          <div ref={stepRefs[0]} className={currentStep === 0 ? 'block' : 'hidden'} aria-hidden={currentStep !== 0}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input name="firstName" placeholder="First Name" required pattern="^[A-Za-z]+$" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.firstName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.firstName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.firstName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input name="lastName" placeholder="Last Name" required pattern="^[A-Za-z]+$" className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.lastName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.lastName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.lastName}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input name="email" type="email" placeholder="you@example.com" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Temporary Password</label>
                <input name="password" type="password" placeholder="Strong password" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input name="phone" placeholder="10-digit phone" pattern="^[0-9]{10}$" maxLength={10} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.phone ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
              {fieldErrors.phone && <p className="mt-1 text-xs text-rose-600">{fieldErrors.phone}</p>}
            </div>
          </div>

          {/* Step 2: Plan & Payment */}
          <div ref={stepRefs[1]} className={currentStep === 1 ? 'block' : 'hidden'} aria-hidden={currentStep !== 1}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Membership Plan</label>
                <select
                  name="membershipPlanId"
                  required
                  disabled={plansLoading}
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100 ${fieldErrors.membershipPlanId ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  value={selectedPlanId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedPlanId(val);
                    const plan = plans.find(p => String(p.id) === String(val));
                    if (plan) {
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
                <input name="startDate" type="date" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.startDate ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.startDate && <p className="mt-1 text-xs text-rose-600">{fieldErrors.startDate}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount Paid (₹)</label>
                <input
                  name="amountPaid"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.amountPaid ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">Auto-filled from selected plan. You can adjust if needed.</p>
                {fieldErrors.amountPaid && <p className="mt-1 text-xs text-rose-600">{fieldErrors.amountPaid}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select name="paymentMethod" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.paymentMethod ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}>
                  <option value="">Select method</option>
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="WALLET">Wallet</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                </select>
                {fieldErrors.paymentMethod && <p className="mt-1 text-xs text-rose-600">{fieldErrors.paymentMethod}</p>}
              </div>
              <div className="flex items-end">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" name="autoRenew" className="h-4 w-4" />
                  <span className="text-sm">Enable Auto-renew</span>
                </label>
              </div>
            </div>
          </div>

          {/* Step 3: Fitness & Medical */}
          <div ref={stepRefs[2]} className={currentStep === 2 ? 'block' : 'hidden'} aria-hidden={currentStep !== 2}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Height (cm)</label>
                <input name="height" type="number" step="0.1" min="50" max="250" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.height ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.height && <p className="mt-1 text-xs text-rose-600">{fieldErrors.height}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Weight (kg)</label>
                <input name="weight" type="number" step="0.1" min="20" max="300" required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.weight ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                {fieldErrors.weight && <p className="mt-1 text-xs text-rose-600">{fieldErrors.weight}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <input name="medicalConditions" placeholder="Medical conditions (optional)" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
              <input name="injuries" placeholder="Injuries (optional)" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
              <input name="allergies" placeholder="Allergies (optional)" className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm" />
            </div>
          </div>

          <div className="flex justify-between gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
            <div className="flex gap-2">
              {currentStep > 0 && (
                <button type="button" onClick={goBack} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Back</button>
              )}
              {currentStep < steps.length - 1 ? (
                <button type="button" onClick={goNext} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">Next</button>
              ) : (
                <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm">{loading ? 'Adding...' : 'Add Member'}</button>
              )}
            </div>
          </div>
        </form>
            </motion.div>
        </motion.div>
    </AnimatePresence>
  );
};

export default AddMemberModal;
