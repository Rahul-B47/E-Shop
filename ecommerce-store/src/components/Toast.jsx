import React from "react";
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi";

export default function Toast({ message, show, success = true }) {
  if (!message || !show) return null;

  const styles = success
    ? {
        icon: <FiCheckCircle className="text-white text-xl sm:text-2xl" />,
        bg: "bg-green-500/90 backdrop-blur-md",
        border: "border-green-300",
      }
    : {
        icon: <FiAlertCircle className="text-white text-xl sm:text-2xl" />,
        bg: "bg-red-600/90 backdrop-blur-md",
        border: "border-red-400",
      };

  return (
    <div
      className={`
        fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50
        px-4 sm:px-6 py-3 sm:py-3.5 rounded-lg shadow-xl
        text-white text-sm sm:text-base font-medium
        border ${styles.border} ${styles.bg}
        transition-all duration-500 ease-in-out
        ${show ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-95 pointer-events-none"}
        animate-fade-in flex items-center gap-3 max-w-[90%] sm:max-w-md
      `}
      role="alert"
    >
      {styles.icon}
      <span className="truncate">{message}</span>
    </div>
  );
}
