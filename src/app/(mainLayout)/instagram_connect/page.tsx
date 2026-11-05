"use client";

import { useEffect, useState } from "react";
import InstagramOAuthCallback from "@/src/components/instagram/InstagramOAuthCallback";
import InstagramConnect from "@/src/components/connect-channel/InstagramConnect";

const Page = () => {
  const [isOAuthCallback, setIsOAuthCallback] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsOAuthCallback(
      params.has("code") ||
      params.has("error") ||
      params.has("error_reason") ||
      params.has("error_description")
    );
  }, []);

  if (isOAuthCallback) {
    return <InstagramOAuthCallback />;
  }

  return (
    <div className="p-4 pt-0! sm:p-8">
      <InstagramConnect />
    </div>
  );
};

export default Page;
