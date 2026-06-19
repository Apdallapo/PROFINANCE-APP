import React from "react";

interface Toast {
  id: string | number;
  message: string;
  type: "success" | "error" | "info";
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string | number) => void;
}

export default function ToastContainer({
  toasts,
  removeToast,
}: ToastContainerProps) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none",
      }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            pointerEvents: "auto",
            background:
              toast.type === "success"
                ? "rgba(16,185,129,0.15)"
                : toast.type === "error"
                  ? "rgba(239,68,68,0.15)"
                  : "#1F2937",
            border: `1px solid ${toast.type === "success" ? "#10B981" : toast.type === "error" ? "#EF4444" : "#4B5563"}`,
            color:
              toast.type === "success"
                ? "#A7F3D0"
                : toast.type === "error"
                  ? "#FCA5A5"
                  : "#F3F4F6",
            padding: "12px 18px",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            display: "flex",
            gap: 16,
            minWidth: 260,
          }}>
          <span style={{ flex: 1 }}>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "none",
              border: "none",
              color: "inherit",
              cursor: "pointer",
            }}>
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
