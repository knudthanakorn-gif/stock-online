import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X, Package, AlertCircle } from 'lucide-react';

export const SearchableProductSelect = ({
  products = [],
  value = '',
  onChange,
  placeholder = '-- พิมพ์ค้นหาหรือเลือกอุปกรณ์ --',
  disabled = false,
  className = '',
  style = {},
  categories = [],
  lang = 'th',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 320, placement: 'bottom' });
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const triggerRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Find currently selected product
  const selectedProduct = useMemo(() => {
    return products.find((p) => p.id === value);
  }, [products, value]);

  // Filter products by name, SKU/Tag, and category
  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter((p) => {
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSku = (p.sku || '').toLowerCase().includes(q);
      const catObj = categories.find((c) => c && c.id === p.category);
      const matchCat = (catObj?.name || catObj?.nameTh || '').toLowerCase().includes(q);
      return matchName || matchSku || matchCat;
    });
  }, [products, search, categories]);

  // Calculate coords whenever opening
  const updateCoords = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const dropdownHeight = 320;

    let placement = 'bottom';
    let top = rect.bottom + 4;

    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      placement = 'top';
      top = rect.top - dropdownHeight - 4;
    }

    setCoords({
      top: Math.max(8, top),
      left: Math.max(8, Math.min(rect.left, window.innerWidth - Math.max(rect.width, 340) - 8)),
      width: Math.max(rect.width, 340),
      placement,
    });
  };

  const handleOpen = () => {
    if (disabled) return;
    updateCoords();
    setIsOpen(true);
    setSearch('');
    setHighlightedIndex(0);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSearch('');
  };

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen]);

  // Reposition on scroll/resize or close if scrolled far
  useEffect(() => {
    if (!isOpen) return;

    const handleScrollOrResize = () => {
      updateCoords();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen]);

  // Click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        handleClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleOpen();
      }
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < filteredProducts.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : filteredProducts.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredProducts[highlightedIndex]) {
        handleSelect(filteredProducts[highlightedIndex].id);
      }
    }
  };

  const handleSelect = (prodId) => {
    if (onChange) {
      onChange(prodId);
    }
    handleClose();
  };

  return (
    <div className={`searchable-select-wrap ${className}`} style={{ position: 'relative', width: '100%', ...style }}>
      {/* Trigger Button */}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => (isOpen ? handleClose() : handleOpen())}
        onKeyDown={handleKeyDown}
        className={`searchable-select-trigger ${isOpen ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        style={{
          width: '100%',
          minHeight: '42px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.5rem',
          padding: '0.4rem 0.65rem',
          background: 'var(--bg-surface)',
          border: isOpen ? '1.5px solid var(--primary-500)' : '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md, 8px)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          outline: 'none',
          boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.15)' : 'none',
          transition: 'all 0.15s ease',
          fontSize: '0.85rem',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', minWidth: 0, flex: 1 }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>📦</span>
          {selectedProduct ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, flex: 1, flexWrap: 'nowrap' }}>
              <span
                className="font-bold text-truncate"
                style={{
                  color: 'var(--text-primary)',
                  maxWidth: '220px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                title={selectedProduct.name}
              >
                {selectedProduct.name}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  background: 'var(--primary-50, #eff6ff)',
                  color: 'var(--primary-600, #2563eb)',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '4px',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {selectedProduct.sku}
              </span>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: Number(selectedProduct.quantity) > 0 ? '#10b981' : '#ef4444',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                ({selectedProduct.quantity} {selectedProduct.unit || 'ชิ้น'})
              </span>
            </div>
          ) : (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{placeholder}</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
          <ChevronDown
            size={16}
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.15s ease',
            }}
          />
        </div>
      </div>

      {/* Floating Dropdown Portal */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            className="searchable-select-dropdown"
            style={{
              position: 'fixed',
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              maxHeight: '340px',
              backgroundColor: '#ffffff',
              background: 'var(--bg-surface, #ffffff)',
              borderRadius: '12px',
              border: '1.5px solid var(--primary-500, #6366f1)',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.18), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              zIndex: 999999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'fadeInSelect 0.12s ease-out',
            }}
          >
            {/* Search Header Bar */}
            <div
              style={{
                padding: '0.55rem',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                backgroundColor: 'var(--bg-main, #f8faff)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Search size={15} style={{ color: 'var(--primary-500, #6366f1)', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder={lang === 'th' ? 'พิมพ์ค้นหาชื่อ หรือรหัส Tag (SKU)...' : 'Type to search name or Tag...'}
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-primary, #0f172a)',
                }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '2px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Hint & Count Bar */}
            <div
              style={{
                padding: '0.25rem 0.65rem',
                fontSize: '0.68rem',
                color: 'var(--text-muted, #64748b)',
                backgroundColor: 'var(--bg-surface, #ffffff)',
                borderBottom: '1px solid var(--border-color, #f1f5f9)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{lang === 'th' ? `พบ ${filteredProducts.length} รายการ` : `${filteredProducts.length} items`}</span>
              <span style={{ fontSize: '0.65rem' }}>{lang === 'th' ? 'กด ↑ / ↓ แล้วกด Enter เพื่อเลือก' : 'Use ↑ / ↓ and Enter'}</span>
            </div>

            {/* List of Products */}
            <div
              style={{
                overflowY: 'auto',
                maxHeight: '260px',
                padding: '0.25rem 0',
              }}
            >
              {filteredProducts.length === 0 ? (
                <div
                  style={{
                    padding: '1.25rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertCircle size={22} style={{ margin: '0 auto 0.35rem', opacity: 0.6 }} />
                  <div>{lang === 'th' ? `ไม่พบอุปกรณ์ที่ตรงกับ "${search}"` : `No assets found for "${search}"`}</div>
                </div>
              ) : (
                filteredProducts.map((p, idx) => {
                  const isSelected = p.id === value;
                  const isHighlighted = idx === highlightedIndex;
                  const stockNum = Number(p.quantity) || 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelect(p.id)}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      style={{
                        padding: '0.45rem 0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.6rem',
                        cursor: 'pointer',
                        backgroundColor: isSelected
                          ? 'var(--primary-50, #eef2ff)'
                          : isHighlighted
                          ? 'var(--bg-main, #f8faff)'
                          : 'transparent',
                        borderLeft: isSelected
                          ? '3px solid var(--primary-500, #6366f1)'
                          : isHighlighted
                          ? '3px solid rgba(99, 102, 241, 0.4)'
                          : '3px solid transparent',
                        transition: 'background-color 0.1s ease',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem', minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-main, #f1f5f9)',
                            border: '1px solid var(--border-color, #e2e8f0)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.9rem',
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
                            style={{
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              color: 'var(--text-primary, #0f172a)',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {p.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '2px' }}>
                            <span
                              style={{
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                fontFamily: 'var(--font-mono, monospace)',
                                background: 'rgba(99, 102, 241, 0.1)',
                                color: 'var(--primary-600, #4f46e5)',
                                padding: '0.05rem 0.3rem',
                                borderRadius: '4px',
                              }}
                            >
                              {p.sku}
                            </span>
                            <span
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                color: stockNum > 5 ? '#059669' : stockNum > 0 ? '#d97706' : '#dc2626',
                              }}
                            >
                              {lang === 'th' ? `สต็อก: ${stockNum} ${p.unit || 'ชิ้น'}` : `Stock: ${stockNum}`}
                            </span>
                            {Number(p.costPrice) > 0 && (
                              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                (฿{Number(p.costPrice).toLocaleString()})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check size={16} style={{ color: 'var(--primary-600, #4f46e5)', flexShrink: 0 }} />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
