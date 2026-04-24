import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { usePost, useUpdatePost, useDeletePost } from '../hooks/usePosts';
import ConfirmDialog from '../components/ui/ConfirmDialog';

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: post, isLoading } = usePost(id!);
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const [editing, setEditing] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSave = async (data: Record<string, unknown>) => {
    await updatePost.mutateAsync({ id: id!, data });
    setEditing(false);
  };

  const onDelete = async () => {
    await deletePost.mutateAsync(id!);
    navigate('/posts');
  };

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!post) return <div className="p-8 text-center">Post not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/posts')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Posts
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${post.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {!editing && (
                  <button onClick={() => { setEditing(true); reset({ title: post.title, content: post.content, excerpt: post.excerpt || '', published: post.published }); }} className="btn btn-secondary flex items-center gap-1 text-sm">
                    <Edit2 className="w-4 h-4" /> Edit
                  </button>
                )}
                <button onClick={() => setShowDelete(true)} className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-1 text-sm">
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit(onSave)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input className="input mt-1" defaultValue={post.title} {...register('title')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                  <input className="input mt-1" defaultValue={post.excerpt || ''} {...register('excerpt')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea className="input mt-1" rows={10} defaultValue={post.content} {...register('content')} />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked={post.published} {...register('published')} className="rounded border-gray-300" />
                  <label className="text-sm text-gray-700">Published</label>
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={updatePost.isLoading} className="btn btn-primary flex items-center gap-1">
                    <Save className="w-4 h-4" /> Save
                  </button>
                  <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary flex items-center gap-1">
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{post.title}</h1>
                {post.author && <p className="text-sm text-gray-500 mb-4">By {post.author.firstName} {post.author.lastName} on {new Date(post.createdAt).toLocaleDateString()}</p>}
                {post.excerpt && <p className="text-gray-600 italic mb-4">{post.excerpt}</p>}
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>

      <ConfirmDialog
        open={showDelete}
        title="Delete Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={onDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
};

export default PostDetail;
