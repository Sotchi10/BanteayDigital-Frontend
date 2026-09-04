import { Badge, Card, Icon, SectionHeader } from "../ui";
import { recentAlerts, statistics, trendingScams } from "../../data/mockCommunity";

export function RightSidebar() {
  const reports = statistics.find((item) => item.label === "Reports")?.value;
  const verified = statistics.find((item) => item.label === "Verified")?.value;
  return (
    <aside className="sticky top-[92px] hidden w-full self-start flex-col gap-[18px] xl:flex" aria-label="Community safety overview">
      <Card className="w-full p-4">
        <SectionHeader title="Trending scam types" action={null} />
        <div className="grid gap-2">{trendingScams.slice(0, 4).map((item) => <div key={item.label}><div className="mb-1 flex justify-between gap-3 text-xs text-[#52647a]"><span>{item.label}</span><strong>{item.value}%</strong></div><span className="block h-1.5 overflow-hidden rounded-full bg-[#e8edf3]"><span className="block h-full rounded-full bg-brand-800" style={{ width: `${item.value}%` }} /></span></div>)}</div>
      </Card>
      <Card className="w-full p-4">
        <SectionHeader title="Recent verified alerts" action="View alerts" />
        <ul className="m-0 grid list-none gap-2 p-0">{recentAlerts.map((alert) => <li key={alert.title} className="border-b border-line pb-2 last:border-0 last:pb-0"><div className="flex items-center justify-between gap-2"><Badge tone={alert.risk.toLowerCase()}><Icon name="alert" size={13} />{alert.risk} risk</Badge><small className="shrink-0 text-xs text-muted">{alert.time}</small></div><p className="mb-0 mt-1 text-xs font-semibold leading-relaxed text-ink">{alert.title}</p></li>)}</ul>
      </Card>
      <Card className="w-full p-4">
        <SectionHeader title="Community impact" action={null} />
        <div className="grid grid-cols-2 gap-3"><div><strong className="block text-xl text-brand-900">{reports}</strong><span className="text-xs text-muted">Reports shared</span></div><div><strong className="block text-xl text-[#14866d]">{verified}</strong><span className="text-xs text-muted">Alerts verified</span></div></div>
      </Card>
    </aside>
  );
}
