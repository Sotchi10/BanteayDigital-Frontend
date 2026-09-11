import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, Card, Icon } from "../../components/ui";
import { currentUser } from "../../data/mockCommunity";

const sections = [
  { id: "account", label: "Account & Profile", icon: "user" },
  { id: "appearance", label: "Display & Appearance", icon: "settings" },
  { id: "support", label: "Help & Support", icon: "help" },
];

const supportItems = [
  { title: "How BanteayDigital works", description: "Learn how the community helps identify scams.", icon: "book", to: "/about" },
  { title: "How scam analysis works", description: "Understand the warning signs used in a safety check.", icon: "shield", to: "/analysis" },
  { title: "How reporting works", description: "See how analyzed encounters become reports.", icon: "edit", to: "/analysis" },
  { title: "FAQ", description: "Answers to common questions about safety and reporting.", icon: "help", to: "/about" },
  { title: "Contact support", description: "Get help from the BanteayDigital support team.", icon: "message", to: "mailto:support@banteaydigital.org" },
  { title: "Community guidelines", description: "Help keep the community respectful and useful.", icon: "users", to: "/community" },
  { title: "Privacy Policy", description: "Learn how we handle your information.", icon: "lock", to: "/about" },
  { title: "Terms of Service", description: "Read the terms for using BanteayDigital.", icon: "book", to: "/about" },
];

const themes = [
  { id: "light", title: "Light", description: "Bright and clear", preview: "bg-white" },
  { id: "dark", title: "Dark", description: "Easy on the eyes", preview: "bg-[#15233b]" },
  { id: "system", title: "System default", description: "Match your device", preview: "bg-gradient-to-r from-white to-[#15233b]" },
];

function applyTheme(theme) {
  const resolved = theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : theme;
  document.documentElement.dataset.theme = resolved;
  document.documentElement.style.colorScheme = resolved;
}

