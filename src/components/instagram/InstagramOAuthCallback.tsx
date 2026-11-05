"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { getUrlWithBasePath } from "@/src/utils";

export default function InstagramOAuthCallback() {
  const isDispatched = useRef(false);

  useEffect(() => {
    if (isDispatched.current) return;
    isDispatched.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    const error = urlParams.get("error");
    const errorReason = urlParams.get("error_reason") || urlParams.get("error_description");

    if (window.opener) {
      if (code) {
        window.opener.postMessage(
          {
            type: "INSTAGRAM_AUTH_SUCCESS",
            payload: { code, state },
          },
          "*"
        );
      } else if (error) {
        window.opener.postMessage(
          {
            type: "INSTAGRAM_AUTH_ERROR",
            payload: { error, error_reason: errorReason },
          },
          "*"
        );
      }

      setTimeout(() => window.close(), 500);
      return;
    }

    if (code) {
      window.location.href = getUrlWithBasePath(`/connect_channel?ig_code=${encodeURIComponent(code)}&state=${encodeURIComponent(state || "")}`);
    } else {
      window.location.href = getUrlWithBasePath("/connect_channel?ig_error=true");
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <Loader2 className="w-10 h-10 animate-spin text-pink-600 mb-4" />
      <h2 className="text-lg font-semibold text-slate-700">Connecting to Instagram...</h2>
      <p className="text-sm text-slate-500">Please wait while we finalize the connection. This window will close automatically.</p>
    </div>
  );
}
