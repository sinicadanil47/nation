"use client";

import { Minus, Plus } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState, Ministry } from "@/types/game";

interface Props {
  game: GameState;
  ministry: Ministry;
  onClose: () => void;
  onFundingChange: (id: Ministry["id"], value: number) => void;
}

export default function MinistryDrawer({
  game,
  ministry,
  onClose,
  onFundingChange,
}: Props) {
  const actualExpense = ministry.expensePerHour * (ministry.fundingPercent / 100);
  const expenseDelta = actualExpense - ministry.expensePerHour;
  const shadowEconomy = game.taxes.shadowEconomy;
  const staffShortage = game.workforce > 0 && game.unemployed / game.workforce < 0.02;

  const advisor = ministry.id === "security" || ministry.id === "defense"
    ? game.security.corruption >= 20
      ? "Коррупция остаётся высокой. Приоритет — антикоррупционное бюро: снижение коррупции улучшит системную стабильность."
      : "Показатели силовых ведомств устойчивы. Поддерживайте готовность без чрезмерного увеличения постоянных расходов."
    : ministry.id === "education"
      ? staffShortage
        ? "Низкая безработица указывает на кадровое ограничение. Сохраните финансирование подготовки специалистов перед расширением заводов."
        : "Свободный рынок труда позволяет наращивать выпуск. Подготовка специалистов расширит кадровый резерв."
      : ministry.id === "economy"
        ? shadowEconomy >= 25
          ? "Теневая экономика высока. Усильте собираемость и антикоррупционные меры, прежде чем повышать налоговую нагрузку."
          : "Собираемость стабильна. Сфокусируйтесь на предсказуемых правилах и инвестициях в производительность."
        : "Сравнивайте предельный эффект финансирования с дополнительными расходами. Повышайте бюджет только там, где растёт эффективность.";

  const saving = Math.max(0, -expenseDelta);
  const extraCost = Math.max(0, expenseDelta);

  return (
    <BottomSheet title={ministry.name} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card flex flex-col gap-1">
          <span>Уровень ведомства</span>
          <strong className="tabular-nums">{ministry.level}</strong>
        </div>
        <div className="stat-card flex flex-col gap-1">
          <span>Эффективность</span>
          <strong className="tabular-nums text-emerald-400">{ministry.performance}%</strong>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="stat-card">
          <span>Базовые расходы / час</span>
          <strong className="tabular-nums">{ministry.expensePerHour.toFixed(2)} млрд</strong>
        </div>
        <div className="stat-card">
          <span>Текущие расходы / час</span>
          <strong className="tabular-nums">{actualExpense.toFixed(2)} млрд</strong>
          {expenseDelta === 0 ? (
            <small className="text-slate-500">Без изменения</small>
          ) : saving > 0 ? (
            <small className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-1 text-[9px] font-bold tabular-nums text-emerald-400">
              +{saving.toFixed(2)} млрд/ч экономии
            </small>
          ) : (
            <small className="rounded-md border border-rose-500/30 bg-rose-500/15 px-1.5 py-1 text-[9px] font-bold tabular-nums text-rose-400">
              −{extraCost.toFixed(2)} млрд/ч к расходам
            </small>
          )}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-4 shadow-lg transition-all duration-200">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <strong>Финансирование</strong>
          <strong className="tabular-nums text-amber-300">{ministry.fundingPercent}%</strong>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onFundingChange(ministry.id, ministry.fundingPercent - 10)}
            disabled={ministry.fundingPercent <= 50}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] transition-all duration-200 active:scale-[0.98] disabled:opacity-35"
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
            onChange={(event) => onFundingChange(ministry.id, Number(event.target.value))}
            className="min-w-0 flex-1 accent-emerald-400"
            aria-label="Уровень финансирования"
          />
          <button
            type="button"
            onClick={() => onFundingChange(ministry.id, ministry.fundingPercent + 10)}
            disabled={ministry.fundingPercent >= 150}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800 transition-all duration-200 disabled:opacity-35"
            aria-label="Увеличить финансирование"
          >
            <Plus size={16} />
          </button>
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>50%</span><span>100%</span><span>150%</span>
        </div>
      </div>

      <div className="mt-3 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-950/25 to-[#0D111A] p-4 shadow-lg">
        <p className="mb-1 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Советник ведомства</p>
        <p className="text-[11px] leading-relaxed text-slate-200">{advisor}</p>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">
        Финансирование напрямую меняет расходы казны. Модель эффективности ведомства остаётся частью текущей игровой симуляции.
      </p>
    </BottomSheet>
  );
}
