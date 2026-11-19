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
        className="bottom-sheet max-h-[86dvh] w-full max-w-[480px] overflow-y-auto rounded-t-[28px] border border-slate-700 bg-[#151F32] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-2xl"
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-slate-200"
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
