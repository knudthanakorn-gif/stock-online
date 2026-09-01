import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import {
  X,
  QrCode,
  ScanBarcode,
  Package,
  MinusCircle,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building,
  ChevronDown,
  Edit3,
  Smartphone,
} from 'lucide-react';

const COMPANY_PRESETS = ['EXION (THAILAND) COMPANY LIMITED'];

const DEPARTMENT_PRESETS = [
  'แผนก IT / เทคโนโลยีสารสนเทศ',
  'แผนกบัญชีและการเงิน',
  'ฝ่ายขายและการตลาด',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายผลิตและปฏิบัติการ',
  'ฝ่ายจัดซื้อและคลังสินค้า',
  'ฝ่ายบริหารและจัดการ',
];

export const ScanRequisitionModal = ({ isOpen, onClose }) => {
  const { products, requestersList, recordStockMovement, lang, user } = useStock();

  // Mode: 'QR_SCAN' or 'MANUAL_ENTRY'
  const [entryMode, setEntryMode] = useState('MANUAL_ENTRY');

  // Requisitioner cascading entry states: Company -> Department -> Name -> Position
  const [requesterCompany, setRequesterCompany] = useState('EXION (THAILAND) COMPANY LIMITED');
  const [requesterDept, setRequesterDept] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterPosition, setRequesterPosition] = useState('');

  // Equipment & Requisition states
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [purpose, setPurpose] = useState('DAILY');
  const [refNo, setRefNo] = useState('');
  const [note, setNote] = useState('');

  const [scannedQRText, setScannedQRText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const qrInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSuccessMsg('');
      setQuantity('1');
      setNote('');
      setScannedQRText('');
      setRefNo(`REQ-OFF-${Math.floor(1000 + Math.random() * 9000)}`);
      if (user) {
        setRequesterName(user.name || '');
        setRequesterCompany(user.company || 'EXION (THAILAND) COMPANY LIMITED');
        setRequesterDept(user.department || '');
        setRequesterPosition(user.position || '');
      } else {
        setRequesterName('');
        setRequesterCompany('EXION (THAILAND) COMPANY LIMITED');
        setRequesterDept('');
        setRequesterPosition('');
      }
      if (products && products.length > 0 && !selectedProductId) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [isOpen, products, user]);

  if (!isOpen) return null;

  // Dynamic Companies List
  const availableCompanies = Array.from(
    new Set([
      'EXION (THAILAND) COMPANY LIMITED',
      ...requestersList.map((r) => r.company).filter(Boolean),
    ])
  );

  // Cascading Filter: Filter departments by company
  const availableDepts = Array.from(
    new Set(
      requestersList
        .filter((r) => !requesterCompany || (r.company || 'EXION (THAILAND) COMPANY LIMITED') === requesterCompany)
        .map((r) => r.department)
        .filter(Boolean)
    )
  );

  const finalDeptList = Array.from(new Set([...availableDepts, ...DEPARTMENT_PRESETS]));

  // Cascading Filter: Filter names by company & department
  const availableRequesters = requestersList.filter((r) => {
    const matchCompany = !requesterCompany || (r.company || 'EXION (THAILAND) COMPANY LIMITED') === requesterCompany;
    const matchDept = !requesterDept || r.department === requesterDept;
    return matchCompany && matchDept;
  });

  // Auto fill position when selecting a registered requester
  const handleNameChange = (val) => {
    setRequesterName(val);
    const matched = requestersList.find((r) => r.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      if (matched.company) setRequesterCompany(matched.company);
      if (matched.department) setRequesterDept(matched.department);
      if (matched.position) setRequesterPosition(matched.position);
    }
  };

  // Handle QR Scan at Desk/Station
  const handleQRScan = (code) => {
    const clean = code.trim();
    if (!clean) return;
    setScannedQRText(clean);

    const matched = requestersList.find(
      (r) => r.name.toLowerCase().includes(clean.toLowerCase())
    );

    if (matched) {
      setRequesterCompany(matched.company || 'EXION (THAILAND) COMPANY LIMITED');
      setRequesterName(matched.name);
      setRequesterDept(matched.department || '');
      setRequesterPosition(matched.position || '');
    } else {
      setRequesterName(clean);
    }
  };

  // Submit Requisition
  const handleSubmitRequisition = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const finalRequesterName = user?.name || requesterName.trim() || 'พนักงาน';
    const finalCompany = user?.company || requesterCompany.trim() || 'EXION (THAILAND) COMPANY LIMITED';
    const finalDept = user?.department || requesterDept.trim() || '';
    const finalPosition = user?.position || requesterPosition.trim() || '';

    const targetProduct = products.find((p) => p.id === selectedProductId);
    if (!targetProduct) {
      setErrorMsg(lang === 'th' ? 'กรุณาเลือกอุปกรณ์ที่จะเบิกจาก Dropdown List' : 'Please select equipment');
      return;
    }

    const qtyNum = Number(quantity);
    if (!qtyNum || qtyNum <= 0) {
      setErrorMsg(lang === 'th' ? 'จำนวนที่เบิกต้องมากกว่า 0' : 'Quantity must be > 0');
      return;
    }

    if (qtyNum > targetProduct.quantity) {
      setErrorMsg(
        lang === 'th'
          ? `จำนวนอุปกรณ์คงเหลือไม่พอ (คงเหลือในคลัง ${targetProduct.quantity} ${targetProduct.unit})`
          : 'Insufficient stock balance'
      );
      return;
    }

    try {
      const customerFormatted = `${finalRequesterName} (${finalCompany}${finalDept ? ` - ${finalDept}` : ''}${finalPosition ? ` - ${finalPosition}` : ''})`;

      recordStockMovement({
        productId: targetProduct.id,
        type: 'OUT',
        quantity: qtyNum,
        unitPrice: targetProduct.sellingPrice,
        customer: customerFormatted,
        requesterName: finalRequesterName,
        requesterCompany: finalCompany,
        requesterDept: finalDept,
        requesterPosition: finalPosition,
        purpose,
        refNo: refNo || `REQ-OFF-${Date.now().toString().slice(-4)}`,
        note: note.trim() ? `[เบิกผ่านคีออสสำนักงาน] ${note.trim()}` : `[เบิกอุปกรณ์สำนักงาน] ${targetProduct.name}`,
      });

      setSuccessMsg(
        lang === 'th'
          ? `🎉 บันทึกการเบิก "${targetProduct.name}" จำนวน ${qtyNum} ${targetProduct.unit} ให้แก่คุณ "${finalRequesterName}" (${finalCompany}) สำเร็จ!`
          : `🎉 Successfully recorded requisition of ${targetProduct.name} for ${finalRequesterName}!`
      );

      // Reset form
      setTimeout(() => {
        setRequesterName('');
        setSuccessMsg('');
        setRefNo(`REQ-OFF-${Math.floor(1000 + Math.random() * 9000)}`);
      }, 2500);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <div className="modal-header-title">
            <Smartphone color="#2563eb" size={24} />
            <h2>{lang === 'th' ? 'ฟอร์มขอเบิกจ่ายอุปกรณ์สำนักงาน (Scan QR Portal)' : 'Office Asset Requisition Form'}</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmitRequisition}>
          <div className="modal-body">
            {errorMsg && (
              <div className="alert-box alert-danger mb-4">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="alert-box alert-success mb-4">
                <CheckCircle2 size={18} />
                <span>{successMsg}</span>
              </div>
            )}
            {/* REQUISITIONER DETAILS PANEL */}
            {user ? (
              <div className="card mb-4 p-3" style={{ background: 'var(--bg-main)', border: '1.5px solid var(--border-color)' }}>
                <div className="flex-between mb-2">
                  <div className="font-bold text-sm text-primary flex-center gap-2">
                    <UserCheck size={18} color="#4f46e5" />
                    <span>{lang === 'th' ? 'ข้อมูลผู้ขอเบิก (ดึงข้อมูลอัตโนมัติจากการเข้าสู่ระบบ)' : 'Requester Information'}</span>
                  </div>
                  <span className="badge badge-success text-xxs font-bold">
                    <CheckCircle2 size={12} /> ยืนยันตัวตนแล้ว
                  </span>
                </div>

                <div className="p-3 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                  <div className="flex-center gap-3">
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #bfdbfe',
                      }}
                    >
                      <UserCheck size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex-center gap-2 flex-wrap">
                        <span className="font-extrabold text-primary" style={{ fontSize: '0.98rem' }}>
                          {user.name}
                        </span>
                        {user.employeeCode && (
                          <span className="badge badge-primary font-mono text-xxs font-bold">
                            {user.employeeCode}
                          </span>
                        )}
                        {user.role && (
                          <span className="badge badge-info text-xxs font-bold">
                            {user.role === 'admin' ? 'ผู้ดูแลระบบ' : user.role === 'staff' ? 'เจ้าหน้าที่คลัง' : 'ผู้ขอเบิก'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted flex items-center gap-2 flex-wrap mt-1">
                        <span style={{ fontWeight: 600, color: '#1e40af' }}>🏢 {user.company || 'EXION THAILAND'}</span>
                        {user.department && (
                          <>
                            <span className="text-muted">•</span>
                            <span>📁 {user.department}</span>
                          </>
                        )}
                        {user.position && (
                          <>
                            <span className="text-muted">•</span>
                            <span>💼 {user.position}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card requester-panel-lg mb-4">
                <div className="panel-title-bar mb-3">
                  <UserCheck color="#2563eb" size={18} />
                  <span className="font-bold text-sm text-primary">
                    {lang === 'th' ? '👤 ลำดับเลือกผู้เบิก (1. บริษัท ➔ 2. แผนก ➔ 3. ชื่อผู้เบิก)' : 'Requisitioner Selection Hierarchy'}
                  </span>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label font-bold">
                      1️⃣ {lang === 'th' ? 'เลือกชื่อบริษัท *' : '1. Select Company *'}
                    </label>
                    <select
                      className="form-control font-bold"
                      value={requesterCompany}
                      onChange={(e) => {
                        setRequesterCompany(e.target.value);
                        setRequesterDept('');
                        setRequesterName('');
                      }}
                      required
                    >
                      {availableCompanies.map((comp, i) => (
                        <option key={i} value={comp}>🏢 {comp}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label font-bold">
                      2️⃣ {lang === 'th' ? 'เลือกแผนกหรือฝ่าย *' : '2. Select Department *'}
                    </label>
                    <select
                      className="form-control"
                      value={requesterDept}
                      onChange={(e) => {
                        setRequesterDept(e.target.value);
                        setRequesterName('');
                      }}
                    >
                      <option value="">{lang === 'th' ? '-- เลือกแผนก/ฝ่าย --' : '-- Select Department --'}</option>
                      {finalDeptList.map((dept, i) => (
                        <option key={i} value={dept}>📁 {dept}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label font-bold">
                      3️⃣ {lang === 'th' ? 'เลือกชื่อ - นามสกุล ผู้เบิก *' : '3. Select Requester Name *'}
                    </label>
                    <select
                      className="form-control font-semibold"
                      value={requesterName}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    >
                      <option value="">{lang === 'th' ? '-- เลือกพนักงานผู้เบิก --' : '-- Select Requester Name --'}</option>
                      {availableRequesters.map((r, i) => (
                        <option key={i} value={r.name}>
                          👤 {r.name} ({r.company || 'EXION (THAILAND) COMPANY LIMITED'}{r.department ? ` - ${r.department}` : ''})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{lang === 'th' ? 'ตำแหน่งงาน' : 'Position'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="เช่น Senior Developer / เจ้าหน้าที่ฝ่ายบัญชี"
                      value={requesterPosition}
                      onChange={(e) => setRequesterPosition(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* MAIN EQUIPMENT DROPDOWN SELECTOR */}
            <div className="form-group mb-4">
              <label className="form-label font-bold text-base text-primary mb-1">
                📦 {lang === 'th' ? 'เลือกอุปกรณ์ที่จะเบิก (Equipment Dropdown List) *' : 'Select Equipment from Dropdown List *'}
              </label>
              <select
                className="form-control dropdown-select-hero"
                value={selectedProductId || (products[0]?.id || '')}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
              >
                <option value="">{lang === 'th' ? '-- เลือกอุปกรณ์ที่จะเบิก --' : '-- Select Equipment --'}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    📦 {p.name} (Asset Tag: {p.sku} | คงเหลือในคลัง: {p.quantity} {p.unit})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Equipment Stock Preview */}
            {selectedProduct && (
              <div className="prod-stock-preview mb-4">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="preview-thumb" />
                <div className="preview-info">
                  <div className="font-bold text-sm">{selectedProduct.name}</div>
                  <div className="text-xs text-muted">
                    Asset Tag: <span className="font-mono">{selectedProduct.sku}</span> | Barcode: {selectedProduct.barcode}
                  </div>
                  <div className="text-xs mt-1">
                    {lang === 'th' ? 'จำนวนคงเหลือที่เบิกได้ขณะนี้:' : 'Available Stock:'}{' '}
                    <strong className={selectedProduct.quantity === 0 ? 'text-red' : 'text-emerald'}>
                      {selectedProduct.quantity} {selectedProduct.unit}
                    </strong>
                  </div>
                </div>
              </div>
            )}

            {/* Quantity & Purpose Grid */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'จำนวนที่ต้องการเบิก *' : 'Quantity *'}</label>
                <input
                  type="number"
                  className="form-control font-bold"
                  min="1"
                  max={selectedProduct?.quantity || 1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'วัตถุประสงค์ในการเบิก' : 'Requisition Purpose'}</label>
                <select
                  className="form-control"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                >
                  <option value="DAILY">{lang === 'th' ? '💻 ใช้งานประจำวันในสำนักงาน' : 'Daily Office Use'}</option>
                  <option value="ONBOARDING">{lang === 'th' ? '👤 อุปกรณ์พนักงานใหม่ (Onboarding)' : 'New Employee Onboarding'}</option>
                  <option value="PROJECT">{lang === 'th' ? '🚀 โครงการพิเศษ / ประชุม' : 'Project / Event'}</option>
                  <option value="REPLACEMENT">{lang === 'th' ? '🛠️ เบิกทดแทนของเดิมชำรุด' : 'Replacement'}</option>
                </select>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-danger btn-lg flex-1">
              <MinusCircle size={18} />
              {lang === 'th' ? `บันทึกเบิกจ่าย "${selectedProduct?.name}" (ตัดสต็อก)` : 'Confirm Requisition & Deduct Stock'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-lg { max-width: 640px; }

        .type-toggle-group {
          display: flex;
          gap: 0.5rem;
          background: var(--bg-main);
          padding: 0.3rem;
          border-radius: var(--radius-sm);
        }

        .type-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          padding: 0.6rem;
          border: none;
          background: transparent;
          font-family: var(--font-family);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-sm);
          transition: all 0.15s ease;
        }

        .type-tab.active-in {
          background: var(--primary-600);
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        }

        .scan-input-lg {
          padding-left: 2.8rem;
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
          left: 0.85rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .requester-panel-lg {
          background: var(--primary-50);
          border: 1.5px solid var(--primary-500);
          padding: 1.1rem;
          box-sizing: border-box;
          width: 100%;
          max-width: 100%;
          border-radius: var(--radius-md);
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.85rem;
          width: 100%;
          box-sizing: border-box;
        }

        .form-grid > * {
          min-width: 0;
          max-width: 100%;
          box-sizing: border-box;
        }

        @media (max-width: 540px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        [data-theme="dark"] .requester-panel-lg {
          background: rgba(37, 99, 235, 0.12);
        }

        .panel-title-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .dropdown-select-hero {
          font-size: 1rem;
          padding: 0.75rem 1rem;
          border: 2px solid var(--primary-500);
          border-radius: var(--radius-md);
          font-weight: 700;
          background-color: var(--bg-surface);
        }

        .prod-stock-preview {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          background: var(--bg-main);
          padding: 0.85rem 1rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
        }

        .preview-thumb {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-sm);
          object-fit: cover;
        }

        .alert-success {
          background: var(--success-bg);
          color: var(--success-text);
          border: 1px solid var(--success-border);
        }

        .text-red { color: #ef4444; }
        .text-emerald { color: #10b981; }
        .text-xs { font-size: 0.78rem; }
        .text-sm { font-size: 0.85rem; }
        .text-base { font-size: 1rem; }
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: 700; }
        .flex-1 { flex: 1; }
        .mb-1 { margin-bottom: 0.25rem; }
        .mb-3 { margin-bottom: 0.75rem; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-1 { margin-top: 0.25rem; }
      `}</style>
    </div>
  );
};
