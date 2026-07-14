import { memo } from "react";
import {
  FaCommentDots,
  FaHeart,
  FaRegHeart,
  FaRegThumbsDown,
  FaShareAlt,
  FaThumbsDown,
} from "react-icons/fa";

function ArticleReactionBar({
  article,
  handleToggleLike,
  handleToggleDislike,
  pendingLikeLinks,
  likeBurstLinks,
  pendingDislikeLinks,
  dislikeBurstLinks,
  handleCommentClick,
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-4">
      <button
        type="button"
        onClick={() => handleToggleLike(article)}
        disabled={
          Boolean(pendingLikeLinks[article.link]) ||
          Boolean(pendingDislikeLinks[article.link])
        }
        className={`w-[5rem] like-button flex items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-3 text-xl font-semibold backdrop-blur-sm transition duration-300 hover:bg-white ${
          article.isLiked
            ? "text-red-600 w-[5.25rem]"
            : "text-slate-700 hover:text-slate-900"
        } ${pendingLikeLinks[article.link] ? "cursor-not-allowed opacity-80" : ""} ${
          likeBurstLinks[article.link]
            ? "scale-110 shadow-lg shadow-red-100"
            : "scale-100"
        }`}
      >
        <span className="text-sm font-semibold leading-none">
          {article.likeCount || 0}
        </span>
        <span className="text-sm ml-[-0.2rem]">
          {article.isLiked ? "Liked" : "Like it"}
        </span>
        {/* {article.isLiked ? <FaHeart /> : <FaRegHeart />} */}
      </button>
      <button
        type="button"
        onClick={() => handleToggleDislike(article)}
        disabled={
          Boolean(pendingDislikeLinks[article.link]) ||
          Boolean(pendingLikeLinks[article.link])
        }
        className={`w-[6rem] dislike-button flex items-center justify-center gap-1 rounded-2xl border border-white/60 bg-white/70 p-2 text-lg font-semibold backdrop-blur-sm transition duration-300 hover:bg-white ${
          article.isDisliked
            ? "w-[7rem] text-blue-600"
            : "text-slate-700 hover:text-slate-900"
        } ${pendingDislikeLinks[article.link] ? "cursor-not-allowed opacity-80" : ""} ${
          dislikeBurstLinks[article.link]
            ? "scale-110 shadow-lg shadow-blue-100"
            : "scale-100"
        }`}
      >
        <span className="text-sm font-semibold leading-none">
          {article.dislikeCount || 0}
        </span>

        <span className="text-sm">
          {article.isDisliked ? "Disliked" : "Dislike it"}
        </span>
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
    </div>
  );
}

export default memo(ArticleReactionBar);
