import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordApi } from '../api/auth';
import { User, Lock } from 'lucide-react';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile({ name, phone });
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassMsg('');
    setPassErr('');
    try {
      await changePasswordApi({ currentPassword, newPassword });
      setPassMsg('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setPassErr(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <User className="w-5 h-5 text-indigo-500" /> Account Profile Settings
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Update your contact details and security password.
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileSubmit}
        className="rounded-xl p-6 shadow-xl space-y-4 text-xs border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Personal Details</h3>
        {profileMsg && (
          <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', borderColor: 'rgba(52,211,153,0.25)' }}>
            {profileMsg}
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors">
          Save Profile
        </button>
      </form>

      {/* Change Password Form */}
      <form
        onSubmit={handlePasswordSubmit}
        className="rounded-xl p-6 shadow-xl space-y-4 text-xs border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <Lock className="w-4 h-4 text-indigo-500" /> Change Security Password
        </h3>

        {passMsg && (
          <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', borderColor: 'rgba(52,211,153,0.25)' }}>
            {passMsg}
          </div>
        )}
        {passErr && (
          <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', borderColor: 'rgba(248,113,113,0.25)' }}>
            {passErr}
          </div>
        )}

        <div>
          <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>Current Password</label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1" style={{ color: 'var(--color-text)' }}>New Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input-field"
          />
        </div>

        <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-colors">
          Update Password
        </button>
      </form>
    </div>
  );
}
