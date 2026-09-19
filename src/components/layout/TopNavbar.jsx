import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Avatar, Icon } from "../ui";
import { listScans } from "../../services/scans";
import {
  EVENT_NAME as SCAN_HISTORY_EVENT,
  initializeScanHistorySeenAt,
  scanHistoryUnreadCount,
} from "../../services/scanHistoryNotifications";
import { listAlerts } from "../../features/alerts/api/alertsApi";
import {
  ALERT_READ_STATE_EVENT,
  readAlertIds,
} from "../../features/alerts/alertReadState";
import { useAuth } from "../../state/AuthStore";
import { useTranslation } from "react-i18next";

const mobileNavClass = ({ isActive }) =>
  `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] transition-colors ${isActive ? "text-brand-800 font-bold" : "text-muted font-medium hover:text-ink"}`;

const mobileMainLinks = [
  { label: "Home", icon: "home", to: "/" },
  { label: "Analyze Scam", icon: "shield", to: "/analysis" },
  { label: "Community Safety", icon: "book", to: "/safety" },
];

const mobileUserLinks = [
  { label: "Scan History", icon: "clock", to: "/history", protected: true },
  { label: "My reports", icon: "edit", to: "/reports/history", protected: true },
  { label: "Saved", icon: "bookmark", to: "/saved", protected: true },
];

