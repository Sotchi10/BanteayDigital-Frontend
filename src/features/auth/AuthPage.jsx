import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "../../components/ui";
import { useAuth } from "../../state/AuthStore";
import { useTranslation } from "react-i18next";

const benefits = (t) => [
  {
    icon: "shield",
    title: t("authExtra.benefitAnalyze"),
    text: t("authExtra.benefitAnalyzeDetail"),
  },
  {
    icon: "book",
    title: t("authExtra.benefitLearn"),
    text: t("authExtra.benefitLearnDetail"),
  },
  {
    icon: "users",
    title: t("authExtra.benefitProtect"),
    text: t("authExtra.benefitProtectDetail"),
  },
];

const inputClass =
  "min-h-12 w-full rounded-lg border border-[#cbd8e5] bg-white px-3.5 text-base text-ink outline-none placeholder:text-[#7c899b] transition hover:border-[#9eb9d5] focus:border-brand-700 focus:ring-2 focus:ring-[#d9ebfa] disabled:cursor-wait disabled:opacity-65";

export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
  const authBenefits = benefits(t);
  const isSignUp = location.pathname === "/signup";
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const changeMode = (nextPath) => {
    setError("");
    setRecoveryNotice("");
    navigate(nextPath, { replace: true, state: location.state });
  };
  const submit = async (event) => {
    event.preventDefault();
    const trimmedContact = contact.trim();
    if (!trimmedContact || !password) {
      setError(t("auth.contactRequired"));
      return;
    }
    if (isSignUp && password.length < 8) {
      setError(t("auth.passwordLength"));
      return;
    }
    const payload = trimmedContact.includes("@")
      ? { email: trimmedContact, password }
      : { phoneNumber: trimmedContact, password };
    setLoading(true);
    try {
      if (isSignUp) await signUp(payload);
      else await signIn(payload);
      navigate(location.state?.from || "/", {
        replace: true,
        state: location.state?.returnState,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.response?.data?.error || t("auth.failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-canvas text-ink lg:grid lg:grid-cols-2">
      <section className="hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col xl:p-16">
        <Link
          to="/"
          className="inline-flex items-center gap-3 self-start text-white"
        >
          <img
            className="h-11 w-11 rounded-lg bg-white p-1"
            src="/BanteayDigitalLogo.svg"
            alt="BanteayDigital"
          />
          <span>
            <strong className="block text-lg">BanteayDigital</strong>
            <small className="text-sm text-white/75">
              {t("authExtra.community")}
            </small>
          </span>
        </Link>
        <div className="my-auto max-w-md">
          <p className="m-0 text-sm font-bold uppercase tracking-[0.14em] text-[#cfe5ff]">
            {t("authExtra.saferCommunity")}
          </p>
          <h1 className="mb-4 mt-3 text-4xl font-bold leading-tight tracking-[-0.03em] xl:text-5xl">
            {t("authExtra.stayInformed")}
            <br />
            {t("authExtra.stayProtected")}
          </h1>
          <p className="m-0 text-base leading-7 text-[#deecff]">
            {t("authExtra.heroDescription")}
          </p>
          <div className="mt-10 grid gap-5">
            {authBenefits.map((benefit) => (
              <div key={benefit.title} className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/15 text-white">
                  <Icon name={benefit.icon} size={19} />
                </span>
                <div>
                  <strong className="block text-sm">{benefit.title}</strong>
                  <p className="mb-0 mt-0.5 text-sm leading-5 text-[#deecff]">
                    {benefit.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <p className="m-0 text-xs text-white/60">
          {t("authExtra.footerSafety")}
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center bg-surface px-10 py-10 sm:px-6 lg:px-10">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mx-auto inline-flex items-center gap-2 text-sm font-bold text-brand-800 hover:text-brand-700 lg:hidden"
          >
            <img className="h-9 w-9" src="/BanteayDigitalLogo.svg" alt="" />
            BanteayDigital
          </Link>
          <div className="mb-8 text-center">
            <h2 className="mb-2 mt-2 text-3xl text-start font-bold tracking-[-0.02em] text-brand-900">
              {isSignUp ? t("auth.createTitle") : t("auth.loginTitle")}
            </h2>
            <p className="m-0 text-sm leading-6 text-muted text-start">
              {isSignUp
                ? t("auth.createSubtitle")
                : t("auth.loginSubtitle")}
            </p>
          </div>
          <form onSubmit={submit} noValidate className="grid gap-4">
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              {t("auth.contact")}
              <input
                disabled={loading}
                value={contact}
                onChange={(event) => {
                  setContact(event.target.value);
                  setError("");
                }}
                className={inputClass}
                placeholder={t("auth.contactPlaceholder")}
                autoComplete="username"
                inputMode="email"
                aria-describedby={error ? "auth-error" : undefined}
              />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-ink">
              {t("auth.password")}
              <span className="relative">
                <input
                  disabled={loading}
                  required
                  type={showPassword ? "text" : "password"}
                  minLength={isSignUp ? 8 : 1}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError("");
                  }}
                  className={`${inputClass} pr-12`}
                  placeholder={
                    isSignUp ? t("auth.passwordNewPlaceholder") : t("auth.passwordPlaceholder")
                  }
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
                <button
                  disabled={loading}
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted hover:text-brand-800"
                  aria-label={showPassword ? t("authExtra.hidePassword") : t("authExtra.showPassword")}
                >
                  <Icon name={showPassword ? "eyeOff" : "eye"} size={19} />
                </button>
              </span>
            </label>
            {isSignUp ? (
              <p className="-mt-2 mb-0 text-xs leading-5 text-muted">
                {t("auth.passwordHint")}
              </p>
            ) : (
              <div className="-mt-1 flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm text-[#40546b]">
                  <input
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    type="checkbox"
                    className="h-4 w-4 accent-brand-800"
                  />
                  {t("auth.remember")}
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setRecoveryNotice(
                      t("authExtra.recoveryNotice"),
                    )
                  }
                  className="text-sm font-semibold text-brand-800 hover:text-brand-700 hover:underline"
                >
                  {t("auth.forgot")}
                </button>
              </div>
            )}
            {recoveryNotice ? (
              <p className="m-0 text-xs leading-5 text-muted" role="status">
                {recoveryNotice}
              </p>
            ) : null}
            {error ? (
              <p
                id="auth-error"
                className="m-0 text-sm font-semibold text-risk-high"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <button
              disabled={loading}
              type="submit"
              className="mt-1 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand-800 px-5 text-sm font-bold text-white transition hover:bg-brand-700 disabled:cursor-wait disabled:opacity-65"
            >
              <Icon name={loading ? "clock" : "user"} size={18} />
              {loading
                ? t("auth.pleaseWait")
                : isSignUp
                  ? t("auth.signUp")
                  : t("auth.signIn")}
            </button>
            <div className="flex items-center gap-3 py-1 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1">
              {t("authExtra.or")}
            </div>
            <button
              disabled
              type="button"
              title="Google sign-in requires backend provider integration"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-line bg-white px-5 text-sm font-bold text-[#40546b] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-[#f2f5f8] text-xs font-bold text-[#4285f4]">
                G
              </span>
              {t("authExtra.google")}
            </button>
          </form>
          <p className="mb-0 mt-6 text-center text-sm text-muted">
            {isSignUp ? t("auth.existingAccount") : t("auth.newAccount")}{" "}
            <button
              type="button"
              onClick={() => changeMode(isSignUp ? "/login" : "/signup")}
              className="font-bold text-brand-800 hover:text-brand-700 hover:underline"
            >
              {isSignUp ? t("auth.switchToSignIn") : t("auth.switchToSignUp")}
            </button>
          </p>
          <p className="mb-0 mt-5 text-center text-xs leading-5 text-muted">
            {t("authExtra.terms")}
          </p>
        </div>
      </section>
    </main>
  );
}
