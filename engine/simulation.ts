import type { GameState } from "@/types/game";

export function simulateTick(state: GameState): GameState {
  const tax = state.taxes;
  const regionalBaseIncome = state.regions.reduce(
    (total, region) => total + region.incomePerHour,
    0,
  );

  const taxPressure =
    (tax.vat + tax.income + tax.profit) / 3;
  const shadowEconomy = Math.max(
    5,
    Math.min(55, 18 + (taxPressure - 17.7) * 0.85),
  );
  const collectionRate = Math.max(
    45,
    Math.min(98, 100 - shadowEconomy * 0.72),
  );
  const taxRevenue =
    regionalBaseIncome *
    (collectionRate / 86) *
    (1 - (shadowEconomy - 18) / 180);

  const ministryExpenses = state.ministries.reduce(
    (total, ministry) =>
      total +
      ministry.expensePerHour * (ministry.fundingPercent / 100),
    0,
  );
  const energyDeficit = Math.max(
    0,
    state.energy.consumptionGW - state.energy.generationGW,
  );
  const energyPenalty =
    energyDeficit > 0
      ? Math.min(
          0.45,
          energyDeficit / Math.max(1, state.energy.consumptionGW) * 0.8,
        )
      : 0;
  const incomePerHour = taxRevenue * (1 - energyPenalty);
  const expensesPerHour = ministryExpenses + energyDeficit * 0.12;
  const treasury = Math.max(
    0,
    state.budget.treasury + incomePerHour - expensesPerHour,
  );

  const averagePublicServices =
    state.regions.reduce(
      (total, region) =>
        total +
        region.infrastructure +
        region.medicine +
        region.education,
      0,
    ) /
    (state.regions.length * 3);
  const serviceDelta = (averagePublicServices - 4) * 0.08;
  const fiscalDelta = Math.max(-0.8, Math.min(0.8, incomePerHour - expensesPerHour)) * 0.035;
  const energyDelta = energyDeficit > 0 ? -energyDeficit * 0.09 : 0.04;
  const taxDelta = Math.abs(taxPressure - 17.7) * -0.012;
  const rating = Math.max(
    0,
    Math.min(100, state.rating + fiscalDelta + energyDelta + serviceDelta + taxDelta),
  );

  const nextHour = state.hour + 1;
  const day = state.day + (nextHour >= 24 ? 1 : 0);
  const hour = nextHour % 24;
  const events = [...state.events];

  if (energyDeficit > 0 && state.hour % 6 === 0) {
    events.unshift({
      id: `energy-${day}-${hour}`,
      text: `Дефицит электроэнергии достиг ${energyDeficit.toFixed(1)} ГВт. Экономическая активность замедляется.`,
      hour,
      tone: "bad",
    });
  }

  if (hour === 0) {
    events.unshift({
      id: `day-${day}`,
      text: `Начался ${day}-й день управления. Казначейство подвело итоги суток.`,
      hour,
      tone: "info",
    });
  }

  const decreeCooldowns = Object.fromEntries(
    Object.entries(state.decreeCooldowns).map(([id, remaining]) => [
      id,
      Math.max(0, remaining - 1),
    ]),
  );

  return {
    ...state,
    day,
    hour,
    lastTick: Date.now(),
    rating,
    budget: {
      ...state.budget,
      treasury,
      incomePerHour,
      expensesPerHour,
      taxRevenue,
      ministryExpenses,
    },
    taxes: {
      ...tax,
      shadowEconomy,
      collectionRate,
    },
    energy: {
      ...state.energy,
      deficitGW: energyDeficit,
    },
    decreeCooldowns,
    events: events.slice(0, 12),
  };
}
