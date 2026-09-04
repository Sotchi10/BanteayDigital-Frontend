import { Avatar, Badge, Card, Icon } from "../../components/ui";
import { contributors, statistics } from "../../data/mockCommunity";

export function LeaderboardPage() {
  return (
    <main className="min-w-0" id="main-content">
      <div className="mb-5"><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Community recognition</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Top safety contributors</h1><p className="m-0 max-w-2xl text-sm text-muted">Recognising members whose verified reports help others spot scams earlier.</p></div>
      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{statistics.map((item) => <Card key={item.label} className="p-4"><span className="mb-2 grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={item.icon} size={17} /></span><strong className="block text-xl text-brand-900">{item.value}</strong><span className="text-xs text-muted">{item.label}</span></Card>)}</div>
      <Card className="overflow-hidden">
        <div className="border-b border-line bg-[#f8fbff] px-5 py-4"><h2 className="m-0 text-lg font-bold text-brand-900">This month’s leaders</h2><p className="m-0 mt-1 text-sm text-muted">Rankings count reports confirmed by moderators.</p></div>
        <ol className="m-0 list-none divide-y divide-line p-0">{contributors.map((person, index) => <li key={person.name} className="flex items-center gap-3 px-4 py-4 sm:px-5"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${index === 0 ? "bg-[#fff3cf] text-[#966800]" : "bg-[#f2f5f8] text-muted"}`}>{index + 1}</span><Avatar name={person.name} tone="indigo" /><div className="min-w-0 flex-1"><strong className="block truncate text-base">{person.name}</strong><span className="text-xs text-muted">Community contributor</span></div>{index === 0 ? <Badge tone="blue"><Icon name="trophy" size={13} />Top helper</Badge> : null}<div className="text-right"><strong className="block text-lg text-brand-900">{person.count}</strong><span className="text-xs text-muted">verified</span></div></li>)}</ol>
      </Card>
      <div className="mt-4 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-sm text-muted"><Icon name="shield" size={19} className="mt-0.5 shrink-0 text-brand-800" /><p className="m-0"><strong className="block text-ink">Helpful, not competitive</strong>Recognition is based on accurate, privacy-safe reports—not the total number submitted.</p></div>
    </main>
  );
}
