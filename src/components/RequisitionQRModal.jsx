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
  const qrSvgHtml = renderQRCodeSVG(portalUrl, 240);

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
              margin: 8mm;
            }
            * {
              box-sizing: border-box;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            html, body {
              margin: 0;
              padding: 0;
              background: #ffffff;
              color: #0f172a;
              font-family: 'Plus Jakarta Sans', 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              height: 100%;
            }
            .poster-print-wrap {
              width: 100%;
              max-width: 185mm;
              margin: 4mm auto;
              padding: 10mm 14mm;
              border: 3px solid #0f172a;
              border-radius: 18px;
              text-align: center;
              page-break-inside: avoid;
              break-inside: avoid;
              box-sizing: border-box;
            }
            .poster-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 14px;
              margin-bottom: 6px;
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
              font-size: 15px;
              font-weight: 900;
              color: #0f172a;
              line-height: 1.2;
            }
            .poster-portal-title {
              font-size: 11px;
              font-weight: 800;
              color: #4f46e5;
              letter-spacing: 0.5px;
            }
            .poster-divider {
              height: 2px;
              background: #4f46e5;
              margin: 8px 0 12px 0;
            }
            .poster-main-badge {
              display: inline-block;
              background: #4f46e5;
              color: #ffffff;
              padding: 6px 18px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: 800;
              letter-spacing: 0.3px;
              margin-bottom: 4px;
            }
            .poster-sub-desc {
              font-size: 12px;
              color: #64748b;
              margin: 0 0 12px 0;
              font-weight: 600;
            }
            .poster-qr-container {
              margin: 0 auto 12px auto;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .qr-code-svg-wrap {
              padding: 10px;
              background: #ffffff;
              border-radius: 14px;
              border: 2.5px solid #0f172a;
              display: inline-block;
            }
            .qr-code-svg-wrap svg {
              display: block;
              width: 230px;
              height: 230px;
            }
            .qr-scan-hint {
              font-size: 12px;
              font-weight: 800;
              color: #4f46e5;
              margin-top: 6px;
            }
            .poster-instructions {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 8px;
              background: #f8fafc;
              border: 1.5px solid #e2e8f0;
              padding: 10px 8px;
              border-radius: 10px;
              margin-bottom: 10px;
              text-align: center;
            }
            .instruction-step {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 3px;
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
              font-size: 12px;
              font-weight: 800;
            }
            .step-text strong {
              display: block;
              font-size: 11px;
              color: #0f172a;
              font-weight: 800;
            }
            .step-text span {
              display: block;
              font-size: 10px;
              color: #64748b;
              margin-top: 2px;
              line-height: 1.25;
            }
            .poster-url-box {
              display: inline-block;
              background: #eef2ff;
              border: 1px dashed #a5b4fc;
              padding: 4px 14px;
              border-radius: 6px;
              margin-bottom: 8px;
              font-size: 11px;
              font-family: 'JetBrains Mono', monospace;
              color: #4338ca;
              font-weight: 700;
            }
            .poster-footer {
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              border-top: 1px solid #e2e8f0;
              padding-top: 8px;
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

    // Ensure assets / fonts are ready before opening print dialog
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch (e) {}
      }, 2000);
    }, 300);
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
        .modal-md { max-width: 520px; }

        .requisition-poster-card {
          background: #ffffff;
          border: 2px solid #4f46e5;
          border-radius: 16px;
          padding: 1.25rem 1.1rem;
          box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.15);
          color: #0f172a;
          text-align: center;
        }

        .poster-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }

        .poster-logo-img {
          height: 44px;
          width: auto;
          object-fit: contain;
        }

        .poster-header-text {
          text-align: left;
        }

        .poster-company-name {
          font-size: 0.92rem;
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
          margin: 0.5rem 0 0.75rem 0;
          border-radius: 2px;
        }

        .poster-main-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #4f46e5;
          color: #ffffff;
          padding: 0.4rem 1rem;
          border-radius: 9999px;
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3);
          margin-bottom: 0.35rem;
        }

        .poster-sub-desc {
          font-size: 0.74rem;
          color: #64748b;
          margin: 0 0 0.75rem 0;
          font-weight: 500;
        }

        .poster-qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin: 0 auto 0.75rem auto;
        }

        .qr-code-svg-wrap {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 0.65rem;
          background: #ffffff;
          border-radius: 14px;
          border: 2px solid #0f172a;
          width: fit-content;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }

        .qr-code-svg-wrap svg {
          display: block;
          width: 200px;
          height: 200px;
        }

        .qr-scan-hint {
          font-size: 0.74rem;
          font-weight: 700;
          color: #4f46e5;
          margin-top: 0.35rem;
        }

        .poster-instructions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.4rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.65rem 0.5rem;
          border-radius: 10px;
          margin-bottom: 0.65rem;
          text-align: left;
        }

        .instruction-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 0.25rem;
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
          font-size: 0.72rem;
          font-weight: 800;
          flex-shrink: 0;
        }

        .step-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .step-text strong {
          font-size: 0.72rem;
          color: #0f172a;
        }

        .step-text span {
          font-size: 0.62rem;
          color: #64748b;
          margin-top: 1px;
        }

        .poster-url-box {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          background: #eef2ff;
          border: 1px dashed #a5b4fc;
          padding: 0.2rem 0.65rem;
          border-radius: 6px;
          margin-bottom: 0.5rem;
          font-size: 0.68rem;
          font-family: var(--font-mono);
          color: #4338ca;
        }

        .poster-footer {
          font-size: 0.68rem;
          font-weight: 600;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.4rem;
        }
      `}</style>
    </div>
  );
};
