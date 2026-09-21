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
      className="settings-page mx-auto w-full max-w-[1120px] min-w-0 pb-12 sm:pb-16 lg:px-6 lg:pb-12"
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
      <div className="grid min-w-0 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8">
        <nav
          className="sticky top-16 z-20 -mx-4 min-w-0 max-w-[calc(100%+2rem)] border-b border-line/60 bg-canvas/95 px-4 py-2.5 backdrop-blur-md transition-all sm:-mx-6 sm:max-w-[calc(100%+3rem)] sm:px-6 lg:top-[92px] lg:mx-0 lg:max-w-full lg:self-start lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
          aria-label={tr("Settings navigation")}
        >
          <div className="grid w-full min-w-0 max-w-full grid-cols-3 gap-2 lg:hidden">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={`flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-xs font-semibold transition sm:min-h-11 sm:flex-row sm:gap-2 sm:px-2 sm:text-sm ${
                  active === section.id
                    ? "border-brand-700 bg-brand-100 text-brand-800 shadow-sm dark:border-brand-600 dark:bg-brand-900/40 dark:text-brand-200"
                    : "border-line bg-surface text-ink hover:bg-canvas hover:text-brand-800"
                }`}
                aria-current={active === section.id ? "page" : undefined}
              >
                <Icon name={section.icon} size={16} className="shrink-0" />
                <span className="break-words text-center leading-snug">
                  {tr(section.label)}
                </span>
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
                  className={`flex min-h-12 items-center gap-3 rounded-lg px-3 text-left text-base font-semibold transition ${
                    active === section.id
                      ? "bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200"
                      : "text-ink hover:bg-canvas hover:text-brand-800"
                  }`}
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
                        <p className="m-0 mt-1 text-sm sm:text-base text-muted">
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
                          className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 disabled:opacity-60"
                        />
                      </label>
                      <label className="grid gap-2 text-base font-semibold text-ink">
                        {tr("Username")}
                        <input
                          autoComplete="username"
                          disabled={saving}
                          value={profile.username}
                          onChange={updateField("username")}
                          className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 disabled:opacity-60"
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
                        className="settings-input min-h-11 w-full rounded-lg border border-line bg-surface px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 disabled:opacity-60"
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
                    <div className="mt-6 flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        className="inline-flex min-h-11 items-center justify-center rounded-lg px-2 text-sm sm:text-base font-semibold text-brand-800 transition hover:underline"
                      >
                        {tr("Change password")}
                      </button>
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        {saved ? (
                          <span
                            className="text-center sm:text-left text-sm sm:text-base font-semibold text-risk-low"
                            role="status"
                          >
                            {tr("Changes saved")}
                          </span>
                        ) : null}
                        <button
                          disabled={saving}
                          type="submit"
                          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-800 px-6 text-sm sm:text-base font-bold text-white transition hover:bg-brand-700 disabled:opacity-60"
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
                <p className="mb-4 mt-1 text-sm sm:text-base leading-relaxed text-muted">
                  {tr(
                    "This action is permanent. Contact support if you need help with your account first.",
                  )}
                </p>
                {deletePrompt ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="text-sm sm:text-base text-muted">
                      {tr("Account deletion requires support confirmation.")}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDeletePrompt(false)}
                      className="inline-flex min-h-10 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm sm:text-base font-semibold text-brand-800 hover:bg-canvas"
                    >
                      {tr("Cancel")}
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeletePrompt(true)}
                    className="settings-danger-button inline-flex min-h-10 items-center justify-center rounded-lg border bg-surface px-4 text-sm sm:text-base font-semibold text-risk-high hover:bg-risk-high/10"
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
              <Card className="p-4 sm:p-6">
                <fieldset className="min-w-0 border-0 p-0">
                  <legend className="text-base font-semibold text-ink">
                    {tr("Theme")}
                  </legend>
                  <p className="mb-0 mt-1 text-sm text-muted">
                    {tr("Your preference is saved automatically.")}
                  </p>
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
                    {themes.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          setThemePreference(option.id);
                          setTheme(option.id);
                        }}
                        className={`settings-theme-option group flex w-full flex-row items-center gap-3.5 rounded-xl border p-3 text-left transition-all sm:flex-col sm:items-stretch sm:justify-between sm:p-4 ${
                          theme === option.id
                            ? "border-brand-700 bg-brand-50/70 shadow-sm ring-1 ring-brand-700/30 dark:bg-brand-900/30 dark:border-brand-600 dark:ring-brand-500/30"
                            : "border-line bg-surface hover:border-brand-200 hover:bg-canvas/50"
                        }`}
                        aria-pressed={theme === option.id}
                      >
                        <span
                          aria-hidden="true"
                          className={`settings-theme-preview settings-theme-preview--${option.id} block h-14 w-20 shrink-0 rounded-lg border p-2 sm:mb-3.5 sm:h-24 sm:w-full sm:p-3`}
                        >
                          <span className="settings-preview-accent block h-1.5 w-1/2 rounded sm:h-2" />
                          <span className="settings-preview-line mt-1.5 block h-1.5 w-full rounded sm:mt-2 sm:h-2" />
                          <span className="settings-preview-line mt-1 block h-1.5 w-3/4 rounded sm:h-2" />
                        </span>
                        <div className="min-w-0 flex-1 sm:w-full">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="min-w-0 break-words text-sm font-bold leading-snug text-ink sm:text-base">
                              {tr(option.title)}
                            </strong>
                            <span
                              aria-hidden="true"
                              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors ${
                                theme === option.id
                                  ? "border-brand-800 bg-brand-800 text-white dark:border-brand-600 dark:bg-brand-600"
                                  : "border-line bg-surface"
                              }`}
                            >
                              {theme === option.id ? (
                                <Icon name="check" size={12} />
                              ) : null}
                            </span>
                          </div>
                          <p className="mb-0 mt-0.5 text-xs text-muted leading-relaxed sm:mt-1 sm:text-sm">
                            {tr(option.description)}
                          </p>
                        </div>
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
              <Card className="p-3 sm:p-5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3">
                  {supportItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.to}
                      className="group flex h-full min-h-[72px] min-w-0 items-start gap-3 rounded-xl border border-line/60 bg-surface/80 p-3 transition-all hover:border-brand-300 hover:bg-canvas hover:shadow-xs active:scale-[0.99] sm:items-center sm:gap-3.5 sm:p-4 dark:hover:border-brand-700"
                    >
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-800 transition-colors group-hover:bg-brand-800 group-hover:text-white dark:bg-brand-900/50 dark:text-brand-300 dark:group-hover:bg-brand-700 dark:group-hover:text-white">
                        <Icon name={item.icon} size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <strong className="block text-sm sm:text-base font-bold text-ink leading-snug">
                          {tr(item.title)}
                        </strong>
                        <span className="mt-0.5 block text-xs sm:text-sm text-muted leading-relaxed line-clamp-2">
                          {tr(item.description)}
                        </span>
                      </span>
                      <Icon
                        name="chevron"
                        size={18}
                        className="mt-2 shrink-0 text-brand-800 transition group-hover:translate-x-1 sm:mt-0 dark:text-brand-400"
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
