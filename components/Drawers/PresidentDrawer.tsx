"use client";

import { useState } from "react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState } from "@/types/game";

interface Props {
  game: GameState;
  onClose: () => void;
  onIssueDecree: (id: string) => void;
  onPublishAddress: (message: string) => void;
}

export default function PresidentDrawer({
  game,
  onClose,
  onIssueDecree,
  onPublishAddress,
}: Props) {
  const [address, setAddress] = useState("");
  const formatCooldown = (seconds: number) => String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(seconds % 60).padStart(2, "0");

  return (
    <BottomSheet title="Офис Президента" onClose={onClose}>
      <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">Рейтинг правительства</span>
          <strong className="text-xl text-emerald-300">
            {Math.round(game.rating)}%
          </strong>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
          <div
            className="h-full rounded-full bg-emerald-400"
            style={{ width: `${game.rating}%` }}
          />
        </div>
        <p className="mt-2 text-xs leading-relaxed text-slate-400">
          Рейтинг учитывает бюджетный баланс, энергобезопасность, налоговую
          нагрузку и качество государственных услуг в регионах.
        </p>
      </div>

      <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
        Президентские указы
      </h3>
      {game.decrees.map((decree) => {
        const cooldown = game.decreeCooldowns[decree.id] ?? 0;

        return (
          <div
            key={decree.id}
            className="mb-2 rounded-xl border border-slate-700 bg-slate-900/40 p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <strong className="text-sm">{decree.title}</strong>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {decree.description}
                </p>
              </div>
              <button
                type="button"
                disabled={cooldown > 0}
                onClick={() => onIssueDecree(decree.id)}
                className="min-h-11 shrink-0 rounded-lg bg-amber-600 px-3 text-xs font-bold disabled:bg-slate-700"
              >
                {cooldown > 0 ? formatCooldown(cooldown) : "Издать"}
              </button>
            </div>
          </div>
        );
      })}

      <div className="mt-4">
        <label
          htmlFor="presidential-address"
          className="mb-2 block text-xs font-bold text-slate-400"
        >
          Обращение к нации
        </label>
        <textarea
          id="presidential-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Текст обращения..."
          maxLength={500}
          className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-900 p-3 text-sm outline-none focus:border-blue-500"
        />
        <button
          type="button"
          disabled={!address.trim()}
          onClick={() => {
            onPublishAddress(address);
            setAddress("");
          }}
          className="mt-2 min-h-11 w-full rounded-xl bg-blue-600 text-sm font-bold disabled:opacity-40"
        >
          Опубликовать обращение
        </button>
      </div>
    </BottomSheet>
  );
}
