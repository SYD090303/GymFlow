import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import toast from 'react-hot-toast';
import { extractErrorMessage, extractFieldErrors } from '../../../utils/errors';

const ReceptionistModal = ({ isOpen, onClose, initial, onSubmit }) => {
  const editing = !!initial;
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '', // required on create
    gender: '',
    dateOfBirth: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    dateOfJoining: '',
    shift: 'MORNING',
    salary: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });
  // Multistep navigation
  const steps = ['Personal Info', 'Employment', 'Address & Emergency'];
  const [currentStep, setCurrentStep] = useState(0);
  const stepRefs = [useRef(null), useRef(null), useRef(null)];
  const lastAdvanceRef = useRef(0);

  useEffect(() => {
    if (editing) {
      setForm({
        firstName: initial.firstName || '',
        lastName: initial.lastName || '',
        email: initial.email || '',
        password: '',
        gender: initial.gender || '',
        dateOfBirth: initial.dateOfBirth || '',
        addressLine1: initial.addressLine1 || '',
        addressLine2: initial.addressLine2 || '',
        city: initial.city || '',
        state: initial.state || '',
        postalCode: initial.postalCode || '',
        country: initial.country || '',
        dateOfJoining: initial.dateOfJoining || '',
        shift: initial.shift || 'MORNING',
        salary: initial.salary != null ? String(initial.salary) : '',
        emergencyContactName: initial.emergencyContactName || '',
        emergencyContactPhone: initial.emergencyContactPhone || '',
      });
    } else {
      const today = new Date().toISOString().slice(0,10);
      setForm({
        firstName: '', lastName: '', email: '', password: '',
        gender: '', dateOfBirth: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '',
        dateOfJoining: today, shift: 'MORNING', salary: '', emergencyContactName: '', emergencyContactPhone: ''
      });
    }
  setFieldErrors({});
  setCurrentStep(0);
  }, [editing, initial, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

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

  const goNext = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!validateCurrentStep()) return;
    // Remember when we advanced to ignore immediate submit caused by re-render
    lastAdvanceRef.current = Date.now();
    // Defer state change to avoid the click finishing on a newly rendered submit button
    setTimeout(() => {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }, 0);
  };

  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const submitFinalStep = async () => {
    setLoading(true);
    setFieldErrors({});
    try {
      const payload = {
        email: form.email.trim(),
        password: editing ? undefined : form.password.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        gender: form.gender || null,
        dateOfBirth: form.dateOfBirth || null,
        addressLine1: form.addressLine1 || null,
        addressLine2: form.addressLine2 || null,
        city: form.city || null,
        state: form.state || null,
        postalCode: form.postalCode || null,
        country: form.country || null,
        dateOfJoining: form.dateOfJoining || null,
        shift: form.shift || null,
        salary: form.salary === '' ? null : parseFloat(form.salary),
        emergencyContactName: form.emergencyContactName || null,
        emergencyContactPhone: form.emergencyContactPhone || null,
      };
      if (!editing && !payload.password) {
        throw new Error('Password is required for new receptionist');
      }
      await onSubmit(payload);
      onClose();
    } catch (error) {
      const fe = extractFieldErrors(error);
      if (Object.keys(fe).length > 0) {
        setFieldErrors(fe);
        // Focus first errored field across steps
        const order = ['firstName','lastName','email','password','gender','dateOfBirth','dateOfJoining','shift','salary','addressLine1','addressLine2','city','state','postalCode','country','emergencyContactName','emergencyContactPhone'];
        const first = order.find((k) => fe[k]);
        if (first) {
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
        toast.error(extractErrorMessage(error, 'Save failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Prevent premature submit: advance steps until last step
    if (currentStep < steps.length - 1) {
      if (!validateCurrentStep()) return;
      goNext();
      return;
    }
    // If we just advanced to the last step, ignore any accidental submit from the same interaction
    if (Date.now() - lastAdvanceRef.current < 400) {
      return;
    }
    await submitFinalStep();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
  <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={() => { if (!loading) onClose(); }}>
        <motion.div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
            <h3 className="text-lg font-semibold">{editing ? 'Edit Receptionist' : 'Add Receptionist'}</h3>
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
          <form
            onSubmit={handleSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && currentStep < steps.length - 1) {
                // Use Enter to go to next step instead of submitting the form
                e.preventDefault();
                if (validateCurrentStep()) goNext();
              }
            }}
            className="p-6 space-y-6"
          >
            {/* Step 1: Personal Info */}
            <div ref={stepRefs[0]} className={currentStep === 0 ? 'block' : 'hidden'} aria-hidden={currentStep !== 0}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name</label>
                  <input name="firstName" value={form.firstName} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.firstName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Last Name</label>
                  <input name="lastName" value={form.lastName} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.lastName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.lastName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.lastName}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={editing} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm disabled:bg-gray-100 ${fieldErrors.email ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.email && <p className="mt-1 text-xs text-rose-600">{fieldErrors.email}</p>}
                </div>
                {!editing && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input type="password" name="password" value={form.password} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.password ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                    {fieldErrors.password && <p className="mt-1 text-xs text-rose-600">{fieldErrors.password}</p>}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Gender</label>
                  <select name="gender" value={form.gender} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.gender ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}>
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                  {fieldErrors.gender && <p className="mt-1 text-xs text-rose-600">{fieldErrors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.dateOfBirth ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.dateOfBirth && <p className="mt-1 text-xs text-rose-600">{fieldErrors.dateOfBirth}</p>}
                </div>
              </div>
            </div>

            {/* Step 2: Employment */}
            <div ref={stepRefs[1]} className={currentStep === 1 ? 'block' : 'hidden'} aria-hidden={currentStep !== 1}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Joining</label>
                  <input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.dateOfJoining ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.dateOfJoining && <p className="mt-1 text-xs text-rose-600">{fieldErrors.dateOfJoining}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Shift</label>
                  <select name="shift" value={form.shift} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.shift ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`}>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                  {fieldErrors.shift && <p className="mt-1 text-xs text-rose-600">{fieldErrors.shift}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Salary (₹)</label>
                  <input type="number" name="salary" min="0" step="0.01" value={form.salary} onChange={handleChange} required className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.salary ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.salary && <p className="mt-1 text-xs text-rose-600">{fieldErrors.salary}</p>}
                </div>
              </div>
            </div>

            {/* Step 3: Address & Emergency */}
            <div ref={stepRefs[2]} className={currentStep === 2 ? 'block' : 'hidden'} aria-hidden={currentStep !== 2}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 1</label>
                  <input name="addressLine1" value={form.addressLine1} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.addressLine1 ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.addressLine1 && <p className="mt-1 text-xs text-rose-600">{fieldErrors.addressLine1}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Address Line 2</label>
                  <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.addressLine2 ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.addressLine2 && <p className="mt-1 text-xs text-rose-600">{fieldErrors.addressLine2}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input name="city" value={form.city} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.city ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.city && <p className="mt-1 text-xs text-rose-600">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input name="state" value={form.state} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.state ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.state && <p className="mt-1 text-xs text-rose-600">{fieldErrors.state}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Postal Code</label>
                  <input name="postalCode" value={form.postalCode} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.postalCode ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.postalCode && <p className="mt-1 text-xs text-rose-600">{fieldErrors.postalCode}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input name="country" value={form.country} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.country ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.country && <p className="mt-1 text-xs text-rose-600">{fieldErrors.country}</p>}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                  <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.emergencyContactName ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.emergencyContactName && <p className="mt-1 text-xs text-rose-600">{fieldErrors.emergencyContactName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
                  <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${fieldErrors.emergencyContactPhone ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : ''}`} />
                  {fieldErrors.emergencyContactPhone && <p className="mt-1 text-xs text-rose-600">{fieldErrors.emergencyContactPhone}</p>}
                </div>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Cancel</button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <button type="button" onClick={goBack} className="px-3 py-1.5 text-sm border rounded-lg hover:bg-gray-50">Back</button>
                )}
                {currentStep < steps.length - 1 ? (
                  <button type="button" onClick={(e) => goNext(e)} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">Next</button>
                ) : (
                  <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 shadow-sm">{loading ? 'Saving...' : (editing ? 'Save Changes' : 'Create')}</button>
                )}
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceptionistModal;
