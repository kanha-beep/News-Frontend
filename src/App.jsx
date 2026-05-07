import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaArrowUp,
  FaBookmark,
  FaCommentDots,
  FaEye,
  FaHeart,
  FaPencilAlt,
  FaRegBookmark,
  FaRegHeart,
  FaShareAlt,
} from "react-icons/fa";

const API_BASE_URL = import.meta.env.VITE_API_URI;
const TOKEN_STORAGE_KEY = "newsAuthToken";
const BLOG_APP_URL =
  import.meta.env.VITE_BLOG_APP_URL ||
  "https://blogs-frontend-omega.vercel.app";
const THEME_STORAGE_KEY = "newsThemeMode";
const NEWS_CACHE_KEY = "newsFeedCache";
const TAGS_CACHE_KEY = "newsTagsCache";
const ARTICLE_SHARE_PARAM = "article";

const readCachedJson = (key, fallback) => {
  try {
    const rawValue = localStorage.getItem(key);
    return rawValue ? JSON.parse(rawValue) : fallback;
  } catch {
    return fallback;
  }
};

const writeCachedJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore local cache write failures.
  }
};

const getNewsPayloadSignature = (payload) =>
  JSON.stringify({
    total: payload?.total || 0,
    totalPages: payload?.totalPages || 1,
    items: (payload?.items || []).map((item) => ({
      link: item.link,
      blogId: item.blogId || "",
      title: item.title || "",
      pubDate: item.pubDate || "",
    })),
  });

const isDefaultFeedRequest = (view, tag, title, date, page) =>
  view === "all" && !tag.trim() && !title.trim() && !date && Number(page) === 1;

const getCachedNewsPayload = () =>
  readCachedJson(NEWS_CACHE_KEY, {
    items: [],
    total: 0,
    totalPages: 1,
  });

const getCachedTags = () => readCachedJson(TAGS_CACHE_KEY, []);
const getInitialSharedArticleLink = () => {
  try {
    return (
      new URLSearchParams(window.location.search).get(ARTICLE_SHARE_PARAM) || ""
    );
  } catch {
    return "";
  }
};

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

