import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, FileText, Image } from 'lucide-react';
import { useFile, useDeleteFile } from '../hooks/useFiles';
import ConfirmDialog from '../components/ui/ConfirmDialog';

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

const FileDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: file, isLoading } = useFile(id!);
  const deleteFile = useDeleteFile();
  const [showDelete, setShowDelete] = useState(false);

  const onDelete = async () => {
    await deleteFile.mutateAsync(id!);
    navigate('/files');
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!file) return <div className="p-8 text-center">File not found</div>;

  const isImage = file.mimetype.startsWith('image/');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/files')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Files
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                {isImage ? <Image className="w-8 h-8 text-blue-500" /> : <FileText className="w-8 h-8 text-gray-500" />}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{file.originalName}</h1>
                  <p className="text-gray-500 text-sm">{file.mimetype}</p>
                </div>
              </div>
              <button onClick={() => setShowDelete(true)} className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 text-sm">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>

            {isImage && (
              <div className="mb-6 rounded-lg overflow-hidden border">
                <img src={`/uploads/${file.filename}`} alt={file.originalName} className="max-w-full h-auto" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">File Name</label>
                <p className="mt-1 text-gray-900">{file.filename}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Size</label>
                <p className="mt-1 text-gray-900">{formatSize(file.size)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Uploaded By</label>
                <p className="mt-1 text-gray-900">
                  {file.uploadedBy ? `${file.uploadedBy.firstName} ${file.uploadedBy.lastName}` : '-'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Uploaded At</label>
                <p className="mt-1 text-gray-900">{new Date(file.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete File"
        message="Are you sure you want to delete this file? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default FileDetail;
