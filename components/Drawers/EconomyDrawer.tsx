"use client";

import { Minus, Plus } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState, TaxKey } from "@/types/game";

interface Props {
  game: GameState;
  onClose: () => void;
  onTaxChange: (key: TaxKey, value: number) => void;
}

const rows: { key: TaxKey; label: string }[] = [
  { key: "vat", label: "НДС" },
  { key: "income", label: "НДФЛ" },
  { key: "profit", label: "Налог на прибыль" },
];

export default function EconomyDrawer({ game, onClose, onTaxChange }: Props) {
  return (
    <BottomSheet title="Экономика и налоги" onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="stat-card">
          <span>Налоговые поступления</span>
          <strong>{game.budget.taxRevenue.toFixed(1)} млрд/ч</strong>
        </div>
        <div className="stat-card">
          <span>Собираемость</span>
          <strong>{game.taxes.collectionRate.toFixed(1)}%</strong>
        </div>
      </div>
      {rows.map(({ key, label }) => (
        <div key={key} className="mb-5">
          <div className="mb-2 flex justify-between text-sm">
            <strong>{label}</strong>
            <strong className="text-amber-300">{game.taxes[key]}%</strong>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onTaxChange(key, game.taxes[key] - 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800"
              aria-label={`Уменьшить ${label}`}
            >
              <Minus size={16} />
            </button>
            <input
              type="range"
              min="0"
              max="45"
              value={game.taxes[key]}
              onChange={(event) => onTaxChange(key, Number(event.target.value))}
              className="h-2 min-w-0 flex-1 accent-blue-500"
              aria-label={label}
            />
            <button
              type="button"
              onClick={() => onTaxChange(key, game.taxes[key] + 1)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800"
              aria-label={`Увеличить ${label}`}
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      ))}
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-3">
        <strong className="text-xs text-amber-300">
          Теневая экономика: {game.taxes.shadowEconomy.toFixed(1)}%
        </strong>
        <p className="mt-1 text-xs leading-relaxed text-slate-400">
          Высокая налоговая нагрузка может увеличить долю теневой экономики и
          снизить собираемость платежей.
        </p>
      </div>
      <div className="mt-4 space-y-3 border-t border-slate-700 pt-3 text-sm">
        <p className="flex justify-between">
          <span className="text-slate-400">Доход / час</span>
          <strong className="text-emerald-300">{game.budget.incomePerHour.toFixed(1)} млрд</strong>
        </p>
        <p className="flex justify-between">
          <span className="text-slate-400">Расходы / час</span>
          <strong>{game.budget.expensesPerHour.toFixed(1)} млрд</strong>
        </p>
      </div>
    </BottomSheet>
  );
}
