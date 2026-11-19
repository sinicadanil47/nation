"use client";

import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import { Plus, Wrench } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState } from "@/types/game";

function AdvisorCard({ children, tone = "neutral" }: {
  children: ReactNode;
  tone?: "positive" | "warning" | "neutral";
}) {
  const style = tone === "positive"
    ? "border-emerald-500/25 bg-emerald-500/10"
    : tone === "warning"
      ? "border-rose-500/25 bg-rose-500/10"
      : "border-cyan-500/20 bg-cyan-500/10";
  return (
    <aside className={`advisor-card rounded-xl border p-3 transition-all duration-200 ${style}`}>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Советник промышленности</p>
      <div className="text-[11px] leading-relaxed text-slate-200">{children}</div>
    </aside>
  );
}

export default function IndustryDrawer({
  game,
  onClose,
  onBuild,
  onRepair,
}: {
  game: GameState;
  onClose: () => void;
  onBuild: (typeId: string, regionId: string) => void;
  onRepair: () => void;
}) {
  const [typeId, setType] = useState(game.enterpriseTypes[0]?.id ?? "");
  const [enterpriseListRef] = useAutoAnimate<HTMLDivElement>({ duration: 180 });
  const [regionId, setRegion] = useState(game.regions[0]?.id ?? "");
  const type = game.enterpriseTypes.find((item) => item.id === typeId);
  const region = game.regions.find((item) => item.id === regionId);
  const count = game.enterprises.filter((enterprise) => enterprise.typeId === typeId).length;
  const cost = type ? type.buildCost * Math.pow(1.1, count) : 0;
  const wear = game.enterprises.length
    ? game.enterprises.reduce((total, enterprise) => total + enterprise.wear, 0) / game.enterprises.length
    : 0;
  const repairCost = game.enterprises.reduce((total, enterprise) => total + enterprise.wear * 0.22, 0);
  const unemployment = game.workforce > 0 ? (game.unemployed / game.workforce) * 100 : 0;
  const jobs = game.enterprises.reduce(
    (total, enterprise) => total + (game.enterpriseTypes.find((item) => item.id === enterprise.typeId)?.jobs ?? 0),
    0,
  );
  const staffing = type && unemployment < 2
    ? Math.min(1, game.specialists / Math.max(1, type.jobs))
    : 1;
  const specializationBonus = Boolean(type && region && region.specialization === type.specialization);
  const projectedHourly = type
    ? type.incomePerSecond * 3600 * (specializationBonus ? 1.2 : 1) * staffing
    : 0;
  const wornFacilities = game.enterprises.filter((enterprise) => enterprise.wear >= 35).length;

  const advisor = useMemo(() => {
    if (wornFacilities > 0) {
      return {
        tone: "warning" as const,
        text: `${wornFacilities} предприятий имеют износ от 35%. Ремонт за ${repairCost.toFixed(2)} млрд восстановит их производительность и уменьшит потерю дохода.`,
      };
    }
    if (unemployment < 2 && type && staffing < 0.9) {
      return {
        tone: "warning" as const,
        text: `Дефицит специалистов ограничит загрузку нового ${type.name.toLowerCase()}. Дождитесь подготовки кадров или выберите предприятие с меньшей потребностью в персонале.`,
      };
    }
    if (type && specializationBonus) {
      return {
        tone: "positive" as const,
        text: `Регион специализируется на направлении «${type.specialization}»: предприятие получит +20% к доходу. Прогноз — +${projectedHourly.toFixed(2)} млрд/ч до учёта общесистемных коэффициентов.`,
      };
    }
    return {
      tone: "neutral" as const,
      text: "Сопоставьте специализацию предприятия и региона. Совпадение даёт +20% к выпуску без дополнительных затрат на строительство.",
    };
  }, [wornFacilities, repairCost, unemployment, type, staffing, specializationBonus, projectedHourly]);

  return (
    <BottomSheet title="Промышленность" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card"><span>Предприятий</span><strong className="tabular-nums">{game.enterprises.length}</strong></div>
        <div className="stat-card"><span>Средний износ</span><strong className={`tabular-nums ${wear >= 25 ? "text-rose-400" : "text-emerald-400"}`}>{wear.toFixed(1)}%</strong></div>
      </div>
      <div className="progress-track mt-3 h-2">
        <div className="transition-all duration-200" style={{ width: `${wear}%`, background: wear >= 35 ? "#fb7185" : "#34d399" }} />
      </div>
      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        Износ увеличивается на 0,5% за реальный час; доход предприятия уменьшается пропорционально.
      </p>
      <button
        type="button"
        disabled={!game.enterprises.length || repairCost > game.budget.treasury}
        onClick={onRepair}
        className="action-secondary mt-3 w-full transition-all duration-200 disabled:opacity-40"
      >
        <Wrench size={14} /> Отремонтировать всё · <span className="tabular-nums">{repairCost.toFixed(2)} млрд</span>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="stat-card"><span>Занято в промышленности</span><strong className="tabular-nums">{jobs.toLocaleString("ru-RU")}</strong></div>
        <div className="stat-card"><span>Безработица</span><strong className="tabular-nums">{unemployment.toFixed(2)}%</strong></div>
      </div>

      <label className="mt-4 block text-[10px] font-semibold text-slate-400">Предприятие</label>
      <select value={typeId} onChange={(event) => setType(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-slate-100">
        {([
          ["digital", "Цифра и ИТ"],
          ["basic", "Базовая промышленность"],
          ["engineering", "Машиностроение"],
          ["consumer", "Потребительский и медсектор"],
        ] as const).map(([sector, label]) => (
          <optgroup key={sector} label={label}>
            {game.enterpriseTypes.filter((item) => item.sector === sector).map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </optgroup>
        ))}
      </select>

      <label className="mt-3 block text-[10px] font-semibold text-slate-400">Регион</label>
      <select value={regionId} onChange={(event) => setRegion(event.target.value)} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 p-3 text-xs text-slate-100">
        {game.regions.map((item) => (
          <option key={item.id} value={item.id}>{item.name} · {item.specialization}</option>
        ))}
      </select>

      {type ? (
        <div className="stat-card mt-3 border border-emerald-500/15 bg-gradient-to-br from-emerald-950/20 to-[#111925] transition-all duration-200">
          <strong>{type.name}</strong>
          <span>{type.description}</span>
          <span>Строительство: <b className="tabular-nums text-rose-400">−{cost.toFixed(1)} млрд</b></span>
          <span>Прогноз дохода: <b className="tabular-nums text-emerald-400">+{projectedHourly.toFixed(2)} млрд/ч</b></span>
          <span>Энергия: {type.energyMW} МВт · Рабочие места: {type.jobs}</span>
          {specializationBonus ? <span className="text-emerald-300">Бонус специализации +20%</span> : null}
          {unemployment < 2 && staffing < 1 ? <span className="text-rose-300">Кадровый штраф: загрузка {(staffing * 100).toFixed(0)}%</span> : null}
          <button
            type="button"
            disabled={game.budget.treasury < cost}
            onClick={() => onBuild(typeId, regionId)}
            className="action-primary mt-2 w-full transition-all duration-200 disabled:opacity-40"
          >
            <Plus size={14} /> Построить
          </button>
        </div>
      ) : null}

      <div className="mt-3">
        <AdvisorCard tone={advisor.tone}>{advisor.text}</AdvisorCard>
      </div>

      <div ref={enterpriseListRef} className="mt-3 space-y-2">
        {game.enterprises.map((enterprise) => (
          <div key={enterprise.id} className="stat-card transition-all duration-200">
            <div className="flex w-full items-center justify-between gap-2">
              <strong className="min-w-0 break-words">{enterprise.name}</strong>
              <span className={`shrink-0 rounded-md border px-2 py-1 text-[9px] tabular-nums ${enterprise.wear >= 35
                ? "border-rose-500/30 bg-rose-500/15 text-rose-400"
                : "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"}`}>
                {enterprise.wear >= 35 ? "−" : "+"}{enterprise.wear.toFixed(1)}% износа
              </span>
            </div>
          </div>
        ))}
      </div>
    </BottomSheet>
  );
}
