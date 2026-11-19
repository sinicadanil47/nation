"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode, MouseEvent } from "react";

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
  const stopPropagation = (event: MouseEvent<HTMLElement>) => {
    event.stopPropagation();
  };

  return (
    <motion.div
      className="sheet-backdrop fixed inset-0 z-[60] flex items-end justify-center"
      onClick={onClose}
      role="presentation"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <motion.section
        className="bottom-sheet max-h-[min(88dvh,900px)] w-full max-w-[520px] overflow-x-hidden overflow-y-auto overscroll-contain rounded-t-[28px] border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] px-4 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_70px_rgba(0,0,0,.58)] sm:px-5"
        onClick={stopPropagation}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ y: 36, opacity: 0.7 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 36, mass: 0.8 }}
      >
        <div className="sticky top-0 z-10 -mx-4 mb-4 bg-gradient-to-b from-[#131926] to-[#131926]/95 px-4 pb-3 pt-1 sm:-mx-5 sm:px-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-600" />
          <div className="flex items-center justify-between gap-3">
            <h2 className="min-w-0 break-words text-lg font-extrabold text-slate-50">
              {title}
            </h2>
            <motion.button
              type="button"
              onClick={onClose}
              whileTap={{ scale: 0.92 }}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-slate-200 transition-colors hover:bg-white/10"
              aria-label="Закрыть"
            >
              <X size={20} />
            </motion.button>
          </div>
        </div>
        <div className="min-w-0">{children}</div>
      </motion.section>
    </motion.div>
  );
}
