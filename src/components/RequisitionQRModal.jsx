import React, { useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, QrCode, Printer, Building2, Smartphone, ClipboardList, CheckCircle2 } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const RequisitionQRModal = ({ isOpen, onClose }) => {
  const { lang } = useStock();
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Generate URL for Opening Main Portal / Login Page
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/?action=login` : 'https://stock-online-mauve.vercel.app/?action=login';
  const qrSvgHtml = renderQRCodeSVG(portalUrl, 220);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md">
        <div className="modal-header no-print">
          <div className="modal-header-title">
            <QrCode color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'ป้าย QR Code สำหรับสแกนเข้าสู่ระบบ (Login Portal)' : 'System Login QR Code Poster'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-center">
          {/* Printable QR Code Poster Card */}
          <div className="requisition-poster-card print-area" ref={printRef}>
            <div className="poster-header">
              <Building2 size={24} color="#2563eb" />
              <div className="poster-org-name">OFFICE ASSET MANAGEMENT PORTAL</div>
              <div className="poster-sub">EXION (THAILAND) COMPANY LIMITED</div>
            </div>

            <div className="poster-body">
              <div className="poster-badge">
                <Smartphone size={16} />
                <span>{lang === 'th' ? 'สแกนด้วยกล้องมือถือเพื่อเข้าสู่ระบบ (Login)' : 'Scan to Login into Stock System'}</span>
              </div>

              {/* Large Scannable QR Code */}
              <div
                className="qr-code-display-wrap"
                dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
              />

              <div className="poster-instructions">
                <div className="instruction-step">
                  <span className="step-num">1</span>
                  <span>{lang === 'th' ? 'เปิดกล้องมือถือ / แอป LINE สแกน QR Code นี้' : 'Open phone camera or LINE app to scan'}</span>
                </div>
                <div className="instruction-step">
                  <span className="step-num">2</span>
                  <span>{lang === 'th' ? 'ระบบจะเปิดหน้าเข้าสู่ระบบ (Login) ของ Stock Online' : 'System opens Stock Online Login page'}</span>
                </div>
                <div className="instruction-step">
                  <span className="step-num">3</span>
                  <span>{lang === 'th' ? 'กรอกชื่อผู้ใช้ / รหัสพนักงาน และรหัสผ่านเพื่อเข้าใช้งาน' : 'Enter username / employee code and password to start'}</span>
                </div>
              </div>
            </div>

            <div className="poster-footer">
              <ClipboardList size={14} />
              <span>{lang === 'th' ? 'ระบบบริหารจัดการคลังและเบิกจ่ายอุปกรณ์สำนักงาน (Stock Online)' : 'Stock Online Asset Management & Requisition System'}</span>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            {lang === 'th' ? 'พิมพ์ป้าย QR Code (Print Poster)' : 'Print Poster'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-md { max-width: 520px; }
        .requisition-poster-card {
          background: var(--bg-surface);
          border: 2px solid var(--primary-500);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .poster-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px dashed var(--border-color);
        }

        .poster-org-name {
          font-size: 1rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--primary-600);
        }

        .poster-sub {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .poster-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: var(--primary-50);
          color: var(--primary-700);
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .qr-code-display-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          background: #ffffff;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          width: fit-content;
          margin: 0 auto 1.25rem auto;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }

        .poster-instructions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          text-align: left;
          background: var(--bg-main);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          margin-bottom: 1rem;
        }

        .instruction-step {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.85rem;
          color: var(--text-primary);
        }

        .step-num {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--primary-600);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .poster-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.75rem;
          color: var(--text-muted);
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color);
        }

        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 90%;
            border: 2px solid #000;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
