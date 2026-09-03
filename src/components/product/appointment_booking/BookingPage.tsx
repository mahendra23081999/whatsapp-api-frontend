"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProductLayout from "@/src/components/product/ProductLayout";
import { ROUTES } from "@/src/constants";
import { useAppSelector } from "@/src/redux/hooks";
import { ArrowUpRight, CheckCircle2, Calendar } from "lucide-react";
import Image from "next/image";
import { getResolvedImageUrl } from "@/src/utils/image";

import BookingJourney from "./components/BookingJourney";
import BookingUsecases from "./components/BookingUsecases";
import BookingCapabilities from "./components/BookingCapabilities";
import BookingFAQs from "./components/BookingFAQs";
import { Button } from "@/src/elements/ui/button";

interface BookingPageProps {
  pageData: any;
}

export default function BookingPage({ pageData }: BookingPageProps) {
  const router = useRouter();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const page = pageData?.data;
  const isPageValid = page && page.status && page.dynamic_content;
  const dc = isPageValid ? page.dynamic_content : {};

  const colorConfig = page?.color_config || {};
  const primaryColor = colorConfig.primary_color || "#e11d48";

  const hero = {
    badge: dc.hero?.badge || "Automated Booking",
    title: dc.hero?.title || "Automate Appointments and Timelines on WhatsApp Flows",
    subtitle: dc.hero?.subtitle || "Let clients pick dates, select practitioners, and book appointments inside WhatsApp without loading websites. Automatically sync calendars, dispatch notifications, and trigger no-show reminders.",
    button_text: dc.hero?.button_text || "Start Booking Free",
    button_url: dc.hero?.button_url || ROUTES.SignUp,
    bullet_points: Array.isArray(dc.hero?.bullet_points) ? dc.hero.bullet_points : ["Google & Outlook Sync", "Interactive booking maps", "80% lower no-show rates"],
    image: dc.hero?.image || dc.hero?.side_image || null,
  };

  const bookingJourney = {
    badge: dc.booking_journey?.badge || "SCHEDULING ENGINE",
    title: dc.booking_journey?.title || "The In-Chat Booking Journey",
    description: dc.booking_journey?.description || "Provide a complete self-service scheduling journey directly within WhatsApp conversations.",
    steps: Array.isArray(dc.booking_journey?.steps) ? dc.booking_journey.steps : [
      {
        title: "Browse & Select",
        description: "Clients browse availability dates and pick specialist slots natively inside WhatsApp — no website redirects needed.",
        image: null
      },
      {
        title: "Deposit & Lock",
        description: "Reduce no-shows by collecting secure booking deposit fees directly inside the chat with one-tap payment.",
        image: null
      },
      {
        title: "Calendar Sync",
        description: "Reserved slots write immediately to Google/Outlook calendar to block conflicts in real time.",
        image: null
      }
    ]
  };

  const usecases = {
    badge: dc.usecases?.badge || "USE CASES",
    title: dc.usecases?.title || "Real-Time Scheduling Automation Examples",
    examples: Array.isArray(dc.usecases?.examples) ? dc.usecases.examples : [
      {
        title: "Medical Clinics",
        description: "Patients select doctors, choose open times, and answer simple pre-consultation health questions (e.g. allergies) straight from WhatsApp chat bubbles."
      },
      {
        title: "Spas & Salons",
        description: "Beauty salons and spas let customers choose specific therapist operators, book massage slots, and secure bookings via reservation links."
      },
      {
        title: "Sales Demos",
        description: "B2B consultancies sync corporate Google calendars. When prospects interact with the WhatsApp Flow, they book Zoom video meet calls."
      },
      {
        title: "Coaching & Consulting",
        description: "Lawyers, coaches, and advisory consultants collect diagnostic details, reserve slots, and handle initial deposit fees securely in-chat."
      }
    ]
  };

  const architecture = {
    title: dc.architecture?.title || "Robust Appointment Scheduling Architecture",
    description: dc.architecture?.description || "Engine Features",
    steps: Array.isArray(dc.architecture?.steps) ? dc.architecture.steps : [
      {
        title: "Native WhatsApp Flows",
        description: "Build multi-step scheduling forms that display calendar lists natively inside WhatsApp without loading web browser links."
      },
      {
        title: "Calendar Integrations",
        description: "Establish bi-directional updates with Google Calendar, Outlook, and major CRM sheets to block booked slot items instantly."
      },
      {
        title: "No-Show Reminders",
        description: "Dispatch automated follow-up warnings (24 hours or 2 hours prior) via WhatsApp, helping businesses cut down missed bookings."
      },
      {
        title: "Timezone Sync Adaptation",
        description: "Automatically shifts slot timings based on the client's local phone coordinates, preventing scheduling errors across countries."
      }
    ]
  };

  const faqs = {
    badge: dc.faqs?.badge || "FAQs",
    title: dc.faqs?.title || "Questions about Scheduling?",
    items: Array.isArray(dc.faqs?.items) ? dc.faqs.items : [
      {
        question: "How does the calendar sync prevent overlap?",
        answer: "Operates with real-time API integrations. Whenever a customer opens the WhatsApp Flow scheduler form, It queries your Google/Outlook calendar to block out slots that contain existing events."
      },
      {
        question: "Can customers reschedule or cancel their slots?",
        answer: "Absolutely. The confirmation cards dispatched to WhatsApp contain reschedule and cancel CTA buttons. Clicking them releases the blocked calendar slot and allows picking a new timing."
      },
      {
        question: "Does it support multiple timezones?",
        answer: "Yes. Timezones are managed dynamically. When a client triggers the scheduling form, the system automatically detects their phone's local timezone settings and displays calendar slot schedules adjusted accordingly."
      }
    ]
  };

  return (
    <ProductLayout>
      <div className="relative overflow-x-hidden bg-[#FCFCFD] text-slate-800 font-sans text-left">

        <div className="absolute top-[2%] left-[-15%] w-[60vw] h-[60vw] rounded-full blur-[130px] pointer-events-none" style={{ backgroundColor: "#e11d48", opacity: 0.07 }} />
        <div className="absolute top-[35%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: "#a855f7", opacity: 0.05 }} />

        <div className="absolute inset-0 opacity-45 pointer-events-none -z-10" style={{ backgroundImage: "radial-gradient(ellipse at center, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <section className="relative pt-[calc(16px+(40-16)*((100vw-320px)/(1920-320)))] pb-[calc(16px+(60-16)*((100vw-320px)/(1920-320)))] overflow-visible">
          <div className="container mx-auto px-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] md:px-12 xl:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-[calc(16px+(48-16)*((100vw-320px)/(1920-320)))] items-center max-w-8xl mx-auto">

              <div className="flex flex-col text-left items-start z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full uppercase tracking-wide shadow-sm w-fit" style={{ backgroundColor: primaryColor + '10' }}>
                  <Calendar size={14} style={{ color: primaryColor }} />
                  <span className="text-xs font-bold font-mono" style={{ color: primaryColor }}>
                    {hero.badge}
                  </span>
                </div>

                <h1 className="text-[calc(18px+(50-18)*((100vw-320px)/(1920-320)))] font-black text-slate-900 leading-[1.08] mb-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] tracking-tight">
                  {hero.title}
                </h1>

                <p className="text-[calc(14px+(17-14)*((100vw-320px)/(1920-320)))] text-slate-600 mb-[calc(12px+(32-12)*((100vw-320px)/(1920-320)))] max-w-xl leading-relaxed font-semibold">
                  {hero.subtitle}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <Button
                    onClick={() => router.push(isAuthenticated ? ROUTES.Dashboard : hero.button_url)}
                    className="text-white px-8! py-5! h-12! rounded-lg font-bold text-[16px] transition-all hover:scale-[1.02] active:scale-98 border-none cursor-pointer flex items-center justify-center gap-2"
                    style={{ backgroundColor: primaryColor, boxShadow: `0 10px 30px ${primaryColor}30` }}
                  >
                    {hero.button_text} <ArrowUpRight size={16} />
                  </Button>
                </div>

                {hero.bullet_points.length > 0 && (
                  <div className="mt-[calc(16px+(32-16)*((100vw-320px)/(1920-320)))] flex flex-wrap gap-y-3 gap-x-6 text-[12.5px] font-bold text-slate-600">
                    {hero.bullet_points.map((bullet: string, idx: number) => (
                      <span key={idx} className="flex items-center gap-1.5">
                        <CheckCircle2 size={16} style={{ color: primaryColor }} /> {bullet}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative w-full max-w-[500px] mx-auto z-10 p-1">
                <div className="w-full hover:-translate-y-1 transition-all duration-300">
                  <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-50">
                    <Image
                      src={getResolvedImageUrl(hero.image)}
                      alt={hero.title || "Appointment booking preview"}
                      fill
                      unoptimized
                      className="object-cover rounded-lg"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        <BookingJourney bookingJourney={bookingJourney} primaryColor={primaryColor} />

        <BookingUsecases usecases={usecases} primaryColor={primaryColor} />

        <BookingCapabilities architecture={architecture} primaryColor={primaryColor} />

        <BookingFAQs faqs={faqs} primaryColor={primaryColor} />

      </div>
    </ProductLayout>
  );
}
