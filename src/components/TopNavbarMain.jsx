import { memo } from "react";
import { FaArrowUp, FaMinus, FaMoon, FaPlus, FaSun } from "react-icons/fa";
import { LANGUAGE_OPTIONS, getLanguageLabel } from "./appHelpers.js";
import { useNavigate } from "react-router-dom";
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
  uiLabels,
}) {
  const navigate = useNavigate();
  return (
    <nav className="fixed inset-x-0 top-0 z-30 overflow-x-auto bg-white p-4">
      <div className="flex min-w-max flex-nowrap items-start gap-4">
        <div className="shrink-0 flex items-center font-semibold shadow-sm py-2">
          <div className="honesty" onClick={() => navigate("/home")}>
            NewsHonesty
          </div>
          {/* <img
            src="/lightning-news-logo.png"
            alt="NewsHonesty logo"
            className="h-14 w-14 rounded-full object-cover"
          /> */}
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={toggleThemeMode}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700"
            aria-label={
              isDarkMode
                ? uiLabels?.lightMode || "Light mode"
                : uiLabels?.darkMode || "Dark mode"
            }
            title={
              isDarkMode
                ? uiLabels?.lightMode || "Light mode"
                : uiLabels?.darkMode || "Dark mode"
            }
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>
          {/* <label className="rounded-full bg-slate-200 px-1 text-sm font-semibold text-slate-700"></label> */}
            {/* <span className="sr-only">Choose language</span> */}
          <select
            value={preferredLanguage}
            onChange={(event) => handleLanguageChange(event.target.value)}
            className="h-10 w-[5rem] rounded-full bg-transparent outline-none"
            aria-label={uiLabels?.chooseLanguage || "Choose language"}
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
                  : `${language.label} (Unavailable)`}
              </option>
            ))}
          </select>
        </div>
        {pendingLatestNews ? (
          <button
            type="button"
            onClick={handleApplyLatestNews}
            className="rounded-full bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            title={uiLabels?.showLatestNews || "Show latest news"}
            aria-label={uiLabels?.showLatestNews || "Show latest news"}
          >
            <FaArrowUp />
          </button>
        ) : null}

        <div className="ml-auto flex shrink-0 flex-col items-end gap-3">
          <div className="flex flex-col items-end gap-1">
            <div className=" h-10 flex items-center justify-center gap-1 rounded-2xl bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              <button
                type="button"
                onClick={decreaseTextScale}
                className="flex h-full w-5 items-center justify-center rounded-full bg-white/10 p-0 text-white"
                aria-label={uiLabels?.decreaseTextSize || "Decrease text size"}
                title={uiLabels?.decreaseTextSize || "Decrease text size"}
              >
                <FaMinus className="text-xs" />
              </button>
              <span className="min-w-[1rem] text-center text-[11px]">
                {Math.round(textScale * 100)}%
              </span>
              <button
                type="button"
                onClick={increaseTextScale}
                className="flex h-full w-5 items-center justify-center rounded-full bg-white/10 p-0 text-white dark:text-white"
                aria-label={uiLabels?.increaseTextSize || "Increase text size"}
                title={uiLabels?.increaseTextSize || "Increase text size"}
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
