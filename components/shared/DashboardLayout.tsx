"use client";

import { ReactNode, useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { Bell, Search, Settings, User, Menu, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  navItems: Array<{
    name: string;
    href: string;
    icon: any;
    badge?: string | number;
  }>;
  userName?: string;
  userRole?: string;
  userEmail?: string;
}

export default function DashboardLayout({
  children,
  role,
  navItems,
  userName = "Officer Name",
  userRole = "Official",
  userEmail = "dept@goa.gov.in",
}: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Auto-collapse on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Map navItems to the format expected by Sidebar
  const mappedNavItems = navItems.map(item => ({
    href: item.href,
    label: item.name,
    icon: item.icon,
  }));

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar
        userRole={role}
        navItems={mappedNavItems}
        userName={userName}
        userEmail={userEmail}
        isCollapsed={isCollapsed}
        onToggle={() => setIsCollapsed(!isCollapsed)}
      />

      {/* Main Content */}
      <main 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-500 ease-in-out",
          isCollapsed ? "ml-20" : "ml-[280px]"
        )}
      >
        {/* Topbar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-surface-200 sticky top-0 z-40 px-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-6 flex-1">
             <div className="flex items-center gap-2 px-4 py-2 bg-surface-50 border border-surface-200 rounded-md text-xs font-bold text-surface-500 uppercase tracking-widest">
                <Shield className="w-3.5 h-3.5 text-primary/40" />
                <span>Goa State Infrastructure Network</span>
             </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative text-primary/60 hover:text-primary hover:bg-surface-100">
                 <Bell className="w-5 h-5" />
                 <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full border-2 border-white shadow-sm" />
              </Button>
              <Button variant="ghost" size="icon" className="text-primary/60 hover:text-primary hover:bg-surface-100">
                 <Settings className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="h-10 w-[1px] bg-surface-200" />
            
            <div className="flex items-center gap-4">
               <div className="text-right hidden sm:block">
                  <div className="text-sm font-black text-primary leading-none mb-1">{userName}</div>
                  <div className="text-[10px] uppercase tracking-widest text-secondary font-black">{userRole}</div>
               </div>
               <div className="w-12 h-12 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-serif text-xl font-black border-2 border-primary-700 shadow-md">
                  {userName[0]}
               </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-10 max-w-[1600px] w-full mx-auto"
        >
          {children}
        </motion.div>

        {/* Footer Branding */}
        <footer className="mt-auto py-8 px-10 border-t border-surface-200 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-surface-500">
          <span>Official Portal of the Department of Sports, Goa</span>
          <span>© 2026 Government of Goa · Sports Sync AI</span>
        </footer>
      </main>
    </div>
  );
}


