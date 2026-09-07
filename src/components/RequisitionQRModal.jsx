import React, { useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, QrCode, Printer, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const RequisitionQRModal = ({ isOpen, onClose }) => {
  const { lang } = useStock();
  const printRef = useRef(null);

  if (!isOpen) return null;

  // Generate URL for Opening Main Portal / Login Page
  const portalUrl = typeof window !== 'undefined' ? `${window.location.origin}/?action=login` : 'https://stock-online-mauve.vercel.app/?action=login';
  const qrSvgHtml = renderQRCodeSVG(portalUrl, 200);

  // Industry-Standard Isolated Iframe Printing: Guarantees 100% strictly 1 single A4 page
  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.zIndex = '-1';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="th">
        <head>
          <meta charset="utf-8">
          <title>EXION_Stock_Online_Requisition_QR_Poster</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Prompt:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 0mm !important;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              height: auto !important;
              min-height: 0 !important;
              max-height: 100% !important;
              overflow: hidden !important;
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Plus Jakarta Sans', 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            .poster-print-wrap {
              width: 175mm;
              max-width: 175mm;
              margin: 12mm auto 0 auto !important;
              padding: 8mm 12mm;
              border: 3px solid #0f172a;
              border-radius: 16px;
              text-align: center;
              background: #ffffff;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              page-break-after: avoid !important;
              break-after: avoid !important;
              page-break-before: avoid !important;
              break-before: avoid !important;
            }
            .poster-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 12px;
              margin-bottom: 4px;
            }
            .poster-logo-img {
              height: 42px;
              width: auto;
              object-fit: contain;
            }
            .poster-header-text {
              text-align: left;
            }
            .poster-company-name {
              font-size: 14px;
              font-weight: 900;
              color: #0f172a;
              line-height: 1.2;
            }
            .poster-portal-title {
              font-size: 10px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 0.5px;
            }
            .poster-divider {
              height: 2px;
              background: #4f46e5;
              margin: 6px 0 10px 0;
            }
            .poster-main-badge {
              display: inline-block;
              background: #4f46e5;
              color: #ffffff;
              padding: 5px 16px;
              border-radius: 9999px;
              font-size: 13px;
              font-weight: 800;
              letter-spacing: 0.3px;
              margin-bottom: 4px;
            }
            .poster-sub-desc {
              font-size: 11px;
              color: #64748b;
              margin: 0 0 10px 0;
              font-weight: 600;
            }
            .poster-qr-container {
              margin: 0 auto 10px auto;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-code-svg-wrap {
              padding: 8px;
              background: #ffffff;
              border-radius: 12px;
              border: 2px solid #0f172a;
              display: inline-block;
            }
            .qr-code-svg-wrap svg {
              display: block;
              width: 190px;
              height: 190px;
            }
            .qr-scan-hint {
              font-size: 11px;
              font-weight: 800;
              color: #4f46e5;
              margin-top: 4px;
            }
            .poster-instructions {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 6px;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              padding: 8px 6px;
              border-radius: 8px;
              margin-bottom: 8px;
              text-align: center;
            }
            .instruction-step {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 2px;
            }
            .step-badge {
              width: 20px;
              height: 20px;
              border-radius: 50%;
              background: #4f46e5;
              color: #ffffff;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 11px;
              font-weight: 800;
            }
            .step-text strong {
              display: block;
              font-size: 10.5px;
              color: #0f172a;
              font-weight: 800;
            }
            .step-text span {
              display: block;
              font-size: 9.5px;
              color: #64748b;
              margin-top: 1px;
              line-height: 1.2;
            }
            .poster-url-box {
              display: inline-block;
              background: #eef2ff;
              border: 1px dashed #a5b4fc;
              padding: 3px 12px;
              border-radius: 5px;
              margin-bottom: 6px;
              font-size: 10px;
              font-family: 'JetBrains Mono', monospace;
              color: #4338ca;
              font-weight: 700;
            }
            .poster-footer {
              font-size: 10px;
              font-weight: 600;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 6px;
            }
          </style>
        </head>
        <body>
          <div class="poster-print-wrap">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Ensure iframe document is rendered before triggering print
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2000);
    }, 250);
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

        <div className="modal-body text-center" style={{ padding: '0.85rem' }}>
          {/* Printable QR Code Poster Card */}
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
              <span className="poster-url-text">{portalUrl}</span>
            </div>

            {/* Poster Footer */}
            <div className="poster-footer">
              <span>ระบบบริหารจัดการคลังพัสดุและเบิกจ่ายอุปกรณ์สำนักงาน (Stock Online)</span>
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
        .modal-md { max-width: 500px; }

        .requisition-poster-card {
          background: #ffffff;
          border: 2px solid #4f46e5;
          border-radius: 14px;
          padding: 1.1rem 1rem;
          box-shadow: 0 8px 20px -4px rgba(79, 70, 229, 0.12);
          color: #0f172a;
          text-align: center;
        }

        .poster-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.85rem;
          margin-bottom: 0.4rem;
        }

        .poster-logo-img {
          height: 40px;
          width: auto;
          object-fit: contain;
        }

        .poster-header-text {
          text-align: left;
        }

        .poster-company-name {
          font-size: 0.88rem;
          font-weight: 900;
          color: #0f172a;
          letter-spacing: -0.01em;
          line-height: 1.2;
        }

        .poster-portal-title {
          font-size: 0.65rem;
          font-weight: 700;
          color: #4f46e5;
          letter-spacing: 0.04em;
        }

        .poster-divider {
          height: 2px;
          background: linear-gradient(90deg, #4f46e5 0%, #06b6d4 100%);
          margin: 0.4rem 0 0.65rem 0;
          border-radius: 2px;
        }

        .poster-main-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #4f46e5;
          color: #ffffff;
          padding: 0.35rem 0.9rem;
          border-radius: 9999px;
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);
          margin-bottom: 0.3rem;
        }

        .poster-sub-desc {
          font-size: 0.72rem;
          color: #64748b;
          margin: 0 0 0.65rem 0;
          font-weight: 500;
        }

        .poster-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 auto 0.65rem auto;
        }

        .qr-code-svg-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.55rem;
          background: #ffffff;
          border-radius: 12px;
          border: 2px solid #0f172a;
          width: fit-content;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
        }

        .qr-code-svg-wrap svg {
          display: block;
          width: 180px;
          height: 180px;
        }

        .qr-scan-hint {
          font-size: 0.72rem;
          font-weight: 700;
          color: #4f46e5;
          margin-top: 0.3rem;
        }

        .poster-instructions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.35rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.55rem 0.45rem;
          border-radius: 8px;
          margin-bottom: 0.55rem;
          text-align: left;
        }

        .instruction-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.2rem;
        }

        .step-badge {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #4f46e5;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.68rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .step-text strong {
          font-size: 0.68rem;
          color: #0f172a;
        }

        .step-text span {
          font-size: 0.58rem;
          color: #64748b;
          margin-top: 1px;
        }

        .poster-url-box {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #eef2ff;
          border: 1px dashed #a5b4fc;
          padding: 0.15rem 0.55rem;
          border-radius: 5px;
          margin-bottom: 0.4rem;
          font-size: 0.65rem;
          font-family: var(--font-mono);
          color: #4338ca;
        }

        .poster-footer {
          font-size: 0.65rem;
          font-weight: 600;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.35rem;
        }
      `}</style>
    </div>
  );
};
