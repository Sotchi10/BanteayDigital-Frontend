import { Avatar, Card, Icon, SectionHeader } from "../ui";
import {
  contributors,
  statistics,
  trendingScams,
} from "../../data/mockCommunity";
const tones = {
  red: "bg-[#ffe8eb] text-[#dc4455]",
  blue: "bg-[#e7f0ff] text-[#1764c0]",
  indigo: "bg-[#eceeff] text-[#535bc7]",
  violet: "bg-[#f1eafd] text-[#7d4ac5]",
};
export function RightSidebar() {
  return (
    <aside className="hidden min-h-0 flex-col gap-3.5 overflow-y-auto overscroll-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:flex">
      <Card className="p-3.5">
        <SectionHeader title="Scam statistics" action="This month" />
        <div className="grid grid-cols-2 gap-2">
          {statistics.map((item) => (
            <div
              key={item.label}
              className="flex min-h-14 items-center gap-2 rounded-lg bg-[#f8faff] p-2"
            >
              <span
                className={`grid h-[30px] w-[30px] place-items-center rounded-full ${tones[item.tone]}`}
              >
                <Icon name={item.icon} />
              </span>
              <div>
                <strong className="block text-[15px]">{item.value}</strong>
                <small className="text-[9px] text-[#6c7890]">
                  {item.label}
                </small>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-3.5">
        <SectionHeader title="Trending scam types" />{" "}
        <div className="grid gap-2.5">
          {trendingScams.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-[12px] text-[#4c5c73]">
                <span>{item.label}</span>
                <strong>{item.value}%</strong>
              </div>
              <span className="block h-1 overflow-hidden rounded-full bg-[#eaf0f8]">
                <span
                  className="block h-full rounded-full bg-[#1764c0]"
                  style={{ width: `${item.value}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-3.5">
        <SectionHeader title="Top contributors" />{" "}
        <ol className="m-0 grid list-none gap-3 p-0">
          {contributors.map((person, index) => (
            <li key={person.name} className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-[#8996aa]">
                {index + 1}
              </span>
              <Avatar name={person.name} size="sm" tone="indigo" />
              <strong className="flex-1 text-[12px]">{person.name}</strong>
              <small className="text-[9px] text-[#78869b]">
                {person.count} reports
              </small>
            </li>
          ))}
        </ol>
      </Card>
    </aside>
  );
}
