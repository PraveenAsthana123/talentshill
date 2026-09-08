import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';

interface ChatbotState {
  messages: ChatMessage[];
  isTyping: boolean;
  addMessage: (role: 'user' | 'assistant', content: string) => void;
  setTyping: (v: boolean) => void;
  clearMessages: () => void;
}

export const useChatbotStore = create<ChatbotState>()(
  persist(
    (set) => ({
      messages: [],
      isTyping: false,

      addMessage: (role, content) =>
        set((s) => ({
          messages: [
            ...s.messages,
            { id: generateId(), role, content, timestamp: Date.now() },
          ],
        })),

      setTyping: (v) => set({ isTyping: v }),
      clearMessages: () => set({ messages: [] }),
    }),
    { name: 'talentshill-chatbot' }
  )
);
