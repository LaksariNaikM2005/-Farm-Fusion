import { Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';
import { FaHome, FaStore, FaCalendarAlt, FaComments, FaClipboardList, FaFileInvoiceDollar, FaUsers, FaVirus, FaUserCircle } from 'react-icons/fa';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../../store/slices/notificationSlice';

export default function FarmerLayout() {
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
      category: 'Core',
      items: [
        { to: '/farmer', label: 'Dashboard', icon: <FaHome />, end: true },
        { to: '/farmer/profile', label: 'My Profile', icon: <FaUserCircle /> },
      ]
    },
    {
      category: 'Smart Farming',
      items: [
        { to: '/farmer/diagnosis', label: 'AI Diagnosis', icon: <FaVirus /> },
      ]
    },
    {
      category: 'Market & Trade',
      items: [
        { to: '/farmer/marketplace', label: 'Marketplace', icon: <FaStore /> },
        { to: '/farmer/orders', label: 'My Orders', icon: <FaFileInvoiceDollar /> },
      ]
    },
    {
      category: 'Expert Help',
      items: [
        { to: '/farmer/experts', label: 'Find Expert', icon: <FaUsers /> },
        { to: '/farmer/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
        { to: '/farmer/chat', label: 'Messages', icon: <FaComments /> },
      ]
    },
    {
      category: 'Resources',
      items: [
        { to: '/farmer/forum', label: 'Community Forum', icon: <FaClipboardList /> },
        { to: '/farmer/schemes', label: 'Govt. Schemes', icon: <FaClipboardList /> },
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
