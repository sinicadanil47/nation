"use client";

import { Minus, Plus } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { Ministry } from "@/types/game";

interface Props {
  ministry: Ministry;
  onClose: () => void;
  onFundingChange: (id: Ministry["id"], value: number) => void;
}

export default function MinistryDrawer({
  ministry,
  onClose,
  onFundingChange,
}: Props) {
  const actualExpense =
    ministry.expensePerHour * (ministry.fundingPercent / 100);

  return (
    <BottomSheet title={ministry.name} onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card">
          <span>Уровень ведомства</span>
          <strong>{ministry.level}</strong>
        </div>
        <div className="stat-card">
          <span>Эффективность</span>
          <strong>{ministry.performance}%</strong>
        </div>
      </div>

      <div className="mt-5 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <strong>Финансирование</strong>
          <strong className="text-amber-300">
            {ministry.fundingPercent}%
          </strong>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              onFundingChange(ministry.id, ministry.fundingPercent - 10)
            }
            disabled={ministry.fundingPercent <= 50}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 disabled:opacity-35"
            aria-label="Снизить финансирование"
          >
            <Minus size={16} />
          </button>
          <input
            type="range"
            min="50"
            max="150"
            step="10"
            value={ministry.fundingPercent}
            onChange={(event) =>
              onFundingChange(ministry.id, Number(event.target.value))
            }
            className="min-w-0 flex-1 accent-blue-500"
            aria-label="Уровень финансирования"
          />
          <button
            type="button"
            onClick={() =>
              onFundingChange(ministry.id, ministry.fundingPercent + 10)
            }
            disabled={ministry.fundingPercent >= 150}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 disabled:opacity-35"
            aria-label="Увеличить финансирование"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>50%</span>
          <span>100%</span>
          <span>150%</span>
        </div>
      </div>

      <div className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-400">Базовые расходы / час</span>
          <strong>{ministry.expensePerHour.toFixed(2)} млрд</strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Текущие расходы / час</span>
          <strong className="text-amber-300">
            {actualExpense.toFixed(2)} млрд
          </strong>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Оценка работы ведомства</span>
          <strong>{ministry.performance}%</strong>
        </div>
      </div>
      <p className="mt-4 text-xs leading-relaxed text-slate-500">
        Финансирование влияет на расходы казны. Показатель эффективности
        отражает условную оценку работы ведомства.
      </p>
    </BottomSheet>
  );
}
