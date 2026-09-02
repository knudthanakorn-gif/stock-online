import React, { useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import {
  Printer,
  X,
  Building,
  UserCheck,
  Calendar,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Share2,
} from 'lucide-react';

export const RequisitionSlipModal = ({ isOpen, onClose, request }) => {
  const { lang, usersList = [], requestersList = [] } = useStock();
  const printContentRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open-print');
    } else {
      document.body.classList.remove('modal-open-print');
    }
    return () => {
      document.body.classList.remove('modal-open-print');
    };
  }, [isOpen]);

  if (!isOpen || !request) return null;

  // Auto-resolve requester profile from usersList or requestersList if department is missing
  const matchedUser =
    (usersList || []).find(
      (u) =>
        (u.name && request.requesterName && u.name.trim().toLowerCase() === request.requesterName.trim().toLowerCase()) ||
        (u.username && request.requesterName && u.username.trim().toLowerCase() === request.requesterName.trim().toLowerCase())
    ) ||
    (requestersList || []).find(
      (r) =>
        r.name && request.requesterName && r.name.trim().toLowerCase() === request.requesterName.trim().toLowerCase()
    );

  const displayDept =
    request.requesterDept && request.requesterDept !== '-' && request.requesterDept.trim() !== ''
      ? request.requesterDept
      : matchedUser?.department || request.department || '';

  const displayCompany =
    request.requesterCompany && request.requesterCompany !== '-' && request.requesterCompany.trim() !== ''
      ? request.requesterCompany
      : matchedUser?.company || 'EXION (THAILAND) COMPANY LIMITED';

  const displayPosition =
    request.requesterPosition && request.requesterPosition !== '-' && request.requesterPosition.trim() !== ''
      ? request.requesterPosition
      : matchedUser?.position || '';

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span className="badge badge-info" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', background: '#e0e7ff', color: '#3730a3' }}>
          <Clock size={14} className="inline-icon" /> {lang === 'th' ? '🔵 อนุมัติแล้ว • กำลังจัดของ' : 'Approved (Preparing)'}
        </span>
      );
    }
    if (status === 'READY_FOR_PICKUP') {
      return (
        <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', background: '#d1fae5', color: '#065f46', fontWeight: '800' }}>
          <CheckCircle2 size={14} className="inline-icon" /> {lang === 'th' ? '🟢 📦 จัดของเสร็จแล้ว • พร้อมรับของ' : 'Ready for Pickup'}
        </span>
      );
    }
    if (status === 'COMPLETED') {
      return (
        <span className="badge badge-secondary" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem', background: '#f3e8ff', color: '#6b21a8' }}>
          <CheckCircle2 size={14} className="inline-icon" /> {lang === 'th' ? '🟣 ส่งมอบและรับของแล้ว' : 'Completed'}
        </span>
      );
    }
    if (status === 'REJECTED') {
      return (
        <span className="badge badge-danger" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
          <AlertCircle size={14} className="inline-icon" /> {lang === 'th' ? 'ไม่อนุมัติ' : 'Rejected'}
        </span>
      );
    }
    return (
      <span className="badge badge-warning" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
        <Clock size={14} className="inline-icon" /> {lang === 'th' ? '🟡 รอการอนุมัติ' : 'Pending Approval'}
      </span>
    );
  };

  const formattedDate = new Date(request.createdAt).toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalQuantity = (request.items || []).reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const getPurposeText = (p) => {
    if (p === 'DAILY') return 'เบิกใช้งานประจำวัน';
    if (p === 'PROJECT') return 'ใช้งานโครงการ/กิจกรรม';
    if (p === 'URGENT') return 'เบิกด่วนฉุกเฉิน';
    if (p === 'OTHER' || !p) return 'อื่นๆ';
    return p;
  };

  return (
    <div className="modal-overlay requisition-slip-overlay" onClick={onClose}>
      <div
        className="modal-content modal-lg requisition-slip-modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '840px', background: '#ffffff', color: '#0f172a' }}
      >
        {/* Action Bar (Hidden when printing) */}
        <div className="modal-header no-print flex-between" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div className="flex-center gap-2">
            <FileText size={22} color="#4f46e5" />
            <div>
              <h2 className="font-extrabold text-base text-slate-800" style={{ margin: 0 }}>
                {lang === 'th' ? 'ใบสำคัญการเบิกจ่ายอุปกรณ์ (Requisition Slip)' : 'Requisition Slip Voucher'}
              </h2>
              <span className="text-xs text-slate-500 font-mono">เลขที่: {request.refNo}</span>
            </div>
          </div>

          <div className="flex-center gap-2">
            <button className="btn btn-primary font-bold flex-center gap-1.5" onClick={handlePrint}>
              <Printer size={16} />
              <span>{lang === 'th' ? 'พิมพ์เอกสาร / บันทึก PDF' : 'Print / Save PDF'}</span>
            </button>
            <button className="close-btn" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PRINTABLE SLIP CONTENT */}
        <div className="slip-printable-area" ref={printContentRef} style={{ padding: '1.75rem' }}>
          {/* Header */}
          <div className="slip-header flex-between mb-4 pb-3" style={{ borderBottom: '2px solid #0f172a' }}>
            <div>
              <div className="flex-center gap-3">
                <img
                  src="/logo.png"
                  alt="EXION THAILAND"
                  style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <h1 style={{ fontSize: '1.1rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
                    {displayCompany}
                  </h1>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                    ระบบจัดการคลังพัสดุและเบิกจ่ายอุปกรณ์สำนักงาน (Stock Management System)
                  </p>
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.15rem', fontWeight: '900', color: '#4f46e5', letterSpacing: '0.5px' }}>
                ใบสำคัญการเบิกจ่าย
              </div>
              <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a', marginTop: '1px' }}>
                {request.refNo}
              </div>
              <div style={{ marginTop: '3px' }}>
                {getStatusBadge(request.status)}
              </div>
            </div>
          </div>

          {/* Meta Info Grid */}
          <div
            className="slip-meta-box mb-4"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.85rem',
              background: '#f8fafc',
              padding: '0.85rem 1.15rem',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
            }}
          >
            <div>
              <div className="text-xs font-bold text-slate-500 mb-0.5">ข้อมูลผู้ขอเบิก (Requester Information):</div>
              <div className="font-bold text-sm text-slate-900">{request.requesterName}</div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>บริษัท/สังกัด:</strong> {displayCompany}
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>แผนก / ฝ่าย:</strong> {displayDept || 'ทั่วไป'} {displayPosition ? `• ${displayPosition}` : ''}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-0.5">ข้อมูลเอกสาร (Document Details):</div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>วันที่ทำรายการ:</strong> {formattedDate}
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>วัตถุประสงค์:</strong> {getPurposeText(request.purpose)}
              </div>
              {request.approvedBy && (
                <div className="text-xs text-slate-700 mt-0.5">
                  <strong>ผู้อนุมัติจ่ายของ:</strong> {request.approvedBy}
                </div>
              )}
              {request.note && (
                <div className="text-xs text-slate-700 mt-0.5">
                  <strong>หมายเหตุ:</strong> {request.note}
                </div>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-4">
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '0.82rem',
                border: '1px solid #cbd5e1',
              }}
            >
              <thead>
                <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #94a3b8' }}>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '40px', borderRight: '1px solid #cbd5e1' }}>#</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '120px', borderRight: '1px solid #cbd5e1' }}>รหัส SKU</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', borderRight: '1px solid #cbd5e1' }}>รายการอุปกรณ์ / พัสดุ</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '100px', borderRight: '1px solid #cbd5e1' }}>จำนวนที่เบิก</th>
                  <th style={{ padding: '6px 10px', textAlign: 'center', width: '80px', borderRight: '1px solid #cbd5e1' }}>หน่วยนับ</th>
                  <th style={{ padding: '6px 10px', textAlign: 'left', width: '130px' }}>หมายเหตุ / Serial</th>
                </tr>
              </thead>
              <tbody>
                {(request.items || []).map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }} className="text-slate-500">{idx + 1}</td>
                    <td style={{ padding: '6px 10px', fontFamily: 'monospace', fontWeight: 'bold', borderRight: '1px solid #cbd5e1' }}>{item.sku || '-'}</td>
                    <td style={{ padding: '6px 10px', fontWeight: '600', borderRight: '1px solid #cbd5e1' }}>{item.name}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', fontWeight: '800', color: '#4f46e5', borderRight: '1px solid #cbd5e1' }}>{item.quantity}</td>
                    <td style={{ padding: '6px 10px', textAlign: 'center', borderRight: '1px solid #cbd5e1' }}>{item.unit || 'ชิ้น'}</td>
                    <td style={{ padding: '6px 10px', fontSize: '0.75rem', color: '#64748b' }}>-</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: '#f8fafc', fontWeight: '800', borderTop: '2px solid #94a3b8' }}>
                  <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', borderRight: '1px solid #cbd5e1' }}>
                    รวมจำนวนอุปกรณ์ที่ขอเบิกทั้งสิ้น:
                  </td>
                  <td style={{ padding: '8px 10px', textAlign: 'center', color: '#4f46e5', fontSize: '0.95rem', borderRight: '1px solid #cbd5e1' }}>
                    {totalQuantity}
                  </td>
                  <td colSpan="2" style={{ padding: '8px 10px', textAlign: 'left' }}>
                    รายการ
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Signatures Section (2 Columns: Requester & Warehouse Issuer) */}
          <div
            className="slip-signatures-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              maxWidth: '680px',
              margin: '1.75rem auto 0 auto',
              paddingTop: '0.5rem',
            }}
          >
            {/* 1. Requester */}
            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '0.85rem 1rem', borderRadius: '6px' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderBottom: '1px solid #64748b', margin: '0 1rem 6px 1rem' }}></div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                ( {request.requesterName} )
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ผู้ขอเบิกพัสดุ</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                วันที่: ......./......./...........
              </div>
            </div>

            {/* 2. Warehouse Storekeeper / Issuer */}
            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '0.85rem 1rem', borderRadius: '6px' }}>
              <div style={{ height: '40px' }}></div>
              <div style={{ borderBottom: '1px solid #64748b', margin: '0 1rem 6px 1rem' }}></div>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#0f172a' }}>
                ( .................................................... )
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ผู้จ่ายพัสดุ / เจ้าหน้าที่คลัง</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                วันที่: ......./......./...........
              </div>
            </div>
          </div>
        </div>

        {/* PRINT CSS STYLES FOR EXACT SINGLE A4 PAGE */}
        <style>{`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }
            html, body {
              height: auto !important;
              min-height: 0 !important;
              max-height: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .requisition-slip-overlay,
            .requisition-slip-modal {
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
              margin: 0 !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
            }
            .slip-printable-area {
              padding: 10mm 15mm !important;
              width: 100% !important;
              max-width: 100% !important;
              box-sizing: border-box !important;
              margin: 0 !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              page-break-before: avoid !important;
            }
            .slip-signatures-grid {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-top: 1.25rem !important;
            }
            .no-print {
              display: none !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
