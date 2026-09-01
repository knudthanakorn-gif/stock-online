import React, { useRef } from 'react';
import { useStock } from '../context/StockContext';
import { X, Printer, QrCode, Building2 } from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';

export const BarcodeModal = ({ isOpen, onClose, product }) => {
  const { lang, categories } = useStock();
  const printRef = useRef(null);

  if (!isOpen || !product) return null;

  const handlePrint = () => {
    window.print();
  };

  const catObj = categories.find(c => c.id === product.category);
  const catName = catObj ? (lang === 'th' ? catObj.nameTh || catObj.name : catObj.name) : 'General';
  const qrSvgHtml = renderQRCodeSVG(product.sku || product.id, 150);

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md">
        <div className="modal-header no-print">
          <div className="modal-header-title">
            <QrCode color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'ป้าย QR Code อุปกรณ์สำนักงาน (Asset Tag)' : 'Office Asset QR Tag'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body text-center">
          {/* Printable Tag Card */}
          <div className="qr-tag-card print-area" ref={printRef}>
            <div className="tag-header">
              <Building2 size={16} color="#2563eb" />
              <span className="tag-org-name">OFFICE ASSET QR TAG</span>
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
                  <span className="tag-sku-val font-mono">{product.sku}</span>
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
          border: 2px solid var(--primary-500);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          background: var(--bg-surface);
          box-shadow: var(--shadow-sm);
        }

        .tag-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 0.85rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px dashed var(--border-color);
        }

        .tag-org-name {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          color: var(--primary-600);
        }

        .tag-body {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.85rem;
        }

        .qr-code-svg-wrap {
          padding: 0.5rem;
          background: #ffffff;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .tag-prod-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: 0.35rem;
        }

        .tag-sku-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .cat-chip {
          display: inline-block;
          margin-top: 0.35rem;
          padding: 0.15rem 0.6rem;
          background: var(--primary-50);
          color: var(--primary-600);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .tag-footer {
          margin-top: 0.85rem;
          padding-top: 0.5rem;
          border-top: 1px dashed var(--border-color);
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area {
            position: absolute;
            left: 50%;
            top: 20px;
            transform: translateX(-50%);
            width: 80%;
            border: 2px solid #000;
          }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
