/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/src/elements/ui/card";
import { Button } from "@/src/elements/ui/button";
import { ArrowRight, MessageSquare, Send, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { TemplateSettingsModal } from "./list/TemplateSettingsModal";
import { useFeatureAccess } from "@/src/hooks/useFeatureAccess";

const FacebookIcon = () => (
  <svg className="w-6 h-6 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-6 h-6 text-[#E1306C]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const ChannelSelectionPage: React.FC = () => {
  const router = useRouter();
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const { getEnabledChannels, isFeatureEnabled, isLoading } = useFeatureAccess();
  const enabled = getEnabledChannels();

  const channels = [
    {
      id: "whatsapp",
      title: "WhatsApp Templates",
      description: "Design and manage rich WhatsApp message templates for marketing campaigns, utility notifications, and customer engagement.",
      icon: <MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      colorClass: "hover:border-emerald-500/50 hover:shadow-emerald-500/8 bg-gradient-to-br from-emerald-500/5 via-white to-white dark:from-slate-900 dark:via-(--card-color) dark:to-(--card-color)",
      iconBgColor: "rgba(16, 185, 129, 0.1)",
      iconBorderColor: "rgba(16, 185, 129, 0.2)",
      btnColor: "#059669",
    },
    {
      id: "telegram",
      title: "Telegram Templates",
      description: "Create and organize automated Telegram bot messaging templates to broadcast support, alerts, and marketing workflows.",
      icon: <Send className="w-6 h-6 text-[#229ED9]" />,
      colorClass: "hover:border-[#229ED9]/50 hover:shadow-[#229ED9]/8 bg-gradient-to-br from-[#229ED9]/5 via-white to-white dark:from-slate-900 dark:via-(--card-color) dark:to-(--card-color)",
      iconBgColor: "rgba(34, 158, 217, 0.1)",
      iconBorderColor: "rgba(34, 158, 217, 0.2)",
      btnColor: "#229ED9",
    },
    {
      id: "facebook",
      title: "Facebook Templates",
      description: "Manage standard Facebook Messenger announcement templates to nurture leads and build business workflows.",
      icon: <FacebookIcon />,
      colorClass: "hover:border-[#1877F2]/50 hover:shadow-[#1877F2]/8 bg-gradient-to-br from-[#1877F2]/5 via-white to-white dark:from-slate-900 dark:via-(--card-color) dark:to-(--card-color)",
      iconBgColor: "rgba(24, 119, 242, 0.1)",
      iconBorderColor: "rgba(24, 119, 242, 0.2)",
      btnColor: "#1877F2",
    },
    {
      id: "instagram",
      title: "Instagram Templates",
      description: "Design professional Instagram Direct message templates to auto-respond to stories, leads, and customer chat updates.",
      icon: <InstagramIcon />,
      colorClass: "hover:border-[#E1306C]/50 hover:shadow-[#E1306C]/8 bg-gradient-to-br from-[#E1306C]/5 via-white to-white dark:from-slate-900 dark:via-(--card-color) dark:to-(--card-color)",
      iconBgColor: "rgba(225, 48, 108, 0.1)",
      iconBorderColor: "rgba(225, 48, 108, 0.2)",
      btnColor: "#E1306C",
    },
  ].filter((ch) => {
    if (ch.id === "whatsapp") return true;
    if (ch.id === "facebook") return enabled.facebook && isFeatureEnabled("fb_template");
    if (ch.id === "instagram") return enabled.instagram && isFeatureEnabled("ig_template");
    if (ch.id === "telegram") return enabled.telegram && isFeatureEnabled("tg_template");
    return true;
  });

  const handleConfigure = (platform: string) => {
    router.push(`/message_templates?platform=${platform}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm font-semibold text-slate-500 dark:text-gray-400">
        Loading channels...
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-12 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold text-primary tracking-tight leading-none">
            Message Templates
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-2xl dark:text-gray-400">
            Manage and configure structured message templates across all of your omnichannel communications. Select a channel to proceed.
          </p>
        </div>
        <div className="shrink-0">
          <Button variant="outline" onClick={() => setIsSettingsModalOpen(true)} className="h-12 px-4.5! py-5 gap-2.5 bg-white dark:bg-(--card-color) border-slate-200 dark:border-(--card-border-color) text-slate-600 dark:text-gray-400 rounded-lg font-semibold transition-all shadow-xs hover:bg-slate-50 dark:hover:bg-(--table-hover)" title="Template Settings">
            <Settings2 className="w-5 h-5 text-slate-400 dark:text-amber-50" />
            <span className="inline text-sm">Template Setting</span>
          </Button>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {channels.map((ch) => (
          <Card
            key={ch.id}
            className={`overflow-hidden border border-slate-200/60 dark:border-(--card-border-color) hover:shadow-xl transition-all duration-300 rounded-lg flex flex-col justify-between h-full dark:from-slate-900 dark:via-(--card-color) dark:to-(--card-color) ${ch.colorClass}`}
          >
            <CardContent className="sm:p-6 p-4 flex flex-col h-full justify-between gap-8">
              <div className="space-y-6">
                {/* Brand Icon wrapped in colored backdrop bubble */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-xs"
                  style={{ backgroundColor: ch.iconBgColor, borderColor: ch.iconBorderColor }}
                >
                  {ch.icon}
                </div>

                {/* Info details */}
                <div className="space-y-2.5">
                  <h3 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                    {ch.title}
                  </h3>
                  <p className="text-slate-500 dark:text-gray-400 text-sm leading-relaxed">
                    {ch.description}
                  </p>
                </div>
              </div>

              {/* Action area */}
              <div className="pt-2">
                <Button
                  onClick={() => handleConfigure(ch.id)}
                  className="w-full h-11 font-bold rounded-lg flex items-center justify-center gap-2 group transition-all hover:opacity-90 active:scale-98 text-white px-4.5 py-5 cursor-pointer"
                  style={{ backgroundColor: ch.btnColor }}
                >
                  Configure
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TemplateSettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} />
    </div>
  );
};

export default ChannelSelectionPage;
