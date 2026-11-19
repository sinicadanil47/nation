"use client";

import { useSyncExternalStore } from "react";
import { initialWorld } from "@/data/initialWorld";
import { simulateTick } from "@/engine/simulation";
import type {
  GameState,
  MinistryId,
  RegionLevelKey,
  Speed,
  TaxKey,
} from "@/types/game";

const STORAGE_KEY = "nation-mobile-strategy-v1";
const listeners = new Set<() => void>();

let state: GameState = initialWorld;
let initialized = false;

function notify(): void {
  listeners.forEach((listener) => listener());

  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...state, hydrated: false }),
    );
  } catch {
    // The game remains playable when storage is unavailable or full.
  }
}

function hydrate(): void {
  if (initialized || typeof window === "undefined") {
    return;
  }

  initialized = true;

  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (saved) {
      const parsed = JSON.parse(saved) as Partial<GameState>;

      if (
        parsed.regions?.length === 14 &&
        parsed.budget &&
        parsed.taxes &&
        parsed.energy &&
        parsed.ministries
      ) {
        state = {
          ...initialWorld,
          ...parsed,
          hydrated: true,
        };
      } else {
        state = { ...initialWorld, hydrated: true };
      }
    } else {
      state = { ...initialWorld, hydrated: true };
    }
  } catch {
    state = { ...initialWorld, hydrated: true };
  }

  listeners.forEach((listener) => listener());
}

export const gameActions = {
  initialize: hydrate,

  tick(): void {
    state = simulateTick(state);
    notify();
  },

  setSpeed(speed: Speed): void {
    state = { ...state, speed };
    notify();
  },

  reset(): void {
    state = {
      ...initialWorld,
      hydrated: true,
      lastTick: Date.now(),
    };
    notify();
  },

  updateTax(key: TaxKey, value: number): void {
    const taxes = {
      ...state.taxes,
      [key]: Math.max(0, Math.min(45, value)),
    };
    const averageRate = (taxes.vat + taxes.income + taxes.profit) / 3;

    taxes.shadowEconomy = Math.max(
      5,
      Math.min(55, 18 + (averageRate - 17.7) * 0.85),
    );

    state = { ...state, taxes };
    notify();
  },

  upgradeRegion(regionId: string, field: RegionLevelKey): void {
    const region = state.regions.find((item) => item.id === regionId);

    if (
      !region ||
      state.constructionTeams <= 0 ||
      state.budget.treasury < 12 ||
      region[field] >= 10
    ) {
      return;
    }

    state = {
      ...state,
      constructionTeams: state.constructionTeams - 1,
      budget: {
        ...state.budget,
        treasury: state.budget.treasury - 12,
      },
      regions: state.regions.map((item) =>
        item.id === regionId
          ? { ...item, [field]: item[field] + 1 }
          : item,
      ),
    };
    notify();
  },

  buildPlant(): void {
    if (state.budget.treasury < 35) {
      return;
    }

    state = {
      ...state,
      budget: {
        ...state.budget,
        treasury: state.budget.treasury - 35,
      },
      energy: {
        ...state.energy,
        generationGW: state.energy.generationGW + 4,
        plants: state.energy.plants + 1,
      },
    };
    notify();
  },

  buildStorage(): void {
    if (state.budget.treasury < 18) {
      return;
    }

    state = {
      ...state,
      budget: {
        ...state.budget,
        treasury: state.budget.treasury - 18,
      },
      energy: {
        ...state.energy,
        storageGWh: state.energy.storageGWh + 8,
      },
    };
    notify();
  },

  setMinistryFunding(ministryId: MinistryId, fundingPercent: number): void {
    const safeFunding = Math.max(50, Math.min(150, fundingPercent));

    state = {
      ...state,
      ministries: state.ministries.map((ministry) =>
        ministry.id === ministryId
          ? { ...ministry, fundingPercent: safeFunding }
          : ministry,
      ),
    };
    notify();
  },

  issueDecree(decreeId: string): void {
    const decree = state.decrees.find((item) => item.id === decreeId);

    if (!decree || (state.decreeCooldowns[decreeId] ?? 0) > 0) {
      return;
    }

    let rating = state.rating;
    let budget = state.budget;
    let energy = state.energy;

    if (decree.effect === "trust") {
      rating = Math.min(100, rating + 4);
    }

    if (decree.effect === "health") {
      rating = Math.min(100, rating + 2);
    }

    if (decree.effect === "economy") {
      budget = {
        ...budget,
        incomePerHour: budget.incomePerHour * 1.08,
      };
    }

    if (decree.effect === "energy") {
      energy = {
        ...energy,
        consumptionGW: energy.consumptionGW * 0.95,
      };
    }

    state = {
      ...state,
      rating,
      budget,
      energy,
      decreeCooldowns: {
        ...state.decreeCooldowns,
        [decreeId]: decree.cooldown,
      },
      events: [
        {
          id: `decree-${decreeId}-${Date.now()}`,
          text: `Издан указ: «${decree.title}».`,
          hour: state.hour,
          tone: "good" as const,
        },
        ...state.events,
      ].slice(0, 12),
    };
    notify();
  },

  publishAddress(message: string): void {
    const trimmed = message.trim();

    if (!trimmed) {
      return;
    }

    state = {
      ...state,
      rating: Math.min(100, state.rating + 1),
      events: [
        {
          id: `address-${Date.now()}`,
          text: `Обращение Президента: «${trimmed.slice(0, 110)}»`,
          hour: state.hour,
          tone: "good" as const,
        },
        ...state.events,
      ].slice(0, 12),
    };
    notify();
  },
};

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): GameState {
  return state;
}

function getServerSnapshot(): GameState {
  return initialWorld;
}

export function useGameStore(): GameState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
