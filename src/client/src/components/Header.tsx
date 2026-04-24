import { Link, useNavigate } from 'react-router-dom';
import { User, LogOut, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

const Header = () => {
  const { isAuthenticated, user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Modern Website
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">Home</Link>
            {isAuthenticated && (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-gray-900 transition-colors">Dashboard</Link>
                <Link to="/posts" className="text-gray-700 hover:text-gray-900 transition-colors">Posts</Link>
                <Link to="/files" className="text-gray-700 hover:text-gray-900 transition-colors">Files</Link>
                {isAdmin() && (
                  <Link to="/users" className="text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-1">
                    <Shield className="w-4 h-4" /> Users
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors">
                  <User size={20} />
                  <span className="hidden sm:inline">{user?.firstName}</span>
                </Link>
                <button onClick={handleLogout} className="flex items-center space-x-1 text-gray-700 hover:text-gray-900 transition-colors">
                  <LogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
