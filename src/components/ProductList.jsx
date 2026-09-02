import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import {
  Package,
  Plus,
  Grid,
  List,
  Search,
  Filter,
  Edit2,
  Trash2,
  QrCode,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Layers,
  Eye,
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

export const ProductList = ({
  searchQuery,
  setSearchQuery,
  onOpenAddModal,
  onOpenEditModal,
  onOpenBarcodeModal,
  onOpenStockIn,
  onOpenStockOut,
  onOpenImportModal,
  setSelectedProductId,
}) => {
  const { products, categories, deleteProduct, lang, user } = useStock();

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isViewer = user?.role === 'viewer';
  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff';
  const canManage = isAdmin || isStaff;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockStatusFilter, sortBy]);

  // Filtering Logic
  const filteredProducts = products.filter((prod) => {
    const matchSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.barcode && prod.barcode.includes(searchQuery));

    const matchCategory =
      selectedCategory === 'ALL' ||
      prod.category === selectedCategory ||
      prod.category === categories.find((c) => c.id === selectedCategory)?.name ||
      prod.category === categories.find((c) => c.id === selectedCategory)?.nameTh;

    let matchStatus = true;
    if (stockStatusFilter === 'LOW') {
      matchStatus = prod.quantity > 0 && prod.quantity <= (prod.minThreshold || 5);
    } else if (stockStatusFilter === 'OUT') {
      matchStatus = prod.quantity === 0;
    } else if (stockStatusFilter === 'IN_STOCK') {
      matchStatus = prod.quantity > (prod.minThreshold || 5);
    }

    return matchSearch && matchCategory && matchStatus;
  });

  // Sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'quantity_asc') return a.quantity - b.quantity;
    if (sortBy === 'quantity_desc') return b.quantity - a.quantity;
    return 0;
  });

  const totalItems = sortedProducts.length;
  const totalPages = pageSize === 'ALL' ? 1 : Math.max(1, Math.ceil(totalItems / (Number(pageSize) || 15)));
  const paginatedProducts = pageSize === 'ALL'
    ? sortedProducts
    : sortedProducts.slice((currentPage - 1) * Number(pageSize), currentPage * Number(pageSize));

  const getCategoryName = (catId) => {
    const cat = categories.find((c) => c.id === catId || c.name === catId || c.nameTh === catId);
    if (!cat) return catId || (lang === 'th' ? 'ทั่วไป' : 'General');
    return lang === 'th' ? cat.nameTh || cat.name : cat.name;
  };

  return (
    <div className="product-list-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Package color="#4f46e5" />
            {lang === 'th' ? 'คลังอุปกรณ์สำนักงานและวัสดุ' : 'Office Equipment & Assets'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `พบอุปกรณ์ทั้งหมด ${sortedProducts.length} รายการ จากทั้งหมด ${products.length} รายการ`
              : `Showing ${sortedProducts.length} of ${products.length} total office assets`}
          </p>
        </div>

        {/* Action Buttons for Staff/Admin */}
        {!isViewer && (
          <div className="header-actions">
            {canManage && (
              <>
                <button className="btn btn-secondary" onClick={onOpenImportModal}>
                  <Upload size={16} />
                  <span>{lang === 'th' ? 'นำเข้า Excel' : 'Import Excel'}</span>
                </button>
                <button className="btn btn-primary" onClick={onOpenAddModal}>
                  <Plus size={18} />
                  <span>{lang === 'th' ? 'เพิ่มอุปกรณ์ใหม่' : 'Add Asset'}</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Toolbar Card with Filter Controls */}
      <div className="toolbar-card card mb-6">
        <div className="toolbar-left">
          {/* Category Filter */}
          <div className="filter-group">
            <Layers size={16} className="filter-icon" />
            <select
              className="form-control filter-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? '📁 ทุกหมวดหมู่อุปกรณ์' : 'All Categories'}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {lang === 'th' ? c.nameTh || c.name : c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              className="form-control filter-select"
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
            >
              <option value="ALL">{lang === 'th' ? '📊 สถานะสต็อกทั้งหมด' : 'All Stock Status'}</option>
              <option value="IN_STOCK">{lang === 'th' ? '🟢 พร้อมใช้งานปกติ' : 'In Stock'}</option>
              <option value="LOW">{lang === 'th' ? '🟠 ใกล้หมดคลัง (Low Stock)' : 'Low Stock'}</option>
              <option value="OUT">{lang === 'th' ? '🔴 หมดคลัง (Out of Stock)' : 'Out of Stock'}</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="filter-group">
            <select
              className="form-control filter-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">{lang === 'th' ? 'เรียงตาม: ชื่ออุปกรณ์ (ก-ฮ / A-Z)' : 'Sort: Name'}</option>
              <option value="quantity_desc">{lang === 'th' ? 'เรียงตาม: จำนวนคงเหลือ (มาก ➔ น้อย)' : 'Sort: Quantity High'}</option>
              <option value="quantity_asc">{lang === 'th' ? 'เรียงตาม: จำนวนคงเหลือ (น้อย ➔ มาก)' : 'Sort: Quantity Low'}</option>
            </select>
          </div>
        </div>

        {/* View Toggle (Table / Grid) */}
        <div className="view-toggle">
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table View"
          >
            <List size={18} />
          </button>
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Grid View"
          >
            <Grid size={18} />
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' ? (
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '220px' }}>{lang === 'th' ? 'อุปกรณ์สำนักงาน' : 'Office Asset'}</th>
                <th style={{ width: '130px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'ASSET TAG / QR' : 'Asset Tag / QR'}</th>
                <th style={{ width: '140px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'หมวดหมู่' : 'Category'}</th>
                <th style={{ width: '100px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'คงเหลือ' : 'Stock'}</th>
                <th style={{ width: '110px', whiteSpace: 'nowrap' }}>{lang === 'th' ? 'ทำรายการ' : 'Actions'}</th>
                {canManage && <th style={{ width: '120px', whiteSpace: 'nowrap' }} className="text-center">{lang === 'th' ? 'เครื่องมือ' : 'Tools'}</th>}
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-muted">
                    <Package size={48} color="#cbd5e1" className="mb-2" />
                    <div>{lang === 'th' ? 'ไม่พบรายการอุปกรณ์ตามเงื่อนไขที่เลือก' : 'No assets found'}</div>
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((prod) => {
                  const isLow = prod.quantity > 0 && prod.quantity <= (prod.minThreshold || 5);
                  const isOut = prod.quantity === 0;

                  return (
                    <tr key={prod.id}>
                      <td>
                        <div className="product-info-cell">
                          <img
                            src={prod.image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80'}
                            alt={prod.name}
                            className="product-image-thumb"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80';
                            }}
                          />
                          <div>
                            <div className="product-name font-bold">{prod.name}</div>
                            {prod.description && <div className="product-desc">{prod.description}</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="sku-tag font-mono">{prod.sku}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className="badge badge-primary">{getCategoryName(prod.category)}</span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <span className={`badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                          <span className="status-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: isOut ? '#e11d48' : isLow ? '#f59e0b' : '#10b981' }} />
                          {prod.quantity} {prod.unit}
                        </span>
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <div className="stock-btn-group">
                          {user?.role !== 'user' && user?.role !== 'viewer' && (
                            <button
                              className="btn btn-xs btn-success"
                              title={lang === 'th' ? 'รับเข้าอุปกรณ์' : 'Restock'}
                              onClick={() => {
                                setSelectedProductId(prod.id);
                                onOpenStockIn();
                              }}
                            >
                              <PlusCircle size={14} /> +
                            </button>
                          )}
                          <button
                            className="btn btn-xs btn-danger"
                            title={lang === 'th' ? 'ขอเบิกอุปกรณ์' : 'Requisition'}
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              onOpenStockOut();
                            }}
                          >
                            <MinusCircle size={14} /> {user?.role === 'user' || user?.role === 'viewer' ? (lang === 'th' ? 'ขอเบิก' : 'Requisition') : '-'}
                          </button>
                        </div>
                      </td>
                      {canManage && (
                        <td className="text-center" style={{ whiteSpace: 'nowrap' }}>
                          <div className="action-btns" style={{ justifyContent: 'center' }}>
                            <button
                              className="btn-icon-sm"
                              title={lang === 'th' ? 'แก้ไขข้อมูล' : 'Edit Asset'}
                              onClick={() => onOpenEditModal(prod)}
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              className="btn-icon-sm btn-qr-icon"
                              title={lang === 'th' ? 'พิมพ์ป้าย QR Code' : 'Print QR'}
                              onClick={() => onOpenBarcodeModal(prod)}
                            >
                              <QrCode size={15} color="#4f46e5" />
                            </button>
                            <button
                              className="btn-icon-sm text-red"
                              title={lang === 'th' ? 'ลบอุปกรณ์' : 'Delete Asset'}
                              onClick={() => {
                                if (window.confirm(lang === 'th' ? `ต้องการลบ "${prod.name}" หรือไม่?` : 'Delete this product?')) {
                                  deleteProduct(prod.id);
                                }
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="products-grid">
          {paginatedProducts.map((prod) => {
            const isLow = prod.quantity > 0 && prod.quantity <= (prod.minThreshold || 5);
            const isOut = prod.quantity === 0;

            return (
              <div key={prod.id} className="card product-card">
                <div className="card-image-wrap">
                  <img
                    src={prod.image || 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80'}
                    alt={prod.name}
                    className="card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                  <span className={`badge card-badge ${isOut ? 'badge-danger' : isLow ? 'badge-warning' : 'badge-success'}`}>
                    {prod.quantity} {prod.unit}
                  </span>
                </div>

                <div className="card-body">
                  <div className="badge badge-primary mb-2 align-self-start">{getCategoryName(prod.category)}</div>
                  <h3 className="card-title font-extrabold">{prod.name}</h3>
                  <div className="card-sku mb-3 font-mono text-xs text-muted">Asset Tag: {prod.sku}</div>

                  <div className="card-actions">
                    <button
                      className="btn btn-sm btn-danger flex-1"
                      onClick={() => {
                        setSelectedProductId(prod.id);
                        onOpenStockOut();
                      }}
                    >
                      <MinusCircle size={14} /> {lang === 'th' ? 'ขอเบิก' : 'Requisition'}
                    </button>
                    {user?.role !== 'user' && user?.role !== 'viewer' && (
                      <button
                        className="btn btn-sm btn-success flex-1"
                        onClick={() => {
                          setSelectedProductId(prod.id);
                          onOpenStockIn();
                        }}
                      >
                        <PlusCircle size={14} /> {lang === 'th' ? 'รับเข้า' : 'In'}
                      </button>
                    )}
                    {canManage && (
                      <button
                        className="btn-icon-sm"
                        onClick={() => onOpenEditModal(prod)}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    <button
                      className="btn-icon-sm btn-qr-icon"
                      onClick={() => onOpenBarcodeModal(prod)}
                      title="Print QR Code Tag"
                    >
                      <QrCode size={15} color="#4f46e5" />
                    </button>
                    {canManage && (
                      <button
                        className="btn-icon-sm text-red"
                        onClick={() => {
                          if (window.confirm(lang === 'th' ? `ต้องการลบ "${prod.name}" หรือไม่?` : 'Delete this product?')) {
                            deleteProduct(prod.id);
                          }
                        }}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {sortedProducts.length > 0 && (
        <div className="pagination-bar card p-3 mt-4">
          <div className="pagination-info text-xs text-muted">
            {lang === 'th' ? (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>แสดงทั้งหมด <strong className="text-primary">{totalItems}</strong> รายการ (จากทั้งหมด {products.length} รายการ)</>
                ) : (
                  <>
                    แสดงรายการที่ <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> จากทั้งหมด <strong className="text-primary">{totalItems}</strong> รายการ (หน้า <strong className="text-primary">{currentPage}/{totalPages}</strong>)
                  </>
                )}
              </>
            ) : (
              <>
                {pageSize === 'ALL' || totalItems <= Number(pageSize) ? (
                  <>Showing all <strong className="text-primary">{totalItems}</strong> assets</>
                ) : (
                  <>
                    Showing <strong className="text-primary">{(currentPage - 1) * Number(pageSize) + 1}</strong> - <strong className="text-primary">{Math.min(currentPage * Number(pageSize), totalItems)}</strong> of <strong className="text-primary">{totalItems}</strong> assets (Page <strong className="text-primary">{currentPage}/{totalPages}</strong>)
                  </>
                )}
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
                <option value={10}>10 รายการ</option>
                <option value={20}>20 รายการ</option>
                <option value={50}>50 รายการ</option>
                <option value={100}>100 รายการ</option>
                <option value="ALL">{lang === 'th' ? `ทั้งหมด (${totalItems} รายการ)` : `All (${totalItems})`}</option>
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
        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.85rem;
        }

        .toolbar-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.15rem 1.5rem;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .toolbar-left {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          color: var(--text-muted);
        }

        .filter-select {
          padding: 0.5rem 0.85rem;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--radius-sm);
        }

        .view-toggle {
          display: flex;
          background: var(--bg-main);
          padding: 0.25rem;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .view-btn {
          padding: 0.4rem 0.75rem;
          border: none;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          transition: all 0.15s ease;
        }

        .view-btn.active {
          background: var(--bg-surface);
          color: var(--primary-600);
          box-shadow: var(--shadow-sm);
        }

        .product-info-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .product-image-thumb {
          width: 44px;
          height: 44px;
          min-width: 44px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          background: #f8fafc;
          flex-shrink: 0;
        }

        [data-theme="dark"] .product-image-thumb {
          background: #1e293b;
        }

        .product-name {
          font-size: 0.92rem;
          color: var(--text-primary);
          line-height: 1.3;
        }

        .product-desc {
          font-size: 0.76rem;
          color: var(--text-muted);
          max-width: 250px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sku-tag {
          font-size: 0.82rem;
          color: var(--primary-600);
          font-weight: 700;
        }

        .stock-btn-group, .action-btns {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .action-btns {
          justify-content: flex-end;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          padding: 0;
          overflow: hidden;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
        }

        .product-card .card-image-wrap {
          width: 100%;
          height: 180px;
          background: var(--bg-main);
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-card .card-img {
          max-width: 80%;
          max-height: 80%;
          object-fit: contain;
        }

        .card-badge {
          position: absolute;
          top: 0.85rem;
          right: 0.85rem;
        }

        .product-card .card-body {
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .product-card .card-title {
          font-size: 1.05rem;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .card-actions {
          margin-top: auto;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

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
      `}</style>
    </div>
  );
};