export function TopNavbar({ mobileMenuOpen, setMobileMenuOpen, feedQuery, onFeedQueryChange, onUnseenScanCountChange }) {
  const tr = useInterfaceTranslation();
  const { isAuthenticated, user, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [unseenScanCount, setUnseenScanCount] = useState(0);
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const profileMenuRef = useRef(null);
  const cancelLogoutRef = useRef(null);

  useEffect(() => { onUnseenScanCountChange(unseenScanCount); }, [onUnseenScanCountChange, unseenScanCount]);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      return undefined;
    }
    let active = true;
    const refreshUnreadScanCount = async () => {
      try {
        const response = await listScans();
        const scans = response.scans || [];
        initializeScanHistorySeenAt(user.id, scans);
        if (active) setUnseenScanCount(scanHistoryUnreadCount(user.id, scans));
      } catch {
        if (active) setUnseenScanCount(0);
      }
    };
    const handleStorage = (event) => {
      if (event.key === `banteay-scan-history-seen-at:${user.id}`) refreshUnreadScanCount();
    };
    refreshUnreadScanCount();
    window.addEventListener(SCAN_HISTORY_EVENT, refreshUnreadScanCount);
    window.addEventListener("storage", handleStorage);
    return () => {
      active = false;
      window.removeEventListener(SCAN_HISTORY_EVENT, refreshUnreadScanCount);
      window.removeEventListener("storage", handleStorage);
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    let active = true;
    const refreshUnreadAlerts = async () => {
      try {
        const response = await listAlerts();
        const readIds = readAlertIds();
        if (active) setUnreadAlertCount((response.alerts || []).filter((alert) => !readIds.has(alert.id)).length);
      } catch {
        if (active) setUnreadAlertCount(0);
      }
    };
    refreshUnreadAlerts();
    const interval = window.setInterval(refreshUnreadAlerts, 60000);
    window.addEventListener(ALERT_READ_STATE_EVENT, refreshUnreadAlerts);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener(ALERT_READ_STATE_EVENT, refreshUnreadAlerts);
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
    } catch {
      // The local session is cleared by AuthStore even if the server session
      // has already expired, so the user can still safely leave the account.
    } finally {
      setProfileMenuOpen(false);
      setLogoutConfirmOpen(false);
      setLoggingOut(false);
      navigate("/", { replace: true });
    }
  };

  useEffect(() => {
    const closeMenu = (event) => {
      if (!profileMenuRef.current?.contains(event.target))
        setProfileMenuOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setProfileMenuOpen(false);
        if (!loggingOut) setLogoutConfirmOpen(false);
      }
    };
    document.addEventListener("pointerdown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [loggingOut]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    if (logoutConfirmOpen) cancelLogoutRef.current?.focus();
  }, [logoutConfirmOpen]);

  return (
    <>
      <header className="app-navbar sticky top-0 z-30 border-b border-line bg-surface">
        <div className="mx-auto flex min-h-[64px] max-w-[1640px] items-center gap-3 px-4 sm:gap-4 sm:px-6 lg:gap-6 lg:px-8">
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="inline-grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:bg-brand-100 hover:text-brand-800 lg:hidden"
              aria-label={tr("Open navigation menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
            >
              <Icon name="menu" size={20} />
            </button>
            <NavLink
              className="flex shrink-0 items-center gap-2"
              to="/"
              aria-label={tr("BanteayDigital home")}
            >
              <img
                className="h-8 w-8"
                src="/BanteayDigitalLogo.svg"
                alt={tr("BanteayDigital logo")}
              />
              <span className="hidden whitespace-nowrap text-base font-bold tracking-tight text-brand-900 sm:inline">
                Banteay Digital
              </span>
            </NavLink>
          </div>
          <label className="mx-auto hidden h-10 min-w-0 max-w-xl flex-1 items-center gap-2 rounded-full border border-line bg-canvas px-3 text-muted sm:flex" aria-label={tr("Search scams, users, or keywords...")}>
            <Icon name="search" size={17} className="shrink-0" />
            <input
              className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted placeholder:text-[13px]"
              type="search"
              placeholder={tr("Search community posts")}
              value={feedQuery}
              onChange={(event) => { onFeedQueryChange(event.target.value); navigate("/"); }}
            />
          </label>
          <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:ml-0 sm:gap-1.5">
            <button
              type="button"
              onClick={() => setMobileSearchOpen((open) => !open)}
              className={`inline-grid h-9 w-9 place-items-center rounded-lg transition sm:hidden ${mobileSearchOpen ? "bg-brand-100 text-brand-800" : "text-black hover:bg-[#f2f5f8] hover:text-brand-800"}`}
              aria-label={tr("Search")}
            >
              <Icon name="search" size={17} />
            </button>
            <button
              type="button"
              onClick={() =>
                i18n.changeLanguage(
                  i18n.resolvedLanguage === "km" ? "en" : "km",
                )
              }
              className="inline-flex h-9 items-center gap-1 rounded-lg px-1.5 text-xs font-medium text-black hover:bg-[#f2f5f8] sm:px-2"
              aria-label={t("nav.language")}
            >
              <Icon name="globe" size={16} />
              <span className="inline font-semibold sm:hidden">
                {i18n.resolvedLanguage === "km" ? "EN" : "ខ្មែរ"}
              </span>
              <span className="hidden lg:inline">
                <span lang={i18n.resolvedLanguage === "km" ? "en" : "km"}>
                  {i18n.resolvedLanguage === "km" ? "EN" : "ខ្មែរ"}
                </span>
                <span className="mx-1 text-[#9aa7b5]">|</span>
                <span>{i18n.resolvedLanguage === "km" ? "ខ្មែរ" : "EN"}</span>
              </span>
            </button>
            <NavLink
              to="/alerts"
              className={({ isActive }) =>
                `relative inline-grid h-9 w-9 place-items-center rounded-lg transition ${isActive ? "bg-brand-100 text-brand-800" : "text-black hover:bg-[#f2f5f8] hover:text-brand-800"}`
              }
              aria-label={tr("Safety alerts")}
            >
              <Icon name="bell" size={19} />
              {unreadAlertCount ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full border-2 border-white bg-risk-high px-1 text-[10px] font-bold leading-none text-white">
                  {unreadAlertCount > 99 ? "99+" : unreadAlertCount}
                </span>
              ) : null}
            </NavLink>
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                  className="flex h-9 items-center gap-2 rounded-lg px-1 text-left hover:bg-[#f2f5f8]"
                  aria-label={tr("Open profile menu for {{value1}}", { value1: user.name })}
                  aria-expanded={profileMenuOpen}
                  aria-controls="profile-menu"
                >
                  <Avatar name={user.name} size="sm" />
                  <span className="hidden text-sm font-semibold xl:inline">
                    {user.username}
                  </span>
                  <Icon
                    name="chevronDown"
                    size={16}
                    className={`hidden text-muted transition-transform xl:block ${profileMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {profileMenuOpen ? (
                  <div
                    id="profile-menu"
                    role="menu"
                    aria-label={t("nav.profileMenu")}
                    className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(20rem,calc(100vw-1rem))] overflow-hidden rounded-xl border border-line bg-surface p-2 shadow-[0_12px_28px_rgb(16_42_67/0.14)]"
                  >
                    <NavLink
                      to={
                        user.username
                          ? `/${encodeURIComponent(user.username)}`
                          : "/settings"
                      }
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-brand-100"
                    >
                      <Avatar name={user.name} size="md" />
                      <div className="min-w-0">
                        <strong className="block truncate text-base text-ink">
                          {user.name}
                        </strong>
                        <span className="block truncate text-sm text-muted">
                          {user.email ||
                            user.phoneNumber ||
                            t("nav.signedInAccount")}
                        </span>
                        <span className="mt-1 block text-sm font-medium text-brand-800">{tr("View profile")}</span>
                      </div>
                    </NavLink>
                    <div className="my-1 border-t border-line" />
                    <NavLink
                      to={user.username ? `/${encodeURIComponent(user.username)}` : "/reports/history"}
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-black transition hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Icon name="edit" size={18} />{tr("My approved reports")}</NavLink>
                    <NavLink
                      to="/about"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-black transition hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Icon name="book" size={18} />
                      {tr("About Us")}
                    </NavLink>
                    <NavLink
                      to="/settings"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-black transition hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Icon name="settings" size={18} />
                      {t("nav.settings")}
                    </NavLink>
                    <NavLink
                      to="/settings?section=appearance"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-black transition hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Icon name="lightbulb" size={18} />
                      {t("nav.appearance")}
                    </NavLink>
                    <NavLink
                      to="/settings?section=support"
                      onClick={() => setProfileMenuOpen(false)}
                      role="menuitem"
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-black transition hover:bg-brand-100 hover:text-brand-800"
                    >
                      <Icon name="help" size={18} />{tr("Help & support")}</NavLink>
                    <div className="my-1 border-t border-line" />
                    <button
                      type="button"
                      role="menuitem"
                      disabled={loggingOut}
                      onClick={() => {
                        setProfileMenuOpen(false);
                        setLogoutConfirmOpen(true);
                      }}
                      className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-base font-medium text-risk-high transition hover:bg-[#fff0f1]"
                    >
                      <Icon name="logout" size={18} />
                      {loggingOut ? t("nav.loggingOut") : t("nav.logOut")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-3 text-sm font-medium text-white hover:bg-brand-700 sm:px-4"
              >
                <Icon name="user" size={17} />
                <span className="hidden sm:inline">{t("nav.signIn")}</span>
              </Link>
            )}
          </div>
        </div>
        {mobileSearchOpen ? (
          <div className="border-t border-line bg-surface px-4 py-2.5 sm:hidden">
            <div className="flex items-center gap-2">
              <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-full border border-line bg-canvas px-3 text-muted" aria-label={tr("Search scams, users, or keywords...")}>
                <Icon name="search" size={16} className="shrink-0" />
                <input
                  autoFocus
                  className="min-w-0 flex-1 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-muted placeholder:text-[13px]"
                  type="search"
                  placeholder={tr("Search community posts")}
                  value={feedQuery}
                  onChange={(event) => { onFeedQueryChange(event.target.value); navigate("/"); }}
                />
                {feedQuery ? (
                  <button
                    type="button"
                    onClick={() => onFeedQueryChange("")}
                    className="p-1 text-muted hover:text-ink"
                    aria-label={tr("Clear search")}
                  >
                    <Icon name="close" size={15} />
                  </button>
                ) : null}
              </label>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                className="shrink-0 px-2 py-1 text-sm font-medium text-brand-800"
              >
                {tr("Cancel")}
              </button>
            </div>
          </div>
        ) : null}
      </header>
      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="presentation">
          <button
            type="button"
            className="mobile-menu-backdrop absolute inset-0 h-full w-full bg-[#071a33]/55"
            aria-label={tr("Close navigation menu")}
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            id="mobile-navigation-drawer"
            className="mobile-navigation-drawer relative flex h-full w-[min(21rem,calc(100vw-2.5rem))] flex-col overflow-y-auto bg-surface p-4 shadow-2xl"
            aria-label={tr("Mobile navigation")}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <Link
                to="/"
                className="flex items-center gap-2 font-medium text-brand-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <img className="h-8 w-8" src="/BanteayDigitalLogo.svg" alt="" />
                Banteay Digital
              </Link>
              <button
                type="button"
                className="inline-grid h-11 w-11 place-items-center rounded-lg text-[#40546b] hover:bg-brand-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label={tr("Close navigation menu")}
              >
                <Icon name="close" size={22} />
              </button>
            </div>
            {isAuthenticated ? (
              <NavLink
                to={
                  user.username
                    ? `/${encodeURIComponent(user.username)}`
                    : "/profile"
                }
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 flex items-center gap-3 rounded-xl p-3 text-left"
              >
                <Avatar name={user.name} size="md" />
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-ink">
                    {user.name}
                  </strong>
                  <small className="block truncate text-xs text-muted">{tr("Profile & reports")}</small>
                </span>
              </NavLink>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-bold text-white"
              >
                <Icon name="user" size={17} />
                {t("nav.signIn")}
              </Link>
            )}
            <nav
              className="mt-4 grid gap-1"
              aria-label={tr("Main mobile navigation")}
            >
              <div className="px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">
                {tr("Explore")}
              </div>
              {mobileMainLinks.filter((item) => !item.protected || isAuthenticated).map((item) => (
                <NavLink
                  key={item.label}
                  to={item.to}
                  end={item.to === "/"}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition ${isActive ? "bg-brand-100 text-brand-800 font-semibold" : "text-black hover:bg-[#f2f5f8]"}`
                  }
                >
                  <Icon name={item.icon} size={18} />
                  <span className="flex items-center gap-2">{tr(item.label)}
                    {item.to === "/history" && unseenScanCount ? (
                      <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[#d92d3a] px-1 text-xs font-bold leading-none text-white">{unseenScanCount > 99 ? "99+" : unseenScanCount}</span>
                    ) : null}
                  </span>
                </NavLink>
              ))}

              {isAuthenticated ? (
                <>
                  <div className="mt-3 px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">
                    {tr("Your activity")}
                  </div>
                  {mobileUserLinks.map((item) => (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800 font-bold" : "text-black hover:bg-[#f2f5f8]"}`
                    }
                  >
                    <Icon name={item.icon} size={18} />
                    <span>{tr(item.label)}</span>
                  </NavLink>
                  ))}
                </>
              ) : null}
              <div className="mt-3 px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">
                {tr("Community activity")}
              </div>
              <NavLink
                to="/leaderboard"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800 font-bold" : "text-black hover:bg-[#f2f5f8]"}`
                }
              >
                <Icon name="trophy" size={18} />
                <span>{tr("Leaderboard")}</span>
              </NavLink>
              <NavLink
                to="/about"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800 font-bold" : "text-black hover:bg-[#f2f5f8]"}`
                }
              >
                <Icon name="book" size={18} />
                <span>{tr("About Us")}</span>
              </NavLink>
              {isAuthenticated ? (
                <>
                  <div className="mt-3 px-3 pb-1 text-xs font-bold uppercase tracking-wider text-muted">
                    {tr("Account & Profile")}
                  </div>
                  <NavLink
                  to="/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800 font-bold" : "text-black hover:bg-[#f2f5f8]"}`
                  }
                >
                  <Icon name="settings" size={18} />
                  <span>{t("nav.settings")}</span>
                  </NavLink>
                </>
              ) : null}
            </nav>
            <div className="mt-5 border-t border-line pt-4">
              <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-muted">{tr("More")}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-xs font-medium">
                <Link to="/settings?section=support" onClick={() => setMobileMenuOpen(false)} className="min-h-9 py-2 text-[#52647a] hover:text-brand-800">{tr("Help & support")}</Link>
                <Link to="/" onClick={() => setMobileMenuOpen(false)} className="min-h-9 py-2 text-[#52647a] hover:text-brand-800">{tr("Guidelines")}</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="min-h-9 py-2 text-[#52647a] hover:text-brand-800">{tr("Privacy")}</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="min-h-9 py-2 text-[#52647a] hover:text-brand-800">{tr("Terms")}</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="min-h-9 py-2 text-[#52647a] hover:text-brand-800">{tr("Accessibility")}</Link>
              </div>
            </div>
            {isAuthenticated ? (
              <button
                type="button"
                disabled={loggingOut}
                onClick={() => {
                  setMobileMenuOpen(false);
                  setLogoutConfirmOpen(true);
                }}
                className="mt-auto flex min-h-12 items-center gap-3 rounded-lg px-3 pt-6 text-left text-sm font-semibold text-risk-high hover:bg-[#fff0f1]"
              >
                <Icon name="logout" size={18} />
                {loggingOut ? t("nav.loggingOut") : t("nav.logOut")}
              </button>
            ) : null}
          </aside>
        </div>
      ) : null}
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-[calc(4rem+env(safe-area-inset-bottom,0px))] items-center border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur lg:hidden"
        aria-label={tr("Mobile navigation")}
      >
        <NavLink to="/" end className={mobileNavClass}>
          <Icon name="home" size={20} />
          <span>{tr("Home")}</span>
        </NavLink>
        <NavLink to="/history" className={mobileNavClass}>
          <div className="relative">
            <Icon name="clock" size={20} />
            {unseenScanCount ? (
              <span className="absolute -right-1.5 -top-1 grid h-3.5 min-w-3.5 place-items-center rounded-full bg-[#d92d3a] px-1 text-xs font-bold text-white">
                {unseenScanCount > 99 ? "99+" : unseenScanCount}
              </span>
            ) : null}
          </div>
          <span>{tr("Scan History")}</span>
        </NavLink>
        <NavLink
          to="/analysis"
          className="flex flex-1 flex-col items-center justify-center -mt-3"
          aria-label={tr("Analyze Scam")}
        >
          {({ isActive }) => (
            <>
              <span className={`cyber-scanner-btn grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition-transform ${isActive ? "ring-2 ring-brand-800 ring-offset-2 ring-offset-surface scale-105" : "hover:scale-105"}`}>
                <Icon name="shield" size={22} />
              </span>
              <span className={`mt-1 text-[11px] font-bold transition-colors ${isActive ? "text-brand-800" : "text-muted"}`}>
                {tr("Analyze")}
              </span>
            </>
          )}
        </NavLink>
        <NavLink to="/safety" className={mobileNavClass}>
          <Icon name="book" size={20} />
          <span>{tr("Safety")}</span>
        </NavLink>
        <NavLink
          to={
            isAuthenticated
              ? user.username
                ? `/${encodeURIComponent(user.username)}`
                : "/profile"
              : "/login"
          }
          className={mobileNavClass}
          aria-label={
            isAuthenticated ? tr("Open profile") : tr("Sign in or create an account")
          }
        >
          {isAuthenticated ? (
            <Avatar name={user.name} size="sm" />
          ) : (
            <Icon name="user" size={20} />
          )}
          <span>{isAuthenticated ? tr("Profile") : tr("Sign in")}</span>
        </NavLink>
      </nav>
      {logoutConfirmOpen ? (
        <div
          aria-labelledby="logout-confirmation-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-[#071a33]/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loggingOut)
              setLogoutConfirmOpen(false);
          }}
          role="dialog"
        >
          <section className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-risk-high">
                <Icon name="logout" size={19} />
              </span>
              <div>
                <h2
                  className="m-0 text-lg font-bold text-ink"
                  id="logout-confirmation-title"
                >{tr("Log out?")}</h2>
                <p className="mb-0 mt-1 text-sm leading-6 text-muted">{tr("You will need to sign in again to access your account.")}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="min-h-10 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-[#40546b] hover:bg-[#f2f5f8]"
                disabled={loggingOut}
                onClick={() => setLogoutConfirmOpen(false)}
                ref={cancelLogoutRef}
                type="button"
              >{tr("Cancel")}</button>
              <button
                className="min-h-10 rounded-lg bg-risk-high px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
                disabled={loggingOut}
                onClick={handleLogout}
                type="button"
              >
                {loggingOut ? tr("Logging out…") : tr("Log out")}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
