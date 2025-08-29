import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';

const ReceptionistModal = ({ isOpen, onClose, initial, onSubmit }) => {
  const editing = !!initial;
  const [loading, setLoading] = useState(false);
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
  }, [editing, initial, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={onClose}>
        <motion.div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-4">{editing ? 'Edit Receptionist' : 'Add Receptionist'}</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} required disabled={editing} className="w-full border rounded-md px-3 py-2 text-sm disabled:bg-gray-100" />
              </div>
              {!editing && (
                <div>
                  <label className="block text-sm font-medium mb-1">Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select name="gender" value={form.gender} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date of Joining</label>
                <input type="date" name="dateOfJoining" value={form.dateOfJoining} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Shift</label>
                <select name="shift" value={form.shift} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm">
                  <option value="MORNING">Morning</option>
                  <option value="EVENING">Evening</option>
                  <option value="NIGHT">Night</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Salary (₹)</label>
                <input type="number" name="salary" min="0" step="0.01" value={form.salary} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 1</label>
                <input name="addressLine1" value={form.addressLine1} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Address Line 2</label>
                <input name="addressLine2" value={form.addressLine2} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">City</label>
                <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">State</label>
                <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Postal Code</label>
                <input name="postalCode" value={form.postalCode} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <input name="country" value={form.country} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Contact Name</label>
                <input name="emergencyContactName" value={form.emergencyContactName} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Emergency Contact Phone</label>
                <input name="emergencyContactPhone" value={form.emergencyContactPhone} onChange={handleChange} className="w-full border rounded-md px-3 py-2 text-sm" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={onClose} className="px-3 py-1.5 text-sm border rounded-md">Cancel</button>
              <button type="submit" disabled={loading} className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md disabled:opacity-50">{loading ? 'Saving...' : (editing ? 'Save Changes' : 'Create')}</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReceptionistModal;
