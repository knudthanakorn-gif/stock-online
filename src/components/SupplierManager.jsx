import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import { Users, Plus, Edit2, Trash2, Phone, Mail, MapPin, X } from 'lucide-react';

export const SupplierManager = () => {
  const { suppliers, products, addSupplier, updateSupplier, deleteSupplier, lang, user } = useStock();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSup, setEditingSup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
  });

  const handleOpenAdd = () => {
    setEditingSup(null);
    setFormData({ name: '', contactPerson: '', phone: '', email: '', address: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (sup) => {
    setEditingSup(sup);
    setFormData({
      name: sup.name || '',
      contactPerson: sup.contactPerson || '',
      phone: sup.phone || '',
      email: sup.email || '',
      address: sup.address || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingSup) {
      updateSupplier(editingSup.id, formData);
    } else {
      addSupplier(formData);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="supplier-manager-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Users color="#2563eb" />
            {lang === 'th' ? 'ผู้จัดจำหน่าย (Suppliers)' : 'Supplier Directory'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? `รายชื่อซัพพลายเออร์และผู้ติดต่อสั่งซื้อสินค้า ${suppliers.length} ราย`
              : `Managing ${suppliers.length} supplier contacts`}
          </p>
        </div>

        {(user?.role === 'admin' || user?.role === 'staff') && (
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            {lang === 'th' ? 'เพิ่มผู้จัดจำหน่าย' : 'Add Supplier'}
          </button>
        )}
      </div>

      <div className="suppliers-grid">
        {suppliers.map((sup) => {
          const linkedCount = products.filter(p => p.supplierId === sup.id).length;

          return (
            <div key={sup.id} className="card sup-card">
              <div className="sup-header">
                <div>
                  <h3 className="sup-name">{sup.name}</h3>
                  <div className="sup-contact-person">{lang === 'th' ? 'ผู้ติดต่อ:' : 'Contact:'} {sup.contactPerson || '-'}</div>
                </div>
                {(user?.role === 'admin' || user?.role === 'staff') && (
                  <div className="sup-actions">
                    <button className="btn-icon-sm" onClick={() => handleOpenEdit(sup)} title="Edit">
                      <Edit2 size={15} />
                    </button>
                    <button
                      className="btn-icon-sm danger"
                      onClick={() => {
                        if (window.confirm(lang === 'th' ? `ลบผู้จัดจำหน่าย "${sup.name}" หรือไม่?` : `Delete supplier "${sup.name}"?`)) {
                          deleteSupplier(sup.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </div>

              <div className="sup-body">
                {sup.phone && (
                  <div className="contact-row">
                    <Phone size={15} className="contact-icon" />
                    <span>{sup.phone}</span>
                  </div>
                )}
                {sup.email && (
                  <div className="contact-row">
                    <Mail size={15} className="contact-icon" />
                    <span>{sup.email}</span>
                  </div>
                )}
                {sup.address && (
                  <div className="contact-row">
                    <MapPin size={15} className="contact-icon" />
                    <span className="address-text">{sup.address}</span>
                  </div>
                )}
              </div>

              <div className="sup-footer">
                <span className="badge badge-info">{linkedCount} {lang === 'th' ? 'สินค้าที่จัดส่ง' : 'Linked Items'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content modal-md">
            <div className="modal-header">
              <h2>{editingSup ? (lang === 'th' ? 'แก้ไขผู้จัดจำหน่าย' : 'Edit Supplier') : (lang === 'th' ? 'เพิ่มผู้จัดจำหน่ายใหม่' : 'New Supplier')}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ชื่อบริษัท / ผู้จัดจำหน่าย *' : 'Supplier Company Name *'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น บริษัท เทคซัพพลาย จำกัด"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ชื่อผู้ติดต่อ' : 'Contact Person'}</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="เช่น คุณสมชาย ใจดี"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                  />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">{lang === 'th' ? 'เบอร์โทรศัพท์' : 'Phone'}</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="02-xxx-xxxx"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">{lang === 'th' ? 'อีเมล' : 'Email'}</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="email@company.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">{lang === 'th' ? 'ที่อยู่บริษัท' : 'Address'}</label>
                  <textarea
                    className="form-control"
                    placeholder="ที่อยู่สำหรับออกใบกำกับภาษี หรือ จัดส่งเอกสาร..."
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
        .suppliers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.25rem;
        }

        .sup-card {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .sup-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .sup-name {
          font-size: 1.05rem;
          font-weight: 700;
        }

        .sup-contact-person {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .sup-actions {
          display: flex;
          gap: 0.35rem;
        }

        .sup-body {
          display: flex;
          flex-direction: column;
          gap: 0.4rem;
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .contact-row {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contact-icon {
          color: var(--primary-500);
          flex-shrink: 0;
        }

        .address-text {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .sup-footer {
          margin-top: auto;
          padding-top: 0.75rem;
          border-top: 1px solid var(--border-color);
        }

        .modal-md { max-width: 520px; }
      `}</style>
    </div>
  );
};
