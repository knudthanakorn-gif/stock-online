import React from 'react';
import { useStock } from '../context/StockContext';
import {
  ShieldCheck,
  Package,
  PlusCircle,
  MinusCircle,
  ScanBarcode,
  FolderTree,
  Users,
  UserPlus,
  UserCheck,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Trash2,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Layers,
  ArrowRight,
  Clock,
  Database,
  CheckCircle2,
  QrCode,
  ClipboardCheck,
  PieChart,
  Bell,
  Upload,
  Zap,
} from 'lucide-react';

export const AdminHome = ({
  setActiveTab,
  onOpenStockIn,
  onOpenStockOut,
  onOpenScanner,
  onOpenAddProduct,
  onOpenDepartmentQuota,
  onOpenBackupRestore,
  onOpenNotificationSettings,
}) => {
  const {
    user,
    usersList,
    requestersList,
    products,
    categories,
    suppliers,
    transactions,
    requests = [],
    loadSimulated500Data,
    lang,
    getLowStockProducts,
    getOutOfStockProducts,
    getTotalInventoryValue,
    getTotalSellingValue,
    exportDataJSON,
    resetToDemoData,
    clearAllData,
  } = useStock();

  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();
  const totalCostVal = getTotalInventoryValue();
  const totalSaleVal = getTotalSellingValue();
  const potentialProfit = totalSaleVal - totalCostVal;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleClearAllData = () => {
    const confirm1 = window.confirm(
      lang === 'th'
        ? '⚠️ คำเตือนสิทธิ์ Admin: คุณแน่ใจหรือไม่ว่าต้องการ "ล้างข้อมูลทั้งหมดในระบบ" (สินค้า, หมวดหมู่, ผู้จัดจำหน่าย, คำขอเบิก และประวัติธุรกรรม จะถูกลบถาวร)?'
        : '⚠️ ADMIN WARNING: Are you sure you want to CLEAR ALL SYSTEM DATA (Products, Categories, Suppliers, Requests, and History will be wiped permanently)?'
    );

    if (confirm1) {
      clearAllData();
      alert(lang === 'th' ? '🗑️ ล้างข้อมูลทั้งหมดในระบบเรียบร้อยแล้ว!' : '🗑️ All system data has been wiped successfully!');
    }
  };

  return (
    <div className="admin-home-page">
      {/* Welcome Banner */}
      <div className="admin-welcome-banner">
        <div className="banner-content">
          <div className="admin-badge">
            <ShieldCheck size={18} />
            <span>{lang === 'th' ? 'แผงควบคุมสิทธิ์ผู้ดูแลระบบ (Admin Portal)' : 'Administrator Control Panel'}</span>
          </div>
          <h1 className="banner-title">
            {lang === 'th' ? `ยินดีต้อนรับ, ${user?.name || 'Admin'} 👋` : `Welcome Back, ${user?.name || 'Admin'} 👋`}
          </h1>
          <p className="banner-subtitle">
            {lang === 'th'
              ? 'ระบบรับและเบิกจ่ายอุปกรณ์สำนักงาน บริหารผู้ใช้งาน คลังอุปกรณ์ รายชื่อผู้เบิก และล้างข้อมูลระบบ'
              : 'Office asset requisition portal. Manage users, assets, requesters directory, and database.'}
          </p>
        </div>

        <div className="banner-stats flex-center gap-2">
          <div className="stat-pill">
            <span className="stat-label">{lang === 'th' ? 'ผู้ใช้งานระบบ' : 'System Users'}</span>
            <span className="stat-val">{usersList.length} {lang === 'th' ? 'บัญชี' : 'Users'}</span>
          </div>
          <div className="stat-pill">
            <span className="stat-label">{lang === 'th' ? 'รายชื่อผู้เบิก' : 'Requesters'}</span>
            <span className="stat-val text-emerald">{requestersList.length} {lang === 'th' ? 'คน' : 'People'}</span>
          </div>
        </div>
      </div>

      {/* Admin Quick Action Portal Cards */}
      <div className="section-title-wrap mb-4">
        <h2>{lang === 'th' ? '⚡ เมนูลัดและทางด่วนผู้ดูแลระบบ' : '⚡ Admin Quick Command Shortcuts'}</h2>
      </div>

      <div className="admin-shortcuts-grid mb-6">
        {/* Manage System Users & Passwords */}
        <div className="card shortcut-card card-hover highlight-admin-card" onClick={() => setActiveTab('users')}>
          <div className="shortcut-icon bg-blue-bold">
            <UserPlus size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '👤 จัดการผู้ใช้ & รีเซ็ตรหัสผ่าน' : '👤 Users & Password Management'}</h3>
            <p>{lang === 'th' ? `กำหนดสิทธิ์และเปลี่ยน/รีเซ็ตรหัสผ่าน (${usersList.length} บัญชี)` : `Manage users and reset passwords (${usersList.length})`}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* Manage Requesters Directory (ADMIN ONLY) */}
        <div className="card shortcut-card card-hover highlight-admin-card" onClick={() => setActiveTab('requesters')}>
          <div className="shortcut-icon bg-emerald">
            <UserCheck size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '👥 รายชื่อผู้เบิก (Admin Only)' : '👥 Requesters Directory'}</h3>
            <p>{lang === 'th' ? `จัดการสมุดรายนามพนักงานผู้เบิก (${requestersList.length} รายชื่อ)` : `Manage requesters list (${requestersList.length})`}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={onOpenAddProduct}>
          <div className="shortcut-icon bg-blue">
            <Package size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '+ เพิ่มอุปกรณ์ใหม่' : '+ Add New Asset'}</h3>
            <p>{lang === 'th' ? 'เพิ่มอุปกรณ์เข้าคลัง พร้อมสร้าง QR Code' : 'Register asset with QR Code'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={onOpenStockOut}>
          <div className="shortcut-icon bg-red">
            <MinusCircle size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📤 เบิกจ่ายอุปกรณ์ (-)' : '📤 Requisition Asset (-)'}</h3>
            <p>{lang === 'th' ? 'เบิกจ่ายอุปกรณ์สำนักงาน เบิกใช้งานประจำวัน/โครงการ' : 'Record equipment dispatches'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={onOpenStockIn}>
          <div className="shortcut-icon bg-emerald">
            <PlusCircle size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📥 รับเข้าอุปกรณ์ใหม่ (+)' : '📥 Receive Asset (+)'}</h3>
            <p>{lang === 'th' ? 'บันทึกนำเข้าอุปกรณ์ใหม่จากร้านค้า' : 'Record incoming asset restock'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={onOpenScanner}>
          <div className="shortcut-icon bg-indigo">
            <QrCode size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📷 สแกน QR Code' : '📷 QR Code Scanner'}</h3>
            <p>{lang === 'th' ? 'เปิดกล้อง หรือ ยิงสแกน QR Code ค้นหาด่วน' : 'Scan QR Code for rapid lookup'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={() => setActiveTab('categories')}>
          <div className="shortcut-icon bg-purple">
            <FolderTree size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '🏷️ หมวดหมู่อุปกรณ์' : '🏷️ Categories'}</h3>
            <p>{lang === 'th' ? `จัดกลุ่มอุปกรณ์ไอที/วัสดุ (${categories.length} หมวด)` : `Manage categories (${categories.length})`}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        <div className="card shortcut-card card-hover" onClick={() => setActiveTab('suppliers')}>
          <div className="shortcut-icon bg-amber">
            <Users size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '👥 ร้านค้า / ซัพพลายเออร์' : '👥 Vendors & Suppliers'}</h3>
            <p>{lang === 'th' ? `สมุดรายนามคู่ค้า (${suppliers.length} ราย)` : `Vendor directory (${suppliers.length})`}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* Stock Audit & Cycle Count Shortcut */}
        <div className="card shortcut-card card-hover" onClick={() => setActiveTab('audit')}>
          <div className="shortcut-icon bg-indigo">
            <ClipboardCheck size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📋 ตรวจนับสต็อกประจำงวด' : '📋 Stocktake & Audit'}</h3>
            <p>{lang === 'th' ? 'ตรวจนับยอดจริง คำนวณผลต่าง และปรับยอดอัตโนมัติ' : 'Physical count, variance & stock adjustment'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* Department Quota Management */}
        <div className="card shortcut-card card-hover" onClick={onOpenDepartmentQuota}>
          <div className="shortcut-icon bg-purple">
            <PieChart size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '💰 โควตาการเบิกตามแผนก' : '💰 Department Quotas'}</h3>
            <p>{lang === 'th' ? 'กำหนดขีดจำกัดจำนวนชิ้นเบิกต่อเดือนของแต่ละแผนก' : 'Set monthly requisition limits per department'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* System Backup & Restore */}
        <div className="card shortcut-card card-hover" onClick={onOpenBackupRestore}>
          <div className="shortcut-icon bg-emerald">
            <Database size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '💾 สำรอง & กู้คืนข้อมูล (JSON)' : '💾 Backup & Restore'}</h3>
            <p>{lang === 'th' ? 'ส่งออกไฟล์สำรองข้อมูล หรือ กู้คืนระบบ 100%' : 'Export/Import complete system backup'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* LINE Notify & Alerts */}
        <div className="card shortcut-card card-hover" onClick={onOpenNotificationSettings}>
          <div className="shortcut-icon bg-blue">
            <Bell size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '🔔 ตั้งค่าแจ้งเตือน LINE Notify' : '🔔 LINE & Alerts Settings'}</h3>
            <p>{lang === 'th' ? 'เชื่อมต่อ LINE Token ส่งแจ้งเตือนคำขอและสต็อกต่ำ' : 'Configure LINE Notify and automated alerts'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* Monthly Stock Movement Report */}
        <div className="card shortcut-card card-hover" onClick={() => setActiveTab('reports')}>
          <div className="shortcut-icon" style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', color: '#ffffff' }}>
            <FileSpreadsheet size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📊 สรุปความเคลื่อนไหวสต็อกประจำเดือน' : '📊 Monthly Inventory Report'}</h3>
            <p>{lang === 'th' ? 'รายงานยอดต้นงวด รับเข้า เบิกจ่าย ปลายงวด พร้อมส่งออก Excel' : 'Beginning, Inflow, Outflow, Ending balances with Excel export'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* ISO Compliance Forms Studio */}
        <div className="card shortcut-card card-hover" onClick={() => setActiveTab('reports')}>
          <div className="shortcut-icon bg-emerald">
            <ShieldCheck size={26} />
          </div>
          <div className="shortcut-info">
            <h3>{lang === 'th' ? '📑 แบบฟอร์มรายงานมาตรฐาน ISO' : '📑 ISO Compliance Forms'}</h3>
            <p>{lang === 'th' ? 'ออกฟอร์ม FM-WH-001 ถึง 004 พร้อมช่องเซ็นอนุมัติ' : 'Generate controlled ISO forms with signatures'}</p>
          </div>
          <ArrowRight className="shortcut-arrow" size={20} />
        </div>

        {/* Clear All Data Danger Card */}
        <div className="card shortcut-card card-hover clear-data-card" onClick={handleClearAllData}>
          <div className="shortcut-icon bg-red-bold">
            <Trash2 size={26} />
          </div>
          <div className="shortcut-info">
            <h3 className="text-red-danger">{lang === 'th' ? '🗑️ ล้างข้อมูลทั้งหมดในระบบ' : '🗑️ Clear All System Data'}</h3>
            <p>{lang === 'th' ? 'ลบสินค้า หมวดหมู่ คู่ค้า และประวัติทั้งหมดในระบบ' : 'Wipe all products, categories, suppliers, & logs'}</p>
          </div>
          <ArrowRight className="shortcut-arrow text-red-danger" size={20} />
        </div>
      </div>

      {/* Low Stock Warning Banner & System Health */}
      <div className="admin-bottom-grid">
        {/* Low stock alerts */}
        <div className="card urgent-card">
          <div className="card-header flex-between mb-3">
            <div className="card-title flex-center gap-2">
              <AlertTriangle color="#f59e0b" size={20} />
              <span className="font-extrabold text-sm">{lang === 'th' ? 'รายการอุปกรณ์ต้องเติมคลังด่วน' : 'Urgent Asset Restock Needed'}</span>
            </div>
            <button className="btn btn-xs btn-outline font-bold" onClick={() => setActiveTab('inventory')}>
              {lang === 'th' ? 'ดูทั้งหมด' : 'View All'}
            </button>
          </div>

          {/* Desktop Table View */}
          <div className="desktop-urgent-table table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{lang === 'th' ? 'อุปกรณ์' : 'Asset'}</th>
                  <th>Asset Tag</th>
                  <th>{lang === 'th' ? 'คงเหลือ' : 'Qty'}</th>
                  <th>{lang === 'th' ? 'เติมสต็อก' : 'Action'}</th>
                </tr>
              </thead>
              <tbody>
                {[...outOfStockItems, ...lowStockItems].length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      {lang === 'th' ? 'ไม่มีรายการอุปกรณ์สต็อกต่ำ 🎉' : 'All items well stocked! 🎉'}
                    </td>
                  </tr>
                ) : (
                  [...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => (
                    <tr key={prod.id}>
                      <td className="font-semibold">{prod.name}</td>
                      <td className="text-muted font-mono">{prod.sku}</td>
                      <td>
                        <span className={`badge ${prod.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {prod.quantity} {prod.unit}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-success"
                          onClick={onOpenStockIn}
                        >
                          <PlusCircle size={14} /> {lang === 'th' ? 'เติมสต็อก' : 'Restock'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View (Clean & Touch-friendly) */}
          <div className="mobile-urgent-list">
            {[...outOfStockItems, ...lowStockItems].length === 0 ? (
              <div className="text-center py-4 text-muted text-xs">
                🎉 {lang === 'th' ? 'ไม่มีรายการอุปกรณ์สต็อกต่ำ' : 'All items well stocked!'}
              </div>
            ) : (
              [...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => (
                <div key={prod.id} className="mobile-urgent-item">
                  <div className="urgent-item-left">
                    <div className="urgent-item-name">{prod.name}</div>
                    <div className="urgent-item-sku desktop-only">
                      Tag: <span className="font-mono">{prod.sku}</span>
                    </div>
                  </div>
                  <div className="urgent-item-right">
                    <span className={`badge ${prod.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {prod.quantity} {prod.unit}
                    </span>
                    <button
                      className="btn btn-xs btn-success font-bold"
                      onClick={onOpenStockIn}
                    >
                      <PlusCircle size={13} /> {lang === 'th' ? 'เติมสต็อก' : 'Restock'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Health & Wipe Data Card */}
        <div className="card system-health-card">
          <div className="card-header">
            <div className="card-title">
              <Database color="#2563eb" size={20} />
              <span>{lang === 'th' ? 'สถานะระบบ & เครื่องมือ Admin' : 'System Health & Danger Zone'}</span>
            </div>
          </div>

          <div className="health-list">
            <div className="health-item">
              <CheckCircle2 color="#10b981" size={18} />
              <div>
                <div className="health-title">{lang === 'th' ? 'Local Storage Persistent Sync' : 'Local Storage Persistent Sync'}</div>
                <div className="health-sub">{lang === 'th' ? 'บันทึกข้อมูลอัตโนมัติเรียบร้อย' : 'Auto-saved locally'}</div>
              </div>
            </div>

            <div className="health-item">
              <Clock color="#3b82f6" size={18} />
              <div>
                <div className="health-title">{lang === 'th' ? 'ประวัติความเคลื่อนไหวสต็อก' : 'Transaction Audit Logs'}</div>
                <div className="health-sub">{transactions.length} {lang === 'th' ? 'รายการธุรกรรม' : 'total logs'}</div>
              </div>
            </div>
          </div>

          <div className="health-actions mt-4">
            <button className="btn btn-secondary w-full" onClick={exportDataJSON}>
              <Download size={16} />
              {lang === 'th' ? 'ดาวน์โหลดไฟล์สำรองข้อมูล JSON' : 'Export JSON Backup'}
            </button>
            <button
              className="btn btn-outline w-full mt-2"
              onClick={() => {
                if (window.confirm(lang === 'th' ? 'รีเซ็ตข้อมูลระบบเป็นชุดตัวอย่างเริ่มต้นหรือไม่?' : 'Reset data to initial demo state?')) {
                  resetToDemoData();
                }
              }}
            >
              <RotateCcw size={16} />
              {lang === 'th' ? 'รีเซ็ตข้อมูลเป็นชุดตัวอย่าง' : 'Reset Demo Data'}
            </button>

            <button className="btn btn-danger w-full mt-3" onClick={handleClearAllData}>
              <Trash2 size={16} />
              {lang === 'th' ? '🗑️ ล้างข้อมูลทั้งหมดในระบบ' : '🗑️ Clear All System Data'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .admin-welcome-banner {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2rem;
          color: #ffffff;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1.5rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
        }

        .admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: rgba(37, 99, 235, 0.25);
          color: #60a5fa;
          border: 1px solid rgba(96, 165, 250, 0.3);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
          margin-bottom: 0.75rem;
        }

        .banner-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 0.4rem;
        }

        .banner-subtitle {
          font-size: 0.92rem;
          color: #94a3b8;
          max-width: 600px;
        }

        .banner-stats {
          display: flex;
          gap: 1rem;
        }

        .stat-pill {
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-md);
          padding: 0.85rem 1.25rem;
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .stat-val {
          font-size: 1.25rem;
          font-weight: 700;
          color: #ffffff;
        }

        .section-title-wrap h2 {
          font-size: 1.2rem;
          font-weight: 700;
        }

        .admin-shortcuts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          gap: 1.25rem;
        }

        .shortcut-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.25rem;
          cursor: pointer;
          position: relative;
        }

        .highlight-admin-card {
          border: 1.5px solid #3b82f6;
          background: linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-50) 100%);
        }

        .clear-data-card {
          border: 1.5px solid #fca5a5;
          background: linear-gradient(135deg, var(--bg-surface) 0%, #fee2e2 100%);
        }

        [data-theme="dark"] .clear-data-card {
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(185, 28, 28, 0.2) 100%);
          border-color: #991b1b;
        }

        .shortcut-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-blue-bold { background: #2563eb; color: #ffffff; }
        .bg-red-bold { background: #ef4444; color: #ffffff; }
        .bg-blue { background: #dbeafe; color: #2563eb; }
        .bg-emerald { background: #dcfce7; color: #059669; }
        .bg-red { background: #fee2e2; color: #dc2626; }
        .bg-indigo { background: #e0e7ff; color: #4f46e5; }
        .bg-purple { background: #f3e8ff; color: #7c3aed; }
        .bg-amber { background: #fef3c7; color: #d97706; }

        [data-theme="dark"] .bg-blue { background: rgba(37, 99, 235, 0.2); color: #60a5fa; }
        [data-theme="dark"] .bg-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        [data-theme="dark"] .bg-red { background: rgba(220, 38, 38, 0.2); color: #f87171; }
        [data-theme="dark"] .bg-indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        [data-theme="dark"] .bg-purple { background: rgba(124, 58, 237, 0.2); color: #a78bfa; }
        [data-theme="dark"] .bg-amber { background: rgba(217, 119, 6, 0.2); color: #fbbf24; }

        .shortcut-info {
          flex: 1;
        }

        .shortcut-info h3 {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 0.15rem;
        }

        .shortcut-info p {
          font-size: 0.78rem;
          color: var(--text-muted);
          line-height: 1.2;
        }

        .shortcut-arrow {
          color: var(--text-muted);
          transition: transform 0.2s ease, color 0.2s ease;
        }

        .shortcut-card:hover .shortcut-arrow {
          transform: translateX(4px);
          color: var(--primary-500);
        }

        .text-red-danger { color: #dc2626; }

        .admin-bottom-grid {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 1.25rem;
        }

        .health-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .health-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .health-title {
          font-size: 0.88rem;
          font-weight: 600;
        }

        .health-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
        }

        .mb-4 { margin-bottom: 1rem; }
        .mb-6 { margin-bottom: 1.5rem; }
        .w-full { width: 100%; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-3 { margin-top: 0.75rem; }
        .mt-4 { margin-top: 1rem; }
        .font-mono { font-family: monospace; }

        .mobile-urgent-list {
          display: none;
          flex-direction: column;
          gap: 0.55rem;
        }

        .mobile-urgent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          gap: 0.75rem;
        }

        .urgent-item-left {
          flex: 1;
          min-width: 0;
        }

        .urgent-item-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .urgent-item-sku {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .urgent-item-right {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        @media (max-width: 900px) {
          .admin-bottom-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .admin-welcome-banner {
            padding: 1.15rem 1.25rem;
            margin-bottom: 1rem;
            border-radius: 16px;
            gap: 1rem;
          }
          .banner-title {
            font-size: 1.3rem;
          }
          .banner-subtitle {
            font-size: 0.78rem;
          }
          .banner-stats {
            width: 100%;
            display: flex;
            gap: 0.5rem;
          }
          .stat-pill {
            flex: 1;
            padding: 0.6rem 0.75rem;
            border-radius: 12px;
          }
          .stat-label {
            font-size: 0.68rem;
          }
          .stat-val {
            font-size: 1.05rem;
          }
          .admin-shortcuts-grid {
            grid-template-columns: 1fr;
            gap: 0.65rem;
            margin-bottom: 1rem;
          }
          .shortcut-card {
            padding: 0.85rem 1rem;
            border-radius: 14px;
            gap: 0.85rem;
          }
          .shortcut-icon {
            width: 44px;
            height: 44px;
            border-radius: 12px;
          }
          .shortcut-icon svg {
            width: 22px;
            height: 22px;
          }
          .shortcut-info h3 {
            font-size: 0.88rem;
          }
          .shortcut-info p {
            font-size: 0.72rem;
          }
          .desktop-urgent-table {
            display: none !important;
          }
          .mobile-urgent-list {
            display: flex !important;
          }
          .urgent-card {
            padding: 1rem 0.85rem;
            border-radius: 16px;
          }
        }
      `}</style>
    </div>
  );
};
