import NewsCard from "../NewsCard.jsx";

export default function NewsFeedView({
  news,
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
  totalItems,
}) {
  if (news.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-700">No articles found.</p>
        <p className="mt-2 text-sm text-slate-500">
          Try another tag, date, month, or switch back to all news.
        </p>
      </div>
    );
  }

  return (
    <>
      <NewsCard
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
        pendingDislikeLinks={pendingDislikeLinks}
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
      />

      {activeView !== "alerts" && totalItems > 0 ? (
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row">
          <p className="text-sm text-slate-600">Total {totalItems} articles</p>
          <div className="flex items-center gap-3" />
        </div>
      ) : null}
    </>
  );
}
