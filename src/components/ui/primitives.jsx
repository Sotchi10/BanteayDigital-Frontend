import { Icon } from "./icons";

const avatarSizes = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  xl: "h-14 w-14 text-base",
};
const avatarTones = { blue: "bg-[#0757a6]", indigo: "bg-[#405b76]" };
const badgeTones = {
  blue: "bg-[#eaf2fb] text-[#0757a6]",
  high: "bg-[#fff0f1] text-[#d92d3a]",
  medium: "bg-[#fff7e6] text-[#b85f00]",
  low: "bg-[#eaf8f3] text-[#14866d]",
  category: "bg-[#f2f5f8] text-[#52647a]",
  neutral: "bg-[#f2f4f7] text-[#667085]",
  ai: "bg-[#f1efff] text-[#6255c7]",
};

export function Card({ className = "", children }) {
  return (
    <section
      className={`rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </section>
  );
}
export function Avatar({ name, size = "md", tone = "blue" }) {
  const displayName = typeof name === "string" && name.trim() ? name.trim() : "User";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ${avatarSizes[size]} ${avatarTones[tone]}`}
      aria-label={`${displayName}'s profile`}
    >
      {initials}
    </span>
  );
}
export function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`inline-flex min-h-6 w-max items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold leading-tight ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
export function IconButton({ label, icon, badge, className = "" }) {
  return (
    <button
      className={`relative inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-[#52647a] transition hover:bg-brand-100 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      type="button"
      aria-label={label}
    >
      <Icon name={icon} />
      {badge ? (
        <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d92d3a] px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
export function SectionHeader({ title, action = "See all" }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="m-0 text-sm font-bold tracking-tight text-ink">{title}</h2>
      {action ? (
        <button
          type="button"
          className="min-h-11 border-0 bg-transparent p-0 text-xs font-semibold text-brand-800 hover:text-brand-700"
        >
          {action}
        </button>
      ) : null}
    </div>
  );
}
