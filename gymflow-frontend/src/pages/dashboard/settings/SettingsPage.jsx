import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';

const Section = ({ title, children }) => (
  <motion.div {...variants.cardIn} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </motion.div>
);

const SettingsPage = () => {
  const [prefs, setPrefs] = useState({ theme: 'light', refresh: 60 });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Account">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Name</label>
              <input className="col-span-2 border rounded-md px-3 py-2" placeholder="Your name" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Email</label>
              <input className="col-span-2 border rounded-md px-3 py-2" placeholder="you@example.com" />
            </div>
          </div>
        </Section>

        <Section title="Security">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Change Password</label>
              <div className="col-span-2 flex gap-2">
                <input type="password" className="border rounded-md px-3 py-2 flex-1" placeholder="New password" />
                <button className="px-3 py-2 bg-slate-800 text-white rounded-md">Update</button>
              </div>
            </div>
            <p className="text-gray-500">Tip: Use a strong password with letters, numbers, and symbols.</p>
          </div>
        </Section>

        <Section title="Gym">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Gym Name</label>
              <input className="col-span-2 border rounded-md px-3 py-2" placeholder="Gym Flow" />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Default Plan Duration</label>
              <select className="col-span-2 border rounded-md px-3 py-2">
                <option value="1M">1 Month</option>
                <option value="3M">3 Months</option>
                <option value="6M">6 Months</option>
                <option value="12M">12 Months</option>
              </select>
            </div>
          </div>
        </Section>

        <Section title="Preferences">
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Theme</label>
              <select value={prefs.theme} onChange={e => setPrefs(p => ({ ...p, theme: e.target.value }))} className="col-span-2 border rounded-md px-3 py-2">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Auto Refresh (s)</label>
              <input type="number" min={15} max={600} value={prefs.refresh} onChange={e => setPrefs(p => ({ ...p, refresh: Number(e.target.value) }))} className="col-span-2 border rounded-md px-3 py-2" />
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;
