import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function ConfirmModal({
  show,
  product = null,
  message,
  onConfirm,
  onCancel,
}) {
  if (!show) return null;

  const displayMessage =
    message ||
    (product
      ? `Are you sure you want to add "${product.name}" to your cart?`
      : "Are you sure you want to proceed?");

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4 sm:px-0">
      <div className="bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700 w-full max-w-sm sm:max-w-md p-4 sm:p-6 text-center animate-fade-in-down">
        {/* ⚠️ Icon */}
        <div className="flex items-center justify-center mb-3 sm:mb-4">
          <FiAlertTriangle className="text-yellow-400 text-2xl sm:text-3xl" />
        </div>

        {/* 🔤 Title & Message */}
        <h2 className="text-xl sm:text-2xl font-bold text-blue-400 mb-2">
          Confirm Action
        </h2>
        <p className="text-slate-300 text-sm sm:text-base mb-5 sm:mb-6">
          {displayMessage}
        </p>

        {/* ✅ Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded-md transition w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product)}
            className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition w-full sm:w-auto"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
