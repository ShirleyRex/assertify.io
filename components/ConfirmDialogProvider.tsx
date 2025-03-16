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

interface ConfirmDialogOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "danger";
}

interface ConfirmDialogContextValue {
  confirm: (options: ConfirmDialogOptions) => Promise<boolean>;
}

interface DialogState extends ConfirmDialogOptions {
  open: boolean;
}

const defaultLabels = {
  confirmLabel: "Confirm",
  cancelLabel: "Cancel",
};

const ConfirmDialogContext = createContext<ConfirmDialogContextValue | undefined>(undefined);

export function ConfirmDialogProvider({ children }: PropsWithChildren) {
  const [dialogState, setDialogState] = useState<DialogState | null>(null);
  const resolverRef = useRef<(confirmed: boolean) => void>();

  const closeDialog = useCallback((confirmed: boolean) => {
    setDialogState(null);
    resolverRef.current?.(confirmed);
    resolverRef.current = undefined;
  }, []);

  const confirm = useCallback((options: ConfirmDialogOptions) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        open: true,
        title: options.title,
        description: options.description,
        variant: options.variant || "default",
        confirmLabel: options.confirmLabel || defaultLabels.confirmLabel,
        cancelLabel: options.cancelLabel || defaultLabels.cancelLabel,
      });
    });
  }, []);

  const contextValue = useMemo(() => ({ confirm }), [confirm]);

  const variantStyles = useMemo(
    () => ({
      default: {
        confirm: "bg-blue-600 hover:bg-blue-700 text-white",
        icon: "text-blue-600",
      },
      danger: {
        confirm: "bg-red-600 hover:bg-red-700 text-white",
        icon: "text-red-600",
      },
    }),
    []
  );

  const activeVariant = dialogState?.variant || "default";

  return (
    <ConfirmDialogContext.Provider value={contextValue}>
      {children}
      {dialogState?.open ? (
        <div
          className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 px-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800">
            <div className="flex items-start gap-3">
              <span className={`text-2xl ${variantStyles[activeVariant].icon}`}>
                <i className="fas fa-circle-question"></i>
              </span>
              <div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {dialogState.title}
                </h3>
                {dialogState.description && (
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    {dialogState.description}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-700"
                onClick={() => closeDialog(false)}
              >
                {dialogState.cancelLabel}
              </button>
              <button
                type="button"
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${variantStyles[activeVariant].confirm}`}
                onClick={() => closeDialog(true)}
              >
                {dialogState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </ConfirmDialogContext.Provider>
  );
}

export function useConfirmDialog(): ConfirmDialogContextValue {
  const context = useContext(ConfirmDialogContext);

  if (!context) {
    throw new Error("useConfirmDialog must be used within a ConfirmDialogProvider");
  }

  return context;
}
