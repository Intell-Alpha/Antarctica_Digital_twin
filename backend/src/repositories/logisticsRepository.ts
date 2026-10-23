import { LOGISTICS_INVENTORY, StationId, InventoryCategory } from "../store/digitalTwinStore";

export function getLogisticsByStation(stationId: StationId): InventoryCategory[] {
  return LOGISTICS_INVENTORY[stationId] || [];
}

export function getLogisticsMetrics(stationId: StationId) {
  const inventory = getLogisticsByStation(stationId);
  const fuelItem = inventory.find(i => i.name.includes("Fuel"));
  const fuelReserves = fuelItem?.currentStockUnits || 0;
  const dailyFuel = fuelItem?.dailyConsumptionUnits || 1;
  const fuelAutonomyDays = Math.round(fuelReserves / dailyFuel);
  
  return {
    inventory,
    fuelAutonomyDays,
    totalItems: inventory.length
  };
}
