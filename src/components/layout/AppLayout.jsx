import { Outlet } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopNavbar />
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-10 px-10 py-5 pb-20 lg:h-[calc(100vh-4rem)] lg:grid-cols-[220px_minmax(0,1fr)] lg:overflow-hidden lg:pb-5 xl:grid-cols-[280px_minmax(0,800px)_300px]">
        <LeftSidebar />
        <Outlet />
        <RightSidebar />
      </div>
    </div>    
  );
}
