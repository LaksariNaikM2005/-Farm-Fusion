import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  FaFileContract, 
  FaPlus, 
  FaTrash, 
  FaEdit, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaHandHoldingUsd, 
  FaMoneyCheckAlt, 
  FaShieldAlt, 
  FaSeedling,
  FaArrowRight,
  FaTimes,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { format } from 'date-fns';

const CATEGORY_ICONS = {
  subsidy: FaHandHoldingUsd,
  loan: FaMoneyCheckAlt,
  insurance: FaShieldAlt,
  crop_support: FaSeedling,
  other: FaFileContract
};

export default function ManageSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedScheme, setSelectedScheme] = useState(null);
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    title: '', description: '', eligibility: '', link: '', category: 'subsidy', state: 'All India', deadline: '' 
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    try {
      const { data } = await api.get('/schemes');
      setSchemes(data.schemes);
      if (data.schemes.length > 0 && !selectedScheme) {
        setSelectedScheme(data.schemes[0]);
      }
    } catch (err) {
      toast.error('Failed to load schemes');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScheme = (scheme) => {
    setSelectedScheme(scheme);
    setIsEditing(false);
  };

  const startEditing = () => {
    setFormData({ 
      title: selectedScheme.title, 
      description: selectedScheme.description, 
      eligibility: selectedScheme.eligibility, 
      link: selectedScheme.link || '', 
      category: selectedScheme.category, 
      state: selectedScheme.state, 
      deadline: selectedScheme.deadline ? format(new Date(selectedScheme.deadline), 'yyyy-MM-dd') : '' 
    });
    setIsEditing(true);
  };

  const startAdding = () => {
    setSelectedScheme(null);
    setFormData({ 
      title: '', description: '', eligibility: '', link: '', category: 'subsidy', state: 'All India', deadline: '' 
    });
    setIsEditing(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (selectedScheme) {
        await api.put(`/schemes/${selectedScheme._id}`, formData);
        toast.success('Scheme updated');
      } else {
        const res = await api.post('/schemes', formData);
        toast.success('Scheme added');
        setSelectedScheme(res.data.scheme);
      }
      
      setIsEditing(false);
      fetchSchemes();
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this scheme?')) return;
    try {
      await api.delete(`/schemes/${id}`);
      const remaining = schemes.filter(s => s._id !== id);
      setSchemes(remaining);
      setSelectedScheme(remaining.length > 0 ? remaining[0] : null);
      toast.success('Scheme deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  if (loading && schemes.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex justify-between items-end mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FaFileContract className="text-gold" /> Manage Schemes</h1>
          <p className="page-subtitle">Configure government subsidies and support programs.</p>
        </div>
        <button className="btn btn-primary" onClick={startAdding}><FaPlus /> Add Scheme</button>
      </div>

      <div className="master-detail-container">
        {/* Master List */}
        <div className="master-list">
          {schemes.map(scheme => {
            const Icon = CATEGORY_ICONS[scheme.category] || FaFileContract;
            return (
              <div 
                key={scheme._id} 
                className={`scheme-item ${selectedScheme?._id === scheme._id ? 'active' : ''}`}
                onClick={() => handleSelectScheme(scheme)}
              >
                <div className="large-icon-wrapper">
                  <Icon />
                </div>
                <div className="flex-1 overflow-hidden">
                  <h3 className="text-sm font-bold truncate mb-1">{scheme.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold !text-[9px] !py-0 capitalize">{scheme.category}</span>
                    <span className="text-[10px] text-text-muted">{scheme.state}</span>
                  </div>
                </div>
                <FaArrowRight className="text-xs text-text-muted" />
              </div>
            );
          })}
        </div>

        {/* Detail Pane */}
        <div className="detail-pane slide-in">
          {isEditing ? (
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-black">{selectedScheme ? 'Edit Scheme' : 'New Government Scheme'}</h2>
                <button className="text-text-muted hover:text-white transition" onClick={() => setIsEditing(false)}>
                  <FaTimes size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="form-group md:col-span-2">
                  <label className="form-label">Scheme Title</label>
                  <input type="text" className="form-input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <select className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    <option value="subsidy">Subsidy</option>
                    <option value="loan">Loan</option>
                    <option value="insurance">Insurance</option>
                    <option value="crop_support">Crop Support</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Target State / Region</label>
                  <input type="text" className="form-input" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} required />
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Full Description</label>
                  <textarea className="form-input h-32" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
                </div>
                
                <div className="form-group md:col-span-2">
                  <label className="form-label">Eligibility Criteria</label>
                  <textarea className="form-input h-24" value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} required></textarea>
                </div>
                
                <div className="form-group">
                  <label className="form-label">Official Link (Optional)</label>
                  <input type="url" className="form-input" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Application Deadline (Optional)</label>
                  <input type="date" className="form-input" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
                </div>
                
                <div className="md:col-span-2 flex justify-end gap-4 mt-6">
                  <button type="button" className="btn btn-outline px-8" onClick={() => setIsEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary px-10" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Save Scheme'}
                  </button>
                </div>
              </form>
            </div>
          ) : selectedScheme ? (
            <>
              <div className="detail-header !bg-gold/5">
                <div className="flex justify-between items-start mb-6">
                  <span className="badge badge-gold px-4 py-1 text-xs uppercase tracking-widest">{selectedScheme.category}</span>
                  <div className="flex gap-2">
                    <button className="btn btn-outline btn-sm" onClick={startEditing}><FaEdit /> Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selectedScheme._id)}><FaTrash /> Delete</button>
                  </div>
                </div>
                <h2 className="text-4xl font-black text-text-primary leading-tight mb-4">{selectedScheme.title}</h2>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-text-secondary">
                    <FaMapMarkerAlt className="text-gold" />
                    <span>Region: <strong className="text-text-primary">{selectedScheme.state}</strong></span>
                  </div>
                  {selectedScheme.deadline && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <FaCalendarAlt className="text-warning" />
                      <span>Deadline: <strong className="text-text-primary">{format(new Date(selectedScheme.deadline), 'MMM dd, yyyy')}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="detail-content flex-1">
                <div className="mb-10">
                  <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-3">About the Scheme</h4>
                  <p className="text-text-secondary leading-relaxed text-lg">{selectedScheme.description}</p>
                </div>

                <div className="info-grid !mt-0">
                  <div className="info-box">
                    <p className="info-box-label">Eligibility Requirements</p>
                    <p className="text-text-primary text-sm leading-relaxed">{selectedScheme.eligibility}</p>
                  </div>
                  
                  <div className="info-box">
                    <p className="info-box-label">External Resources</p>
                    {selectedScheme.link ? (
                      <a href={selectedScheme.link} target="_blank" rel="noreferrer" className="text-primary-light hover:underline flex items-center gap-2">
                        Official Portal <FaExternalLinkAlt size={12} />
                      </a>
                    ) : (
                      <p className="text-text-muted text-sm italic">No link provided</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-10 p-6 rounded-xl bg-bg-elevated border border-border">
                  <h4 className="text-sm font-bold mb-2">Administration Note</h4>
                  <p className="text-xs text-text-muted">
                    This scheme is currently active on the farmer's portal. Changes made here will be reflected instantly across the platform.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center">
              <FaFileContract className="text-6xl mb-6 opacity-20" />
              <h3 className="text-xl font-bold">No scheme selected</h3>
              <p className="max-w-xs mt-2">Select a government scheme from the list or add a new one.</p>
              <button className="btn btn-primary mt-6" onClick={startAdding}>Add First Scheme</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
