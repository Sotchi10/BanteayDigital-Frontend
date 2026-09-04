import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  const { pathname } = useLocation();
  const isCommunityFeed = pathname === "/";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a href="#main-content" className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-brand-900 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0">Skip to main content</a>
      <TopNavbar />
      <div className={`mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-5 px-4 py-5 pb-28 sm:px-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-6 lg:px-8 xl:grid-cols-[240px_minmax(0,760px)_minmax(320px,1fr)] ${isCommunityFeed ? "lg:h-[calc(100vh-68px)] lg:items-stretch lg:overflow-hidden lg:pb-5" : "lg:pb-8"}`}>
        <LeftSidebar />
        <Outlet />
        <RightSidebar />
      </div>
    </div>    
  );
}
