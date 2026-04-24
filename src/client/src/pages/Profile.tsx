import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useMe, useUpdateMe, useChangePassword } from '../hooks/useUsers';
import { useAuthStore } from '../stores/authStore';

const Profile = () => {
  const { data: user, isLoading } = useMe();
  const updateMe = useUpdateMe();
  const changePassword = useChangePassword();
  const { updateUser } = useAuthStore();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile } = useForm();
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd } = useForm();

  const onProfileSubmit = async (data: Record<string, string>) => {
    try {
      const updated = await updateMe.mutateAsync({ firstName: data.firstName, lastName: data.lastName });
      updateUser(updated);
    } catch { /* handled by hook */ }
  };

  const onPasswordSubmit = async (data: Record<string, string>) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    try {
      await changePassword.mutateAsync({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      resetPwd();
      setShowPasswordForm(false);
    } catch { /* handled by hook */ }
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile</h1>

          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input className="input mt-1" defaultValue={user?.firstName} {...regProfile('firstName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input className="input mt-1" defaultValue={user?.lastName} {...regProfile('lastName')} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input className="input mt-1 bg-gray-50" value={user?.email || ''} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <input className="input mt-1 bg-gray-50" value={user?.role || ''} disabled />
              </div>
              <button type="submit" disabled={updateMe.isLoading} className="btn btn-primary">
                {updateMe.isLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Password</h2>
              <button onClick={() => setShowPasswordForm(!showPasswordForm)} className="btn btn-secondary text-sm">
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>
            {showPasswordForm && (
              <form onSubmit={handlePwd(onPasswordSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input type="password" className="input mt-1" {...regPwd('currentPassword', { required: true })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input type="password" className="input mt-1" {...regPwd('newPassword', { required: true, minLength: 6 })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input type="password" className="input mt-1" {...regPwd('confirmPassword', { required: true })} />
                </div>
                <button type="submit" disabled={changePassword.isLoading} className="btn btn-primary">
                  {changePassword.isLoading ? 'Changing...' : 'Change Password'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
