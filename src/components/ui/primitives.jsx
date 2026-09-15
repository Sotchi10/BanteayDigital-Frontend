import { useInterfaceTranslation } from "../../locales/useInterfaceTranslation";
import { Icon } from "./icons";

const avatarSizes = {
  sm: "h-8 w-8 text-xs",
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
      className={`rounded-(--radius-card) border border-line bg-white shadow-[var(--shadow-card)] ${className}`}
    >
      {children}
    </section>
  );
}
export function Avatar({ name, imageUrl, size = "md", tone = "blue" }) {
  const tr = useInterfaceTranslation();
  const displayName = typeof name === "string" && name.trim() ? name.trim() : tr("User");
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold text-white ${avatarSizes[size]} ${avatarTones[tone]}`}
      aria-label={tr("{{value1}}'s profile", { value1: displayName })}
    >
      {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full rounded-full object-cover" /> : initials}
    </span>
  );
}
export function Badge({ children, tone = "neutral", className = "" }) {
  return (
    <span
      className={`type-badge inline-flex min-h-6 w-max items-center gap-1 rounded-full px-2.5 py-1 ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
export function IconButton({ label, icon, badge, className = "" }) {
  const tr = useInterfaceTranslation();
  return (
    <button
      className={`relative inline-grid h-11 w-11 shrink-0 place-items-center rounded-full border-0 bg-transparent text-[#52647a] transition hover:bg-brand-100 hover:text-brand-800 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      type="button"
      aria-label={tr(label)}
    >
      <Icon name={icon} />
      {badge ? (
        <span className="type-badge absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[#d92d3a] px-1 text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}
export function SectionHeader({ title, action = "See all" }) {
  const tr = useInterfaceTranslation();
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <h2 className="type-section-title m-0 text-ink text-sm">{tr(title)}</h2>
      {action ? (
        <button
          type="button"
          className="type-button min-h-11 border-0 bg-transparent p-0 text-brand-800 hover:text-brand-700"
        >
          {tr(action)}
        </button>
      ) : null}
    </div>
  );
}
