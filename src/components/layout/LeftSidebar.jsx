import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { listReports } from "../../services/reports";
import { useAuth } from "../../state/AuthStore";
import { Avatar, Card, Icon } from "../ui";

const joinedLabel = (date) =>
  date
    ? `Joined ${new Intl.DateTimeFormat(undefined, { month: "short", year: "numeric" }).format(new Date(date))}`
    : "";

export function LeftSidebar() {
  const { user } = useAuth();
  const [reportCount, setReportCount] = useState(null);
  const [reportError, setReportError] = useState(false);
  const shortcutClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-white text-brand-800 shadow-[var(--shadow-card)]" : "text-[#40546b] hover:bg-white hover:text-brand-800"}`;

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    listReports()
      .then((response) => {
        if (active) {
          setReportCount(response.meta?.total ?? 0);
          setReportError(false);
        }
      })
      .catch(() => {
        if (active) setReportError(true);
      });
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <aside
      className="hidden self-start lg:sticky lg:top-[84px] lg:flex lg:flex-col lg:gap-4"
      aria-label="Profile and safety shortcuts"
    >
      {user ? (
        <Card className="p-5">
          <Avatar name={user.name || "User"} size="xl" />
          <h2 className="mb-0 mt-2 text-base font-bold">
            {user.name || "User"}
          </h2>
          {user.username ? (
            <p className="mb-2 mt-0 text-xs text-muted">@{user.username}</p>
          ) : null}
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs text-muted">
            <span>
              {reportError
                ? "Reports unavailable"
                : reportCount === null
                  ? "Loading reports…"
                  : `${reportCount} reports`}
            </span>
            <span>{joinedLabel(user.createdAt)}</span>
          </div>
        </Card>
      ) : null}
      <nav className="grid gap-1" aria-label="Safety shortcuts">
        <NavLink to="/saved" className={shortcutClass}>
          <Icon name="bookmark" size={18} />
          Saved
        </NavLink>
        <NavLink to="/history" className={shortcutClass}>
          <Icon name="clock" size={18} />
          History
        </NavLink>
        <NavLink to="/about" className={shortcutClass}>
          <Icon name="book" size={18} />
          About
        </NavLink>
      </nav>
      <Card className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon name="shield" size={19} className="text-brand-800" />
          <strong className="text-sm text-ink">Before you respond</strong>
        </div>
        <ul className="m-0 grid gap-2 pl-5 text-xs leading-relaxed text-[#40546b]">
          <li>Check the sender and link carefully.</li>
          <li>Never share an OTP or password.</li>
          <li>Report suspicious requests quickly.</li>
        </ul>
      </Card>
    </aside>
  );
}
