import { useState, useEffect } from "react";
import { colors } from "../../utils/colors";
import { dedupeRecurringInstances, getTaskStatus } from "../../utils/taskUtils";

interface HomeProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Home({ state }: HomeProps) {
  const [sevenDayData, setSevenDayData] = useState<any[]>([]);

  const income = state.income || [];
  const expenses = state.expenses || [];
  const todos = state.todos || [];

  // Apply deduplication to get logical task counts
  const deduped = dedupeRecurringInstances(todos);

  const totalIncome = income.reduce(
    (sum: number, i: any) => sum + (i.amount || 0),
    0,
  );
  const totalExpense = expenses.reduce(
    (sum: number, e: any) => sum + (e.amount || 0),
    0,
  );
  const balance = totalIncome - totalExpense;

  const completedTodos = deduped.filter(
    (t: any) => getTaskStatus(t) === "completed",
  ).length;
  const missedTodos = deduped.filter(
    (t: any) => getTaskStatus(t) === "missed",
  ).length;
  const overdueCount = deduped.filter(
    (t: any) => getTaskStatus(t) === "overdue",
  ).length;

  useEffect(() => {
    // Generate 7-day activity data
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const dayIncome = income
        .filter((i: any) => i.date === dateStr)
        .reduce((sum: number, i: any) => sum + (i.amount || 0), 0);
      const dayExpense = expenses
        .filter((e: any) => e.date === dateStr)
        .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

      days.push({
        date: dateStr,
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        income: dayIncome,
        expense: dayExpense,
      });
    }
    setSevenDayData(days);
  }, [income, expenses]);

  const maxValue = Math.max(
    ...sevenDayData.map((d) => Math.max(d.income, d.expense)),
    1000,
  );

  const todayAgenda = todos
    .filter((t: any) => (t.date || t.dueDate) === new Date().toISOString().split("T")[0])
    .sort((a: any, b: any) =>
      (a.startTime || "").localeCompare(b.startTime || ""),
    )
    .slice(0, 5);

  return (
    <div>
      <h2
        style={{
          fontSize: 32,
          fontWeight: 700,
          marginBottom: 32,
          color: colors.text,
        }}>
        Welcome back! 👋
      </h2>

      {/* Hero Balance Card */}
      <div
        style={{
          background: colors.gradients.success,
          borderRadius: 16,
          padding: 32,
          marginBottom: 32,
          boxShadow: "0 10px 40px rgba(108, 99, 255, 0.3)",
        }}>
        <div
          style={{
            fontSize: 14,
            color: "rgba(255, 255, 255, 0.7)",
            marginBottom: 8,
          }}>
          Total Balance
        </div>
        <div
          className="currency"
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#FFF",
            marginBottom: 24,
          }}>
          $
          {balance.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: 4,
              }}>
              Income
            </div>
            <div
              className="currency"
              style={{ fontSize: 24, fontWeight: 800, color: colors.text }}>
              +$
              {totalIncome.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
          <div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255, 255, 255, 0.7)",
                marginBottom: 4,
              }}>
              Expenses
            </div>
            <div
              className="currency"
              style={{ fontSize: 24, fontWeight: 700, color: colors.danger }}>
              -$
              {totalExpense.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}>
        <div
          style={{
            background: colors.bgCard,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
          }}>
          <div
            style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Completed Tasks
          </div>
          <div
            className="number"
            style={{ fontSize: 28, fontWeight: 700, color: colors.success }}>
            {completedTodos}
          </div>
          <div
            style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>
            of {deduped.length} total
          </div>
        </div>

        <div
          style={{
            background: colors.bgCard,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
          }}>
          <div
            style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Missed Tasks
          </div>
          <div
            className="number"
            style={{ fontSize: 28, fontWeight: 700, color: colors.danger }}>
            {missedTodos}
          </div>
          <div
            style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>
            Action required
          </div>
        </div>

        <div
          style={{
            background: colors.bgCard,
            padding: 20,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
          }}>
          <div
            style={{ fontSize: 12, color: colors.textMuted, marginBottom: 8 }}>
            Total Transactions
          </div>
          <div
            className="number"
            style={{ fontSize: 28, fontWeight: 700, color: colors.info }}>
            {income.length + expenses.length}
          </div>
          <div
            style={{ fontSize: 11, color: colors.textSecondary, marginTop: 8 }}>
            This month
          </div>
        </div>
      </div>

      {/* Missed Tasks Banner */}
      {(missedTodos > 0 || overdueCount > 0) && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: `1px solid ${colors.danger}`,
            borderRadius: 12,
            padding: 16,
            marginBottom: 32,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}>
          <div style={{ fontSize: 24 }}>⚠️</div>
          <div>
            <div
              style={{ fontSize: 14, fontWeight: 600, color: colors.danger }}>
              {overdueCount > 0 && (
                <div>You have {overdueCount} overdue task{overdueCount > 1 ? "s" : ""}</div>
              )}
              {missedTodos > 0 && (
                <div>{missedTodos} task{missedTodos > 1 ? "s" : ""} from previous day{missedTodos > 1 ? "s" : ""}</div>
              )}
            </div>
            <div
              style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>
              Please complete them to stay on track
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 32 }}>
        {/* 7-Day Activity Chart */}
        <div
          style={{
            background: colors.bgCard,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: 24,
          }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 600,
              marginBottom: 16,
              color: colors.text,
            }}>
            7-Day Activity
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-around",
              height: 200,
              gap: 8,
            }}>
            {sevenDayData.map((day, idx) => {
              const incomeHeight = (day.income / maxValue) * 150;
              const expenseHeight = (day.expense / maxValue) * 150;
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: 1,
                  }}>
                  <div
                    style={{
                      display: "flex",
                      gap: 4,
                      height: 160,
                      alignItems: "flex-end",
                      marginBottom: 8,
                    }}>
                    <div
                      style={{
                        width: 12,
                        height: `${incomeHeight}px`,
                        background: colors.success,
                        borderRadius: 2,
                        opacity: day.income > 0 ? 1 : 0.2,
                      }}
                      title={`Income: $${day.income}`}
                    />
                    <div
                      style={{
                        width: 12,
                        height: `${expenseHeight}px`,
                        background: colors.danger,
                        borderRadius: 2,
                        opacity: day.expense > 0 ? 1 : 0.2,
                      }}
                      title={`Expense: $${day.expense}`}
                    />
                  </div>
                  <div style={{ fontSize: 11, color: colors.textMuted }}>
                    {day.day}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 24,
              marginTop: 16,
            }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: colors.success,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                Income
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  background: colors.danger,
                  borderRadius: 2,
                }}
              />
              <span style={{ fontSize: 12, color: colors.textMuted }}>
                Expense
              </span>
            </div>
          </div>
        </div>

        {/* Today's Agenda */}
        <div
          style={{
            background: colors.bgCard,
            borderRadius: 12,
            border: `1px solid ${colors.border}`,
            padding: 24,
          }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              color: colors.success,
            }}>
            Today's Agenda
          </h3>
          <div>
            {todayAgenda.length === 0 ? (
              <div
                style={{
                  fontSize: 13,
                  color: colors.textMuted,
                  textAlign: "center",
                  padding: 20,
                }}>
                No tasks for today
              </div>
            ) : (
              todayAgenda.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    marginBottom: 12,
                    paddingBottom: 12,
                    borderBottom: `1px solid ${colors.border}`,
                  }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color:
                        task.status === "Completed"
                          ? colors.textSecondary
                          : colors.text,
                      textDecoration:
                        task.status === "Completed" ? "line-through" : "none",
                    }}>
                    {task.title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: colors.textMuted,
                      marginTop: 4,
                    }}>
                    {task.startTime ? `${task.startTime}` : "No time set"}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
