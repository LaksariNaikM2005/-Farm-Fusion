import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

export default function Sidebar({ navItems, open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          {navItems.map((group) => (
            <div key={group.category} className="sidebar-group">
              <h4 className="sidebar-category">{group.category}</h4>
              {group.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  onClick={() => window.innerWidth < 768 && onClose?.()}
                >
                  <span className="sidebar-icon">{item.icon}</span>
                  <span className="sidebar-label">{item.label}</span>
                  {item.badge && <span className="sidebar-badge">{item.badge}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
    </>
  );
}
