import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { 
  FaCheck, 
  FaTimes, 
  FaVideo, 
  FaCalendarCheck, 
  FaArrowRight, 
  FaUserCircle, 
  FaClock, 
  FaInfoCircle, 
  FaComments,
  FaFileAlt
} from 'react-icons/fa';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

export default function AppointmentManager() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments?limit=50');
      // Filter out completed/cancelled for management view
      const active = data.appointments.filter(a => a.status === 'pending' || a.status === 'accepted');
      setAppointments(active);
      if (active.length > 0 && !selectedApt) {
        setSelectedApt(active[0]);
      }
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    setActionLoading(id);
    try {
      let meetLink = '';
      if (status === 'accepted') {
        const appointment = appointments.find(a => a._id === id);
        if (appointment.type === 'video') {
          meetLink = `/expert/video/${id}?room=${uuidv4()}`;
        }
      }
      
      const { data } = await api.put(`/appointments/${id}/status`, { status, meetLink });
      toast.success(`Appointment ${status}`);
      
      // Update local state
      const updated = appointments.map(a => a._id === id ? { ...a, status, meetLink: meetLink || a.meetLink } : a);
      setAppointments(status === 'rejected' || status === 'completed' ? updated.filter(a => a._id !== id) : updated);
      
      if (selectedApt?._id === id) {
        if (status === 'rejected' || status === 'completed') {
          const remaining = updated.filter(a => a._id !== id);
          setSelectedApt(remaining.length > 0 ? remaining[0] : null);
        } else {
          setSelectedApt({ ...selectedApt, status, meetLink });
        }
      }
    } catch (err) {
      toast.error(`Failed to ${status} appointment`);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading && appointments.length === 0) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in">
      <div className="page-header mb-6">
        <h1 className="page-title flex items-center gap-2"><FaCalendarCheck className="text-primary-light" /> Practice Management</h1>
        <p className="page-subtitle">Coordinate your upcoming consultations and student sessions.</p>
      </div>

      <div className="master-detail-container h-[calc(100vh-200px)]">
        {/* Master List */}
        <div className="master-list overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="p-10 text-center opacity-40"><p>No active consultations.</p></div>
          ) : (
            appointments.map(apt => (
              <div 
                key={apt._id} 
                className={`scheme-item flex-col items-start gap-1 ${selectedApt?._id === apt._id ? 'active' : ''}`}
                onClick={() => setSelectedApt(apt)}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${apt.status === 'pending' ? 'text-warning' : 'text-success'}`}>
                    {apt.status}
                  </span>
                  <span className="text-[9px] text-text-muted">{format(new Date(apt.date), 'MMM dd')}</span>
                </div>
                <h3 className="text-sm font-bold truncate w-full">{apt.farmer?.name}</h3>
                <p className="text-[10px] text-text-muted truncate w-full">{apt.topic}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="badge badge-gray text-[8px]">{apt.type}</span>
                  <span className="text-[10px] text-gold font-bold">{apt.timeSlot}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Pane */}
        <div className="detail-pane flex flex-col slide-in">
          {selectedApt ? (
            <>
              <div className={`detail-header ${selectedApt.status === 'pending' ? '!bg-warning/5' : '!bg-success/5'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex gap-2">
                    <span className={`badge ${selectedApt.status === 'pending' ? 'badge-gold' : 'badge-green'} uppercase tracking-widest`}>
                      {selectedApt.status}
                    </span>
                    <span className="badge badge-gray uppercase tracking-widest">{selectedApt.type} session</span>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedApt.status === 'pending' ? (
                      <>
                        <button className="btn btn-primary btn-sm px-6" onClick={() => handleStatusUpdate(selectedApt._id, 'accepted')} disabled={actionLoading}>
                          <FaCheck /> Confirm Session
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleStatusUpdate(selectedApt._id, 'rejected')} disabled={actionLoading}>
                          <FaTimes /> Decline
                        </button>
                      </>
                    ) : (
                      <>
                        {selectedApt.type === 'video' ? (
                          <button className="btn btn-primary btn-sm px-6 glow-green" onClick={() => navigate(selectedApt.meetLink)}>
                            <FaVideo /> Start Virtual Call
                          </button>
                        ) : (
                          <button className="btn btn-primary btn-sm px-6" onClick={() => navigate('/expert/chat')}>
                            <FaComments /> Open Messenger
                          </button>
                        )}
                        <button className="btn btn-outline btn-sm text-success border-success" onClick={() => handleStatusUpdate(selectedApt._id, 'completed')} disabled={actionLoading}>
                          <FaCheck /> Mark Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <img src={selectedApt.farmer?.profileImage || 'https://via.placeholder.com/100'} alt="" className="w-20 h-20 rounded-2xl object-cover shadow-xl border-2 border-white/10" />
                  <div>
                    <h2 className="text-3xl font-black text-text-primary mb-1">{selectedApt.farmer?.name}</h2>
                    <p className="text-lg text-gold font-bold flex items-center gap-2">
                      <FaClock /> {format(new Date(selectedApt.date), 'EEEE, MMMM dd')} @ {selectedApt.timeSlot}
                    </p>
                  </div>
                </div>
              </div>

              <div className="detail-content flex-1 overflow-y-auto">
                <div className="grid md:grid-cols-2 gap-10">
                  <div className="space-y-8">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                        <FaFileAlt className="text-primary-light" /> Consultation Subject
                      </h4>
                      <div className="p-6 rounded-2xl bg-bg-elevated border border-border">
                        <h3 className="font-bold text-lg mb-2">{selectedApt.topic}</h3>
                        <p className="text-text-secondary leading-relaxed">{selectedApt.description}</p>
                      </div>
                    </div>

                    <div className="info-grid !mt-0">
                      <div className="info-box">
                        <p className="info-box-label">Client Location</p>
                        <p className="font-bold text-sm">{selectedApt.farmer?.location || 'Not shared'}</p>
                      </div>
                      <div className="info-box">
                        <p className="info-box-label">Booking Reference</p>
                        <p className="font-bold text-sm text-text-muted">#{selectedApt._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-text-muted mb-4 flex items-center gap-2">
                      <FaInfoCircle className="text-gold" /> Guidance for Expert
                    </h4>
                    <div className="space-y-4">
                      <div className="p-5 rounded-xl bg-bg-base/30 border border-border text-sm leading-relaxed text-text-secondary">
                        <p className="mb-3">Please ensure your camera and microphone are working before the session starts.</p>
                        <p>For chat sessions, the conversation will be active under the "Messages" tab once the session time arrives.</p>
                      </div>
                      
                      {selectedApt.status === 'accepted' && (
                        <div className="p-6 rounded-xl bg-primary/5 border border-primary/20 flex flex-col items-center text-center">
                          <p className="text-xs font-bold text-primary-light uppercase mb-4">Session Ready</p>
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary-light mb-4">
                            <FaVideo size={24} />
                          </div>
                          <p className="text-sm text-text-primary mb-4 font-medium">Your virtual consultation room is prepared.</p>
                          <button className="btn btn-primary btn-full" onClick={() => navigate(selectedApt.meetLink)}>Enter Meeting</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10 text-center opacity-30">
              <FaCalendarCheck className="text-8xl mb-6" />
              <h3 className="text-2xl font-bold">No Consultation Selected</h3>
              <p className="max-w-xs mt-2">Pick an appointment from the left panel to manage status, join calls, or view details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
