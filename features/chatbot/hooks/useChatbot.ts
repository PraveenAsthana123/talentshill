'use client';

import { useCallback } from 'react';
import { useChatbotStore } from '@/store/chatbot-store';
import { sendMessage, trackChatEvent } from '../api/chat-service';

export function useChatbot() {
  const { messages, isTyping, addMessage, setTyping, clearMessages } = useChatbotStore();

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    addMessage('user', text.trim());
    setTyping(true);
    trackChatEvent('user_message');

    try {
      const { stream } = await sendMessage(text);
      let accumulated = '';
      for await (const chunk of stream) {
        accumulated += chunk;
      }
      addMessage('assistant', accumulated.trim());
      trackChatEvent('assistant_response');
    } catch {
      addMessage('assistant', 'Sorry, I encountered an error. Please try again or contact us directly.');
      trackChatEvent('error');
    } finally {
      setTyping(false);
    }
  }, [isTyping, addMessage, setTyping]);

  return { messages, isTyping, send, clearMessages };
}
