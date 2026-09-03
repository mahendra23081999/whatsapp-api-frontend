import React from "react";
import { Terminal } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface ExecutionLogsProps {
  executionLogs: any[];
}

export const ExecutionLogs: React.FC<ExecutionLogsProps> = ({ executionLogs }) => {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
        <Terminal size={14} className="text-emerald-500" />
        Live Execution Traces
      </h4>
      <div className="border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-200 font-mono text-[10px] h-[300px] p-3 overflow-y-auto space-y-1.5 custom-scrollbar">
        {executionLogs.length === 0 ? (
          <div className="text-slate-500 italic flex items-center justify-center h-full">
            Logs will display here as nodes execute.
          </div>
        ) : (
          executionLogs.map((log: any, idx: number) => (
            <div key={idx} className="flex flex-col pb-1">
              <div className="flex justify-between items-center">
                <span className={cn(
                  "font-bold",
                  log.status === "success" ? "text-emerald-400" : "text-rose-400"
                )}>
                  {log.status.toUpperCase()}: {log.node_type}
                </span>
                <span className="text-[8px] text-slate-500">
                  {new Date(log.start_time).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-[9px] text-slate-400">ID: {log.node_id}</span>
              {log.error && (
                <span className="text-[9px] text-rose-300 bg-rose-950/30 px-1 py-0.5 mt-0.5 rounded">
                  Err: {log.error}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
