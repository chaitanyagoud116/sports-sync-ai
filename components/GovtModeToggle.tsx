"use client";

import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function GovtModeToggle() {
  const [isGovtMode, setIsGovtMode] = useState(false);

  const toggle = () => {
    const newState = !isGovtMode;
    setIsGovtMode(newState);
    
    // Hackathon Trick: Instant high-contrast accessibility mode
    if (newState) {
      document.documentElement.style.filter = "invert(1) hue-rotate(180deg)";
      // Fix image and video inversions
      const media = document.querySelectorAll("img, video");
      media.forEach((el: any) => {
        el.style.filter = "invert(1) hue-rotate(180deg)";
      });
    } else {
      document.documentElement.style.filter = "none";
      const media = document.querySelectorAll("img, video");
      media.forEach((el: any) => {
        el.style.filter = "none";
      });
    }
  };

  // Cleanup on unmount so it doesn't affect other pages if they navigate away
  useEffect(() => {
    return () => {
      document.documentElement.style.filter = "none";
    };
  }, []);

  return (
    <button 
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all"
      style={{ 
        background: isGovtMode ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
        borderColor: isGovtMode ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
        color: "#f8fafc"
      }}
      title="Toggle high-contrast accessibility mode for government clerks"
    >
      {isGovtMode ? <Moon className="w-3.5 h-3.5 text-blue-400" /> : <Sun className="w-3.5 h-3.5 text-secondary" />}
      {isGovtMode ? "Standard UI" : "Govt High-Contrast"}
    </button>
  );
}
