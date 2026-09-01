import React, { useState, useEffect, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import {
  X,
  PieChart,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  Search,
  Infinity,
  RotateCcw,
} from 'lucide-react';

const OLD_DUMMY_DEPTS = [
  'แผนก IT',
  'แผนกบุคคล / HR',
  'แผนกบัญชีและการเงิน',
  'แผนกคลังสินค้า & สโตร์',
  'แผนกจัดซื้อ',
  'ฝ่ายบริหาร',
  'แผนกการตลาด',
  'แผนกขาย',
];

export const DepartmentQuotaModal = ({ isOpen, onClose }) => {
  const {
    departmentQuotas = {},
    updateDepartmentQuota,
    getDepartmentUsageThisMonth,
    usersList = [],
    requestersList = [],
    requests = [],
    lang,
  } = useStock();

  // Aggregate all real unique departments from Database (Users, Requesters, Requests) & Defaults
  const allDepartments = useMemo(() => {
    const set = new Set();

    // From Users
    usersList.forEach(u => {
      if (u.department && u.department.trim() && !OLD_DUMMY_DEPTS.includes(u.department.trim())) {
        set.add(u.department.trim());
      }
    });

    // From Requesters
    requestersList.forEach(r => {
      if (r.department && r.department.trim() && !OLD_DUMMY_DEPTS.includes(r.department.trim())) {
        set.add(r.department.trim());
      }
    });

    // From Requests history
    requests.forEach(req => {
      if (req.requesterDept && req.requesterDept.trim() && !OLD_DUMMY_DEPTS.includes(req.requesterDept.trim())) {
        set.add(req.requesterDept.trim());
      }
    });

    // From existing quotas (excluding old mock names)
    Object.keys(departmentQuotas).forEach(k => {
      if (k && k.trim() && !OLD_DUMMY_DEPTS.includes(k.trim())) {
        set.add(k.trim());
      }
    });

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [usersList, requestersList, requests, departmentQuotas]);

  const [localQuotas, setLocalQuotas] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      allDepartments.forEach(dept => {
        initial[dept] = departmentQuotas[dept] !== undefined ? departmentQuotas[dept] : 0;
      });
      setLocalQuotas(initial);
      setSearchTerm('');
    }
  }, [isOpen, allDepartments, departmentQuotas]);

  if (!isOpen) return null;

  const handleQuotaChange = (dept, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setLocalQuotas(prev => ({ ...prev, [dept]: num }));
  };

  const handleSetAll = (amount) => {
    const updated = {};
    allDepartments.forEach(dept => {
      updated[dept] = amount;
    });
    setLocalQuotas(updated);
  };

  const handleSave = (e) => {
    e.preventDefault();
    Object.entries(localQuotas).forEach(([dept, limit]) => {
      updateDepartmentQuota(dept, limit);
    });
    setSuccessMsg(lang === 'th' ? '🎉 บันทึกการตั้งค่าโควตาทุกแผนกสำเร็จ!' : 'Quotas saved successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const filteredDepartments = allDepartments.filter(dept =>
    !searchTerm || dept.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px', maxHeight: '90vh' }}>
        <div className="modal-header flex-between">
          <div className="flex-center gap-2.5">
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <PieChart size={20} />
            </div>
            <div>
              <div className="flex-center gap-2">
                <h2 className="font-extrabold text-sm md:text-base text-slate-800" style={{ margin: 0 }}>
                  {lang === 'th' ? 'จำกัดโควตาการเบิกประจำเดือนตามแผนก' : 'Department Monthly Requisition Quotas'}
                </h2>
                <span className="badge badge-primary text-xxs font-mono font-bold">
                  {allDepartments.length} แผนกจริง
                </span>
              </div>
              <p className="text-xxs text-muted mt-0.5" style={{ margin: 0 }}>
                {lang === 'th' ? 'กำหนดจำนวนชิ้นสูงสุดต่อเดือน (กรอก 0 = ไม่จำกัดจำนวนการเบิก ♾️)' : 'Set monthly limits per department (0 = Unlimited ♾️)'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body" style={{ maxHeight: 'calc(78vh - 130px)', overflowY: 'auto' }}>
            {successMsg && (
              <div className="alert-box alert-success mb-3 flex-center gap-2">
                <CheckCircle2 size={18} />
                <span className="font-bold text-xs">{successMsg}</span>
              </div>
            )}

            {/* Quick Actions & Search Bar */}
            <div className="flex-between gap-2 mb-3 flex-wrap">
              <div className="search-input-wrap flex-1" style={{ minWidth: '200px' }}>
                <Search size={15} className="search-icon" />
                <input
                  type="text"
                  className="form-control text-xs"
                  style={{ paddingLeft: '2.2rem', paddingRight: '0.75rem', height: '36px' }}
                  placeholder="🔍 ค้นหาชื่อแผนก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex-center gap-1.5">
                <button
                  type="button"
                  className="btn btn-secondary btn-xs font-bold"
                  style={{ height: '36px', padding: '0 0.65rem' }}
                  onClick={() => handleSetAll(0)}
                  title="ตั้งค่าทุกแผนกเป็นไม่จำกัดโควตา (0)"
                >
                  <Infinity size={14} color="#10b981" /> ทุกแผนก = ไม่จำกัด (0)
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-xs font-bold"
                  style={{ height: '36px', padding: '0 0.65rem' }}
                  onClick={() => handleSetAll(50)}
                  title="ตั้งค่าทุกแผนกเป็น 50 ชิ้น"
                >
                  ⚡ ทุกแผนก = 50 ชิ้น
                </button>
              </div>
            </div>

            <div className="department-quota-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {filteredDepartments.length === 0 ? (
                <div className="card text-center py-6 text-muted text-xs bg-main">
                  {lang === 'th' ? 'ไม่พบแผนกที่ตรงกับการค้นหา' : 'No matching departments found'}
                </div>
              ) : (
                filteredDepartments.map((dept) => {
                  const limit = localQuotas[dept] !== undefined ? localQuotas[dept] : 0;
                  const used = getDepartmentUsageThisMonth(dept);
                  const isUnlimited = limit === 0;
                  const percent = !isUnlimited && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                  const isOver = !isUnlimited && used > limit;

                  return (
                    <div
                      key={dept}
                      className="card p-2.5"
                      style={{
                        background: 'var(--bg-surface)',
                        borderRadius: '12px',
                        border: isOver ? '1.5px solid #f87171' : '1px solid var(--border-color)',
                      }}
                    >
                      <div className="flex-between mb-1.5 flex-wrap gap-1">
                        <div className="flex-center gap-2" style={{ minWidth: 0 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '7px',
                              background: '#eff6ff',
                              color: '#2563eb',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <Building size={14} />
                          </div>
                          <span className="font-bold text-xs text-primary" title={dept}>
                            {dept}
                          </span>
                        </div>

                        <div className="flex-center gap-1.5">
                          <span className="text-xxs text-muted">โควตา:</span>
                          <input
                            type="number"
                            min="0"
                            className="form-control font-mono font-bold text-center"
                            style={{ width: '68px', padding: '0.2rem 0.3rem', fontSize: '0.85rem', height: '30px' }}
                            value={limit}
                            onChange={(e) => handleQuotaChange(dept, e.target.value)}
                          />
                          <span className="text-xxs text-muted" style={{ minWidth: '45px' }}>
                            {isUnlimited ? '♾️ ไม่จำกัด' : 'ชิ้น/เดือน'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex-between text-xxs text-muted mb-1">
                          <span>
                            เบิกสะสมเดือนนี้: <strong className={isOver ? 'text-red font-bold' : 'text-primary font-bold'}>{used}</strong> {isUnlimited ? 'ชิ้น (♾️ ไม่จำกัดโควตา)' : `/ ${limit} ชิ้น (${percent}%)`}
                          </span>
                          {isUnlimited ? (
                            <span className="badge badge-success text-xxs font-bold" style={{ fontSize: '0.62rem', padding: '1px 6px' }}>
                              ♾️ Unlimited
                            </span>
                          ) : isOver ? (
                            <span className="text-red font-bold flex-center gap-1">
                              <AlertTriangle size={11} /> เกินโควตา {used - limit} ชิ้น
                            </span>
                          ) : (
                            <span>คงเหลือ {Math.max(0, limit - used)} ชิ้น</span>
                          )}
                        </div>

                        <div style={{ width: '100%', height: '6px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: isUnlimited ? '100%' : `${percent}%`,
                              height: '100%',
                              background: isUnlimited
                                ? 'linear-gradient(90deg, #10b981, #3b82f6)'
                                : isOver
                                ? '#ef4444'
                                : percent > 80
                                ? '#f59e0b'
                                : 'linear-gradient(90deg, #10b981, #6366f1)',
                              borderRadius: '9999px',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 1rem', display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary btn-sm font-bold flex-1 flex-center gap-1.5" style={{ padding: '0.65rem 1rem' }}>
              <Save size={15} />
              <span>{lang === 'th' ? `บันทึกการตั้งค่า (${allDepartments.length} แผนก)` : 'Save Quotas'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
