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
        className="ml-[0.5rem] flex items-center justify-center rounded-2xl border-2 border-transparent bg-white/70 p-3 text-slate-900 shadow-sm backdrop-blur-sm transition duration-200 hover:border-black hover:bg-white hover:text-slate-700 focus-visible:border-black"
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
        className="w-[8rem] -translate-x-[1rem] items-center justify-between rounded-2xl border-2 border-transparent bg-white/60 text-sm font-semibold text-slate-900 backdrop-blur-sm transition hover:border-black hover:bg-white hover:text-slate-700 focus-visible:border-black"
      >
        {article.blogId ? "Read blog" : "Write opinion"}
      </button>

      <button
        type="button"
        onClick={() => handleShareArticle(article)}
        className="flex items-center justify-center rounded-2xl border-2 border-transparent bg-white/70 p-3 font-semibold text-slate-900 backdrop-blur-sm transition hover:border-black hover:bg-white hover:text-slate-700 focus-visible:border-black"
        aria-label="Share article"
        title="Share article"
      >
        <FaShareAlt />
      </button>
    </div>
  );
}

export default memo(ArticleActionBar);
