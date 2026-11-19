"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent, WheelEvent } from "react";
import type { ForeignCountry, Region } from "@/types/game";
import { generateMap } from "@/utils/mapGenerator";
import type { GeneratedCountry, MapPoint } from "@/utils/mapGenerator";

type Pointer = { x: number; y: number };
type GestureStart = { point: Pointer; travel: number; regionId: string | null; countryId: string | null };
const world = generateMap();
const distance = (a: Pointer, b: Pointer) => Math.hypot(a.x - b.x, a.y - b.y);
const relationColor = (value: number) => {
  const relation = Math.max(-100, Math.min(100, value));
  const red = [239, 68, 68], neutral = [148, 163, 184], green = [16, 185, 129];
  const from = relation < 0 ? red : neutral;
  const to = relation < 0 ? neutral : green;
  const progress = Math.abs(relation) / 100;
  const rgb = from.map((channel, index) => Math.round(channel + (to[index] - channel) * progress));
  return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
};

export default function CountryMap({
  regions, activeId, selectedCountryId, foreignCountries, onSelect, onSelectCountry,
}: {
  regions: Region[]; activeId: string | null; selectedCountryId: string | null; foreignCountries: ForeignCountry[];
  onSelect: (region: Region) => void; onSelectCountry: (country: GeneratedCountry) => void;
}) {
  const [view, setView] = useState({ x: 0, y: 0, zoom: 1 });
  const [mapMode, setMapMode] = useState<"political" | "relations">("political");
  const viewRef = useRef(view);
  const pointers = useRef(new Map<number, Pointer>());
  const starts = useRef(new Map<number, GestureStart>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const dragged = useRef(false);

  const applyView = (x: number, y: number, zoom: number) => {
    const nextZoom = Math.max(.25, Math.min(3.5, zoom));
    const maxX = world.width * .42 * nextZoom, maxY = world.height * .42 * nextZoom;
    const next = { x: Math.max(-maxX, Math.min(maxX, x)), y: Math.max(-maxY, Math.min(maxY, y)), zoom: nextZoom };
    viewRef.current = next; setView(next);
  };

  useEffect(() => {
    const baseScale = Math.max(window.innerWidth / world.width, window.innerHeight / world.height);
    const targetZoom = Math.max(.95, Math.min(3.5, .60 * window.innerWidth / Math.max(1, world.playerBounds.width * baseScale)));
    applyView(world.width / 2 - world.playerBounds.centerX * targetZoom, world.height / 2 - world.playerBounds.centerY * targetZoom, targetZoom);
    const onResize = () => {
      const scale = Math.max(window.innerWidth / world.width, window.innerHeight / world.height);
      const zoom = Math.max(.95, Math.min(3.5, .60 * window.innerWidth / Math.max(1, world.playerBounds.width * scale)));
      applyView(world.width / 2 - world.playerBounds.centerX * zoom, world.height / 2 - world.playerBounds.centerY * zoom, zoom);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = { x: event.clientX, y: event.clientY };
    const target = (event.target as Element).closest("[data-region-id],[data-country-id]");
    pointers.current.set(event.pointerId, point);
    starts.current.set(event.pointerId, {
      point, travel: 0,
      regionId: target?.getAttribute("data-region-id") ?? null,
      countryId: target?.getAttribute("data-country-id") ?? null,
    });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: distance(a, b), zoom: viewRef.current.zoom };
      dragged.current = true;
    }
  };
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    const point = { x: event.clientX, y: event.clientY };
    const previous = pointers.current.get(event.pointerId)!;
    pointers.current.set(event.pointerId, point);
    const start = starts.current.get(event.pointerId);
    if (start) { start.travel = Math.max(start.travel, distance(start.point, point)); if (start.travel >= 6) dragged.current = true; }
    const baseScale = Math.max(event.currentTarget.clientWidth / world.width, event.currentTarget.clientHeight / world.height);
    if (pointers.current.size > 1 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      applyView(viewRef.current.x, viewRef.current.y, pinch.current.zoom * distance(a, b) / Math.max(1, pinch.current.distance));
    } else {
      applyView(viewRef.current.x + (point.x - previous.x) / baseScale / viewRef.current.zoom,
        viewRef.current.y + (point.y - previous.y) / baseScale / viewRef.current.zoom, viewRef.current.zoom);
    }
  };
  const finishPointer = (event: PointerEvent<HTMLDivElement>, cancelled = false) => {
    const start = starts.current.get(event.pointerId);
    pointers.current.delete(event.pointerId); starts.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (!cancelled && start && start.travel < 6 && !dragged.current && pointers.current.size === 0) {
      if (start.regionId) {
        const region = regions.find(item => item.id === start.regionId);
        if (region) onSelect(region);
      } else if (start.countryId) {
        const country = world.countries.find(item => item.id === start.countryId);
        if (country) onSelectCountry(country);
      }
    }
    if (pointers.current.size === 0) dragged.current = false;
  };
  const onWheel = (event: WheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    applyView(viewRef.current.x, viewRef.current.y, viewRef.current.zoom * Math.exp(-event.deltaY * .001));
  };
  const lod = view.zoom < .45 ? 0 : view.zoom < .95 ? 1 : 2;

  const boundaryPaths = useMemo(() => {
    const bySite = new Map(world.cells.map(cell => [cell.siteIndex, cell]));
    const playerBorders: string[] = [];
    const foreignBorders: string[] = [];
    const coastlines: string[] = [];
    for (const cell of world.cells) {
      for (let index = 0; index < cell.points.length; index += 1) {
        const a = cell.points[index], b = cell.points[(index + 1) % cell.points.length];
        const path = "M" + a.x + " " + a.y + " L" + b.x + " " + b.y;
        const adjacent = cell.neighbors.map(id => bySite.get(id)).find(candidate =>
          candidate && candidate.points.some(point => Math.hypot(point.x - a.x, point.y - a.y) < .02) &&
          candidate.points.some(point => Math.hypot(point.x - b.x, point.y - b.y) < .02));
        if (!adjacent) { coastlines.push(path); continue; }
        if (cell.owner === "player" && adjacent.owner !== "player") playerBorders.push(path);
        if (cell.owner === "foreign" && adjacent.owner === "foreign" && adjacent.countryId !== cell.countryId) foreignBorders.push(path);
      }
    }
    return { player: playerBorders.join(" "), foreign: foreignBorders.join(" "), coast: coastlines.join(" ") };
  }, []);

  return (
    <div className="country-map fixed inset-0 z-0 h-dvh w-full touch-none select-none overflow-hidden"
      onPointerDown={onPointerDown} onPointerMove={onPointerMove}
      onPointerUp={event => finishPointer(event)} onPointerCancel={event => finishPointer(event, true)} onWheel={onWheel}>
      <svg viewBox={`0 0 ${world.width} ${world.height}`} preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        <defs>
          <radialGradient id="world-ocean"><stop stopColor="#102238"/><stop offset=".68" stopColor="#091321"/><stop offset="1" stopColor="#060911"/></radialGradient>
          <pattern id="ocean-depth" width="250" height="210" patternUnits="userSpaceOnUse"><path d="M-30 75 Q45 8 125 75 T280 70 M-25 130 Q55 60 135 130 T285 125" fill="none" stroke="#527b94" strokeOpacity=".12" strokeWidth="2"/></pattern>
        </defs>
        <rect width={world.width} height={world.height} fill="url(#world-ocean)"/>
        <rect width={world.width} height={world.height} fill="url(#ocean-depth)"/>
        <g transform={`translate(${view.x} ${view.y}) translate(${world.width / 2} ${world.height / 2}) scale(${view.zoom}) translate(-${world.width / 2} -${world.height / 2})`}>
          {world.cells.filter(cell => cell.owner === "foreign").map(cell => (
            <path key={cell.id} data-country-id={cell.countryId} d={cell.path}
              fill={selectedCountryId === cell.countryId ? "#263D53" : mapMode === "relations" ? relationColor(foreignCountries.find(country => country.id === cell.countryId)?.relations ?? 0) : cell.fill}
              stroke={cell.fill} strokeWidth="1.8" strokeLinejoin="round"/>
          ))}
          <path d={boundaryPaths.foreign} fill="none" stroke="#1E293B" strokeWidth="2.1" vectorEffect="non-scaling-stroke" pointerEvents="none"/>
          <path d={boundaryPaths.coast} fill="none" stroke="#42647B" strokeOpacity=".7" strokeWidth="2.2" vectorEffect="non-scaling-stroke" pointerEvents="none"/>
          {world.countries.map(country => (
            <g key={country.id} pointerEvents="none">
              {lod >= 1 || country.largest ? <text x={country.centroid.x} y={country.centroid.y} textAnchor="middle"
                fill="#A8B5C7" opacity={lod === 0 ? ".32" : ".78"} fontSize="27" fontWeight="600" letterSpacing="2">{country.name.toUpperCase()}</text> : null}
            </g>
          ))}
          {world.cells.filter(cell => cell.owner === "player").map(cell => (
            <path key={cell.id} data-region-id={cell.id.replace("player-region-", "region-")} d={cell.path}
              fill={activeId === cell.id.replace("player-region-", "region-") ? "#1E5268" : "#122E46"}
              stroke="#2B6CB0" strokeWidth="1.4" strokeLinejoin="round"/>
          ))}
          <path d={boundaryPaths.player} fill="none" stroke="#38BDF8" strokeWidth="2.5" vectorEffect="non-scaling-stroke" pointerEvents="none"/>
          {world.playerRegions.map((shape, index) => {
            const region = regions[index]; if (!region) return null;
            const capital = index === 4, city = shape.centroid;
            return <g key={shape.id} pointerEvents="none">
              {activeId === shape.id ? <path d={shape.path} fill="#2A6076" fillOpacity=".32" stroke="#7DD3FC" strokeWidth="2.5" vectorEffect="non-scaling-stroke"/> : null}
              <circle cx={city.x} cy={city.y} r={capital ? 10 : 3.2} fill={capital ? "#F5C96B" : "#94A3B8"} stroke={capital ? "#FFF0B8" : "#CBD5E1"} strokeWidth={capital ? 2 : 1.2}/>
              {capital ? <><circle cx={city.x} cy={city.y} r="16" fill="none" stroke="#F5C96B" strokeWidth="2.4" className="capital-ring"/><circle cx={city.x} cy={city.y} r="23" fill="none" stroke="#F5C96B" strokeOpacity=".7" strokeWidth="1.5" className="capital-ring capital-ring-delay"/></> : null}
              {lod >= 2 || capital ? <text x={city.x} y={city.y + 18} textAnchor="middle" fill="#F8FAFC" fontSize="9.5" fontWeight="600"
                stroke="#060911" strokeWidth="8" paintOrder="stroke">{region.city}</text> : null}
            </g>;
          })}
        </g>
      </svg>
      <div className="absolute bottom-[88px] left-1/2 z-20 flex -translate-x-1/2 rounded-xl border border-slate-600/70 bg-slate-950/80 p-1 shadow-lg backdrop-blur-xl" onPointerDown={event => event.stopPropagation()}><button type="button" onClick={() => setMapMode("political")} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${mapMode === "political" ? "bg-cyan-600 text-white" : "text-slate-400"}`}>Политическая</button><button type="button" onClick={() => setMapMode("relations")} className={`rounded-lg px-3 py-2 text-[10px] font-bold ${mapMode === "relations" ? "bg-emerald-700 text-white" : "text-slate-400"}`}>Отношения</button></div>
      {mapMode === "relations" ? <div className="absolute left-1/2 bottom-[132px] z-20 -translate-x-1/2 rounded-lg border border-slate-700 bg-slate-950/85 px-3 py-1.5 text-[9px] text-slate-300"><div className="mb-1 flex justify-between"><span>−100</span><span>0</span><span>+100</span></div><div className="h-2 w-44 rounded-full" style={{ background: "linear-gradient(90deg, #ef4444 0%, #94a3b8 50%, #10b981 100%)" }} /></div> : null}

      <div className="map-zoom-indicator absolute bottom-28 left-4 z-10">{Math.round(view.zoom * 100)}%</div>
    </div>
  );
}
