import {
  FaArrowUp,
  FaMinus,
  FaMoon,
  FaPlus,
  FaSun,
  FaSyncAlt,
} from "react-icons/fa";
import { useAppContext } from "../context/AppContext.jsx";

export default function TopNavbar({
  toggleThemeMode,
  handleRefresh,
  pendingLatestNews,
  handleApplyLatestNews,
  totalItems,
  increaseTextScale,
  decreaseTextScale,
  openAuthScreen,
}) {
  const {
    authScreen,
    setAuthScreen,
    pendingFavoriteArticle,
    setPendingFavoriteArticle,
    setActiveView,
    token,
    isDarkMode,
    textScale,
    setToken,
    setCurrentUser,
    setAlerts,
  } = useAppContext();

  return authScreen ? (
    <nav className="mb-6 grid gap-5 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
      <div className="flex justify-start">
        <img
          src="/lightning-news-logo.png"
          alt="Lightning News logo"
          className="h-14 w-14 rounded-full object-cover"
        />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold">N E W Z</h1>
        <div className="flex justify-center gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">
            Kanha Gupta
          </p>
          <a
            href="https://wa.me/919131395725"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-red-600"
          >
            Contact
          </a>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            setAuthScreen(null);
            if (pendingFavoriteArticle) {
              setPendingFavoriteArticle(null);
            }
            if (!token) {
              setActiveView("all");
            }
          }}
          className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Back to News
        </button>
      </div>
    </nav>
  ) : (
    <nav className="fixed inset-x-0 top-0 z-30 overflow-x-auto bg-white p-4">
      <div className="flex min-w-max flex-nowrap items-start gap-4">
        <div className="shrink-0">
          <img
            src="/lightning-news-logo.png"
            alt="Lightning News logo"
            className="h-14 w-14 rounded-full object-cover"
          />
          {/* <a
            href="https://wa.me/919131395725"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-red-600"
          >
            Contact
          </a> */}
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
          <button
            type="button"
            onClick={handleRefresh}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700"
            aria-label="Refresh"
            title="Refresh"
          >
            <FaSyncAlt />
          </button>
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
          {/* <p className="rounded-sm p-1 text-sm font-semibold">{totalItems}</p> */}
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
            {/* <button
              type="button"
              onClick={() => {
                if (token) {
                  setToken("");
                  setCurrentUser(null);
                  setActiveView("all");
                  setAlerts([]);
                } else {
                  openAuthScreen("login");
                }
              }}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              {token ? "Sign Out" : "Sign In"}
            </button> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
