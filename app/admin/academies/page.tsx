import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AcademiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <div className="hero-badge">Institutional Oversight</div>
        <h1 className="text-4xl font-serif font-black text-primary uppercase tracking-tight">State Sports Academies</h1>
        <p className="text-surface-600 font-medium mt-2">Inventory and certification management for recognized sports academies.</p>
      </div>
      
      <div className="card-heritage flex items-center justify-center py-32 border-dashed border-2">
         <div className="text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-2xl">🏛️</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2 uppercase tracking-widest">Database Syncing</h2>
            <p className="text-sm text-surface-500 font-medium">Academy records are being migrated to the unified Sports Sync ecosystem.</p>
         </div>
      </div>
    </div>
  );
}
