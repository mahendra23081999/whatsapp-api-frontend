/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useBackToAdminMutation } from "@/src/redux/api/authApi";
import { signOut, useSession } from "next-auth/react";
import { toast } from "sonner";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/src/elements/ui/button";

export default function SelfTenantBanner() {
  const { data: session }: any = useSession();
  const [backToAdmin, { isLoading }] = useBackToAdminMutation();

  const isSelfTenant = session?.isSelfTenant;
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || "http://localhost:3001";

  if (!isSelfTenant) return null;

  const handleBackToAdmin = async () => {
    try {
      const result = await backToAdmin().unwrap();
      toast.success(result.message || "Returning to Admin Panel...");

      // Clear the current session on frontend
      await signOut({ redirect: false });

      // Redirect back to admin panel with the restored token
      window.location.href = `${adminUrl}/auth/restore-session?token=${result.token}&type=self-tenant`;
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to return to admin panel");
    }
  };

  return (
    <div className="bg-primary py-1.5 px-4 flex items-center justify-between text-white font-medium text-sm z-999 shadow-md relative overflow-hidden">
      {/* Animated background pulse */}
      <div className="absolute inset-0 bg-white/10 animate-pulse pointer-events-none" />

      <div className="flex items-center gap-3 relative z-10">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
          <ShieldCheck className="w-3 h-3 text-white" />
        </div>
        <p className="tracking-tight">
          <span className="font-bold">Self-Tenant Mode:</span> You are accessing the frontend as a Super Admin.
        </p>
      </div>

      <Button onClick={handleBackToAdmin} disabled={isLoading}>
        {isLoading ? <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /> : <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />}
        {isLoading ? "Returning..." : "Back to Admin"}
      </Button>
    </div>
  );
}
