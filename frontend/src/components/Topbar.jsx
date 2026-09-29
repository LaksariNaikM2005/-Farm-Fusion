import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { FaLeaf, FaShoppingCart, FaBell, FaSignOutAlt, FaTimes, FaBars } from 'react-icons/fa';
import { selectCartCount } from '../store/slices/cartSlice';
import { useState } from 'react';
import './Topbar.css';

export default function Topbar({ toggleSidebar, sidebarOpen }) {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const cartCount = useSelector(selectCartCount);
  const unread = useSelector((s) => s.notifications.unreadCount);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifications = useSelector((s) => s.notifications.items);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={toggleSidebar} aria-label="Toggle menu">
          {sidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        <Link to="/" className="topbar-brand">
          <FaLeaf className="brand-icon" />
          <span>Farm <span className="brand-accent">Fusion</span></span>
        </Link>
      </div>
      <div className="topbar-right">
        {user?.role === 'farmer' && (
          <Link to="/farmer/cart" className="topbar-icon-btn" aria-label="Cart">
            <FaShoppingCart />
            {cartCount > 0 && <span className="notif-count">{cartCount}</span>}
          </Link>
        )}
        <div className="notif-wrapper">
          <button className="topbar-icon-btn" onClick={() => setNotifOpen(!notifOpen)} aria-label="Notifications">
            <FaBell />
            {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {notifOpen && (
            <div className="notif-dropdown">
              <div className="notif-header"><h4>Notifications</h4><span>{unread} new</span></div>
              <div className="notif-list">
                {notifications.length === 0 ? (
                  <p className="notif-empty">No notifications yet</p>
                ) : (
                  notifications.slice(0, 8).map((n, i) => (
                    <div key={i} className={`notif-item ${!n.read ? 'unread' : ''}`}>
                      <span className="notif-title">{n.title}</span>
                      <span className="notif-msg">{n.message}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        <Link to={`/${user?.role}/profile`} className="topbar-user">
          <div className="avatar avatar-sm avatar-placeholder">{user?.name?.[0]?.toUpperCase()}</div>
          <span className="topbar-username">{user?.name?.split(' ')[0]}</span>
        </Link>
        <button className="topbar-icon-btn logout-btn" onClick={() => dispatch(logout())} title="Logout">
          <FaSignOutAlt />
        </button>
      </div>
    </header>
  );
}
