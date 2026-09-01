import React, { useRef, useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  FileSpreadsheet,
  Download,
  Upload,
  Printer,
  DollarSign,
  TrendingUp,
  Package,
  Layers,
  Database,
  QrCode,
  Building,
  FileCheck2,
  ShieldCheck,
  Award,
  Sparkles,
  ArrowRight,
  History,
  ListFilter,
} from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';
import { ISOReportModal } from './ISOReportModal';
import { MonthlyStockReport } from './MonthlyStockReport';

export const Reports = () => {
  const {
    products = [],
    categories = [],
    transactions = [],
    exportDataJSON,
    importDataJSON,
    getTotalInventoryValue,
    getTotalSellingValue,
    lang,
  } = useStock();

  const fileInputRef = useRef(null);
  const [reportView, setReportView] = useState('monthly'); // 'monthly' | 'movements' | 'inventory' | 'qr_sheet'
  const [selectedISOForm, setSelectedISOForm] = useState(null);
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'OUT' | 'IN' | 'ADJUST'

  const totalCostVal = getTotalInventoryValue();
  const totalSaleVal = getTotalSellingValue();
  const potentialProfit = totalSaleVal - totalCostVal;
  const profitMarginPercent = totalCostVal > 0 ? ((potentialProfit / totalCostVal) * 100).toFixed(1) : '0.0';

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // CSV Export Functions
  const exportProductsCSV = () => {
    const headers = ['SKU/Asset Tag', 'Barcode', 'Product Name', 'Category', 'Cost Price (THB)', 'Selling Price (THB)', 'Quantity', 'Unit', 'Total Valuation (Cost)'];
    const rows = products.map(p => {
      const catObj = categories.find(c => c.id === p.category);
      const catName = catObj ? catObj.name : 'General';
      return [
        `"${p.sku}"`,
        `"${p.barcode}"`,
        `"${p.name.replace(/"/g, '""')}"`,
        `"${catName}"`,
        p.costPrice,
        p.sellingPrice,
        p.quantity,
        `"${p.unit}"`,
        p.quantity * p.costPrice,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office_inventory_report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportTransactionsCSV = () => {
    const headers = ['Transaction ID', 'Date Time', 'Type', 'Product Name', 'Quantity', 'Unit Price (THB)', 'Total Amount (THB)', 'Ref No', 'Requester Name', 'Department', 'Position', 'Supplier Name', 'Notes'];
    const rows = transactions.map(tx => {
      return [
        `"${tx.id}"`,
        `"${tx.date}"`,
        `"${tx.type}"`,
        `"${tx.productName.replace(/"/g, '""')}"`,
        tx.quantity,
        tx.unitPrice || 0,
        (tx.quantity || 0) * (tx.unitPrice || 0),
        `"${tx.refNo || ''}"`,
        `"${(tx.requesterName || tx.customer || '').replace(/"/g, '""')}"`,
        `"${(tx.requesterDept || '').replace(/"/g, '""')}"`,
        `"${(tx.requesterPosition || '').replace(/"/g, '""')}"`,
        `"${(tx.supplierName || '').replace(/"/g, '""')}"`,
        `"${(tx.note || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `office_requisition_movements_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const success = importDataJSON(event.target.result);
      if (success) {
        alert(lang === 'th' ? 'นำเข้าข้อมูลสำรองเรียบร้อยแล้ว!' : 'Backup data restored successfully!');
      } else {
        alert(lang === 'th' ? 'รูปแบบไฟล์ไม่ถูกต้อง' : 'Invalid backup JSON file');
      }
    };
    reader.readAsText(file);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const filteredTransactions = transactions.filter(tx => {
    if (typeFilter === 'ALL') return true;
    return tx.type === typeFilter;
  });

  return (
    <div className="reports-page">
      <div className="page-header no-print">
        <div>
          <h1 className="page-title">
            <FileSpreadsheet color="#2563eb" />
            {lang === 'th' ? 'รายงานและแผ่นพิมพ์ QR Code อุปกรณ์' : 'Reports & Print QR Code Asset Sheet'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? 'สรุปมูลค่าคลังอุปกรณ์สำนักงาน แบบฟอร์มมาตรฐาน ISO 9001/27001 และพิมพ์ป้ายสติ๊กเกอร์ QR Code'
              : 'Valuation summaries, ISO 9001/27001 compliant forms, printable QR sheets, and exports'}
          </p>
        </div>

        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => setSelectedISOForm('FM-WH-001')}
          >
            <FileCheck2 size={18} />
            <span>{lang === 'th' ? '📑 ศูนย์แบบฟอร์มมาตรฐาน ISO' : 'ISO Forms Center'}</span>
          </button>
          <button className="btn btn-secondary font-bold flex-center gap-1.5" onClick={handlePrintReport}>
            <Printer size={18} />
            <span>{lang === 'th' ? 'พิมพ์ตารางที่เลือก (Print Table)' : 'Print Selected View'}</span>
          </button>
        </div>
      </div>

      {/* ISO COMPLIANCE REPORT FORMS STUDIO (FEATURE HIGHLIGHT) */}
      <div className="card p-4 mb-6 no-print iso-studio-banner" style={{ background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(99, 102, 241, 0.1) 100%)', border: '1.5px solid #818cf8' }}>
        <div className="flex-between mb-3">
          <div className="flex-center gap-2">
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
              <FileCheck2 size={20} />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-primary">
                {lang === 'th' ? 'ศูนย์ออกรายงานแบบฟอร์มทางการมาตรฐาน ISO (ISO Compliance Forms Studio)' : 'ISO Compliance Form Reports'}
              </h3>
              <p className="text-xxs text-muted mt-0.5">
                {lang === 'th'
                  ? 'เอกสารควบคุมตามมาตรฐาน ISO 9001:2015, ISO 14001, ISO/IEC 27001 พร้อมกรอบควบคุมเอกสารและช่องลงนาม 2 ระดับ'
                  : 'Controlled document templates with 2-tier authorization signatures'}
              </p>
            </div>
          </div>
          <span className="badge badge-primary text-xxs font-bold">
            <ShieldCheck size={12} /> ISO Certified Templates
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.85rem' }}>
          {/* Form 1 */}
          <div
            className="card p-3 card-hover cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={() => setSelectedISOForm('FM-WH-001')}
          >
            <div className="flex-between mb-1">
              <span className="badge badge-primary font-mono text-xxs font-bold">FM-WH-001</span>
              <ArrowRight size={14} className="text-muted" />
            </div>
            <div className="font-bold text-xs text-primary mb-1">
              รายงานสรุปเบิกจ่ายพัสดุประจำงวด
            </div>
            <div className="text-xxs text-muted">
              สรุปยอดรับเข้า, เบิกจ่าย, ประวัติแยกตามแผนก พร้อมช่องเซ็นอนุมัติ 3 ระดับ
            </div>
          </div>

          {/* Form 2 */}
          <div
            className="card p-3 card-hover cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={() => setSelectedISOForm('FM-WH-002')}
          >
            <div className="flex-between mb-1">
              <span className="badge badge-success font-mono text-xxs font-bold">FM-WH-002</span>
              <ArrowRight size={14} className="text-muted" />
            </div>
            <div className="font-bold text-xs text-primary mb-1">
              รายงานผลตรวจนับและวิเคราะห์ผลต่าง
            </div>
            <div className="text-xxs text-muted">
              เปรียบเทียบยอดระบบ vs ยอดนับจริง วิเคราะห์ผลต่างและมาตรการป้องกัน (CAPA)
            </div>
          </div>

          {/* Form 3 */}
          <div
            className="card p-3 card-hover cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={() => setSelectedISOForm('FM-WH-003')}
          >
            <div className="flex-between mb-1">
              <span className="badge badge-info font-mono text-xxs font-bold">FM-WH-003</span>
              <ArrowRight size={14} className="text-muted" />
            </div>
            <div className="font-bold text-xs text-primary mb-1">
              ทะเบียนคุมทรัพย์สินและอุปกรณ์
            </div>
            <div className="text-xxs text-muted">
              Asset Register บันทึกรหัส Tag, QR, ราคาทุน, และสถานะความพร้อมใช้งาน
            </div>
          </div>

          {/* Form 4 */}
          <div
            className="card p-3 card-hover cursor-pointer"
            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
            onClick={() => setSelectedISOForm('FM-WH-004')}
          >
            <div className="flex-between mb-1">
              <span className="badge badge-warning font-mono text-xxs font-bold">FM-WH-004</span>
              <ArrowRight size={14} className="text-muted" />
            </div>
            <div className="font-bold text-xs text-primary mb-1">
              สรุปสถิติการใช้ทรัพยากรและโควตา
            </div>
            <div className="text-xxs text-muted">
              ประเมินการเบิกจ่ายเทียบโควตาแผนกตามเกณฑ์ประสิทธิภาพทรัพยากร ISO 14001
            </div>
          </div>
        </div>
      </div>

      {/* Financial Valuation Summary Cards */}
      <div className="valuation-grid mb-6 no-print">
        <div className="card val-card">
          <div className="val-icon bg-blue">
            <DollarSign size={24} />
          </div>
          <div className="val-info">
            <div className="val-label">{lang === 'th' ? 'มูลค่าอุปกรณ์รวม (ราคาทุน)' : 'Total Asset Cost Valuation'}</div>
            <div className="val-value">{formatCurrency(totalCostVal)}</div>
          </div>
        </div>

        <div className="card val-card">
          <div className="val-icon bg-emerald">
            <TrendingUp size={24} />
          </div>
          <div className="val-info">
            <div className="val-label">{lang === 'th' ? 'ประมาณการราคาขาย / ประเมินมูลค่า' : 'Total Asset Retail Valuation'}</div>
            <div className="val-value">{formatCurrency(totalSaleVal)}</div>
          </div>
        </div>

        <div className="card val-card">
          <div className="val-icon bg-purple">
            <Layers size={24} />
          </div>
          <div className="val-info">
            <div className="val-label">{lang === 'th' ? 'จำนวนอุปกรณ์ทั้งหมดในระบบ' : 'Total Assets in Inventory'}</div>
            <div className="val-value">{products.reduce((sum, p) => sum + p.quantity, 0)} <span className="text-xs text-muted">{lang === 'th' ? 'ชิ้น/ชุด' : 'Units'}</span></div>
          </div>
        </div>
      </div>

      {/* Export & Backup Tools Section */}
      <div className="export-tools-grid mb-6 no-print">
        <div className="card tool-card">
          <div className="tool-header">
            <FileSpreadsheet color="#10b981" size={22} />
            <h3>{lang === 'th' ? 'ส่งออกไฟล์ CSV / Excel' : 'Export CSV Spreadsheets'}</h3>
          </div>
          <p className="tool-desc">
            {lang === 'th'
              ? 'ส่งออกข้อมูลอุปกรณ์สำนักงาน หรือประวัติการเบิกจ่ายพร้อม QR Code Tag และชื่อผู้เบิก'
              : 'Export inventory asset list and audit trail into UTF-8 CSV files compatible with Excel'}
          </p>
          <div className="tool-actions">
            <button className="btn btn-outline" onClick={exportProductsCSV}>
              <Download size={16} />
              {lang === 'th' ? 'อุปกรณ์สำนักงาน (CSV)' : 'Assets CSV'}
            </button>
            <button className="btn btn-outline" onClick={exportTransactionsCSV}>
              <Download size={16} />
              {lang === 'th' ? 'ประวัติการเบิกจ่าย (CSV)' : 'Requisitions CSV'}
            </button>
          </div>
        </div>

        <div className="card tool-card">
          <div className="tool-header">
            <Database color="#6366f1" size={22} />
            <h3>{lang === 'th' ? 'สำรอง & เรียกคืนข้อมูลระบบ (Database JSON)' : 'Full Database Backup & Restore'}</h3>
          </div>
          <p className="tool-desc">
            {lang === 'th'
              ? 'ดาวน์โหลดไฟล์สำรองข้อมูลอุปกรณ์ หมวดหมู่ รายชื่อผู้เบิก และประวัติย้อนหลังทั้งหมด'
              : 'Backup all products, categories, suppliers, and transaction logs to JSON or restore from file'}
          </p>
          <div className="tool-actions">
            <button className="btn btn-primary" onClick={exportDataJSON}>
              <Download size={16} />
              {lang === 'th' ? 'สำรองข้อมูล (Export JSON)' : 'Backup JSON'}
            </button>
            <button className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={16} />
              {lang === 'th' ? 'เรียกคืนข้อมูล (Restore JSON)' : 'Restore JSON'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      </div>

      {/* REPORT VIEW SELECTOR TABS (NO PRINT) */}
      <div className="card p-2 mb-4 no-print report-tabs-bar flex-between" style={{ background: 'var(--bg-surface)' }}>
        <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn btn-sm ${reportView === 'monthly' ? 'btn-primary font-bold' : 'btn-outline'}`}
            onClick={() => setReportView('monthly')}
          >
            <FileSpreadsheet size={16} />
            <span>📊 สรุปความเคลื่อนไหวประจำเดือน (Monthly Movement)</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${reportView === 'movements' ? 'btn-primary font-bold' : 'btn-outline'}`}
            onClick={() => setReportView('movements')}
          >
            <History size={16} />
            <span>📑 ตารางประวัติการเบิกจ่ายพัสดุ (Requisitions History)</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${reportView === 'inventory' ? 'btn-primary font-bold' : 'btn-outline'}`}
            onClick={() => setReportView('inventory')}
          >
            <Package size={16} />
            <span>📦 ตารางทะเบียนคุมและมูลค่าคลัง (Inventory Assets)</span>
          </button>
          <button
            type="button"
            className={`btn btn-sm ${reportView === 'qr_sheet' ? 'btn-primary font-bold' : 'btn-outline'}`}
            onClick={() => setReportView('qr_sheet')}
          >
            <QrCode size={16} />
            <span>🖨️ แผ่นป้ายสติ๊กเกอร์ QR Code (Asset Tags Sheet)</span>
          </button>
        </div>

        {reportView === 'movements' && (
          <div className="flex-center gap-2 text-xs">
            <span>ประเภท:</span>
            <select
              className="form-control text-xs"
              style={{ padding: '0.2rem 0.5rem', height: '30px' }}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">ทั้งหมด ({transactions.length})</option>
              <option value="OUT">เบิกจ่าย (OUT)</option>
              <option value="IN">รับเข้า (IN)</option>
              <option value="ADJUST">ตรวจนับ (ADJUST)</option>
            </select>
          </div>
        )}
      </div>

      {/* VIEW 0: MONTHLY INVENTORY MOVEMENT REPORT */}
      {reportView === 'monthly' && <MonthlyStockReport />}

      {/* VIEW 1: REQUISITIONS MOVEMENTS TABLE (MATCHES SCREENSHOT 100%) */}
      {reportView === 'movements' && (
        <div className="card report-table-card print-area">
          <div className="card-header pb-4 border-bottom flex-between">
            <div>
              <h2 className="font-extrabold text-base">
                {lang === 'th' ? 'รายงานประวัติการเบิกจ่ายและรับเข้าพัสดุ' : 'Requisitions & Stock Movement History'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {lang === 'th' ? 'บันทึกการเบิกจ่ายพัสดุ วันที่ เลขที่อ้างอิง และผู้ขอเบิกตามแผนก' : 'Chronological movement ledger with requesters'}
              </p>
            </div>
            <span className="badge badge-primary font-mono">{filteredTransactions.length} รายการ</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th style={{ width: '110px' }}>{lang === 'th' ? 'วันที่/เวลา' : 'Date / Time'}</th>
                  <th style={{ width: '65px', textAlign: 'center' }}>{lang === 'th' ? 'ประเภท' : 'Type'}</th>
                  <th>{lang === 'th' ? 'รายการพัสดุ / อุปกรณ์' : 'Asset Item'}</th>
                  <th style={{ width: '130px', textAlign: 'center' }}>{lang === 'th' ? 'เลขที่อ้างอิง' : 'Ref No.'}</th>
                  <th style={{ width: '70px', textAlign: 'right' }}>{lang === 'th' ? 'จำนวน' : 'Qty'}</th>
                  <th style={{ width: '190px' }}>{lang === 'th' ? 'ผู้ขอเบิก / แผนก' : 'Requester / Dept'}</th>
                  <th style={{ width: '120px' }}>{lang === 'th' ? 'ผู้บันทึก' : 'Recorded By'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => {
                  const isAudit = tx.type === 'ADJUST' || (tx.refNo && tx.refNo.startsWith('AUDIT')) || (tx.note && tx.note.includes('ตรวจนับ'));
                  return (
                    <tr key={tx.id}>
                      <td style={{ textAlign: 'center' }} className="text-muted font-bold text-xs">{idx + 1}</td>
                      <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        <div className="font-semibold">
                          {new Date(tx.date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                        </div>
                        <div className="text-xxs text-muted">
                          {new Date(tx.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${isAudit ? 'badge-warning' : tx.type === 'IN' ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: '800' }}>
                          {isAudit ? 'ADJUST' : tx.type}
                        </span>
                      </td>
                      <td>
                        <div className="font-bold text-slate-900">{tx.productName}</div>
                        {tx.note && <div className="text-xxs text-muted mt-0.5">{tx.note}</div>}
                      </td>
                      <td style={{ textAlign: 'center' }} className="font-mono text-xs text-primary font-bold">
                        {tx.refNo || '-'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: '800', fontSize: '0.95rem' }}>
                        {isAudit ? (tx.quantity > 0 ? `-${tx.quantity}` : tx.quantity) : tx.quantity}
                      </td>
                      <td>
                        <div className="font-bold text-slate-800">
                          {isAudit
                            ? (tx.createdBy || 'เจ้าหน้าที่ตรวจนับสต็อก')
                            : tx.type === 'IN'
                            ? (tx.createdBy ? `ผู้รับ: ${tx.createdBy}` : 'เจ้าหน้าที่คลังสินค้า')
                            : (tx.requesterName || tx.customer || tx.createdBy || 'เจ้าหน้าที่คลังสินค้า')}
                        </div>
                        <div className="text-xxs text-muted">
                          {isAudit
                            ? 'ฝ่ายคลังสินค้า (ปรับยอดตรวจนับ)'
                            : tx.type === 'IN'
                            ? (tx.supplierName ? `ซัพพลายเออร์: ${tx.supplierName}` : 'ฝ่ายคลังสินค้า (รับเข้าพัสดุ)')
                            : (tx.requesterDept || 'ฝ่ายคลังสินค้า (เบิกตรง)')}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {tx.createdBy || 'Admin'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: INVENTORY MASTER ASSET TABLE */}
      {reportView === 'inventory' && (
        <div className="card report-table-card print-area">
          <div className="card-header pb-4 border-bottom flex-between">
            <div>
              <h2 className="font-extrabold text-base">
                {lang === 'th' ? 'ตารางสรุปสถานะคลังอุปกรณ์และทรัพย์สิน' : 'Office Assets Valuation & Balance'}
              </h2>
              <p className="text-xs text-muted mt-0.5">
                {lang === 'th' ? 'รายงานแสดงปริมาณ มูลค่าต้นทุน รหัส Asset Tag และยอดคงเหลือ' : 'Comprehensive asset ledger'}
              </p>
            </div>
            <span className="badge badge-primary font-mono">{products.length} Assets</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}>#</th>
                  <th>{lang === 'th' ? 'อุปกรณ์' : 'Asset'}</th>
                  <th>{lang === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                  <th>Asset Tag (SKU)</th>
                  <th title="รหัสประจำตัวสำหรับสแกนกล้อง QR Code">รหัสกำกับ QR (Barcode)</th>
                  <th className="text-right">{lang === 'th' ? 'ราคาทุน' : 'Cost'}</th>
                  <th className="text-right">{lang === 'th' ? 'คงเหลือ' : 'Balance'}</th>
                  <th className="text-right">{lang === 'th' ? 'มูลค่ารวม' : 'Total Cost'}</th>
                </tr>
              </thead>
              <tbody>
                {products.map((prod, idx) => {
                  const catObj = categories.find((c) => c.id === prod.category);
                  const isLow = prod.quantity <= (prod.minThreshold || 5);

                  return (
                    <tr key={prod.id}>
                      <td style={{ textAlign: 'center' }} className="text-muted font-bold text-xs">{idx + 1}</td>
                      <td>
                        <div className="font-semibold">{prod.name}</div>
                      </td>
                      <td>
                        <span className="badge badge-primary text-xxs">
                          {catObj ? catObj.name : 'ทั่วไป'}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-muted font-bold">{prod.sku}</td>
                      <td className="font-mono text-xs text-primary">{prod.barcode}</td>
                      <td className="text-right">{formatCurrency(prod.costPrice)}</td>
                      <td className="text-right">
                        <span className={`badge ${isLow ? 'badge-danger' : 'badge-success'}`}>
                          {prod.quantity} {prod.unit}
                        </span>
                      </td>
                      <td className="text-right font-bold text-primary">
                        {formatCurrency(prod.quantity * prod.costPrice)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: PRINTABLE QR CODE ALL ASSET TAGS SHEET */}
      {reportView === 'qr_sheet' && (
        <div className="printable-qr-catalog-sheet print-area">
          <div className="qr-catalog-header mb-6 pb-4 border-bottom flex-between">
            <div className="flex-center gap-3">
              <img
                src="/logo.png"
                alt="EXION THAILAND"
                style={{ height: '95px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <h2 className="font-extrabold text-xl">EXION THAILAND Asset QR Code Tags</h2>
                <p className="text-muted text-xs">
                  แผ่นรวมป้าย QR Code ประจำอุปกรณ์สำนักงานทั้งหมด สำหรับพิมพ์ติดอุปกรณ์ (Asset Management)
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-sm font-bold text-primary">Total: {products.length} Assets</div>
              <div className="text-xs text-muted">{new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          <div className="qr-grid-layout">
            {products.map((prod) => (
              <div key={prod.id} className="qr-asset-badge-card">
                <div className="badge-card-header">
                  <span className="badge-comp-title">EXION THAILAND</span>
                  <span className="badge-sku font-mono">{prod.sku}</span>
                </div>
                <div className="badge-qr-render-area">
                  <div dangerouslySetInnerHTML={{ __html: renderQRCodeSVG(prod.barcode, 110) }} />
                </div>
                <div className="badge-card-footer">
                  <div className="badge-prod-name">{prod.name}</div>
                  <div className="badge-barcode-text font-mono">{prod.barcode}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ISO REPORT MODAL */}
      <ISOReportModal
        isOpen={Boolean(selectedISOForm)}
        onClose={() => setSelectedISOForm(null)}
        initialFormType={selectedISOForm || 'FM-WH-001'}
      />

      <style>{`
        .valuation-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.25rem;
        }

        .val-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.35rem;
        }

        .val-icon {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          flex-shrink: 0;
        }

        .val-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 700;
        }

        .val-value {
          font-size: 1.55rem;
          font-weight: 800;
          color: var(--text-primary);
          margin-top: 0.2rem;
        }

        .export-tools-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.25rem;
        }

        .tool-card {
          padding: 1.5rem;
        }

        .tool-header {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.5rem;
        }

        .tool-header h3 {
          font-size: 1.05rem;
          font-weight: 800;
        }

        .tool-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 1.25rem;
          line-height: 1.45;
        }

        .tool-actions {
          display: flex;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .qr-grid-layout {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.25rem;
        }

        .qr-asset-badge-card {
          background: #ffffff;
          border: 1.5px solid #0f172a;
          border-radius: 6px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: #0f172a;
          break-inside: avoid;
        }

        .badge-card-header {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.7rem;
          font-weight: 800;
          margin-bottom: 0.5rem;
          border-bottom: 1px dashed #cbd5e1;
          padding-bottom: 0.25rem;
        }

        .badge-comp-title { color: #4f46e5; }
        .badge-sku { color: #0f172a; }

        .badge-qr-render-area {
          padding: 0.35rem;
          background: #ffffff;
        }

        .badge-card-footer {
          margin-top: 0.5rem;
          width: 100%;
        }

        .badge-prod-name {
          font-size: 0.75rem;
          font-weight: 700;
          line-height: 1.25;
          margin-bottom: 0.2rem;
          height: 2.5em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .badge-barcode-text {
          font-size: 0.68rem;
          color: #64748b;
        }

        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm !important;
          }

          body {
            background: #ffffff !important;
            color: #000000 !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .no-print,
          .page-header,
          .iso-studio-banner,
          .valuation-grid,
          .export-tools-grid,
          .report-tabs-bar {
            display: none !important;
            visibility: hidden !important;
            height: 0 !important;
            max-height: 0 !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            opacity: 0 !important;
          }

          .report-table-card {
            border: none !important;
            box-shadow: none !important;
            padding: 10mm 14mm 10mm 14mm !important;
            box-sizing: border-box !important;
            margin: 0 !important;
            background: transparent !important;
          }

          .report-table-card .card-header {
            padding-bottom: 4px !important;
            margin-bottom: 6px !important;
          }

          .data-table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
            font-size: 8pt !important;
          }

          .data-table thead {
            display: table-header-group !important;
          }

          .data-table tfoot {
            display: table-footer-group !important;
          }

          .data-table tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .data-table th, .data-table td {
            padding: 4px 6px !important;
            font-size: 8pt !important;
            line-height: 1.25 !important;
            border: 1px solid #94a3b8 !important;
          }
        }
      `}</style>
    </div>
  );
};
