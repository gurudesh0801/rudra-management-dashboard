"use client";

import { Toaster as SonnerToaster, toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle, Info, X } from "lucide-react";
import { useEffect, useState } from "react";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertOptions {
  type: AlertType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const AlertIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const AlertToaster = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is enabled
    const checkDarkMode = () => {
      if (typeof window !== "undefined") {
        const isDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        setIsDarkMode(isDark);
      }
    };

    checkDarkMode();

    // Listen for changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => mediaQuery.removeEventListener("change", checkDarkMode);
  }, []);

  return (
    <SonnerToaster
      theme={isDarkMode ? "dark" : "light"}
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
};

// Custom alert function
const showAlert = (options: AlertOptions) => {
  const { type, title, description, duration = 5000, action } = options;
  const Icon = AlertIcons[type];

  toast.custom(
    (t) => (
      <div className="flex w-full max-w-md items-start gap-3 rounded-lg border bg-white dark:bg-gray-900 p-4 shadow-lg dark:shadow-gray-800/30">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
            type === "success"
              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
              : type === "error"
              ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
              : type === "warning"
              ? "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400"
              : "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          <Icon size={18} />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h4>
          {description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
              {description}
            </p>
          )}
          {action && (
            <button
              onClick={() => {
                action.onClick();
                toast.dismiss(t);
              }}
              className="mt-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => toast.dismiss(t)}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
        >
          <X size={16} />
        </button>
      </div>
    ),
    {
      duration,
    }
  );
};

// Helper functions for different alert types
const alert = {
  success: (
    title: string,
    description?: string,
    options?: Partial<AlertOptions>
  ) => showAlert({ type: "success", title, description, ...options }),

  error: (
    title: string,
    description?: string,
    options?: Partial<AlertOptions>
  ) => showAlert({ type: "error", title, description, ...options }),

  warning: (
    title: string,
    description?: string,
    options?: Partial<AlertOptions>
  ) => showAlert({ type: "warning", title, description, ...options }),

  info: (
    title: string,
    description?: string,
    options?: Partial<AlertOptions>
  ) => showAlert({ type: "info", title, description, ...options }),
};

export { AlertToaster, alert };
