import { useState } from "react";
import { api } from "../../services/api";

interface ScheduleProps {
  state: any;
  onStateUpdate: () => void;
}

export default function Schedule({ state, onStateUpdate }: ScheduleProps) {
  const todos = state.todos?.filter((t: any) => t.startTime && t.endTime) || [];
  const [viewMode, setViewMode] = useState<"list" | "day" | "week" | "month">(
    "week",
  );
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    category: "Work",
  });

  const handleAddEvent = async () => {
    if (!newEvent.title) return;
    const event = {
      id: "e_" + Math.random().toString(36).substr(2, 9),
      title: newEvent.title,
      dueDate: newEvent.date,
      date: newEvent.date,
      startTime: newEvent.startTime,
      endTime: newEvent.endTime,
      category: newEvent.category,
      status: "Open",
      priority: "Medium",
      createdAt: new Date().toISOString(),
    };
    await api.createTodo(event);
    setNewEvent({
      title: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      category: "Work",
    });
    setShowForm(false);
    onStateUpdate();
  };

  const handleDeleteEvent = async (id: string) => {
    await api.deleteTodo(id);
    onStateUpdate();
  };

  // Get day of week name
  const getDayName = (date: Date) =>
    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];

  // Get events for a specific date
  const getEventsForDate = (date: string) =>
    todos.filter((e: any) => e.date === date);

  // Day View
  const DayView = () => {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayEvents = getEventsForDate(dateStr).sort((a: any, b: any) =>
      a.startTime.localeCompare(b.startTime),
    );

    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600 }}>
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </h3>
        </div>

        <div
          style={{
            background: "#1F2937",
            borderRadius: 12,
            border: "1px solid #374151",
            overflow: "hidden",
          }}>
          {dayEvents.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
              No events scheduled for today
            </div>
          ) : (
            dayEvents.map((event: any) => (
              <div
                key={event.id}
                style={{
                  padding: 16,
                  borderBottom: "1px solid #374151",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {event.title}
                  </div>
                  <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                    {event.startTime} - {event.endTime}
                  </div>
                  <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 4 }}>
                    {event.category}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEvent(event.id)}
                  style={{
                    padding: "6px 12px",
                    background: "#EF4444",
                    color: "#FFF",
                    border: "none",
                    borderRadius: 4,
                    cursor: "pointer",
                  }}>
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Week View
  const WeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });

    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 12,
            marginBottom: 24,
          }}>
          {weekDays.map((date) => {
            const dateStr = date.toISOString().split("T")[0];
            const dayEvents = getEventsForDate(dateStr);
            return (
              <div
                key={dateStr}
                style={{
                  background: "#1F2937",
                  border: `1px solid ${dateStr === new Date().toISOString().split("T")[0] ? "#3B82F6" : "#374151"}`,
                  borderRadius: 12,
                  padding: 12,
                  textAlign: "center",
                }}>
                <div
                  style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
                  {getDayName(date)}
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
                  {date.getDate()}
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {dayEvents.length === 0 ? (
                    <div style={{ fontSize: 11, color: "#6B7280" }}>-</div>
                  ) : (
                    dayEvents.map((event: any) => (
                      <div
                        key={event.id}
                        style={{
                          background: "#111827",
                          padding: 6,
                          borderRadius: 4,
                          fontSize: 10,
                          textAlign: "left",
                          border: "1px solid #374151",
                        }}>
                        <div
                          style={{
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                          {event.title}
                        </div>
                        <div style={{ color: "#9CA3AF", fontSize: 9 }}>
                          {event.startTime}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Month View
  const MonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthDays = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      monthDays.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      monthDays.push(new Date(year, month, i));
    }

    return (
      <div>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 600 }}>
            {currentDate.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h3>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 8,
            marginBottom: 24,
          }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                fontWeight: 600,
                color: "#9CA3AF",
                fontSize: 12,
                paddingBottom: 8,
              }}>
              {day}
            </div>
          ))}

          {monthDays.map((date, i) => {
            const dateStr = date ? date.toISOString().split("T")[0] : "";
            const dayEvents = date ? getEventsForDate(dateStr) : [];
            const isToday = dateStr === new Date().toISOString().split("T")[0];

            return (
              <div
                key={i}
                style={{
                  background: "#1F2937",
                  border: `1px solid ${isToday ? "#3B82F6" : "#374151"}`,
                  borderRadius: 8,
                  padding: 8,
                  minHeight: 100,
                  display: "flex",
                  flexDirection: "column",
                }}>
                {date ? (
                  <>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        marginBottom: 6,
                        color: isToday ? "#3B82F6" : "#F3F4F6",
                      }}>
                      {date.getDate()}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                      }}>
                      {dayEvents.slice(0, 2).map((event: any) => (
                        <div
                          key={event.id}
                          style={{
                            background: "#111827",
                            padding: 3,
                            borderRadius: 2,
                            fontSize: 9,
                            textAlign: "left",
                            border: "1px solid #374151",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div
                          style={{
                            fontSize: 9,
                            color: "#9CA3AF",
                            fontWeight: 600,
                          }}>
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ opacity: 0.3 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // List View
  const ListView = () => {
    const sortedTodos = todos.sort((a: any, b: any) => {
      const dateCompare = a.date.localeCompare(b.date);
      return dateCompare === 0
        ? a.startTime.localeCompare(b.startTime)
        : dateCompare;
    });

    return (
      <div
        style={{
          background: "#1F2937",
          borderRadius: 12,
          border: "1px solid #374151",
          overflow: "hidden",
        }}>
        {sortedTodos.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9CA3AF" }}>
            No events scheduled
          </div>
        ) : (
          sortedTodos.map((event: any) => (
            <div
              key={event.id}
              style={{
                padding: 16,
                borderBottom: "1px solid #374151",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}>
              <div>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>
                  {event.title}
                </div>
                <div style={{ fontSize: 13, color: "#9CA3AF" }}>
                  {event.date} • {event.startTime} - {event.endTime}
                </div>
                <div style={{ fontSize: 12, color: "#3B82F6", marginTop: 4 }}>
                  {event.category}
                </div>
              </div>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                style={{
                  padding: "6px 12px",
                  background: "#EF4444",
                  color: "#FFF",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>
        📅 Schedule
      </h2>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "12px 24px",
          background: "#3B82F6",
          color: "#FFF",
          border: "none",
          borderRadius: 6,
          fontWeight: 600,
          cursor: "pointer",
          marginBottom: 24,
        }}>
        + Add Event
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
              placeholder="Event title"
              value={newEvent.title}
              onChange={(e) =>
                setNewEvent({ ...newEvent, title: e.target.value })
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
              value={newEvent.date}
              onChange={(e) =>
                setNewEvent({ ...newEvent, date: e.target.value })
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
              type="time"
              value={newEvent.startTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, startTime: e.target.value })
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
              type="time"
              value={newEvent.endTime}
              onChange={(e) =>
                setNewEvent({ ...newEvent, endTime: e.target.value })
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
              value={newEvent.category}
              onChange={(e) =>
                setNewEvent({ ...newEvent, category: e.target.value })
              }
              style={{
                padding: 10,
                background: "#111827",
                border: "1px solid #374151",
                borderRadius: 6,
                color: "#FFF",
              }}>
              <option>Work</option>
              <option>Personal</option>
              <option>Meeting</option>
              <option>Health</option>
            </select>
          </div>
          <button
            onClick={handleAddEvent}
            style={{
              padding: "10px 20px",
              background: "#3B82F6",
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
            }}>
            Save Event
          </button>
        </div>
      )}

      {/* View Mode Navigation */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 24,
          flexWrap: "wrap",
        }}>
        {(["list", "day", "week", "month"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setViewMode(mode)}
            style={{
              padding: "8px 16px",
              background: viewMode === mode ? "#3B82F6" : "#1F2937",
              border: "1px solid #374151",
              color: "#F3F4F6",
              borderRadius: 6,
              fontWeight: 600,
              cursor: "pointer",
              textTransform: "capitalize",
            }}>
            {mode} View
          </button>
        ))}

        {viewMode !== "list" && (
          <div style={{ display: "flex", gap: 8, marginLeft: "auto" }}>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() - 1,
                  ),
                )
              }
              style={{
                padding: "8px 12px",
                background: "#1F2937",
                border: "1px solid #374151",
                color: "#F3F4F6",
                borderRadius: 6,
                cursor: "pointer",
              }}>
              ← Prev
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{
                padding: "8px 12px",
                background: "#1F2937",
                border: "1px solid #374151",
                color: "#F3F4F6",
                borderRadius: 6,
                cursor: "pointer",
              }}>
              Today
            </button>
            <button
              onClick={() =>
                setCurrentDate(
                  new Date(
                    currentDate.getFullYear(),
                    currentDate.getMonth(),
                    currentDate.getDate() + 1,
                  ),
                )
              }
              style={{
                padding: "8px 12px",
                background: "#1F2937",
                border: "1px solid #374151",
                color: "#F3F4F6",
                borderRadius: 6,
                cursor: "pointer",
              }}>
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Views */}
      {viewMode === "list" && <ListView />}
      {viewMode === "day" && <DayView />}
      {viewMode === "week" && <WeekView />}
      {viewMode === "month" && <MonthView />}
    </div>
  );
}
