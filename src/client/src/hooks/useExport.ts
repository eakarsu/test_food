import { useMutation } from 'react-query';
import { exportsApi } from '../lib/api-services';
import { QueryParams } from '../types';
import toast from 'react-hot-toast';

export const useExportCsv = () => {
  return useMutation(
    ({ entity, params }: { entity: string; params?: QueryParams }) =>
      exportsApi.csv(entity, params),
    {
      onSuccess: () => toast.success('CSV downloaded'),
      onError: () => toast.error('Failed to export CSV'),
    }
  );
};

export const useExportPdf = () => {
  return useMutation(
    ({ entity, params }: { entity: string; params?: QueryParams }) =>
      exportsApi.pdf(entity, params),
    {
      onSuccess: () => toast.success('PDF downloaded'),
      onError: () => toast.error('Failed to export PDF'),
    }
  );
};
