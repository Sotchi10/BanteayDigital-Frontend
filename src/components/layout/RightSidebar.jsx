import { Badge, Card, Icon, SectionHeader } from "../ui";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const guidanceByRoute = (t) => ({
  "/analysis": {
    title: t("rightSidebar.beforeCheck"),
    icon: "shield",
    items: [
      t("rightSidebar.beforeCheckOne"),
      t("rightSidebar.beforeCheckTwo"),
      t("rightSidebar.beforeCheckThree"),
    ],
  },
  "/report": {
    title: t("rightSidebar.reportIncludes"),
    icon: "edit",
    items: [
      t("rightSidebar.reportOne"),
      t("rightSidebar.reportTwo"),
      t("rightSidebar.reportThree"),
    ],
  },
});

const alertGuidance = (t) => ({
  title: t("rightSidebar.whenAlert"),
  icon: "alert",
  action: { label: t("rightSidebar.checkMessage"), to: "/analysis" },
  items: [
    t("rightSidebar.alertOne"),
    t("rightSidebar.alertTwo"),
    t("rightSidebar.alertThree"),
  ],
});

function GuidanceCard({ guidance }) {
  return (
    <Card className="w-full shrink-0 p-4 shadow-none">
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

export function UsefulResourcesCard() {
  const { t } = useTranslation();
  const resources = [
    {
      label: t("rightSidebar.checkMessage"),
      detail: t("rightSidebar.quickCheck"),
      to: "/analysis",
      icon: "shield",
    },
    {
      label: t("rightSidebar.verifiedAlerts"),
      detail: t("rightSidebar.reviewWarnings"),
      to: "/alerts",
      icon: "alert",
    },
    {
      label: t("rightSidebar.analyzeBeforeReport"),
      detail: t("rightSidebar.checkFirst"),
      to: "/analysis",
      icon: "shield",
    },
  ];

  return (
    <Card className="w-full shrink-0 p-4 shadow-none">
      <SectionHeader title={t("rightSidebar.usefulResources")} action={null} />
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
  const { t } = useTranslation();
  return (
    <Card className="w-full shrink-0 border-[#cbdcf0] bg-[#f7fbff] p-4 shadow-none">
      <h2 className="m-0 text-base font-bold text-ink">{t("rightSidebar.needHelp")}</h2>
      <p className="mb-3 mt-1 text-sm leading-relaxed text-[#40546b]">
        {t("rightSidebar.helpDetail")}
      </p>
      <Link
        to="/analysis"
        className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand-800 px-3 text-sm font-bold text-white hover:bg-brand-700"
      >
        <Icon name="shield" size={17} />
        {t("rightSidebar.analyzeContent")}
      </Link>
    </Card>
  );
}

function RiskLevelCard() {
  const { t } = useTranslation();
  const levels = [
    { risk: t("rightSidebar.high"), tone: "high", detail: t("rightSidebar.highDetail") },
    { risk: t("rightSidebar.medium"), tone: "medium", detail: t("rightSidebar.mediumDetail") },
    { risk: t("rightSidebar.low"), tone: "low", detail: t("rightSidebar.lowDetail") },
  ];

  return (
    <Card className="w-full shrink-0 p-4 shadow-none">
      <SectionHeader title={t("rightSidebar.riskLevels")} action={null} />
      <ul className="m-0 grid list-none gap-2.5 p-0">
        {levels.map((level) => (
          <li
            key={level.risk}
            className="flex items-center justify-between gap-3"
          >
            <Badge tone={level.tone}>{level.risk}</Badge>
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
  const { t } = useTranslation();
  const guidance = guidanceByRoute(t)[pathname];
  const isCommunity = pathname === "/" || pathname.startsWith("/posts/") || pathname.startsWith("/community");
  const isAlerts = pathname.startsWith("/alerts");

  const content = guidance ? (
    <>
      <RiskLevelCard />
      <GuidanceCard guidance={guidance} />
    </>
  ) : isAlerts ? (
    <>
      <GuidanceCard guidance={alertGuidance(t)} />
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
    <aside className="hidden self-start xl:sticky xl:top-[84px] xl:min-h-[calc(100vh-100px)] xl:flex xl:flex-col xl:gap-3">
      {content}
    </aside>
  );
}
