/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useState } from "react";
import { useFacebookReady } from "@/src/app/FacebookSDKProvider";
import { useConnectFacebookMutation } from "@/src/redux/api/facebookApi";
import { useAppSelector } from "@/src/redux/hooks";
import { toast } from "sonner";

// Page-only permissions. Do NOT add whatsapp_* scopes here: on a Business app, mixing them in
// turns the dialog into the WhatsApp asset picker and the page permissions get dropped.
const FACEBOOK_PAGE_SCOPES = [
  "public_profile",
  "email",
  "pages_show_list",
  "pages_messaging",
  "pages_manage_metadata",
  "pages_read_engagement",
  "pages_manage_engagement",
  "pages_manage_ads",
  "business_management",
  "instagram_basic",
  "instagram_manage_messages",
  "leads_retrieval",
  "ads_management",
  "ads_read",
  "catalog_management",
].join(",");

const REQUIRED_PAGE_SCOPES = ["pages_show_list", "pages_messaging", "pages_manage_metadata"];

export const useFacebookLogin = (onFinish?: (data: any) => void) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const fbReady = useFacebookReady();
  const [connectFacebook] = useConnectFacebookMutation();
  const { setting } = useAppSelector((state: any) => state.setting);
  const facebookConfigId: string | undefined = setting?.configuration_id || null ;
  

  const startLogin = useCallback(() => {
    if (!fbReady || !window.FB) {
      toast.error("Facebook SDK is not ready yet.");
      return;
    }

    setIsConnecting(true);

    window.FB.login(
      (res: any) => {
        if (res.authResponse?.accessToken) {
          const accessToken = res.authResponse.accessToken;
          const granted: string[] = (res.authResponse.grantedScopes || "").split(",").filter(Boolean);
          const missing = granted.length ? REQUIRED_PAGE_SCOPES.filter((s) => !granted.includes(s)) : [];
          console.log("[Facebook Login] granted scopes:", granted.join(",") || "(not returned)", "config_id:", facebookConfigId || "(none, using scope)");
          if (missing.length) {
            console.error("[Facebook Login] Missing page permissions:", missing.join(","));
            toast.error(`Facebook did not grant page permissions (${missing.join(", ")}). Select your Page and allow all permissions, or add these permissions to the Meta app.`);
          }
          const handleAuth = async () => {
            try {
              const response = await connectFacebook({ access_token: accessToken }).unwrap();
              toast.success(response.message || "Facebook connected successfully!");
              if (onFinish) {
                try {
                  onFinish(response);
                } catch (finishError) {
                  console.error("Error in onFinish callback:", finishError);
                }
              }
            } catch (error: any) {
              console.log(error);
              toast.error(error?.data?.error || "Failed to connect Facebook account.");
            } finally {
              setIsConnecting(false);
            }
          };
          handleAuth();
        } else {
          setIsConnecting(false);
          toast.error("Facebook login was cancelled or failed.");
        }
      },
      facebookConfigId
        ? // Facebook Login for Business "General" configuration with Pages assets (NOT the WhatsApp signup config)
          { config_id: facebookConfigId, return_scopes: true, auth_type: "rerequest" }
        : { scope: FACEBOOK_PAGE_SCOPES, return_scopes: true, auth_type: "rerequest" }
    );
  }, [fbReady, connectFacebook, onFinish, facebookConfigId]);

  return { startLogin, isConnecting, fbReady };
};