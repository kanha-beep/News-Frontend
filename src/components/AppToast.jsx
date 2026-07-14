import { memo } from "react";

function AppToast({ toast }) {
  if (!toast.show) {
    return null;
  }

  return (
    <div className="fixed right-4 top-4 z-50">
      <div
        className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
          toast.type === "success"
            ? "bg-emerald-500 text-white"
            : "bg-slate-900 text-white"
        }`}
      >
        {toast.message}
      </div>
    </div>
  );
}

export default memo(AppToast);
