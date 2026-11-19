"use client";

import {
  Activity,
  Building2,
  Coins,
  Factory,
  GraduationCap,
  HeartPulse,
  Landmark,
  MapPinned,
  Radio,
  RotateCcw,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  TrendingUp,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";
import BottomSheet from "@/components/Drawers/BottomSheet";
import EconomyDrawer from "@/components/Drawers/EconomyDrawer";
import EnergyDrawer from "@/components/Drawers/EnergyDrawer";
import MinistryDrawer from "@/components/Drawers/MinistryDrawer";
import PresidentDrawer from "@/components/Drawers/PresidentDrawer";
import RegionDrawer from "@/components/Drawers/RegionDrawer";
import { gameActions, useGameStore } from "@/store/useGameStore";
import type {
  MinistryId,
  Region,
  RegionLevelKey,
  Speed,
} from "@/types/game";

type DrawerKind =
  | "region"
  | "economy"
  | "energy"
  | "president"
  | "ministry"
  | null;

interface DockItem {
  id: string;
  label: string;
  icon: LucideIcon;
  tone: string;
  background: string;
  border: string;
}

const dockItems: DockItem[] = [
  {
    id: "economy",
    label: "Экономика\nи налоги",
    icon: Coins,
    tone: "text-amber-300",
    background: "bg-amber-400/10",
    border: "border-amber-400/20",
  },
  {
    id: "energy",
    label: "Энергетика",
    icon: Zap,
    tone: "text-yellow-300",
    background: "bg-yellow-400/10",
    border: "border-yellow-400/20",
  },
  {
    id: "industry",
    label: "Промышленность",
    icon: Factory,
    tone: "text-orange-300",
    background: "bg-orange-400/10",
    border: "border-orange-400/20",
  },
  {
    id: "regions",
    label: "Регионы",
    icon: MapPinned,
    tone: "text-cyan-300",
    background: "bg-cyan-400/10",
    border: "border-cyan-400/20",
  },
  {
    id: "president",
    label: "Офис Президента",
    icon: Landmark,
    tone: "text-violet-300",
    background: "bg-violet-400/10",
    border: "border-violet-400/20",
  },
  {
    id: "parliament",
    label: "Парламент",
    icon: Building2,
    tone: "text-blue-300",
    background: "bg-blue-400/10",
    border: "border-blue-400/20",
  },
  {
    id: "media",
    label: "Медиа",
    icon: Radio,
    tone: "text-pink-300",
    background: "bg-pink-400/10",
    border: "border-pink-400/20",
  },
  {
    id: "health",
    label: "Здоровье",
    icon: HeartPulse,
    tone: "text-rose-300",
    background: "bg-rose-400/10",
    border: "border-rose-400/20",
  },
  {
    id: "education",
    label: "Образование",
    icon: GraduationCap,
    tone: "text-indigo-300",
    background: "bg-indigo-400/10",
    border: "border-indigo-400/20",
  },
  {
    id: "security",
    label: "Безопасность\nи МВД",
    icon: Shield,
    tone: "text-slate-300",
    background: "bg-slate-400/10",
    border: "border-slate-400/20",
  },
  {
    id: "defense",
    label: "Силы обороны",
    icon: ShieldCheck,
    tone: "text-emerald-300",
    background: "bg-emerald-400/10",
    border: "border-emerald-400/20",
  },
  {
    id: "projects",
    label: "Нацпроекты",
    icon: TrendingUp,
    tone: "text-teal-300",
    background: "bg-teal-400/10",
    border: "border-teal-400/20",
  },
];

const speedOptions: { label: string; value: Speed }[] = [
  { label: "Пауза", value: 0 },
  { label: "1×", value: 1 },
  { label: "2×", value: 2 },
  { label: "5×", value: 5 },
];

interface MapViewProps {
  regions: Region[];
  onSelect: (region: Region) => void;
}

function MapView({ regions, onSelect }: MapViewProps) {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
    distance: number;
    scale: number;
  } | null>(null);
  const moved = useRef(false);
  const lastTap = useRef(0);
  const tapTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (tapTimer.current !== null) {
        window.clearTimeout(tapTimer.current);
      }
    };
  }, []);

  const getDistance = (
    first: { x: number; y: number },
    second: { x: number; y: number },
  ) => Math.hypot(first.x - second.x, first.y - second.y);

  const handlePointerDown = (
    event: PointerEvent<SVGSVGElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    moved.current = false;

    const activePointers = Array.from(pointers.current.values());

    if (activePointers.length === 1) {
      gesture.current = {
        x: event.clientX,
        y: event.clientY,
        offsetX: offset.x,
        offsetY: offset.y,
        distance: 0,
        scale,
      };
    }

    if (activePointers.length === 2) {
      gesture.current = {
        x: 0,
        y: 0,
        offsetX: offset.x,
        offsetY: offset.y,
        distance: getDistance(activePointers[0], activePointers[1]),
        scale,
      };
    }
  };

  const handlePointerMove = (
    event: PointerEvent<SVGSVGElement>,
  ) => {
    if (!pointers.current.has(event.pointerId)) {
      return;
    }

    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });

    const activePointers = Array.from(pointers.current.values());

    if (activePointers.length === 1 && gesture.current) {
      const deltaX = event.clientX - gesture.current.x;
      const deltaY = event.clientY - gesture.current.y;

      if (Math.abs(deltaX) + Math.abs(deltaY) > 5) {
        moved.current = true;
      }

      setOffset({
        x: gesture.current.offsetX + deltaX,
        y: gesture.current.offsetY + deltaY,
      });
    }

    if (activePointers.length === 2 && gesture.current) {
      const currentDistance = getDistance(
        activePointers[0],
        activePointers[1],
      );

      if (Math.abs(currentDistance - gesture.current.distance) > 2) {
        moved.current = true;
      }

      const nextScale =
        gesture.current.scale *
        (currentDistance / Math.max(1, gesture.current.distance));

      setScale(Math.max(0.8, Math.min(3, nextScale)));
    }
  };

  const handlePointerUp = (
    event: PointerEvent<SVGSVGElement>,
  ) => {
    pointers.current.delete(event.pointerId);
    const remaining = Array.from(pointers.current.values());

    if (remaining.length === 1) {
      gesture.current = {
        x: remaining[0].x,
        y: remaining[0].y,
        offsetX: offset.x,
        offsetY: offset.y,
        distance: 0,
        scale,
      };
    } else {
      gesture.current = null;
    }
  };

  const handleRegionTap = (region: Region) => {
    if (moved.current) {
      return;
    }

    const now = Date.now();

    if (now - lastTap.current < 280) {
      if (tapTimer.current !== null) {
        window.clearTimeout(tapTimer.current);
      }

      tapTimer.current = null;
      lastTap.current = 0;
      setScale((current) => (current > 1.2 ? 1 : 1.7));
      setOffset({ x: 0, y: 0 });
      return;
    }

    lastTap.current = now;
    tapTimer.current = window.setTimeout(() => {
      onSelect(region);
      tapTimer.current = null;
    }, 260);
  };

  return (
    <svg
      viewBox="0 0 460 460"
      className="map-svg h-full w-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <defs>
        <pattern
          id="map-grid"
          width="22"
          height="22"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M22 0H0V22"
            fill="none"
            stroke="#334155"
            strokeWidth="0.55"
            opacity="0.55"
          />
        </pattern>
        <filter id="city-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <rect width="460" height="460" fill="url(#map-grid)" />

      <g
        transform={`translate(${offset.x} ${offset.y}) translate(230 230) scale(${scale}) translate(-230 -230)`}
      >
        <path
          d="M48 40 148 15 250 27 340 45 430 115 447 225 415 345 325 435 210 448 95 405 22 300 8 175Z"
          fill="#111b2b"
          stroke="#475569"
          strokeWidth="2"
          strokeDasharray="5 5"
        />
        <path
          d="M70 55 170 40 205 100 160 145 75 130Z"
          fill="#1d4ed8"
          stroke="#93c5fd"
          strokeWidth="2"
        />

        {regions.map((region, index) => (
          <g
            key={region.id}
            className="cursor-pointer"
            onClick={() => handleRegionTap(region)}
          >
            <polygon
              points={region.polygon}
              fill={
                index % 3 === 0
                  ? "#2563eb"
                  : index % 3 === 1
                    ? "#1e40af"
                    : "#1d4ed8"
              }
              stroke="#93c5fd"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <polygon
              points={region.polygon}
              fill="transparent"
              stroke="#dbeafe"
              strokeWidth="0.7"
              strokeDasharray="3 4"
            />
            <text
              x={region.cities[0].x}
              y={region.cities[0].y - 13}
              fill="#dbeafe"
              fontSize="9"
              textAnchor="middle"
              fontWeight="600"
              pointerEvents="none"
            >
              {region.city}
            </text>
            {region.cities.map((city) => (
              <circle
                key={city.name}
                cx={city.x}
                cy={city.y}
                r={city.size}
                fill="#facc15"
                stroke="#fef3c7"
                strokeWidth="1.5"
                filter="url(#city-glow)"
                pointerEvents="none"
              />
            ))}
            <text
              x={region.cities[0].x}
              y={region.cities[0].y + 18}
              fill="#bfdbfe"
              fontSize="7"
              textAnchor="middle"
              pointerEvents="none"
            >
              {region.name}
            </text>
          </g>
        ))}
      </g>

      <text x="16" y="445" fill="#64748b" fontSize="9">
        NORDLAND • ГЕОПОЛИТИЧЕСКАЯ КАРТА
      </text>
    </svg>
  );
}

