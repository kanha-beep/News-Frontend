import { useEffect, useMemo, useRef, useState } from "react";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

export function GoogleSignInButton({ onGoogleCredential }) {
  const googleButtonRef = useRef(null);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || !googleButtonRef.current) return undefined;
    const render = () => {
      if (!window.google?.accounts?.id) return;
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: onGoogleCredential });
      window.google.accounts.id.renderButton(googleButtonRef.current, { theme: "outline", size: "large", width: 320, text: "continue_with" });
    };
    const existing = document.querySelector('script[data-google-identity]');
    if (existing) { render(); return undefined; }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.dataset.googleIdentity = "true";
    script.onload = render;
    document.head.appendChild(script);
    return undefined;
  }, [onGoogleCredential]);

  if (!GOOGLE_CLIENT_ID) {
    return <button type="button" disabled className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-400"><span className="text-base">G</span> Continue with Google <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs">Coming soon</span></button>;
  }

  return <div className="min-h-11" ref={googleButtonRef} />;
}

export default function InterestOnboarding({ availableTags, onGoogleCredential, onSaveInterests, saving, error, onContinueWithoutAccount }) {
  const [selected, setSelected] = useState([]);
  const tags = useMemo(() => availableTags.slice(0, 40), [availableTags]);

  const toggleTag = (tag) => setSelected((current) => current.includes(tag) ? current.filter((item) => item !== tag) : current.length < 12 ? [...current, tag] : current);

  return (
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-lg sm:p-9">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Personalize your feed</p>
      <h1 className="mt-3 text-3xl font-bold text-slate-900">Sign in while your news loads</h1>
      <p className="mt-3 text-sm leading-6 text-slate-600">Continue with Google, then select topics you want to follow. Your feed is still loading in the background.</p>
      <div className="mt-6"><GoogleSignInButton onGoogleCredential={onGoogleCredential} /></div>
      {error ? <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <div className="mt-7 border-t border-slate-100 pt-6">
        <h2 className="text-lg font-bold text-slate-900">Choose your interests</h2>
        <p className="mt-1 text-sm text-slate-500">Select up to 12 topics. You can change these later.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.length ? tags.map((tag) => <button key={tag} type="button" onClick={() => toggleTag(tag)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${selected.includes(tag) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>#{tag}</button>) : <p className="text-sm text-slate-500">Topics are being loaded…</p>}
        </div>
        <button type="button" disabled={saving} onClick={() => onSaveInterests(selected)} className="mt-7 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Finish and view my feed"}</button>
        <button type="button" onClick={onContinueWithoutAccount} className="mt-3 w-full text-sm font-semibold text-slate-500 hover:text-slate-800">Continue without signing in</button>
      </div>
    </div>
  );
}
