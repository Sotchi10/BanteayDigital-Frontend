import { Outlet } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopNavbar />
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-6 px-4 py-5 pb-28 sm:px-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:px-8 lg:pb-8 xl:grid-cols-[240px_minmax(0,720px)_280px] xl:gap-7">
        <LeftSidebar />
        <Outlet />
        <RightSidebar />
      </div>
    </div>    
  );
}
