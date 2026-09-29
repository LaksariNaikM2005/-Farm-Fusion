import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import { 
  FaComments, 
  FaThumbsUp, 
  FaSearch, 
  FaPlus, 
  FaTag, 
  FaUserCircle, 
  FaPaperPlane,
  FaFilter,
  FaUserEdit,
  FaClock,
  FaHashtag,
  FaChevronRight,
  FaCommentDots,
  FaRegCommentDots
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const FORUM_CATEGORY_ICONS = {
  general: FaComments,
  crop_disease: FaFilter, // Actually could use a better icon like FaBug but Filter works too
  market_prices: FaTag,
  weather: FaComments,
  government_schemes: FaComments,
  technology: FaComments,
  success_story: FaComments,
};

export default function Forum() {
  const { user } = useSelector(s => s.auth);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  
  // Detail State
  const [postDetail, setPostDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commenting, setCommenting] = useState(false);

  // New Post Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [submitting, setSubmitting] = useState(false);

  const categories = ['general', 'crop_disease', 'market_prices', 'weather', 'government_schemes', 'technology', 'success_story'];

  useEffect(() => {
    fetchPosts();
  }, [category]);

  const fetchPosts = async (searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/forum', { params: { search: searchQuery, category } });
      setPosts(data.posts);
      if (data.posts.length > 0 && !selectedPost) {
        handleSelectPost(data.posts[0]);
      }
    } catch (err) {
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPost = async (post) => {
    setSelectedPost(post);
    setShowForm(false);
    setDetailLoading(true);
    try {
      const { data } = await api.get(`/forum/${post._id}`);
      setPostDetail(data.post);
    } catch (err) {
      toast.error('Error loading post details');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      await api.put(`/forum/${postId}/like`);
      // Update local state
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const likes = p.likes.includes(user._id) ? p.likes.filter(id => id !== user._id) : [...p.likes, user._id];
          return { ...p, likes };
        }
        return p;
      }));
      
      if (postDetail?._id === postId) {
        const likes = postDetail.likes.includes(user._id) ? postDetail.likes.filter(id => id !== user._id) : [...postDetail.likes, user._id];
        setPostDetail({ ...postDetail, likes });
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setCommenting(true);
    try {
      const { data } = await api.post(`/forum/${postDetail._id}/comment`, { content: newComment });
      setPostDetail({ ...postDetail, comments: data.comments });
      setNewComment('');
      setPosts(prev => prev.map(p => p._id === postDetail._id ? { ...p, comments: data.comments } : p));
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const tagArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
      const { data } = await api.post('/forum', { ...formData, tags: tagArray });
      toast.success('Discussion started!');
      setShowForm(false);
      setFormData({ title: '', content: '', category: 'general', tags: '' });
      fetchPosts();
      handleSelectPost(data.post);
    } catch (err) {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && posts.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-7xl mx-auto">
      <div className="page-header mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="page-title flex items-center gap-2"><FaCommentDots className="text-gold" /> Community Hub</h1>
            <p className="page-subtitle">Exchange knowledge and get advice from the community.</p>
          </div>
          
          <div className="flex gap-2 w-full md:w-auto">
            <form onSubmit={(e) => { e.preventDefault(); fetchPosts(); }} className="search-bar flex-1 md:w-64">
              <FaSearch className="search-icon" />
              <input type="text" className="form-input" placeholder="Search discussions..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </form>
            <button className="btn btn-primary" onClick={() => { setShowForm(true); setSelectedPost(null); }}>
              <FaPlus /> Start Topic
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 hide-scrollbar">
        <button 
          className={`badge ${category === '' ? 'badge-gold' : 'badge-gray'} py-1 px-4 cursor-pointer text-xs`} 
          onClick={() => setCategory('')}
        >All Topics</button>
        {categories.map(cat => (
          <button 
            key={cat} 
            className={`badge ${category === cat ? 'badge-gold' : 'badge-gray'} py-1 px-4 cursor-pointer text-xs capitalize`} 
            onClick={() => setCategory(cat)}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="master-detail-container">
        {/* Master List (Left Sidebar) */}
        <div className="master-list h-[calc(100vh-280px)] overflow-y-auto">
          {posts.length === 0 ? (
            <div className="p-10 text-center opacity-40"><p>No discussions found.</p></div>
          ) : (
            posts.map(p => {
              const Icon = FORUM_CATEGORY_ICONS[p.category] || FaComments;
              return (
                <div 
                  key={p._id} 
                  className={`scheme-item ${selectedPost?._id === p._id ? 'active' : ''}`}
                  onClick={() => handleSelectPost(p)}
                >
                  <div className="large-icon-wrapper">
                    <Icon />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-bold truncate mb-1">{p.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge badge-gold !text-[10px] !py-0 capitalize">{p.category.replace('_', ' ')}</span>
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <FaClock /> {formatDistanceToNow(new Date(p.createdAt))} ago
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Detail Pane (Right Content) */}
        <div className="detail-pane slide-in h-[calc(100vh-280px)] overflow-y-auto">
          {showForm ? (
            <div className="p-10 max-w-3xl mx-auto w-full">
              <h2 className="text-3xl font-black mb-8">Start a Discussion</h2>
              <form onSubmit={handleCreatePost} className="grid gap-6">
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" className="form-input" placeholder="Give your topic a clear title" 
                    value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma separated)</label>
                    <input 
                      type="text" className="form-input" placeholder="wheat, disease, help" 
                      value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Content</label>
                  <textarea 
                    className="form-input h-48" placeholder="Describe your question or share your knowledge..." 
                    value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} required 
                  ></textarea>
                </div>
                <div className="flex justify-end gap-4">
                  <button type="button" className="btn btn-outline px-10" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-12" disabled={submitting}>
                    {submitting ? 'Posting...' : 'Post Discussion'}
                  </button>
                </div>
              </form>
            </div>
          ) : detailLoading ? (
            <div className="flex-1 flex items-center justify-center h-full"><div className="spinner"></div></div>
          ) : postDetail ? (
            <>
              <div className="detail-header">
                <div className="flex justify-between items-start mb-6">
                  <span className="badge badge-gold px-4 py-1 text-sm capitalize">{postDetail.category.replace('_', ' ')}</span>
                  <div className="flex gap-2">
                    {postDetail.tags?.map((t, i) => (
                      <span key={i} className="text-xs font-semibold px-3 py-1 bg-bg-elevated rounded-full border border-border flex items-center gap-1">
                        <FaHashtag className="text-gold" /> {t}
                      </span>
                    ))}
                  </div>
                </div>
                <h2 className="text-3xl font-black text-text-primary leading-tight mb-4">{postDetail.title}</h2>
                <div className="flex items-center gap-6 text-sm text-text-secondary">
                  <div className="flex items-center gap-2">
                    <img src={postDetail.author?.profileImage || 'https://via.placeholder.com/30'} alt="" className="w-6 h-6 rounded-full" />
                    <span className="font-bold text-text-primary">{postDetail.author?.name}</span>
                    <span className="badge badge-gray text-[10px] uppercase">{postDetail.author?.role}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaClock className="text-gold" />
                    <span>Posted {format(new Date(postDetail.createdAt), 'MMM dd, yyyy')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1">
                <div className="mb-12">
                  <div className="p-8 rounded-2xl bg-bg-elevated/50 border border-border">
                    <p className="text-text-primary leading-relaxed text-lg whitespace-pre-wrap">
                      {postDetail.content}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 mb-12 pb-8 border-b border-border">
                  <button 
                    onClick={() => handleLike(postDetail._id)}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full border transition font-bold ${postDetail.likes.includes(user._id) ? 'bg-primary border-primary text-white' : 'border-border hover:border-primary-light text-text-secondary'}`}
                  >
                    <FaThumbsUp /> {postDetail.likes.length} Likes
                  </button>
                  <div className="flex items-center gap-2 text-text-secondary font-bold">
                    <FaRegCommentDots /> {postDetail.comments.length} Comments
                  </div>
                </div>

                {/* Comments Section */}
                <div className="space-y-8">
                  <h4 className="text-xl font-bold flex items-center gap-2">
                    <FaComments className="text-gold" /> Discussion
                  </h4>

                  {/* Comment Form */}
                  <form onSubmit={handleComment} className="flex gap-4">
                    <img src={user.profileImage || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full shrink-0 mt-1" />
                    <div className="flex-1 relative">
                      <textarea 
                        className="form-input !pr-14 !min-h-[60px] !bg-bg-surface" 
                        placeholder="Add your thoughts..." 
                        value={newComment} onChange={e => setNewComment(e.target.value)} required
                      ></textarea>
                      <button 
                        type="submit" 
                        className="absolute bottom-3 right-4 text-primary-light hover:text-primary transition disabled:opacity-50"
                        disabled={commenting || !newComment.trim()}
                      >
                        <FaPaperPlane size={20} />
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {postDetail.comments.slice().reverse().map(c => (
                      <div key={c._id} className="flex gap-4">
                        <img src={c.author?.profileImage || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-full shrink-0 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-bold text-sm text-text-primary">{c.author?.name}</span>
                            <span className="text-[10px] text-text-muted">{formatDistanceToNow(new Date(c.createdAt))} ago</span>
                          </div>
                          <div className="p-4 rounded-2xl rounded-tl-none bg-bg-elevated border border-border">
                            <p className="text-sm text-text-secondary leading-relaxed">{c.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center opacity-30 h-full">
              <FaComments className="text-8xl mb-6" />
              <h3 className="text-2xl font-bold">Forum Central</h3>
              <p className="max-w-xs mt-2">Select a discussion from the list to join the conversation.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
