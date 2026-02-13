"use client";

const services = [
  {
    category: "AI Solutions",
    items: [
      { name: "Robotics", icon: "🤖" },
      { name: "IoT", icon: "📡" },
      { name: "GenAI", icon: "🧠" },
    ],
  },
  {
    category: "Domains",
    items: [
      { name: "Banking", icon: "🏦" },
      { name: "Healthcare", icon: "🏥" },
      { name: "Real Estate", icon: "🏠" },
      { name: "AgriTech", icon: "🌾" },
    ],
  },
  {
    category: "Analytics",
    items: [
      { name: "Marketing Analytics", icon: "📊" },
      { name: "Customer Analytics", icon: "👥" },
      { name: "Data Integration", icon: "🔗" },
    ],
  },
];

interface SidebarProps {
  onTopicSelect: (topic: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ onTopicSelect, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white border-r shadow-lg z-40 lg:relative lg:translate-x-0 lg:shadow-none overflow-y-auto transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Logo */}
        <div className="px-6 py-4 border-b">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <div>
              <span className="text-lg font-bold text-primary">Talents Hill Inc</span>
              <p className="text-[10px] text-accent font-medium -mt-0.5">AI PORTAL</p>
            </div>
          </a>
        </div>

        {/* Service categories */}
        <nav className="p-4 space-y-6">
          {services.map((group) => (
            <div key={group.category}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
                {group.category}
              </h3>
              <ul className="space-y-1">
                {group.items.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => onTopicSelect(item.name)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors text-left"
                    >
                      <span className="text-lg">{item.icon}</span>
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Back to main site */}
        <div className="p-4 border-t mt-4">
          <a
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Main Site
          </a>
        </div>
      </aside>
    </>
  );
}
