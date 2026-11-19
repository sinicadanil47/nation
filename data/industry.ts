import type { EnterpriseType, IndustrySector } from "@/types/game";

export const enterpriseTypes: EnterpriseType[] = [
  { id: "datacenter", name: "Дата-центр", sector: "digital", buildCost: 120, incomePerSecond: .018, energyMW: 85, jobs: 42, specialization: "Технологии", description: "Облачные платформы, вычисления и хранение данных." },
  { id: "outsourcing", name: "Центр аутсорсинга", sector: "logistics", buildCost: 72, incomePerSecond: .012, energyMW: 12, jobs: 180, specialization: "Технологии", description: "Экспорт цифровых услуг и распределённые операционные центры." },
  { id: "machine_tools", name: "Машиностроительный завод", sector: "engineering", buildCost: 145, incomePerSecond: .024, energyMW: 72, jobs: 390, specialization: "Машиностроение", description: "Станки, промышленные линии и точное оборудование." },
  { id: "metallurgy", name: "Металлургический комбинат", sector: "metallurgy", buildCost: 160, incomePerSecond: .026, energyMW: 145, jobs: 520, specialization: "Машиностроение", description: "Выплавка стали, сплавов и цветных металлов." },
  { id: "lithium", name: "Литиевый энергетический рудник", sector: "energy", buildCost: 95, incomePerSecond: .014, energyMW: 28, jobs: 230, specialization: "Энергетика", description: "Добыча сырья для накопителей и энергетических систем." },
  { id: "power_plant", name: "Энергетический комплекс", sector: "energy", buildCost: 175, incomePerSecond: .029, energyMW: -180, jobs: 210, specialization: "Энергетика", description: "Генерация и поставка электроэнергии промышленности." },
  { id: "chemical", name: "Химический завод", sector: "chemical", buildCost: 130, incomePerSecond: .021, energyMW: 95, jobs: 310, specialization: "Энергетика", description: "Полимеры, удобрения и промышленные реагенты." },
  { id: "agro", name: "Агропромышленный комплекс", sector: "agro", buildCost: 88, incomePerSecond: .016, energyMW: 24, jobs: 440, specialization: "Сельское хозяйство", description: "Выращивание, переработка и хранение продовольствия." },
  { id: "pharma", name: "Фармацевтика и биотех", sector: "biotech", buildCost: 125, incomePerSecond: .022, energyMW: 38, jobs: 280, specialization: "Технологии", description: "Лекарственные препараты, вакцины и биотехнологии." },
  { id: "drones", name: "Завод дронов доставки", sector: "logistics", buildCost: 115, incomePerSecond: .023, energyMW: 34, jobs: 260, specialization: "Логистика", description: "Беспилотная логистика и автоматизация грузовых маршрутов." },
  { id: "logistics", name: "Логистический терминал", sector: "logistics", buildCost: 105, incomePerSecond: .019, energyMW: 30, jobs: 350, specialization: "Логистика", description: "Складские хабы, грузовые узлы и транспортные коридоры." },
  { id: "heavy", name: "Тяжёлое машиностроение", sector: "engineering", buildCost: 185, incomePerSecond: .031, energyMW: 130, jobs: 610, specialization: "Машиностроение", description: "Тяжёлые машины, турбины и производственные комплексы." },
];
export const industrySectorOrder: IndustrySector[] = ["digital","engineering","metallurgy","energy","chemical","agro","biotech","logistics"];
export function getEnterpriseBuildCost(type: EnterpriseType, purchaseCount: number): number {
  return type.buildCost * Math.pow(1.1, Math.max(0, Math.floor(purchaseCount)));
}
