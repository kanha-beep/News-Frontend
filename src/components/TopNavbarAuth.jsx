import { memo } from "react";

function TopNavbarAuth({
  setAuthScreen,
  pendingFavoriteArticle,
  setPendingFavoriteArticle,
  token,
  setActiveView,
}) {
  return (
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
  );
}

export default memo(TopNavbarAuth);
