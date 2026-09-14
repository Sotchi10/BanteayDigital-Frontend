import { useEffect, useState } from "react";
import { Badge, Card, Icon, SectionHeader } from "../ui";
import { Link, useLocation } from "react-router-dom";

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

function GuidanceCard({ guidance }) {
  return (
    <Card className="w-full shrink-0 p-4">
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
          <Icon name={guidance.icon} size={18} />
        </span>
        <h2 className="m-0 text-base font-bold text-ink">{guidance.title}</h2>
      </div>
      <ul className="m-0 grid list-none gap-3 p-0">
        {guidance.items.map((item) => (
          <li
            key={item}
            className="flex items-start gap-2.5 text-sm leading-5 text-muted"
          >
            <Icon
              name="check"
              size={16}
              className="mt-0.5 shrink-0 text-risk-low"
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      {guidance.action ? (
        <Link
          to={guidance.action.to}
          className="mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand-100 px-3 text-sm font-bold text-brand-800 hover:bg-[#dceaff]"
        >
          {guidance.action.label}
        </Link>
      ) : null}
    </Card>
  );
}

function UsefulResourcesCard() {
  const resources = [
    {
      label: "Check a suspicious message",
      detail: "Run a quick safety check",
      to: "/analysis",
      icon: "shield",
    },
    {
      label: "Verified safety alerts",
      detail: "Review current warnings",
      to: "/alerts",
      icon: "alert",
    },
    {
      label: "Analyze before reporting",
      detail: "Check suspicious content first",
      to: "/analysis",
      icon: "shield",
    },
  ];

  return (
    <Card className="w-full shrink-0 p-4">
      <SectionHeader title="Useful Resources" action={null} />
      <div className="grid divide-y divide-line">
        {resources.map((resource) => (
          <Link
            key={resource.label}
            to={resource.to}
            className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f2f5f8] text-brand-800">
              <Icon name={resource.icon} size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block text-sm text-[#40546b]">
                {resource.label}
              </strong>
              <small className="block text-xs text-muted">
                {resource.detail}
              </small>
            </span>
            <Icon
              name="chevron"
              size={16}
              className="shrink-0 text-brand-800"
            />
          </Link>
        ))}
      </div>
    </Card>
  );
}

function NeedHelpCard() {
  return (
    <Card className="w-full shrink-0 border-[#cbdcf0] bg-[#f7fbff] p-4">
      <h2 className="m-0 text-base font-bold text-ink">Need help?</h2>
      <p className="mb-3 mt-1 text-sm leading-relaxed text-[#40546b]">
        Start with a quick safety check before deciding whether to report.
      </p>
      <Link
        to="/analysis"
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-800 px-3 text-sm font-bold text-white hover:bg-brand-700"
      >
        <Icon name="shield" size={17} />
        Analyze suspicious content
      </Link>
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
        {levels.map((level) => (
          <li
            key={level.risk}
            className="flex items-center justify-between gap-3"
          >
            <Badge tone={level.risk.toLowerCase()}>{level.risk}</Badge>
            <span className="text-right text-xs text-muted">
              {level.detail}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

export function RightSidebar() {
  const { pathname } = useLocation();
  const guidance = guidanceByRoute[pathname];
  const isCommunity = pathname === "/" || pathname.startsWith("/community");
  const isAlerts = pathname.startsWith("/alerts");

  const content = guidance ? (
    <>
      <RiskLevelCard />
      <GuidanceCard guidance={guidance} />
    </>
  ) : isAlerts ? (
    <>
      <GuidanceCard guidance={alertGuidance} />
      {/*<TrendingScamsCard />*/}
    </>
  ) : isCommunity ? (
    <>
      <NeedHelpCard />
    </>
  ) : (
    <>
      <RiskLevelCard />
    </>
  );

  return (
    <aside className="hidden self-start xl:sticky xl:top-[84px] xl:flex xl:flex-col xl:gap-3.5">
      {content}
    </aside>
  );
}
