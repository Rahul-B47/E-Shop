import React from "react";
import { FiAlertTriangle } from "react-icons/fi";

export default function DeleteConfirmModal({ show, productName, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-80 animate-fade-in">
        <div className="flex items-center mb-4 text-red-600">
          <FiAlertTriangle className="text-3xl mr-2" />
          <h2 className="text-xl font-semibold">Delete Confirmation</h2>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete <strong>{productName}</strong>? This action cannot be undone.
        </p>

        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-red-600 hover:bg-red-700 text-white transition"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
