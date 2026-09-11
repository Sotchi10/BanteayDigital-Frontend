import { NavLink } from "react-router-dom";
import { currentUser } from "../../data/mockCommunity";
import { Avatar, Badge, Card, Icon } from "../ui";

export function LeftSidebar() {
  const shortcutClass = ({ isActive }) => `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-white text-brand-800 shadow-[var(--shadow-card)]" : "text-[#40546b] hover:bg-white hover:text-brand-800"}`;
  return (
    <aside className="hidden h-full self-start flex-col gap-4 overflow-hidden lg:flex" aria-label="Profile and safety shortcuts">
      <Card className="p-5">
        <Avatar name={currentUser.name} size="xl" />
        <div className="flex ">
          <h2 className="mb-0 mt-2 text-base font-bold">{currentUser.name}</h2>
          <Badge tone="blue" className="text-[10px]">Community member</Badge>
        </div>
        <p className="mb-2 mt-0 text-xs text-muted">{currentUser.handle}</p>
        
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted"><span>{currentUser.reports} reports</span><span>{currentUser.joined}</span></div>
      </Card>
      <nav className="grid gap-1" aria-label="Safety shortcuts">
        <NavLink to="/saved" className={shortcutClass}><Icon name="bookmark" size={18} />Saved</NavLink>
        <NavLink to="/history" className={shortcutClass}><Icon name="clock" size={18} />History</NavLink>
        <NavLink to="/about" className={shortcutClass}><Icon name="book" size={18} />About BanteayDigital</NavLink>
      </nav>
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2 text-brand-800"><Icon name="shield" size={19} /><strong className="text-sm">Before you respond</strong></div>
        <ul className="m-0 grid gap-2 pl-5 text-xs leading-relaxed text-muted"><li>Check the sender and link carefully.</li><li>Never share an OTP or password.</li><li>Report suspicious requests quickly.</li></ul>
      </Card>
    </aside>
  );
}
