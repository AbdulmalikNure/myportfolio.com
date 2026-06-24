import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { auth } from '../lib/api';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [changingPw, setChangingPw] = useState(false);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', name);
      fd.append('email', email);
      if (avatar) fd.append('avatar', avatar);
      await api.put('/admin/profile', fd);
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPw(true);
    try {
      await auth.changePassword({ currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed! Please log in again.');
      setCurrentPw(''); setNewPw('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPw(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold">Profile</h1>

      {/* Profile form */}
      <form onSubmit={handleProfile} className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-primary">Personal Info</h2>

        {/* Avatar preview */}
        <div className="flex items-center gap-4">
          {user?.avatar
            ? <img src={user.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
            : <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center text-2xl font-bold text-primary">{user?.name?.[0]}</div>
          }
          <div>
            <label className="block text-xs text-muted mb-1">Change Avatar</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)}
              className="text-sm text-muted file:bg-border file:text-text file:border-0 file:rounded file:px-3 file:py-1 file:mr-2 file:cursor-pointer" />
          </div>
        </div>

        <div>
          <label className="block text-sm text-muted mb-1">Full Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary" />
        </div>

        <button type="submit" disabled={saving}
          className="bg-primary text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>

      {/* Password form */}
      <form onSubmit={handlePassword} className="bg-surface border border-border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-primary">Change Password</h2>
        <div>
          <label className="block text-sm text-muted mb-1">Current Password</label>
          <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} required
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary" />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1">New Password</label>
          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} required minLength={8}
            className="w-full bg-bg border border-border rounded-lg px-4 py-2.5 text-text text-sm focus:outline-none focus:border-primary" />
        </div>
        <button type="submit" disabled={changingPw}
          className="bg-primary text-bg font-semibold px-6 py-2.5 rounded-lg hover:bg-primary-dark disabled:opacity-50">
          {changingPw ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
}
