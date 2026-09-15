import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "../../components/ui";
import { Rith, Leng } from "../../assets";

const members = [
  { name: "Yan Sovanpisoth", initials: "YS", specialization: "software", roles: ["lead", "backend", "ai"], photo: null },
  { name: "Kong Sothearith", initials: "KS", specialization: "software", roles: ["backend", "ai"], photo: Rith },
  { name: "Siv Kimleng", initials: "SK", specialization: "software", roles: ["design", "frontend"], photo: Leng },
  { name: "Kov Cheaching", initials: "KC", specialization: "software", roles: ["rag", "frontend"], photo: null },
  { name: "Rous Sovannmakra", initials: "RS", specialization: "cyber", roles: ["placeholder"], photo: null },
  { name: "Chan Sopheak", initials: "CS", specialization: "cyber", roles: ["placeholder"], photo: null },
  { name: "Gnoeuk Rithykun", initials: "GR", specialization: "business", roles: ["placeholder"], photo: null },
];
const objectives = ["literacy", "recognize", "report", "prevent", "resource"];
const steps = [
  { id: "submit", icon: "upload" },
  { id: "analyze", icon: "search" },
  { id: "guidance", icon: "lightbulb" },
  { id: "report", icon: "users" },
];

function SectionHeading({ number, eyebrow, title, id }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <span aria-hidden="true" className="mt-1 font-mono text-sm font-semibold text-muted">{number}</span>
      <div>
        <p className="m-0 text-sm font-semibold text-brand-800">{eyebrow}</p>
        <h2 id={id} className="mb-0 mt-2 text-2xl font-bold tracking-tight text-ink sm:text-3xl">{title}</h2>
      </div>
    </div>
  );
}

