import { create } from 'zustand';

interface UIState {
  isChatbotOpen: boolean;
  isMobileMenuOpen: boolean;
  activeModal: string | null;
  toasts: Toast[];
  toggleChatbot: () => void;
  openChatbot: () => void;
  closeChatbot: () => void;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  openModal: (id: string) => void;
  closeModal: () => void;
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

export const useUIStore = create<UIState>((set) => ({
  isChatbotOpen: false,
  isMobileMenuOpen: false,
  activeModal: null,
  toasts: [],

  toggleChatbot: () => set((s) => ({ isChatbotOpen: !s.isChatbotOpen })),
  openChatbot: () => set({ isChatbotOpen: true }),
  closeChatbot: () => set({ isChatbotOpen: false }),
  toggleMobileMenu: () => set((s) => ({ isMobileMenuOpen: !s.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
  openModal: (id) => set({ activeModal: id }),
  closeModal: () => set({ activeModal: null }),

  addToast: (toast) =>
    set((s) => ({
      toasts: [...s.toasts, { ...toast, id: `toast-${Date.now()}` }],
    })),
  removeToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
