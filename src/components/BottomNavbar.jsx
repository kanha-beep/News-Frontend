import React from "react";
import {
  FaArrowUp,
  FaBookmark,
  FaCommentDots,
  FaEye,
  FaFilter,
  FaHeart,
  FaMinus,
  FaMoon,
  FaNewspaper,
  FaPlus,
  FaPencilAlt,
  FaRegBell,
  FaRegBookmark,
  FaRegHeart,
  FaSearch,
  FaShareAlt,
  FaSun,
  FaSyncAlt,
  FaTimes,
} from "react-icons/fa";
export default function BottomNavbar({
  handleViewChange,
  activeView,
  openSearchModal,
  openTagBrowser,
  textScale,
  increaseTextScale,
  decreaseTextScale,
}) {
  return (
    <div>
      <nav className="fixed inset-x-4 bottom-0.5 z-30 mx-auto max-w-4xl rounded-3xl bg-slate-900 px-3 py-3 text-white shadow-2xl sm:inset-x-6">
        <div className="grid grid-cols-5 gap-2">
          <button
            type="button"
            onClick={() => handleViewChange("all")}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
              activeView === "all"
                ? "bg-white text-slate-900"
                : "bg-transparent text-white"
            }`}
          >
            <FaNewspaper className="text-base" />
            Feed
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("favorites")}
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
              activeView === "favorites"
                ? "bg-white text-slate-900"
                : "bg-transparent text-white"
            }`}
          >
            <FaBookmark className="text-base" />
            Saved
          </button>
          <button
            type="button"
            onClick={() => handleViewChange("alerts")}
            className={`flex flex-col items-center gap-1 rounded-2xl text-xs font-semibold ${
              activeView === "alerts"
                ? "bg-white text-slate-900"
                : "bg-transparent text-white"
            }`}
          >
            <FaRegBell className="text-base" />
            Alerts
          </button>
          <button
            type="button"
            onClick={openSearchModal}
            className="flex flex-col items-center gap-1 rounded-2xl text-xs font-semibold text-white"
          >
            <FaSearch className="text-base" />
            Search
          </button>
          <button
            type="button"
            onClick={openTagBrowser}
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-white"
          >
            <FaFilter className="text-base" />
            Tags
          </button>
          <div className="col-span-5 flex items-center justify-center gap-1 rounded-2xl text-xs font-semibold text-white sm:col-span-1 sm:pt-0">
            <button
              type="button"
              onClick={decreaseTextScale}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 p-0 text-white"
              aria-label="Decrease text size"
              title="Decrease text size"
            >
              <FaMinus className="text-xs" />
            </button>
            <span className="min-w-[3.5rem] text-center text-[11px]">
              Text {Math.round(textScale * 100)}%
            </span>
            <button
              type="button"
              onClick={increaseTextScale}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 p-0 text-white"
              aria-label="Increase text size"
              title="Increase text size"
            >
              <FaPlus className="text-xs" />
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
