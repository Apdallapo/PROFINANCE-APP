import { useState } from "react";
import { api } from "../../services/api";

interface SavingsProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Savings({ state, onStateUpdate }: SavingsProps) {
  const [newSavings, setNewSavings] = useState({
    goal: "",
    goalType: "Emergency Fund",
    amount: 0,
    targetAmount: 10000,
    date: new Date().toISOString().split("T")[0],
  });
  const [showForm, setShowForm] = useState(false);

  const savings = state.savings || [];

  const totalSavings = savings.reduce(
    (sum: number, s: any) => sum + (s.amount || 0),
    0,
  );
  const totalGoals = savings.reduce(
    (sum: number, s: any) => sum + (s.targetAmount || 0),
    0,
  );

  const handleAddSavings = async () => {
    if (!newSavings.goal || newSavings.amount <= 0) return;
    const savingsEntry = {
      id: "s_" + Math.random().toString(36).substr(2, 9),
      ...newSavings,
    };
    await api.createSavings(savingsEntry);
    setNewSavings({
      goal: "",
      goalType: "Emergency Fund",
      amount: 0,
      targetAmount: 10000,
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    onStateUpdate();
  };

  const handleDeleteSavings = async (id: string) => {
    await api.deleteSavings(id);
    onStateUpdate();
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        🎯 Savings Goals
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
            Total Saved
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#10B981" }}>
            ${totalSavings.toFixed(2)}
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
            Total Goal Target
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#3B82F6" }}>
            ${totalGoals.toFixed(2)}
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
            Overall Progress
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: "#F59E0B" }}>
            {totalGoals > 0
              ? `${((totalSavings / totalGoals) * 100).toFixed(0)}%`
              : "0%"}
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
        + Add Savings Goal
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
              placeholder="Goal name"
              value={newSavings.goal}
              onChange={(e) =>
                setNewSavings({ ...newSavings, goal: e.target.value })
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
              value={newSavings.goalType}
              onChange={(e) =>
                setNewSavings({ ...newSavings, goalType: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}>
              <option>Emergency Fund</option>
              <option>Vacation</option>
              <option>Education</option>
              <option>Home</option>
              <option>Car</option>
              <option>Retirement</option>
              <option>Other</option>
            </select>
            <input
              type="number"
              placeholder="Current amount"
              value={newSavings.amount}
              onChange={(e) =>
                setNewSavings({
                  ...newSavings,
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
              type="number"
              placeholder="Target amount"
              value={newSavings.targetAmount}
              onChange={(e) =>
                setNewSavings({
                  ...newSavings,
                  targetAmount: parseFloat(e.target.value),
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
              value={newSavings.date}
              onChange={(e) =>
                setNewSavings({ ...newSavings, date: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}
            />
          </div>
          <button
            onClick={handleAddSavings}
            style={{
              padding: "10px 20px",
              background: "#10B981",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            Save Goal
          </button>
        </div>
      )}

      {/* Savings Goals Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}>
        {savings.length === 0 ? (
          <div
            style={{
              gridColumn: "1/-1",
              textAlign: "center",
              padding: 40,
              color: "#9CA3AF",
            }}>
            No savings goals yet. Create one to get started!
          </div>
        ) : (
          savings.map((goal: any) => {
            const percent = (goal.amount / goal.targetAmount) * 100;
            const isCompleted = percent >= 100;
            return (
              <div
                key={goal.id}
                style={{
                  background: "#1F2937",
                  borderRadius: 12,
                  border: `1px solid ${isCompleted ? "#10B981" : "#374151"}`,
                  padding: 20,
                }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    marginBottom: 16,
                  }}>
                  <div>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: 16,
                        fontWeight: 600,
                        marginBottom: 4,
                      }}>
                      {goal.goal}
                    </h4>
                    <div
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}>
                      Type: {goal.goalType || "Other"}
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                      Created: {goal.date}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSavings(goal.id)}
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
                </div>

                {/* Progress Bar */}
                <div style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 8,
                      fontSize: 13,
                    }}>
                    <span>${goal.amount.toFixed(2)}</span>
                    <span style={{ color: "#9CA3AF" }}>
                      ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <div
                    style={{
                      background: "#111827",
                      borderRadius: 8,
                      height: 8,
                      overflow: "hidden",
                    }}>
                    <div
                      style={{
                        background: isCompleted ? "#10B981" : "#3B82F6",
                        height: "100%",
                        width: `${Math.min(percent, 100)}%`,
                        transition: "width 0.3s",
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}>
                  <div
                    style={{
                      background: "#111827",
                      padding: 12,
                      borderRadius: 6,
                      textAlign: "center",
                    }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}>
                      Progress
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#3B82F6",
                      }}>
                      {percent.toFixed(0)}%
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#111827",
                      padding: 12,
                      borderRadius: 6,
                      textAlign: "center",
                    }}>
                    <div
                      style={{
                        fontSize: 11,
                        color: "#9CA3AF",
                        marginBottom: 4,
                      }}>
                      Remaining
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "#F59E0B",
                      }}>
                      ${Math.max(0, goal.targetAmount - goal.amount).toFixed(2)}
                    </div>
                  </div>
                </div>

                {isCompleted && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 10,
                      background: "#065F46",
                      border: "1px solid #10B981",
                      borderRadius: 6,
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#10B981",
                    }}>
                    ✓ Goal Completed!
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
