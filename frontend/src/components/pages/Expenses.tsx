import { useState } from "react";
import { api } from "../../services/api";

interface ExpensesProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Expenses({ state, onStateUpdate }: ExpensesProps) {
  const [newExpense, setNewExpense] = useState({
    merchant: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "Food",
  });
  const [showForm, setShowForm] = useState(false);

  const expenses = state.expenses || [];

  const totalExpense = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount || 0),
    0,
  );

  const expenseByCategory = expenses.reduce((acc: any, e: any) => {
    const cat = e.category || "Other";
    acc[cat] = (acc[cat] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const expenseByMonth = expenses.reduce((acc: any, e: any) => {
    const month = e.date?.substring(0, 7) || "";
    acc[month] = (acc[month] || 0) + (e.amount || 0);
    return acc;
  }, {});

  const handleAddExpense = async () => {
    if (!newExpense.merchant || newExpense.amount <= 0) return;
    const expenseEntry = {
      id: "e_" + Math.random().toString(36).substr(2, 9),
      ...newExpense,
    };
    await api.createExpense(expenseEntry);
    setNewExpense({
      merchant: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "Food",
    });
    setShowForm(false);
    onStateUpdate();
  };

  const handleDeleteExpense = async (id: string) => {
    await api.deleteExpense(id);
    onStateUpdate();
  };

  const sortedExpenses = [...expenses].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const categoryColors: any = {
    Food: "#F59E0B",
    Transport: "#3B82F6",
    Housing: "#8B5CF6",
    Health: "#EF4444",
    Entertainment: "#EC4899",
    Shopping: "#06B6D4",
    Education: "#6366F1",
    Charity: "#10B981",
    Football: "#D946EF",
    "Monthly Internet": "#14B8A6",
    Internet: "#0EA5E9",
    Other: "#6B7280",
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        📉 Expense Tracking
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
            Total Expenses
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#EF4444" }}>
            -${totalExpense.toFixed(2)}
          </div>
        </div>

        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
            This Month
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3B82F6" }}>
            -${expenseByMonth[new Date().toISOString().substring(0, 7)] || 0}
          </div>
        </div>

        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8 }}>
            Transactions
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#F59E0B" }}>
            {expenses.length}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "12px 24px",
          background: "#EF4444",
          color: "#FFF",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 24,
        }}>
        + Add Expense
      </button>

      {showForm && (
        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
            marginBottom: 24,
          }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
              marginBottom: 12,
            }}>
            <input
              type="text"
              placeholder="Merchant/Description"
              value={newExpense.merchant}
              onChange={(e) =>
                setNewExpense({ ...newExpense, merchant: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={newExpense.amount}
              onChange={(e) =>
                setNewExpense({
                  ...newExpense,
                  amount: parseFloat(e.target.value),
                })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}
            />
            <input
              type="date"
              value={newExpense.date}
              onChange={(e) =>
                setNewExpense({ ...newExpense, date: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}
            />
            <select
              value={newExpense.category}
              onChange={(e) =>
                setNewExpense({ ...newExpense, category: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}>
              <option>Food</option>
              <option>Transport</option>
              <option>Housing</option>
              <option>Health</option>
              <option>Entertainment</option>
              <option>Shopping</option>
              <option>Education</option>
              <option>Charity</option>
              <option>Football</option>
              <option>Monthly Internet</option>
              <option>Internet</option>
              <option>Other</option>
            </select>
          </div>
          <button
            onClick={handleAddExpense}
            style={{
              padding: "10px 20px",
              background: "#EF4444",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            Save
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
          marginBottom: 32,
        }}>
        {/* By Category */}
        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Expenses by Category
          </h3>
          <div>
            {Object.entries(expenseByCategory).map(
              ([category, amount]: any) => {
                const percent = (amount / totalExpense) * 100;
                const color = categoryColors[category] || "#6B7280";
                return (
                  <div key={category} style={{ marginBottom: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                        fontSize: 12,
                      }}>
                      <span>{category}</span>
                      <span style={{ fontWeight: 600 }}>
                        ${amount.toFixed(2)}
                      </span>
                    </div>
                    <div
                      style={{
                        background: "#111827",
                        borderRadius: 4,
                        height: 6,
                        overflow: "hidden",
                      }}>
                      <div
                        style={{
                          background: color,
                          height: "100%",
                          width: `${percent}%`,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>

        {/* By Month */}
        <div
          style={{
            background: "#1F2937",
            padding: 20,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
            Expenses by Month
          </h3>
          <div>
            {Object.entries(expenseByMonth)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([month, amount]: any) => (
                <div
                  key={month}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 0",
                    borderBottom: "1px solid #374151",
                    fontSize: 13,
                  }}>
                  <span>{month}</span>
                  <span style={{ fontWeight: 600, color: "#EF4444" }}>
                    -${amount.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div
        style={{
          background: "#1F2937",
          borderRadius: 12,
          border: "1px solid #374151",
          overflow: "hidden",
        }}>
        <div style={{ padding: 20, borderBottom: "1px solid #374151" }}>
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>
            Expense Transactions
          </h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #374151" }}>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 600,
                  }}>
                  Date
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 600,
                  }}>
                  Merchant
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "left",
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 600,
                  }}>
                  Category
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "right",
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 600,
                  }}>
                  Amount
                </th>
                <th
                  style={{
                    padding: 12,
                    textAlign: "center",
                    fontSize: 12,
                    color: "#9CA3AF",
                    fontWeight: 600,
                  }}>
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#9CA3AF",
                    }}>
                    No expense transactions
                  </td>
                </tr>
              ) : (
                sortedExpenses.map((exp: any) => (
                  <tr
                    key={exp.id}
                    style={{ borderBottom: "1px solid #374151" }}>
                    <td style={{ padding: 12, fontSize: 13 }}>{exp.date}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {exp.merchant}
                    </td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {exp.category}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        fontSize: 13,
                        textAlign: "right",
                        color: "#EF4444",
                        fontWeight: 600,
                      }}>
                      -${exp.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteExpense(exp.id)}
                        style={{
                          padding: "4px 8px",
                          background: "#EF4444",
                          color: "#FFF",
                          border: "none",
                          borderRadius: 3,
                          fontSize: 11,
                          cursor: "pointer",
                        }}>
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
