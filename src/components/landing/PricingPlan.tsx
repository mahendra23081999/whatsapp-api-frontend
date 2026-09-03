"use client";

import { ROUTES } from "@/src/constants";
import { useAppSelector } from "@/src/redux/hooks";
import { ArrowRight, Check, Crown, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PricingPlanProps } from "../../types/landingPage";
import CurrencyValue from "@/src/shared/CurrencyValue";

// ─── Billing cycle types ─────────────────────────────────────────────────────
type BillingTab = "monthly" | "yearly" | "lifetime";

const BILLING_TABS: { id: BillingTab; label: string }[] = [
  { id: "monthly",  label: "Monthly" },
  { id: "yearly",   label: "Yearly" },
  { id: "lifetime", label: "One Time" },
];

const getHeaderPillBg = (idx: number, name: string): string => {
  const n = name.toLowerCase();
  if (n.includes("pro") || n.includes("plus") || idx === 1) return "bg-sky-500 text-white shadow-sky-500/20";
  if (n.includes("ultimate") || n.includes("enterprise") || idx === 2) return "bg-amber-500 text-white shadow-amber-500/20";
  return "bg-emerald-500 text-white shadow-emerald-500/20";
};

const PRICE_SUFFIX: Record<BillingTab, string> = {
  monthly:  "/mo",
  yearly:   "/yr",
  lifetime: "",
};

