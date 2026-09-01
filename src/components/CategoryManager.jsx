import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { FolderTree, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

export const CategoryManager = () => {
  const { categories, products, addCategory, updateCategory, deleteCategory, lang, user } = useStock();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [name, setName] = useState('');
  const [nameTh, setNameTh] = useState('');
  const [color, setColor] = useState('#3b82f6');

  const handleOpenAdd = () => {
    setEditingCat(null);
    setName('');
    setNameTh('');
    setColor('#3b82f6');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setEditingCat(cat);
    setName(cat.name);
    setNameTh(cat.nameTh || '');
    setColor(cat.color || '#3b82f6');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCat) {
      updateCategory(editingCat.id, { name, nameTh, color });
    } else {
      addCategory({ name, nameTh, color });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="category-manager-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <FolderTree color="#2563eb" />
            {lang === 'th' ? 'จัดการหมวดหมู่สินค้า' : 'Category Management'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `ทั้งหมด ${categories.length} หมวดหมู่ สำหรับจัดกลุ่มรายการสินค้า`
              : `Managing ${categories.length} item categories`}
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            {lang === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'Add Category'}
          </button>
        )}
      </div>

      {/* Category Cards Grid */}
      <div className="categories-grid">
        {categories.map((cat) => {
          const itemCount = products.filter(p => p.category === cat.id).length;

          return (
            <div key={cat.id} className="card cat-card" style={{ borderLeft: `5px solid ${cat.color || '#3b82f6'}` }}>
              <div className="cat-card-header">
                <div className="cat-icon-badge" style={{ backgroundColor: `${cat.color}20`, color: cat.color }}>
                  <FolderTree size={20} />
                </div>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="cat-actions">
                    <button className="btn-icon-sm" onClick={() => handleOpenEdit(cat)} title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon-sm danger"
                      onClick={() => {
                        if (window.confirm(lang === 'th' ? `ลบหมวดหมู่ "${cat.name}" หรือไม่?` : `Delete category "${cat.name}"?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="cat-card-body">
                <h3 className="cat-title">{lang === 'th' ? cat.nameTh || cat.name : cat.name}</h3>
                {cat.nameTh && <div className="cat-sub">{cat.name}</div>}
              </div>

              <div className="cat-card-footer">
                <span className="badge badge-info">{itemCount} {lang === 'th' ? 'รายการสินค้า' : 'Items'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-sm">
            <div className="modal-header">
              <h2>{editingCat ? (lang === 'th' ? 'แก้ไขหมวดหมู่' : 'Edit Category') : (lang === 'th' ? 'เพิ่มหมวดหมู่ใหม่' : 'New Category')}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ชื่อหมวดหมู่ (ภาษาอังกฤษ) *' : 'Category Name (EN) *'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. IT & Electronics"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ชื่อหมวดหมู่ (ภาษาไทย)' : 'Category Name (TH)'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น อุปกรณ์ไอที"
                    value={nameTh}
                    onChange={(e) => setNameTh(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'สีหมวดหมู่' : 'Category Color'}</label>
                  <input
                    type="color"
                    className="form-control color-picker"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
                </button>
                <button type="submit" className="btn btn-primary">
                  {lang === 'th' ? 'บันทึก' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.25rem;
        }

        .cat-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .cat-icon-badge {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cat-actions {
          display: flex;
          gap: 0.35rem;
        }

        .cat-title {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .cat-sub {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .cat-card-footer {
          margin-top: auto;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border-color);
        }

        .color-picker {
          height: 44px;
          padding: 0.2rem;
          cursor: pointer;
        }

        .modal-sm { max-width: 420px; }
      `}</style>
    </div>
  );
};
