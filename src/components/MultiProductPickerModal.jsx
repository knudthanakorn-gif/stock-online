import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Search,
  CheckSquare,
  Square,
  Plus,
  Minus,
  Check,
  PackageCheck,
  Filter,
  Layers,
  ArrowRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export const MultiProductPickerModal = ({
  isOpen,
  onClose,
  products = [],
  categories = [],
  currentItems = [],
  onAddSelectedItems,
  lang = 'th',
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [onlySelectedFilter, setOnlySelectedFilter] = useState(false);

  // Mapping of productId -> { selected: boolean, quantity: number }
  const [selectionMap, setSelectionMap] = useState({});

  // When modal opens, initialize selectionMap with current items in the table
  useEffect(() => {
    if (!isOpen) return;

    const initialMap = {};
    // Mark items already in the table
    (currentItems || []).forEach((item) => {
      if (item.productId) {
        initialMap[item.productId] = {
          selected: true,
          quantity: Number(item.quantity) || 1,
        };
      }
    });

    setSelectionMap(initialMap);
    setSearch('');
    setSelectedCategory('ALL');
    setOnlySelectedFilter(false);
  }, [isOpen, currentItems]);

  // Filter products by search and category
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'ALL' && p.category !== selectedCategory) {
        return false;
      }

      // Only selected filter
      if (onlySelectedFilter && !selectionMap[p.id]?.selected) {
        return false;
      }

      // Search query filter
      if (q) {
        const matchName = (p.name || '').toLowerCase().includes(q);
        const matchSku = (p.sku || '').toLowerCase().includes(q);
        const catObj = categories.find((c) => c && c.id === p.category);
        const matchCat = (catObj?.name || catObj?.nameTh || '').toLowerCase().includes(q);
        if (!matchName && !matchSku && !matchCat) return false;
      }

      return true;
    });
  }, [products, search, selectedCategory, onlySelectedFilter, selectionMap, categories]);

  // Toggle selection for a product
  const toggleSelect = (pId) => {
    setSelectionMap((prev) => {
      const current = prev[pId];
      if (current?.selected) {
        return {
          ...prev,
          [pId]: { ...current, selected: false },
        };
      } else {
        return {
          ...prev,
          [pId]: { selected: true, quantity: current?.quantity && current.quantity > 0 ? current.quantity : 1 },
        };
      }
    });
  };

  // Change quantity for a product
  const handleQtyChange = (pId, newQty) => {
    const parsed = Math.max(1, Number(newQty) || 1);
    setSelectionMap((prev) => ({
      ...prev,
      [pId]: {
        selected: true, // auto select if quantity adjusted
        quantity: parsed,
      },
    }));
  };

  // Select all currently visible filtered products
  const handleSelectAllFiltered = () => {
    setSelectionMap((prev) => {
      const next = { ...prev };
      filteredProducts.forEach((p) => {
        next[p.id] = {
          selected: true,
          quantity: prev[p.id]?.quantity || 1,
        };
      });
      return next;
    });
  };

  // Deselect all
  const handleDeselectAll = () => {
    setSelectionMap({});
  };

  // Computed totals for selected items
  const selectedProductList = useMemo(() => {
    return Object.entries(selectionMap)
      .filter(([_, data]) => data?.selected)
      .map(([pId, data]) => {
        const prod = products.find((p) => p.id === pId);
        return {
          productId: pId,
          product: prod,
          quantity: data.quantity || 1,
          unitPrice: prod?.costPrice || 0,
          totalPrice: (prod?.costPrice || 0) * (data.quantity || 1),
        };
      })
      .filter((item) => item.product);
  }, [selectionMap, products]);

  const totalSelectedCount = selectedProductList.length;
  const totalUnitsCount = selectedProductList.reduce((sum, item) => sum + item.quantity, 0);
  const totalEstimatedCost = selectedProductList.reduce((sum, item) => sum + item.totalPrice, 0);

  // Submit and inject into stock receiving table
  const handleConfirm = () => {
    if (selectedProductList.length === 0) return;

    const itemsToAdd = selectedProductList.map((item) => ({
      id: Date.now() + Math.random().toString(36).substring(2, 9),
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      lastEdited: 'unitPrice',
    }));

    if (onAddSelectedItems) {
      onAddSelectedItems(itemsToAdd);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" style={{ zIndex: 10050 }} onClick={onClose}>
      <div
        className="modal-content modal-xl"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        }}
      >
        {/* MODAL HEADER */}
        <div
          className="modal-header"
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            color: '#ffffff',
            padding: '1rem 1.25rem',
          }}
        >
          <div className="flex-center gap-2.5">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
              }}
            >
              <PackageCheck size={22} />
            </div>
            <div>
              <h2 className="font-extrabold text-lg text-white mb-0" style={{ letterSpacing: '-0.01em' }}>
                {lang === 'th' ? 'เลือกอุปกรณ์รับเข้า (เลือกได้หลายรายการพร้อมกัน)' : 'Multi-Item Asset Receiving Picker'}
              </h2>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {lang === 'th'
                  ? 'ค้นหาและติ๊กเลือกอุปกรณ์ที่ต้องการรับเข้า สามารถระบุจำนวนได้ทันที'
                  : 'Search and check items to receive with direct quantity specification'}
              </div>
            </div>
          </div>
          <button
            className="close-btn"
            onClick={onClose}
            style={{
              color: '#ffffff',
              background: 'rgba(255, 255, 255, 0.15)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div
          style={{
            padding: '0.85rem 1.25rem',
            backgroundColor: 'var(--bg-main, #f8faff)',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
          }}
        >
          {/* Row 1: Search Input & Quick Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <div
              style={{
                flex: 1,
                minWidth: '260px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: 'var(--primary-500, #6366f1)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                autoFocus
                className="form-control"
                style={{
                  paddingLeft: '38px',
                  paddingRight: '32px',
                  height: '42px',
                  fontSize: '0.88rem',
                  borderRadius: '10px',
                  border: '1.5px solid var(--border-color, #e2e8f0)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
                placeholder={
                  lang === 'th'
                    ? '🔍 พิมพ์ค้นหาชื่ออุปกรณ์, รหัส Tag (SKU), หรือหมวดหมู่...'
                    : 'Search asset name, Tag (SKU), or category...'
                }
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                  }}
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm font-semibold"
                onClick={handleSelectAllFiltered}
                title="ติ๊กเลือกทุกรายการที่แสดงอยู่บนหน้าจอ"
                style={{ fontSize: '0.8rem', height: '40px' }}
              >
                <CheckSquare size={15} color="#4f46e5" />
                <span>{lang === 'th' ? `เลือกทั้งหมด (${filteredProducts.length})` : `Select All (${filteredProducts.length})`}</span>
              </button>

              {totalSelectedCount > 0 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm text-muted font-semibold"
                  onClick={handleDeselectAll}
                  style={{ fontSize: '0.8rem', height: '40px' }}
                >
                  <X size={15} />
                  <span>{lang === 'th' ? 'ล้างที่เลือก' : 'Clear Selection'}</span>
                </button>
              )}

              <button
                type="button"
                className={`btn btn-sm ${onlySelectedFilter ? 'btn-primary' : 'btn-outline'} font-semibold`}
                onClick={() => setOnlySelectedFilter((prev) => !prev)}
                style={{ fontSize: '0.8rem', height: '40px' }}
              >
                <Filter size={14} />
                <span>
                  {lang === 'th' ? `แสดงเฉพาะที่เลือก (${totalSelectedCount})` : `Selected Only (${totalSelectedCount})`}
                </span>
              </button>
            </div>
          </div>

          {/* Row 2: Category Pills */}
          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              paddingBottom: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              style={{
                padding: '0.3rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                border: selectedCategory === 'ALL' ? '1.5px solid var(--primary-600)' : '1px solid var(--border-color)',
                backgroundColor: selectedCategory === 'ALL' ? 'var(--primary-600, #4f46e5)' : 'var(--bg-surface, #ffffff)',
                color: selectedCategory === 'ALL' ? '#ffffff' : 'var(--text-secondary, #475569)',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
            >
              🏷️ {lang === 'th' ? 'ทั้งหมด' : 'All'} ({products.length})
            </button>

            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const countInCat = products.filter((p) => p.category === cat.id).length;
              if (countInCat === 0) return null;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '0.3rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: isSelected ? '1.5px solid var(--primary-600)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'var(--primary-600, #4f46e5)' : 'var(--bg-surface, #ffffff)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary, #475569)',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {cat.nameTh || cat.name} ({countInCat})
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL BODY: PRODUCTS LIST */}
        <div
          className="modal-body p-0"
          style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '52vh',
            backgroundColor: 'var(--bg-surface, #ffffff)',
          }}
        >
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem', color: 'var(--text-muted)' }}>
              <AlertCircle size={40} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
              <div className="font-bold text-base mb-1">
                {lang === 'th' ? 'ไม่พบอุปกรณ์ที่ตรงกับเงื่อนไข' : 'No items match your criteria'}
              </div>
              <div className="text-xs">
                {lang === 'th' ? 'ลองเปลี่ยนคำค้นหา หรือกดล้างตัวกรองหมวดหมู่' : 'Try adjusting search or category filter'}
              </div>
            </div>
          ) : (
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: 'var(--bg-main, #f8faff)',
                  zIndex: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                <tr>
                  <th style={{ width: '50px', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem' }}>เลือก</span>
                  </th>
                  <th style={{ minWidth: '280px' }}>{lang === 'th' ? 'อุปกรณ์สำนักงาน' : 'Asset Information'}</th>
                  <th style={{ width: '130px' }}>{lang === 'th' ? 'รหัส Tag (SKU)' : 'Tag (SKU)'}</th>
                  <th style={{ width: '110px' }}>{lang === 'th' ? 'สต็อกปัจจุบัน' : 'Current Stock'}</th>
                  <th style={{ width: '120px' }}>{lang === 'th' ? 'ราคาทุน/หน่วย' : 'Cost Price'}</th>
                  <th style={{ width: '180px', textAlign: 'center' }}>
                    {lang === 'th' ? 'จำนวนรับเข้า' : 'Receive Quantity'}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const itemData = selectionMap[p.id];
                  const isChecked = !!itemData?.selected;
                  const itemQty = itemData?.quantity || 1;
                  const catObj = categories.find((c) => c && c.id === p.category);
                  const stockNum = Number(p.quantity) || 0;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => toggleSelect(p.id)}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                        transition: 'background-color 0.1s ease',
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <div
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '6px',
                            border: isChecked ? '2px solid var(--primary-600, #4f46e5)' : '2px solid var(--border-color, #cbd5e1)',
                            backgroundColor: isChecked ? 'var(--primary-600, #4f46e5)' : 'var(--bg-surface, #ffffff)',
                            color: '#ffffff',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          {isChecked && <Check size={16} strokeWidth={3} />}
                        </div>
                      </td>

                      {/* Product Info */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                          <div
                            style={{
                              width: '38px',
                              height: '38px',
                              borderRadius: '8px',
                              backgroundColor: 'var(--bg-main, #f1f5f9)',
                              border: '1px solid var(--border-color, #e2e8f0)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.2rem',
                              flexShrink: 0,
                              overflow: 'hidden',
                            }}
                          >
                            {p.image ? (
                              <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                              '📦'
                            )}
                          </div>
                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              className="font-bold"
                              style={{
                                fontSize: '0.88rem',
                                color: isChecked ? 'var(--primary-700, #4338ca)' : 'var(--text-primary, #0f172a)',
                              }}
                            >
                              {p.name}
                            </div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #64748b)' }}>
                              🏷️ {catObj?.nameTh || catObj?.name || 'อุปกรณ์สำนักงาน'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Tag SKU */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            fontFamily: 'var(--font-mono, monospace)',
                            background: 'var(--primary-50, #eff6ff)',
                            color: 'var(--primary-600, #2563eb)',
                            padding: '0.15rem 0.45rem',
                            borderRadius: '5px',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                          }}
                        >
                          {p.sku}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td>
                        <span
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            color: stockNum > 5 ? '#059669' : stockNum > 0 ? '#d97706' : '#dc2626',
                          }}
                        >
                          {stockNum} {p.unit || 'ชิ้น'}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td>
                        <span className="font-mono font-bold text-xs" style={{ color: 'var(--text-primary)' }}>
                          ฿{Number(p.costPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* Quantity Stepper */}
                      <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.3rem',
                            background: isChecked ? 'var(--bg-surface)' : 'transparent',
                            padding: '2px 4px',
                            borderRadius: '8px',
                          }}
                        >
                          <button
                            type="button"
                            className="qty-counter-btn"
                            style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                            onClick={() => handleQtyChange(p.id, Math.max(1, itemQty - 1))}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            className="qty-counter-input font-bold"
                            style={{ width: '55px', height: '32px', fontSize: '0.9rem' }}
                            min="1"
                            value={itemQty}
                            onChange={(e) => handleQtyChange(p.id, e.target.value)}
                          />
                          <button
                            type="button"
                            className="qty-counter-btn"
                            style={{ width: '32px', height: '32px', fontSize: '0.9rem' }}
                            onClick={() => handleQtyChange(p.id, itemQty + 1)}
                          >
                            +
                          </button>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {p.unit || 'ชิ้น'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* MODAL FOOTER BAR */}
        <div
          className="modal-footer"
          style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--bg-main, #f8faff)',
            borderTop: '1.5px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
          }}
        >
          {/* Summary Details */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                {lang === 'th' ? 'เลือกแล้ว:' : 'Selected:'}
              </span>
              <span
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  color: 'var(--primary-600, #4f46e5)',
                  backgroundColor: 'var(--primary-50, #eef2ff)',
                  padding: '0.15rem 0.55rem',
                  borderRadius: '6px',
                }}
              >
                {totalSelectedCount} {lang === 'th' ? 'รายการ' : 'items'}
              </span>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                ({totalUnitsCount} {lang === 'th' ? 'ชิ้น' : 'units'})
              </span>
            </div>

            {totalSelectedCount > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {lang === 'th' ? 'มูลค่ารวมโดยประมาณ:' : 'Est. Total:'}
                </span>
                <span className="font-mono font-extrabold text-sm" style={{ color: '#059669' }}>
                  ฿{totalEstimatedCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary btn-md font-semibold" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>

            <button
              type="button"
              className="btn btn-primary btn-md font-bold flex-center gap-1.5"
              disabled={totalSelectedCount === 0}
              onClick={handleConfirm}
              style={{
                boxShadow: totalSelectedCount > 0 ? '0 4px 14px rgba(79, 70, 229, 0.4)' : 'none',
                minWidth: '220px',
              }}
            >
              <Check size={18} />
              <span>
                {lang === 'th'
                  ? `ยืนยันเพิ่ม ${totalSelectedCount} รายการลงตาราง`
                  : `Add ${totalSelectedCount} Items to Table`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
