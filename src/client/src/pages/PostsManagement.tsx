import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Download } from 'lucide-react';
import DataTable, { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import BulkActionBar from '../components/ui/BulkActionBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { usePosts, useBulkDeletePosts } from '../hooks/usePosts';
import { useExportCsv, useExportPdf } from '../hooks/useExport';
import { Post } from '../types';

const PostsManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading } = usePosts({ page, search, sortBy, sortOrder, ...filters });
  const bulkDelete = useBulkDeletePosts();
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

  const handleBulkDelete = async () => {
    await bulkDelete.mutateAsync(selectedIds);
    setSelectedIds([]);
    setShowDeleteConfirm(false);
  };

  const columns: Column<Post>[] = [
    { key: 'title', label: 'Title', sortable: true },
    {
      key: 'author',
      label: 'Author',
      render: (p) => p.author ? `${p.author.firstName} ${p.author.lastName}` : '-',
    },
    {
      key: 'published',
      label: 'Status',
      sortable: true,
      render: (p) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {p.published ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (p) => new Date(p.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Posts</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => exportCsv.mutate({ entity: 'posts' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => exportPdf.mutate({ entity: 'posts' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> PDF
              </button>
              <button onClick={() => navigate('/posts/new')} className="btn btn-primary flex items-center gap-1">
                <Plus className="w-4 h-4" /> New Post
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search posts..." />
            </div>
            <FilterBar
              filters={[{ key: 'published', label: 'Status', options: [{ label: 'Published', value: 'true' }, { label: 'Draft', value: 'false' }] }]}
              values={filters}
              onChange={(k, v) => { setFilters((prev) => ({ ...prev, [k]: v })); setPage(1); }}
            />
          </div>

          <BulkActionBar count={selectedIds.length} onDelete={() => setShowDeleteConfirm(true)} />

          <div className="mt-4">
            <DataTable
              columns={columns}
              data={(data?.data || []) as unknown as Record<string, unknown>[]}
              loading={isLoading}
              onRowClick={(item) => navigate(`/posts/${(item as unknown as Post).id}`)}
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
        title="Delete Posts"
        message={`Are you sure you want to delete ${selectedIds.length} post(s)?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default PostsManagement;
