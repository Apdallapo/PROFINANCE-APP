import { useState } from "react";

interface ReportsProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Reports({ state }: ReportsProps) {
  const [activeTab, setActiveTab] = useState<"productivity" | "financial">(
    "productivity",
  );

  const todos = state.todos || [];
  const income = state.income || [];
  const expenses = state.expenses || [];

  // Productivity metrics
  const totalTasks = todos.length;
  const completedTasks = todos.filter(
    (t: any) => t.status === "Completed",
  ).length;
  const completionRate =
    totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

  const priorities = todos.reduce((acc: any, t: any) => {
    const p = t.priority || "Medium";
    acc[p] = (acc[p] || 0) + 1;
    return acc;
  }, {});

  // Financial metrics - 6 months
  const monthlyData: any = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const month = date.toISOString().substring(0, 7);
    const monthIncome = income
      .filter((inc: any) => inc.date?.startsWith(month))
      .reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0);
    const monthExpense = expenses
      .filter((exp: any) => exp.date?.startsWith(month))
      .reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    monthlyData[month] = {
      income: monthIncome,
      expense: monthExpense,
      net: monthIncome - monthExpense,
    };
  }

  const totalIncome = income.reduce(
    (sum: number, i: any) => sum + (i.amount || 0),
    0,
  );
  const totalExpense = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount || 0),
    0,
  );

  // CSV Export functions
  const exportTasksCSV = () => {
    const headers = ["Task", "Status", "Priority", "Due Date", "Category"];
    const rows = todos.map((t: any) => [
      t.title,
      t.status,
      t.priority,
      t.dueDate,
      t.category,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tasks-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const exportFinanceCSV = () => {
    const headers = ["Date", "Type", "Amount", "Category", "Description"];
    const rows: any = [];

    income.forEach((i: any) => {
      rows.push([i.date, "Income", i.amount, i.category, i.source]);
    });

    expenses.forEach((e: any) => {
      rows.push([e.date, "Expense", e.amount, e.category, e.merchant]);
    });

    rows.sort(
      (a: any, b: any) => new Date(b[0]).getTime() - new Date(a[0]).getTime(),
    );

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finance-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        📊 Reports & Analytics
      </h2>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 32,
          borderBottom: "1px solid #374151",
          paddingBottom: 16,
        }}>
        <button
          onClick={() => setActiveTab("productivity")}
          style={{
            padding: "8px 16px",
            background:
              activeTab === "productivity" ? "#3B82F6" : "transparent",
            color: "#F3F4F6",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          📈 Productivity
        </button>
        <button
          onClick={() => setActiveTab("financial")}
          style={{
            padding: "8px 16px",
            background: activeTab === "financial" ? "#3B82F6" : "transparent",
            color: "#F3F4F6",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          💰 Financial
        </button>
      </div>

      {/* Productivity Tab */}
      {activeTab === "productivity" && (
        <div>
          {/* Key Metrics */}
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
                Total Tasks
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#3B82F6" }}>
                {totalTasks}
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
                Completed
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#10B981" }}>
                {completedTasks}
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
                Completion Rate
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#F59E0B" }}>
                {completionRate}%
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 24,
              marginBottom: 32,
            }}>
            {/* Priority Breakdown */}
            <div
              style={{
                background: "#1F2937",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #374151",
              }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Tasks by Priority
              </h3>
              <div>
                {Object.entries(priorities).map(([priority, count]: any) => {
                  const colors: any = {
                    High: "#EF4444",
                    Medium: "#F59E0B",
                    Low: "#10B981",
                  };
                  const color = colors[priority] || "#6B7280";
                  const percent = (count / totalTasks) * 100;
                  return (
                    <div key={priority} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          fontSize: 12,
                        }}>
                        <span>{priority} Priority</span>
                        <span style={{ fontWeight: 600 }}>{count} tasks</span>
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
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Completion Trends */}
            <div
              style={{
                background: "#1F2937",
                padding: 20,
                borderRadius: 12,
                border: "1px solid #374151",
              }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                Status Overview
              </h3>
              <div>
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: 12,
                    }}>
                    <span>Completed</span>
                    <span style={{ fontWeight: 600 }}>{completedTasks}</span>
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
                        width: `${(completedTasks / Math.max(totalTasks, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 6,
                      fontSize: 12,
                    }}>
                    <span>Pending</span>
                    <span style={{ fontWeight: 600 }}>
                      {totalTasks - completedTasks}
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
                        background: "#F59E0B",
                        height: "100%",
                        width: `${((totalTasks - completedTasks) / Math.max(totalTasks, 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={exportTasksCSV}
            style={{
              padding: "10px 20px",
              background: "#3B82F6",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            📥 Export Tasks as CSV
          </button>
        </div>
      )}

      {/* Financial Tab */}
      {activeTab === "financial" && (
        <div>
          {/* Key Metrics */}
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
                Net Balance
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#3B82F6" }}>
                ${(totalIncome - totalExpense).toFixed(2)}
              </div>
            </div>
          </div>

          {/* 6-Month Overview */}
          <div
            style={{
              background: "#1F2937",
              padding: 20,
              borderRadius: 12,
              border: "1px solid #374151",
              marginBottom: 32,
            }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
              6-Month Overview
            </h3>
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
                      Month
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "right",
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontWeight: 600,
                      }}>
                      Income
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "right",
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontWeight: 600,
                      }}>
                      Expenses
                    </th>
                    <th
                      style={{
                        padding: 12,
                        textAlign: "right",
                        fontSize: 12,
                        color: "#9CA3AF",
                        fontWeight: 600,
                      }}>
                      Net
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(monthlyData).map(([month, data]: any) => (
                    <tr
                      key={month}
                      style={{ borderBottom: "1px solid #374151" }}>
                      <td style={{ padding: 12, fontSize: 13 }}>{month}</td>
                      <td
                        style={{
                          padding: 12,
                          textAlign: "right",
                          color: "#10B981",
                          fontWeight: 600,
                        }}>
                        +${data.income.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          textAlign: "right",
                          color: "#EF4444",
                          fontWeight: 600,
                        }}>
                        -${data.expense.toFixed(2)}
                      </td>
                      <td
                        style={{
                          padding: 12,
                          textAlign: "right",
                          fontWeight: 600,
                          color: data.net >= 0 ? "#3B82F6" : "#EF4444",
                        }}>
                        ${data.net.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <button
            onClick={exportFinanceCSV}
            style={{
              padding: "10px 20px",
              background: "#3B82F6",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            📥 Export Finance as CSV
          </button>
        </div>
      )}
    </div>
  );
}
