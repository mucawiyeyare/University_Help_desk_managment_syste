import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { changePasswordApi } from '../api/auth';
import UserAvatar, { resolveAvatarUrl } from '../components/ui/UserAvatar';
import Modal from '../components/ui/Modal';
import { User, Lock, Upload, Link2, X } from 'lucide-react';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const SUPPORTED_IMAGE_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);

const isHttpUrl = (value) => {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
};

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [imageUrl, setImageUrl] = useState(() => (isHttpUrl(user?.avatar || '') ? user.avatar : ''));
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const fileInputRef = useRef(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  useEffect(() => {
    if (!selectedAvatar) {
      setAvatarPreview('');
      return undefined;
    }

    const preview = URL.createObjectURL(selectedAvatar);
    setAvatarPreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [selectedAvatar]);

  const selectAvatarFile = (file) => {
    if (!file) return;
    setProfileMsg('');
    setProfileErr('');

    if (!SUPPORTED_IMAGE_TYPES.has(file.type)) {
      setProfileErr('Choose a JPG, PNG, WEBP, or GIF image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setProfileErr('Profile images must be 5 MB or smaller.');
      return;
    }

    setSelectedAvatar(file);
    setImageUrl('');
    setRemoveAvatar(false);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');

    const trimmedImageUrl = imageUrl.trim();
    if (!selectedAvatar && trimmedImageUrl && !isHttpUrl(trimmedImageUrl)) {
      setProfileErr('Paste a valid image link that starts with http:// or https://.');
      return;
    }

    try {
      let payload;
      if (selectedAvatar) {
        payload = new FormData();
        payload.append('name', name);
        payload.append('phone', phone);
        payload.append('avatar', selectedAvatar);
      } else {
        payload = { name, phone };
        if (removeAvatar || trimmedImageUrl) payload.avatar = removeAvatar ? '' : trimmedImageUrl;
      }

      const result = await updateProfile(payload);
      const updatedUser = result.user || result.data;
      setSelectedAvatar(null);
      setImageUrl(isHttpUrl(updatedUser?.avatar || '') ? updatedUser.avatar : '');
      setRemoveAvatar(false);
      setProfileMsg('Profile updated successfully!');
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Failed to update profile. Please try again.');
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

  const previewAvatar = removeAvatar ? '' : avatarPreview || imageUrl.trim() || user?.avatar;
  const previewImageUrl = resolveAvatarUrl(previewAvatar);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="pb-4" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
          <User className="w-5 h-5 text-indigo-500" /> Account Profile Settings
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Update your contact details, profile image, and security password.
        </p>
      </div>

      <form
        onSubmit={handleProfileSubmit}
        className="rounded-xl p-6 shadow-xl space-y-5 text-xs border"
        style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      >
        <h3 className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Personal Details</h3>
        {profileMsg && (
          <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(52,211,153,0.1)', color: '#34D399', borderColor: 'rgba(52,211,153,0.25)' }}>
            {profileMsg}
          </div>
        )}
        {profileErr && (
          <div className="p-2.5 rounded-lg border" style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', borderColor: 'rgba(248,113,113,0.25)' }}>
            {profileErr}
          </div>
        )}

        <div>
          <label className="block font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Profile Image</label>
          <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
            <div className="shrink-0 mx-auto sm:mx-0 text-center">
              <button
                type="button"
                onClick={() => previewImageUrl && setIsImagePreviewOpen(true)}
                disabled={!previewImageUrl}
                title={previewImageUrl ? 'Click to view your profile image' : 'Add a profile image to preview it'}
                className="rounded-full transition-transform enabled:hover:scale-105 enabled:focus:outline-none enabled:focus:ring-2 enabled:focus:ring-indigo-500 enabled:focus:ring-offset-2 disabled:cursor-default"
              >
                <UserAvatar
                  avatar={previewAvatar}
                  name={name || user?.name}
                  alt="Profile image preview"
                  className="w-24 h-24 text-3xl"
                  style={{ border: '3px solid var(--color-border)' }}
                />
              </button>
              {previewImageUrl && (
                <p className="mt-1.5 text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>Click image to preview</p>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  selectAvatarFile(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  selectAvatarFile(e.dataTransfer.files?.[0]);
                }}
                className="w-full min-h-20 rounded-xl border-2 border-dashed px-4 py-3 text-left transition-colors"
                style={{
                  borderColor: isDragging ? '#2175B5' : 'var(--color-border)',
                  background: isDragging ? 'rgba(33,117,181,0.08)' : 'var(--color-surface2)',
                  color: 'var(--color-text)',
                }}
              >
                <span className="flex items-center gap-2 font-semibold">
                  <Upload className="w-4 h-4" style={{ color: '#2175B5' }} />
                  Drag and drop an image, or click to browse
                </span>
                <span className="block mt-1 text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  JPG, PNG, WEBP, or GIF · maximum 5 MB
                </span>
              </button>

              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-muted)' }} />
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setSelectedAvatar(null);
                    setRemoveAvatar(false);
                    setProfileErr('');
                  }}
                  placeholder="Or paste an image link (https://...)"
                  className="input-field pl-9"
                />
              </div>
              {(previewAvatar || selectedAvatar || imageUrl) && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(null);
                    setImageUrl('');
                    setRemoveAvatar(Boolean(user?.avatar));
                    setIsImagePreviewOpen(false);
                    setProfileErr('');
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-400"
                >
                  <X className="w-3.5 h-3.5" /> Remove image
                </button>
              )}
            </div>
          </div>
        </div>

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

      <Modal isOpen={isImagePreviewOpen} onClose={() => setIsImagePreviewOpen(false)} title="Profile Image">
        <div className="flex items-center justify-center rounded-xl overflow-hidden" style={{ background: 'var(--color-surface2)' }}>
          <img
            src={previewImageUrl}
            alt={`${name || user?.name || 'User'} profile image`}
            className="max-w-full max-h-[65vh] object-contain"
          />
        </div>
      </Modal>

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
