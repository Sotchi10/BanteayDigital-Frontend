import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Icon } from "../../components/ui";
import { recentAlerts } from "../../data/mockCommunity";

const filters = ["All", "High", "Medium"];

export function AlertsPage() {
  const [filter, setFilter] = useState("All");
  const [readAlerts, setReadAlerts] = useState([]);
  const alerts = useMemo(() => filter === "All" ? recentAlerts : recentAlerts.filter((alert) => alert.risk === filter), [filter]);

  return (
    <main className="min-w-0" id="main-content">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">Safety updates</p><h1 className="mb-1 mt-1 text-2xl font-bold text-brand-900">Verified alerts</h1><p className="m-0 max-w-xl text-sm text-muted">Review recent threats confirmed by moderators and act before sharing information or money.</p></div><Link to="/report" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-brand-800 hover:bg-brand-100"><Icon name="edit" size={17} />Report something similar</Link></div>
      <div className="mb-4 flex gap-2" role="group" aria-label="Filter alerts">{filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${filter === item ? "border-brand-800 bg-brand-800 text-white" : "border-line bg-white text-muted hover:text-brand-800"}`}>{item}{item !== "All" ? " risk" : " alerts"}</button>)}</div>
      <div className="grid gap-3">{alerts.map((alert, index) => {
        const id = `${alert.title}-${alert.time}`;
        const isRead = readAlerts.includes(id);
        return <Card key={id} className={`p-5 transition ${isRead ? "opacity-70" : "border-l-4 border-l-brand-700"}`}><article><div className="flex flex-wrap items-center justify-between gap-3"><Badge tone={alert.risk.toLowerCase()}><Icon name="alert" size={13} />{alert.risk} risk</Badge><span className="text-sm text-muted">{alert.time}</span></div><h2 className="mb-1 mt-3 text-lg font-bold text-brand-900">{alert.title}</h2><p className="m-0 text-sm leading-relaxed text-muted">{index === 0 ? "Do not use links in unexpected bank messages. Open the official banking app or call the number on your card." : index === 1 ? "Be cautious of guaranteed returns, urgent deposits, and requests to move conversations to private messaging apps." : "Verify delivery requests through the seller’s official website before paying any additional fee."}</p><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3"><Link to="/analysis" className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-brand-100 px-3 text-sm font-bold text-brand-800"><Icon name="shield" size={16} />Check a similar message</Link><button type="button" onClick={() => setReadAlerts((current) => isRead ? current.filter((item) => item !== id) : [...current, id])} className="min-h-10 rounded-lg border-0 bg-transparent px-3 text-sm font-semibold text-muted hover:bg-[#f2f5f8] hover:text-brand-800">{isRead ? "Mark as unread" : "Mark as read"}</button></div></article></Card>;
      })}</div>
      {alerts.length === 0 ? <Card className="p-8 text-center"><Icon name="check" size={28} className="mx-auto text-risk-low" /><h2 className="mb-1 mt-3 text-lg">No alerts in this category</h2><p className="m-0 text-sm text-muted">Choose another filter to review recent verified warnings.</p></Card> : null}
    </main>
  );
}
