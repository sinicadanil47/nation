"use client";

import { useState } from "react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState } from "@/types/game";

interface Props {
  game: GameState;
  onClose: () => void;
  onIssueDecree: (id: string) => void;
  onPublishAddress: (message: string) => void;
  onNegotiateFaction: (id: string, loyaltyChange: number) => void;
  onVoteLaw: (id: string) => void;
}

export default function PresidentDrawer({
  game,
  onClose,
  onIssueDecree,
  onPublishAddress,
  onNegotiateFaction,
  onVoteLaw,
}: Props) {
  const [address, setAddress] = useState("");
  const [section, setSection] = useState<"president" | "parliament">("president");
  const votes = game.parliament.factions.reduce(
    (sum, faction) => sum + (faction.seats * faction.loyalty) / 100,
    0,
  );
  const formatCooldown = (seconds: number) =>
    String(Math.floor(seconds / 60)).padStart(2, "0") +
    ":" +
    String(seconds % 60).padStart(2, "0");

  return (
    <BottomSheet title="Власть" onClose={onClose}>
      <div className="mb-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setSection("president")}
          className={`min-h-10 rounded-lg text-xs font-bold ${section === "president" ? "bg-cyan-700" : "bg-slate-800 text-slate-400"}`}
        >
          Президент
        </button>
        <button
          type="button"
          onClick={() => setSection("parliament")}
          className={`min-h-10 rounded-lg text-xs font-bold ${section === "parliament" ? "bg-cyan-700" : "bg-slate-800 text-slate-400"}`}
        >
          Парламент
        </button>
      </div>

      {section === "president" ? (
        <>
          <div className="mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3">
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-slate-400">Рейтинг правительства</span>
              <strong className="text-xl text-emerald-300">{Math.round(game.rating)}%</strong>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-700">
              <div className="h-full rounded-full bg-emerald-400" style={{ width: `${game.rating}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Рейтинг учитывает бюджетный баланс, энергобезопасность, налоговую
              нагрузку и качество государственных услуг в регионах.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-[#293344] bg-[#171b26] p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-300">Парламент</p>
              <p className="mt-1 text-xs font-semibold">Законодательная повестка</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Контроль исполнения бюджета и согласование государственных реформ.
              </p>
            </div>
            <div className="rounded-xl border border-[#293344] bg-[#171b26] p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-300">Нацпроекты</p>
              <p className="mt-1 text-xs font-semibold">Программа развития</p>
              <p className="mt-1 text-[10px] leading-relaxed text-slate-400">
                Инфраструктура, промышленность, медицина и человеческий капитал.
              </p>
            </div>
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
        </>
      ) : (
        <div className="space-y-3">
          <section className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
            <div className="flex justify-between text-xs">
              <b>Распределение мест</b>
              <b>{game.parliament.totalSeats}</b>
            </div>
            <div className="mt-3 flex h-4 overflow-hidden rounded-full bg-slate-800">
              {game.parliament.factions.map((faction, index) => (
                <div
                  key={faction.id}
                  title={faction.name}
                  style={{ width: `${(faction.seats / game.parliament.totalSeats) * 100}%` }}
                  className={index % 2 ? "bg-indigo-500" : "bg-cyan-500"}
                />
              ))}
            </div>
            {game.parliament.factions.map((faction) => (
              <div key={faction.id} className="mt-3">
                <div className="flex justify-between text-xs">
                  <span>{faction.name} · {faction.seats} мест</span>
                  <b>{faction.loyalty}%</b>
                </div>
                <div className="mt-1 flex gap-2">
                  <button
                    type="button"
                    disabled={faction.loyalty >= 100 || game.budget.treasury < 7.5}
                    onClick={() => onNegotiateFaction(faction.id, 5)}
                    className="rounded-md bg-slate-800 px-2 py-2 text-[10px] disabled:opacity-40"
                  >
                    Торг +5 · 7,5 млрд
                  </button>
                  <button
                    type="button"
                    disabled={faction.loyalty < 5 || game.budget.treasury < 7.5}
                    onClick={() => onNegotiateFaction(faction.id, -5)}
                    className="rounded-md bg-slate-800 px-2 py-2 text-[10px] disabled:opacity-40"
                  >
                    Снизить поддержку
                  </button>
                </div>
              </div>
            ))}
          </section>

          <section className="rounded-xl border border-slate-700 p-3">
            <div className="flex justify-between text-xs">
              <b>Голоса за законопроекты</b>
              <b className={votes > 225 ? "text-emerald-300" : "text-amber-300"}>
                {Math.floor(votes)} / {game.parliament.totalSeats}
              </b>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded bg-slate-800">
              <div
                className="h-full bg-emerald-500"
                style={{ width: `${(votes / game.parliament.totalSeats) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-500">
              Для принятия требуется строго более половины голосов.
            </p>
          </section>

          {game.parliament.laws.map((law) => (
            <article
              key={law.id}
              className="rounded-xl border border-slate-700 bg-slate-900/40 p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <b className="text-xs">{law.name}</b>
                  <p className="mt-1 text-[10px] text-slate-400">{law.description}</p>
                  <p className="mt-1 text-[10px] text-slate-500">Цена: {law.cost} млрд</p>
                </div>
                <button
                  type="button"
                  disabled={
                    law.passed ||
                    votes <= game.parliament.totalSeats / 2 ||
                    game.budget.treasury < law.cost
                  }
                  onClick={() => onVoteLaw(law.id)}
                  className="min-h-9 shrink-0 rounded-lg bg-emerald-700 px-3 text-[10px] font-bold disabled:bg-slate-700"
                >
                  {law.passed ? "Принят" : "Голосовать"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </BottomSheet>
  );
}
