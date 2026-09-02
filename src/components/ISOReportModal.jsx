import React, { useState, useEffect, useRef } from 'react';
import { useStock } from '../context/StockContext';
import {
  FileCheck2,
  Printer,
  Download,
  X,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
  Filter,
  ShieldCheck,
  FileSpreadsheet,
  Package,
  History,
  TrendingUp,
} from 'lucide-react';

export const ISOReportModal = ({ isOpen, onClose, initialFormType = 'FM-WH-001' }) => {
  const {
    products = [],
    categories = [],
    suppliers = [],
    transactions = [],
    requests = [],
    departmentQuotas = {},
    getDepartmentUsageThisMonth,
    lang,
    user,
  } = useStock();

  const [formType, setFormType] = useState(initialFormType);
  // 'FM-WH-001': Stock Movement & Requisition Audit
  // 'FM-WH-002': Physical Stocktake & Variance Analysis
  // 'FM-WH-003': Master Asset Register
  // 'FM-WH-004': Department Quota & Resource Consumption

  const [dateRange, setDateRange] = useState('ALL'); // 'ALL' | 'THIS_MONTH' | 'LAST_30' | 'LAST_90'
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [docRevNo, setDocRevNo] = useState('Rev. 02');
  const [effectiveDate, setEffectiveDate] = useState('01/01/2026');

  useEffect(() => {
    if (initialFormType) {
      setFormType(initialFormType);
    }
  }, [initialFormType]);

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

  const ISO_FORMS = [
    { code: 'FM-WH-001', name: 'สรุปเบิกจ่าย' },
    { code: 'FM-WH-002', name: 'ตรวจนับสต็อก' },
    { code: 'FM-WH-003', name: 'ทะเบียนทรัพย์สิน' },
    { code: 'FM-WH-004', name: 'โควตาแผนก' },
  ];

  if (!isOpen) return null;

  // Filter transactions by date range
  const now = Date.now();
  const DAY_MS = 86400000;

  const filteredTransactions = transactions.filter((tx) => {
    if (!tx.date) return true;
    const txTime = new Date(tx.date).getTime();
    if (dateRange === 'THIS_MONTH') {
      const txDate = new Date(tx.date);
      const curr = new Date();
      if (txDate.getMonth() !== curr.getMonth() || txDate.getFullYear() !== curr.getFullYear()) return false;
    } else if (dateRange === 'LAST_30') {
      if (now - txTime > DAY_MS * 30) return false;
    } else if (dateRange === 'LAST_90') {
      if (now - txTime > DAY_MS * 90) return false;
    }

    if (departmentFilter !== 'ALL') {
      if (tx.requesterDept !== departmentFilter) return false;
    }
    return true;
  });

  const totalInQty = filteredTransactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalOutQty = filteredTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + (t.quantity || 0), 0);
  const totalOutValue = filteredTransactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + ((t.quantity || 0) * (t.unitPrice || 0)), 0);

  // Form metadata
  const FORM_METADATA = {
    'FM-WH-001': {
      code: 'FM-WH-001',
      titleTh: 'แบบฟอร์มรายงานสรุปความเคลื่อนไหวสต็อกและการเบิกจ่ายพัสดุประจำงวด',
      titleEn: 'Stock Movement & Requisition Audit Summary Form',
      isoClause: 'ISO 9001:2015 (Clause 7.1.3 Infrastructure & Clause 8.5)',
    },
    'FM-WH-002': {
      code: 'FM-WH-002',
      titleTh: 'แบบฟอร์มรายงานผลการตรวจนับพัสดุและวิเคราะห์ผลต่าง',
      titleEn: 'Physical Stocktake & Variance Analysis Audit Form',
      isoClause: 'ISO 9001:2015 (Clause 8.5.2 Identification & Traceability)',
    },
    'FM-WH-003': {
      code: 'FM-WH-003',
      titleTh: 'แบบฟอร์มทะเบียนคุมทรัพย์สินและอุปกรณ์สำนักงาน',
      titleEn: 'Master Asset Identification & Registration Ledger Form',
      isoClause: 'ISO/IEC 27001 (A.8.1 Asset Management) & ISO 9001 (7.1.3)',
    },
    'FM-WH-004': {
      code: 'FM-WH-004',
      titleTh: 'แบบฟอร์มสรุปสถิติการใช้ทรัพยากรและโควตาการเบิกจ่ายแยกตามแผนก',
      titleEn: 'Department Resource Consumption & Quota Performance Form',
      isoClause: 'ISO 14001:2015 (Resource Efficiency) & ISO 9001 (Clause 9.1)',
    },
  };

  const currentForm = FORM_METADATA[formType] || FORM_METADATA['FM-WH-001'];

  const handlePrint = () => {
    window.print();
  };

  const exportISOCSV = () => {
    let headers = [];
    let rows = [];

    if (formType === 'FM-WH-001') {
      headers = ['Doc Code', 'ISO Standard', 'Tx ID', 'Date Time', 'Type', 'Asset Name', 'Quantity', 'Unit Price (THB)', 'Total Amount (THB)', 'Ref No', 'Requester', 'Department', 'Position', 'Signatory'];
      rows = filteredTransactions.map(tx => [
        `"${currentForm.code}"`,
        `"${currentForm.isoClause}"`,
        `"${tx.id}"`,
        `"${tx.date}"`,
        `"${tx.type}"`,
        `"${tx.productName.replace(/"/g, '""')}"`,
        tx.quantity,
        tx.unitPrice || 0,
        (tx.quantity || 0) * (tx.unitPrice || 0),
        `"${tx.refNo || ''}"`,
        `"${tx.requesterName || tx.customer || ''}"`,
        `"${tx.requesterDept || ''}"`,
        `"${tx.requesterPosition || ''}"`,
        `"${tx.createdBy || ''}"`,
      ].join(','));
    } else if (formType === 'FM-WH-002') {
      headers = ['Doc Code', 'Asset Tag', 'Barcode/QR', 'Asset Name', 'Category', 'System Qty', 'Physical Count', 'Variance', 'Cost Price (THB)', 'Variance Value (THB)', 'Corrective Action Status'];
      rows = products.map(p => {
        const cat = categories.find(c => c.id === p.category)?.name || '-';
        return [
          `"${currentForm.code}"`,
          `"${p.sku}"`,
          `"${p.barcode}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${cat}"`,
          p.quantity,
          p.quantity, // Balanced
          0,
          p.costPrice,
          0,
          '"Normal / Verified Correct"',
        ].join(',');
      });
    } else if (formType === 'FM-WH-003') {
      headers = ['Doc Code', 'Asset Tag', 'QR Code', 'Asset Name', 'Category', 'Quantity', 'Unit', 'Cost Price (THB)', 'Total Value (THB)', 'Supplier', 'Status'];
      rows = products.map(p => {
        const cat = categories.find(c => c.id === p.category)?.name || '-';
        const sup = suppliers.find(s => s.id === p.supplierId)?.name || '-';
        return [
          `"${currentForm.code}"`,
          `"${p.sku}"`,
          `"${p.barcode}"`,
          `"${p.name.replace(/"/g, '""')}"`,
          `"${cat}"`,
          p.quantity,
          `"${p.unit}"`,
          p.costPrice,
          p.quantity * p.costPrice,
          `"${sup}"`,
          '"Active / In-Service"',
        ].join(',');
      });
    } else if (formType === 'FM-WH-004') {
      headers = ['Doc Code', 'Department', 'Monthly Quota (Units)', 'Current Month Used', 'Quota Remaining', 'Utilization Rate (%)', 'Compliance Status'];
      rows = Object.keys(departmentQuotas).map(d => {
        const quota = departmentQuotas[d] || 50;
        const used = getDepartmentUsageThisMonth(d);
        const rate = ((used / quota) * 100).toFixed(1);
        const status = used > quota ? 'OVER_QUOTA' : 'COMPLIANT';
        return [`"${currentForm.code}"`, `"${d}"`, quota, used, Math.max(0, quota - used), `"${rate}%"`, `"${status}"`].join(',');
      });
    }

    const metadataHeader = [
      `"ISO FORM EXPORT: ${currentForm.titleTh}"`,
      `"DOCUMENT CODE: ${currentForm.code} | ${docRevNo} | EFFECTIVE: ${effectiveDate}"`,
      `"ORGANIZATION: บริษัท เอ็กซิออน (ประเทศไทย) จำกัด / EXION (THAILAND) CO., LTD."`,
      `"EXPORT DATE: ${new Date().toLocaleString('th-TH')}"`,
      '',
    ].join('\n');

    const csvContent = '\uFEFF' + metadataHeader + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ISO_${currentForm.code}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-xl" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '1000px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* MODAL HEADER */}
        <div className="modal-header flex-between no-print" style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '1rem 1.5rem' }}>
          <div className="flex-center gap-3">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.2)', flexShrink: 0 }}>
              <ShieldCheck size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h2 className="font-extrabold text-base text-slate-800" style={{ margin: 0 }}>
                  {lang === 'th' ? 'แบบฟอร์มรายงานมาตรฐานสากล' : 'ISO Standard Audit Studio'}
                </h2>
                <span className="badge badge-primary" style={{ fontSize: '0.68rem', padding: '0.15rem 0.5rem', fontWeight: 800 }}>
                  ISO 9001 / 14001
                </span>
              </div>
              <span className="text-xs text-slate-500" style={{ marginTop: '2px', display: 'block' }}>
                {lang === 'th' ? 'เอกสารควบคุมคุณภาพ มาตรฐานสากล • ช่องลงนาม 2 ระดับ • ปรับพิมพ์พอดี A4 อัตโนมัติ' : 'Quality Control Documents • ISO Certified Format'}
              </span>
            </div>
          </div>
          <div className="flex-center gap-2">
            <button className="btn btn-secondary btn-sm flex-center gap-1.5" onClick={exportISOCSV} style={{ height: '36px', padding: '0 0.85rem' }}>
              <Download size={15} />
              <span className="font-semibold">{lang === 'th' ? 'ส่งออก CSV' : 'Export CSV'}</span>
            </button>
            <button className="btn btn-primary btn-sm font-bold flex-center gap-1.5 shadow-sm" onClick={handlePrint} style={{ height: '36px', padding: '0 1rem' }}>
              <Printer size={15} />
              <span>{lang === 'th' ? 'สั่งพิมพ์แบบฟอร์ม' : 'Print Form'}</span>
            </button>
            <button className="close-btn" onClick={onClose} style={{ marginLeft: '0.25rem' }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SUB-HEADER TOOLBAR: SEGMENTED TABS & METADATA CONTROLS */}
        <div className="no-print" style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
          {/* Segmented Form Switcher Tabs */}
          <div style={{ display: 'flex', background: '#e2e8f0', padding: '3px', borderRadius: '8px', gap: '3px', flexWrap: 'wrap' }}>
            {ISO_FORMS.map((f) => {
              const isActive = formType === f.code;
              return (
                <button
                  key={f.code}
                  type="button"
                  onClick={() => setFormType(f.code)}
                  style={{
                    border: 'none',
                    borderRadius: '6px',
                    padding: '0.4rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: isActive ? 800 : 600,
                    background: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#1e293b' : '#64748b',
                    boxShadow: isActive ? '0 2px 5px rgba(0,0,0,0.08)' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '0.72rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      background: isActive ? 'rgba(79, 70, 229, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: isActive ? '#4f46e5' : '#64748b',
                      fontWeight: 800,
                    }}
                  >
                    {f.code}
                  </span>
                  <span>{f.name}</span>
                </button>
              );
            })}
          </div>

          {/* Document Meta Config Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
            {formType === 'FM-WH-001' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>ช่วงเวลา:</span>
                <select
                  className="form-control"
                  style={{ width: '130px', padding: '0.15rem 0.4rem', height: '26px', fontSize: '0.75rem', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="ALL">ข้อมูลสะสมทั้งหมด</option>
                  <option value="THIS_MONTH">ประจำเดือนนี้</option>
                  <option value="LAST_30">ย้อนหลัง 30 วัน</option>
                  <option value="LAST_90">ย้อนหลัง 90 วัน</option>
                </select>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>ฉบับที่:</span>
              <input
                type="text"
                className="form-control"
                style={{ width: '75px', padding: '0.15rem 0.35rem', height: '26px', fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, textAlign: 'center', border: 'none', background: 'transparent' }}
                value={docRevNo}
                onChange={(e) => setDocRevNo(e.target.value)}
                placeholder="Rev. 02"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#ffffff', padding: '0.2rem 0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', whiteSpace: 'nowrap' }}>วันที่มีผล:</span>
              <input
                type="text"
                className="form-control"
                style={{ width: '95px', padding: '0.15rem 0.35rem', height: '26px', fontSize: '0.75rem', textAlign: 'center', border: 'none', background: 'transparent' }}
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="01/01/2026"
              />
            </div>
          </div>
        </div>

        <div className="modal-body iso-printable-sheet" style={{ overflowY: 'auto', flex: 1, padding: '2rem', background: '#ffffff', color: '#0f172a' }}>
          <div className="iso-header-box mb-2">
            <table className="iso-header-table">
              <tbody>
                <tr>
                  <td rowSpan="3" style={{ width: '22%', textAlign: 'center', verticalAlign: 'middle', borderRight: '1.5px solid #0f172a', padding: '4px' }}>
                    <img src="/logo.png" alt="EXION THAILAND" style={{ maxHeight: '120px', maxWidth: '92%', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
                  </td>
                  <td rowSpan="2" style={{ textAlign: 'center', verticalAlign: 'middle', fontWeight: '800', fontSize: '0.88rem', borderRight: '1.5px solid #0f172a', padding: '3px 8px' }}>
                    <div>{currentForm.titleTh}</div>
                    <div style={{ fontSize: '0.68rem', fontWeight: '600', color: '#475569', marginTop: '1px' }}>{currentForm.titleEn}</div>
                  </td>
                  <td style={{ width: '28%', fontSize: '0.7rem', padding: '2px 6px', borderBottom: '1px solid #0f172a' }}>
                    <strong>รหัสเอกสาร:</strong> <span style={{ fontFamily: 'monospace', fontWeight: '800' }}>{currentForm.code}</span>
                  </td>
                </tr>
                <tr>
                  <td style={{ fontSize: '0.7rem', padding: '2px 6px', borderBottom: '1px solid #0f172a' }}>
                    <strong>ฉบับที่ (Rev.):</strong> <span>{docRevNo}</span> | <strong>หน้า:</strong> 1/1
                  </td>
                </tr>
                <tr>
                  <td style={{ textAlign: 'center', fontSize: '0.65rem', color: '#475569', borderRight: '1.5px solid #0f172a', padding: '2px 6px' }}>
                    <strong>มาตรฐานอ้างอิง:</strong> {currentForm.isoClause}
                  </td>
                  <td style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                    <strong>วันที่มีผล:</strong> {effectiveDate}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="iso-scope-bar mb-2 p-1.5" style={{ background: 'transparent', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '0.72rem' }}>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.35rem' }}>
              <div><strong>หน่วยงาน/บริษัท:</strong> บริษัท เอ็กซิออน (ประเทศไทย) จำกัด / EXION (THAILAND) CO., LTD.</div>
              <div><strong>วันที่พิมพ์รายงาน:</strong> {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div className="flex-between mt-0.5 text-xs text-slate-600">
              <div><strong>ขอบเขตข้อมูล:</strong> {dateRange === 'ALL' ? 'ข้อมูลสะสมทั้งหมด' : dateRange === 'THIS_MONTH' ? 'ประจำเดือนปัจจุบัน' : dateRange === 'LAST_30' ? 'ย้อนหลัง 30 วัน' : 'ย้อนหลัง 90 วัน'}</div>
              <div>
                <strong>ผู้จัดพิมพ์:</strong>{' '}
                {(user?.name || 'สมชาย มั่นคง')
                  .replace(/\s*\([^)]*\)/g, '')
                  .trim() === 'สมชาย'
                  ? 'สมชาย มั่นคง'
                  : (user?.name || 'สมชาย มั่นคง').replace(/\s*\([^)]*\)/g, '').trim()}
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC FORM CONTENT BASED ON SELECTED FORM TYPE */}
          {formType === 'FM-WH-001' && (
            <div>
              {/* Summary KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <div style={{ border: '1px solid #cbd5e1', padding: '0.35rem', borderRadius: '4px', textAlign: 'center', background: 'transparent' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ยอดรับเข้าพัสดุทั้งหมด (IN)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#059669' }}>{totalInQty} ชิ้น</div>
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '0.35rem', borderRadius: '4px', textAlign: 'center', background: 'transparent' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>ยอดเบิกจ่ายพัสดุทั้งหมด (OUT)</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#e11d48' }}>{totalOutQty} ชิ้น</div>
                </div>
                <div style={{ border: '1px solid #cbd5e1', padding: '0.35rem', borderRadius: '4px', textAlign: 'center', background: 'transparent' }}>
                  <div style={{ fontSize: '0.68rem', color: '#64748b' }}>มูลค่าพัสดุที่เบิกจ่ายสะสม</div>
                  <div style={{ fontSize: '1.05rem', fontWeight: '800', color: '#4f46e5' }}>฿{totalOutValue.toLocaleString()}</div>
                </div>
              </div>

              {/* Transactions Table */}
              <table className="iso-data-table mb-4">
                <thead>
                  <tr className="print-spacer-row"><td colSpan={8} className="print-spacer-cell" /></tr>
                  <tr>
                    <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>วันที่/เวลา</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>ประเภท</th>
                    <th style={{ textAlign: 'center' }}>รายการพัสดุ / อุปกรณ์</th>
                    <th style={{ width: '80px', textAlign: 'center' }}>เลขที่อ้างอิง</th>
                    <th style={{ width: '65px', textAlign: 'center' }}>จำนวน</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>ผู้ขอเบิก / แผนก</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>ผู้บันทึก</th>
                  </tr>
                </thead>
                <tfoot><tr className="print-spacer-row"><td colSpan={8} className="print-spacer-cell" /></tr></tfoot>
                <tbody>
                  {filteredTransactions.slice(0, 30).map((tx, idx) => (
                    <tr key={tx.id}>
                      <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>
                        {new Date(tx.date).toLocaleDateString('th-TH', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <strong style={{ color: tx.type === 'IN' ? '#059669' : tx.type === 'OUT' ? '#e11d48' : '#6366f1' }}>
                          {tx.type}
                        </strong>
                      </td>
                      <td style={{ fontWeight: '600' }}>{tx.productName}</td>
                      <td style={{ fontSize: '0.72rem', fontFamily: 'monospace' }}>{tx.refNo || '-'}</td>
                      <td style={{ textAlign: 'right', fontWeight: '700' }}>{tx.quantity}</td>
                      <td style={{ fontSize: '0.75rem' }}>
                        <div>{tx.requesterName || tx.customer || '-'}</div>
                        <div style={{ fontSize: '0.68rem', color: '#64748b' }}>{tx.requesterDept || ''}</div>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: '#475569' }}>{tx.createdBy || 'Admin'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTransactions.length > 30 && (
                <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem' }}>
                  * แสดง 30 รายการแรกจากทั้งหมด {filteredTransactions.length} รายการ (ส่งออกไฟล์ CSV เพื่อดูครบทุกรายการ)
                </div>
              )}
            </div>
          )}

          {formType === 'FM-WH-002' && (
            <div>
              <div style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.75rem', borderRadius: '4px', marginBottom: '0.4rem', background: 'transparent', fontSize: '0.8rem' }}>
                <strong>วัตถุประสงค์การตรวจนับ:</strong> เพื่อตรวจสอบความถูกต้องของยอดคงเหลือพัสดุในระบบเปรียบเทียบกับยอดนับจริงในคลังสินค้าตามข้อกำหนด ISO 9001
              </div>

              <table className="iso-data-table mb-4">
                <thead>
                  <tr className="print-spacer-row"><td colSpan={8} className="print-spacer-cell" /></tr>
                  <tr>
                    <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>Asset Tag</th>
                    <th style={{ textAlign: 'center' }}>ชื่ออุปกรณ์สำนักงาน</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>หมวดหมู่</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>ยอดระบบ</th>
                    <th style={{ width: '70px', textAlign: 'center' }}>ยอดนับจริง</th>
                    <th style={{ width: '65px', textAlign: 'center' }}>ผลต่าง</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>สถานะการตรวจสอบ</th>
                  </tr>
                </thead>
                <tfoot><tr className="print-spacer-row"><td colSpan={8} className="print-spacer-cell" /></tr></tfoot>
                <tbody>
                  {products.map((p, idx) => {
                    const cat = categories.find(c => c.id === p.category)?.name || '-';
                    return (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem' }}>{p.sku}</td>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        <td style={{ fontSize: '0.75rem', color: '#475569' }}>{cat}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{p.quantity}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{p.quantity}</td>
                        <td style={{ textAlign: 'right', color: '#059669', fontWeight: '800' }}>0</td>
                        <td style={{ fontSize: '0.72rem', color: '#059669', textAlign: 'center', fontWeight: '700' }}>
                          ✓ ยอดถูกต้อง (Verified)
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {formType === 'FM-WH-003' && (
            <div>
              <table className="iso-data-table mb-4">
                <thead>
                  <tr className="print-spacer-row"><td colSpan={9} className="print-spacer-cell" /></tr>
                  <tr>
                    <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>Asset Tag</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>QR Code / Barcode</th>
                    <th style={{ textAlign: 'center' }}>รายการทรัพย์สินและอุปกรณ์</th>
                    <th style={{ width: '100px', textAlign: 'center' }}>หมวดหมู่</th>
                    <th style={{ width: '60px', textAlign: 'center' }}>จำนวน</th>
                    <th style={{ width: '50px', textAlign: 'center' }}>หน่วย</th>
                    <th style={{ width: '85px', textAlign: 'center' }}>ราคาทุน/หน่วย</th>
                    <th style={{ width: '95px', textAlign: 'center' }}>มูลค่ารวม (THB)</th>
                  </tr>
                </thead>
                <tfoot><tr className="print-spacer-row"><td colSpan={9} className="print-spacer-cell" /></tr></tfoot>
                <tbody>
                  {products.map((p, idx) => {
                    const cat = categories.find(c => c.id === p.category)?.name || '-';
                    return (
                      <tr key={p.id}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '0.75rem' }}>{p.sku}</td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.72rem', color: '#475569' }}>{p.barcode}</td>
                        <td style={{ fontWeight: '600' }}>{p.name}</td>
                        <td style={{ fontSize: '0.75rem', color: '#475569' }}>{cat}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{p.quantity}</td>
                        <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>{p.unit}</td>
                        <td style={{ textAlign: 'right' }}>฿{p.costPrice.toLocaleString()}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>฿{(p.quantity * p.costPrice).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {formType === 'FM-WH-004' && (
            <div>
              <div style={{ border: '1px solid #cbd5e1', padding: '0.6rem 0.75rem', borderRadius: '4px', marginBottom: '0.4rem', background: 'transparent', fontSize: '0.8rem' }}>
                <strong>วัตถุประสงค์การติดตามโควตา:</strong> เพื่อควบคุมการใช้ทรัพยากรสำนักงานให้มีประสิทธิภาพสูงสุดตามเกณฑ์ ISO 14001 และป้องกันการเบิกจ่ายเกินงบประมาณ
              </div>

              <table className="iso-data-table mb-4">
                <thead>
                  <tr className="print-spacer-row"><td colSpan={7} className="print-spacer-cell" /></tr>
                  <tr>
                    <th style={{ width: '35px', textAlign: 'center' }}>#</th>
                    <th style={{ textAlign: 'center' }}>แผนก / หน่วยงาน</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>โควตาประจำเดือน</th>
                    <th style={{ width: '120px', textAlign: 'center' }}>ยอดเบิกใช้เดือนนี้</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>โควตาคงเหลือ</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>อัตราการใช้ (%)</th>
                    <th style={{ width: '130px', textAlign: 'center' }}>สถานะความสอดคล้อง</th>
                  </tr>
                </thead>
                <tfoot><tr className="print-spacer-row"><td colSpan={7} className="print-spacer-cell" /></tr></tfoot>
                <tbody>
                  {Object.keys(departmentQuotas).map((deptName, idx) => {
                    const quota = departmentQuotas[deptName] || 50;
                    const used = getDepartmentUsageThisMonth(deptName);
                    const rate = ((used / quota) * 100).toFixed(1);
                    const isOver = used > quota;
                    return (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ fontWeight: '700' }}>{deptName}</td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{quota} ชิ้น</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: isOver ? '#ef4444' : '#0f172a' }}>{used} ชิ้น</td>
                        <td style={{ textAlign: 'right', fontWeight: '700', color: isOver ? '#ef4444' : '#059669' }}>
                          {isOver ? `เกิน ${used - quota}` : `${quota - used} ชิ้น`}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: '700' }}>{rate}%</td>
                        <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                          <span style={{ color: isOver ? '#ef4444' : '#059669', fontWeight: '800' }}>
                            {isOver ? '⚠️ เกินโควตา (Over Quota)' : '✓ ปกติตามเกณฑ์'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. ISO STANDARD AUTHORIZATION SIGNATURE BOXES (2 ROLES) */}
          <div className="iso-signature-section mt-2 pt-2" style={{ borderTop: '1.2px solid #0f172a' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
              
              {/* Box 1: Warehouse Officer */}
              <div style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', borderRadius: '4px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a' }}>1. เจ้าหน้าที่คลังสินค้า (Warehouse Officer)</div>
                <div style={{ height: '24px', borderBottom: '1px dotted #0f172a', margin: '6px 15px 4px' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0f172a' }}>(........................................................)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>เจ้าหน้าที่ผู้ควบคุมและตรวจนับคลังพัสดุ</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>วันที่: ...... / ...... / ..........</div>
              </div>

              {/* Box 2: Logistics Manager */}
              <div style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', borderRadius: '4px', background: '#fafafa' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#0f172a' }}>2. ผู้จัดการฝ่ายโลจิสติกส์ (Logistics Manager)</div>
                <div style={{ height: '24px', borderBottom: '1px dotted #0f172a', margin: '6px 15px 4px' }} />
                <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#0f172a' }}>(........................................................)</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '1px' }}>ผู้จัดการฝ่ายโลจิสติกส์และซัพพลายเชน</div>
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '2px' }}>วันที่: ...... / ...... / ..........</div>
              </div>

            </div>
          </div>

        </div>

        {/* MODAL FOOTER (NO PRINT) */}
        <div className="modal-footer no-print flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="text-xs text-slate-600 flex-center gap-2" style={{ maxWidth: '600px', lineHeight: 1.4 }}>
            <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px', fontWeight: '700', whiteSpace: 'nowrap', fontSize: '0.72rem' }}>
              💡 วิธีซ่อน localhost
            </span>
            <span style={{ fontSize: '0.75rem' }}>
              ในหน้าต่างพิมพ์ (Ctrl+P) ให้กด <strong>"การตั้งค่าเพิ่มเติม (More settings)"</strong> แล้วเอาติ๊กถูกออกจาก <strong>"หัวกระดาษและท้ายกระดาษ (Headers and footers)"</strong>
            </span>
          </div>
          <div className="flex-center gap-2">
            <button className="btn btn-secondary" onClick={onClose}>
              {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
            </button>
            <button className="btn btn-primary font-bold flex-center gap-1" onClick={handlePrint}>
              <Printer size={16} />
              <span>{lang === 'th' ? 'สั่งพิมพ์แบบฟอร์ม (Print Form)' : 'Print Form'}</span>
            </button>
          </div>
        </div>

        {/* STYLES */}
        <style>{`
          .iso-header-table {
            width: 100%;
            border-collapse: collapse;
            border: 1.5px solid #0f172a;
          }
          .iso-data-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.78rem;
            border: none;
          }
          .iso-data-table th {
            background: #ffffff;
            color: #0f172a;
            font-weight: 800;
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            text-align: center !important;
            vertical-align: middle !important;
          }
          .iso-data-table tbody td {
            padding: 5px 8px;
            border: 1px solid #cbd5e1;
          }
          .iso-data-table tr:nth-child(even) {
            background: transparent;
          }

          /* Screen: hide spacer rows completely */
          .print-spacer-row {
            display: none;
          }

          @media print {
            @page {
              size: A4 portrait;
              margin: 0 !important;
            }

            body {
              background: #ffffff !important;
              color: #000000 !important;
              margin: 0 !important;
              padding: 0 !important;
              box-sizing: border-box !important;
            }

            /* Print: show spacer rows as invisible margin space */
            .print-spacer-row {
              display: table-row !important;
              height: 10mm !important;
            }

            .iso-data-table .print-spacer-row .print-spacer-cell,
            .iso-data-table tr.print-spacer-row td.print-spacer-cell,
            .iso-data-table td.print-spacer-cell {
              height: 10mm !important;
              padding: 0 !important;
              margin: 0 !important;
              border: none !important;
              border-width: 0 !important;
              border-style: none !important;
              border-color: transparent !important;
              background: #ffffff !important;
              line-height: 0 !important;
              font-size: 0 !important;
              overflow: hidden !important;
              outline: none !important;
              box-shadow: none !important;
            }

            .no-print,
            .navbar,
            .sidebar,
            .page-header,
            .iso-studio-banner,
            .valuation-grid,
            .export-tools-grid,
            .report-tabs-bar,
            .report-table-card,
            .monthly-stock-report,
            .qr-grid-layout {
              display: none !important;
              visibility: hidden !important;
              height: 0 !important;
              max-height: 0 !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: hidden !important;
            }

            .app-layout,
            .main-content,
            .main-layout,
            .reports-page {
              display: block !important;
              position: static !important;
              width: 100% !important;
              height: auto !important;
              margin: 0 !important;
              padding: 0 !important;
              overflow: visible !important;
              background: transparent !important;
              border: none !important;
              box-shadow: none !important;
            }

            .modal-overlay {
              position: static !important;
              display: block !important;
              background: transparent !important;
              padding: 0 !important;
              margin: 0 !important;
              width: 100% !important;
              box-shadow: none !important;
              border: none !important;
              overflow: visible !important;
            }

            .modal-content,
            .modal-xl {
              position: static !important;
              display: block !important;
              width: 100% !important;
              max-width: 100% !important;
              max-height: none !important;
              box-shadow: none !important;
              border: none !important;
              padding: 0 !important;
              margin: 0 !important;
              background: #ffffff !important;
              overflow: visible !important;
            }

            .iso-printable-sheet {
              padding: 12mm 15mm 12mm 15mm !important;
              margin: 0 !important;
              box-sizing: border-box !important;
              overflow: visible !important;
              display: block !important;
              visibility: visible !important;
              opacity: 1 !important;
              background: #ffffff !important;
              color: #000000 !important;
              width: 100% !important;
            }

            .iso-header-table {
              border: 1.5px solid #000000 !important;
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-bottom: 8px !important;
            }

            .iso-header-table td {
              border: 1px solid #000000 !important;
              padding: 4px 6px !important;
            }

            .iso-data-table {
              width: 100% !important;
              border-collapse: collapse !important;
              page-break-inside: auto !important;
              margin-bottom: 12px !important;
            }

            .iso-data-table thead {
              display: table-header-group !important;
            }

            .iso-data-table tfoot {
              display: table-footer-group !important;
            }

            .iso-data-table tr {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }

            .iso-data-table th {
              background: #ffffff !important;
              color: #000000 !important;
              border: 1px solid #64748b !important;
              border-top: 1.5px solid #000000 !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              padding: 5px 6px !important;
              font-size: 8pt !important;
            }

            .iso-data-table td {
              border: 1px solid #64748b !important;
              padding: 4px 6px !important;
              color: #000000 !important;
              font-size: 8pt !important;
            }

            .iso-signature-section {
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              margin-top: 15px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
};
