import { useEffect, useState } from "react";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URI;

function App() {
  const [news, setNews] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [activeView, setActiveView] = useState("all");
  const [tagQuery, setTagQuery] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [monthFilter, setMonthFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const matchingTags = availableTags.filter((tag) => {
    const normalizedTagFilter = tagQuery.trim().toLowerCase();

    if (!normalizedTagFilter) {
      return true;
    }

    return tag.toLowerCase().includes(normalizedTagFilter);
  });

  const loadTags = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/tags`);
    setAvailableTags(res.data?.items || []);
  };

  const loadNews = async (
    view = activeView,
    tag = tagQuery,
    date = dateFilter,
    month = monthFilter,
    page = currentPage,
  ) => {
    const params = {};

    if (view === "favorites") {
      params.favorite = true;
    }

    if (tag.trim()) {
      params.tag = tag.trim().toLowerCase();
    }

    if (date) {
      params.date = date;
    } else if (month) {
      params.month = month;
    }

    params.page = page;

    const res = await axios.get(`${API_BASE_URL}/api/news`, { params });
    setNews(res.data?.items || []);
    setTotalItems(res.data?.total || 0);
    setTotalPages(res.data?.totalPages || 1);
  };

  const syncNews = async () => {
    await axios.get(`${API_BASE_URL}/api/hindu`);
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      setError("");

      try {
        await syncNews();
        await Promise.all([loadTags(), loadNews("all", "", "", "", 1)]);
      } catch (err) {
        setError(
          err?.response?.data?.message || "Unable to load news right now.",
        );
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (loading) return;

    const updateNews = async () => {
      setRefreshing(true);
      setError("");

      try {
        await loadNews(
          activeView,
          tagQuery,
          dateFilter,
          monthFilter,
          currentPage,
        );
      } catch (err) {
        setError(
          err?.response?.data?.message || "Unable to update this filter.",
        );
      } finally {
        setRefreshing(false);
      }
    };

    updateNews();
  }, [activeView, tagQuery, dateFilter, monthFilter, currentPage, loading]);

  const handleToggleFavorite = async (article) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/favorite`, article);
      await loadNews(
        activeView,
        tagQuery,
        dateFilter,
        monthFilter,
        currentPage,
      );
      setToast({
        show: true,
        message: res.data?.favorite
          ? "Added to favorites"
          : "Removed from favorites",
        type: res.data?.favorite ? "success" : "info",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update favorite.");
    }
  };

  const handleReadArticle = (link) => {
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await syncNews();
      await Promise.all([
        loadTags(),
        loadNews(activeView, tagQuery, dateFilter, monthFilter, currentPage),
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to refresh news.");
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllFilters = () => {
    setTagQuery("");
    setShowTagSuggestions(false);
    setDateFilter("");
    setMonthFilter("");
    setCurrentPage(1);
  };

  const applyTagQuery = (tag) => {
    setTagQuery(tag);
    setShowTagSuggestions(false);
    setCurrentPage(1);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, dateFilter, monthFilter, tagQuery]);

  useEffect(() => {
    if (!toast.show) return;

    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2200);

    return () => clearTimeout(timeout);
  }, [toast]);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      {toast.show ? (
        <div className="fixed right-4 top-4 z-50">
          <div
            className={`rounded-xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.type === "success"
                ? "bg-emerald-500 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            {toast.message}
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">The Hindu News</h1>
            <div className="flex gap-3">
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveView("all")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeView === "all"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              All News
            </button>
            <button
              type="button"
              onClick={() => setActiveView("favorites")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                activeView === "favorites"
                  ? "bg-red-500 text-white"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              Favorites
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </nav>

        <div className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm xl:grid-cols-[minmax(0,1fr)_220px_220px_180px]">
          <div>
            <label
              htmlFor="tag-search"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Search by tag
            </label>
            <div className="relative">
              <input
                id="tag-search"
                value={tagQuery}
                onChange={(e) => {
                  setTagQuery(e.target.value);
                  setShowTagSuggestions(true);
                }}
                onFocus={() => setShowTagSuggestions(true)}
                onBlur={() => {
                  setTimeout(() => setShowTagSuggestions(false), 150);
                }}
                placeholder="Type a tag like politics, crime, sports..."
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
              {showTagSuggestions && matchingTags.length > 0 ? (
                <div className="absolute z-10 mt-2 max-h-52 w-full overflow-y-auto rounded-xl border border-sky-200 bg-sky-50 p-2 shadow-lg shadow-sky-100">
                  {matchingTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onMouseDown={() => applyTagQuery(tag)}
                      className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-blue-300 hover:bg-white"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 xl:contents">
            <div className="flex-1">
              <label
                htmlFor="date-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search by date
              </label>
              <input
                id="date-search"
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                  if (e.target.value) {
                    setMonthFilter("");
                  }
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="flex-1">
              <label
                htmlFor="month-search"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Search by month
              </label>
              <input
                id="month-search"
                type="month"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  setCurrentPage(1);
                  if (e.target.value) {
                    setDateFilter("");
                  }
                }}
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <p className="text-sm text-slate-500">
              {activeView === "favorites"
                ? "Showing only favorite articles"
                : "Showing all stored articles"}
            </p>
            {tagQuery ? (
              <p className="text-xs font-medium text-blue-600">
                Live tag search: {tagQuery}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                Type a tag and results update live.
              </p>
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[40vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                Loading news...
              </p>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {refreshing ? (
              <p className="mb-4 text-sm font-medium text-blue-600">
                Updating articles...
              </p>
            ) : null}

            {news.length === 0 ? (
              <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                <p className="text-lg font-semibold text-slate-700">
                  No articles found.
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Try another tag, date, month, or switch back to all news.
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {news.map((article) => (
                  <article
                    key={article._id || article.link}
                    className="flex h-full flex-col rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {(article.tags?.length
                          ? article.tags
                          : ["untagged"]
                        ).map((tag) => (
                          <button
                            key={`${article.link}-${tag}`}
                            type="button"
                            onClick={() => applyTagQuery(tag)}
                            className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleFavorite(article)}
                        className="rounded-full p-2 text-lg"
                        aria-label={
                          article.favorite ? "Remove favorite" : "Add favorite"
                        }
                      >
                        {article.favorite ? (
                          <FaBookmark className="text-red-500" />
                        ) : (
                          <FaRegBookmark className="text-slate-400 hover:text-red-500" />
                        )}
                      </button>
                    </div>

                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      {article.pubDate || "No publish date"}
                    </p>

                    <h2 className="mb-3 text-xl font-bold text-slate-900">
                      {article.title}
                    </h2>

                    <p className="mb-5 line-clamp-4 text-sm leading-6 text-slate-600">
                      {article.description || "No description available."}
                    </p>

                    <button
                      type="button"
                      onClick={() => handleReadArticle(article.link)}
                      className="mt-auto rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700"
                    >
                      Read Article
                    </button>
                  </article>
                ))}
              </div>
            )}

            {totalItems > 0 ? (
              <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
                <p className="text-sm text-slate-600">
                  Showing {(currentPage - 1) * 10 + 1}-
                  {Math.min(currentPage * 10, totalItems)} of {totalItems}{" "}
                  articles
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <p className="text-sm font-medium text-slate-700">
                    Page {currentPage} of {totalPages}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.min(totalPages, page + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
