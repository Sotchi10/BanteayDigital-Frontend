import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Avatar, Icon } from "../ui";
import { useAuth } from "../../state/AuthStore";

const navigation = [
  { label: "Home", icon: "home", to: "/" },
  { label: "Analyze Scam", icon: "shield", to: "/analysis" },
  { label: "Alerts", icon: "bookmark", to: "/alerts" },
  { label: "Community Safety", icon: "users", to: "/safety" },
];
const desktopNavClass = ({ isActive }) =>
  `flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${isActive ? "bg-brand-100 text-brand-800" : "text-[#52647a] hover:bg-[#f2f5f8] hover:text-brand-800"}`;
const mobileNavClass = ({ isActive }) =>
  `flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-xs font-semibold ${isActive ? "text-brand-800" : "text-[#607089]"}`;

export function TopNavbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const profileMenuRef = useRef(null);
  const cancelLogoutRef = useRef(null);

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
    if (logoutConfirmOpen) cancelLogoutRef.current?.focus();
  }, [logoutConfirmOpen]);

  return (
    <>
      <header className="app-navbar sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8 xl:grid xl:grid-cols-[240px_minmax(0,800px)_minmax(280px,1fr)] xl:gap-6">
          <NavLink
            className="flex min-w-0 items-center gap-2.5 xl:col-start-1"
            to="/"
            aria-label="BanteayDigital home"
          >
            <img
              className="h-9 w-9"
              src="/BanteayDigitalLogo.svg"
              alt="BanteayDigital logo"
            />
            <span className="hidden leading-tight sm:grid">
              <strong className="text-[15px] text-brand-900">
                BanteayDigital
              </strong>
              <small className="text-[11px] text-muted">
                Digital safety community
              </small>
            </span>
          </NavLink>
          <nav
            className="ml-6 hidden items-center gap-1 lg:flex xl:col-start-2 xl:ml-0 xl:justify-self-center"
            aria-label="Main navigation"
          >
            {navigation.slice(0, 2).map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === "/"}
                className={desktopNavClass}
              >
                <Icon name={item.icon} size={17} />
                {/*{item.label}*/}
              </NavLink>
            ))}
            {navigation.slice(2).map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                className={desktopNavClass}
              >
                <Icon name={item.icon} size={17} />
                {/*{item.label}*/}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1.5 xl:col-start-3 xl:ml-0 xl:justify-self-end">
            <button
              type="button"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-[#40546b] hover:border-[#b8c8d9] hover:bg-[#f8fafc]"
              aria-label="Language: Khmer or English"
            >
              <Icon name="globe" size={16} />
              <span lang="km">ខ្មែរ</span>
              <span className="text-[#9aa7b5]">|</span>
              <span>EN</span>
            </button>
            <NavLink
              to="/alerts"
              className="relative inline-grid h-11 w-11 place-items-center rounded-full text-[#52647a] hover:bg-brand-100 hover:text-brand-800"
              aria-label="Open alerts, 3 new"
            >
              <Icon name="bell" />
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d92d3a] px-1 text-[10px] font-bold text-white">
                3
              </span>
            </NavLink>
            {isAuthenticated ? <div className="relative hidden lg:block" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setProfileMenuOpen((isOpen) => !isOpen)}
                className="flex min-h-11 items-center gap-2 rounded-lg px-1.5 text-left hover:bg-[#f2f5f8]"
                aria-label={`Open profile menu for ${user.name}`}
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
                  aria-label="Profile menu"
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 overflow-hidden rounded-xl border border-line bg-white p-2 shadow-[0_12px_28px_rgb(16_42_67/0.14)]"
                >
                  <NavLink
                    to={user.username ? `/${encodeURIComponent(user.username)}` : "/settings"}
                    onClick={() => setProfileMenuOpen(false)}
                    role="menuitem"
                    className="flex items-center gap-3 rounded-lg px-3 py-3 transition hover:bg-brand-100"
                  >
                    <Avatar name={user.name} size="md" />
                    <div className="min-w-0">
                      <strong className="block truncate text-sm text-ink">
                        {user.name}
                      </strong>
                      <span className="block truncate text-xs text-muted">
                        {user.email || user.phoneNumber || "Signed-in account"}
                      </span>
                    </div>
                  </NavLink>
                  <div className="my-1 border-t border-line" />
                  <NavLink
                    to="/settings"
                    onClick={() => setProfileMenuOpen(false)}
                    role="menuitem"
                    className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-[#40546b] transition hover:bg-brand-100 hover:text-brand-800"
                  >
                    <Icon name="settings" size={17} />
                    Settings
                  </NavLink>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => setProfileMenuOpen(false)}
                    className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-[#40546b] transition hover:bg-brand-100 hover:text-brand-800"
                  >
                    <Icon name="globe" size={17} />
                    Display &amp; Appearance
                  </button>
                  <div className="my-1 border-t border-line" />
                  <button
                    type="button"
                    role="menuitem"
                    disabled={loggingOut}
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold text-risk-high transition hover:bg-[#fff0f1]"
                  >
                    <Icon name="logout" size={17} />
                    {loggingOut ? "Logging out…" : "Log Out"}
                  </button>
                </div>
              ) : null}
            </div> : <Link to="/login" className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand-800 px-3 text-sm font-bold text-white hover:bg-brand-700 sm:px-4"><Icon name="user" size={17} /><span className="hidden sm:inline">Sign in</span></Link>}
          </div>
        </div>
      </header>
      <nav
        className="fixed inset-x-0 bottom-0 z-30 flex h-16 border-t border-line bg-white lg:hidden"
        aria-label="Mobile navigation"
      >
        {navigation.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={mobileNavClass}
          >
            <Icon name={item.icon} size={20} />
            {/*<span>{item.label}</span>*/}
          </NavLink>
        ))}
      </nav>
      {logoutConfirmOpen ? (
        <div
          aria-labelledby="logout-confirmation-title"
          aria-modal="true"
          className="fixed inset-0 z-[60] grid place-items-center bg-[#071a33]/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !loggingOut) setLogoutConfirmOpen(false);
          }}
          role="dialog"
        >
          <section className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#fff0f1] text-risk-high">
                <Icon name="logout" size={19} />
              </span>
              <div>
                <h2 className="m-0 text-lg font-bold text-ink" id="logout-confirmation-title">Log out?</h2>
                <p className="mb-0 mt-1 text-sm leading-6 text-muted">You will need to sign in again to access your account.</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="min-h-10 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-[#40546b] hover:bg-[#f2f5f8]"
                disabled={loggingOut}
                onClick={() => setLogoutConfirmOpen(false)}
                ref={cancelLogoutRef}
                type="button"
              >
                Cancel
              </button>
              <button
                className="min-h-10 rounded-lg bg-risk-high px-4 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
                disabled={loggingOut}
                onClick={handleLogout}
                type="button"
              >
                {loggingOut ? "Logging out…" : "Log out"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
