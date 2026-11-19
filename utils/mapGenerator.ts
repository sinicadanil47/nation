import { Delaunay } from "d3-delaunay";
import { worldCountries } from "@/data/worldCountries";

export interface MapPoint { x: number; y: number }
export interface MapCell {
  id: string;
  points: MapPoint[];
  path: string;
  owner: "player" | "foreign";
  countryId?: string;
  fill: string;
  centroid: MapPoint;
  area: number;
  neighbors: number[];\n  siteIndex: number;
}
export interface PlayerMapRegion { id: string; path: string; centroid: MapPoint; area: number }
export interface GeneratedCountry extends (typeof worldCountries)[number] {
  path: string;
  centroid: MapPoint;
  area: number;
  cellCount: number;
  largest: boolean;
}
export interface GeneratedMap {
  width: number;
  height: number;
  cells: MapCell[];
  playerRegions: PlayerMapRegion[];
  countries: GeneratedCountry[];
  playerBounds: { x: number; y: number; width: number; height: number; centerX: number; centerY: number };
}

const WIDTH = 4400;
const HEIGHT = 2600;
const SITE_COUNT = 900;
const PLAYER_REGION_COUNT = 14;
const COUNTRY_COUNT = 62;
const PALETTE = ["#0F1624", "#121A29", "#151E2F", "#182235", "#111927", "#1A2438", "#141D2D", "#101827"];
const hash = (value: string): number => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) { h ^= value.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
};
const random = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) >>> 0;
  let t = seed;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pointKey = (p: MapPoint) => Math.round(p.x * 100) + "," + Math.round(p.y * 100);
const edgeKey = (a: MapPoint, b: MapPoint) => {
  const ka = pointKey(a), kb = pointKey(b);
  return ka < kb ? ka + "|" + kb : kb + "|" + ka;
};

function polygonMetrics(points: MapPoint[]) {
  let twiceArea = 0, cx = 0, cy = 0;
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i], b = points[(i + 1) % points.length];
    const cross = a.x * b.y - b.x * a.y;
    twiceArea += cross; cx += (a.x + b.x) * cross; cy += (a.y + b.y) * cross;
  }
  if (Math.abs(twiceArea) < 1e-7) {
    return { area: 0, centroid: { x: points.reduce((s, p) => s + p.x, 0) / points.length, y: points.reduce((s, p) => s + p.y, 0) / points.length } };
  }
  return { area: Math.abs(twiceArea / 2), centroid: { x: cx / (3 * twiceArea), y: cy / (3 * twiceArea) } };
}

function elevation(p: MapPoint): number {
  const x = p.x / WIDTH, y = p.y / HEIGHT;
  const continents = [
    { x: .17, y: .31, rx: .17, ry: .27, weight: 1.08 },
    { x: .46, y: .52, rx: .205, ry: .31, weight: 1.12 },
    { x: .77, y: .32, rx: .145, ry: .235, weight: 1.08 },
    { x: .76, y: .79, rx: .19, ry: .135, weight: 1.02 },
    { x: .34, y: .84, rx: .075, ry: .105, weight: .96 },
  ];
  let landMass = -1;
  for (const c of continents) {
    const d = Math.sqrt(((x - c.x) / c.rx) ** 2 + ((y - c.y) / c.ry) ** 2);
    landMass = Math.max(landMass, (1 - d) * c.weight);
  }
  const noise =
    .105 * Math.sin(x * 37 + Math.sin(y * 17) * 2.2) +
    .062 * Math.sin(y * 61 + x * 23) +
    .035 * Math.cos(x * 113 - y * 79) +
    .018 * Math.sin((x + y) * 191);
  const innerSea = (((x - .665) / .075) ** 2 + ((y - .48) / .12) ** 2) < 1;
  const westernGulf = (((x - .30) / .035) ** 2 + ((y - .49) / .19) ** 2) < 1;
  const northernStrait = (((x - .53) / .13) ** 2 + ((y - .16) / .035) ** 2) < 1;
  const archipelago = Math.sin(x * 180) * Math.cos(y * 145) > .35 && landMass > -.10;
  if (innerSea || westernGulf || northernStrait) return -1;
  return landMass + noise + (archipelago ? .075 : 0);
}

