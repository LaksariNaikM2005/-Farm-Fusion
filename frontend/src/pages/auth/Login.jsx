import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaLeaf, FaEnvelope, FaLock, FaArrowRight } from 'react-icons/fa';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Welcome back!');
      
      if (data.user.role === 'admin') navigate('/admin');
      else if (data.user.role === 'expert') navigate('/expert');
      else navigate('/farmer');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Demo buttons
  const loginDemo = (role) => {
    setEmail(`${role}@demo.com`);
    setPassword('password123');
  };

  return (
    <div className="auth-container">
      <div className="auth-card card-glass">
        <div className="auth-header">
          <Link to="/" className="topbar-brand" style={{ justifyContent: 'center' }}>
            <FaLeaf className="brand-icon" />
            <span>Farm <span className="brand-accent">Fusion</span></span>
          </Link>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="auth-form">
          <div className="form-group relative">
            <label className="form-label">Email Address</label>
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input
                type="email"
                className="form-input pl-10"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group relative">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type="password"
                className="form-input pl-10"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg mt-4" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'} <FaArrowRight />
          </button>
        </form>

        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Create one</Link></p>
        </div>

        <div className="demo-credentials mt-6">
          <p className="text-center text-sm text-gray-400 mb-2">Demo Accounts (Click to fill)</p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => loginDemo('farmer')} className="badge badge-green">Farmer</button>
            <button onClick={() => loginDemo('expert')} className="badge badge-gold">Expert</button>
            <button onClick={() => loginDemo('admin')} className="badge badge-blue">Admin</button>
          </div>
        </div>
      </div>
    </div>
  );
}
