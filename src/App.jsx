import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URI;
const TOKEN_STORAGE_KEY = "newsAuthToken";

function SearchField({
  id,
  label,
  value,
  onChange,
  placeholder,
  children = null,
  onFocus,
  onBlur,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
        />
        {children}
      </div>
    </div>
  );
}

function App() {
  const [news, setNews] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [isMobileTagMenuOpen, setIsMobileTagMenuOpen] = useState(false);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("all");
  const [tagQuery, setTagQuery] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Fetching news...");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });
  const [authScreen, setAuthScreen] = useState(null);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [pendingFavoriteArticle, setPendingFavoriteArticle] = useState(null);
  const loadingProgressRef = useRef(0);
  const loadingAnimationRef = useRef(null);

  const updateLoadingProgress = (value) => {
    const nextValue = Math.max(0, Math.min(100, Math.round(value)));
    loadingProgressRef.current = nextValue;
    setLoadingProgress(nextValue);
  };

  const animateLoadingProgress = (target, duration = 500) =>
    new Promise((resolve) => {
      if (loadingAnimationRef.current) {
        clearInterval(loadingAnimationRef.current);
      }

      const start = loadingProgressRef.current;
      const end = Math.max(start, Math.min(100, Math.round(target)));

      if (start === end) {
        resolve();
        return;
      }

      const intervalMs = 16;
      const totalSteps = Math.max(1, Math.round(duration / intervalMs));
      let currentStep = 0;

      loadingAnimationRef.current = setInterval(() => {
        currentStep += 1;
        const nextValue = start + ((end - start) * currentStep) / totalSteps;
        updateLoadingProgress(nextValue);

        if (currentStep >= totalSteps) {
          clearInterval(loadingAnimationRef.current);
          loadingAnimationRef.current = null;
          updateLoadingProgress(end);
          resolve();
        }
      }, intervalMs);
    });

  const loadTags = async () => {
    const res = await axios.get(`${API_BASE_URL}/api/tags`);
    setAvailableTags(res.data?.items || []);
  };

  const loadCurrentUser = async (authToken = token) => {
    if (!authToken) {
      setCurrentUser(null);
      return null;
    }

    const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const user = res.data?.user || null;
    setCurrentUser(user);
    return user;
  };

  const loadNews = async (
    view = activeView,
    tag = tagQuery,
    title = titleQuery,
    date = dateFilter,
    page = currentPage,
    authToken = token,
  ) => {
    if (view === "favorites" && !authToken) {
      setNews([]);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }

    const res = await axios.get(`${API_BASE_URL}/api/news`, {
      params: {
        tag: tag.trim() ? tag.trim().toLowerCase() : "",
        title: title.trim(),
        date: date || "",
        page,
        favoritesOnly: view === "favorites",
      },
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : {},
    });

    setNews(res.data?.items || []);
    setTotalItems(res.data?.total || 0);
    setTotalPages(res.data?.totalPages || 1);
  };

  const syncNews = async () => {
    await axios.get(`${API_BASE_URL}/api/hindu`);
  };

  const matchingTags = availableTags.filter((tag) => {
    const normalizedTagFilter = tagQuery.trim().toLowerCase();

    if (!normalizedTagFilter) {
      return true;
    }

    return tag.toLowerCase().includes(normalizedTagFilter);
  });
  const normalizedSelectedTag = tagQuery.trim().toLowerCase();

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      updateLoadingProgress(0);
      setLoadingMessage("Fetching latest articles...");
      setError("");

      try {
        await animateLoadingProgress(18, 350);
        await syncNews();
        setLoadingMessage("Checking your account...");
        await animateLoadingProgress(44, 400);

        if (token) {
          try {
            await loadCurrentUser(token);
          } catch {
            setToken("");
            setCurrentUser(null);
          }
        }

        setLoadingMessage("Loading tags and headlines...");
        await animateLoadingProgress(72, 400);
        await Promise.all([loadTags(), loadNews("all", "", "", 1)]);
        setLoadingMessage("Finishing up...");
        await animateLoadingProgress(100, 300);
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
    return () => {
      if (loadingAnimationRef.current) {
        clearInterval(loadingAnimationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (loading || authScreen) return;

    const updateNews = async () => {
      setRefreshing(true);
      setError("");

      try {
        await loadNews(
          activeView,
          tagQuery,
          titleQuery,
          dateFilter,
          currentPage,
        );
      } catch (err) {
        if (err?.response?.status === 401) {
          setToken("");
          setCurrentUser(null);
          setActiveView("all");
          return;
        }

        setError(
          err?.response?.data?.message || "Unable to update this filter.",
        );
      } finally {
        setRefreshing(false);
      }
    };

    updateNews();
  }, [
    activeView,
    tagQuery,
    titleQuery,
    dateFilter,
    currentPage,
    token,
    loading,
    authScreen,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, dateFilter, tagQuery, titleQuery]);

  useEffect(() => {
    if (!toast.show) return;

    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2200);

    return () => clearTimeout(timeout);
  }, [toast]);

  const openAuthScreen = (mode) => {
    setAuthScreen(mode);
    setAuthForm({
      name: "",
      email: "",
      password: "",
    });
    setError("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthSubmitting(true);
    setError("");

    try {
      const endpoint =
        authScreen === "register" ? "/api/auth/register" : "/api/auth/login";
      const payload =
        authScreen === "register"
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const res = await axios.post(`${API_BASE_URL}${endpoint}`, payload);
      const nextToken = res.data?.token || "";

      setToken(nextToken);
      setCurrentUser(res.data?.user || null);

      if (pendingFavoriteArticle) {
        await axios.post(
          `${API_BASE_URL}/api/favorites/toggle`,
          {
            link: pendingFavoriteArticle.link,
            title: pendingFavoriteArticle.title,
            description: pendingFavoriteArticle.description,
            pubDate: pendingFavoriteArticle.pubDate,
          },
          {
            headers: {
              Authorization: `Bearer ${nextToken}`,
            },
          },
        );
        setPendingFavoriteArticle(null);
      }

      if (activeView === "favorites") {
        await loadNews(
          "favorites",
          tagQuery,
          titleQuery,
          dateFilter,
          1,
          nextToken,
        );
        setCurrentPage(1);
      }

      setAuthScreen(null);
      setToast({
        show: true,
        message: authScreen === "register" ? "Account created" : "Signed in",
        type: "success",
      });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Authentication failed.",
      );
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleToggleFavorite = async (article) => {
    if (!token) {
      setPendingFavoriteArticle(article);
      openAuthScreen("login");
      setToast({
        show: true,
        message: "Sign in to save favorites",
        type: "info",
      });
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/favorites/toggle`,
        {
          link: article.link,
          title: article.title,
          description: article.description,
          pubDate: article.pubDate,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const isFavorite = Boolean(res.data?.favorite);
      setCurrentUser(res.data?.user || currentUser);
      setNews((prev) =>
        prev.map((item) =>
          item.link === article.link ? { ...item, isFavorite } : item,
        ),
      );
      setToast({
        show: true,
        message: isFavorite ? "Added to favorites" : "Removed from favorites",
        type: isFavorite ? "success" : "info",
      });

      if (activeView === "favorites") {
        if (!isFavorite && news.length === 1 && currentPage > 1) {
          setCurrentPage((page) => Math.max(1, page - 1));
          return;
        }

        await loadNews(
          activeView,
          tagQuery,
          titleQuery,
          dateFilter,
          currentPage,
        );
      }
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update favorite.",
      );
    }
  };

  const handleViewChange = (view) => {
    if (view === "favorites" && !token) {
      setActiveView("favorites");
      setCurrentPage(1);
      openAuthScreen("login");
      return;
    }

    setActiveView(view);
    setCurrentPage(1);
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
        loadNews(activeView, tagQuery, titleQuery, dateFilter, currentPage),
      ]);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to refresh news.");
    } finally {
      setRefreshing(false);
    }
  };

  const clearAllFilters = () => {
    setTagQuery("");
    setTitleQuery("");
    setShowTagSuggestions(false);
    setDateFilter("");
    setCurrentPage(1);
    setIsMobileTagMenuOpen(false);
  };

  const applyTagQuery = (tag) => {
    setTagQuery(tag);
    setShowTagSuggestions(false);
    setCurrentPage(1);
    setIsMobileTagMenuOpen(false);
  };

  if (authScreen) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold">N E W Z</h1>
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

            <button
              type="button"
              onClick={() => {
                setAuthScreen(null);
                setPendingFavoriteArticle(null);
                if (!token) {
                  setActiveView("all");
                }
              }}
              className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to News
            </button>
          </nav>

          <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">
              {authScreen === "register" ? "Create Account" : "Sign In"}
            </p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              {authScreen === "register"
                ? "Save your favorite news"
                : "Access your favorites"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {authScreen === "register"
                ? "Create an account to keep favorite articles in your dashboard."
                : "Sign in to continue with your saved favorites."}
            </p>

            <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
              {authScreen === "register" ? (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Name
                  </label>
                  <input
                    value={authForm.name}
                    onChange={(e) =>
                      setAuthForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
              ) : null}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) =>
                    setAuthForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) =>
                    setAuthForm((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Minimum 6 characters"
                  required
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {authSubmitting
                  ? "Please wait..."
                  : authScreen === "register"
                    ? "Create Account"
                    : "Sign In"}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between gap-3">
              <p className="text-sm text-slate-500">
                {authScreen === "register"
                  ? "Already have an account?"
                  : "Need a new account?"}
              </p>
              <button
                type="button"
                onClick={() =>
                  setAuthScreen((prev) =>
                    prev === "register" ? "login" : "register",
                  )
                }
                className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {authScreen === "register" ? "Sign In" : "Register"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <h1 className="text-3xl font-bold">N E W Z</h1>
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
              onClick={() => handleViewChange("all")}
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
              onClick={() => handleViewChange("favorites")}
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

        <div className="mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setIsMobileTagMenuOpen((prev) => !prev)}
            className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 text-left shadow-sm"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                Browse Tags
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {normalizedSelectedTag
                  ? `#${normalizedSelectedTag}`
                  : "All Tags"}
              </p>
            </div>
            <span className="text-2xl font-semibold leading-none text-slate-700">
              {isMobileTagMenuOpen ? "X" : "="}
            </span>
          </button>
        </div>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside
            className={`lg:sticky lg:top-6 lg:w-64 lg:flex-shrink-0 ${
              isMobileTagMenuOpen ? "block" : "hidden"
            } lg:block`}
          >
            <div className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Browse Tags
                </p>
                <h2 className="mt-2 text-lg font-bold text-slate-900">
                  Filter by category
                </h2>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => applyTagQuery("")}
                  className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                    normalizedSelectedTag
                      ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      : "bg-slate-900 text-white"
                  }`}
                >
                  All Tags
                </button>

                {availableTags.map((tag) => {
                  const isActive = normalizedSelectedTag === tag.toLowerCase();

                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => applyTagQuery(tag)}
                      className={`w-full rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                        isActive
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="mb-6 grid grid-cols-2 gap-3 rounded-2xl bg-white p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
              <SearchField
                id="tag-search"
                label="Search by tag"
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
              >
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
              </SearchField>
              <SearchField
                id="title-search"
                label="Search by title"
                value={titleQuery}
                onChange={(e) => {
                  setTitleQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search headline text..."
              />

              <div className="min-w-0 lg:mt-0">
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
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>
              <div className="mt-7 flex items-center">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="whitespace-nowrap rounded-xl bg-slate-200 p-3 text-sm font-semibold text-slate-700 lg:self-end lg:p-4"
                >
                  Clear Filters
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[40vh] items-center justify-center">
                <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-left shadow-lg">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
                    Fetching News
                  </p>
                  <h2 className="mt-3 text-2xl font-bold text-slate-800">
                    {loadingProgress}%
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {loadingMessage}
                  </p>
                  <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="loader-bar h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-[width] duration-300 ease-out"
                      style={{ width: `${loadingProgress}%` }}
                    />
                  </div>
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
                              article.isFavorite
                                ? "Remove favorite"
                                : "Add favorite"
                            }
                          >
                            {article.isFavorite ? (
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
      </div>
    </div>
  );
}

export default App;
