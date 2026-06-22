import React from "react";

export default function NewsCard({
  news,
  applyTagQuery,
  handleToggleFavorite,
  textScale,
  handleReadArticle,
  handleCreateBlog,
  handleReadBlog,
  handleToggleLike,
  pendingLikeLinks,
  likeBurstLinks,
  handleCommentClick,
  handleShareArticle,
  activeView,
  sharedArticleLink,
  currentPage,
  totalPages,
  loadMoreRef,
  refreshing,
  loading,
  isLoadingMore,
}) {
  return (
    <div>
      <div className="mx-auto grid max-w-3xl gap-6">
        {news.map((article) => (
          <article
            key={article._id || article.link}
            className="flex min-h-[calc(100dvh-16.5rem)] flex-col rounded-[2rem] bg-white px-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg sm:min-h-[60vh] sm:p-5"
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {(article.tags?.length ? article.tags : ["untagged"]).map(
                  (tag) => (
                    <button
                      key={`${article.link}-${tag}`}
                      type="button"
                      onClick={() => applyTagQuery(tag)}
                      className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700"
                    >
                      #{tag}
                    </button>
                  ),
                )}
              </div>

              <button
                type="button"
                onClick={() => handleToggleFavorite(article)}
                className="rounded-full p-2 text-lg"
                aria-label={
                  article.isFavorite ? "Remove favorite" : "Add favorite"
                }
              >
                {article.isFavorite ? (
                  <FaBookmark className="text-red-500" />
                ) : (
                  <FaRegBookmark className="text-slate-400 hover:text-red-500" />
                )}
              </button>
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              {article.pubDate || "No publish date"}
            </p>

            <h2
              className="mb-5 font-bold leading-tight text-slate-900"
              style={{
                fontSize: `${3 * textScale}rem`,
                lineHeight: 1.1,
              }}
            >
              {article.title}
            </h2>

            <p
              className="line-clamp-6 text-slate-600"
              style={{
                fontSize: `${1.125 * textScale}rem`,
                lineHeight: 1.8,
              }}
            >
              {article.description || "No description available."}
            </p>

            <div className="mt-auto pt-5">
              <div className="grid grid-cols-3 gap-1">
                <button
                  type="button"
                  onClick={() => handleReadArticle(article.link)}
                  className="flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 p-3 text-2xl text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
                  aria-label="Read article"
                  title="Read article"
                >
                  <FaEye />
                </button>

                <button
                  type="button"
                  onClick={() => handleCreateBlog(article)}
                  className="flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 p-3 text-2xl text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
                  aria-label="Write your own experience"
                  title="Write your own experience"
                >
                  <FaPencilAlt />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    article.blogId
                      ? handleReadBlog(article.blogId)
                      : handleCreateBlog(article)
                  }
                  className="rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-sm font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
                >
                  {article.blogId ? "Read Blog" : "Write your experience"}
                </button>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleLike(article)}
                  disabled={Boolean(pendingLikeLinks[article.link])}
                  className={`flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold backdrop-blur-sm transition duration-300 hover:bg-white ${
                    article.isLiked
                      ? "text-red-600"
                      : "text-slate-700 hover:text-slate-900"
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
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
                >
                  <span className="text-xs font-semibold leading-none">
                    {article.commentCount || 0}
                  </span>

                  <FaCommentDots />
                </button>
                <button
                  type="button"
                  onClick={() => handleShareArticle(article)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
                  aria-label="Share article"
                  title="Share article"
                >
                  <FaShareAlt />
                </button>
              </div>
            </div>
          </article>
        ))}
        {activeView !== "alerts" &&
        !sharedArticleLink &&
        currentPage < totalPages ? (
          <div
            ref={loadMoreRef}
            className="flex min-h-24 items-center justify-center rounded-3xl bg-white/70 p-6 text-sm font-semibold text-slate-500"
          >
            {refreshing || loading || isLoadingMore
              ? "Loading articles..."
              : "Loading more articles..."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
