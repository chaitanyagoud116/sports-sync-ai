import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CoachesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-8">
      <div>
        <div className="hero-badge">Resource Management</div>
        <h1 className="text-4xl font-serif font-black text-primary uppercase tracking-tight">Certified Coaches Registry</h1>
        <p className="text-surface-600 font-medium mt-2">Manage official coaching certifications and performance audits.</p>
      </div>
      
      <div className="card-heritage flex items-center justify-center py-32 border-dashed border-2">
         <div className="text-center">
            <div className="w-16 h-16 bg-surface-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <span className="text-2xl">⏳</span>
            </div>
            <h2 className="text-xl font-bold text-primary mb-2 uppercase tracking-widest">Module Under Review</h2>
            <p className="text-sm text-surface-500 font-medium">This administrative module is currently being synchronized with the State Sports Database.</p>
         </div>
      </div>
    </div>
  );
}
