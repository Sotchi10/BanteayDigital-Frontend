import { Link } from "react-router-dom";
import { Card } from "./primitives";
import { Icon } from "./icons";

const actionClass = "mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-brand-800 px-5 text-sm font-bold text-white hover:bg-brand-700";

function StateAction({ actionLabel, actionTo, onAction }) {
  if (!actionLabel) return null;
  if (actionTo) return <Link to={actionTo} className={actionClass}>{actionLabel}</Link>;
  return <button type="button" onClick={onAction} className={actionClass}>{actionLabel}</button>;
}

export function LoadingState({ message = "Loading…" }) {
  return <Card className="grid min-h-44 place-items-center p-8 text-center" role="status" aria-live="polite"><div><span className="mx-auto block h-9 w-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-800" /><p className="mb-0 mt-4 text-sm text-muted">{message}</p></div></Card>;
}

export function EmptyState({ icon = "clock", title = "Nothing here yet", message, actionLabel, actionTo, onAction }) {
  return <Card className="p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-800"><Icon name={icon} size={26} /></span><h2 className="mb-1 mt-4 text-xl font-bold text-brand-900">{title}</h2>{message ? <p className="mx-auto mb-0 max-w-md text-sm leading-6 text-muted">{message}</p> : null}<StateAction actionLabel={actionLabel} actionTo={actionTo} onAction={onAction} /></Card>;
}

export function UnauthorizedState({ message = "Please sign in to view this content." }) {
  return <Card className="p-8 text-center sm:p-10"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-100 text-brand-800"><Icon name="lock" size={26} /></span><h2 className="mb-1 mt-4 text-xl font-bold text-brand-900">Sign in required</h2><p className="mx-auto mb-0 max-w-md text-sm leading-6 text-muted">{message}</p><StateAction actionLabel="Sign in" actionTo="/login" /></Card>;
}

export function ErrorState({ title = "Could not load this page", message, status, onRetry }) {
  if (status === 401 || status === 403) return <UnauthorizedState message={message} />;
  return <Card className="p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#fff0f1] text-risk-high"><Icon name="alert" size={23} /></span><h2 className="mb-1 mt-4 text-lg font-bold text-brand-900">{title}</h2>{message ? <p className="mb-0 text-sm leading-6 text-muted" role="alert">{message}</p> : null}{onRetry ? <StateAction actionLabel="Try again" onAction={onRetry} /> : null}</Card>;
}

export function SuccessState({ title = "Saved", message }) {
  return <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#bce5d8] bg-[#f0faf6] px-3 py-2 text-sm font-semibold text-risk-low" role="status" aria-live="polite"><Icon name="check" size={17} /><span><strong>{title}</strong>{message ? ` — ${message}` : ""}</span></div>;
}
