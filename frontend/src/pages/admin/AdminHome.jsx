import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { 
  FaUsers, 
  FaBoxOpen, 
  FaFileInvoiceDollar, 
  FaCalendarAlt, 
  FaChartArea, 
  FaFileContract, 
  FaComments,
  FaArrowRight
} from 'react-icons/fa';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics');
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <div className="spinner-wrap"><div className="spinner"></div></div>;

  const chartData = data?.monthlySales?.map(m => {
    const date = new Date(m._id + '-01');
    return { name: date.toLocaleString('default', { month: 'short' }), revenue: m.revenue };
  }) || [];

  const adminNav = [
    { to: '/admin/users', label: 'Users', icon: <FaUsers />, color: 'blue', count: data?.stats?.totalUsers },
    { to: '/admin/products', label: 'Inventory', icon: <FaBoxOpen />, color: 'primary', count: data?.stats?.totalProducts },
    { to: '/admin/schemes', label: 'Schemes', icon: <FaFileContract />, color: 'gold', count: data?.stats?.schemesCount || 0 },
    { to: '/admin/appointments', label: 'Sessions', icon: <FaCalendarAlt />, color: 'blue', count: data?.stats?.totalAppointments },
  ];

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Platform Intelligence</h1>
        <p className="page-subtitle">Unified control panel for Farm Fusion ecosystem.</p>
      </div>

      {/* Large-Icon Management Navigation */}
      <div className="grid-4 mb-10">
        {adminNav.map((item, i) => (
          <Link 
            key={i} 
            to={item.to} 
            className={`card flex items-center gap-6 p-6 transition-all hover:-translate-y-1 group glow-${item.color === 'primary' ? 'green' : item.color}`}
          >
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110 ${item.color === 'primary' ? 'bg-primary-glow text-primary-light' : item.color === 'gold' ? 'bg-gold-glow text-gold' : 'bg-info/10 text-blue-400'}`}>
              {item.icon}
            </div>
            <div>
              <h3 className="text-xl font-black mb-0 group-hover:text-white transition-colors">{item.count || 0}</h3>
              <p className="text-xs text-text-muted font-bold uppercase tracking-widest">{item.label}</p>
            </div>
            <FaArrowRight className="ml-auto text-text-muted opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Main Chart */}
          <div className="card p-8 bg-bg-card/50">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-xl font-bold flex items-center gap-2"><FaChartArea className="text-primary-light" /> Revenue Performance</h3>
              <select className="form-input w-32 py-1 text-xs bg-bg-elevated border-none">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-80 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--gold)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="var(--text-muted)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => `₹${val}`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'var(--bg-elevated)', borderColor: 'var(--border)', borderRadius: '12px', border: '1px solid var(--border-strong)', boxShadow: 'var(--shadow-lg)' }}
                      itemStyle={{ color: 'var(--gold)', fontWeight: '800' }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--gold)" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-text-muted">
                   <FaChartArea className="text-5xl mb-4 opacity-10" />
                   <p>No sales data available for the current period.</p>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card p-6 bg-primary/5 border-primary/20">
              <h4 className="text-sm font-bold uppercase tracking-widest text-primary-light mb-4">Top Selling Category</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black">Seeds</p>
                  <p className="text-xs text-text-muted">42% of total marketplace volume</p>
                </div>
                <div className="relative w-16 h-16 flex items-center justify-center">
                  <div className="absolute w-full h-full rounded-full border-4 border-primary border-t-transparent animate-spin-slow" style={{ top: 0, left: 0 }}></div>
                  <span className="text-xs font-bold">78%</span>
                </div>
              </div>
            </div>
            <div className="card p-6 bg-gold/5 border-gold/20">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gold mb-4">Expert Activity</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-black">85%</p>
                  <p className="text-xs text-text-muted">Avg. Consultation Success Rate</p>
                </div>
                <div className="avatar-stack">
                  {['AJ', 'ES', 'RK', 'MS'].map((initials, idx) => (
                    <div key={idx} className="avatar-stack-item">
                      {initials}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-8">
          {/* Quick Actions / Moderation */}
          <div className="card p-6 bg-bg-elevated/50">
            <h3 className="font-bold mb-4 flex items-center gap-2"><FaComments className="text-blue-400" /> Platform Moderation</h3>
            <div className="space-y-4">
              <Link to="/admin/forum" className="flex items-center justify-between p-3 rounded-lg bg-bg-base hover:bg-bg-hover transition">
                <span className="text-sm">Pending Forum Posts</span>
                <span className="badge badge-red">12</span>
              </Link>
              <Link to="/admin/appointments" className="flex items-center justify-between p-3 rounded-lg bg-bg-base hover:bg-bg-hover transition">
                <span className="text-sm">Unassigned Requests</span>
                <span className="badge badge-gold">5</span>
              </Link>
            </div>
          </div>

          {/* User Growth */}
          <div className="card p-0 overflow-hidden bg-bg-card/50">
            <h3 className="font-bold p-5 border-b border-border bg-bg-elevated/30">Recent Platform Activity</h3>
            <div className="divide-y divide-border">
              {data?.recentUsers?.map(user => (
                <div key={user._id} className="p-5 flex items-center justify-between hover:bg-bg-hover/30 transition">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'expert' ? 'bg-gold-glow text-gold' : 'bg-primary-glow text-primary-light'}`}>
                      {user.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{user.name}</p>
                      <p className="text-[10px] text-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <span className={`badge text-[9px] uppercase font-black px-2 ${user.role === 'expert' ? 'badge-gold' : user.role === 'admin' ? 'badge-blue' : 'badge-green'}`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
            <Link to="/admin/users" className="block p-4 text-center text-xs font-bold text-gold hover:bg-bg-hover transition">View All Users</Link>
          </div>
        </div>
      </div>
      
      <style>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
