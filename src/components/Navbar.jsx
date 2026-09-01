import React, { useState, useRef, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import {
  Package,
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  LogOut,
  User,
  Shield,
  Eye,
  AlertTriangle,
  ChevronDown,
  Building,
  QrCode,
  Sparkles,
  CheckCheck,
  Trash2,
  Settings,
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  Check,
} from 'lucide-react';

export const Navbar = ({
  searchQuery,
  setSearchQuery,
  onOpenRequisitionQR,
  setActiveTab,
  onOpenNotificationSettings,
}) => {
  const {
    user,
    logout,
    theme,
    toggleTheme,
    lang,
    toggleLang,
    notifications = [],
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    getLowStockProducts,
  } = useStock();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleBadge = (role) => {
    if (role === 'admin') {
      return (
        <span className="role-chip chip-admin">
          <Shield size={12} /> Admin
        </span>
      );
    }
    if (role === 'staff') {
      return (
        <span className="role-chip chip-staff">
          <Package size={12} /> Staff
        </span>
      );
    }
    if (role === 'user') {
      return (
        <span className="role-chip chip-user">
          <User size={12} /> User (เบิกของ)
        </span>
      );
    }
    return (
      <span className="role-chip chip-viewer">
        <Eye size={12} /> Viewer
      </span>
    );
  };

  const getNotifIcon = (type) => {
    if (type === 'NEW_REQUEST') return <FileText size={16} color="#4f46e5" />;
    if (type === 'APPROVED') return <CheckCircle2 size={16} color="#10b981" />;
    if (type === 'REJECTED') return <AlertCircle size={16} color="#ef4444" />;
    if (type === 'LOW_STOCK') return <AlertTriangle size={16} color="#f59e0b" />;
    return <Bell size={16} color="#6366f1" />;
  };

  const handleNotifClick = (notif) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTab && setActiveTab) {
      setActiveTab(notif.linkTab);
      setIsNotifOpen(false);
    }
  };

  return (
    <header className="navbar">
      {/* Brand Logo & System Title */}
      <div className="navbar-brand flex-center gap-2">
        <img
          src="/logo.png"
          alt="EXION THAILAND"
          style={{
            height: '90px',
            width: 'auto',
            maxHeight: '92px',
            objectFit: 'contain',
            display: 'block',
          }}
        />
        <div className="brand-text" style={{ borderLeft: '1.5px solid rgba(148, 163, 184, 0.35)', paddingLeft: '8px' }}>
          <div className="brand-sub" style={{ fontSize: '0.74rem', fontWeight: '800', color: '#334155', lineHeight: 1.15 }}>
            Stock Online
          </div>
          <div style={{ fontSize: '0.63rem', color: '#64748b' }}>
            Asset Management
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="navbar-search">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder={lang === 'th' ? 'ค้นหาตามชื่ออุปกรณ์, Asset Tag, QR Code...' : 'Search by asset name, Asset Tag, QR...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="search-shortcut-badge">⌘K</span>
      </div>

      {/* Action Controls Right */}
      <div className="navbar-actions">
        {onOpenRequisitionQR && user?.role !== 'user' && user?.role !== 'viewer' && (
          <button
            className="btn btn-sm btn-primary"
            onClick={onOpenRequisitionQR}
            title={lang === 'th' ? 'สร้าง/พิมพ์ ป้าย QR Code สำหรับแสกนเบิกอุปกรณ์' : 'Generate/Print Requisition QR Poster'}
          >
            <QrCode size={16} />
            <span>{lang === 'th' ? 'ป้าย QR ขอเบิก' : 'Requisition QR'}</span>
          </button>
        )}

        {/* Language Switch */}
        <button
          className="action-icon-btn"
          onClick={toggleLang}
          title={lang === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        >
          <Globe size={18} />
          <span className="lang-text">{lang.toUpperCase()}</span>
        </button>

        {/* Theme Switch */}
        <button
          className="action-icon-btn"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* Notification Center Bell */}
        <div className="dropdown-container" ref={notifRef}>
          <button
            className="action-icon-btn notif-btn"
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            title="Notification Center"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>

          {isNotifOpen && (
            <div className="dropdown-menu notif-dropdown" style={{ width: '360px', maxHeight: '480px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div className="dropdown-header flex-between" style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex-center gap-2">
                  <Bell size={16} color="#4f46e5" />
                  <span className="font-bold text-sm">{lang === 'th' ? 'การแจ้งเตือน (Notifications)' : 'Notifications'}</span>
                  {unreadCount > 0 && (
                    <span className="badge badge-primary text-xxs font-bold">{unreadCount} ใหม่</span>
                  )}
                </div>
                <div className="flex-center gap-1">
                  {onOpenNotificationSettings && (
                    <button
                      className="btn-icon-sm"
                      style={{ width: '28px', height: '28px' }}
                      onClick={() => {
                        setIsNotifOpen(false);
                        onOpenNotificationSettings();
                      }}
                      title="ตั้งค่า LINE Notify & การแจ้งเตือน"
                    >
                      <Settings size={14} />
                    </button>
                  )}
                  {notifications.length > 0 && (
                    <button
                      className="btn-icon-sm"
                      style={{ width: '28px', height: '28px' }}
                      onClick={markAllNotificationsAsRead}
                      title="อ่านทั้งหมด"
                    >
                      <CheckCheck size={14} />
                    </button>
                  )}
                </div>
              </div>

              <div className="dropdown-body" style={{ overflowY: 'auto', flex: 1, padding: '0.5rem' }}>
                {notifications.length === 0 ? (
                  <div className="dropdown-empty text-center py-6 text-muted text-xs">
                    {lang === 'th' ? 'ไม่มีรายการแจ้งเตือนในขณะนี้ 🎉' : 'No notifications!'}
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`notif-item ${!n.read ? 'unread' : ''}`}
                      onClick={() => handleNotifClick(n)}
                      style={{
                        padding: '0.65rem 0.75rem',
                        borderRadius: '6px',
                        marginBottom: '4px',
                        cursor: 'pointer',
                        background: !n.read ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        borderLeft: !n.read ? '3px solid #4f46e5' : '3px solid transparent',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div className="flex-between mb-1">
                        <div className="flex-center gap-1.5">
                          {getNotifIcon(n.type)}
                          <span className="font-bold text-xs text-primary">{n.title}</span>
                        </div>
                        <span className="text-xxs text-muted">
                          {new Date(n.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="text-xs text-secondary" style={{ lineHeight: '1.35' }}>
                        {n.message}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {notifications.length > 0 && (
                <div
                  className="dropdown-footer flex-between"
                  style={{
                    padding: '0.5rem 1rem',
                    borderTop: '1px solid var(--border-color)',
                    background: 'var(--bg-main)',
                  }}
                >
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-muted"
                    onClick={clearAllNotifications}
                  >
                    <Trash2 size={12} /> {lang === 'th' ? 'ล้างการแจ้งเตือน' : 'Clear All'}
                  </button>
                  {onOpenNotificationSettings && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs text-primary font-bold"
                      onClick={() => {
                        setIsNotifOpen(false);
                        onOpenNotificationSettings();
                      }}
                    >
                      <Settings size={12} /> {lang === 'th' ? 'ตั้งค่า LINE' : 'LINE Settings'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="vertical-divider" />

        {/* Logged in User Profile Chip */}
        {user && (
          <div className="dropdown-container" ref={profileRef}>
            <button
              className="user-profile-chip"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              title={user.name}
            >
              <div className="user-icon-avatar">
                {user.role === 'admin' ? (
                  <Shield size={14} />
                ) : user.role === 'staff' ? (
                  <Package size={14} />
                ) : (
                  <User size={14} />
                )}
              </div>
              <span className="user-name">{user.name}</span>
              {getRoleBadge(user.role)}
              <ChevronDown size={14} className={`chevron-icon ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>

            {isProfileOpen && (
              <div className="dropdown-menu profile-dropdown">
                <div className="profile-header">
                  <div>
                    <div className="font-extrabold text-base">{user.name}</div>
                    <div className="text-muted text-xs font-mono">@{user.username}</div>
                    <div className="mt-1.5">{getRoleBadge(user.role)}</div>
                  </div>
                </div>
                <div className="dropdown-divider" />
                <button className="dropdown-action-btn danger" onClick={logout}>
                  <LogOut size={16} />
                  <span>{lang === 'th' ? 'ออกจากระบบ' : 'Log Out'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .navbar {
          height: 68px;
          background: var(--bg-surface-glass);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 2rem;
          gap: 2rem;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
        }

        .navbar-brand {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .brand-icon-wrap {
          width: 40px;
          height: 40px;
          background: var(--primary-gradient);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(79, 70, 229, 0.35);
        }

        .brand-name {
          font-weight: 900;
          font-size: 1.05rem;
          color: var(--text-primary);
          line-height: 1.1;
          letter-spacing: -0.02em;
        }

        .brand-gradient-text {
          background: var(--primary-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .brand-sub {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 600;
        }

        .navbar-search {
          flex: 1;
          max-width: 480px;
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.65rem 3rem 0.65rem 2.75rem;
          background: var(--bg-main);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-full);
          font-family: var(--font-family);
          font-size: 0.88rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
          outline: none;
        }

        .search-input:focus {
          border-color: var(--primary-500);
          background: var(--bg-surface);
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
        }

        .search-shortcut-badge {
          position: absolute;
          right: 0.85rem;
          background: var(--border-color);
          color: var(--text-muted);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-xs);
          pointer-events: none;
        }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .action-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
        }

        .action-icon-btn:hover {
          background: var(--bg-main);
          color: var(--primary-600);
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .lang-text {
          font-size: 0.72rem;
          font-weight: 800;
          margin-left: 0.2rem;
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: var(--req-gradient);
          color: white;
          font-size: 0.68rem;
          font-weight: 900;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-surface);
        }

        .vertical-divider {
          width: 1px;
          height: 28px;
          background: var(--border-color);
        }

        /* User Profile Chip (Clean Modern Horizontal Pill) */
        .user-profile-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.38rem 0.75rem 0.38rem 0.5rem;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-full);
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
        }

        .user-profile-chip:hover {
          background: var(--bg-main);
          border-color: #93c5fd;
          box-shadow: 0 3px 10px rgba(59, 130, 246, 0.12);
        }

        .user-icon-avatar {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #eff6ff;
          color: #2563eb;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border: 1px solid #bfdbfe;
        }

        [data-theme="dark"] .user-icon-avatar {
          background: rgba(59, 130, 246, 0.15);
          color: #93c5fd;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .user-name {
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--text-primary);
          max-width: 140px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .chevron-icon {
          color: var(--text-muted);
          transition: transform 0.2s ease;
          flex-shrink: 0;
          margin-left: 0.1rem;
        }

        .chevron-icon.rotate-180 {
          transform: rotate(180deg);
        }

        .user-profile-chip:hover .chevron-icon {
          color: var(--primary-600);
        }

        .role-chip {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          line-height: 1.1;
          white-space: nowrap;
        }

        .chip-admin {
          background: #ecfdf5;
          color: #059669;
          border: 1px solid #a7f3d0;
        }

        .chip-staff {
          background: #eef2ff;
          color: #4f46e5;
          border: 1px solid #c7d2fe;
        }

        .chip-user {
          background: #fff1f2;
          color: #e11d48;
          border: 1px solid #fecdd3;
        }

        .chip-viewer {
          background: #fffbeb;
          color: #d97706;
          border: 1px solid #fde68a;
        }

        /* Dropdowns */
        .dropdown-container {
          position: relative;
        }

        .dropdown-menu {
          position: absolute;
          top: calc(100% + 10px);
          right: 0;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-xl);
          min-width: 240px;
          z-index: 1000;
          animation: scaleUp 0.18s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
        }

        .notif-dropdown {
          width: 320px;
        }

        .dropdown-header {
          padding: 0.85rem 1.15rem;
          border-bottom: 1px solid var(--border-color);
          font-weight: 800;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-main);
        }

        .dropdown-body {
          max-height: 280px;
          overflow-y: auto;
          padding: 0.5rem;
        }

        .notif-item {
          padding: 0.75rem;
          border-radius: var(--radius-xs);
          transition: background 0.15s ease;
        }

        .notif-item:hover {
          background: var(--bg-main);
        }

        .notif-item-title {
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .notif-item-sub {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 0.2rem;
        }

        .profile-dropdown {
          padding: 1rem;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding-bottom: 0.85rem;
        }

        .profile-large-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          object-fit: cover;
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
          margin: 0.5rem 0;
        }

        .dropdown-action-btn {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-xs);
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--text-primary);
          transition: all 0.15s ease;
        }

        .dropdown-action-btn:hover {
          background: var(--bg-main);
        }

        .dropdown-action-btn.danger {
          color: var(--req-600);
        }

        .dropdown-action-btn.danger:hover {
          background: #fff1f2;
        }
      `}</style>
    </header>
  );
};
