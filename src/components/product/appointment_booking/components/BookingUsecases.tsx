"use client";

import React from "react";
import { Calendar, Sparkles, Video, User, Settings } from "lucide-react";

interface ExampleItem {
  title: string;
  description: string;
}

interface BookingUsecasesProps {
  usecases: {
    badge?: string;
    title?: string;
    examples: ExampleItem[];
  };
  primaryColor: string;
}

export default function BookingUsecases({ usecases, primaryColor }: BookingUsecasesProps) {
  const examples = Array.isArray(usecases.examples) ? usecases.examples : [];

  const getUsecaseIcon = (index: number) => {
    const icons = [
      <Calendar key="0" className="w-5 h-5" />,
      <Sparkles key="1" className="w-5 h-5" />,
      <Video key="2" className="w-5 h-5" />,
      <User key="3" className="w-5 h-5" />
    ];
    return icons[index % icons.length] || <Settings key="default" className="w-5 h-5" />;
  };

  const getUsecaseBgStyle = (index: number) => {
    const bgColors = [
      "bg-rose-50 border-rose-100/60 text-rose-600",
      "bg-purple-50 border-purple-100/60 text-purple-600",
      "bg-blue-50 border-blue-100/60 text-blue-600",
      "bg-emerald-50 border-emerald-100/60 text-emerald-600"
    ];
    return bgColors[index % bgColors.length] || bgColors[0];
  };

  return (
    <section className="py-[calc(20px+(50-20)*((100vw-320px)/(1920-320)))] bg-white border-y border-slate-200/50">
      <div className="container mx-auto px-[calc(8px+(24-8)*((100vw-320px)/(1920-320)))] md:px-12 xl:px-16">

        <div className="text-center max-w-3xl mx-auto mb-[calc(20px+(56-20)*((100vw-320px)/(1920-320)))]">
          <span className="text-xs px-4 py-1.5 rounded-full uppercase tracking-wide font-bold text-primary font-mono bg-[#e11d4810]" style={{ color: primaryColor }}>
            {usecases.badge || "USE CASES"}
          </span>
          <h2 className="text-[calc(20px+12*((100vw-320px)/1600))] font-black text-slate-900 tracking-tight leading-tight mt-2.5">
            {usecases.title || "Real-Time Scheduling Automation Examples"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-[calc(18px+(40-18)*((100vw-320px)/(1920-320)))] max-w-7xl mx-auto text-left">
          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="group bg-slate-50 p-5 rounded-lg shadow-xs border-l-4 hover:bg-slate-100 transition-colors duration-300"
              style={{ borderLeftColor: primaryColor }}
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300 ${getUsecaseBgStyle(idx)}`}>
                  {getUsecaseIcon(idx)}
                </div>
                <h4 className="text-[17px] font-black text-slate-900 transition-colors" style={{ color: primaryColor }}>
                  {ex.title}
                </h4>
              </div>
              <p className="text-[14.5px] text-slate-500 leading-relaxed font-medium font-sans">
                {ex.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
