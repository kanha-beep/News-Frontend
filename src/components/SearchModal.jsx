import { memo } from "react";

function SearchModal({
  isOpen,
  setIsSearchModalOpen,
  titleQuery,
  setTitleQuery,
  dateFilter,
  setDateFilter,
  clearSharedArticleFocus,
  clearAllFilters,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Search News
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Filter by title and date
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsSearchModalOpen(false)}
            className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="modal-title-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search headline text
            </label>
            <input
              id="modal-title-search"
              value={titleQuery}
              onChange={(e) => {
                clearSharedArticleFocus();
                setTitleQuery(e.target.value);
              }}
              placeholder="Search headline text..."
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="modal-date-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Filter by date
            </label>
            <input
              id="modal-date-search"
              type="date"
              value={dateFilter}
              onChange={(e) => {
                clearSharedArticleFocus();
                setDateFilter(e.target.value);
              }}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SearchModal);
