import type { CarConfig, UpgradeLevels, UpgradeType } from '../sim/types';

export type CarId = 'comet-r' | 'apex-rs';
export interface CarDefinition { id: CarId; name: string; price: number; tagline: string; config: CarConfig; }

export const BASE_CAR: CarConfig = {
  name: 'Comet R', massKg: 1280, wheelRadiusM: 0.315, finalDrive: 3.9,
  gearRatios: [3.1, 2.05, 1.46, 1.12, 0.89], drivetrainEfficiency: 0.86,
  dragCoefficient: 0.33, frontalAreaM2: 2.0, rollingResistance: 0.014,
  gripCoefficient: 1.05, idleRpm: 900, redlineRpm: 7200, shiftTimeS: 0.15,
  nitroForceN: 2200, nitroCapacityS: 3.5,
  torqueCurve: [[900, 175], [2200, 240], [3800, 295], [5200, 280], [6500, 240], [7200, 190]],
};

export const APEX_RS: CarConfig = {
  name: 'Apex RS', massKg: 1160, wheelRadiusM: 0.325, finalDrive: 3.62,
  gearRatios: [3.18, 2.19, 1.59, 1.23, 1.0, 0.82], drivetrainEfficiency: 0.9,
  dragCoefficient: 0.29, frontalAreaM2: 1.86, rollingResistance: 0.013,
  gripCoefficient: 1.18, idleRpm: 950, redlineRpm: 8200, shiftTimeS: 0.12,
  nitroForceN: 2500, nitroCapacityS: 3.5,
  torqueCurve: [[950, 215], [2500, 305], [4200, 370], [6000, 410], [7400, 390], [8200, 325]],
};

export const CARS: Record<CarId, CarDefinition> = {
  'comet-r': { id: 'comet-r', name: 'Comet R', price: 0, tagline: 'Balanced street racer', config: BASE_CAR },
  'apex-rs': { id: 'apex-rs', name: 'Apex RS', price: 25000, tagline: 'Rear-engine precision', config: APEX_RS },
};

export const UPGRADE_INFO: Record<UpgradeType, { label: string; baseCost: number; description: string }> = {
  engine: { label: 'Engine', baseCost: 900, description: '+7% torque' },
  turbo: { label: 'Turbo', baseCost: 1100, description: '+high-RPM power' },
  nitro: { label: 'NOS System', baseCost: 1250, description: '+12% boost · +0.4 s capacity' },
  tires: { label: 'Tires', baseCost: 700, description: '+8% grip' },
  gearbox: { label: 'Gearbox', baseCost: 800, description: 'faster shifts' },
  weight: { label: 'Weight', baseCost: 950, description: '−35 kg' },
};

export const MAX_UPGRADE_LEVEL = 5;
export const upgradeCost = (type: UpgradeType, level: number) => Math.round(UPGRADE_INFO[type].baseCost * (1 + level * 0.75));

export function buildCar(levels: UpgradeLevels, carId: CarId = 'comet-r'): CarConfig {
  const base = CARS[carId].config;
  const engine = 1 + levels.engine * 0.07;
  const turbo = levels.turbo;
  return {
    ...base,
    massKg: base.massKg - levels.weight * 35,
    gripCoefficient: base.gripCoefficient * (1 + levels.tires * 0.08),
    shiftTimeS: Math.max(0.055, base.shiftTimeS - levels.gearbox * 0.018),
    nitroCapacityS: base.nitroCapacityS + levels.nitro * 0.4,
    nitroForceN: base.nitroForceN * (1 + turbo * 0.03 + levels.nitro * 0.12),
    torqueCurve: base.torqueCurve.map(([rpm, torque]) => [rpm, torque * engine * (1 + turbo * Math.max(0, rpm - 2500) / 35000)]),
  };
}
