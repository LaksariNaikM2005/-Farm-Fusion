import { useState, useEffect } from 'react';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  FaSearch, 
  FaCheck, 
  FaTimes, 
  FaUserShield, 
  FaArrowRight, 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaShieldAlt,
  FaExclamationTriangle,
  FaUserCog
} from 'react-icons/fa';
import { format } from 'date-fns';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [role]);

  const fetchUsers = async (searchQuery = search) => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { search: searchQuery, role } });
      setUsers(data.users);
      if (data.users.length > 0 && !selectedUser) {
        setSelectedUser(data.users[0]);
      }
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const toggleStatus = async (user) => {
    setSubmitting(true);
    try {
      const { data } = await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers(users.map(u => u._id === user._id ? data.user : u));
      setSelectedUser(data.user);
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleVerify = async (user) => {
    if (user.role !== 'expert') return;
    setSubmitting(true);
    try {
      const { data } = await api.put(`/admin/users/${user._id}`, { isVerified: !user.isVerified });
      setUsers(users.map(u => u._id === user._id ? data.user : u));
      setSelectedUser(data.user);
      toast.success(`Expert ${!user.isVerified ? 'verified' : 'unverified'}`);
    } catch (err) {
      toast.error('Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && users.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FaUserShield className="text-blue-400" /> User Ecosystem</h1>
          <p className="page-subtitle">Manage account security, roles, and verifications.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select className="form-input md:w-40" value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="farmer">Farmers</option>
            <option value="expert">Experts</option>
            <option value="admin">Admins</option>
          </select>
          <form onSubmit={handleSearch} className="search-bar flex-1 md:w-64">
            <FaSearch className="search-icon" />
            <input type="text" className="form-input" placeholder="Search name/email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </form>
        </div>
      </div>

      <div className="master-detail-container h-[calc(100vh-220px)]">
        {/* Master List */}
        <div className="master-list overflow-y-auto">
          {users.map(user => (
            <div 
              key={user._id} 
              className={`scheme-item ${selectedUser?._id === user._id ? 'active' : ''}`}
              onClick={() => setSelectedUser(user)}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${user.role === 'expert' ? 'bg-gold-glow text-gold' : user.role === 'admin' ? 'bg-info/10 text-blue-400' : 'bg-primary-glow text-primary-light'}`}>
                {user.name[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <h3 className="text-sm font-bold truncate">{user.name}</h3>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] uppercase font-bold ${user.isActive ? 'text-success-light' : 'text-danger-light'}`}>
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                  <span className="text-[9px] text-text-muted">•</span>
                  <span className="text-[9px] text-text-muted capitalize">{user.role}</span>
                </div>
              </div>
              <FaArrowRight className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          ))}
        </div>

        {/* Detail Pane */}
        <div className="detail-pane flex flex-col slide-in">
          {selectedUser ? (
            <>
              <div className={`detail-header ${selectedUser.role === 'expert' ? '!bg-gold/5' : selectedUser.role === 'admin' ? '!bg-info/5' : '!bg-primary/5'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span className={`badge ${selectedUser.role === 'expert' ? 'badge-gold' : selectedUser.role === 'admin' ? 'badge-blue' : 'badge-green'} uppercase tracking-widest`}>
                      {selectedUser.role}
                    </span>
                    <span className={`badge ${selectedUser.isActive ? 'badge-green' : 'badge-red'} uppercase tracking-widest`}>
                      {selectedUser.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {selectedUser.role === 'expert' && (
                      <button 
                        className={`btn btn-sm ${selectedUser.isVerified ? 'btn-outline border-warning text-warning' : 'btn-primary'}`}
                        onClick={() => toggleVerify(selectedUser)}
                        disabled={submitting}
                      >
                        {selectedUser.isVerified ? <><FaTimes /> Unverify</> : <><FaCheck /> Verify Expert</>}
                      </button>
                    )}
                    <button 
                      className={`btn btn-sm ${selectedUser.isActive ? 'btn-danger' : 'btn-primary'}`}
                      onClick={() => toggleStatus(selectedUser)}
                      disabled={submitting}
                    >
                      {selectedUser.isActive ? <><FaShieldAlt /> Suspend Account</> : <><FaCheck /> Activate Account</>}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className={`w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black shrink-0 shadow-xl ${selectedUser.role === 'expert' ? 'bg-gold-glow text-gold' : selectedUser.role === 'admin' ? 'bg-info/10 text-blue-400' : 'bg-primary-glow text-primary-light'}`}>
                    {selectedUser.name[0]}
                  </div>
                  <div>
                    <h2 className="text-4xl font-black text-text-primary mb-1">{selectedUser.name}</h2>
                    <p className="text-lg text-text-secondary flex items-center gap-2"><FaEnvelope className="text-text-muted" /> {selectedUser.email}</p>
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Contact Information</h4>
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-gold"><FaPhone /></div>
                        <div><p className="text-[10px] uppercase font-bold text-text-muted">Phone Number</p><p className="font-bold">{selectedUser.phone || 'Not provided'}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-blue-400"><FaMapMarkerAlt /></div>
                        <div><p className="text-[10px] uppercase font-bold text-text-muted">Location</p><p className="font-bold">{selectedUser.location || 'Not provided'}</p></div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-bg-elevated flex items-center justify-center text-primary-light"><FaCalendarAlt /></div>
                        <div><p className="text-[10px] uppercase font-bold text-text-muted">Member Since</p><p className="font-bold">{format(new Date(selectedUser.createdAt), 'MMMM dd, yyyy')}</p></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-6">Account Metadata</h4>
                    <div className="p-6 rounded-2xl bg-bg-base/30 border border-border">
                      <div className="flex items-center gap-3 mb-4">
                        <FaUserCog className="text-gold" />
                        <span className="font-bold">System Permissions</span>
                      </div>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-2 text-sm text-text-secondary"><FaCheck className="text-success" /> Authorized login access</li>
                        <li className="flex items-center gap-2 text-sm text-text-secondary"><FaCheck className="text-success" /> API interaction enabled</li>
                        {selectedUser.isActive ? (
                          <li className="flex items-center gap-2 text-sm text-text-secondary"><FaCheck className="text-success" /> Marketplace permissions active</li>
                        ) : (
                          <li className="flex items-center gap-2 text-sm text-danger-light"><FaTimes /> Account currently restricted</li>
                        )}
                      </ul>
                    </div>
                    
                    {selectedUser.role === 'expert' && (
                      <div className="mt-6 p-6 rounded-2xl bg-gold/5 border border-gold/20">
                        <h4 className="text-sm font-bold mb-3 flex items-center gap-2"><FaShieldAlt className="text-gold" /> Verification Status</h4>
                        <p className="text-xs text-text-secondary leading-relaxed mb-4">
                          Experts must be verified to accept consultations and appear in the global directory.
                        </p>
                        <div className={`p-3 rounded-lg text-center font-bold text-xs uppercase tracking-widest ${selectedUser.isVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                          {selectedUser.isVerified ? 'Verified Expert' : 'Pending Verification'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {!selectedUser.isActive && (
                  <div className="mt-10 p-6 rounded-2xl bg-danger/5 border border-danger/20 flex items-center gap-6">
                    <div className="w-12 h-12 rounded-full bg-danger/10 text-danger flex items-center justify-center shrink-0"><FaExclamationTriangle size={24} /></div>
                    <div>
                      <h4 className="font-bold text-danger">Account Suspended</h4>
                      <p className="text-sm text-text-secondary">This user is currently prohibited from accessing the platform. Re-activate to restore permissions.</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center opacity-30">
              <FaUserShield className="text-8xl mb-6" />
              <h3 className="text-2xl font-bold">User Management</h3>
              <p className="max-w-xs mt-2">Select a user from the ecosystem list to manage their profile and permissions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
