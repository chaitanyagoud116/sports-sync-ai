"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ChevronLeft, ChevronRight, LogOut, 
  User, Shield, Building, Award, Menu
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface SidebarProps {
  userRole: string;
  navItems: Array<{
    href: string;
    label: string;
    icon: React.ReactNode;
  }>;
  userName?: string;
  userEmail?: string;
  notifCount?: number;
  subtitle?: string;
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export default function Sidebar({ 
  userRole, 
  navItems, 
  userName = "Officer Name",
  userEmail = "dept@goa.gov.in",
  isCollapsed = false,
  onToggle
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside 
      className={cn(
        "sidebar bg-primary hidden lg:flex flex-col h-screen fixed left-0 top-0 transition-all duration-500 ease-in-out",
        isCollapsed ? "w-20" : "w-[280px]"
      )}
    >
      {/* Government Branding */}
      <div className="p-6 flex items-center gap-4 border-b border-white/10 bg-black/10">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center p-1.5 flex-shrink-0 shadow-lg">
          <img src="/emblem.svg" alt="Goa Seal" className="w-full h-full" />
        </div>
        {!isCollapsed && (
          <motion.div 
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-secondary">Government of Goa</span>
            <span className="text-sm font-serif font-black tracking-tight text-white leading-none mt-1">Sports Sync AI</span>
          </motion.div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-8 custom-scrollbar">
        <div className="px-6 mb-4">
          {!isCollapsed && (
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-4 block">Official Portal</span>
          )}
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-nav-item",
                isActive && "active",
                isCollapsed && "justify-center px-0 mx-4"
              )}
            >
              <div className={cn("flex-shrink-0", isActive ? "text-white" : "text-white/60")}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 mt-auto border-t border-white/10 bg-black/10">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-lg transition-colors",
          !isCollapsed && "hover:bg-white/5 border-white/10"
        )}>
          <div className="w-10 h-10 rounded-md bg-white/10 border-white/20 flex items-center justify-center text-white border flex-shrink-0">
             <User className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white truncate">{userName}</p>
              <p className="text-[10px] text-white/50 truncate font-medium">{userEmail}</p>
            </div>
          )}
        </div>
        
        <Button 
          variant="ghost" 
          onClick={() => signOut({ callbackUrl: "/login" })}
          className={cn(
            "w-full justify-start text-white/60 hover:text-white hover:bg-red-500/10 mt-2",
            isCollapsed && "justify-center px-0"
          )}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="ml-3 font-bold text-xs uppercase tracking-widest">Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 bg-secondary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 border-2 border-white"
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
