"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

interface ToastOptions {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
}

interface Toast extends Required<Omit<ToastOptions, "duration">> {
  id: number;
}

interface ToastContextValue {
  addToast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: PropsWithChildren) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutRefs = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: number) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    ({ message, type = "info", duration = 4000 }: ToastOptions) => {
      if (!message) {
        return;
      }

      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);

      const timeoutId = setTimeout(() => {
        removeToast(id);
      }, duration);

      timeoutRefs.current.set(id, timeoutId);
    },
    [removeToast]
  );

  const contextValue = useMemo(() => ({ addToast }), [addToast]);

  const variantStyles = useMemo(
    () => ({
      success:
        "border-green-500/80 bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white",
      error: "border-red-500/80 bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white",
      info: "border-blue-500/80 bg-white/95 dark:bg-slate-800/95 text-slate-900 dark:text-white",
    }),
    []
  );

  const iconClasses: Record<Toast["type"], string> = {
    success: "fas fa-check-circle text-green-500",
    error: "fas fa-circle-xmark text-red-500",
    info: "fas fa-circle-info text-blue-500",
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div
        className="fixed top-4 right-4 z-[9999] flex max-w-sm flex-col gap-3"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-start gap-3 rounded-xl border-l-4 p-4 shadow-2xl backdrop-blur transition-all duration-300 ${
              variantStyles[toast.type]
            }`}
          >
            <span className={`text-xl ${iconClasses[toast.type]}`}></span>
            <p className="text-sm leading-relaxed">{toast.message}</p>
            <button
              type="button"
              className="ml-auto text-slate-400 transition-colors hover:text-slate-700 dark:text-slate-500 dark:hover:text-white"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
