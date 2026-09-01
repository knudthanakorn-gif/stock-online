import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import {
  ClipboardCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowUpDown,
  Save,
  RotateCcw,
  Download,
  Package,
  Layers,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  Minus,
} from 'lucide-react';

export const StockAudit = () => {
  const {
    products,
    categories,
    applyStockAuditAdjustment,
    lang,
    user,
  } = useStock();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyDiff, setShowOnlyDiff] = useState(false);
  const [sessionNote, setSessionNote] = useState('ตรวจนับสต็อกประจำงวด');
  const [successMessage, setSuccessMessage] = useState('');

  // Counted quantities map: { [productId]: number | '' }
  const [countedMap, setCountedMap] = useState(() => {
    const initial = {};
    products.forEach(p => {
      initial[p.id] = p.quantity; // Default to system quantity
    });
    return initial;
  });

  // Filter products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase());

      const counted = countedMap[p.id] !== undefined && countedMap[p.id] !== '' ? Number(countedMap[p.id]) : p.quantity;
      const hasDiff = counted !== p.quantity;

      if (showOnlyDiff && !hasDiff) return false;

      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery, showOnlyDiff, countedMap]);

  // Statistics calculation
  const stats = useMemo(() => {
    let matchedCount = 0;
    let shortageCount = 0;
    let surplusCount = 0;
    let totalDiffUnits = 0;

    products.forEach(p => {
      const counted = countedMap[p.id] !== undefined && countedMap[p.id] !== '' ? Number(countedMap[p.id]) : p.quantity;
      const diff = counted - p.quantity;

      if (diff === 0) {
        matchedCount++;
      } else if (diff < 0) {
        shortageCount++;
        totalDiffUnits += diff;
      } else {
        surplusCount++;
        totalDiffUnits += diff;
      }
    });

    return {
      total: products.length,
      matchedCount,
      shortageCount,
      surplusCount,
      hasDiscrepancies: shortageCount > 0 || surplusCount > 0,
      totalDiffUnits,
    };
  }, [products, countedMap]);

  const handleCountChange = (productId, val) => {
    if (val === '') {
      setCountedMap(prev => ({ ...prev, [productId]: '' }));
      return;
    }
    const num = Math.max(0, parseInt(val, 10) || 0);
    setCountedMap(prev => ({ ...prev, [productId]: num }));
  };

  const handleStepCount = (productId, delta) => {
    setCountedMap(prev => {
      const current = prev[productId] !== undefined && prev[productId] !== '' ? Number(prev[productId]) : 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [productId]: next };
    });
  };

  const handleResetToSystem = () => {
    if (window.confirm(lang === 'th' ? 'ต้องการรีเซ็ตยอดนับให้เท่ากับยอดในระบบทั้งหมดหรือไม่?' : 'Reset all counted values to system quantities?')) {
      const reset = {};
      products.forEach(p => {
        reset[p.id] = p.quantity;
      });
      setCountedMap(reset);
      setSuccessMessage('');
    }
  };

  const handleApplyAdjustment = () => {
    if (!stats.hasDiscrepancies) {
      alert(lang === 'th' ? 'ยอดที่นับได้ตรงกับยอดในระบบทุกรายการ ไม่มีการปรับยอด' : 'All counted quantities match system records');
      return;
    }

    const confirmMsg = lang === 'th'
      ? `ยืนยันบันทึกผลการตรวจนับและปรับยอดสต็อก?\n\n- รายการยอดขาด: ${stats.shortageCount} รายการ\n- รายการยอดเกิน: ${stats.surplusCount} รายการ\n\nระบบจะอัปเดตยอดคงเหลือและบันทึกประวัติการปรับยอดทันที`
      : `Confirm applying stock adjustment for ${stats.shortageCount + stats.surplusCount} items?`;

    if (window.confirm(confirmMsg)) {
      const auditRecords = products.map(p => ({
        productId: p.id,
        productName: p.name,
        sku: p.sku,
        systemQty: p.quantity,
        countedQty: countedMap[p.id] !== undefined && countedMap[p.id] !== '' ? Number(countedMap[p.id]) : p.quantity,
      }));

      const adjustedCount = applyStockAuditAdjustment({
        auditRecords,
        sessionNote,
      });

      setSuccessMessage(
        lang === 'th'
          ? `🎉 ปรับยอดสต็อกตามการนับจริงเรียบร้อยแล้ว (${adjustedCount} รายการ)!`
          : `Stock adjusted successfully for ${adjustedCount} items!`
      );

      setTimeout(() => setSuccessMessage(''), 4000);
    }
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Product Name', 'Category', 'System Qty', 'Counted Qty', 'Variance', 'Unit', 'Status'];
    const rows = products.map(p => {
      const counted = countedMap[p.id] !== undefined && countedMap[p.id] !== '' ? Number(countedMap[p.id]) : p.quantity;
      const diff = counted - p.quantity;
      const status = diff === 0 ? 'MATCH' : diff < 0 ? 'SHORTAGE' : 'SURPLUS';
      return [
        `"${p.sku}"`,
        `"${p.name}"`,
        `"${p.category}"`,
        p.quantity,
        counted,
        diff > 0 ? `+${diff}` : diff,
        `"${p.unit || 'ชิ้น'}"`,
        status,
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="stock-audit-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <ClipboardCheck color="#4f46e5" />
            {lang === 'th' ? 'ตรวจนับสต็อกประจำงวด (Stocktake & Cycle Count Audit)' : 'Stocktake & Audit'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? 'ระบบตรวจนับจำนวนสินค้าจริงเปรียบเทียบกับยอดในระบบ พร้อมบันทึกปรับยอดสต็อกอัตโนมัติ'
              : 'Physical inventory counting, variance analysis, and automatic stock adjustment'}
          </p>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} />
            {lang === 'th' ? 'ส่งออกรายงาน CSV' : 'Export Audit CSV'}
          </button>
          <button className="btn btn-secondary" onClick={handleResetToSystem}>
            <RotateCcw size={16} />
            {lang === 'th' ? 'รีเซ็ตยอดนับ' : 'Reset Counts'}
          </button>
          <button
            className="btn btn-primary font-bold flex-center gap-1.5"
            onClick={handleApplyAdjustment}
            disabled={!stats.hasDiscrepancies}
          >
            <Save size={16} />
            <span>{lang === 'th' ? 'บันทึกปรับยอดสต็อกจริง' : 'Apply Stock Adjustment'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="alert-box alert-success mb-4 flex-between">
          <div className="flex-center gap-2">
            <CheckCircle2 size={20} />
            <span className="font-bold">{successMessage}</span>
          </div>
          <button className="close-btn" onClick={() => setSuccessMessage('')}>
            <Check size={16} />
          </button>
        </div>
      )}

      {/* KPI Stats Overview */}
      <div className="stats-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="card stat-card">
          <div className="stat-label">{lang === 'th' ? 'รายการทั้งหมด' : 'Total Items'}</div>
          <div className="stat-value text-primary">{stats.total}</div>
          <div className="stat-desc text-xs text-muted">ครอบคลุมทุกหมวดหมู่</div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-label">{lang === 'th' ? 'ยอดตรงกัน (Matched)' : 'Matched'}</div>
          <div className="stat-value text-green font-bold">{stats.matchedCount}</div>
          <div className="stat-desc text-xs text-muted">ยอดนับตรงกับระบบ 100%</div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-label">{lang === 'th' ? 'ยอดขาด (Shortage)' : 'Shortage'}</div>
          <div className="stat-value text-red font-bold">{stats.shortageCount}</div>
          <div className="stat-desc text-xs text-muted">นับได้น้อยกว่าในระบบ</div>
        </div>

        <div className="card stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-label">{lang === 'th' ? 'ยอดเกิน (Surplus)' : 'Surplus'}</div>
          <div className="stat-value text-amber font-bold">{stats.surplusCount}</div>
          <div className="stat-desc text-xs text-muted">นับได้มากกว่าในระบบ</div>
        </div>
      </div>

      {/* Audit Toolbar */}
      <div className="card toolbar-card mb-4">
        <div className="toolbar-left" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={lang === 'th' ? 'ค้นหาตามชื่อสินค้า หรือ SKU...' : 'Search by name or SKU...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'หมวดหมู่:' : 'Category:'}</span>
            <select
              className="form-control filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? 'ทุกหมวดหมู่ (All Categories)' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          <label className="flex-center gap-2 cursor-pointer text-xs font-bold" style={{ padding: '0 0.5rem' }}>
            <input
              type="checkbox"
              checked={showOnlyDiff}
              onChange={(e) => setShowOnlyDiff(e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span style={{ color: showOnlyDiff ? '#4f46e5' : 'var(--text-primary)' }}>
              🔍 {lang === 'th' ? 'แสดงเฉพาะรายการที่มีผลต่าง (Show Discrepancies Only)' : 'Show Discrepancies Only'}
            </span>
          </label>
        </div>

        {/* Audit Session Note */}
        <div className="flex-center gap-2">
          <span className="text-xs font-bold text-muted">{lang === 'th' ? 'บันทึกงวด:' : 'Session Note:'}</span>
          <input
            type="text"
            className="form-control"
            style={{ width: '200px', padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
            placeholder="เช่น ตรวจนับสิ้นเดือน ส.ค."
            value={sessionNote}
            onChange={(e) => setSessionNote(e.target.value)}
          />
        </div>
      </div>

      {/* Audit Table */}
      <div className="table-responsive">
        <table className="data-table requester-table">
          <thead>
            <tr>
              <th style={{ width: '40px', textAlign: 'center' }}>#</th>
              <th style={{ width: '110px' }}>รหัส SKU</th>
              <th style={{ minWidth: '220px' }}>รายการอุปกรณ์ / พัสดุ</th>
              <th style={{ width: '130px' }}>หมวดหมู่</th>
              <th style={{ width: '120px', textAlign: 'center' }}>ยอดในระบบ</th>
              <th style={{ width: '180px', textAlign: 'center' }}>ยอดที่นับได้จริง (Counted)</th>
              <th style={{ width: '130px', textAlign: 'center' }}>ผลต่าง (Variance)</th>
              <th style={{ width: '120px', textAlign: 'center' }}>สถานะ</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-6 text-muted">
                  {lang === 'th' ? 'ไม่พบรายการอุปกรณ์ตามเงื่อนไขที่เลือก' : 'No items match filter'}
                </td>
              </tr>
            ) : (
              filteredProducts.map((p, idx) => {
                const countedVal = countedMap[p.id] !== undefined ? countedMap[p.id] : p.quantity;
                const countedNum = countedVal !== '' ? Number(countedVal) : p.quantity;
                const diff = countedNum - p.quantity;

                return (
                  <tr key={p.id} style={{ background: diff !== 0 ? (diff < 0 ? 'rgba(239, 68, 68, 0.04)' : 'rgba(245, 158, 11, 0.04)') : undefined }}>
                    <td className="text-muted text-xs text-center">{idx + 1}</td>
                    <td className="font-mono text-xs font-bold">{p.sku}</td>
                    <td>
                      <div className="flex-center gap-2">
                        <img
                          src={p.image}
                          alt={p.name}
                          style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div className="font-bold text-sm text-primary">{p.name}</div>
                          <div className="text-xxs text-muted">หน่วยนับ: {p.unit || 'ชิ้น'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-info text-xxs font-bold">{p.category}</span>
                    </td>
                    <td className="text-center">
                      <span className="font-mono font-bold text-base" style={{ color: 'var(--text-primary)' }}>
                        {p.quantity}
                      </span>
                    </td>
                    <td className="text-center">
                      <div className="flex-center gap-1 justify-center">
                        <button
                          type="button"
                          className="btn-counter-sub"
                          style={{ width: '26px', height: '26px' }}
                          onClick={() => handleStepCount(p.id, -1)}
                          title="ลด 1"
                        >
                          <Minus size={12} />
                        </button>
                        <input
                          type="number"
                          min="0"
                          className="form-control font-mono font-bold text-center"
                          style={{
                            width: '75px',
                            padding: '0.35rem',
                            fontSize: '1rem',
                            borderColor: diff !== 0 ? (diff < 0 ? '#ef4444' : '#f59e0b') : undefined,
                          }}
                          value={countedVal}
                          onChange={(e) => handleCountChange(p.id, e.target.value)}
                        />
                        <button
                          type="button"
                          className="btn-counter-add"
                          style={{ width: '26px', height: '26px' }}
                          onClick={() => handleStepCount(p.id, 1)}
                          title="เพิ่ม 1"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </td>
                    <td className="text-center font-mono font-bold">
                      {diff === 0 ? (
                        <span className="text-green font-bold">0 (ตรงกัน)</span>
                      ) : diff < 0 ? (
                        <span className="text-red font-extrabold" style={{ fontSize: '0.95rem' }}>
                          {diff}
                        </span>
                      ) : (
                        <span className="text-amber font-extrabold" style={{ fontSize: '0.95rem' }}>
                          +{diff}
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      {diff === 0 ? (
                        <span className="badge badge-success text-xxs font-bold">🟢 ตรงกัน</span>
                      ) : diff < 0 ? (
                        <span className="badge badge-danger text-xxs font-bold">🔴 ยอดขาด {Math.abs(diff)}</span>
                      ) : (
                        <span className="badge badge-warning text-xxs font-bold">🟡 ยอดเกิน +{diff}</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
