import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { FaArrowLeft, FaThumbsUp, FaComment, FaUserCircle } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

export default function ForumPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector(s => s.auth);
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await api.get(`/forum/${id}`);
      setPost(data.post);
    } catch (err) {
      toast.error('Post not found');
      navigate('/farmer/forum');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      const { data } = await api.put(`/forum/${id}/like`);
      const likes = post.likes.includes(user._id) ? post.likes.filter(uid => uid !== user._id) : [...post.likes, user._id];
      setPost({ ...post, likes });
    } catch (err) {
      toast.error('Error liking post');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await api.post(`/forum/${id}/comment`, { content: comment });
      setPost({ ...post, comments: data.comments });
      setComment('');
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;
  if (!post) return null;

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <Link to="/farmer/forum" className="btn btn-outline btn-sm mb-6 w-fit"><FaArrowLeft /> Back to Discussions</Link>
      
      {/* Main Post */}
      <div className="card p-8 mb-6 border-t-4 border-t-primary">
        <div className="flex items-center gap-3 mb-6">
          <img src={post.author?.profileImage || 'https://via.placeholder.com/50'} alt="" className="avatar" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">{post.author?.name}</span>
              <span className="badge badge-gray text-[10px] capitalize">{post.author?.role}</span>
            </div>
            <p className="text-xs text-text-muted">{format(new Date(post.createdAt), 'MMM dd, yyyy • hh:mm a')}</p>
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>
        <div className="text-text-primary leading-relaxed whitespace-pre-wrap mb-6 text-[15px]">
          {post.content}
        </div>
        
        {post.tags?.length > 0 && (
          <div className="flex gap-2 mb-6">
            {post.tags.map((tag, i) => <span key={i} className="text-xs text-primary-light bg-primary-glow px-2 py-1 rounded">#{tag}</span>)}
          </div>
        )}

        <div className="flex gap-4 text-sm font-bold border-t border-border pt-4">
          <button 
            className={`flex items-center gap-2 py-1 px-3 rounded hover:bg-bg-elevated transition ${post.likes.includes(user._id) ? 'text-primary' : 'text-text-secondary'}`}
            onClick={handleLike}
          >
            <FaThumbsUp /> {post.likes.length} Likes
          </button>
          <div className="flex items-center gap-2 py-1 px-3 text-text-secondary">
            <FaComment /> {post.comments.length} Comments
          </div>
        </div>
      </div>

      {/* Add Comment */}
      <div className="card mb-6">
        <form onSubmit={handleComment} className="flex gap-3">
          <img src={user.profileImage || 'https://via.placeholder.com/40'} alt="" className="avatar avatar-sm hidden md:block" />
          <textarea 
            className="form-input flex-1 min-h-[60px]" 
            placeholder="Add to the discussion..." 
            value={comment} 
            onChange={e => setComment(e.target.value)}
            required
          ></textarea>
          <button type="submit" className="btn btn-primary self-end" disabled={submitting}>
            {submitting ? '...' : 'Reply'}
          </button>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {post.comments.slice().reverse().map(c => (
          <div key={c._id} className="p-4 bg-bg-elevated border border-border rounded-lg flex gap-3">
            {c.author?.profileImage ? (
              <img src={c.author.profileImage} alt="" className="avatar avatar-sm" />
            ) : (
              <FaUserCircle className="text-3xl text-text-muted" />
            )}
            <div className="flex-1">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="font-semibold text-sm">{c.author?.name}</span>
                <span className="text-[10px] text-text-muted">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
              </div>
              <p className="text-sm text-text-secondary whitespace-pre-wrap">{c.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
