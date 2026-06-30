export default function MobileTagMenu({
  setIsMobileTagMenuOpen,
  tagBrowserQuery,
  setTagBrowserQuery,
  applyTagQuery,
  selectedTags,
  filteredBrowserTags,
  selectedTagSet,
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
      <div className="max-h-[80vh] w-full max-w-sm overflow-y-auto rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Browse Tags
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Filter by category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileTagMenuOpen(false)}
            className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>

        <div className="mb-4">
          <input
            value={tagBrowserQuery}
            onChange={(e) => setTagBrowserQuery(e.target.value)}
            placeholder="Search tags..."
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => applyTagQuery("")}
            className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
              selectedTags.length
                ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                : "bg-slate-900 text-white"
            }`}
          >
            All Tags
          </button>

          {filteredBrowserTags.map((tag) => {
            const isActive = selectedTagSet.has(tag.toLowerCase());

            return (
              <button
                key={`mobile-${tag}`}
                type="button"
                onClick={() => applyTagQuery(tag)}
                className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
