"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, Trophy, Clock, Building2, 
  Brain, GraduationCap, ArrowRight,
  BarChart3, LayoutDashboard, FileText,
  Activity, Settings, CheckCircle, TrendingUp,
  MapPin, Award, Calendar, FileCheck, Shield
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, LineChart, Line,
  PieChart, Pie, Cell
} from "recharts";

interface AdminDashboardClientProps {
  data: any;
}

export default function AdminDashboardClient({ data }: AdminDashboardClientProps) {
  const COLORS = ["#064E3B", "#9A3412", "#854D0E", "#065F46", "#C2410C", "#92400E"];

  return (
    <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary/10 pb-8">
          <div>
            <div className="hero-badge">Official State Dashboard</div>
            <h1 className="text-hero leading-none">State Sports <br/>Command Center</h1>
            <p className="text-surface-700 font-medium mt-4 max-w-2xl">
              Integrated sports intelligence ecosystem for the Government of Goa. Monitoring athlete performance, event logistics, and state-wide talent identification.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
             <Link href="/admin/tournaments/create">
                <Button variant="outline" leftIcon={<Trophy className="w-4 h-4" />}>
                   Official Order
                </Button>
             </Link>
             <Link href="/admin/ai-insights">
                <Button leftIcon={<Shield className="w-4 h-4" />}>
                   AI Performance Audit
                </Button>
             </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: "Registered Athletes", value: data.totalAthletes, icon: Users, trend: "+12%" },
             { label: "Active Districts", value: data.activeDistricts, icon: MapPin, trend: "100%" },
             { label: "Scheduled Events", value: data.activeTournaments, icon: Calendar, trend: "+5" },
             { label: "State Merit Score", value: data.avgTalentScore?._avg?.talentScore?.toFixed(1) || "0", icon: Award, trend: "+2.4%" },
           ].map((stat) => (
             <Card key={stat.label} className="card-heritage">
                <CardContent className="pt-0">
                   <div className="flex items-start justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">{stat.label}</p>
                         <h3 className="text-4xl font-serif font-black text-primary">{stat.value}</h3>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
                         <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                   </div>
                   <div className="mt-6 flex items-center gap-2">
                      <Badge variant="success" className="text-[10px] font-bold">{stat.trend}</Badge>
                      <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">Growth Index</span>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        {/* Main Analytics Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
           {/* Performance Trends */}
           <Card className="card-heritage lg:col-span-2">
              <CardHeader>
                 <CardTitle className="text-2xl">District Participation Matrix</CardTitle>
                 <CardDescription className="text-[11px] uppercase tracking-widest font-bold text-surface-500">Demographic distribution across Goa's administrative regions</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] mt-6">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.districtBreakdown}>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7E2D3" />
                       <XAxis dataKey="district" axisLine={false} tickLine={false} tick={{fill: "#78716C", fontSize: 10, fontWeight: 700}} />
                       <YAxis axisLine={false} tickLine={false} tick={{fill: "#78716C", fontSize: 10, fontWeight: 700}} />
                       <Tooltip 
                         contentStyle={{backgroundColor: "#F9F7F2", border: "2px solid #064E3B", borderRadius: "4px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)"}}
                         itemStyle={{color: "#064E3B", fontWeight: 800, fontSize: "12px"}}
                       />
                       <Bar dataKey="_count.district" fill="#064E3B" radius={[2, 2, 0, 0]} />
                    </BarChart>
                 </ResponsiveContainer>
              </CardContent>
           </Card>

           {/* Sport Distribution */}
           <Card className="card-heritage">
              <CardHeader>
                 <CardTitle className="text-2xl">Discipline Audit</CardTitle>
                 <CardDescription className="text-[11px] uppercase tracking-widest font-bold text-surface-500">Inventory of sports by recognized categories</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex flex-col justify-center mt-6">
                 <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                       <Pie
                         data={data.sportBreakdown}
                         dataKey="_count.sport"
                         nameKey="sport"
                         cx="50%"
                         cy="50%"
                         innerRadius={70}
                         outerRadius={100}
                         paddingAngle={8}
                         stroke="none"
                       >
                         {data.sportBreakdown.map((entry: any, index: number) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                         ))}
                       </Pie>
                       <Tooltip />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="grid grid-cols-2 gap-4 mt-8 px-4">
                    {data.sportBreakdown.slice(0, 4).map((s: any, i: number) => (
                      <div key={s.sport} className="flex items-center gap-3">
                         <div className="w-3 h-3 rounded-sm shadow-sm" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                         <span className="text-[10px] font-black text-surface-600 uppercase tracking-widest truncate">{s.sport}</span>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid lg:grid-cols-3 gap-10">
           {/* Recent Activity */}
           <Card className="card-heritage lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-2xl">Pending Verifications</CardTitle>
                    <CardDescription className="text-[11px] uppercase tracking-widest font-bold text-surface-500">Official applications awaiting state department approval</CardDescription>
                 </div>
                 <Link href="/admin/applications">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Full Registry</Button>
                 </Link>
              </CardHeader>
              <CardContent className="mt-6">
                 <div className="divide-y divide-surface-100">
                    {data.recentApps.map((app: any) => (
                      <div key={app.id} className="py-5 flex items-center justify-between group">
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-md bg-surface-100 flex items-center justify-center text-primary font-serif font-black border border-surface-200 shadow-sm">
                               {app.athlete.fullName[0]}
                            </div>
                            <div>
                               <div className="text-sm font-black text-primary group-hover:text-secondary transition-colors uppercase tracking-tight">{app.athlete.fullName}</div>
                               <div className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1">{app.tournament.name} · {app.athlete.sport}</div>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <span className="text-[10px] text-surface-400 font-bold uppercase tracking-widest">{formatDate(app.appliedAt)}</span>
                            <Badge variant={app.status === "PENDING" ? "warning" : app.status === "APPROVED" ? "success" : "danger"}>
                               {app.status}
                            </Badge>
                         </div>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>

           {/* Quick Stats & AI Summary */}
           <div className="space-y-10">
              <Card className="card-heritage bg-primary text-primary border-none shadow-premium-lg">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-primary text-xl">
                       <Brain className="w-6 h-6 text-secondary" />
                       Intelligence Brief
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    {data.latestReport ? (
                      <div className="space-y-6">
                         <div className="p-5 bg-surface-50 border-surface-200 rounded-md border border-surface-200 italic font-serif">
                            <p className="text-sm text-primary/80 leading-relaxed">
                               "{data.latestReport.content.slice(0, 150)}..."
                            </p>
                         </div>
                         <Link href="/admin/ai-insights" className="block">
                            <Button className="w-full bg-secondary hover:bg-secondary-700 text-primary border-none" size="sm">Review Analysis</Button>
                         </Link>
                      </div>
                    ) : (
                      <p className="text-sm text-surface-500 text-center py-10 font-bold uppercase tracking-widest">No briefs available</p>
                    )}
                 </CardContent>
              </Card>

              <Card className="card-heritage border-primary/20">
                 <CardHeader>
                    <CardTitle className="text-lg">Network Integrity</CardTitle>
                 </CardHeader>
                 <CardContent className="space-y-5">
                    {[
                      { label: "Data Pipeline", status: "Secure", color: "text-emerald-600" },
                      { label: "AI Engine", status: "Analyzing", color: "text-secondary" },
                      { label: "Gov API Hub", status: "Synchronized", color: "text-emerald-600" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between border-b border-surface-100 pb-2">
                         <span className="text-[11px] font-black text-surface-600 uppercase tracking-widest">{item.label}</span>
                         <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${item.color}`}>{item.status}</span>
                      </div>
                    ))}
                 </CardContent>
              </Card>
           </div>
        </div>
    </div>
  );
}