const PricingPlan: React.FC<PricingPlanProps> = ({ data }) => {
  const router = useRouter();
  const [billingTab, setBillingTab] = useState<BillingTab>(() => {
    const availableCycles = new Set(
      (data.plans || [])
        .map((p) => (p._id?.billing_cycle || "monthly").toLowerCase() as BillingTab)
        .filter(Boolean)
    );
    if (availableCycles.has("monthly")) return "monthly";
    if (availableCycles.has("yearly")) return "yearly";
    if (availableCycles.has("lifetime")) return "lifetime";
    return "monthly";
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const { t } = useTranslation();

  const DEFAULT_VISIBLE = 10;

  // Filter & map plans for the active billing tab
  const plans = (data.plans || [])
    .filter((p) => {
      const cycle = (p._id?.billing_cycle || "monthly").toLowerCase();
      return cycle === billingTab;
    })
    .map((p, idx) => {
      const planDoc = p._id;
      if (!planDoc) return null;

      const formattedFeatures = Object.entries(planDoc.features || {})
        .filter(([key]) => !["_id", "id", "__v"].includes(key))
        .map(([key, value]) => ({ key, label: t(`plan_features_${key}`, key.replace(/_/g, " ")), value }));

      return {
        name: planDoc.name,
        price: planDoc.price || 0,
        currencyCode: planDoc.currency,
        features: formattedFeatures,
        enabledFeatures: planDoc.enabled_features || {},
        is_featured: planDoc.is_featured,
        originalIdx: idx,
      };
    })
    .filter(Boolean);

  // Highlighted (featured) plan logic
  const featuredCount = plans.filter((p) => p?.is_featured).length;
  let highlightedIndex = -1;
  if (featuredCount === 1) {
    highlightedIndex = plans.findIndex((p) => p?.is_featured);
  } else if (plans.length > 0) {
    const proIdx = plans.findIndex((p) => p?.name.toLowerCase() === "pro");
    highlightedIndex = proIdx !== -1 ? proIdx : Math.floor(plans.length / 2);
  }

  const getFeatureInfoForPlan = (plan: any, label: string) => {
    const feature = plan.features.find((f: any) => f.label === label);
    if (!feature) return { value: undefined, isDisabled: true };

    const { key, value } = feature;
    let isDisabled = false;

    // Check if the toggle in enabledFeatures is explicitly false/disabled
    if (plan.enabledFeatures && key in plan.enabledFeatures) {
      if (!plan.enabledFeatures[key]) {
        isDisabled = true;
      }
    }

    // Check if value is 0, "0", or false
    if (value === 0 || value === "0" || value === false) {
      isDisabled = true;
    }

    return { value, isDisabled };
  };

  // All unique feature labels across visible plans, keeping only those that are enabled in at least one plan
  const allFeatureLabels = Array.from(
    new Set(plans.flatMap((plan) => plan!.features.map((f) => f.label))),
  ).filter((label) => {
    return plans.some((plan) => {
      const { isDisabled } = getFeatureInfoForPlan(plan, label);
      return !isDisabled;
    });
  });

  const renderFeatureValue = (value: any, isDisabled: boolean) => {
    if (isDisabled) {
      return (
        <span className="bg-rose-100 text-rose-700 text-[10px] font-black p-2 rounded-full inline-block"><X size={16} /></span>
      );
    }
    if (typeof value === "boolean") {
      return value ? (
        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black p-2 rounded-full inline-block"><Check size={16} /></span>
      ) : (
        <span className="bg-rose-100 text-rose-700 text-[10px] font-black p-2 rounded-full inline-block"><X size={16} /></span>
      );
    }
    if (value === null || value === undefined) return <span className="text-slate-400 font-semibold">—</span>;
    return <span className="text-sm font-bold text-slate-800">{value}</span>;
  };

  const handleChoosePlan = () => {
    if (isAuthenticated) {
      router.push(user?.role === "agent" ? ROUTES.WAChat : ROUTES.BillingPlans);
    } else {
      router.push(ROUTES.Login);
    }
  };

  return (
    <section id="pricing" className="py-[calc(20px+(50-20)*((100vw-320px)/(1920-320)))] bg-gray-50">
      <div className="max-w-[1435px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-[calc(16px+(48-16)*((100vw-320px)/(1920-320)))]">
          <span className="inline-block text-[12px] font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full mb-4">
            {data.badge || "PRICING"}
          </span>
          <h2 className="text-[calc(20px+(36-20)*((100vw-320px)/(1920-320)))] font-black text-slate-900 mb-[calc(14px+(24-14)*((100vw-320px)/(1920-320)))] leading-tight">
            {data.title || "Simple, Transparent Pricing"}
          </h2>
          <p className="text-[17px] text-slate-600 leading-relaxed">
            {data.description || "Choose the perfect plan for your business size and needs."}
          </p>

          <div className="mt-8 inline-flex items-center p-1 bg-white border border-slate-200 rounded-xl shadow-sm gap-1">
            {BILLING_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => { setBillingTab(tab.id); setIsExpanded(false); }}
                className={`relative px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 cursor-pointer ${
                  billingTab === tab.id
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                {tab.label}
                {tab.id === "yearly" && (
                  <span className="absolute -top-2.5 -right-2 text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded-full leading-none">
                    SAVE
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 font-semibold text-base">No plans available for this billing cycle.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto no-scrollbar rounded-lg border border-slate-200 bg-white shadow-xl shadow-slate-100">
            <table className="w-full border-collapse min-w-max text-left">
              <thead>
                <tr className="border-b border-slate-200">
                  {/* Feature Label Header */}
                  <th className="p-4 md:p-6 min-w-[130px] w-[130px] md:min-w-[250px] md:w-[250px] bg-slate-50 bg-clip-padding font-black text-slate-800 text-xs md:text-base sticky left-0 z-20">
                    Features Comparison
                  </th>

                  {plans.map((plan, idx) => {
                    const isFeatured = idx === highlightedIndex;
                    return (
                      <th key={idx} className="p-4 md:p-8 min-w-[220px] w-[220px] md:min-w-[280px] md:w-[280px] text-center bg-white border-r border-slate-200! last:border-r-0 align-top">
                        <div className="flex flex-col items-center">
                          <h3 className="text-lg font-black text-slate-900 mb-1 flex items-center justify-center gap-1.5">
                            {plan!.name}
                            {isFeatured && (
                              <span className="inline-flex items-center justify-center bg-amber-500 text-white w-5 h-5 rounded-full shadow-md shadow-amber-500/25">
                                <Crown size={11} className="fill-white text-white" />
                              </span>
                            )}
                          </h3>
                          <p className="text-sm text-slate-400 break-all whitespace-normal line-clamp-2 font-semibold mb-6">
                            {isFeatured ? "Customized solutions" : "Perfect for small teams"}
                          </p>

                          {/* Pricing Badge */}
                          <div className={`inline-flex items-center gap-1.5 py-3! px-8! rounded-lg text-lg font-extrabold shadow-lg ${getHeaderPillBg(idx, plan!.name)}`}>
                            <CurrencyValue
                              amount={plan!.price}
                              fromCode={plan!.currencyCode?.code}
                              className="font-black text-white"
                              fallbackSymbol={plan!.currencyCode === "INR" ? "₹" : "$"}
                            />
                            <span className="text-xs opacity-90 tracking-wide font-bold">
                              {PRICE_SUFFIX[billingTab]}
                            </span>
                          </div>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {(isExpanded ? allFeatureLabels : allFeatureLabels.slice(0, DEFAULT_VISIBLE)).map((label) => (
                  <tr key={label} className="border-b border-slate-200 hover:bg-slate-50/30 transition-colors last:border-b-0">
                    <td className="p-4 md:p-6 bg-slate-50 bg-clip-padding font-bold text-slate-700 text-xs md:text-sm border-r border-slate-200 capitalize sticky left-0 z-10">
                      {label}
                    </td>
                    {plans.map((plan, idx) => {
                      const { value, isDisabled } = getFeatureInfoForPlan(plan, label);
                      return (
                        <td key={idx} className="p-4 md:p-6 text-center border-r border-slate-200 last:border-r-0">
                          {renderFeatureValue(value, isDisabled)}
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* View More / Less Toggle */}
                {allFeatureLabels.length > DEFAULT_VISIBLE && (
                  <tr className="border-b border-slate-200 bg-slate-50/20">
                    <td colSpan={plans.length + 1} className="py-4 text-left relative">
                      <div className="sticky left-1/2 -translate-x-1/2 w-max z-20 inline-block">
                        <button
                          onClick={() => setIsExpanded(!isExpanded)}
                          className="inline-flex items-center gap-2 text-sm font-black text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-sm hover:shadow"
                        >
                          {isExpanded ? (
                            <>
                              <span>View Less</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                            </>
                          ) : (
                            <>
                              <span>View More ({allFeatureLabels.length - DEFAULT_VISIBLE} more features)</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Footer CTA Row */}
                <tr className="bg-slate-50/10">
                  <td className="p-4 md:p-8 border-r border-slate-200 bg-slate-50 bg-clip-padding sticky left-0 z-10" />
                  {plans.map((_, idx) => (
                    <td key={idx} className="p-4 md:p-8 text-center border-r border-slate-200 last:border-r-0">
                      <button
                        onClick={handleChoosePlan}
                        className="group inline-flex items-center justify-between gap-6 border border-slate-200 hover:border-primary bg-white text-slate-800 font-extrabold text-sm py-2 pl-6 pr-2 rounded-lg transition-all cursor-pointer shadow-sm hover:shadow-md"
                      >
                        <span>Choose Plan</span>
                        <div className="bg-primary group-hover:bg-primary/95 text-white w-8 h-8 rounded-lg flex items-center justify-center transition-all">
                          <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform text-white" />
                        </div>
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default PricingPlan;
