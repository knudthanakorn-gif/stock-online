import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import {
  mapProductFromDb,
  mapProductToDb,
  mapSupplierFromDb,
  mapSupplierToDb,
  mapCategoryFromDb,
  mapCategoryToDb,
  mapRequesterFromDb,
  mapRequesterToDb,
  mapUserFromDb,
  mapUserToDb,
  mapTransactionFromDb,
  mapTransactionToDb,
  mapRequestFromDb,
  mapRequestToDb,
  mapNotificationFromDb,
  mapNotificationToDb,
} from '../services/supabaseService';
import {
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_REQUESTERS,
  INITIAL_REQUESTS,
} from '../data/initialData';

const StockContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'stock_online_products_v1',
  CATEGORIES: 'stock_online_categories_v1',
  SUPPLIERS: 'stock_online_suppliers_v1',
  TRANSACTIONS: 'stock_online_transactions_v1',
  USERS_LIST: 'stock_online_users_list_v1',
  REQUESTERS_LIST: 'stock_online_requesters_list_v1',
  REQUESTS: 'stock_online_requests_v1',
  THEME: 'stock_online_theme',
  LANG: 'stock_online_lang',
  AUTH_USER: 'stock_online_user_v1',
  NOTIFICATIONS: 'stock_online_notifications_v1',
  NOTIF_SETTINGS: 'stock_online_notif_settings_v1',
  DEPT_QUOTAS: 'stock_online_dept_quotas_v1',
};

const DEFAULT_DEPARTMENT_QUOTAS = {
  'Application Engineer E&I': 0,
  'Application Engineer SI': 0,
  'Documentaion Controller': 0,
  'Electrical-Instrument & System Indicator': 0,
  'Eltherm Product': 0,
  'Finance and Accounting': 0,
  'HR': 0,
  'IT': 0,
  'Management': 0,
  'Marketing': 0,
  'Procurement & Logistic': 0,
  'Product Specialist (E&I)': 0,
  'Pump': 0,
  'Purchasing & Logistic': 0,
  'Safety': 0,
  'Sales Coordinator Admin': 0,
  'Sales Coordinator E&I': 0,
  'Sales Coordinator Pump': 0,
  'Sales E&I': 0,
  'Sales Engineer': 0,
  'Sales SI': 0,
  'Service': 0,
  'VIP': 0,
  'Valves & Rotating Pump': 0,
};

const DEFAULT_NOTIF_SETTINGS = {
  lineNotifyToken: '',
  webhookUrl: '',
  notifyNewReq: true,
  notifyApproval: true,
  notifyLowStock: true,
};

const VALID_ROLES = ['admin', 'staff', 'user', 'viewer'];
const sanitizeRole = (role) => VALID_ROLES.includes(role) ? role : 'user';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    type: 'NEW_REQUEST',
    title: 'มีคำขอเบิกอุปกรณ์ใหม่',
    message: 'คุณกิตติศักดิ์ ส่งคำขอเบิก "ปากกาไวท์บอร์ด 2 ด้าม"',
    linkTab: 'approvals',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    read: false,
  },
  {
    id: 'notif-2',
    type: 'LOW_STOCK',
    title: '⚠️ สินค้าใกล้หมดสต็อก',
    message: 'กระดาษ A4 Double A เหลือ 3 รีม (ต่ำกว่าเกณฑ์ขั้นต่ำ 5 รีม)',
    linkTab: 'inventory',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    read: false,
  },
];

const INITIAL_USERS = [
  {
    id: 'usr-1',
    username: 'admin',
    password: '123',
    name: 'ผู้ดูแลระบบ (Admin)',
    role: 'admin',
    company: 'EXION (THAILAND) COMPANY LIMITED',
    department: 'Management',
    position: 'System Administrator',
    email: 'admin@stockonline.co.th',
    phone: '081-111-2233',
    avatar: null,
    status: 'active',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
  },
];

// Helper to strip Thai & English prefixes and keep ONLY the first name for username
export const extractCleanUsername = (fullName) => {
  if (!fullName) return '';
  let clean = fullName.trim();
  clean = clean.replace(
    /^(mrs\.|mrs|miss|mr\.|mr|ms\.|ms|dr\.|dr|prof\.|prof|นางสาว|น\.ส\.|นาย|นาง|คุณ|ดร\.|ดร|ผศ\.|รศ\.|ศ\.|อาจารย์|นพ\.|พญ\.)\s*/i,
    ''
  );
  clean = clean.trim();
  const parts = clean.split(/\s+/);
  return parts[0] || clean;
};

export const REMOVED_COMPANIES = ['c.s.i', 'csi', 'osa', 'tri-gen', 'trigen'];

export const isRemovedCompany = (comp = '', code = '', id = '') => {
  const c = String(comp || '').toLowerCase();
  const cd = String(code || id || '').toUpperCase();
  return (
    REMOVED_COMPANIES.some((removed) => c.includes(removed)) ||
    cd.startsWith('CSI') ||
    cd.startsWith('OSA') ||
    cd.startsWith('TRI')
  );
};

// Helper to sanitize company name
export const sanitizeCompany = (comp) => {
  if (!comp) return 'EXION (Thailand) Company Limited';
  const trimmed = comp.trim();
  if (trimmed === 'บริษัท Hop' || trimmed === 'Company Hop' || trimmed === 'Hop') {
    return 'HOUSE OF PROFESSIONALS COMPANY LIMITED';
  }
  if (/^pd\s*flow/i.test(trimmed)) {
    return 'PD FLOWTECH COMPANY LIMITED';
  }
  if (/^house\s*of/i.test(trimmed)) {
    return 'HOUSE OF PROFESSIONALS COMPANY LIMITED';
  }
  if (/^exion/i.test(trimmed)) {
    return 'EXION (Thailand) Company Limited';
  }
  return trimmed;
};

// Helper to generate User account for a requester
export const generateRequesterUser = (requester, index = 0) => {
  const rawName = (requester.name || '').trim();
  const cleanUsername = extractCleanUsername(rawName) || requester.employeeCode || `user_${index + 1}`;
  const empCode = requester.employeeCode || `EMP-${1001 + index}`;
  return {
    id: `usr-req-${requester.id || empCode}`,
    employeeCode: empCode,
    username: cleanUsername,
    name: rawName,
    password: '1234',
    role: 'user',
    company: sanitizeCompany(requester.company),
    department: requester.department || '',
    position: requester.position || '',
    avatar: null,
    status: 'active',
    mustChangePassword: true,
    createdAt: new Date().toISOString(),
  };
};

