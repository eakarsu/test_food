import { useQuery, useMutation, useQueryClient } from 'react-query';
import { filesApi } from '../lib/api-services';
import { QueryParams } from '../types';
import toast from 'react-hot-toast';

export const useFiles = (params?: QueryParams) => {
  return useQuery(['files', params], () => filesApi.getAll(params), {
    keepPreviousData: true,
  });
};

export const useFile = (id: string) => {
  return useQuery(['file', id], () => filesApi.getById(id), {
    enabled: !!id,
  });
};

export const useUploadFile = () => {
  const qc = useQueryClient();
  return useMutation(filesApi.upload, {
    onSuccess: () => {
      qc.invalidateQueries('files');
      toast.success('File uploaded');
    },
    onError: () => toast.error('Failed to upload file'),
  });
};

export const useDeleteFile = () => {
  const qc = useQueryClient();
  return useMutation(filesApi.delete, {
    onSuccess: () => {
      qc.invalidateQueries('files');
      toast.success('File deleted');
    },
    onError: () => toast.error('Failed to delete file'),
  });
};

export const useBulkDeleteFiles = () => {
  const qc = useQueryClient();
  return useMutation(filesApi.bulkDelete, {
    onSuccess: () => {
      qc.invalidateQueries('files');
      toast.success('Files deleted');
    },
    onError: () => toast.error('Failed to delete files'),
  });
};
