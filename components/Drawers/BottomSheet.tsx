"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";

interface BottomSheetProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function BottomSheet({
  title,
  onClose,
  children,
}: BottomSheetProps) {
  return (
    <div
      className="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center"
      onClick={onClose}
      role="presentation"
    >
      <section
        className="bottom-sheet max-h-[88dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_70px_rgba(0,0,0,.58)] sm:px-5"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-600" />
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-slate-50">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-slate-200 transition-all duration-200 active:scale-[0.98]"
            aria-label="Закрыть"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
