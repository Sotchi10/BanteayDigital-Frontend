import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LeftSidebar } from "./LeftSidebar";
import { RightSidebar } from "./RightSidebar";
import { TopNavbar } from "./TopNavbar";

export function AppLayout() {
  const tr = useInterfaceTranslation();
  const { pathname } = useLocation();
  const isFullWidth = pathname === "/settings" || pathname === "/profile" || pathname === "/about";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedQuery, setFeedQuery] = useState("");
  const [unseenScanCount, setUnseenScanCount] = useState(0);

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
      >{tr("Skip to main content")}</a>
      <TopNavbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} feedQuery={feedQuery} onFeedQueryChange={setFeedQuery} onUnseenScanCountChange={setUnseenScanCount} />
      <div className={`community-layout mx-auto grid w-full max-w-[1640px] grid-cols-1 items-start gap-6 px-4 py-6 pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] transition-[grid-template-columns] duration-300 ease-in-out sm:px-6 lg:gap-8 lg:px-8 lg:pb-10 ${isFullWidth ? "lg:grid-cols-1" : sidebarOpen ? "lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[220px_minmax(0,1fr)_288px]" : "lg:grid-cols-[64px_minmax(0,1fr)] xl:grid-cols-[64px_minmax(0,1fr)_288px]"}`}>
        <LeftSidebar expanded={sidebarOpen} unseenScanCount={unseenScanCount} onToggle={() => setSidebarOpen((open) => !open)} onOpenMobileMenu={() => setMobileMenuOpen(true)} mobileMenuOpen={mobileMenuOpen} desktopVisible={!isFullWidth} />
        <Outlet context={{ feedQuery }} />
        {!isFullWidth ? <RightSidebar /> : null}
      </div>
    </div>
  );
}
