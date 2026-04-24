import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import DataTable, { Column } from '../components/ui/DataTable';
import Pagination from '../components/ui/Pagination';
import SearchBar from '../components/ui/SearchBar';
import FilterBar from '../components/ui/FilterBar';
import BulkActionBar from '../components/ui/BulkActionBar';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import { useUsers, useBulkDeleteUsers } from '../hooks/useUsers';
import { useExportCsv, useExportPdf } from '../hooks/useExport';
import { User } from '../types';

const UsersManagement = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, isLoading } = useUsers({ page, search, sortBy, sortOrder, ...filters });
  const bulkDelete = useBulkDeleteUsers();
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

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Name',
      render: (u) => `${u.firstName} ${u.lastName}`,
    },
    { key: 'email', label: 'Email', sortable: true },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (u) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
          {u.role}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Joined',
      sortable: true,
      render: (u) => new Date(u.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Users</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => exportCsv.mutate({ entity: 'users' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> CSV
              </button>
              <button onClick={() => exportPdf.mutate({ entity: 'users' })} className="btn btn-secondary flex items-center gap-1 text-sm">
                <Download className="w-4 h-4" /> PDF
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search users..." />
            </div>
            <FilterBar
              filters={[{ key: 'role', label: 'Role', options: [{ label: 'Admin', value: 'ADMIN' }, { label: 'User', value: 'USER' }] }]}
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
              onRowClick={(item) => navigate(`/users/${(item as unknown as User).id}`)}
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
        title="Delete Users"
        message={`Are you sure you want to delete ${selectedIds.length} user(s)?`}
        confirmLabel="Delete"
        destructive
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
};

export default UsersManagement;