function relaxSites(seed: number): MapPoint[] {
  const rand = random(seed);
  const cols = 30, rows = 30;
  let sites: MapPoint[] = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      sites.push({
        x: (col + .5 + (rand() - .5) * .58) * WIDTH / cols,
        y: (row + .5 + (rand() - .5) * .58) * HEIGHT / rows,
      });
    }
  }
  for (let iteration = 0; iteration < 2; iteration += 1) {
    const delaunay = Delaunay.from(sites, p => p.x, p => p.y);
    const voronoi = delaunay.voronoi([0, 0, WIDTH, HEIGHT]);
    sites = sites.map((site, index) => {
      const polygon = voronoi.cellPolygon(index);
      if (!polygon || polygon.length < 3) return site;
      const points = Array.from(polygon).slice(0, -1).map(([x, y]) => ({ x, y }));
      return polygonMetrics(points).centroid;
    });
  }
  return sites;
}

function buildCountryAssignments(landIds: number[], neighbors: number[][], playerIds: number[], sites: MapPoint[]) {
  const landSet = new Set(landIds), playerSet = new Set(playerIds);
  const available = landIds.filter(id => !playerSet.has(id));
  const anchors: number[] = [];
  if (available.length < COUNTRY_COUNT * 6) throw new Error("World generation produced too few land cells for 62 countries.");
  anchors.push(available.reduce((best, id) =>
    Math.hypot(sites[id].x - WIDTH * .49, sites[id].y - HEIGHT * .48) <
    Math.hypot(sites[best].x - WIDTH * .49, sites[best].y - HEIGHT * .48) ? id : best, available[0]));
  while (anchors.length < COUNTRY_COUNT) {
    let chosen = available.find(id => !anchors.includes(id)) ?? available[0], bestDistance = -1;
    for (const id of available) {
      if (anchors.includes(id)) continue;
      const nearest = Math.min(...anchors.map(anchor => Math.hypot(sites[id].x - sites[anchor].x, sites[id].y - sites[anchor].y)));
      if (nearest > bestDistance) { bestDistance = nearest; chosen = id; }
    }
    anchors.push(chosen);
  }
  const owner = new Map<number, number>();
  const territories: number[][] = anchors.map((id, countryIndex) => { owner.set(id, countryIndex); return [id]; });
  const targetBase = Math.floor(available.length / COUNTRY_COUNT);
  const targetExtra = available.length % COUNTRY_COUNT;
  const targets = anchors.map((_, i) => Math.min(15, Math.max(6, targetBase + (i < targetExtra ? 1 : 0))));
  let changed = true;
  while (changed) {
    changed = false;
    for (let countryIndex = 0; countryIndex < territories.length; countryIndex += 1) {
      const territory = territories[countryIndex];
      if (territory.length >= targets[countryIndex]) continue;
      const frontier = new Set<number>();
      for (const id of territory) for (const neighbor of neighbors[id]) {
        if (landSet.has(neighbor) && !owner.has(neighbor)) frontier.add(neighbor);
      }
      const next = [...frontier].sort((a, b) =>
        Math.hypot(sites[a].x - sites[anchors[countryIndex]].x, sites[a].y - sites[anchors[countryIndex]].y) -
        Math.hypot(sites[b].x - sites[anchors[countryIndex]].x, sites[b].y - sites[anchors[countryIndex]].y))[0];
      if (next !== undefined) { owner.set(next, countryIndex); territory.push(next); changed = true; }
    }
  }
  // Any remainder is attached to the closest territory with available capacity.
  for (const id of available) {
    if (owner.has(id)) continue;
    let best = -1, distance = Infinity;
    territories.forEach((territory, index) => {
      if (territory.length >= 15) return;
      const d = Math.hypot(sites[id].x - sites[anchors[index]].x, sites[id].y - sites[anchors[index]].y);
      if (d < distance) { distance = d; best = index; }
    });
    if (best >= 0) { owner.set(id, best); territories[best].push(id); }
  }
  return { owner, territories, anchors };
}

