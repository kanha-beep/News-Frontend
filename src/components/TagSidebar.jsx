import { memo } from "react";

function TagSidebar({
  activeView,
  applyTagQuery,
  selectedTags,
  availableTags,
  selectedTagSet,
}) {
  return (
    <aside id="tag-sidebar" className="hidden">
      {activeView === "alerts" ? null : (
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Browse Tags
            </p>
            <h2 className="mt-2 text-lg font-bold text-slate-900">
              Filter by category
            </h2>
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

            {availableTags.map((tag) => {
              const isActive = selectedTagSet.has(tag.toLowerCase());

              return (
                <button
                  key={tag}
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
      )}
    </aside>
  );
}

export default memo(TagSidebar);
