import { Badge, Card, Icon } from "../ui";
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

const sidebarCardClass = "w-full shrink-0 p-4 shadow-none";

function SidebarCardTitle({ children, className = "" }) {
  return (
    <h2 className={`type-card-title m-0 text-ink ${className}`}>{children}</h2>
  );
}

function GuidanceCard({ guidance }) {
  return (
    <Card className={sidebarCardClass}>
      <div className="mb-3 flex items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-800">
          <Icon name={guidance.icon} size={18} />
        </span>
        <SidebarCardTitle>{guidance.title}</SidebarCardTitle>
      </div>
      <ul className="m-0 grid list-none gap-3 p-0">
        {guidance.items.map((item) => (
          <li
            key={item}
            className="type-helper flex items-start gap-2.5 text-muted"
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
          className="type-button mt-4 inline-flex min-h-10 w-full items-center justify-center rounded-lg bg-brand-100 px-3 text-brand-800 hover:bg-[#dceaff]"
        >
          {guidance.action.label}
        </Link>
      ) : null}
    </Card>
  );
}

function RiskLevelCard() {
  const { t } = useTranslation();
  const levels = [
    {
      risk: t("rightSidebar.high"),
      tone: "high",
      detail: t("rightSidebar.highDetail"),
    },
    {
      risk: t("rightSidebar.medium"),
      tone: "medium",
      detail: t("rightSidebar.mediumDetail"),
    },
    {
      risk: t("rightSidebar.low"),
      tone: "low",
      detail: t("rightSidebar.lowDetail"),
    },
  ];

  return (
    <Card className={sidebarCardClass}>
      <SidebarCardTitle className="mb-3">
        {t("rightSidebar.riskLevels")}
      </SidebarCardTitle>
      <ul className="m-0 grid list-none gap-3 p-0">
        {levels.map((level) => (
          <li
            key={level.risk}
            className="flex items-center justify-between gap-3"
          >
            <Badge tone={level.tone}>{level.risk}</Badge>
            <span className="type-helper text-right text-muted">
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
  ) : (
    <>
      <RiskLevelCard />
    </>
  );

  return (
    <aside className="hidden self-start xl:sticky xl:top-[84px] xl:min-h-[calc(100vh-100px)] xl:flex xl:flex-col xl:gap-4">
      {content}
    </aside>
  );
}