export function AboutPage() {
  const { t } = useTranslation("about");
  return (
    <main id="main-content" className="about-page mx-auto w-full max-w-6xl min-w-0">
      <section aria-labelledby="about-hero-heading" className="about-hero relative isolate overflow-hidden rounded-2xl border border-line px-4 py-8 text-white sm:px-10 sm:py-14 lg:px-12">
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="m-0 text-sm font-semibold text-[#b8d8ff]">{t("label")}</p>
            <h1 id="about-hero-heading" className="mb-4 mt-4 max-w-xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">{t("hero.title")}</h1>
            <p className="m-0 text-xl font-semibold text-[#c9e1ff]">{t("hero.name")}</p>
            <p className="mb-0 mt-4 max-w-xl text-base leading-relaxed text-[#e0ebfa]">{t("hero.description")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/analysis" className="about-primary-action inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg px-5 py-2 text-base font-semibold transition">
                <Icon name="shield" size={18} />{t("hero.action")}
              </Link>
              <a href="#about-team" className="inline-flex min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#8db9ed] px-5 py-2 text-base font-semibold text-white transition hover:bg-white/10">
                <Icon name="users" size={18} />{t("team.label")}
              </a>
            </div>
          </div>
          <div aria-hidden="true" className="relative mx-auto grid aspect-square w-full max-w-[260px] sm:max-w-[300px] place-items-center">
            <div className="absolute inset-3 rounded-full border border-[#7fb8ff]/25" />
            <div className="absolute inset-10 rounded-full border border-dashed border-[#7fb8ff]/40" />
            <div className="about-fortress grid h-36 w-36 place-items-center rounded-3xl border border-[#8dc2ff]/40 bg-[#0c4698]/60 shadow-[0_0_70px_rgb(86_162_255/0.25)]">
              <img src="/BanteayDigitalLogo.svg" alt="" className="h-24 w-24" />
            </div>
            {[{ icon: "message", position: "left-2 top-10" }, { icon: "link", position: "right-0 top-14" }, { icon: "image", position: "bottom-8 left-5" }, { icon: "shield", position: "bottom-5 right-7" }].map(({ icon, position }) => (
              <span key={icon} className={`absolute grid h-12 w-12 place-items-center rounded-xl border border-[#8dc2ff]/40 bg-[#103d76] text-[#cce4ff] ${position}`}><Icon name={icon} size={22} /></span>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="about-problem-heading">
          <SectionHeading number="01" eyebrow={t("problem.label")} title={t("problem.title")} id="about-problem-heading" />
          <p className="m-0 text-base leading-relaxed text-muted">{t("problem.description")}</p>
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface p-5">
            <span className="mt-1 shrink-0 text-risk-medium"><Icon name="alert" size={22} /></span>
            <p className="m-0 text-base leading-relaxed text-ink">{t("problem.challenge")}</p>
          </div>
        </section>
        <section aria-labelledby="about-solution-heading">
          <SectionHeading number="02" eyebrow={t("solution.label")} title={t("solution.title")} id="about-solution-heading" />
          <ul className="m-0 grid list-none gap-5 p-0">
            {[{ id: "analysis", icon: "search" }, { id: "guidance", icon: "lightbulb" }, { id: "community", icon: "users" }].map(({ id, icon }) => (
              <li key={id} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-brand-100 text-brand-800"><Icon name={icon} size={20} /></span>
                <div><h3 className="m-0 text-base font-semibold text-ink">{t(`solution.${id}.title`)}</h3><p className="mb-0 mt-1 text-base leading-relaxed text-muted">{t(`solution.${id}.description`)}</p></div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section aria-labelledby="about-objectives-heading" className="mt-12 rounded-2xl border border-line bg-surface p-6 sm:p-8 lg:mt-16 lg:p-10">
        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div><SectionHeading number="03" eyebrow={t("objectives.label")} title={t("objectives.title")} id="about-objectives-heading" /><p className="m-0 text-base leading-relaxed text-muted">{t("objectives.description")}</p></div>
          <ul className="m-0 grid list-none gap-4 p-0">
            {objectives.map((id) => <li key={id} className="flex items-start gap-3 border-b border-line pb-4 last:border-0 last:pb-0"><span className="mt-1 shrink-0 text-brand-800"><Icon name="check" size={20} /></span><span className="text-base leading-relaxed text-ink">{t(`objectives.${id}`)}</span></li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="about-workflow-heading" className="mt-12 lg:mt-16">
        <SectionHeading number="04" eyebrow={t("workflow.label")} title={t("workflow.title")} id="about-workflow-heading" />
        <ol className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ id, icon }, index) => <li key={id} className="relative rounded-xl border border-line bg-surface p-5">
            <div className="flex items-center justify-between"><span className="grid h-11 w-11 place-items-center rounded-lg bg-brand-100 text-brand-800"><Icon name={icon} size={21} /></span><span aria-hidden="true" className="font-mono text-sm text-muted">0{index + 1}</span></div>
            <h3 className="mb-0 mt-5 text-base font-semibold text-ink">{t(`workflow.${id}.title`)}</h3><p className="mb-0 mt-2 text-base leading-relaxed text-muted">{t(`workflow.${id}.description`)}</p>
            {index < steps.length - 1 ? <span aria-hidden="true" className="absolute -right-4 top-8 z-10 hidden rounded-full border border-line bg-canvas p-1 text-brand-800 lg:block"><Icon name="chevron" size={16} /></span> : null}
          </li>)}
        </ol>
      </section>

      <section id="about-team" aria-labelledby="about-team-heading" className="mt-12 scroll-mt-24 lg:mt-16">
        <SectionHeading number="05" eyebrow={t("team.label")} title={t("team.title")} id="about-team-heading" />
        <p className="mb-6 mt-0 max-w-2xl text-base leading-relaxed text-muted">{t("team.description")}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {members.map((member) => <article key={member.name} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-surface">
            <div role="img" aria-label={t("team.photo", { name: member.name })} className="relative grid aspect-[4/3] place-items-center border-b border-line bg-canvas text-muted">
              <span className="grid h-20 w-20 place-items-center rounded-full border border-line bg-surface"><img src={member.photo} alt={member.initials} size={36} className="rounded-[50%]" /></span>
              <span aria-hidden="true" className="absolute bottom-3 left-4 font-mono text-sm font-semibold">{member.initials}</span>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 lang="en" className="m-0 text-lg font-bold text-ink">{member.name}</h3>
              <p className="mb-0 mt-2 text-sm font-semibold text-brand-800">{t(`team.specializations.${member.specialization}`)}</p>
              <ul className="mb-5 mt-3 grid list-none gap-1 p-0 text-sm leading-relaxed text-muted">{member.roles.map(role => <li key={role}>{t(`team.roles.${role}`)}</li>)}</ul>
              <div className="mt-auto flex gap-2 border-t border-line pt-3">
                {[{ id: "github", icon: "github" }, { id: "portfolio", icon: "globe" }].map(({ id, icon }) => <button key={id} type="button" disabled aria-label={t(`team.${id}`, { name: member.name })} title={t("team.linkPlaceholder")} className="grid h-11 w-11 place-items-center rounded-lg border border-line text-muted disabled:cursor-default"><Icon name={icon} size={19} /></button>)}
              </div>
            </div>
          </article>)}
        </div>
      </section>

      <section aria-labelledby="about-context-heading" className="mb-4 mt-12 flex flex-col gap-5 rounded-2xl border border-line bg-brand-100 p-6 sm:flex-row sm:items-start sm:p-8 lg:mt-16">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand-800"><Icon name="book" size={23} /></span>
        <div><p className="m-0 text-sm font-semibold text-brand-800">{t("context.label")}</p><h2 id="about-context-heading" className="mb-0 mt-2 text-xl font-bold text-ink">{t("context.title")}</h2><p className="mb-0 mt-3 max-w-3xl text-base leading-relaxed text-ink">{t("context.description")}</p></div>
      </section>
    </main>
  );
}
