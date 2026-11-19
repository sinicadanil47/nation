"use client";
import { useMemo, useState } from "react";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import type { ReactNode } from "react";
import { Cog, Factory, FlaskConical, Microscope, Plus, Server, Truck, Wheat, Wrench, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import NationIllustration from "@/components/Illustrations";
import { getEnterpriseBuildCost, industrySectorOrder } from "@/data/industry";
import type { GameState, IndustrySector } from "@/types/game";

type SectorMeta = { id: IndustrySector; title: string; subtitle: string; accent: string; border: string; icon: LucideIcon; metric: string };
const sectors: SectorMeta[] = [
 {id:"digital",title:"Дата-центры",subtitle:"Облачные вычисления и данные",accent:"text-cyan-300",border:"border-cyan-400/30",icon:Server,metric:"Высокая цифровая отдача"},
 {id:"engineering",title:"Машиностроение",subtitle:"Станки и промышленное оборудование",accent:"text-sky-300",border:"border-sky-400/30",icon:Cog,metric:"Квалифицированные кадры"},
 {id:"metallurgy",title:"Металлургия",subtitle:"Сталь, сплавы и металлопрокат",accent:"text-orange-300",border:"border-orange-400/30",icon:Factory,metric:"Высокая энергоёмкость"},
 {id:"energy",title:"Энергетика",subtitle:"Генерация и энергоснабжение",accent:"text-amber-300",border:"border-amber-400/30",icon:Zap,metric:"Поддержка энергобаланса"},
 {id:"chemical",title:"Химическая промышленность",subtitle:"Материалы, удобрения и реагенты",accent:"text-lime-300",border:"border-lime-400/30",icon:FlaskConical,metric:"Промышленная кооперация"},
 {id:"agro",title:"Агропром",subtitle:"Производство и переработка еды",accent:"text-emerald-300",border:"border-emerald-400/30",icon:Wheat,metric:"Земля и логистика"},
 {id:"biotech",title:"Фармацевтика / Биотех",subtitle:"Лекарства, вакцины и биотехнологии",accent:"text-pink-300",border:"border-pink-400/30",icon:Microscope,metric:"Научная инфраструктура"},
 {id:"logistics",title:"Логистика и транспорт",subtitle:"Склады, терминалы и грузовые узлы",accent:"text-violet-300",border:"border-violet-400/30",icon:Truck,metric:"Транспортная доступность"},
];
const sectorFor = (sector: IndustrySector) => sectors.find((item) => item.id === sector)!;
function AdvisorCard({children,tone="neutral"}:{children:ReactNode;tone?:"positive"|"warning"|"neutral"}) {
 const style=tone==="positive"?"border-emerald-500/25 bg-emerald-500/10":tone==="warning"?"border-rose-500/25 bg-rose-500/10":"border-cyan-500/20 bg-cyan-500/10";
 return <aside className={`rounded-xl border p-3 ${style}`}><p className="mb-1 text-[9px] font-bold uppercase tracking-[.14em] text-slate-400">Советник промышленности</p><div className="text-[11px] leading-relaxed text-slate-200">{children}</div></aside>;
}
export default function IndustryDrawer({game,onClose,onBuild,onRepair}:{game:GameState;onClose:()=>void;onBuild:(typeId:string,regionId:string)=>void;onRepair:()=>void}) {
 const [sectorId,setSectorId]=useState<IndustrySector>("digital"),[typeId,setType]=useState(game.enterpriseTypes[0]?.id??""),[regionId,setRegion]=useState(game.regions[0]?.id??"");
 const [enterpriseListRef]=useAutoAnimate<HTMLDivElement>({duration:180});
 const type=game.enterpriseTypes.find(item=>item.id===typeId),region=game.regions.find(item=>item.id===regionId),sectorTypes=game.enterpriseTypes.filter(item=>item.sector===sectorId),selectedSector=sectorFor(sectorId);
 const cost=type?getEnterpriseBuildCost(type,game.enterprises.length):0;
 const wear=game.enterprises.length?game.enterprises.reduce((total,item)=>total+item.wear,0)/game.enterprises.length:0;
 const repairCost=game.enterprises.reduce((total,item)=>total+item.wear*.22,0);
 const unemployment=game.workforce>0?game.unemployed/game.workforce*100:0;
 const jobs=game.enterprises.reduce((total,item)=>total+(game.enterpriseTypes.find(t=>t.id===item.typeId)?.jobs??0),0);
 const staffing=type&&unemployment<2?Math.min(1,game.specialists/Math.max(1,type.jobs)):1;
 const regionScore=(candidate:GameState["regions"][number])=>(candidate.specialization===type?.specialization?20:0)+candidate.infrastructure*.8+candidate.freeLand*.08+candidate.economy*.3;
 const recommendedRegion=type?[...game.regions].sort((a,b)=>regionScore(b)-regionScore(a))[0]:null;
 const specializationBonus=Boolean(type&&region&&region.specialization===type.specialization);
 const projectedHourly=type?type.incomePerSecond*3600*(specializationBonus?1.2:1)*staffing:0;
 const paybackHours=projectedHourly>0?cost/projectedHourly:Infinity;
 const wornFacilities=game.enterprises.filter(item=>item.wear>=35).length;
 const advisor=useMemo(()=>{
  if(wornFacilities>0)return{tone:"warning" as const,text:`${wornFacilities} предприятий имеют износ от 35%. Ремонт за ${repairCost.toFixed(2)} млрд восстановит их производительность.`};
  if(unemployment<2&&type&&staffing<.9)return{tone:"warning" as const,text:`Дефицит специалистов ограничит загрузку «${type.name}». Проверьте кадровый резерв перед строительством.`};
  if(type&&specializationBonus)return{tone:"positive" as const,text:`Регион «${region?.name}» совпадает со специализацией «${type.specialization}»: +20% к доходу. Прогноз — +${projectedHourly.toFixed(2)} млрд/ч до общесистемных коэффициентов.`};
  return{tone:"neutral" as const,text:"Выберите регион с подходящей специализацией: совпадение даёт +20% к выпуску. Инфраструктура и свободная земля помогают разместить производство."};
 },[wornFacilities,repairCost,unemployment,type,staffing,specializationBonus,region,projectedHourly]);
 const formatPayback=(hours:number)=>!Number.isFinite(hours)?"Нет дохода":hours<24?`${hours.toFixed(1)} ч`:hours/24<365?`${(hours/24).toFixed(1)} дн.`:`${(hours/8760).toFixed(1)} года`;
 return <BottomSheet title="Промышленность" onClose={onClose}>
  <NationIllustration variant="industry" className="mb-4 h-[92px] w-full"/>
  <div className="grid grid-cols-2 gap-2"><div className="stat-card"><span>Предприятий</span><strong className="tabular-nums">{game.enterprises.length}</strong></div><div className="stat-card"><span>Средний износ</span><strong className={`tabular-nums ${wear>=25?"text-rose-400":"text-emerald-400"}`}>{wear.toFixed(1)}%</strong></div></div>
  <div className="progress-track mt-3 h-2"><div className="transition-all duration-200" style={{width:`${wear}%`,background:wear>=35?"#fb7185":"#34d399"}}/></div>
  <p className="mt-2 text-[10px] leading-relaxed text-slate-400">Износ растёт на 0,5% за реальный час; доход снижается пропорционально.</p>
  <button type="button" disabled={!game.enterprises.length||repairCost>game.budget.treasury} onClick={onRepair} className="action-secondary mt-3 w-full disabled:opacity-40"><Wrench size={14}/> Ремонт всех предприятий · <span className="tabular-nums">{repairCost.toFixed(2)} млрд</span></button>
  <div className="mt-4 grid grid-cols-2 gap-2"><div className="stat-card"><span>Рабочие места</span><strong className="tabular-nums">{jobs.toLocaleString("ru-RU")}</strong></div><div className="stat-card"><span>Безработица</span><strong className="tabular-nums">{unemployment.toFixed(2)}%</strong></div></div>
  <section className="mt-5"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Отрасли</h3><span className="text-[9px] text-slate-500">Выберите направление</span></div>
   <div className="grid grid-cols-2 gap-2">{industrySectorOrder.map(id=>{const item=sectorFor(id),Icon=item.icon,active=sectorId===id,options=game.enterpriseTypes.filter(t=>t.sector===id);return <button key={id} type="button" onClick={()=>{setSectorId(id);if(options[0])setType(options[0].id);}} className={`min-w-0 rounded-xl border p-3 text-left transition-all active:scale-[.98] ${active?`${item.border} bg-white/[.07] shadow-lg shadow-black/20`:"border-white/[.07] bg-slate-950/35"}`}>
    <span className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-white/[.06] ${item.accent}`}><Icon size={19}/></span><strong className="block min-h-8 text-[11px] leading-snug text-slate-100">{item.title}</strong><span className="mt-1 block min-h-8 text-[9px] leading-snug text-slate-500">{item.subtitle}</span><span className={`mt-2 inline-flex rounded-full px-2 py-1 text-[8px] ${item.accent} bg-white/[.05]`}>{options.length} объектов</span>
   </button>;})}</div>
  </section>
  <section className="mt-4 rounded-2xl border border-white/[.08] bg-slate-950/35 p-3"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-bold">{selectedSector.title}</h3><span className={`text-[9px] ${selectedSector.accent}`}>{selectedSector.metric}</span></div><div className="space-y-2">
   {sectorTypes.map(item=>{const active=item.id===typeId,itemCost=getEnterpriseBuildCost(item,game.enterprises.length),match=region?.specialization===item.specialization,income=item.incomePerSecond*3600*(match?1.2:1)*(unemployment<2?Math.min(1,game.specialists/Math.max(1,item.jobs)):1);return <button key={item.id} type="button" onClick={()=>setType(item.id)} className={`flex w-full min-w-0 items-start gap-3 rounded-xl border p-3 text-left transition-all ${active?"border-emerald-400/35 bg-emerald-500/[.07]":"border-white/[.06] bg-white/[.02]"}`}>
    <span className="min-w-0 flex-1"><strong className="block text-[11px] text-slate-100">{item.name}</strong><small className="mt-1 block text-[9px] leading-snug text-slate-500">{item.description}</small><span className="mt-2 flex flex-wrap gap-2 text-[9px]"><b className="text-rose-300">−{itemCost.toFixed(1)} млрд</b><b className="text-emerald-300">+{income.toFixed(2)} млрд/ч</b><b className="text-slate-400">{item.energyMW<0?`+ ${Math.abs(item.energyMW)} МВт`:`− ${item.energyMW} МВт`}</b></span></span><span className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${active?"border-emerald-300 bg-emerald-400 text-slate-950":"border-slate-600 text-transparent"}`}>✓</span>
   </button>;})}
  </div></section>
  <section className="mt-4"><div className="mb-2 flex items-center justify-between gap-2"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Регион размещения</h3><span className="text-[9px] text-slate-500">Выберите площадку</span></div>
   {recommendedRegion?<div className="mb-2 rounded-xl border border-emerald-400/30 bg-emerald-500/[.07] p-3"><p className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">Лучший регион для выбранной отрасли</p><p className="mt-1 text-xs font-bold text-slate-100">{recommendedRegion.name}</p><p className="mt-1 text-[10px] leading-relaxed text-slate-300">Специализация: {recommendedRegion.specialization}. {recommendedRegion.specialization===type?.specialization?"Совпадение даёт +20% к доходу.":`Преимущество площадки: инфраструктура ур. ${recommendedRegion.infrastructure}/10 и свободная земля ${recommendedRegion.freeLand}%.`}</p></div>:null}
   <div className="grid grid-cols-2 gap-2">{game.regions.map(item=>{const selected=regionId===item.id,recommended=recommendedRegion?.id===item.id,match=item.specialization===type?.specialization;return <button key={item.id} type="button" onClick={()=>setRegion(item.id)} className={`min-w-0 rounded-xl border p-3 text-left transition-all ${selected?"border-cyan-300/40 bg-cyan-500/[.08]":recommended?"border-emerald-400/30 bg-emerald-500/[.05]":"border-white/[.07] bg-slate-950/30"}`}>
    <span className="flex items-start justify-between gap-1"><strong className="min-w-0 text-[10px] leading-snug">{item.name}</strong>{recommended?<span className="shrink-0 rounded bg-emerald-400/15 px-1.5 py-0.5 text-[8px] text-emerald-300">ТОП</span>:null}</span><span className="mt-1 block text-[9px] text-slate-500">{item.specialization}</span><span className="mt-2 flex flex-wrap gap-2 text-[9px]"><b className={match?"text-emerald-300":"text-slate-400"}>{match?"+20% доход":`Инфра. ${item.infrastructure}/10`}</b><b className="text-slate-400">Земля {item.freeLand}%</b></span>
   </button>;})}</div>
  </section>
  {type?<div className="mt-4 rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-950/25 to-[#111925] p-4"><div className="flex items-start justify-between gap-2"><strong className="text-sm">{type.name}</strong><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[8px] font-bold text-emerald-300">СЛЕДУЮЩАЯ ПОКУПКА</span></div><p className="mt-1 text-[10px] text-slate-400">{type.description}</p>
   <div className="mt-3 grid grid-cols-2 gap-2"><div className="stat-card"><span>Стоимость</span><strong className="text-rose-300">−{cost.toFixed(1)} млрд</strong></div><div className="stat-card"><span>Доход / час</span><strong className="text-emerald-300">+{projectedHourly.toFixed(2)} млрд</strong></div><div className="stat-card"><span>Окупаемость</span><strong className="text-amber-300">{formatPayback(paybackHours)}</strong></div><div className="stat-card"><span>Цена после покупки</span><strong className="text-slate-200">{(type.buildCost*Math.pow(1.1,game.enterprises.length+1)).toFixed(1)} млрд</strong></div></div>
   <p className="mt-2 text-[9px] leading-relaxed text-slate-500">Каждая покупка увеличивает цену всех типов предприятий на 10%. Цена единообразна в интерфейсе и расчёте казны.</p>
   {specializationBonus?<p className="mt-2 text-[10px] text-emerald-300">Бонус региона «{region?.name}»: +20% к доходу.</p>:recommendedRegion?<p className="mt-2 text-[10px] text-amber-200">Рекомендуем: {recommendedRegion.name} · {recommendedRegion.specialization}.</p>:null}
   {unemployment<2&&staffing<1?<p className="mt-2 text-[10px] text-rose-300">Кадровое ограничение: загрузка {(staffing*100).toFixed(0)}%.</p>:null}
   <button type="button" disabled={!region||game.budget.treasury<cost} onClick={()=>onBuild(typeId,regionId)} className="action-primary mt-3 w-full disabled:opacity-40"><Plus size={14}/> Построить предприятие · {cost.toFixed(1)} млрд</button>
  </div>:null}
  <div className="mt-3"><AdvisorCard tone={advisor.tone}>{advisor.text}</AdvisorCard></div>
  <div ref={enterpriseListRef} className="mt-4 space-y-2"><h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Действующие предприятия</h3>
   {game.enterprises.map((enterprise,index)=>{const t=game.enterpriseTypes.find(item=>item.id===enterprise.typeId),host=game.regions.find(item=>item.id===enterprise.regionId);if(!t)return null;const hourly=t.incomePerSecond*3600*(host?.specialization===t.specialization?1.2:1)*(1-enterprise.wear/100),invested=enterprise.purchaseCost??getEnterpriseBuildCost(t,index);return <article key={enterprise.id} className="stat-card border border-white/[.07]"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><strong className="block text-xs">{enterprise.name}</strong><span className="mt-1 block text-[9px] text-slate-500">{host?.name??"Регион не найден"} · {sectorFor(t.sector).title}</span></div><span className={`rounded-md px-2 py-1 text-[9px] ${enterprise.wear>=35?"bg-rose-500/15 text-rose-300":"bg-emerald-500/15 text-emerald-300"}`}>{enterprise.wear.toFixed(1)}% износа</span></div><div className="mt-3 grid grid-cols-3 gap-2 text-[9px]"><div><span className="block text-slate-500">Вложено</span><b className="text-rose-300">{invested.toFixed(1)} млрд</b></div><div><span className="block text-slate-500">Доход / ч</span><b className="text-emerald-300">+{hourly.toFixed(2)} млрд</b></div><div><span className="block text-slate-500">Окупаемость</span><b className="text-amber-300">{formatPayback(hourly>0?invested/hourly:Infinity)}</b></div></div></article>;})}
   {!game.enterprises.length?<p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-[10px] text-slate-500">Пока нет построенных предприятий. Выберите отрасль и регион.</p>:null}
  </div>
 </BottomSheet>;
}
