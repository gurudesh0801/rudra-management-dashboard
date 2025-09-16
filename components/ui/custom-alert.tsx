"use client";

import React from "react";
import { AlertCircle, CheckCircle, Info, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CustomAlertProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  duration?: number;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const alertConfig = {
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      bgColor: "bg-green-50 border-green-200",
      textColor: "text-green-800",
    },
    error: {
      icon: <XCircle className="h-5 w-5 text-red-500" />,
      bgColor: "bg-red-50 border-red-200",
      textColor: "text-red-800",
    },
    warning: {
      icon: <AlertCircle className="h-5 w-5 text-yellow-500" />,
      bgColor: "bg-yellow-50 border-yellow-200",
      textColor: "text-yellow-800",
    },
    info: {
      icon: <Info className="h-5 w-5 text-blue-500" />,
      bgColor: "bg-blue-50 border-blue-200",
      textColor: "text-blue-800",
    },
  };

  const config = alertConfig[type];

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div
        className={`flex items-start p-4 rounded-lg border ${config.bgColor} shadow-lg animate-in slide-in-from-right-5 duration-300`}
      >
        <div className="flex-shrink-0 mr-3">{config.icon}</div>
        <div className="flex-1">
          <h3 className={`font-medium ${config.textColor}`}>{title}</h3>
          <p className={`mt-1 text-sm ${config.textColor}`}>{message}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 ml-4 h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default CustomAlert;
