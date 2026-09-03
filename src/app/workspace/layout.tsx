import ImpersonationBanner from "@/src/components/layouts/ImpersonationBanner";
import SelfTenantBanner from "@/src/components/layouts/SelfTenantBanner";
import React from "react";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <ImpersonationBanner />
      <SelfTenantBanner />
      <div className="flex-1">{children}</div>
    </div>
  );
}
