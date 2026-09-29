import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  FaCloudSun, 
  FaTint, 
  FaWind, 
  FaArrowRight, 
  FaNewspaper, 
  FaCalendarCheck, 
  FaVirus, 
  FaStore, 
  FaUserMd, 
  FaFileContract 
} from 'react-icons/fa';
import { format } from 'date-fns';

export default function FarmerHome() {
  const { user } = useSelector(s => s.auth);
  const [weather, setWeather] = useState(null);
  const [news, setNews] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weatherRes, newsRes, apptRes] = await Promise.all([
          api.get('/external/weather?city=Delhi'),
          api.get('/external/news?q=agriculture India'),
          api.get('/appointments?status=accepted&limit=3')
        ]);
        setWeather(weatherRes.data);
        setNews(newsRes.data.articles.slice(0, 4));
        setAppointments(apptRes.data.appointments);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const quickNav = [
    { to: '/farmer/diagnosis', label: 'AI Diagnosis', desc: 'Detect crop diseases', icon: <FaVirus />, color: 'primary' },
    { to: '/farmer/marketplace', label: 'Marketplace', desc: 'Shop agri products', icon: <FaStore />, color: 'gold' },
    { to: '/farmer/experts', label: 'Expert Consult', desc: '1-on-1 video call', icon: <FaUserMd />, color: 'blue' },
    { to: '/farmer/schemes', label: 'Govt. Schemes', desc: 'Subsidies & loans', icon: <FaFileContract />, color: 'gold' },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name?.split(' ')[0]}! 🌾</h1>
        <p className="page-subtitle">Your digital farm command center is ready.</p>
      </div>

      {/* Large-Icon Navigation Scheme */}
      <div className="grid-4 mb-10">
        {quickNav.map((item, i) => (
          <Link 
            key={i} 
            to={item.to} 
            className={`card flex flex-col items-center justify-center text-center p-8 transition-all hover:-translate-y-2 group glow-${item.color === 'primary' ? 'green' : item.color}`}
            style={{ borderTop: `4px solid var(--${item.color === 'blue' ? 'info' : item.color})` }}
          >
            <div className={`w-20 h-20 rounded-2xl mb-4 flex items-center justify-center text-4xl transition-transform group-hover:scale-110 ${item.color === 'primary' ? 'bg-primary-glow text-primary-light' : item.color === 'gold' ? 'bg-gold-glow text-gold' : 'bg-info/10 text-blue-400'}`}>
              {item.icon}
            </div>
            <h3 className="text-xl font-bold mb-1 group-hover:text-white transition-colors">{item.label}</h3>
            <p className="text-xs text-text-muted">{item.desc}</p>
          </Link>
        ))}
      </div>

      <div className="grid-2 mb-10">
        {/* Weather Widget */}
        {weather && (
          <div className="card card-glass relative overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--primary-dark), var(--bg-card))' }}>
            <div className="absolute top-[-20px] right-[-20px] opacity-10 text-8xl"><FaCloudSun /></div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><FaCloudSun /> Weather Forecast</h3>
                <p className="text-sm text-gray-300">{weather.city.name}, {weather.city.country}</p>
              </div>
              <div className="text-4xl font-display font-black text-gold">{Math.round(weather.current.main.temp)}°C</div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Humidity</p>
                <p className="flex items-center gap-2 font-bold"><FaTint className="text-blue-400" /> {weather.current.main.humidity}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">Wind Speed</p>
                <p className="flex items-center gap-2 font-bold"><FaWind className="text-gold" /> {weather.current.wind.speed} m/s</p>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Appointments */}
        <div className="card">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2"><FaCalendarCheck className="text-primary-light" /> My Consultations</h3>
            <Link to="/farmer/appointments" className="text-xs text-gold hover:underline">View All</Link>
          </div>
          {appointments.length > 0 ? (
            <div className="flex flex-col gap-3">
              {appointments.map(apt => (
                <div key={apt._id} className="flex justify-between items-center p-4 rounded-xl bg-bg-elevated border border-border hover:border-primary-light transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="avatar-sm avatar-placeholder rounded-lg">{apt.expert.name[0]}</div>
                    <div>
                      <p className="text-sm font-bold">{apt.expert.name}</p>
                      <p className="text-[10px] text-text-muted">{format(new Date(apt.date), 'MMMM dd')} at {apt.timeSlot}</p>
                    </div>
                  </div>
                  <Link to="/farmer/appointments" className="btn btn-outline btn-sm !py-1 !px-3">Join</Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <p className="text-sm text-text-muted mb-4">No sessions scheduled for today.</p>
              <Link to="/farmer/experts" className="btn btn-primary btn-sm">Find an Expert</Link>
            </div>
          )}
        </div>
      </div>

      {/* Agriculture News */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2"><FaNewspaper className="text-gold" /> Agri News Hub</h2>
          <p className="text-sm text-text-muted">Global trends and local updates for the modern farmer.</p>
        </div>
        <button className="text-xs text-gold hover:underline">Read More Hub</button>
      </div>
      
      <div className="grid-4">
        {news.map((article, i) => (
          <a key={i} href={article.url} target="_blank" rel="noreferrer" className="card p-0 overflow-hidden group border-none bg-bg-surface">
            <div className="relative h-40 overflow-hidden">
              <img src={article.urlToImage || 'https://via.placeholder.com/400x300?text=Agri+News'} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-surface to-transparent"></div>
              <span className="absolute bottom-3 left-3 badge badge-gold !text-[9px]">Trending</span>
            </div>
            <div className="p-4">
              <h4 className="font-bold text-sm line-clamp-2 mb-2 group-hover:text-primary-light transition-colors">{article.title}</h4>
              <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">{article.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
