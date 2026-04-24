import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: user, isLoading } = useUser(id!);
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSave = async (data: Record<string, unknown>) => {
    await updateUser.mutateAsync({ id: id!, data });
    setEditing(false);
  };

  const onDelete = async () => {
    await deleteUser.mutateAsync(id!);
    navigate('/users');
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <div className="p-8 text-center">User not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/users')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Users
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                <p className="text-gray-500">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button onClick={() => { setEditing(true); reset({ firstName: user.firstName, lastName: user.lastName, role: user.role }); }} className="btn btn-secondary flex items-center gap-1 text-sm">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                <button onClick={() => setShowDelete(true)} className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 text-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input className="input mt-1" defaultValue={user.firstName} {...register('firstName')} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input className="input mt-1" defaultValue={user.lastName} {...register('lastName')} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select className="input mt-1" defaultValue={user.role} {...register('role')}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={updateUser.isLoading} className="btn btn-primary flex items-center gap-1">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary flex items-center gap-1">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Role</label>
                    <p className="mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {user.role}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email Verified</label>
                    <p className="mt-1">{user.emailVerified ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Joined</label>
                    <p className="mt-1">{new Date(user.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This will also delete all their posts and files."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default UserDetail;
