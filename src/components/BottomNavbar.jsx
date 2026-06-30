import React from "react";
import {
  FaBookmark,
  FaFilter,
  FaNewspaper,
  FaRegBell,
  FaSearch,
} from "react-icons/fa";
import { useAppContext } from "../context/AppContext.jsx";

export default function BottomNavbar({
  handleViewChange,
  openSearchModal,
  openTagBrowser,
}) {
  const { activeView } = useAppContext();

  return (
    <div>
      <nav className="fixed inset-x-0 bottom-0 z-30 bg-slate-900 px-3 pt-3 pb-2 text-white">
        <div className="grid grid-cols-5 gap-5">
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
            className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
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
            className="flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold text-white"
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
        </div>
      </nav>
    </div>
  );
}
