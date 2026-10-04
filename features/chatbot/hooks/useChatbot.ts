'use client';

import { useCallback, useRef } from 'react';
import { useChatbotStore } from '@/store/chatbot-store';
import { sendMessage, trackChatEvent } from '../api/chat-service';

export function useChatbot() {
  const { messages, isTyping, addMessage, setTyping, clearMessages } = useChatbotStore();
  // Persist the session token across messages so the server can maintain
  // conversation history in a single chat session.
  const sessionTokenRef = useRef<string | undefined>(undefined);

  const send = useCallback(async (text: string) => {
    if (!text.trim() || isTyping) return;

    addMessage('user', text.trim());
    setTyping(true);
    trackChatEvent('user_message');

    try {
      const { stream, sessionToken } = await sendMessage(text, sessionTokenRef.current);
      // Store the token returned by the server for all subsequent messages.
      if (sessionToken) {
        sessionTokenRef.current = sessionToken;
      }
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

  const resetConversation = useCallback(() => {
    sessionTokenRef.current = undefined;
    clearMessages();
  }, [clearMessages]);

  return { messages, isTyping, send, clearMessages: resetConversation };
}
