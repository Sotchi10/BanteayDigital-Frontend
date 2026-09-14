<<<<<<< HEAD
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Icon } from "../../components/ui";

const scamTypes = [
  {
    icon: "users",
    title: "Impersonation Scams",
    description:
      "Scammers pose as banks, delivery services, government offices, or people you trust.",
  },
  {
    icon: "gift",
    title: "Prize & Giveaway Scams",
    description:
      "Unexpected prizes often come with a request for fees, personal details, or an urgent click.",
  },
  {
    icon: "shopping",
    title: "Online Shopping Scams",
    description:
      "Fake shops use attractive prices, copied photos, and deposits for items that never arrive.",
  },
  {
    icon: "briefcase",
    title: "Job Opportunity Scams",
    description:
      "Fake employers promise easy work, then ask for a fee or sensitive account information.",
  },
  {
    icon: "heart",
    title: "Romance Scams",
    description:
      "A new online connection builds trust quickly before asking for money or private information.",
  },
  {
    icon: "trendingUp",
    title: "Investment Scams",
    description:
      "High-return offers use pressure and fake success stories to make risky requests feel safe.",
  },
];

export function CommunityPage() {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const visibleScamTypes = useMemo(
    () =>
      scamTypes.filter(
        (item) =>
          !normalizedQuery ||
          `${item.title} ${item.description}`
            .toLowerCase()
            .includes(normalizedQuery),
      ),
    [normalizedQuery],
  );
  return (
    <main className="min-w-0 px-10" id="main-content">
      
      <label className="mb-4 flex min-h-12 items-center gap-3 rounded-xl border border-line bg-white px-4 text-muted shadow-[var(--shadow-card)] focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-[#d9ebfa]">
        <Icon name="search" size={16} />
        <span className="sr-only">Search scam topics</span>
        <input
          className="h-12 w-full min-w-0 border-0 bg-transparent text-sm text-ink outline-none placeholder:text-[#718096]"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search scam topics, warning signs, or safety advice"
        />
      </label>

      <section aria-labelledby="scam-types-heading">
        <div className="mb-3">
          <h2
            id="scam-types-heading"
            className="m-0 text-lg font-bold text-ink"
          >
            Common scam types in Cambodia
          </h2>
          <p className="mb-0 mt-1 text-sm text-[#40546b]">
            Know the patterns before a scammer has the chance to rush you.
          </p>
        </div>
        {visibleScamTypes.length ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleScamTypes.map((item) => (
              <Card
                key={item.title}
                className="group flex min-h-[186px] flex-col p-4 transition hover:border-[#b8c8d9] hover:shadow-[0_5px_16px_rgb(16_42_67/0.08)]"
              >
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-100 text-brand-800">
                  <Icon name={item.icon} size={19} />
                </span>
                <h3 className="mb-1 mt-3 text-base font-bold text-ink">
                  {item.title}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-[#40546b]">
                  {item.description}
                </p>
                <Link
                  to="/analysis"
                  className="mt-auto inline-flex min-h-9 items-center gap-1.5 pt-3 text-sm font-bold text-brand-800 hover:text-brand-700"
                >
                  Learn more <Icon name="chevron" size={16} />
                </Link>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <h3 className="m-0 text-base font-bold text-ink">
              No matching scam topics
            </h3>
            <p className="mb-0 mt-1 text-sm text-[#40546b]">
              Try a broader search term or clear your search.
            </p>
          </Card>
        )}
      </section>
    </main>
  );
=======
import { CommunityFeed } from './components/CommunityFeed'

export function CommunityPage() {
  return <CommunityFeed />
>>>>>>> ba42e1384dbc5b93e89a796e169e19b415a770a1
}
