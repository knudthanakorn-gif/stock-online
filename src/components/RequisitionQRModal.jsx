import React, { useRef, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { X, QrCode, Printer, Smartphone, ClipboardList, CheckCircle2, Globe, ShieldCheck } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const RequisitionQRModal = ({ isOpen, onClose }) => {
  const { lang } = useStock();
  const printRef = useRef(null);

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

  if (!isOpen) return null;

  // Generate URL for Opening Main Portal / Login Page
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/?action=login` : 'https://stock-online-mauve.vercel.app/?action=login';
  const qrSvgHtml = renderQRCodeSVG(portalUrl, 250);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay requisition-qr-overlay">
      <div className="modal-content modal-md requisition-qr-modal">
        <div className="modal-header no-print">
          <div className="modal-header-title">
            <QrCode color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'ป้าย QR Code สำหรับสแกนเข้าสู่ระบบ (Login Portal)' : 'System Login QR Code Poster'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-center" style={{ padding: '1rem' }}>
          {/* Printable QR Code Poster Card (Guaranteed 1 Single Page) */}
          <div className="requisition-poster-card" ref={printRef}>
            {/* Poster Header */}
            <div className="poster-header">
              <img
                src="/logo.png"
                alt="EXION THAILAND"
                className="poster-logo-img"
              />
              <div className="poster-header-text">
                <div className="poster-company-name">EXION (THAILAND) COMPANY LIMITED</div>
                <div className="poster-portal-title">OFFICE ASSET MANAGEMENT & REQUISITION SYSTEM</div>
              </div>
            </div>

            <div className="poster-divider"></div>

            {/* Poster Hero Banner */}
            <div className="poster-hero">
              <div className="poster-main-badge">
                <Smartphone size={18} />
                <span>{lang === 'th' ? 'สแกน QR CODE เพื่อเข้าสู่ระบบขอเบิกอุปกรณ์' : 'SCAN QR CODE TO REQUISITION ASSETS'}</span>
              </div>
              <p className="poster-sub-desc">
                {lang === 'th'
                  ? 'รองรับกล้องมือถือทุกรุ่น, แอป LINE และเครื่องสแกนบาร์โค้ด'
                  : 'Compatible with Smartphone Camera, LINE App, and QR Scanners'}
              </p>
            </div>

            {/* Large Scannable QR Code */}
            <div className="poster-qr-container">
              <div
                className="qr-code-svg-wrap"
                dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
              />
              <div className="qr-scan-hint">
                <span>✦ จุดสแกนเบิกพัสดุประจำแผนก ✦</span>
              </div>
            </div>

            {/* 3 Step Instructions */}
            <div className="poster-instructions">
              <div className="instruction-step">
                <div className="step-badge">1</div>
                <div className="step-text">
                  <strong>{lang === 'th' ? 'เปิดกล้องมือถือ / LINE' : 'Open Camera / LINE'}</strong>
                  <span>{lang === 'th' ? 'สแกนคิวอาร์โค้ดนี้เพื่อเปิดระบบ' : 'Scan this QR code to access portal'}</span>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-badge">2</div>
                <div className="step-text">
                  <strong>{lang === 'th' ? 'เข้าสู่ระบบด้วยชื่อของคุณ' : 'Sign in with your name'}</strong>
                  <span>{lang === 'th' ? 'เลือกชื่อพนักงานและกรอกรหัสผ่าน' : 'Select your name and enter password'}</span>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-badge">3</div>
                <div className="step-text">
                  <strong>{lang === 'th' ? 'เลือกอุปกรณ์และกดยืนยัน' : 'Pick items & submit'}</strong>
                  <span>{lang === 'th' ? 'ระบุจำนวนที่ต้องการและส่งคำขอ' : 'Choose quantity and confirm request'}</span>
                </div>
              </div>
            </div>

            {/* URL Footer Reference */}
            <div className="poster-url-box">
              <Globe size={13} />
              <span className="poster-url-text font-mono">{portalUrl}</span>
            </div>

            {/* Poster Footer */}
            <div className="poster-footer">
              <div className="flex-center gap-1.5">
                <ShieldCheck size={14} color="#059669" />
                <span>ระบบบริหารจัดการคลังพัสดุและเบิกจ่ายอุปกรณ์สำนักงาน (Stock Online)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>{lang === 'th' ? 'พิมพ์ป้าย QR Code (1 แผ่น A4)' : 'Print Poster (1 Page A4)'}</span>
          </button>
        </div>
      </div>

      <style>{`
        .modal-md { max-width: 520px; }

        .requisition-poster-card {
          background: #ffffff;
          border: 2px solid #4f46e5;
          border-radius: 16px;
          padding: 1.5rem 1.25rem;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.15);
          color: #0f172a;
          text-align: center;
        }

        .poster-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
        }

        .poster-logo-img {
          height: 48px;
          width: auto;
          object-fit: contain;
        }

        .poster-header-text {
          text-align: left;
        }

        .poster-company-name {
          font-size: 0.95rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .poster-portal-title {
          font-size: 0.68rem;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 0.04em;
        }

        .poster-divider {
          height: 2px;
          background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
          margin: 0.6rem 0 0.85rem 0;
          border-radius: 2px;
        }

        .poster-main-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          background: #4f46e5;
          color: #ffffff;
          padding: 0.45rem 1.1rem;
          border-radius: 9999px;
          font-size: 0.88rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          margin-bottom: 0.35rem;
        }

        .poster-sub-desc {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0 0 0.85rem 0;
          font-weight: 500;
        }

        .poster-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 auto 0.85rem auto;
        }

        .qr-code-svg-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.75rem;
          background: #ffffff;
          border-radius: 14px;
          border: 2.5px solid #0f172a;
          width: fit-content;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .qr-code-svg-wrap svg {
          display: block;
          width: 220px;
          height: 220px;
        }

        .qr-scan-hint {
          font-size: 0.75rem;
          font-weight: 700;
          color: #4f46e5;
          margin-top: 0.4rem;
        }

        .poster-instructions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 0.6rem;
          border-radius: 10px;
          margin-bottom: 0.75rem;
          text-align: left;
        }

        .instruction-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.3rem;
        }

        .step-badge {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.25;
        }

        .step-text strong {
          font-size: 0.75rem;
          color: #0f172a;
        }

        .step-text span {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 2px;
        }

        .poster-url-box {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #eef2ff;
          border: 1px dashed #a5b4fc;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          margin-bottom: 0.6rem;
          font-size: 0.7rem;
          color: #4338ca;
        }

        .poster-footer {
          font-size: 0.7rem;
          font-weight: 600;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.5rem;
        }

        /* STRICT 1-PAGE PRINT MEDIA QUERY */
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
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden !important;
          }

          .requisition-qr-overlay,
          .requisition-qr-modal,
          .requisition-poster-card,
          .requisition-poster-card * {
            visibility: visible !important;
          }

          .requisition-qr-overlay {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
            z-index: 999999 !important;
          }

          .requisition-qr-modal {
            position: static !important;
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            transform: none !important;
          }

          .modal-body {
            padding: 0 !important;
            margin: 0 !important;
          }

          .requisition-poster-card {
            width: 175mm !important;
            max-width: 175mm !important;
            margin: 12mm auto !important;
            padding: 14mm 14mm !important;
            border: 3.5px solid #0f172a !important;
            border-radius: 18px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }

          .qr-code-svg-wrap svg {
            width: 250px !important;
            height: 250px !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
