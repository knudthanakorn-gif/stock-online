import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { X, Package, QrCode, Upload, Sparkles, CheckCircle2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export const ProductModal = ({ isOpen, onClose, productToEdit = null }) => {
  const { categories, suppliers, addProduct, updateProduct, packDefaults = {}, savePackDefault: savePackDefaultToStock, transactions = [], lang } = useStock();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minThreshold, setMinThreshold] = useState('5');
  const [unit, setUnit] = useState('ชิ้น');
  const [defaultPurchaseUnit, setDefaultPurchaseUnit] = useState('แพ็ค');
  const [defaultPackSize, setDefaultPackSize] = useState('10');
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isConverting, setIsConverting] = useState(false);

  const PACK_DEFAULTS_KEY = 'stock_pack_defaults_v1';
  const getPackDefaults = () => {
    try {
      return JSON.parse(localStorage.getItem(PACK_DEFAULTS_KEY)) || {};
    } catch {
      return {};
    }
  };
  const savePackDefault = (prodId, skuId, config) => {
    if (!prodId) return;
    try {
      const cur = getPackDefaults();
      cur[prodId] = { ...(cur[prodId] || {}), ...config };
      if (skuId) {
        cur[skuId] = { ...(cur[skuId] || {}), ...config };
      }
      localStorage.setItem(PACK_DEFAULTS_KEY, JSON.stringify(cur));
    } catch {}

    if (typeof savePackDefaultToStock === 'function') {
      savePackDefaultToStock(prodId, config);
      if (skuId) {
        savePackDefaultToStock(skuId, config);
      }
    }
  };

  // Helper to compress any image into lightweight permanent WebP/JPEG data URL
  const compressImage = (imgSrc, maxWidth = 500, maxHeight = 500, quality = 0.88) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        try {
          const dataUrl = canvas.toDataURL('image/webp', quality);
          resolve(dataUrl);
        } catch (e) {
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        }
      };
      img.onerror = (err) => reject(err);
      img.src = imgSrc;
    });
  };

  const handleConvertUrlToPermanent = async () => {
    if (!image || image.startsWith('data:image/')) return;
    setIsConverting(true);
    try {
      try {
        const permanentDataUrl = await compressImage(image);
        setImage(permanentDataUrl);
        setIsConverting(false);
        return;
      } catch (directErr) {
        const cleanUrl = image.replace(/^https?:\/\//, '');
        const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&w=500&output=webp`;
        const permanentDataUrl = await compressImage(proxyUrl);
        setImage(permanentDataUrl);
        setIsConverting(false);
      }
    } catch (err) {
      console.warn('Image conversion fallback warning:', err);
      setIsConverting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawDataUrl = event.target?.result;
      if (rawDataUrl) {
        try {
          const compressed = await compressImage(rawDataUrl);
          setImage(compressed);
        } catch (err) {
          setImage(rawDataUrl);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isOpen) return;

    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setBarcode(productToEdit.barcode || '');
      setCategory(productToEdit.category || (categories[0]?.id || ''));
      setCostPrice(productToEdit.costPrice !== undefined && productToEdit.costPrice !== null ? String(productToEdit.costPrice) : '0');
      setSellingPrice(productToEdit.sellingPrice !== undefined && productToEdit.sellingPrice !== null ? String(productToEdit.sellingPrice) : '0');
      setQuantity(productToEdit.quantity !== undefined && productToEdit.quantity !== null ? String(productToEdit.quantity) : '0');
      setMinThreshold(productToEdit.minThreshold !== undefined && productToEdit.minThreshold !== null ? String(productToEdit.minThreshold) : '5');
      setUnit(productToEdit.unit || 'ชิ้น');

      // Resolve saved pack defaults from all possible sources
      const localPacks = getPackDefaults();
      const pId = productToEdit.id;
      const pSku = productToEdit.sku;

      let descPack = null;
      if (productToEdit.description) {
        const m = productToEdit.description.match(/<!--pack:({.*?})-->/);
        if (m) {
          try {
            descPack = JSON.parse(m[1]);
          } catch (e) {}
        }
      }

      const packDef =
        (packDefaults && (packDefaults[pId] || (pSku && packDefaults[pSku]))) ||
        localPacks[pId] ||
        (pSku && localPacks[pSku]) ||
        (productToEdit.defaultPackSettings || {}) ||
        {};

      let pastTxPref = null;
      if (!packDef.invoiceUnit && !productToEdit.defaultPurchaseUnit && !descPack && Array.isArray(transactions)) {
        const pastTx = transactions.find(t => (t.productId === pId || t.productSku === pSku) && t.type === 'IN' && (t.invoiceUnit || t.packSize));
        if (pastTx) {
          pastTxPref = {
            invoiceUnit: pastTx.invoiceUnit,
            packSize: pastTx.packSize,
          };
        }
      }

      const resolvedUnit =
        productToEdit.defaultPurchaseUnit ||
        productToEdit.invoiceUnit ||
        descPack?.invoiceUnit ||
        descPack?.unit ||
        packDef?.invoiceUnit ||
        pastTxPref?.invoiceUnit ||
        'แพ็ค';

      const resolvedPackSize =
        productToEdit.defaultPackSize ||
        productToEdit.packSize ||
        descPack?.packSize ||
        descPack?.size ||
        packDef?.packSize ||
        pastTxPref?.packSize ||
        '10';

      setDefaultPurchaseUnit(resolvedUnit);
      setDefaultPackSize(String(resolvedPackSize));

      setSupplierId(productToEdit.supplierId || '');
      const cleanDesc = (productToEdit.description || '').replace(/<!--pack:{.*?}-->/g, '').trim();
      setDescription(cleanDesc);
      setImage(productToEdit.image || '');
    } else {
      setName('');
      setSku('');
      setBarcode(`QR885${Math.floor(100000000 + Math.random() * 900000000)}`);
      setCategory(categories[0]?.id || '');
      setCostPrice('0');
      setSellingPrice('0');
      setQuantity('0');
      setMinThreshold('5');
      setUnit('ชิ้น');
      setDefaultPurchaseUnit('แพ็ค');
      setDefaultPackSize('10');
      setSupplierId('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80');
    }
  }, [isOpen, productToEdit?.id]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const cleanDesc = description.replace(/<!--pack:{.*?}-->/g, '').trim();
    const metaTag = `<!--pack:${JSON.stringify({ invoiceUnit: defaultPurchaseUnit || 'แพ็ค', packSize: Number(defaultPackSize) || 10 })}-->`;
    const fullDesc = cleanDesc ? `${cleanDesc}\n${metaTag}` : metaTag;

    const targetSku = sku.trim() || productToEdit?.sku || `AST-${Math.floor(100000 + Math.random() * 900000)}`;
    const targetBarcode = barcode.trim() || productToEdit?.barcode || `QR885${Math.floor(100000000 + Math.random() * 900000000)}`;

    const packConfig = {
      isPack: true,
      invoiceUnit: defaultPurchaseUnit || 'แพ็ค',
      packSize: Number(defaultPackSize) || 10,
    };

    const productData = {
      name: name.trim(),
      sku: targetSku,
      barcode: targetBarcode,
      category,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || Number(costPrice) || 0,
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) || 5,
      unit: unit || 'ชิ้น',
      supplierId: supplierId || null,
      description: fullDesc,
      image: image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
      defaultPurchaseUnit: defaultPurchaseUnit || 'แพ็ค',
      defaultPackSize: Number(defaultPackSize) || 10,
      invoiceUnit: defaultPurchaseUnit || 'แพ็ค',
      packSize: Number(defaultPackSize) || 10,
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
      savePackDefault(productToEdit.id, targetSku, packConfig);
    } else {
      const created = addProduct(productData);
      const targetId = created?.id || `prod-${Date.now()}`;
      savePackDefault(targetId, targetSku, packConfig);
    }

    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content modal-lg">
        <div className="modal-header">
          <div className="modal-header-title">
            <Package color="#2563eb" size={24} />
            <h2>
              {productToEdit
                ? (lang === 'th' ? 'แก้ไขข้อมูลอุปกรณ์สำนักงาน' : 'Edit Office Asset')
                : (lang === 'th' ? 'เพิ่มอุปกรณ์สำนักงานใหม่' : 'Add New Office Asset')}
            </h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              {/* Name */}
              <div className="form-group col-span-2">
                <label className="form-label">{lang === 'th' ? 'ชื่ออุปกรณ์สำนักงาน *' : 'Asset Name *'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="เช่น โน้ตบุ๊ก Dell Latitude, กระดาษ A4, เครื่องคิดเลข..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* SKU / Product Code */}
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">{lang === 'th' ? 'รหัสสินค้า / รหัสพัสดุ (SKU)' : 'Product Code / SKU'}</label>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-xs"
                    style={{ padding: '0 4px', height: 'auto', color: '#4f46e5', fontWeight: 600 }}
                    onClick={() => setSku(`AST-${Math.floor(100000 + Math.random() * 900000)}`)}
                    title="สุ่มสร้างรหัสพัสดุอัตโนมัติ"
                  >
                    <Sparkles size={12} style={{ marginRight: 3, display: 'inline' }} />
                    {lang === 'th' ? 'สุ่มรหัส' : 'Auto'}
                  </button>
                </div>
                <input
                  type="text"
                  className="form-control font-mono font-bold"
                  placeholder={lang === 'th' ? 'เช่น 8002384, OFM-101 (เว้นว่างไว้จะสุ่มสร้างให้อัตโนมัติ)' : 'e.g. 8002384, OFM-101...'}
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                />
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'หมวดหมู่อุปกรณ์ *' : 'Category *'}</label>
                <select
                  className="form-control"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {lang === 'th' ? c.nameTh || c.name : c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Unit */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'หน่วยนับในคลัง/หน่วยเบิก *' : 'Stock Unit *'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ชิ้น, ด้าม, เล่ม, เครื่อง, รีม..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  required
                />
              </div>

              {/* Cost Price */}
              <div className="form-group">
                <label className="form-label">
                  {lang === 'th' ? 'ราคาต้นทุน / มูลค่าต่อหน่วย (บาท) (ไม่บังคับ - ระบุตอนรับเข้าได้)' : 'Cost Price / Valuation (Optional - can set on stock-in)'}
                </label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00 (ไม่บังคับ)"
                  min="0"
                  step="any"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>

              {/* Initial Quantity */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'จำนวนคงเหลือเริ่มต้น (ไม่บังคับ - เริ่มต้น 0)' : 'Initial Quantity (Optional - default 0)'}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>

              {/* Min Threshold */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'จุดแจ้งเตือนคงเหลือน้อย (ชิ้น)' : 'Low Stock Threshold'}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="5"
                  min="1"
                  value={minThreshold}
                  onChange={(e) => setMinThreshold(e.target.value)}
                />
              </div>

              {/* Packaging Defaults (Optional) */}
              <div className="form-group col-span-2" style={{ background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                <div className="font-bold text-xs text-primary mb-2 flex items-center gap-1.5">
                  <span>📦 {lang === 'th' ? 'การตั้งค่าหน่วยซื้อ/รับเข้าเริ่มต้น (ตามบิล Invoice)' : 'Default Invoice Packaging Setting'}</span>
                  <span className="text-xxs font-normal text-muted">({lang === 'th' ? 'ช่วยให้ไม่ต้องกรอกขนาดบรรจุใหม่ทุกครั้งที่รับของ' : 'Optional'})</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label className="text-xxs font-bold text-slate-600 block mb-1">
                      {lang === 'th' ? 'หน่วยซื้อตามบิล (เช่น แพ็ค, ลัง, กล่อง)' : 'Purchase Unit:'}
                    </label>
                    <input
                      type="text"
                      className="form-control text-xs"
                      placeholder="แพ็ค, ลัง, กล่อง, โหล..."
                      value={defaultPurchaseUnit}
                      onChange={(e) => setDefaultPurchaseUnit(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xxs font-bold text-slate-600 block mb-1">
                      {lang === 'th' ? `อัตราส่วนบรรจุ (1 ${defaultPurchaseUnit || 'แพ็ค'} = กี่${unit || 'ชิ้น'})` : 'Pack Size (pieces per pack):'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      className="form-control text-xs"
                      placeholder="10"
                      value={defaultPackSize}
                      onChange={(e) => setDefaultPackSize(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Image URL & Permanent Storage */}
              <div className="form-group col-span-2">
                <div className="flex-between mb-1">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    {lang === 'th' ? 'รูปภาพอุปกรณ์ (จัดเก็บถาวรในระบบ)' : 'Product Image (Permanent)'}
                  </label>
                  {image && image.startsWith('data:image/') ? (
                    <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                      🛡️ {lang === 'th' ? 'จัดเก็บในระบบถาวรแล้ว (ไม่มีวันรูปหลุด)' : 'Permanently Stored'}
                    </span>
                  ) : image ? (
                    <span className="badge badge-warning" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
                      🌐 {lang === 'th' ? 'ลิงก์ภายนอก' : 'External Link'}
                    </span>
                  ) : null}
                </div>

                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1 }}
                    placeholder={lang === 'th' ? 'วางลิงก์รูปภาพ หรือกดเลือกไฟล์จากเครื่อง...' : 'Paste image URL or choose file...'}
                    value={image.startsWith('data:image/') ? `[ รูปภาพถูกแปลงและบันทึกถาวรในระบบแล้ว (${Math.round(image.length / 1024)} KB) ]` : image}
                    onChange={(e) => setImage(e.target.value)}
                  />

                  {/* Convert External URL button */}
                  {image && !image.startsWith('data:image/') && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={handleConvertUrlToPermanent}
                      disabled={isConverting}
                      title={lang === 'th' ? 'แปลงลิงก์นี้เป็นรูปภาพถาวรเก็บไว้ในระบบ ป้องกันรูปลบ/หมดอายุ' : 'Convert URL to permanent image'}
                      style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <Sparkles size={14} color="#f59e0b" />
                      <span>{isConverting ? (lang === 'th' ? 'กำลังแปลง...' : 'Converting...') : (lang === 'th' ? 'แปลงเก็บถาวร' : 'Store Image')}</span>
                    </button>
                  )}

                  {/* Upload File Button */}
                  <label
                    className="btn btn-secondary btn-sm"
                    style={{
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      marginBottom: 0
                    }}
                    title={lang === 'th' ? 'เลือกไฟล์รูปภาพจากมือถือ / คอมพิวเตอร์' : 'Upload photo from device'}
                  >
                    <Upload size={14} color="#2563eb" />
                    <span>{lang === 'th' ? 'เลือกไฟล์รูป' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Preview Thumbnail */}
                  {image && (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img
                        src={image}
                        alt="Preview"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1.5px solid var(--border-color)',
                          background: '#ffffff',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="text-xxs text-muted mt-1">
                  {lang === 'th'
                    ? '💡 คุณสามารถวางลิงก์รูปภาพ, กด "เลือกไฟล์รูป" จากเครื่อง, หรือกด Ctrl+V วางรูปภาพได้ทันที ระบบจะบีบอัดและจัดเก็บรูปภาพไว้อย่างถาวร'
                    : '💡 Paste an image link, upload a file, or paste from clipboard (Ctrl+V). Image is permanently stored.'}
                </div>
              </div>

              {/* Description */}
              <div className="form-group col-span-2">
                <label className="form-label">{lang === 'th' ? 'รายละเอียดเพิ่มเติม' : 'Description'}</label>
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="เช่น สเปกเครื่อง หรือ ตำแหน่งจัดเก็บ..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary">
              {productToEdit
                ? (lang === 'th' ? 'บันทึกการแก้ไข' : 'Save Changes')
                : (lang === 'th' ? 'เพิ่มอุปกรณ์ใหม่' : 'Add Asset')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-lg { max-width: 620px; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .col-span-2 { grid-column: span 2; }
        .font-mono { font-family: monospace; }
      `}</style>
    </div>
  );
};
