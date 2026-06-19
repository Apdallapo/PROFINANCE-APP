import { useState } from "react";
import { api } from "../../services/api";

interface IncomeProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Income({ state, onStateUpdate }: IncomeProps) {
  const [newIncome, setNewIncome] = useState({
    source: "",
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    category: "Salary",
  });
  const [showForm, setShowForm] = useState(false);

  const income = state.income || [];

  const totalIncome = income.reduce(
    (sum: number, i: any) => sum + (i.amount || 0),
    0,
  );

  const incomeByCategory = income.reduce((acc: any, i: any) => {
    const cat = i.category || "Other";
    acc[cat] = (acc[cat] || 0) + (i.amount || 0);
    return acc;
  }, {});

  const incomeByMonth = income.reduce((acc: any, i: any) => {
    const month = i.date?.substring(0, 7) || "";
    acc[month] = (acc[month] || 0) + (i.amount || 0);
    return acc;
  }, {});

  const handleAddIncome = async () => {
    if (!newIncome.source || newIncome.amount <= 0) return;
    const incomeEntry = {
      id: "i_" + Math.random().toString(36).substr(2, 9),
      ...newIncome,
    };
    await api.createIncome(incomeEntry);
    setNewIncome({
      source: "",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "Salary",
    });
    setShowForm(false);
    onStateUpdate();
  };

  const handleDeleteIncome = async (id: string) => {
    await api.deleteIncome(id);
    onStateUpdate();
  };

  const sortedIncome = [...income].sort(
    (a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        📈 Income Tracking
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
            Total Income
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#10B981" }}>
            +${totalIncome.toFixed(2)}
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
            +${incomeByMonth[new Date().toISOString().substring(0, 7)] || 0}
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
            {income.length}
          </div>
        </div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "12px 24px",
          background: "#10B981",
          color: "#FFF",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 24,
        }}>
        + Add Income
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
              placeholder="Source"
              value={newIncome.source}
              onChange={(e) =>
                setNewIncome({ ...newIncome, source: e.target.value })
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
              value={newIncome.amount}
              onChange={(e) =>
                setNewIncome({
                  ...newIncome,
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
              value={newIncome.date}
              onChange={(e) =>
                setNewIncome({ ...newIncome, date: e.target.value })
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
              value={newIncome.category}
              onChange={(e) =>
                setNewIncome({ ...newIncome, category: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}>
              <option>Salary</option>
              <option>Freelance</option>
              <option>Business</option>
              <option>Investment</option>
              <option>Gift</option>
              <option>Other</option>
            </select>
          </div>
          <button
            onClick={handleAddIncome}
            style={{
              padding: "10px 20px",
              background: "#10B981",
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
            Income by Category
          </h3>
          <div>
            {Object.entries(incomeByCategory).map(([category, amount]: any) => {
              const percent = (amount / totalIncome) * 100;
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
                        background: "#10B981",
                        height: "100%",
                        width: `${percent}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>
              );
            })}
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
            Income by Month
          </h3>
          <div>
            {Object.entries(incomeByMonth)
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
                  <span style={{ fontWeight: 600, color: "#10B981" }}>
                    +${amount.toFixed(2)}
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
          <h3 style={{ fontSize: 16, fontWeight: 600 }}>Income Transactions</h3>
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
                  Source
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
              {sortedIncome.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      padding: 20,
                      textAlign: "center",
                      color: "#9CA3AF",
                    }}>
                    No income transactions
                  </td>
                </tr>
              ) : (
                sortedIncome.map((inc: any) => (
                  <tr
                    key={inc.id}
                    style={{ borderBottom: "1px solid #374151" }}>
                    <td style={{ padding: 12, fontSize: 13 }}>{inc.date}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>{inc.source}</td>
                    <td style={{ padding: 12, fontSize: 13 }}>
                      {inc.category}
                    </td>
                    <td
                      style={{
                        padding: 12,
                        fontSize: 13,
                        textAlign: "right",
                        color: "#10B981",
                        fontWeight: 600,
                      }}>
                      +${inc.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: 12, textAlign: "center" }}>
                      <button
                        onClick={() => handleDeleteIncome(inc.id)}
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
