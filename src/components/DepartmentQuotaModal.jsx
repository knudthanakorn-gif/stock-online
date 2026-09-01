import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  X,
  PieChart,
  Building,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  TrendingUp,
} from 'lucide-react';

export const DepartmentQuotaModal = ({ isOpen, onClose }) => {
  const {
    departmentQuotas,
    updateDepartmentQuota,
    getDepartmentUsageThisMonth,
    lang,
    user,
  } = useStock();

  const [localQuotas, setLocalQuotas] = useState({ ...departmentQuotas });
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const departmentsList = Object.keys(localQuotas);

  const handleQuotaChange = (dept, value) => {
    const num = Math.max(0, parseInt(value, 10) || 0);
    setLocalQuotas(prev => ({ ...prev, [dept]: num }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    Object.entries(localQuotas).forEach(([dept, limit]) => {
      updateDepartmentQuota(dept, limit);
    });
    setSuccessMsg(lang === 'th' ? '🎉 บันทึกการตั้งค่าโควตาสำเร็จ!' : 'Quotas saved successfully!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <PieChart color="#4f46e5" size={22} />
            <div>
              <h2 className="font-extrabold text-base">
                {lang === 'th' ? 'จำกัดโควตาการเบิกประจำเดือนตามแผนก' : 'Department Monthly Requisition Quotas'}
              </h2>
              <p className="text-xxs text-muted mt-0.5">
                {lang === 'th' ? 'กำหนดจำนวนชิ้นสูงสุดที่แต่ละแผนกสามารถเบิกได้ในแต่ละเดือน' : 'Set maximum item limits per department per month'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            {successMsg && (
              <div className="alert-box alert-success mb-3 flex-center gap-2">
                <CheckCircle2 size={18} />
                <span className="font-bold text-xs">{successMsg}</span>
              </div>
            )}

            <div className="card p-3 mb-4" style={{ background: 'var(--bg-main)', border: '1px dashed var(--border-color)' }}>
              <div className="flex-center gap-2 text-xs text-secondary">
                <Info size={16} color="#6366f1" />
                <span>
                  {lang === 'th'
                    ? 'ระบบจะตรวจสอบยอดเบิกสะสมในเดือนปัจจุบันอัตโนมัติ (หากตั้งค่าโควตาเป็น 0 จะถือว่า "ไม่จำกัดจำนวนการเบิก ♾️")'
                    : 'System checks monthly usage automatically. (Setting quota to 0 means Unlimited requisition ♾️)'}
                </span>
              </div>
            </div>

            <div className="department-quota-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {departmentsList.map((dept) => {
                const limit = localQuotas[dept] !== undefined ? localQuotas[dept] : 0;
                const used = getDepartmentUsageThisMonth(dept);
                const isUnlimited = limit === 0;
                const percent = !isUnlimited && limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
                const isOver = !isUnlimited && used > limit;

                return (
                  <div
                    key={dept}
                    className="card p-3"
                    style={{
                      background: 'var(--bg-surface)',
                      border: isOver ? '1.5px solid #f87171' : '1px solid var(--border-color)',
                    }}
                  >
                    <div className="flex-between mb-2">
                      <div className="flex-center gap-2">
                        <Building size={16} color="#4f46e5" />
                        <span className="font-bold text-sm text-primary">{dept}</span>
                      </div>

                      <div className="flex-center gap-2">
                        <span className="text-xs text-muted">โควตา:</span>
                        <input
                          type="number"
                          min="0"
                          className="form-control font-mono font-bold text-center"
                          style={{ width: '75px', padding: '0.25rem 0.5rem', fontSize: '0.9rem' }}
                          value={limit}
                          onChange={(e) => handleQuotaChange(dept, e.target.value)}
                        />
                        <span className="text-xs text-muted">{isUnlimited ? '(ไม่จำกัด)' : 'ชิ้น/เดือน'}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex-between text-xxs text-muted mb-1">
                        <span>
                          เบิกไปแล้ว: <strong className={isOver ? 'text-red font-bold' : 'text-primary font-bold'}>{used}</strong> {isUnlimited ? 'ชิ้น (♾️ ไม่จำกัดการเบิก)' : `/ ${limit} ชิ้น (${percent}%)`}
                        </span>
                        {isUnlimited ? (
                          <span className="badge badge-success text-xxs font-bold">♾️ ไม่จำกัดโควตา</span>
                        ) : isOver ? (
                          <span className="text-red font-bold flex-center gap-1">
                            <AlertTriangle size={11} /> เกินโควตา {used - limit} ชิ้น
                          </span>
                        ) : (
                          <span>คงเหลือ {Math.max(0, limit - used)} ชิ้น</span>
                        )}
                      </div>

                      <div style={{ width: '100%', height: '7px', background: 'var(--bg-main)', borderRadius: '9999px', overflow: 'hidden' }}>
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
              })}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary font-bold flex-center gap-1.5">
              <Save size={16} />
              <span>{lang === 'th' ? 'บันทึกการตั้งค่าโควตา' : 'Save Quota Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
