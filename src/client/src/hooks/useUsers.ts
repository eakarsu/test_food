import { useQuery, useMutation, useQueryClient } from 'react-query';
import { usersApi } from '../lib/api-services';
import { QueryParams } from '../types';
import toast from 'react-hot-toast';

export const useUsers = (params?: QueryParams) => {
  return useQuery(['users', params], () => usersApi.getAll(params), {
    keepPreviousData: true,
  });
};

export const useUser = (id: string) => {
  return useQuery(['user', id], () => usersApi.getById(id), {
    enabled: !!id,
  });
};

export const useMe = () => {
  return useQuery('me', usersApi.getMe);
};

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation(usersApi.updateMe, {
    onSuccess: () => {
      qc.invalidateQueries('me');
      toast.success('Profile updated');
    },
    onError: () => toast.error('Failed to update profile'),
  });
};

export const useChangePassword = () => {
  return useMutation(
    ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(currentPassword, newPassword),
    {
      onSuccess: () => toast.success('Password changed'),
      onError: () => toast.error('Failed to change password'),
    }
  );
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: Record<string, unknown> }) => usersApi.update(id, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('users');
        qc.invalidateQueries('user');
        toast.success('User updated');
      },
      onError: () => toast.error('Failed to update user'),
    }
  );
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation(usersApi.delete, {
    onSuccess: () => {
      qc.invalidateQueries('users');
      toast.success('User deleted');
    },
    onError: () => toast.error('Failed to delete user'),
  });
};

export const useBulkDeleteUsers = () => {
  const qc = useQueryClient();
  return useMutation(usersApi.bulkDelete, {
    onSuccess: () => {
      qc.invalidateQueries('users');
      toast.success('Users deleted');
    },
    onError: () => toast.error('Failed to delete users'),
  });
};
