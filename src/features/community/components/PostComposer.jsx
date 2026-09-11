import { Icon } from "../../../components/ui";

export function PostComposer({ value, onChange }) {
  return (
    <label className="flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 text-muted shadow-[var(--shadow-card)] focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-[#d9ebfa]">
      <Icon name="search" size={19} />
      <span className="sr-only">Search community reports</span>
      <input
        className="h-12 w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#718096]"
        placeholder="Search phone numbers, account names, links, or keywords"
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
