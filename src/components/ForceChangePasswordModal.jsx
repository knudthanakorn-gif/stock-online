import React, { useState } from 'react';
import { useStock } from '../context/StockContext';
import {
  ShieldAlert,
  Lock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  User,
  Building,
} from 'lucide-react';

export const ForceChangePasswordModal = () => {
  const { user, changeUserPassword, logout, lang } = useStock();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!user || !user.mustChangePassword) {
    return null;
  }

  // Real-time Validations
  const is4Digits = /^\d{4}$/.test(newPassword);
  const isNot1234 = newPassword !== '1234' && newPassword !== '';
  const isMatch = newPassword === confirmPassword && confirmPassword !== '';
  const isValidForm = is4Digits && isNot1234 && isMatch;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!is4Digits) {
      setErrorMsg(lang === 'th' ? 'รหัสผ่านใหม่ต้องเป็นตัวเลข 4 หลักเท่านั้น (0000-9999)' : 'Password must be exactly 4 digits');
      return;
    }

    if (newPassword === '1234') {
      setErrorMsg(lang === 'th' ? 'ห้ามใช้รหัสผ่าน 1234 กรุณากำหนดเลขใหม่อื่น' : 'Password cannot be 1234');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg(lang === 'th' ? 'รหัสผ่านทั้งสองช่องไม่ตรงกัน' : 'Passwords do not match');
      return;
    }

    try {
      changeUserPassword(user.id, newPassword);
      setIsSuccess(true);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="modal-overlay force-pwd-overlay">
      <div className="modal-content modal-md force-pwd-card" onClick={(e) => e.stopPropagation()}>
        {/* Fixed Header */}
        <div className="modal-header force-pwd-header">
          <div className="modal-header-title">
            <div className="force-pwd-icon">
              <KeyRound size={22} color="#ffffff" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white">
                {lang === 'th' ? '🔒 กำหนดรหัสผ่านใหม่ (เข้าใช้งานครั้งแรก)' : 'Set New 4-Digit Password'}
              </h2>
              <div className="text-xxs text-indigo-200">
                {lang === 'th' ? 'First Login Security Verification' : 'First Login Security'}
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="force-pwd-form">
          <div className="modal-body force-pwd-body">
            {/* Compact User Profile Summary */}
            <div className="user-login-info-box card mb-3">
              <div className="user-info-text">
                <div className="font-bold text-xs flex-center gap-1.5">
                  <span>{user.name}</span>
                  {user.employeeCode && (
                    <span className="badge badge-info text-xxs font-mono">{user.employeeCode}</span>
                  )}
                </div>
                <div className="text-xxs text-muted mt-0.5">
                  🏢 {user.department || user.company || 'EXION THAILAND'}
                </div>
              </div>
            </div>

            {/* Compact Notice */}
            <div className="alert-box alert-warning mb-3 py-2 px-3">
              <ShieldAlert size={16} className="flex-shrink-0" />
              <span className="text-xxs">
                {lang === 'th'
                  ? 'เพื่อความปลอดภัย กรุณาเปลี่ยนรหัสผ่านเริ่มต้นเป็นเลข 4 หลักใหม่ (⚠️ ห้ามใช้เลข 1234)'
                  : 'Please create a new 4-digit PIN. (1234 is not allowed)'}
              </span>
            </div>

            {errorMsg && (
              <div className="alert-box alert-danger mb-3 py-2 px-3">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span className="text-xs">{errorMsg}</span>
              </div>
            )}

            {isSuccess && (
              <div className="alert-box alert-success mb-3 py-2 px-3">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                <span className="text-xs">{lang === 'th' ? '🎉 บันทึกรหัสผ่านใหม่เรียบร้อยแล้ว!' : 'Password updated successfully!'}</span>
              </div>
            )}

            {/* Input 1: New Password */}
            <div className="form-group mb-2">
              <label className="form-label text-xxs font-bold">
                1️⃣ {lang === 'th' ? 'รหัสผ่านใหม่ (ตัวเลข 4 หลัก) *' : 'New 4-Digit Password *'}
              </label>
              <div className="pwd-input-wrap">
                <Lock size={16} className="pwd-icon-inside" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  className="form-control pwd-pin-input font-mono font-bold text-center"
                  placeholder="••••"
                  value={newPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setNewPassword(val);
                  }}
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="btn-pwd-eye"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Input 2: Confirm Password */}
            <div className="form-group mb-3">
              <label className="form-label text-xxs font-bold">
                2️⃣ {lang === 'th' ? 'ยืนยันรหัสผ่านใหม่อีกครั้ง (ตัวเลข 4 หลัก) *' : 'Confirm 4-Digit Password *'}
              </label>
              <div className="pwd-input-wrap">
                <Lock size={16} className="pwd-icon-inside" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  className="form-control pwd-pin-input font-mono font-bold text-center"
                  placeholder="••••"
                  value={confirmPassword}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setConfirmPassword(val);
                  }}
                  required
                />
              </div>
            </div>

            {/* Live Security Checklist */}
            <div className="pwd-rules-checklist card bg-main p-2">
              <div className="font-bold text-xxs text-muted uppercase mb-1">เงื่อนไขรหัสผ่าน:</div>
              <div className={`rule-item ${is4Digits ? 'rule-pass' : ''}`}>
                <span className="rule-dot">{is4Digits ? '✓' : '•'}</span>
                <span>ต้องเป็นตัวเลข 4 หลัก (0000-9999)</span>
              </div>
              <div className={`rule-item ${isNot1234 ? 'rule-pass' : newPassword === '1234' ? 'rule-fail' : ''}`}>
                <span className="rule-dot">{isNot1234 ? '✓' : newPassword === '1234' ? '✕' : '•'}</span>
                <span>ห้ามใช้รหัสผ่าน <strong>1234</strong></span>
              </div>
              <div className={`rule-item ${isMatch ? 'rule-pass' : ''}`}>
                <span className="rule-dot">{isMatch ? '✓' : '•'}</span>
                <span>รหัสผ่านทั้งสองช่องตรงกัน</span>
              </div>
            </div>
          </div>

          {/* Sticky Always-Visible Footer */}
          <div className="modal-footer force-pwd-footer flex-between">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={logout}
            >
              <LogOut size={15} />
              <span>{lang === 'th' ? 'ออกจากระบบ' : 'Logout'}</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary font-bold"
              disabled={!isValidForm}
            >
              <CheckCircle2 size={16} />
              <span>{lang === 'th' ? 'บันทึกรหัสผ่านและเริ่มใช้งาน' : 'Save & Continue'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .force-pwd-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(15, 23, 42, 0.88);
          backdrop-filter: blur(10px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          overflow-y: auto;
        }

        .force-pwd-card {
          width: 100%;
          max-width: 440px;
          max-height: 92vh;
          display: flex;
          flex-direction: column;
          border: 2px solid #6366f1;
          border-radius: var(--radius-lg);
          background: var(--bg-surface);
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          animation: scaleUp 0.2s ease;
        }

        .force-pwd-header {
          flex-shrink: 0;
          background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          padding: 0.85rem 1.25rem;
        }

        .force-pwd-icon {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .force-pwd-form {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-height: 0;
          overflow: hidden;
        }

        .force-pwd-body {
          flex: 1;
          overflow-y: auto;
          padding: 1rem 1.25rem;
          max-height: calc(92vh - 120px);
        }

        .force-pwd-footer {
          flex-shrink: 0;
          background: var(--bg-surface);
          border-top: 1px solid var(--border-color);
          padding: 0.85rem 1.25rem;
        }

        .user-login-info-box {
          padding: 0.6rem 0.85rem;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
        }

        .user-thumb-avatar {
          width: 34px;
          height: 34px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-500);
        }

        .pwd-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }

        .pwd-icon-inside {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .pwd-pin-input {
          font-size: 1.25rem;
          letter-spacing: 0.35em;
          padding: 0.45rem 2.5rem;
          height: 42px;
        }

        .btn-pwd-eye {
          position: absolute;
          right: 0.75rem;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
        }

        .pwd-rules-checklist {
          border-radius: var(--radius-sm);
          font-size: 0.72rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .rule-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          color: var(--text-muted);
          transition: color 0.15s ease;
        }

        .rule-item.rule-pass {
          color: #059669;
          font-weight: 700;
        }

        .rule-item.rule-fail {
          color: #e11d48;
          font-weight: 700;
        }

        .rule-dot {
          width: 15px;
          height: 15px;
          border-radius: 50%;
          background: var(--border-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 0.65rem;
        }

        .rule-pass .rule-dot {
          background: #ecfdf5;
          color: #059669;
        }

        .rule-fail .rule-dot {
          background: #fef2f2;
          color: #e11d48;
        }

        .text-xxs { font-size: 0.7rem; }
        .text-indigo-200 { color: #c7d2fe; }
      `}</style>
    </div>
  );
};
