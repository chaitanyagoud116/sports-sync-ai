import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import CreateTournamentForm from "./CreateTournamentForm";

export default async function CreateTournamentPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const venues = await prisma.venue.findMany({
    where: { isActive: true },
    select: { id: true, name: true, district: true },
  });

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="text-base font-semibold text-primary">Create Tournament</h1>
          <p className="text-xs" style={{ color: "#64748b" }}>Set up a new state sports tournament</p>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="max-w-2xl">
          <div className="glass-card p-8">
            <CreateTournamentForm venues={venues} />
          </div>
        </div>
      </div>
    </div>
  );
}
