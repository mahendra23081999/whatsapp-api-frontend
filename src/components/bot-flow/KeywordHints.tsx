import React from "react";
import { Info } from "lucide-react";

interface KeywordHintsProps {
  triggerKeywords: string[];
  onKeywordClick: (keyword: string) => void;
}

export const KeywordHints: React.FC<KeywordHintsProps> = ({
  triggerKeywords,
  onKeywordClick,
}) => {
  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
        <Info size={14} className="text-primary" />
        Trigger Keywords Defined
      </h4>
      {triggerKeywords.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {triggerKeywords.map((kw) => (
            <button
              key={kw}
              onClick={() => onKeywordClick(kw)}
              className="text-[10px] font-bold px-2 py-1 bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md text-primary transition-colors cursor-pointer"
            >
              {kw}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[11px] text-slate-400">
          No explicit keywords found. Use any greeting message to trigger "Any Message" rules.
        </p>
      )}
    </div>
  );
};
