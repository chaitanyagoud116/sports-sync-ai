"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Trophy, Clock, CheckCircle, XCircle, Medal, Zap,
  TrendingUp, Calendar, ArrowRight, QrCode, ShieldCheck,
  LayoutDashboard, FileText, User, Activity, MapPin
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";

interface AthleteDashboardClientProps {
  athlete: any;
  recommended: any[];
}

export default function AthleteDashboardClient({ athlete, recommended }: AthleteDashboardClientProps) {
  const stats = {
    total: athlete.applications.length,
    approved: athlete.applications.filter((a: any) => a.status === "APPROVED").length,
    pending: athlete.applications.filter((a: any) => a.status === "PENDING").length,
    rejected: athlete.applications.filter((a: any) => a.status === "REJECTED").length,
  };

  const talentScore = athlete.talentScore ?? 0;

  return (
    <div className="space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-primary/10 pb-8">
          <div>
            <div className="hero-badge">Athlete Personnel Record</div>
            <h1 className="text-hero leading-none">Welcome, <br/>{athlete.fullName.split(" ")[0]}</h1>
            <p className="text-surface-700 font-medium mt-4">
              Registered Discipline: <span className="text-primary font-bold">{athlete.sport.replace(/_/g, " ")}</span> · 
              District: <span className="text-primary font-bold">{athlete.district.replace(/_/g, " ")}</span>
            </p>
          </div>
          <Link href="/athlete/tournaments">
            <Button size="lg" className="btn-secondary" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Official Event Search
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
           {[
             { label: "Total Applications", value: stats.total, icon: FileText, color: "primary" },
             { label: "Approved Entries", value: stats.approved, icon: CheckCircle, color: "emerald" },
             { label: "Pending Review", value: stats.pending, icon: Clock, color: "amber" },
             { label: "National Merits", value: athlete.results.length, icon: Medal, color: "blue" },
           ].map((stat) => (
             <Card key={stat.label} className="card-heritage">
                <CardContent className="pt-0">
                   <div className="flex items-center justify-between">
                      <div>
                         <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2">{stat.label}</p>
                         <h3 className="text-4xl font-serif font-black text-primary">{stat.value}</h3>
                      </div>
                      <div className="p-3 bg-primary/5 rounded-md border border-primary/10">
                         <stat.icon className="w-6 h-6 text-primary" />
                      </div>
                   </div>
                </CardContent>
             </Card>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
           {/* Recent Applications */}
           <Card className="card-heritage lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div>
                    <CardTitle className="text-2xl">Application History</CardTitle>
                    <CardDescription className="text-[11px] uppercase tracking-widest font-bold text-surface-500">Official log of tournament participation and status</CardDescription>
                 </div>
                 <Link href="/athlete/status">
                    <Button variant="ghost" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>Full Log</Button>
                 </Link>
              </CardHeader>
              <CardContent className="mt-6">
                 {athlete.applications.length === 0 ? (
                    <div className="text-center py-16">
                       <Trophy className="w-16 h-16 mx-auto mb-6 text-surface-200" />
                       <p className="text-surface-500 font-bold uppercase tracking-widest mb-6">No participation records found</p>
                       <Link href="/athlete/tournaments">
                          <Button className="btn-outline" size="sm">Search State Events</Button>
                       </Link>
                    </div>
                 ) : (
                    <div className="divide-y divide-surface-100">
                       {athlete.applications.map((app: any) => (
                          <div key={app.id} className="py-5 flex items-center justify-between group">
                             <div className="flex items-center gap-5">
                                <div className="w-12 h-12 rounded-md bg-surface-50 flex items-center justify-center border border-surface-200 shadow-sm">
                                   <Trophy className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                   <div className="text-sm font-black text-primary group-hover:text-secondary transition-colors uppercase tracking-tight">{app.tournament.name}</div>
                                   <div className="text-[10px] text-surface-500 font-bold uppercase tracking-widest mt-1">{app.tournament.venue.name} · {formatDate(app.appliedAt)}</div>
                                </div>
                             </div>
                             <Badge variant={app.status === "APPROVED" ? "success" : app.status === "PENDING" ? "warning" : "danger"}>
                                {app.status}
                             </Badge>
                          </div>
                       ))}
                    </div>
                 )}
              </CardContent>
           </Card>

           {/* Right Sidebar - Talent & Pass */}
           <div className="space-y-10">
              {/* Talent Score */}
              <Card className="card-heritage">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-xl">
                       <Activity className="w-6 h-6 text-secondary" />
                       Performance Index
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="text-5xl font-serif font-black text-primary mb-6">{talentScore.toFixed(1)}</div>
                    <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden mb-6">
                       <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${talentScore}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-secondary"
                       />
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black text-surface-500 uppercase tracking-[0.2em]">
                       <span>Rating Index</span>
                       <span>Benchmark: 100</span>
                    </div>
                    <div className="mt-8 pt-8 border-t border-surface-100 italic font-serif">
                       <p className="text-sm text-surface-600 leading-relaxed">
                          "Institutional assessment indicates {talentScore > 70 ? "high professional" : "stable competitive"} potential. 
                          Consistent participation in state-ranked events is advised for index optimization."
                       </p>
                    </div>
                 </CardContent>
              </Card>

              {/* Digital Identity Pass */}
              <Card className="bg-primary text-primary border-none overflow-hidden relative shadow-premium-lg">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-surface-50 border-surface-200 blur-3xl rounded-full" />
                 <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-3 text-xl">
                       <ShieldCheck className="w-6 h-6 text-secondary" />
                       Digital ID Vault
                    </CardTitle>
                 </CardHeader>
                 <CardContent>
                    <div className="flex items-center gap-8">
                       <div className="w-24 h-24 bg-white p-3 rounded-md flex-shrink-0 shadow-md">
                          <QrCode className="w-full h-full text-primary" />
                       </div>
                       <div>
                          <div className="text-md font-black text-primary mb-2 uppercase tracking-tight">Verified Athlete</div>
                          <div className="text-[10px] text-surface-600 font-black uppercase tracking-[0.3em]">Biometric Pass Valid</div>
                          <div className="mt-4 flex items-center gap-3">
                             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                             <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Secure Protocol</span>
                          </div>
                       </div>
                    </div>
                 </CardContent>
              </Card>

              {/* Recommendations */}
              {recommended.length > 0 && (
                <Card className="card-heritage">
                   <CardHeader>
                      <CardTitle className="text-lg">Recommended Order</CardTitle>
                   </CardHeader>
                   <CardContent className="space-y-6">
                      {recommended.map((t: any) => (
                        <div key={t.id} className="p-5 bg-surface-50 rounded-md border border-surface-100">
                           <div className="text-sm font-black text-primary mb-2 uppercase tracking-tight truncate">{t.name}</div>
                           <div className="text-[10px] text-surface-500 font-black uppercase tracking-[0.2em] flex items-center gap-2 mb-6">
                              <Calendar className="w-4 h-4 text-secondary" />
                              {formatDate(t.startDate)}
                           </div>
                           <Link href={`/athlete/tournaments/${t.id}`}>
                              <Button className="w-full btn-primary py-2" size="sm">Proceed to Application</Button>
                           </Link>
                        </div>
                      ))}
                   </CardContent>
                </Card>
              )}
           </div>
      </div>
    </div>
  );
}


