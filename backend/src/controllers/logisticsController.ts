import { Request, Response } from "express";
import { LOGISTICS_INVENTORY, StationId } from "../store/digitalTwinStore";

export const getLogistics = (req: Request, res: Response) => {
  const stationId = (req.query.station as string)?.toUpperCase() as StationId || "BHARATI";
  const inventory = LOGISTICS_INVENTORY[stationId] || [];
  const fuelReserves = inventory[0]?.currentStockUnits || 0;
  const dailyFuel = inventory[0]?.dailyConsumptionUnits || 1;
  const fuelAutonomyDays = Math.round(fuelReserves / dailyFuel);

  res.json({
    success: true,
    stationId,
    metrics: {
      fuelReservesL: fuelReserves,
      dailyFuelConsumptionL: dailyFuel,
      fuelAutonomyDays,
      survivabilityDays: fuelAutonomyDays,
      resupplyWindow:
        stationId === "BHARATI"
          ? "Austral Summer Sea Route (Cape Town) & Air Route (DROMLAN)"
          : "DROMLAN Air & Ice Route"
    },
    inventory
  });
};
