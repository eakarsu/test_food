import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../lib/api-services';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch } = useForm<{ password: string; confirmPassword: string }>();
  const password = watch('password');

  const onSubmit = async (data: { password: string }) => {
    setLoading(true);
    try {
      await authApi.resetPassword(token, data.password);
      setDone(true);
      toast.success('Password reset successfully');
    } catch {
      toast.error('Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full space-y-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">Reset Password</h2>
        {done ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-800">Password has been reset.</p>
            <Link to="/login" className="text-primary-600 hover:text-primary-500 mt-2 inline-block">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" className="input pl-10" placeholder="New password" {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input type="password" className="input pl-10" placeholder="Confirm password" {...register('confirmPassword', { required: 'Required', validate: v => v === password || 'Passwords do not match' })} />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary w-full">{loading ? 'Resetting...' : 'Reset Password'}</button>
          </form>
        )}
      </motion.div>
    </div>
  );
};

export default ResetPassword;
