/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, ReactNode } from "react";
import { useGetSettingsQuery } from "@/src/redux/api/settingsApi";
import { useGetAuthPageSetupQuery } from "@/src/redux/api/authApi";
import { useAppDispatch, useAppSelector } from "@/src/redux/hooks";
import { setAuthPageSetup, setSetting } from "@/src/redux/reducers/settingSlice";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ROUTES } from "@/src/constants";
import { useTranslation } from "react-i18next";
import { getUrlWithBasePath } from "@/src/utils";

const API_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? "";

const resolveUrl = (url?: string): string => {
  if (!url) return "";

  // Replace backslashes with forward slashes for cross-platform compatibility
  const normalizedUrl = url.replace(/\\/g, "/");

  if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://") || normalizedUrl.startsWith("data:")) {
    return normalizedUrl;
  }

  const baseUrl = (API_URL || "").endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  if (normalizedUrl.startsWith("/uploads/")) {
    return `${baseUrl}${normalizedUrl}`;
  }
  if (normalizedUrl.startsWith("uploads/")) {
    return `${baseUrl}/${normalizedUrl}`;
  }
  if (normalizedUrl.startsWith("/")) {
    return getUrlWithBasePath(normalizedUrl);
  }
  return getUrlWithBasePath(`/${normalizedUrl}`);
};

const DEFAULT_FAVICON = "/assets/logos/sidebarLogo.png";

function applyFavicon(href: string) {
  if (typeof window === "undefined" || !href) return;

  try {
    let normalizedHref = href;
    try {
      normalizedHref = (href.startsWith("http") || href.startsWith("data:")) ? href : new URL(href, window.location.origin).href;
    } catch (e) {
      console.warn("Failed to normalize target favicon href:", href, e);
    }

    const links = document.querySelectorAll("link[rel='icon'], link[rel='shortcut icon']");

    if (links.length > 0) {
      links.forEach((link: any) => {
        try {
          const linkHref = link.getAttribute("href") || "";
          if (!linkHref) return;

          const normalizedLinkHref = (linkHref.startsWith("http") || linkHref.startsWith("data:"))
            ? linkHref
            : new URL(linkHref, window.location.origin).href;

          if (normalizedLinkHref !== normalizedHref) {
            link.href = href;
          }
        } catch (innerError) {
          console.warn("Failed to normalize icon link href:", link.href, innerError);
          // Safe fallback comparison
          if (link.href !== href) {
            link.href = href;
          }
        }
      });
    } else {
      const link = document.createElement("link");
      link.rel = "icon";
      link.href = href;
      document.head.appendChild(link);
    }
  } catch (outerError) {
    console.error("Error applying favicon:", outerError);
  }
}

interface DynamicSettingsProviderProps {
  children: ReactNode;
}

const DynamicSettingsProvider = ({ children }: DynamicSettingsProviderProps) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const { data: settingsData, isLoading, isError, refetch: refetchSettings } = useGetSettingsQuery({}, { refetchOnMountOrArgChange: true });
  const { data: authSetupData, refetch: refetchAuthSetup } = useGetAuthPageSetupQuery(undefined, { refetchOnMountOrArgChange: true });
  const { app_name, favicon_url, app_description, pageTitle, pageDescription, landing_page_enabled, isSettingsLoaded } = useAppSelector((state) => state.setting);
  const [mounted, setMounted] = useState(false);
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!isLoading && landing_page_enabled === false) {
      const isLandingRoute = pathname === "/" || pathname === ROUTES.Landing || pathname.startsWith("/product") || pathname.startsWith("/page");
      if (isLandingRoute) {
        router.replace(ROUTES.Login);
      }
    }
  }, [pathname, landing_page_enabled, isLoading, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const cached = localStorage.getItem("app_settings");
      if (cached) {
        const parsed = JSON.parse(cached);
        const settingsToSet = parsed.data || parsed;
        dispatch(setSetting({ ...settingsToSet, maintenance_mode: false }));
      }
    } catch {}
  }, [dispatch]);

  useEffect(() => {
    if (settingsData) {
      const dataToSet = settingsData.data || settingsData;
      dispatch(setSetting(dataToSet));
    }
  }, [settingsData, dispatch]);

  useEffect(() => {
    if (authSetupData?.data) {
      dispatch(setAuthPageSetup(authSetupData.data));
    }
  }, [authSetupData, dispatch]);

  useEffect(() => {
    const isAuthRoute = pathname.startsWith("/auth") || pathname === ROUTES.Login || pathname === ROUTES.SignUp || pathname === ROUTES.ForgotPassword || pathname === ROUTES.OTPVerification || pathname === ROUTES.ResetPassword;

    if (isAuthRoute && !authSetupData && mounted) {
      refetchAuthSetup();
      refetchSettings();
    }
  }, [pathname, authSetupData, mounted, refetchAuthSetup, refetchSettings]);

  useEffect(() => {
    if (mounted && settingsData?.data?.default_theme_mode) {
      const saved = localStorage.getItem("theme");
      if (!saved || saved === "system") {
        setTheme(settingsData.data.default_theme_mode);
      }
    }
  }, [mounted, settingsData, setTheme]);

  useEffect(() => {
    if (!mounted) return;

    let faviconHref = "";
    if (isSettingsLoaded) {
      const resolved = resolveUrl(favicon_url);
      faviconHref = resolved ? getUrlWithBasePath(resolved) : getUrlWithBasePath(DEFAULT_FAVICON);
    } else if (isLoading) {
      faviconHref = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    } else if (isError) {
      faviconHref = getUrlWithBasePath(DEFAULT_FAVICON);
    } else {
      faviconHref = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
    }

    // Title update
    if (isSettingsLoaded) {
      const baseTitle = app_name || t("app_name");
      const fullTitle = pageTitle ? `${pageTitle} | ${baseTitle}` : `${baseTitle} | All-in-One WhatsApp Marketing & Automation Platform`;

      if (document.title !== fullTitle) {
        document.title = fullTitle;
      }

      // Description update
      const description = pageDescription || app_description;
      if (description) {
        let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", "description");
          document.head.appendChild(meta);
        }
        if (meta.getAttribute("content") !== description) {
          meta.setAttribute("content", description);
        }
      }
    }

    // Favicon update
    if (faviconHref) {
      applyFavicon(faviconHref);
    }
  }, [app_name, app_description, favicon_url, pathname, mounted, pageTitle, pageDescription, t, isSettingsLoaded, isLoading, isError]);

  return <>{children}</>;
};

export default DynamicSettingsProvider;
