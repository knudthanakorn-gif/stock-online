import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  Bell,
  X,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Key,
  Globe,
  Sliders,
} from 'lucide-react';

export const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const {
    notificationSettings,
    updateNotificationSettings,
    sendTestNotification,
    lang,
  } = useStock();

  const [formData, setFormData] = useState({ ...notificationSettings });
  const [testResult, setTestResult] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateNotificationSettings(formData);
    setSuccessMsg(lang === 'th' ? '🎉 บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อย!' : 'Notification settings saved!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleTest = (channel) => {
    sendTestNotification(channel);
    setTestResult(
      lang === 'th'
        ? `✅ ส่งข้อความทดสอบ ${channel} สำเร็จ! ตรวจสอบได้ที่กระดิ่งแจ้งเตือน`
        : `Test notification sent via ${channel}!`
    );
    setTimeout(() => setTestResult(''), 4000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <Bell color="#4f46e5" size={22} />
            <div>
              <h2 className="font-extrabold text-base">
                {lang === 'th' ? 'ตั้งค่าการแจ้งเตือน (LINE Notify & Webhook)' : 'Notification Settings'}
              </h2>
              <p className="text-xxs text-muted mt-0.5">
                {lang === 'th' ? 'กำหนดช่องทางการแจ้งเตือนอัตโนมัติเมื่อมีคำขอเบิกหรือสินค้าใกล้หมด' : 'Configure automated alerts for requisitions and low stock'}
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

            {testResult && (
              <div className="alert-box alert-success mb-3 flex-center gap-2">
                <CheckCircle2 size={18} />
                <span className="font-bold text-xs">{testResult}</span>
              </div>
            )}

            {/* Staff Notification Email Section */}
            <div className="form-group mb-3">
              <label className="form-label font-bold text-xs flex-between">
                <span>📧 อีเมลเจ้าหน้าที่คลัง (Staff Notification Emails)</span>
                <span className="text-xxs text-primary font-normal">รับแจ้งเตือนคำขอเบิกใหม่</span>
              </label>
              <input
                type="text"
                className="form-control font-mono text-xs"
                placeholder="ระบุอีเมลเจ้าหน้าที่คลัง เช่น warehouse@company.com, admin@company.com"
                value={formData.staffNotificationEmail || ''}
                onChange={(e) => setFormData({ ...formData, staffNotificationEmail: e.target.value })}
              />
              <div className="text-xxs text-muted mt-1">
                เมื่อพนักงานกดยื่นเบิกของ ระบบจะส่งอีเมลแจ้งเตือนไปยังอีเมลที่ระบุในช่องนี้ทันที
              </div>
            </div>

            {/* Discord / Custom Webhook */}
            <div className="form-group mb-4">
              <label className="form-label font-bold text-xs flex-between">
                <span>🌐 Webhook URL / Google Apps Script / Discord (ทางเลือกเพิ่มเติม)</span>
                <span className="text-xxs text-muted font-normal">ส่งเข้ากลุ่ม LINE / Discord</span>
              </label>
              <input
                type="url"
                className="form-control font-mono text-xs"
                placeholder="https://script.google.com/macros/s/... หรือ Discord Webhook"
                value={formData.webhookUrl || ''}
                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
              />
            </div>

            {/* Event Toggles */}
            <div className="card p-3 mb-4" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
              <div className="font-bold text-xs text-primary mb-2 flex-center gap-1.5">
                <Sliders size={14} />
                <span>เหตุการณ์ที่ต้องการให้ส่งแจ้งเตือน:</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyNewReq !== false}
                    onChange={(e) => setFormData({ ...formData, notifyNewReq: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>📑 แจ้งเตือนเมื่อมีคำขอเบิกอุปกรณ์ใหม่ (ส่งหา Staff)</span>
                </label>

                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyApproval !== false}
                    onChange={(e) => setFormData({ ...formData, notifyApproval: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>🔵 แจ้งเตือนเมื่ออนุมัติคำขอ & กำลังจัดของ (ส่งหา User)</span>
                </label>

                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyEmailReadyForPickup !== false}
                    onChange={(e) => setFormData({ ...formData, notifyEmailReadyForPickup: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>🎁 แจ้งเตือนเมื่อเตรียมของเสร็จแล้ว ให้มารับพัสดุ (ส่งหา User)</span>
                </label>

                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyLowStock !== false}
                    onChange={(e) => setFormData({ ...formData, notifyLowStock: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>⚠️ แจ้งเตือนเมื่อสินค้าลดลงต่ำกว่าเกณฑ์ขั้นต่ำ (Low Stock Alert)</span>
                </label>
              </div>
            </div>

            {/* Test Notification Trigger */}
            <div className="flex-between">
              <span className="text-xs text-muted font-semibold">ทดสอบระบบแจ้งเตือน:</span>
              <div className="flex-center gap-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-xs font-bold flex-center gap-1"
                  onClick={() => handleTest('In-App & LINE')}
                >
                  <Send size={12} />
                  <span>ทดสอบส่งข้อความแจ้งเตือน</span>
                </button>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </button>
            <button type="submit" className="btn btn-primary font-bold">
              {lang === 'th' ? 'บันทึกการตั้งค่า' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
