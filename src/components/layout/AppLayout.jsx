import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  const { pathname } = useLocation();
  const isSettings = pathname === "/settings";

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
        className="fixed left-4 top-3 z-50 -translate-y-20 rounded-lg bg-brand-900 px-4 py-2 text-sm font-bold text-white transition focus:translate-y-0"
      >
        Skip to main content
      </a>
      <TopNavbar />
      <div className={`mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-4 px-4 py-5 pb-24 sm:px-6 lg:gap-5 lg:px-8 lg:pb-8 ${isSettings ? "lg:grid-cols-1" : "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,760px)_minmax(240px,1fr)]"}`}>
        {!isSettings ? <LeftSidebar /> : null}
        <Outlet />
        {!isSettings ? <RightSidebar /> : null}
      </div>
    </div>
  );
}
