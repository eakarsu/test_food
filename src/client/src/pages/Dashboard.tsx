import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, FileText, Upload, Users, Plus, Edit } from 'lucide-react';
import { useMe } from '../hooks/useUsers';
import { useAuthStore } from '../stores/authStore';

const Dashboard = () => {
  const navigate = useNavigate();
  const { data: user } = useMe();
  const { isAdmin } = useAuthStore();

  const postCount = (user as Record<string, unknown>)?._count
    ? ((user as Record<string, unknown>)._count as Record<string, number>).posts
    : 0;
  const fileCount = (user as Record<string, unknown>)?._count
    ? ((user as Record<string, unknown>)._count as Record<string, number>).files
    : 0;

  const cards = [
    {
      label: 'Profile',
      value: 'Active',
      icon: <User className="h-6 w-6 text-primary-600" />,
      bg: 'bg-primary-100',
      to: '/profile',
    },
    {
      label: 'Posts',
      value: String(postCount),
      icon: <FileText className="h-6 w-6 text-green-600" />,
      bg: 'bg-green-100',
      to: '/posts',
    },
    {
      label: 'Files',
      value: String(fileCount),
      icon: <Upload className="h-6 w-6 text-blue-600" />,
      bg: 'bg-blue-100',
      to: '/files',
    },
  ];

  if (isAdmin()) {
    cards.push({
      label: 'Users',
      value: 'Manage',
      icon: <Users className="h-6 w-6 text-purple-600" />,
      bg: 'bg-purple-100',
      to: '/users',
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          {user && (
            <p className="text-gray-600 mb-8">Welcome back, {user.firstName}!</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
              <div
                key={card.label}
                onClick={() => navigate(card.to)}
                className="bg-white p-6 rounded-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
              >
                <div className="flex items-center">
                  <div className={`p-2 ${card.bg} rounded-lg`}>
                    {card.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{card.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button onClick={() => navigate('/posts/new')} className="btn btn-primary w-full flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Create New Post
                </button>
                <button onClick={() => navigate('/files')} className="btn btn-secondary w-full flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" /> Upload File
                </button>
                <button onClick={() => navigate('/profile')} className="btn btn-secondary w-full flex items-center justify-center gap-2">
                  <Edit className="w-4 h-4" /> Edit Profile
                </button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Role</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Member since</span>
                  <span className="font-medium">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
