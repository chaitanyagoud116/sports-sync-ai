"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Trophy, Calendar,
  FileText, BarChart3, Settings, LogOut,
  Menu, X, Zap, ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string | number;
}

interface FuturisticSidebarProps {
  role: string;
  navItems: NavItem[];
  userName?: string;
  userRole?: string;
}

export default function FuturisticSidebar({
  role,
  navItems,
  userName = "User",
  userRole = "Athlete",
}: FuturisticSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: "-100%" },
  };

  const overlayVariants = {
    open: { opacity: 1 },
    closed: { opacity: 0 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial={false}
        animate={isOpen ? "open" : "closed"}
        className={`fixed left-0 top-0 h-full z-50 bg-[#111827] border-r border-surface-200 transition-all duration-300 ${
          isCollapsed ? "w-20" : "w-72"
        } ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 border-b border-surface-200">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-lg">
                <img 
                  src="/emblem.svg" 
                  alt="Goa Seal" 
                  className="w-full h-full object-contain" 
                />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="font-bold text-primary text-lg tracking-tight">
                    Sports Sync AI
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-cyan-700 font-bold">
                    {role}
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`sidebar-nav-item group relative ${
                    isActive ? "active" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="flex-1 truncate">{item.name}</span>
                  )}
                  {item.badge && !isCollapsed && (
                    <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 text-xs font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isCollapsed && item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-cyan-500 text-primary text-xs flex items-center justify-center font-bold">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className={`w-4 h-4 ml-auto transition-transform ${
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  } ${!isCollapsed ? "" : "hidden"}`} />
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 border-t border-surface-200">
            <div 
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 border-surface-200 hover:bg-white border-surface-200 transition-all cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="text-primary font-semibold truncate">{userName}</div>
                  <div className="text-surface-500 text-xs truncate">{userRole}</div>
                </div>
              )}
              <LogOut className="w-5 h-5 text-surface-500 flex-shrink-0" />
            </div>
          </div>

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-cyan-500 border-2 border-[#111827] flex items-center justify-center hover:bg-cyan-400 transition-colors lg:flex hidden"
          >
            <ChevronRight className={`w-4 h-4 text-primary transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`} />
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-30 p-3 rounded-xl bg-[#111827] border border-surface-200 text-primary hover:bg-white border-surface-200 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  );
}
