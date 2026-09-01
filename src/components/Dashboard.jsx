import React, { useState, useMemo } from 'react';
import { useStock } from '../context/StockContext';
import {
  Package,
  AlertTriangle,
  XCircle,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  Clock,
  ArrowDownRight,
  ArrowUpRight,
  UserCheck,
  Building2,
  Building,
  Sparkles,
  Layers,
  ShoppingBag,
  Users,
  DollarSign,
  FileCheck,
  Award,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Activity,
  BarChart3,
  PieChart as PieIcon,
  Zap,
  Flame,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export const Dashboard = ({ onOpenStockIn, setSelectedProductId, setActiveTab }) => {
  const {
    products = [],
    categories = [],
    transactions = [],
    requests = [],
    requestersList = [],
    usersList = [],
    lang,
    getLowStockProducts,
    getOutOfStockProducts,
    user,
  } = useStock();

  const [selectedCompany, setSelectedCompany] = useState('ALL');
  const [itemFreqSort, setItemFreqSort] = useState('FREQ'); // 'FREQ' | 'QTY' | 'VALUE'
  const [itemFreqSearch, setItemFreqSearch] = useState('');
  const [itemFreqPage, setItemFreqPage] = useState(1);
  const [itemFreqPerPage, setItemFreqPerPage] = useState(5); // 5 | 10 | 20

  const isViewer = user?.role === 'viewer';
  const lowStockItems = getLowStockProducts();
  const outOfStockItems = getOutOfStockProducts();
  const totalItemsCount = products.reduce((sum, p) => sum + p.quantity, 0);

  // Available unique companies across the whole system
  const availableCompanies = useMemo(() => {
    const comps = new Set();
    transactions.forEach((tx) => {
      if (tx.requesterCompany) comps.add(tx.requesterCompany.trim());
    });
    requestersList.forEach((r) => {
      if (r.company) comps.add(r.company.trim());
    });
    usersList.forEach((u) => {
      if (u.company) comps.add(u.company.trim());
    });
    if (comps.size === 0) comps.add('EXION THAILAND');
    return Array.from(comps).filter(Boolean);
  }, [transactions, requestersList, usersList]);

  // Global Requisitions Count
  const totalRequisitionsCount = useMemo(() => {
    return transactions.filter((t) => t.type === 'OUT').reduce((sum, t) => sum + (t.quantity || 0), 0);
  }, [transactions]);

  // ---------------------------------------------------------------------------
  // 🏢 COMPANY REQUISITION VALUE & FREQUENCY METRICS (For Main Donut Chart)
  // ---------------------------------------------------------------------------
  const companyMetrics = useMemo(() => {
    const valueMap = {};
    const countMap = {};
    const txCountMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'OUT') {
        const comp = tx.requesterCompany ? tx.requesterCompany.trim() : 'EXION THAILAND';
        const qty = Number(tx.quantity) || 0;
        const prod = products.find((p) => p.id === tx.productId);
        const unitPrice =
          tx.unitPrice !== undefined && Number(tx.unitPrice) >= 0
            ? Number(tx.unitPrice)
            : prod?.costPrice || 0;
        const totalVal = qty * unitPrice;

        valueMap[comp] = (valueMap[comp] || 0) + totalVal;
        countMap[comp] = (countMap[comp] || 0) + qty;
        txCountMap[comp] = (txCountMap[comp] || 0) + 1;
      }
    });

    const totalValueAllCompanies = Object.values(valueMap).reduce((sum, v) => sum + v, 0);
    const totalQtyAllCompanies = Object.values(countMap).reduce((sum, c) => sum + c, 0);

    const valueChartData = Object.keys(valueMap)
      .map((comp) => ({
        name: comp,
        value: valueMap[comp],
        qty: countMap[comp] || 0,
        txCount: txCountMap[comp] || 0,
      }))
      .sort((a, b) => b.value - a.value);

    return {
      valueMap,
      countMap,
      txCountMap,
      totalValueAllCompanies,
      totalQtyAllCompanies,
      valueChartData,
    };
  }, [transactions, products]);

  // ---------------------------------------------------------------------------
  // 📈 REQUISITION FREQUENCY & VOLUME TRENDS (Last 7 Days)
  // ---------------------------------------------------------------------------
  const frequencyTrendData = useMemo(() => {
    const daysTh = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสฯ', 'ศุกร์', 'เสาร์'];
    const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const result = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = lang === 'th' ? daysTh[d.getDay()] : daysEn[d.getDay()];
      const dateStr = d.toLocaleDateString(lang === 'th' ? 'th-TH' : 'en-US', {
        day: 'numeric',
        month: 'short',
      });

      const dayTxs = transactions.filter((tx) => {
        const txDate = new Date(tx.date || tx.timestamp || tx.createdAt);
        return (
          txDate.getDate() === d.getDate() &&
          txDate.getMonth() === d.getMonth() &&
          txDate.getFullYear() === d.getFullYear()
        );
      });

      const outTxs = dayTxs.filter((t) => t.type === 'OUT');
      const inTxs = dayTxs.filter((t) => t.type === 'IN');

      const outQty = outTxs.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
      const inQty = inTxs.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
      const outFrequency = outTxs.length;

      result.push({
        day: `${dayName} (${dateStr})`,
        shortDay: dayName,
        frequency: outFrequency,
        outQty,
        inQty,
      });
    }

    const hasData = result.some((r) => r.outQty > 0 || r.inQty > 0 || r.frequency > 0);
    if (!hasData) {
      return [
        { day: 'จันทร์', shortDay: 'จันทร์', inQty: 12, outQty: 5, frequency: 3 },
        { day: 'อังคาร', shortDay: 'อังคาร', inQty: 8, outQty: 14, frequency: 6 },
        { day: 'พุธ', shortDay: 'พุธ', inQty: 15, outQty: 10, frequency: 5 },
        { day: 'พฤหัสฯ', shortDay: 'พฤหัสฯ', inQty: 6, outQty: 18, frequency: 8 },
        { day: 'ศุกร์', shortDay: 'ศุกร์', inQty: 20, outQty: 8, frequency: 4 },
        { day: 'เสาร์', shortDay: 'เสาร์', inQty: 4, outQty: 2, frequency: 1 },
        { day: 'อาทิตย์', shortDay: 'อาทิตย์', inQty: 2, outQty: 1, frequency: 1 },
      ];
    }

    return result;
  }, [transactions, lang]);

  // ---------------------------------------------------------------------------
  // ⚡ REQUISITION FREQUENCY PER INDIVIDUAL PRODUCT (ความถี่ในการเบิกแต่ละรายการ)
  // ---------------------------------------------------------------------------
  const productFrequencyList = useMemo(() => {
    const freqMap = {};

    transactions.forEach((tx) => {
      if (tx.type === 'OUT') {
        const pId = tx.productId;
        const prod = products.find((p) => p.id === pId);
        const name = tx.productName || prod?.name || 'อุปกรณ์';
        const sku = prod?.sku || tx.productSku || '-';
        const categoryId = prod?.category || tx.category || '-';
        const catObj = categories.find((c) => c.id === categoryId);
        const categoryName = catObj ? (lang === 'th' ? catObj.nameTh || catObj.name : catObj.name) : 'ทั่วไป';
        const unit = prod?.unit || tx.unit || 'ชิ้น';
        const currentStock = prod ? prod.quantity : 0;
        const unitCost =
          tx.unitPrice !== undefined && Number(tx.unitPrice) >= 0
            ? Number(tx.unitPrice)
            : prod?.costPrice || 0;
        const qty = Number(tx.quantity) || 0;
        const comp = tx.requesterCompany ? tx.requesterCompany.trim() : 'EXION THAILAND';
        const dept = tx.requesterDept ? tx.requesterDept.trim() : '-';

        if (!freqMap[pId || name]) {
          freqMap[pId || name] = {
            id: pId || name,
            productId: pId,
            name,
            sku,
            categoryName,
            unit,
            unitCost,
            currentStock,
            frequency: 0,
            totalQty: 0,
            totalValue: 0,
            companies: {},
            departments: {},
          };
        }

        freqMap[pId || name].frequency += 1;
        freqMap[pId || name].totalQty += qty;
        freqMap[pId || name].totalValue += qty * unitCost;
        freqMap[pId || name].companies[comp] = (freqMap[pId || name].companies[comp] || 0) + qty;
        if (dept !== '-') {
          freqMap[pId || name].departments[dept] = (freqMap[pId || name].departments[dept] || 0) + qty;
        }
      }
    });

    let list = Object.values(freqMap).map((item) => {
      const topCompEntry = Object.entries(item.companies).sort((a, b) => b[1] - a[1])[0];
      const topComp = topCompEntry ? `${topCompEntry[0]} (${topCompEntry[1]} ชิ้น)` : '-';

      return {
        ...item,
        topCompany: topComp,
      };
    });

    // Filter by search
    if (itemFreqSearch.trim()) {
      const q = itemFreqSearch.toLowerCase();
      list = list.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.sku.toLowerCase().includes(q) ||
          it.categoryName.toLowerCase().includes(q)
      );
    }

    // Sort by selected criteria
    if (itemFreqSort === 'FREQ') {
      list.sort((a, b) => b.frequency - a.frequency || b.totalQty - a.totalQty);
    } else if (itemFreqSort === 'QTY') {
      list.sort((a, b) => b.totalQty - a.totalQty || b.frequency - a.frequency);
    } else if (itemFreqSort === 'VALUE') {
      list.sort((a, b) => b.totalValue - a.totalValue);
    }

    const maxFrequency = list.length > 0 ? Math.max(...list.map((it) => it.frequency)) : 1;
    const maxQty = list.length > 0 ? Math.max(...list.map((it) => it.totalQty)) : 1;

    return {
      list,
      maxFrequency,
      maxQty,
    };
  }, [transactions, products, categories, lang, itemFreqSort, itemFreqSearch]);

  // Paginated Items Calculation
  const totalFilteredCount = productFrequencyList.list.length;
  const totalPages = Math.max(1, Math.ceil(totalFilteredCount / itemFreqPerPage));
  const validPage = Math.min(itemFreqPage, totalPages);
  const startIndex = (validPage - 1) * itemFreqPerPage;
  const endIndex = Math.min(startIndex + itemFreqPerPage, totalFilteredCount);
  const paginatedItems = productFrequencyList.list.slice(startIndex, endIndex);

  // --- Specific Company Calculations (When selectedCompany !== 'ALL') ---
  const companyTransactions = useMemo(() => {
    if (selectedCompany === 'ALL') return transactions;
    return transactions.filter((tx) => (tx.requesterCompany || 'EXION THAILAND') === selectedCompany);
  }, [transactions, selectedCompany]);

  const companyRequesters = useMemo(() => {
    if (selectedCompany === 'ALL') return requestersList;
    return requestersList.filter((r) => (r.company || 'EXION THAILAND') === selectedCompany);
  }, [requestersList, selectedCompany]);

  const companyRequests = useMemo(() => {
    if (selectedCompany === 'ALL') return requests;
    return requests.filter((r) => (r.requesterCompany || 'EXION THAILAND') === selectedCompany);
  }, [requests, selectedCompany]);

  const companyOutQty = useMemo(() => {
    return companyTransactions
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + (t.quantity || 0), 0);
  }, [companyTransactions]);

  const companyOutValue = useMemo(() => {
    return companyTransactions
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + (t.quantity || 0) * (t.unitPrice || 0), 0);
  }, [companyTransactions]);

  const companyPendingRequestsCount = useMemo(() => {
    return companyRequests.filter((r) => r.status === 'PENDING').length;
  }, [companyRequests]);

  // Specific Company Department Breakdown (For Company Dedicated Tab Only)
  const companyDeptMap = useMemo(() => {
    const map = {};
    companyTransactions.forEach((tx) => {
      if (tx.type === 'OUT') {
        const deptName = tx.requesterDept || 'สำนักงานทั่วไป/เบิกตรง';
        map[deptName] = (map[deptName] || 0) + (tx.quantity || 1);
      }
    });
    return map;
  }, [companyTransactions]);

  const companyDeptChartData = useMemo(() => {
    return Object.keys(companyDeptMap)
      .map((dept) => ({
        name: dept,
        value: companyDeptMap[dept],
      }))
      .sort((a, b) => b.value - a.value);
  }, [companyDeptMap]);

  const totalCompanyDeptRequisitions = companyDeptChartData.reduce((sum, d) => sum + d.value, 0) || 1;

  // Specific Company Top 5 Requisitioned Items with Frequency
  const companyTopItems = useMemo(() => {
    const prodMap = {};
    companyTransactions.forEach((tx) => {
      if (tx.type === 'OUT') {
        const pName = tx.productName || 'อุปกรณ์';
        const pQty = Number(tx.quantity) || 1;
        if (!prodMap[pName]) {
          prodMap[pName] = { name: pName, qty: 0, freq: 0 };
        }
        prodMap[pName].qty += pQty;
        prodMap[pName].freq += 1;
      }
    });
    return Object.values(prodMap)
      .sort((a, b) => b.freq - a.freq || b.qty - a.qty)
      .slice(0, 5);
  }, [companyTransactions]);

  // Specific Company Top Requesters
  const companyTopRequesters = useMemo(() => {
    const reqMap = {};
    companyTransactions.forEach((tx) => {
      if (tx.type === 'OUT' && (tx.requesterName || tx.customer)) {
        const person = tx.requesterName || tx.customer;
        reqMap[person] = {
          name: person,
          dept: tx.requesterDept || '-',
          qty: ((reqMap[person] && reqMap[person].qty) || 0) + (tx.quantity || 1),
          freq: ((reqMap[person] && reqMap[person].freq) || 0) + 1,
        };
      }
    });
    return Object.values(reqMap)
      .sort((a, b) => b.freq - a.freq || b.qty - a.qty)
      .slice(0, 5);
  }, [companyTransactions]);

  const COLORS = [
    '#2563eb', // Royal Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#e11d48', // Rose
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#14b8a6', // Teal
  ];

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(lang === 'th' ? 'th-TH' : 'en-US', {
      style: 'currency',
      currency: 'THB',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="dashboard-page">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <Building color="#4f46e5" />
            {lang === 'th' ? 'แผงควบคุมระบบอุปกรณ์สำนักงาน' : 'Office Asset Dashboard'}
          </h1>
          <p className="page-subtitle">
            {lang === 'th'
              ? 'สรุปภาพรวมปริมาณอุปกรณ์ คลังวัสดุ มูลค่า และสถิติความถี่การเบิกจ่ายของแต่ละบริษัทแบบเรียลไทม์'
              : 'Real-time metrics for office inventory, budget consumption and requisition frequency'}
          </p>
        </div>

        {/* Quick Shortcut into Requisition Portal */}
        <button
          className="btn btn-danger btn-lg shadow-md font-extrabold"
          onClick={() => setActiveTab('request-qr')}
        >
          <ShoppingBag size={20} />
          <span>{lang === 'th' ? '🛒 เข้าสู่หน้าขอเบิกอุปกรณ์' : 'Open Requisition Portal'}</span>
        </button>
      </div>

      {/* 🏢 COMPANY SELECTOR TABS BAR */}
      <div className="card company-nav-card mb-6">
        <div className="company-nav-header">
          <div className="flex-center gap-2">
            <Building2 size={20} className="text-primary" />
            <span className="font-extrabold text-sm text-slate-800">
              {lang === 'th' ? 'เลือกดูแดชบอร์ดตามบริษัท:' : 'Select Company Dashboard:'}
            </span>
          </div>
          <span className="text-xs text-muted">
            {lang === 'th'
              ? `พบ ${availableCompanies.length} บริษัทในระบบ`
              : `${availableCompanies.length} companies registered`}
          </span>
        </div>

        <div className="company-pills-bar">
          {/* Main Overview Tab */}
          <button
            type="button"
            className={`company-pill-btn ${selectedCompany === 'ALL' ? 'active main-active' : ''}`}
            onClick={() => setSelectedCompany('ALL')}
          >
            <Layers size={16} />
            <span className="pill-title">
              {lang === 'th' ? '🏢 ภาพรวมคลังหลัก (ทุกบริษัท)' : 'Global Overview (All Companies)'}
            </span>
            <span className="pill-badge">
              {formatCurrency(companyMetrics.totalValueAllCompanies)} ({companyMetrics.totalQtyAllCompanies} {lang === 'th' ? 'ชิ้น' : 'Units'})
            </span>
          </button>

          {/* Individual Company Tabs */}
          {availableCompanies.map((comp) => {
            const compVal = companyMetrics.valueMap[comp] || 0;
            const compCount = companyMetrics.countMap[comp] || 0;
            const isSelected = selectedCompany === comp;
            return (
              <button
                key={comp}
                type="button"
                className={`company-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => setSelectedCompany(comp)}
              >
                <Building2 size={16} />
                <span className="pill-title">{comp}</span>
                <span className="pill-badge">
                  {formatCurrency(compVal)} ({compCount} {lang === 'th' ? 'ชิ้น' : 'Units'})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          VIEW A: MAIN OVERVIEW DASHBOARD (selectedCompany === 'ALL')
          ========================================================================= */}
      {selectedCompany === 'ALL' ? (
        <>
          {/* 4 Global KPI Stat Cards */}
          <div className="kpi-grid mb-6">
            <div className="card kpi-card">
              <div className="kpi-icon-container bg-indigo">
                <Package size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'รายการอุปกรณ์ทั้งหมด' : 'Total Asset Types'}</div>
                <div className="kpi-number">
                  {products.length} <span className="kpi-unit">{lang === 'th' ? 'ชนิด' : 'types'}</span>
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-emerald">
                <TrendingUp size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'อุปกรณ์พร้อมใช้งานในคลัง' : 'Total Stock Units'}</div>
                <div className="kpi-number">
                  {totalItemsCount} <span className="kpi-unit">{lang === 'th' ? 'ชิ้น' : 'units'}</span>
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-rose">
                <DollarSign size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'มูลค่าเบิกจ่ายสะสมรวมทุกบริษัท' : 'Total Requisition Value'}</div>
                <div className="kpi-number text-rose" style={{ fontSize: '1.45rem' }}>
                  {formatCurrency(companyMetrics.totalValueAllCompanies)}
                  <span className="kpi-unit" style={{ fontSize: '0.78rem', display: 'block', marginTop: '2px' }}>
                    ({companyMetrics.totalQtyAllCompanies} {lang === 'th' ? 'ชิ้น' : 'units'})
                  </span>
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-amber">
                <AlertTriangle size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'อุปกรณ์เหลือน้อย / หมด' : 'Low / Out of Stock'}</div>
                <div className="kpi-number text-amber">
                  {lowStockItems.length + outOfStockItems.length}{' '}
                  <span className="kpi-unit">{lang === 'th' ? 'รายการ' : 'items'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Charts Grid: Frequency Line/Area Trend + Company Value Donut Chart */}
          <div className="charts-grid mb-6">
            {/* Chart 1: Requisition Frequency & Volume Trends (7 Days) */}
            <div className="card chart-card">
              <div className="chart-header flex-between">
                <div>
                  <h3 className="chart-title font-extrabold text-base flex-center gap-2">
                    <Activity size={20} color="#2563eb" />
                    <span>{lang === 'th' ? '📈 ความถี่และแนวโน้มการเบิกจ่ายอุปกรณ์ (7 วันล่าสุด)' : 'Requisition Frequency & Volume'}</span>
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {lang === 'th' ? 'สถิติจำนวนครั้ง (ความถี่) และปริมาณชิ้นที่เบิกจ่ายเปรียบเทียบกับยอดรับเข้า' : 'Daily transaction frequency and units movement'}
                  </p>
                </div>
                <div className="flex-center gap-2">
                  <span className="badge badge-danger text-xxs font-mono font-bold">
                    ⚡ {lang === 'th' ? 'ความถี่ (ครั้ง)' : 'Freq (Times)'}
                  </span>
                  <span className="badge badge-primary text-xxs font-mono font-bold">
                    📦 {lang === 'th' ? 'เบิกจ่าย (ชิ้น)' : 'Out (Units)'}
                  </span>
                </div>
              </div>

              <div style={{ width: '100%', height: 270 }} className="mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={frequencyTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorOutMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorFreq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                      </linearGradient>
                      <linearGradient id="colorInMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" opacity={0.6} />
                    <XAxis dataKey="shortDay" stroke="var(--text-muted)" fontSize={11} tickLine={false} />
                    <YAxis stroke="var(--text-muted)" width={36} fontSize={11} tickLine={false} />
                    <Tooltip
                      formatter={(val, name) => [
                        name === 'ความถี่ในการเบิก' || name === 'Frequency'
                          ? `${val} ครั้ง`
                          : `${val} ชิ้น`,
                        name,
                      ]}
                      contentStyle={{
                        backgroundColor: 'var(--bg-surface)',
                        borderColor: 'var(--border-color)',
                        borderRadius: '12px',
                        boxShadow: 'var(--shadow-lg)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                      }}
                    />
                    {/* Requisition Units Volume */}
                    <Area
                      type="monotone"
                      dataKey="outQty"
                      stroke="#2563eb"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorOutMain)"
                      name={lang === 'th' ? 'ยอดเบิกจ่าย (ชิ้น)' : 'Units Requisitioned'}
                    />
                    {/* Requisition Frequency (Count of transactions) */}
                    <Area
                      type="monotone"
                      dataKey="frequency"
                      stroke="#e11d48"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      fillOpacity={1}
                      fill="url(#colorFreq)"
                      name={lang === 'th' ? 'ความถี่ในการเบิก' : 'Frequency'}
                    />
                    {/* Stock In Units */}
                    <Area
                      type="monotone"
                      dataKey="inQty"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorInMain)"
                      name={lang === 'th' ? 'รับเข้าคลัง (ชิ้น)' : 'Stock In'}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: DONUT CHART - Requisition Value Breakdown by Company (in ฿) */}
            <div className="card chart-card flex-column">
              <div className="chart-header w-100 mb-2">
                <h3 className="chart-title font-extrabold text-base flex-between">
                  <span className="flex-center gap-1.5">
                    <PieIcon size={18} color="#2563eb" />
                    {lang === 'th' ? 'สัดส่วนมูลค่าการเบิกแยกตามบริษัท' : 'Requisition Value by Company'}
                  </span>
                  <span className="badge badge-success text-xxs font-mono font-bold">
                    {formatCurrency(companyMetrics.totalValueAllCompanies)}
                  </span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {lang === 'th' ? 'เปรียบเทียบยอดมูลค่า (บาท) ที่แต่ละบริษัทเบิกใช้จริง' : 'Spending share in THB across registered companies'}
                </p>
              </div>

              {companyMetrics.valueChartData.length === 0 ? (
                <div className="flex-center flex-column py-8 text-muted text-sm">
                  <Building2 size={36} color="#cbd5e1" className="mb-2" />
                  <span>{lang === 'th' ? 'ยังไม่มีประวัติการเบิกอุปกรณ์' : 'No requisition records yet'}</span>
                </div>
              ) : (
                <div className="dept-breakdown-container">
                  {/* Donut Graphic with Total Spending Value in Center */}
                  <div className="donut-chart-wrapper" style={{ width: '100%', height: 160, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={companyMetrics.valueChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={48}
                          outerRadius={72}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {companyMetrics.valueChartData.map((entry, index) => (
                            <Cell key={`comp-val-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val, name, item) => [
                            `${formatCurrency(val)} (${item.payload.qty} ชิ้น • ${(
                              (val / (companyMetrics.totalValueAllCompanies || 1)) * 100
                            ).toFixed(1)}%)`,
                            'มูลค่าที่เบิก',
                          ]}
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Clean Company Value Breakdown List with Progress Bars & Quick Nav */}
                  <div className="dept-breakdown-list">
                    {companyMetrics.valueChartData.map((comp, index) => {
                      const percent = (
                        (comp.value / (companyMetrics.totalValueAllCompanies || 1)) * 100
                      ).toFixed(1);
                      const color = COLORS[index % COLORS.length];
                      return (
                        <div
                          key={comp.name}
                          className="dept-breakdown-item cursor-pointer"
                          onClick={() => setSelectedCompany(comp.name)}
                          title={lang === 'th' ? `คลิกเพื่อเปิดแดชบอร์ดของ ${comp.name}` : `View ${comp.name} dashboard`}
                        >
                          <div className="flex-between text-xs mb-1">
                            <div className="flex-center gap-1.5" style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: color,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                className="font-bold text-slate-800 text-truncate"
                                title={comp.name}
                                style={{ maxWidth: '140px' }}
                              >
                                {comp.name}
                              </span>
                            </div>
                            <div className="flex-center gap-2 font-mono" style={{ flexShrink: 0 }}>
                              <span className="font-extrabold text-primary">{formatCurrency(comp.value)}</span>
                              <span className="text-muted text-xxs font-bold" style={{ width: '38px', textAlign: 'right' }}>
                                {percent}%
                              </span>
                            </div>
                          </div>
                          <div className="dept-progress-track">
                            <div
                              className="dept-progress-bar"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          <div className="flex-between text-xxs text-muted mt-1 font-mono">
                            <span>📦 {comp.qty} ชิ้น</span>
                            <span>⚡ {comp.txCount} ครั้ง</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ===================================================================
              ⚡ COMPACT & FITTED REQUISITION FREQUENCY PER ITEM SECTION
              =================================================================== */}
          <div className="card item-frequency-card mb-6">
            <div className="panel-header mb-3 flex-between flex-wrap gap-2">
              <div>
                <h3 className="font-extrabold text-base flex-center gap-2 text-slate-800">
                  <Flame size={20} color="#e11d48" />
                  <span>{lang === 'th' ? '⚡ สถิติความถี่ในการเบิกอุปกรณ์แต่ละรายการ' : 'Item Requisition Frequency Ranking'}</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {lang === 'th'
                    ? 'วิเคราะห์ความถี่ (จำนวนครั้งที่ถูกเบิก) ปริมาณชิ้น และมูลค่าการใช้งานของอุปกรณ์แต่ละชนิด'
                    : 'Analyze how frequently and heavily each equipment is requested'}
                </p>
              </div>

              {/* Toolbar: Sort Tabs, Search & Rows Per Page */}
              <div className="flex-center gap-2 flex-wrap">
                {/* Search Box */}
                <div className="search-box" style={{ maxWidth: '180px' }}>
                  <Search size={13} className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.5rem 0.3rem 1.7rem' }}
                    placeholder={lang === 'th' ? 'ค้นหาอุปกรณ์...' : 'Search items...'}
                    value={itemFreqSearch}
                    onChange={(e) => {
                      setItemFreqSearch(e.target.value);
                      setItemFreqPage(1);
                    }}
                  />
                </div>

                {/* Sort Toggle Buttons */}
                <div className="freq-sort-pills">
                  <button
                    type="button"
                    className={`freq-pill-btn ${itemFreqSort === 'FREQ' ? 'active' : ''}`}
                    onClick={() => {
                      setItemFreqSort('FREQ');
                      setItemFreqPage(1);
                    }}
                  >
                    ⚡ {lang === 'th' ? 'ความถี่ (ครั้ง)' : 'Frequency'}
                  </button>
                  <button
                    type="button"
                    className={`freq-pill-btn ${itemFreqSort === 'QTY' ? 'active' : ''}`}
                    onClick={() => {
                      setItemFreqSort('QTY');
                      setItemFreqPage(1);
                    }}
                  >
                    📦 {lang === 'th' ? 'จำนวนชิ้น' : 'Units'}
                  </button>
                  <button
                    type="button"
                    className={`freq-pill-btn ${itemFreqSort === 'VALUE' ? 'active' : ''}`}
                    onClick={() => {
                      setItemFreqSort('VALUE');
                      setItemFreqPage(1);
                    }}
                  >
                    💰 {lang === 'th' ? 'มูลค่า (บาท)' : 'Value'}
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Scroll Container with Fixed Sticky Header (Desktop) */}
            <div className="desktop-freq-table freq-table-scroll-container">
              <table className="data-table freq-table">
                <thead>
                  <tr>
                    <th style={{ width: '50px', textAlign: 'center' }}>{lang === 'th' ? 'อันดับ' : 'Rank'}</th>
                    <th style={{ minWidth: '160px' }}>{lang === 'th' ? 'รายการอุปกรณ์สำนักงาน' : 'Asset & Category'}</th>
                    <th style={{ minWidth: '150px' }}>{lang === 'th' ? '⚡ ความถี่ในการเบิก' : 'Frequency'}</th>
                    <th style={{ minWidth: '110px' }}>{lang === 'th' ? '📦 ยอดเบิกสะสม' : 'Total Requisitioned'}</th>
                    <th style={{ minWidth: '100px' }}>{lang === 'th' ? '💰 มูลค่าที่เบิก' : 'Total Value'}</th>
                    <th style={{ minWidth: '140px' }}>{lang === 'th' ? '🏢 บริษัทที่เบิกบ่อยสุด' : 'Top Requesting Company'}</th>
                    <th style={{ minWidth: '95px', textAlign: 'center' }}>{lang === 'th' ? 'คงเหลือในคลัง' : 'Stock'}</th>
                  </tr>
                </thead>
                <tbody>
                  {productFrequencyList.list.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-6 text-muted text-xs">
                        {lang === 'th' ? 'ไม่พบข้อมูลความถี่การเบิกอุปกรณ์' : 'No requisition records found'}
                      </td>
                    </tr>
                  ) : (
                    paginatedItems.map((item, idx) => {
                      const absoluteRank = startIndex + idx + 1;
                      const freqPercent = Math.min(
                        100,
                        Math.max(8, (item.frequency / (productFrequencyList.maxFrequency || 1)) * 100)
                      );
                      const isHot = absoluteRank <= 3 && item.frequency >= 2;

                      return (
                        <tr key={item.id} className="freq-row">
                          <td className="text-center font-mono">
                            <span className={`rank-pill ${absoluteRank === 1 ? 'rank-gold' : absoluteRank === 2 ? 'rank-silver' : absoluteRank === 3 ? 'rank-bronze' : 'rank-normal'}`}>
                              #{absoluteRank}
                            </span>
                          </td>
                          <td>
                            <div className="item-name-cell">
                              <div className="font-bold text-slate-800 text-xs flex-center gap-1.5 justify-start">
                                <span className="text-truncate" style={{ maxWidth: '180px' }} title={item.name}>
                                  {item.name}
                                </span>
                                {isHot && (
                                  <span className="badge badge-danger text-xxs font-bold" style={{ padding: '0px 4px', fontSize: '0.6rem' }}>
                                    🔥 HOT
                                  </span>
                                )}
                              </div>
                              <div className="text-xxs text-muted flex-center gap-1.5 justify-start mt-0.5">
                                <span className="font-mono">{item.sku}</span>
                                <span>•</span>
                                <span className="font-semibold text-primary">{item.categoryName}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="freq-bar-cell">
                              <div className="flex-between text-xs font-mono mb-0.5">
                                <span className="font-extrabold text-rose flex-center gap-1">
                                  <Zap size={11} color="#e11d48" />
                                  <span>{item.frequency} ครั้ง</span>
                                </span>
                                <span className="text-xxs text-muted font-bold">
                                  {freqPercent.toFixed(0)}%
                                </span>
                              </div>
                              <div className="freq-progress-track">
                                <div
                                  className="freq-progress-bar"
                                  style={{
                                    width: `${freqPercent}%`,
                                    background: absoluteRank === 1
                                      ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                                      : absoluteRank <= 3
                                      ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                                      : '#64748b',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="font-mono font-bold text-slate-800 text-xs">
                              {item.totalQty} {item.unit}
                            </span>
                          </td>
                          <td>
                            <span className="font-mono font-bold text-emerald text-xs">
                              {formatCurrency(item.totalValue)}
                            </span>
                          </td>
                          <td>
                            <span className="text-xs font-bold text-primary text-truncate block" style={{ maxWidth: '150px' }} title={item.topCompany}>
                              {item.topCompany}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${item.currentStock === 0 ? 'badge-danger' : item.currentStock <= 5 ? 'badge-warning' : 'badge-success'} font-mono text-xxs`}>
                              {item.currentStock} {item.unit}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View for Item Frequency */}
            <div className="mobile-freq-list">
              {productFrequencyList.list.length === 0 ? (
                <div className="text-center py-6 text-muted text-xs">
                  {lang === 'th' ? 'ไม่พบข้อมูลความถี่การเบิกอุปกรณ์' : 'No requisition records found'}
                </div>
              ) : (
                paginatedItems.map((item, idx) => {
                  const absoluteRank = startIndex + idx + 1;
                  const freqPercent = Math.min(
                    100,
                    Math.max(8, (item.frequency / (productFrequencyList.maxFrequency || 1)) * 100)
                  );

                  return (
                    <div key={item.id} className="mobile-freq-card">
                      <div className="flex-between mb-1">
                        <div className="flex-center gap-1.5" style={{ minWidth: 0, flex: 1 }}>
                          <span className={`rank-pill ${absoluteRank === 1 ? 'rank-gold' : absoluteRank === 2 ? 'rank-silver' : absoluteRank === 3 ? 'rank-bronze' : 'rank-normal'}`}>
                            #{absoluteRank}
                          </span>
                          <span className="font-bold text-xs text-slate-800 text-truncate" title={item.name}>
                            {item.name}
                          </span>
                        </div>
                        <span className={`badge ${item.currentStock === 0 ? 'badge-danger' : item.currentStock <= 5 ? 'badge-warning' : 'badge-success'} font-mono text-xxs`}>
                          เหลือ {item.currentStock} {item.unit}
                        </span>
                      </div>

                      <div className="flex-between text-xxs text-muted mb-1 font-mono">
                        <span>Tag: {item.sku} • <strong className="text-primary">{item.categoryName}</strong></span>
                        <span className="text-emerald font-bold">{formatCurrency(item.totalValue)}</span>
                      </div>

                      {/* Progress Track */}
                      <div className="freq-progress-track mb-1.5">
                        <div
                          className="freq-progress-bar"
                          style={{
                            width: `${freqPercent}%`,
                            background: absoluteRank === 1
                              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                              : absoluteRank <= 3
                              ? 'linear-gradient(90deg, #3b82f6, #8b5cf6)'
                              : '#64748b',
                          }}
                        />
                      </div>

                      <div className="flex-between text-xxs text-muted font-mono">
                        <span className="text-rose font-bold">⚡ เบิก {item.frequency} ครั้ง ({item.totalQty} {item.unit})</span>
                        <span className="text-truncate text-primary font-bold" style={{ maxWidth: '130px' }}>🏢 {item.topCompany}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Smart Compact Pagination & Rows Per Page Toolbar */}
            <div className="freq-pagination-bar flex-between flex-wrap gap-2 mt-3 pt-2 border-top">
              <div className="text-xs text-muted font-medium">
                {totalFilteredCount > 0
                  ? (lang === 'th'
                      ? `แสดง ${startIndex + 1} - ${endIndex} จากทั้งหมด ${totalFilteredCount} รายการ`
                      : `Showing ${startIndex + 1} - ${endIndex} of ${totalFilteredCount} items`)
                  : (lang === 'th' ? 'ไม่พบรายการ' : 'No items')}
              </div>

              <div className="flex-center gap-3">
                {/* Rows per page selector */}
                <div className="flex-center gap-1.5 text-xs text-muted">
                  <span>{lang === 'th' ? 'แสดง:' : 'Rows:'}</span>
                  {[5, 10, 20].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`btn-page-size ${itemFreqPerPage === num ? 'active' : ''}`}
                      onClick={() => {
                        setItemFreqPerPage(num);
                        setItemFreqPage(1);
                      }}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                {/* Page Navigation Buttons */}
                <div className="flex-center gap-1">
                  <button
                    type="button"
                    className="btn btn-outline btn-xs font-bold"
                    disabled={validPage <= 1}
                    onClick={() => setItemFreqPage((p) => Math.max(1, p - 1))}
                    title={lang === 'th' ? 'หน้าก่อนหน้า' : 'Previous page'}
                  >
                    <ChevronLeft size={13} />
                  </button>

                  <span className="font-mono text-xs font-bold px-2">
                    {validPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    className="btn btn-outline btn-xs font-bold"
                    disabled={validPage >= totalPages}
                    onClick={() => setItemFreqPage((p) => Math.min(totalPages, p + 1))}
                    title={lang === 'th' ? 'หน้าถัดไป' : 'Next page'}
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Urgent Restock + Live Requisition Feed */}
          <div className="dashboard-bottom-grid">
            {/* Urgent Restock Table */}
            <div className="card">
              <div className="panel-header mb-4 flex-between">
                <div>
                  <h3 className="font-extrabold text-base flex-center gap-2">
                    <AlertTriangle size={18} color="#f59e0b" />
                    {lang === 'th' ? 'อุปกรณ์ที่ต้องเติมสต็อกด่วน' : 'Urgent Restock Needed'}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {lang === 'th' ? 'อุปกรณ์ที่ใกล้หมดคลังหรือหมดแล้ว' : 'Low stock alerts'}
                  </p>
                </div>
                {!isViewer && (
                  <button className="btn btn-sm btn-primary" onClick={onOpenStockIn}>
                    <PlusCircle size={15} />
                    <span>{lang === 'th' ? '+ รับเข้าของ' : '+ Restock'}</span>
                  </button>
                )}
              </div>

              {/* Desktop Table View */}
              <div className="desktop-urgent-table table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{lang === 'th' ? 'อุปกรณ์สำนักงาน' : 'Asset'}</th>
                      <th>{lang === 'th' ? 'Asset Tag' : 'Asset Tag'}</th>
                      <th>{lang === 'th' ? 'คงเหลือ' : 'In Stock'}</th>
                      {!isViewer && <th className="text-right">{lang === 'th' ? 'จัดการ' : 'Action'}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                      <tr>
                        <td colSpan={isViewer ? '3' : '4'} className="text-center py-6 text-muted">
                          🎉 {lang === 'th' ? 'คลังอุปกรณ์มีความพร้อมใช้งานทุกรายการ' : 'All items well stocked!'}
                        </td>
                      </tr>
                    ) : (
                      [...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => (
                        <tr key={prod.id}>
                          <td className="font-bold">{prod.name}</td>
                          <td className="font-mono text-xs text-muted">{prod.sku}</td>
                          <td>
                            <span className={`badge ${prod.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                              {prod.quantity === 0 ? (lang === 'th' ? 'หมด' : 'Out') : `${prod.quantity} ${prod.unit}`}
                            </span>
                          </td>
                          {!isViewer && (
                            <td className="text-right">
                              <button
                                className="btn btn-xs btn-success"
                                onClick={() => {
                                  setSelectedProductId(prod.id);
                                  onOpenStockIn();
                                }}
                              >
                                + {lang === 'th' ? 'เติม' : 'Restock'}
                              </button>
                            </td>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="mobile-urgent-list">
                {lowStockItems.length === 0 && outOfStockItems.length === 0 ? (
                  <div className="text-center py-4 text-muted text-xs">
                    🎉 {lang === 'th' ? 'คลังอุปกรณ์มีความพร้อมใช้งานทุกรายการ' : 'All items well stocked!'}
                  </div>
                ) : (
                  [...outOfStockItems, ...lowStockItems].slice(0, 5).map((prod) => (
                    <div key={prod.id} className="mobile-urgent-item">
                      <div className="urgent-item-left">
                        <div className="urgent-item-name">{prod.name}</div>
                        <div className="urgent-item-sku">Tag: <span className="font-mono">{prod.sku}</span></div>
                      </div>
                      <div className="urgent-item-right">
                        <span className={`badge ${prod.quantity === 0 ? 'badge-danger' : 'badge-warning'}`}>
                          {prod.quantity === 0 ? (lang === 'th' ? 'หมด' : 'Out') : `${prod.quantity} ${prod.unit}`}
                        </span>
                        {!isViewer && (
                          <button
                            className="btn btn-xs btn-success font-bold"
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              onOpenStockIn();
                            }}
                          >
                            <PlusCircle size={13} /> + เติม
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Live Requisitions Activity */}
            <div className="card">
              <div className="panel-header mb-4 flex-between">
                <div>
                  <h3 className="font-extrabold text-base flex-center gap-2">
                    <Clock size={18} color="#6366f1" />
                    {lang === 'th' ? 'รายการเบิกจ่ายล่าสุด' : 'Recent Activity'}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {lang === 'th' ? 'บันทึกการเบิกล่าสุดแบบเรียลไทม์' : 'Live timeline'}
                  </p>
                </div>
                <button className="btn btn-ghost btn-xs" onClick={() => setActiveTab('history')}>
                  {lang === 'th' ? 'ดูทั้งหมด' : 'View All'}
                </button>
              </div>

              <div className="activity-timeline">
                {transactions.slice(0, 5).map((tx) => {
                  const targetProd = products.find((p) => p.id === tx.productId);
                  return (
                    <div key={tx.id} className="activity-item">
                      <div className={`activity-icon-badge ${tx.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                        {tx.type === 'IN' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                      </div>
                      <div className="activity-details">
                        <div className="flex-between">
                          <span className="font-bold text-sm">{targetProd ? targetProd.name : 'อุปกรณ์'}</span>
                          <span className={`font-extrabold text-sm ${tx.type === 'IN' ? 'text-green' : 'text-red'}`}>
                            {tx.type === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                          </span>
                        </div>
                        <div className="activity-sub">
                          {tx.type === 'IN'
                            ? lang === 'th'
                              ? '🟢 รับเข้าคลัง'
                              : 'Stock In'
                            : `👤 ${tx.requesterName || tx.customer || 'พนักงาน'} (${tx.requesterCompany || 'EXION THAILAND'})`}
                          <span className="activity-time ml-2 font-mono text-muted">
                            {new Date(tx.date || tx.timestamp || tx.createdAt).toLocaleDateString('th-TH', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        /* =========================================================================
           VIEW B: SPECIFIC COMPANY DASHBOARD (selectedCompany === 'EXION THAILAND'...)
           ========================================================================= */
        <div className="company-dashboard-view">
          {/* Company Title Banner */}
          <div className="card company-hero-banner mb-6">
            <div className="company-hero-left">
              <div className="company-avatar-box">
                <Building2 size={32} color="#1d4ed8" />
              </div>
              <div>
                <div className="flex-center gap-2 mb-1">
                  <span className="badge badge-primary font-bold text-xs">🏢 COMPANY METRICS</span>
                  <span className="text-xs text-muted font-mono">LIVE ANALYTICS</span>
                </div>
                <h2 className="company-hero-title font-extrabold text-xl text-slate-800">
                  {selectedCompany}
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  {lang === 'th'
                    ? `ศูนย์รวมสถิติ ข้อมูลการเบิกใช้วัสดุอุปกรณ์ และพนักงานของบริษัท ${selectedCompany}`
                    : `Equipment consumption and employee requisition analytics for ${selectedCompany}`}
                </p>
              </div>
            </div>

            <div className="company-hero-right">
              <button
                type="button"
                className="btn btn-outline btn-sm font-bold"
                onClick={() => setSelectedCompany('ALL')}
              >
                ← {lang === 'th' ? 'กลับสู่ภาพรวมหลัก' : 'Back to Overview'}
              </button>
            </div>
          </div>

          {/* 4 Company-Specific KPI Stat Cards */}
          <div className="kpi-grid mb-6">
            <div className="card kpi-card">
              <div className="kpi-icon-container bg-indigo">
                <Users size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'พนักงาน/ผู้เบิกในบริษัทนี้' : 'Registered Requesters'}</div>
                <div className="kpi-number">
                  {companyRequesters.length}{' '}
                  <span className="kpi-unit">{lang === 'th' ? 'ท่าน' : 'people'}</span>
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-rose">
                <MinusCircle size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'ยอดเบิกจ่ายสะสมของบริษัทนี้' : 'Company Total Requisitioned'}</div>
                <div className="kpi-number text-rose">
                  {companyOutQty} <span className="kpi-unit">{lang === 'th' ? 'ชิ้น' : 'units'}</span>
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-emerald">
                <DollarSign size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'มูลค่าการเบิกใช้รวม' : 'Total Requisition Value'}</div>
                <div className="kpi-number text-emerald" style={{ fontSize: '1.45rem' }}>
                  {formatCurrency(companyOutValue)}
                </div>
              </div>
            </div>

            <div className="card kpi-card">
              <div className="kpi-icon-container bg-amber">
                <FileCheck size={26} />
              </div>
              <div className="kpi-content">
                <div className="kpi-label">{lang === 'th' ? 'คำขอเบิกรอดำเนินการ' : 'Pending Requests'}</div>
                <div className="kpi-number text-amber">
                  {companyPendingRequestsCount}{' '}
                  <span className="kpi-unit">{lang === 'th' ? 'รายการ' : 'requests'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Analytics Charts Grid */}
          <div className="charts-grid mb-6">
            {/* Chart 1: Department Breakdown inside this Company */}
            <div className="card chart-card flex-column">
              <div className="chart-header w-100 mb-2">
                <h3 className="chart-title font-extrabold text-base flex-between">
                  <span>{lang === 'th' ? `📊 สัดส่วนการเบิกแยกตามแผนก (${selectedCompany})` : 'Requisitions by Dept'}</span>
                  <span className="badge badge-primary text-xxs font-mono">
                    {companyOutQty} {lang === 'th' ? 'ชิ้น' : 'Units'}
                  </span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {lang === 'th'
                    ? `ปริมาณการเบิกใช้อุปกรณ์สำนักงานแยกตามแต่ละแผนกของ ${selectedCompany}`
                    : `Department breakdown for ${selectedCompany}`}
                </p>
              </div>

              {companyDeptChartData.length === 0 ? (
                <div className="flex-center flex-column py-8 text-muted text-sm">
                  <Building2 size={36} color="#cbd5e1" className="mb-2" />
                  <span>{lang === 'th' ? 'ยังไม่มีประวัติการเบิกของบริษัทนี้' : 'No requisition records yet'}</span>
                </div>
              ) : (
                <div className="dept-breakdown-container">
                  <div className="donut-chart-wrapper" style={{ width: '100%', height: 160, position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={companyDeptChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {companyDeptChartData.map((entry, index) => (
                            <Cell key={`comp-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(val) => [
                            `${val} ชิ้น (${((val / totalCompanyDeptRequisitions) * 100).toFixed(1)}%)`,
                            'ยอดเบิก',
                          ]}
                          contentStyle={{
                            backgroundColor: 'var(--bg-surface)',
                            borderColor: 'var(--border-color)',
                            borderRadius: '8px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="dept-breakdown-list">
                    {companyDeptChartData.map((dept, index) => {
                      const percent = ((dept.value / totalCompanyDeptRequisitions) * 100).toFixed(0);
                      const color = COLORS[index % COLORS.length];
                      return (
                        <div key={dept.name} className="dept-breakdown-item">
                          <div className="flex-between text-xs mb-1">
                            <div className="flex-center gap-1.5" style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  width: '8px',
                                  height: '8px',
                                  borderRadius: '50%',
                                  backgroundColor: color,
                                  flexShrink: 0,
                                }}
                              />
                              <span
                                className="font-semibold text-truncate"
                                title={dept.name}
                                style={{ maxWidth: '140px' }}
                              >
                                {dept.name}
                              </span>
                            </div>
                            <div className="flex-center gap-2 font-mono" style={{ flexShrink: 0 }}>
                              <span className="font-bold text-slate-800">{dept.value} ชิ้น</span>
                              <span className="text-muted text-xxs font-bold" style={{ width: '28px', textAlign: 'right' }}>
                                {percent}%
                              </span>
                            </div>
                          </div>
                          <div className="dept-progress-track">
                            <div
                              className="dept-progress-bar"
                              style={{
                                width: `${percent}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Chart 2: Top 5 Requisitioned Items in this Company */}
            <div className="card chart-card flex-column">
              <div className="chart-header w-100 mb-2">
                <h3 className="chart-title font-extrabold text-base flex-center gap-2">
                  <Award size={20} color="#f59e0b" />
                  <span>{lang === 'th' ? '🏆 5 อันดับอุปกรณ์ที่เบิกใช้สูงสุด' : 'Top 5 Requisitioned Assets'}</span>
                </h3>
                <p className="text-xs text-muted mt-0.5">
                  {lang === 'th' ? `อุปกรณ์ที่พนักงานใน ${selectedCompany} นิยมเบิกมากที่สุด` : `Most popular items in ${selectedCompany}`}
                </p>
              </div>

              {companyTopItems.length === 0 ? (
                <div className="flex-center flex-column py-8 text-muted text-sm">
                  <Package size={36} color="#cbd5e1" className="mb-2" />
                  <span>{lang === 'th' ? 'ยังไม่มีข้อมูลการเบิก' : 'No items data yet'}</span>
                </div>
              ) : (
                <div className="top-items-list mt-2">
                  {companyTopItems.map((item, idx) => (
                    <div key={item.name} className="top-item-row">
                      <div className="flex-center gap-2">
                        <span className={`rank-badge rank-${idx + 1}`}>#{idx + 1}</span>
                        <span className="font-bold text-xs text-slate-800">{item.name}</span>
                      </div>
                      <div className="flex-center gap-2 font-mono text-xs">
                        <span className="badge badge-danger text-xxs font-bold">⚡ {item.freq} ครั้ง</span>
                        <span className="font-extrabold text-slate-800">{item.qty} ชิ้น</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Company Bottom Row: Top Requesters & Company Activity Timeline */}
          <div className="dashboard-bottom-grid">
            {/* Top Requesters in this Company */}
            <div className="card">
              <div className="panel-header mb-4 flex-between">
                <div>
                  <h3 className="font-extrabold text-base flex-center gap-2">
                    <UserCheck size={18} color="#059669" />
                    {lang === 'th' ? 'ผู้เบิกใช้อุปกรณ์สูงสุดในบริษัท' : 'Top Requesters in Company'}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {lang === 'th' ? `พนักงานใน ${selectedCompany} ที่มีการเบิกอุปกรณ์บ่อยที่สุด` : 'Most active users'}
                  </p>
                </div>
              </div>

              {companyTopRequesters.length === 0 ? (
                <div className="text-center py-6 text-muted text-xs">
                  {lang === 'th' ? 'ยังไม่มีประวัติการเบิกรายบุคคล' : 'No requesters activity yet'}
                </div>
              ) : (
                <div className="top-requesters-list">
                  {companyTopRequesters.map((req, idx) => (
                    <div key={req.name} className="top-requester-card">
                      <div className="flex-center gap-2.5">
                        <div className="requester-avatar">
                          {req.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-slate-800">{req.name}</div>
                          <div className="text-xxs text-muted">{req.dept}</div>
                        </div>
                      </div>
                      <div className="text-right flex-center gap-2 font-mono text-xs">
                        <span className="badge badge-danger text-xxs font-bold">⚡ {req.freq} ครั้ง</span>
                        <span className="font-extrabold text-primary">{req.qty} ชิ้น</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Timeline for this Company */}
            <div className="card">
              <div className="panel-header mb-4 flex-between">
                <div>
                  <h3 className="font-extrabold text-base flex-center gap-2">
                    <Clock size={18} color="#6366f1" />
                    {lang === 'th' ? 'ความเคลื่อนไหวล่าสุดของบริษัทนี้' : 'Recent Company Activity'}
                  </h3>
                  <p className="text-xs text-muted mt-1">
                    {lang === 'th' ? `ประวัติการทำรายการเฉพาะ ${selectedCompany}` : 'Live timeline'}
                  </p>
                </div>
              </div>

              {companyTransactions.length === 0 ? (
                <div className="text-center py-6 text-muted text-xs">
                  {lang === 'th' ? 'ยังไม่มีรายการเคลื่อนไหว' : 'No transactions recorded'}
                </div>
              ) : (
                <div className="activity-timeline">
                  {companyTransactions.slice(0, 5).map((tx) => {
                    const targetProd = products.find((p) => p.id === tx.productId);
                    return (
                      <div key={tx.id} className="activity-item">
                        <div className={`activity-icon-badge ${tx.type === 'IN' ? 'badge-in' : 'badge-out'}`}>
                          {tx.type === 'IN' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                        </div>
                        <div className="activity-details">
                          <div className="flex-between">
                            <span className="font-bold text-sm">{targetProd ? targetProd.name : 'อุปกรณ์'}</span>
                            <span className={`font-extrabold text-sm ${tx.type === 'IN' ? 'text-green' : 'text-red'}`}>
                              {tx.type === 'IN' ? `+${tx.quantity}` : `-${tx.quantity}`}
                            </span>
                          </div>
                          <div className="activity-sub">
                            {tx.type === 'IN'
                              ? lang === 'th'
                                ? '🟢 รับเข้าคลัง'
                                : 'Stock In'
                              : `👤 ${tx.requesterName || tx.customer || 'พนักงาน'}`}
                            <span className="activity-time ml-2 font-mono text-muted">
                              {new Date(tx.date || tx.timestamp || tx.createdAt).toLocaleDateString('th-TH', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* STYLES */}
      <style>{`
        /* Company Navigation Bar */
        .company-nav-card {
          padding: 1rem 1.25rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
        }

        .company-nav-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .company-pills-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .company-pill-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 0.9rem;
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          background: var(--bg-main);
          color: var(--text-primary);
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .company-pill-btn:hover {
          background: var(--primary-50);
          border-color: var(--primary-300);
          color: var(--primary-700);
        }

        .company-pill-btn.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
          box-shadow: 0 2px 6px rgba(59, 130, 246, 0.15);
        }

        .company-pill-btn.active.main-active {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-color: #0f172a;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.2);
        }

        .company-pill-btn.active.main-active .pill-badge {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }

        .pill-badge {
          font-size: 0.7rem;
          font-weight: 700;
          font-family: monospace;
          background: rgba(0, 0, 0, 0.06);
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        /* Item Frequency Section Styles (Compact & Fitted) */
        .item-frequency-card {
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border-color);
        }

        .freq-table-scroll-container {
          max-height: 295px;
          overflow-y: auto;
          overflow-x: auto;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-surface);
        }

        .freq-table {
          width: 100%;
          border-collapse: collapse;
        }

        .freq-table thead th {
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--bg-surface);
          border-bottom: 1.5px solid var(--border-color);
          padding: 0.55rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--text-secondary);
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
        }

        .freq-row td {
          padding: 0.45rem 0.75rem;
          border-bottom: 1px solid var(--border-color);
          vertical-align: middle;
        }

        .freq-row:last-child td {
          border-bottom: none;
        }

        .freq-row:hover {
          background: var(--bg-main);
        }

        .btn-page-size {
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-surface);
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          color: var(--text-secondary);
        }

        .btn-page-size.active {
          background: #2563eb;
          color: #ffffff;
          border-color: #2563eb;
        }

        .freq-sort-pills {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: var(--bg-main);
          padding: 2.5px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
        }

        .freq-pill-btn {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.25rem 0.55rem;
          border-radius: 5px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .freq-pill-btn:hover {
          color: var(--text-primary);
        }

        .freq-pill-btn.active {
          background: var(--bg-surface);
          color: #2563eb;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
        }

        .rank-pill {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.1rem 0.4rem;
          border-radius: 4px;
        }

        .rank-gold {
          background: #fef3c7;
          color: #b45309;
          border: 1px solid #fde68a;
        }

        .rank-silver {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .rank-bronze {
          background: #ffedd5;
          color: #c2410c;
          border: 1px solid #fed7aa;
        }

        .rank-normal {
          background: var(--bg-main);
          color: var(--text-muted);
        }

        .freq-bar-cell {
          width: 100%;
        }

        .freq-progress-track {
          width: 100%;
          height: 5px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 3px;
          overflow: hidden;
        }

        [data-theme="dark"] .freq-progress-track {
          background: rgba(255, 255, 255, 0.08);
        }

        .freq-progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        /* Company Hero Banner */
        .company-hero-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 1.5rem;
          border-radius: var(--radius-lg);
          background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          border: 1px solid #bae6fd;
        }

        .company-hero-left {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }

        .company-avatar-box {
          width: 56px;
          height: 56px;
          border-radius: 14px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(3, 105, 161, 0.12);
          border: 1px solid #bae6fd;
        }

        .top-items-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .top-item-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.55rem 0.85rem;
          border-radius: 6px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
        }

        .rank-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          font-family: monospace;
        }

        .rank-1 { background: #fef3c7; color: #b45309; }
        .rank-2 { background: #e2e8f0; color: #475569; }
        .rank-3 { background: #fed7aa; color: #c2410c; }
        .rank-4, .rank-5 { background: #f1f5f9; color: #64748b; }

        .top-requesters-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .top-requester-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.6rem 0.85rem;
          border-radius: 8px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
        }

        .requester-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #3b82f6;
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.82rem;
        }

        /* Standard KPI & Charts */
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
          gap: 1.5rem;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1.5rem;
          border-radius: var(--radius-lg);
        }

        .kpi-icon-container {
          width: 58px;
          height: 58px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.08);
        }

        .bg-indigo { background: #eef2ff; color: #4f46e5; }
        .bg-emerald { background: #ecfdf5; color: #059669; }
        .bg-rose { background: #fff1f2; color: #e11d48; }
        .bg-amber { background: #fffbeb; color: #d97706; }

        [data-theme="dark"] .bg-indigo { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
        [data-theme="dark"] .bg-emerald { background: rgba(16, 185, 129, 0.2); color: #34d399; }
        [data-theme="dark"] .bg-rose { background: rgba(225, 29, 72, 0.2); color: #fb7185; }
        [data-theme="dark"] .bg-amber { background: rgba(217, 119, 6, 0.2); color: #fbbf24; }

        .kpi-content {
          flex: 1;
        }

        .kpi-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 700;
          margin-bottom: 0.25rem;
        }

        .kpi-number {
          font-size: 1.65rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.1;
        }

        .text-rose { color: #e11d48; }
        .text-amber { color: #d97706; }

        .kpi-unit {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-muted);
          margin-left: 0.2rem;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: 1.6fr 1.1fr;
          gap: 1.5rem;
        }

        .chart-card {
          padding: 1.75rem;
          border-radius: var(--radius-lg);
        }

        .chart-title {
          letter-spacing: -0.02em;
        }

        .dashboard-bottom-grid {
          display: grid;
          grid-template-columns: 1.4fr 1fr;
          gap: 1.5rem;
        }

        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          transition: transform 0.15s ease;
        }

        .activity-item:hover {
          transform: translateX(4px);
        }

        .activity-icon-badge {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-xs);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .badge-in {
          background: #ecfdf5;
          color: #059669;
        }

        .badge-out {
          background: #fff1f2;
          color: #e11d48;
        }

        .activity-details {
          flex: 1;
        }

        .activity-sub {
          font-size: 0.78rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .dept-breakdown-container {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          width: 100%;
        }

        .dept-breakdown-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-height: 205px;
          overflow-y: auto;
          padding-right: 0.35rem;
        }

        .dept-breakdown-item {
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          transition: all 0.15s ease;
        }

        .dept-breakdown-item:hover {
          background: var(--bg-surface);
          border-color: #3b82f6;
          transform: translateY(-1px);
        }

        .dept-progress-track {
          width: 100%;
          height: 5px;
          background: rgba(0, 0, 0, 0.06);
          border-radius: 3px;
          overflow: hidden;
        }

        [data-theme="dark"] .dept-progress-track {
          background: rgba(255, 255, 255, 0.08);
        }

        .dept-progress-bar {
          height: 100%;
          border-radius: 3px;
          transition: width 0.4s ease;
        }

        .mobile-freq-list {
          display: none;
          flex-direction: column;
          gap: 0.6rem;
        }

        .mobile-freq-card {
          padding: 0.75rem 0.85rem;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          transition: all 0.15s ease;
        }

        .mobile-urgent-list {
          display: none;
          flex-direction: column;
          gap: 0.55rem;
        }

        .mobile-urgent-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.65rem 0.85rem;
          border-radius: var(--radius-sm);
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          gap: 0.75rem;
        }

        .urgent-item-left {
          flex: 1;
          min-width: 0;
        }

        .urgent-item-name {
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .urgent-item-sku {
          font-size: 0.68rem;
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .urgent-item-right {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          flex-shrink: 0;
        }

        @media (max-width: 1024px) {
          .charts-grid, .dashboard-bottom-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .desktop-freq-table {
            display: none !important;
          }
          .mobile-freq-list {
            display: flex !important;
          }
          .desktop-urgent-table {
            display: none !important;
          }
          .mobile-urgent-list {
            display: flex !important;
          }
          .chart-card {
            padding: 1.1rem 0.85rem;
            border-radius: var(--radius-md);
          }
          .chart-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .chart-title {
            font-size: 0.95rem;
          }
          .kpi-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 0.6rem !important;
          }
          .kpi-card {
            padding: 0.85rem 0.75rem !important;
            gap: 0.6rem !important;
          }
          .kpi-icon-container {
            width: 38px !important;
            height: 38px !important;
          }
          .kpi-icon-container svg {
            width: 20px !important;
            height: 20px !important;
          }
          .kpi-label {
            font-size: 0.72rem !important;
            line-height: 1.2 !important;
          }
          .kpi-number {
            font-size: 1.15rem !important;
          }
          .company-pills-bar {
            display: flex !important;
            gap: 0.5rem !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            padding-bottom: 0.35rem !important;
            flex-wrap: nowrap !important;
          }
          .company-pill-btn {
            flex-shrink: 0 !important;
            white-space: nowrap !important;
            padding: 0.5rem 0.75rem !important;
            font-size: 0.78rem !important;
          }
        }
      `}</style>
    </div>
  );
};
