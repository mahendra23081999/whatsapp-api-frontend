"use client";

import { useEffect } from "react";
import { Input } from "@/src/elements/ui/input";
import { Label } from "@/src/elements/ui/label";
import { Textarea } from "@/src/elements/ui/textarea";
import { CampaignFormValues } from "@/src/types/components";
import { FormikProps } from "formik";
import { Layout, MessageSquare, Sparkles, MessageCircle, Send, Facebook, Instagram, Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useFeatureAccess } from "@/src/hooks/useFeatureAccess";

const CHANNELS = [
  {
    id: "whatsapp",
    title: "WhatsApp Broadcast",
    description: "Official API templates for higher conversions.",
    icon: MessageCircle,
    color: "#25D366",
  },
  {
    id: "telegram",
    title: "Telegram Broadcast",
    description: "Send campaign messages directly to Telegram users.",
    icon: Send,
    color: "#229ED9",
  },
  {
    id: "facebook",
    title: "Facebook Message",
    description: "Reach your Facebook audience directly via Messenger.",
    icon: Facebook,
    color: "#1877F2",
  },
  {
    id: "instagram",
    title: "Instagram Direct",
    description: "Engage followers directly in their Instagram DMs.",
    icon: Instagram,
    color: "#E1306C",
  },
];

const StepBasicInfo = ({
  formik,
  hideChannelSelector = false,
}: {
  formik: FormikProps<CampaignFormValues>;
  hideChannelSelector?: boolean;
}) => {
  const { isFeatureEnabled, getEnabledChannels } = useFeatureAccess();
  const enabled = getEnabledChannels();

  useEffect(() => {
    const currentPlatform = formik.values.platform;
    const isAllowed = 
      currentPlatform === "whatsapp" ||
      (currentPlatform === "telegram" && enabled.telegram && isFeatureEnabled("tg_campaign")) ||
      (currentPlatform === "facebook" && enabled.facebook && isFeatureEnabled("fb_campaign")) ||
      (currentPlatform === "instagram" && enabled.instagram && isFeatureEnabled("ig_campaign"));

    if (!isAllowed) {
      formik.setFieldValue("platform", "whatsapp");
    }
  }, [formik.values.platform, enabled, isFeatureEnabled, formik]);

  const filteredChannels = CHANNELS.filter((channel) => {
    if (channel.id === "whatsapp") return true;
    if (channel.id === "telegram") return enabled.telegram && isFeatureEnabled("tg_campaign");
    if (channel.id === "facebook") return enabled.facebook && isFeatureEnabled("fb_campaign");
    if (channel.id === "instagram") return enabled.instagram && isFeatureEnabled("ig_campaign");
    return true;
  });

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="p-2.5 sm:p-3.5 bg-primary/10 rounded-lg">
          <Sparkles className="text-primary w-6 h-6" />
        </div>
        <div>
          <h2 className="sm:text-xl text-lg font-black text-primary tracking-tight">
            Campaign Information
          </h2>
          <p className="text-slate-500 font-medium text-sm">
            Give your campaign an identifiable name to get started.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        <div className="group space-y-3">
          <Label
            htmlFor="name"
            className="text-sm font-medium text-slate-500 dark:text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors"
          >
            <Layout size={14} /> Campaign Name{" "}
            <span className="text-primary">*</span>
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="E.g. Summer Sale 2024 - Newsletter"
            value={formik.values.name}
            onChange={formik.handleChange}
            className="h-11 bg-(--input-color) dark:bg-(--page-body-bg) focus:bg-(--input-color) dark:focus:bg-(--page-body-bg) transition-all rounded-lg border-slate-200 dark:border-(--card-border-color) p-3 font-medium text-lg placeholder:text-gray-400 shadow-sm focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="group space-y-3">
          <Label
            htmlFor="description"
            className="text-sm font-medium text-slate-500 dark:text-gray-400 ml-1 flex items-center gap-2 group-focus-within:text-primary transition-colors"
          >
            <MessageSquare size={14} /> Internal Description
          </Label>
          <div className="relative">
            <Textarea
              id="description"
              name="description"
              placeholder="What is the goal of this campaign?"
              value={formik.values.description}
              onChange={formik.handleChange}
              className="w-full min-h-35 custom-scrollbar bg-(--input-color) dark:bg-(--page-body-bg) focus:bg-(--input-color) dark:focus:bg-(--page-body-bg) transition-all rounded-lg border border-slate-200 dark:border-(--card-border-color) p-5 font-medium resize-none focus:outline-none focus:ring-4 focus:ring-primary/10 shadow-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {!hideChannelSelector && (
          <div className="space-y-4">
            <Label className="text-sm font-medium text-slate-500 dark:text-gray-400 ml-1 flex items-center gap-2">
              <Sparkles size={14} /> Delivery Channel
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredChannels.map((channel) => {
                const isSelected = formik.values.platform === channel.id;
                const Icon = channel.icon;
                return (
                  <div
                    key={channel.id}
                    onClick={() => {
                      formik.setFieldValue("platform", channel.id);
                      formik.setFieldValue("template_id", "");
                      formik.setFieldValue("variables_mapping", {});
                      formik.setFieldValue("coupon_code", "");
                      formik.setFieldValue("offer_expiration_minutes", "");
                      formik.setFieldValue("thumbnail_product_retailer_id", "");
                      formik.setFieldValue("carousel_cards_data", []);
                      formik.setFieldValue("carousel_products", []);
                      formik.setFieldValue("media_url", "");
                      if (channel.id !== "whatsapp") {
                        formik.setFieldValue("waba_id", "");
                      }
                    }}
                    className={cn(
                      "relative p-5 rounded-xl border cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[140px] shadow-xs select-none hover:shadow-md",
                      isSelected
                        ? "bg-primary/5 dark:bg-primary/10 border-primary ring-2 ring-primary/20"
                        : "bg-white dark:bg-(--page-body-bg) border-slate-200 dark:border-(--card-border-color) hover:border-slate-300 dark:hover:border-slate-700"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-4 right-4 bg-primary text-white rounded-full p-0.5 animate-in zoom-in duration-300">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                    <div className="p-3 w-fit rounded-lg bg-slate-50 dark:bg-(--card-color) border border-slate-100 dark:border-(--card-border-color)">
                      <Icon className="w-5 h-5" style={{ color: channel.color }} />
                    </div>
                    <div className="mt-4">
                      <h4 className="font-black text-sm text-slate-800 dark:text-slate-100">{channel.title}</h4>
                      <p className="text-[11px] text-slate-400 dark:text-gray-500 font-medium mt-1 leading-normal">{channel.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepBasicInfo;