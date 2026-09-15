import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { listReports } from "../../services/reports";
import { useAuth } from "../../state/AuthStore";
import { Avatar, Card, Icon } from "../ui";
import { useTranslation } from "react-i18next";

export function LeftSidebar() {
  const tr = useInterfaceTranslation();
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [reportCount, setReportCount] = useState(null);
  const [reportError, setReportError] = useState(false);
  const shortcutClass = ({ isActive }) =>
    `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${isActive ? "bg-brand-100 text-brand-800" : "text-[#52647a] hover:bg-white hover:text-brand-800"}`;

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
      className="desktop-left-sidebar hidden self-start lg:sticky lg:top-[84px] lg:min-h-[calc(100vh-100px)] lg:flex lg:flex-col lg:gap-4"
      aria-label={tr("Profile and safety shortcuts")}
    >
      {user ? (
        <Card className="p-4 shadow-none">
          <Avatar name={user.name || tr("User")} size="xl" />
          <h2 className="mb-0 mt-2 text-base font-bold">
            {user.name || tr("User")}
          </h2>
          {user.username ? (
            <p className="mb-2 mt-0 text-xs text-muted">@{user.username}</p>
          ) : null}
          <div className="mt-4 flex flex-col items-start justify-between border-t border-line pt-3 text-xs text-muted">
            <span>
              {reportError
                ? t("sidebar.reportsUnavailable")
                : reportCount === null
                  ? t("sidebar.loadingReports")
                  : t("sidebar.reports", { count: reportCount })}
            </span>
            <span>{user.createdAt ? t("sidebar.joined", { date: new Intl.DateTimeFormat(i18n.language, { month: "short", year: "numeric" }).format(new Date(user.createdAt)) }) : ""}</span>
          </div>
        </Card>
      ) : null}
      <nav className="grid gap-1 border-t border-line pt-3" aria-label={tr("Your activity")}>
        <NavLink to="/history" className={shortcutClass}>
          <Icon name="clock" size={18} />
          {t("sidebar.history")}
        </NavLink>
        <NavLink to="/reports/history" className={shortcutClass}>
          <Icon name="edit" size={18} />{tr("My reports")}</NavLink>
        <NavLink to="/saved" className={shortcutClass}>
          <Icon name="bookmark" size={18} />
          {t("sidebar.saved")}
        </NavLink>
      </nav>
      <nav className="grid gap-1 border-t border-line pt-3" aria-label={tr("Community activity")}>
        <NavLink to="/leaderboard" className={shortcutClass}>
          <Icon name="trophy" size={18} />
          {tr("Leaderboard")}
        </NavLink>
      </nav>
      <p className="mb-0 mt-auto border-t border-line pt-4 text-xs text-muted">{tr("© BanteayDigital")}</p>
    </aside>
  );
}
