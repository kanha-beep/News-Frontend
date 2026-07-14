import AlertCard from "./AlertCard.jsx";
import CreateAlertForm from "./CreateAlertForm.jsx";
import PushNotificationPanel from "./PushNotificationPanel.jsx";

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
      <PushNotificationPanel
        pushState={pushState}
        handleDisablePush={handleDisablePush}
        handleEnablePush={handleEnablePush}
        handleSendTestPush={handleSendTestPush}
        loadPushStatus={loadPushStatus}
        token={token}
      />

      <CreateAlertForm
        alertForm={alertForm}
        setAlertForm={setAlertForm}
        handleCreateAlert={handleCreateAlert}
        alertSubmitting={alertSubmitting}
      />

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
            <AlertCard
              key={alert._id}
              alert={alert}
              handleReadArticle={handleReadArticle}
              handleToggleAlert={handleToggleAlert}
              handleDeleteAlert={handleDeleteAlert}
            />
          ))}
        </div>
      )}
    </div>
  );
}
