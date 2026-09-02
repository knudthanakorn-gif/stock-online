import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  ShoppingBag,
  Search,
  Package,
  MinusCircle,
  Plus,
  Minus,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Printer,
  X,
  ShoppingCart,
  Trash2,
  Check,
  FileText,
  Clock,
  Send,
  XCircle,
} from 'lucide-react';
import { renderQRCodeSVG } from '../utils/qrGenerator';
import { RequisitionSlipModal } from './RequisitionSlipModal';

const DEPARTMENT_PRESETS = [
  'แผนก IT / เทคโนโลยีสารสนเทศ',
  'แผนกบัญชีและการเงิน',
  'ฝ่ายขายและการตลาด',
  'ฝ่ายทรัพยากรบุคคล (HR)',
  'ฝ่ายผลิตและปฏิบัติการ',
  'ฝ่ายจัดซื้อและคลังสินค้า',
  'ฝ่ายบริหารและจัดการ',
];

export const RequisitionPage = () => {
  const {
    products = [],
    categories = [],
    requestersList = [],
    requests = [],
    createRequisitionRequest,
    cancelRequisitionRequest,
    departmentQuotas = {},
    getDepartmentUsageThisMonth,
    lang,
    user,
  } = useStock();

  const isViewer = user?.role === 'viewer';

  // Defensive array checks
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeRequesters = Array.isArray(requestersList) ? requestersList : [];
  const safeRequests = Array.isArray(requests) ? requests : [];

  // Filter requests to show ONLY the current logged-in user's personal requests
  const myRequests = safeRequests.filter((req) => {
    if (!user) return false;
    
    // Match by explicit userId
    if (req.userId && user.id && req.userId === user.id) return true;
    
    // Match by employeeCode
    if (req.employeeCode && user.employeeCode && req.employeeCode === user.employeeCode) return true;
    
    // Match by normalized clean Thai names
    const clean = (s) => (s || '').trim().toLowerCase().replace(/^(คุณ|นาย|นางสาว|นาง|น\.ส\.)\s*/, '').replace(/\s+/g, ' ');
    const reqName = clean(req.requesterName);
    const userName = clean(user.name);
    const userUsername = clean(user.username);
    
    if (reqName && (reqName === userName || reqName === userUsername)) return true;
    if (req.createdBy && clean(req.createdBy) === userName) return true;
    
    return false;
  });

  // Tab: 'catalog' | 'my-requests'
  const [activeTab, setActiveTab] = useState('catalog');

  // Search & Category Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('ALL');

  // MULTI-ITEM REQUISITION CART STATE
  const [cart, setCart] = useState([]); // [{ product, quantity }]
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddingItems, setIsAddingItems] = useState(false);
  const [addItemSearch, setAddItemSearch] = useState('');

  // Form States inside Requisition Modal
  const [requesterCompany, setRequesterCompany] = useState('EXION (THAILAND) COMPANY LIMITED');
  const [requesterDept, setRequesterDept] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterPosition, setRequesterPosition] = useState('');
  const [purpose, setPurpose] = useState('DAILY');
  const [note, setNote] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [viewSlipReq, setViewSlipReq] = useState(null);

  // Dynamic Companies List
  const availableCompanies = Array.from(
    new Set([
      'EXION (THAILAND) COMPANY LIMITED',
      ...safeRequesters.map((r) => r.company).filter(Boolean),
    ])
  );

  // Cascading Filter: Filter departments by company
  const availableDepts = Array.from(
    new Set(
      safeRequesters
        .filter((r) => !requesterCompany || (r.company || 'EXION (THAILAND) COMPANY LIMITED') === requesterCompany)
        .map((r) => r.department)
        .filter(Boolean)
    )
  );

  const finalDeptList = Array.from(new Set([...availableDepts, ...DEPARTMENT_PRESETS]));

  // Cascading Filter: Filter names by company & department
  const availableRequesters = safeRequesters.filter((r) => {
    const matchCompany = !requesterCompany || (r.company || 'EXION (THAILAND) COMPANY LIMITED') === requesterCompany;
    const matchDept = !requesterDept || r.department === requesterDept;
    return matchCompany && matchDept;
  });

  // Auto fill department & position when selecting an existing registered requester name
  const handleNameChange = (val) => {
    setRequesterName(val);
    const matched = safeRequesters.find((r) => r && r.name && r.name.toLowerCase() === val.toLowerCase());
    if (matched) {
      if (matched.company) setRequesterCompany(matched.company);
      if (matched.department) setRequesterDept(matched.department);
      if (matched.position) setRequesterPosition(matched.position);
    }
  };

  // CART OPERATIONS
  const handleAddToCart = (prod) => {
    if (prod.quantity <= 0) return;

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product.id === prod.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        const currentQty = updated[existingIndex].quantity;
        if (currentQty < prod.quantity) {
          updated[existingIndex].quantity = currentQty + 1;
        }
        return updated;
      } else {
        return [...prevCart, { product: prod, quantity: 1 }];
      }
    });
  };

  const handleUpdateCartQty = (productId, delta) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.quantity) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleSetCartQty = (productId, newQty, maxQty) => {
    const parsed = parseInt(newQty, 10);
    if (isNaN(parsed) || parsed <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    const clampedQty = Math.min(parsed, maxQty || 9999);
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: clampedQty };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // SUBMIT MULTI-ITEM REQUISITION REQUEST
  const handleSubmitMultiRequisition = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (cart.length === 0) {
      setErrorMsg(lang === 'th' ? 'กรุณาเลือกอุปกรณ์ใส่ตะกร้าอย่างน้อย 1 รายการ' : 'Please select at least 1 item');
      return;
    }

    const finalRequesterName = user?.name || requesterName.trim() || 'พนักงาน EXION';
    const finalCompany = user?.company || requesterCompany.trim() || 'EXION (THAILAND) COMPANY LIMITED';
    const finalDept = user?.department || requesterDept.trim() || '';
    const finalPosition = user?.position || requesterPosition.trim() || '';

    try {
      const newRequest = createRequisitionRequest({
        requesterName: finalRequesterName,
        requesterCompany: finalCompany,
        requesterDept: finalDept,
        requesterPosition: finalPosition,
        purpose,
        note: note.trim(),
        items: cart,
      });

      setSubmittedTicket(newRequest);
      setCart([]);
      setIsCartOpen(false);
      setNote('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  // Filter products by search and category
  const filteredProducts = safeProducts.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCat =
      selectedCat === 'ALL' ||
      p.category === selectedCat ||
      p.category === safeCategories.find((c) => c.id === selectedCat)?.name ||
      p.category === safeCategories.find((c) => c.id === selectedCat)?.nameTh;

    return matchSearch && matchCat;
  });

  const getCatName = (catId) => {
    const found = safeCategories.find(
      (c) => c.id === catId || c.name === catId || c.nameTh === catId
    );
    return found ? (lang === 'th' ? found.nameTh || found.name : found.name) : catId || (lang === 'th' ? 'อุปกรณ์สำนักงาน' : 'Office Supplies');
  };

  let portalQrSvg = '';
  try {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173/';
    portalQrSvg = renderQRCodeSVG(currentUrl, 110);
  } catch (e) {
    console.error('QR Generator error:', e);
  }

  return (
    <div className="exact-requisition-page">
      <div className="no-print">
        {/* 1. Modern Compact Hero Header Banner */}
        <div className="shopee-banner card mb-3">
        <div className="banner-left">
          <div className="shopee-tag">
            <ShoppingBag size={14} />
            <span>{lang === 'th' ? 'ระบบเบิกอุปกรณ์พัสดุ' : 'REQUISITION PORTAL'}</span>
          </div>
          <h1 className="banner-title">
            {lang === 'th' ? 'เลือกเบิกอุปกรณ์สำนักงาน' : 'Office Equipment Requisition'}
          </h1>
          <p className="banner-desc">
            {lang === 'th'
              ? 'เลือกอุปกรณ์ที่ต้องการเบิกใส่ตะกร้า แล้วกดยื่นคำขอเบิกได้ทันที'
              : 'Add items to basket and submit requisition request'}
          </p>
        </div>

        {/* Desktop Only Cart Button */}
        <div className="banner-cart-wrapper desktop-only">
          <button
            className={`btn-header-cart ${totalCartCount > 0 ? 'has-items' : ''}`}
            onClick={() => cart.length > 0 && setIsCartOpen(true)}
          >
            <ShoppingCart size={18} />
            <span>{lang === 'th' ? 'ตะกร้าเบิกอุปกรณ์' : 'Requisition Basket'}</span>
            <span className="cart-count-badge">{totalCartCount}</span>
          </button>
        </div>
      </div>

      {/* Mobile Floating Sticky Cart Bar */}
      {totalCartCount > 0 && (
        <div className="mobile-floating-cart-bar">
          <div className="flex-center gap-2">
            <div className="floating-cart-icon-box">
              <ShoppingCart size={18} color="#ffffff" />
              <span className="floating-cart-badge">{totalCartCount}</span>
            </div>
            <div className="text-white text-xs font-bold">
              เลือกแล้ว {totalCartCount} ชิ้น ({cart.length} รายการ)
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-white font-extrabold"
            onClick={() => setIsCartOpen(true)}
          >
            {lang === 'th' ? 'ดูตะกร้า & ยื่นเบิก ➔' : 'View Cart ➔'}
          </button>
        </div>
      )}

      {/* 2. Top View Mode Tabs */}
      <div className="page-view-tabs mb-3">
        <button
          className={`view-tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
          onClick={() => setActiveTab('catalog')}
        >
          <ShoppingBag size={16} />
          <span>{lang === 'th' ? 'เลือกเบิกอุปกรณ์' : 'Catalog'}</span>
        </button>
        <button
          className={`view-tab-btn ${activeTab === 'my-requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <FileText size={16} />
          <span>{lang === 'th' ? 'คำขอของฉัน' : 'My Requests'}</span>
          {myRequests.length > 0 && <span className="tab-badge">{myRequests.length}</span>}
        </button>
      </div>

      {/* VIEW 1: CATALOG */}
      {activeTab === 'catalog' && (
        <>
          {/* Search & Category Filter Bar */}
          <div className="shopee-toolbar card mb-4">
            <div className="search-bar-wrap">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                className="shopee-search-input"
                placeholder={lang === 'th' ? 'ค้นหาอุปกรณ์ที่ต้องการเบิก (เช่น ปากกา, กระดาษ A4, ยางลบ)...' : 'Search office items...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Category Pills Slider */}
            <div className="category-pills-row mt-3">
              <button
                className={`cat-pill ${selectedCat === 'ALL' ? 'active' : ''}`}
                onClick={() => setSelectedCat('ALL')}
              >
                📦 {lang === 'th' ? 'อุปกรณ์ทั้งหมด' : 'All Items'} ({safeProducts.length})
              </button>
              {safeCategories.map((cat) => {
                const count = safeProducts.filter(
                  (p) =>
                    p.category === cat.id ||
                    p.category === cat.name ||
                    p.category === cat.nameTh
                ).length;
                return (
                  <button
                    key={cat.id}
                    className={`cat-pill ${selectedCat === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCat(cat.id)}
                  >
                    🏷️ {lang === 'th' ? cat.nameTh || cat.name : cat.name} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Ticket Success View */}
          {submittedTicket && (
            <div className="card ticket-success-card mb-6 print-area">
              <div className="ticket-header flex-center gap-3">
                <CheckCircle2 size={36} color="#10b981" />
                <div>
                  <h2 className="font-bold text-lg text-emerald">
                    {lang === 'th' ? '🎉 ยื่นส่งใบคำขอเบิกอุปกรณ์สำนักงานสำเร็จ!' : 'Requisition Request Submitted!'}
                  </h2>
                  <div className="text-xs text-muted">
                    {lang === 'th' ? 'เลขที่ใบคำขอเบิก:' : 'Ref Invoice No:'}{' '}
                    <span className="font-mono font-bold text-primary">{submittedTicket.refNo}</span>
                    <span className="ml-2 badge badge-warning">🟡 รอการอนุมัติ (Pending)</span>
                  </div>
                </div>
              </div>

              <div className="ticket-body my-4">
                <div className="ticket-row mb-2">
                  <span className="t-label font-bold">{lang === 'th' ? 'บริษัท:' : 'Company:'}</span>{' '}
                  <span className="t-val font-bold text-primary">{submittedTicket.requesterCompany}</span>
                </div>
                <div className="ticket-row mb-2">
                  <span className="t-label font-bold">{lang === 'th' ? 'ผู้ขอเบิก:' : 'Requester:'}</span>{' '}
                  <span className="t-val font-semibold">{submittedTicket.requesterName} ({submittedTicket.requesterDept || '-'})</span>
                </div>

                {/* List of items in ticket */}
                <div className="ticket-items-box card bg-main my-3 p-3">
                  <div className="font-bold text-xs mb-2 text-muted">
                    📦 {lang === 'th' ? 'รายการอุปกรณ์ที่ขอเบิก:' : 'Requested Items:'}
                  </div>
                  {submittedTicket.items.map((item, idx) => (
                    <div key={idx} className="ticket-item-row flex-between py-1 border-bottom">
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-xs text-muted font-mono ml-2">({item.sku})</span>
                      </div>
                      <span className="font-bold text-red">
                        {item.quantity} {item.unit || 'ชิ้น'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ticket-actions no-print flex-center gap-2">
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Printer size={16} />
                  {lang === 'th' ? 'พิมพ์ใบคำขอเบิก' : 'Print Slip'}
                </button>
                <button className="btn btn-primary" onClick={() => setSubmittedTicket(null)}>
                  <ShoppingBag size={16} />
                  {lang === 'th' ? 'เลือกเบิกอุปกรณ์รายการอื่นต่อ' : 'Requisition More Equipment'}
                </button>
              </div>
            </div>
          )}

          {/* EXACT MATCH EQUIPMENT CARD GRID */}
          <div className="exact-cards-grid mb-6">
            {filteredProducts.length === 0 ? (
              <div className="no-products-box card text-center py-10">
                <Package size={40} color="#94a3b8" />
                <div className="font-bold mt-2">{lang === 'th' ? 'ไม่พบอุปกรณ์ที่ค้นหา' : 'No items match your search'}</div>
              </div>
            ) : (
              filteredProducts.map((prod) => {
                const isOut = prod.quantity === 0;
                const catName = getCatName(prod.category);
                const cartItem = cart.find((item) => item.product.id === prod.id);
                const inCartQty = cartItem ? cartItem.quantity : 0;

                return (
                  <div key={prod.id} className={`exact-asset-card card ${isOut ? 'is-out-card' : ''}`}>
                    {/* Image & Yellow Stock Badge at Top Right */}
                    <div className="card-image-wrap">
                      <img src={prod.image} alt={prod.name} className="card-img" />
                      <span className="yellow-stock-pill">
                        {prod.quantity} {prod.unit || 'ชิ้น'}
                      </span>
                      {isOut && (
                        <div className="out-overlay-banner">
                          <span>{lang === 'th' ? 'หมดคลัง' : 'Out of Stock'}</span>
                        </div>
                      )}
                    </div>

                    {/* Card Content Body */}
                    <div className="card-content-body">
                      {/* Category Pill Chip */}
                      <div className="cat-chip-badge">{catName}</div>

                      {/* Product Title */}
                      <h3 className="exact-prod-title" title={prod.name}>{prod.name}</h3>

                      {/* Asset Tag SKU / QR (Desktop only) */}
                      <div className="exact-asset-sku desktop-only">
                        Asset Tag: <span className="font-mono">{prod.sku}</span>
                      </div>

                      <div className="exact-card-divider" />

                      {inCartQty > 0 ? (
                        <div className="card-in-cart-counter">
                          <button
                            type="button"
                            className="btn-counter-sub"
                            onClick={() => handleUpdateCartQty(prod.id, -1)}
                            title="ลดจำนวน"
                          >
                            <Minus size={14} />
                          </button>
                          <div className="cart-counter-input-group">
                            <input
                              type="number"
                              min="1"
                              max={prod.quantity}
                              value={inCartQty}
                              onChange={(e) => handleSetCartQty(prod.id, e.target.value, prod.quantity)}
                              onClick={(e) => e.stopPropagation()}
                              className="cart-counter-input"
                              title="คลิกเพื่อพิมพ์จำนวนที่ต้องการ"
                            />
                            <span className="cart-counter-unit">
                              {prod.unit || 'ชิ้น'} (ในตะกร้า)
                            </span>
                          </div>
                          <button
                            type="button"
                            className="btn-counter-add"
                            onClick={() => handleUpdateCartQty(prod.id, 1)}
                            disabled={inCartQty >= prod.quantity}
                            title="เพิ่มจำนวน"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className={`btn-exact-requisition ${isOut ? 'disabled' : ''}`}
                          disabled={isOut}
                          onClick={() => handleAddToCart(prod)}
                        >
                          <Plus size={15} />
                          <span>
                            {isOut
                              ? (lang === 'th' ? 'อุปกรณ์หมด' : 'Out of Stock')
                              : (lang === 'th' ? 'เบิกอุปกรณ์' : 'Requisition')}
                          </span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* VIEW 2: MY REQUESTS TRACKING */}
      {activeTab === 'my-requests' && (
        <div className="my-requests-section">
          <div className="card mb-4">
            <h2 className="font-extrabold text-base mb-1 flex-center gap-2">
              <FileText color="#4f46e5" size={20} />
              {lang === 'th' ? 'ประวัติและการติดตามสถานะคำขอเบิกของฉัน' : 'My Requisition Requests Tracking'}
            </h2>
            <p className="text-xs text-muted">
              {lang === 'th' ? 'ติดตามสถานะการอนุมัติและพิมพ์ใบคำขอเบิกได้ที่นี่' : 'Track your submitted requests'}
            </p>
          </div>

          <div className="requests-feed">
            {myRequests.length === 0 ? (
              <div className="card text-center py-10 text-muted">
                <FileText size={48} color="#cbd5e1" className="mb-2" />
                <div className="font-bold text-base text-primary mb-1">
                  {lang === 'th' ? 'ยังไม่มีประวัติการยื่นคำขอเบิกของคุณ' : 'No requests yet'}
                </div>
                <div className="text-xs text-muted">
                  {lang === 'th'
                    ? `เข้าสู่ระบบในชื่อ "${user?.name || 'ผู้ใช้งาน'}" (ยังไม่มีคำขอที่ส่งจากบัญชีนี้)`
                    : 'Your submitted requisition requests will appear here'}
                </div>
              </div>
            ) : (
              myRequests.map((req) => {
                const isPending = req.status === 'PENDING';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';
                const isCancelled = req.status === 'CANCELLED';

                const reqDateRaw = req.date || req.createdAt;
                const reqDateObj = reqDateRaw ? new Date(reqDateRaw) : new Date();
                const isValidDate = !isNaN(reqDateObj.getTime());
                const displayDate = isValidDate
                  ? reqDateObj.toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })
                  : new Date().toLocaleDateString('th-TH', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });

                return (
                  <div key={req.id} className="card mb-4">
                    <div className="flex-between pb-2 border-bottom">
                      <div className="flex-center gap-3">
                        <span className="font-mono font-extrabold text-primary text-base">{req.refNo}</span>
                        <span className={`badge ${isPending ? 'badge-warning' : isApproved ? 'badge-success' : isCancelled ? 'badge-secondary' : 'badge-danger'}`}>
                          {isPending && '🟡 รอการอนุมัติ (Pending)'}
                          {isApproved && '🟢 อนุมัติแล้ว (Approved)'}
                          {isRejected && '🔴 ไม่อนุมัติ (Rejected)'}
                          {isCancelled && '⚪ ยกเลิกแล้ว (Cancelled)'}
                        </span>
                      </div>
                      <div className="text-xs text-muted font-mono">
                        <Clock size={14} className="inline-icon" />
                        {displayDate}
                      </div>
                    </div>

                    <div className="my-3 text-sm">
                      <div><strong>ผู้ขอเบิก:</strong> {req.requesterName} ({req.requesterDept || '-'}) - {req.requesterCompany}</div>
                      {req.note && <div className="text-muted text-xs mt-1"><strong>หมายเหตุ:</strong> {req.note}</div>}
                    </div>

                    <div className="table-responsive mb-3">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>อุปกรณ์</th>
                            <th>Asset Tag</th>
                            <th className="text-right">จำนวนที่ขอเบิก</th>
                          </tr>
                        </thead>
                        <tbody>
                          {req.items.map((it, idx) => (
                            <tr key={idx}>
                              <td>{idx + 1}</td>
                              <td className="font-bold">{it.name}</td>
                              <td className="font-mono text-xs text-muted">{it.sku}</td>
                              <td className="text-right font-bold text-red">{it.quantity} {it.unit || 'ชิ้น'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {req.statusNote && (
                      <div className="alert-box alert-success text-xs mb-3">
                        <strong>บันทึกจากเจ้าหน้าที่:</strong> {req.statusNote}
                      </div>
                    )}

                    <div className="flex-between flex-wrap gap-2 pt-2 border-top">
                      <div>
                        {isPending && (
                          <button
                            type="button"
                            className="btn btn-sm flex-center gap-1"
                            style={{
                              color: '#ef4444',
                              borderColor: '#fca5a5',
                              background: '#fff1f2',
                              fontWeight: '700',
                              fontSize: '0.8rem',
                              padding: '0.35rem 0.75rem',
                              borderRadius: '6px',
                            }}
                            onClick={() => {
                              const confirmMsg = lang === 'th'
                                ? `คุณต้องการยกเลิกคำขอเบิก [${req.refNo}] นี้ใช่หรือไม่?`
                                : `Do you want to cancel request [${req.refNo}]?`;
                              if (window.confirm(confirmMsg)) {
                                cancelRequisitionRequest(req.id);
                              }
                            }}
                          >
                            <XCircle size={15} />
                            <span>{lang === 'th' ? 'ยกเลิกคำขอนี้ (Cancel)' : 'Cancel Request'}</span>
                          </button>
                        )}
                      </div>
                      <div className="flex-center gap-2">
                        <button className="btn btn-secondary btn-sm" onClick={() => setViewSlipReq(req)}>
                          <Printer size={15} /> {lang === 'th' ? 'พิมพ์ใบคำขอเบิก' : 'Print Slip'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* COMPACT FLOATING CART BUTTON (BOTTOM RIGHT) */}
      {cart.length > 0 && activeTab === 'catalog' && (
        <button
          className="compact-floating-cart-btn shadow-lg"
          onClick={() => setIsCartOpen(true)}
        >
          <div className="cart-btn-icon-wrap">
            <ShoppingCart size={20} />
            <span className="cart-badge-count">{totalCartCount}</span>
          </div>
          <span className="font-bold">{lang === 'th' ? 'ยื่นคำขอเบิก' : 'Checkout Request'}</span>
        </button>
      )}

      {/* MULTI-ITEM REQUISITION CHECKOUT MODAL */}
      {isCartOpen && (
        <div className="modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="modal-content modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex-between">
              <div className="modal-header-title flex-center gap-2.5" style={{ minWidth: 0 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: '#ffe4e6',
                    color: '#e11d48',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Send size={18} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <h2 className="font-extrabold text-sm md:text-base text-slate-800" style={{ margin: 0, lineHeight: 1.2 }}>
                    {lang === 'th' ? 'ยื่นส่งใบคำขอเบิกอุปกรณ์สำนักงาน' : 'Submit Requisition Request'}
                  </h2>
                  <div className="text-xxs text-muted mt-0.5">
                    {lang === 'th' ? `อุปกรณ์ในตะกร้าทั้งหมด ${cart.length} รายการ (${totalCartCount} ชิ้น)` : `${cart.length} items (${totalCartCount} pcs)`}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitMultiRequisition}>
              <div className="modal-body" style={{ maxHeight: 'calc(82vh - 120px)', overflowY: 'auto' }}>
                {errorMsg && (
                  <div className="alert-box alert-danger mb-3">
                    <AlertCircle size={18} />
                    <span className="text-xs">{errorMsg}</span>
                  </div>
                )}

                {/* Modern Cart Items Card List */}
                <div className="card mb-3 p-3 bg-main" style={{ borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                  <div className="flex-between mb-2">
                    <span className="font-extrabold text-xs text-slate-800 flex-center gap-1.5">
                      <span>📦 รายการในตะกร้า</span>
                      <span className="badge badge-primary font-mono text-xxs">{cart.length}</span>
                    </span>
                    <div className="flex-center gap-1.5">
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs font-bold flex-center gap-1"
                        style={{ padding: '0.28rem 0.65rem', fontSize: '0.75rem', borderRadius: '6px' }}
                        onClick={() => setIsCartOpen(false)}
                      >
                        <Plus size={13} />
                        <span>{lang === 'th' ? 'เลือกสินค้าเพิ่ม' : 'Add More'}</span>
                      </button>
                      {cart.length > 0 && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs text-red font-bold"
                          style={{ padding: '0.2rem 0.5rem' }}
                          onClick={() => setCart([])}
                        >
                          <Trash2 size={12} /> {lang === 'th' ? 'ล้างตะกร้า' : 'Clear'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Empty Cart Prompt */}
                  {cart.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '1.75rem 1rem', background: 'var(--bg-surface)', borderRadius: '10px', border: '1px dashed var(--border-color)' }}>
                      <p className="text-xs text-muted mb-2 font-medium">📭 ยังไม่มีรายการอุปกรณ์ในตะกร้า</p>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm font-bold flex-center gap-1.5"
                        style={{ margin: '0 auto', padding: '0.45rem 1.15rem', borderRadius: '8px' }}
                        onClick={() => setIsCartOpen(false)}
                      >
                        <Plus size={15} />
                        <span>{lang === 'th' ? 'ไปเลือกสินค้าที่หน้าหลัก' : 'Browse Catalog'}</span>
                      </button>
                    </div>
                  ) : (
                    <div className="cart-items-stack" style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
                      {cart.map(({ product: p, quantity: q }) => (
                        <div
                          key={p.id}
                          className="cart-item-card"
                          style={{
                            background: 'var(--bg-surface)',
                            borderRadius: '10px',
                            border: '1px solid var(--border-color)',
                            padding: '0.65rem 0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.65rem',
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              className="font-bold text-xs text-slate-800"
                              style={{
                                lineHeight: 1.3,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={p.name}
                            >
                              {p.name}
                            </div>
                            <div className="text-xxs text-muted mt-0.5 font-medium">
                              คลังคงเหลือ: <strong className="text-green font-bold">{p.quantity}</strong> {p.unit || 'ชิ้น'}
                            </div>
                          </div>

                          <div className="flex-center gap-2" style={{ flexShrink: 0 }}>
                            {/* Stepper */}
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                background: 'var(--bg-main)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                padding: '2px',
                                gap: '2px',
                              }}
                            >
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                style={{ width: '26px', height: '26px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                onClick={() => handleUpdateCartQty(p.id, -1)}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={p.quantity}
                                value={q}
                                onChange={(e) => handleSetCartQty(p.id, e.target.value, p.quantity)}
                                className="font-mono font-extrabold text-xs"
                                style={{
                                  width: '36px',
                                  textAlign: 'center',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '4px',
                                  background: 'var(--bg-surface)',
                                  color: 'var(--text-main)',
                                  padding: '2px 0',
                                  outline: 'none',
                                }}
                              />
                              <button
                                type="button"
                                className="btn btn-ghost btn-xs"
                                style={{ width: '26px', height: '26px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}
                                onClick={() => handleUpdateCartQty(p.id, 1)}
                                disabled={q >= p.quantity}
                              >
                                +
                              </button>
                            </div>

                            {/* Delete Button */}
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-red"
                              style={{ width: '28px', height: '28px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                              onClick={() => handleRemoveFromCart(p.id)}
                              title="ลบรายการนี้"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Requester Identity Card */}
                <div className="card p-2.5 mb-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                  <div className="flex-between mb-1.5">
                    <span className="font-extrabold text-xxs text-primary flex-center gap-1">
                      <UserCheck size={14} color="#4f46e5" />
                      <span>ข้อมูลผู้ขอเบิก (ระบบยืนยันตัวตน)</span>
                    </span>
                    <span className="badge badge-success text-xxs font-bold" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                      <CheckCircle2 size={10} /> ยืนยันแล้ว
                    </span>
                  </div>

                  <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div className="flex-between flex-wrap gap-1">
                      <div className="font-extrabold text-xs text-primary">
                        {user?.name || requesterName || 'พนักงาน'}
                      </div>
                      <span className="badge badge-info text-xxs font-bold" style={{ fontSize: '0.62rem' }}>
                        {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : user?.role === 'staff' ? 'เจ้าหน้าที่คลัง' : 'ผู้ขอเบิก'}
                      </span>
                    </div>
                    <div className="text-xxs text-muted mt-1">
                      🏢 <strong>{user?.company || 'EXION THAILAND'}</strong> {user?.department ? `• 📁 ${user.department}` : ''}
                    </div>
                  </div>

                  <div className="form-group mt-2.5">
                    <label className="form-label text-xxs font-bold">วัตถุประสงค์ในการเบิก</label>
                    <select
                      className="form-control text-xs"
                      style={{ padding: '0.45rem 0.65rem' }}
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                    >
                      <option value="DAILY">💻 ใช้งานประจำวันในสำนักงาน</option>
                      <option value="ONBOARDING">👤 อุปกรณ์พนักงานใหม่ (Onboarding)</option>
                      <option value="PROJECT">🚀 โครงการพิเศษ / ประชุมภายนอก</option>
                      <option value="REPLACEMENT">🛠️ เบิกทดแทนอุปกรณ์เดิมชำรุด</option>
                    </select>
                  </div>

                  <div className="form-group mt-2">
                    <label className="form-label text-xxs font-bold">หมายเหตุเพิ่มเติม</label>
                    <input
                      type="text"
                      className="form-control text-xs"
                      style={{ padding: '0.45rem 0.65rem' }}
                      placeholder="ระบุรายละเอียดเพิ่มเติม (ถ้ามี)"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </div>

                  {/* Department Monthly Quota Status */}
                  {user?.department && (() => {
                    const deptQuota = departmentQuotas[user.department] !== undefined ? departmentQuotas[user.department] : 50;
                    const deptUsage = getDepartmentUsageThisMonth(user.department);
                    const isUnlimited = deptQuota === 0;
                    const isOver = !isUnlimited && (deptUsage + totalCartCount > deptQuota);

                    return (
                      <div
                        className="p-2 rounded-md mt-2"
                        style={{
                          background: isOver ? 'rgba(239, 68, 68, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                          border: isOver ? '1px solid #fca5a5' : '1px solid #86efac',
                        }}
                      >
                        <div className="flex-between text-xxs flex-wrap gap-1">
                          <span className="font-bold text-primary">
                            📊 โควตาเบิก ({user.department}):
                          </span>
                          <span className="font-mono font-bold" style={{ color: isOver ? '#ef4444' : '#10b981' }}>
                            {isUnlimited
                              ? `เบิกไปแล้ว ${deptUsage} ชิ้น (♾️ ไม่จำกัดโควตา)`
                              : `ใช้ไป ${deptUsage} + ครั้งนี้ ${totalCartCount} / ${deptQuota} ชิ้น`}
                          </span>
                        </div>
                        {isOver && (
                          <div className="text-xxs text-red mt-1 font-bold">
                            ⚠️ คำขอนี้จะเกินโควตาประจำเดือนของแผนก ({deptUsage + totalCartCount - deptQuota} ชิ้น) ต้องรอผู้อนุมัติพิจารณาเป็นกรณีพิเศษ
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div className="modal-footer" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsCartOpen(false)}>
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-danger btn-sm font-bold flex-1" style={{ padding: '0.65rem 1rem' }}>
                  <Send size={15} />
                  {lang === 'th'
                    ? `📨 ยื่นส่งใบคำขอเบิกทั้ง ${cart.length} รายการ (ส่งอนุมัติ)`
                    : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>

      {/* PRINT SLIP MODAL */}
      <RequisitionSlipModal
        isOpen={Boolean(viewSlipReq)}
        onClose={() => setViewSlipReq(null)}
        request={viewSlipReq}
      />
    </div>
  );
};
