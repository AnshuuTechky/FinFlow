import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const STORAGE_KEYS = {
  transactions: 'finflow_transactions_v1',
  role: 'finflow_role_v1',
  budgets: 'finflow_budgets_v1',
};

const CATS = [
  'Food',
  'Transport',
  'Housing',
  'Entertainment',
  'Health',
  'Shopping',
  'Income',
  'Utilities',
  'Savings',
];

const EXPENSE_CATS = CATS.filter((cat) => cat !== 'Income');

const CAT_COLORS = {
  Food: '#e05c5c',
  Transport: '#d4a843',
  Housing: '#5b8df0',
  Entertainment: '#c97bd4',
  Health: '#4dbb7e',
  Shopping: '#e08c5c',
  Income: '#4dbb7e',
  Utilities: '#5baad4',
  Savings: '#a0a0c0',
};

const INITIAL_TRANSACTIONS = [
  { id: 1, date: '2025-01-05', desc: 'Monthly Salary', cat: 'Income', type: 'income', amount: 5800 },
  { id: 2, date: '2025-01-07', desc: 'Rent Payment', cat: 'Housing', type: 'expense', amount: 1400 },
  { id: 3, date: '2025-01-09', desc: 'Grocery Store', cat: 'Food', type: 'expense', amount: 210 },
  { id: 4, date: '2025-01-12', desc: 'Netflix', cat: 'Entertainment', type: 'expense', amount: 18 },
  { id: 5, date: '2025-01-15', desc: 'Uber ride', cat: 'Transport', type: 'expense', amount: 32 },
  { id: 6, date: '2025-01-18', desc: 'Pharmacy', cat: 'Health', type: 'expense', amount: 65 },
  { id: 7, date: '2025-01-20', desc: 'Amazon order', cat: 'Shopping', type: 'expense', amount: 134 },
  { id: 8, date: '2025-01-22', desc: 'Electricity bill', cat: 'Utilities', type: 'expense', amount: 95 },
  { id: 9, date: '2025-01-25', desc: 'Savings deposit', cat: 'Savings', type: 'expense', amount: 400 },
  { id: 10, date: '2025-01-28', desc: 'Freelance project', cat: 'Income', type: 'income', amount: 1200 },
  { id: 11, date: '2025-02-05', desc: 'Monthly Salary', cat: 'Income', type: 'income', amount: 5800 },
  { id: 12, date: '2025-02-07', desc: 'Rent Payment', cat: 'Housing', type: 'expense', amount: 1400 },
  { id: 13, date: '2025-02-10', desc: 'Restaurant dinner', cat: 'Food', type: 'expense', amount: 87 },
  { id: 14, date: '2025-02-12', desc: 'Spotify', cat: 'Entertainment', type: 'expense', amount: 10 },
  { id: 15, date: '2025-02-14', desc: 'Fuel', cat: 'Transport', type: 'expense', amount: 58 },
  { id: 16, date: '2025-02-16', desc: 'Gym membership', cat: 'Health', type: 'expense', amount: 45 },
  { id: 17, date: '2025-02-19', desc: 'Grocery Store', cat: 'Food', type: 'expense', amount: 185 },
  { id: 18, date: '2025-02-22', desc: 'Water bill', cat: 'Utilities', type: 'expense', amount: 40 },
  { id: 19, date: '2025-02-24', desc: 'Savings deposit', cat: 'Savings', type: 'expense', amount: 500 },
  { id: 20, date: '2025-02-27', desc: 'Freelance project', cat: 'Income', type: 'income', amount: 850 },
  { id: 21, date: '2025-03-05', desc: 'Monthly Salary', cat: 'Income', type: 'income', amount: 5800 },
  { id: 22, date: '2025-03-07', desc: 'Rent Payment', cat: 'Housing', type: 'expense', amount: 1400 },
  { id: 23, date: '2025-03-09', desc: 'Coffee shop', cat: 'Food', type: 'expense', amount: 45 },
  { id: 24, date: '2025-03-12', desc: 'Movie tickets', cat: 'Entertainment', type: 'expense', amount: 35 },
  { id: 25, date: '2025-03-15', desc: 'Taxi', cat: 'Transport', type: 'expense', amount: 28 },
  { id: 26, date: '2025-03-18', desc: 'Doctor visit', cat: 'Health', type: 'expense', amount: 120 },
  { id: 27, date: '2025-03-20', desc: 'Clothing', cat: 'Shopping', type: 'expense', amount: 230 },
  { id: 28, date: '2025-03-22', desc: 'Internet bill', cat: 'Utilities', type: 'expense', amount: 55 },
  { id: 29, date: '2025-03-28', desc: 'Savings deposit', cat: 'Savings', type: 'expense', amount: 600 },
  { id: 30, date: '2025-03-31', desc: 'Bonus', cat: 'Income', type: 'income', amount: 2000 },
];

