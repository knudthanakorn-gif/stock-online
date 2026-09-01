import React, { useState, useEffect } from 'react';
import { useStock } from '../context/StockContext';
import { X, Package, QrCode } from 'lucide-react';

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

              {/* Image URL */}
              <div className="form-group col-span-2">
                <label className="form-label flex-between">
                  <span>{lang === 'th' ? 'ลิงก์ / URL รูปภาพอุปกรณ์' : 'Image URL'}</span>
                  {image && (
                    <span className="text-xxs text-primary font-bold">
                      {lang === 'th' ? '✓ มีรูปภาพ' : '✓ Image Preview'}
                    </span>
                  )}
                </label>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="form-control"
                    style={{ flex: 1 }}
                    placeholder="เช่น /images/products/... หรือ https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                  {image && (
                    <img
                      src={image}
                      alt="Preview"
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: '1px solid var(--border-color)',
                        flexShrink: 0,
                        background: '#f8fafc',
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
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
