import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { listReports } from "../../services/reports";
import { useAuth } from "../../state/AuthStore";
import { Icon } from "../ui";

const links = [
  { label: "Home", icon: "home", to: "/" },
  { label: "Analyze Scam", icon: "shield", to: "/analysis" },
  { label: "Scan History", icon: "clock", to: "/history" },
  { label: "Community Safety", icon: "book", to: "/safety" },
  { label: "My reports", icon: "edit", to: "/reports/history" },
  { label: "Saved", icon: "bookmark", to: "/saved" },
  { label: "Leaderboard", icon: "trophy", to: "/leaderboard" },
];
const sections = [
  { label: "Explore", links: links.slice(0, 4) },
  { label: "Your activity", links: links.slice(4, 6) },
  { label: "Community activity", links: links.slice(6) },
];

export function LeftSidebar({ expanded, unseenScanCount, onToggle, onOpenMobileMenu, mobileMenuOpen, desktopVisible }) {
  const tr = useInterfaceTranslation();
  const { user } = useAuth();
  const [reportCount, setReportCount] = useState(null);

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    listReports()
      .then((response) => { if (active) setReportCount(response.meta?.total ?? 0); })
      .catch(() => { if (active) setReportCount(null); });
    return () => { active = false; };
  }, [user]);

  return (
    <>
      <div className="flex items-center lg:hidden">
        <button type="button" onClick={onOpenMobileMenu} className="inline-grid h-11 w-11 place-items-center rounded-lg border border-line text-muted hover:bg-brand-100 hover:text-brand-800" aria-label={tr("Open navigation menu")} aria-expanded={mobileMenuOpen} aria-controls="mobile-navigation-drawer">
          <Icon name="menu" size={21} />
        </button>
      </div>
      {desktopVisible ? <aside className={`desktop-left-sidebar hidden self-start lg:sticky lg:top-[88px] lg:flex lg:flex-col ${expanded ? "w-[220px]" : "w-16"}`} aria-label={tr("Main navigation")}>
        <div className="mb-4 flex justify-center border-b border-line pb-4">
          <button type="button" onClick={onToggle} className="inline-grid h-11 w-11 shrink-0 place-items-center rounded-lg text-muted hover:bg-brand-100 hover:text-brand-800" aria-label={tr("Toggle navigation menu")} aria-expanded={expanded} aria-controls="desktop-navigation">
            <Icon name="menu" size={21} />
          </button>
        </div>
        <nav id="desktop-navigation" className="grid gap-5" aria-label={tr("Main navigation")}>
          {sections.map((section, index) => (
            <section key={section.label} className={`grid gap-2 ${index ? "border-t border-line pt-5" : ""}`} aria-label={tr(section.label)}>
              {section.links.map(({ label, icon, to }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  title={!expanded ? tr(label) : undefined}
                  aria-label={!expanded ? tr(label) : undefined}
                  className={({ isActive }) => `community-nav-label flex min-h-12 items-center rounded-lg transition ${expanded ? "gap-3 px-3" : "justify-center px-2"} ${isActive ? "bg-brand-100 text-brand-800" : "text-muted hover:bg-[#f2f5f8] hover:text-ink"}`}
                >
                  <Icon name={icon} size={19} className="shrink-0" />
                  {expanded ? <span className="min-w-0 flex-1 truncate">{tr(label)}</span> : null}
                  {to === "/history" && unseenScanCount > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-risk-high px-1 text-[10px] font-bold text-white">{unseenScanCount > 99 ? "99+" : unseenScanCount}</span> : null}
                  {expanded && to === "/reports/history" && reportCount !== null ? <span className="community-meta">{reportCount}</span> : null}
                </NavLink>
              ))}
            </section>
          ))}
        </nav>
        {expanded ? <p className="mt-8 border-t border-line pt-5 text-xs text-muted">© BanteayDigital</p> : null}
      </aside> : null}
    </>
  );
}
