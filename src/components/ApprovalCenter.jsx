import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  Package,
  UserCheck,
  Building,
  Printer,
  X,
  AlertCircle,
  Check,
  Send,
  Sparkles,
  FileText,
  Trash2,
  Calendar,
  Zap,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  CalendarDays,
} from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';
import { RequisitionSlipModal } from './RequisitionSlipModal';

const THAI_MONTHS_SHORT = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const THAI_MONTHS_FULL = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const ENG_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const ENG_MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const ApprovalCenter = () => {
  const {
    requests = [],
    products = [],
    usersList = [],
    requestersList = [],
    approveRequisitionRequest,
    markRequestReadyForPickup,
    completeRequisitionHandover,
    rejectRequisitionRequest,
    deleteRequisitionRequest,
    lang,
    user,
  } = useStock();

  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'READY_FOR_PICKUP' | 'ADVANCE' | 'COMPLETED' | 'REJECTED'
  
  // Smart Month/Year Filter State
  const [selectedMonth, setSelectedMonth] = useState('ALL'); // 'ALL' | 'YYYY-MM' (e.g. '2026-09')
  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  // Rejection Modal State
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Print Slip Modal State
  const [printSlipReq, setPrintSlipReq] = useState(null);

  // Approval Note Modal State
  const [approveModalReq, setApproveModalReq] = useState(null);
  const [approveNote, setApproveNote] = useState('');

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Compute how many requests exist per month in the currently viewed year
  const yearMonthCounts = useMemo(() => {
    const counts = {};
    requests.forEach((req) => {
      const dateStr = req.createdAt || req.date || req.timestamp;
      if (dateStr) {
        const d = new Date(dateStr);
        if (!isNaN(d) && d.getFullYear() === viewYear) {
          const m = d.getMonth() + 1;
          counts[m] = (counts[m] || 0) + 1;
        }
      }
    });
    return counts;
  }, [requests, viewYear]);

  // Stepper Functions (‹ Month ›)
  const handlePrevMonth = () => {
    const now = new Date();
    let y = viewYear;
    let m = now.getMonth() + 1;

    if (selectedMonth !== 'ALL') {
      const parts = selectedMonth.split('-');
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }

    m -= 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    const newYm = `${y}-${String(m).padStart(2, '0')}`;
    setSelectedMonth(newYm);
    setViewYear(y);
  };

  const handleNextMonth = () => {
    const now = new Date();
    let y = viewYear;
    let m = now.getMonth() + 1;

    if (selectedMonth !== 'ALL') {
      const parts = selectedMonth.split('-');
      y = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }

    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
    const newYm = `${y}-${String(m).padStart(2, '0')}`;
    setSelectedMonth(newYm);
    setViewYear(y);
  };

  // Label to show on the stepper button
  const currentMonthLabel = useMemo(() => {
    if (selectedMonth === 'ALL') {
      return lang === 'th' ? 'ทุกช่วงเวลา (All Time)' : 'All Time';
    }
    const [yStr, mStr] = selectedMonth.split('-');
    const yearNum = parseInt(yStr, 10);
    const monthNum = parseInt(mStr, 10);
    const thaiYear = yearNum + 543;
    if (lang === 'th') {
      return `${THAI_MONTHS_FULL[monthNum - 1]} ${thaiYear}`;
    }
    return `${ENG_MONTHS_FULL[monthNum - 1]} ${yearNum}`;
  }, [selectedMonth, lang]);

  // Requests filtered by Month first
  const monthFilteredRequests = useMemo(() => {
    if (selectedMonth === 'ALL') return requests;
    return requests.filter((req) => {
      const dateStr = req.createdAt || req.date || req.timestamp;
      if (!dateStr) return false;
      const d = new Date(dateStr);
      if (isNaN(d)) return false;
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return ym === selectedMonth;
    });
  }, [requests, selectedMonth]);

  // Filter Requests by Search, Month and Status
  const filteredRequests = monthFilteredRequests.filter((req) => {
    const matchSearch =
      !searchQuery ||
      req.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.requesterDept && req.requesterDept.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.requesterCompany && req.requesterCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchStatus = true;
    if (statusFilter === 'ADVANCE') {
      matchStatus = !!req.isAdvance;
    } else if (statusFilter !== 'ALL') {
      matchStatus = req.status === statusFilter;
    }

    return matchSearch && matchStatus;
  });

  const pendingCount = monthFilteredRequests.filter((r) => r.status === 'PENDING').length;
  const preparingCount = monthFilteredRequests.filter((r) => r.status === 'APPROVED').length;
  const readyCount = monthFilteredRequests.filter((r) => r.status === 'READY_FOR_PICKUP').length;
  const advanceCount = monthFilteredRequests.filter((r) => !!r.isAdvance).length;
  const completedCount = monthFilteredRequests.filter((r) => r.status === 'COMPLETED').length;
  const rejectedCount = monthFilteredRequests.filter((r) => r.status === 'REJECTED').length;

  const handleConfirmApprove = async () => {
    if (!approveModalReq) return;
    setActionError('');
    setActionSuccess('');

    try {
      await approveRequisitionRequest(approveModalReq.id, approveNote);
      setActionSuccess(lang === 'th' ? `อนุมัติคำขอ ${approveModalReq.refNo} และเริ่มการจัดเตรียมพัสดุเรียบร้อย!` : `Approved ${approveModalReq.refNo}`);
      setApproveModalReq(null);
      setApproveNote('');
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleMarkReady = (req) => {
    setActionError('');
    setActionSuccess('');
    try {
      markRequestReadyForPickup(req.id);
      setActionSuccess(lang === 'th' ? `🎉 จัดเตรียมพัสดุ ${req.refNo} เสร็จสิ้น • ระบบส่งแจ้งเตือนให้คุณ ${req.requesterName} มารับของแล้ว!` : `Ready for pickup: ${req.refNo}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleCompleteHandover = (req) => {
    setActionError('');
    setActionSuccess('');
    try {
      completeRequisitionHandover(req.id);
      setActionSuccess(lang === 'th' ? `✅ ส่งมอบพัสดุ ${req.refNo} ให้คุณ ${req.requesterName} เรียบร้อยแล้ว!` : `Handover completed: ${req.refNo}`);
      setTimeout(() => setActionSuccess(''), 4000);
    } catch (err) {
      setActionError(err.message);
    }
  };

  const handleConfirmReject = () => {
    if (!rejectModalReq) return;
    setActionError('');
    setActionSuccess('');

    try {
      rejectRequisitionRequest(rejectModalReq.id, rejectReason);
      setActionSuccess(lang === 'th' ? `ปฏิเสธคำขอ ${rejectModalReq.refNo} เรียบร้อยแล้ว` : `Rejected ${rejectModalReq.refNo}`);
      setRejectModalReq(null);
      setRejectReason('');
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="approval-center-page">
      <div className="no-print">
        {/* Page Header */}
        <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardList color="#4f46e5" />
            {lang === 'th' ? 'ศูนย์อนุมัติคำขอเบิกอุปกรณ์สำนักงาน' : 'Requisition Approval Center'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? 'ตรวจสอบใบคำขอเบิกจากพนักงาน อนุมัติเพื่อตัดจ่ายสต็อก หรือปฏิเสธคำขอพร้อมระบุเหตุผล'
              : 'Review and approve employee requisition requests and dispatch inventory'}
          </p>
        </div>
      </div>

      {/* Alert Messages */}
      {actionSuccess && (
        <div className="alert-box alert-success mb-4">
          <CheckCircle2 size={20} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="alert-box alert-danger mb-4">
          <AlertCircle size={20} />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Status Summary Cards */}
      <div className="approval-kpi-grid mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className={`card kpi-pill-card ${statusFilter === 'PENDING' ? 'active-border-amber' : ''}`} onClick={() => setStatusFilter('PENDING')}>
          <div className="kpi-pill-icon bg-amber">
            <Clock size={22} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🟡 รอการอนุมัติ' : 'Pending'}</div>
            <div className="kpi-pill-value text-amber">{pendingCount} <span className="text-xs text-muted">{lang === 'th' ? 'คำขอ' : 'reqs'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'APPROVED' ? 'active-border-indigo' : ''}`} onClick={() => setStatusFilter('APPROVED')}>
          <div className="kpi-pill-icon bg-indigo">
            <Package size={22} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🔵 กำลังจัดของ' : 'Preparing'}</div>
            <div className="kpi-pill-value text-primary">{preparingCount} <span className="text-xs text-muted">{lang === 'th' ? 'คำขอ' : 'reqs'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'READY_FOR_PICKUP' ? 'active-border-emerald' : ''}`} onClick={() => setStatusFilter('READY_FOR_PICKUP')}>
          <div className="kpi-pill-icon bg-emerald">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🟢 พร้อมรับของ' : 'Ready'}</div>
            <div className="kpi-pill-value text-green">{readyCount} <span className="text-xs text-muted">{lang === 'th' ? 'คำขอ' : 'reqs'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'ADVANCE' ? 'active-border-blue' : ''}`} onClick={() => setStatusFilter('ADVANCE')}>
          <div className="kpi-pill-icon" style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            <Calendar size={22} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '📅 เบิกล่วงหน้า' : 'Advance'}</div>
            <div className="kpi-pill-value" style={{ color: '#1d4ed8' }}>{advanceCount} <span className="text-xs text-muted">{lang === 'th' ? 'คำขอ' : 'reqs'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'COMPLETED' ? 'active-border-indigo' : ''}`} onClick={() => setStatusFilter('COMPLETED')}>
          <div className="kpi-pill-icon" style={{ background: '#f3e8ff', color: '#7e22ce' }}>
            <Check size={22} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🟣 ส่งมอบแล้ว' : 'Handed Over'}</div>
            <div className="kpi-pill-value" style={{ color: '#7e22ce' }}>{completedCount} <span className="text-xs text-muted">{lang === 'th' ? 'คำขอ' : 'reqs'}</span></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="toolbar-card card mb-6" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        <div className="toolbar-top-filters" style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-wrap flex-1" style={{ position: 'relative', minWidth: '240px', display: 'flex', alignItems: 'center' }}>
            <Search size={18} className="search-icon" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 2 }} />
            <input
              type="text"
              className="form-control with-icon"
              placeholder={lang === 'th' ? 'ค้นหาตามเลขที่คำขอ (REQ-...), ชื่อผู้ขอเบิก, แผนก, หรือชื่ออุปกรณ์...' : 'Search by Ref No, Requester, Department, or Asset...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ height: '42px', paddingLeft: '2.6rem', width: '100%', borderRadius: 'var(--radius-sm)' }}
            />
          </div>

          {/* Smart Month & Year Filter with Stepper & Matrix Popover */}
          <div className="smart-month-filter-wrap" ref={pickerRef} style={{ position: 'relative' }}>
            <div className="month-stepper-control" style={{ display: 'inline-flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '42px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <button
                type="button"
                className="stepper-arrow-btn"
                onClick={handlePrevMonth}
                title={lang === 'th' ? 'เดือนก่อนหน้า' : 'Previous Month'}
                style={{ height: '100%', padding: '0 10px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              >
                <ChevronLeft size={17} />
              </button>

              <button
                type="button"
                className={`stepper-label-btn ${selectedMonth !== 'ALL' ? 'active' : ''}`}
                onClick={() => setIsPickerOpen(!isPickerOpen)}
                style={{
                  height: '100%',
                  padding: '0 14px',
                  border: 'none',
                  borderLeft: '1px solid var(--border-light)',
                  borderRight: '1px solid var(--border-light)',
                  background: selectedMonth !== 'ALL' ? '#eef2ff' : 'transparent',
                  color: selectedMonth !== 'ALL' ? '#4f46e5' : 'var(--text-primary)',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <Calendar size={16} color={selectedMonth !== 'ALL' ? '#4f46e5' : '#64748b'} />
                <span>{currentMonthLabel}</span>
                <ChevronDown size={14} style={{ transform: isPickerOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </button>

              <button
                type="button"
                className="stepper-arrow-btn"
                onClick={handleNextMonth}
                title={lang === 'th' ? 'เดือนถัดไป' : 'Next Month'}
                style={{ height: '100%', padding: '0 10px', border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.15s' }}
              >
                <ChevronRight size={17} />
              </button>
            </div>

            {/* Smart Matrix Popover */}
            {isPickerOpen && (
              <div
                className="smart-month-popover"
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                  zIndex: 100,
                  padding: '1rem',
                  animation: 'fadeIn 0.15s ease-out',
                }}
              >
                {/* Popover Year Navigation Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <button
                    type="button"
                    onClick={() => setViewYear((prev) => prev - 1)}
                    className="btn-icon-sm"
                    title="ปีก่อนหน้า"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {lang === 'th' ? `ปี พ.ศ. ${viewYear + 543}` : `Year ${viewYear}`}
                  </div>

                  <button
                    type="button"
                    onClick={() => setViewYear((prev) => prev + 1)}
                    className="btn-icon-sm"
                    title="ปีถัดไป"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>

                {/* 12 Month Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.45rem', marginBottom: '0.85rem' }}>
                  {THAI_MONTHS_SHORT.map((mShort, idx) => {
                    const mNum = idx + 1;
                    const ymKey = `${viewYear}-${String(mNum).padStart(2, '0')}`;
                    const isSelected = selectedMonth === ymKey;
                    const reqCount = yearMonthCounts[mNum] || 0;
                    const label = lang === 'th' ? mShort : ENG_MONTHS_SHORT[idx];

                    return (
                      <button
                        key={ymKey}
                        type="button"
                        onClick={() => {
                          setSelectedMonth(ymKey);
                          setIsPickerOpen(false);
                        }}
                        style={{
                          padding: '0.6rem 0.2rem',
                          borderRadius: 'var(--radius-xs)',
                          border: isSelected ? '1.5px solid #4f46e5' : '1px solid var(--border-color)',
                          background: isSelected ? '#4f46e5' : reqCount > 0 ? '#f8faff' : 'var(--bg-surface)',
                          color: isSelected ? '#ffffff' : reqCount > 0 ? '#1e293b' : 'var(--text-muted)',
                          fontWeight: isSelected || reqCount > 0 ? '700' : '500',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '2px',
                          position: 'relative',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        <span>{label}</span>
                        {reqCount > 0 && (
                          <span
                            style={{
                              fontSize: '0.65rem',
                              padding: '1px 5px',
                              borderRadius: '10px',
                              background: isSelected ? '#ffffff' : '#e0e7ff',
                              color: isSelected ? '#4f46e5' : '#4338ca',
                              fontWeight: '800',
                            }}
                          >
                            {reqCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Presets Footer */}
                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'space-between' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const currentYm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
                      setSelectedMonth(currentYm);
                      setViewYear(now.getFullYear());
                      setIsPickerOpen(false);
                    }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-main)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    ⭐ {lang === 'th' ? 'เดือนปัจจุบัน' : 'This Month'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      let y = now.getFullYear();
                      let m = now.getMonth();
                      if (m < 1) {
                        m = 12;
                        y -= 1;
                      }
                      const lastYm = `${y}-${String(m).padStart(2, '0')}`;
                      setSelectedMonth(lastYm);
                      setViewYear(y);
                      setIsPickerOpen(false);
                    }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: '1px solid var(--border-color)',
                      background: 'var(--bg-main)',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                    }}
                  >
                    ⏮️ {lang === 'th' ? 'เดือนที่แล้ว' : 'Last Month'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMonth('ALL');
                      setIsPickerOpen(false);
                    }}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: 'var(--radius-xs)',
                      border: selectedMonth === 'ALL' ? '1px solid #4f46e5' : '1px solid var(--border-color)',
                      background: selectedMonth === 'ALL' ? '#eef2ff' : 'var(--bg-main)',
                      color: selectedMonth === 'ALL' ? '#4f46e5' : 'var(--text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      cursor: 'pointer',
                    }}
                  >
                    🌐 {lang === 'th' ? 'ดูทั้งหมด' : 'All Time'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="status-filter-tabs" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
          <button
            className={`status-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            {lang === 'th' ? 'ทั้งหมด' : 'All'} ({monthFilteredRequests.length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'PENDING' ? 'active active-amber' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            🟡 {lang === 'th' ? 'รออนุมัติ' : 'Pending'} ({pendingCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'APPROVED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            🔵 {lang === 'th' ? 'กำลังจัดของ' : 'Preparing'} ({preparingCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'READY_FOR_PICKUP' ? 'active active-emerald' : ''}`}
            onClick={() => setStatusFilter('READY_FOR_PICKUP')}
          >
            🟢 {lang === 'th' ? 'พร้อมรับของ' : 'Ready'} ({readyCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'ADVANCE' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ADVANCE')}
          >
            📅 {lang === 'th' ? 'เบิกล่วงหน้า' : 'Advance'} ({advanceCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'COMPLETED' ? 'active' : ''}`}
            onClick={() => setStatusFilter('COMPLETED')}
          >
            🟣 {lang === 'th' ? 'ส่งมอบแล้ว' : 'Completed'} ({completedCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'REJECTED' ? 'active active-rose' : ''}`}
            onClick={() => setStatusFilter('REJECTED')}
          >
            🔴 {lang === 'th' ? 'ไม่อนุมัติ' : 'Rejected'} ({rejectedCount})
          </button>
        </div>
      </div>

      {/* Requests Feed Cards */}
      <div className="requests-container">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12 text-muted">
            <ClipboardList size={48} color="#cbd5e1" className="mb-3" />
            <div className="font-extrabold text-base">{lang === 'th' ? 'ไม่พบรายการคำขอเบิกอุปกรณ์' : 'No requests found'}</div>
            <div className="text-xs text-muted mt-1">{lang === 'th' ? 'ไม่มีคำขอที่ตรงกับเงื่อนไขการค้นหา' : 'No items match your filter'}</div>
          </div>
        ) : (
          filteredRequests.map((req) => {
            const isPending = req.status === 'PENDING';
            const isApproved = req.status === 'APPROVED';
            const isReady = req.status === 'READY_FOR_PICKUP';
            const isCompleted = req.status === 'COMPLETED';
            const isRejected = req.status === 'REJECTED';
            const isCancelled = req.status === 'CANCELLED';

            const reqDateRaw = req.date || req.createdAt;
            const reqDateObj = reqDateRaw ? new Date(reqDateRaw) : new Date();
            const isValidDate = !isNaN(reqDateObj.getTime());
            const displayDate = isValidDate
              ? reqDateObj.toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : new Date().toLocaleDateString('th-TH', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

            const matchedUser =
              (usersList || []).find(
                (u) =>
                  (u.name && req.requesterName && u.name.trim().toLowerCase() === req.requesterName.trim().toLowerCase()) ||
                  (u.username && req.requesterName && u.username.trim().toLowerCase() === req.requesterName.trim().toLowerCase())
              ) ||
              (requestersList || []).find(
                (r) =>
                  r.name && req.requesterName && r.name.trim().toLowerCase() === req.requesterName.trim().toLowerCase()
              );

            const resolvedDept =
              req.requesterDept && req.requesterDept !== '-' && req.requesterDept.trim() !== ''
                ? req.requesterDept
                : matchedUser?.department || req.department || '';

            const resolvedCompany =
              req.requesterCompany && req.requesterCompany !== '-' && req.requesterCompany.trim() !== ''
                ? req.requesterCompany
                : matchedUser?.company || 'EXION (THAILAND) COMPANY LIMITED';

            const resolvedPosition =
              req.requesterPosition && req.requesterPosition !== '-' && req.requesterPosition.trim() !== ''
                ? req.requesterPosition
                : matchedUser?.position || '';

            return (
              <div
                key={req.id}
                className={`card request-card mb-4 ${isPending ? 'border-amber-glow' : ''}`}
                style={{
                  border: isReady ? '2px solid #10b981' : isApproved ? '2px solid #6366f1' : '1px solid var(--border-color)',
                }}
              >
                {/* Header Row */}
                <div className="request-card-header flex-between flex-wrap gap-2">
                  <div className="flex-center gap-2 flex-wrap">
                    <span className="ref-number-badge font-mono font-extrabold">{req.refNo}</span>
                    {req.isAdvance && (
                      <span className="badge badge-info text-xxs font-bold" style={{ background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                        📅 เบิกล่วงหน้า (นัดรับ: {req.scheduledDate} {req.scheduledTimeSlot ? `• ${req.scheduledTimeSlot}` : ''})
                      </span>
                    )}
                    <span
                      className={`status-pill-badge ${
                        isPending
                          ? 'pill-pending'
                          : isApproved
                          ? 'pill-approved'
                          : isReady
                          ? 'pill-approved font-extrabold'
                          : isCompleted
                          ? 'pill-approved'
                          : isCancelled
                          ? 'pill-cancelled'
                          : 'pill-rejected'
                      }`}
                      style={{
                        background: isReady ? '#d1fae5' : isApproved ? '#e0e7ff' : isCompleted ? '#ede9fe' : undefined,
                        color: isReady ? '#065f46' : isApproved ? '#3730a3' : isCompleted ? '#5b21b6' : undefined,
                      }}
                    >
                      {isPending && '🟡 รอการตรวจสอบ (Pending)'}
                      {isApproved && '🔵 อนุมัติแล้ว • กำลังจัดเตรียมพัสดุ'}
                      {isReady && '🟢 📦 พร้อมรับของแล้ว (Ready for Pickup)'}
                      {isCompleted && '🟣 ส่งมอบพัสดุสำเร็จ (Completed)'}
                      {isRejected && '🔴 ไม่อนุมัติ (Rejected)'}
                      {isCancelled && '⚪ ผู้ขอเบิกยกเลิกแล้ว (Cancelled)'}
                    </span>
                  </div>

                  <div className="request-date-time text-xs text-muted font-mono">
                    <Clock size={14} className="inline-icon" />
                    {displayDate}
                  </div>
                </div>

                {/* Requester Info Bar */}
                <div className="requester-summary-bar my-3">
                  <div className="summary-item">
                    <span className="summary-label">{lang === 'th' ? 'บริษัท:' : 'Company:'}</span>
                    <span className="summary-val font-bold text-primary">{resolvedCompany}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{lang === 'th' ? 'ผู้ขอเบิก:' : 'Requester:'}</span>
                    <span className="summary-val font-bold">{req.requesterName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{lang === 'th' ? 'แผนก/ฝ่าย:' : 'Department:'}</span>
                    <span className="summary-val">{resolvedDept || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">{lang === 'th' ? 'ตำแหน่ง:' : 'Position:'}</span>
                    <span className="summary-val">{resolvedPosition || '-'}</span>
                  </div>
                </div>

                {req.note && (
                  <div className="request-note-box mb-3">
                    <span className="font-bold text-xs">{lang === 'th' ? '📝 หมายเหตุผู้ขอเบิก:' : 'Note:'}</span>{' '}
                    <span className="text-xs">{req.note}</span>
                  </div>
                )}

                {/* Items Table */}
                <div className="table-responsive mb-3">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}>#</th>
                        <th>{lang === 'th' ? 'อุปกรณ์สำนักงาน' : 'Asset'}</th>
                        <th>{lang === 'th' ? 'Asset Tag' : 'Asset Tag'}</th>
                        <th className="text-center" style={{ width: '140px' }}>{lang === 'th' ? 'จำนวนที่ขอเบิก' : 'Requested Qty'}</th>
                        <th style={{ width: '180px' }}>{lang === 'th' ? 'สถานะสต็อกปัจจุบัน' : 'Stock Availability'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {req.items.map((item, idx) => {
                        const currentProd = products.find((p) => p.id === item.productId);
                        const currentQty = currentProd ? currentProd.quantity : 0;
                        const isStockAvailable = currentQty >= item.quantity;

                        return (
                          <tr key={idx}>
                            <td className="font-bold text-muted text-xs">{idx + 1}</td>
                            <td>
                              <div className="flex-center gap-2">
                                {item.image && <img src={item.image} alt={item.name} className="item-thumb-mini" />}
                                <span className="font-bold text-sm">{item.name}</span>
                              </div>
                            </td>
                            <td className="font-mono text-xs text-muted">{item.sku}</td>
                            <td className="text-center font-extrabold text-red">
                              {item.quantity} {item.unit || 'ชิ้น'}
                            </td>
                            <td>
                              <span className={`badge ${isStockAvailable ? 'badge-success' : 'badge-danger'}`}>
                                {isStockAvailable
                                  ? (lang === 'th' ? `🟢 พร้อมจ่าย (คงเหลือ ${currentQty})` : `Available (${currentQty})`)
                                  : (lang === 'th' ? `🔴 สต็อกไม่พอ (เหลือเพียง ${currentQty})` : `Insufficient (${currentQty})`)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Audit Approval Info if approved or rejected */}
                {(isApproved || isRejected) && (
                  <div className={`audit-approval-box mb-3 ${isApproved ? 'audit-approved' : 'audit-rejected'}`}>
                    <div className="flex-between">
                      <span className="font-bold text-xs">
                        {isApproved ? '✅ อนุมัติโดย:' : '❌ ปฏิเสธโดย:'} {req.approvedBy || 'Admin'}
                      </span>
                      {req.approvedAt && (
                        <span className="text-xxs font-mono text-muted">
                          {new Date(req.approvedAt).toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                    {req.statusNote && <div className="text-xs mt-1">{req.statusNote}</div>}
                  </div>
                )}

                {/* Action Buttons Bar */}
                <div className="request-card-actions pt-3 border-top">
                  <div className="action-group-left">
                    <button
                      className="btn btn-secondary btn-sm flex-1"
                      onClick={() =>
                        setPrintSlipReq({
                          ...req,
                          requesterDept: resolvedDept,
                          requesterCompany: resolvedCompany,
                          requesterPosition: resolvedPosition,
                        })
                      }
                      title="Print Request Slip"
                    >
                      <Printer size={15} />
                      <span>{lang === 'th' ? 'พิมพ์ใบคำขอ / ใบจ่ายของ' : 'Print Slip'}</span>
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-ghost btn-sm text-red btn-delete-action"
                        onClick={() => {
                          if (window.confirm(lang === 'th' ? `ต้องการลบคำขอ ${req.refNo} หรือไม่?` : 'Delete request?')) {
                            deleteRequisitionRequest(req.id);
                          }
                        }}
                        title="Delete Request"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {!isViewer && (
                    <div className="action-group-right flex-wrap gap-2">
                      {isPending && (
                        <>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => {
                              setRejectModalReq(req);
                              setRejectReason('');
                            }}
                          >
                            <XCircle size={15} />
                            <span>{lang === 'th' ? 'ปฏิเสธคำขอ' : 'Reject'}</span>
                          </button>
                          <button
                            className="btn btn-primary btn-sm font-extrabold"
                            onClick={() => {
                              setApproveModalReq(req);
                              setApproveNote('');
                            }}
                          >
                            <CheckCircle2 size={15} />
                            <span>{lang === 'th' ? 'อนุมัติ & เริ่มจัดของ' : 'Approve & Prepare'}</span>
                          </button>
                        </>
                      )}

                      {isApproved && (
                        <button
                          className="btn btn-success btn-sm font-extrabold flex-center gap-1.5 shadow-sm"
                          style={{ background: '#059669', borderColor: '#047857' }}
                          onClick={() => handleMarkReady(req)}
                        >
                          <Package size={16} />
                          <span>{lang === 'th' ? '📦 จัดเตรียมเสร็จแล้ว (ส่งเมลแจ้งรับของ)' : 'Ready for Pickup'}</span>
                        </button>
                      )}

                      {isReady && (
                        <button
                          className="btn btn-primary btn-sm font-extrabold flex-center gap-1.5 shadow-sm"
                          style={{ background: '#4f46e5', borderColor: '#4338ca' }}
                          onClick={() => handleCompleteHandover(req)}
                        >
                          <CheckCircle2 size={16} />
                          <span>{lang === 'th' ? '✅ ส่งมอบของสำเร็จ (รับของแล้ว)' : 'Complete Handover'}</span>
                        </button>
                      )}

                      {isCompleted && (
                        <span className="badge badge-success text-xs font-bold py-1.5 px-3 flex-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>{lang === 'th' ? 'ส่งมอบสมบูรณ์แล้ว' : 'Handed Over'}</span>
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      </div>

      {/* MODAL 1: APPROVAL CONFIRMATION */}
      {approveModalReq && (
        <div className="modal-overlay" onClick={() => setApproveModalReq(null)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title">
                <CheckCircle2 size={24} color="#10b981" />
                <h2 className="font-extrabold">{lang === 'th' ? 'ยืนยันการอนุมัติและจ่ายอุปกรณ์' : 'Approve Requisition'}</h2>
              </div>
              <button className="close-btn" onClick={() => setApproveModalReq(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="text-sm mb-3">
                {lang === 'th'
                  ? `ระบบจะทำการตัดสต็อกอัตโนมัติสำหรับคำขอเลขที่ ${approveModalReq.refNo} ของคุณ ${approveModalReq.requesterName}`
                  : `This will deduct inventory for ${approveModalReq.refNo}`}
              </p>

              <div className="form-group">
                <label className="form-label text-xs">{lang === 'th' ? 'ข้อความบันทึกเพิ่มเติม (ถ้ามี)' : 'Approval Note'}</label>
                <input
                  type="text"
                  className="form-control text-xs"
                  placeholder="เช่น อนุมัติครบถ้วน ส่งมอบให้ผู้เบิกแล้ว"
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setApproveModalReq(null)}>
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button className="btn btn-success font-extrabold" onClick={handleConfirmApprove}>
                <CheckCircle2 size={18} />
                {lang === 'th' ? 'ยืนยันอนุมัติและตัดจ่ายสต็อก (-)' : 'Confirm Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: REJECT REQUISITION */}
      {rejectModalReq && (
        <div className="modal-overlay" onClick={() => setRejectModalReq(null)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-title text-red">
                <XCircle size={24} color="#e11d48" />
                <h2 className="font-extrabold">{lang === 'th' ? 'ปฏิเสธคำขอเบิกอุปกรณ์' : 'Reject Requisition'}</h2>
              </div>
              <button className="close-btn" onClick={() => setRejectModalReq(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <p className="text-sm mb-3">
                {lang === 'th'
                  ? `ปฏิเสธคำขอเลขที่ ${rejectModalReq.refNo} ของคุณ ${rejectModalReq.requesterName}`
                  : `Rejecting request ${rejectModalReq.refNo}`}
              </p>

              <div className="form-group">
                <label className="form-label text-xs">{lang === 'th' ? 'เหตุผลที่ไม่อนุมัติ (Rejection Reason) *' : 'Reason *'}</label>
                <textarea
                  className="form-control text-xs"
                  placeholder="เช่น อุปกรณ์ขาดสต็อกชั่วคราว / เกินโควตาการเบิกประจำเดือน"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setRejectModalReq(null)}>
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button className="btn btn-danger font-extrabold" onClick={handleConfirmReject}>
                <XCircle size={18} />
                {lang === 'th' ? 'ยืนยันปฏิเสธคำขอ' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PRINT OFFICIAL SLIP */}
      <RequisitionSlipModal
        isOpen={Boolean(printSlipReq)}
        onClose={() => setPrintSlipReq(null)}
        request={printSlipReq}
      />

      {/* STYLES */}
      <style>{`
        .approval-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1.25rem;
        }

        .kpi-pill-card {
          display: flex;
          align-items: center;
          gap: 1.1rem;
          padding: 1.25rem;
          cursor: pointer;
          border: 1.5px solid var(--border-color);
        }

        .kpi-pill-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }

        .active-border-amber { border-color: #f59e0b; background: rgba(245, 158, 11, 0.04); }
        .active-border-emerald { border-color: #10b981; background: rgba(16, 185, 129, 0.04); }
        .active-border-rose { border-color: #e11d48; background: rgba(225, 29, 72, 0.04); }
        .active-border-indigo { border-color: #6366f1; background: rgba(99, 102, 241, 0.04); }

        .kpi-pill-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .bg-amber { background: #fffbeb; color: #d97706; }
        .bg-emerald { background: #ecfdf5; color: #059669; }
        .bg-rose { background: #fff1f2; color: #e11d48; }
        .bg-indigo { background: #eef2ff; color: #4f46e5; }

        .kpi-pill-label {
          font-size: 0.8rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .kpi-pill-value {
          font-size: 1.45rem;
          font-weight: 800;
        }

        .status-filter-tabs {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .status-tab-btn {
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .status-tab-btn.active {
          background: var(--primary-gradient);
          color: #ffffff;
          border-color: transparent;
        }

        .status-tab-btn.active-amber { background: #f59e0b; color: white; }
        .status-tab-btn.active-emerald { background: #10b981; color: white; }
        .status-tab-btn.active-rose { background: #e11d48; color: white; }

        .request-card {
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          border: 1.5px solid var(--border-color);
        }

        .border-amber-glow {
          border-color: #fde68a;
          box-shadow: 0 4px 18px rgba(245, 158, 11, 0.08);
        }

        .ref-number-badge {
          background: var(--primary-50);
          color: var(--primary-700);
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-xs);
          font-size: 0.95rem;
        }

        .status-pill-badge {
          font-size: 0.78rem;
          font-weight: 800;
          padding: 0.25rem 0.75rem;
          border-radius: var(--radius-full);
        }

        .pill-pending { background: #fffbeb; color: #d97706; border: 1px solid #fde68a; }
        .pill-approved { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
        .pill-rejected { background: #fef2f2; color: #e11d48; border: 1px solid #fecdd3; }

        .requester-summary-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 1rem;
          background: var(--bg-main);
          padding: 0.85rem 1.15rem;
          border-radius: var(--radius-sm);
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .summary-label {
          font-size: 0.72rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .summary-val {
          font-size: 0.88rem;
        }

        .request-note-box {
          background: #f8fafc;
          border-left: 3px solid var(--primary-500);
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-xs);
        }

        .item-thumb-mini {
          width: 32px;
          height: 32px;
          border-radius: var(--radius-xs);
          object-fit: cover;
          border: 1px solid var(--border-color);
        }

        .audit-approval-box {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
        }

        .audit-approved { background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; }
        .audit-rejected { background: #fef2f2; border: 1px solid #fecdd3; color: #9f1239; }

        .request-card-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .action-group-left,
        .action-group-right {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-delete-action {
          padding: 0.4rem 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        @media (max-width: 768px) {
          .approval-center-page {
            padding: 0;
          }

          .approval-kpi-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.5rem !important;
            margin-bottom: 0.75rem !important;
          }

          .kpi-pill-card {
            padding: 0.65rem 0.6rem !important;
            gap: 0.5rem !important;
            border-radius: var(--radius-md) !important;
          }

          .kpi-pill-icon {
            width: 36px !important;
            height: 36px !important;
            border-radius: var(--radius-xs) !important;
          }

          .kpi-pill-icon svg {
            width: 18px !important;
            height: 18px !important;
          }

          .kpi-pill-value {
            font-size: 1.15rem !important;
          }

          .kpi-pill-label {
            font-size: 0.68rem !important;
          }

          .toolbar-card {
            padding: 0.75rem !important;
            margin-bottom: 0.75rem !important;
            gap: 0.6rem !important;
          }

          .status-filter-tabs {
            overflow-x: auto !important;
            flex-wrap: nowrap !important;
            padding-bottom: 4px !important;
            -webkit-overflow-scrolling: touch !important;
            width: 100% !important;
          }

          .status-tab-btn {
            flex-shrink: 0 !important;
            padding: 0.35rem 0.75rem !important;
            font-size: 0.75rem !important;
          }

          .request-card {
            padding: 0.85rem !important;
            margin-bottom: 0.85rem !important;
            border-radius: var(--radius-md) !important;
          }

          .request-card-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 0.4rem !important;
          }

          .ref-number-badge {
            font-size: 0.82rem !important;
            padding: 0.2rem 0.5rem !important;
          }

          .status-pill-badge {
            font-size: 0.72rem !important;
            padding: 0.2rem 0.6rem !important;
          }

          .requester-summary-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 0.6rem !important;
            padding: 0.65rem 0.75rem !important;
          }

          .summary-label {
            font-size: 0.68rem !important;
          }

          .summary-val {
            font-size: 0.78rem !important;
            word-break: break-word !important;
          }

          .table-responsive {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            margin-left: -0.5rem;
            margin-right: -0.5rem;
            padding: 0 0.5rem;
          }

          .data-table th,
          .data-table td {
            padding: 0.5rem 0.4rem !important;
            font-size: 0.75rem !important;
          }

          .request-card-actions {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 0.5rem !important;
          }

          .action-group-left,
          .action-group-right {
            width: 100% !important;
            display: flex !important;
            gap: 0.4rem !important;
          }

          .action-group-left button.btn-secondary {
            flex: 1 !important;
            font-size: 0.75rem !important;
            padding: 0.45rem 0.5rem !important;
            justify-content: center !important;
          }

          .action-group-right button {
            flex: 1 !important;
            font-size: 0.75rem !important;
            padding: 0.45rem 0.5rem !important;
            justify-content: center !important;
          }

          .btn-delete-action {
            flex: 0 0 36px !important;
            width: 36px !important;
            padding: 0 !important;
          }

          .smart-month-filter-wrap {
            width: 100% !important;
          }

          .month-stepper-control {
            width: 100% !important;
            display: flex !important;
          }

          .stepper-label-btn {
            flex: 1 !important;
            justify-content: center !important;
            font-size: 0.82rem !important;
            padding: 0 8px !important;
          }

          .smart-month-popover {
            width: calc(100vw - 32px) !important;
            max-width: 340px !important;
            right: 0 !important;
            left: 0 !important;
            margin: 0 auto !important;
          }
        }
      `}</style>
    </div>
  );
};
