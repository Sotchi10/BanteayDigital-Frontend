import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  const { pathname } = useLocation();
  const isSettings = pathname === "/settings" || pathname === "/profile";

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
    document
      .getElementById("main-content")
      ?.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <a
        href="#main-content"
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-brand-800 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <TopNavbar />
      <div className={`mx-auto grid w-full max-w-[1600px] grid-cols-1 items-start gap-5 px-4 py-5 pb-28 sm:px-6 lg:gap-6 lg:px-8 lg:pb-8 ${isSettings ? "lg:grid-cols-1" : "lg:grid-cols-[240px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,800px)_minmax(280px,1fr)]"}`}>
        {!isSettings ? <LeftSidebar /> : null}
        <Outlet />
        {!isSettings ? <RightSidebar /> : null}
      </div>
    </div>
  );
}
