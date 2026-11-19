"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import NationIllustration from "@/components/Illustrations";
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
  const [factionCardsRef] = useAutoAnimate<HTMLDivElement>({ duration: 180 });
  const [lawListRef] = useAutoAnimate<HTMLDivElement>({ duration: 180 });
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
      <div className="mb-4 flex rounded-xl border border-white/[0.07] bg-[#090D14] p-1">
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setSection("president")} className={`relative min-h-10 flex-1 rounded-lg px-3 text-xs font-bold transition-colors duration-200 ${section === "president" ? "text-cyan-100" : "text-slate-500 hover:text-slate-200"}`}>{section === "president" ? <motion.span layoutId="governance-tab-indicator" className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#26384a] to-[#192535] shadow-lg" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}<span className="relative z-10">Президент</span></motion.button>
        <motion.button type="button" whileTap={{ scale: 0.97 }} onClick={() => setSection("parliament")} className={`relative min-h-10 flex-1 rounded-lg px-3 text-xs font-bold transition-colors duration-200 ${section === "parliament" ? "text-cyan-100" : "text-slate-500 hover:text-slate-200"}`}>{section === "parliament" ? <motion.span layoutId="governance-tab-indicator" className="absolute inset-0 rounded-lg bg-gradient-to-b from-[#26384a] to-[#192535] shadow-lg" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}<span className="relative z-10">Парламент</span></motion.button>
      </div>

      <NationIllustration variant="government" className="mb-4 h-[88px] w-full" />

      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.16 }}>
      {section === "president" ? (
        <>
          <div className="mb-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-950/35 via-[#111c25] to-[#0D111A] p-4 shadow-lg">
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
              <NationIllustration variant="projects" compact className="mt-2 h-[72px] w-full" />
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
                className="mb-2 rounded-2xl border border-amber-300/15 bg-gradient-to-br from-[#202333] to-[#101722] p-3 shadow-md"
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

          <section className="mt-4 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-950/30 to-[#0D111A] p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-300">Обращение к нации</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">Публичное выступление укрепляет доверие и мобилизует общественную поддержку. Повторное выступление доступно после завершения периода ожидания.</p>
            <button type="button" onClick={() => onPublishAddress("Президент выступил с обращением к нации: правительство подтверждает курс на развитие, стабильность и благополучие граждан.")} className="action-primary mt-3 w-full">
              Выступить перед гражданами
            </button>
          </section>
        </>
      ) : (
        <div className="space-y-3">
          <section className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-4 shadow-lg">
            <div className="flex justify-between text-xs">
              <b>Распределение мест</b>
              <b>{game.parliament.totalSeats}</b>
            </div>
            <div className="mt-3 flex h-5 overflow-hidden rounded-lg bg-slate-800 ring-1 ring-white/10">
              {game.parliament.factions.map((faction, index) => (
                <div
                  key={faction.id}
                  title={faction.name}
                  style={{ width: `${game.parliament.totalSeats > 0 ? (faction.seats / game.parliament.totalSeats) * 100 : 0}%`, backgroundColor: ["#34d399", "#60a5fa", "#fbbf24", "#c084fc", "#fb7185", "#22d3ee"][index % 6] }}
                  className="transition-all duration-200"
                />
              ))}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2">
              {game.parliament.factions.map((faction, index) => (
                <div key={faction.id} className="flex min-w-0 items-center gap-2 text-[10px] text-slate-400">
                  <i className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: ["#34d399", "#60a5fa", "#fbbf24", "#c084fc", "#fb7185", "#22d3ee"][index % 6] }} />
                  <span className="min-w-0 truncate">{faction.name}</span>
                  <b className="ml-auto shrink-0 tabular-nums text-slate-200">{faction.seats}</b>
                </div>
              ))}
            </div>
            <div ref={factionCardsRef}>{game.parliament.factions.map((faction) => (
              <div key={faction.id} className={`mt-3 rounded-xl border p-3 shadow-md ${faction.loyalty >= 60 ? "border-emerald-500/25 bg-gradient-to-br from-emerald-950/25 to-[#0D111A]" : "border-amber-500/20 bg-gradient-to-br from-amber-950/15 to-[#0D111A]"}`}>
                <div className="flex justify-between text-xs">
                  <span>{faction.name} · {faction.seats} мест</span>
                  <b>{faction.loyalty}%</b>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    disabled={faction.loyalty >= 100 || game.budget.treasury < 7.5}
                    onClick={() => onNegotiateFaction(faction.id, 5)}
                    className="min-h-10 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-2 text-[10px] font-bold text-emerald-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
                  >
                    Торг +5 · 7,5 млрд
                  </button>
                  <button
                    type="button"
                    disabled={faction.loyalty < 5 || game.budget.treasury < 7.5}
                    onClick={() => onNegotiateFaction(faction.id, -5)}
                    className="min-h-10 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-2 text-[10px] font-bold text-rose-200 transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
                  >
                    Снизить поддержку
                  </button>
                </div>
              </div>
            ))}</div>
          </section>

          <section className={`rounded-xl border p-3 shadow-lg ${votes > 225 ? "border-emerald-500/35 bg-gradient-to-br from-emerald-950/35 to-[#0D111A] shadow-emerald-950/20" : "border-amber-500/25 bg-gradient-to-br from-amber-950/20 to-[#0D111A]"}`}>
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

          <div ref={lawListRef} className="space-y-2">{game.parliament.laws.map((law) => (
            <article
              key={law.id}
              className={`rounded-xl border p-3 shadow-md ${law.passed ? "border-emerald-500/30 bg-gradient-to-br from-emerald-950/35 to-[#0D111A]" : "border-white/10 bg-gradient-to-br from-[#182234] to-[#0D111A]"}`}
            >
              <div className="flex min-w-0 items-start justify-between gap-2">
                <div className="min-w-0">
                  <b className="break-words text-xs">{law.name}</b>
                  <p className="mt-1 text-[10px] text-slate-400">{law.description}</p>
                  <p className="mt-1 text-[10px] font-semibold text-emerald-300">Принятие бесплатно для казны · политические последствия сохраняются</p>
                </div>
                <button
                  type="button"
                  disabled={
                    law.passed ||
                    votes <= game.parliament.totalSeats / 2
                  }
                  onClick={() => onVoteLaw(law.id)}
                  className="min-h-9 shrink-0 rounded-lg bg-emerald-700 px-3 text-[10px] font-bold disabled:bg-slate-700"
                >
                  {law.passed ? "Принят" : "Принять закон"}
                </button>
              </div>
            </article>
          ))}</div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>
    </BottomSheet>
  );
}
