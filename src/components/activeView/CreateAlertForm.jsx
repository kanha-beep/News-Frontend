import { memo } from "react";

function CreateAlertForm({
  alertForm,
  setAlertForm,
  handleCreateAlert,
  alertSubmitting,
}) {
  return (
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
  );
}

export default memo(CreateAlertForm);
