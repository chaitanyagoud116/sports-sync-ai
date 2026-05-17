"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, X, Trophy, Users, BarChart3, Brain, Globe } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Programs", href: "#" },
    { name: "Infrastructure", href: "#" },
    { name: "Athletes", href: "#" },
    { name: "AI Insights", href: "#" },
    { name: "Governance", href: "#" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white shadow-premium py-3"
          : "bg-white/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-md border border-surface-100">
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/2/26/Emblem_of_Goa.svg" 
              alt="Goa Seal" 
              className="w-full h-full object-contain" 
            />
          </div>
          <div className="hidden sm:block">
            <span className="text-xl font-bold text-primary block leading-none">
              Sports Sync AI
            </span>
            <span className="text-[10px] uppercase tracking-widest text-surface-500 font-bold">
              Goa State Ecosystem
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-surface-600 hover:text-primary transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="sm">
              Register
            </Button>
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-surface-600 hover:text-primary transition-colors"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-white border-t border-surface-100 overflow-hidden"
        >
          <div className="px-6 py-6 flex flex-col gap-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="text-base font-semibold text-surface-700 hover:text-primary"
              >
                {item.name}
              </Link>
            ))}
            <hr className="border-surface-100" />
            <Link href="/login" className="w-full">
              <Button variant="outline" className="w-full justify-center">Sign In</Button>
            </Link>
          </div>
        </motion.div>
      )}
    </nav>
  );
}

