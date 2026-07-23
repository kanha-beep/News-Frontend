import { memo } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { sanitizeVisibleTags } from "./appHelpers.js";
import ArticleActionBar from "./ArticleActionBar.jsx";
import ArticleReactionBar from "./ArticleReactionBar.jsx";

function ArticleCard({
  article,
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
}) {
  const visibleTags = sanitizeVisibleTags(article.tags);

  return (
    <article
      className="feed-card flex h-[calc(100dvh-16rem)] flex-col overflow-hidden bg-white px-6 p-3 transition sm:h-[calc(100dvh-20rem)] sm:px-5 sm:pt-5 sm:pb-2"
      // onClick={() => handleReadArticle(article.link)}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {(visibleTags.length ? visibleTags : ["untagged"]).map((tag) => (
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
          aria-label={article.isFavorite ? "Remove favorite" : "Add favorite"}
        >
          {article.isFavorite ? (
            <FaBookmark className="text-red-500" />
          ) : (
            <FaRegBookmark className="text-slate-400 hover:text-red-500" />
          )}
        </button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <p className="mb-3 shrink-0 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
          {article.pubDate || "No publish date"}
        </p>

        {/* {preferredLanguage !== "en" ? (
          <div className="mb-3 flex">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                article.translationSkipped
                  ? "bg-amber-100 text-amber-800"
                  : article.translatedLanguage === preferredLanguage
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {article.translationSkipped
                ? "English fallback"
                : article.translatedLanguage === preferredLanguage
                  ? "Translated"
                  : "Pending"}
            </span>
          </div>
        ) : null} */}

        <h2
          className="mb-3 font-bold text-slate-900"
          style={{
            fontSize: `${2 * textScale}rem`,
            lineHeight: 1.1,
          }}
           onClick={() => handleReadArticle(article.link)}
        >
          {article.title}
        </h2>

        <p
          className="line-clamp-2 min-h-0 overflow-hidden text-slate-600"
          //  onClick={() => handleReadArticle(article.link)}
          style={{
            fontSize: `${1.35 * textScale}rem`,
            lineHeight: 1.5,
          }}
        >
          {article.description || "READ here"}
        </p>
      </div>

      <div className="mt-auto shrink-0 pt-3">
        <ArticleActionBar
          article={article}
          uiLabels={uiLabels}
          handleReadArticle={handleReadArticle}
          handleCreateBlog={handleCreateBlog}
          handleReadBlog={handleReadBlog}
          handleShareArticle={handleShareArticle}
        />
        <ArticleReactionBar
          article={article}
          uiLabels={uiLabels}
          handleToggleLike={handleToggleLike}
          handleToggleDislike={handleToggleDislike}
          pendingLikeLinks={pendingLikeLinks}
          pendingDislikeLinks={pendingDislikeLinks}
          handleCommentClick={handleCommentClick}
          handleShareArticle={handleShareArticle}
        />
      </div>
    </article>
  );
}

export default memo(ArticleCard);
