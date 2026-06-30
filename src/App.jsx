import { useEffect, useRef, useState } from "react";
import axios from "axios";
import BottomNavbar from "./components/BottomNavbar.jsx";
import SearchField from "./components/SearchField.jsx";
import {
  AlertsView,
  MobileTagMenu,
  NewsFeedView,
} from "./components/activeView/index.js";
import { AppProvider } from "./context/AppContext.jsx";
import {
  FaFilter,
  FaMoon,
  FaNewspaper,
  FaRegBell,
  FaSearch,
  FaSun,
  FaTimes,
} from "react-icons/fa";
import TopNavbar from "./components/TopNavbar.jsx";
import {
  API_BASE_URL,
  NEWS_CACHE_KEY,
  TAGS_CACHE_KEY,
  TOKEN_STORAGE_KEY,
  THEME_STORAGE_KEY,
  getCachedNewsPayload,
  getCachedTags,
  getInitialSharedArticleLink,
  getInitialViewFromUrl,
  getNewsPayloadSignature,
  isDefaultFeedRequest,
  parseSelectedTags,
  updateUrlParams,
  urlBase64ToUint8Array,
  cacheJsonValue,
  syncBlogSession,
  formatCommentTime,
} from "./components/appHelpers.js";

function App() {
  const [news, setNews] = useState(() => getCachedNewsPayload().items || []);
  const [availableTags, setAvailableTags] = useState(() => getCachedTags());
  const [isMobileTagMenuOpen, setIsMobileTagMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_STORAGE_KEY) || "",
  );
  const [isDarkMode, setIsDarkMode] = useState(
    () => localStorage.getItem(THEME_STORAGE_KEY) === "dark",
  );
  const [currentUser, setCurrentUser] = useState(null);
  const [activeView, setActiveView] = useState(() => getInitialViewFromUrl());
  const [tagQuery, setTagQuery] = useState("");
  const [titleQuery, setTitleQuery] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [tagBrowserQuery, setTagBrowserQuery] = useState("");
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
  const [pendingDislikeLinks, setPendingDislikeLinks] = useState({});
  const [dislikeBurstLinks, setDislikeBurstLinks] = useState({});
  const [commentModalArticle, setCommentModalArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentSubmitting, setCommentSubmitting] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [alertForm, setAlertForm] = useState({ topic: "", type: "topic" });
  const [alertSubmitting, setAlertSubmitting] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [pushState, setPushState] = useState({
    supported: false,
    permission: "default",
    enabled: false,
    loading: true,
    busy: false,
  });
  const [textScale, setTextScale] = useState(1);
  const loadingProgressRef = useRef(0);
  const loadingAnimationRef = useRef(null);
  const hasBootstrappedRef = useRef(false);
  const likeBurstTimeoutsRef = useRef({});
  const dislikeBurstTimeoutsRef = useRef({});
  const visitTrackedRef = useRef(false);
  const serviceWorkerRegistrationRef = useRef(null);
  const loadMoreRef = useRef(null);

  const appContextValue = {
    authScreen,
    setAuthScreen,
    pendingFavoriteArticle,
    setPendingFavoriteArticle,
    token,
    setToken,
    isDarkMode,
    currentUser,
    setCurrentUser,
    activeView,
    setActiveView,
    alerts,
    setAlerts,
    textScale,
  };

  const applyNewsPayload = (payload, { append = false } = {}) => {
    const incomingItems = payload?.items || [];

    setNews((prev) => {
      if (!append) {
        return incomingItems;
      }

      const merged = [...prev];
      const seenLinks = new Set(prev.map((item) => item.link));

      for (const item of incomingItems) {
        if (!seenLinks.has(item.link)) {
          merged.push(item);
          seenLinks.add(item.link);
        }
      }

      return merged;
    });
    setTotalItems(payload?.total || 0);
    setTotalPages(payload?.totalPages || 1);
  };

  const cacheDefaultFeed = (payload, tags = availableTags) => {
    cacheJsonValue(NEWS_CACHE_KEY, {
      items: payload?.items || [],
      total: payload?.total || 0,
      totalPages: payload?.totalPages || 1,
      savedAt: new Date().toISOString(),
    });
    cacheJsonValue(TAGS_CACHE_KEY, tags || []);
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

  const registerPushServiceWorker = async () => {
    if (!("serviceWorker" in navigator)) {
      return null;
    }

    if (serviceWorkerRegistrationRef.current) {
      return serviceWorkerRegistrationRef.current;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    serviceWorkerRegistrationRef.current = registration;
    return registration;
  };

  const loadAlerts = async (authToken = token, shouldApply = true) => {
    if (!authToken) {
      if (shouldApply) {
        setAlerts([]);
      }
      return [];
    }

    const res = await axios.get(`${API_BASE_URL}/api/alerts/check`, {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const items = res.data?.items || [];

    if (shouldApply) {
      setAlerts(items);
    }

    return items;
  };

  const loadPushStatus = async (authToken = token) => {
    const supported =
      typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window;

    if (!supported) {
      setPushState({
        supported: false,
        permission: "unsupported",
        enabled: false,
        loading: false,
        busy: false,
      });
      return;
    }

    const permission = Notification.permission || "default";

    if (!authToken) {
      setPushState({
        supported: true,
        permission,
        enabled: false,
        loading: false,
        busy: false,
      });
      return;
    }

    setPushState((prev) => ({
      ...prev,
      supported: true,
      permission,
      loading: true,
    }));

    try {
      const registration = await registerPushServiceWorker();
      const existingSubscription =
        await registration?.pushManager.getSubscription();
      const res = await axios.get(`${API_BASE_URL}/api/push/subscriptions`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setPushState((prev) => ({
        ...prev,
        supported: true,
        permission,
        enabled: Boolean(
          existingSubscription || (res.data?.items || []).length,
        ),
        loading: false,
      }));
    } catch {
      setPushState((prev) => ({
        ...prev,
        supported: true,
        permission,
        enabled: false,
        loading: false,
      }));
    }
  };

  const loadNews = async (
    view = activeView,
    tag = tagQuery,
    title = titleQuery,
    date = dateFilter,
    page = currentPage,
    authToken = token,
    append = false,
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
      applyNewsPayload(payload, { append });

      if (isDefaultFeedRequest(view, tag, title, date) && page === 1) {
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

  const selectedTags = parseSelectedTags(tagQuery);
  const selectedTagSet = new Set(selectedTags);

  const matchingTags = availableTags.filter((tag) => {
    const normalizedTagFilter = tagBrowserQuery.trim().toLowerCase();

    if (!normalizedTagFilter) {
      return true;
    }

    return tag.toLowerCase().includes(normalizedTagFilter);
  });
  const filteredBrowserTags = availableTags.filter((tag) => {
    const normalizedTagFilter = tagBrowserQuery.trim().toLowerCase();

    if (!normalizedTagFilter) {
      return true;
    }

    return tag.toLowerCase().includes(normalizedTagFilter);
  });

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
    updateUrlParams({ view: activeView });
  }, [activeView]);

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPushState((prev) => ({
        ...prev,
        supported: false,
        permission: "unsupported",
        loading: false,
      }));
      return;
    }

    registerPushServiceWorker()
      .catch(() => null)
      .finally(() => {
        setPushState((prev) => ({
          ...prev,
          supported: "PushManager" in window,
          permission: Notification.permission || "default",
          loading: false,
        }));
      });
  }, []);

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
            await loadPushStatus(token);
          } catch {
            setToken("");
            setCurrentUser(null);
            setPushState((prev) => ({
              ...prev,
              enabled: false,
              loading: false,
            }));
          }
        } else {
          await loadPushStatus("");
        }

        setLoadingMessage("Loading tags and headlines...");
        if (!hasCachedNews) {
          await animateLoadingProgress(72, 400);
        }

        const [nextTags, latestPayload] = await Promise.all([
          loadTags(false),
          sharedArticleLink
            ? loadSharedArticle(sharedArticleLink, token, false)
            : loadNews("all", "", "", "", 1, token, false, false),
        ]);

        const hasDefaultScreenOpen =
          !sharedArticleLink &&
          isDefaultFeedRequest(activeView, tagQuery, titleQuery, dateFilter);
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
      Object.values(dislikeBurstTimeoutsRef.current).forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
    };
  }, []);

  useEffect(() => {
    loadPushStatus(token);
  }, [token]);

  useEffect(() => {
    if (loading || authScreen) return;

    if ((activeView === "favorites" || activeView === "alerts") && !token) {
      openAuthScreen("login");
    }
  }, [activeView, authScreen, loading, token]);

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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown",
      language: navigator.language || "",
    };

    axios.post(`${API_BASE_URL}/api/analytics/visit`, payload).catch(() => {});
  }, []);

  useEffect(() => {
    if (!hasBootstrappedRef.current) return;
    if (loading || authScreen) return;

    const updateNews = async () => {
      if (activeView === "alerts" && !token) {
        return;
      }

      if (currentPage > 1) {
        setIsLoadingMore(true);
      } else {
        setRefreshing(true);
      }
      setError("");

      try {
        if (activeView === "alerts") {
          await loadAlerts(token);
        } else {
          await loadNews(
            activeView,
            tagQuery,
            titleQuery,
            dateFilter,
            currentPage,
            token,
            currentPage > 1,
          );
        }

        if (sharedArticleLink && activeView !== "alerts") {
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
        setIsLoadingMore(false);
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
  }, [activeView, dateFilter, tagQuery, titleQuery, sharedArticleLink]);

  useEffect(() => {
    if (
      !loadMoreRef.current ||
      loading ||
      refreshing ||
      activeView === "alerts" ||
      sharedArticleLink ||
      currentPage >= totalPages
    ) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (entry?.isIntersecting) {
          setCurrentPage((page) => {
            if (page >= totalPages) {
              return page;
            }

            return page + 1;
          });
        }
      },
      { rootMargin: "200px 0px" },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [
    activeView,
    currentPage,
    loading,
    refreshing,
    sharedArticleLink,
    totalPages,
  ]);

  useEffect(() => {
    if (!isDefaultFeedRequest(activeView, tagQuery, titleQuery, dateFilter)) {
      setPendingLatestNews(null);
      setPendingLatestTags([]);
    }
  }, [activeView, tagQuery, titleQuery, dateFilter]);

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
    updateUrlParams({ article: null });
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
      const nextUser = res.data?.user || null;
      setCurrentUser(nextUser);

      const blogSyncResult = await syncBlogSession({
        name:
          nextUser?.name ||
          authForm.name ||
          authForm.email?.split("@")[0] ||
          "",
        email: authForm.email,
        password: authForm.password,
      });

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
          false,
        );
      }

      if (activeView === "alerts") {
        await Promise.all([loadAlerts(nextToken), loadPushStatus(nextToken)]);
      }

      setAuthScreen(null);
      setToast({
        show: true,
        message: blogSyncResult?.message
          ? `${authScreen === "register" ? "Account created" : "Signed in"}. ${blogSyncResult.message}`
          : authScreen === "register"
            ? "Account created across News and Blogs"
            : "Signed in across News and Blogs",
        type: blogSyncResult?.message ? "info" : "success",
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
        setCurrentPage(1);
        await loadNews(
          activeView,
          tagQuery,
          titleQuery,
          dateFilter,
          1,
          token,
          false,
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

    if (pendingLikeLinks[article.link] || pendingDislikeLinks[article.link]) {
      return;
    }

    const nextLikedState = !article.isLiked;
    const nextDislikedState = nextLikedState ? false : article.isDisliked;
    setPendingLikeLinks((prev) => ({ ...prev, [article.link]: true }));
    setLikeBurstLinks((prev) => ({ ...prev, [article.link]: true }));
    setNews((prev) =>
      prev.map((item) =>
        item.link === article.link
          ? {
              ...item,
              isLiked: nextLikedState,
              isDisliked: nextDislikedState,
              likeCount: Math.max(
                0,
                (item.likeCount || 0) + (nextLikedState ? 1 : -1),
              ),
              dislikeCount:
                article.isDisliked && nextLikedState
                  ? Math.max(0, (item.dislikeCount || 0) - 1)
                  : item.dislikeCount || 0,
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
      const isDisliked = Boolean(res.data?.disliked);
      setCurrentUser(res.data?.user || currentUser);
      setNews((prev) =>
        prev.map((item) =>
          item.link === article.link
            ? {
                ...item,
                isLiked,
                isDisliked,
                likeCount:
                  isLiked === nextLikedState
                    ? item.likeCount || 0
                    : Math.max(0, (item.likeCount || 0) + (isLiked ? 1 : -1)),
                dislikeCount:
                  isDisliked === nextDislikedState
                    ? item.dislikeCount || 0
                    : Math.max(
                        0,
                        (item.dislikeCount || 0) + (isDisliked ? 1 : -1),
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
                dislikeCount: article.dislikeCount || 0,
                isLiked: article.isLiked,
                isDisliked: article.isDisliked,
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

  const handleToggleDislike = async (article) => {
    if (!token) {
      openAuthScreen("login");
      setToast({
        show: true,
        message: "Sign in to dislike this article",
        type: "info",
      });
      return;
    }

    if (pendingDislikeLinks[article.link] || pendingLikeLinks[article.link]) {
      return;
    }

    const nextDislikedState = !article.isDisliked;
    const nextLikedState = nextDislikedState ? false : article.isLiked;
    setPendingDislikeLinks((prev) => ({ ...prev, [article.link]: true }));
    setDislikeBurstLinks((prev) => ({ ...prev, [article.link]: true }));
    setNews((prev) =>
      prev.map((item) =>
        item.link === article.link
          ? {
              ...item,
              isDisliked: nextDislikedState,
              isLiked: nextLikedState,
              dislikeCount: Math.max(
                0,
                (item.dislikeCount || 0) + (nextDislikedState ? 1 : -1),
              ),
              likeCount:
                article.isLiked && nextDislikedState
                  ? Math.max(0, (item.likeCount || 0) - 1)
                  : item.likeCount || 0,
            }
          : item,
      ),
    );

    if (dislikeBurstTimeoutsRef.current[article.link]) {
      clearTimeout(dislikeBurstTimeoutsRef.current[article.link]);
    }
    dislikeBurstTimeoutsRef.current[article.link] = setTimeout(() => {
      setDislikeBurstLinks((prev) => ({ ...prev, [article.link]: false }));
      delete dislikeBurstTimeoutsRef.current[article.link];
    }, 380);

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/dislikes/toggle`,
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
      const isDisliked = Boolean(res.data?.disliked);
      setCurrentUser(res.data?.user || currentUser);
      setNews((prev) =>
        prev.map((item) =>
          item.link === article.link
            ? {
                ...item,
                isLiked,
                isDisliked,
                likeCount:
                  isLiked === nextLikedState
                    ? item.likeCount || 0
                    : Math.max(0, (item.likeCount || 0) + (isLiked ? 1 : -1)),
                dislikeCount:
                  isDisliked === nextDislikedState
                    ? item.dislikeCount || 0
                    : Math.max(
                        0,
                        (item.dislikeCount || 0) +
                          (isDisliked ? 1 : -1),
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
                dislikeCount: article.dislikeCount || 0,
                isLiked: article.isLiked,
                isDisliked: article.isDisliked,
              }
            : item,
        ),
      );
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Unable to update dislike.",
      );
    } finally {
      setPendingDislikeLinks((prev) => ({ ...prev, [article.link]: false }));
    }
  };

  const handleViewChange = (view) => {
    clearSharedArticleFocus();

    if ((view === "favorites" || view === "alerts") && !token) {
      setActiveView(view);
      openAuthScreen("login");
      return;
    }

    setActiveView(view);
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
      text: article.title || "Open this news in Lightning News",
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

  const handleCreateAlert = async (e) => {
    e.preventDefault();

    if (!token) {
      openAuthScreen("login");
      return;
    }

    const topic = alertForm.topic.trim();
    if (!topic) {
      setError("Topic is required to create an alert.");
      return;
    }

    setAlertSubmitting(true);
    setError("");

    try {
      await axios.post(
        `${API_BASE_URL}/api/alerts`,
        {
          topic,
          type: alertForm.type,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setAlertForm({ topic: "", type: "topic" });
      await loadAlerts(token);
      setToast({
        show: true,
        message: "Alert created",
        type: "success",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create alert.");
    } finally {
      setAlertSubmitting(false);
    }
  };

  const handleToggleAlert = async (alertId, enabled) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/alerts/${alertId}`,
        { enabled },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      await loadAlerts(token);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update alert.");
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/alerts/${alertId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await loadAlerts(token);
      setToast({
        show: true,
        message: "Alert removed",
        type: "success",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to remove alert.");
    }
  };

  const handleEnablePush = async () => {
    if (!token) {
      openAuthScreen("login");
      return;
    }

    if (Notification.permission === "denied") {
      setToast({
        show: true,
        message: "Browser notifications are blocked for this site",
        type: "info",
      });
      setPushState((prev) => ({ ...prev, permission: "denied" }));
      return;
    }

    setPushState((prev) => ({ ...prev, busy: true }));
    setError("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setPushState((prev) => ({
          ...prev,
          permission,
          enabled: false,
          busy: false,
        }));
        return;
      }

      const registration = await registerPushServiceWorker();
      const keyRes = await axios.get(`${API_BASE_URL}/api/push/public-key`);
      const existingSubscription =
        await registration.pushManager.getSubscription();
      const subscription =
        existingSubscription ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(
            keyRes.data?.publicKey || "",
          ),
        }));

      await axios.post(
        `${API_BASE_URL}/api/push/subscribe`,
        { subscription },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setPushState((prev) => ({
        ...prev,
        permission,
        enabled: true,
        busy: false,
      }));
      setToast({
        show: true,
        message: "Push notifications enabled",
        type: "success",
      });
    } catch (err) {
      setPushState((prev) => ({ ...prev, busy: false }));
      setError(
        err?.response?.data?.message || "Unable to enable push notifications.",
      );
    }
  };

  const handleDisablePush = async () => {
    setPushState((prev) => ({ ...prev, busy: true }));
    setError("");

    try {
      const registration = await registerPushServiceWorker();
      const subscription = await registration?.pushManager.getSubscription();

      if (subscription) {
        await axios.post(
          `${API_BASE_URL}/api/push/unsubscribe`,
          { endpoint: subscription.endpoint },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        await subscription.unsubscribe();
      }

      setPushState((prev) => ({
        ...prev,
        enabled: false,
        busy: false,
      }));
      setToast({
        show: true,
        message: "Push notifications disabled",
        type: "success",
      });
    } catch (err) {
      setPushState((prev) => ({ ...prev, busy: false }));
      setError(
        err?.response?.data?.message || "Unable to disable push notifications.",
      );
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
    setCurrentPage(1);

    try {
      await syncNews();
      if (activeView === "alerts") {
        await Promise.all([loadAlerts(), loadPushStatus()]);
      } else {
        await Promise.all([
          loadTags(),
          sharedArticleLink
            ? loadSharedArticle(sharedArticleLink)
            : loadNews(
                activeView,
                tagQuery,
                titleQuery,
                dateFilter,
                1,
                token,
                false,
              ),
        ]);
      }
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
    setIsMobileTagMenuOpen(false);
  };

  const applyTagQuery = (tag) => {
    clearSharedArticleFocus();
    const normalizedTag = String(tag || "")
      .trim()
      .toLowerCase();

    if (!normalizedTag) {
      setTagQuery("");
      setShowTagSuggestions(false);
      setIsMobileTagMenuOpen(false);
      setTagBrowserQuery("");
      return;
    }

    const nextTags = selectedTagSet.has(normalizedTag)
      ? selectedTags.filter((item) => item !== normalizedTag)
      : [...selectedTags, normalizedTag];

    setTagQuery(nextTags.join(","));
    setShowTagSuggestions(false);
    setIsMobileTagMenuOpen(false);
    setTagBrowserQuery("");
  };

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const openTagBrowser = () => {
    setIsMobileTagMenuOpen(true);
  };

  const openSearchModal = () => {
    setIsSearchModalOpen(true);
  };

  const increaseTextScale = () => {
    setTextScale((prev) => Math.min(1.35, Number((prev + 0.1).toFixed(2))));
  };

  const decreaseTextScale = () => {
    setTextScale((prev) => Math.max(0.9, Number((prev - 0.1).toFixed(2))));
  };

  if (authScreen) {
    return (
      <AppProvider value={appContextValue}>
        <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <TopNavbar
              toggleThemeMode={toggleThemeMode}
              handleRefresh={handleRefresh}
              pendingLatestNews={pendingLatestNews}
              handleApplyLatestNews={handleApplyLatestNews}
              totalItems={totalItems}
              increaseTextScale={increaseTextScale}
              decreaseTextScale={decreaseTextScale}
              openAuthScreen={openAuthScreen}
            />

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
                        setAuthForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
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
                      setAuthForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
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
                  {authScreen === "register" ? "SignIn" : "Register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </AppProvider>
    );
  }

  return (
    <AppProvider value={appContextValue}>
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
      <div className="px-4 pt-44 sm:px-6 sm:pb-28 sm:pt-36 lg:px-8">
        <TopNavbar
          toggleThemeMode={toggleThemeMode}
          handleRefresh={handleRefresh}
          pendingLatestNews={pendingLatestNews}
          handleApplyLatestNews={handleApplyLatestNews}
          totalItems={totalItems}
          increaseTextScale={increaseTextScale}
          decreaseTextScale={decreaseTextScale}
          openAuthScreen={openAuthScreen}
        />
        <BottomNavbar
          handleViewChange={handleViewChange}
          openSearchModal={openSearchModal}
          openTagBrowser={openTagBrowser}
        />

        {activeView !== "alerts" && isMobileTagMenuOpen ? (
          <MobileTagMenu
            setIsMobileTagMenuOpen={setIsMobileTagMenuOpen}
            tagBrowserQuery={tagBrowserQuery}
            setTagBrowserQuery={setTagBrowserQuery}
            applyTagQuery={applyTagQuery}
            selectedTags={selectedTags}
            filteredBrowserTags={filteredBrowserTags}
            selectedTagSet={selectedTagSet}
          />
        ) : null}

        {activeView !== "alerts" && isSearchModalOpen ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4">
            <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
                    Search News
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-slate-900">
                    Filter by title and date
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="rounded-full bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="modal-title-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Search headline text
                  </label>
                  <input
                    id="modal-title-search"
                    value={titleQuery}
                    onChange={(e) => {
                      clearSharedArticleFocus();
                      setTitleQuery(e.target.value);
                    }}
                    placeholder="Search headline text..."
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="modal-date-search"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Filter by date
                  </label>
                  <input
                    id="modal-date-search"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      clearSharedArticleFocus();
                      setDateFilter(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside id="tag-sidebar" className="hidden">
            {activeView === "alerts" ? null : (
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
                      selectedTags.length
                        ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        : "bg-slate-900 text-white"
                    }`}
                  >
                    All Tags
                  </button>

                  {availableTags.map((tag) => {
                    const isActive = selectedTagSet.has(tag.toLowerCase());

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
            )}
          </aside>

          <div className="min-w-0 flex-1">
            {activeView === "alerts" ? null : (
              <div className="mt-5">
                <div className="max-w-3xl">
                  {/*
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openTagBrowser}
                    className="rounded-xl bg-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    Tag
                  </button>
                  <div className="relative min-w-0 flex-1">
                    <input
                      id="smart-search"
                      value={titleQuery}
                      onChange={(e) => {
                        clearSharedArticleFocus();
                        setTitleQuery(e.target.value);
                      }}
                      placeholder="Search headline text..."
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  </div>
                </div>
                */}
                  {selectedTags.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTags.map((tag) => (
                        <button
                          key={`selected-${tag}`}
                          type="button"
                          onClick={() => applyTagQuery(tag)}
                          className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                        >
                          #{tag} x
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div className="min-w-0 lg:mt-0">
                  {/* <label
                  htmlFor="date-search"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Search by date
                </label> */}
                  {/*
                <div className="flex items-center gap-2">
                  <input
                    id="date-search"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => {
                      clearSharedArticleFocus();
                      setDateFilter(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-700"
                    aria-label="Clear filters"
                    title="Clear filters"
                  >
                    <FaTimes />
                  </button>
                  <button
                    type="button"
                    onClick={toggleThemeMode}
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-200 text-sm font-semibold text-slate-700"
                    aria-label={isDarkMode ? "Light mode" : "Dark mode"}
                    title={isDarkMode ? "Light mode" : "Dark mode"}
                  >
                    {isDarkMode ? <FaSun /> : <FaMoon />}
                  </button>
                </div>
                */}
                </div>
              </div>
            )}

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

                {activeView === "alerts" ? (
                  <AlertsView
                    pushState={pushState}
                    handleDisablePush={handleDisablePush}
                    handleEnablePush={handleEnablePush}
                    loadPushStatus={loadPushStatus}
                    token={token}
                    alertForm={alertForm}
                    setAlertForm={setAlertForm}
                    handleCreateAlert={handleCreateAlert}
                    alertSubmitting={alertSubmitting}
                    alerts={alerts}
                    handleReadArticle={handleReadArticle}
                    handleToggleAlert={handleToggleAlert}
                    handleDeleteAlert={handleDeleteAlert}
                  />
                ) : (
                  <NewsFeedView
                    news={news}
                    applyTagQuery={applyTagQuery}
                    handleToggleFavorite={handleToggleFavorite}
                    textScale={textScale}
                    handleReadArticle={handleReadArticle}
                    handleCreateBlog={handleCreateBlog}
                    handleReadBlog={handleReadBlog}
                    handleToggleLike={handleToggleLike}
                    handleToggleDislike={handleToggleDislike}
                    pendingLikeLinks={pendingLikeLinks}
                    likeBurstLinks={likeBurstLinks}
                    pendingDislikeLinks={pendingDislikeLinks}
                    dislikeBurstLinks={dislikeBurstLinks}
                    handleCommentClick={handleCommentClick}
                    handleShareArticle={handleShareArticle}
                    activeView={activeView}
                    sharedArticleLink={sharedArticleLink}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loadMoreRef={loadMoreRef}
                    refreshing={refreshing}
                    loading={loading}
                    isLoadingMore={isLoadingMore}
                    totalItems={totalItems}
                  />
                )}
              </>
            )}
        </div>
      </div>
      </div>
      </div>
    </AppProvider>
  );
}

export default App;
