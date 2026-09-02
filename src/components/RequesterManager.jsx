import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import {
  Users,
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Upload,
  Download,
  ShieldCheck,
  Building,
  Building2,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  KeyRound,
  Key,
  Eye,
  RefreshCw,
  Sparkles,
  Check,
  IdCard,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';

export const RequesterManager = () => {
  const {
    requestersList,
    usersList,
    addRequester,
    deleteRequester,
    updateRequester,
    batchImportRequesters,
    adminResetUserPassword,
    user,
    lang,
  } = useStock();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Floating Scroll helper state
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

  // Add / Edit Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequester, setEditingRequester] = useState(null);
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [company, setCompany] = useState('EXION (THAILAND) COMPANY LIMITED');
  const [department, setDepartment] = useState('');
  const [position, setPosition] = useState('');

  // Password Reset Modal states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetRequester, setTargetRequester] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [forceMustChange, setForceMustChange] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="card text-center py-8">
        <ShieldCheck color="#ef4444" size={48} className="mx-auto mb-2" />
        <h2 className="text-lg font-bold text-red">
          {lang === 'th' ? 'จำกัดสิทธิ์เฉพาะ Admin เท่านั้น' : 'Access Restricted to Admin Only'}
        </h2>
        <p className="text-sm text-muted">
          {lang === 'th'
            ? 'เมนูดูกิจกรรมและรายชื่อผู้เบิกสงวนสิทธิ์เฉพาะผู้ดูแลระบบ'
            : 'Only system administrators can access the Requesters Directory.'}
        </p>
      </div>
    );
  }

  // Find linked user for a requester
  const getLinkedUser = (req) => {
    if (!req) return null;
    return usersList.find((u) => {
      if (req.employeeCode && u.employeeCode && req.employeeCode === u.employeeCode) return true;
      if (req.employeeCode && u.username && req.employeeCode === u.username) return true;
      if (req.name && u.name && req.name.trim().toLowerCase() === u.name.trim().toLowerCase()) return true;
      return false;
    });
  };

  const REMOVED_COMPANIES = ['c.s.i', 'csi', 'osa', 'tri-gen', 'trigen'];

  // Get unique companies & departments for filters
  const companies = Array.from(
    new Set([
      'EXION (Thailand) Company Limited',
      'HOUSE OF PROFESSIONALS COMPANY LIMITED',
      'PD FLOWTECH COMPANY LIMITED',
      ...requestersList
        .map((r) => r.company)
        .filter(Boolean)
        .filter((comp) => !REMOVED_COMPANIES.some((removed) => comp.toLowerCase().includes(removed))),
    ])
  );
  const departments = Array.from(new Set(requestersList.map((r) => r.department).filter(Boolean)));

  // Filtered requesters list
  const filteredRequesters = requestersList.filter((r) => {
    const matchSearch =
      !searchQuery ||
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.employeeCode && r.employeeCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.company && r.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.department && r.department.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.position && r.position.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCompany = selectedCompany === 'ALL' || r.company === selectedCompany;
    const matchDept = selectedDept === 'ALL' || r.department === selectedDept;

    return matchSearch && matchCompany && matchDept;
  });

  // Pagination calculations
  const totalItems = filteredRequesters.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalItems / Number(pageSize)));
  const paginatedRequesters = pageSize === 'ALL'
    ? filteredRequesters
    : filteredRequesters.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const handleOpenAdd = () => {
    setEditingRequester(null);
    setName('');
    setEmployeeCode(`EMP-${1000 + requestersList.length + 1}`);
    setCompany('EXION (THAILAND) COMPANY LIMITED');
    setDepartment('');
    setPosition('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (req) => {
    setEditingRequester(req);
    setName(req.name || '');
    setEmployeeCode(req.employeeCode || '');
    setCompany(req.company || 'EXION (THAILAND) COMPANY LIMITED');
    setDepartment(req.department || '');
    setPosition(req.position || '');
    setIsModalOpen(true);
  };

  const handleSubmitRequester = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const autoCode = employeeCode.trim() || `EMP-${1000 + requestersList.length + 1}`;

    if (editingRequester) {
      updateRequester(editingRequester.id, {
        name: name.trim(),
        employeeCode: autoCode,
        company: company.trim() || 'EXION (THAILAND) COMPANY LIMITED',
        department: department.trim(),
        position: position.trim(),
      });
    } else {
      addRequester({
        name: name.trim(),
        employeeCode: autoCode,
        company: company.trim() || 'EXION (THAILAND) COMPANY LIMITED',
        department: department.trim(),
        position: position.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteRequester = (req) => {
    const confirmDelete = window.confirm(
      lang === 'th'
        ? `⚠️ ยืนยันการลบรายชื่อผู้เบิก "${req.name}" [${req.employeeCode || '-'}] ออกจากระบบหรือไม่?`
        : `⚠️ Confirm deleting requester "${req.name}"?`
    );

    if (confirmDelete) {
      deleteRequester(req.id);
    }
  };

  const handleOpenPasswordModal = (req) => {
    const linkedUser = getLinkedUser(req);
    setTargetRequester(req);
    setNewPassword(linkedUser?.password || '1234');
    setForceMustChange(Boolean(linkedUser?.mustChangePassword));
    setShowPassword(true);
    setFeedbackMsg('');
    setErrorMsg('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordResetSubmit = (e) => {
    e.preventDefault();
    if (!targetRequester || !newPassword.trim()) return;

    const linkedUser = getLinkedUser(targetRequester);

    try {
      if (linkedUser) {
        adminResetUserPassword(linkedUser.id, newPassword.trim(), forceMustChange);
      } else {
        // If user record wasn't created yet, create or update
        addRequester({
          name: targetRequester.name,
          employeeCode: targetRequester.employeeCode,
          company: targetRequester.company,
          department: targetRequester.department,
          position: targetRequester.position,
        });
      }

      setFeedbackMsg(
        lang === 'th'
          ? `🎉 เปลี่ยนรหัสผ่านของ "${targetRequester.name}" เป็น "${newPassword.trim()}" สำเร็จ!`
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

  const handleDownloadTemplate = () => {
    const headers = ['employeeCode', 'name', 'company', 'department', 'position'];
    const sample1 = ['EMP-1001', 'Somchai Mankhong', 'EXION (THAILAND) COMPANY LIMITED', 'แผนก IT / เทคโนโลยีสารสนเทศ', 'Senior System Engineer'];
    const sample2 = ['EMP-1006', 'Somchai Mankhong', 'EXION (THAILAND) COMPANY LIMITED', 'ฝ่ายผลิตและปฏิบัติการ', 'Production Lead'];

    const csvContent = '\uFEFF' + [headers.join(','), sample1.join(','), sample2.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'requesters_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const lines = text.split('\n').filter((line) => line.trim());
        const requesters = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols[0] || cols[1]) {
            requesters.push({
              employeeCode: cols[0] || `EMP-${1000 + i}`,
              name: cols[1] || cols[0],
              company: cols[2] || 'EXION (THAILAND) COMPANY LIMITED',
              department: cols[3] || '',
              position: cols[4] || '',
            });
          }
        }

        if (requesters.length > 0) {
          batchImportRequesters(requesters);
          alert(lang === 'th' ? `นำเข้ารายชื่อผู้เบิกสำเร็จ ${requesters.length} รายการ!` : `Imported ${requesters.length} requesters!`);
        }
      } catch (err) {
        alert('CSV Import error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="requester-manager-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <UserCheck color="#2563eb" />
            {lang === 'th' ? 'จัดการรายชื่อผู้เบิก (Requesters Management)' : 'Requesters Directory'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `ผู้ดูแลระบบ (Admin) สามารถแก้ไขข้อมูล, เปลี่ยน/รีเซ็ตรหัสผ่าน, และจัดการรายชื่อผู้เบิกทั้งหมด ${requestersList.length} รายชื่อ`
              : `Manage directory of ${requestersList.length} requesters`}
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleDownloadTemplate}>
            <Download size={16} />
            <span>{lang === 'th' ? 'โหลดตัวอย่าง CSV' : 'CSV Template'}</span>
          </button>
          <label className="btn btn-secondary cursor-pointer">
            <Upload size={16} />
            <span>{lang === 'th' ? 'นำเข้าจาก CSV' : 'Import CSV'}</span>
            <input
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleCSVUpload}
            />
          </label>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            <span>{lang === 'th' ? 'เพิ่มผู้เบิกใหม่' : 'Add Requester'}</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filters */}
      <div className="card toolbar-card mb-4">
        <div className="toolbar-left">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={lang === 'th' ? 'ค้นหาตามรหัสพนักงาน, ชื่อผู้เบิก, บริษัท, แผนก หรือ ตำแหน่ง...' : 'Search by EMP code, name, company, department...'}
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
        </div>
      </div>

      {/* Requesters Data Table with Full Actions Column */}
      <div className="table-responsive">
        <table className="data-table requester-table sticky-table-header">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th style={{ width: '105px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'รหัสพนักงาน' : 'EMP Code'}</th>
              <th style={{ minWidth: '140px' }}>{lang === 'th' ? 'ชื่อผู้เบิก (ชื่อจริง)' : 'Requester Name'}</th>
              <th style={{ width: '120px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'บริษัท' : 'Company'}</th>
              <th style={{ width: '130px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'แผนก / ฝ่าย' : 'Department'}</th>
              <th style={{ minWidth: '120px' }}>{lang === 'th' ? 'ตำแหน่งงาน' : 'Position'}</th>
              <th style={{ width: '180px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'รหัสผ่าน & สถานะ Login' : 'Password & Login'}</th>
              <th style={{ width: '115px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                {lang === 'th' ? 'จัดการ' : 'Actions'}
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedRequesters.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  {lang === 'th' ? 'ไม่พบรายชื่อผู้เบิก' : 'No requesters found'}
                </td>
              </tr>
            ) : (
              paginatedRequesters.map((req, idx) => {
                const itemIndex = pageSize === 'ALL' ? idx + 1 : (currentPage - 1) * Number(pageSize) + idx + 1;
                const linkedUser = getLinkedUser(req);
                const currentPwd = linkedUser?.password || '1234';
                const isMustChange = linkedUser?.mustChangePassword ?? true;

                return (
                  <tr key={req.id}>
                    <td className="text-muted text-xs text-center">{itemIndex}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-info font-mono font-bold">
                        {req.employeeCode || `EMP-${1000 + itemIndex}`}
                      </span>
                    </td>
                    <td>
                      <div className="font-semibold text-primary">{req.name}</div>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-primary">
                        <Building size={12} className="inline-icon" /> {req.company || 'EXION (THAILAND) COMPANY LIMITED'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-info">{req.department || '-'}</span>
                    </td>
                    <td className="text-sm">{req.position || '-'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div className="flex-center gap-1.5 text-xs">
                        <Key size={13} color="#4f46e5" />
                        <span className="font-mono font-bold text-primary" style={{ letterSpacing: '1px' }}>
                          {currentPwd}
                        </span>
                        {isMustChange ? (
                          <span className="badge badge-warning text-xxs font-bold" title="รหัสเริ่มต้น รอเปลี่ยนเมื่อ Login">
                            ⚠️ รอเปลี่ยน PIN
                          </span>
                        ) : (
                          <span className="badge badge-success text-xxs font-bold" title="ตั้งรหัสผ่านเรียบร้อย">
                            🟢 ตั้งรหัสแล้ว
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                      <div className="flex-center gap-1 justify-center" style={{ display: 'inline-flex' }}>
                        {/* 1. Reset / Change Password Button */}
                        <button
                          className="btn-action-sm"
                          style={{ color: '#4f46e5', background: 'rgba(99, 102, 241, 0.12)' }}
                          title={lang === 'th' ? '🔑 เปลี่ยน / รีเซ็ตรหัสผ่าน' : 'Reset / Change Password'}
                          onClick={() => handleOpenPasswordModal(req)}
                        >
                          <KeyRound size={14} />
                        </button>

                        {/* 2. Edit Requester Button */}
                        <button
                          className="btn-action-sm"
                          title={lang === 'th' ? `แก้ไขข้อมูล "${req.name}"` : `Edit ${req.name}`}
                          onClick={() => handleOpenEdit(req)}
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* 3. Delete Requester Button */}
                        <button
                          className="btn-action-sm danger"
                          title={lang === 'th' ? `ลบรายชื่อ "${req.name}"` : `Delete ${req.name}`}
                          onClick={() => handleDeleteRequester(req)}
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

      {/* Pagination Bar */}
      {filteredRequesters.length > 0 && (
        <div className="pagination-bar card p-3 mt-4">
          <div className="pagination-info text-xs text-muted">
            {lang === 'th' ? (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>แสดงทั้งหมด <strong className="text-primary">{totalItems}</strong> รายชื่อ (จากทั้งหมด {requestersList.length} รายชื่อ)</>
                ) : (
                  <>
                    แสดงรายชื่อที่ <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> จากทั้งหมด <strong className="text-primary">{totalItems}</strong> รายชื่อ (หน้า <strong className="text-primary">{currentPage}/{totalPages}</strong>)
                  </>
                )}
              </>
            ) : (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>Showing all <strong className="text-primary">{totalItems}</strong> requesters</>
                ) : (
                  <>
                    Showing <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> of <strong className="text-primary">{totalItems}</strong> requesters (Page <strong className="text-primary">{currentPage}/{totalPages}</strong>)
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
                <option value={15}>15 รายชื่อ</option>
                <option value={25}>25 รายชื่อ</option>
                <option value={50}>50 รายชื่อ</option>
                <option value={100}>100 รายชื่อ</option>
                <option value="ALL">{lang === 'th' ? `ทั้งหมด (${totalItems} รายชื่อ)` : `All (${totalItems})`}</option>
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

      {/* ADMIN PASSWORD RESET MODAL */}
      {isPasswordModalOpen && targetRequester && (
        <div className="modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex-center gap-2">
                <KeyRound color="#4f46e5" size={22} />
                <h2 className="font-extrabold text-base">
                  {lang === 'th' ? 'ตั้งรหัสผ่านใหม่ให้ผู้เบิก (Admin Password Reset)' : 'Reset Requester Password'}
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

                {/* Target Requester Info Header */}
                <div
                  className="flex-center gap-3 p-3 rounded-lg mb-4"
                  style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)' }}
                >
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5, #ec4899)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 'bold',
                      fontSize: '1.1rem',
                    }}
                  >
                    {targetRequester.name.charAt(0)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="flex-center gap-2">
                      <span className="font-extrabold text-primary text-base">{targetRequester.name}</span>
                      {targetRequester.employeeCode && (
                        <span className="badge badge-primary font-mono text-xxs font-bold">
                          {targetRequester.employeeCode}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted mt-1">
                      🏢 {targetRequester.company || 'EXION (THAILAND) COMPANY LIMITED'} {targetRequester.department ? `• 📁 ${targetRequester.department}` : ''} {targetRequester.position ? `• 💼 ${targetRequester.position}` : ''}
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

      {/* ADD / EDIT REQUESTER MODAL */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <UserCheck color="#2563eb" size={24} />
                <h2>
                  {editingRequester
                    ? lang === 'th'
                      ? 'แก้ไขข้อมูลผู้เบิก'
                      : 'Edit Requester'
                    : lang === 'th'
                    ? 'เพิ่มรายชื่อผู้เบิกใหม่'
                    : 'Add New Requester'}
                </h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequester}>
              <div className="modal-body">
                <div className="form-group mb-3">
                  <label className="form-label">{lang === 'th' ? 'รหัสพนักงาน (Employee Code)' : 'Employee Code'}</label>
                  <input
                    type="text"
                    className="form-control font-mono"
                    placeholder={`เช่น EMP-${1000 + requestersList.length + 1}`}
                    value={employeeCode}
                    onChange={(e) => setEmployeeCode(e.target.value)}
                  />
                  <small className="text-xs text-muted">
                    {lang === 'th' ? 'รหัสพนักงานสำหรับใช้ระบุตัวตนและ Login (ช่วยแยกกรณีชื่อซ้ำ)' : 'Unique identifier for login'}
                  </small>
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">{lang === 'th' ? 'ชื่อผู้เบิก (เฉพาะชื่อจริง ไม่เอานามสกุล) *' : 'Requester First Name *'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === 'th' ? 'เช่น Somchai, Kittipong' : 'e.g. Somchai, Kittipong'}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">{lang === 'th' ? 'สังกัดบริษัท *' : 'Company *'}</label>
                  <input
                    type="text"
                    className="form-control font-bold"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">{lang === 'th' ? 'แผนก / ฝ่าย *' : 'Department *'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === 'th' ? 'เช่น แผนก IT / เทคโนโลยีสารสนเทศ' : 'e.g. IT Department'}
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group mb-3">
                  <label className="form-label">{lang === 'th' ? 'ตำแหน่งงาน' : 'Position'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={lang === 'th' ? 'เช่น Senior Software Engineer' : 'e.g. Senior Software Engineer'}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary font-bold">
                  <CheckCircle2 size={16} />
                  {editingRequester
                    ? lang === 'th'
                      ? 'บันทึกการแก้ไข'
                      : 'Save Changes'
                    : lang === 'th'
                    ? 'บันทึกรายชื่อผู้เบิก'
                    : 'Save Requester'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
