"use client";

import { Activity, Zap } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState } from "@/types/game";

interface Props {
  game: GameState;
  onClose: () => void;
  onBuildPlant: () => void;
  onBuildStorage: () => void;
}

export default function EnergyDrawer({
  game,
  onClose,
  onBuildPlant,
  onBuildStorage,
}: Props) {
  const balance = game.energy.generationGW - game.energy.consumptionGW;
  const coverage = Math.min(
    100,
    (game.energy.generationGW / game.energy.consumptionGW) * 100,
  );

  return (
    <BottomSheet title="Энергетика" onClose={onClose}>
      <div className="grid grid-cols-2 gap-2">
        <div className="stat-card flex flex-col gap-1">
          <span>Генерация</span>
          <strong>{game.energy.generationGW.toFixed(1)} ГВт</strong>
        </div>
        <div className="stat-card flex flex-col gap-1">
          <span>Потребление</span>
          <strong>{game.energy.consumptionGW.toFixed(1)} ГВт</strong>
        </div>
        <div className="stat-card flex flex-col gap-1">
          <span>Баланс</span>
          <strong className={balance >= 0 ? "text-emerald-300" : "text-red-300"}>
            {balance >= 0 ? "+" : ""}{balance.toFixed(1)} ГВт
          </strong>
        </div>
        <div className="stat-card flex flex-col gap-1">
          <span>Накопители</span>
          <strong>{game.energy.storageGWh.toFixed(1)} ГВт·ч</strong>
        </div>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex justify-between text-xs text-slate-400">
          <span>Покрытие потребления</span>
          <strong>{coverage.toFixed(0)}%</strong>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-slate-700">
          <div className="h-full rounded-full bg-emerald-400" style={{ width: `${coverage}%` }} />
        </div>
      </div>
      <button
        type="button"
        onClick={onBuildPlant}
        disabled={game.budget.treasury < 35}
        className="mt-5 flex min-h-12 w-full items-center justify-between rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 text-sm disabled:opacity-40"
      >
        <span className="flex items-center gap-2">
          <Zap size={17} className="text-yellow-300" />
          Электростанция (+4 ГВт)
        </span>
        <strong>$35 млрд</strong>
      </button>
      <button
        type="button"
        onClick={onBuildStorage}
        disabled={game.budget.treasury < 18}
        className="mt-2 flex min-h-12 w-full items-center justify-between rounded-xl border border-blue-400/20 bg-blue-400/10 px-4 text-sm disabled:opacity-40"
      >
        <span className="flex items-center gap-2">
          <Activity size={17} className="text-blue-300" />
          Накопитель (+8 ГВт·ч)
        </span>
        <strong>$18 млрд</strong>
      </button>
    </BottomSheet>
  );
}
