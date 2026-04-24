import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import PostsManagement from './pages/PostsManagement';
import PostDetail from './pages/PostDetail';
import PostCreate from './pages/PostCreate';
import UsersManagement from './pages/UsersManagement';
import UserDetail from './pages/UserDetail';
import FilesManagement from './pages/FilesManagement';
import FileDetail from './pages/FileDetail';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/posts" element={<ProtectedRoute><PostsManagement /></ProtectedRoute>} />
                <Route path="/posts/new" element={<ProtectedRoute><PostCreate /></ProtectedRoute>} />
                <Route path="/posts/:id" element={<ProtectedRoute><PostDetail /></ProtectedRoute>} />
                <Route path="/files" element={<ProtectedRoute><FilesManagement /></ProtectedRoute>} />
                <Route path="/files/:id" element={<ProtectedRoute><FileDetail /></ProtectedRoute>} />
                <Route path="/users" element={<ProtectedRoute requiredRole="ADMIN"><UsersManagement /></ProtectedRoute>} />
                <Route path="/users/:id" element={<ProtectedRoute requiredRole="ADMIN"><UserDetail /></ProtectedRoute>} />
              </Routes>
            </main>
            <Toaster position="top-right" />
          </div>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
