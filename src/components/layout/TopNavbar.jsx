import { NavLink } from "react-router-dom";
import { Avatar, Icon, IconButton } from "../ui";
import { currentUser } from "../../data/mockCommunity";

const navigation = [
  { label: "Home", icon: "home", to: "/" },
  { label: "Leaderboard", icon: "trophy", to: "/leaderboard" },
  { label: "Alerts", icon: "bookmark", to: "/alerts" },
];
const desktopNavClass = ({ isActive }) => `flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800" : "text-[#52647a] hover:bg-[#f2f5f8] hover:text-brand-800"}`;
const mobileNavClass = ({ isActive }) => `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? "text-brand-800" : "text-[#607089]"}`;

export function TopNavbar() {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1500px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <NavLink className="flex min-w-0 items-center gap-2.5" to="/" aria-label="BanteayDigital home">
            <img className="h-9 w-9" src="/BanteayDigitalLogo.svg" alt="BanteayDigital logo" />
            <span className="hidden leading-tight sm:grid"><strong className="text-[15px] text-brand-900">BanteayDigital</strong><small className="text-[11px] text-muted">Digital safety community</small></span>
          </NavLink>
          <nav className="ml-6 hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {navigation.map((item) => <NavLink key={item.label} to={item.to} end={item.to === "/"} className={desktopNavClass}><Icon name={item.icon} size={17} />{item.label}</NavLink>)}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-[#40546b] hover:border-[#b8c8d9] hover:bg-[#f8fafc]" aria-label="Language: Khmer or English">
              <Icon name="globe" size={16} /><span lang="km">ខ្មែរ</span><span className="text-[#9aa7b5]">|</span><span>EN</span>
            </button>
            <IconButton label="Notifications, 3 unread" icon="bell" badge="3" />
            <details className="relative hidden lg:block">
              <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 rounded-lg px-1.5 hover:bg-[#f2f5f8]" aria-label="Open profile menu"><Avatar name={currentUser.name} size="sm" /><span className="hidden text-sm font-semibold xl:inline">{currentUser.name.split(" ")[0]}</span></summary>
              <div className="absolute right-0 top-12 w-52 rounded-xl border border-line bg-white p-2 shadow-lg">
                <p className="m-0 border-b border-line px-3 py-2 text-xs text-muted">{currentUser.handle}</p>
                <button className="flex min-h-11 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-sm text-[#40546b] hover:bg-[#f2f5f8]"><Icon name="settings" size={17} />Settings</button>
                <button className="flex min-h-11 w-full items-center gap-2 rounded-lg border-0 bg-transparent px-3 text-sm text-[#40546b] hover:bg-[#f2f5f8]"><Icon name="help" size={17} />Help &amp; Support</button>
              </div>
            </details>
            <NavLink to="/report" className="ml-1 hidden min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white transition hover:bg-brand-700 lg:inline-flex"><Icon name="plus" size={18} />Report a scam</NavLink>
          </div>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-line bg-white lg:hidden" aria-label="Mobile navigation">
        {navigation.map((item) => <NavLink key={item.label} to={item.to} end={item.to === "/"} className={mobileNavClass}><Icon name={item.icon} size={20} /><span>{item.label}</span></NavLink>)}
      </nav>
      <NavLink to="/report" className="fixed bottom-20 right-4 z-30 inline-flex min-h-12 items-center gap-2 rounded-full bg-brand-800 px-5 text-sm font-bold text-white shadow-[0_6px_18px_rgb(7_87_166/0.24)] hover:bg-brand-700 lg:hidden" aria-label="Report a scam"><Icon name="plus" size={19} />Report</NavLink>
    </>
  );
}
