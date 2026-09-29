import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaComments, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export default function ForumModeration() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data } = await api.get('/admin/forum', { params: { limit: 50 } });
      setPosts(data.posts);
    } catch (err) {
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await api.delete(`/forum/${id}`);
      setPosts(posts.filter(p => p._id !== id));
      toast.success('Post removed');
    } catch (err) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2"><FaComments /> Forum Moderation</h1>
        <p className="page-subtitle">Monitor and manage community discussions.</p>
      </div>

      <div className="card p-0 table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title & Author</th>
              <th>Category</th>
              <th>Date</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-8"><div className="spinner mx-auto"></div></td></tr>
            ) : posts.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-8 text-text-muted">No posts found.</td></tr>
            ) : (
              posts.map(post => (
                <tr key={post._id}>
                  <td className="max-w-[300px]">
                    <div className="font-semibold text-sm truncate pr-4">{post.title}</div>
                    <div className="text-xs text-text-muted mt-1">by {post.author?.name}</div>
                  </td>
                  <td><span className="badge badge-gray capitalize">{post.category.replace('_', ' ')}</span></td>
                  <td className="text-sm">{format(new Date(post.createdAt), 'MMM dd, yyyy')}</td>
                  <td>
                    <div className="text-xs space-y-1">
                      <div><span className="text-text-muted">Likes:</span> {post.likes?.length || 0}</div>
                      <div><span className="text-text-muted">Comments:</span> {post.comments?.length || 0}</div>
                      <div><span className="text-text-muted">Status:</span> {post.isActive ? <span className="text-success">Active</span> : <span className="text-danger">Removed</span>}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/farmer/forum/${post._id}`} target="_blank" className="p-2 text-primary hover:text-primary-light transition" title="View Post"><FaExternalLinkAlt /></Link>
                      {post.isActive && (
                        <button className="p-2 text-danger hover:text-danger-light transition" onClick={() => handleDelete(post._id)} title="Delete Post"><FaTrash /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