export function generateMap(seed = 20261119): GeneratedMap {
  const sites = relaxSites(seed);
  const delaunay = Delaunay.from(sites, p => p.x, p => p.y);
  const voronoi = delaunay.voronoi([0, 0, WIDTH, HEIGHT]);
  const polygons: MapPoint[][] = sites.map((_, index) => {
    const polygon = voronoi.cellPolygon(index);
    return polygon ? Array.from(polygon).slice(0, -1).map(([x, y]) => ({ x, y })) : [];
  });
  const metrics = polygons.map(polygonMetrics);
  const neighbors = sites.map((_, index) => Array.from(delaunay.neighbors(index)));
  const landIds = sites.map((site, index) => elevation(metrics[index].centroid) > .015 ? index : -1).filter(index => index >= 0);
  const centerCandidates = landIds.filter(id => elevation(metrics[id].centroid) > .09);
  const playerStart = centerCandidates.reduce((best, id) =>
    Math.hypot(sites[id].x - WIDTH * .47, sites[id].y - HEIGHT * .51) <
    Math.hypot(sites[best].x - WIDTH * .47, sites[best].y - HEIGHT * .51) ? id : best, centerCandidates[0] ?? landIds[0]);
  const playerIds = [playerStart], playerSet = new Set(playerIds), frontier = [playerStart];
  while (frontier.length && playerIds.length < PLAYER_REGION_COUNT) {
    const current = frontier.shift()!;
    const candidates = neighbors[current].filter(id => landIds.includes(id) && !playerSet.has(id));
    candidates.sort((a, b) => {
      const scoreA = Math.abs(sites[a].x - WIDTH * .47) + Math.abs(sites[a].y - HEIGHT * .51);
      const scoreB = Math.abs(sites[b].x - WIDTH * .47) + Math.abs(sites[b].y - HEIGHT * .51);
      return scoreA - scoreB;
    });
    for (const next of candidates) {
      playerSet.add(next); playerIds.push(next); frontier.push(next);
      if (playerIds.length === PLAYER_REGION_COUNT) break;
    }
  }
  if (playerIds.length !== PLAYER_REGION_COUNT) throw new Error("Unable to form 14 contiguous player regions.");
  const assignments = buildCountryAssignments(landIds, neighbors, playerIds, sites);
  const countryByCell = assignments.owner;
  const cellPath = (id: number) => polygons[id].length >= 3
    ? "M" + polygons[id].map(p => p.x.toFixed(2) + " " + p.y.toFixed(2)).join(" L") + " Z" : "";
  const playerRegions: PlayerMapRegion[] = playerIds.map((id, index) => ({
    id: "region-" + (index + 1), path: cellPath(id), centroid: metrics[id].centroid, area: metrics[id].area,
  }));
  const countryCells = assignments.territories.map(ids => ids.map(cellPath).join(" "));
  const countries: GeneratedCountry[] = worldCountries.slice(0, COUNTRY_COUNT).map((country, index) => {
    const ids = assignments.territories[index];
    const area = ids.reduce((sum, id) => sum + metrics[id].area, 0) || 1;
    return {
      ...country, path: countryCells[index],
      centroid: { x: ids.reduce((sum, id) => sum + metrics[id].centroid.x * metrics[id].area, 0) / area,
        y: ids.reduce((sum, id) => sum + metrics[id].centroid.y * metrics[id].area, 0) / area },
      area, cellCount: ids.length, largest: index < 12,
    };
  });
  const cells: MapCell[] = [];
  for (const id of landIds) {
    const isPlayer = playerSet.has(id), ownerIndex = countryByCell.get(id);
    cells.push({
      id: isPlayer ? "player-region-" + (playerIds.indexOf(id) + 1) : "foreign-cell-" + id,
      points: polygons[id], path: cellPath(id), owner: isPlayer ? "player" : "foreign",
      countryId: isPlayer ? undefined : worldCountries[ownerIndex ?? 0].id,
      fill: isPlayer ? "#122E46" : PALETTE[(ownerIndex ?? 0) % PALETTE.length],
      centroid: metrics[id].centroid, area: metrics[id].area, neighbors: neighbors[id], siteIndex: id,
    });
  }
  const playerPoints = playerIds.flatMap(id => polygons[id]);
  const minX = Math.min(...playerPoints.map(p => p.x)), maxX = Math.max(...playerPoints.map(p => p.x));
  const minY = Math.min(...playerPoints.map(p => p.y)), maxY = Math.max(...playerPoints.map(p => p.y));
  return {
    width: WIDTH, height: HEIGHT, cells, playerRegions, countries,
    playerBounds: { x: minX, y: minY, width: maxX - minX, height: maxY - minY, centerX: (minX + maxX) / 2, centerY: (minY + maxY) / 2 },
  };
}
