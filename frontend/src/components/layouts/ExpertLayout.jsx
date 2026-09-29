import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';
import { FaHome, FaCalendarCheck, FaComments, FaHistory, FaUserCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/slices/notificationSlice';

export default function ExpertLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useSelector(s => s.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000');
    socket.emit('register', user._id);
    
    socket.on('notification', (data) => {
      dispatch(addNotification(data));
    });
    
    return () => socket.disconnect();
  }, [user, dispatch]);

  const navItems = [
    {
      category: 'Overview',
      items: [
        { to: '/expert', label: 'Dashboard', icon: <FaHome />, end: true },
        { to: '/expert/profile', label: 'My Profile', icon: <FaUserCircle /> },
      ]
    },
    {
      category: 'Practice',
      items: [
        { to: '/expert/appointments', label: 'Consultations', icon: <FaCalendarCheck /> },
        { to: '/expert/chat', label: 'Messages', icon: <FaComments /> },
        { to: '/expert/history', label: 'History & Reviews', icon: <FaHistory /> },
      ]
    }
  ];

  return (
    <div className="dashboard-layout">
      <Topbar sidebarOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar navItems={navItems} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
