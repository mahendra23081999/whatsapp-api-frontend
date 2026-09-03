"use client";

import { ROUTES } from "@/src/constants";
import { Button } from "@/src/elements/ui/button";
import { useAppSelector } from "@/src/redux/hooks";
import { getResolvedImageUrl } from "@/src/utils/image";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import BroadcastFAQs from "./components/BroadcastFAQs";
import BroadcastFeatures from "./components/BroadcastFeatures";
import BroadcastTemplates from "./components/BroadcastTemplates";

interface BroadcastBulkMessagesPageProps {
  pageData?: any;
}

const BroadcastBulkMessagesPage = ({ pageData }: BroadcastBulkMessagesPageProps) => {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const page = pageData?.data;
  const isPageValid = page && page.status && page.dynamic_content;
  const dc = isPageValid ? page.dynamic_content : {};

  const hero = {
    badge: dc.hero?.badge || "Broadcast Campaigns",
    title: dc.hero?.title || "Broadcast Official WhatsApp Messages to Thousands",
    subtitle: dc.hero?.subtitle || "Reach your customers with 98% open rates using Meta-approved WhatsApp templates. Schedule campaigns, insert dynamic personalization tags, and measure real-time CTR.",
    button_text: dc.hero?.button_text || "Start Broadcasting Free",
    button_url: dc.hero?.button_url || ROUTES.SignUp,
    bullet_points: Array.isArray(dc.hero?.bullet_points) ? dc.hero.bullet_points : ["Official Meta Business API", "Schedule date & times", "Personalization variables"],
    side_image: dc.hero?.side_image || dc.hero?.side_gif || null,
  };

  const campaignSettings = {
    badge: dc.campaign_settings?.badge || "Campaign Features",
    title: dc.campaign_settings?.title || "High-Converting WhatsApp Marketing Campaign Features",
    subtitle: dc.campaign_settings?.subtitle || "Connect templates and segmented subscriber lists to dispatch bulk broadcasts safely with no risk of ban.",
    features: Array.isArray(dc.campaign_settings?.features) ? dc.campaign_settings.features : [
      { title: "Meta Approved Templates", description: "Build media-rich text or document templates. Submits variables instantly to Meta API for validation." },
      { title: "Smart Segment Targeting", description: "Filter bulk recipients accurately by CRM contact tags, custom language properties, or subscription directories." },
      { title: "Scheduled Delivery", description: "Launch broadcasts immediately or plan future timing schedules to trigger alerts during optimal opening hours." },
      { title: "Dynamic Link Tracking", description: "Inserts link tracking identifiers in CTA button templates to automatically trace CTR and client conversions." },
    ]
  };

  const templateTypes = {
    badge: dc.template_types?.badge || "Template Builder",
    title: dc.template_types?.title || "Marketing Template Types",
    description: dc.template_types?.description || "Choose the type of marketing experience to deliver. Personalize with variables, coupons, or interactive carousels.",
    types: Array.isArray(dc.template_types?.types) ? dc.template_types.types : [
      { title: "Standard", description: "Regular marketing message with text body and optional CTA button.", icon: "Tag", image: "" },
      { title: "Limited Time Offer", description: "With expiration countdown timer to drive urgency-based conversions.", icon: "Gift", image: "" },
      { title: "Coupon Code", description: "Include a copy-able promo code block for discounts and reward redemption.", icon: "Ticket", image: "" },
      { title: "Catalog", description: "Link your product catalog so recipients can browse directly on WhatsApp.", icon: "BookOpen", image: "" },
      { title: "Call Permission", description: "Request phone call opt-in with accept and decline quick-reply buttons.", icon: "Phone", image: "" },
      { title: "Carousel Product", description: "Horizontal scrollable product cards with prices and View Product CTAs.", icon: "ShoppingBag", image: "" },
      { title: "Carousel Media", description: "Horizontal image/video cards with action buttons for rich media campaigns.", icon: "Image", image: "" },
    ]
  };

  const faqs = {
    badge: dc.faqs?.badge || "FAQs",
    title: dc.faqs?.title || "Got Questions about Broadcast Campaigns?",
    items: Array.isArray(dc.faqs?.items) ? dc.faqs.items : [
      { question: "What is the difference between Utility and Marketing templates?", answer: "Marketing templates contain promotional offers, discounts, or brand invites. Utility templates deliver transactional alerts like billing reminders, shipping details, or account codes." },
      { question: "Are WhatsApp Broadcasts safe from account bans?", answer: "Yes. Our application runs broadcasts using the official WhatsApp Business Cloud API. By adhering to Meta's opt-in criteria and pre-approving templates, your account runs zero risk of phone number blocking." },
      { question: "Can I personalize parameters for each individual recipient?", answer: "Absolutely. Using standard dynamic tags you can inject custom variables (names, coupon codes, outstanding balances) for each member of your recipient broadcast list." },
    ]
  };

  return (
    <div className="relative overflow-x-hidden bg-[#FCFCFD] text-slate-800 font-sans">
      <div className="absolute top-[3%] left-[-15%] w-[60vw] h-[60vw] rounded-full bg-emerald-400/10 blur-[130px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[55vw] h-[55vw] rounded-full bg-teal-400/10 blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 opacity-40 pointer-events-none -z-10" style={{ backgroundImage: "radial-gradient(ellipse at center, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

      <section className="relative pt-[calc(16px+(40-16)*((100vw-320px)/(1920-320)))] pb-[calc(16px+(60-16)*((100vw-320px)/(1920-320)))] overflow-visible">
        <div className="container mx-auto px-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] md:px-12 xl:px-16">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[calc(16px+(48-16)*((100vw-320px)/(1920-320)))] items-center">

            <div className="flex flex-col text-center lg:text-left items-center lg:items-start z-10">
              {hero.badge && (
                <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full bg-emerald-100 uppercase tracking-wide">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-bold text-primary font-mono">{hero.badge}</span>
                </div>
              )}

              <h1 className="text-[calc(20px+(50-20)*((100vw-320px)/(1920-320)))] font-bold text-slate-900 leading-[1.08] mb-[calc(12px+(24-12)*((100vw-320px)/(1920-320)))] tracking-tight max-w-2xl">
                {(hero.title || "").includes("Thousands") ? (
                  <>
                    {(hero.title || "").split("Thousands")[0]}
                    <span className="bg-gradient-to-r from-primary to-[#10b981] bg-clip-text text-transparent">Thousands</span>
                    {(hero.title || "").split("Thousands")[1]}
                  </>
                ) : hero.title}
              </h1>

              <p className="text-[calc(14px+(17-14)*((100vw-320px)/(1920-320)))] text-slate-600 mb-[calc(16px+(32-16)*((100vw-320px)/(1920-320)))] max-w-xl leading-relaxed font-semibold">{hero.subtitle}</p>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <Button
                  onClick={() => router.push(isAuthenticated ? ROUTES.Dashboard : hero.button_url)}
                  className="bg-gradient-to-r from-primary to-[#10b981] hover:from-[#047857] hover:to-primary text-white px-8! py-5! h-12! rounded-lg font-bold text-[16px] transition-all hover:scale-[1.02] border-none cursor-pointer flex items-center justify-center gap-2"
                >
                  {hero.button_text} <ArrowUpRight size={16} />
                </Button>
              </div>

              {hero.bullet_points.length > 0 && (
                <div className="mt-[calc(16px+(32-16)*((100vw-320px)/(1920-320)))] flex flex-wrap justify-center lg:justify-start gap-y-3 gap-x-6 text-[12.5px] font-bold text-slate-600">
                  {hero.bullet_points.map((b: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} className="text-primary" /> {b}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="relative w-full max-w-[600px] mx-auto z-10 p-4">
              <div className="w-full h-auto flex items-center justify-center">
                <div className="w-full transition-all duration-500 hover:-translate-y-1">
                  <Image
                    src={getResolvedImageUrl(hero.side_image)}
                    alt="Broadcast Features"
                    width={540}
                    height={350}
                    unoptimized
                    className="w-full h-auto object-contain rounded-lg"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <BroadcastFeatures campaignSettings={campaignSettings} />

      <BroadcastTemplates templateTypes={templateTypes} getResolvedImageUrl={getResolvedImageUrl} />

      <BroadcastFAQs faqs={faqs} />

    </div>
  );
};

export default BroadcastBulkMessagesPage;
