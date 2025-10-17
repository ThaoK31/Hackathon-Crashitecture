import React from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  variant?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  isLoading = false,
  variant = "danger",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20";
      case "warning":
        return "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20";
      case "info":
        return "bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border-blue-500/20";
      default:
        return "bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
        <p className="text-slate-300 mb-6">{message}</p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 border py-2 px-4 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${getVariantStyles()}`}
          >
            {isLoading ? "En cours..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
