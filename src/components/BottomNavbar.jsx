import React from "react";
import {
  FaBookmark,
  FaFilter,
  FaNewspaper,
  FaRegBell,
  FaSearch,
} from "react-icons/fa";
import BottomNavItem from "./BottomNavItem.jsx";
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
          <BottomNavItem
            isActive={activeView === "all"}
            onClick={() => handleViewChange("all")}
            icon={<FaNewspaper className="text-base" />}
            label="Feed"
          />
          <BottomNavItem
            isActive={activeView === "favorites"}
            onClick={() => handleViewChange("favorites")}
            icon={<FaBookmark className="text-base" />}
            label="Saved"
          />
          <BottomNavItem
            isActive={activeView === "alerts"}
            onClick={() => handleViewChange("alerts")}
            icon={<FaRegBell className="text-base" />}
            label="Alerts"
          />
          <BottomNavItem
            onClick={openSearchModal}
            icon={<FaSearch className="text-base" />}
            label="Search"
          />
          <BottomNavItem
            onClick={openTagBrowser}
            icon={<FaFilter className="text-base" />}
            label="Tags"
          />
        </div>
      </nav>
    </div>
  );
}
