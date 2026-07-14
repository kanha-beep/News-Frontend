import { memo } from "react";

function PushNotificationPanel({
  pushState,
  handleDisablePush,
  handleEnablePush,
  handleSendTestPush,
  loadPushStatus,
  token,
}) {
  return (
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
          disabled={!pushState.supported || pushState.loading || pushState.busy}
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            pushState.enabled ? "bg-slate-900 text-white" : "bg-blue-600 text-white"
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
  );
}

export default memo(PushNotificationPanel);
