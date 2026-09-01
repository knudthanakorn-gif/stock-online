import React, { useState } from 'react';
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
} from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';
import { RequisitionSlipModal } from './RequisitionSlipModal';

export const ApprovalCenter = () => {
  const {
    requests = [],
    products = [],
    usersList = [],
    requestersList = [],
    approveRequisitionRequest,
    rejectRequisitionRequest,
    deleteRequisitionRequest,
    lang,
    user,
  } = useStock();

  const isAdmin = user?.role === 'admin';
  const isViewer = user?.role === 'viewer';

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'

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

  // Filter Requests
  const filteredRequests = requests.filter((req) => {
    const matchSearch =
      !searchQuery ||
      req.refNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.requesterDept && req.requesterDept.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (req.requesterCompany && req.requesterCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      req.items.some((item) => item.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'ALL' || req.status === statusFilter;

    return matchSearch && matchStatus;
  });

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter((r) => r.status === 'REJECTED').length;

  const handleConfirmApprove = () => {
    if (!approveModalReq) return;
    setActionError('');
    setActionSuccess('');

    try {
      approveRequisitionRequest(approveModalReq.id, approveNote);
      setActionSuccess(lang === 'th' ? `อนุมัติคำขอ ${approveModalReq.refNo} และตัดจ่ายสต็อกเรียบร้อยแล้ว!` : `Approved ${approveModalReq.refNo}`);
      setApproveModalReq(null);
      setApproveNote('');
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
      <div className="approval-kpi-grid mb-6">
        <div className={`card kpi-pill-card ${statusFilter === 'PENDING' ? 'active-border-amber' : ''}`} onClick={() => setStatusFilter('PENDING')}>
          <div className="kpi-pill-icon bg-amber">
            <Clock size={24} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🟡 รอการอนุมัติ' : 'Pending Review'}</div>
            <div className="kpi-pill-value text-amber">{pendingCount} <span className="text-xs text-muted">{lang === 'th' ? 'รายการ' : 'requests'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'APPROVED' ? 'active-border-emerald' : ''}`} onClick={() => setStatusFilter('APPROVED')}>
          <div className="kpi-pill-icon bg-emerald">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🟢 อนุมัติแล้ว' : 'Approved'}</div>
            <div className="kpi-pill-value text-green">{approvedCount} <span className="text-xs text-muted">{lang === 'th' ? 'รายการ' : 'requests'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'REJECTED' ? 'active-border-rose' : ''}`} onClick={() => setStatusFilter('REJECTED')}>
          <div className="kpi-pill-icon bg-rose">
            <XCircle size={24} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '🔴 ไม่อนุมัติ' : 'Rejected'}</div>
            <div className="kpi-pill-value text-red">{rejectedCount} <span className="text-xs text-muted">{lang === 'th' ? 'รายการ' : 'requests'}</span></div>
          </div>
        </div>

        <div className={`card kpi-pill-card ${statusFilter === 'ALL' ? 'active-border-indigo' : ''}`} onClick={() => setStatusFilter('ALL')}>
          <div className="kpi-pill-icon bg-indigo">
            <FileText size={24} />
          </div>
          <div>
            <div className="kpi-pill-label">{lang === 'th' ? '📋 คำขอทั้งหมด' : 'All Requests'}</div>
            <div className="kpi-pill-value">{requests.length} <span className="text-xs text-muted">{lang === 'th' ? 'รายการ' : 'total'}</span></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="toolbar-card card mb-6">
        <div className="search-wrap flex-1">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="form-control with-icon"
            placeholder={lang === 'th' ? 'ค้นหาตามเลขที่คำขอ (REQ-...), ชื่อผู้ขอเบิก, แผนก, หรือชื่ออุปกรณ์...' : 'Search by Ref No, Requester, Department, or Asset...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="status-filter-tabs">
          <button
            className={`status-tab-btn ${statusFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setStatusFilter('ALL')}
          >
            {lang === 'th' ? 'ทั้งหมด' : 'All'} ({requests.length})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'PENDING' ? 'active active-amber' : ''}`}
            onClick={() => setStatusFilter('PENDING')}
          >
            🟡 {lang === 'th' ? 'รออนุมัติ' : 'Pending'} ({pendingCount})
          </button>
          <button
            className={`status-tab-btn ${statusFilter === 'APPROVED' ? 'active active-emerald' : ''}`}
            onClick={() => setStatusFilter('APPROVED')}
          >
            🟢 {lang === 'th' ? 'อนุมัติแล้ว' : 'Approved'} ({approvedCount})
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
              <div key={req.id} className={`card request-card mb-4 ${isPending ? 'border-amber-glow' : ''}`}>
                {/* Header Row */}
                <div className="request-card-header flex-between">
                  <div className="flex-center gap-3">
                    <span className="ref-number-badge font-mono font-extrabold">{req.refNo}</span>
                    <span className={`status-pill-badge ${isPending ? 'pill-pending' : isApproved ? 'pill-approved' : isCancelled ? 'pill-cancelled' : 'pill-rejected'}`}>
                      {isPending && '🟡 รอการอนุมัติ (Pending)'}
                      {isApproved && '🟢 อนุมัติและตัดจ่ายสต็อกแล้ว (Approved)'}
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
                <div className="request-card-actions flex-between pt-2 border-top">
                  <div className="flex-center gap-2">
                    <button
                      className="btn btn-secondary btn-sm"
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
                      <Printer size={16} />
                      <span>{lang === 'th' ? 'พิมพ์ใบคำขอ / ใบจ่ายของ' : 'Print Slip'}</span>
                    </button>
                    {isAdmin && (
                      <button
                        className="btn btn-ghost btn-sm text-red"
                        onClick={() => {
                          if (window.confirm(lang === 'th' ? `ต้องการลบคำขอ ${req.refNo} หรือไม่?` : 'Delete request?')) {
                            deleteRequisitionRequest(req.id);
                          }
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>

                  {isPending && !isViewer && (
                    <div className="flex-center gap-2">
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => {
                          setRejectModalReq(req);
                          setRejectReason('');
                        }}
                      >
                        <XCircle size={16} />
                        <span>{lang === 'th' ? 'ปฏิเสธคำขอ' : 'Reject'}</span>
                      </button>
                      <button
                        className="btn btn-success btn-sm font-extrabold"
                        onClick={() => {
                          setApproveModalReq(req);
                          setApproveNote('');
                        }}
                      >
                        <CheckCircle2 size={16} />
                        <span>{lang === 'th' ? 'อนุมัติ & จ่ายของ (-)' : 'Approve & Dispatch'}</span>
                      </button>
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

        /* Slip Styles */
        .print-document-sheet {
          background: #ffffff;
          color: #0f172a;
          padding: 2rem;
        }

        .slip-logo-box {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-sm);
          background: var(--primary-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .slip-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.65rem;
          font-size: 0.88rem;
        }

        .slip-signatures-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 1.5rem;
        }

        .signature-line {
          height: 1px;
          background: #0f172a;
          margin-top: 45px;
        }

        @media (max-width: 768px) {
          .requester-summary-bar, .slip-signatures-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
