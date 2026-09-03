"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

export default function TwitterCallbackPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Completing authorization...");

  useEffect(() => {
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      setStatus("error");
      setMessage(errorDescription || error || "Authorization denied");
      return;
    }

    if (!code || !state) {
      setStatus("error");
      setMessage("Missing authorization code");
      return;
    }

    // Send code back to parent window (the app)
    if (window.opener) {
      window.opener.postMessage(
        { type: "TWITTER_OAUTH_CALLBACK", code, state },
        window.location.origin
      );
      setStatus("success");
      setMessage("Authorization complete! This window will close...");
      setTimeout(() => window.close(), 1500);
    } else {
      // Fallback: store in sessionStorage and redirect
      sessionStorage.setItem("twitter_oauth_code", code);
      setStatus("success");
      setMessage("Authorization complete! Redirecting...");
      setTimeout(() => {
        window.location.href = "/twitter_connect";
      }, 1000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="max-w-sm w-full mx-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center space-y-5">
          <div className="mx-auto w-14 h-14 bg-black dark:bg-white rounded-full flex items-center justify-center">
            <svg className="w-7 h-7 text-white dark:text-black" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </div>

          {status === "loading" && (
            <div className="space-y-2">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
            </div>
          )}

          {status === "success" && (
            <div className="space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">{message}</p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-3">
              <XCircle className="w-8 h-8 mx-auto text-red-500" />
              <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
              <button
                onClick={() => window.close()}
                className="px-5 py-2 bg-black dark:bg-white text-white dark:text-black rounded-lg text-sm font-bold"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
