import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import {
  History,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  UserCheck,
  Building2,
  Briefcase,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  FileText,
  Eye,
  Download,
  X,
} from 'lucide-react';

export const TransactionHistory = () => {
  const { transactions, products, lang } = useStock();

  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, IN, OUT, ADJUST
  const [companyFilter, setCompanyFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedPdfModal, setSelectedPdfModal] = useState(null);

  // Available unique companies
  const availableCompanies = React.useMemo(() => {
    const companies = new Set();
    transactions.forEach(tx => {
      if (tx.requesterCompany) companies.add(tx.requesterCompany);
    });
    if (companies.size === 0) companies.add('EXION THAILAND');
    return Array.from(companies).filter(Boolean);
  }, [transactions]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, companyFilter, searchQuery]);

  const filteredTransactions = transactions.filter(tx => {
    const isAudit = tx.type === 'ADJUST' || (tx.refNo && tx.refNo.startsWith('AUDIT')) || (tx.note && tx.note.includes('ตรวจนับ'));
    
    let matchType = true;
    if (typeFilter === 'IN') {
      matchType = tx.type === 'IN';
    } else if (typeFilter === 'OUT') {
      matchType = tx.type === 'OUT' && !isAudit;
    } else if (typeFilter === 'ADJUST') {
      matchType = isAudit;
    }

    const txComp = tx.requesterCompany || 'EXION THAILAND';
    const matchCompany = companyFilter === 'ALL' || txComp === companyFilter;

    const matchSearch =
      !searchQuery ||
      tx.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (tx.refNo && tx.refNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.note && tx.note.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.supplierName && tx.supplierName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.customer && tx.customer.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.requesterName && tx.requesterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.requesterCompany && tx.requesterCompany.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.requesterDept && tx.requesterDept.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.requesterPosition && tx.requesterPosition.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tx.createdBy && tx.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchType && matchCompany && matchSearch;
  });

  const totalItems = filteredTransactions.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalItems / (Number(pageSize) || 20)));
  const paginatedTransactions = pageSize === 'ALL'
    ? filteredTransactions
    : filteredTransactions.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const formatDate = (isoStr) => {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="transaction-history-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <History color="#2563eb" />
            {lang === 'th' ? 'ประวัติการรับเข้า - เบิกจ่ายสินค้า (Audit Logs)' : 'Stock Movement & Requisition Logs'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `บันทึกความเคลื่อนไหวสต็อกสินค้าทั้งหมด ${filteredTransactions.length} รายการ`
              : `Showing ${filteredTransactions.length} transaction movement records`}
          </p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="card toolbar-card mb-4">
        <div className="toolbar-left">
          {/* Search Box */}
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder={lang === 'th' ? 'ค้นหาตามชื่อสินค้า, ชื่อผู้เบิก, แผนก, ตำแหน่ง, หรือเลขเอกสาร...' : 'Search by Product, Requester, Dept, Position...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'ประเภทรายการ:' : 'Movement Type:'}</span>
            <select
              className="form-control filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? 'ทั้งหมด (All Types)' : 'All Transactions'}</option>
              <option value="IN">{lang === 'th' ? 'รับเข้า (+ Stock In)' : 'Stock In (+)'}</option>
              <option value="OUT">{lang === 'th' ? 'เบิกจ่าย (- Stock Out)' : 'Stock Out (-)'}</option>
              <option value="ADJUST">{lang === 'th' ? 'ตรวจนับ/ปรับยอด (ADJUST)' : 'Audit Adjustments'}</option>
            </select>
          </div>

          {/* Company Filter */}
          <div className="filter-group">
            <span className="filter-label">{lang === 'th' ? 'แยกตามบริษัท:' : 'Company:'}</span>
            <select
              className="form-control filter-select font-bold"
              style={{ color: '#1d4ed8' }}
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? 'ทุกบริษัท (All Companies)' : 'All Companies'}</option>
              {availableCompanies.map((comp) => (
                <option key={comp} value={comp}>
                  🏢 {comp}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Logs Data Table */}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>{lang === 'th' ? 'วัน-เวลา' : 'Date & Time'}</th>
              <th>{lang === 'th' ? 'ประเภท' : 'Type'}</th>
              <th>{lang === 'th' ? 'สินค้า' : 'Product'}</th>
              <th>{lang === 'th' ? 'จำนวน' : 'Qty'}</th>
              <th>{lang === 'th' ? 'มูลค่ารวม' : 'Total Amount'}</th>
              <th>{lang === 'th' ? 'Stock คงเหลือ' : 'Stock Balance'}</th>
              <th>{lang === 'th' ? 'เลขเอกสาร' : 'Ref / PO / REQ'}</th>
              <th>{lang === 'th' ? 'ข้อมูลผู้เบิก / ซัพพลายเออร์' : 'Requester / Supplier Info'}</th>
              <th>{lang === 'th' ? 'หมายเหตุ' : 'Notes'}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="9" className="text-center py-4 text-muted">
                  {lang === 'th' ? 'ไม่พบรายการเคลื่อนไหวสต็อก' : 'No transaction records found'}
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => {
                const isIn = tx.type === 'IN';
                const isAudit = tx.type === 'ADJUST' || (tx.refNo && tx.refNo.startsWith('AUDIT')) || (tx.note && tx.note.includes('ตรวจนับ'));
                const prodObj = products.find(p => p.id === tx.productId);
                const stockVal = tx.balanceAfter !== undefined ? tx.balanceAfter : (prodObj ? prodObj.quantity : '-');

                return (
                  <tr key={tx.id}>
                    <td className="text-muted text-xs whitespace-nowrap">
                      {formatDate(tx.date || tx.timestamp || tx.createdAt)}
                    </td>
                    <td>
                      {isAudit ? (
                        <span className="badge badge-warning">
                          <Sliders size={14} />
                          {lang === 'th' ? 'ตรวจนับ (ADJUST)' : 'ADJUST'}
                        </span>
                      ) : (
                        <span className={`badge ${isIn ? 'badge-success' : 'badge-danger'}`}>
                          {isIn ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                          {isIn ? (lang === 'th' ? 'รับเข้า (+)' : 'IN (+)') : (lang === 'th' ? 'เบิกจ่าย (-)' : 'OUT (-)')}
                        </span>
                      )}
                    </td>
                    <td className="font-semibold">{tx.productName || prodObj?.name || '-'}</td>
                    <td>
                      <span className={`font-mono font-bold ${isAudit ? 'text-amber-600' : isIn ? 'text-emerald' : 'text-red'}`}>
                        {isAudit ? (tx.quantity > 0 ? `-${tx.quantity}` : `${tx.quantity}`) : isIn ? `+${tx.quantity}` : `-${tx.quantity}`}
                      </span>
                    </td>
                    <td className="font-mono text-xs font-bold text-slate-800">
                      {formatCurrency((tx.unitPrice || prodObj?.costPrice || 0) * (tx.quantity || 0))}
                    </td>
                    <td>
                      <span className="stock-balance-chip font-mono font-bold">
                        {stockVal !== '-' ? `${stockVal} ${prodObj?.unit || 'ชิ้น'}` : '-'}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1 items-start">
                        <span className="ref-tag font-mono">{tx.refNo || '-'}</span>
                        {tx.invoiceFile && (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs flex-center gap-1 font-bold mt-1"
                            style={{
                              borderColor: '#fca5a5',
                              background: '#fff1f2',
                              color: '#dc2626',
                              padding: '2px 7px',
                              fontSize: '0.68rem',
                              borderRadius: '4px',
                              cursor: 'pointer',
                            }}
                            onClick={() => setSelectedPdfModal(tx.invoiceFile)}
                            title={lang === 'th' ? `ดูเอกสารแนบ Invoice: ${tx.invoiceFile.name}` : `View Invoice PDF: ${tx.invoiceFile.name}`}
                          >
                            <FileText size={11} color="#dc2626" />
                            <span>Invoice PDF</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td>
                      {isIn ? (
                        <div className="party-info">
                          <div className="font-semibold text-emerald flex items-center gap-1">
                            <UserCheck size={14} className="inline-icon text-emerald flex-shrink-0" />
                            <span>{lang === 'th' ? 'ผู้รับเข้า:' : 'Received By:'} {tx.createdBy || 'Admin System'}</span>
                          </div>
                          <div className="text-xs text-muted flex items-center flex-wrap gap-1 mt-1">
                            <span className="company-tag">
                              <Building2 size={11} className="mr-0.5" />
                              {tx.requesterCompany || 'EXION THAILAND'}
                            </span>
                            {tx.supplierName && (
                              <span className="dept-tag" style={{ background: '#ecfdf5', color: '#047857' }}>
                                {lang === 'th' ? 'ซัพพลายเออร์:' : 'Supplier:'} {tx.supplierName}
                              </span>
                            )}
                          </div>
                        </div>
                      ) : isAudit ? (
                        <div className="requester-display-cell">
                          <div className="font-semibold flex items-center gap-1" style={{ color: '#b45309' }}>
                            <UserCheck size={14} className="inline-icon flex-shrink-0" />
                            <span>{lang === 'th' ? 'ผู้ตรวจนับ:' : 'Audited By:'} {tx.createdBy || 'เจ้าหน้าที่ตรวจนับสต็อก'}</span>
                          </div>
                          <div className="text-xs text-muted flex items-center flex-wrap gap-1 mt-1">
                            <span className="company-tag">
                              <Building2 size={11} className="mr-0.5" />
                              {tx.requesterCompany || 'EXION THAILAND'}
                            </span>
                            <span className="dept-tag" style={{ background: '#fef3c7', color: '#b45309' }}>
                              {lang === 'th' ? 'ฝ่ายคลังสินค้า (ปรับยอดตรวจนับ)' : 'Stock Audit Adjustment'}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="requester-display-cell">
                          <div className="font-semibold text-primary flex items-center gap-1">
                            <UserCheck size={14} className="inline-icon flex-shrink-0" />
                            <span>{tx.requesterName || tx.customer || (tx.createdBy ? `${tx.createdBy}` : 'เจ้าหน้าที่คลังสินค้า')}</span>
                          </div>
                          <div className="text-xs text-muted flex items-center flex-wrap gap-1 mt-1">
                            <span className="company-tag">
                              <Building2 size={11} className="mr-0.5" />
                              {tx.requesterCompany || 'EXION THAILAND'}
                            </span>
                            {tx.requesterDept && <span className="dept-tag">{tx.requesterDept}</span>}
                            {tx.requesterPosition && <span className="pos-tag">{tx.requesterPosition}</span>}
                            {!tx.requesterDept && !tx.requesterPosition && (
                              <span className="dept-tag">{lang === 'th' ? 'เบิกจ่ายตรงโดยเจ้าหน้าที่' : 'Direct Requisition'}</span>
                            )}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="text-xs text-muted max-w-xs">{tx.note || '-'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Bar */}
      {filteredTransactions.length > 0 && (
        <div className="pagination-bar card p-3 mt-4">
          <div className="pagination-info text-xs text-muted">
            {lang === 'th' ? (
              <>
                แสดงรายการที่ <strong className="text-primary">{pageSize === 'ALL' ? 1 : Math.min((currentPage - 1) * Number(pageSize) + 1, totalItems)}</strong> - <strong className="text-primary">{pageSize === 'ALL' ? totalItems : Math.min(currentPage * Number(pageSize), totalItems)}</strong> จากทั้งหมด <strong className="text-primary">{totalItems}</strong> รายการ
              </>
            ) : (
              <>
                Showing <strong className="text-primary">{pageSize === 'ALL' ? 1 : Math.min((currentPage - 1) * Number(pageSize) + 1, totalItems)}</strong> - <strong className="text-primary">{pageSize === 'ALL' ? totalItems : Math.min(currentPage * Number(pageSize), totalItems)}</strong> of <strong className="text-primary">{totalItems}</strong> movements
              </>
            )}
          </div>

          <div className="pagination-controls">
            {/* Page Size Selector */}
            <div className="page-size-selector">
              <span className="text-xs text-muted">{lang === 'th' ? 'จำนวนต่อหน้า:' : 'Per page:'}</span>
              <select
                className="form-control text-xs font-bold py-1 px-2"
                style={{ width: 'auto' }}
                value={pageSize}
                onChange={(e) => {
                  setPageSize(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
                <option value="ALL">{lang === 'th' ? 'ทั้งหมด (All)' : 'All'}</option>
              </select>
            </div>

            {/* Page Navigation Buttons */}
            {pageSize !== 'ALL' && totalPages > 1 && (
              <div className="pagination-btns">
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  <ChevronsLeft size={14} />
                </button>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  <ChevronLeft size={14} />
                </button>

                <div className="page-number-badges">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        className={`page-num-btn ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  title="Next Page"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  className="btn btn-outline btn-xs"
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  title="Last Page"
                >
                  <ChevronsRight size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          border-radius: var(--radius-md);
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btns {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        .page-number-badges {
          display: flex;
          align-items: center;
          gap: 0.25rem;
        }

        .page-num-btn {
          min-width: 28px;
          height: 28px;
          padding: 0 0.4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-xs);
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          color: var(--text-secondary);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .page-num-btn:hover {
          border-color: var(--primary-500);
          color: var(--primary-600);
        }

        .page-num-btn.active {
          background: var(--primary-600);
          border-color: var(--primary-600);
          color: #ffffff;
        }
        .stock-balance-chip {
          background: rgba(37, 99, 235, 0.08);
          color: var(--primary-600);
          padding: 0.2rem 0.55rem;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          display: inline-block;
          border: 1px solid rgba(37, 99, 235, 0.2);
        }

        .ref-tag {
          font-family: monospace;
          background: var(--bg-main);
          padding: 0.15rem 0.45rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          font-size: 0.78rem;
        }

        .requester-display-cell {
          display: flex;
          flex-direction: column;
          gap: 0.15rem;
        }

        .inline-icon {
          display: inline;
          margin-right: 0.3rem;
          vertical-align: middle;
        }

        .company-tag {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 0.1rem 0.45rem;
          border-radius: 4px;
          border: 1px solid #bfdbfe;
          font-weight: 700;
          font-size: 0.72rem;
          display: inline-flex;
          align-items: center;
          white-space: nowrap;
        }

        .dept-tag {
          background: var(--primary-50);
          color: var(--primary-600);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .pos-tag {
          background: var(--bg-main);
          color: var(--text-secondary);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
        }

        .text-xs { font-size: 0.78rem; }
        .text-sm { font-size: 0.85rem; }
        .font-mono { font-family: monospace; }
        .whitespace-nowrap { white-space: nowrap; }
        .max-w-xs { max-width: 220px; }
        .mb-4 { margin-bottom: 1rem; }
      `}</style>

      {/* PDF PREVIEW MODAL OVERLAY */}
      {selectedPdfModal && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content modal-lg" style={{ maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="flex-center gap-2">
                <FileText color="#dc2626" size={22} />
                <h3 className="font-bold text-base mb-0">
                  {selectedPdfModal.name || (lang === 'th' ? 'เอกสารใบกำกับภาษี / Invoice (PDF)' : 'Invoice PDF Document')}
                </h3>
              </div>
              <button className="close-btn" onClick={() => setSelectedPdfModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body p-2" style={{ flex: 1, minHeight: '480px', display: 'flex', flexDirection: 'column' }}>
              <iframe
                src={selectedPdfModal.data}
                title={selectedPdfModal.name || 'Invoice PDF Preview'}
                style={{ width: '100%', height: '62vh', border: '1px solid var(--border-color)', borderRadius: '6px' }}
              />
            </div>
            <div className="modal-footer flex-between p-3 border-top">
              <a
                href={selectedPdfModal.data}
                download={selectedPdfModal.name || 'invoice.pdf'}
                className="btn btn-outline btn-sm flex-center gap-1 font-bold"
              >
                <Download size={14} />
                <span>{lang === 'th' ? 'ดาวน์โหลดไฟล์ PDF' : 'Download PDF'}</span>
              </a>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedPdfModal(null)}
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
