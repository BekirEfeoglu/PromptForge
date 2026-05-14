import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => void;
}

export interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, action?: ToastAction) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', action) => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id, message, type, actionLabel: action?.label, onAction: action?.onClick },
      ],
    }));
    // Actionable toasts need a little more time for undo flows.
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, action ? 7000 : 3000);
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
