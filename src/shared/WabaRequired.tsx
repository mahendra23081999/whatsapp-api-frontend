"use client";

import { Button } from "@/src/elements/ui/button";
import { ArrowLeft, Phone, ShieldAlert, Send, Facebook, Instagram } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/src/redux/hooks";
import React from "react";
import { useTranslation } from "react-i18next";
import { ROUTES } from "../constants";

interface WabaRequiredProps {
  title?: string;
  description?: string;
  className?: string;
  platform?: "whatsapp" | "telegram" | "facebook" | "instagram" | "shopify" | "any" | string | null;
}

import { ShoppingBag } from "lucide-react";

const WabaRequired: React.FC<WabaRequiredProps> = ({ title, description, className = "", platform = "whatsapp" }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const isAgent = user?.role === "agent";

  const getPlatformConfig = () => {
    switch (platform) {
      case "telegram":
        return {
          title: title || "Telegram Connection Required",
          description: description || "To manage Telegram campaigns and templates, you first need to connect a Telegram bot.",
          route: ROUTES.TelegramConnect,
          btnText: "Connect Telegram",
          icon: <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        };
      case "facebook":
        return {
          title: title || "Facebook Connection Required",
          description: description || "To manage Facebook campaigns and templates, you first need to connect a Facebook Page.",
          route: ROUTES.FacebookConnect,
          btnText: "Connect Facebook",
          icon: <Facebook size={18} className="group-hover:scale-110 transition-transform" />
        };
      case "instagram":
        return {
          title: title || "Instagram Connection Required",
          description: description || "To manage Instagram campaigns and templates, you first need to connect an Instagram Account.",
          route: ROUTES.InstagramConnect,
          btnText: "Connect Instagram",
          icon: <Instagram size={18} className="group-hover:scale-110 transition-transform" />
        };
      case "shopify":
        return {
          title: title || "Shopify Connection Required",
          description: description || "To manage Shopify products and orders, you first need to connect a Shopify Store.",
          route: ROUTES.ShopifyConnect,
          btnText: "Connect Shopify",
          icon: <ShoppingBag size={18} className="group-hover:scale-110 transition-transform" />
        };
      case "any":
        return {
          title: title || "Channel Connection Required",
          description: description || "You must have to connect any one channel.",
          route: ROUTES.WABAConnection,
          btnText: "Connect A Channel",
          icon: <Phone size={18} className="group-hover:rotate-12 transition-transform" />
        };
      case "whatsapp":
      default:
        return {
          title: title || t("waba_connection_required"),
          description: description || t("waba_required_desc"),
          route: ROUTES.WABAConnection,
          btnText: t("connect_waba_now"),
          icon: <Phone size={18} className="group-hover:rotate-12 transition-transform" />
        };
    }
  };

  const config = getPlatformConfig();

  const displayTitle = isAgent ? t("access_restricted") : config.title;
  const displayDescription = isAgent ? t("agent_waba_required_desc") : config.description;

  return (
    <div className={`space-y-8 h-[calc(100vh-5rem)] flex flex-col items-center justify-center text-center ${className}`}>
      <div className="max-w-md space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto border-2 border-amber-100 dark:border-amber-900/40 shadow-inner">
          <ShieldAlert size={40} className="text-amber-500" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">{displayTitle}</h2>
          <p className="text-slate-500 dark:text-gray-400 font-medium leading-relaxed">{displayDescription}</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!isAgent && (
            <Button onClick={() => router.push(config.route)} className="bg-primary text-white h-12 px-8 rounded-xl font-bold flex items-center gap-2 group shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
              {config.icon}
              {config.btnText}
            </Button>
          )}
          <Button variant="outline" onClick={() => router.back()} className="h-12 px-6 rounded-xl font-bold flex items-center gap-2 border-slate-200 dark:border-white/10 dark:hover:bg-white/5 transition-all">
            <ArrowLeft size={18} />
            {t("go_back")}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WabaRequired;
