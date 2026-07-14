import { memo } from "react";

function LoadingScreen({
  loadingProgress,
  loadingMessage,
  loadingDots,
  loadingTagline,
}) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 text-left shadow-lg">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-600">
          Fetching News
        </p>
        <h2 className="mt-3 text-2xl font-bold text-slate-800">
          {loadingProgress}%
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          {loadingMessage.replace(/\.*$/, "")}
          <span className="inline-block w-5 text-left">{loadingDots}</span>
        </p>
        <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="loader-bar h-full rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-cyan-400 transition-[width] duration-300 ease-out"
            style={{ width: `${loadingProgress}%` }}
          />
        </div>
        <p className="loader-tagline mt-4 text-sm font-medium text-slate-600">
          {loadingTagline}
        </p>
      </div>
    </div>
  );
}

export default memo(LoadingScreen);
