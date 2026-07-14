import { memo } from "react";

function AuthScreen({
  authScreen,
  handleAuthSubmit,
  authForm,
  setAuthForm,
  error,
  authSubmitting,
  setAuthScreen,
}) {
  return (
    <div className="mx-auto max-w-md rounded-2xl bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.25em] text-blue-600">
        {authScreen === "register" ? "Create Account" : "Sign In"}
      </p>
      <h2 className="mt-2 text-3xl font-bold text-slate-900">
        {authScreen === "register"
          ? "Save your favorite news"
          : "Access your favorites"}
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        {authScreen === "register"
          ? "Create an account to keep favorite articles in your dashboard."
          : "Sign in to continue with your saved favorites."}
      </p>

      <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
        {authScreen === "register" ? (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Name
            </label>
            <input
              value={authForm.name}
              onChange={(e) =>
                setAuthForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
              placeholder="Your name"
            />
          </div>
        ) : null}

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Email
          </label>
          <input
            type="email"
            value={authForm.email}
            onChange={(e) =>
              setAuthForm((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="you@example.com"
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={authForm.password}
            onChange={(e) =>
              setAuthForm((prev) => ({
                ...prev,
                password: e.target.value,
              }))
            }
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500"
            placeholder="Minimum 6 characters"
            required
          />
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={authSubmitting}
          className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {authSubmitting
            ? "Please wait..."
            : authScreen === "register"
              ? "Create Account"
              : "Sign In"}
        </button>
      </form>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {authScreen === "register"
            ? "Already have an account?"
            : "Need a new account?"}
        </p>
        <button
          type="button"
          onClick={() =>
            setAuthScreen((prev) => (prev === "register" ? "login" : "register"))
          }
          className="rounded-full bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          {authScreen === "register" ? "SignIn" : "Register"}
        </button>
      </div>
    </div>
  );
}

export default memo(AuthScreen);
