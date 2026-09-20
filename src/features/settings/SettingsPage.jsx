import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Avatar, Card, Icon } from "../../components/ui";
import { useAuth } from "../../state/AuthStore";
import { getThemePreference, setThemePreference } from "../../state/theme";
import { emailWithDomainPattern } from "../auth/contactValidation";

const sections = [
  { id: "account", label: "Account & Profile", icon: "user" },
  { id: "appearance", label: "Display & Appearance", icon: "lightbulb" },
  { id: "support", label: "Help & Support", icon: "help" },
];
const supportItems = [
  {
    title: "How BanteayDigital works",
    description: "Learn how the community helps identify scams.",
    icon: "book",
    to: "/about",
  },
  {
    title: "How scam analysis works",
    description: "Understand the warning signs used in a safety check.",
    icon: "shield",
    to: "/analysis",
  },
  {
    title: "How reporting works",
    description: "See how analyzed encounters become reports.",
    icon: "edit",
    to: "/analysis",
  },
  {
    title: "FAQ",
    description: "Answers to common questions about safety and reporting.",
    icon: "help",
    to: "/about",
  },
  {
    title: "Contact support",
    description: "Get help from the BanteayDigital support team.",
    icon: "message",
    to: "mailto:support@banteaydigital.org",
  },
  {
    title: "Community guidelines",
    description: "Help keep the community respectful and useful.",
    icon: "users",
    to: "/community",
  },
  {
    title: "Privacy Policy",
    description: "Learn how we handle your information.",
    icon: "lock",
    to: "/about",
  },
  {
    title: "Terms of Service",
    description: "Read the terms for using BanteayDigital.",
    icon: "book",
    to: "/about",
  },
];
const themes = [
  { id: "light", title: "Light", description: "Bright and clear" },
  { id: "dark", title: "Dark", description: "Clear contrast, softer light" },
  { id: "system", title: "System default", description: "Match your device" },
];

