import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import {
  X,
  PlusCircle,
  MinusCircle,
  UserCheck,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Plus,
  Minus,
  FileText,
  Printer,
  Eye,
  ExternalLink,
  FileCheck2,
} from 'lucide-react';

const DEPARTMENT_PRESETS = [
  'แผนก IT / เทคโนโลยีสารสนเทศ',
  'แผนกบัญชีและการเงิน',
  'ฝ่ายขายและการตลาด',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายผลิตและปฏิบัติการ',
  'ฝ่ายจัดซื้อและคลังสินค้า',
  'ฝ่ายบริหารและจัดการ',
];

const PURPOSE_PRESETS = [
  { id: 'DAILY', labelTh: '💻 ใช้งานประจำวันในสำนักงาน', labelEn: 'Daily Office Use' },
  { id: 'ONBOARDING', labelTh: '👤 อุปกรณ์สำหรับพนักงานใหม่ (Onboarding)', labelEn: 'New Employee Onboarding' },
  { id: 'PROJECT', labelTh: '🚀 โครงการพิเศษ / ประชุมภายนอก', labelEn: 'Project / External Event' },
  { id: 'REPLACEMENT', labelTh: '🛠️ เบิกทดแทนอุปกรณ์เดิมชำรุด', labelEn: 'Replacement for Damaged Asset' },
];

