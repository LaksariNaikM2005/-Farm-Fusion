import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaVideo, FaComment, FaMapMarkerAlt, FaStar, FaSearch, FaBriefcase } from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ExpertDirectory() {
  const [experts, setExperts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const { data } = await api.get('/external/experts');
        // Fallback if not authorized: wait for backend to be ready or use a mock.
        // Let's ensure we fetch properly. A public directory route might be needed.
        // Assuming admin/users?role=expert works or creating a public alternative.
        setExperts(data.users || []);
      } catch (err) {
        toast.error('Failed to load experts');
      } finally {
        setLoading(false);
      }
    };
    fetchExperts();
  }, []);

  const filtered = experts.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    (e.specialization && e.specialization.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fade-in">
      <div className="page-header flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
          <h1 className="page-title">Expert Directory</h1>
          <p className="page-subtitle">Connect with certified agricultural specialists for personalized guidance.</p>
        </div>
        
        <div className="search-bar w-full md:w-72">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by name or specialty..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="spinner-wrap"><div className="spinner"></div></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <FaBriefcase className="empty-icon" />
          <h3>No experts found</h3>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(expert => (
            <div key={expert._id} className="expert-card group">
              <div className="flex gap-4 mb-2">
                <img src={expert.profileImage || 'https://via.placeholder.com/80'} alt="" className="avatar avatar-lg rounded-xl" />
                <div>
                  <h3 className="font-bold text-text-primary text-lg group-hover:text-primary transition">{expert.name}</h3>
                  <p className="text-sm text-primary-light font-medium">{expert.specialization || 'Agriculture Expert'}</p>
                  <div className="flex items-center gap-1 text-gold text-sm mt-1">
                    <FaStar /> <span>{expert.rating ? expert.rating.toFixed(1) : 'New'}</span>
                    <span className="text-text-muted ml-1">({expert.totalReviews || 0} reviews)</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1 text-sm text-text-secondary mt-2 border-t border-border pt-3">
                <span className="flex items-center gap-2"><FaBriefcase className="text-text-muted" /> {expert.experience || 0} Years Experience</span>
                <span className="flex items-center gap-2"><FaMapMarkerAlt className="text-text-muted" /> {expert.location || 'Remote'}</span>
              </div>
              
              <div className="flex justify-between items-center mt-auto pt-4">
                <div className="font-bold text-gold text-lg">₹{expert.consultationFee || 0} <span className="text-xs text-text-muted font-normal">/ session</span></div>
                <Link to={`/farmer/appointments?book=${expert._id}`} className="btn btn-primary btn-sm">Book Consult</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
