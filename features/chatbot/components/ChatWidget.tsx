'use client';

import { useState, useRef, useEffect } from 'react';
import { useChatbot } from '../hooks/useChatbot';
import { useUIStore } from '@/store/ui-store';
import styles from './ChatWidget.module.css';

export default function ChatWidget() {
  const { messages, isTyping, send, clearMessages } = useChatbot();
  const { isChatbotOpen, toggleChatbot } = useUIStore();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    send(input);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <button className={styles.launcher} onClick={toggleChatbot} aria-label={isChatbotOpen ? 'Close chat' : 'Open chat'}>
        {isChatbotOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
        )}
      </button>

      {isChatbotOpen && (
        <div className={styles.window}>
          <div className={styles.header}>
            <span className={styles.headerTitle}>TalentsHill AI Assistant</span>
            <div className={styles.headerActions}>
              <button className={styles.headerBtn} onClick={clearMessages} aria-label="Clear chat" title="Clear chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M8 6V4h8v2M5 6v14a2 2 0 002 2h10a2 2 0 002-2V6"/></svg>
              </button>
              <button className={styles.headerBtn} onClick={toggleChatbot} aria-label="Close chat">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 && (
              <div className={styles.assistant} style={{ background: 'transparent', opacity: 0.7, fontSize: '0.8rem' }}>
                Welcome! Ask me about our AI solutions, robotics, IoT, quantum computing, demos, or careers.
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
                {msg.content}
              </div>
            ))}
            {isTyping && (
              <div className={styles.typing}>
                <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className={styles.inputArea}>
            <input
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about our services..."
              aria-label="Chat message"
            />
            <button className={styles.sendBtn} onClick={handleSend} disabled={!input.trim() || isTyping} aria-label="Send message">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z"/></svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
