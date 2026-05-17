import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  Users, Search, Filter, 
  MoreVertical, Activity, User
} from "lucide-react";

export default async function MyAthletes() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const coach = await prisma.coach.findUnique({
    where: { userId: (session.user as any).id },
    include: {
      coachAssignments: {
        where: { isActive: true },
        include: {
          athlete: {
            include: {
              user: { select: { email: true } },
            },
          },
        },
      },
    },
  });

  if (!coach) redirect("/unauthorized");

  const assignments = coach.coachAssignments;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-primary">My Athletes</h1>
          <p className="text-sm text-slate-400">Manage and track your assigned athletes</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search athletes..." 
              className="pl-10 pr-4 py-2 bg-surface-50 border-surface-200 border border-surface-200 rounded-lg text-sm text-primary focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <button className="btn-secondary py-2">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Athlete</th>
              <th>Sport</th>
              <th>Talent Score</th>
              <th>Contact</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length > 0 ? (
              assignments.map((assignment) => (
                <tr key={assignment.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                        {assignment.athlete.fullName.charAt(0)}
                      </div>
                      <span className="font-medium text-primary">{assignment.athlete.fullName}</span>
                    </div>
                  </td>
                  <td>{assignment.athlete.sport}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500" 
                          style={{ width: `${assignment.athlete.talentScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-blue-400">{assignment.athlete.talentScore.toFixed(0)}</span>
                    </div>
                  </td>
                  <td className="text-slate-400">{assignment.athlete.user.email}</td>
                  <td>
                    <span className={`badge ${assignment.isActive ? "badge-approved" : "badge-rejected"}`}>
                      {assignment.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/coach/athletes/${assignment.athlete.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface-50 border-surface-200 text-slate-400 hover:text-primary transition-colors"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                      <Link 
                        href={`/coach/performance?athleteId=${assignment.athlete.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface-50 border-surface-200 text-slate-400 hover:text-primary transition-colors"
                      >
                        <Activity className="w-4 h-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500">
                  No athletes assigned to you yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
