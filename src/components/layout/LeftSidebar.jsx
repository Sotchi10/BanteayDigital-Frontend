import { NavLink } from "react-router-dom";
import { currentUser } from "../../data/mockCommunity";
import { Avatar, Card, Icon } from "../ui";

export function LeftSidebar() {
  return (
    <aside className="sticky top-[88px] hidden self-start flex-col gap-4 lg:flex" aria-label="Profile and safety shortcuts">
      <Card className="p-4">
        <div className="flex items-center gap-3"><Avatar name={currentUser.name} size="md" /><div className="min-w-0"><h2 className="m-0 truncate text-sm font-bold">{currentUser.name}</h2><p className="m-0 text-xs text-muted">{currentUser.handle}</p></div></div>
        <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted"><span>{currentUser.reports} reports</span><span>{currentUser.joined.replace("Joined ", "Since ")}</span></div>
      </Card>
      <nav className="grid gap-1" aria-label="Safety shortcuts">
        <NavLink to="/analysis" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#40546b] hover:bg-white hover:text-brand-800"><Icon name="shield" size={18} />Check a scam</NavLink>
        <NavLink to="/community" className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold text-[#40546b] hover:bg-white hover:text-brand-800"><Icon name="users" size={18} />Community safety</NavLink>
      </nav>
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2 text-brand-800"><Icon name="shield" size={19} /><strong className="text-sm">Before you respond</strong></div>
        <ul className="m-0 grid gap-2 pl-5 text-xs leading-relaxed text-muted"><li>Check the sender and link carefully.</li><li>Never share an OTP or password.</li><li>Report suspicious requests quickly.</li></ul>
      </Card>
    </aside>
  );
}
