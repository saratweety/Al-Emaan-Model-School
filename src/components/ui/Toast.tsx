"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode, type ComponentType } from "react";
import { InfoIcon, CheckSquareIcon, XCircleIcon, XIcon } from "@/components/icons";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  variant: ToastVariant;
  message: string;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const VARIANT_STYLES: Record<ToastVariant, { border: string; icon: ComponentType<{ className?: string }>; iconColor: string }> = {
  success: { border: "border-l-4 border-[#3AB67D]", icon: CheckSquareIcon, iconColor: "text-[#13714C]" },
  error: { border: "border-l-4 border-red-500", icon: XCircleIcon, iconColor: "text-red-500" },
  info: { border: "border-l-4 border-blue-400", icon: InfoIcon, iconColor: "text-blue-500" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { id, variant, message }]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => {
          const { border, icon: Icon, iconColor } = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-2.5 rounded-xl bg-white p-3.5 text-sm font-semibold text-gray-700 shadow-lg ${border}`}
            >
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconColor}`} />
              <span className="flex-1">{t.message}</span>
              <button
                type="button"
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="text-gray-300 hover:text-gray-500"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
