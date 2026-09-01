import React, { useState, useRef } from 'react';
import { useStock, extractCleanUsername } from '../context/StockContext';
import {
  Boxes,
  Lock,
  User,
  Eye,
  EyeOff,
  Globe,
  Sun,
  Moon,
  ArrowRight,
  AlertCircle,
  Building,
  KeyRound,
  Shield,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  ChevronRight,
  Check,
  RefreshCw,
} from 'lucide-react';

const RECENT_LOGINS_KEY = 'stock_online_recent_logins_v1';

export const Login = () => {
  const { login, lang, toggleLang, theme, toggleTheme, requestersList = [], usersList = [] } = useStock();

  const [username, setUsername] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Device-specific Recent Accounts
  const [recentLogins, setRecentLogins] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_LOGINS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Duplicate Name Disambiguation State
  const [duplicateUsers, setDuplicateUsers] = useState(null);

  // Employee Directory Quick Search Modal State
  const [isDirectoryOpen, setIsDirectoryOpen] = useState(false);
  const [directorySearch, setDirectorySearch] = useState('');

  const passwordInputRef = useRef(null);

  // Helper to save recent login on this device
  const saveRecentLogin = (u) => {
    if (!u) return;
    try {
      const existing = JSON.parse(localStorage.getItem(RECENT_LOGINS_KEY) || '[]');
      const filtered = existing.filter(item => item.id !== u.id && item.username !== u.username);
      const updated = [
        {
          id: u.id,
          name: u.name,
          username: u.username,
          employeeCode: u.employeeCode,
          department: u.department,
          company: u.company,
          role: u.role,
          lastLoginAt: new Date().toISOString(),
        },
        ...filtered,
      ].slice(0, 6);
      setRecentLogins(updated);
      localStorage.setItem(RECENT_LOGINS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save recent login', e);
    }
  };

  const removeRecentLogin = (e, targetId, targetUsername) => {
    e.stopPropagation();
    const updated = recentLogins.filter(u => u.id !== targetId && u.username !== targetUsername);
    setRecentLogins(updated);
    try {
      localStorage.setItem(RECENT_LOGINS_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleSelectRecentUser = (r) => {
    const matched = usersList.find(
      (u) =>
        u.id === r.id ||
        (u.username && r.username && u.username.toLowerCase() === r.username.toLowerCase()) ||
        (u.employeeCode && r.employeeCode && u.employeeCode.toLowerCase() === r.employeeCode.toLowerCase())
    );
    setSelectedUser(matched || r);
    setUsername(r.name || r.username);
    setPassword('');
    setErrorMsg('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 120);
  };

  // Helper to check for duplicate names
  const checkDuplicateName = (inputName) => {
    if (!inputName || !inputName.trim()) return null;
    const clean = inputName.trim().toLowerCase();
    const normalized = extractCleanUsername(inputName).toLowerCase();

    const matches = usersList.filter((u) => {
      const uName = (u.name || '').toLowerCase();
      const uUsername = (u.username || '').toLowerCase();
      const uNorm = extractCleanUsername(u.name).toLowerCase();
      return (
        uName === clean ||
        uUsername === clean ||
        uUsername === normalized ||
        uNorm === normalized ||
        (normalized.length >= 2 && uNorm === normalized)
      );
    });

    return matches.length > 1 ? matches : null;
  };

  const handleUsernameBlur = () => {
    if (selectedUser) return;
    const dups = checkDuplicateName(username);
    if (dups) {
      setDuplicateUsers(dups);
    }
  };

  const handleSelectDuplicateUser = (targetUser) => {
    setSelectedUser(targetUser);
    setUsername(targetUser.name);
    setDuplicateUsers(null);
    setErrorMsg('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 150);
  };

  const handleClearSelectedUser = () => {
    setSelectedUser(null);
    setUsername('');
    setPassword('');
  };

  const handleSelectSystemUser = (sysUser, sysPwd) => {
    setSelectedUser(null);
    setUsername(sysUser);
    setPassword(sysPwd);
    setErrorMsg('');
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // If no specific user selected yet, check if name has duplicates
    if (!selectedUser) {
      const dups = checkDuplicateName(username);
      if (dups) {
        setDuplicateUsers(dups);
        return;
      }
    }

    try {
      const targetUserId = selectedUser ? selectedUser.id : null;
      const loggedInUser = await login(username, password, targetUserId);
      if (loggedInUser && loggedInUser.isDuplicate) {
        setDuplicateUsers(loggedInUser.duplicates);
        return;
      }

      if (loggedInUser) {
        saveRecentLogin(loggedInUser);
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="login-wrapper">
      {/* Top Header Toolbar */}
      <div className="login-topbar">
        <button className="topbar-btn" onClick={toggleLang}>
          <Globe size={16} />
          <span>{lang === 'th' ? 'TH 🇹🇭' : 'EN 🇬🇧'}</span>
        </button>

        <button className="topbar-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="login-card">
        <div className="login-header">
          <div className="flex-center mb-2">
            <img
              src="/logo.png"
              alt="EXION THAILAND"
              style={{
                height: '170px',
                width: 'auto',
                maxWidth: '320px',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
          <p className="login-subtitle mt-2" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {lang === 'th' ? 'ระบบจัดการคลังพัสดุและขอเบิกอุปกรณ์สำนักงาน' : 'Stock & Asset Management System'}
          </p>
        </div>

        {errorMsg && (
          <div className="alert-box alert-danger mb-4">
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          {/* Step 1: Selected User Identity Banner (If Selected) */}
          {selectedUser ? (
            <div className="selected-user-card card mb-3">
              <div className="flex-between">
                <div>
                  <div className="font-extrabold text-sm flex-center gap-1.5">
                    <span>{selectedUser.name}</span>
                    {selectedUser.employeeCode && (
                      <span className="badge badge-info text-xxs font-mono">{selectedUser.employeeCode}</span>
                    )}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    🏢 {selectedUser.department || selectedUser.company || 'EXION THAILAND'}
                  </div>
                </div>

                <button
                  type="button"
                  className="btn-change-user text-xs"
                  onClick={handleClearSelectedUser}
                  title="เปลี่ยนผู้ใช้งาน"
                >
                  <RefreshCw size={12} />
                  <span>{lang === 'th' ? 'เปลี่ยนคน' : 'Change'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Username Input */
            <div className="form-group mb-3">
              <label className="form-label">{lang === 'th' ? '1️⃣ ชื่อจริงผู้เบิก / รหัสพนักงาน' : '1️⃣ Name / Employee Code'}</label>
              <div className="input-icon-wrapper">
                <User size={18} className="input-icon" />
                <input
                  type="text"
                  className="form-control with-icon"
                  placeholder={lang === 'th' ? 'เช่น คุณสมชาย, คุณกิตติพงษ์, EMP-1001' : 'Enter name or EMP code...'}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onBlur={handleUsernameBlur}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const dups = checkDuplicateName(username);
                      if (dups) {
                        e.preventDefault();
                        setDuplicateUsers(dups);
                      }
                    }
                  }}
                  required
                />
              </div>
              <div className="text-xxs text-muted mt-1">
                {lang === 'th' ? '💡 หากชื่อซ้ำกัน ระบบจะเปิดหน้าต่างให้เลือกแผนกก่อนใส่รหัส' : 'If name is duplicated, system asks to choose department first'}
              </div>
            </div>
          )}

          {/* Step 2: Password Input */}
          <div className="form-group mb-3">
            <label className="form-label">{lang === 'th' ? '2️⃣ รหัสผ่าน (Password / PIN)' : '2️⃣ Password / PIN'}</label>
            <div className="input-icon-wrapper">
              <Lock size={18} className="input-icon" />
              <input
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                className="form-control with-icon"
                placeholder={lang === 'th' ? 'กรอกรหัสผ่าน (Password)...' : 'Password...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle-pwd-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Login Submit Button */}
          <button type="submit" className="btn btn-primary btn-login">
            <span>{lang === 'th' ? 'เข้าสู่ระบบ' : 'Sign In'}</span>
            <ArrowRight size={18} />
          </button>

          {/* Quick Shortcuts: Directory Search */}
          <div className="quick-action-shortcuts mt-3 pt-3 border-top">
            <button
              type="button"
              className="btn btn-secondary btn-sm w-full flex-center gap-2"
              style={{ padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px' }}
              onClick={() => setIsDirectoryOpen(true)}
            >
              <Users size={16} color="#4f46e5" />
              <span>{lang === 'th' ? '🔍 ค้นหารายชื่อพนักงานในระบบ (86 ท่าน)' : '🔍 Search Employee Directory'}</span>
            </button>
          </div>
        </form>

        {/* Recent Accounts on this Device */}
        {recentLogins.length > 0 && (
          <div className="quick-demo-section mt-4 pt-3 border-top">
            <div className="font-bold text-xs text-muted mb-2 flex-between">
              <div className="flex-center gap-1.5">
                <Users size={14} color="#6366f1" />
                <span>{lang === 'th' ? '🕒 บัญชีที่เคยเข้าในเครื่องนี้:' : 'Recent Accounts:'}</span>
              </div>
              <button
                type="button"
                className="btn-clear-recent"
                onClick={() => {
                  setRecentLogins([]);
                  localStorage.removeItem(RECENT_LOGINS_KEY);
                }}
                title={lang === 'th' ? 'ล้างประวัติเครื่องนี้' : 'Clear history'}
              >
                {lang === 'th' ? 'ล้างประวัติ' : 'Clear'}
              </button>
            </div>

            <div className="quick-chips-row">
              {recentLogins.map((r) => (
                <div
                  key={r.id || r.username}
                  className="recent-chip-wrap"
                  onClick={() => handleSelectRecentUser(r)}
                  title={`คลิกเพื่อเลือก ${r.name || r.username}`}
                >
                  <span className="recent-chip-name">
                    👤 {r.name || `@${r.username}`} {r.employeeCode ? `[${r.employeeCode}]` : ''}
                  </span>
                  <button
                    type="button"
                    className="recent-chip-remove"
                    onClick={(e) => removeRecentLogin(e, r.id, r.username)}
                    title={lang === 'th' ? 'ลบออกจากเครื่องนี้' : 'Remove'}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="login-footer">
          <span>EXION Office Asset Management &copy; 2026</span>
        </div>
      </div>

      {/* SEARCHABLE EMPLOYEE DIRECTORY MODAL */}
      {isDirectoryOpen && (
        <div className="modal-overlay" onClick={() => setIsDirectoryOpen(false)}>
          <div className="modal-content modal-md" onClick={(e) => e.stopPropagation()} style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="modal-header">
              <div className="modal-header-title">
                <Users size={22} color="#4f46e5" />
                <div>
                  <h2 className="font-extrabold text-base">
                    {lang === 'th' ? 'สมุดรายชื่อพนักงาน (Employee Directory)' : 'Employee Directory'}
                  </h2>
                  <div className="text-xs text-muted">
                    {lang === 'th' ? 'แตะที่ชื่อของคุณเพื่อนำเข้าสู่หน้า Log in ทันที' : 'Tap your name to select and login'}
                  </div>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsDirectoryOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', flex: 1, padding: '1rem' }}>
              <div className="search-bar mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder={lang === 'th' ? '🔍 พิมพ์ค้นหาชื่อ, รหัสพนักงาน, แผนก, หรือบริษัท...' : 'Search by name, code, dept...'}
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="directory-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {usersList
                  .filter((u) => {
                    if (u.role === 'admin') return false;
                    if (!directorySearch.trim()) return true;
                    const q = directorySearch.toLowerCase().trim();
                    return (
                      (u.name && u.name.toLowerCase().includes(q)) ||
                      (u.employeeCode && u.employeeCode.toLowerCase().includes(q)) ||
                      (u.department && u.department.toLowerCase().includes(q)) ||
                      (u.company && u.company.toLowerCase().includes(q))
                    );
                  })
                  .map((u) => (
                    <div
                      key={u.id}
                      className="card p-2.5"
                      style={{
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all 0.15s ease',
                        border: '1px solid var(--border-color)',
                      }}
                      onClick={() => {
                        setSelectedUser(u);
                        setUsername(u.name);
                        setPassword(u.password || '1234');
                        setIsDirectoryOpen(false);
                        setErrorMsg('');
                        setTimeout(() => {
                          passwordInputRef.current?.focus();
                        }, 120);
                      }}
                    >
                      <div>
                        <div className="font-extrabold text-sm flex-center gap-1.5 justify-start">
                          <span>{u.name}</span>
                          {u.employeeCode && (
                            <span className="badge badge-info text-xxs font-mono">{u.employeeCode}</span>
                          )}
                        </div>
                        <div className="text-xs text-muted mt-0.5">
                          🏢 {u.department || 'ทั่วไป'} • {u.company || 'EXION'}
                        </div>
                      </div>
                      <div className="btn btn-primary btn-xs flex-center gap-1">
                        <span>เลือก</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setIsDirectoryOpen(false)}>
                {lang === 'th' ? 'ปิด' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISAMBIGUATION MODAL: CHOOSE EMPLOYEE & DEPARTMENT BEFORE ENTERING PASSWORD */}
      {duplicateUsers && (
        <div className="modal-overlay" onClick={() => setDuplicateUsers(null)}>
          <div className="modal-content modal-md disambiguate-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header disambiguate-header">
              <div className="modal-header-title">
                <div className="disambiguate-icon-wrap">
                  <Users size={24} color="#ffffff" />
                </div>
                <div>
                  <h2 className="font-extrabold text-base text-white">
                    {lang === 'th' ? `🏢 พบชื่อ "${username}" ซ้ำกันในระบบ` : 'Multiple Accounts Found'}
                  </h2>
                  <div className="text-xs text-indigo-200">
                    {lang === 'th' ? 'กรุณาคลิกเลือกตัวตนและแผนกของคุณก่อนใส่รหัสผ่าน:' : 'Select your department before entering password:'}
                  </div>
                </div>
              </div>
              <button className="close-btn text-white" onClick={() => setDuplicateUsers(null)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="duplicate-instruction alert-box alert-info mb-3">
                <span className="text-xs">
                  {lang === 'th'
                    ? '👉 กรุณาแตะเลือกการ์ดข้อมูลที่เป็นตัวคุณ เพื่อให้ระบบล็อกอินเข้าแผนกและประวัติที่ถูกต้อง'
                    : 'Please select your department account below'}
                </span>
              </div>

              <div className="duplicate-users-list">
                {duplicateUsers.map((u) => (
                  <div
                    key={u.id}
                    className="duplicate-user-card card"
                    onClick={() => handleSelectDuplicateUser(u)}
                  >
                    <div className="dup-info">
                      <div className="font-extrabold text-sm text-primary flex-center gap-2">
                        <span>{u.name}</span>
                        {u.employeeCode && (
                          <span className="badge badge-info text-xxs font-mono">{u.employeeCode}</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-dark mt-1">
                        📁 {u.department || 'สำนักงานทั่วไป'}
                      </div>
                      <div className="text-xxs text-muted">
                        🏢 {u.company || 'EXION (THAILAND) COMPANY LIMITED'} {u.position ? ` • ${u.position}` : ''}
                      </div>
                    </div>
                    <div className="dup-action-arrow">
                      <div className="btn-select-chip">
                        <span>เลือก</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer flex-between">
              <button className="btn btn-secondary btn-sm" onClick={() => setDuplicateUsers(null)}>
                {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
              </button>
              <div className="text-xs text-muted">
                {lang === 'th' ? 'หรือพิมพ์รหัสพนักงาน (EMP Code) เพื่อล็อกอินโดยตรง' : 'Or use EMP code directly'}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .login-wrapper {
          min-height: 100vh;
          width: 100vw;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #0f172a 100%);
          position: relative;
          padding: 1.5rem;
        }

        .login-topbar {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          display: flex;
          gap: 0.75rem;
        }

        .topbar-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.45rem 0.85rem;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-full);
          color: #ffffff;
          font-family: var(--font-family);
          font-size: 0.82rem;
          cursor: pointer;
        }

        .login-card {
          width: 100%;
          max-width: 450px;
          background: var(--bg-surface);
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 2.25rem 2rem;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 1.5rem;
        }

        .login-logo {
          width: 56px;
          height: 56px;
          background: var(--primary-gradient);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.4);
          margin-bottom: 0.85rem;
        }

        .login-title {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--text-primary);
          letter-spacing: -0.03em;
        }

        .login-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .input-icon-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.85rem;
          color: var(--text-muted);
          pointer-events: none;
        }

        .form-control.with-icon {
          padding-left: 2.5rem;
        }

        .toggle-pwd-btn {
          position: absolute;
          right: 0.75rem;
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          display: flex;
          align-items: center;
        }

        .btn-login {
          width: 100%;
          padding: 0.8rem;
          font-size: 1rem;
          margin-top: 0.75rem;
          font-weight: 800;
        }

        .selected-user-card {
          padding: 0.75rem 1rem;
          background: #eef2ff;
          border: 1.5px solid #a5b4fc;
          border-radius: var(--radius-md);
        }

        .selected-avatar {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #6366f1;
        }

        .btn-change-user {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.3rem 0.6rem;
          border-radius: var(--radius-sm);
          background: #ffffff;
          border: 1px solid #c7d2fe;
          color: #4f46e5;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-change-user:hover {
          background: #e0e7ff;
        }

        .quick-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }

        .recent-chip-wrap {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.5rem 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
          user-select: none;
        }

        .recent-chip-wrap:hover {
          background: #eef2ff;
          color: #4f46e5;
          border-color: #c7d2fe;
          transform: translateY(-1px);
        }

        .recent-chip-name {
          line-height: 1.2;
        }

        .recent-chip-remove {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 2px;
          border-radius: 50%;
          transition: all 0.15s ease;
        }

        .recent-chip-remove:hover {
          background: #fecdd3;
          color: #e11d48;
        }

        .btn-clear-recent {
          background: none;
          border: none;
          color: var(--text-muted);
          font-size: 0.7rem;
          font-family: var(--font-family);
          cursor: pointer;
          text-decoration: underline;
          padding: 0;
        }

        .btn-clear-recent:hover {
          color: #e11d48;
        }

        .demo-chip-btn {
          padding: 0.35rem 0.75rem;
          border-radius: var(--radius-full);
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-secondary);
          font-family: var(--font-family);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .demo-chip-btn:hover {
          background: #eef2ff;
          color: var(--primary-600);
          border-color: #c7d2fe;
          transform: translateY(-1px);
        }

        .admin-chip { background: #ecfdf5; color: #059669; border-color: #a7f3d0; }
        .staff-chip { background: #eef2ff; color: #4f46e5; border-color: #c7d2fe; }

        .login-footer {
          margin-top: 1.75rem;
          text-align: center;
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        /* Disambiguation Modal */
        .disambiguate-modal {
          border: 2px solid #6366f1;
          box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
          overflow: hidden;
        }

        .disambiguate-header {
          background: linear-gradient(135deg, #312e81 0%, #4338ca 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
        }

        .disambiguate-icon-wrap {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-sm);
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .duplicate-users-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .duplicate-user-card {
          padding: 1rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          background: var(--bg-surface);
          transition: all 0.2s ease;
        }

        .duplicate-user-card:hover {
          border-color: #6366f1;
          background: #f8faff;
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .dup-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--primary-500);
        }

        .dup-info {
          flex: 1;
        }

        .btn-select-chip {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.4rem 0.8rem;
          border-radius: var(--radius-full);
          background: #eef2ff;
          color: #4f46e5;
          font-weight: 800;
          font-size: 0.78rem;
          border: 1px solid #c7d2fe;
        }

        .duplicate-user-card:hover .btn-select-chip {
          background: #6366f1;
          color: #ffffff;
          border-color: #6366f1;
        }

        .text-indigo-200 { color: #c7d2fe; }
      `}</style>
    </div>
  );
};
