import React, { useState, useEffect } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Package,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';

/**
 * ImageZoomModal - High-resolution responsive lightbox modal for product images
 * Perfect for small smartphone screens, tablets, and desktops.
 */
export const ImageZoomModal = ({
  product,
  onClose,
  lang = 'th',
  onAddToCart = null,
  inCartQty = 0,
  onUpdateCartQty = null,
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    // Prevent body scrolling when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!product) return null;

  const isOut = product.quantity === 0;

  const toggleZoom = () => {
    if (zoomLevel === 1) {
      setZoomLevel(1.8);
      setIsZoomed(true);
    } else if (zoomLevel === 1.8) {
      setZoomLevel(2.5);
      setIsZoomed(true);
    } else {
      setZoomLevel(1);
      setIsZoomed(false);
    }
  };

  return (
    <div
      className="image-zoom-overlay"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div
        className="image-zoom-container"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'var(--bg-surface, #ffffff)',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh',
          animation: 'zoomModalSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header with Title and Close Button */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-surface, #ffffff)',
            zIndex: 10,
          }}
        >
          <div style={{ flex: 1, paddingRight: '0.75rem', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  color: '#4f46e5',
                  textTransform: 'uppercase',
                  letterSpacing: '0.025em',
                }}
              >
                {product.category || 'อุปกรณ์'}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  color: 'var(--text-muted, #64748b)',
                }}
              >
                {product.sku}
              </span>
            </div>
            <h3
              style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-primary, #0f172a)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
              title={product.name}
            >
              {product.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(100, 116, 139, 0.12)',
              color: 'var(--text-primary, #334155)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            title="ปิด (Esc)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Image Display Area with Pan & Zoom */}
        <div
          style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '280px',
            maxHeight: '52vh',
            overflow: 'auto',
            padding: '1.5rem',
            userSelect: 'none',
            cursor: zoomLevel > 1 ? 'zoom-out' : 'zoom-in',
          }}
          onClick={toggleZoom}
          title={lang === 'th' ? 'แตะ/คลิกเพื่อสลับขนาดซูม' : 'Tap/Click to toggle zoom'}
        >
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '48vh',
                objectFit: 'contain',
                borderRadius: '12px',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)',
                filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.08))',
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#94a3b8' }}>
              <Package size={64} style={{ opacity: 0.5, marginBottom: '0.5rem' }} />
              <div>ไม่มีรูปภาพประกอบ</div>
            </div>
          )}

          {/* Floating Stock Badge at Top Right of image */}
          <div
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: isOut ? 'rgba(239, 68, 68, 0.95)' : 'rgba(254, 240, 138, 0.95)',
              color: isOut ? '#ffffff' : '#854d0e',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 800,
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
            }}
          >
            {isOut
              ? (lang === 'th' ? 'หมดสต็อก' : 'Out of Stock')
              : `${lang === 'th' ? 'คงเหลือ' : 'Stock'}: ${product.quantity} ${product.unit || 'ชิ้น'}`}
          </div>

          {/* Floating Zoom Hint Pill at Bottom */}
          <div
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              background: 'rgba(15, 23, 42, 0.65)',
              color: '#ffffff',
              padding: '0.25rem 0.75rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              backdropFilter: 'blur(6px)',
              pointerEvents: 'none',
            }}
          >
            {zoomLevel > 1 ? <ZoomOut size={13} /> : <ZoomIn size={13} />}
            <span>{zoomLevel > 1 ? `${Math.round(zoomLevel * 100)}% (แตะเพื่อย่อ)` : 'แตะเพื่อซูมขยาย (Zoom)'}</span>
          </div>
        </div>

        {/* Footer with Details & Requisition Button */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color, #e2e8f0)',
            background: 'var(--bg-surface, #ffffff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)' }}>
            <div>{lang === 'th' ? 'หน่วยนับ:' : 'Unit:'} <strong style={{ color: 'var(--text-primary)' }}>{product.unit || 'ชิ้น'}</strong></div>
            {product.location && (
              <div>{lang === 'th' ? 'จุดเก็บ:' : 'Loc:'} <strong style={{ color: 'var(--text-primary)' }}>{product.location}</strong></div>
            )}
          </div>

          {/* If onAddToCart prop is passed (e.g. from Requisition Page) */}
          {onAddToCart && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {inCartQty > 0 ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: '#f1f5f9',
                    borderRadius: '10px',
                    padding: '2px',
                    border: '1px solid #cbd5e1',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => onUpdateCartQty && onUpdateCartQty(product.id, -1)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ padding: '0 0.75rem', fontWeight: 800, fontSize: '0.9rem', color: '#4f46e5' }}>
                    {inCartQty}
                  </span>
                  <button
                    type="button"
                    onClick={() => onUpdateCartQty && onUpdateCartQty(product.id, 1)}
                    disabled={inCartQty >= product.quantity}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      border: 'none',
                      background: inCartQty >= product.quantity ? '#e2e8f0' : '#4f46e5',
                      color: inCartQty >= product.quantity ? '#94a3b8' : '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: inCartQty >= product.quantity ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onAddToCart(product);
                  }}
                  disabled={isOut}
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isOut ? '#cbd5e1' : 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.88rem',
                    cursor: isOut ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    boxShadow: isOut ? 'none' : '0 4px 12px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Plus size={16} />
                  <span>{isOut ? 'อุปกรณ์หมด' : 'ใส่ตะกร้าเบิก'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