function formatCommentTime(value) {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Just now";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function App() {
  const [news, setNews] = useState(() => getCachedNewsPayload().items || []);
  const [availableTags, setAvailableTags] = useState(() => getCachedTags());
  const [isMobileTagMenuOpen, setIsMobileTagMenuOpen] = useState(false);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) === "dark",
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState("all");
  const [searchMode, setSearchMode] = useState("tag");
  const [tagQuery, setTagQuery] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(
    () => getCachedNewsPayload().total || 0,
  );
  const [totalPages, setTotalPages] = useState(
    () => getCachedNewsPayload().totalPages || 1,
  );
  const [loading, setLoading] = useState(
    () => (getCachedNewsPayload().items || []).length === 0,
  );
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Fetching news...");
  const [refreshing, setRefreshing] = useState(false);
  const [pendingLatestNews, setPendingLatestNews] = useState(null);
  const [pendingLatestTags, setPendingLatestTags] = useState([]);
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
  const [sharedArticleLink, setSharedArticleLink] = useState(() =>
    getInitialSharedArticleLink(),
  );
  const [pendingLikeLinks, setPendingLikeLinks] = useState({});
  const [likeBurstLinks, setLikeBurstLinks] = useState({});
  const [commentModalArticle, setCommentModalArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const loadingProgressRef = useRef(0);
  const loadingAnimationRef = useRef(null);
  const hasBootstrappedRef = useRef(false);
  const likeBurstTimeoutsRef = useRef({});
  const visitTrackedRef = useRef(false);

  const applyNewsPayload = (payload) => {
    setNews(payload?.items || []);
    setTotalItems(payload?.total || 0);
    setTotalPages(payload?.totalPages || 1);
  };

  const cacheDefaultFeed = (payload, tags = availableTags) => {
    writeCachedJson(NEWS_CACHE_KEY, {
      items: payload?.items || [],
      total: payload?.total || 0,
      totalPages: payload?.totalPages || 1,
      savedAt: new Date().toISOString(),
    });
    writeCachedJson(TAGS_CACHE_KEY, tags || []);
  };

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

  const loadTags = async (shouldApply = true) => {
    const res = await axios.get(`${API_BASE_URL}/api/tags`);
    const items = res.data?.items || [];

    if (shouldApply) {
      setAvailableTags(items);
    }

    return items;
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
    shouldApply = true,
  ) => {
    if (view === "favorites" && !authToken) {
      setNews([]);
      setTotalItems(0);
      setTotalPages(1);
      return {
        items: [],
        total: 0,
        totalPages: 1,
      };
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
    const payload = {
      items: res.data?.items || [],
      total: res.data?.total || 0,
      totalPages: res.data?.totalPages || 1,
    };

    if (shouldApply) {
      applyNewsPayload(payload);

      if (isDefaultFeedRequest(view, tag, title, date, page)) {
        cacheDefaultFeed(payload);
      }
    }

    return payload;
  };

  const loadSharedArticle = async (
    link = sharedArticleLink,
    authToken = token,
    shouldApply = true,
  ) => {
    const normalizedLink = (link || "").trim();
    if (!normalizedLink) {
      return null;
    }

    const res = await axios.get(`${API_BASE_URL}/api/news/article`, {
      params: { link: normalizedLink },
      headers: authToken
        ? {
            Authorization: `Bearer ${authToken}`,
          }
        : {},
    });

    const item = res.data?.item || null;
    if (shouldApply) {
      applyNewsPayload({
        items: item ? [item] : [],
        total: item ? 1 : 0,
        totalPages: 1,
      });
    }

    return item;
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
  const activeSearchValue = searchMode === "tag" ? tagQuery : titleQuery;
  const activeSearchPlaceholder =
    searchMode === "tag"
      ? "Type a tag like politics, crime, sports..."
      : "Search headline text...";

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, [token]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
    document.body.classList.toggle("dark-mode", isDarkMode);
  }, [isDarkMode]);

  useEffect(() => {
    const bootstrap = async () => {
      const cachedPayload = getCachedNewsPayload();
      const cachedTags = getCachedTags();
      const hasCachedNews =
        !sharedArticleLink && (cachedPayload.items || []).length > 0;

      setLoading(!hasCachedNews);
      updateLoadingProgress(hasCachedNews ? 100 : 0);
      setLoadingMessage(
        hasCachedNews
          ? "Refreshing saved headlines..."
          : "Fetching latest articles...",
      );
      setError("");
      setRefreshing(hasCachedNews);

      try {
        if (!hasCachedNews) {
          await animateLoadingProgress(18, 350);
        } else {
          if (cachedTags.length > 0) {
            setAvailableTags(cachedTags);
          }
          applyNewsPayload(cachedPayload);
        }

        await syncNews();
        setLoadingMessage("Checking your account...");

        if (!hasCachedNews) {
          await animateLoadingProgress(44, 400);
        }

        if (token) {
          try {
            await loadCurrentUser(token);
          } catch {
            setToken("");
            setCurrentUser(null);
          }
        }

        setLoadingMessage("Loading tags and headlines...");
        if (!hasCachedNews) {
          await animateLoadingProgress(72, 400);
        }

        const [nextTags, latestPayload] = await Promise.all([
          loadTags(false),
          sharedArticleLink
            ? loadSharedArticle(sharedArticleLink, token, false)
            : loadNews("all", "", "", "", 1, token, false),
        ]);

        const hasDefaultScreenOpen =
          !sharedArticleLink &&
          isDefaultFeedRequest(
            activeView,
            tagQuery,
            titleQuery,
            dateFilter,
            currentPage,
          );
        const cachedSignature = getNewsPayloadSignature(cachedPayload);
        const latestSignature = sharedArticleLink
          ? JSON.stringify({ item: latestPayload?.link || "" })
          : getNewsPayloadSignature(latestPayload);

        if (
          !sharedArticleLink &&
          hasCachedNews &&
          hasDefaultScreenOpen &&
          latestSignature !== cachedSignature
        ) {
          setPendingLatestNews(latestPayload);
          setPendingLatestTags(nextTags);
        } else {
          setAvailableTags(nextTags);
          if (sharedArticleLink) {
            applyNewsPayload({
              items: latestPayload ? [latestPayload] : [],
              total: latestPayload ? 1 : 0,
              totalPages: 1,
            });
          } else {
            applyNewsPayload(latestPayload);
            cacheDefaultFeed(latestPayload, nextTags);
          }
          setPendingLatestNews(null);
          setPendingLatestTags([]);
        }

        if (!hasCachedNews) {
          setLoadingMessage("Finishing up...");
          await animateLoadingProgress(100, 300);
        }
      } catch (err) {
        setError(
          err?.response?.data?.message || "Unable to load news right now.",
        );
      } finally {
        hasBootstrappedRef.current = true;
        setRefreshing(false);
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

      Object.values(likeBurstTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    if (visitTrackedRef.current) {
      return;
    }

    visitTrackedRef.current = true;

    const payload = {
      pageUrl: window.location.href,
      path: `${window.location.pathname}${window.location.search}`,
      title: document.title,
      referrer: document.referrer || "",
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
      language: navigator.language || "",
    };

    axios.post(`${API_BASE_URL}/api/analytics/visit`, payload).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasBootstrappedRef.current) return;
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
          token,
        );
        if (sharedArticleLink) {
          const sharedItem = await loadSharedArticle(
            sharedArticleLink,
            token,
            false,
          );
          applyNewsPayload({
            items: sharedItem ? [sharedItem] : [],
            total: sharedItem ? 1 : 0,
            totalPages: 1,
          });
        }
        setPendingLatestNews(null);
        setPendingLatestTags([]);
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
    sharedArticleLink,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeView, dateFilter, tagQuery, titleQuery]);

  useEffect(() => {
    if (
      !isDefaultFeedRequest(
        activeView,
        tagQuery,
        titleQuery,
        dateFilter,
        currentPage,
      )
    ) {
      setPendingLatestNews(null);
      setPendingLatestTags([]);
    }
  }, [activeView, tagQuery, titleQuery, dateFilter, currentPage]);

  useEffect(() => {
    if (!toast.show) return;

    const timeout = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 2200);

    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!commentModalArticle?.link) return;

    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError("");

      try {
        const res = await axios.get(`${API_BASE_URL}/api/comments`, {
          params: { link: commentModalArticle.link },
        });
        setComments(res.data?.items || []);
      } catch (err) {
        setCommentsError(
          err?.response?.data?.message || "Unable to load comments right now.",
        );
      } finally {
        setCommentsLoading(false);
      }
    };

    loadComments();
  }, [commentModalArticle]);

  const openAuthScreen = (mode) => {
    setAuthScreen(mode);
    setAuthForm({
      name: "",
      email: "",
      password: "",
    });
    setError("");
  };

  const clearSharedArticleFocus = () => {
    if (!sharedArticleLink) return;

    setSharedArticleLink("");
    window.history.replaceState({}, "", window.location.pathname);
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

  const handleToggleLike = async (article) => {
    if (!token) {
      openAuthScreen("login");
      setToast({
        show: true,
        message: "Sign in to like this article",
        type: "info",
      });
      return;
    }

    if (pendingLikeLinks[article.link]) {
      return;
    }

    const nextLikedState = !article.isLiked;
    setPendingLikeLinks((prev) => ({ ...prev, [article.link]: true }));
    setLikeBurstLinks((prev) => ({ ...prev, [article.link]: true }));
    setNews((prev) =>
      prev.map((item) =>
        item.link === article.link
          ? {
              ...item,
              isLiked: nextLikedState,
              likeCount: Math.max(
                0,
                (item.likeCount || 0) + (nextLikedState ? 1 : -1),
              ),
            }
          : item,
      ),
    );

    if (likeBurstTimeoutsRef.current[article.link]) {
      clearTimeout(likeBurstTimeoutsRef.current[article.link]);
    }
    likeBurstTimeoutsRef.current[article.link] = setTimeout(() => {
      setLikeBurstLinks((prev) => ({ ...prev, [article.link]: false }));
      delete likeBurstTimeoutsRef.current[article.link];
    }, 380);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/likes/toggle`,
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

      const isLiked = Boolean(res.data?.liked);
      setCurrentUser(res.data?.user || currentUser);
      setNews((prev) =>
        prev.map((item) =>
          item.link === article.link
            ? {
                ...item,
                isLiked,
                likeCount:
                  isLiked === nextLikedState
                    ? item.likeCount || 0
                    : Math.max(
                        0,
                        (item.likeCount || 0) + (isLiked ? 1 : -1),
                      ),
              }
            : item,
        ),
      );
    } catch (err) {
      setNews((prev) =>
        prev.map((item) =>
          item.link === article.link
            ? {
                ...item,
                likeCount: article.likeCount || 0,
                isLiked: article.isLiked,
              }
            : item,
        ),
      );
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update like.",
      );
    } finally {
      setPendingLikeLinks((prev) => ({ ...prev, [article.link]: false }));
    }
  };

  const handleViewChange = (view) => {
    clearSharedArticleFocus();

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

  const handleReadBlog = (blogId) => {
    if (!blogId) return;
    window.open(`${BLOG_APP_URL}/${blogId}`, "_blank", "noopener,noreferrer");
  };

  const handleCreateBlog = (article) => {
    const params = new URLSearchParams({
      title: article.title || "",
      url: article.link || "",
      category: (article.tags || []).join(","),
    });

    window.open(
      `${BLOG_APP_URL}/blogsform?${params.toString()}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  const handleCommentClick = (article) => {
    setCommentModalArticle(article);
    setComments([]);
    setCommentsError("");
    setCommentText("");
  };

  const closeCommentModal = () => {
    setCommentModalArticle(null);
    setComments([]);
    setCommentsLoading(false);
    setCommentText("");
    setCommentSubmitting(false);
    setCommentsError("");
  };

  const handleShareArticle = async (article) => {
    const appUrl = new URL(window.location.href);
    appUrl.searchParams.set(ARTICLE_SHARE_PARAM, article.link || "");
    const shareUrl = appUrl.toString();
    const sharePayload = {
      title: article.title || "News article",
      text: article.title || "Open this news in NEWZ",
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(sharePayload);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setToast({
          show: true,
          message: "Article link copied",
          type: "success",
        });
      } else {
        window.open(shareUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      setToast({
        show: true,
        message: "Unable to share this article",
        type: "info",
      });
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentModalArticle?.link) return;

    if (!token) {
      openAuthScreen("login");
      setToast({
        show: true,
        message: "Sign in to add a comment",
        type: "info",
      });
      return;
    }

    const normalizedComment = commentText.trim();
    if (!normalizedComment) {
      setCommentsError("Comment cannot be empty.");
      return;
    }

    setCommentSubmitting(true);
    setCommentsError("");

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/comments`,
        {
          link: commentModalArticle.link,
          content: normalizedComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const createdComment = res.data?.item;
      if (createdComment) {
        setComments((prev) => [createdComment, ...prev]);
        setNews((prev) =>
          prev.map((item) =>
            item.link === commentModalArticle.link
              ? { ...item, commentCount: (item.commentCount || 0) + 1 }
              : item,
          ),
        );
      }
      setCommentText("");
      setToast({
        show: true,
        message: "Comment added",
        type: "success",
      });
    } catch (err) {
      if (err?.response?.status === 401) {
        setToken("");
        setCurrentUser(null);
        openAuthScreen("login");
        return;
      }

      setCommentsError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to add comment.",
      );
    } finally {
      setCommentSubmitting(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      await syncNews();
      await Promise.all([
        loadTags(),
        sharedArticleLink
          ? loadSharedArticle(sharedArticleLink)
          : loadNews(activeView, tagQuery, titleQuery, dateFilter, currentPage),
      ]);
      setPendingLatestNews(null);
      setPendingLatestTags([]);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to refresh news.");
    } finally {
      setRefreshing(false);
    }
  };

  const handleApplyLatestNews = () => {
    if (!pendingLatestNews) return;

    applyNewsPayload(pendingLatestNews);
    setAvailableTags(pendingLatestTags);
    cacheDefaultFeed(pendingLatestNews, pendingLatestTags);
    setPendingLatestNews(null);
    setPendingLatestTags([]);
  };

  const clearAllFilters = () => {
    clearSharedArticleFocus();
    setTagQuery("");
    setTitleQuery("");
    setShowTagSuggestions(false);
    setDateFilter("");
    setCurrentPage(1);
    setIsMobileTagMenuOpen(false);
  };

  const applyTagQuery = (tag) => {
    clearSharedArticleFocus();
    setSearchMode("tag");
    setTagQuery(tag);
    setShowTagSuggestions(false);
    setCurrentPage(1);
    setIsMobileTagMenuOpen(false);
  };

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  if (authScreen) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
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
                  setPendingFavoriteArticle(null);
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
      {commentModalArticle ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
          <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                  Comments
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-900">
                  {commentModalArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeCommentModal}
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
              >
                Close
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {commentsError && !commentSubmitting ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {commentsError}
                </div>
              ) : null}

              {commentsLoading ? (
                <p className="text-sm font-medium text-blue-600">
                  Loading comments...
                </p>
              ) : comments.length === 0 ? (
                <div className="rounded-xl bg-slate-50 px-4 py-6 text-center">
                  <p className="text-sm font-semibold text-slate-700">
                    No comments yet.
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Start the conversation on this article.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="rounded-xl bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-900">
                          {comment.userName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatCommentTime(comment.createdAt)}
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {comment.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <form
              onSubmit={handleCommentSubmit}
              className="border-t border-slate-200 px-5 py-4"
            >
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Add your comment
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Write your thoughts on this news..."
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              />
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-xs text-slate-500">
                  {token
                    ? `${commentText.trim().length}/500`
                    : "Sign in to post your comment"}
                </p>
                <button
                  type="submit"
                  disabled={commentSubmitting}
                  className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {commentSubmitting ? "Posting..." : "Post Comment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <nav className="mb-6 grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[auto_1fr_auto] sm:items-center">
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

          <div className="flex flex-wrap justify-end gap-3">
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
            <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl bg-white p-4 shadow-sm lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-end">
              <div className="max-w-xl">
                <label
                  htmlFor="smart-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("tag");
                      setShowTagSuggestions(Boolean(tagQuery.trim()));
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                      searchMode === "tag"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Tag
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchMode("title");
                      setShowTagSuggestions(false);
                    }}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                      searchMode === "title"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    Title
                  </button>
                  <div className="relative min-w-0 flex-1">
                    <input
                      id="smart-search"
                      value={activeSearchValue}
                      onChange={(e) => {
                        clearSharedArticleFocus();
                        if (searchMode === "tag") {
                          setTagQuery(e.target.value);
                          setShowTagSuggestions(true);
                        } else {
                          setTitleQuery(e.target.value);
                          setCurrentPage(1);
                        }
                      }}
                      onFocus={() => {
                        if (searchMode === "tag") {
                          setShowTagSuggestions(true);
                        }
                      }}
                      onBlur={() => {
                        if (searchMode === "tag") {
                          setTimeout(() => setShowTagSuggestions(false), 150);
                        }
                      }}
                      placeholder={activeSearchPlaceholder}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                    {searchMode === "tag" &&
                    showTagSuggestions &&
                    matchingTags.length > 0 ? (
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
              </div>

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
                    clearSharedArticleFocus();
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                />
              </div>
              <div className="mt-7 flex items-center">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="whitespace-nowrap rounded-xl bg-slate-200 p-3 text-sm font-semibold text-slate-700 lg:self-end lg:p-4"
                  >
                    Clear Filters
                  </button>
                  <button
                    type="button"
                    onClick={toggleThemeMode}
                    className="whitespace-nowrap rounded-xl bg-slate-200 p-3 text-sm font-semibold text-slate-700 lg:self-end lg:p-4"
                  >
                    {isDarkMode ? "Light" : "Dark"}
                  </button>
                </div>
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

                        <p className="line-clamp-4 text-sm leading-6 text-slate-600">
                          {article.description || "No description available."}
                        </p>

                        <div className="mt-auto pt-5">
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => handleReadArticle(article.link)}
                              className="flex items-center justify-center rounded-xl bg-slate-900 p-2 text-sm font-semibold text-white hover:bg-slate-700"
                              aria-label="Read article"
                              title="Read article"
                            >
                              <FaEye />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCreateBlog(article)}
                              className="flex items-center justify-center rounded-xl bg-emerald-600 p-2 text-sm font-semibold text-white hover:bg-emerald-700 btn btn-sm"
                              aria-label="Write your own experience"
                              title="Write your own experience"
                            >
                              <FaPencilAlt />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReadBlog(article.blogId)}
                              disabled={!article.blogId}
                              className={`rounded-xl px-2 py-2 text-sm font-semibold truncate ${
                                article.blogId
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "cursor-not-allowed bg-slate-200 text-slate-500"
                              }`}
                            >
                              {article.blogId ? "Read Blog" : "Blog Pending"}
                            </button>
                          </div>
                          <div className="mt-4 grid grid-cols-3 gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLike(article)}
                              disabled={Boolean(pendingLikeLinks[article.link])}
                              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition duration-300 ${
                                article.isLiked
                                  ? "bg-red-50 text-red-600"
                                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                              } ${
                                pendingLikeLinks[article.link]
                                  ? "cursor-not-allowed opacity-80"
                                  : ""
                              } ${
                                likeBurstLinks[article.link]
                                  ? "scale-110 shadow-lg shadow-red-100"
                                  : "scale-100"
                              }`}
                            >
                              <span className="text-sm font-semibold leading-none">
                                {article.likeCount || 0}
                              </span>
                              {article.isLiked ? <FaHeart /> : <FaRegHeart />}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCommentClick(article)}
                              className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                            >
                              <span className="text-xs font-semibold leading-none">
                                {article.commentCount || 0}
                              </span>
                           
                                <FaCommentDots />
                           
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShareArticle(article)}
                              className="flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                              aria-label="Share article"
                              title="Share article"
                            >
                              <FaShareAlt />
                            </button>
                          </div>
                        </div>
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
                          setCurrentPage((page) =>
                            Math.min(totalPages, page + 1),
                          )
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
