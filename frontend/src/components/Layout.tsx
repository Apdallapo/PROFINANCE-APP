import React, { useState } from "react";
import { colors } from "../theme/colors";

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  state: any;
  onLogout?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({
  children,
  currentPage,
  onNavigate,
  state,
  onLogout,
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navSections = {
    main: [
      { id: "home", label: "Dashboard", icon: "📊" },
      { id: "finance", label: "Finance", icon: "💳" },
    ],
    time: [
      { id: "todos", label: "Tasks", icon: "✓" },
      { id: "schedule", label: "Schedule", icon: "📅" },
    ],
    finance: [
      { id: "income", label: "Income", icon: "📈" },
      { id: "expenses", label: "Expenses", icon: "📉" },
      { id: "savings", label: "Savings", icon: "🎯" },
    ],
    analytics: [{ id: "reports", label: "Reports", icon: "📊" }],
  };

  const allNavItems = [
    ...navSections.main,
    ...navSections.time,
    ...navSections.finance,
    ...navSections.analytics,
  ];

  const handleLogoutClick = () => {
    localStorage.removeItem("profinance_token");
    if (onLogout) onLogout();
    window.location.reload();
  };

  // Desktop Sidebar
  const Sidebar = () => (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 60,
        width: 220,
        height: "calc(100vh - 60px)",
        background: colors.surface,
        borderRight: `1px solid ${colors.border}`,
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        overflowY: "auto",
      }}>
      {/* Navigation */}
      <div style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
        {/* Main */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              padding: "8px 12px",
              marginBottom: 8,
              letterSpacing: 1,
            }}>
            Main
          </div>
          {navSections.main.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background:
                  currentPage === item.id ? colors.primary : "transparent",
                color: currentPage === item.id ? "#FFF" : colors.text,
                border: "none",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 6,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = colors.card;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Time */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              padding: "8px 12px",
              marginBottom: 8,
              letterSpacing: 1,
            }}>
            Time
          </div>
          {navSections.time.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background:
                  currentPage === item.id ? colors.primary : "transparent",
                color: currentPage === item.id ? "#FFF" : colors.text,
                border: "none",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 6,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = colors.card;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Finance */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              padding: "8px 12px",
              marginBottom: 8,
              letterSpacing: 1,
            }}>
            Finance
          </div>
          {navSections.finance.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background:
                  currentPage === item.id ? colors.primary : "transparent",
                color: currentPage === item.id ? "#FFF" : colors.text,
                border: "none",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 6,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = colors.card;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* Analytics */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: "uppercase",
              padding: "8px 12px",
              marginBottom: 8,
              letterSpacing: 1,
            }}>
            Analytics
          </div>
          {navSections.analytics.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                width: "100%",
                padding: "10px 12px",
                background:
                  currentPage === item.id ? colors.primary : "transparent",
                color: currentPage === item.id ? "#FFF" : colors.text,
                border: "none",
                borderRadius: "8px",
                textAlign: "left",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                marginBottom: 6,
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
              onMouseEnter={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = colors.card;
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== item.id) {
                  e.currentTarget.style.background = "transparent";
                }
              }}>
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Card */}
      <div
        style={{
          padding: "12px 8px",
          borderTop: `1px solid ${colors.border}`,
        }}>
        <div
          style={{
            background: colors.card,
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}>
          <div
            style={{ fontSize: 11, color: colors.textMuted, marginBottom: 6 }}>
            Logged in as
          </div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: colors.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              marginBottom: 8,
            }}>
            {state?.user?.name || "User"}
          </div>
          <button
            onClick={handleLogoutClick}
            style={{
              width: "100%",
              padding: "8px 12px",
              background: colors.danger,
              color: "#FFF",
              border: "none",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  // Topbar
  const Topbar = () => {
    const pageLabel =
      allNavItems.find((i) => i.id === currentPage)?.label || "Dashboard";
    const pageIcon =
      allNavItems.find((i) => i.id === currentPage)?.icon || "📊";

    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 60,
          background: colors.surface,
          borderBottom: `1px solid ${colors.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          zIndex: 101,
        }}>
        <h1
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: colors.text,
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}>
          <span style={{ fontSize: 24 }}>{pageIcon}</span>
          {pageLabel}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontSize: 13, color: colors.textMuted }}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: colors.success,
                borderRadius: "50%",
              }}
            />
            <span style={{ fontSize: 12, color: colors.textMuted }}>
              Online
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Bottom Tab Bar
  const BottomTabBar = () => (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 70,
        background: colors.surface,
        borderTop: `1px solid ${colors.border}`,
        display: "grid",
        gridTemplateColumns: "repeat(8, 1fr)",
        zIndex: 99,
      }}>
      {allNavItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          style={{
            background:
              currentPage === item.id ? colors.primary : "transparent",
            color: currentPage === item.id ? "#FFF" : colors.textMuted,
            border: "none",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            cursor: "pointer",
            fontSize: 10,
            fontWeight: 600,
            transition: "all 0.2s",
          }}>
          <div style={{ fontSize: 18 }}>{item.icon}</div>
          {item.label}
        </button>
      ))}
    </div>
  );

  return (
    <div
      style={{
        background: colors.background,
        minHeight: "100vh",
        color: colors.text,
      }}>
      <Topbar />
      {!isMobile && <Sidebar />}

      <main
        style={{
          marginLeft: isMobile ? 0 : 220,
          marginTop: 60,
          marginBottom: isMobile ? 70 : 0,
          padding: 24,
          minHeight: `calc(100vh - 60px)`,
          overflow: "auto",
        }}>
        {children}
      </main>

      {isMobile && <BottomTabBar />}
    </div>
  );
};
