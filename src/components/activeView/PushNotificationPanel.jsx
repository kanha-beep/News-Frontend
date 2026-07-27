import { memo } from "react";

function PushNotificationPanel({
  pushState,
  handleDisablePush,
  handleEnablePush,
  handleSendTestPush,
  loadPushStatus,
  token,
  uiLabels,
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
        {uiLabels?.pushNotifications || "Push notifications"}
      </p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">
        {uiLabels?.savedAlertDelivery || "Saved alert delivery"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {pushState.supported
          ? pushState.enabled
            ? uiLabels?.notificationsEnabled || "Notifications are enabled for this browser."
            : pushState.permission === "denied"
              ? uiLabels?.notificationsBlocked || "Notifications are blocked in browser settings."
              : uiLabels?.enableBrowserNotifications || "Enable browser notifications to receive saved alert matches."
          : uiLabels?.noPushSupport || "This browser does not support web push notifications."}
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
            ? uiLabels?.working || "Working..."
            : pushState.enabled
              ? uiLabels?.disablePush || "Disable push"
              : uiLabels?.enablePush || "Enable push"}
        </button>
        <button
          type="button"
          onClick={() => loadPushStatus(token)}
          disabled={pushState.busy}
          className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uiLabels?.refreshStatus || "Refresh status"}
        </button>
        <button
          type="button"
          onClick={handleSendTestPush}
          disabled={!pushState.enabled || pushState.busy}
          className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {uiLabels?.sendTestPush || "Send test push"}
        </button>
      </div>
    </div>
  );
}

export default memo(PushNotificationPanel);
