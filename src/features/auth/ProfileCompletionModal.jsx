import { useEffect, useState } from "react";
import { useAuth } from "../../state/AuthStore";

const usernamePattern = /^[a-zA-Z0-9_]+$/;

export function ProfileCompletionModal() {
  const { user, updateProfile } = useAuth();
  const needsName = !user?.name?.trim();
  const needsUsername = !user?.username?.trim();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setUsername(user?.username || "");
    setError("");
  }, [user?.id, user?.name, user?.username]);

  if (!user || (!needsName && !needsUsername)) return null;

  const submit = async (event) => {
    event.preventDefault();
    const details = {};
    if (needsName) {
      details.name = name.trim();
      if (!details.name) return setError("Enter your full name.");
    }
    if (needsUsername) {
      details.username = username.trim();
      if (!details.username) return setError("Choose a username.");
      if (
        details.username.length < 3 ||
        !usernamePattern.test(details.username)
      ) {
        return setError(
          "Username must be 3+ letters, numbers, or underscores.",
        );
      }
    }

    setSaving(true);
    setError("");
    try {
      await updateProfile(details);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          requestError.response?.data?.error ||
          "We could not save your profile. Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-70 grid place-items-center bg-[#071a33]/55 p-4"
      role="presentation"
    >
      <section
        aria-labelledby="profile-completion-title"
        aria-modal="true"
        className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-2xl sm:p-6"
        role="dialog"
      >
        <p className="m-0 text-xs font-bold uppercase tracking-widest text-brand-700">
          One quick step
        </p>
        <h2
          id="profile-completion-title"
          className="mb-1 mt-2 text-xl font-bold text-brand-900"
        >
          Complete your profile
        </h2>
        <p className="mb-5 mt-0 text-sm leading-6 text-muted">
          Add the missing details so people can recognize your community
          reports.
        </p>
        <form className="grid gap-4" noValidate onSubmit={submit}>
          {needsName ? (
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Full name
              <input
                autoComplete="name"
                autoFocus
                className="min-h-11 rounded-lg border border-[#cbd8e5] px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]"
                disabled={saving}
                onChange={(event) => {
                  setName(event.target.value);
                  setError("");
                }}
                value={name}
              />
            </label>
          ) : null}
          {needsUsername ? (
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              Username
              <input
                autoComplete="username"
                autoFocus={!needsName}
                className="min-h-11 rounded-lg border border-[#cbd8e5] px-3 text-sm outline-none focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa]"
                disabled={saving}
                onChange={(event) => {
                  setUsername(event.target.value);
                  setError("");
                }}
                placeholder="e.g. banteay_member"
                value={username}
              />
              <span className="text-xs font-normal text-muted">
                Letters, numbers, and underscores only.
              </span>
            </label>
          ) : null}
          {error ? (
            <p
              className="m-0 text-sm font-semibold text-risk-high"
              role="alert"
            >
              {error}
            </p>
          ) : null}
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-800 px-4 text-sm font-bold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
            disabled={saving}
            type="submit"
          >
            {saving ? "Saving…" : "Save and continue"}
          </button>
        </form>
      </section>
    </div>
  );
}
