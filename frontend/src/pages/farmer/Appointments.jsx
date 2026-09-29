import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { FaCalendarAlt, FaVideo, FaComments, FaCheckCircle, FaTimesCircle, FaClock, FaStar } from 'react-icons/fa';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';

export default function Appointments() {
  const [searchParams] = useSearchParams();
  const bookExpertId = searchParams.get('book');
  
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expert, setExpert] = useState(null); // If booking
  
  // Booking Form State
  const [date, setDate] = useState(new Date());
  const [timeSlot, setTimeSlot] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('video');
  const [bookingLoading, setBookingLoading] = useState(false);

  const timeSlots = ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

  useEffect(() => {
    fetchAppointments();
    if (bookExpertId) {
      // Need a way to fetch a single user/expert profile, assuming admin route or mock for now
      // In a real app, you'd fetch expert details here.
      setExpert({ _id: bookExpertId, name: 'Selected Expert', consultationFee: 500 });
    }
  }, [bookExpertId]);

  const fetchAppointments = async () => {
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.appointments);
    } catch (err) {
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!timeSlot) return toast.error('Please select a time slot');
    setBookingLoading(true);
    try {
      await api.post('/appointments', {
        expert: expert._id,
        date: date.toISOString(),
        timeSlot,
        topic,
        description,
        type
      });
      toast.success('Appointment requested successfully');
      setExpert(null); // Close booking form
      fetchAppointments();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'accepted': return <span className="badge badge-green"><FaCheckCircle /> Accepted</span>;
      case 'rejected': return <span className="badge badge-red"><FaTimesCircle /> Rejected</span>;
      case 'completed': return <span className="badge badge-blue"><FaCheckCircle /> Completed</span>;
      case 'cancelled': return <span className="badge badge-gray">Cancelled</span>;
      default: return <span className="badge badge-gold"><FaClock /> Pending</span>;
    }
  };

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <h1 className="page-title mb-8 flex items-center gap-2"><FaCalendarAlt /> My Appointments</h1>

      {expert && (
        <div className="card mb-8 border-primary glow-green relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4">
            <button className="text-text-muted hover:text-text-primary" onClick={() => setExpert(null)}>Close</button>
          </div>
          <h2 className="text-xl font-bold mb-6 text-primary-light">Book Consultation</h2>
          <form onSubmit={handleBook} className="grid md:grid-cols-2 gap-8">
            <div>
              <div className="form-group">
                <label className="form-label">Select Date</label>
                <div className="calendar-wrapper bg-bg-elevated rounded-lg p-2 border border-border">
                  <Calendar 
                    onChange={setDate} 
                    value={date} 
                    minDate={new Date()}
                    className="custom-calendar w-full bg-transparent border-none text-text-primary"
                  />
                </div>
              </div>
              <div className="form-group mt-4">
                <label className="form-label">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {timeSlots.map(slot => (
                    <button 
                      key={slot} type="button"
                      className={`py-2 px-1 text-xs rounded border ${timeSlot === slot ? 'bg-primary border-primary text-white font-bold' : 'bg-bg-elevated border-border text-text-secondary hover:border-primary-light'}`}
                      onClick={() => setTimeSlot(slot)}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="form-group">
                <label className="form-label">Consultation Type</label>
                <div className="flex gap-2">
                  <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border ${type === 'video' ? 'bg-primary-glow border-primary text-primary-light' : 'border-border text-text-muted'}`} onClick={() => setType('video')}><FaVideo /> Video</button>
                  <button type="button" className={`flex-1 flex items-center justify-center gap-2 py-2 rounded border ${type === 'chat' ? 'bg-primary-glow border-primary text-primary-light' : 'border-border text-text-muted'}`} onClick={() => setType('chat')}><FaComments /> Chat</button>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Topic / Issue</label>
                <input type="text" className="form-input" placeholder="e.g. Pest control for wheat" value={topic} onChange={e => setTopic(e.target.value)} required />
              </div>
              
              <div className="form-group flex-1">
                <label className="form-label">Details</label>
                <textarea className="form-input h-full min-h-[100px]" placeholder="Provide more context..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>

              <div className="p-4 bg-bg-elevated rounded border border-border mt-auto flex justify-between items-center">
                <span className="text-text-secondary">Consultation Fee</span>
                <span className="text-xl font-bold text-gold">₹{expert.consultationFee}</span>
              </div>
              
              <button type="submit" className="btn btn-primary btn-lg" disabled={bookingLoading}>
                {bookingLoading ? 'Requesting...' : 'Request Appointment'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="spinner-wrap"><div className="spinner"></div></div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <FaCalendarAlt className="empty-icon" />
          <h3>No appointments yet</h3>
          <p>Book a consultation with an expert to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {appointments.map(apt => (
            <div key={apt._id} className="card flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary transition p-5">
              <div className="flex items-start md:items-center gap-4">
                <img src={apt.expert?.profileImage || 'https://via.placeholder.com/60'} alt="" className="avatar avatar-lg rounded-xl hidden md:block" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{apt.expert?.name}</h3>
                    {getStatusBadge(apt.status)}
                  </div>
                  <p className="font-medium text-text-secondary mb-2">{apt.topic}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-text-muted">
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-primary" /> {format(new Date(apt.date), 'MMM dd, yyyy')}</span>
                    <span className="flex items-center gap-1"><FaClock className="text-gold" /> {apt.timeSlot}</span>
                    <span className="flex items-center gap-1 capitalize">
                      {apt.type === 'video' ? <FaVideo className="text-blue-400" /> : <FaComments className="text-green-400" />} {apt.type}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 md:items-end">
                <span className="font-bold text-gold text-lg md:mb-auto">₹{apt.fee}</span>
                {apt.status === 'accepted' && apt.type === 'video' && apt.meetLink && (
                  <a href={apt.meetLink} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm flex items-center gap-2">
                    <FaVideo /> Join Meeting
                  </a>
                )}
                {apt.status === 'completed' && !apt.rating && (
                  <button className="btn btn-outline btn-sm text-gold border-gold flex items-center gap-2">
                    <FaStar /> Rate Session
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
