import { memo } from "react";
import { formatCommentTime } from "./appHelpers.js";

function CommentModal({
  article,
  closeCommentModal,
  commentsError,
  commentSubmitting,
  commentsLoading,
  comments,
  handleCommentSubmit,
  commentText,
  setCommentText,
  token,
}) {
  if (!article) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 py-6">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Comments
            </p>
            <h3 className="mt-2 text-lg font-bold text-slate-900">
              {article.title}
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
  );
}

export default memo(CommentModal);
