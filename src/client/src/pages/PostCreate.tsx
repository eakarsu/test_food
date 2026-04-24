import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useCreatePost } from '../hooks/usePosts';

interface PostForm {
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
}

const PostCreate = () => {
  const navigate = useNavigate();
  const createPost = useCreatePost();
  const { register, handleSubmit, formState: { errors } } = useForm<PostForm>({ defaultValues: { published: false } });

  const onSubmit = async (data: PostForm) => {
    const post = await createPost.mutateAsync(data);
    navigate(`/posts/${post.id}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate('/posts')} className="flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Posts
          </button>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Post</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input className="input mt-1" placeholder="Post title" {...register('title', { required: 'Title is required' })} />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Excerpt</label>
                <input className="input mt-1" placeholder="Brief excerpt (optional)" {...register('excerpt')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea className="input mt-1" rows={10} placeholder="Write your post content..." {...register('content', { required: 'Content is required' })} />
                {errors.content && <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>}
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" {...register('published')} className="rounded border-gray-300" />
                <label className="text-sm text-gray-700">Publish immediately</label>
              </div>
              <button type="submit" disabled={createPost.isLoading} className="btn btn-primary">
                {createPost.isLoading ? 'Creating...' : 'Create Post'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PostCreate;
