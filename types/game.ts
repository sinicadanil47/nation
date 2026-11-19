export type Speed = 0 | 1 | 2 | 5;
export type TaxKey = "vat" | "income" | "profit";
export type RegionLevelKey = "infrastructure" | "economy" | "medicine" | "education";
export type MinistryId =
  | "industry"
  | "parliament"
  | "media"
  | "health"
  | "education"
  | "security"
  | "defense"
  | "projects";

export interface City {
  name: string;
  x: number;
  y: number;
  size: number;
}

export interface Region {
  id: string;
  name: string;
  city: string;
  population: number;
  incomePerHour: number;
  infrastructure: number;
  economy: number;
  medicine: number;
  education: number;
  specialization: string;
  freeLand: number;
  polygon: string;
  cities: City[];
}

export interface Budget {
  treasury: number;
  incomePerHour: number;
  expensesPerHour: number;
  taxRevenue: number;
  ministryExpenses: number;
  debt: number;
}

export interface Taxes {
  vat: number;
  income: number;
  profit: number;
  shadowEconomy: number;
  collectionRate: number;
}

export interface Energy {
  generationGW: number;
  consumptionGW: number;
  deficitGW: number;
  plants: number;
  storageGWh: number;
}

export interface Ministry {
  id: MinistryId;
  name: string;
  expensePerHour: number;
  level: number;
  color: string;
  fundingPercent: number;
  performance: number;
}

export interface EventItem {
  id: string;
  text: string;
  hour: number;
  tone: "good" | "warn" | "bad" | "info";
}

export interface Decree {
  id: string;
  title: string;
  description: string;
  effect: "economy" | "energy" | "health" | "trust";
  cooldown: number;
}

export interface GameState {
  country: string;
  day: number;
  hour: number;
  speed: Speed;
  rating: number;
  population: number;
  budget: Budget;
  taxes: Taxes;
  energy: Energy;
  regions: Region[];
  ministries: Ministry[];
  events: EventItem[];
  decrees: Decree[];
  decreeCooldowns: Record<string, number>;
  constructionTeams: number;
  lastTick: number;
  hydrated: boolean;
}

export interface MinistryFundingResult {
  ministryId: MinistryId;
  fundingPercent: number;
}
