"use client";

import { useState, useCallback } from "react";
import Sidebar from "@/components/portal/Sidebar";
import ChatWindow from "@/components/portal/ChatWindow";

export default function PortalPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | null>(null);

  const handleTopicSelect = useCallback((topic: string) => {
    setPendingQuery(topic);
    setSidebarOpen(false);
  }, []);

  const handleQueryHandled = useCallback(() => {
    setPendingQuery(null);
  }, []);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <Sidebar
          onTopicSelect={handleTopicSelect}
          isOpen={true}
          onClose={() => {}}
        />
      </div>

      {/* Mobile sidebar */}
      <div className="lg:hidden">
        <Sidebar
          onTopicSelect={handleTopicSelect}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header with menu toggle */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1 text-gray-600 hover:text-primary"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-xs">TH</span>
            </div>
            <span className="font-bold text-primary">AI Portal</span>
          </div>
        </div>

        <ChatWindow
          externalQuery={pendingQuery}
          onQueryHandled={handleQueryHandled}
        />
      </div>
    </div>
  );
}
