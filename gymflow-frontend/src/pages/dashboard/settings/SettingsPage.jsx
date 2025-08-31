import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';
import PageHeader from '../../../components/dashboard/PageHeader';
import { FiSettings } from 'react-icons/fi';
import { getMyProfile, updateMyProfile, changeMyPassword, changeMyEmail } from '../../../services/userService';
import { useAuth } from '../../../hooks/useAuth';
import Spinner from '../../../ui/Spinner';

const Section = ({ title, children }) => (
  <motion.div {...variants.cardIn} className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
    <h2 className="text-lg font-semibold mb-4">{title}</h2>
    {children}
  </motion.div>
);

const SettingsPage = () => {
  const { setUser } = useAuth();
  const [profile, setProfile] = useState({ email: '', firstName: '', lastName: '', roleName: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [changingPwd, setChangingPwd] = useState(false);
  const [emailChange, setEmailChange] = useState({ currentPassword: '', newEmail: '' });
  const [changingEmail, setChangingEmail] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await getMyProfile();
        if (mounted) setProfile(me);
      } catch (e) {
        setMsg({ type: 'error', text: 'Failed to load profile' });
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const saveProfile = async (e) => {
    e?.preventDefault();
    setSavingProfile(true);
    setMsg(null);
    try {
      const updated = await updateMyProfile({ firstName: profile.firstName, lastName: profile.lastName });
      setProfile(updated);
      setMsg({ type: 'success', text: 'Profile updated' });
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to update profile' });
    } finally {
      setSavingProfile(false);
    }
  };

  const submitEmailChange = async (e) => {
    e?.preventDefault();
    setMsg(null);
    if (!emailChange.currentPassword || !emailChange.newEmail) {
      setMsg({ type: 'error', text: 'Enter current password and new email' });
      return;
    }
    if (emailChange.newEmail === profile.email) {
      setMsg({ type: 'error', text: 'New email is same as current' });
      return;
    }
    setChangingEmail(true);
    try {
      const { accessToken } = await changeMyEmail(emailChange);
      // store new token and update auth
      localStorage.setItem('accessToken', accessToken);
      try {
        const { jwtDecode } = await import('jwt-decode');
        const decoded = jwtDecode(accessToken);
        setUser(decoded);
      } catch {}
      // refresh profile
      const me = await getMyProfile();
      setProfile(me);
      setEmailChange({ currentPassword: '', newEmail: '' });
      setMsg({ type: 'success', text: 'Email changed successfully' });
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to change email' });
    } finally {
      setChangingEmail(false);
    }
  };

  const changePassword = async (e) => {
    e?.preventDefault();
    setMsg(null);
    if (!pwd.currentPassword || !pwd.newPassword) {
      setMsg({ type: 'error', text: 'Please fill current and new password' });
      return;
    }
    if (pwd.newPassword.length < 8) {
      setMsg({ type: 'error', text: 'New password must be at least 8 characters' });
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      setMsg({ type: 'error', text: 'Passwords do not match' });
      return;
    }
    setChangingPwd(true);
    try {
      await changeMyPassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      setPwd({ currentPassword: '', newPassword: '', confirm: '' });
      setMsg({ type: 'success', text: 'Password changed successfully' });
    } catch (e) {
      setMsg({ type: 'error', text: 'Failed to change password' });
    } finally {
      setChangingPwd(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <PageHeader icon={<FiSettings />} title="Settings" subtitle="Manage your account." />
      {msg && (
        <div className={`p-3 rounded-md text-sm ${msg.type === 'error' ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>{msg.text}</div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Account">
          {loading ? (
            <div className="p-8 grid place-items-center">
              <Spinner label="Loading…" />
            </div>
          ) : (
            <form onSubmit={saveProfile} className="space-y-3 text-sm">
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-gray-600">First Name</label>
                <input className="col-span-2 border rounded-md px-3 py-2" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} required pattern="^[A-Za-z]+$" />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-gray-600">Last Name</label>
                <input className="col-span-2 border rounded-md px-3 py-2" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} required pattern="^[A-Za-z]+$" />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-gray-600">Email</label>
                <input className="col-span-2 border rounded-md px-3 py-2 bg-gray-100" value={profile.email} disabled />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-gray-600">Role</label>
                <input className="col-span-2 border rounded-md px-3 py-2 bg-gray-100" value={profile.roleName} disabled />
              </div>
              <div className="grid grid-cols-3 items-center gap-3">
                <label className="text-gray-600">Status</label>
                <input className="col-span-2 border rounded-md px-3 py-2 bg-gray-100" value={profile.status} disabled />
              </div>
              <div>
                <button disabled={savingProfile} className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-60">{savingProfile ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
        </Section>

        <Section title="Security">
          <form onSubmit={changePassword} className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Current Password</label>
              <input type="password" className="col-span-2 border rounded-md px-3 py-2" value={pwd.currentPassword} onChange={e => setPwd(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">New Password</label>
              <input type="password" className="col-span-2 border rounded-md px-3 py-2" value={pwd.newPassword} onChange={e => setPwd(p => ({ ...p, newPassword: e.target.value }))} required minLength={8} />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Confirm New Password</label>
              <input type="password" className="col-span-2 border rounded-md px-3 py-2" value={pwd.confirm} onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))} required />
            </div>
            <div>
              <button disabled={changingPwd} className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-60">{changingPwd ? 'Updating...' : 'Change Password'}</button>
            </div>
            <p className="text-gray-500">Tip: Use a strong password with letters, numbers, and symbols.</p>
          </form>
        </Section>

        <Section title="Change Email">
          <form onSubmit={submitEmailChange} className="space-y-3 text-sm">
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">Current Password</label>
              <input type="password" className="col-span-2 border rounded-md px-3 py-2" value={emailChange.currentPassword} onChange={e => setEmailChange(p => ({ ...p, currentPassword: e.target.value }))} required />
            </div>
            <div className="grid grid-cols-3 items-center gap-3">
              <label className="text-gray-600">New Email</label>
              <input type="email" className="col-span-2 border rounded-md px-3 py-2" value={emailChange.newEmail} onChange={e => setEmailChange(p => ({ ...p, newEmail: e.target.value }))} required />
            </div>
            <div>
              <button disabled={changingEmail} className="px-4 py-2 bg-slate-800 text-white rounded-md disabled:opacity-60">{changingEmail ? 'Updating...' : 'Change Email'}</button>
            </div>
            <p className="text-gray-500">Note: You’ll be issued a new token after email change.</p>
          </form>
        </Section>
      </div>
    </div>
  );
};

export default SettingsPage;
