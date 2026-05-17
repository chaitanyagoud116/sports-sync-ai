"use client";

import Link from "next/link";
import { 
  Trophy, Users, Building2, Brain, 
  ArrowRight, Shield, Globe, Award,
  CheckCircle2, Activity, Zap, FileText,
  MapPin, Landmark, Scale
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import Navbar from "@/components/ui/Navbar";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-36 pb-20 overflow-hidden border-b border-surface-200">
        {/* Subtle Background Patterns & Gradients */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Goa Mandala/Wave Silhouette Pattern */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.03] select-none text-primary">
            <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full">
              <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="0.5" fill="none" strokeDasharray="1 1" />
              <circle cx="50" cy="50" r="35" stroke="currentColor" strokeWidth="0.5" fill="none" />
              <path d="M 50 0 A 50 50 0 0 1 100 50 L 50 50 Z" opacity="0.5" />
              <path d="M 50 50 L 0 50 A 50 50 0 0 1 50 0 Z" opacity="0.3" />
            </svg>
          </div>
          {/* Sports Field Outline Background Element */}
          <div className="absolute bottom-10 left-10 w-[300px] h-[150px] opacity-[0.02] border border-primary rounded-full transform -rotate-12" />
          <div className="absolute bottom-10 left-[160px] w-[1px] h-[150px] opacity-[0.02] bg-primary transform -rotate-12" />
          
          <img 
            src="https://images.unsplash.com/photo-1540260074749-370165e38f1f?auto=format&fit=crop&q=80&w=2000" 
            alt="Goa Sports Heritage" 
            className="w-full h-full object-cover opacity-[0.04] saturate-0"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/90 via-background to-background" />
        </div>

        <div className="container mx-auto px-6 md:px-12 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
            
            {/* Left Side: Text and Features */}
            <div className="lg:col-span-7 space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="hero-badge"
              >
                <span className="w-2 h-2 rounded-full bg-secondary mr-2 inline-block animate-pulse"></span>
                Official State Sports Portal · Government of Goa
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black text-primary leading-[1.15] tracking-tight">
                Transforming Goa’s <br />
                <span className="text-secondary relative inline-block">
                  Sports Ecosystem
                  <span className="absolute -bottom-2 left-0 w-full h-1 bg-secondary/30 rounded-full" />
                </span> with AI
              </h1>
              
              <p className="text-lg md:text-xl text-surface-700 font-medium leading-relaxed max-w-2xl">
                Sports Sync AI is a unified digital platform designed to modernize athlete management, event coordination, talent tracking, and sports governance across Goa.
              </p>
              
              {/* Feature Highlights */}
              <div className="space-y-4">
                {[
                  { 
                    title: "Athlete Management", 
                    desc: "State-wide athlete profiling, unified performance passports, and direct merit benefits.", 
                    icon: Users 
                  },
                  { 
                    title: "Event & Tournament Tracking", 
                    desc: "Centralized schedules, digital entry approvals, and real-time public results dashboards.", 
                    icon: Trophy 
                  },
                  { 
                    title: "AI-Based Sports Analytics", 
                    desc: "Intelligent analytics for talent spotting, infrastructure deployment, and athletic progress.", 
                    icon: Brain 
                  }
                ].map((feat, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * (idx + 1) }}
                    key={idx} 
                    className="flex items-start gap-4 p-3 rounded-xl hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary group-hover:bg-primary group-hover:text-primary transition-all duration-300 shadow-sm">
                      <feat.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-serif font-bold text-primary text-base leading-snug">{feat.title}</h3>
                      <p className="text-sm text-surface-600 font-medium mt-0.5 leading-normal">{feat.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-5 pt-2">
                <Link href="/login">
                  <Button size="lg" className="hover:bg-primary-700 shadow-premium-lg font-bold h-14 px-8 active:scale-[0.98]">
                    Explore Platform
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="lg" variant="outline" className="border-secondary text-secondary hover:bg-secondary/5 font-bold h-14 px-8 active:scale-[0.98]">
                    Government Initiatives
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Side: Leadership Portrait Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-sm relative"
              >
                {/* Modern Decorative Glow & Outline */}
                <div className="absolute -inset-4 bg-gradient-to-tr from-secondary/15 via-primary/5 to-transparent rounded-3xl -z-10 blur-xl opacity-60" />
                
                {/* Portrait Card */}
                <div className="bg-white/80 backdrop-blur-md border border-surface-200 rounded-2xl overflow-hidden shadow-premium-lg p-5 hover:shadow-premium-xl hover:border-primary/20 transition-all duration-500">
                  
                  {/* Portrait Container */}
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-surface-100 shadow-inner group">
                    <img 
                      src="/uploads/pramod_sawant.png" 
                      alt="Shri Pramod Sawant, Hon'ble Chief Minister of Goa" 
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
                  </div>

                  {/* Name and Designation */}
                  <div className="pt-5 pb-3 text-center">
                    <h3 className="text-2xl font-serif font-black text-primary tracking-tight leading-none">
                      Shri Pramod Sawant
                    </h3>
                    <p className="text-xs uppercase tracking-[0.25em] text-secondary font-bold mt-2">
                      Chief Minister of Goa
                    </p>
                  </div>

                  {/* Quote with Elegant Border & Quote Marks */}
                  <div className="pt-4 border-t border-surface-150 mt-1 text-center">
                    <p className="text-sm font-serif font-bold text-surface-800 leading-relaxed relative px-4 italic">
                      <span className="text-secondary/20 text-3xl font-serif absolute -left-1 -top-2 select-none">“</span>
                      Empowering youth and strengthening sports infrastructure through technology and innovation.
                      <span className="text-secondary/20 text-3xl font-serif absolute -right-1 bottom-[-8px] select-none">”</span>
                    </p>
                  </div>

                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="relative z-20 py-12 -mt-8 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: "10,000+", label: "Athletes", sub: "Verified profiles state-wide", icon: Users, color: "primary" },
              { value: "200+", label: "Events Managed", sub: "Tournaments conducted", icon: Trophy, color: "secondary" },
              { value: "AI-Powered", label: "Monitoring", sub: "Real-time performance analytics", icon: Brain, color: "primary" },
              { value: "Unified", label: "Sports Dashboard", sub: "Integrated state ecosystem", icon: Scale, color: "secondary" }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx, duration: 0.4 }}
                className="bg-white border border-surface-200 rounded-xl p-5 shadow-premium hover:shadow-premium-lg hover:border-primary/20 transition-all duration-300 group flex items-start gap-4"
              >
                <div className={`p-3 rounded-lg flex-shrink-0 ${
                  stat.color === 'primary' ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary' : 'bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-primary'
                } transition-all duration-300 shadow-sm`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-serif font-black text-primary leading-tight group-hover:text-secondary transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-surface-900 mt-1 leading-none">
                    {stat.label}
                  </div>
                  <div className="text-xs text-surface-500 font-semibold mt-1.5 leading-normal">
                    {stat.sub}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Entry Points */}
      <section className="py-32 container mx-auto px-10">
        <div className="text-center mb-24">
          <h2 className="text-section-title">Institutional Ecosystem</h2>
          <p className="text-surface-700 max-w-2xl mx-auto font-medium text-lg">Select your official portal to manage registrations, performance records, and administrative duties.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
          {[
            {
              title: "Administrative Hub",
              description: "For state officials and department heads to monitor state-wide sports metrics and approve policy orders.",
              icon: Scale,
              features: ["Policy Management", "Fund Allocation", "State-wide Reports"]
            },
            {
              title: "Performance Portal",
              description: "For registered athletes to track merit scores, apply for state events, and manage official documentation.",
              icon: Trophy,
              features: ["Merit Passport", "Event Application", "Talent Diagnostics"]
            },
            {
              title: "Strategic Coaching",
              description: "For certified coaches to manage talent pools, submit performance audits, and access AI scouting tools.",
              icon: Award,
              features: ["Talent Scouting", "Training Protocols", "Athlete Monitoring"]
            }
          ].map((portal, i) => (
            <Card key={i} className="card-heritage group hover:border-primary transition-all p-2">
              <CardContent className="p-10">
                <div className="w-20 h-20 rounded-md bg-surface-50 flex items-center justify-center mb-10 border border-surface-200 shadow-sm group-hover:bg-primary group-hover:text-primary transition-all">
                  <portal.icon className="w-10 h-10" />
                </div>
                <h3 className="text-3xl font-serif font-black text-primary mb-6">{portal.title}</h3>
                <p className="text-md text-surface-600 mb-10 leading-relaxed font-medium">{portal.description}</p>
                
                <div className="space-y-5 mb-12">
                  {portal.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-primary/80">
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                      {f}
                    </div>
                  ))}
                </div>

                <Link href="/login" className="block">
                  <Button className="w-full btn-primary h-14" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Enter Portal
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Official Mandate Section */}
      <section className="bg-surface-50 py-32 border-y-2 border-surface-200">
        <div className="container mx-auto px-10">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="space-y-10">
              <div className="hero-badge">Official Mandate</div>
              <h2 className="text-5xl md:text-6xl font-serif font-black text-primary leading-[1.1]">Digital Governance <br/>in Sports</h2>
              <p className="text-xl text-surface-700 leading-relaxed font-medium italic font-serif">
                "Establishing Goa as a national hub for sports excellence by integrating state-of-the-art technology with professional athletic administration."
              </p>
              <div className="flex items-center gap-8 pt-8">
                <div className="w-20 h-20 rounded-full bg-white border-4 border-primary overflow-hidden p-1.5 shadow-xl">
                   <img src="https://upload.wikimedia.org/wikipedia/en/2/26/Emblem_of_Goa.svg" alt="Goa Seal" className="w-full h-full" />
                </div>
                <div>
                   <p className="font-serif font-black text-2xl text-primary leading-tight">Department of Sports</p>
                   <p className="text-xs font-black uppercase tracking-[0.3em] text-surface-500 mt-1">Government of Goa</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8">
               {[
                 { label: "Verified Data", icon: Shield },
                 { label: "State Grants", icon: Landmark },
                 { label: "Official Merit", icon: FileText },
                 { label: "Global Benchmarks", icon: Globe },
               ].map((item, i) => (
                 <div key={i} className="p-10 bg-white border border-surface-200 rounded-lg shadow-premium flex flex-col items-center text-center group hover:border-primary transition-colors">
                    <item.icon className="w-12 h-12 text-primary mb-6 transition-transform group-hover:scale-110" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">{item.label}</span>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="py-24 bg-primary text-white border-t-8 border-secondary">
        <div className="container mx-auto px-10">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16">
            <div className="flex items-center gap-6">
               <div className="w-16 h-16 rounded-full bg-white p-3 shadow-2xl">
                  <img src="https://upload.wikimedia.org/wikipedia/en/2/26/Emblem_of_Goa.svg" alt="Goa Seal" className="w-full h-full" />
               </div>
               <div>
                  <p className="font-serif font-black text-3xl leading-none tracking-tight">Sports Sync AI</p>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-white/50 mt-2">Official State Ecosystem</p>
               </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-12 text-[10px] font-black uppercase tracking-[0.25em] text-white/70">
               <div className="space-y-4">
                  <p className="text-secondary mb-6">RESOURCES</p>
                  <a href="#" className="block hover:text-white transition-colors">Gazette Archive</a>
                  <a href="#" className="block hover:text-white transition-colors">Fund Allocation</a>
                  <a href="#" className="block hover:text-white transition-colors">Policy Library</a>
               </div>
               <div className="space-y-4">
                  <p className="text-secondary mb-6">PORTALS</p>
                  <a href="#" className="block hover:text-white transition-colors">Officer Login</a>
                  <a href="#" className="block hover:text-white transition-colors">Athlete ID</a>
                  <a href="#" className="block hover:text-white transition-colors">Coach Board</a>
               </div>
               <div className="space-y-4">
                  <p className="text-secondary mb-6">GOVERNANCE</p>
                  <a href="#" className="block hover:text-white transition-colors">Privacy Charter</a>
                  <a href="#" className="block hover:text-white transition-colors">Terms of Use</a>
                  <a href="#" className="block hover:text-white transition-colors">Help Center</a>
               </div>
            </div>
          </div>
          <div className="mt-24 pt-12 border-t border-white/10 text-center text-[10px] font-black uppercase tracking-[0.5em] text-white/20">
            Official Portal of the Government of Goa · Developed for National Excellence
          </div>
        </div>
      </footer>
    </div>
  );
}
