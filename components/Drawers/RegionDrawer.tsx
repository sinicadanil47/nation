"use client";
import { Plus, Zap } from "lucide-react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import type { GameState, Region, RegionLevelKey } from "@/types/game";
interface Props { region: Region; game: GameState; onClose: () => void; onUpgrade: (id: string, field: RegionLevelKey) => void; onAccelerate: (id: string) => void; }
const fields: { key: RegionLevelKey; label: string }[] = [
 { key: "infrastructure", label: "Инфраструктура" }, { key: "economy", label: "Экономика" }, { key: "medicine", label: "Медицина" }, { key: "education", label: "Образование" },
];
function countdown(seconds: number): string { const safe=Math.max(0,seconds); return String(Math.floor(safe/60)).padStart(2,"0")+":"+String(safe%60).padStart(2,"0"); }
export default function RegionDrawer({region,game,onClose,onUpgrade,onAccelerate}:Props) {
 const construction=game.constructions.find(item=>item.regionId===region.id);
 const remaining=construction?Math.ceil((construction.completesAt-Date.now())/1000):0;
 return <BottomSheet title={region.name} onClose={onClose}>
  <div className="mb-4 grid grid-cols-2 gap-2">
   <div className="stat-card flex flex-col gap-1"><span>Население</span><strong className="tabular-nums">{region.population.toFixed(1)} млн</strong></div>
   <div className="stat-card flex flex-col gap-1"><span>Доход / час</span><strong className="tabular-nums">{region.incomePerHour.toFixed(1)} млрд</strong></div>
   <div className="stat-card flex flex-col gap-1"><span>Специализация</span><strong>{region.specialization}</strong></div>
   <div className="stat-card flex flex-col gap-1"><span>Свободная земля</span><strong>{region.freeLand}%</strong></div>
  </div>
  <div className="mb-3 flex justify-between text-xs text-slate-400"><span>Строительные бригады</span><strong className="text-amber-300">{game.constructionTeams} / 3</strong></div>
  {construction?<div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3"><div className="flex items-center justify-between"><span className="text-xs font-bold text-amber-300">Идёт строительство</span><strong className="tabular-nums font-mono text-amber-200">{countdown(remaining)}</strong></div><p className="mt-1 text-[10px] text-slate-400">Улучшение завершится автоматически.</p><button type="button" onClick={()=>onAccelerate(construction.id)} disabled={game.budget.treasury<5} className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-amber-500/15 text-xs font-bold text-amber-300 disabled:opacity-40"><Zap size={14}/> Ускорить за $5 млрд</button></div>:null}
  {fields.map(({key,label})=><div key={key} className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-slate-700 bg-slate-900/40 p-3"><div className="min-w-0 flex-1"><strong className="text-sm">{label}</strong><div className="mt-2 flex gap-1">{Array.from({length:10},(_,index)=><span key={index} className={`h-1.5 flex-1 rounded-sm ${index<region[key]?"bg-cyan-400":"bg-slate-700"}`}/>)}</div><span className="mt-1 block text-[10px] text-slate-500">Уровень {region[key]} из 10</span></div><button type="button" disabled={game.constructionTeams===0||region[key]>=10||game.budget.treasury<12||Boolean(construction)} onClick={()=>onUpgrade(region.id,key)} className="flex min-h-11 shrink-0 items-center gap-1 rounded-xl bg-cyan-700 px-3 text-xs font-bold disabled:opacity-35"><Plus size={14}/> $12 млрд</button></div>)}
  <p className="text-[10px] text-slate-500">Строительство занимает от 2 до 10 минут реального времени.</p>
 </BottomSheet>;
}