"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const services = [
  { name: "Marketing Analytics", href: "#services" },
  { name: "Customer Analytics", href: "#services" },
  { name: "Data Integration", href: "#services" },
];

const industries = [
  { name: "Market Research", href: "#features" },
  { name: "Pharmaceutical", href: "#features" },
  { name: "Retail", href: "#features" },
];

const aiProducts = [
  { name: "AI Chatbot Platform", href: "#ai-products" },
  { name: "Mobile Robot Solution", href: "#ai-products" },
  { name: "Smart Building Platform", href: "#ai-products" },
  { name: "Wearable Intelligence", href: "#ai-products" },
];

const technology = [
  { name: "IoT", href: "#services" },
  { name: "Robotics", href: "#services" },
  { name: "Generative AI", href: "#services" },
  { name: "Computer Vision", href: "#services" },
  { name: "Embedded & Edge", href: "#services" },
  { name: "Quantum Computing", href: "#services" },
  { name: "Automation", href: "#services" },
  { name: "Voice AI", href: "#services" },
  { name: "Cloud (AWS, Azure, GCP)", href: "#services" },
];

const moreLinks = [
  { name: "AI Flow", href: "#ai-flow" },
  { name: "AI Strategy", href: "#ai-strategy" },
  { name: "Case Studies", href: "#case-studies" },
  { name: "FAQ", href: "#faq" },
  { name: "Blog", href: "#blog" },
  { name: "News", href: "#news" },
  { name: "Team", href: "#team" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [techOpen, setTechOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-primary/80 backdrop-blur-xl border-b border-white/10 shadow-lg"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-sm">TH</span>
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? "text-white" : "text-white"}`}>
              Talents Hill Inc
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-6">
            <a href="#" className={`text-sm font-medium transition-colors ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
              Home
            </a>

            {/* Services Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setServicesOpen(true)}
              onMouseLeave={() => setServicesOpen(false)}
            >
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
                Services
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {servicesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-primary/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 py-2 overflow-hidden"
                  >
                    {services.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* AI Products Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductsOpen(true)}
              onMouseLeave={() => setProductsOpen(false)}
            >
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
                AI Products
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {productsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-primary/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 py-2 overflow-hidden"
                  >
                    {aiProducts.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Technology Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setTechOpen(true)}
              onMouseLeave={() => setTechOpen(false)}
            >
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
                Technology
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {techOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-primary/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 py-2 overflow-hidden"
                  >
                    {technology.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Industries Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setIndustriesOpen(true)}
              onMouseLeave={() => setIndustriesOpen(false)}
            >
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
                Industries
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {industriesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-primary/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 py-2 overflow-hidden"
                  >
                    {industries.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* More Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <button className={`text-sm font-medium transition-colors flex items-center gap-1 ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
                More
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2 w-44 bg-primary/95 backdrop-blur-xl rounded-xl shadow-xl border border-white/10 py-2 overflow-hidden"
                  >
                    {moreLinks.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="block px-4 py-2.5 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                      >
                        {item.name}
                      </a>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href="#contact" className={`text-sm font-medium transition-colors ${scrolled ? "text-white/70 hover:text-white" : "text-white/90 hover:text-white"}`}>
              Contact
            </a>
          </div>

          {/* Right: CTA + Portal */}
          <div className="hidden lg:flex items-center gap-3">
            <a
              href="/portal"
              className="cta-glow bg-accent hover:bg-accent-dark text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 shadow-md shadow-accent/30"
            >
              AI Portal
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg
              className={`w-6 h-6 transition-colors ${scrolled ? "text-white" : "text-white"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden bg-primary/95 backdrop-blur-xl border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>Home</a>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Services</p>
                {services.map((item) => (
                  <a key={item.name} href={item.href} className="block pl-3 py-1.5 text-sm text-white/60" onClick={() => setMobileOpen(false)}>{item.name}</a>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">AI Products</p>
                {aiProducts.map((item) => (
                  <a key={item.name} href={item.href} className="block pl-3 py-1.5 text-sm text-white/60" onClick={() => setMobileOpen(false)}>{item.name}</a>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Technology</p>
                {technology.map((item) => (
                  <a key={item.name} href={item.href} className="block pl-3 py-1.5 text-sm text-white/60" onClick={() => setMobileOpen(false)}>{item.name}</a>
                ))}
              </div>
              <div>
                <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">Industries</p>
                {industries.map((item) => (
                  <a key={item.name} href={item.href} className="block pl-3 py-1.5 text-sm text-white/60" onClick={() => setMobileOpen(false)}>{item.name}</a>
                ))}
              </div>
              <a href="#about" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>About Us</a>
              <a href="#ai-flow" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>AI Flow</a>
              <a href="#ai-strategy" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>AI Strategy</a>
              <a href="#blog" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>Blog</a>
              <a href="#news" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>News</a>
              <a href="#team" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>Team</a>
              <a href="#case-studies" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>Case Studies</a>
              <a href="#faq" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>FAQ</a>
              <a href="#contact" className="block text-white/80 font-medium" onClick={() => setMobileOpen(false)}>Contact</a>
              <a href="/portal" className="block bg-accent text-white text-center py-2.5 rounded-xl font-semibold" onClick={() => setMobileOpen(false)}>AI Portal</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
