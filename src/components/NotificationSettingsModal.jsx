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
  Loader2,
} from 'lucide-react';

export const NotificationSettingsModal = ({ isOpen, onClose }) => {
  const {
    notificationSettings,
    updateNotificationSettings,
    sendTestNotification,
    lang,
    user,
  } = useStock();

  const [formData, setFormData] = useState({ ...notificationSettings });
  const [testResult, setTestResult] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen || user?.role !== 'admin') return null;

  const handleSave = (e) => {
    e.preventDefault();
    updateNotificationSettings(formData);
    setSuccessMsg(lang === 'th' ? '🎉 บันทึกการตั้งค่าการแจ้งเตือนเรียบร้อย!' : 'Notification settings saved!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  const handleTest = async (channel) => {
    setIsTesting(true);
    setTestResult(lang === 'th' ? '⏳ กำลังส่งข้อความทดสอบ...' : 'Sending test...');
    try {
      const res = await sendTestNotification(channel, formData);
      if (res) {
        setTestResult(
          lang === 'th'
            ? `✅ ส่งข้อความทดสอบสำเร็จ! ไปยัง ${formData.staffNotificationEmail || 'อีเมลคลัง'} (กรุณาเช็คใน Outlook / Junk Email)`
            : `Test notification sent successfully!`
        );
      } else {
        setTestResult(
          lang === 'th'
            ? `❌ ส่งไม่สำเร็จ กรุณาตรวจสอบ Webhook URL หรือการตั้งค่าอีเมล`
            : `Failed to send test notification.`
        );
      }
    } catch (err) {
      setTestResult(`❌ ข้อผิดพลาด: ${err.message || 'ส่งไม่สำเร็จ'}`);
    } finally {
      setIsTesting(false);
      setTimeout(() => setTestResult(''), 7000);
    }
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
            <div className="card p-3 mb-4 flex-between gap-3" style={{ background: 'var(--bg-main)', border: '1px dashed var(--border-color)', borderRadius: '10px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block truncate">
                  {lang === 'th' ? 'ทดสอบระบบแจ้งเตือนทางอีเมล' : 'Test Email Alert'}
                </span>
                <span className="text-xxs text-muted block mt-0.5 truncate" title={formData.staffNotificationEmail || 'tks@pdflowtech.com'}>
                  {lang === 'th' ? `ส่งไปยัง: ${formData.staffNotificationEmail || 'tks@pdflowtech.com'}` : `Send to: ${formData.staffNotificationEmail || 'Staff'}`}
                </span>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-xs font-bold flex-center gap-1.5 flex-shrink-0"
                onClick={() => handleTest('Email & Webhook')}
                disabled={isTesting}
                style={{ padding: '8px 16px', borderRadius: '8px', minWidth: '135px' }}
              >
                {isTesting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{isTesting ? (lang === 'th' ? 'กำลังส่ง...' : 'Sending...') : (lang === 'th' ? '✈ ทดสอบส่งอีเมล' : 'Test Send Email')}</span>
              </button>
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