export const StockProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  });

  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.LANG) || 'th';
  });

  // Current active user (defaults to null so Login page is shown by default)
  const [user, setUser] = useState(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('action=login')) {
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
      return null;
    }
    const saved = localStorage.getItem(STORAGE_KEYS.USER) || localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          (parsed.username === 'director' ||
            parsed.role === 'director' ||
            (parsed.name && parsed.name.includes('สมเกียรติ')))
        ) {
          return null;
        }
        if (parsed && parsed.id && parsed.name) {
          return {
            ...parsed,
            company: sanitizeCompany(parsed.company),
          };
        }
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Requesters Directory List
  const [requestersList, setRequestersList] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTERS_LIST);
    if (saved) {
      try {
        const rawParsed = JSON.parse(saved);
        if (Array.isArray(rawParsed) && rawParsed.length > 0) {
          return rawParsed
            .filter(
              r =>
                r.name !== 'ดร.สมเกียรติ ยิ่งเจริญ' &&
                !(r.name && r.name.includes('สมเกียรติ')) &&
                !isRemovedCompany(r.company, r.employeeCode, r.id)
            )
            .map(r => ({
              ...r,
              company: sanitizeCompany(r.company),
            }));
        }
      } catch (e) {
        console.error('Failed to parse saved requestersList:', e);
      }
    }
    return INITIAL_REQUESTERS.filter(
      r =>
        !(r.name && r.name.includes('สมเกียรติ')) &&
        !isRemovedCompany(r.company, r.employeeCode, r.id)
    ).map(r => ({
      ...r,
      company: sanitizeCompany(r.company),
    }));
  });

  // Users Directory List (Synced with the latest Requesters Directory list)
  const [usersList, setUsersList] = useState(() => {
    // 1. Get the actual current requesters list from localStorage or initial data
    let currentRequesters = INITIAL_REQUESTERS;
    const savedReqs = localStorage.getItem(STORAGE_KEYS.REQUESTERS_LIST);
    if (savedReqs) {
      try {
        const parsedReqs = JSON.parse(savedReqs);
        if (Array.isArray(parsedReqs) && parsedReqs.length > 0) {
          currentRequesters = parsedReqs
            .filter(
              r => r.name !== 'ดร.สมเกียรติ ยิ่งเจริญ' && !(r.name && r.name.includes('สมเกียรติ'))
            )
            .map(r => ({ ...r, company: sanitizeCompany(r.company) }));
        }
      } catch (e) {
        console.error('Failed to parse saved requesters in usersList:', e);
      }
    }

    // 2. Generate user accounts for all current requesters
    const requesterUsers = currentRequesters.map((r, i) => generateRequesterUser(r, i));
    const allExpectedUsers = [...INITIAL_USERS, ...requesterUsers];

    // 3. Load saved user passwords / status if any
    const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
    if (savedUsers) {
      try {
        const rawParsed = JSON.parse(savedUsers);
        if (Array.isArray(rawParsed)) {
          const legacyIds = new Set(['usr-2', 'usr-3', 'usr-4']);
          const legacyUsernames = new Set(['staff', 'viewer', 'director']);

          const filtered = rawParsed.filter(u => {
            if (!u || !u.id) return false;
            if (legacyIds.has(u.id)) return false;
            if (legacyUsernames.has((u.username || '').toLowerCase())) return false;
            if (u.role === 'director') return false;
            if (u.name && u.name.includes('สมเกียรติ')) return false;
            return true;
          });

          const savedMap = new Map();
          filtered.forEach(u => {
            if (u.id) savedMap.set(u.id, u);
            if (u.employeeCode) savedMap.set(u.employeeCode.toLowerCase(), u);
            if (u.name) savedMap.set(u.name.toLowerCase(), u);
            if (u.username) savedMap.set(u.username.toLowerCase(), u);
          });

          // Merge each expected user with saved data (keeping custom passwords/avatar/status)
          return allExpectedUsers.map(initU => {
            const existing =
              savedMap.get(initU.id) ||
              (initU.employeeCode && savedMap.get(initU.employeeCode.toLowerCase())) ||
              savedMap.get(initU.name.toLowerCase()) ||
              savedMap.get(initU.username.toLowerCase());

            if (existing) {
              const isAdmin = initU.id === 'usr-1' || initU.username === 'admin';
              const cleanUsername = isAdmin ? 'admin' : (extractCleanUsername(initU.name) || initU.username);
              const currentPwd = existing.password || initU.password;
              return {
                ...initU,
                ...existing,
                username: cleanUsername,
                name: initU.name,
                employeeCode: initU.employeeCode || existing.employeeCode,
                company: sanitizeCompany(existing.company || initU.company),
                role: isAdmin ? 'admin' : (sanitizeRole(existing.role) || sanitizeRole(initU.role) || 'user'),
                password: currentPwd,
                mustChangePassword: isAdmin ? false : (currentPwd === '1234' ? true : (existing.mustChangePassword ?? false)),
              };
            }
            return initU;
          });
        }
      } catch (e) {
        console.error('Failed to parse saved usersList:', e);
      }
    }
    return allExpectedUsers;
  });

  // Core Data States with localStorage persistence
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return saved !== null ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [suppliers, setSuppliers] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUPPLIERS);
    return saved !== null ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return saved !== null ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    const raw = saved !== null ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    if (Array.isArray(raw)) {
      return raw.map(tx => ({
        ...tx,
        date: tx.date || tx.timestamp || tx.createdAt || new Date().toISOString(),
        timestamp: tx.timestamp || tx.date || tx.createdAt || new Date().toISOString(),
        createdAt: tx.createdAt || tx.date || tx.timestamp || new Date().toISOString(),
        balanceAfter: tx.balanceAfter !== undefined ? tx.balanceAfter : tx.remainingStock,
      }));
    }
    return raw;
  });

  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    return saved !== null ? JSON.parse(saved) : INITIAL_REQUESTS;
  });

  // Notifications State
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved !== null ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [notificationSettings, setNotificationSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIF_SETTINGS);
    return saved ? JSON.parse(saved) : DEFAULT_NOTIF_SETTINGS;
  });

  // Department Quotas State
  const [departmentQuotas, setDepartmentQuotas] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPT_QUOTAS);
    return saved ? JSON.parse(saved) : DEFAULT_DEPARTMENT_QUOTAS;
  });

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers));
  }, [suppliers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTERS_LIST, JSON.stringify(requestersList));
  }, [requestersList]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIF_SETTINGS, JSON.stringify(notificationSettings));
  }, [notificationSettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPT_QUOTAS, JSON.stringify(departmentQuotas));
  }, [departmentQuotas]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  }, [lang]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  }, [user]);

  // Sync initial data from Supabase and listen for Realtime events
  const refreshDataFromSupabase = async () => {
    try {
      const [
        catRes,
        supRes,
        prodRes,
        reqsRes,
        usersRes,
        txRes,
        requestsRes,
        notifRes,
      ] = await Promise.allSettled([
        supabase.from('categories').select('*'),
        supabase.from('suppliers').select('*'),
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('requesters').select('*'),
        supabase.from('users').select('*'),
        supabase.from('transactions').select('*').order('timestamp', { ascending: false }).limit(200),
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(50),
      ]);

      if (catRes.status === 'fulfilled' && catRes.value.data && catRes.value.data.length > 0) {
        setCategories(catRes.value.data.map(mapCategoryFromDb));
      }
      if (supRes.status === 'fulfilled' && supRes.value.data && supRes.value.data.length > 0) {
        setSuppliers(supRes.value.data.map(mapSupplierFromDb));
      }
      if (prodRes.status === 'fulfilled' && prodRes.value.data && prodRes.value.data.length > 0) {
        const mappedProds = prodRes.value.data.map(mapProductFromDb);
        setProducts(mappedProds);
        try {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(mappedProds));
        } catch (e) {}
      }
      if (usersRes.status === 'fulfilled' && usersRes.value.data && usersRes.value.data.length > 0) {
        const mappedDbUsers = usersRes.value.data
          .map(mapUserFromDb)
          .filter((u) => !isRemovedCompany(u.company, u.employeeCode, u.id));
        setUsersList(mappedDbUsers);
        try {
          localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(mappedDbUsers));
        } catch (e) {}

        // Live-sync active user session with latest role from Supabase DB
        setUser(prevUser => {
          if (!prevUser) return null;
          const liveUser = mappedDbUsers.find(
            u =>
              u.id === prevUser.id ||
              (u.username && prevUser.username && u.username.toLowerCase() === prevUser.username.toLowerCase()) ||
              (u.employeeCode && prevUser.employeeCode && u.employeeCode.toLowerCase() === prevUser.employeeCode.toLowerCase())
          );
          if (liveUser && (liveUser.role !== prevUser.role || liveUser.status !== prevUser.status)) {
            const updated = { ...prevUser, ...liveUser };
            try {
              localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
              localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updated));
            } catch (e) {}
            return updated;
          }
          return prevUser;
        });
      }

      if (reqsRes.status === 'fulfilled' && reqsRes.value.data && reqsRes.value.data.length > 0) {
        const mappedReqs = reqsRes.value.data
          .map(mapRequesterFromDb)
          .filter((r) => !isRemovedCompany(r.company, r.employeeCode, r.id));
        setRequestersList(mappedReqs);
        try {
          localStorage.setItem(STORAGE_KEYS.REQUESTERS_LIST, JSON.stringify(mappedReqs));
        } catch (e) {}
      }
      if (txRes.status === 'fulfilled' && txRes.value.data && txRes.value.data.length > 0) {
        const prodList = prodRes.status === 'fulfilled' && prodRes.value.data ? prodRes.value.data.map(mapProductFromDb) : products;
        const mappedTxs = txRes.value.data.map((row) => {
          const t = mapTransactionFromDb(row);
          if (!t.productName || t.productName.trim() === '') {
            const matchedProd = prodList.find((p) => p.id === t.productId || p.sku === t.productId);
            if (matchedProd) t.productName = matchedProd.name;
          }
          return t;
        });
        setTransactions(mappedTxs);
      }
      if (requestsRes.status === 'fulfilled' && requestsRes.value.data && requestsRes.value.data.length > 0) {
        setRequests(requestsRes.value.data.map(mapRequestFromDb));
      }
      if (notifRes.status === 'fulfilled' && notifRes.value.data && notifRes.value.data.length > 0) {
        setNotifications(notifRes.value.data.map(mapNotificationFromDb));
      }
    } catch (err) {
      console.warn('refreshDataFromSupabase error:', err);
    }
  };

  useEffect(() => {
    refreshDataFromSupabase();

    // Comprehensive Realtime Postgres Changes Subscription for ALL tables
    const channel = supabase
      .channel('public-realtime-stock-complete')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const item = mapUserFromDb(payload.new);
            setUsersList((prev) => {
              const updated = prev.map((u) => (u.id === item.id || u.username === item.username ? item : u));
              if (!prev.some((u) => u.id === item.id || u.username === item.username)) {
                updated.push(item);
              }
              try {
                localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            setUsersList((prev) => prev.filter((u) => u.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapProductFromDb(payload.new);
            setProducts((prev) => (prev.some((p) => p.id === item.id) ? prev : [item, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapProductFromDb(payload.new);
            setProducts((prev) => prev.map((p) => (p.id === item.id ? item : p)));
          } else if (payload.eventType === 'DELETE') {
            setProducts((prev) => prev.filter((p) => p.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapCategoryFromDb(payload.new);
            setCategories((prev) => (prev.some((c) => c.id === item.id) ? prev : [...prev, item]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapCategoryFromDb(payload.new);
            setCategories((prev) => prev.map((c) => (c.id === item.id ? item : c)));
          } else if (payload.eventType === 'DELETE') {
            setCategories((prev) => prev.filter((c) => c.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'suppliers' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapSupplierFromDb(payload.new);
            setSuppliers((prev) => (prev.some((s) => s.id === item.id) ? prev : [...prev, item]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapSupplierFromDb(payload.new);
            setSuppliers((prev) => prev.map((s) => (s.id === item.id ? item : s)));
          } else if (payload.eventType === 'DELETE') {
            setSuppliers((prev) => prev.filter((s) => s.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requesters' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const item = mapRequesterFromDb(payload.new);
            setRequestersList((prev) => {
              const updated = prev.map((r) => (r.id === item.id || r.employeeCode === item.employeeCode ? item : r));
              if (!prev.some((r) => r.id === item.id || r.employeeCode === item.employeeCode)) {
                updated.push(item);
              }
              try {
                localStorage.setItem(STORAGE_KEYS.REQUESTERS_LIST, JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          } else if (payload.eventType === 'DELETE') {
            setRequestersList((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'requests' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapRequestFromDb(payload.new);
            setRequests((prev) => (prev.some((r) => r.id === item.id) ? prev : [item, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapRequestFromDb(payload.new);
            setRequests((prev) => prev.map((r) => (r.id === item.id ? item : r)));
          } else if (payload.eventType === 'DELETE') {
            setRequests((prev) => prev.filter((r) => r.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapTransactionFromDb(payload.new);
            setTransactions((prev) => (prev.some((t) => t.id === item.id) ? prev : [item, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapTransactionFromDb(payload.new);
            setTransactions((prev) => prev.map((t) => (t.id === item.id ? item : t)));
          } else if (payload.eventType === 'DELETE') {
            setTransactions((prev) => prev.filter((t) => t.id !== payload.old.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'notifications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const item = mapNotificationFromDb(payload.new);
            setNotifications((prev) => (prev.some((n) => n.id === item.id) ? prev : [item, ...prev]));
          } else if (payload.eventType === 'UPDATE') {
            const item = mapNotificationFromDb(payload.new);
            setNotifications((prev) => prev.map((n) => (n.id === item.id ? item : n)));
          } else if (payload.eventType === 'DELETE') {
            setNotifications((prev) => prev.filter((n) => n.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    // Heartbeat Auto-Sync every 8 seconds to ensure 100% real-time consistency
    const syncInterval = setInterval(() => {
      refreshDataFromSupabase();
    }, 8000);

    // Instant Sync when user switches back to tab or reconnects online
    const handleFocus = () => refreshDataFromSupabase();
    const handleOnline = () => refreshDataFromSupabase();

    window.addEventListener('focus', handleFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      supabase.removeChannel(channel);
    };
  }, []);

  // Theme & Language
  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  const toggleLang = () => setLang(prev => (prev === 'th' ? 'en' : 'th'));

  // Notification Helpers
  const addNotification = ({ type = 'INFO', title, message, linkTab = 'dashboard', targetUser = null, targetRole = null }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      linkTab,
      targetUser,
      targetRole,
      createdAt: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev.slice(0, 49)]); // Keep recent 50
  };

  const markNotificationAsRead = (id) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    } catch (e) {}
    supabase.from('notifications').delete().neq('id', 'never_match').then(({ error }) => {
      if (error) console.error('Supabase clear notifications error:', error);
    });
  };

  const updateNotificationSettings = (newSettings) => {
    setNotificationSettings(prev => ({ ...prev, ...newSettings }));
  };

  const sendTestNotification = (channel = 'LINE') => {
    const testMsg = `🔔 [ทดสอบการแจ้งเตือน] ระบบ Stock Online พร้อมใช้งาน (ทดสอบเมื่อ ${new Date().toLocaleTimeString('th-TH')})`;
    addNotification({
      type: 'INFO',
      title: `ทดสอบแจ้งเตือน ${channel}`,
      message: testMsg,
      linkTab: 'dashboard',
    });
    return true;
  };

  // Department Quotas Helpers
  const updateDepartmentQuota = (deptName, limit) => {
    setDepartmentQuotas(prev => ({
      ...prev,
      [deptName]: Math.max(0, parseInt(limit, 10) || 0),
    }));
  };

  const getDepartmentUsageThisMonth = (deptName) => {
    if (!deptName) return 0;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return requests
      .filter(r => {
        if (r.requesterDept !== deptName) return false;
        if (r.status !== 'APPROVED' && r.status !== 'PENDING') return false;
        const reqDate = new Date(r.createdAt);
        return reqDate.getFullYear() === currentYear && reqDate.getMonth() === currentMonth;
      })
      .reduce((sum, r) => {
        const itemSum = r.items.reduce((itemTotal, item) => itemTotal + (item.quantity || 0), 0);
        return sum + itemSum;
      }, 0);
  };

  // Auth Functions
  const login = async (username, password, targetUserId = null) => {
    const rawInput = (username || '').trim();
    const normalizedInput = rawInput.toLowerCase();
    const cleanInput = extractCleanUsername(rawInput).toLowerCase();
    const noSpaceInput = normalizedInput.replace(/[\s\-_]/g, '');
    const trimmedPassword = (password || '').trim();

    let matchedUser = null;
    if (targetUserId) {
      matchedUser = usersList.find(u => u.id === targetUserId && String(u.password).trim() === trimmedPassword);
    }

    if (!matchedUser) {
      matchedUser = usersList.find(u => {
        const uUsername = (u.username || '').trim().toLowerCase();
        const uEmpCode = (u.employeeCode || '').trim().toLowerCase();
        const uEmpNoSpace = uEmpCode.replace(/[\s\-_]/g, '');
        const uEmail = (u.email || '').trim().toLowerCase();
        const uName = (u.name || '').trim().toLowerCase();
        const uCleanName = extractCleanUsername(u.name).toLowerCase();

        const isMatch = (
          uUsername === normalizedInput ||
          uUsername === cleanInput ||
          uName === normalizedInput ||
          (normalizedInput.length >= 3 && uName.includes(normalizedInput)) ||
          (cleanInput.length >= 3 && uName.includes(cleanInput)) ||
          uCleanName === cleanInput ||
          uCleanName === normalizedInput ||
          uEmpCode === normalizedInput ||
          uEmpNoSpace === noSpaceInput ||
          uEmail === normalizedInput
        );

        return isMatch && String(u.password).trim() === trimmedPassword;
      });
    }

    // 2. Query Live Supabase if not matched in state yet
    if (!matchedUser) {
      try {
        const { data: dbUsers } = await supabase.from('users').select('*');
        if (dbUsers && dbUsers.length > 0) {
          const mapped = dbUsers.map(mapUserFromDb).filter(u => !isRemovedCompany(u.company, u.employeeCode, u.id));
          setUsersList(mapped);
          try {
            localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(mapped));
          } catch (e) {}

          if (targetUserId) {
            matchedUser = mapped.find(u => u.id === targetUserId && String(u.password).trim() === trimmedPassword);
          }
          if (!matchedUser) {
            matchedUser = mapped.find(u => {
              const uUsername = (u.username || '').trim().toLowerCase();
              const uEmpCode = (u.employeeCode || '').trim().toLowerCase();
              const uEmpNoSpace = uEmpCode.replace(/[\s\-_]/g, '');
              const uEmail = (u.email || '').trim().toLowerCase();
              const uName = (u.name || '').trim().toLowerCase();
              const uCleanName = extractCleanUsername(u.name).toLowerCase();

              const isMatch = (
                uUsername === normalizedInput ||
                uUsername === cleanInput ||
                uName === normalizedInput ||
                (normalizedInput.length >= 3 && uName.includes(normalizedInput)) ||
                (cleanInput.length >= 3 && uName.includes(cleanInput)) ||
                uCleanName === cleanInput ||
                uCleanName === normalizedInput ||
                uEmpCode === normalizedInput ||
                uEmpNoSpace === noSpaceInput ||
                uEmail === normalizedInput
              );

              return isMatch && String(u.password).trim() === trimmedPassword;
            });
          }
        }
      } catch (err) {
        console.warn('Supabase live auth query error:', err);
      }
    }

    if (matchedUser) {
      if (matchedUser.status === 'suspended') {
        throw new Error(lang === 'th' ? 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ' : 'Account suspended');
      }
      setUser(matchedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(matchedUser));
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(matchedUser));
      } catch (e) {}

      if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      return matchedUser;
    }

    throw new Error(lang === 'th' ? 'ชื่อผู้ใช้ หรือ รหัสผ่านไม่ถูกต้อง (กรุณาตรวจสอบรหัสผ่านอีกครั้ง)' : 'Invalid username or password');
  };

  const logout = () => {
    setUser(null);
  };

  // User Management
  const createNewUser = (userData) => {
    const empCode = userData.employeeCode ? userData.employeeCode.trim() : `EMP-${1001 + usersList.length}`;
    const cleanRole = sanitizeRole(userData.role || 'user');
    const cleanUsername = userData.username ? userData.username.trim() : extractCleanUsername(userData.name) || empCode;
    const initialPwd = userData.password ? userData.password.trim() : '1234';
    const newUser = {
      ...userData,
      role: cleanRole,
      id: `usr-${Date.now()}`,
      employeeCode: empCode,
      username: cleanUsername,
      password: initialPwd,
      status: 'active',
      mustChangePassword: initialPwd === '1234' ? true : (userData.mustChangePassword ?? false),
      createdAt: new Date().toISOString(),
    };
    setUsersList(prev => [newUser, ...prev]);

    // Persist to Supabase users table
    supabase.from('users').upsert(mapUserToDb(newUser)).then(({ error }) => {
      if (error) console.error('Supabase createNewUser error:', error);
    });

    if (cleanRole === 'user') {
      const alreadyInReq = requestersList.some(r => r.employeeCode === empCode || r.name === userData.name);
      if (!alreadyInReq) {
        const newReq = {
          id: `req-${Date.now()}`,
          name: userData.name,
          employeeCode: empCode,
          company: sanitizeCompany(userData.company),
          department: userData.department || '',
          position: userData.position || '',
        };
        setRequestersList(prev => [newReq, ...prev]);
        supabase.from('requesters').upsert(mapRequesterToDb(newReq)).then(({ error }) => {
          if (error) console.error('Supabase createNewUser->req error:', error);
        });
      }
    }
  };

  const updateUser = (id, updatedFields) => {
    let updatedUserObj = null;
    const sanitizedFields = { ...updatedFields };
    if (sanitizedFields.role) {
      sanitizedFields.role = sanitizeRole(sanitizedFields.role);
    }
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          updatedUserObj = { ...u, ...sanitizedFields };
          return updatedUserObj;
        }
        return u;
      })
    );

    if (updatedUserObj) {
      supabase.from('users').upsert(mapUserToDb(updatedUserObj)).then(({ error }) => {
        if (error) console.error('Supabase updateUser error:', error);
      });
    }

    if (user && user.id === id) {
      setUser(prev => ({ ...prev, ...updatedFields }));
    }

    if (updatedUserObj && updatedUserObj.employeeCode) {
      setRequestersList(prev =>
        prev.map(r => {
          if (r.employeeCode === updatedUserObj.employeeCode || r.name === updatedUserObj.name) {
            const updatedReq = {
              ...r,
              name: updatedUserObj.name || r.name,
              employeeCode: updatedUserObj.employeeCode || r.employeeCode,
              company: updatedUserObj.company || r.company,
              department: updatedUserObj.department || r.department,
              position: updatedUserObj.position || r.position,
            };
            supabase.from('requesters').upsert(mapRequesterToDb(updatedReq)).then(({ error }) => {
              if (error) console.error('Supabase updateUser->req error:', error);
            });
            return updatedReq;
          }
          return r;
        })
      );
    }
  };

  const deleteUser = (id) => {
    const targetUser = usersList.find(u => u.id === id);
    if (targetUser && targetUser.username === 'admin') {
      alert(lang === 'th' ? 'ไม่สามารถลบบัญชีผู้ดูแลระบบหลัก (Admin) ได้' : 'Cannot delete primary admin');
      return;
    }
    setUsersList(prev => prev.filter(u => u.id !== id));
    supabase.from('users').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase deleteUser error:', error);
    });
  };

  const toggleUserStatus = (id) => {
    let targetObj = null;
    setUsersList(prev =>
      prev.map(u => {
        if (u.id === id) {
          const nextStatus = u.status === 'active' ? 'suspended' : 'active';
          targetObj = { ...u, status: nextStatus };
          return targetObj;
        }
        return u;
      })
    );
    if (targetObj) {
      supabase.from('users').upsert(mapUserToDb(targetObj)).then(({ error }) => {
        if (error) console.error('Supabase toggleUserStatus error:', error);
      });
    }
  };

  const changeUserPassword = (userId, newPassword) => {
    const trimmed = String(newPassword).trim();
    let updatedUserObj = null;
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.username === userId) {
          updatedUserObj = { ...u, password: trimmed, mustChangePassword: false };
          return updatedUserObj;
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedUserObj) {
      supabase.from('users').upsert(mapUserToDb(updatedUserObj)).then(({ error }) => {
        if (error) console.error('Supabase update password error:', error);
      });
    }

    if (user && (user.id === userId || user.username === userId)) {
      const updatedUser = { ...user, password: trimmed, mustChangePassword: false };
      setUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  const adminResetUserPassword = (userId, newPassword, forceMustChange = true) => {
    const trimmed = String(newPassword).trim();
    let updatedUserObj = null;
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.id === userId || u.username === userId) {
          updatedUserObj = { ...u, password: trimmed, mustChangePassword: forceMustChange };
          return updatedUserObj;
        }
        return u;
      });
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    if (updatedUserObj) {
      supabase.from('users').upsert(mapUserToDb(updatedUserObj)).then(({ error }) => {
        if (error) console.error('Supabase admin reset password error:', error);
      });
    }

    if (user && (user.id === userId || user.username === userId)) {
      const updatedUser = { ...user, password: trimmed, mustChangePassword: forceMustChange };
      setUser(updatedUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(updatedUser));
      } catch (e) {}
    }
  };

  // Requester Management
  const addRequester = (requester) => {
    const empCode = requester.employeeCode ? requester.employeeCode.trim() : `EMP-${1001 + requestersList.length}`;
    const newReq = {
      ...requester,
      id: `req-${Date.now()}`,
      employeeCode: empCode,
    };
    setRequestersList(prev => [newReq, ...prev]);

    // Persist to Supabase requesters table
    supabase.from('requesters').upsert(mapRequesterToDb(newReq)).then(({ error }) => {
      if (error) console.error('Supabase addRequester error:', error);
    });

    const alreadyInUsers = usersList.some(u => u.employeeCode === empCode || u.name === requester.name);
    if (!alreadyInUsers) {
      const newUser = generateRequesterUser(newReq, requestersList.length);
      setUsersList(prev => [...prev, newUser]);
      // Persist newUser to Supabase users table
      supabase.from('users').upsert(mapUserToDb(newUser)).then(({ error }) => {
        if (error) console.error('Supabase addRequester->user error:', error);
      });
    }
  };

  const updateRequester = (id, updatedFields) => {
    let updatedReqObj = null;
    setRequestersList(prev =>
      prev.map(r => {
        if (r.id === id) {
          updatedReqObj = { ...r, ...updatedFields };
          // Persist to Supabase
          supabase.from('requesters').upsert(mapRequesterToDb(updatedReqObj)).then(({ error }) => {
            if (error) console.error('Supabase updateRequester error:', error);
          });
          return updatedReqObj;
        }
        return r;
      })
    );

    if (updatedReqObj) {
      setUsersList(prev =>
        prev.map(u => {
          if (
            u.id === `usr-req-${id}` ||
            (updatedReqObj.employeeCode && u.employeeCode === updatedReqObj.employeeCode) ||
            u.name === updatedReqObj.name
          ) {
            const updatedName = updatedReqObj.name || u.name;
            const updatedUser = {
              ...u,
              name: updatedName,
              username: extractCleanUsername(updatedName) || u.username,
              employeeCode: updatedReqObj.employeeCode || u.employeeCode,
              company: updatedReqObj.company || u.company,
              department: updatedReqObj.department || u.department,
              position: updatedReqObj.position || u.position,
            };
            supabase.from('users').upsert(mapUserToDb(updatedUser)).then(({ error }) => {
              if (error) console.error('Supabase updateRequester->user error:', error);
            });
            return updatedUser;
          }
          return u;
        })
      );
    }
  };

  const deleteRequester = (id) => {
    const targetReq = requestersList.find(r => r.id === id);
    setRequestersList(prev => prev.filter(r => r.id !== id));
    // Persist to Supabase
    supabase.from('requesters').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase deleteRequester error:', error);
    });
    if (targetReq) {
      setUsersList(prev => {
        const filtered = prev.filter(
          u =>
            u.id !== `usr-req-${id}` &&
            (!targetReq.employeeCode || u.employeeCode !== targetReq.employeeCode) &&
            u.name !== targetReq.name
        );
        return filtered;
      });
      const matchingUser = usersList.find(
        u =>
          u.id === `usr-req-${id}` ||
          (targetReq.employeeCode && u.employeeCode === targetReq.employeeCode) ||
          u.name === targetReq.name
      );
      if (matchingUser && matchingUser.role === 'user') {
        supabase.from('users').delete().eq('id', matchingUser.id).then(({ error }) => {
          if (error) console.error('Supabase deleteRequester->user error:', error);
        });
      }
    }
  };

  const batchImportRequesters = (reqList) => {
    const newItems = reqList.map((r, i) => ({
      ...r,
      id: `req-csv-${Date.now()}-${i}`,
      employeeCode: r.employeeCode || `EMP-${1001 + requestersList.length + i}`,
    }));
    setRequestersList(prev => [...prev, ...newItems]);

    // Persist to Supabase
    supabase.from('requesters').upsert(newItems.map(mapRequesterToDb)).then(({ error }) => {
      if (error) console.error('Supabase batchImportRequesters error:', error);
    });

    const newUsers = newItems
      .filter(item => !usersList.some(u => u.employeeCode === item.employeeCode || u.name === item.name))
      .map((item, idx) => generateRequesterUser(item, idx));

    if (newUsers.length > 0) {
      setUsersList(prev => [...prev, ...newUsers]);
    }
  };

  // Product Management
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: `prod-${Date.now()}`,
      sku: product.sku || `AST-${Date.now().toString().slice(-6)}`,
      barcode: product.barcode || `QR885${Math.floor(100000000 + Math.random() * 900000000)}`,
      quantity: Number(product.quantity) || 0,
      costPrice: Number(product.costPrice) || 0,
      sellingPrice: Number(product.sellingPrice) || Number(product.costPrice) || 0,
      minThreshold: Number(product.minThreshold) || 5,
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [newProduct, ...prev]);

    // Persist to Supabase
    supabase.from('products').upsert(mapProductToDb(newProduct)).then(({ error }) => {
      if (error) console.error('Supabase addProduct error:', error);
    });

    if (newProduct.quantity > 0) {
      recordStockMovement({
        productId: newProduct.id,
        type: 'IN',
        quantity: newProduct.quantity,
        note: lang === 'th' ? 'ยอดยกมา / สินค้าเริ่มต้น' : 'Initial stock balance',
        performedBy: user ? user.name : 'System',
      });
    }
  };

  const updateProduct = (id, updatedFields) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = {
            ...p,
            ...updatedFields,
            quantity: updatedFields.quantity !== undefined ? Number(updatedFields.quantity) : p.quantity,
            costPrice: updatedFields.costPrice !== undefined ? Number(updatedFields.costPrice) : p.costPrice,
            sellingPrice: updatedFields.sellingPrice !== undefined ? Number(updatedFields.sellingPrice) : p.sellingPrice,
            minThreshold: updatedFields.minThreshold !== undefined ? Number(updatedFields.minThreshold) : p.minThreshold,
          };
          // Persist to Supabase
          supabase.from('products').upsert(mapProductToDb(updated)).then(({ error }) => {
            if (error) console.error('Supabase updateProduct error:', error);
          });
          return updated;
        }
        return p;
      })
    );
  };

  const deleteProduct = (id) => {
    if (user?.role === 'viewer' || user?.role === 'user') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบและพนักงานคลังเท่านั้น' : 'Admin or Staff role required');
      return;
    }
    setProducts(prev => prev.filter(p => p.id !== id));
    // Persist to Supabase
    supabase.from('products').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase deleteProduct error:', error);
    });
  };

  // Transaction Movement
  const recordStockMovement = ({
    productId,
    type,
    quantity,
    unitPrice,
    customer,
    requesterName,
    requesterCompany,
    requesterDept,
    requesterPosition,
    purpose,
    supplier,
    supplierId,
    refNo,
    invoiceFile,
    note,
    performedBy,
  }) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const qty = Number(quantity);
    let newQty = product.quantity;

    if (type === 'IN') {
      newQty = product.quantity + qty;
    } else if (type === 'OUT') {
      newQty = Math.max(0, product.quantity - qty);
    } else if (type === 'ADJUST') {
      newQty = Math.max(0, qty);
    }

    updateProduct(productId, { quantity: newQty });

    // Low stock notification trigger
    if (newQty <= (product.minThreshold || 5)) {
      addNotification({
        type: 'LOW_STOCK',
        title: '⚠️ สินค้าใกล้หมดสต็อก',
        message: `อุปกรณ์ "${product.name}" คงเหลือเพียง ${newQty} ${product.unit || 'ชิ้น'} (ต่ำกว่าเกณฑ์ ${product.minThreshold || 5})`,
        linkTab: 'inventory',
        targetRole: 'admin',
      });
    }

    const effectiveUnitPrice = unitPrice !== undefined && Number(unitPrice) >= 0 ? Number(unitPrice) : (product.costPrice || 0);
    const nowIso = new Date().toISOString();
    const newTx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      productName: product.name,
      productSku: product.sku,
      category: product.category,
      unit: product.unit || 'ชิ้น',
      type,
      quantity: qty,
      unitPrice: effectiveUnitPrice,
      totalAmount: qty * effectiveUnitPrice,
      balanceAfter: newQty,
      remainingStock: newQty,
      customer: customer || requesterName || '',
      requesterName: requesterName || customer || '',
      requesterCompany: requesterCompany || 'EXION THAILAND',
      requesterDept: requesterDept || '',
      requesterPosition: requesterPosition || '',
      purpose: purpose || '',
      supplier: supplier || '',
      supplierId: supplierId || null,
      refNo: refNo || `REF-${Date.now().toString().slice(-6)}`,
      invoiceFile: invoiceFile || null,
      note: note || '',
      date: nowIso,
      timestamp: nowIso,
      createdAt: nowIso,
      performedBy: performedBy || (user ? user.name : 'Admin'),
      createdBy: performedBy || (user ? user.name : 'Admin'),
    };

    setTransactions(prev => [newTx, ...prev]);

    // Persist to Supabase
    supabase.from('transactions').insert(mapTransactionToDb(newTx)).then(({ error }) => {
      if (error) console.error('Supabase transaction insert error:', error);
    });
  };

  // Stocktake Audit Adjustment
  const applyStockAuditAdjustment = ({ auditRecords, sessionNote }) => {
    if (!Array.isArray(auditRecords) || auditRecords.length === 0) return;

    let adjustedCount = 0;
    auditRecords.forEach(record => {
      const prod = products.find(p => p.id === record.productId);
      if (!prod) return;

      const countedQty = Number(record.countedQty);
      if (isNaN(countedQty)) return;

      if (prod.quantity !== countedQty) {
        adjustedCount++;
        recordStockMovement({
          productId: prod.id,
          type: 'ADJUST',
          quantity: countedQty,
          note: `[ตรวจนับสต็อกประจำงวด] ${sessionNote || 'ปรับยอดตามการนับจริง'} (เดิม: ${prod.quantity}, นับได้: ${countedQty})`,
          performedBy: user ? user.name : 'Staff',
        });
      }
    });

    addNotification({
      type: 'AUDIT',
      title: '📋 บันทึกผลการตรวจนับสต็อกแล้ว',
      message: `บันทึกการตรวจนับและปรับยอดสต็อกจำนวน ${adjustedCount} รายการเรียบร้อย`,
      linkTab: 'history',
    });

    return adjustedCount;
  };

  // Requisition Requests
  const createRequisitionRequest = ({
    requesterName,
    requesterCompany,
    requesterDept,
    requesterPosition,
    purpose,
    note,
    items,
  }) => {
    const refNo = `REQ-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newReq = {
      id: `req-order-${Date.now()}`,
      refNo,
      date: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userId: user ? user.id : null,
      employeeCode: user ? user.employeeCode : null,
      requesterName: (requesterName || (user ? user.name : 'ผู้เบิก')).trim(),
      requesterCompany: requesterCompany || (user ? user.company : 'EXION THAILAND'),
      requesterDept: requesterDept || (user ? user.department : ''),
      requesterPosition: requesterPosition || (user ? user.position : ''),
      purpose: purpose || 'DAILY',
      note: note ? note.trim() : '',
      status: 'PENDING',
      statusNote: '',
      approvedBy: null,
      approvedAt: null,
      items: items.map(item => ({
        productId: item.product ? item.product.id : item.productId,
        name: item.product ? item.product.name : item.name,
        sku: item.product ? item.product.sku : item.sku,
        quantity: item.quantity,
        unit: item.product ? (item.product.unit || 'ชิ้น') : (item.unit || 'ชิ้น'),
        image: item.product ? item.product.image : item.image,
      })),
      createdBy: user ? user.name : requesterName,
    };

    setRequests(prev => [newReq, ...prev]);

    // Persist to Supabase
    supabase.from('requests').upsert(mapRequestToDb(newReq)).then(({ error }) => {
      if (error) console.error('Supabase request create error:', error);
    });

    // Send In-App Notification (For Staff/Admin)
    const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
    addNotification({
      type: 'NEW_REQUEST',
      title: '📑 มีคำขอเบิกอุปกรณ์ใหม่',
      message: `${newReq.requesterName} (${newReq.requesterDept || newReq.requesterCompany}) ส่งคำขอเบิก ${itemCount} ชิ้น [${refNo}]`,
      linkTab: 'approvals',
      targetRole: 'admin',
    });

    return newReq;
  };

  const approveRequisitionRequest = (requestId, approvalNote = '') => {
    if (user?.role === 'viewer' || user?.role === 'user') {
      throw new Error(lang === 'th' ? 'สิทธิ์เฉพาะเจ้าหน้าที่คลังหรือผู้ดูแลระบบเท่านั้น' : 'Admin or Staff required');
    }

    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return false;
    if (targetReq.status !== 'PENDING') {
      throw new Error(lang === 'th' ? 'คำขอนี้ได้รับการประมวลผลไปแล้ว' : 'Request already processed');
    }

    for (const item of targetReq.items) {
      const prod = products.find(p => p.id === item.productId);
      if (!prod || prod.quantity < item.quantity) {
        throw new Error(
          lang === 'th'
            ? `อุปกรณ์ "${item.name}" มีไม่เพียงพอในคลัง (คงเหลือ ${prod ? prod.quantity : 0} ชิ้น)`
            : `Insufficient stock for ${item.name}`
        );
      }
    }

    const customerFormatted = `${targetReq.requesterName} (${targetReq.requesterCompany}${targetReq.requesterDept ? ` - ${targetReq.requesterDept}` : ''}${targetReq.requesterPosition ? ` - ${targetReq.requesterPosition}` : ''})`;

    targetReq.items.forEach(item => {
      const prod = products.find(p => p.id === item.productId);
      recordStockMovement({
        productId: item.productId,
        type: 'OUT',
        quantity: item.quantity,
        unitPrice: item.costPrice || item.sellingPrice || prod?.costPrice || 0,
        customer: customerFormatted,
        requesterName: targetReq.requesterName,
        requesterCompany: targetReq.requesterCompany,
        requesterDept: targetReq.requesterDept,
        requesterPosition: targetReq.requesterPosition,
        purpose: targetReq.purpose,
        refNo: targetReq.refNo,
        note: `[อนุมัติคำขอ ${targetReq.refNo}] ${approvalNote || targetReq.note || ''}`,
      });
    });

    const updatedReq = {
      ...targetReq,
      status: 'APPROVED',
      statusNote: approvalNote || (lang === 'th' ? 'อนุมัติและตัดจ่ายสต็อกเรียบร้อย' : 'Approved & Dispatched'),
      approvedBy: user ? `${user.name} (${user.role ? user.role.toUpperCase() : 'STAFF'})` : 'Admin',
      approvedAt: new Date().toISOString(),
    };

    setRequests(prev => prev.map(r => (r.id === requestId ? updatedReq : r)));

    // Persist to Supabase
    supabase.from('requests').upsert(mapRequestToDb(updatedReq)).then(({ error }) => {
      if (error) console.error('Supabase request approve error:', error);
    });

    addNotification({
      type: 'APPROVED',
      title: '✅ คำขอเบิกได้รับการอนุมัติ',
      message: `คำขอ [${targetReq.refNo}] ของคุณได้รับการอนุมัติและจ่ายของเรียบร้อย`,
      linkTab: 'request-qr',
      targetUser: targetReq.requesterName,
      targetRole: 'user',
    });

    return true;
  };

  const rejectRequisitionRequest = (requestId, rejectionReason = '') => {
    if (user?.role === 'viewer' || user?.role === 'user') {
      throw new Error(lang === 'th' ? 'สิทธิ์เฉพาะเจ้าหน้าที่คลังหรือผู้ดูแลระบบเท่านั้น' : 'Admin or Staff required');
    }

    const targetReq = requests.find(r => r.id === requestId);
    const updatedReq = {
      ...targetReq,
      status: 'REJECTED',
      statusNote: rejectionReason || (lang === 'th' ? 'คำขอไม่อนุมัติ' : 'Rejected'),
      approvedBy: user ? `${user.name} (${user.role ? user.role.toUpperCase() : 'STAFF'})` : 'Admin',
      approvedAt: new Date().toISOString(),
    };

    setRequests(prev => prev.map(r => (r.id === requestId ? updatedReq : r)));

    // Persist to Supabase
    supabase.from('requests').upsert(mapRequestToDb(updatedReq)).then(({ error }) => {
      if (error) console.error('Supabase request reject error:', error);
    });

    if (targetReq) {
      addNotification({
        type: 'REJECTED',
        title: '❌ คำขอเบิกไม่อนุมัติ',
        message: `คำขอ [${targetReq.refNo}] ถูกปฏิเสธ: ${rejectionReason || 'ไม่ระบุเหตุผล'}`,
        linkTab: 'request-qr',
        targetUser: targetReq.requesterName,
        targetRole: 'user',
      });
    }

    return true;
  };

  const cancelRequisitionRequest = (requestId, cancelReason = '') => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return false;
    if (targetReq.status !== 'PENDING') {
      throw new Error(lang === 'th' ? 'สามารถยกเลิกได้เฉพาะคำขอที่อยู่ในสถานะรออนุมัติเท่านั้น' : 'Only pending requests can be cancelled');
    }

    const updatedReq = {
      ...targetReq,
      status: 'CANCELLED',
      statusNote: cancelReason || (lang === 'th' ? 'ผู้ขอเบิกยกเลิกคำขอเอง' : 'Cancelled by requester'),
      cancelledAt: new Date().toISOString(),
      cancelledBy: user ? user.name : targetReq.requesterName,
    };

    setRequests(prev => prev.map(r => (r.id === requestId ? updatedReq : r)));

    // Persist to Supabase
    supabase.from('requests').upsert(mapRequestToDb(updatedReq)).then(({ error }) => {
      if (error) console.error('Supabase request cancel error:', error);
    });

    addNotification({
      type: 'CANCELLED',
      title: '🗑️ ยกเลิกคำขอเบิกแล้ว',
      message: `คำขอ [${targetReq.refNo}] ของคุณ ${targetReq.requesterName} ถูกยกเลิกเรียบร้อยแล้ว`,
      linkTab: 'request-qr',
    });

    return true;
  };

  const deleteRequisitionRequest = (requestId) => {
    if (user?.role !== 'admin') {
      throw new Error(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบเท่านั้น' : 'Admin only');
    }
    setRequests(prev => prev.filter(r => r.id !== requestId));
    // Persist to Supabase
    supabase.from('requests').delete().eq('id', requestId).then(({ error }) => {
      if (error) console.error('Supabase request delete error:', error);
    });
  };

  // Categories & Suppliers
  const addCategory = (category) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    const newCat = { ...category, id: `cat-${Date.now()}` };
    setCategories(prev => [...prev, newCat]);
    // Persist to Supabase
    supabase.from('categories').upsert(mapCategoryToDb(newCat)).then(({ error }) => {
      if (error) console.error('Supabase addCategory error:', error);
    });
  };

  const updateCategory = (id, updatedFields) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    setCategories(prev =>
      prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, ...updatedFields };
          supabase.from('categories').upsert(mapCategoryToDb(updated)).then(({ error }) => {
            if (error) console.error('Supabase updateCategory error:', error);
          });
          return updated;
        }
        return c;
      })
    );
  };

  const deleteCategory = (id) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    setCategories(prev => prev.filter(c => c.id !== id));
    // Persist to Supabase
    supabase.from('categories').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase deleteCategory error:', error);
    });
  };

  const addSupplier = (supplier) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    const newSup = { ...supplier, id: `sup-${Date.now()}` };
    setSuppliers(prev => [...prev, newSup]);
    // Persist to Supabase
    supabase.from('suppliers').upsert(mapSupplierToDb(newSup)).then(({ error }) => {
      if (error) console.error('Supabase addSupplier error:', error);
    });
  };

  const updateSupplier = (id, updatedFields) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === id) {
          const updated = { ...s, ...updatedFields };
          supabase.from('suppliers').upsert(mapSupplierToDb(updated)).then(({ error }) => {
            if (error) console.error('Supabase updateSupplier error:', error);
          });
          return updated;
        }
        return s;
      })
    );
  };

  const deleteSupplier = (id) => {
    if (user?.role !== 'admin') {
      alert(lang === 'th' ? 'สิทธิ์เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น' : 'Admin role required');
      return;
    }
    setSuppliers(prev => prev.filter(s => s.id !== id));
    // Persist to Supabase
    supabase.from('suppliers').delete().eq('id', id).then(({ error }) => {
      if (error) console.error('Supabase deleteSupplier error:', error);
    });
  };

  // Full System Backup & Restore
  const exportSystemBackup = () => {
    const data = {
      system: 'Stock Online Enterprise',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      exportedBy: user ? `${user.name} (${user.role})` : 'System',
      products,
      categories,
      suppliers,
      transactions,
      usersList,
      requestersList,
      requests,
      departmentQuotas,
      notificationSettings,
      notifications,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_online_backup_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    return true;
  };

  const importSystemBackup = async (jsonData) => {
    try {
      const parsed = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
      if (parsed.products) setProducts(parsed.products);
      if (parsed.categories) setCategories(parsed.categories);
      if (parsed.suppliers) setSuppliers(parsed.suppliers);
      if (parsed.transactions) setTransactions(parsed.transactions);
      if (parsed.usersList) setUsersList(parsed.usersList);
      if (parsed.requestersList) setRequestersList(parsed.requestersList);
      if (parsed.requests) setRequests(parsed.requests);
      if (parsed.departmentQuotas) setDepartmentQuotas(parsed.departmentQuotas);
      if (parsed.notificationSettings) setNotificationSettings(parsed.notificationSettings);
      if (parsed.notifications) setNotifications(parsed.notifications);

      // Batch sync to Supabase
      if (parsed.categories?.length) {
        await supabase.from('categories').upsert(parsed.categories.map(mapCategoryToDb));
      }
      if (parsed.suppliers?.length) {
        await supabase.from('suppliers').upsert(parsed.suppliers.map(mapSupplierToDb));
      }
      if (parsed.requestersList?.length) {
        await supabase.from('requesters').upsert(parsed.requestersList.map(mapRequesterToDb));
      }
      if (parsed.products?.length) {
        const chunk = 50;
        for (let i = 0; i < parsed.products.length; i += chunk) {
          await supabase.from('products').upsert(parsed.products.slice(i, i + chunk).map(mapProductToDb));
        }
      }
      if (parsed.requests?.length) {
        await supabase.from('requests').upsert(parsed.requests.map(mapRequestToDb));
      }
      if (parsed.transactions?.length) {
        const chunk = 50;
        for (let i = 0; i < parsed.transactions.length; i += chunk) {
          await supabase.from('transactions').upsert(parsed.transactions.slice(i, i + chunk).map(mapTransactionToDb));
        }
      }

      addNotification({
        type: 'INFO',
        title: '📥 กู้คืนข้อมูลระบบสำเร็จ',
        message: `กู้คืนข้อมูลสำเร็จเรียบร้อยเมื่อ ${new Date().toLocaleTimeString('th-TH')}`,
        linkTab: 'dashboard',
      });
      return true;
    } catch (e) {
      console.error('Backup Import Error:', e);
      throw new Error('รูปแบบไฟล์ Backup ไม่ถูกต้อง (Invalid JSON structure)');
    }
  };

  const syncLocalToSupabase = async () => {
    try {
      if (categories?.length) {
        await supabase.from('categories').upsert(categories.map(mapCategoryToDb));
      }
      if (suppliers?.length) {
        await supabase.from('suppliers').upsert(suppliers.map(mapSupplierToDb));
      }
      if (requestersList?.length) {
        await supabase.from('requesters').upsert(requestersList.map(mapRequesterToDb));
      }
      if (products?.length) {
        const chunk = 50;
        for (let i = 0; i < products.length; i += chunk) {
          await supabase.from('products').upsert(products.slice(i, i + chunk).map(mapProductToDb));
        }
      }
      if (requests?.length) {
        await supabase.from('requests').upsert(requests.map(mapRequestToDb));
      }
      if (transactions?.length) {
        const chunk = 50;
        for (let i = 0; i < transactions.length; i += chunk) {
          await supabase.from('transactions').upsert(transactions.slice(i, i + chunk).map(mapTransactionToDb));
        }
      }
      addNotification({
        type: 'INFO',
        title: '☁️ ซิงค์ขึ้น Supabase สำเร็จ',
        message: 'ส่งข้อมูลสินค้า, ผู้ขอเบิก และประวัติทั้งหมดขึ้น Cloud เรียบร้อยแล้ว',
        linkTab: 'dashboard',
      });
      return true;
    } catch (err) {
      console.error('syncLocalToSupabase error:', err);
      throw err;
    }
  };

  const clearAllData = () => {
    setProducts([]);
    setCategories([]);
    setSuppliers([]);
    setTransactions([]);
    setRequests([]);
    setRequestersList([]);
    setNotifications([]);

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REQUESTERS_LIST, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify([]));

    addNotification({
      type: 'AUDIT',
      title: '🗑️ ล้างข้อมูลระบบเรียบร้อย',
      message: 'ลบข้อมูลสินค้า หมวดหมู่ คู่ค้า และประวัติทั้งหมดในระบบเรียบร้อยแล้ว',
      linkTab: 'dashboard',
    });
  };

  const resetToSampleData = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSuppliers(INITIAL_SUPPLIERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setUsersList(INITIAL_USERS);
    setRequestersList(INITIAL_REQUESTERS);
    setRequests(INITIAL_REQUESTS);
    setDepartmentQuotas(DEFAULT_DEPARTMENT_QUOTAS);
    setNotifications(INITIAL_NOTIFICATIONS);

    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.SUPPLIERS);
    localStorage.removeItem(STORAGE_KEYS.TRANSACTIONS);
    localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
    localStorage.removeItem(STORAGE_KEYS.REQUESTERS_LIST);
    localStorage.removeItem(STORAGE_KEYS.REQUESTS);
    localStorage.removeItem(STORAGE_KEYS.DEPT_QUOTAS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
  };

  const loadSimulated500Data = () => {
    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSuppliers(INITIAL_SUPPLIERS);
    setTransactions(INITIAL_TRANSACTIONS);
    setUsersList(INITIAL_USERS);
    setRequestersList(INITIAL_REQUESTERS);
    setRequests(INITIAL_REQUESTS);
    setDepartmentQuotas(DEFAULT_DEPARTMENT_QUOTAS);
    setNotifications(INITIAL_NOTIFICATIONS);

    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(INITIAL_SUPPLIERS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.REQUESTERS_LIST, JSON.stringify(INITIAL_REQUESTERS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(INITIAL_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.DEPT_QUOTAS, JSON.stringify(DEFAULT_DEPARTMENT_QUOTAS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));

    addNotification({
      type: 'AUDIT',
      title: '⚡ จำลองข้อมูล 500+ รายการสำเร็จ',
      message: `โหลดข้อมูลธุรกรรม ${INITIAL_TRANSACTIONS.length} รายการ และคำขอเบิก ${INITIAL_REQUESTS.length} คำขอเรียบร้อยแล้ว`,
      linkTab: 'dashboard',
    });
  };

  // Stock Analytics Helpers
  const getLowStockProducts = () => products.filter(p => p.quantity > 0 && p.quantity <= (p.minThreshold || 5));
  const getOutOfStockProducts = () => products.filter(p => p.quantity === 0);
  const getTotalInventoryValue = () => products.reduce((sum, p) => sum + p.quantity * p.costPrice, 0);
  const getTotalSellingValue = () => products.reduce((sum, p) => sum + p.quantity * p.sellingPrice, 0);

  return (
    <StockContext.Provider
      value={{
        theme,
        toggleTheme,
        lang,
        toggleLang,
        user,
        login,
        logout,
        refreshDataFromSupabase,
        usersList,
        createNewUser,
        updateUser,
        deleteUser,
        toggleUserStatus,
        changeUserPassword,
        adminResetUserPassword,
        requestersList,
        addRequester,
        deleteRequester,
        updateRequester,
        batchImportRequesters,
        products,
        categories,
        suppliers,
        transactions,
        addProduct,
        updateProduct,
        deleteProduct,
        recordStockMovement,
        applyStockAuditAdjustment,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        requests,
        createRequisitionRequest,
        approveRequisitionRequest,
        rejectRequisitionRequest,
        cancelRequisitionRequest,
        deleteRequisitionRequest,
        notifications,
        notificationSettings,
        addNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateNotificationSettings,
        sendTestNotification,
        departmentQuotas,
        updateDepartmentQuota,
        getDepartmentUsageThisMonth,
        exportSystemBackup,
        importSystemBackup,
        syncLocalToSupabase,
        clearAllData,
        resetToSampleData,
        loadSimulated500Data,
        getLowStockProducts,
        getOutOfStockProducts,
        getTotalInventoryValue,
        getTotalSellingValue,
      }}
    >
      {children}
    </StockContext.Provider>
  );
};

export const useStock = () => {
  const context = useContext(StockContext);
  if (!context) {
    throw new Error('useStock must be used within a StockProvider');
  }
  return context;
};
