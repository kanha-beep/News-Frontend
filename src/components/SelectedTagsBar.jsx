import { memo } from "react";

function SelectedTagsBar({ selectedTags, applyTagQuery }) {
  if (!selectedTags.length) {
    return null;
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {selectedTags.map((tag) => (
        <button
          key={`selected-${tag}`}
          type="button"
          onClick={() => applyTagQuery(tag)}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
        >
          #{tag} x
        </button>
      ))}
    </div>
  );
}

export default memo(SelectedTagsBar);
