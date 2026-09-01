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
  const { lang } = useStock();
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

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status) => {
    if (status === 'APPROVED') {
      return (
        <span className="badge badge-success" style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}>
          <CheckCircle2 size={14} className="inline-icon" /> {lang === 'th' ? 'อนุมัติ / จ่ายของแล้ว' : 'Approved & Dispatched'}
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
        <Clock size={14} className="inline-icon" /> {lang === 'th' ? 'รออนุมัติ' : 'Pending Approval'}
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
                    {request.requesterCompany || 'บริษัท เอ็กซิออน (ประเทศไทย) จำกัด / EXION (THAILAND) CO., LTD.'}
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
                <strong>รหัสพนักงาน:</strong> <span className="font-mono font-bold">{request.employeeCode || '-'}</span>
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>บริษัท/สังกัด:</strong> {request.requesterCompany || 'EXION (THAILAND) COMPANY LIMITED'}
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>แผนก / ฝ่าย:</strong> {request.requesterDept || '-'} • {request.requesterPosition || '-'}
              </div>
            </div>

            <div>
              <div className="text-xs font-bold text-slate-500 mb-0.5">ข้อมูลเอกสาร (Document Details):</div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>วันที่ทำรายการ:</strong> {formattedDate}
              </div>
              <div className="text-xs text-slate-700 mt-0.5">
                <strong>วัตถุประสงค์:</strong>{' '}
                <span className="badge badge-info text-xxs font-bold">
                  {request.purpose === 'DAILY' ? 'เบิกใช้งานประจำวัน' : request.purpose === 'PROJECT' ? 'ใช้งานโครงการ/กิจกรรม' : request.purpose === 'URGENT' ? 'เบิกด่วนฉุกเฉิน' : 'อื่นๆ'}
                </span>
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

          {/* Signatures Section (3 Columns) */}
          <div
            className="slip-signatures-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '1rem',
              marginTop: '1.75rem',
              paddingTop: '0.5rem',
            }}
          >
            {/* 1. Requester */}
            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ borderBottom: '1px solid #64748b', margin: '0 0.75rem 6px 0.75rem' }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a' }}>
                ( {request.requesterName} )
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ผู้ขอเบิกพัสดุ</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                วันที่: ......./......./...........
              </div>
            </div>

            {/* 2. Warehouse Storekeeper / Issuer */}
            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ borderBottom: '1px solid #64748b', margin: '0 0.75rem 6px 0.75rem' }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a' }}>
                ( .................................................... )
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ผู้จ่ายพัสดุ / เจ้าหน้าที่คลัง</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                วันที่: ......./......./...........
              </div>
            </div>

            {/* 3. Approver */}
            <div style={{ textAlign: 'center', border: '1px dashed #cbd5e1', padding: '0.75rem 0.5rem', borderRadius: '6px' }}>
              <div style={{ height: '36px' }}></div>
              <div style={{ borderBottom: '1px solid #64748b', margin: '0 0.75rem 6px 0.75rem' }}></div>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0f172a' }}>
                ( {request.approvedBy || '....................................................'} )
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>ผู้อนุมัติ / หัวหน้างาน</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
                วันที่: ......./......./...........
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div style={{ textAlign: 'center', fontSize: '0.68rem', color: '#94a3b8', marginTop: '1.25rem' }}>
            เอกสารนี้สร้างจากระบบ Stock Online Enterprise เมื่อ {new Date().toLocaleString('th-TH')} • ใช้เป็นหลักฐานแนบการเบิกจ่ายพัสดุสำนักงาน
          </div>
        </div>
      </div>
    </div>
  );
};
