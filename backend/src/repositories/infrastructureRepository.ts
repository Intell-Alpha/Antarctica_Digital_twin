import { INFRASTRUCTURE_DATA, StationId, InfrastructureAsset } from "../store/digitalTwinStore";

export function getInfrastructureByStation(stationId: StationId): InfrastructureAsset[] {
  return INFRASTRUCTURE_DATA[stationId] || [];
}

export function getInfrastructureMetrics(stationId: StationId) {
  const assets = getInfrastructureByStation(stationId);
  const overallConditionScore = assets.length > 0 
    ? assets.reduce((sum, a) => sum + a.conditionScore, 0) / assets.length 
    : 88;
  
  return {
    overallConditionScore,
    assets
  };
}
