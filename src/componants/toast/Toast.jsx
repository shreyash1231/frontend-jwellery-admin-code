import React, { createContext, useContext, useState, useCallback } from "react";

// Create context
const ToastContext = createContext(null);

// Toast types
const TOAST_TYPES = {
  success: {
    icon: "✓",
    bgColor: "#10b981",
    borderColor: "#059669",
  },
  error: {
    icon: "✕",
    bgColor: "#ef4444",
    borderColor: "#dc2626",
  },
  warning: {
    icon: "⚠",
    bgColor: "#f59e0b",
    borderColor: "#d97706",
  },
  info: {
    icon: "ℹ",
    bgColor: "#3b82f6",
    borderColor: "#2563eb",
  },
};

// Individual Toast component
const ToastItem = ({ id, type, message, onClose }) => {
  const config = TOAST_TYPES[type] || TOAST_TYPES.info;

  return (
    <div style={styles.toastItem(config)} className="toast-item">
      <div style={styles.iconContainer(config)}>
        <span style={styles.icon}>{config.icon}</span>
      </div>
      <div style={styles.messageContainer}>
        <p style={styles.message}>{message}</p>
      </div>
      <button style={styles.closeButton} onClick={() => onClose(id)}>
        ×
      </button>
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          @keyframes slideOut {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }
          .toast-item {
            animation: slideIn 0.3s ease-out forwards;
          }
          .toast-item.removing {
            animation: slideOut 0.3s ease-in forwards;
          }
        `}
      </style>
    </div>
  );
};

// Toast Provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((type, message, duration = 3000) => {
    const id = Date.now() + Math.random();

    setToasts((prev) => [...prev, { id, type, message }]);

    // Auto remove after duration
    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  }, [removeToast]);

  const toast = {
    success: (message, duration) => addToast("success", message, duration),
    error: (message, duration) => addToast("error", message, duration),
    warning: (message, duration) => addToast("warning", message, duration),
    info: (message, duration) => addToast("info", message, duration),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div style={styles.toastContainer}>
        {toasts.map((t) => (
          <ToastItem
            key={t.id}
            id={t.id}
            type={t.type}
            message={t.message}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

// Styles
const styles = {
  toastContainer: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 99999,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    maxWidth: "400px",
  },
  toastItem: (config) => ({
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    backgroundColor: "#fff",
    borderRadius: "10px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
    borderLeft: `4px solid ${config.bgColor}`,
    minWidth: "300px",
  }),
  iconContainer: (config) => ({
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: config.bgColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  }),
  icon: {
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
  },
  messageContainer: {
    flex: 1,
  },
  message: {
    margin: 0,
    fontSize: "14px",
    color: "#333",
    lineHeight: "1.4",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    color: "#999",
    cursor: "pointer",
    padding: "0",
    lineHeight: "1",
    marginLeft: "8px",
    transition: "color 0.2s",
  },
};

export default ToastProvider;
