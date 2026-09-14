import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Avatar,
  Badge,
  Card,
  EmptyState,
  ErrorState,
  Icon,
  LoadingState,
} from "../../components/ui";
import { getPublicProfile } from "../../services/profiles";

const assessmentTone = (assessment) =>
  assessment === "STRONG_SCAM_INDICATORS"
    ? "high"
    : assessment === "SUSPICIOUS" || assessment === "CAUTION"
      ? "medium"
      : "low";

const formatDate = (value) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(new Date(value));

export function PublicProfilePage() {
  const { username } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getPublicProfile(username)
      .then((response) => {
        if (active) {
          setProfile(response.profile);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active)
          setError(
            requestError.response?.data?.message ||
              "This profile could not be loaded.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [username]);

  if (loading)
    return (
      <main className="min-w-0" id="main-content">
        <LoadingState message="Loading profile…" />
      </main>
    );
  if (error)
    return (
      <main className="min-w-0" id="main-content">
        <ErrorState title="Profile unavailable" message={error} />
      </main>
    );

  const displayName = profile.name || profile.username;
  return (
    <main className="min-w-0 px-10" id="main-content">
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-brand-900 via-brand-800 to-[#2670c9] sm:h-40" />
        <div className="mt-15 px-5 pb-6 sm:px-7">
          <div className="-mt-9 flex items-end gap-4">
            <Avatar name={displayName} imageUrl={profile.avatarUrl} size="xl" />
            <div className="min-w-0 pb-0.5">
              <h1 className="m-0 truncate text-2xl font-bold text-brand-900">
                {displayName}
              </h1>
              <p className="mb-0 mt-0.5 text-sm font-semibold text-muted">
                @{profile.username}
              </p>
            </div>
          </div>
          <p className="mb-0 mt-5 flex items-center gap-2 text-sm text-muted">
            <Icon name="user" size={16} /> Community member since{" "}
            {formatDate(profile.createdAt)}
          </p>
        </div>
      </Card>

      <section className="mt-7">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-bold uppercase tracking-[0.1em] text-brand-700">
              Community contributions
            </p>
            <h2 className="mb-0 mt-1 text-xl font-bold text-brand-900">
              Reported Scams
            </h2>
          </div>
        </div>
        {profile.reports.length === 0 ? (
          <EmptyState
            icon="shield"
            title="No published reports yet"
            message="Approved community scam reports from this member will appear here."
          />
        ) : (
          <div className="grid gap-4">
            {profile.reports.map((report) => (
              <Card key={report.communityPost.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="m-0 text-lg font-bold text-brand-900">
                      {report.communityPost.title}
                    </h3>
                    <p className="mb-0 mt-1 text-xs text-muted">
                      Published {formatDate(report.communityPost.publishedAt)}
                    </p>
                  </div>
                  {report.scan?.assessment ? (
                    <Badge tone={assessmentTone(report.scan.assessment)}>
                      {report.scan.assessment.replaceAll("_", " ")}
                    </Badge>
                  ) : null}
                </div>
                <p className="mb-0 mt-3 text-sm leading-6 text-[#40546b]">
                  {report.communityPost.summary}
                </p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
