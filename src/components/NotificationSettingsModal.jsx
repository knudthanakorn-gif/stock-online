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

            {/* LINE Notify Token Section */}
            <div className="form-group mb-3">
              <label className="form-label font-bold text-xs flex-between">
                <span>💬 LINE Notify Token (สำหรับส่งเข้ากลุ่ม LINE แผนก/คลัง)</span>
                <span className="text-xxs text-primary font-normal">ฟรีไม่มีค่าใช้จ่าย</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  className="form-control font-mono"
                  placeholder="วาง LINE Notify Token ที่นี่ (เช่น 1a2b3c4d...)"
                  value={formData.lineNotifyToken || ''}
                  onChange={(e) => setFormData({ ...formData, lineNotifyToken: e.target.value })}
                />
              </div>
              <div className="text-xxs text-muted mt-1">
                สร้าง Token ได้ที่ <a href="https://notify-bot.line.me" target="_blank" rel="noreferrer" style={{ color: '#4f46e5', textDecoration: 'underline' }}>notify-bot.line.me</a> แล้วนำ Token มาใส่ในช่องนี้
              </div>
            </div>

            {/* Discord / Custom Webhook */}
            <div className="form-group mb-4">
              <label className="form-label font-bold text-xs">
                🌐 Discord / Custom Webhook URL (ทางเลือกเพิ่มเติม)
              </label>
              <input
                type="url"
                className="form-control font-mono text-xs"
                placeholder="https://discord.com/api/webhooks/... หรือ Webhook URL อื่นๆ"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyNewReq}
                    onChange={(e) => setFormData({ ...formData, notifyNewReq: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>📑 แจ้งเตือนเมื่อมีคำขอเบิกอุปกรณ์ใหม่ (New Requisition)</span>
                </label>

                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyApproval}
                    onChange={(e) => setFormData({ ...formData, notifyApproval: e.target.checked })}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <span>✅ แจ้งเตือนผลการอนุมัติ / ไม่อนุมัติคำขอ (Approval Decision)</span>
                </label>

                <label className="flex-center gap-2 cursor-pointer text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={formData.notifyLowStock}
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
