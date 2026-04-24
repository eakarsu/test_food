import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, Download } from 'lucide-react';
import DataTable, { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import BulkActionBar from '../components/ui/BulkActionBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useFiles, useUploadFile, useBulkDeleteFiles } from '../hooks/useFiles';
import { useExportCsv, useExportPdf } from '../hooks/useExport';
import { FileRecord } from '../types';

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const FilesManagement = () => {
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading } = useFiles({ page, search, sortBy, sortOrder });
  const uploadFile = useUploadFile();
  const bulkDelete = useBulkDeleteFiles();
  const exportCsv = useExportCsv();
  const exportPdf = useExportPdf();

  const handleSort = useCallback((key: string) => {
    if (sortBy === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(key);
      setSortOrder('asc');
    }
  }, [sortBy]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadFile.mutateAsync(file);
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedIds);
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  const columns: Column<FileRecord>[] = [
    { key: 'originalName', label: 'Name', sortable: true },
    { key: 'mimetype', label: 'Type' },
    {
      key: 'size',
      label: 'Size',
      sortable: true,
      render: (f) => formatSize(f.size),
    },
    {
      key: 'uploadedBy',
      label: 'Uploaded By',
      render: (f) => f.uploadedBy ? `${f.uploadedBy.firstName} ${f.uploadedBy.lastName}` : '-',
    },
    {
      key: 'createdAt',
      label: 'Uploaded',
      sortable: true,
      render: (f) => new Date(f.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Files</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => exportCsv.mutate({ entity: 'files' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => exportPdf.mutate({ entity: 'files' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> PDF
              </button>
              <input ref={fileInput} type="file" onChange={handleUpload} className="hidden" />
              <button onClick={() => fileInput.current?.click()} className="btn btn-primary flex items-center gap-1">
                <Upload className="w-4 h-4" /> Upload
              </button>
            </div>
          </div>

          <div className="mb-4">
            <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search files..." />
          </div>

          <BulkActionBar count={selectedIds.length} onDelete={() => setShowDeleteConfirm(true)} />

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={(data?.data || []) as unknown as Record<string, unknown>[]}
              loading={isLoading}
              onRowClick={(item) => navigate(`/files/${(item as unknown as FileRecord).id}`)}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
            />
          </div>

          {data?.pagination && (
            <div className="mt-4">
              <Pagination pagination={data.pagination} onPageChange={setPage} />
            </div>
          )}
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title="Delete Files"
        message={`Are you sure you want to delete ${selectedIds.length} file(s)?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default FilesManagement;
