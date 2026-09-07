import React, { useRef, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { X, Printer, QrCode, Building2 } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const BarcodeModal = ({ isOpen, onClose, product }) => {
  const { lang, categories } = useStock();
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

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  const catObj = categories.find(c => c.id === product.category);
  const catName = catObj ? (lang === 'th' ? catObj.nameTh || catObj.name : catObj.name) : 'General';
  const qrSvgHtml = renderQRCodeSVG(product.sku || product.id, 180);

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
                  <span className="tag-label">Asset Tag:</span>
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

          .barcode-tag-overlay,
          .barcode-tag-modal,
          .qr-tag-card,
          .qr-tag-card * {
            visibility: visible !important;
          }

          .barcode-tag-overlay {
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

          .barcode-tag-modal {
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

          .qr-tag-card {
            width: 120mm !important;
            max-width: 120mm !important;
            margin: 20mm auto !important;
            padding: 12mm 10mm !important;
            border: 2.5px solid #0f172a !important;
            border-radius: 12px !important;
            box-sizing: border-box !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
            box-shadow: none !important;
            background: #ffffff !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
