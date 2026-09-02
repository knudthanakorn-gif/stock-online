import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import {
  UserPlus,
  Users,
  ShieldCheck,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  Lock,
  Mail,
  Phone,
  X,
  Check,
  Key,
  Eye,
  Building,
  Briefcase,
  KeyRound,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  LayoutGrid,
  List,
  Camera,
  Upload,
  Image,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
];

export const UserManager = () => {
  const {
    usersList,
    createNewUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    adminResetUserPassword,
    lang,
  } = useStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Pagination & Scroll Helper
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    employeeCode: '',
    password: '',
    name: '',
    role: 'staff',
    company: 'EXION (THAILAND) COMPANY LIMITED',
    department: '',
    position: '',
    email: '',
    phone: '',
    avatar: AVATAR_PRESETS[0],
  });

  // Password Reset Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetUser, setTargetUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [forceMustChange, setForceMustChange] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      employeeCode: `EMP-${1001 + usersList.length}`,
      password: '1234',
      name: '',
      role: 'user',
      company: 'EXION (THAILAND) COMPANY LIMITED',
      department: '',
      position: '',
      email: '',
      phone: '',
      avatar: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (u) => {
    setEditingUser(u);
    setFormData({
      username: u.username || '',
      employeeCode: u.employeeCode || '',
      password: u.password || '',
      name: u.name || '',
      role: u.role || 'user',
      company: u.company || 'EXION (THAILAND) COMPANY LIMITED',
      department: u.department || '',
      position: u.position || '',
      email: u.email || '',
      phone: u.phone || '',
      avatar: u.avatar || AVATAR_PRESETS[0],
    });
    setIsModalOpen(true);
  };

  // Direct 1-Click Avatar Upload on User Card / Table Row
  const handleDirectUserAvatarUpload = (userId, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'th' ? 'ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB' : 'Image size must be <= 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        updateUser(userId, { avatar: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  // Avatar Upload inside Modal Form
  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(lang === 'th' ? 'ขนาดไฟล์รูปภาพต้องไม่เกิน 5MB' : 'Image size must be <= 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        setFormData((prev) => ({ ...prev, avatar: dataUrl }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleOpenPasswordModal = (u) => {
    setTargetUser(u);
    setNewPassword(u.password || '1234');
    setForceMustChange(Boolean(u.mustChangePassword));
    setShowPassword(true);
    setFeedbackMsg('');
    setErrorMsg('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    if (!targetUser || !newPassword.trim()) return;

    try {
      adminResetUserPassword(targetUser.id, newPassword.trim(), forceMustChange);
      setFeedbackMsg(
        lang === 'th'
          ? `🎉 เปลี่ยนรหัสผ่านของ "${targetUser.name}" เป็น "${newPassword.trim()}" สำเร็จ!`
          : `Password updated successfully to "${newPassword.trim()}"!`
      );
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setFeedbackMsg('');
      }, 1500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.name.trim()) return;

    if (editingUser) {
      updateUser(editingUser.id, formData);
    } else {
      createNewUser(formData);
    }
    setIsModalOpen(false);
  };

  const getRoleLabel = (roleStr) => {
    if (roleStr === 'admin') return lang === 'th' ? 'ผู้ดูแลระบบ (Admin)' : 'Administrator';
    if (roleStr === 'staff') return lang === 'th' ? 'พนักงานคลัง (Staff)' : 'Warehouse Staff';
    if (roleStr === 'user') return lang === 'th' ? 'ผู้เบิกอุปกรณ์ (User)' : 'User (Requisition)';
    if (roleStr === 'viewer') return lang === 'th' ? 'ผู้เข้าชม (Viewer)' : 'Viewer (Read Only)';
    return roleStr;
  };

  const getRoleBadgeClass = (roleStr) => {
    if (roleStr === 'admin') return 'badge-success';
    if (roleStr === 'staff') return 'badge-info';
    if (roleStr === 'user') return 'badge-primary';
    return 'badge-warning';
  };

  // Get unique companies & departments for filters
  const REMOVED_COMPANIES = ['c.s.i', 'csi', 'osa', 'tri-gen', 'trigen'];
  const companies = Array.from(
    new Set([
      'EXION (Thailand) Company Limited',
      'HOUSE OF PROFESSIONALS COMPANY LIMITED',
      'PD FLOWTECH COMPANY LIMITED',
      ...usersList
        .map((u) => u.company)
        .filter(Boolean)
        .filter((comp) => !REMOVED_COMPANIES.some((removed) => comp.toLowerCase().includes(removed))),
    ])
  );
  const departments = Array.from(new Set(usersList.map((u) => u.department).filter(Boolean)));

  // Filtered users
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.employeeCode && u.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.department && u.department.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
    const matchCompany = selectedCompany === 'ALL' || u.company === selectedCompany;
    const matchDept = selectedDept === 'ALL' || u.department === selectedDept;

    return matchSearch && matchRole && matchCompany && matchDept;
  });

  // Pagination calculations
  const totalItems = filteredUsers.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalItems / Number(pageSize)));
  const paginatedUsers = pageSize === 'ALL'
    ? filteredUsers
    : filteredUsers.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  return (
    <div className="user-manager-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users color="#2563eb" />
            {lang === 'th' ? 'จัดการผู้ใช้งาน & รหัสผ่าน (User & Password Management)' : 'User Management'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `ผู้ดูแลระบบ (Admin) สามารถดู, แก้ไขข้อมูล, อัปโหลดรูปรายบุคคล, และรีเซ็ตรหัสผ่านของพนักงานทุกคนได้ทั้งหมด ${usersList.length} บัญชี`
              : `Managing ${usersList.length} registered system users`}
          </p>
        </div>

        <button className="btn btn-primary btn-lg" onClick={handleOpenAdd}>
          <UserPlus size={18} />
          {lang === 'th' ? 'สร้างผู้ใช้งานใหม่' : 'Create New User'}
        </button>
      </div>

      {/* Filter Toolbar with View Switcher */}
      <div className="card toolbar-card mb-4">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={lang === 'th' ? 'ค้นหาตามชื่อ, Username, รหัสพนักงาน, แผนก...' : 'Search users...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'บริษัท:' : 'Company:'}</span>
            <select
              className="form-control filter-select"
              value={selectedCompany}
              onChange={(e) => {
                setSelectedCompany(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">{lang === 'th' ? 'ทุกบริษัท (All Companies)' : 'All Companies'}</option>
              {companies.map((c, i) => (
                <option key={i} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'แผนก/ฝ่าย:' : 'Dept:'}</span>
            <select
              className="form-control filter-select"
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">{lang === 'th' ? 'ทุกแผนก (All Departments)' : 'All Departments'}</option>
              {departments.map((d, i) => (
                <option key={i} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'กลุ่มสิทธิ์:' : 'Role:'}</span>
            <select
              className="form-control filter-select"
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ALL">{lang === 'th' ? 'ทั้งหมด (All Roles)' : 'All Roles'}</option>
              <option value="admin">{lang === 'th' ? '🛡️ ผู้ดูแลระบบ (Admin)' : 'Admin'}</option>
              <option value="staff">{lang === 'th' ? '📦 พนักงานคลัง (Staff)' : 'Staff'}</option>
              <option value="user">{lang === 'th' ? '👤 ผู้เบิกอุปกรณ์ (User)' : 'User'}</option>
              <option value="viewer">{lang === 'th' ? '👁️ ผู้เข้าชม (Viewer)' : 'Viewer'}</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle: Grid Cards vs List Table */}
        <div className="flex-center gap-1">
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary font-bold' : 'btn-secondary'}`}
            onClick={() => setViewMode('grid')}
            title={lang === 'th' ? 'แสดงแบบการ์ด (หลายคนต่อแถว)' : 'Grid View'}
          >
            <LayoutGrid size={15} />
            <span>{lang === 'th' ? 'การ์ด' : 'Grid'}</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary font-bold' : 'btn-secondary'}`}
            onClick={() => setViewMode('table')}
            title={lang === 'th' ? 'แสดงแบบตาราง' : 'Table View'}
          >
            <List size={15} />
            <span>{lang === 'th' ? 'ตาราง' : 'Table'}</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MULTI-COLUMN COMPACT GRID (3-4 USERS PER ROW) */}
      {viewMode === 'grid' && (
        <div className="users-grid">
          {paginatedUsers.map((u) => {
            const isActive = u.status === 'active';
            const isAdmin = u.role === 'admin';
            const isViewer = u.role === 'viewer';

            return (
              <div key={u.id} className="card user-card">
                <div className="user-card-header">
                  <div className="user-card-title">
                    <h3 className="user-card-name" title={u.name}>{u.name}</h3>
                    <div className="user-card-username font-mono font-bold">
                      @{u.username} {u.employeeCode && <span className="text-muted font-normal text-xxs font-mono">[{u.employeeCode}]</span>}
                    </div>
                  </div>

                  <div className="user-card-actions">
                    <button
                      className="btn-action-sm"
                      style={{ color: '#4f46e5', background: 'rgba(99, 102, 241, 0.12)' }}
                      onClick={() => handleOpenPasswordModal(u)}
                      title={lang === 'th' ? '🔑 เปลี่ยน / รีเซ็ตรหัสผ่าน' : 'Reset Password'}
                    >
                      <KeyRound size={14} />
                    </button>
                    <button className="btn-action-sm" onClick={() => handleOpenEdit(u)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-action-sm danger"
                      onClick={() => {
                        if (window.confirm(lang === 'th' ? `ลบบัญชี "${u.name}" หรือไม่?` : `Delete user "${u.name}"?`)) {
                          deleteUser(u.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="user-card-body">
                  <div className="role-pill-wrap mb-2">
                    <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                      {isAdmin ? <ShieldCheck size={13} /> : isViewer ? <Eye size={13} /> : <UserCheck size={13} />}
                      {' '}{getRoleLabel(u.role)}
                    </span>
                  </div>

                  <div className="user-meta-list">
                    {u.department && (
                      <div className="user-meta-item">
                        <Building size={13} className="meta-icon" />
                        <span className="text-xs font-semibold">{u.company || 'EXION (THAILAND) COMPANY LIMITED'} - {u.department}</span>
                      </div>
                    )}

                    {u.position && (
                      <div className="user-meta-item">
                        <Briefcase size={13} className="meta-icon" />
                        <span className="text-xs text-muted">{u.position}</span>
                      </div>
                    )}

                    {/* Email Display Row */}
                    <div className="user-meta-item">
                      <Mail size={13} className="meta-icon text-indigo" />
                      {u.email ? (
                        <span className="text-xs font-semibold text-primary">{u.email}</span>
                      ) : (
                        <span className="text-xxs text-muted cursor-pointer" onClick={() => handleOpenEdit(u)} style={{ fontStyle: 'italic', textDecoration: 'underline' }}>
                          + เพิ่มอีเมลสำหรับรับแจ้งเตือน
                        </span>
                      )}
                    </div>

                    {/* Password row with direct reset trigger */}
                    <div className="user-meta-item flex-between" style={{ background: 'var(--bg-main)', padding: '5px 8px', borderRadius: '6px', marginTop: '4px' }}>
                      <div className="flex-center gap-1.5">
                        <Key size={13} color="#4f46e5" />
                        <span className="font-mono text-xs">
                          {lang === 'th' ? 'รหัส:' : 'Pwd:'}{' '}
                          <strong className="text-primary font-bold" style={{ letterSpacing: '1px' }}>{u.password}</strong>
                          {u.mustChangePassword && (
                            <span className="text-warning ml-1 font-sans text-xxs font-bold">
                              (⚠️ รอเปลี่ยน PIN)
                            </span>
                          )}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn-ghost btn-xs font-bold text-primary"
                        style={{ padding: '1px 5px', fontSize: '0.7rem' }}
                        onClick={() => handleOpenPasswordModal(u)}
                      >
                        <KeyRound size={11} /> {lang === 'th' ? 'เปลี่ยนรหัส' : 'Change'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="user-card-footer">
                  <button
                    className={`btn btn-xs ${isActive ? 'btn-outline' : 'btn-success'} w-full font-bold`}
                    onClick={() => toggleUserStatus(u.id)}
                  >
                    {isActive ? (
                      <><UserX size={13} /> {lang === 'th' ? 'ระงับการใช้งาน' : 'Suspend'}</>
                    ) : (
                      <><UserCheck size={13} /> {lang === 'th' ? 'เปิดใช้งานบัญชี' : 'Activate'}</>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: COMPACT TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="table-responsive">
          <table className="data-table requester-table sticky-table-header">
            <thead>
              <tr>
                <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                <th style={{ minWidth: '180px' }}>{lang === 'th' ? 'ผู้ใช้งานระบบ' : 'User'}</th>
                <th style={{ width: '110px' }}>{lang === 'th' ? 'รหัส / Username' : 'Code / Username'}</th>
                <th style={{ width: '130px' }}>{lang === 'th' ? 'กลุ่มสิทธิ์' : 'Role'}</th>
                <th style={{ minWidth: '140px' }}>{lang === 'th' ? 'แผนก / ฝ่าย' : 'Department'}</th>
                <th style={{ width: '160px' }}>{lang === 'th' ? 'รหัสผ่าน & สถานะ' : 'Password & Status'}</th>
                <th style={{ width: '110px', textAlign: 'center' }}>{lang === 'th' ? 'สถานะบัญชี' : 'Account'}</th>
                <th style={{ width: '115px', textAlign: 'center' }}>{lang === 'th' ? 'จัดการ' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">
                    {lang === 'th' ? 'ไม่พบข้อมูลผู้ใช้งาน' : 'No users found'}
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u, idx) => {
                  const itemIndex = pageSize === 'ALL' ? idx + 1 : (currentPage - 1) * Number(pageSize) + idx + 1;
                  const isActive = u.status === 'active';
                  return (
                    <tr key={u.id}>
                      <td className="text-muted text-xs text-center">{itemIndex}</td>
                      <td>
                        <div>
                          <div className="font-bold text-sm text-primary">{u.name}</div>
                          {u.email && <div className="text-xxs text-muted">{u.email}</div>}
                        </div>
                      </td>
                      <td className="font-mono text-xs font-bold">
                        <div>@{u.username}</div>
                        {u.employeeCode && <div className="text-xxs text-muted font-mono">{u.employeeCode}</div>}
                      </td>
                      <td>
                        <span className={`badge ${getRoleBadgeClass(u.role)}`}>
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td>
                        <div className="text-xs">
                          {u.department ? <span>{u.department}</span> : <span className="text-muted">-</span>}
                          {u.position && <div className="text-xxs text-muted">{u.position}</div>}
                        </div>
                      </td>
                      <td>
                        <div className="flex-center gap-1.5 text-xs">
                          <Key size={13} color="#4f46e5" />
                          <span className="font-mono font-bold text-primary">{u.password}</span>
                          {u.mustChangePassword ? (
                            <span className="badge badge-warning text-xxs font-bold">⚠️ รอเปลี่ยน</span>
                          ) : (
                            <span className="badge badge-success text-xxs font-bold">🟢 ตั้งรหัสแล้ว</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <button
                          className={`btn btn-xs ${isActive ? 'btn-outline' : 'btn-success'}`}
                          onClick={() => toggleUserStatus(u.id)}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </button>
                      </td>
                      <td className="text-center">
                        <div className="flex-center gap-1 justify-center" style={{ display: 'inline-flex' }}>
                          <button
                            className="btn-action-sm"
                            style={{ color: '#4f46e5', background: 'rgba(99, 102, 241, 0.12)' }}
                            onClick={() => handleOpenPasswordModal(u)}
                            title={lang === 'th' ? '🔑 เปลี่ยน / รีเซ็ตรหัสผ่าน' : 'Reset Password'}
                          >
                            <KeyRound size={14} />
                          </button>
                          <button className="btn-action-sm" onClick={() => handleOpenEdit(u)} title="Edit">
                            <Edit2 size={14} />
                          </button>
                          <button
                            className="btn-action-sm danger"
                            onClick={() => {
                              if (window.confirm(lang === 'th' ? `ลบบัญชี "${u.name}" หรือไม่?` : `Delete user "${u.name}"?`)) {
                                deleteUser(u.id);
                              }
                            }}
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {filteredUsers.length > 0 && (
        <div className="pagination-bar card p-3 mt-4">
          <div className="pagination-info text-xs text-muted">
            {lang === 'th' ? (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>แสดงทั้งหมด <strong className="text-primary">{totalItems}</strong> บัญชีผู้ใช้ (จากทั้งหมด {usersList.length} บัญชี)</>
                ) : (
                  <>
                    แสดงผู้ใช้ที่ <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> จากทั้งหมด <strong className="text-primary">{totalItems}</strong> บัญชี (หน้า <strong className="text-primary">{currentPage}/{totalPages}</strong>)
                  </>
                )}
              </>
            ) : (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>Showing all <strong className="text-primary">{totalItems}</strong> users</>
                ) : (
                  <>
                    Showing <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> of <strong className="text-primary">{totalItems}</strong> users (Page <strong className="text-primary">{currentPage}/{totalPages}</strong>)
                  </>
                )}
              </>
            )}
          </div>

          <div className="pagination-controls">
            {/* Page Size Selector */}
            <div className="page-size-selector">
              <span className="text-xs text-muted">{lang === 'th' ? 'จำนวนต่อหน้า:' : 'Per page:'}</span>
              <select
                className="form-control text-xs font-bold py-1 px-2"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={15}>15 บัญชี</option>
                <option value={25}>25 บัญชี</option>
                <option value={50}>50 บัญชี</option>
                <option value={100}>100 บัญชี</option>
                <option value="ALL">{lang === 'th' ? `ทั้งหมด (${totalItems} บัญชี)` : `All (${totalItems})`}</option>
              </select>
            </div>

            {/* Page Navigation Buttons */}
            {pageSize !== 'ALL' && totalPages > 1 && (
              <div className="pagination-btns">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="page-number-badges">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Quick Scroll Controls */}
      <div className="floating-scroll-actions">
        {showScrollTop && (
          <button
            className="btn-floating-scroll"
            onClick={scrollToTop}
            title={lang === 'th' ? 'เลื่อนขึ้นบนสุด (Scroll to Top)' : 'Scroll to Top'}
          >
            <ArrowUp size={20} />
          </button>
        )}
        <button
          className="btn-floating-scroll"
          onClick={scrollToBottom}
          title={lang === 'th' ? 'เลื่อนลงล่างสุด (Scroll to Bottom)' : 'Scroll to Bottom'}
        >
          <ArrowDown size={20} />
        </button>
      </div>

      {/* DEDICATED ADMIN PASSWORD RESET / CHANGE MODAL */}
      {isPasswordModalOpen && targetUser && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center gap-2">
                <KeyRound color="#4f46e5" size={22} />
                <h2 className="font-extrabold text-base">
                  {lang === 'th' ? 'ตั้งรหัสผ่านใหม่ให้ผู้ใช้ (Admin Password Reset)' : 'Reset User Password'}
                </h2>
              </div>
              <button className="close-btn" onClick={() => setIsPasswordModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit}>
              <div className="modal-body">
                {feedbackMsg && (
                  <div className="alert-box alert-success mb-3">
                    <CheckCircle2 size={18} />
                    <span>{feedbackMsg}</span>
                  </div>
                )}

                {errorMsg && (
                  <div className="alert-box alert-danger mb-3">
                    <AlertCircle size={18} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Target User Info Header */}
                <div
                  className="p-3 rounded-lg mb-4"
                  style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)' }}
                >
                  <div style={{ flex: 1 }}>
                    <div className="flex-center gap-2">
                      <span className="font-extrabold text-primary text-base">{targetUser.name}</span>
                      {targetUser.employeeCode && (
                        <span className="badge badge-primary font-mono text-xxs font-bold">{targetUser.employeeCode}</span>
                      )}
                      <span className={`badge ${getRoleBadgeClass(targetUser.role)} text-xxs`}>
                        {getRoleLabel(targetUser.role)}
                      </span>
                    </div>
                    <div className="text-xs text-muted mt-1">
                      🏢 {targetUser.company || 'EXION (THAILAND) COMPANY LIMITED'} {targetUser.department ? `• 📁 ${targetUser.department}` : ''} {targetUser.position ? `• 💼 ${targetUser.position}` : ''}
                    </div>
                    <div className="text-xs font-mono text-muted mt-0.5">
                      Username: <strong>@{targetUser.username}</strong> | รหัสผ่านปัจจุบัน: <strong className="text-primary">{targetUser.password}</strong>
                    </div>
                  </div>
                </div>

                {/* New Password Input */}
                <div className="form-group mb-3">
                  <label className="form-label font-bold text-xs">
                    🔑 {lang === 'th' ? 'ระบุรหัสผ่านใหม่ (New Password / PIN 4 หลัก) *' : 'New Password *'}
                  </label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control font-mono font-bold text-center"
                      style={{ fontSize: '1.25rem', letterSpacing: '3px', paddingRight: '45px' }}
                      placeholder="เช่น 1234 หรือ PIN ใหม่"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      className="btn-icon-sm"
                      style={{ position: 'absolute', right: '10px' }}
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      <Eye size={18} color={showPassword ? '#4f46e5' : '#94a3b8'} />
                    </button>
                  </div>
                </div>

                {/* Preset Shortcuts */}
                <div className="flex-center gap-2 mb-4">
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs font-bold"
                    onClick={() => {
                      setNewPassword('1234');
                      setForceMustChange(true);
                    }}
                  >
                    <RefreshCw size={13} /> {lang === 'th' ? 'รีเซ็ตเป็นรหัสเริ่มต้น (1234)' : 'Reset to 1234'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-xs"
                    onClick={() => {
                      const randomPin = String(Math.floor(1000 + Math.random() * 9000));
                      setNewPassword(randomPin);
                      setForceMustChange(false);
                    }}
                  >
                    <Sparkles size={13} color="#f59e0b" /> {lang === 'th' ? 'สุ่ม PIN 4 หลัก' : 'Random PIN'}
                  </button>
                </div>

                {/* Force change checkbox */}
                <div className="card p-3" style={{ background: 'var(--bg-main)', border: '1px dashed var(--border-color)' }}>
                  <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                    <input
                      type="checkbox"
                      checked={forceMustChange}
                      onChange={(e) => setForceMustChange(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>
                      {lang === 'th'
                        ? '⚠️ บังคับให้ผู้ใช้งานเปลี่ยนรหัสผ่านใหม่อีกครั้งเมื่อ Login เข้าสู่ระบบ'
                        : 'Force user to change password on next login'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary font-bold">
                  <Check size={18} />
                  {lang === 'th' ? 'บันทึกรหัสผ่านใหม่' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE / EDIT USER MODAL WITH INDIVIDUAL PHOTO UPLOADER */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? (lang === 'th' ? `แก้ไขข้อมูล: ${editingUser.name}` : 'Edit User') : (lang === 'th' ? 'สร้างผู้ใช้งานระบบใหม่' : 'Create System User')}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body form-grid">
                {/* Full Name */}
                <div className="form-group col-span-2">
                  <label className="form-label">{lang === 'th' ? 'ชื่อ - นามสกุล *' : 'Full Name *'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น สมชาย ใจดี"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                {/* Email for Requisition Notifications */}
                <div className="form-group col-span-2">
                  <label className="form-label flex-between">
                    <span className="font-bold text-primary flex-center gap-1">
                      <Mail size={14} color="#4f46e5" />
                      <span>{lang === 'th' ? 'อีเมลสำหรับรับแจ้งเตือน (Email Notification) *' : 'Email Address'}</span>
                    </span>
                    <span className="text-xxs text-muted font-normal">ระบบจะส่งเมลแจ้งเตือนการเบิกของไปที่เมลนี้</span>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ borderColor: '#818cf8', background: '#f8fafc' }}
                    placeholder="เช่น employee@pdflowtech.com หรือ user@gmail.com"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                {/* Username */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ชื่อผู้ใช้ (Username) *' : 'Username *'}</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="เช่น somchai"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>

                {/* Employee Code */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'รหัสพนักงาน (EMP Code)' : 'Employee Code'}</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder="เช่น EMP-1001"
                    value={formData.employeeCode}
                    onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value })}
                  />
                </div>

                {/* Password */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'รหัสผ่าน (Password) *' : 'Password *'}</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                {/* Role */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'สิทธิ์การใช้งาน (Role) *' : 'Role *'}</label>
                  <select
                    className="form-control"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="admin">🛡️ ผู้ดูแลระบบ (Admin)</option>
                    <option value="staff">📦 พนักงานคลังสินค้า (Staff)</option>
                    <option value="user">👤 พนักงานทั่วไป (User - เบิกอุปกรณ์)</option>
                    <option value="viewer">👁️ ผู้เข้าชม/ดูประวัติ (Viewer)</option>
                  </select>
                </div>

                {/* Department */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'แผนก / ฝ่าย' : 'Department'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น แผนก IT / บัญชี"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                {/* Position */}
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ตำแหน่งงาน' : 'Position'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น Senior Engineer"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary font-bold">
                  {editingUser ? (lang === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes') : (lang === 'th' ? 'สร้างผู้ใช้' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
