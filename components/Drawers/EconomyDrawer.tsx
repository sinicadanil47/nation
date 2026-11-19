"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Factory, GraduationCap, Minus, Plus, Users, UserRound } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState, TaxKey } from "@/types/game";

type EconomyTab = "tax" | "budget" | "labor";

const taxRows: Array<[TaxKey, string]> = [
  ["vat", "НДС"],
  ["income", "НДФЛ"],
  ["profit", "Налог на прибыль"],
];

function AdvisorCard({ title, children, tone = "neutral" }: {
  title: string;
  children: ReactNode;
  tone?: "positive" | "warning" | "neutral";
}) {
  const tones = {
    positive: "border-emerald-500/25 bg-emerald-500/10",
    warning: "border-rose-500/25 bg-rose-500/10",
    neutral: "border-cyan-500/20 bg-cyan-500/10",
  };
  return (
    <aside className={`advisor-card mt-3 rounded-xl border p-3 transition-all duration-200 ${tones[tone]}`}>
      <p className="mb-1 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Советник · {title}</p>
      <div className="text-[11px] leading-relaxed text-slate-200">{children}</div>
    </aside>
  );
}

function formatMoney(value: number) {
  return `${value.toFixed(2)} млрд/ч`;
}

export default function EconomyDrawer({
  game,
  onClose,
  onTaxChange,
  onOpenEnergy,
}: {
  game: GameState;
  onClose: () => void;
  onTaxChange: (key: TaxKey, value: number) => void;
  onOpenEnergy: () => void;
}) {
  const [tab, setTab] = useState<EconomyTab>("tax");
  const jobs = game.enterprises.reduce(
    (total, enterprise) =>
      total + (game.enterpriseTypes.find((type) => type.id === enterprise.typeId)?.jobs ?? 0),
    0,
  );
  const unemployment = game.workforce > 0 ? (game.unemployed / game.workforce) * 100 : 0;
  const net = game.budget.incomePerHour - game.budget.expensesPerHour;
  const regionalIncome = game.regions.reduce((total, region) => total + region.incomePerHour, 0);

  const forecast = useMemo(() => {
    // The VAT forecast follows a Laffer-style curve: zero VAT means zero VAT
    // receipts; the demand response then reduces the tax base at high rates.
    // Other tax rates shift the preferred VAT band without changing simulation time.
    const nonVatPressure = (game.taxes.income + game.taxes.profit) / 2;
    const targetPeak = Math.max(10, Math.min(22, 16 - (nonVatPressure - 20) * 0.12));
    return Array.from({ length: 46 }, (_, vat) => {
      const pressure = (vat + game.taxes.income + game.taxes.profit) / 3;
      const shadow = Math.max(5, Math.min(55, 6 + Math.max(0, pressure - 8) * 1.25));
      const collection = Math.max(45, Math.min(98, 100 - shadow * 0.778));
      const demandFactor = Math.exp(-vat / targetPeak);
      const shadowFactor = Math.max(0.35, 1 - (shadow - 5) / 110);
      const revenue = regionalIncome * (vat / 100) * demandFactor * (collection / 86) * shadowFactor;
      return { vat, shadow, revenue };
    });
  }, [game.taxes.income, game.taxes.profit, regionalIncome]);

  const chart = useMemo(() => {
    const width = 320;
    const left = 18;
    const right = 304;
    const top = 12;
    const bottom = 112;
    const revenues = forecast.map((point) => point.revenue);
    const minRevenue = Math.min(...revenues);
    const maxRevenue = Math.max(...revenues);
    const revenueRange = Math.max(0.001, maxRevenue - minRevenue);
    const revenueY = (value: number) => bottom - ((value - minRevenue) / revenueRange) * (bottom - top);
    const shadowY = (value: number) => bottom - ((value - 5) / 50) * (bottom - top);
    const x = (vat: number) => left + (vat / 45) * (right - left);
    const revenuePath = forecast.map((point, index) =>
      `${index === 0 ? "M" : "L"} ${x(point.vat).toFixed(2)} ${revenueY(point.revenue).toFixed(2)}`,
    ).join(" ");
    const shadowPath = forecast.map((point, index) =>
      `${index === 0 ? "M" : "L"} ${x(point.vat).toFixed(2)} ${shadowY(point.shadow).toFixed(2)}`,
    ).join(" ");
    const optimum = forecast.reduce((best, point) => point.revenue > best.revenue ? point : best, forecast[0]);
    const current = forecast[Math.max(0, Math.min(45, Math.round(game.taxes.vat)))];
    return {
      revenuePath,
      shadowPath,
      currentX: x(game.taxes.vat),
      currentY: revenueY(current.revenue),
      optimumX: x(optimum.vat),
      optimumY: revenueY(optimum.revenue),
      optimumVat: optimum.vat,
      minRevenue,
      maxRevenue,
      width,
    };
  }, [forecast, game.taxes.vat]);

  const budgetRows = [
    { label: "Доходы", value: game.budget.incomePerHour, positive: true },
    { label: "Расходы", value: game.budget.expensesPerHour, positive: false },
    { label: "Баланс", value: net, positive: net >= 0 },
    { label: "Налоговые поступления", value: game.budget.taxRevenue, positive: true },
    { label: "Ведомства", value: game.budget.ministryExpenses, positive: false },
  ];

  const tabClass = (active: boolean) =>
    `min-h-10 whitespace-nowrap rounded-lg px-2.5 py-2 text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] ${active
      ? "bg-cyan-400/15 text-cyan-100 shadow-inner shadow-cyan-300/10"
      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`;

  return (
    <BottomSheet title="Экономика" onClose={onClose}>
      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-white/[0.07] bg-[#090D14] p-1">
        {([
          ["tax", "Налоги"],
          ["budget", "Бюджет"],
          ["labor", "Труд и кадры"],
        ] as Array<[EconomyTab, string]>).map(([id, label]) => (
          <button key={id} type="button" onClick={() => setTab(id)} className={tabClass(tab === id)}>
            {label}
          </button>
        ))}
      </div>

      {tab === "tax" ? (
        <section className="space-y-3">
          <div className="rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Налоговая кривая</p>
                <p className="mt-1 text-xs font-semibold text-slate-100">Прогноз поступлений и теневого сектора</p>
              </div>
              <span className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-300">
                Оптимум · НДС {chart.optimumVat}%
              </span>
            </div>
            <svg viewBox="0 0 320 132" role="img" aria-label="Прогноз налоговых поступлений и теневой экономики при изменении НДС" className="h-auto w-full overflow-visible">
              <defs>
                <linearGradient id="taxRevenueFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#34d399" stopOpacity=".2" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect x={chart.optimumX} y="8" width={304 - chart.optimumX} height="106" rx="5" fill="#f97316" opacity=".055" />
              {[32, 58, 84, 112].map((y) => (
                <line key={y} x1="18" x2="304" y1={y} y2={y} stroke="#64748b" strokeOpacity=".18" strokeDasharray="3 5" />
              ))}
              <path d={chart.revenuePath} fill="none" stroke="#34d399" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" className="chart-path" />
              <path d={chart.shadowPath} fill="none" stroke="#fb7185" strokeWidth="1.8" strokeDasharray="4 4" strokeLinecap="round" className="chart-path" />
              <line x1={chart.currentX} x2={chart.currentX} y1="8" y2="114" stroke="#e2e8f0" strokeOpacity=".5" strokeDasharray="3 4" />
              <circle cx={chart.currentX} cy={chart.currentY} r="5" fill="#34d399" stroke="#ecfdf5" strokeWidth="1.5" className="chart-point" />
              <circle cx={chart.optimumX} cy={chart.optimumY} r="4" fill="#fbbf24" stroke="#fff7ed" strokeWidth="1" />
              <text x="18" y="126" fill="#94a3b8" fontSize="8">0% НДС</text>
              <text x="304" y="126" textAnchor="end" fill="#94a3b8" fontSize="8">45%</text>
            </svg>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[9px] text-slate-400">
              <span className="flex items-center gap-1.5"><i className="h-1.5 w-4 rounded bg-emerald-400" /> Налоговые поступления</span>
              <span className="flex items-center gap-1.5"><i className="h-1.5 w-4 rounded bg-rose-400" /> Теневая экономика</span>
              <span className="tabular-nums">Точка сейчас: {game.taxes.vat}%</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500">
              <span>Прогноз: {chart.minRevenue.toFixed(2)}–{chart.maxRevenue.toFixed(2)} млрд/ч</span>
              <span>Зона перегрева — правее оптимума</span>
            </div>
            <p className={`mt-2 rounded-lg border px-2.5 py-2 text-[10px] leading-relaxed transition-all duration-200 ${game.taxes.vat < chart.optimumVat ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300" : game.taxes.vat > chart.optimumVat ? "border-rose-500/25 bg-rose-500/10 text-rose-300" : "border-amber-500/25 bg-amber-500/10 text-amber-200"}`}>
              {game.taxes.vat < chart.optimumVat
                ? "НДС ниже оптимума: умеренное повышение приблизит поступления к максимуму без резкого роста теневого сектора."
                : game.taxes.vat > chart.optimumVat
                  ? "НДС выше оптимума: снижение ставки сократит теневой сектор и поддержит спрос и экономическую активность."
                  : "Ставка НДС находится в точке максимума прогнозных поступлений."}
            </p>
          </div>

          {taxRows.map(([key, label]) => (
            <div key={key} className="rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3 shadow-md transition-all duration-200">
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <b className="text-slate-100">{label}</b>
                <b className={`tabular-nums ${key === "vat" ? game.taxes.vat > chart.optimumVat ? "text-rose-300" : "text-emerald-300" : game.taxes[key] >= 25 ? "text-rose-300" : "text-emerald-300"}`}>{game.taxes[key]}%</b>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onTaxChange(key, game.taxes[key] - 1)}
                  disabled={game.taxes[key] <= 0}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-slate-200 transition-all duration-200 hover:bg-white/10 active:scale-[0.98] disabled:opacity-30"
                  aria-label={`Снизить: ${label}`}
                >
                  <Minus size={14} />
                </button>
                <input
                  className={`min-w-0 flex-1 ${game.taxes[key] >= 25 ? "accent-rose-400" : "accent-emerald-400"}`}
                  type="range"
                  min="0"
                  max="45"
                  value={game.taxes[key]}
                  onChange={(event) => onTaxChange(key, Number(event.target.value))}
                  aria-label={label}
                />
                <button
                  type="button"
                  onClick={() => onTaxChange(key, game.taxes[key] + 1)}
                  disabled={game.taxes[key] >= 45}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-slate-800 text-slate-200 transition-all duration-200 hover:bg-slate-700 disabled:opacity-30"
                  aria-label={`Повысить: ${label}`}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            <div className="stat-card">
              <span>Теневая экономика</span>
              <strong className={game.taxes.shadowEconomy > 25 ? "text-rose-400" : "text-emerald-400"}>
                {game.taxes.shadowEconomy.toFixed(1)}%
              </strong>
            </div>
            <div className="stat-card">
              <span>Собираемость</span>
              <strong className="tabular-nums text-emerald-400">{game.taxes.collectionRate.toFixed(1)}%</strong>
            </div>
          </div>

          {game.taxes.shadowEconomy >= 25 ? (
            <AdvisorCard title="Снижение теневого сектора" tone="warning">
              Налоговая нагрузка повышает долю теневой экономики. Попробуйте снизить ставку с наибольшим вкладом в среднюю нагрузку или усилить антикоррупционное ведомство.
            </AdvisorCard>
          ) : (
            <AdvisorCard title="Налоговый баланс" tone="positive">
              Текущая теневая экономика контролируема. Сверяйте ставку НДС с точкой максимума на графике: после неё рост ставки уже не увеличивает прогноз поступлений.
            </AdvisorCard>
          )}
          <button type="button" onClick={onOpenEnergy} className="action-secondary w-full transition-all duration-200">
            Энергетика и баланс сети
          </button>
        </section>
      ) : null}

      {tab === "budget" ? (
        <section className="space-y-2">
          <div className={`rounded-2xl border p-4 shadow-lg ${net >= 0 ? "border-emerald-500/20 bg-gradient-to-br from-emerald-950/35 to-[#0D111A]" : "border-rose-500/20 bg-gradient-to-br from-rose-950/30 to-[#0D111A]"}`}>
            <p className="text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Финансовый результат</p>
            <div className="mt-1 flex items-center justify-between gap-2"><p className="text-sm font-semibold text-slate-100">Чистый баланс</p><span className="whitespace-nowrap text-[9px] text-slate-500">МЛРД / Ч</span></div>
            <strong className={`mt-2 block text-2xl font-extrabold tabular-nums ${net >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{net >= 0 ? "+" : "−"}{formatMoney(Math.abs(net))}</strong>
          </div>
          {budgetRows.map((row) => {
            const good = row.positive;
            return (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] px-3 py-3 shadow-md transition-all duration-200">
                <span className="min-w-0 flex-1 text-xs font-semibold text-slate-300">{row.label}</span>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <strong className={`whitespace-nowrap text-xs tabular-nums ${good ? "text-emerald-300" : "text-rose-300"}`}>{good ? "+" : "−"}{formatMoney(Math.abs(row.value))}</strong>
                  <small className="whitespace-nowrap tabular-nums text-[9px] text-slate-500">{(row.value * 1000 / 3600).toFixed(2)} млн/с</small>
                </div>
              </div>
            );
          })}
          <AdvisorCard title="Чистый бюджетный поток" tone={net >= 0 ? "positive" : "warning"}>
            {net >= 0
              ? `Положительный баланс ${net.toFixed(2)} млрд/ч. Сохраняйте резерв и направляйте свободный поток в проекты с высокой отдачей.`
              : `Дефицит ${Math.abs(net).toFixed(2)} млрд/ч. Сначала пересмотрите финансирование самых дорогих ведомств и проверьте энергетический дефицит.`}
          </AdvisorCard>
        </section>
      ) : null}

      {tab === "labor" ? (
        <section className="grid grid-cols-2 gap-2">
          <div className="stat-card rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3"><span className="flex items-center gap-2"><Users size={14} className="text-cyan-300"/>Рабочая сила</span><strong className="tabular-nums">{(game.workforce / 1e6).toFixed(2)} млн</strong></div>
          <div className="stat-card rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3"><span className="flex items-center gap-2"><UserRound size={14} className="text-amber-300"/>Безработица</span><strong className={`tabular-nums ${unemployment > 6 ? "text-rose-400" : "text-emerald-400"}`}>{unemployment.toFixed(2)}%</strong></div>
          <div className="stat-card rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3"><span className="flex items-center gap-2"><GraduationCap size={14} className="text-emerald-300"/>Специалисты</span><strong className="tabular-nums">{(game.specialists / 1000).toFixed(1)} тыс.</strong></div>
          <div className="stat-card rounded-2xl border border-white/[0.07] bg-gradient-to-b from-[#131926] to-[#0D111A] p-3"><span className="flex items-center gap-2"><Factory size={14} className="text-cyan-300"/>Места в промышленности</span><strong className="tabular-nums">{jobs.toLocaleString("ru-RU")}</strong></div>
          <p className="col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 text-[10px] leading-relaxed text-slate-400">
            {unemployment > 6
              ? "Безработица выше 6%: рейтинг президента снижается."
              : unemployment < 2
                ? "Кадровый дефицит ограничивает доход новых заводов."
                : "Рынок труда сбалансирован."}
            {" "}Министерство образования готовит 250 специалистов за игровой час.
          </p>
          <div className="col-span-2">
            {game.specialists > 0 && unemployment >= 2 ? (
              <AdvisorCard title="Советник по кадрам" tone="positive">
                Есть резерв квалифицированных кадров. Выбирайте предприятия с высокой отдачей на одного работника и размещайте их в профильных регионах для бонуса специализации +20%.
              </AdvisorCard>
            ) : unemployment < 2 ? (
              <AdvisorCard title="Советник по кадрам" tone="warning">
                Безработица низкая, поэтому новые мощности могут получить штраф за нехватку специалистов. Дайте системе образования подготовить резерв до расширения штата.
              </AdvisorCard>
            ) : (
              <AdvisorCard title="Советник по кадрам" tone="neutral">
                Сопоставляйте вакансии действующих предприятий с числом свободных специалистов, чтобы не создавать простаивающие мощности.
              </AdvisorCard>
            )}
          </div>
        </section>
      ) : null}
    </BottomSheet>
  );
}
