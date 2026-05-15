"use client";
import { useState } from "react";
import { HELP } from "@/lib/help-content";

export function HelpButton({ pageKey }: { pageKey: string }) {
  const [open, setOpen] = useState(false);
  const content = HELP[pageKey];
  if (!content) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-primary-600 text-white shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors text-sm font-bold"
        title="Help"
        aria-label="Help"
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="font-semibold text-slate-800 text-base">{content.pageTitle} — Help</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Sluiten"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-4 space-y-4">
              <p className="text-slate-600 text-sm">{content.intro}</p>
              {content.sections.map((s) => (
                <div key={s.title}>
                  <h3 className="font-semibold text-slate-700 text-sm mb-1">{s.title}</h3>
                  <p className="text-slate-500 text-sm whitespace-pre-line">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
