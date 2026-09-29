import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Topbar from '../Topbar';
import Sidebar from '../Sidebar';
import { FaChartLine, FaUsers, FaBoxOpen, FaClipboardList, FaCalendarAlt, FaComments, FaUserCircle } from 'react-icons/fa';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    {
      category: 'Main',
      items: [
        { to: '/admin', label: 'Dashboard', icon: <FaChartLine />, end: true },
        { to: '/admin/profile', label: 'My Profile', icon: <FaUserCircle /> },
      ]
    },
    {
      category: 'Management',
      items: [
        { to: '/admin/users', label: 'Manage Users', icon: <FaUsers /> },
        { to: '/admin/products', label: 'Products', icon: <FaBoxOpen /> },
        { to: '/admin/schemes', label: 'Govt. Schemes', icon: <FaClipboardList /> },
      ]
    },
    {
      category: 'Operations',
      items: [
        { to: '/admin/appointments', label: 'Appointments', icon: <FaCalendarAlt /> },
        { to: '/admin/forum', label: 'Forum Moderation', icon: <FaComments /> },
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
