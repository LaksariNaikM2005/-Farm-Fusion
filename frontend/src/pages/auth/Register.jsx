import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaLeaf, FaUser, FaEnvelope, FaLock, FaMapMarkerAlt, FaBriefcase, FaArrowRight } from 'react-icons/fa';
import './Auth.css';

export default function Register() {
  const [role, setRole] = useState('farmer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', location: '',
    specialization: '', experience: '', consultationFee: ''
  });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { ...formData, role });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Registration successful!');
      navigate(role === 'expert' ? '/expert' : '/farmer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card card-glass wide-card">
        <div className="auth-header">
          <Link to="/" className="topbar-brand" style={{ justifyContent: 'center' }}>
            <FaLeaf className="brand-icon" />
            <span>Farm <span className="brand-accent">Fusion</span></span>
          </Link>
          <p className="auth-subtitle">Join the agricultural community</p>
        </div>

        <div className="role-selector mb-6">
          <button className={`role-btn ${role === 'farmer' ? 'active' : ''}`} onClick={() => setRole('farmer')}>Farmer</button>
          <button className={`role-btn ${role === 'expert' ? 'active' : ''}`} onClick={() => setRole('expert')}>Expert</button>
        </div>

        <form onSubmit={handleRegister} className="auth-form two-cols">
          <div className="form-group relative">
            <label className="form-label">Full Name</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input type="text" name="name" className="form-input pl-10" value={formData.name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input type="email" name="email" className="form-input pl-10" value={formData.email} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input type="password" name="password" className="form-input pl-10" value={formData.password} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label">Location</label>
            <div className="input-with-icon">
              <FaMapMarkerAlt className="input-icon" />
              <input type="text" name="location" className="form-input pl-10" placeholder="City, State" value={formData.location} onChange={handleChange} required />
            </div>
          </div>

          {role === 'expert' && (
            <>
              <div className="form-group relative">
                <label className="form-label">Specialization</label>
                <div className="input-with-icon">
                  <FaBriefcase className="input-icon" />
                  <input type="text" name="specialization" className="form-input pl-10" placeholder="e.g. Agronomy, Soil Science" value={formData.specialization} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group flex gap-4">
                <div className="w-1/2">
                  <label className="form-label">Years of Exp.</label>
                  <input type="number" name="experience" className="form-input" value={formData.experience} onChange={handleChange} required />
                </div>
                <div className="w-1/2">
                  <label className="form-label">Fee (₹)</label>
                  <input type="number" name="consultationFee" className="form-input" value={formData.consultationFee} onChange={handleChange} required />
                </div>
              </div>
            </>
          )}

          <div className="col-span-full">
            <button type="submit" className="btn btn-primary btn-full btn-lg mt-4" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'} <FaArrowRight />
            </button>
          </div>
        </form>

        <div className="auth-footer mt-6">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
