"use client";

import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

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
  const [visible, setVisible] = useState(true);

  const requestClose = () => setVisible(false);

  return (
    <AnimatePresence onExitComplete={onClose}>
      {visible ? (
        <motion.div
          key="bottom-sheet-backdrop"
          className="sheet-backdrop fixed inset-0 z-50 flex items-end justify-center"
          onClick={requestClose}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <motion.section
            className="bottom-sheet max-h-[88dvh] w-full max-w-[520px] overflow-y-auto rounded-t-[28px] border border-white/[0.07] bg-gradient-to-b from-[#182234] via-[#131926] to-[#0D111A] px-4 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-18px_70px_rgba(0,0,0,.58)] sm:px-5"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ y: 44, opacity: 0.7 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 36, opacity: 0 }}
            transition={{ type: "spring", stiffness: 360, damping: 34, mass: 0.8 }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-600" />
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="min-w-0 break-words text-lg font-extrabold text-slate-50">{title}</h2>
              <motion.button
                type="button"
                onClick={requestClose}
                whileTap={{ scale: 0.97 }}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.05] text-slate-200 transition-colors duration-200"
                aria-label="Закрыть"
              >
                <X size={20} />
              </motion.button>
            </div>
            {children}
          </motion.section>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
