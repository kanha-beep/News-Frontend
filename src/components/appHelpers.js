import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_URI;
export const TOKEN_STORAGE_KEY = "newsAuthToken";
export const BLOG_APP_URL =
  import.meta.env.VITE_BLOG_APP_URL ||
  "https://blogs-frontend-omega.vercel.app";
export const BLOG_SYNC_API_URL = `${BLOG_APP_URL}/api/auth/sync-login`;
export const THEME_STORAGE_KEY = "newsThemeMode";
export const NEWS_CACHE_KEY = "newsFeedCache";
export const TAGS_CACHE_KEY = "newsTagsCache";
export const ARTICLE_SHARE_PARAM = "article";
export const VIEW_QUERY_PARAM = "view";
export const SUPPORTED_VIEWS = new Set(["all", "favorites", "alerts"]);
const MAX_VISIBLE_TAG_LENGTH = 10;
const EXCLUDED_VISIBLE_TAGS = new Set(["photo", "photos"]);

const getSearchParams = () => {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
};

export const updateUrlParams = ({ article, view } = {}) => {
  const params = getSearchParams();

  if (article === null) {
    params.delete(ARTICLE_SHARE_PARAM);
  } else if (typeof article === "string") {
    if (article.trim()) {
      params.set(ARTICLE_SHARE_PARAM, article.trim());
    } else {
      params.delete(ARTICLE_SHARE_PARAM);
    }
  }

  if (view === null) {
    params.delete(VIEW_QUERY_PARAM);
  } else if (typeof view === "string") {
    if (view.trim() && view !== "all") {
      params.set(VIEW_QUERY_PARAM, view);
    } else {
      params.delete(VIEW_QUERY_PARAM);
    }
  }

  const search = params.toString();
  const nextUrl = `${window.location.pathname}${search ? `?${search}` : ""}`;
  window.history.replaceState({}, "", nextUrl);
};

export const getInitialViewFromUrl = () => {
  const view = getSearchParams().get(VIEW_QUERY_PARAM) || "";
  return SUPPORTED_VIEWS.has(view) ? view : "all";
};

export const parseSelectedTags = (value = "") =>
  value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

export const sanitizeVisibleTags = (values = []) =>
  [...new Set((Array.isArray(values) ? values : [values]).map((value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, ""),
  ))].filter(
    (tag) =>
      tag &&
      !EXCLUDED_VISIBLE_TAGS.has(tag) &&
      tag.length <= MAX_VISIBLE_TAG_LENGTH,
  );

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

export const getNewsPayloadSignature = (payload) =>
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

export const isDefaultFeedRequest = (view, tag, title, date) =>
  view === "all" && !tag.trim() && !title.trim() && !date;

export const getCachedNewsPayload = () =>
  readCachedJson(NEWS_CACHE_KEY, {
    items: [],
    total: 0,
    totalPages: 1,
  });

export const getCachedTags = () =>
  sanitizeVisibleTags(readCachedJson(TAGS_CACHE_KEY, []));

export const cacheJsonValue = writeCachedJson;

export const getInitialSharedArticleLink = () => {
  try {
    return getSearchParams().get(ARTICLE_SHARE_PARAM) || "";
  } catch {
    return "";
  }
};

export const urlBase64ToUint8Array = (value) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = `${base64}${padding}`;
  const rawData = window.atob(normalized);
  const outputArray = new Uint8Array(rawData.length);

  for (let index = 0; index < rawData.length; index += 1) {
    outputArray[index] = rawData.charCodeAt(index);
  }

  return outputArray;
};

const mountBlogSessionBridge = (blogToken) => {
  if (!blogToken || typeof document === "undefined") return;

  const iframe = document.createElement("iframe");
  iframe.src = `${BLOG_APP_URL}/auth#newsBridgeToken=${encodeURIComponent(blogToken)}`;
  iframe.style.display = "none";
  iframe.setAttribute("aria-hidden", "true");
  document.body.appendChild(iframe);

  window.setTimeout(() => {
    iframe.remove();
  }, 4000);
};

export const syncBlogSession = async ({ name, email, password }) => {
  if (!email || !password) return { synced: false };

  try {
    const res = await axios.post(BLOG_SYNC_API_URL, { name, email, password });
    const blogToken = res.data?.token || "";

    if (blogToken) {
      mountBlogSessionBridge(blogToken);
      return { synced: true };
    }

    return { synced: false };
  } catch (error) {
    return {
      synced: false,
      message:
        error?.response?.data?.message ||
        "News login worked, but the blog session could not be prepared.",
    };
  }
};

export function formatCommentTime(value) {
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