export function SettingsPage() {
  const [active, setActive] = useState("account");
  const [theme, setTheme] = useState(() => localStorage.getItem("banteay-theme") || "system");
  const [profile, setProfile] = useState({ name: currentUser.name, username: currentUser.handle, email: "sreynich@example.com" });
  const [saved, setSaved] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);

  useEffect(() => { applyTheme(theme); localStorage.setItem("banteay-theme", theme); }, [theme]);
  const updateProfile = (key) => (event) => { setProfile((current) => ({ ...current, [key]: event.target.value })); setSaved(false); };
  const selectTheme = (nextTheme) => { setTheme(nextTheme); };

  return <main className="settings-page mx-auto w-full max-w-[1100px] min-w-0" id="main-content"><header className="mb-6"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Your preferences</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900 sm:text-3xl">Settings</h1><p className="m-0 text-sm text-muted">Manage your profile, appearance, and support resources.</p></header>
    <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-7"><nav className="lg:sticky lg:top-5 lg:self-start" aria-label="Settings navigation"><Card className="p-2"><p className="mb-2 mt-2 px-3 text-xs font-bold uppercase tracking-[0.1em] text-muted">Settings</p><div className="grid gap-1">{sections.map((section) => <button key={section.id} type="button" onClick={() => setActive(section.id)} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-semibold transition ${active === section.id ? "bg-brand-100 text-brand-800" : "text-[#52647a] hover:bg-[#f2f5f8] hover:text-brand-800"}`} aria-current={active === section.id ? "page" : undefined}><Icon name={section.icon} size={17} />{section.label}</button>)}</div></Card></nav>
      <div className="min-w-0">{active === "account" ? <section aria-labelledby="account-heading"><div className="mb-4"><h2 id="account-heading" className="m-0 text-xl font-bold text-brand-900">Account &amp; Profile</h2><p className="mb-0 mt-1 text-sm text-muted">Keep your account information current.</p></div><Card className="p-5 sm:p-6"><form onSubmit={(event) => { event.preventDefault(); setSaved(true); }}><div className="flex flex-wrap items-center gap-4 border-b border-line pb-5"><Avatar name={profile.name || "Profile"} size="xl" /><div><h3 className="m-0 text-sm font-bold text-ink">Profile picture</h3><p className="mb-0 mt-1 text-sm text-muted">Your initials are shown until photo uploads are available.</p></div><button type="button" className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-brand-800 hover:bg-brand-100">Change picture</button></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="grid gap-1.5 text-sm font-bold text-ink">Full name<input value={profile.name} onChange={updateProfile("name")} className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" /></label><label className="grid gap-1.5 text-sm font-bold text-ink">Username<input value={profile.username} onChange={updateProfile("username")} className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" /></label></div><label className="mt-4 grid gap-1.5 text-sm font-bold text-ink">Email<input type="email" value={profile.email} onChange={updateProfile("email")} className="min-h-11 rounded-lg border border-line bg-white px-3 text-base font-normal outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]" /></label><div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5"><button type="button" className="min-h-10 px-1 text-sm font-semibold text-brand-800 hover:underline">Change password</button><div className="flex items-center gap-3">{saved ? <span className="text-sm font-semibold text-risk-low" role="status">Changes saved</span> : null}<button type="submit" className="min-h-11 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700">Save changes</button></div></div></form></Card><Card className="mt-5 border-[#f3c9cf] p-5"><h3 className="m-0 text-sm font-bold text-risk-high">Delete account</h3><p className="mb-3 mt-1 text-sm leading-6 text-muted">This action is permanent. Contact support if you need help with your account first.</p>{deletePrompt ? <div className="flex flex-wrap items-center gap-3"><span className="text-sm text-muted">Account deletion requires support confirmation.</span><button type="button" onClick={() => setDeletePrompt(false)} className="min-h-10 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-brand-800">Cancel</button></div> : <button type="button" onClick={() => setDeletePrompt(true)} className="min-h-10 rounded-lg border border-[#f0bac2] bg-white px-3 text-sm font-semibold text-risk-high hover:bg-[#fff6f7]">Delete account</button>}</Card></section> : null}
      {active === "appearance" ? <section aria-labelledby="appearance-heading"><div className="mb-4"><h2 id="appearance-heading" className="m-0 text-xl font-bold text-brand-900">Display &amp; Appearance</h2><p className="mb-0 mt-1 text-sm text-muted">Choose how BanteayDigital looks on this device.</p></div><Card className="p-5 sm:p-6"><fieldset><legend className="text-sm font-bold text-ink">Theme</legend><div className="mt-4 grid gap-3 sm:grid-cols-3">{themes.map((option) => <button key={option.id} type="button" onClick={() => selectTheme(option.id)} className={`rounded-xl border p-3 text-left transition ${theme === option.id ? "border-brand-700 bg-brand-100 ring-2 ring-[#d9ebfa]" : "border-line bg-white hover:border-[#b8c8d9]"}`} aria-pressed={theme === option.id}><span className={`mb-3 block h-16 rounded-lg border border-[#dce4ed] p-2 ${option.preview}`}><span className="block h-2 w-1/2 rounded bg-brand-700/70" /><span className="mt-2 block h-2 w-full rounded bg-[#dce4ed]" /><span className="mt-1 block h-2 w-3/4 rounded bg-[#dce4ed]" /></span><strong className="block text-sm text-ink">{option.title}</strong><span className="mt-0.5 block text-xs text-muted">{option.description}</span>{theme === option.id ? <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-brand-800"><Icon name="check" size={14} />Active</span> : null}</button>)}</div></fieldset></Card></section> : null}
      {active === "support" ? <section aria-labelledby="support-heading"><div className="mb-4"><h2 id="support-heading" className="m-0 text-xl font-bold text-brand-900">Help &amp; Support</h2><p className="mb-0 mt-1 text-sm text-muted">Find guidance and get the help you need.</p></div><Card className="overflow-hidden"><div className="divide-y divide-line">{supportItems.map((item) => <Link key={item.title} to={item.to} className="flex min-h-20 items-center gap-3 px-5 py-3 transition hover:bg-[#f8fbff] sm:px-6"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-800"><Icon name={item.icon} size={17} /></span><span className="min-w-0 flex-1"><strong className="block text-sm text-ink">{item.title}</strong><small className="mt-0.5 block text-sm text-muted">{item.description}</small></span><Icon name="chevron" size={18} className="shrink-0 text-brand-800" /></Link>)}</div></Card></section> : null}</div>
    </div>
  </main>;
}
