import { memo } from "react";

function AlertCard({
  alert,
  handleReadArticle,
  handleToggleAlert,
  handleDeleteAlert,
}) {
  return (
    <article className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            {alert.type}
          </p>
          <h3 className="mt-2 text-lg font-bold text-slate-900">
            {alert.topic}
          </h3>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            alert.enabled
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {alert.enabled ? "Active" : "Paused"}
        </span>
      </div>

      <div className="mt-4 space-y-2 text-sm text-slate-600">
        <p>
          {alert.matchCount || 0} recent match
          {(alert.matchCount || 0) === 1 ? "" : "es"}
        </p>
        <p>Latest: {alert.latestMatch?.title || "No matching story yet"}</p>
      </div>

      {alert.matches?.length ? (
        <div className="mt-4 space-y-2">
          {alert.matches.map((match) => (
            <button
              key={`${alert._id}-${match.link}`}
              type="button"
              onClick={() => handleReadArticle(match.link)}
              className="block w-full rounded-xl bg-slate-50 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-100"
            >
              {match.title}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handleToggleAlert(alert._id, !alert.enabled)}
          className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
        >
          {alert.enabled ? "Pause" : "Enable"}
        </button>
        <button
          type="button"
          onClick={() => handleDeleteAlert(alert._id)}
          className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
        >
          Delete
        </button>
      </div>
    </article>
  );
}

export default memo(AlertCard);
