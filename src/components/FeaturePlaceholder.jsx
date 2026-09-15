import { useInterfaceTranslation } from "../locales/useInterfaceTranslation";
import { Card, Icon } from './ui'

export function FeaturePlaceholder({ icon, eyebrow, title, description }) {
  const tr = useInterfaceTranslation();
  return (
    <main className="grid min-h-0 place-items-start pt-5 lg:overflow-y-auto lg:pt-12">
      <Card className="w-full p-10 text-center">
        <span className="inline-grid h-[58px] w-[58px] place-items-center rounded-2xl bg-[#eaf2ff] text-[#1764c0]">
          <Icon name={icon} size={28} />
        </span>
        <p className="mb-1 mt-4 text-xs font-bold uppercase tracking-wide text-[#1764c0]">
          {tr(eyebrow)}
        </p>
        <h1 className="m-0 text-2xl font-bold">{tr(title)}</h1>
        <p className="mx-auto my-3 max-w-md text-sm leading-relaxed text-[#6c7890]">
          {tr(description)}
        </p>
        <button className="rounded-lg border-0 bg-[#1764c0] px-4 py-2.5 text-sm font-bold text-white">{tr("Coming soon")}</button>
      </Card>
    </main>
  );
}
