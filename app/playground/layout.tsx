import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
function PlayGroundLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SidebarProvider>{children}</SidebarProvider>
    </div>
  );
}

export default PlayGroundLayout;
