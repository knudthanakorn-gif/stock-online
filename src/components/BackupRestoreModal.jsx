import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  Database,
  X,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  FileJson,
  AlertTriangle,
  Layers,
  Sparkles,
  Zap,
  Check,
} from 'lucide-react';

export const BackupRestoreModal = ({ isOpen, onClose }) => {
  const {
    exportSystemBackup,
    importSystemBackup,
    syncLocalToSupabase,
    resetToSampleData,
    loadSimulated500Data,
    products,
    requests,
    transactions,
    usersList,
    lang,
    user,
  } = useStock();

  const [restoreStatus, setRestoreStatus] = useState('');
  const [isSyncing, setIsSyncing] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSyncCloud = async () => {
    try {
      setIsSyncing(true);
      setErrorMsg('');
      await syncLocalToSupabase();
      setRestoreStatus(lang === 'th' ? '🎉 ซิงค์ข้อมูลทั้งหมดขึ้น Supabase Cloud สำเร็จ!' : 'Cloud sync successful!');
      setTimeout(() => setRestoreStatus(''), 4000);
    } catch (err) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการซิงค์ข้อมูล');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExport = () => {
    exportSystemBackup();
    setRestoreStatus(lang === 'th' ? '🎉 ดาวน์โหลดไฟล์สำรองข้อมูล (JSON) สำเร็จ!' : 'Backup exported successfully!');
    setTimeout(() => setRestoreStatus(''), 3500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setRestoreStatus('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (content) {
          importSystemBackup(content);
          setRestoreStatus(lang === 'th' ? '🎉 กู้คืนข้อมูลระบบสำเร็จสมบูรณ์!' : 'System data restored successfully!');
          setTimeout(() => {
            setRestoreStatus('');
            onClose();
          }, 1500);
        }
      } catch (err) {
        setErrorMsg(err.message || 'ไฟล์ Backup ไม่ถูกต้อง');
      }
    };
    reader.readAsText(file);
  };

  const handleSimulate500 = () => {
    if (window.confirm(lang === 'th' ? '⚡ ยืนยันการจำลองข้อมูลการใช้งานจริง 500+ รายการ (ธุรกรรม 509 รายการ, คำขอเบิก 261 คำขอ, พนักงาน 20 คน จาก 8 แผนก)?' : 'Load 500+ simulated enterprise records?')) {
      loadSimulated500Data();
      setRestoreStatus(lang === 'th' ? '🎉 โหลดข้อมูลจำลอง 500+ รายการเรียบร้อยสมบูรณ์!' : '500+ Simulated records loaded!');
      setTimeout(() => {
        setRestoreStatus('');
        onClose();
      }, 1500);
    }
  };

  const handleResetSample = () => {
    if (window.confirm(lang === 'th' ? '⚠️ ยืนยันการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้นตัวอย่าง (Sample Data) หรือไม่?' : 'Reset all data to default demo data?')) {
      resetToSampleData();
      setRestoreStatus(lang === 'th' ? '🎉 รีเซ็ตข้อมูลเป็นชุดตัวอย่างเริ่มต้นเรียบร้อย!' : 'Reset to sample data complete!');
      setTimeout(() => {
        setRestoreStatus('');
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <Database color="#4f46e5" size={22} />
            <div>
              <h2 className="font-extrabold text-base">
                {lang === 'th' ? 'สำรอง & กู้คืน & จำลองข้อมูล (Backup / Restore / Simulation)' : 'System Backup & Simulation'}
              </h2>
              <p className="text-xxs text-muted mt-0.5">
                {lang === 'th' ? 'ส่งออกข้อมูลเป็น JSON, กู้คืนระบบ, หรือจำลองข้อมูลใช้งานจริง 500+ รายการ' : 'Export backup JSON, restore, or simulate 500+ records'}
              </p>
            </div>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {restoreStatus && (
            <div className="alert-box alert-success mb-3 flex-center gap-2">
              <CheckCircle2 size={18} />
              <span className="font-bold text-xs">{restoreStatus}</span>
            </div>
          )}

          {errorMsg && (
            <div className="alert-box alert-danger mb-3 flex-center gap-2">
              <AlertCircle size={18} />
              <span className="font-bold text-xs">{errorMsg}</span>
            </div>
          )}

          {/* Current System Status Snapshot */}
          <div className="card p-3 mb-3" style={{ background: 'var(--bg-main)', border: '1px solid var(--border-color)' }}>
            <div className="text-xs font-bold text-slate-700 mb-2 flex-center gap-1.5">
              <Layers size={14} color="#6366f1" />
              <span>ภาพรวมข้อมูลในระบบปัจจุบัน:</span>
            </div>
            <div className="flex-between text-xs" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              <span>📦 สินค้า: <strong>{products.length} รายการ</strong></span>
              <span>📑 คำขอเบิก: <strong>{requests.length} คำขอ</strong></span>
              <span>🔄 ธุรกรรมสต็อก: <strong>{transactions.length} รายการ</strong></span>
              <span>👤 ผู้ใช้งาน: <strong>{usersList.length} บัญชี</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* 0. SYNC TO CLOUD */}
            <div
              className="card p-3 flex-between"
              style={{ background: 'rgba(79, 70, 229, 0.05)', border: '1.5px solid #6366f1' }}
            >
              <div>
                <div className="font-bold text-sm text-primary mb-0.5 flex-center gap-1.5">
                  <Zap size={16} color="#4f46e5" />
                  <span>ซิงค์ข้อมูลขึ้น Supabase Cloud ทันที</span>
                </div>
                <div className="text-xxs text-muted">
                  ส่งรายการสินค้า, รายชื่อพนักงาน, และประวัติที่มีในเครื่องนี้ขึ้นฐานข้อมูล Supabase กลาง
                </div>
              </div>
              <button
                className="btn btn-primary font-bold btn-sm flex-center gap-1"
                onClick={handleSyncCloud}
                disabled={isSyncing}
              >
                <Zap size={14} />
                <span>{isSyncing ? 'กำลังซิงค์...' : 'ซิงค์ขึ้น Cloud'}</span>
              </button>
            </div>
            <div
              className="card p-3 flex-between"
              style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)' }}
            >
              <div>
                <div className="font-bold text-sm text-primary mb-0.5 flex-center gap-1.5">
                  <Download size={16} />
                  <span>1. สำรองข้อมูลทั้งหมด (Export Backup JSON)</span>
                </div>
                <div className="text-xxs text-muted">
                  ดาวน์โหลดไฟล์ `.json` ที่รวมข้อมูลสินค้า, คำขอเบิก, ผู้ใช้งาน, และประวัติทั้งหมด
                </div>
              </div>
              <button className="btn btn-secondary font-bold btn-sm flex-center gap-1" onClick={handleExport}>
                <Download size={14} />
                <span>สำรองข้อมูล</span>
              </button>
            </div>

            {/* 2. RESTORE BACKUP */}
            <div
              className="card p-3 flex-between"
              style={{ background: 'var(--bg-surface)', border: '1.5px solid var(--border-color)' }}
            >
              <div>
                <div className="font-bold text-sm text-primary mb-0.5 flex-center gap-1.5">
                  <Upload size={16} />
                  <span>2. กู้คืนข้อมูลระบบ (Restore Backup JSON)</span>
                </div>
                <div className="text-xxs text-muted">
                  เลือกไฟล์สำรองข้อมูล `.json` ที่เคยดาวน์โหลดไว้เพื่อกู้คืนระบบ
                </div>
              </div>
              <label className="btn btn-secondary font-bold btn-sm cursor-pointer flex-center gap-1">
                <Upload size={14} />
                <span>เลือกไฟล์สำรอง</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
              </label>
            </div>

            {/* 3. RESET TO DEMO */}
            <div
              className="card p-3 flex-between"
              style={{ background: 'rgba(239, 68, 68, 0.03)', border: '1px dashed #f87171' }}
            >
              <div>
                <div className="font-bold text-sm text-red mb-0.5 flex-center gap-1.5">
                  <RotateCcw size={15} />
                  <span>3. ล้างและรีเซ็ตระบบ (Reset Demo)</span>
                </div>
                <div className="text-xxs text-muted">
                  คืนค่าระบบเริ่มต้น สำหรับการทดสอบใหม่
                </div>
              </div>
              <button className="btn btn-outline btn-xs font-bold text-red" onClick={handleResetSample}>
                รีเซ็ตข้อมูล
              </button>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            {lang === 'th' ? 'ปิดหน้าต่าง' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
