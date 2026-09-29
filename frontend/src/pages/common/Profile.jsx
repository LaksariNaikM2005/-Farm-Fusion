import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaUser, FaPhone, FaMapMarkerAlt, FaBriefcase, FaGraduationCap, FaWallet, FaSave, FaCamera } from 'react-icons/fa';

export default function Profile() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    bio: user?.bio || '',
    specialization: user?.specialization || '',
    experience: user?.experience || '',
    consultationFee: user?.consultationFee || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/auth/update-profile', formData);
      dispatch(setCredentials({ user: data.user, token: localStorage.getItem('token') }));
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in max-w-4xl mx-auto">
      <div className="page-header mb-8">
        <h1 className="page-title flex items-center gap-2"><FaUser className="text-primary-light" /> My Profile</h1>
        <p className="page-subtitle">Manage your personal information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Avatar & Summary */}
        <div className="lg:col-span-1">
          <div className="card text-center sticky top-24">
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full rounded-full bg-primary-glow border-4 border-primary/20 flex items-center justify-center text-5xl font-black text-primary-light overflow-hidden">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.[0]?.toUpperCase()
                )}
              </div>
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-gold rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-110 transition shadow-lg">
                <FaCamera size={16} />
                <input type="file" className="hidden" />
              </label>
            </div>
            
            <h3 className="text-xl font-bold mb-1">{user?.name}</h3>
            <p className="text-xs text-gold font-bold uppercase tracking-widest mb-4">{user?.role}</p>
            <div className="badge badge-primary px-4 py-1 mb-6">{user?.email}</div>
            
            <div className="border-t border-border pt-6 text-left">
              <h4 className="text-xs font-bold text-text-muted uppercase mb-4">Account Status</h4>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Member since</span>
                <span className="font-bold">{new Date(user?.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">Verified</span>
                <span className={user?.isVerified ? 'text-success-light font-bold' : 'text-danger-light font-bold'}>
                  {user?.isVerified ? 'Yes' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="card p-8">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <FaUser size={16} className="text-gold" /> Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group md:col-span-2">
                <label className="form-label">Full Name</label>
                <div className="input-with-icon">
                  <FaUser className="input-icon" />
                  <input type="text" name="name" className="form-input pl-10" value={formData.name} onChange={handleChange} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <div className="input-with-icon">
                  <FaPhone className="input-icon" />
                  <input type="tel" name="phone" className="form-input pl-10" value={formData.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location / Address</label>
                <div className="input-with-icon">
                  <FaMapMarkerAlt className="input-icon" />
                  <input type="text" name="location" className="form-input pl-10" value={formData.location} onChange={handleChange} placeholder="City, State" />
                </div>
              </div>

              <div className="form-group md:col-span-2">
                <label className="form-label">Short Bio</label>
                <textarea name="bio" className="form-input h-24" value={formData.bio} onChange={handleChange} placeholder="Tell us about yourself..."></textarea>
              </div>

              {user?.role === 'expert' && (
                <>
                  <div className="col-span-full border-t border-border mt-4 pt-6">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                      <FaBriefcase size={16} className="text-gold" /> Expert Details
                    </h3>
                  </div>
                  
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Specialization</label>
                    <div className="input-with-icon">
                      <FaGraduationCap className="input-icon" />
                      <input type="text" name="specialization" className="form-input pl-10" value={formData.specialization} onChange={handleChange} required />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Experience (Years)</label>
                    <input type="number" name="experience" className="form-input" value={formData.experience} onChange={handleChange} required />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Consultation Fee (₹)</label>
                    <div className="input-with-icon">
                      <FaWallet className="input-icon" />
                      <input type="number" name="consultationFee" className="form-input pl-10" value={formData.consultationFee} onChange={handleChange} required />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end mt-10">
              <button type="submit" className="btn btn-primary btn-lg px-12 gap-2" disabled={loading}>
                {loading ? 'Saving...' : <><FaSave /> Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
