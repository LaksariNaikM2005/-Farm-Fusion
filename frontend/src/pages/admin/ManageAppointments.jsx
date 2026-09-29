import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { 
  FaCalendarAlt, 
  FaSearch, 
  FaArrowRight, 
  FaUser, 
  FaUserMd, 
  FaClock, 
  FaMapMarkerAlt, 
  FaInfoCircle,
  FaShieldAlt
} from 'react-icons/fa';
import { format } from 'date-fns';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [selectedApt, setSelectedApt] = useState(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/admin/appointments', { params: { status, limit: 50 } });
        setAppointments(data.appointments);
        if (data.appointments.length > 0 && !selectedApt) {
          setSelectedApt(data.appointments[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [status]);

  if (loading && appointments.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="page-title flex items-center gap-2"><FaCalendarAlt className="text-primary-light" /> Global Consultations</h1>
          <p className="page-subtitle">Monitor and oversee all expert-farmer interactions on the platform.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select className="form-input md:w-48" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="master-detail-container h-[calc(100vh-220px)]">
        {/* Master List */}
        <div className="master-list overflow-y-auto">
          {appointments.map(apt => (
            <div 
              key={apt._id} 
              className={`scheme-item flex-col items-start gap-1 ${selectedApt?._id === apt._id ? 'active' : ''}`}
              onClick={() => setSelectedApt(apt)}
            >
              <div className="flex justify-between items-center w-full">
                <span className={`text-[9px] font-black uppercase tracking-widest ${apt.status === 'completed' ? 'text-blue-400' : apt.status === 'accepted' ? 'text-success' : apt.status === 'pending' ? 'text-warning' : 'text-danger'}`}>
                  {apt.status}
                </span>
                <span className="text-[9px] text-text-muted">{format(new Date(apt.date), 'MMM dd')}</span>
              </div>
              <h3 className="text-sm font-bold truncate w-full">{apt.farmer?.name} ↔ {apt.expert?.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="badge badge-gray text-[8px]">{apt.type}</span>
                <span className="text-[10px] text-gold font-bold">{apt.timeSlot}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Pane */}
        <div className="detail-pane flex flex-col slide-in">
          {selectedApt ? (
            <>
              <div className={`detail-header ${selectedApt.status === 'completed' ? '!bg-info/5' : selectedApt.status === 'accepted' ? '!bg-success/5' : '!bg-warning/5'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span className={`badge ${selectedApt.status === 'completed' ? 'badge-blue' : selectedApt.status === 'accepted' ? 'badge-green' : selectedApt.status === 'pending' ? 'badge-gold' : 'badge-red'} uppercase tracking-widest`}>
                      {selectedApt.status}
                    </span>
                    <span className="badge badge-gray uppercase tracking-widest">{selectedApt.type} session</span>
                  </div>
                  <div className="text-xs font-bold text-text-muted">ID: #{selectedApt._id.slice(-8).toUpperCase()}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                      <div className="w-16 h-16 rounded-2xl bg-primary-glow text-primary-light flex items-center justify-center font-black text-2xl border-4 border-bg-card shadow-lg z-10">{selectedApt.farmer?.name[0]}</div>
                      <div className="w-16 h-16 rounded-2xl bg-gold-glow text-gold flex items-center justify-center font-black text-2xl border-4 border-bg-card shadow-lg">{selectedApt.expert?.name[0]}</div>
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-text-primary mb-1">{selectedApt.farmer?.name} & {selectedApt.expert?.name}</h2>
                      <p className="text-sm text-gold font-bold flex items-center gap-2">
                        <FaClock /> {format(new Date(selectedApt.date), 'EEEE, MMMM dd, yyyy')} | {selectedApt.timeSlot}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <FaInfoCircle className="text-primary-light" /> Session Topic
                      </h4>
                      <div className="p-6 rounded-2xl bg-bg-elevated border border-border">
                        <h3 className="font-bold text-lg mb-2">{selectedApt.topic}</h3>
                        <p className="text-text-secondary leading-relaxed text-sm">{selectedApt.description}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4">Participant Details</h4>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-bg-base/30 border border-border">
                        <div className="flex items-center gap-3">
                          <FaUser className="text-primary-light" />
                          <div>
                            <p className="text-xs font-bold">Farmer</p>
                            <p className="text-xs text-text-muted">{selectedApt.farmer?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold">{selectedApt.farmer?.location || 'Unknown'}</p>
                          <p className="text-[10px] text-text-muted">Location</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-xl bg-bg-base/30 border border-border">
                        <div className="flex items-center gap-3">
                          <FaUserMd className="text-gold" />
                          <div>
                            <p className="text-xs font-bold">Expert</p>
                            <p className="text-xs text-text-muted">{selectedApt.expert?.email}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold capitalize">{selectedApt.expert?.specialization || 'Agriculture'}</p>
                          <p className="text-[10px] text-text-muted">Specialization</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <FaShieldAlt className="text-gold" /> Audit Trail
                      </h4>
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-bg-base/50 border border-border flex gap-4">
                          <div className="w-8 h-8 rounded-full bg-success/10 text-success flex items-center justify-center shrink-0"><FaCheck size={12} /></div>
                          <div>
                            <p className="text-xs font-bold">Booking Confirmed</p>
                            <p className="text-[10px] text-text-muted">{format(new Date(selectedApt.createdAt), 'MMM dd, yyyy • hh:mm a')}</p>
                          </div>
                        </div>
                        {selectedApt.status !== 'pending' && (
                          <div className="p-4 rounded-xl bg-bg-base/50 border border-border flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-info/10 text-info flex items-center justify-center shrink-0"><FaInfoCircle size={12} /></div>
                            <div>
                              <p className="text-xs font-bold capitalize">Status Updated: {selectedApt.status}</p>
                              <p className="text-[10px] text-text-muted">System Logged Update</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-bg-elevated border border-border">
                      <h4 className="text-sm font-bold mb-3">Moderator Action</h4>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4">
                        As an administrator, you are monitoring this session for quality assurance. In case of issues, you can contact either participant directly.
                      </p>
                      <button className="btn btn-outline btn-sm btn-full opacity-50 cursor-not-allowed">Flag for Review</button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center opacity-30">
              <FaCalendarAlt className="text-8xl mb-6" />
              <h3 className="text-2xl font-bold">Consultation Auditor</h3>
              <p className="max-w-xs mt-2">Select a session to view the full participant breakdown and audit history.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
