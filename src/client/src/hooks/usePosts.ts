import { useQuery, useMutation, useQueryClient } from 'react-query';
import { postsApi } from '../lib/api-services';
import { QueryParams } from '../types';
import toast from 'react-hot-toast';

export const usePosts = (params?: QueryParams) => {
  return useQuery(['posts', params], () => postsApi.getAll(params), {
    keepPreviousData: true,
  });
};

export const usePost = (id: string) => {
  return useQuery(['post', id], () => postsApi.getById(id), {
    enabled: !!id,
  });
};

export const useCreatePost = () => {
  const qc = useQueryClient();
  return useMutation(postsApi.create, {
    onSuccess: () => {
      qc.invalidateQueries('posts');
      toast.success('Post created');
    },
    onError: () => toast.error('Failed to create post'),
  });
};

export const useUpdatePost = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ id, data }: { id: string; data: Record<string, unknown> }) => postsApi.update(id, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('posts');
        qc.invalidateQueries('post');
        toast.success('Post updated');
      },
      onError: () => toast.error('Failed to update post'),
    }
  );
};

export const useDeletePost = () => {
  const qc = useQueryClient();
  return useMutation(postsApi.delete, {
    onSuccess: () => {
      qc.invalidateQueries('posts');
      toast.success('Post deleted');
    },
    onError: () => toast.error('Failed to delete post'),
  });
};

export const useBulkDeletePosts = () => {
  const qc = useQueryClient();
  return useMutation(postsApi.bulkDelete, {
    onSuccess: () => {
      qc.invalidateQueries('posts');
      toast.success('Posts deleted');
    },
    onError: () => toast.error('Failed to delete posts'),
  });
};

export const useBulkUpdatePosts = () => {
  const qc = useQueryClient();
  return useMutation(
    ({ ids, data }: { ids: string[]; data: Record<string, unknown> }) =>
      postsApi.bulkUpdate(ids, data),
    {
      onSuccess: () => {
        qc.invalidateQueries('posts');
        toast.success('Posts updated');
      },
      onError: () => toast.error('Failed to update posts'),
    }
  );
};
