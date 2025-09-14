import { SidebarProvider } from "@/components/ui/sidebar";
import { getAllPlayGroundForUser } from "@/modules/dashboard/actions";
import { DashboardSidebar } from "@/modules/dashboard/components/dashboard-sidebar";

export default async function DashBaordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const playgroundData = await getAllPlayGroundForUser();

  const techonologyIconMap: Record<string, string> = {
    REACT: "zap",
    NEXTJS: "LightBulb",
    EXPRESS: "Database",
    VUE: "Compass",
    HONO: "FlameIcon",
    ANGULAR: "Terminal",
  };

  const formattedPlayGroundData = playgroundData?.map((item) => ({
    id: item.id,
    name: item.title,
    //todo: star
    starred: false,
    icon: techonologyIconMap[item.template] || "Code2",
  }));

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-x-hidden">
        {/* {DashBoard Sidebar} */}
        {/* @ts-ignore */}
        <DashboardSidebar initialPlaygroundData={formattedPlayGroundData} />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
