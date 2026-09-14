import { Icon } from "../../../components/ui";

export function PostComposer({ value, onChange }) {
  return (
    <label className="flex h-11 items-center gap-3 rounded-lg border border-[#dce3ed] px-3 text-[#8390a4]">
      <Icon name="search" size={18} />
      <input
        className="h-full w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#8390a4] placeholder:text-[13px]"
        placeholder="Search scams, users, or keywords..."
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
