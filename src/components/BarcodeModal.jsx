import React, { useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, Printer, QrCode } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const BarcodeModal = ({ isOpen, onClose, product }) => {
  const { lang, categories } = useStock();
  const printRef = useRef(null);

  if (!isOpen || !product) return null;

  const catObj = categories.find(c => c.id === product.category);
  const catName = catObj ? (lang === 'th' ? catObj.nameTh || catObj.name : catObj.name) : 'General';
  const qrSvgHtml = renderQRCodeSVG(product.sku || product.id, 180);

  // Industry-Standard Isolated Iframe Printing: Guarantees exactly 1 single page tag
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
          <title>Asset_QR_Tag_${product.sku || 'Tag'}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=Prompt:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: A4 portrait;
              margin: 10mm;
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
            }
            .tag-print-wrap {
              width: 100%;
              max-width: 120mm;
              margin: 10mm auto;
              border: 2.5px solid #0f172a;
              border-radius: 12px;
              padding: 10mm 8mm;
              background: #ffffff;
              color: #0f172a;
              text-align: center;
              page-break-inside: avoid;
              break-inside: avoid;
            }
            .tag-header {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              margin-bottom: 10px;
              padding-bottom: 6px;
              border-bottom: 1px dashed #cbd5e1;
            }
            .tag-header img {
              height: 32px;
              width: auto;
              object-fit: contain;
            }
            .tag-org-name {
              font-size: 13px;
              font-weight: 800;
              color: #1e293b;
              line-height: 1.2;
            }
            .tag-body {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 10px;
            }
            .qr-code-svg-wrap {
              padding: 8px;
              background: #ffffff;
              border-radius: 10px;
              border: 2px solid #0f172a;
              display: inline-block;
            }
            .qr-code-svg-wrap svg {
              display: block;
              width: 160px;
              height: 160px;
            }
            .tag-prod-name {
              font-size: 14px;
              font-weight: 800;
              color: #0f172a;
              margin-bottom: 4px;
            }
            .tag-sku-row {
              font-size: 12px;
              color: #334155;
            }
            .cat-chip {
              display: inline-block;
              margin-top: 4px;
              padding: 3px 10px;
              background: #eef2ff;
              color: #4f46e5;
              border-radius: 9999px;
              font-size: 11px;
              font-weight: 700;
            }
            .tag-footer {
              margin-top: 10px;
              padding-top: 6px;
              border-top: 1px dashed #cbd5e1;
              font-size: 10px;
              color: #64748b;
            }
          </style>
        </head>
        <body>
          <div class="tag-print-wrap">
            ${printContent.innerHTML}
          </div>
        </body>
      </html>
    `);
    doc.close();

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
    <div className="modal-overlay barcode-tag-overlay">
      <div className="modal-content modal-md barcode-tag-modal">
        <div className="modal-header no-print">
          <div className="modal-header-title">
            <QrCode color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'ป้าย QR Code อุปกรณ์สำนักงาน (Asset Tag)' : 'Office Asset QR Tag'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-center" style={{ padding: '1rem' }}>
          {/* Printable Tag Card */}
          <div className="qr-tag-card" ref={printRef}>
            <div className="tag-header">
              <img src="/logo.png" alt="EXION" style={{ height: '32px', width: 'auto', objectFit: 'contain' }} />
              <div style={{ textAlign: 'left' }}>
                <div className="tag-org-name">EXION (THAILAND) CO., LTD.</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>OFFICE ASSET QR TAG</div>
              </div>
            </div>

            <div className="tag-body">
              {/* QR Code Container */}
              <div
                className="qr-code-svg-wrap"
                dangerouslySetInnerHTML={{ __html: qrSvgHtml }}
              />

              <div className="tag-details">
                <div className="tag-prod-name">{product.name}</div>
                <div className="tag-sku-row">
                  <span className="tag-label">Asset Tag: </span>
                  <span className="tag-sku-val font-mono font-bold text-primary">{product.sku}</span>
                </div>
                <div className="tag-cat-row">
                  <span className="cat-chip">{catName}</span>
                </div>
              </div>
            </div>

            <div className="tag-footer">
              <span>Scan QR Code to Requisition Office Equipment</span>
            </div>
          </div>
        </div>

        <div className="modal-footer no-print">
          <button className="btn btn-secondary" onClick={onClose}>
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
          <button className="btn btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            {lang === 'th' ? 'พิมพ์ป้าย QR Code (Print Tag)' : 'Print QR Tag'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-md { max-width: 450px; }
        .qr-tag-card {
          border: 2px solid #2563eb;
          border-radius: 12px;
          padding: 1.25rem;
          background: #ffffff;
          box-shadow: var(--shadow-sm);
          color: #0f172a;
          margin: 0 auto;
          max-width: 360px;
        }

        .tag-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          margin-bottom: 0.85rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed #cbd5e1;
        }

        .tag-org-name {
          font-size: 0.82rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          color: #1e293b;
          line-height: 1.2;
        }

        .tag-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
        }

        .qr-code-svg-wrap {
          padding: 0.6rem;
          background: #ffffff;
          border-radius: 10px;
          border: 2px solid #0f172a;
        }

        .qr-code-svg-wrap svg {
          display: block;
          width: 150px;
          height: 150px;
        }

        .tag-prod-name {
          font-size: 0.95rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }

        .tag-sku-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: #334155;
        }

        .cat-chip {
          display: inline-block;
          margin-top: 0.25rem;
          padding: 0.15rem 0.6rem;
          background: #eef2ff;
          color: #4f46e5;
          border-radius: 9999px;
          font-size: 0.72rem;
          font-weight: 700;
        }

        .tag-footer {
          margin-top: 0.75rem;
          padding-top: 0.5rem;
          border-top: 1px dashed #cbd5e1;
          font-size: 0.68rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};
