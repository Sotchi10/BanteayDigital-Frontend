import { Link, useLocation } from "react-router-dom";
import { Badge, Card, Icon, SectionHeader } from "../ui";
import { recentAlerts, statistics, trendingScams } from "../../data/mockCommunity";

const guidanceByRoute = {
  "/analysis": {
    title: "Before you check",
    icon: "shield",
    items: [
      "Remove passwords, OTP codes, and banking details.",
      "Include the complete message or link for better context.",
      "Verify urgent requests through an official contact channel.",
    ],
  },
  "/report": {
    title: "A useful report includes",
    icon: "edit",
    items: [
      "What happened and what the sender requested.",
      "The suspicious account, phone number, or website.",
      "Evidence with names and private details removed.",
    ],
  },
};

const communityGuidance = {
  title: "Share safely",
  icon: "users",
  action: { label: "Share a report", to: "/report" },
  items: [
    "Describe the warning signs without exposing personal details.",
    "Include clear evidence that moderators can review.",
    "Focus on what will help others avoid the same scam.",
  ],
};

const alertGuidance = {
  title: "When you receive an alert",
  icon: "alert",
  action: { label: "Check a suspicious message", to: "/analysis" },
  items: [
    "Pause and avoid links, payments, or urgent requests.",
    "Verify the message through the organisation's official channel.",
    "Warn people who may have received the same message.",
  ],
};

function TrendingScamsCard() {
  return (
    <Card className="w-full shrink-0 p-4">
      <SectionHeader title="Trending scam types" action={null} />
      <div className="grid gap-2">
        {trendingScams.slice(0, 4).map((item) => (
          <div key={item.label}>
            <div className="mb-1 flex justify-between gap-3 text-sm leading-5 text-[#52647a]"><span>{item.label}</span><strong>{item.value}%</strong></div>
            <span className="block h-1.5 overflow-hidden rounded-full bg-[#e8edf3]" role="meter" aria-label={`${item.label}: ${item.value}%`} aria-valuenow={item.value} aria-valuemin="0" aria-valuemax="100"><span className="block h-full rounded-full bg-brand-800" style={{ width: `${item.value}%` }} /></span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function RecentAlertsCard() {
  return (
    <Card className="w-full shrink-0 p-4">
      <div className="mb-2 flex min-h-9 items-center justify-between gap-3"><h2 className="m-0 text-base font-bold text-ink">Recent verified alerts</h2><Link to="/alerts" className="shrink-0 text-sm font-semibold text-brand-800 hover:text-brand-700">View alerts</Link></div>
      <ul className="m-0 list-none divide-y divide-line p-0">
        {recentAlerts.map((alert) => (
          <li key={alert.title} className="py-2.5 first:pt-0 last:pb-0">
            <div className="flex items-center justify-between gap-2"><Badge tone={alert.risk.toLowerCase()}><Icon name="alert" size={13} />{alert.risk} risk</Badge><small className="shrink-0 text-xs text-muted">{alert.time}</small></div>
            <p className="mb-0 mt-1.5 text-sm font-semibold leading-5 text-ink">{alert.title}</p>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function CommunityImpactCard() {
  const reports = statistics.find((item) => item.label === "Reports")?.value;
  const verified = statistics.find((item) => item.label === "Verified")?.value;

  return (
    <Card className="w-full shrink-0 p-4">
      <SectionHeader title="Community impact" action={null} />
      <div className="grid grid-cols-2 gap-4"><div><strong className="block text-2xl leading-tight text-brand-900">{reports}</strong><span className="text-sm text-muted">Reports shared</span></div><div><strong className="block text-2xl leading-tight text-[#14866d]">{verified}</strong><span className="text-sm text-muted">Alerts verified</span></div></div>
    </Card>
  );
}

function GuidanceCard({ guidance }) {
  return (
    <Card className="w-full shrink-0 p-4">
      <div className="mb-3 flex items-center gap-2.5"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800"><Icon name={guidance.icon} size={18} /></span><h2 className="m-0 text-base font-bold text-ink">{guidance.title}</h2></div>
      <ul className="m-0 grid list-none gap-3 p-0">
        {guidance.items.map((item) => <li key={item} className="flex items-start gap-2.5 text-sm leading-5 text-muted"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-risk-low" /><span>{item}</span></li>)}
      </ul>
      {guidance.action ? <Link to={guidance.action.to} className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand-100 px-3 text-sm font-bold text-brand-800 hover:bg-[#dceaff]">{guidance.action.label}</Link> : null}
    </Card>
  );
}

function VerificationProcessCard() {
  const steps = ["Report submitted", "Evidence reviewed", "Warning verified"];

  return (
    <Card className="w-full shrink-0 p-4">
      <SectionHeader title="How verification works" action={null} />
      <ol className="m-0 grid list-none gap-0 p-0">
        {steps.map((step, index) => <li key={step} className="flex items-center gap-3 border-b border-line py-2.5 first:pt-0 last:border-0 last:pb-0"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-800">{index + 1}</span><span className="text-sm font-semibold text-[#40546b]">{step}</span></li>)}
      </ol>
    </Card>
  );
}

function RiskLevelCard() {
  const levels = [
    { risk: "High", detail: "Act now and stop contact" },
    { risk: "Medium", detail: "Use caution and verify" },
    { risk: "Low", detail: "Stay aware and monitor" },
  ];

  return (
    <Card className="w-full shrink-0 p-4">
      <SectionHeader title="Understanding risk levels" action={null} />
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {levels.map((level) => <li key={level.risk} className="flex items-center justify-between gap-3"><Badge tone={level.risk.toLowerCase()}>{level.risk}</Badge><span className="text-right text-xs text-muted">{level.detail}</span></li>)}
      </ul>
    </Card>
  );
}

export function RightSidebar() {
  const { pathname } = useLocation();
  const showTrending = pathname === "/";
  const showRecentAlerts = pathname === "/";
  const showCommunityImpact = ["/", "/leaderboard"].includes(pathname);
  const guidance = guidanceByRoute[pathname];

  return (
    <aside className="hidden h-full min-h-0 w-full self-start flex-col gap-4 overflow-hidden [&_h2]:text-base xl:flex" aria-label="Page information">
      {showTrending ? <TrendingScamsCard /> : null}
      {showRecentAlerts ? <RecentAlertsCard /> : null}
      {showCommunityImpact ? <CommunityImpactCard /> : null}
      {pathname === "/community" ? <><GuidanceCard guidance={communityGuidance} /><VerificationProcessCard /></> : null}
      {pathname === "/alerts" ? <><GuidanceCard guidance={alertGuidance} /><RiskLevelCard /></> : null}
      {guidance ? <GuidanceCard guidance={guidance} /> : null}
    </aside>
  );
}