export const StockMovementModal = ({ isOpen, onClose, initialType = 'IN', preselectedProductId = null }) => {
  const { products = [], categories = [], suppliers = [], requestersList = [], batchImportRequesters, recordStockMovement, lang, user } = useStock();

  const [type, setType] = useState(initialType); // 'IN' or 'OUT'
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [outUnitPrice, setOutUnitPrice] = useState('0');
  const [supplierId, setSupplierId] = useState('');

  // INVOICE PDF ATTACHMENT STATE
  const [invoicePdf, setInvoicePdf] = useState(null);
  const [previewModalPdf, setPreviewModalPdf] = useState(null);
  const pdfInputRef = useRef(null);

  // MULTI-ITEM RECEIVING STATE (for type === 'IN')
  const [inItems, setInItems] = useState([
    { id: '1', productId: preselectedProductId || (products[0]?.id || ''), quantity: 1, unitPrice: products[0]?.costPrice || 0 }
  ]);

  // Requisitioner Cascading Hierarchy (for type === 'OUT')
  const [requesterCompany, setRequesterCompany] = useState('EXION THAILAND');
  const [requesterDept, setRequesterDept] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterPosition, setRequesterPosition] = useState('');
  const [purpose, setPurpose] = useState('DAILY');

  const [refNo, setRefNo] = useState('');
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [importStatusMsg, setImportStatusMsg] = useState('');

  const [submittedInTicket, setSubmittedInTicket] = useState(null);

  const csvInputRef = useRef(null);

  useEffect(() => {
    setType(initialType);
    setErrorMsg('');
    setImportStatusMsg('');
    setSubmittedInTicket(null);
    setInvoicePdf(null);
    setPreviewModalPdf(null);

    if (isOpen) {
      setRequesterCompany('EXION THAILAND');
      setRequesterDept('');
      setRequesterName('');
      setRequesterPosition('');
      setRefNo('');
      setNote('');

      const defaultProdId = preselectedProductId || (products[0]?.id || '');
      const defaultProd = products.find(p => p.id === defaultProdId);
      setProductId(defaultProdId);
      setOutUnitPrice((defaultProd?.costPrice || defaultProd?.sellingPrice || 0).toString());
      setInItems([{ id: Date.now().toString(), productId: defaultProdId, quantity: 1, unitPrice: defaultProd?.costPrice || 0 }]);
    }
  }, [isOpen, initialType, preselectedProductId, products]);

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === productId);

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

  const handleNameChange = (val) => {
    setRequesterName(val);
    const matched = requestersList.find((r) => r.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      if (matched.company) setRequesterCompany(matched.company);
      if (matched.department) setRequesterDept(matched.department);
      if (matched.position) setRequesterPosition(matched.position);
    }
  };

  // MULTI-ITEM RECEIVING HANDLERS
  const handleAddInRow = () => {
    const nextProd = products.find(p => !inItems.some(item => item.productId === p.id)) || products[0];
    setInItems(prev => [
      ...prev,
      { id: Date.now().toString(), productId: nextProd?.id || '', quantity: 1, unitPrice: nextProd?.costPrice || 0 }
    ]);
  };

  const handleRemoveInRow = (id) => {
    if (inItems.length <= 1) return;
    setInItems(prev => prev.filter(item => item.id !== id));
  };

  const handleUpdateInRow = (id, field, value) => {
    setInItems(prev => prev.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productId') {
          const matchedProd = products.find(p => p.id === value);
          if (matchedProd) {
            updated.unitPrice = matchedProd.costPrice || 0;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  // PDF UPLOAD & PREVIEW HANDLERS
  const handlePdfUpload = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setErrorMsg(lang === 'th' ? '⚠️ กรุณาอัปโหลดเฉพาะไฟล์เอกสาร PDF (.pdf) เท่านั้น' : 'Please upload only PDF (.pdf) files');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg(lang === 'th' ? '⚠️ ขนาดไฟล์ PDF เกิน 5MB กรุณาเลือกไฟล์ที่มีขนาดเล็กลง' : 'PDF file size exceeds 5MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result;
      if (dataUri) {
        setInvoicePdf({
          name: file.name,
          size: file.size,
          type: file.type || 'application/pdf',
          data: dataUri,
        });
        setErrorMsg('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewPdf = (pdfObj) => {
    if (!pdfObj || !pdfObj.data) return;
    setPreviewModalPdf(pdfObj);
  };

  // SUBMIT STOCK MOVEMENT
  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const invoiceNumber = refNo.trim() || `INV-${todayStr}-${Math.floor(1000 + Math.random() * 9000)}`;

    if (type === 'IN') {
      // Validate all items in inItems
      if (inItems.length === 0) {
        setErrorMsg(lang === 'th' ? 'กรุณาเลือกอุปกรณ์ที่ต้องการรับเข้าอย่างน้อย 1 รายการ' : 'Please select at least 1 item');
        return;
      }

      for (const item of inItems) {
        if (!item.productId) {
          setErrorMsg(lang === 'th' ? 'กรุณาเลือกอุปกรณ์ให้ครบทุกรายการ' : 'Please select equipment for all rows');
          return;
        }
        if (!item.quantity || Number(item.quantity) <= 0) {
          setErrorMsg(lang === 'th' ? 'จำนวนต้องมากกว่า 0' : 'Quantity must be > 0');
          return;
        }
      }

      try {
        const receivedItemsSummary = [];
        inItems.forEach((item) => {
          const prodObj = products.find(p => p.id === item.productId);
          const uPrice = Number(item.unitPrice) >= 0 ? Number(item.unitPrice) : (prodObj?.costPrice || 0);
          recordStockMovement({
            productId: item.productId,
            type: 'IN',
            quantity: Number(item.quantity),
            unitPrice: uPrice,
            supplierId: supplierId || null,
            refNo: invoiceNumber,
            invoiceFile: invoicePdf ? { name: invoicePdf.name, size: invoicePdf.size, data: invoicePdf.data, type: invoicePdf.type } : null,
            note: note.trim() ? `[รับเข้าสินค้า] ${note.trim()}` : `[รับเข้าอุปกรณ์]`,
          });
          receivedItemsSummary.push({
            product: prodObj,
            quantity: Number(item.quantity),
            unitPrice: uPrice,
          });
        });

        // Set ticket summary for single invoice printing
        const supplierObj = suppliers.find(s => s.id === supplierId);
        setSubmittedInTicket({
          invoiceNo: invoiceNumber,
          invoiceFile: invoicePdf,
          supplierName: supplierObj ? supplierObj.name : 'ซัพพลายเออร์ทั่วไป',
          items: receivedItemsSummary,
          date: new Date().toISOString(),
          receivedBy: user ? `${user.name} (${user.role.toUpperCase()})` : 'System Admin',
        });
      } catch (err) {
        setErrorMsg(err.message);
      }
    } else {
      // Requisition OUT logic
      if (!productId) {
        setErrorMsg(lang === 'th' ? 'กรุณาเลือกอุปกรณ์สำนักงาน' : 'Please select asset');
        return;
      }
      const qtyNum = Number(quantity);
      if (!qtyNum || qtyNum <= 0) {
        setErrorMsg(lang === 'th' ? 'จำนวนต้องมากกว่า 0' : 'Quantity must be > 0');
        return;
      }
      if (!requesterCompany.trim()) {
        setErrorMsg(lang === 'th' ? 'กรุณาระบุบริษัทผู้เบิก' : 'Please specify company');
        return;
      }
      if (!requesterName.trim()) {
        setErrorMsg(lang === 'th' ? 'กรุณาระบุชื่อผู้เบิกอุปกรณ์' : 'Please specify requester name');
        return;
      }

      const purposeObj = PURPOSE_PRESETS.find((p) => p.id === purpose);
      const purposeLabel = purposeObj ? (lang === 'th' ? purposeObj.labelTh : purposeObj.labelEn) : '';
      const customerFormatted = `${requesterName.trim()} (${requesterCompany.trim()}${requesterDept ? ` - ${requesterDept}` : ''}${requesterPosition ? ` - ${requesterPosition}` : ''})`;

      try {
        recordStockMovement({
          productId,
          type: 'OUT',
          quantity: qtyNum,
          unitPrice: Number(outUnitPrice) >= 0 ? Number(outUnitPrice) : (selectedProduct?.costPrice || 0),
          customer: customerFormatted,
          requesterName: requesterName.trim(),
          requesterCompany: requesterCompany.trim(),
          requesterDept: requesterDept.trim(),
          requesterPosition: requesterPosition.trim(),
          purpose,
          refNo: `REQ-${Math.floor(10000 + Math.random() * 90000)}`,
          note: `${purposeLabel ? `[${purposeLabel}] ` : ''}${note.trim()}`,
        });
        onClose();
      } catch (err) {
        setErrorMsg(err.message);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-lg" style={{ maxWidth: '980px', width: '95%' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-title">
            {type === 'IN' ? (
              <PlusCircle color="#10b981" size={24} />
            ) : (
              <MinusCircle color="#ef4444" size={24} />
            )}
            <h2>
              {type === 'IN'
                ? (lang === 'th' ? 'รับเข้าอุปกรณ์สำนักงานใหม่ (+) Stock In' : 'Receive New Assets (+)')
                : (lang === 'th' ? 'เบิกจ่ายอุปกรณ์สำนักงาน (-)' : 'Issue Asset (-)')}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* INVOICE SUCCESS VIEW FOR STOCK IN */}
        {submittedInTicket ? (
          <div className="modal-body print-area">
            <div className="card ticket-success-card mb-4 p-4 border-success">
              <div className="ticket-header flex-between border-bottom pb-3 mb-3">
                <div className="flex-center gap-3">
                  <CheckCircle2 size={36} color="#10b981" />
                  <div>
                    <h3 className="font-bold text-lg text-emerald mb-0">
                      {lang === 'th' ? '🎉 บันทึกการรับเข้าอุปกรณ์สำนักงานสำเร็จ!' : 'Stock In Recorded Successfully!'}
                    </h3>
                    <div className="text-xs text-muted">
                      {lang === 'th' ? 'เลขที่ใบกำกับสินค้า / Invoice No:' : 'Invoice No:'}{' '}
                      <span className="font-mono font-bold text-primary">{submittedInTicket.invoiceNo}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right text-xs text-muted">
                  <div>ผู้บันทึก: <strong className="text-primary">{submittedInTicket.receivedBy}</strong></div>
                  <div>ซัพพลายเออร์: <strong>{submittedInTicket.supplierName}</strong></div>
                </div>
              </div>

              {/* Items Received Summary List */}
              <div className="card bg-main p-3 mb-3">
                <div className="font-bold text-xs text-muted mb-2">
                  📦 {lang === 'th' ? `รายการอุปกรณ์ที่รับเข้าทั้งหมด (${submittedInTicket.items.length} รายการ):` : 'Received Items:'}
                </div>
                {submittedInTicket.items.map((item, idx) => (
                  <div key={idx} className="flex-between py-2 border-bottom text-sm">
                    <div className="flex-center gap-2">
                      <img src={item.product?.image} alt={item.product?.name} className="cart-item-thumb" />
                      <div>
                        <div className="font-bold">{item.product?.name}</div>
                        <div className="text-xs text-muted font-mono">Asset Tag: {item.product?.sku}</div>
                      </div>
                    </div>
                    <div className="font-bold text-emerald text-base">
                      +{item.quantity} {item.product?.unit || 'ชิ้น'}
                    </div>
                  </div>
                ))}
              </div>

              {/* Attached Invoice PDF Notice */}
              {submittedInTicket.invoiceFile && (
                <div
                  className="card p-2.5 mb-3 flex-between"
                  style={{
                    background: '#eff6ff',
                    border: '1.5px solid #60a5fa',
                  }}
                >
                  <div className="flex-center gap-2">
                    <div style={{ background: '#dc2626', color: '#fff', padding: '3px 6px', borderRadius: '4px', fontSize: '0.68rem', fontWeight: 'bold' }}>
                      PDF
                    </div>
                    <div className="text-xs">
                      <span className="font-bold text-primary">{submittedInTicket.invoiceFile.name}</span>
                      <span className="text-muted ml-2">({(submittedInTicket.invoiceFile.size / 1024).toFixed(1)} KB)</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs flex-center gap-1 font-bold"
                    onClick={() => handlePreviewPdf(submittedInTicket.invoiceFile)}
                  >
                    <Eye size={12} />
                    <span>{lang === 'th' ? 'ดูเอกสาร Invoice' : 'View PDF'}</span>
                  </button>
                </div>
              )}

              <div className="flex-between no-print pt-2">
                <button className="btn btn-outline" onClick={() => window.print()}>
                  <Printer size={16} />
                  {lang === 'th' ? 'พิมพ์ใบรับเข้าสินค้า (Invoice Slip)' : 'Print Invoice Slip'}
                </button>
                <button className="btn btn-primary" onClick={onClose}>
                  {lang === 'th' ? 'เสร็จสิ้น / ปิดหน้าต่าง' : 'Done & Close'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {errorMsg && (
                <div className="alert-box alert-danger mb-4">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* MULTI-ITEM STOCK IN RECEIVING FORM */}
              {type === 'IN' ? (
                <div className="multi-in-container">
                  {/* Invoice No & Supplier & PDF Header Bar */}
                  <div className="card p-3 mb-4 bg-main" style={{ border: '1px solid var(--border-color)' }}>
                    <div className="form-grid mb-3">
                      <div className="form-group mb-0">
                        <label className="form-label font-bold text-xs">
                          🧾 {lang === 'th' ? 'เลขที่ใบแจ้งหนี้ / ใบกำกับภาษี (Invoice No.)' : 'Invoice / Bill No.'}
                        </label>
                        <input
                          type="text"
                          className="form-control font-mono font-bold"
                          placeholder="เช่น INV-2026/0891, IV-9821"
                          value={refNo}
                          onChange={(e) => setRefNo(e.target.value)}
                        />
                        <span className="text-xxs text-muted mt-0.5">
                          {lang === 'th' ? '*หากเว้นว่างไว้ ระบบจะสร้างรหัส INV-YYYYMMDD อัตโนมัติ' : '*Auto-generated if left empty'}
                        </span>
                      </div>

                      <div className="form-group mb-0">
                        <label className="form-label font-bold text-xs">
                          🏭 {lang === 'th' ? 'ร้านค้า / ผู้จัดจำหน่าย (Supplier)' : 'Vendor / Supplier'}
                        </label>
                        <select
                          className="form-control text-xs"
                          value={supplierId}
                          onChange={(e) => setSupplierId(e.target.value)}
                        >
                          <option value="">{lang === 'th' ? '-- ไม่ระบุซัพพลายเออร์ --' : '-- Select Supplier --'}</option>
                          {suppliers.map((s) => (
                            <option key={s.id} value={s.id}>
                              🏢 {s.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* PDF Invoice File Attachment Section */}
                    <div className="border-top pt-3 mt-3">
                      <div className="flex-between mb-2">
                        <label className="form-label font-bold text-sm mb-0 flex-center gap-2" style={{ color: '#dc2626' }}>
                          <FileText size={18} />
                          <span>{lang === 'th' ? 'แนบไฟล์เอกสารใบเสร็จ / Invoice (ไฟล์ PDF)' : 'Attach Invoice PDF Document'}</span>
                        </label>
                        <span className="text-xs text-muted">
                          {lang === 'th' ? 'รองรับเฉพาะไฟล์ .pdf (ไม่เกิน 5MB)' : 'Only .pdf allowed (max 5MB)'}
                        </span>
                      </div>

                      {!invoicePdf ? (
                        <div
                          className="pdf-drop-zone p-4 text-center cursor-pointer"
                          style={{
                            border: '2px dashed #93c5fd',
                            borderRadius: '10px',
                            background: '#f8fafc',
                            transition: 'all 0.25s ease',
                          }}
                          onClick={() => pdfInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = '#2563eb';
                            e.currentTarget.style.background = '#eff6ff';
                          }}
                          onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = '#93c5fd';
                            e.currentTarget.style.background = '#f8fafc';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.style.borderColor = '#93c5fd';
                            e.currentTarget.style.background = '#f8fafc';
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handlePdfUpload(e.dataTransfer.files[0]);
                            }
                          }}
                        >
                          <input
                            type="file"
                            ref={pdfInputRef}
                            accept="application/pdf,.pdf"
                            style={{ display: 'none' }}
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handlePdfUpload(e.target.files[0]);
                              }
                            }}
                          />
                          <div className="flex-center justify-center flex-col gap-1.5 py-1">
                            <div
                              style={{
                                width: '42px',
                                height: '42px',
                                borderRadius: '50%',
                                background: '#eff6ff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '1px solid #bfdbfe',
                              }}
                            >
                              <Upload size={22} color="#2563eb" />
                            </div>
                            <div className="font-bold text-sm text-primary mt-1">
                              {lang === 'th' ? 'คลิกเพื่อเลือกไฟล์ PDF หรือลากไฟล์มาวางที่นี่' : 'Click to browse PDF or drag & drop here'}
                            </div>
                            <div className="text-xs text-muted">
                              {lang === 'th' ? 'รองรับเอกสารใบกำกับภาษี, ใบเสร็จ, หรือใบส่งของ (.pdf ไม่เกิน 5MB)' : 'Supports Tax Invoice, Receipt, or Delivery Order (PDF ≤ 5MB)'}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div
                          className="pdf-attached-badge p-3 flex-between"
                          style={{
                            background: 'rgba(37, 99, 235, 0.07)',
                            border: '2px solid #3b82f6',
                            borderRadius: '10px',
                          }}
                        >
                          <div className="flex-center gap-3 overflow-hidden">
                            <div style={{ background: '#dc2626', color: '#ffffff', padding: '6px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' }}>
                              PDF
                            </div>
                            <div className="overflow-hidden" style={{ maxWidth: '420px' }}>
                              <div className="font-bold text-sm text-slate-800 text-ellipsis overflow-hidden whitespace-nowrap">
                                {invoicePdf.name}
                              </div>
                              <div className="text-xs text-slate-500 font-mono mt-0.5">
                                {(invoicePdf.size / 1024).toFixed(1)} KB • <span className="text-emerald font-bold">✓ {lang === 'th' ? 'พร้อมบันทึกเข้าสู่ระบบ' : 'Ready to save'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-center gap-2 flex-shrink-0">
                            <button
                              type="button"
                              className="btn btn-outline btn-sm flex-center gap-1.5 font-bold"
                              style={{ height: '36px', padding: '0 12px' }}
                              onClick={() => handlePreviewPdf(invoicePdf)}
                              title="ดูตัวอย่างเอกสาร PDF"
                            >
                              <Eye size={15} />
                              <span>{lang === 'th' ? 'ดูตัวอย่าง' : 'Preview'}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm text-red"
                              style={{ height: '36px', padding: '0 10px' }}
                              onClick={() => {
                                setInvoicePdf(null);
                                if (pdfInputRef.current) pdfInputRef.current.value = '';
                              }}
                              title="ลบไฟล์แนบนี้"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Multi-Item Data Table */}
                  <div className="card p-3 mb-4 border-primary">
                    <div className="flex-between mb-3">
                      <span className="font-bold text-sm text-primary">
                        📦 {lang === 'th' ? `รายการอุปกรณ์ที่ต้องการรับเข้า (${inItems.length} รายการ)` : `Assets to Receive (${inItems.length} items)`}
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-xs"
                        onClick={handleAddInRow}
                      >
                        <Plus size={14} />
                        {lang === 'th' ? 'เพิ่มอุปกรณ์รับเข้าอีกรายการ' : 'Add Item'}
                      </button>
                    </div>

                    <div className="table-responsive">
                      <table className="data-table compact-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: '35px' }}>#</th>
                            <th style={{ minWidth: '320px' }}>{lang === 'th' ? 'อุปกรณ์สำนักงาน *' : 'Office Asset *'}</th>
                            <th style={{ width: '130px' }}>{lang === 'th' ? 'จำนวนรับเข้า *' : 'Quantity *'}</th>
                            <th style={{ width: '120px' }}>{lang === 'th' ? 'ราคา/หน่วย (บาท) *' : 'Unit Cost (THB) *'}</th>
                            <th style={{ width: '110px' }} className="text-right">{lang === 'th' ? 'มูลค่ารวม' : 'Subtotal'}</th>
                            <th style={{ width: '40px' }} className="text-center"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {inItems.map((item, index) => {
                            const prodObj = products.find(p => p.id === item.productId);
                            const itemPrice = Number(item.unitPrice) >= 0 ? Number(item.unitPrice) : (prodObj?.costPrice || 0);
                            const itemSubtotal = (Number(item.quantity) || 0) * itemPrice;

                            return (
                              <tr key={item.id}>
                                <td className="font-bold text-muted text-xs">{index + 1}</td>
                                <td>
                                  <select
                                    className="form-control font-bold text-xs"
                                    style={{
                                      width: '100%',
                                      minWidth: '300px',
                                      height: '42px',
                                      fontSize: '0.85rem',
                                      padding: '0.4rem 0.65rem',
                                    }}
                                    value={item.productId}
                                    onChange={(e) => handleUpdateInRow(item.id, 'productId', e.target.value)}
                                    required
                                  >
                                    {products.map(p => (
                                      <option key={p.id} value={p.id}>
                                        📦 {p.name} (Tag: {p.sku} | สต็อก: {p.quantity} {p.unit || 'ชิ้น'})
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td>
                                  <div className="shopee-qty-counter">
                                    <button
                                      type="button"
                                      className="qty-counter-btn"
                                      onClick={() => handleUpdateInRow(item.id, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))}
                                    >
                                      -
                                    </button>
                                    <input
                                      type="number"
                                      className="qty-counter-input font-bold"
                                      min="1"
                                      value={item.quantity}
                                      onChange={(e) => handleUpdateInRow(item.id, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                                      required
                                    />
                                    <button
                                      type="button"
                                      className="qty-counter-btn"
                                      onClick={() => handleUpdateInRow(item.id, 'quantity', (Number(item.quantity) || 0) + 1)}
                                    >
                                      +
                                    </button>
                                    <span className="text-xxs font-semibold text-muted ml-1">{prodObj?.unit || 'ชิ้น'}</span>
                                  </div>
                                </td>
                                <td>
                                  <input
                                    type="number"
                                    className="form-control text-xs font-bold"
                                    placeholder="0.00"
                                    min="0"
                                    step="any"
                                    value={item.unitPrice !== undefined ? item.unitPrice : (prodObj?.costPrice || 0)}
                                    onChange={(e) => handleUpdateInRow(item.id, 'unitPrice', e.target.value)}
                                    required
                                  />
                                </td>
                                <td className="text-right font-mono font-bold text-slate-800 text-xs">
                                  ฿{itemSubtotal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </td>
                                <td className="text-center">
                                  {inItems.length > 1 && (
                                    <button
                                      type="button"
                                      className="btn-icon-sm text-red"
                                      onClick={() => handleRemoveInRow(item.id)}
                                      title="Delete item"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: 'var(--bg-main)', borderTop: '2px solid var(--border-color)' }}>
                            <td colSpan="2" className="font-bold text-xs">
                              {lang === 'th' ? 'รวมรายการทั้งหมด:' : 'Total Items:'}
                            </td>
                            <td className="font-bold text-xs text-primary">
                              {inItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0)} {lang === 'th' ? 'ชิ้น' : 'Units'}
                            </td>
                            <td className="font-bold text-xs text-right">
                              {lang === 'th' ? 'มูลค่ารวมทั้งบิล:' : 'Grand Total:'}
                            </td>
                            <td className="text-right font-mono font-extrabold text-sm text-emerald">
                              ฿{inItems.reduce((sum, it) => {
                                const prodObj = products.find(p => p.id === it.productId);
                                const uPrice = Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : (prodObj?.costPrice || 0);
                                return sum + ((Number(it.quantity) || 0) * uPrice);
                              }, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                            </td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <button
                      type="button"
                      className="btn btn-outline btn-block mt-3"
                      onClick={handleAddInRow}
                    >
                      <Plus size={16} />
                      {lang === 'th' ? '+ เพิ่มอุปกรณ์รับเข้าอีกรายการ' : '+ Add Another Item'}
                    </button>
                  </div>
                </div>
              ) : (
                /* REQUISITION OUT FORM (SINGLE ITEM) */
                <div>
                  <div className="form-group mb-4">
                    <label className="form-label font-bold text-xs text-muted mb-2">
                      📦 {lang === 'th' ? 'อุปกรณ์สำนักงานที่เลือกเบิก (Selected Equipment)' : 'Selected Equipment to Requisition'}
                    </label>

                    <select
                      className="form-control font-bold mb-3"
                      value={productId || (products[0]?.id || '')}
                      onChange={(e) => setProductId(e.target.value)}
                      required
                    >
                      <option value="">{lang === 'th' ? '-- เลือกอุปกรณ์สำนักงาน --' : '-- Select Office Equipment --'}</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          📦 {p.name} (Asset Tag: {p.sku} | คงเหลือ: {p.quantity} {p.unit || 'ชิ้น'})
                        </option>
                      ))}
                    </select>

                    {selectedProduct && (
                      <div className="exact-asset-card card border-primary mb-2">
                        <div className="card-image-wrap" style={{ height: '160px' }}>
                          <img src={selectedProduct.image} alt={selectedProduct.name} className="card-img" />
                          <span className="yellow-stock-pill font-bold">
                            {selectedProduct.quantity} {selectedProduct.unit || 'ชิ้น'}
                          </span>
                        </div>
                        <div className="card-content-body">
                          <div className="cat-chip-badge">
                            {(categories || []).find(c => c && c.id === selectedProduct.category)?.nameTh || (categories || []).find(c => c && c.id === selectedProduct.category)?.name || 'อุปกรณ์สำนักงาน'}
                          </div>
                          <h3 className="exact-prod-title">{selectedProduct.name}</h3>
                          <div className="exact-asset-sku">
                            Asset Tag / QR: <span className="font-mono">{selectedProduct.sku}</span>
                          </div>
                          <div className="exact-card-divider" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="form-grid mb-4">
                    <div className="form-group">
                      <label className="form-label font-bold">{lang === 'th' ? 'จำนวนที่ต้องการเบิก *' : 'Quantity *'}</label>
                      <div className="shopee-qty-counter">
                        <button
                          type="button"
                          className="qty-counter-btn"
                          onClick={() => setQuantity((q) => Math.max(1, (Number(q) || 1) - 1).toString())}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          className="qty-counter-input font-bold"
                          min="1"
                          max={selectedProduct?.quantity || 999}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          required
                        />
                        <button
                          type="button"
                          className="qty-counter-btn"
                          onClick={() => setQuantity((q) => Math.min(selectedProduct?.quantity || 999, (Number(q) || 0) + 1).toString())}
                        >
                          +
                        </button>
                        <span className="text-xs font-semibold text-muted ml-2">{selectedProduct?.unit || 'ชิ้น'}</span>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label font-bold">{lang === 'th' ? 'ราคาประเมิน / มูลค่าต่อหน่วย (บาท)' : 'Unit Valuation (THB)'}</label>
                      <input
                        type="number"
                        className="form-control font-bold"
                        placeholder="0.00"
                        min="0"
                        step="any"
                        value={outUnitPrice}
                        onChange={(e) => setOutUnitPrice(e.target.value)}
                      />
                      <div className="text-xxs text-muted mt-1 flex-between">
                        <span>ราคาทุนอ้างอิง: ฿{(selectedProduct?.costPrice || 0).toLocaleString()}</span>
                        <strong className="text-primary">
                          มูลค่ารวม: ฿{((Number(quantity) || 0) * (Number(outUnitPrice) || selectedProduct?.costPrice || 0)).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="requester-panel card mb-4">
                    <div className="requester-header-bar mb-3">
                      <div className="panel-header-title">
                        <UserCheck color="#2563eb" size={18} />
                        <span className="font-bold text-sm">
                          {lang === 'th' ? 'ข้อมูลผู้เบิก (เรียงลำดับ: 1. บริษัท ➔ 2. แผนก ➔ 3. ชื่อผู้เบิก)' : 'Requisitioner Hierarchy'}
                        </span>
                      </div>
                    </div>

                    <div className="form-grid mb-3">
                      <div className="form-group">
                        <label className="form-label font-bold text-xs">1️⃣ เลือกชื่อบริษัท *</label>
                        <select
                          className="form-control font-bold text-xs"
                          value={requesterCompany}
                          onChange={(e) => {
                            setRequesterCompany(e.target.value);
                            setRequesterDept('');
                            setRequesterName('');
                          }}
                          required
                        >
                          {availableCompanies.map((comp, i) => (
                            <option key={i} value={comp}>
                              🏢 {comp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label font-bold text-xs">2️⃣ เลือกแผนกหรือฝ่าย *</label>
                        <select
                          className="form-control text-xs"
                          value={requesterDept}
                          onChange={(e) => {
                            setRequesterDept(e.target.value);
                            setRequesterName('');
                          }}
                        >
                          <option value="">-- เลือกแผนก/ฝ่าย --</option>
                          {finalDeptList.map((dept, i) => (
                            <option key={i} value={dept}>
                              📁 {dept}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label font-bold text-xs">3️⃣ เลือกชื่อ - นามสกุล ผู้ขอเบิก *</label>
                        <select
                          className="form-control font-semibold text-xs"
                          value={requesterName}
                          onChange={(e) => handleNameChange(e.target.value)}
                          required
                        >
                          <option value="">-- เลือกพนักงานผู้เบิก --</option>
                          {availableRequesters.map((r, i) => (
                            <option key={i} value={r.name}>
                              👤 {r.name} ({r.company || 'EXION (THAILAND) COMPANY LIMITED'}{r.department ? ` - ${r.department}` : ''})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs">ตำแหน่งงาน</label>
                        <input
                          type="text"
                          className="form-control text-xs"
                          placeholder="เช่น Senior Developer"
                          value={requesterPosition}
                          onChange={(e) => setRequesterPosition(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs">วัตถุประสงค์ในการเบิก</label>
                      <select
                        className="form-control text-xs"
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)}
                      >
                        {PURPOSE_PRESETS.map((p) => (
                          <option key={p.id} value={p.id}>
                            {lang === 'th' ? p.labelTh : p.labelEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Note */}
              <div className="form-group mb-4">
                <label className="form-label">{lang === 'th' ? 'หมายเหตุเพิ่มเติม' : 'Additional Notes'}</label>
                <textarea
                  className="form-control"
                  rows="2"
                  placeholder={type === 'IN' ? 'เช่น รับจากลอตสินค้าประจำเดือน' : 'เช่น เบิกใช้สำหรับประชุมประจำสัปดาห์'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`btn ${type === 'IN' ? 'btn-success' : 'btn-danger'} btn-lg flex-1 font-bold`}
              >
                {type === 'IN' ? (
                  <>
                    <PlusCircle size={18} />
                    {lang === 'th'
                      ? `🟢 ยืนยันรับเข้าอุปกรณ์ (${inItems.length} รายการ | รวม ฿${inItems.reduce((sum, it) => {
                          const prodObj = products.find(p => p.id === it.productId);
                          const uPrice = Number(it.unitPrice) >= 0 ? Number(it.unitPrice) : (prodObj?.costPrice || 0);
                          return sum + ((Number(it.quantity) || 0) * uPrice);
                        }, 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}) (+)`
                      : `Confirm Stock In (${inItems.length} items)`}
                  </>
                ) : (
                  <>
                    <MinusCircle size={18} />
                    {lang === 'th' ? '🔴 ยืนยันเบิกจ่ายอุปกรณ์ (ตัดสต็อก -)' : 'Confirm Requisition'}
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STYLING */}
        <style>{`
          .exact-asset-card {
            border-radius: 12px;
            overflow: hidden;
            background: #ffffff;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
            display: flex;
            flex-direction: column;
          }

          [data-theme="dark"] .exact-asset-card {
            background: #1e293b;
            border-color: #334155;
          }

          .card-image-wrap {
            position: relative;
            width: 100%;
            background: #111827;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .card-img {
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
          }

          .yellow-stock-pill {
            position: absolute;
            top: 0.5rem;
            right: 0.5rem;
            background: #fef08a;
            color: #713f12;
            font-weight: 800;
            font-size: 0.8rem;
            padding: 0.2rem 0.65rem;
            border-radius: 9999px;
            box-shadow: 0 2px 6px rgba(0,0,0,0.15);
          }

          .card-content-body {
            padding: 1rem;
            display: flex;
            flex-direction: column;
          }

          .cat-chip-badge {
            display: inline-block;
            align-self: flex-start;
            background: #eff6ff;
            color: #2563eb;
            font-weight: 700;
            font-size: 0.78rem;
            padding: 0.2rem 0.65rem;
            border-radius: 9999px;
            margin-bottom: 0.5rem;
          }

          [data-theme="dark"] .cat-chip-badge {
            background: rgba(37, 99, 235, 0.2);
            color: #60a5fa;
          }

          .exact-prod-title {
            font-size: 1.05rem;
            font-weight: 800;
            color: var(--text-primary);
            margin-bottom: 0.25rem;
          }

          .exact-asset-sku {
            font-size: 0.8rem;
            color: #94a3b8;
            margin-bottom: 0.5rem;
          }

          .exact-card-divider {
            height: 1px;
            background: #e2e8f0;
            margin-bottom: 0.5rem;
          }

          [data-theme="dark"] .exact-card-divider {
            background: #334155;
          }

          .shopee-qty-counter {
            display: flex;
            align-items: center;
            gap: 0.35rem;
          }

          .qty-counter-btn {
            width: 38px;
            height: 38px;
            border-radius: var(--radius-md);
            border: 1px solid var(--border-color);
            background: var(--bg-surface);
            color: var(--text-primary);
            font-weight: 800;
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.15s ease;
          }

          .qty-counter-btn:hover {
            background: var(--primary-50);
            color: var(--primary-600);
            border-color: var(--primary-500);
          }

          .qty-counter-input {
            width: 65px;
            height: 38px;
            text-align: center;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-md);
            font-size: 1rem;
          }

          .requester-panel {
            background: var(--primary-50);
            border: 1.5px solid var(--primary-500);
            padding: 1rem;
            box-sizing: border-box;
            width: 100%;
            max-width: 100%;
            border-radius: var(--radius-md);
          }

          [data-theme="dark"] .requester-panel {
            background: rgba(37, 99, 235, 0.12);
          }

          .requester-header-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 0.5rem;
          }

          .panel-header-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            min-width: 0;
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

          .cart-item-thumb {
            width: 40px;
            height: 40px;
            object-fit: contain;
            background: #ffffff;
            border-radius: 6px;
            padding: 0.2rem;
            border: 1px solid #e2e8f0;
          }
        `}</style>
      </div>

      {/* PDF PREVIEW MODAL OVERLAY */}
      {previewModalPdf && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-lg" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="flex-center gap-2">
                <FileText color="#dc2626" size={22} />
                <h3 className="font-bold text-base mb-0">
                  {previewModalPdf.name || (lang === 'th' ? 'เอกสารใบกำกับภาษี / Invoice (PDF)' : 'Invoice PDF Document')}
                </h3>
              </div>
              <button className="close-btn" onClick={() => setPreviewModalPdf(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body p-2" style={{ flex: 1, minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
              <iframe
                src={previewModalPdf.data}
                title={previewModalPdf.name || 'PDF Preview'}
                style={{ width: '100%', height: '62vh', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              />
            </div>
            <div className="modal-footer flex-between p-3 border-top">
              <a
                href={previewModalPdf.data}
                download={previewModalPdf.name || 'invoice.pdf'}
                className="btn btn-outline btn-sm flex-center gap-1 font-bold"
              >
                <Download size={14} />
                <span>{lang === 'th' ? 'ดาวน์โหลดไฟล์ PDF' : 'Download PDF'}</span>
              </a>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setPreviewModalPdf(null)}
              >
                {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
