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
          alt="NewsPoll logo"
          className="h-14 w-14 rounded-full object-cover"
        />
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold">N E W S    P O L L</h1>
        {/* <div className="flex justify-center gap-3">
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
        </div> */}
      </div>

      <div aria-hidden="true" />
    </nav>
  );
}

export default memo(TopNavbarAuth);