export function SettingsPage() {
  const tr = useInterfaceTranslation();
  const { user, refreshUser, updateProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedSection = searchParams.get("section");
  const active = sections.some((section) => section.id === requestedSection)
    ? requestedSection
    : "account";
  const setActive = (section) =>
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.set("section", section);
      return next;
    });
  const [theme, setTheme] = useState(getThemePreference);
  const [profile, setProfile] = useState({
    name: user?.name || "",
    username: user?.username || "",
    email: user?.email || "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deletePrompt, setDeletePrompt] = useState(false);
  useEffect(() => {
    const syncTheme = () => setTheme(getThemePreference());
    window.addEventListener("storage", syncTheme);
    return () => window.removeEventListener("storage", syncTheme);
  }, []);

  useEffect(() => {
    let activeRequest = true;
    refreshUser()
      .then((nextUser) => {
        if (activeRequest)
          setProfile({
            name: nextUser.name || "",
            username: nextUser.username || "",
            email: nextUser.email || "",
          });
      })
      .catch((requestError) => {
        if (activeRequest)
          setError(
            requestError.response?.data?.message ||
              "We could not load your profile. Please try again.",
          );
      })
      .finally(() => {
        if (activeRequest) setLoading(false);
      });
    return () => {
      activeRequest = false;
    };
    // The profile is loaded once when this protected screen opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (key) => (event) => {
    setProfile((current) => ({ ...current, [key]: event.target.value }));
    setSaved(false);
    setError("");
  };
  const submitProfile = async (event) => {
    event.preventDefault();
    const details = {
      name: profile.name.trim(),
      username: profile.username.trim(),
      email: profile.email.trim(),
    };
    if (!details.name || !details.email || !details.username)
      return setError("Enter your full name, username, and email address.");
    if (!emailWithDomainPattern.test(details.email))
      return setError("Enter an email address with a valid domain.");
    if (!/^[a-zA-Z0-9_]+$/.test(details.username))
      return setError(
        "Username can only contain letters, numbers, and underscores.",
      );
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      await updateProfile(details);
      setSaved(true);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "We could not save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="settings-page mx-auto w-full max-w-[1120px] min-w-0 lg:px-6"
      id="main-content"
    >
      <Link
        to="/"
        className="mb-3 inline-flex min-h-10 items-center gap-2 rounded-lg px-1 text-sm font-bold text-brand-800 transition hover:text-brand-700 sm:mb-5"
      >
        <Icon name="chevron" size={16} className="rotate-180" />
        {tr("Back to community")}
      </Link>
      <header className="mb-5 sm:mb-8">
        <h1 className="mb-1 mt-0 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          {tr("Settings")}
        </h1>
        <p className="m-0 text-base text-muted">
          {tr("Manage your profile, appearance, and support resources.")}
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <nav
          className="sticky top-[68px] z-20 -mx-4 bg-canvas/95 px-4 py-2 backdrop-blur-sm sm:-mx-6 sm:px-6 lg:top-[92px] lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
          aria-label={tr("Settings navigation")}
        >
          <div className="flex snap-x gap-2 overflow-x-auto pb-1 no-scrollbar lg:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={`flex min-h-11 shrink-0 snap-start items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition ${active === section.id ? "border-brand-200 bg-brand-100 text-brand-800 shadow-sm" : "border-line bg-surface text-black hover:bg-canvas hover:text-brand-800"}`}
                aria-current={active === section.id ? "page" : undefined}
              >
                <Icon name={section.icon} size={16} />
                <span>{tr(section.label)}</span>
              </button>
            ))}
          </div>
          <Card className="hidden p-2 lg:block">
            <div className="grid gap-1">
              {sections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActive(section.id)}
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-base font-semibold transition ${active === section.id ? "bg-brand-100 text-brand-800" : "text-black hover:bg-canvas hover:text-brand-800"}`}
                  aria-current={active === section.id ? "page" : undefined}
                >
                  <Icon name={section.icon} size={18} className="shrink-0" />
                  <span className="flex-1">{tr(section.label)}</span>
                  {active === section.id ? (
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                  ) : null}
                </button>
              ))}
            </div>
          </Card>
        </nav>
        <div className="min-w-0">
          {active === "account" ? (
            <section aria-labelledby="account-heading">
              <div className="mb-4">
                <h2
                  id="account-heading"
                  className="m-0 text-xl font-bold text-ink"
                >
                  {tr("Account & Profile")}
                </h2>
                <p className="mb-0 mt-1 text-base text-muted">
                  {tr("Keep your account information current.")}
                </p>
              </div>
              <Card className="p-4 sm:p-6">
                {loading ? (
                  <div className="grid place-items-center py-10" role="status">
                    <span className="h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" />
                    <p className="mb-0 mt-4 text-base text-muted">
                      {tr("Loading your profile…")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submitProfile} noValidate>
                    <div className="flex flex-wrap items-center gap-4 border-b border-line pb-6">
                      <Avatar name={profile.name || "Profile"} size="xl" />
                      <div>
                        <h3 className="m-0 text-base font-semibold text-ink">
                          {tr("Profile picture")}
                        </h3>
                        <p className="m-0 mt-1 text-base text-muted">
                          {tr("Update your personal identification here.")}
                        </p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <label className="grid gap-2 text-base font-semibold text-ink">
                        {tr("Full name")}
                        <input
                          autoComplete="name"
                          disabled={saving}
                          value={profile.name}
                          onChange={updateField("name")}
                          className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa] disabled:opacity-60"
                        />
                      </label>
                      <label className="grid gap-2 text-base font-semibold text-ink">
                        {tr("Username")}
                        <input
                          autoComplete="username"
                          disabled={saving}
                          value={profile.username}
                          onChange={updateField("username")}
                          className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa] disabled:opacity-60"
                        />
                      </label>
                    </div>
                    <label className="mt-5 grid gap-2 text-base font-semibold text-ink">
                      {tr("Email")}
                      <input
                        autoComplete="email"
                        disabled={saving}
                        type="email"
                        value={profile.email}
                        onChange={updateField("email")}
                        className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa] disabled:opacity-60"
                      />
                    </label>
                    {error ? (
                      <p
                        className="mb-0 mt-4 text-base font-semibold text-risk-high"
                        role="alert"
                      >
                        {tr(error)}
                      </p>
                    ) : null}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
                      <button
                        type="button"
                        className="min-h-10 px-1 text-base font-semibold text-brand-800 hover:underline"
                      >
                        {tr("Change password")}
                      </button>
                      <div className="flex items-center gap-3">
                        {saved ? (
                          <span
                            className="text-base font-semibold text-risk-low"
                            role="status"
                          >
                            {tr("Changes saved")}
                          </span>
                        ) : null}
                        <button
                          disabled={saving}
                          type="submit"
                          className="min-h-11 rounded-lg bg-brand-800 px-5 text-base font-bold text-white hover:bg-brand-700 disabled:opacity-60"
                        >
                          {saving ? tr("Saving…") : tr("Save changes")}
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </Card>
              <Card className="settings-danger mt-5 p-5 sm:p-6">
                <h3 className="m-0 text-base font-bold text-risk-high">
                  {tr("Delete account")}
                </h3>
                <p className="mb-3 mt-1 text-base leading-6 text-muted">
                  {tr(
                    "This action is permanent. Contact support if you need help with your account first.",
                  )}
                </p>
                {deletePrompt ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-base text-muted">
                      {tr("Account deletion requires support confirmation.")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletePrompt(false)}
                      className="min-h-10 rounded-lg border border-line bg-surface px-3 text-base font-semibold text-brand-800"
                    >
                      {tr("Cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletePrompt(true)}
                    className="min-h-10 rounded-lg settings-danger-button border bg-surface px-3 text-base font-semibold text-risk-high hover:bg-[#fff6f7]"
                  >
                    {tr("Delete account")}
                  </button>
                )}
              </Card>
            </section>
          ) : null}
          {active === "appearance" ? (
            <section aria-labelledby="appearance-heading">
              <div className="mb-4">
                <h2
                  id="appearance-heading"
                  className="m-0 text-xl font-bold text-ink"
                >
                  {tr("Display & Appearance")}
                </h2>
                <p className="mb-0 mt-1 text-base text-muted">
                  {tr("Choose how BanteayDigital looks on this device.")}
                </p>
              </div>
              <Card className="p-5 sm:p-6">
                <fieldset className="min-w-0 border-0 p-0">
                  <legend className="text-base font-semibold text-ink">
                    {tr("Theme")}
                  </legend>
                  <p className="mb-0 mt-1 text-sm text-muted">
                    {tr("Your preference is saved automatically.")}
                  </p>
                  <div className="mt-4 grid auto-cols-[minmax(210px,82%)] snap-x grid-flow-col gap-3 overflow-x-auto pb-2 no-scrollbar sm:auto-cols-auto sm:grid-flow-row sm:grid-cols-3 sm:overflow-visible sm:pb-0">
                    {themes.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setThemePreference(option.id);
                          setTheme(option.id);
                        }}
                        className={`settings-theme-option snap-start rounded-xl border p-3 text-left transition ${theme === option.id ? "border-brand-700 bg-brand-100 shadow-sm" : "border-line bg-surface hover:border-[#b8c8d9]"}`}
                        aria-pressed={theme === option.id}
                      >
                        <span
                          aria-hidden="true"
                          className={`settings-theme-preview settings-theme-preview--${option.id} mb-4 block h-20 rounded-lg border p-3 sm:h-24`}
                        >
                          <span className="settings-preview-accent block h-2 w-1/2 rounded" />
                          <span className="mt-2 settings-preview-line block h-2 w-full rounded" />
                          <span className="mt-1 settings-preview-line block h-2 w-3/4 rounded" />
                        </span>
                        <span className="flex items-center justify-between gap-2">
                          <strong className="text-base text-ink">
                            {tr(option.title)}
                          </strong>
                          <span
                            aria-hidden="true"
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${theme === option.id ? "border-brand-800 bg-brand-800 text-white" : "border-line"}`}
                          >
                            {theme === option.id ? (
                              <Icon name="check" size={12} />
                            ) : null}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm text-muted">
                          {tr(option.description)}
                        </span>
                      </button>
                    ))}
                  </div>
                </fieldset>
              </Card>
            </section>
          ) : null}
          {active === "support" ? (
            <section aria-labelledby="support-heading">
              <div className="mb-4">
                <h2
                  id="support-heading"
                  className="m-0 text-xl font-bold text-ink"
                >
                  {tr("Help & Support")}
                </h2>
                <p className="mb-0 mt-1 text-base text-muted">
                  {tr("Find guidance and get the help you need.")}
                </p>
              </div>
              <Card className="overflow-hidden p-2 sm:p-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  {supportItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="group flex min-h-20 items-start gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-line hover:bg-canvas sm:px-4"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-800">
                        <Icon name={item.icon} size={17} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-base text-ink">
                          {tr(item.title)}
                        </strong>
                        <small className="mt-1 block text-sm leading-5 text-muted">
                          {tr(item.description)}
                        </small>
                      </span>
                      <Icon
                        name="chevron"
                        size={18}
                        className="mt-2 shrink-0 text-brand-800 transition group-hover:translate-x-0.5"
                      />
                    </Link>
                  ))}
                </div>
              </Card>
            </section>
          ) : null}
        </div>
      </div>
    </main>
  );
}
