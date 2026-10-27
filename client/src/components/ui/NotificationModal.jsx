import React from "react";
import { createPortal } from "react-dom";

const NotificationModal = ({ isOpen, message, onClose, type = "info" }) => {
  if (!isOpen) return null;

  const typeStyles = {
    info: "text-primary",
    success: "text-accent",
    error: "text-red-500",
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center p-4 sm:p-6">
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-full fade-in duration-300 pointer-events-auto">
        <div className="p-5 text-center">
          <div className={`mb-2 text-sm font-bold uppercase tracking-wider ${typeStyles[type]}`}>
            {type === "success" && "✓ Success"}
            {type === "error" && "⚠ Error"}
            {type === "info" && "ℹ Information"}
          </div>
          <p className="mb-4 text-sm leading-relaxed text-text-secondary">
            {message}
          </p>
          <button
            onClick={onClose}
            className="w-full py-2 text-xs font-bold text-white transition-all duration-200 rounded-lg bg-accent hover:bg-accent/80 active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default NotificationModal;