function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="stat-card min-w-0">
      <span>{label}</span>
      <strong>{value}</strong>
      {detail ? <small>{detail}</small> : null}
    </div>
  );
}

export default function NationDashboard() {
  const game = useGameStore();
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [activeMinistryId, setActiveMinistryId] =
    useState<MinistryId | null>(null);

  useEffect(() => {
    gameActions.initialize();
  }, []);

  useEffect(() => {
    if (!game.hydrated || game.speed === 0) {
      return;
    }

    const timer = window.setInterval(
      () => gameActions.tick(),
      2000 / game.speed,
    );

    return () => window.clearInterval(timer);
  }, [game.hydrated, game.speed]);

  const openDockItem = (id: string) => {
    if (id === "economy" || id === "energy" || id === "president") {
      setDrawer(id);
      return;
    }

    if (id === "regions") {
      setSelectedRegion(game.regions[4] ?? game.regions[0] ?? null);
      setDrawer("region");
      return;
    }

    const ministry = game.ministries.find((item) => item.id === id);

    if (ministry) {
      setActiveMinistryId(ministry.id);
      setDrawer("ministry");
    }
  };

  const closeDrawer = () => {
    setDrawer(null);
  };

  const selectedMinistry = game.ministries.find(
    (ministry) => ministry.id === activeMinistryId,
  );
  const displayedRegion =
    selectedRegion ?? game.regions[4] ?? game.regions[0];

  const resetGame = () => {
    if (window.confirm("Сбросить весь прогресс и начать заново?")) {
      gameActions.reset();
      setDrawer(null);
      setSelectedRegion(null);
      setActiveMinistryId(null);
    }
  };

  return (
    <main className="game-shell mx-auto flex h-dvh w-screen max-w-[480px] select-none flex-col overflow-hidden overscroll-none border-x border-slate-800 px-3 text-slate-100">
      <header className="shrink-0 pt-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <h1 className="truncate text-[15px] font-extrabold tracking-tight">
                {game.country}
              </h1>
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <strong className="text-[21px] font-black tracking-tight">
                ${(game.budget.treasury / 1000).toFixed(2)} трлн
              </strong>
              <span className="truncate text-[10px] font-bold text-emerald-400">
                +${game.budget.incomePerHour.toFixed(1)} млрд/час
              </span>
            </div>
            <div className="text-[10px] text-slate-500">
              КАЗНА • {game.day} ДЕНЬ • {String(game.hour).padStart(2, "0")}:00
            </div>
          </div>

          <button
            type="button"
            onClick={resetGame}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-[#151F32] text-slate-300"
            aria-label="Сбросить игру"
          >
            <RotateCcw size={18} />
          </button>
        </div>

        <div className="mt-2 flex gap-1 rounded-xl bg-[#111b2b] p-1">
          {speedOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => gameActions.setSpeed(option.value)}
              className={`min-h-11 flex-1 rounded-lg text-xs font-bold transition ${
                game.speed === option.value
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </header>

      <section className="mt-2 grid shrink-0 grid-cols-3 gap-2">
        <StatCard
          label="Дней у власти"
          value={String(game.day)}
          detail="мандат продолжается"
        />
        <StatCard
          label="Население"
          value={`${game.population.toFixed(1)} млн`}
          detail="граждане страны"
        />
        <div className="stat-card">
          <span>Рейтинг</span>
          <strong>{Math.round(game.rating)}%</strong>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700">
            <div
              className="h-full rounded-full bg-emerald-400"
              style={{ width: `${game.rating}%` }}
            />
          </div>
        </div>
      </section>

      <section className="mt-2 flex h-8 shrink-0 items-center gap-2 overflow-hidden rounded-lg border border-red-500/20 bg-red-500/5 px-2">
        <span className="flex shrink-0 items-center gap-1 rounded bg-red-500 px-1.5 py-0.5 text-[9px] font-black uppercase">
          <Radio size={10} />
          В эфире
        </span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="ticker-track whitespace-nowrap text-[10px] text-slate-300">
            {game.events[0]?.text ?? "Новости государства появятся здесь."}
          </div>
        </div>
      </section>

      <section className="relative mt-2 min-h-0 flex-1 overflow-hidden rounded-2xl border border-[#1E293B] bg-[#101a2a]">
        <div className="absolute left-3 top-3 z-10 rounded-lg border border-blue-400/20 bg-[#0B1120]/85 px-2 py-1.5">
          <div className="text-[9px] font-bold uppercase tracking-widest text-blue-300">
            Территория
          </div>
          <div className="text-xs font-bold">14 регионов</div>
        </div>
        <div className="absolute right-3 top-3 z-10 rounded-lg bg-[#0B1120]/80 px-2 py-1.5 text-[9px] text-slate-400">
          PINCH • TAP
        </div>
        <MapView
          regions={game.regions}
          onSelect={(region) => {
            setSelectedRegion(region);
            setDrawer("region");
          }}
        />
        <div className="absolute bottom-3 left-3 rounded-lg border border-slate-700 bg-[#0B1120]/85 px-2 py-1 text-[9px] text-slate-400">
          <span className="text-amber-300">● Город</span>　— Область
        </div>
        <button
          type="button"
          onClick={() => {
            setSelectedRegion(displayedRegion ?? null);
            setDrawer("region");
          }}
          className="absolute bottom-3 right-3 flex min-h-11 items-center gap-1 rounded-lg border border-slate-700 bg-[#151F32] px-3 text-[10px] font-semibold"
        >
          <MapPinned size={13} />
          Обзор региона
        </button>
      </section>

      <nav className="no-scrollbar mt-2 flex shrink-0 gap-2 overflow-x-auto pb-1 pt-0.5">
        {dockItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => openDockItem(item.id)}
              className={`flex h-[76px] w-[82px] shrink-0 flex-col items-center justify-center gap-1 rounded-2xl border px-1 ${item.border} ${item.background}`}
            >
              <Icon size={21} className={item.tone} />
              <span
                className={`whitespace-pre-line text-center text-[9px] font-semibold leading-tight ${item.tone}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {drawer === "region" && displayedRegion ? (
        <RegionDrawer
          region={displayedRegion}
          game={game}
          onClose={closeDrawer}
          onUpgrade={gameActions.upgradeRegion}
        />
      ) : null}

      {drawer === "economy" ? (
        <EconomyDrawer
          game={game}
          onClose={closeDrawer}
          onTaxChange={gameActions.updateTax}
        />
      ) : null}

      {drawer === "energy" ? (
        <EnergyDrawer
          game={game}
          onClose={closeDrawer}
          onBuildPlant={gameActions.buildPlant}
          onBuildStorage={gameActions.buildStorage}
        />
      ) : null}

      {drawer === "president" ? (
        <PresidentDrawer
          game={game}
          onClose={closeDrawer}
          onIssueDecree={gameActions.issueDecree}
          onPublishAddress={gameActions.publishAddress}
        />
      ) : null}

      {drawer === "ministry" && selectedMinistry ? (
        <MinistryDrawer
          ministry={selectedMinistry}
          onClose={closeDrawer}
          onFundingChange={gameActions.setMinistryFunding}
        />
      ) : null}
    </main>
  );
}
