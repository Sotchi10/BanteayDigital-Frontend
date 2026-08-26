import { NavLink } from "react-router-dom";
import { Avatar, Icon, IconButton } from "../ui";
import { currentUser } from "../../data/mockCommunity";

const primaryNavigation = [
  { label: "Home", icon: "home" },
  { label: "Report", icon: "edit" },
  { label: "Leaderboard", icon: "trophy" },
  { label: "Alerts", icon: "bookmark" },
];
const paths = {
  Home: "/",
  Leaderboard: "/leaderboard",
  Report: "/report",
  Alerts: "/alerts",
};
const navClass = ({ isActive }) =>
  `relative flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold ${isActive ? "text-brand-800 after:absolute after:left-2 after:right-2 after:top-0 after:h-0.5 after:bg-brand-700 lg:after:bottom-0 lg:after:top-auto lg:after:h-[3px]" : "text-[#617089] hover:text-brand-800"}`;

export function TopNavbar() {
  return (
    <header className="sticky top-0 z-10 h-16 border-b border-line bg-surface">
      <div className="relative mx-auto flex h-full max-w-[1500px] items-center gap-4 px-10 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[280px_minmax(0,800px)_300px]">
        <NavLink
          className="flex min-w-0 items-center gap-2 lg:min-w-[165px] xl:min-w-[190px]"
          to="/"
        >
          <img
            className="h-[35px] w-[35px]"
            src="/BanteayDigitalLogo.svg"
            alt=""
          />
          <span className="hidden leading-tight lg:grid">
            <strong className="text-[15px] text-brand-900">
              BanteayDigital
            </strong>
            <small className="text-[10px] text-muted">
              Digital safety community
            </small>
          </span>
        </NavLink>
        <nav
          className="fixed inset-x-0 bottom-0 z-20 flex h-16 border-t border-line bg-surface lg:static lg:col-start-2 lg:h-full lg:w-full lg:justify-center lg:self-stretch lg:border-0 lg:bg-transparent"
          aria-label="Main navigation"
        >
          {primaryNavigation.map((item) => (
            <NavLink
              key={item.label}
              to={paths[item.label]}
              end={item.label === "Home"}
              className={navClass}
            >
              <Icon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center lg:absolute lg:right-10 xl:static xl:col-start-3 xl:justify-self-end">
          <IconButton label="Notifications" icon="bell" badge="3" />

          <button className="ml-1 hidden items-center gap-2 border-0 bg-transparent p-1 lg:flex">
            <Avatar name={currentUser.name} size="sm" />
            <span className="text-[13px] font-semibold">
              {currentUser.name.split(" ")[0]}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
