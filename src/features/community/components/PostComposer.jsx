import { Icon } from "../../../components/ui";

export function PostComposer({ value, onChange }) {
  return (
<<<<<<< HEAD
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
=======
    <Card className="p-3">
      <label className="flex h-11 items-center gap-3 rounded-lg border border-[#dce3ed] bg-white px-3 text-[#8390a4] focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-100">
        <Icon name="search" size={18} />
        <input
          className="h-full w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#8390a4]"
          placeholder="Search scams, users, or keywords..."
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </label>
    </Card>
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
  );
}
