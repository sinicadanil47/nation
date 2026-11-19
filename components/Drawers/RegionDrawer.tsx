"use client";

import { Plus } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState, Region, RegionLevelKey } from "@/types/game";

interface Props {
  region: Region;
  game: GameState;
  onClose: () => void;
  onUpgrade: (id: string, field: RegionLevelKey) => void;
}

const fields: { key: RegionLevelKey; label: string }[] = [
  { key: "infrastructure", label: "Инфраструктура" },
  { key: "economy", label: "Экономика" },
  { key: "medicine", label: "Медицина" },
  { key: "education", label: "Образование" },
];

export default function RegionDrawer({
  region,
  game,
  onClose,
  onUpgrade,
}: Props) {
  return (
    <BottomSheet title={region.name} onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <div className="stat-card">
          <span>Население</span>
          <strong>{region.population.toFixed(1)} млн</strong>
        </div>
        <div className="stat-card">
          <span>Доход / час</span>
          <strong>{region.incomePerHour.toFixed(1)} млрд</strong>
        </div>
        <div className="stat-card">
          <span>Специализация</span>
          <strong>{region.specialization}</strong>
        </div>
        <div className="stat-card">
          <span>Свободная земля</span>
          <strong>{region.freeLand}%</strong>
        </div>
      </div>
      <div className="mb-3 flex justify-between text-xs text-slate-400">
        <span>Строительные бригады</span>
        <strong className="text-amber-300">{game.constructionTeams} / 3</strong>
      </div>
      {fields.map(({ key, label }) => (
        <div
          key={key}
          className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-3"
        >
          <div className="min-w-0 flex-1">
            <strong className="text-sm">{label}</strong>
            <div className="mt-2 flex gap-1">
              {Array.from({ length: 10 }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-sm ${index < region[key] ? "bg-blue-400" : "bg-slate-700"}`}
                />
              ))}
            </div>
            <span className="mt-1 block text-[10px] text-slate-500">
              Уровень {region[key]} из 10
            </span>
          </div>
          <button
            type="button"
            disabled={game.constructionTeams === 0 || region[key] >= 10 || game.budget.treasury < 12}
            onClick={() => onUpgrade(region.id, key)}
            className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-blue-600 px-3 text-xs font-bold disabled:opacity-35"
          >
            <Plus size={14} />
            $12 млрд
          </button>
        </div>
      ))}
    </BottomSheet>
  );
}
