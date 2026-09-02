import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { X, Package, QrCode, Upload, Sparkles, CheckCircle2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';

export const ProductModal = ({ isOpen, onClose, productToEdit = null }) => {
  const { categories, suppliers, addProduct, updateProduct, lang } = useStock();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [minThreshold, setMinThreshold] = useState('5');
  const [unit, setUnit] = useState('ชิ้น');
  const [supplierId, setSupplierId] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [isConverting, setIsConverting] = useState(false);

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
    if (productToEdit) {
      setName(productToEdit.name || '');
      setSku(productToEdit.sku || '');
      setBarcode(productToEdit.barcode || '');
      setCategory(productToEdit.category || (categories[0]?.id || ''));
      setCostPrice(productToEdit.costPrice || '');
      setSellingPrice(productToEdit.sellingPrice || '');
      setQuantity(productToEdit.quantity || '');
      setMinThreshold(productToEdit.minThreshold || '5');
      setUnit(productToEdit.unit || 'ชิ้น');
      setSupplierId(productToEdit.supplierId || '');
      setDescription(productToEdit.description || '');
      setImage(productToEdit.image || '');
    } else {
      setName('');
      setSku(`AST-${Math.floor(100000 + Math.random() * 900000)}`);
      setBarcode(`QR885${Math.floor(100000000 + Math.random() * 900000000)}`);
      setCategory(categories[0]?.id || '');
      setCostPrice('0');
      setSellingPrice('0');
      setQuantity('0');
      setMinThreshold('5');
      setUnit('ชิ้น');
      setSupplierId('');
      setDescription('');
      setImage('https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80');
    }
  }, [productToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const productData = {
      name,
      sku: sku || `AST-${Math.floor(100000 + Math.random() * 900000)}`,
      barcode: barcode || `QR885${Math.floor(100000000 + Math.random() * 900000000)}`,
      category,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || Number(costPrice) || 0,
      quantity: Number(quantity) || 0,
      minThreshold: Number(minThreshold) || 5,
      unit: unit || 'ชิ้น',
      supplierId: supplierId || null,
      description,
      image: image || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=400&q=80',
    };

    if (productToEdit) {
      updateProduct(productToEdit.id, productData);
    } else {
      addProduct(productData);
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
                  placeholder="เช่น โน้ตบุ๊ก Dell Latitude, กระดาษ A4..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
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

              {/* Cost Price */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'ราคาต้นทุน / มูลค่าต่อหน่วย (บาท)' : 'Cost Price / Unit Valuation (THB)'}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0.00"
                  min="0"
                  step="any"
                  value={costPrice}
                  onChange={(e) => setCostPrice(e.target.value)}
                />
              </div>

              {/* Initial Quantity */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'จำนวนคงเหลือในคลัง *' : 'Stock Quantity *'}</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
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

              {/* Unit */}
              <div className="form-group">
                <label className="form-label">{lang === 'th' ? 'หน่วยนับ' : 'Unit'}</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="ชิ้น, เครื่อง, กล่อง..."
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
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
