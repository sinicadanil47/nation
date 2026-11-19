"use client";

import { Minus, Plus, Scale, Shield } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import NationIllustration, { type IllustrationVariant } from "@/components/Illustrations";
import type { GameState, Ministry } from "@/types/game";

interface Props {
  game: GameState;
  ministry: Ministry;
  onClose: () => void;
  onFundingChange: (id: Ministry["id"], value: number) => void;
  onSecurityUpgrade: (key: "airDefense" | "cyberForces" | "antiCorruption" | "police") => void;
}

export default function MinistryDrawer({
  game,
  ministry,
  onClose,
  onFundingChange,
  onSecurityUpgrade,
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

  const illustration: IllustrationVariant = ministry.id;

  const saving = Math.max(0, -expenseDelta);
  const extraCost = Math.max(0, expenseDelta);

  return (
    <BottomSheet title={ministry.name} onClose={onClose}>
      <NationIllustration variant={illustration} className="mb-4 h-[88px] w-full" />
      <div className="grid min-w-0 grid-cols-2 gap-3">
        <div className="stat-card flex flex-col gap-1">
          <span>Уровень ведомства</span>
          <strong className="tabular-nums">{ministry.level}</strong>
        </div>
        <div className="stat-card flex flex-col gap-1">
          <span>Эффективность</span>
          <strong className={`text-2xl font-extrabold tabular-nums ${ministry.performance >= 75 ? "text-emerald-400" : ministry.performance >= 50 ? "text-amber-300" : "text-rose-400"}`}>{ministry.performance}%</strong>
          <small className="text-[10px] leading-snug text-slate-400">{ministry.performance >= 75 ? "Состояние стабильное — сохраняйте текущий курс." : ministry.performance >= 50 ? "Нейтрально — точечно улучшайте процессы и контроль." : "Просадка — пересмотрите приоритеты и качество управления."}</small>
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

      {ministry.id === "security" || ministry.id === "defense" ? (
        <section className="mt-4 rounded-2xl border border-cyan-500/20 bg-cyan-950/15 p-4">
          <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[.14em] text-cyan-200">Подразделения и модернизация</h3>
          <p className="mb-3 text-[10px] leading-relaxed text-slate-400">Готовность {game.security.readiness}% · Стабильность {game.security.stability}% · Коррупция {game.security.corruption}%</p>
          <div className="grid grid-cols-2 gap-2">
            {(ministry.id === "defense" ? [["airDefense", "ПВО", Shield], ["cyberForces", "Кибервойска", Shield]] : [["antiCorruption", "Антикоррупционное бюро", Scale], ["police", "Полиция", Shield]]).map(([key, label, Icon]) => {
              const agencyKey = key as "airDefense" | "cyberForces" | "antiCorruption" | "police";
              const level = game.security.modernization[agencyKey];
              const cost = 40 * (level + 1);
              const AgencyIcon = Icon as typeof Shield;
              return <button key={agencyKey} type="button" disabled={level >= 5 || game.budget.treasury < cost} onClick={() => onSecurityUpgrade(agencyKey)} className="flex min-h-[76px] min-w-0 flex-col justify-between rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-2.5 text-left text-[10px] text-emerald-200 disabled:opacity-35">
                <span className="flex items-start gap-2"><AgencyIcon size={14} className="shrink-0 text-cyan-200"/><span className="break-words">{label as string}</span></span>
                <span className="mt-2 text-[9px] tabular-nums text-emerald-300">Ур. {level}/5 · {cost} млрд</span>
              </button>;
            })}
          </div>
        </section>
      ) : null}

      <div className="mt-5 rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-4 shadow-lg transition-all duration-200">
        <div className="mb-2 flex items-center justify-between gap-2 text-sm">
          <strong>Финансирование</strong>
          <strong className={`text-2xl font-extrabold tabular-nums ${ministry.fundingPercent >= 90 && ministry.fundingPercent <= 110 ? "text-emerald-400" : ministry.fundingPercent >= 70 && ministry.fundingPercent <= 125 ? "text-amber-300" : "text-rose-400"}`}>{ministry.fundingPercent}%</strong>
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
        <p className="mt-2 text-[10px] leading-snug text-slate-400">{ministry.fundingPercent < 70 ? "Финансирование критически низкое — увеличьте бюджет для восстановления работы." : ministry.fundingPercent < 90 ? "Финансирование ниже нормы — рассмотрите умеренное повышение." : ministry.fundingPercent <= 110 ? "Финансирование сбалансировано — сохраняйте текущий уровень." : ministry.fundingPercent <= 125 ? "Расходы повышены — проверьте, оправдан ли дополнительный бюджет." : "Перерасход высокий — сократите финансирование до устойчивого уровня."}</p>
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
