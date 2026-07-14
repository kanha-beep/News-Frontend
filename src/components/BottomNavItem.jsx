import { memo } from "react";

function BottomNavItem({ isActive = false, onClick, icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold ${
        isActive ? "bg-white text-slate-900" : "bg-transparent text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

export default memo(BottomNavItem);
