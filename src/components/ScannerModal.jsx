import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import {
  X,
  QrCode,
  ScanBarcode,
  Package,
  PlusCircle,
  MinusCircle,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  StopCircle,
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const ScannerModal = ({
  isOpen,
  onClose,
  onSelectProductForIn,
  onSelectProductForOut,
}) => {
  const { products, requestersList, lang } = useStock();

  const [scannedCode, setScannedCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [scannedAsset, setScannedAsset] = useState(null);
  const [scannedRequester, setScannedRequester] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  const inputRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setScannedCode('');
      setScannedAsset(null);
      setScannedRequester(null);
      setIsCameraActive(false);
      if (products.length > 0) {
        setSelectedProductId(products[0].id);
      }
      setTimeout(() => inputRef.current?.focus(), 150);
    } else {
      stopCamera();
    }
  }, [isOpen, products]);

  const stopCamera = () => {
    if (html5QrcodeScannerRef.current) {
      try {
        html5QrcodeScannerRef.current.clear();
      } catch (e) {
        console.log('Scanner clear error:', e);
      }
      html5QrcodeScannerRef.current = null;
    }
    setIsCameraActive(false);
  };

  const startCameraScanner = () => {
    setIsCameraActive(true);
    setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          'qr-reader',
          { fps: 10, qrbox: { width: 220, height: 220 } },
          /* verbose= */ false
        );

        scanner.render(
          (decodedText) => {
            setScannedCode(decodedText);
            handleScan(decodedText);
            stopCamera();
          },
          (error) => {
            // silent camera frame scan errors
          }
        );

        html5QrcodeScannerRef.current = scanner;
      } catch (e) {
        console.error('Html5QrcodeScanner start failed:', e);
      }
    }, 100);
  };

  if (!isOpen) return null;

  // Handle Scan Submit or Dropdown Selection
  const handleScan = (code) => {
    const cleanCode = code.trim();
    if (!cleanCode) return;

    // Search matching asset by SKU/Barcode
    const foundAsset = products.find(
      (p) => p.sku.toLowerCase() === cleanCode.toLowerCase() || p.barcode === cleanCode
    );

    // Search matching employee badge by employeeId / name
    const foundRequester = requestersList.find(
      (r) => (r.employeeId && r.employeeId.toLowerCase() === cleanCode.toLowerCase()) || r.name.toLowerCase() === cleanCode.toLowerCase()
    );

    if (foundAsset) {
      setScannedAsset(foundAsset);
      setSelectedProductId(foundAsset.id);
      setScannedRequester(null);
    } else if (foundRequester) {
      setScannedRequester(foundRequester);
      setScannedAsset(null);
    } else {
      setScannedAsset(null);
      setScannedRequester(null);
    }
  };

  const handleDropdownSelect = (pId) => {
    setSelectedProductId(pId);
    const target = products.find((p) => p.id === pId);
    if (target) {
      setScannedAsset(target);
      setScannedCode(target.sku);
      setScannedRequester(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleScan(scannedCode);
    }
  };

  const activeAsset = scannedAsset || products.find(p => p.id === selectedProductId) || products[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-md">
        <div className="modal-header">
          <div className="modal-header-title">
            <QrCode color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'สแกน QR Code จริงผ่านกล้อง หรือเลือก Dropdown' : 'Scan Real QR Code via Camera / Dropdown'}</h2>
          </div>
          <button
            className="close-btn"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Live Camera Scanner Switch Button */}
          <div className="camera-toggle-wrap mb-3">
            {!isCameraActive ? (
              <button className="btn btn-primary w-full" onClick={startCameraScanner}>
                <Camera size={18} />
                {lang === 'th' ? '🎥 เปิดกล้องสแกน QR Code จริง (Start Camera)' : '🎥 Start Live Camera QR Scanner'}
              </button>
            ) : (
              <button className="btn btn-danger w-full" onClick={stopCamera}>
                <StopCircle size={18} />
                {lang === 'th' ? '🛑 ปิดกล้องสแกนเนอร์' : '🛑 Stop Camera'}
              </button>
            )}
          </div>

          {/* Live Webcam Stream Container */}
          {isCameraActive && (
            <div className="camera-viewport-card mb-4 card">
              <div id="qr-reader" style={{ width: '100%' }}></div>
            </div>
          )}

          {/* Scanner Input / USB Gun Listener */}
          {!isCameraActive && (
            <div className="scanner-input-box mb-3">
              <label className="form-label font-bold text-xs mb-1 text-primary">
                {lang === 'th' ? '📷 ช่องพิมพ์รหัส/ยิงเครื่องสแกน QR Code:' : '📷 Scan QR Code Input:'}
              </label>
              <div className="input-with-icon">
                <ScanBarcode className="scan-icon-active text-primary" size={22} />
                <input
                  ref={inputRef}
                  type="text"
                  className="form-control scan-input-lg"
                  placeholder={lang === 'th' ? 'ยิงเครื่องสแกน QR Code หรือพิมพ์รหัส...' : 'Scan QR Code or type SKU / Employee ID...'}
                  value={scannedCode}
                  onChange={(e) => {
                    setScannedCode(e.target.value);
                    handleScan(e.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
            </div>
          )}

          {/* EQUIPMENT DROPDOWN SELECTOR DIRECTLY IN SCANNER */}
          <div className="card dropdown-select-card mb-4">
            <label className="form-label font-bold text-xs mb-1 text-slate">
              <Package size={14} className="inline-icon" />
              {lang === 'th' ? '🔽 หรือเลือกอุปกรณ์สำนักงานจาก Dropdown List:' : '🔽 Or Select Asset from Dropdown List:'}
            </label>
            <select
              className="form-control font-semibold dropdown-select-lg"
              value={selectedProductId}
              onChange={(e) => handleDropdownSelect(e.target.value)}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  📦 {p.name} (Asset Tag: {p.sku} | คงเหลือ: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Select Preset Buttons */}
          <div className="qr-preset-chips mb-4">
            <div className="text-xs font-semibold text-muted mb-1">{lang === 'th' ? 'ทดสอบสแกน QR ด่วน:' : 'Quick Test Scans:'}</div>
            <div className="chip-list">
              {products.slice(0, 3).map(p => (
                <button
                  key={p.id}
                  className={`preset-chip ${activeAsset?.id === p.id ? 'active-chip' : ''}`}
                  onClick={() => {
                    setScannedCode(p.sku);
                    handleScan(p.sku);
                  }}
                >
                  <QrCode size={12} /> {p.sku}
                </button>
              ))}
              {requestersList.slice(0, 1).map(r => (
                <button
                  key={r.id}
                  className="preset-chip chip-user"
                  onClick={() => {
                    setScannedCode(r.employeeId || r.name);
                    handleScan(r.employeeId || r.name);
                  }}
                >
                  <UserCheck size={12} /> {r.employeeId || r.name}
                </button>
              ))}
            </div>
          </div>

          {/* Active Equipment Card */}
          {activeAsset && !scannedRequester && (
            <div className="card scan-result-card border-primary">
              <div className="scan-result-header">
                <CheckCircle2 color="#10b981" size={22} />
                <span className="font-bold text-emerald">
                  {lang === 'th' ? 'อุปกรณ์สำนักงานที่เลือก/สแกนพบ:' : 'Selected / Scanned Office Asset:'}
                </span>
              </div>

              <div className="scan-prod-detail">
                <img src={activeAsset.image} alt={activeAsset.name} className="scan-prod-img" />
                <div>
                  <h3 className="font-bold text-base">{activeAsset.name}</h3>
                  <div className="font-mono text-xs text-primary font-bold">Asset Tag: {activeAsset.sku}</div>
                  <div className="text-xs text-muted">QR Code String: {activeAsset.barcode}</div>
                  <div className="mt-2">
                    <span className={`badge ${activeAsset.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                      {lang === 'th' ? 'คงเหลือในคลัง' : 'In Stock'}: {activeAsset.quantity} {activeAsset.unit}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="scan-actions mt-4">
                <button
                  className="btn btn-danger flex-1 btn-lg"
                  onClick={() => {
                    stopCamera();
                    onSelectProductForOut(activeAsset.id);
                    onClose();
                  }}
                >
                  <MinusCircle size={18} />
                  {lang === 'th' ? 'เบิกจ่ายอุปกรณ์ชิ้นนี้ (-)' : 'Requisition Asset (-)'}
                </button>
                <button
                  className="btn btn-success flex-1 btn-lg"
                  onClick={() => {
                    stopCamera();
                    onSelectProductForIn(activeAsset.id);
                    onClose();
                  }}
                >
                  <PlusCircle size={18} />
                  {lang === 'th' ? 'รับเข้าอุปกรณ์ชิ้นนี้ (+)' : 'Restock Asset (+)'}
                </button>
              </div>
            </div>
          )}

          {/* Scanned Requester Badge Display */}
          {scannedRequester && (
            <div className="card scan-result-card border-info">
              <div className="scan-result-header">
                <UserCheck color="#2563eb" size={22} />
                <span className="font-bold text-blue">
                  {lang === 'th' ? 'พบบัตรพนักงานผู้เบิก!' : 'Employee Requisitioner Badge Found!'}
                </span>
              </div>

              <div className="scan-requester-info">
                <h3 className="font-bold text-base">{scannedRequester.name}</h3>
                <div className="text-xs text-muted">{scannedRequester.department}</div>
                <div className="text-xs text-muted">{scannedRequester.position}</div>
                <div className="font-mono text-xs font-bold text-primary mt-1">
                  ID: {scannedRequester.employeeId}
                </div>
              </div>

              <div className="scan-actions mt-4">
                <button
                  className="btn btn-primary w-full"
                  onClick={() => {
                    stopCamera();
                    onSelectProductForOut(activeAsset?.id || null);
                    onClose();
                  }}
                >
                  <MinusCircle size={16} />
                  {lang === 'th' ? 'เปิดฟอร์มเบิกจ่ายด้วยชื่อพนักงานท่านนี้' : 'Proceed to Requisition Form'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-secondary"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            {lang === 'th' ? 'ปิด' : 'Close'}
          </button>
        </div>
      </div>

      <style>{`
        .modal-md { max-width: 540px; }

        .camera-viewport-card {
          padding: 0.5rem;
          background: #000000;
          overflow: hidden;
        }

        .scan-input-lg {
          padding-left: 2.6rem;
          font-size: 1rem;
          font-weight: 600;
          font-family: monospace;
          border: 2px solid var(--primary-500);
        }

        .input-with-icon {
          position: relative;
        }

        .scan-icon-active {
          position: absolute;
          left: 0.8rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .dropdown-select-card {
          padding: 0.85rem 1rem;
          background: linear-gradient(135deg, var(--bg-surface) 0%, var(--primary-50) 100%);
          border: 1.5px solid var(--primary-500);
        }

        [data-theme="dark"] .dropdown-select-card {
          background: linear-gradient(135deg, var(--bg-surface) 0%, rgba(37, 99, 235, 0.15) 100%);
        }

        .dropdown-select-lg {
          font-size: 0.95rem;
          padding: 0.6rem 0.85rem;
          border-radius: var(--radius-sm);
        }

        .qr-preset-chips {
          background: var(--bg-main);
          padding: 0.75rem;
          border-radius: var(--radius-sm);
        }

        .chip-list {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .preset-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.25rem 0.6rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          font-size: 0.75rem;
          font-family: monospace;
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .preset-chip:hover, .preset-chip.active-chip {
          border-color: var(--primary-500);
          color: var(--primary-600);
          background: var(--primary-50);
        }

        .preset-chip.chip-user {
          border-color: #3b82f6;
          color: #2563eb;
        }

        .scan-result-card {
          padding: 1.25rem;
          background: var(--bg-main);
        }

        .scan-result-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding-bottom: 0.75rem;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 0.85rem;
        }

        .scan-prod-detail {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .scan-prod-img {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }

        .scan-actions {
          display: flex;
          gap: 0.75rem;
        }

        .border-primary { border: 1.5px solid #2563eb; }
        .border-info { border: 1.5px solid #3b82f6; }
        .text-blue { color: #2563eb; }
        .text-slate { color: var(--text-secondary); }
        .flex-1 { flex: 1; }
        .w-full { width: 100%; }
        .font-mono { font-family: monospace; }
        .text-xs { font-size: 0.75rem; }
        .text-sm { font-size: 0.85rem; }
        .text-base { font-size: 1rem; }
        .font-bold { font-weight: 700; }
        .mt-1 { margin-top: 0.25rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
      `}</style>
    </div>
  );
};
