import { memo } from "react";
import { FaEye, FaShareAlt } from "react-icons/fa";

function ArticleActionBar({
  article,
  handleReadArticle,
  handleCreateBlog,
  handleReadBlog,
  handleShareArticle,
}) {
  return (
    <div className="flex justify-between">
      <button
        type="button"
        onClick={() => handleReadArticle(article.link)}
        className="ml-[0.5rem] flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 p-3 text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
        aria-label="Read article"
        title="Read article"
      >
        <FaEye />
      </button>

      <button
        type="button"
        onClick={() =>
          article.blogId
            ? handleReadBlog(article.blogId)
            : handleCreateBlog(article)
        }
        className="w-[8rem] items-center justify-between rounded-2xl border border-white/60 bg-white/60 text-sm font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
      >
        {article.blogId ? "Read blog" : "Write opinion"}
      </button>

      <button
        type="button"
        onClick={() => handleShareArticle(article)}
        className="flex items-center justify-center rounded-2xl border border-white/60 bg-white/70 p-3 font-semibold text-slate-900 backdrop-blur-sm transition hover:bg-white hover:text-slate-700"
        aria-label="Share article"
        title="Share article"
      >
        <FaShareAlt />
      </button>
    </div>
  );
}

export default memo(ArticleActionBar);
