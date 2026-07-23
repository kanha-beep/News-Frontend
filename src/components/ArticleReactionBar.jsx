import { memo } from "react";

function ArticleReactionBar({
  article,
  uiLabels,
  handleToggleLike,
  handleToggleDislike,
  pendingLikeLinks,
  pendingDislikeLinks,
  handleCommentClick,
}) {
  return (
    <div className="mt-3 flex justify-between">
      <button
        type="button"
        onClick={() => handleToggleLike(article)}
        disabled={
          Boolean(pendingLikeLinks[article.link]) ||
          Boolean(pendingDislikeLinks[article.link])
        }
        className={`like-button flex w-[5rem] items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold backdrop-blur-sm hover:bg-white ${
          article.isLiked
            ? "w-[5.25rem] text-red-600"
            : "text-slate-700 hover:text-slate-900"
        } ${pendingLikeLinks[article.link] ? "cursor-not-allowed opacity-80" : ""}`}
      >
        <span className="text-sm font-semibold leading-none">
          {article.likeCount || 0}
        </span>
        <span className="ml-[-0.2rem] text-sm">
          {uiLabels?.real || "Real"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleToggleDislike(article)}
        disabled={
          Boolean(pendingDislikeLinks[article.link]) ||
          Boolean(pendingLikeLinks[article.link])
        }
        className={`dislike-button ml-[-2rem] flex items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/70 p-2 text-lg font-semibold backdrop-blur-sm hover:bg-white ${
          article.isDisliked
            ? "w-[7rem] text-blue-600"
            : "text-slate-700 hover:text-slate-900"
        } ${pendingDislikeLinks[article.link] ? "cursor-not-allowed opacity-80" : ""}`}
      >
        <span className="text-sm font-semibold leading-none">
          {article.dislikeCount || 0}
        </span>
        <span className="text-sm">
          {uiLabels?.manipulative || "Manipulative"}
        </span>
      </button>

      <button
        type="button"
        onClick={() => handleCommentClick(article)}
        className="flex items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
        aria-label={uiLabels?.comment || "Comment"}
        title={uiLabels?.comment || "Comment"}
      >
        <span className="text-xs font-semibold leading-none">
          {article.commentCount || 0}
        </span>
        <span className="text-sm font-semibold">
          {uiLabels?.comment || "Comment"}
        </span>
      </button>
    </div>
  );
}

export default memo(ArticleReactionBar);