const INITIAL_BUDGETS = {
  Food: 500,
  Transport: 250,
  Housing: 1500,
  Entertainment: 220,
  Health: 180,
  Shopping: 300,
  Utilities: 220,
  Savings: 700,
};

const fmt = (n) =>
  `$${Math.abs(n).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const today = () => new Date().toISOString().split('T')[0];

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEYS.role) || 'admin');
  const [page, setPage] = useState('dashboard');
  const [transactions, setTransactions] = useState(() => {
    const saved = readJSON(STORAGE_KEYS.transactions, null);
    return Array.isArray(saved) && saved.length ? saved : INITIAL_TRANSACTIONS;
  });
  const [budgets, setBudgets] = useState(() => ({
    ...INITIAL_BUDGETS,
    ...readJSON(STORAGE_KEYS.budgets, {}),
  }));

  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    desc: '',
    amount: '',
    type: 'expense',
    cat: CATS[0],
    date: today(),
  });

  const trendRef = useRef(null);
  const donutRef = useRef(null);
  const trendChartRef = useRef(null);
  const donutChartRef = useRef(null);

  const nextId = useMemo(
    () => (transactions.length ? Math.max(...transactions.map((t) => t.id || 0)) + 1 : 1),
    [transactions]
  );

  const stats = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    const savings = transactions
      .filter((t) => t.cat === 'Savings')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      income,
      expenses,
      savings,
      balance: income - expenses,
    };
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};
    transactions.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      if (!months[monthKey]) {
        months[monthKey] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        months[monthKey].income += t.amount;
      } else {
        months[monthKey].expenses += t.amount;
      }
    });

    const keys = Object.keys(months).sort();
    return { keys, months };
  }, [transactions]);

  const latestMonth = useMemo(() => monthlyData.keys.at(-1) || today().slice(0, 7), [monthlyData]);

  const categoryOptions = useMemo(
    () => [...new Set(transactions.map((t) => t.cat))].sort(),
    [transactions]
  );

  const filteredTxns = useMemo(() => {
    let list = [...transactions];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) => t.desc.toLowerCase().includes(q) || t.cat.toLowerCase().includes(q)
      );
    }

    if (catFilter) {
      list = list.filter((t) => t.cat === catFilter);
    }

    if (typeFilter) {
      list = list.filter((t) => t.type === typeFilter);
    }

    if (startDate) {
      list = list.filter((t) => t.date >= startDate);
    }

    if (endDate) {
      list = list.filter((t) => t.date <= endDate);
    }

    if (sortBy === 'date-asc') {
      list.sort((a, b) => a.date.localeCompare(b.date));
    } else if (sortBy === 'date-desc') {
      list.sort((a, b) => b.date.localeCompare(a.date));
    } else if (sortBy === 'amount-desc') {
      list.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount-asc') {
      list.sort((a, b) => a.amount - b.amount);
    }

    return list;
  }, [transactions, search, catFilter, typeFilter, startDate, endDate, sortBy]);

  const filteredSummary = useMemo(() => {
    const income = filteredTxns
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTxns
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      count: filteredTxns.length,
      income,
      expenses,
      net: income - expenses,
    };
  }, [filteredTxns]);

  const donutData = useMemo(() => {
    const totals = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(latestMonth))
      .forEach((t) => {
        totals[t.cat] = (totals[t.cat] || 0) + t.amount;
      });

    const categories = Object.keys(totals);
    const values = categories.map((c) => totals[c]);
    const total = values.reduce((sum, value) => sum + value, 0);

    return { categories, values, total };
  }, [transactions, latestMonth]);

  const monthExpenseByCategory = useMemo(() => {
    const byCategory = {};
    transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith(latestMonth))
      .forEach((t) => {
        byCategory[t.cat] = (byCategory[t.cat] || 0) + t.amount;
      });
    return byCategory;
  }, [transactions, latestMonth]);

  const budgetRows = useMemo(
    () =>
      EXPENSE_CATS.map((category) => {
        const budget = Number(budgets[category] || 0);
        const spent = Number(monthExpenseByCategory[category] || 0);
        const progress = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
        const remaining = budget - spent;
        return {
          category,
          budget,
          spent,
          remaining,
          progress,
          overBudget: budget > 0 && spent > budget,
        };
      }),
    [budgets, monthExpenseByCategory]
  );

  const budgetTotals = useMemo(() => {
    const totalBudget = budgetRows.reduce((sum, row) => sum + row.budget, 0);
    const totalSpent = budgetRows.reduce((sum, row) => sum + row.spent, 0);
    return {
      totalBudget,
      totalSpent,
      totalRemaining: totalBudget - totalSpent,
    };
  }, [budgetRows]);

  const insights = useMemo(() => {
    const expenseByCategory = {};
    transactions
      .filter((t) => t.type === 'expense' && t.cat !== 'Savings')
      .forEach((t) => {
        expenseByCategory[t.cat] = (expenseByCategory[t.cat] || 0) + t.amount;
      });

    const topCategory = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1])[0];
    const savingsRate = stats.income ? ((stats.savings / stats.income) * 100).toFixed(1) : '0.0';

    const lastTwo = monthlyData.keys.slice(-2);
    const prevMonth = monthlyData.months[lastTwo[0]];
    const currentMonth = monthlyData.months[lastTwo[1]];
    const expenseChange =
      prevMonth && currentMonth && prevMonth.expenses
        ? (((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100).toFixed(1)
        : '0.0';

    const sortedCategories = Object.entries(expenseByCategory).sort((a, b) => b[1] - a[1]);

    return {
      topCategory,
      savingsRate,
      expenseChange,
      sortedCategories,
      lastTwo,
    };
  }, [transactions, stats, monthlyData]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.role, role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.budgets, JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    const { keys, months } = monthlyData;
    let runningBalance = 0;

    const balances = keys.map((k) => {
      runningBalance += months[k].income - months[k].expenses;
      return runningBalance;
    });

    const labels = keys.map((k) => {
      const [y, m] = k.split('-');
      return new Date(+y, +m - 1).toLocaleString('default', { month: 'short' });
    });

    if (trendChartRef.current) {
      trendChartRef.current.destroy();
      trendChartRef.current = null;
    }

    if (!trendRef.current) return;

    trendChartRef.current = new Chart(trendRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Balance',
            data: balances,
            borderColor: '#d4a843',
            backgroundColor: 'rgba(212,168,67,0.08)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#d4a843',
            pointRadius: 4,
            borderWidth: 2,
          },
          {
            label: 'Income',
            data: keys.map((k) => months[k].income),
            borderColor: '#4dbb7e',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 1.5,
            borderDash: [4, 4],
          },
          {
            label: 'Expense',
            data: keys.map((k) => months[k].expenses),
            borderColor: '#e05c5c',
            backgroundColor: 'transparent',
            tension: 0.4,
            pointRadius: 3,
            borderWidth: 1.5,
            borderDash: [4, 4],
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: { color: '#666', font: { size: 11 } },
          },
          y: {
            grid: { color: 'rgba(255,255,255,0.04)' },
            ticks: {
              color: '#666',
              font: { size: 11 },
              callback: (value) => `$${Number(value).toLocaleString()}`,
            },
          },
        },
      },
    });

    return () => {
      if (trendChartRef.current) {
        trendChartRef.current.destroy();
        trendChartRef.current = null;
      }
    };
  }, [monthlyData]);

  useEffect(() => {
    if (donutChartRef.current) {
      donutChartRef.current.destroy();
      donutChartRef.current = null;
    }

    if (!donutRef.current) return;

    donutChartRef.current = new Chart(donutRef.current, {
      type: 'doughnut',
      data: {
        labels: donutData.categories,
        datasets: [
          {
            data: donutData.values,
            backgroundColor: donutData.categories.map((c) => CAT_COLORS[c] || '#888'),
            borderWidth: 0,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                if (!donutData.total) return ` ${ctx.label}: $${ctx.raw}`;
                return ` ${ctx.label}: $${ctx.raw} (${Math.round((ctx.raw / donutData.total) * 100)}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartRef.current) {
        donutChartRef.current.destroy();
        donutChartRef.current = null;
      }
    };
  }, [donutData]);

  const resetForm = () => {
    setForm({
      desc: '',
      amount: '',
      type: 'expense',
      cat: CATS[0],
      date: today(),
    });
  };

  const openAddModal = () => {
    if (role !== 'admin') return;
    setEditingId(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (txn) => {
    if (role !== 'admin') return;
    setEditingId(txn.id);
    setForm({
      desc: txn.desc,
      amount: String(txn.amount),
      type: txn.type,
      cat: txn.cat,
      date: txn.date,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const saveTransaction = () => {
    const amount = parseFloat(form.amount);

    if (!form.desc.trim() || Number.isNaN(amount) || amount <= 0 || !form.date) {
      return;
    }

    if (editingId) {
      setTransactions((prev) =>
        prev
          .map((txn) =>
            txn.id === editingId
              ? {
                  ...txn,
                  date: form.date,
                  desc: form.desc.trim(),
                  cat: form.cat,
                  type: form.type,
                  amount,
                }
              : txn
          )
          .sort((a, b) => b.date.localeCompare(a.date))
      );
    } else {
      const nextTxn = {
        id: nextId,
        date: form.date,
        desc: form.desc.trim(),
        cat: form.cat,
        type: form.type,
        amount,
      };
      setTransactions((prev) => [...prev, nextTxn].sort((a, b) => b.date.localeCompare(a.date)));
    }

    closeModal();
    resetForm();
  };

  const deleteTransaction = (id) => {
    if (role !== 'admin') return;
    const shouldDelete = window.confirm('Delete this transaction?');
    if (!shouldDelete) return;
    setTransactions((prev) => prev.filter((txn) => txn.id !== id));
  };

  const clearFilters = () => {
    setSearch('');
    setCatFilter('');
    setTypeFilter('');
    setStartDate('');
    setEndDate('');
    setSortBy('date-desc');
  };

  const exportCsv = () => {
    const header = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    const rows = filteredTxns.map((txn) => [
      txn.date,
      txn.desc,
      txn.cat,
      txn.type,
      txn.amount.toString(),
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finflow-transactions-${today()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateBudget = (category, value) => {
    const parsed = Number(value);
    setBudgets((prev) => ({
      ...prev,
      [category]: Number.isNaN(parsed) || parsed < 0 ? 0 : parsed,
    }));
  };

  const showAdminActions = role === 'admin';

  return (
    <>
      <div className="app">
        <div className="topbar">
          <div className="logo">
            <div className="logo-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <div>
              <div className="logo-name">Finflow</div>
              <div className="logo-sub">personal finance</div>
            </div>
          </div>
          <div className="topbar-right">
            <div className="role-wrap">
              <span className="role-label">role:</span>
              <select
                className="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <span className={`role-badge ${role}`}>{role}</span>
            </div>
          </div>
        </div>

        <div className="nav">
          {['dashboard', 'transactions', 'insights'].map((tab) => (
            <button
              key={tab}
              className={`nav-btn ${page === tab ? 'active' : ''}`}
              onClick={() => setPage(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {page === 'dashboard' && (
          <div className="page active">
            <div className="cards">
              <div className="card total">
                <div className="card-accent" />
                <div className="card-label">Net Balance</div>
                <div className="card-val">{fmt(stats.balance)}</div>
                <div className="card-delta up">all time surplus</div>
              </div>
              <div className="card income">
                <div className="card-accent" />
                <div className="card-label">Total Income</div>
                <div className="card-val">{fmt(stats.income)}</div>
                <div className="card-delta up">
                  {transactions.filter((t) => t.type === 'income').length} transactions
                </div>
              </div>
              <div className="card expense">
                <div className="card-accent" />
                <div className="card-label">Total Expenses</div>
                <div className="card-val">{fmt(stats.expenses)}</div>
                <div className="card-delta down">
                  {transactions.filter((t) => t.type === 'expense').length} transactions
                </div>
              </div>
              <div className="card savings">
                <div className="card-accent" />
                <div className="card-label">Total Saved</div>
                <div className="card-val">{fmt(stats.savings)}</div>
                <div className="card-delta up">
                  {stats.income ? ((stats.savings / stats.income) * 100).toFixed(1) : '0.0'}% of income
                </div>
              </div>
            </div>
            <div className="charts-row">
              <div className="chart-box">
                <div className="chart-title">
                  Balance trend <span>all months</span>
                </div>
                <div style={{ position: 'relative', height: '220px' }}>
                  <canvas ref={trendRef} />
                </div>
              </div>
              <div className="chart-box">
                <div className="chart-title">
                  Spending breakdown <span>{latestMonth}</span>
                </div>
                <div style={{ position: 'relative', height: '180px', marginBottom: '12px' }}>
                  <canvas ref={donutRef} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {donutData.categories.map((c) => (
                    <span
                      key={c}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '11px',
                        color: '#8888a0',
                      }}
                    >
                      <span
                        style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '2px',
                          background: CAT_COLORS[c] || '#888',
                          flexShrink: 0,
                        }}
                      />
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {page === 'transactions' && (
          <div className="page active">
            <div className="section">
              <div className="section-header">
                <span className="section-title">all transactions</span>
                <div className="section-actions">
                  <button className="btn-secondary" onClick={exportCsv} disabled={!filteredTxns.length}>
                    Export CSV
                  </button>
                  {showAdminActions && (
                    <button className="btn-add" onClick={openAddModal}>
                      + Add
                    </button>
                  )}
                </div>
              </div>

              <div className="filters">
                <input
                  type="text"
                  className="filter-input"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={catFilter}
                  onChange={(e) => setCatFilter(e.target.value)}
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <select
                  className="filter-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All types</option>
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </select>
                <input
                  type="date"
                  className="filter-input date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="filter-input date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="date-desc">Newest first</option>
                  <option value="date-asc">Oldest first</option>
                  <option value="amount-desc">Highest amount</option>
                  <option value="amount-asc">Lowest amount</option>
                </select>
                <button className="btn-secondary" onClick={clearFilters}>
                  Reset
                </button>
              </div>

              <div className="filter-summary">
                <span>{filteredSummary.count} items</span>
                <span>Income {fmt(filteredSummary.income)}</span>
                <span>Expenses {fmt(filteredSummary.expenses)}</span>
                <span className={filteredSummary.net >= 0 ? 'up' : 'down'}>
                  Net {filteredSummary.net >= 0 ? '+' : '-'}{fmt(filteredSummary.net)}
                </span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="txn-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Category</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTxns.map((t) => (
                      <tr key={t.id}>
                        <td className="date-cell">{t.date}</td>
                        <td style={{ fontSize: '13px' }}>{t.desc}</td>
                        <td>
                          <span className="cat-pill">
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: CAT_COLORS[t.cat] || '#888',
                              }}
                            />
                            {t.cat}
                          </span>
                        </td>
                        <td>
                          <span className={`type-badge ${t.type}`}>{t.type}</span>
                        </td>
                        <td className={`amount-cell ${t.type}`}>
                          {t.type === 'income' ? '+' : '-'}
                          {fmt(t.amount)}
                        </td>
                        <td>
                          {showAdminActions ? (
                            <div className="row-actions">
                              <button className="action-btn" onClick={() => openEditModal(t)}>
                                Edit
                              </button>
                              <button className="action-btn danger" onClick={() => deleteTransaction(t.id)}>
                                Delete
                              </button>
                            </div>
                          ) : (
                            <span className="date-cell">view only</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filteredTxns.length && <div className="empty-state">No transactions found</div>}
              </div>
            </div>
          </div>
        )}

        {page === 'insights' && (
          <div className="page active">
            <div className="insights-grid">
              <div className="insight-card">
                <div className="insight-icon">Top</div>
                <div className="insight-title">Top spending category</div>
                <div className="insight-val" style={{ color: 'var(--red)' }}>
                  {insights.topCategory ? insights.topCategory[0] : '—'}
                </div>
                <div className="insight-sub">
                  {insights.topCategory ? `${fmt(insights.topCategory[1])} total` : ''}
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">Rate</div>
                <div className="insight-title">Savings rate</div>
                <div className="insight-val" style={{ color: 'var(--green)' }}>
                  {insights.savingsRate}%
                </div>
                <div className="insight-sub">of total income saved</div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">Trend</div>
                <div className="insight-title">Expense trend</div>
                <div
                  className="insight-val"
                  style={{
                    color: Number(insights.expenseChange) > 0 ? 'var(--red)' : 'var(--green)',
                  }}
                >
                  {Number(insights.expenseChange) > 0 ? '+' : ''}
                  {insights.expenseChange}%
                </div>
                <div className="insight-sub">vs previous month</div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">Budget</div>
                <div className="insight-title">Monthly budget</div>
                <div
                  className="insight-val"
                  style={{ color: budgetTotals.totalRemaining >= 0 ? 'var(--green)' : 'var(--red)' }}
                >
                  {budgetTotals.totalRemaining >= 0 ? 'Left ' : 'Over '}
                  {fmt(budgetTotals.totalRemaining)}
                </div>
                <div className="insight-sub">for {latestMonth}</div>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-box">
                <div className="chart-title">
                  Spending by category <span>all time</span>
                </div>
                <div>
                  {insights.sortedCategories.map(([category, value]) => {
                    const maxVal = insights.sortedCategories[0]?.[1] || 1;
                    return (
                      <div className="bar-row" key={category}>
                        <div className="bar-label">{category}</div>
                        <div className="bar-track">
                          <div
                            className="bar-fill"
                            style={{
                              width: `${((value / maxVal) * 100).toFixed(1)}%`,
                              background: CAT_COLORS[category] || '#888',
                            }}
                          />
                        </div>
                        <div className="bar-amount">{fmt(value)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="chart-box">
                <div className="chart-title">Month comparison</div>
                <div className="monthly-cmp">
                  {insights.lastTwo.map((monthKey) => {
                    const data = monthlyData.months[monthKey];
                    const [year, month] = monthKey.split('-');
                    const monthName = new Date(+year, +month - 1).toLocaleString('default', {
                      month: 'long',
                      year: 'numeric',
                    });
                    const net = data.income - data.expenses;

                    return (
                      <div className="month-block" key={monthKey}>
                        <div className="month-name">{monthName}</div>
                        <div className="month-stat">
                          <span style={{ color: 'var(--text2)' }}>Income</span>
                          <span style={{ color: 'var(--green)' }}>${data.income.toLocaleString()}</span>
                        </div>
                        <div className="month-stat">
                          <span style={{ color: 'var(--text2)' }}>Expenses</span>
                          <span style={{ color: 'var(--red)' }}>${data.expenses.toLocaleString()}</span>
                        </div>
                        <div
                          className="month-stat"
                          style={{ borderTop: '1px solid var(--border)', paddingTop: '6px', marginTop: '4px' }}
                        >
                          <span style={{ color: 'var(--text2)' }}>Net</span>
                          <span style={{ color: net >= 0 ? 'var(--gold)' : 'var(--red)' }}>
                            {net >= 0 ? '+' : ''}${net.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="section">
              <div className="section-header">
                <span className="section-title">monthly budget planner ({latestMonth})</span>
              </div>
              <div className="budget-grid">
                {budgetRows.map((row) => (
                  <div className="budget-card" key={row.category}>
                    <div className="budget-top">
                      <span className="budget-name">{row.category}</span>
                      <input
                        className="budget-input"
                        type="number"
                        min="0"
                        value={row.budget}
                        onChange={(e) => updateBudget(row.category, e.target.value)}
                      />
                    </div>
                    <div className="budget-track">
                      <div
                        className={`budget-fill ${row.overBudget ? 'over' : ''}`}
                        style={{ width: `${row.progress}%`, background: CAT_COLORS[row.category] || '#888' }}
                      />
                    </div>
                    <div className="budget-meta">
                      <span>Spent {fmt(row.spent)}</span>
                      <span className={row.remaining >= 0 ? 'up' : 'down'}>
                        {row.remaining >= 0 ? 'Left ' : 'Over '}
                        {fmt(row.remaining)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div
        className={`modal-overlay ${isModalOpen ? 'open' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) closeModal();
        }}
      >
        <div className="modal">
          <div className="modal-title">{editingId ? 'Edit transaction' : 'Add transaction'}</div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Description</label>
              <input
                className="form-input"
                placeholder="e.g. Grocery run"
                value={form.desc}
                onChange={(e) => setForm((prev) => ({ ...prev, desc: e.target.value }))}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.cat}
                  onChange={(e) => setForm((prev) => ({ ...prev, cat: e.target.value }))}
                >
                  {CATS.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  className="form-input"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn-save" onClick={saveTransaction}>
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
