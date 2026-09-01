import React from 'react';
import { useStock } from '../context/StockContext';
import {
  LayoutDashboard,
  Package,
  History,
  FolderTree,
  Users,
  FileSpreadsheet,
  PlusCircle,
  MinusCircle,
  Eye,
  ShieldCheck,
  UserPlus,
  UserCheck,
  Building,
  QrCode,
  Sparkles,
  ClipboardList,
  ClipboardCheck,
  ChevronRight,
  TrendingUp,
  Database,
  PieChart,
  Bell,
} from 'lucide-react';

export const Sidebar = ({
  activeTab,
  setActiveTab,
  onOpenStockIn,
  onOpenStockOut,
  onOpenScanner,
  onOpenScanRequisition,
  onOpenRequisitionQR,
  onOpenDepartmentQuota,
  onOpenBackupRestore,
  onOpenNotificationSettings,
}) => {
  const { lang, getLowStockProducts, usersList, requestersList, requests = [], user } = useStock();
  const lowStockCount = getLowStockProducts().length;
  const pendingRequestsCount = requests.filter(r => r.status === 'PENDING').length;
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const isUser = user?.role === 'user';
  const isViewer = user?.role === 'viewer';

  // Section 1: Main Admin
  const adminNavItems = [
    { id: 'admin-home', labelTh: 'Admin Portal', labelEn: 'Admin Portal', icon: ShieldCheck, adminOnly: true },
    { id: 'users', labelTh: 'จัดการผู้ใช้งาน (Users)', labelEn: 'User Management', icon: UserPlus, badge: usersList.length ? usersList.length : null, adminOnly: true },
    { id: 'requesters', labelTh: 'รายชื่อผู้เบิก (Requesters)', labelEn: 'Requesters Directory', icon: UserCheck, badge: requestersList.length ? requestersList.length : null, adminOnly: true },
  ];

  // Section 2: Daily Operations & Requisition
  const operationNavItems = [
    { id: 'dashboard', labelTh: 'แผงควบคุมเบิกจ่าย', labelEn: 'Office Dashboard', icon: LayoutDashboard, hideForUser: true },
    { id: 'request-qr', labelTh: 'หน้าร้านขอเบิกอุปกรณ์', labelEn: 'Requisition Portal', icon: ClipboardList, isHighlight: true },
    { id: 'approvals', labelTh: 'ศูนย์อนุมัติคำขอเบิก', labelEn: 'Approval Center', icon: ClipboardCheck, badge: pendingRequestsCount > 0 ? pendingRequestsCount : null, staffOnly: true },
    { id: 'inventory', labelTh: 'คลังอุปกรณ์สำนักงาน', labelEn: 'Office Equipment', icon: Package, badge: lowStockCount > 0 ? lowStockCount : null, hideForUser: true },
    { id: 'audit', labelTh: 'ตรวจนับสต็อก (Stock Audit)', labelEn: 'Stocktake & Audit', icon: ClipboardCheck, staffOnly: true },
    { id: 'history', labelTh: 'ประวัติการรับเข้า - เบิกจ่าย', labelEn: 'Requisition Logs', icon: History, hideForUser: true },
  ];

  // Section 3: Masters & Reports
  const masterNavItems = [
    { id: 'categories', labelTh: 'หมวดหมู่อุปกรณ์', labelEn: 'Categories', icon: FolderTree, staffOnly: true },
    { id: 'suppliers', labelTh: 'ผู้จัดจำหน่าย / ร้านค้า', labelEn: 'Suppliers & Vendors', icon: Users, staffOnly: true },
    { id: 'reports', labelTh: 'รายงานและการส่งออก', labelEn: 'Reports & Export', icon: FileSpreadsheet, hideForUser: true },
  ];

  const filterItems = (list) => {
    return list.filter(item => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.staffOnly && (isViewer || isUser)) return false;
      if (item.hideForViewer && isViewer) return false;
      if (item.hideForUser && isUser) return false;
      return true;
    });
  };

  const visibleAdmin = filterItems(adminNavItems);
  const visibleOps = filterItems(operationNavItems);
  const visibleMasters = filterItems(masterNavItems);

  return (
    <aside className="sidebar">
      {/* Role / User Mode Status Banner */}
      {isViewer ? (
        <div className="quick-actions-panel">
          <div className="panel-label">{lang === 'th' ? 'รายการด่วนผู้เข้าชม' : 'Quick Actions'}</div>
          <button className="quick-btn btn-out" onClick={() => setActiveTab('request-qr')}>
            <MinusCircle size={17} />
            <span>{lang === 'th' ? '🔴 ขอเบิกอุปกรณ์ (-)' : 'Requisition Asset (-)'}</span>
          </button>
        </div>
      ) : isUser ? (
        <div className="user-requisition-badge">
          <div className="badge-glow-icon">
            <Sparkles size={16} color="#e11d48" />
          </div>
          <div>
            <div className="font-extrabold text-white text-xs">{lang === 'th' ? 'โหมดขอเบิกอุปกรณ์' : 'Requisition Mode'}</div>
            <div className="text-muted text-xxs">{lang === 'th' ? 'พนักงานทั่วไป (User Role)' : 'Employee Portal'}</div>
          </div>
        </div>
      ) : (
        <div className="quick-actions-panel">
          <div className="panel-label">{lang === 'th' ? 'รายการด่วนสำนักงาน' : 'Quick Actions'}</div>
          <button className="quick-btn btn-out" onClick={() => setActiveTab('request-qr')}>
            <MinusCircle size={17} />
            <span>{lang === 'th' ? '🔴 ขอเบิกอุปกรณ์ (-)' : 'Requisition Asset (-)'}</span>
          </button>
          <button className="quick-btn btn-in" onClick={onOpenStockIn}>
            <PlusCircle size={17} />
            <span>{lang === 'th' ? '🟢 รับเข้าอุปกรณ์ใหม่ (+)' : 'Receive Asset (+)'}</span>
          </button>
        </div>
      )}

      <div className="sidebar-divider" />

      {/* Main Navigation List */}
      <nav className="sidebar-nav">
        {/* Section 1: Admin */}
        {visibleAdmin.length > 0 && (
          <div className="nav-section mb-3">
            <div className="menu-label">{lang === 'th' ? 'ผู้ดูแลระบบ (ADMIN)' : 'ADMINISTRATION'}</div>
            {visibleAdmin.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{lang === 'th' ? item.labelTh : item.labelEn}</span>
                  {item.badge && <span className="nav-badge badge-blue">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Section 2: Operations */}
        {visibleOps.length > 0 && (
          <div className="nav-section mb-3">
            <div className="menu-label">{lang === 'th' ? 'ระบบหลัก (OPERATIONS)' : 'MAIN OPERATIONS'}</div>
            {visibleOps.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''} ${item.isHighlight ? 'is-portal-item' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{lang === 'th' ? item.labelTh : item.labelEn}</span>
                  {item.badge && <span className="nav-badge badge-red">{item.badge}</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* Section 3: Masters */}
        {visibleMasters.length > 0 && (
          <div className="nav-section mb-3">
            <div className="menu-label">{lang === 'th' ? 'ข้อมูลหลักและรายงาน' : 'MASTERS & REPORTS'}</div>
            {visibleMasters.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-text">{lang === 'th' ? item.labelTh : item.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* Admin Quick Tools in Sidebar Footer */}
      {isAdmin && (
        <div className="card p-2 mb-2" style={{ background: 'var(--bg-main)', border: '1px dashed var(--border-color)' }}>
          <div className="text-xxs font-bold text-muted mb-1 px-1">เครื่องมือองค์กร:</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {onOpenDepartmentQuota && (
              <button
                type="button"
                className="btn btn-ghost btn-xs flex-center gap-1.5 justify-start text-xs font-bold"
                style={{ padding: '4px 8px', width: '100%', justifyContent: 'flex-start' }}
                onClick={onOpenDepartmentQuota}
              >
                <PieChart size={13} color="#6366f1" />
                <span>โควตาเบิกตามแผนก</span>
              </button>
            )}
            {onOpenBackupRestore && (
              <button
                type="button"
                className="btn btn-ghost btn-xs flex-center gap-1.5 justify-start text-xs font-bold"
                style={{ padding: '4px 8px', width: '100%', justifyContent: 'flex-start' }}
                onClick={onOpenBackupRestore}
              >
                <Database size={13} color="#10b981" />
                <span>สำรอง & กู้คืนข้อมูล</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Footer System Status */}
      <div className="sidebar-footer">
        <div className="footer-card">
          <div className="footer-title">
            <Building size={14} className="inline-icon" /> EXION THAILAND v2.0
          </div>
          <div className="footer-subtitle">Enterprise Cloud Stock System</div>
        </div>
      </div>

      <style>{`
        .sidebar {
          width: 270px;
          background-color: var(--bg-sidebar);
          display: flex;
          flex-direction: column;
          padding: 1.5rem 1.15rem;
          border-right: 1px solid rgba(255, 255, 255, 0.06);
          flex-shrink: 0;
          box-shadow: 4px 0 24px rgba(0, 0, 0, 0.3);
        }

        .quick-actions-panel {
          display: flex;
          flex-direction: column;
          gap: 0.55rem;
          margin-bottom: 0.5rem;
        }

        .viewer-mode-notice {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          background: rgba(245, 158, 11, 0.1);
          border: 1px solid rgba(245, 158, 11, 0.25);
          padding: 0.85rem;
          border-radius: var(--radius-sm);
          margin-bottom: 0.5rem;
        }

        .user-requisition-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(225, 29, 72, 0.12);
          border: 1.5px solid rgba(225, 29, 72, 0.3);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 0.5rem;
        }

        .badge-glow-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(225, 29, 72, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .text-amber { color: #f59e0b; }
        .text-xxs { font-size: 0.72rem; }

        .panel-label, .menu-label {
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #64748b;
          margin-bottom: 0.45rem;
          padding-left: 0.6rem;
        }

        .quick-btn {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 0.95rem;
          border-radius: var(--radius-sm);
          font-family: var(--font-family);
          font-size: 0.85rem;
          font-weight: 700;
          border: none;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          color: #ffffff;
        }

        .quick-btn:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }

        .btn-in {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }

        .btn-out {
          background: var(--req-gradient);
          box-shadow: var(--req-glow);
        }

        .sidebar-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 1.15rem 0;
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow-y: auto;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.7rem 0.95rem;
          border-radius: var(--radius-sm);
          background: transparent;
          border: 1px solid transparent;
          color: var(--sidebar-text);
          font-family: var(--font-family);
          font-size: 0.88rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          margin-bottom: 0.25rem;
          text-align: left;
        }

        .nav-item:hover {
          background: var(--sidebar-hover);
          color: #ffffff;
          transform: translateX(3px);
        }

        .nav-item.active {
          background: var(--primary-gradient);
          color: #ffffff;
          font-weight: 800;
          box-shadow: 0 4px 16px rgba(79, 70, 229, 0.4);
        }

        .nav-item.is-portal-item.active {
          background: var(--req-gradient);
          box-shadow: var(--req-glow);
        }

        .nav-icon {
          flex-shrink: 0;
          opacity: 0.85;
        }

        .nav-item.active .nav-icon {
          opacity: 1;
        }

        .nav-text {
          flex: 1;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .nav-badge {
          font-size: 0.72rem;
          font-weight: 800;
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }

        .badge-blue {
          background: rgba(99, 102, 241, 0.25);
          color: #818cf8;
        }

        .badge-red {
          background: rgba(225, 29, 72, 0.25);
          color: #fb7185;
        }

        .sidebar-footer {
          margin-top: auto;
          padding-top: 1rem;
        }

        .footer-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 0.85rem;
          text-align: center;
        }

        .footer-title {
          font-size: 0.82rem;
          font-weight: 800;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
        }

        .footer-subtitle {
          font-size: 0.7rem;
          color: #64748b;
          margin-top: 0.2rem;
        }
      `}</style>
    </aside>
  );
};
