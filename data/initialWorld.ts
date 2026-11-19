import type { Decree, GameState, Ministry, Region } from "@/types/game";
import { generateMap } from "@/utils/mapGenerator";
const generatedMap = generateMap();

const regionShapes = generatedMap.regions;

const regionNames = [
  "Северный край",
  "Белогорье",
  "Озёрный округ",
  "Западная марка",
  "Столичный регион",
  "Восточные ворота",
  "Приозёрье",
  "Центральные равнины",
  "Верхняя долина",
  "Восточная степь",
  "Южный берег",
  "Агропояс",
  "Индустриальный юг",
  "Каспийский край",
];

const cityNames = [
  "Северск",
  "Белоград",
  "Озёрск",
  "Вестбург",
  "Нордград",
  "Восточный",
  "Ладога",
  "Центроград",
  "Долинск",
  "Степноград",
  "Южный порт",
  "Зерноград",
  "Металлург",
  "Каспийск",
];

const regionCenter = (shape: string) => { const [x, y] = shape.split(",").map(Number); return { x, y }; };

export const initialRegions: Region[] = regionNames.map((name, index) => ({
  id: `region-${index + 1}`,
  name,
  city: cityNames[index],
  population: Number((1.55 + (index % 4) * 0.47).toFixed(2)),
  incomePerHour: 0.886 + (index % 5) * 0.2,
  infrastructure: 2 + (index % 3),
  economy: 2 + (index % 4),
  medicine: 2 + (index % 3),
  education: 2 + (index % 4),
  specialization: [
    "Логистика",
    "Технологии",
    "Туризм",
    "Сельское хозяйство",
    "Финансы",
    "Машиностроение",
    "Энергетика",
  ][index % 7],
  freeLand: 18 + (index % 6) * 7,
  polygon: regionShapes[index],
  cities: [
    {
      name: cityNames[index],
      x: regionCenter(regionShapes[index]).x,
      y: regionCenter(regionShapes[index]).y,
      size: index === 4 ? 7 : 4,
    },
    {
      name: `${cityNames[index]}-2`,
      x: 150 + (index % 4) * 60,
      y: 105 + Math.floor(index / 4) * 105,
      size: 3,
    },
  ],
}));

export const initialMinistries: Ministry[] = [
  { id: "economy", name: "Экономика и налоги", expensePerHour: 1.1, level: 3, color: "amber", fundingPercent: 100, performance: 74 },
  { id: "energy", name: "Энергетика", expensePerHour: 1.4, level: 3, color: "yellow", fundingPercent: 100, performance: 79 },
  { id: "regions", name: "Регионы", expensePerHour: 0.8, level: 2, color: "cyan", fundingPercent: 100, performance: 70 },
  { id: "president", name: "Офис Президента", expensePerHour: 0.5, level: 3, color: "violet", fundingPercent: 100, performance: 76 },
  { id: "industry", name: "Промышленность", expensePerHour: 1.2, level: 2, color: "orange", fundingPercent: 100, performance: 68 },
  { id: "parliament", name: "Парламент", expensePerHour: 0.6, level: 2, color: "blue", fundingPercent: 100, performance: 72 },
  { id: "media", name: "Медиа", expensePerHour: 0.4, level: 2, color: "pink", fundingPercent: 100, performance: 64 },
  { id: "health", name: "Здоровье", expensePerHour: 1.5, level: 3, color: "rose", fundingPercent: 100, performance: 78 },
  { id: "education", name: "Образование", expensePerHour: 1.2, level: 3, color: "indigo", fundingPercent: 100, performance: 76 },
  { id: "security", name: "Безопасность и МВД", expensePerHour: 1.0, level: 2, color: "slate", fundingPercent: 100, performance: 73 },
  { id: "defense", name: "Силы обороны", expensePerHour: 1.1, level: 3, color: "emerald", fundingPercent: 100, performance: 81 },
  { id: "projects", name: "Нацпроекты", expensePerHour: 0.4, level: 1, color: "teal", fundingPercent: 100, performance: 55 },
];

export const initialDecrees: Decree[] = [
  {
    id: "growth",
    title: "План ускоренного роста",
    description: "Стимулирование малого бизнеса повышает доходы экономики на 8% на 72 часа.",
    effect: "economy",
    cooldown: 15,
  },
  {
    id: "grid",
    title: "Энергетическая модернизация",
    description: "Оптимизация сетей снижает потребление на 5% на 48 часов.",
    effect: "energy",
    cooldown: 20,
  },
  {
    id: "clinics",
    title: "Здоровье нации",
    description: "Экстренное финансирование медицины повышает общественное доверие.",
    effect: "health",
    cooldown: 25,
  },
  {
    id: "address",
    title: "Обращение к гражданам",
    description: "Публичный отчёт и обращение к гражданам повышают рейтинг.",
    effect: "trust",
    cooldown: 30,
  },
];

export const initialWorld: GameState = {
  country: "Республика Нордланд",
  day: 1,
  hour: 8,
  minute: 0,
  speed: 1,
  rating: 74,
  population: 33.6,
  budget: {
    treasury: 1250,
    incomePerHour: 18.4,
    expensesPerHour: 11.2,
    taxRevenue: 18.4,
    ministryExpenses: 11.2,
    debt: 0,
  },
  taxes: {
    vat: 20,
    income: 13,
    profit: 20,
    shadowEconomy: 18,
    collectionRate: 86,
  },
  energy: {
    generationGW: 42,
    consumptionGW: 36,
    deficitGW: 0,
    plants: 8,
    storageGWh: 12,
  },
  regions: initialRegions,
  ministries: initialMinistries,
  events: [
    {
      id: "event-1",
      text: "Правительство утвердило программу модернизации транспортных коридоров.",
      hour: 8,
      tone: "good",
    },
    {
      id: "event-2",
      text: "Энергосистема работает с резервом мощности.",
      hour: 7,
      tone: "info",
    },
  ],
  decrees: initialDecrees,
  decreeCooldowns: {},
  constructionTeams: 3,
  lastTickAt: 0,
  elapsedGameSeconds: 0,
  second: 0,
  constructions: [],
  offlineSummary: null,
  hydrated: false,
};
