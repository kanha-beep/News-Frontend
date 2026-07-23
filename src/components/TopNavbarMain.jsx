import { memo } from "react";
import { FaArrowUp, FaMinus, FaMoon, FaPlus, FaSun } from "react-icons/fa";
import { LANGUAGE_OPTIONS, getLanguageLabel } from "./appHelpers.js";

function TopNavbarMain({
  toggleThemeMode,
  handleLanguageChange,
  pendingLatestNews,
  handleApplyLatestNews,
  isDarkMode,
  preferredLanguage,
  textScale,
  decreaseTextScale,
  increaseTextScale,
}) {
  return (
    <nav className="fixed inset-x-0 top-0 z-30 overflow-x-auto bg-white p-4">
      <div className="flex min-w-max flex-nowrap items-start gap-4">
        <div className="shrink-0">
          <img
            src="/lightning-news-logo.png"
            alt="NewsHonesty logo"
            className="h-14 w-14 rounded-full object-cover"
          />
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={toggleThemeMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
            aria-label={isDarkMode ? "Light mode" : "Dark mode"}
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          <label className="rounded-full bg-slate-200 px-3 text-sm font-semibold text-slate-700">
            <span className="sr-only">Choose language</span>
            <select
              value={preferredLanguage}
              onChange={(event) => handleLanguageChange(event.target.value)}
              className="h-10 w-[5.5rem] rounded-full bg-transparent pr-2 outline-none"
              aria-label="Choose language"
              title={`Language: ${getLanguageLabel(preferredLanguage)}`}
            >
              {LANGUAGE_OPTIONS.map((language) => (
                <option
                  key={language.code}
                  value={language.code}
                  disabled={!language.googleSupported}
                >
                  {language.googleSupported
                    ? language.label
                    : `${language.label} (Google unavailable)`}
                </option>
              ))}
            </select>
          </label>
        </div>
        {pendingLatestNews ? (
          <button
            type="button"
            onClick={handleApplyLatestNews}
            className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            title="Show latest news"
            aria-label="Show latest news"
          >
            <FaArrowUp />
          </button>
        ) : null}

        <div className="ml-auto flex shrink-0 flex-col items-end gap-3">
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center justify-center gap-1 rounded-2xl bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
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
                {Math.round(textScale * 100)}%
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
        </div>
      </div>
    </nav>
  );
}

export default memo(TopNavbarMain);
