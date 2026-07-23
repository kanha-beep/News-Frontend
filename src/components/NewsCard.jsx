import React from "react";
import ArticleCard from "./ArticleCard.jsx";

export default function NewsCard({
  news,
  preferredLanguage,
  uiLabels,
  applyTagQuery,
  handleToggleFavorite,
  textScale,
  handleReadArticle,
  handleCreateBlog,
  handleReadBlog,
  handleToggleLike,
  handleToggleDislike,
  pendingLikeLinks,
  pendingDislikeLinks,
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
    <div className="mx-auto grid max-w-3xl gap-2">
      {news.map((article) => (
        <React.Fragment key={article._id || article.link}>
          <div>
            <ArticleCard
              article={article}
              preferredLanguage={preferredLanguage}
              uiLabels={uiLabels}
              applyTagQuery={applyTagQuery}
              handleToggleFavorite={handleToggleFavorite}
              textScale={textScale}
              handleReadArticle={handleReadArticle}
              handleCreateBlog={handleCreateBlog}
              handleReadBlog={handleReadBlog}
              handleToggleLike={handleToggleLike}
              handleToggleDislike={handleToggleDislike}
              pendingLikeLinks={pendingLikeLinks}
              pendingDislikeLinks={pendingDislikeLinks}
              handleCommentClick={handleCommentClick}
              handleShareArticle={handleShareArticle}
            />
          </div>
        </React.Fragment>
      ))}
      {activeView !== "alerts" &&
      !sharedArticleLink &&
      currentPage < totalPages ? (
        <div
          ref={loadMoreRef}
          className="feed-loader flex min-h-24 items-center justify-center rounded-3xl bg-white/70 p-6 text-sm font-semibold text-slate-500"
        >
          {refreshing || loading || isLoadingMore
            ? "Loading articles..."
            : "Loading more articles..."}
        </div>
      ) : null}
    </div>
  );
}
