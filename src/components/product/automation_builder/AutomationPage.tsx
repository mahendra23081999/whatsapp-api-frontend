"use client";

import ProductLayout from "@/src/components/product/ProductLayout";
import { ROUTES } from "@/src/constants";
import { useAppSelector } from "@/src/redux/hooks";
import { getResolvedImageUrl } from "@/src/utils/image";
import {
  ArrowUpRight,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/src/elements/ui/button";
import AutomationCatalog from "./components/AutomationCatalog";
import AutomationFAQs from "./components/AutomationFAQs";
import AutomationUseCases from "./components/AutomationUseCases";

interface AutomationPageProps {
  pageData: any;
}

export default function AutomationPage({ pageData }: AutomationPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const page = pageData?.data;
  const isPageValid = page && page.status && page.dynamic_content;
  const dc = isPageValid ? page.dynamic_content : {};

  const colorConfig = page?.color_config || {};
  const primaryColor = colorConfig.primary_color || "#059669";

  const hero = {
    badge: dc.hero?.badge || "No-Code Chatbot Builder",
    title: dc.hero?.title || "",
    subtitle: dc.hero?.subtitle || "Create smart WhatsApp chatbots using a simple drag-and-drop builder. Answer customer FAQs, capture contact parameters, branch logic conditionally, and trigger instant webhook lookups automatically.",
    button_text: dc.hero?.button_text || "Start Building For Free",
    button_url: dc.hero?.button_url || ROUTES.SignUp,
    button_2_text: dc.hero?.button_2_text || "Explore Flow Nodes",
    bullets: Array.isArray(dc.hero?.bullets) ? dc.hero.bullets : ["No credit card needed", "Built-in template integration", "API webhooks enabled"],
    image: dc.hero?.image || null,
  };

  const catalogNodesFallback = [
    { name: "Automation Entry", category: "START", description: "Launches the bot sequence whenever keyword matches, campaigns trigger, or dynamic variables match.", icon: "Play" },
    { name: "Send Message", category: "MESSAGING", description: "Sends a rich text format layout bubble with personalized custom attributes directly to customers.", icon: "MessageSquare" },
    { name: "Quick Reply", category: "MESSAGING", description: "Configures clickable buttons (up to 3) allowing clients to choose options instantly without typing.", icon: "CheckCircle2" },
    { name: "Form Flow", category: "MESSAGING", description: "Triggers sequential nested message collections to capture customer details like a visual form.", icon: "FileText" },
    { name: "Send Template", category: "MESSAGING", description: "Sends pre-approved Meta message templates with headers, footers, and custom variable parameters.", icon: "Grid" },
    { name: "Call to Action", category: "MESSAGING", description: "Sends interactive layout buttons linked to phone dialing or external web URLs (e.g. pay links).", icon: "Sparkles" },
    { name: "Selection List", category: "INTERACTIONS", description: "Presents a structured menu list containing sections and row items (up to 10) for organized options selection.", icon: "Layers" },
    { name: "Attach Media", category: "INTERACTIONS", description: "Appends rich media files like PDFs, images, invoices, or audio tracks to the chat feed.", icon: "Share2" },
    { name: "Send Location", category: "INTERACTIONS", description: "Sends map coordinates (latitude/longitude) of offices or pickup points directly to the user.", icon: "MapPin" },
    { name: "Assign Chatbot", category: "INTERACTIONS", description: "Switches active chat handler responsibilities to a separate flow or sub-routine chatbot sequence.", icon: "Briefcase" },
    { name: "Wait Timer", category: "UTILITIES", description: "Delays flow progression by custom times (seconds, minutes, hours) to humanize bot pacing.", icon: "Timer" },
    { name: "Wait for Reply", category: "UTILITIES", description: "Halts the flow process until the customer replies. Captures their entry for evaluation.", icon: "Timer" },
    { name: "Logic Control", category: "LOGIC", description: "Evaluates standard rules (business hours checks, country code filters, prior selections) to route users.", icon: "GitBranch" },
    { name: "External API", category: "INTEGRATIONS", description: "Performs HTTP request routines (GET, POST, PUT) to fetch or update records in dynamic databases.", icon: "Database" },
    { name: "Webhook", category: "INTEGRATIONS", description: "Dispatches trigger events containing user attributes to other platforms (Shopify, CRM) instantly.", icon: "Share2" },
    { name: "Save Response", category: "INTEGRATIONS", description: "Persists the values of user responses directly into custom fields in your database layout.", icon: "Database" },
    { name: "Google Sheets", category: "INTEGRATIONS", description: "Appends rows or searches values in your integrated Google Spreadsheets spreadsheet in real-time.", icon: "FileText" },
    { name: "Calendar Event", category: "INTEGRATIONS", description: "Connects with scheduling software to create meetings or save appointment events on the calendar.", icon: "Calendar" },
    { name: "Assign Tag", category: "CRM", description: "Appends a categorizing label (e.g. VIP, Refund Needed) to the contact profile timeline.", icon: "Tag" },
    { name: "Add to Segment", category: "CRM", description: "Adds the contact to a segment folder for bulk broadcasting and campaign target filtering.", icon: "UserPlus" },
    { name: "Update Contact", category: "CRM", description: "Modifies variables on contact models like name, preferred language, or alternate coordinates.", icon: "UserCheck" }
  ];

  const flowNodes = {
    badge: dc.flow_nodes?.badge || "Visual Blocks Directory",
    title: dc.flow_nodes?.title || "All Conversational Flow Nodes",
    description: dc.flow_nodes?.description || "Connect simple, functional visual components to outline paths for any client inquiry. Filter nodes by core category to discover options.",
    nodes: Array.isArray(dc.flow_nodes?.nodes) ? dc.flow_nodes.nodes : catalogNodesFallback
  };

  const useCasesFallback = [
    {
      title: "Lead Qualification & Booking", sub_title: "01. LEAD GGENERATION", side_image: "",
      steps: [
        { title: "Automation Entry (Start)", description: "Triggers flow when user clicks Facebook Ad button payload or sends \"Book\"." },
        { title: "Form Flow (Messaging)", description: "Asks qualification details: company size, name, and email sequentially." },
        { title: "External API / Webhook (Integration)", description: "Calls API webhook to check calendar availability slots dynamically." },
        { title: "Calendar Event (Integration)", description: "Books meeting automatically, posts calendar event, and replies confirmation text." }
      ]
    },
    {
      title: "Order Status Track Lookup", sub_title: "02. CUSTOMER UTILITIES", side_image: "",
      steps: [
        { title: "Automation Entry (Start)", description: "Matches incoming keywords containing \"Track\", \"Order\", or \"Delivery status\"." },
        { title: "Wait for Reply (Utilities)", description: "Asks client: \"Please enter order ID\". Pauses flow execution until they reply." },
        { title: "Google Sheets (Integration)", description: "Searches Spreadsheet order rows automatically to find the match ID status." },
        { title: "Send Message (Messaging)", description: "Pulls status variable value and triggers WhatsApp message: \"Your order is Shipped\"." }
      ]
    },
    {
      title: "Support Triage & Escalation", sub_title: "03. SUPPORT SERVICE", side_image: "",
      steps: [
        { title: "Automation Entry (Start)", description: "Launches when a contact sends general help queries or matches nothing else." },
        { title: "Logic Control (Logic)", description: "Checks rules: Is the current server time between 9:00 AM and 6:00 PM?" },
        { title: "Selection List (Interactions)", description: "Displays interactive menu categories (Sales, Technical, Billing, FAQs)." },
        { title: "Assign Chatbot (Interactions)", description: "If customer clicks Technical, switches thread to human Support Shared Inbox." }
      ]
    }
  ];

  const useCases = {
    badge: dc.use_cases?.badge || "Use Cases",
    title: dc.use_cases?.title || "Proven Chatbot Flow Recipes",
    description: dc.use_cases?.description || "Explore how standard node categories compile into production-ready visual automation sequences.",
    tabs: Array.isArray(dc.use_cases?.tabs) ? dc.use_cases.tabs : useCasesFallback
  };

  const faqs = {
    badge: dc.faqs?.badge || "FAQs",
    title: dc.faqs?.title || "Got Questions about Chatbots & Flows?",
    items: Array.isArray(dc.faqs?.items) ? dc.faqs.items : [
      { question: "Do I need coding skills to build a WhatsApp chatbot?", answer: "Absolutely not. Our Visual Editor is designed specifically for business users. You drag node blocks, link them using cursor lines, and configure triggers or responses in plain text." },
      { question: "How do API integrations or webhooks work?", answer: "The Webhook block triggers dynamic API calls mid-conversation. For example, when a user enters an order ID, the chatbot can make a GET request to your Shopify backend, pull the status, and reply to the user automatically." },
      { question: "What happens when a customer needs human assistance?", answer: "Our chatbot handover block routes the customer context to the Shared Team Inbox immediately. The automation stops running on that active thread, letting agents converse natively." }
    ]
  };

  return (
    <ProductLayout>
      <div className="relative overflow-x-hidden bg-[#FCFCFD] text-slate-800 font-sans text-left">

        <div className="absolute top-[3%] left-[-15%] w-[60vw] h-[60vw] rounded-full blur-[130px] pointer-events-none" style={{ backgroundColor: primaryColor, opacity: 0.08 }} />
        <div className="absolute top-[35%] right-[-10%] w-[55vw] h-[55vw] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: primaryColor, opacity: 0.06 }} />

        <div className="absolute inset-0 opacity-40 pointer-events-none -z-10" style={{ backgroundImage: "radial-gradient(ellipse at center, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <section className="relative pt-[calc(16px+(40-16)*((100vw-320px)/(1920-320)))] pb-[calc(16px+(60-16)*((100vw-320px)/(1920-320)))] overflow-visible">
          <div className="container mx-auto px-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] md:px-12 xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-[calc(18px+(48-18)*((100vw-320px)/(1920-320)))] items-center">

              <div className="flex flex-col text-center lg:text-left items-center lg:items-start z-10">
                <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-6 rounded-full" style={{ backgroundColor: primaryColor + '10' }}>
                  <span className="w-2.5 h-2.5 rounded-full animate-pulse uppercase tracking-wide" style={{ backgroundColor: primaryColor }} />
                  <span className="text-sm font-bold font-mono" style={{ color: primaryColor }}>
                    {hero.badge}
                  </span>
                </div>

                <h1 className="text-[calc(20px+(50-20)*((100vw-320px)/(1920-320)))] font-bold text-slate-900 leading-[1.08] mb-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] tracking-tight max-w-2xl">
                  {hero.title ? (
                    hero.title
                  ) : (
                    <>
                      Automate Conversations Visually Without{" "}
                      <span className="bg-gradient-to-r bg-clip-text text-transparent" style={{ backgroundImage: `linear-gradient(to right, ${primaryColor}, #10b981)`, WebkitBackgroundClip: "text" }}>
                        Any Code
                      </span>
                    </>
                  )}
                </h1>

                <p className="text-[calc(14px+(17-14)*((100vw-320px)/(1920-320)))] text-slate-600 mb-[calc(14px+(32-14)*((100vw-320px)/(1920-320)))] max-w-xl leading-relaxed font-semibold">
                  {hero.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    onClick={() => router.push(isAuthenticated ? ROUTES.Dashboard : hero.button_url)}
                    className="text-white px-8! py-5! h-12! rounded-lg font-bold text-[16px] transition-all hover:scale-[1.02] active:scale-98 border-none cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 24px ${primaryColor}20` }}
                  >
                    {hero.button_text} <ArrowUpRight size={16} />
                  </Button>
                </div>

                <div className="mt-[calc(16px+(32-16)*((100vw-320px)/(1920-320)))] flex flex-wrap justify-center lg:justify-start gap-y-3 gap-x-6 text-[12.5px] font-bold text-slate-600">
                  {hero.bullets.map((b: string, i: number) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <CheckCircle2 size={16} style={{ color: primaryColor }} /> {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-tr blur-[30px] rounded-3xl -z-10" style={{ backgroundImage: `linear-gradient(to top right, ${primaryColor}15, #10b98115)` }} />

                <div className="relative w-full aspect-[16/9] rounded-lg overflow-hidden">
                  <Image
                    src={getResolvedImageUrl(hero.image)}
                    alt={hero.title || "Automation Builder Preview"}
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        <AutomationCatalog flowNodes={flowNodes} primaryColor={primaryColor} />

        <AutomationUseCases useCases={useCases} primaryColor={primaryColor} />

        <AutomationFAQs faqs={faqs} primaryColor={primaryColor} />

      </div>
    </ProductLayout>
  );
}
