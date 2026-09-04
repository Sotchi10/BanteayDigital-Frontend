import { Outlet } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopNavbar />
      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 items-start gap-5 px-4 py-5 pb-28 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:px-8 lg:pb-8 xl:grid-cols-[240px_minmax(0,760px)_320px]">
        <LeftSidebar />
        <Outlet />
        <RightSidebar />
      </div>
    </div>    
  );
}
