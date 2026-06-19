import { useState } from 'react';
import { api } from '../../services/api';

interface FinanceProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Finance({ state, onStateUpdate }: FinanceProps) {
  const [newIncome, setNewIncome] = useState({ source: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Salary' });
  const [newExpense, setNewExpense] = useState({ merchant: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Food' });
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);

  const income = state.income || [];
  const expenses = state.expenses || [];

  const totalIncome = income.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);
  const totalExpense = expenses.reduce((sum: number, t: any) => sum + (t.amount || 0), 0);

  const handleAddIncome = async () => {
    if (!newIncome.source || newIncome.amount <= 0) return;
    const incomeEntry = {
      id: 'i_' + Math.random().toString(36).substr(2, 9),
      ...newIncome,
    };
    await api.createIncome(incomeEntry);
    setNewIncome({ source: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Salary' });
    setShowIncomeForm(false);
    onStateUpdate();
  };

  const handleAddExpense = async () => {
    if (!newExpense.merchant || newExpense.amount <= 0) return;
    const expenseEntry = {
      id: 'e_' + Math.random().toString(36).substr(2, 9),
      ...newExpense,
    };
    await api.createExpense(expenseEntry);
    setNewExpense({ merchant: '', amount: 0, date: new Date().toISOString().split('T')[0], category: 'Food' });
    setShowExpenseForm(false);
    onStateUpdate();
  };

  const handleDeleteIncome = async (id: string) => {
    await api.deleteIncome(id);
    onStateUpdate();
  };

  const handleDeleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    onStateUpdate();
  };

  const allTransactions = [
    ...income.map((i: any) => ({ ...i, type: 'Income', amount: i.amount })),
    ...expenses.map((e: any) => ({ ...e, type: 'Expense', amount: e.amount }))
  ].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>💰 Finance Dashboard</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        <div style={{ background: '#1F2937', padding: 20, borderRadius: 12, border: '1px solid #374151' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Total Income</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#10B981' }}>+${totalIncome.toFixed(2)}</div>
        </div>

        <div style={{ background: '#1F2937', padding: 20, borderRadius: 12, border: '1px solid #374151' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Total Expense</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#EF4444' }}>-${totalExpense.toFixed(2)}</div>
        </div>

        <div style={{ background: '#1F2937', padding: 20, borderRadius: 12, border: '1px solid #374151' }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>Balance</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#3B82F6' }}>${(totalIncome - totalExpense).toFixed(2)}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
        <button
          onClick={() => setShowIncomeForm(!showIncomeForm)}
          style={{
            padding: 12,
            background: '#10B981',
            color: '#FFF',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          + Add Income
        </button>
        <button
          onClick={() => setShowExpenseForm(!showExpenseForm)}
          style={{
            padding: 12,
            background: '#EF4444',
            color: '#FFF',
            border: 'none',
            borderRadius: 6,
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: 14,
          }}
        >
          + Add Expense
        </button>
      </div>

      {showIncomeForm && (
        <div style={{ background: '#1F2937', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
            <input type="text" placeholder="Source" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <input type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: parseFloat(e.target.value) })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <select value={newIncome.category} onChange={(e) => setNewIncome({ ...newIncome, category: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }}>
              <option>Salary</option>
              <option>Freelance</option>
              <option>Investment</option>
              <option>Other</option>
            </select>
          </div>
          <button onClick={handleAddIncome} style={{ padding: '8px 16px', background: '#10B981', color: '#FFF', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Save Income</button>
        </div>
      )}

      {showExpenseForm && (
        <div style={{ background: '#1F2937', padding: 16, borderRadius: 8, marginBottom: 24, border: '1px solid #374151' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 12 }}>
            <input type="text" placeholder="Merchant/Description" value={newExpense.merchant} onChange={(e) => setNewExpense({ ...newExpense, merchant: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }} />
            <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} style={{ padding: 8, background: '#111827', border: '1px solid #374151', borderRadius: 4, color: '#FFF' }}>
              <option>Food</option>
              <option>Transport</option>
              <option>Entertainment</option>
              <option>Utilities</option>
              <option>Other</option>
            </select>
          </div>
          <button onClick={handleAddExpense} style={{ padding: '8px 16px', background: '#EF4444', color: '#FFF', border: 'none', borderRadius: 4, fontWeight: 600, cursor: 'pointer' }}>Save Expense</button>
        </div>
      )}

      <div style={{ background: '#1F2937', borderRadius: 12, border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ padding: 20, borderBottom: '1px solid #374151' }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Recent Transactions</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #374151' }}>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Date</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Description</th>
                <th style={{ padding: 12, textAlign: 'left', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Type</th>
                <th style={{ padding: 12, textAlign: 'right', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Amount</th>
                <th style={{ padding: 12, textAlign: 'center', fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {allTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: 20, textAlign: 'center', color: '#9CA3AF' }}>No transactions yet</td>
                </tr>
              ) : (
                allTransactions.map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: 12, fontSize: 14 }}>{t.date}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>{t.type === 'Income' ? t.source : t.merchant}</td>
                    <td style={{ padding: 12, fontSize: 14 }}>
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background: t.type === 'Income' ? '#065F46' : '#7F1D1D',
                          color: t.type === 'Income' ? '#10B981' : '#FCA5A5',
                        }}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td style={{ padding: 12, fontSize: 14, textAlign: 'right', color: t.type === 'Income' ? '#10B981' : '#EF4444' }}>
                      {t.type === 'Income' ? '+' : '-'}${t.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: 12, textAlign: 'center' }}>
                      <button
                        onClick={() => t.type === 'Income' ? handleDeleteIncome(t.id) : handleDeleteExpense(t.id)}
                        style={{
                          padding: '4px 8px',
                          background: '#EF4444',
                          color: '#FFF',
                          border: 'none',
                          borderRadius: 3,
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
