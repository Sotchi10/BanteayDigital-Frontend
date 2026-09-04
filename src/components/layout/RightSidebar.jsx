import { Badge, Card, Icon, SectionHeader } from "../ui";
import { recentAlerts, statistics, trendingScams } from "../../data/mockCommunity";

export function RightSidebar() {
  const reports = statistics.find((item) => item.label === "Reports")?.value;
  const verified = statistics.find((item) => item.label === "Verified")?.value;
  return (
    <aside className="sticky top-[88px] hidden self-start flex-col gap-4 xl:flex" aria-label="Community safety overview">
      <Card className="p-4">
        <SectionHeader title="Trending scam types" action={null} />
        <div className="grid gap-3">{trendingScams.slice(0, 4).map((item) => <div key={item.label}><div className="mb-1.5 flex justify-between gap-3 text-xs text-[#52647a]"><span>{item.label}</span><strong>{item.value}%</strong></div><span className="block h-1.5 overflow-hidden rounded-full bg-[#e8edf3]"><span className="block h-full rounded-full bg-brand-800" style={{ width: `${item.value}%` }} /></span></div>)}</div>
      </Card>
      <Card className="p-4">
        <SectionHeader title="Recent verified alerts" action="View alerts" />
        <ul className="m-0 grid list-none gap-3 p-0">{recentAlerts.map((alert) => <li key={alert.title} className="border-b border-line pb-3 last:border-0 last:pb-0"><Badge tone={alert.risk.toLowerCase()}><Icon name="alert" size={13} />{alert.risk} risk</Badge><p className="mb-0.5 mt-2 text-xs font-semibold leading-relaxed text-ink">{alert.title}</p><small className="text-xs text-muted">{alert.time}</small></li>)}</ul>
      </Card>
      <Card className="p-4">
        <SectionHeader title="Community impact" action={null} />
        <div className="grid grid-cols-2 gap-3"><div><strong className="block text-xl text-brand-900">{reports}</strong><span className="text-xs text-muted">Reports shared</span></div><div><strong className="block text-xl text-[#14866d]">{verified}</strong><span className="text-xs text-muted">Alerts verified</span></div></div>
        <p className="mb-0 mt-3 border-t border-line pt-3 text-xs leading-relaxed text-muted">Every verified report helps the community recognise scams sooner.</p>
      </Card>
    </aside>
  );
}
