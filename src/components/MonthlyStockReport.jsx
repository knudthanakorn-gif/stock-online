import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  Package,
  Layers,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building,
  DollarSign,
  Search,
} from 'lucide-react';

const MONTH_NAMES_TH = [
  'มกราคม (January)',
  'กุมภาพันธ์ (February)',
  'มีนาคม (March)',
  'เมษายน (April)',
  'พฤษภาคม (May)',
  'มิถุนายน (June)',
  'กรกฎาคม (July)',
  'สิงหาคม (August)',
  'กันยายน (September)',
  'ตุลาคม (October)',
  'พฤศจิกายน (November)',
  'ธันวาคม (December)',
];

export const MonthlyStockReport = () => {
  const { products = [], categories = [], transactions = [], user, lang } = useStock();

  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth()); // 0 - 11
  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Available Years from transactions and current year
  const availableYears = useMemo(() => {
    const yearsSet = new Set([currentDate.getFullYear()]);
    transactions.forEach((tx) => {
      const d = new Date(tx.date || tx.timestamp || tx.createdAt);
      if (!isNaN(d.getFullYear())) {
        yearsSet.add(d.getFullYear());
      }
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [transactions]);

  // Available Companies from transactions
  const availableCompanies = useMemo(() => {
    const comps = new Set();
    transactions.forEach((tx) => {
      if (tx.requesterCompany) comps.add(tx.requesterCompany);
    });
    if (comps.size === 0) comps.add('EXION THAILAND');
    return Array.from(comps).filter(Boolean);
  }, [transactions]);

  // List of all unique departments in transactions
  const availableDepartments = useMemo(() => {
    const depts = new Set();
    transactions.forEach((tx) => {
      if (tx.requesterDept) depts.add(tx.requesterDept);
    });
    return Array.from(depts).filter(Boolean);
  }, [transactions]);

  // Currency formatter
  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  // Compute monthly report dataset per product
  const reportData = useMemo(() => {
    const startOfMonth = new Date(selectedYear, selectedMonth, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59, 999);

    return products.map((prod) => {
      const prodTransactions = transactions.filter((tx) => tx.productId === prod.id);

      // Transactions occurring after the selected month
      const txAfterMonth = prodTransactions.filter((tx) => {
        const d = new Date(tx.date || tx.timestamp || tx.createdAt);
        return d > endOfMonth;
      });

      // Compute ending stock for this month by unwinding transactions after this month
      let computedEndingStock = prod.quantity;
      txAfterMonth.forEach((tx) => {
        if (tx.type === 'IN') {
          computedEndingStock -= Number(tx.quantity) || 0;
        } else if (tx.type === 'OUT') {
          computedEndingStock += Number(tx.quantity) || 0;
        }
      });
      computedEndingStock = Math.max(0, computedEndingStock);

      // Transactions occurring DURING the selected month
      const txInMonth = prodTransactions.filter((tx) => {
        const d = new Date(tx.date || tx.timestamp || tx.createdAt);
        return d >= startOfMonth && d <= endOfMonth;
      });

      let monthInQty = 0;
      let monthOutQty = 0;
      let monthAdjustQty = 0;
      const deptOutMap = {};
      const companyOutMap = {};

      txInMonth.forEach((tx) => {
        const qty = Number(tx.quantity) || 0;
        if (tx.type === 'IN') {
          monthInQty += qty;
        } else if (tx.type === 'OUT') {
          monthOutQty += qty;
          const dept = tx.requesterDept || 'เบิกตรง/ไม่ระบุ';
          const comp = tx.requesterCompany || 'EXION THAILAND';
          deptOutMap[dept] = (deptOutMap[dept] || 0) + qty;
          companyOutMap[comp] = (companyOutMap[comp] || 0) + qty;
        } else if (tx.type === 'ADJUST') {
          monthAdjustQty += qty;
        }
      });

      // Beginning stock = endingStock - IN + OUT - ADJUST
      const computedBeginningStock = Math.max(0, computedEndingStock - monthInQty + monthOutQty - monthAdjustQty);

      const unitCost = Number(prod.costPrice) || 0;
      const beginningVal = computedBeginningStock * unitCost;
      const inVal = monthInQty * unitCost;
      const outVal = monthOutQty * unitCost;
      const endingVal = computedEndingStock * unitCost;

      const catObj = categories.find((c) => c.id === prod.category);

      // Top requisitioning departments string
      const topDepts = Object.entries(deptOutMap)
        .sort((a, b) => b[1] - a[1])
        .map(([dept, q]) => `${dept} (${q})`)
        .slice(0, 2)
        .join(', ');

      return {
        product: prod,
        sku: prod.sku || '-',
        name: prod.name,
        categoryName: catObj ? (lang === 'th' ? catObj.nameTh || catObj.name : catObj.name) : 'General',
        categoryId: prod.category,
        unit: prod.unit || 'ชิ้น',
        unitCost,
        beginningQty: computedBeginningStock,
        beginningVal,
        inQty: monthInQty,
        inVal,
        outQty: monthOutQty,
        outVal,
        adjustQty: monthAdjustQty,
        endingQty: computedEndingStock,
        endingVal,
        deptOutMap,
        companyOutMap,
        topDepts: topDepts || '-',
        hasActivity: monthInQty > 0 || monthOutQty > 0 || monthAdjustQty !== 0,
      };
    });
  }, [products, transactions, selectedYear, selectedMonth, categories, lang]);

  // Filtered dataset according to company, category, department, and search
  const filteredReportData = useMemo(() => {
    return reportData.filter((item) => {
      if (selectedCompany !== 'ALL') {
        if (!item.companyOutMap[selectedCompany] || item.companyOutMap[selectedCompany] <= 0) {
          return false;
        }
      }
      if (selectedCategory !== 'ALL' && item.categoryId !== selectedCategory) {
        return false;
      }
      if (selectedDept !== 'ALL') {
        if (!item.deptOutMap[selectedDept] || item.deptOutMap[selectedDept] <= 0) {
          return false;
        }
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.name.toLowerCase().includes(q);
        const matchSku = item.sku.toLowerCase().includes(q);
        const matchCat = item.categoryName.toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }
      return true;
    });
  }, [reportData, selectedCompany, selectedCategory, selectedDept, searchQuery]);

  // Totals calculations
  const totals = useMemo(() => {
    return filteredReportData.reduce(
      (acc, row) => ({
        beginningQty: acc.beginningQty + row.beginningQty,
        beginningVal: acc.beginningVal + row.beginningVal,
        inQty: acc.inQty + row.inQty,
        inVal: acc.inVal + row.inVal,
        outQty: acc.outQty + row.outQty,
        outVal: acc.outVal + row.outVal,
        endingQty: acc.endingQty + row.endingQty,
        endingVal: acc.endingVal + row.endingVal,
      }),
      {
        beginningQty: 0,
        beginningVal: 0,
        inQty: 0,
        inVal: 0,
        outQty: 0,
        outVal: 0,
        endingQty: 0,
        endingVal: 0,
      }
    );
  }, [filteredReportData]);

  // Export to Excel / CSV with BOM
  const exportToExcelCSV = () => {
    const monthLabel = MONTH_NAMES_TH[selectedMonth].split(' ')[0];
    const headers = [
      'ลำดับ',
      'Asset Tag / SKU',
      'ชื่ออุปกรณ์สำนักงาน',
      'หมวดหมู่',
      'หน่วยนับ',
      'ราคาทุนต่อหน่วย (บาท)',
      'ยอดต้นงวด (จำนวน)',
      'มูลค่าต้นงวด (บาท)',
      'รับเข้าระหว่างงวด (+ IN)',
      'มูลค่ารับเข้า (บาท)',
      'เบิกจ่ายระหว่างงวด (- OUT)',
      'มูลค่าเบิกจ่าย (บาท)',
      'ปรับยอดตรวจนับ (ADJUST)',
      'ยอดคงเหลือปลายงวด (จำนวน)',
      'มูลค่าคงเหลือปลายงวด (บาท)',
      'แผนกที่เบิกใช้สูงสุด',
    ];

    const rows = filteredReportData.map((r, idx) => [
      idx + 1,
      `"${r.sku}"`,
      `"${r.name.replace(/"/g, '""')}"`,
      `"${r.categoryName.replace(/"/g, '""')}"`,
      `"${r.unit}"`,
      r.unitCost,
      r.beginningQty,
      r.beginningVal,
      r.inQty,
      r.inVal,
      r.outQty,
      r.outVal,
      r.adjustQty,
      r.endingQty,
      r.endingVal,
      `"${r.topDepts.replace(/"/g, '""')}"`,
    ]);

    // Summary row
    const summaryRow = [
      'รวมทั้งสิ้น',
      '',
      '',
      '',
      '',
      '',
      totals.beginningQty,
      totals.beginningVal,
      totals.inQty,
      totals.inVal,
      totals.outQty,
      totals.outVal,
      '',
      totals.endingQty,
      totals.endingVal,
      '',
    ];

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(',')), summaryRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `รายงานสรุปความเคลื่อนไหวสต็อก_${monthLabel}_${selectedYear}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="monthly-stock-report">
      {/* Header Controls (No Print) */}
      <div className="card p-4 mb-4 no-print" style={{ border: '1.5px solid var(--border-color)' }}>
        <div className="flex-between mb-3" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 className="font-extrabold text-lg text-primary flex-center gap-2 mb-1">
              <FileSpreadsheet color="#2563eb" size={24} />
              <span>{lang === 'th' ? 'รายงานสรุปความเคลื่อนไหวสต็อกประจำเดือน (Monthly Inventory Movement)' : 'Monthly Inventory Movement Report'}</span>
            </h2>
            <p className="text-xs text-muted mb-0">
              {lang === 'th'
                ? 'คำนวณและสรุปยอดต้นงวด - รับเข้า - เบิกจ่าย - ปรับยอด - ยอดคงเหลือปลายงวด พร้อมมูลค่า สำหรับฝ่ายบัญชีและคลัง'
                : 'Beginning Balance, Inflow, Outflow, Adjustments, and Ending Balance with total valuations for Finance & Audit'}
            </p>
          </div>

          <div className="flex-center gap-2" style={{ flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-outline flex-center gap-1.5 font-bold"
              style={{ background: '#ecfdf5', borderColor: '#10b981', color: '#047857' }}
              onClick={exportToExcelCSV}
            >
              <Download size={16} />
              <span>{lang === 'th' ? 'ดาวน์โหลดไฟล์ Excel (.CSV)' : 'Export Excel / CSV'}</span>
            </button>
            <button
              type="button"
              className="btn btn-primary flex-center gap-1.5 font-bold"
              onClick={() => window.print()}
            >
              <Printer size={16} />
              <span>{lang === 'th' ? 'พิมพ์รายงานทางการ (A4 Report)' : 'Print Official Form'}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Grid */}
        <div className="form-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {/* Month Selector */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              📅 {lang === 'th' ? 'เลือกประจำเดือน' : 'Select Month'}
            </label>
            <select
              className="form-control text-xs font-bold"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {MONTH_NAMES_TH.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year Selector */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              🗓️ {lang === 'th' ? 'เลือกปี (Year)' : 'Select Year'}
            </label>
            <select
              className="form-control text-xs font-bold"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
            >
              {availableYears.map((yr) => (
                <option key={yr} value={yr}>
                  {yr} (พ.ศ. {yr + 543})
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              🏢 {lang === 'th' ? 'แยกตามบริษัท' : 'Company'}
            </label>
            <select
              className="form-control text-xs font-bold"
              style={{ color: '#1d4ed8' }}
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? '-- ทุกบริษัท (All) --' : '-- All Companies --'}</option>
              {availableCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  🏢 {comp}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              📁 {lang === 'th' ? 'หมวดหมู่อุปกรณ์' : 'Category'}
            </label>
            <select
              className="form-control text-xs"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? '-- ทุกหมวดหมู่ --' : '-- All Categories --'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'th' ? c.nameTh || c.name : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              👥 {lang === 'th' ? 'แผนกที่เบิกใช้' : 'Department'}
            </label>
            <select
              className="form-control text-xs"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? '-- ทุกแผนก --' : '-- All Departments --'}</option>
              {availableDepartments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="form-group mb-0">
            <label className="form-label font-bold text-xs">
              🔍 {lang === 'th' ? 'ค้นหาตามชื่อ / Tag' : 'Search Asset'}
            </label>
            <input
              type="text"
              className="form-control text-xs"
              placeholder={lang === 'th' ? 'พิมพ์ชื่ออุปกรณ์...' : 'Search...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Summary KPI Cards (No Print) */}
      <div className="valuation-grid mb-4 no-print">
        <div className="card val-card" style={{ borderLeft: '4px solid #64748b' }}>
          <div className="val-icon" style={{ background: '#f1f5f9', color: '#475569' }}>
            <Package size={22} />
          </div>
          <div className="val-info">
            <div className="val-label">{lang === 'th' ? 'ยอดสต็อกต้นงวด' : 'Beginning Inventory'}</div>
            <div className="val-value" style={{ fontSize: '1.25rem' }}>
              {totals.beginningQty.toLocaleString()} <span className="text-xs text-muted">ชิ้น</span>
            </div>
            <div className="text-xxs text-muted font-mono">{formatCurrency(totals.beginningVal)}</div>
          </div>
        </div>

        <div className="card val-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="val-icon bg-emerald">
            <ArrowDownRight size={22} />
          </div>
          <div className="val-info">
            <div className="val-label text-emerald">{lang === 'th' ? 'รับเข้าระหว่างงวด (+ IN)' : 'Total Inflow (+)'}</div>
            <div className="val-value text-emerald" style={{ fontSize: '1.25rem' }}>
              +{totals.inQty.toLocaleString()} <span className="text-xs text-muted">ชิ้น</span>
            </div>
            <div className="text-xxs text-muted font-mono">{formatCurrency(totals.inVal)}</div>
          </div>
        </div>

        <div className="card val-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="val-icon bg-red">
            <ArrowUpRight size={22} />
          </div>
          <div className="val-info">
            <div className="val-label text-red">{lang === 'th' ? 'เบิกจ่ายระหว่างงวด (- OUT)' : 'Total Outflow (-)'}</div>
            <div className="val-value text-red" style={{ fontSize: '1.25rem' }}>
              -{totals.outQty.toLocaleString()} <span className="text-xs text-muted">ชิ้น</span>
            </div>
            <div className="text-xxs text-muted font-mono">{formatCurrency(totals.outVal)}</div>
          </div>
        </div>

        <div className="card val-card" style={{ borderLeft: '4px solid #2563eb' }}>
          <div className="val-icon bg-blue">
            <DollarSign size={22} />
          </div>
          <div className="val-info">
            <div className="val-label text-primary">{lang === 'th' ? 'ยอดคงเหลือปลายงวด' : 'Ending Inventory'}</div>
            <div className="val-value text-primary" style={{ fontSize: '1.25rem' }}>
              {totals.endingQty.toLocaleString()} <span className="text-xs text-muted">ชิ้น</span>
            </div>
            <div className="text-xxs font-bold text-primary font-mono">{formatCurrency(totals.endingVal)}</div>
          </div>
        </div>
      </div>

      {/* PRINTABLE REPORT DOCUMENT CONTAINER */}
      <div className="card p-4 print-report-container" style={{ background: '#ffffff', color: '#0f172a' }}>
        {/* ISO Standard Header (Appears on Print & Screen) */}
        <div className="report-doc-header border-bottom pb-3 mb-3">
          <div className="flex-between" style={{ alignItems: 'flex-start' }}>
            <div className="flex-center gap-3">
              <img
                src="/logo.png"
                alt="EXION THAILAND"
                style={{ height: '100px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <h1 className="font-extrabold text-base mb-0" style={{ color: '#0f172a', letterSpacing: '0.3px' }}>
                  บริษัท เอ็กชั่น (ประเทศไทย) จำกัด • EXION (THAILAND) CO., LTD.
                </h1>
                <div className="text-xs text-muted">
                  รายงานสรุปความเคลื่อนไหวสต็อกและมูลค่าอุปกรณ์สำนักงานประจำเดือน (Monthly Inventory Movement Report)
                </div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="badge badge-primary font-mono font-bold text-xxs mb-1">
                FORM: FM-WH-005 (REV. 02)
              </div>
              <div className="text-muted text-xxs">
                มาตรฐาน ISO 9001:2015 / ISO 14001
              </div>
            </div>
          </div>

          <div className="flex-between mt-3 pt-2 border-top text-xs text-slate-700 font-semibold" style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px' }}>
            <div>
              📌 {lang === 'th' ? 'ประจำเดือน:' : 'Period:'}{' '}
              <strong className="text-primary">{MONTH_NAMES_TH[selectedMonth]} {selectedYear} (พ.ศ. {selectedYear + 543})</strong>
            </div>
            <div>
              📁 {lang === 'th' ? 'หมวดหมู่:' : 'Category:'} <strong>{selectedCategory === 'ALL' ? 'ทุกหมวดหมู่อุปกรณ์' : categories.find(c => c.id === selectedCategory)?.name || selectedCategory}</strong>
            </div>
            <div>
              🕒 {lang === 'th' ? 'วันที่พิมพ์รายงาน:' : 'Printed Date:'} {new Date().toLocaleDateString('th-TH')} {new Date().toLocaleTimeString('th-TH')}
            </div>
            <div>
              👤 {lang === 'th' ? 'ผู้ออกรายงาน:' : 'Issued By:'} {user ? `${user.name} (${user.role.toUpperCase()})` : 'System Admin'}
            </div>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="table-responsive">
          <table className="data-table compact-table border-collapse" style={{ width: '100%', fontSize: '0.75rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', color: '#1e293b' }}>
                <th style={{ width: '30px' }} className="text-center">#</th>
                <th style={{ width: '90px' }}>Asset Tag</th>
                <th>{lang === 'th' ? 'ชื่ออุปกรณ์สำนักงาน' : 'Asset Description'}</th>
                <th style={{ width: '85px' }}>{lang === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                <th style={{ width: '70px' }} className="text-right">{lang === 'th' ? 'ทุน/หน่วย' : 'Unit Cost'}</th>
                <th style={{ width: '85px' }} className="text-center" title="ยอดต้นงวด">{lang === 'th' ? 'ต้นงวด' : 'Beginning'}</th>
                <th style={{ width: '85px' }} className="text-center text-emerald" title="รับเข้าระหว่างงวด">{lang === 'th' ? 'รับเข้า (+)' : 'In (+)'}</th>
                <th style={{ width: '85px' }} className="text-center text-red" title="เบิกจ่ายระหว่างงวด">{lang === 'th' ? 'เบิกจ่าย (-)' : 'Out (-)'}</th>
                <th style={{ width: '95px' }} className="text-center font-bold text-primary" title="ยอดคงเหลือปลายงวด">{lang === 'th' ? 'คงเหลือ' : 'Ending'}</th>
                <th style={{ width: '100px' }} className="text-right">{lang === 'th' ? 'มูลค่ารวม' : 'Total Value'}</th>
                <th className="no-print" style={{ width: '130px' }}>{lang === 'th' ? 'แผนกที่เบิกใช้' : 'Top Requesters'}</th>
              </tr>
            </thead>
            <tbody>
              {filteredReportData.length === 0 ? (
                <tr>
                  <td colSpan="11" className="text-center py-6 text-muted">
                    {lang === 'th' ? 'ไม่พบข้อมูลอุปกรณ์ตามเงื่อนไขที่เลือก' : 'No records found for the selected period'}
                  </td>
                </tr>
              ) : (
                filteredReportData.map((row, idx) => (
                  <tr key={row.product.id} style={{ background: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                    <td className="text-center font-bold text-muted">{idx + 1}</td>
                    <td className="font-mono text-xxs font-bold text-slate-700">{row.sku}</td>
                    <td>
                      <div className="font-bold text-slate-900">{row.name}</div>
                      <div className="text-xxs text-muted">{row.unit}</div>
                    </td>
                    <td className="text-xxs text-slate-600">{row.categoryName}</td>
                    <td className="text-right font-mono text-xxs">{formatCurrency(row.unitCost)}</td>
                    <td className="text-center font-mono">
                      <span className="font-bold">{row.beginningQty}</span>
                      <div className="text-xxs text-muted">{formatCurrency(row.beginningVal)}</div>
                    </td>
                    <td className="text-center font-mono text-emerald">
                      {row.inQty > 0 ? (
                        <>
                          <span className="font-bold">+{row.inQty}</span>
                          <div className="text-xxs text-emerald">{formatCurrency(row.inVal)}</div>
                        </>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-center font-mono text-red">
                      {row.outQty > 0 ? (
                        <>
                          <span className="font-bold">-{row.outQty}</span>
                          <div className="text-xxs text-red">{formatCurrency(row.outVal)}</div>
                        </>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td className="text-center font-mono text-primary font-bold" style={{ background: 'rgba(37, 99, 235, 0.04)' }}>
                      <span style={{ fontSize: '0.85rem' }}>{row.endingQty}</span>
                    </td>
                    <td className="text-right font-mono font-bold text-slate-900">
                      {formatCurrency(row.endingVal)}
                    </td>
                    <td className="text-xxs text-muted no-print" style={{ maxWidth: '140px' }}>
                      {row.topDepts}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr style={{ background: '#e2e8f0', fontWeight: 'bold', fontSize: '0.8rem', borderTop: '2px solid #94a3b8' }}>
                <td colSpan="5" className="text-right py-2">
                  {lang === 'th' ? 'รวมยอดทั้งสิ้น (Grand Total):' : 'Grand Total:'}
                </td>
                <td className="text-center font-mono">
                  <div>{totals.beginningQty.toLocaleString()}</div>
                  <div className="text-xxs text-muted">{formatCurrency(totals.beginningVal)}</div>
                </td>
                <td className="text-center font-mono text-emerald">
                  <div>+{totals.inQty.toLocaleString()}</div>
                  <div className="text-xxs">{formatCurrency(totals.inVal)}</div>
                </td>
                <td className="text-center font-mono text-red">
                  <div>-{totals.outQty.toLocaleString()}</div>
                  <div className="text-xxs">{formatCurrency(totals.outVal)}</div>
                </td>
                <td className="text-center font-mono text-primary">
                  <div style={{ fontSize: '0.9rem' }}>{totals.endingQty.toLocaleString()}</div>
                </td>
                <td className="text-right font-mono text-primary font-extrabold">
                  {formatCurrency(totals.endingVal)}
                </td>
                <td className="no-print"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* 3-Tier ISO Approval Sign-off Box (Appears on Print) */}
        <div className="report-signature-grid mt-6 pt-4 border-top">
          <div className="sig-box">
            <div className="sig-title">ผู้จัดทำรายงาน (Prepared By)</div>
            <div className="sig-line"></div>
            <div className="sig-name">({user?.name || '...................................................'})</div>
            <div className="sig-role">เจ้าหน้าที่ควบคุมสต็อก / Storekeeper</div>
            <div className="sig-date">วันที่ ..... / ..... / .........</div>
          </div>

          <div className="sig-box">
            <div className="sig-title">ผู้ตรวจสอบ (Verified By)</div>
            <div className="sig-line"></div>
            <div className="sig-name">(...................................................)</div>
            <div className="sig-role">หัวหน้าแผนกคลังสินค้า / Warehouse Supervisor</div>
            <div className="sig-date">วันที่ ..... / ..... / .........</div>
          </div>

          <div className="sig-box">
            <div className="sig-title">ผู้อนุมัติ / ฝ่ายบัญชี (Approved By)</div>
            <div className="sig-line"></div>
            <div className="sig-name">(...................................................)</div>
            <div className="sig-role">ผู้จัดการฝ่ายบัญชีและการเงิน / Finance Manager</div>
            <div className="sig-date">วันที่ ..... / ..... / .........</div>
          </div>
        </div>
      </div>

      <style>{`
        .monthly-stock-report {
          width: 100%;
        }

        .report-signature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          text-align: center;
          page-break-inside: avoid;
        }

        .sig-box {
          border: 1px dashed #cbd5e1;
          padding: 1rem 0.5rem;
          border-radius: 6px;
          background: #f8fafc;
        }

        .sig-title {
          font-weight: 700;
          font-size: 0.75rem;
          color: #334155;
          margin-bottom: 2.2rem;
        }

        .sig-line {
          border-bottom: 1px solid #64748b;
          width: 75%;
          margin: 0 auto 0.4rem auto;
        }

        .sig-name {
          font-weight: 600;
          font-size: 0.72rem;
          color: #1e293b;
        }

        .sig-role {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 0.15rem;
        }

        .sig-date {
          font-size: 0.65rem;
          color: #64748b;
          margin-top: 0.35rem;
        }

        @media print {
          @page {
            size: A4 landscape;
            margin: 0mm !important;
          }

          body {
            background: #ffffff !important;
            color: #000000 !important;
            font-size: 8pt !important;
            margin: 0 !important;
            padding: 0 !important;
            box-sizing: border-box !important;
          }

          .no-print, .navbar, .sidebar {
            display: none !important;
          }

          .print-report-container {
            border: none !important;
            padding: 8mm 12mm 8mm 12mm !important;
            box-sizing: border-box !important;
            box-shadow: none !important;
            width: 100% !important;
          }

          .data-table {
            width: 100% !important;
            border-collapse: collapse !important;
            page-break-inside: auto !important;
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
            border: 1px solid #94a3b8 !important;
            padding: 4px 6px !important;
          }

          .sig-box {
            border: 1px solid #94a3b8 !important;
            background: transparent !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </div>
  );
};
