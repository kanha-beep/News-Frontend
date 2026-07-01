export default function AlertsView({
  pushState,
  handleDisablePush,
  handleEnablePush,
  handleSendTestPush,
  loadPushStatus,
  token,
  alertForm,
  setAlertForm,
  handleCreateAlert,
  alertSubmitting,
  alerts,
  handleReadArticle,
  handleToggleAlert,
  handleDeleteAlert,
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Push Notifications
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Saved alert delivery
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {pushState.supported
            ? pushState.enabled
              ? "Notifications are enabled for this browser."
              : pushState.permission === "denied"
                ? "Notifications are blocked in browser settings."
                : "Enable browser notifications to receive saved alert matches."
            : "This browser does not support web push notifications."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={pushState.enabled ? handleDisablePush : handleEnablePush}
            disabled={
              !pushState.supported || pushState.loading || pushState.busy
            }
            className={`rounded-xl px-4 py-3 text-sm font-semibold ${
              pushState.enabled
                ? "bg-slate-900 text-white"
                : "bg-blue-600 text-white"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            {pushState.busy
              ? "Working..."
              : pushState.enabled
                ? "Disable Push"
                : "Enable Push"}
          </button>
          <button
            type="button"
            onClick={() => loadPushStatus(token)}
            disabled={pushState.busy}
            className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Refresh Status
          </button>
          <button
            type="button"
            onClick={handleSendTestPush}
            disabled={!pushState.enabled || pushState.busy}
            className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Send Test Push
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
          Saved Alerts
        </p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">
          Create a topic alert
        </h2>
        <form
          onSubmit={handleCreateAlert}
          className="mt-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_auto]"
        >
          <input
            value={alertForm.topic}
            onChange={(e) =>
              setAlertForm((prev) => ({
                ...prev,
                topic: e.target.value,
              }))
            }
            placeholder="Example: kerala rain"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
          <select
            value={alertForm.type}
            onChange={(e) =>
              setAlertForm((prev) => ({
                ...prev,
                type: e.target.value,
              }))
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          >
            <option value="topic">Topic alert</option>
            <option value="breaking">Breaking alert</option>
          </select>
          <button
            type="submit"
            disabled={alertSubmitting}
            className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {alertSubmitting ? "Saving..." : "Create Alert"}
          </button>
        </form>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
          <p className="text-lg font-semibold text-slate-700">No alerts yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Create a topic alert and this browser can notify you when matching
            stories arrive.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {alerts.map((alert) => (
            <article key={alert._id} className="rounded-2xl bg-white p-5 shadow-sm">
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
          ))}
        </div>
      )}
    </div>
  );
}
