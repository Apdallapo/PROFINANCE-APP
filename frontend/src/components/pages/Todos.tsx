import { useState } from "react";
import { api } from "../../services/api";

interface TodosProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Todos({ state, onStateUpdate }: TodosProps) {
  const todos = state.todos || [];
  const recurringTemplates = state.recurringTemplates || [];
  
  // Todo creation/editing
  const [newTodo, setNewTodo] = useState("");
  const [newTodoDate, setNewTodoDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [newTodoStartTime, setNewTodoStartTime] = useState("09:00");
  const [newTodoEndTime, setNewTodoEndTime] = useState("17:00");
  const [newTodoCategory, setNewTodoCategory] = useState("Work");
  const [newTodoPriority, setNewTodoPriority] = useState("Medium");
  const [editingTodo, setEditingTodo] = useState<any>(null);
  
  // Recurring template creation
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("Work");
  const [newTemplatePriority, setNewTemplatePriority] = useState("Medium");
  const [newTemplateStartTime, setNewTemplateStartTime] = useState("09:00");
  const [newTemplateEndTime, setNewTemplateEndTime] = useState("17:00");
  const [newTemplateDays, setNewTemplateDays] = useState<number[]>([1, 3, 5]); // Mon, Wed, Fri
  
  // Filtering
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "open" | "completed"
  >("all");
  const [filterPriority, setFilterPriority] = useState<
    "all" | "High" | "Medium" | "Low"
  >("all");
  const [activeTab, setActiveTab] = useState<"all" | "today" | "overdue">(
    "all",
  );

  const addTodo = async () => {
    if (newTodo.trim()) {
      if (editingTodo) {
        // Update existing todo
        const updatedTodo = {
          ...editingTodo,
          title: newTodo,
          date: newTodoDate,
          dueDate: newTodoDate,
          startTime: newTodoStartTime,
          endTime: newTodoEndTime,
          category: newTodoCategory,
          priority: newTodoPriority,
        };
        await api.createTodo(updatedTodo);
        setEditingTodo(null);
      } else {
        // Create new todo
        const todo = {
          id: "t_" + Math.random().toString(36).substr(2, 9),
          title: newTodo,
          dueDate: newTodoDate,
          date: newTodoDate,
          startTime: newTodoStartTime,
          endTime: newTodoEndTime,
          status: "Open",
          description: "",
          category: newTodoCategory,
          priority: newTodoPriority,
          timerRunning: 0,
          createdAt: new Date().toISOString(),
        };
        await api.createTodo(todo);
      }
      setNewTodo("");
      setNewTodoDate(new Date().toISOString().split("T")[0]);
      setNewTodoStartTime("09:00");
      setNewTodoEndTime("17:00");
      setNewTodoCategory("Work");
      setNewTodoPriority("Medium");
      onStateUpdate();
    }
  };

  const startEditingTodo = (todo: any) => {
    setEditingTodo(todo);
    setNewTodo(todo.title);
    setNewTodoDate(todo.dueDate);
    setNewTodoStartTime(todo.startTime || "09:00");
    setNewTodoEndTime(todo.endTime || "17:00");
    setNewTodoCategory(todo.category || "Work");
    setNewTodoPriority(todo.priority || "Medium");
  };

  const cancelEdit = () => {
    setEditingTodo(null);
    setNewTodo("");
    setNewTodoDate(new Date().toISOString().split("T")[0]);
    setNewTodoStartTime("09:00");
    setNewTodoEndTime("17:00");
    setNewTodoCategory("Work");
    setNewTodoPriority("Medium");
  };

  const createTemplate = async () => {
    if (newTemplate.trim()) {
      const template = {
        id: "tpl_" + Math.random().toString(36).substr(2, 9),
        title: newTemplate,
        description: "",
        category: newTemplateCategory,
        priority: newTemplatePriority,
        startTime: newTemplateStartTime,
        endTime: newTemplateEndTime,
        daysOfWeek: JSON.stringify(newTemplateDays),
        active: 1,
      };
      await api.createTemplate(template);
      setNewTemplate("");
      setNewTemplateCategory("Work");
      setNewTemplatePriority("Medium");
      setNewTemplateStartTime("09:00");
      setNewTemplateEndTime("17:00");
      setNewTemplateDays([1, 3, 5]);
      setShowTemplateForm(false);
      onStateUpdate();
    }
  };

  const deleteTemplate = async (id: string) => {
    await api.deleteTemplate(id);
    onStateUpdate();
  };

  const toggleTodo = async (todo: any) => {
    const updatedTodo = {
      ...todo,
      status: todo.status === "Open" ? "Completed" : "Open",
      completedDate: todo.status === "Open" ? new Date().toISOString() : null,
    };
    await api.createTodo(updatedTodo);
    onStateUpdate();
  };

  const deleteTodo = async (id: string) => {
    await api.deleteTodo(id);
    onStateUpdate();
  };

  // Filtering logic
  let filteredTodos = todos.filter((t: any) => {
    const matchesSearch = t.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      t.status === (filterStatus === "completed" ? "Completed" : "Open");
    const matchesPriority =
      filterPriority === "all" || t.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const today = new Date().toISOString().split("T")[0];

  if (activeTab === "today") {
    filteredTodos = filteredTodos.filter((t: any) => t.dueDate === today);
  } else if (activeTab === "overdue") {
    filteredTodos = filteredTodos.filter(
      (t: any) => t.dueDate < today && t.status === "Open",
    );
  }

  filteredTodos.sort(
    (a: any, b: any) =>
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime(),
  );

  const completedCount = todos.filter(
    (t: any) => t.status === "Completed",
  ).length;
  const pendingCount = todos.length - completedCount;
  const overdueCount = todos.filter(
    (t: any) => t.dueDate < today && t.status === "Open",
  ).length;

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        ✓ Todo List
      </h2>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}>
        <div
          style={{
            background: "#1F2937",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>
            Total Tasks
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#3B82F6" }}>
            {todos.length}
          </div>
        </div>

        <div
          style={{
            background: "#1F2937",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>
            Completed
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#10B981" }}>
            {completedCount}
          </div>
        </div>

        <div
          style={{
            background: "#1F2937",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>
            Pending
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#F59E0B" }}>
            {pendingCount}
          </div>
        </div>

        <div
          style={{
            background: "#1F2937",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #374151",
          }}>
          <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 6 }}>
            Overdue
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#EF4444" }}>
            {overdueCount}
          </div>
        </div>
      </div>

      {/* Recurring Templates Section */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h3 style={{ fontSize: 18, fontWeight: 600 }}>🔄 Recurring Templates ({recurringTemplates.length})</h3>
          <button
            onClick={() => setShowTemplateForm(!showTemplateForm)}
            style={{
              padding: "8px 16px",
              background: "#6C63FF",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {showTemplateForm ? "Cancel" : "+ New Template"}
          </button>
        </div>

        {showTemplateForm && (
          <div style={{
            background: "#1F2937",
            padding: 16,
            borderRadius: 12,
            border: "1px solid #374151",
            marginBottom: 12,
          }}>
            <input
              type="text"
              value={newTemplate}
              onChange={(e) => setNewTemplate(e.target.value)}
              placeholder="Template title..."
              style={{
                width: "100%",
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#F3F4F6",
                fontSize: 13,
                marginBottom: 12,
              }}
            />
            <div style={{ display: "flex", gap: 12, marginBottom: 12, flexWrap: "wrap" }}>
              <input
                type="time"
                value={newTemplateStartTime}
                onChange={(e) => setNewTemplateStartTime(e.target.value)}
                style={{
                  padding: 10,
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#F3F4F6",
                  fontSize: 13,
                }}
              />
              <input
                type="time"
                value={newTemplateEndTime}
                onChange={(e) => setNewTemplateEndTime(e.target.value)}
                style={{
                  padding: 10,
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#F3F4F6",
                  fontSize: 13,
                }}
              />
              <select
                value={newTemplateCategory}
                onChange={(e) => setNewTemplateCategory(e.target.value)}
                style={{
                  padding: 10,
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#F3F4F6",
                  fontSize: 13,
                }}
              >
                <option>Work</option>
                <option>Study</option>
                <option>Health</option>
                <option>Personal</option>
                <option>Finance</option>
                <option>Home</option>
                <option>Other</option>
              </select>
              <select
                value={newTemplatePriority}
                onChange={(e) => setNewTemplatePriority(e.target.value)}
                style={{
                  padding: 10,
                  background: "#111827",
                  border: "1px solid #374151",
                  borderRadius: 6,
                  color: "#F3F4F6",
                  fontSize: 13,
                }}
              >
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 8, display: "block" }}>Repeat on:</label>
              <div style={{ display: "flex", gap: 6 }}>
                {[
                  { label: "Sun", val: 0 },
                  { label: "Mon", val: 1 },
                  { label: "Tue", val: 2 },
                  { label: "Wed", val: 3 },
                  { label: "Thu", val: 4 },
                  { label: "Fri", val: 5 },
                  { label: "Sat", val: 6 },
                ].map((day) => (
                  <button
                    key={day.val}
                    onClick={() => {
                      if (newTemplateDays.includes(day.val)) {
                        setNewTemplateDays(newTemplateDays.filter((d) => d !== day.val));
                      } else {
                        setNewTemplateDays([...newTemplateDays, day.val]);
                      }
                    }}
                    style={{
                      padding: "6px 12px",
                      background: newTemplateDays.includes(day.val) ? "#6C63FF" : "#111827",
                      color: "#F3F4F6",
                      border: "1px solid #374151",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={createTemplate}
              style={{
                padding: "10px 20px",
                background: "#22C55E",
                color: "#FFF",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Create Template
            </button>
          </div>
        )}

        {recurringTemplates.length > 0 && (
          <div style={{
            background: "#1F2937",
            borderRadius: 12,
            border: "1px solid #374151",
            overflow: "hidden",
          }}>
            {recurringTemplates.map((tpl: any) => {
              const daysOfWeek = typeof tpl.daysOfWeek === "string" ? JSON.parse(tpl.daysOfWeek) : tpl.daysOfWeek;
              const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
              const dayNames = daysOfWeek.map((d: number) => dayLabels[d]).join(", ");

              return (
                <div
                  key={tpl.id}
                  style={{
                    padding: 16,
                    borderBottom: "1px solid #374151",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#F3F4F6", marginBottom: 6 }}>
                      {tpl.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>
                      {tpl.startTime} - {tpl.endTime} • {dayNames}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTemplate(tpl.id)}
                    style={{
                      padding: "6px 12px",
                      background: "#EF4444",
                      color: "#FFF",
                      border: "none",
                      borderRadius: 4,
                      fontSize: 12,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Todo Form */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}>
        <input
          type="date"
          value={newTodoDate}
          onChange={(e) => setNewTodoDate(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}
        />
        <input
          type="time"
          value={newTodoStartTime}
          onChange={(e) => setNewTodoStartTime(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}
          title="Start Time"
        />
        <input
          type="time"
          value={newTodoEndTime}
          onChange={(e) => setNewTodoEndTime(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}
          title="End Time"
        />
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && addTodo()}
          placeholder="Add a new task..."
          style={{
            flex: 1,
            minWidth: 200,
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}
        />
        <select
          value={newTodoCategory}
          onChange={(e) => setNewTodoCategory(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}>
          <option>Work</option>
          <option>Study</option>
          <option>Health</option>
          <option>Personal</option>
          <option>Finance</option>
          <option>Home</option>
          <option>Other</option>
        </select>
        <select
          value={newTodoPriority}
          onChange={(e) => setNewTodoPriority(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>
        <button
          onClick={addTodo}
          style={{
            padding: "10px 20px",
            background: "#3B82F6",
            color: "#FFF",
            border: "none",
            borderRadius: 6,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          Add Task
        </button>
      </div>

      {/* Search and Filters */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
          alignItems: "center",
        }}>
        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
            minWidth: 200,
          }}
        />

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as any)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}>
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as any)}
          style={{
            padding: 10,
            background: "#1F2937",
            border: "1px solid #374151",
            borderRadius: 6,
            color: "#F3F4F6",
            fontSize: 13,
          }}>
          <option value="all">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 16,
          borderBottom: "1px solid #374151",
          paddingBottom: 12,
        }}>
        <button
          onClick={() => setActiveTab("all")}
          style={{
            padding: "6px 12px",
            background: activeTab === "all" ? "#3B82F6" : "transparent",
            color: "#F3F4F6",
            border: "none",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          All
        </button>
        <button
          onClick={() => setActiveTab("today")}
          style={{
            padding: "6px 12px",
            background: activeTab === "today" ? "#3B82F6" : "transparent",
            color: "#F3F4F6",
            border: "none",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          Today
        </button>
        <button
          onClick={() => setActiveTab("overdue")}
          style={{
            padding: "6px 12px",
            background: activeTab === "overdue" ? "#EF4444" : "transparent",
            color: activeTab === "overdue" ? "#FFF" : "#F3F4F6",
            border: "none",
            borderRadius: 4,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}>
          Overdue ({overdueCount})
        </button>
      </div>

      {/* Task List */}
      <div
        style={{
          background: "#1F2937",
          borderRadius: 12,
          border: "1px solid #374151",
          overflow: "hidden",
        }}>
        <div>
          {filteredTodos.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
              {searchTerm || filterStatus !== "all" || filterPriority !== "all"
                ? "No tasks match your filters"
                : "No tasks yet. Add one to get started!"}
            </div>
          ) : (
            filteredTodos.map((todo: any) => {
              const isOverdue = todo.dueDate < today && todo.status === "Open";
              const priorityColors: any = {
                High: "#EF4444",
                Medium: "#F59E0B",
                Low: "#10B981",
              };

              return (
                <div
                  key={todo.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: 16,
                    borderBottom: "1px solid #374151",
                    gap: 12,
                    background: isOverdue
                      ? "rgba(239, 68, 68, 0.05)"
                      : "transparent",
                  }}>
                  <input
                    type="checkbox"
                    checked={todo.status === "Completed"}
                    onChange={() => toggleTodo(todo)}
                    style={{ cursor: "pointer", width: 18, height: 18 }}
                  />

                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        textDecoration:
                          todo.status === "Completed" ? "line-through" : "none",
                        color:
                          todo.status === "Completed" ? "#6B7280" : "#F3F4F6",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}>
                      {todo.title}
                      {todo.templateId && (
                        <span title="Recurring task" style={{ fontSize: 12, opacity: 0.7 }}>🔄</span>
                      )}
                      {todo.timerRunning && (
                        <span title="Timer running" style={{ fontSize: 12, animation: "pulse 1s infinite" }}>⏱️</span>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 6,
                        fontSize: 12,
                        flexWrap: "wrap",
                      }}>
                      <span style={{ color: "#9CA3AF" }}>
                        📅 {todo.dueDate}
                      </span>
                      {todo.startTime && todo.endTime && (
                        <span style={{ color: "#9CA3AF" }}>
                          🕐 {todo.startTime} - {todo.endTime}
                        </span>
                      )}
                      <span
                        style={{
                          padding: "2px 6px",
                          background: priorityColors[todo.priority],
                          color: "#FFF",
                          borderRadius: 3,
                          fontSize: 11,
                          fontWeight: 600,
                        }}>
                        {todo.priority}
                      </span>
                      {todo.category && (
                        <span
                          style={{
                            padding: "2px 6px",
                            background: "#111827",
                            border: "1px solid #374151",
                            borderRadius: 3,
                            fontSize: 11,
                          }}>
                          {todo.category}
                        </span>
                      )}
                      {isOverdue && (
                        <span style={{ color: "#EF4444", fontWeight: 600 }}>
                          ⚠️ Overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => startEditingTodo(todo)}
                      style={{
                        padding: "6px 12px",
                        background: "#3B82F6",
                        color: "#FFF",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                      }}>
                      Edit
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      style={{
                        padding: "6px 12px",
                        background: "#EF4444",
                        color: "#FFF",
                        border: "none",
                        borderRadius: 4,
                        fontSize: 12,
                        cursor: "pointer",
                      }}>
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
