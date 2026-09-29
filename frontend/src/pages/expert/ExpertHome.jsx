import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { FaCalendarCheck, FaStar, FaVideo, FaWallet, FaChartLine } from 'react-icons/fa';

export default function ExpertHome() {
  const { user } = useSelector(s => s.auth);
  const [stats, setStats] = useState({ pending: 0, upcoming: 0, completed: 0, earnings: 0 });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data } = await api.get('/appointments');
        const allApts = data.appointments;
        
        const pending = allApts.filter(a => a.status === 'pending').length;
        const upcoming = allApts.filter(a => a.status === 'accepted').length;
        const completed = allApts.filter(a => a.status === 'completed').length;
        const earnings = allApts.filter(a => a.status === 'completed').reduce((sum, a) => sum + (a.fee || 0), 0);

        setStats({ pending, upcoming, completed, earnings });
        setAppointments(allApts.filter(a => a.status === 'pending' || a.status === 'accepted').slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  return (
    <div className="fade-in max-w-6xl mx-auto">
      <div className="page-header flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-border pb-6">
        <div>
          <h1 className="page-title">Expert Dashboard</h1>
          <p className="page-subtitle">Welcome back, Dr. {user?.name?.split(' ')[0]}</p>
        </div>
        <div className="flex items-center gap-4 bg-bg-elevated px-4 py-2 rounded-lg border border-border">
          <div className="text-right">
            <p className="text-xs text-text-muted uppercase tracking-wider">Your Rating</p>
            <div className="flex items-center gap-1 text-gold font-bold"><FaStar /> {user?.rating ? user.rating.toFixed(1) : 'New'}</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div>
            <p className="text-xs text-text-muted uppercase tracking-wider">Status</p>
            <div className="flex items-center gap-2"><span className={`w-2 h-2 rounded-full ${user?.isAvailable ? 'bg-success' : 'bg-danger'}`}></span> <span className="font-semibold text-sm">{user?.isAvailable ? 'Available' : 'Busy'}</span></div>
          </div>
        </div>
      </div>

      <div className="grid-4 mb-8 mt-6">
        <div className="stat-card">
          <div className="stat-icon stat-icon-gold"><FaCalendarCheck className="text-gold" /></div>
          <div><div className="stat-value">{stats.pending}</div><div className="stat-label">Pending Requests</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><FaVideo className="text-primary-light" /></div>
          <div><div className="stat-value">{stats.upcoming}</div><div className="stat-label">Upcoming Sessions</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-blue"><FaChartLine className="text-[#58a6ff]" /></div>
          <div><div className="stat-value">{stats.completed}</div><div className="stat-label">Total Completed</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon stat-icon-green"><FaWallet className="text-success" /></div>
          <div><div className="stat-value text-gold">₹{stats.earnings}</div><div className="stat-label">Total Earnings</div></div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-0 overflow-hidden">
          <div className="p-4 border-b border-border bg-bg-elevated flex justify-between items-center">
            <h3 className="font-bold">Recent Appointments</h3>
            <Link to="/expert/appointments" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-border">
            {appointments.length === 0 ? (
              <p className="p-6 text-center text-text-muted">No pending or upcoming appointments.</p>
            ) : (
              appointments.map(apt => (
                <div key={apt._id} className="p-4 flex items-center justify-between hover:bg-bg-hover transition">
                  <div className="flex items-center gap-3">
                    <img src={apt.farmer?.profileImage || 'https://via.placeholder.com/40'} alt="" className="avatar avatar-sm" />
                    <div>
                      <p className="font-semibold text-sm">{apt.farmer?.name}</p>
                      <p className="text-xs text-text-secondary truncate max-w-[200px]">{apt.topic}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    {apt.status === 'pending' ? <span className="badge badge-gold">Pending</span> : <span className="badge badge-green">Upcoming</span>}
                    <span className="text-[10px] text-text-muted">{new Date(apt.date).toLocaleDateString()} at {apt.timeSlot}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card h-fit">
          <h3 className="font-bold mb-4 pb-2 border-b border-border">Profile Overview</h3>
          <div className="space-y-4 text-sm">
            <div><p className="text-text-muted text-xs uppercase mb-1">Specialization</p><p className="font-medium">{user?.specialization}</p></div>
            <div><p className="text-text-muted text-xs uppercase mb-1">Experience</p><p className="font-medium">{user?.experience} Years</p></div>
            <div><p className="text-text-muted text-xs uppercase mb-1">Consultation Fee</p><p className="font-medium text-gold">₹{user?.consultationFee}</p></div>
            <Link to="/profile" className="btn btn-outline btn-full mt-4">Edit Profile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
