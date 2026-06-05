import React, { useState, useCallback } from 'react';

interface ToastData {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastListeners: Array<(toast: ToastData) => void> = [];

export function toast(message: string, type: ToastData['type'] = 'info') {
  const id = Date.now().toString();
  const newToast: ToastData = { id, message, type };
  toastListeners.forEach((listener) => listener(newToast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: ToastData) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  React.useEffect(() => {
    toastListeners.push(addToast);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  const typeStyles = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-blue-600',
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`${typeStyles[t.type]} text-white px-4 py-3 rounded-lg shadow-lg text-sm animate-in slide-in-from-right`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

export function Toast({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
