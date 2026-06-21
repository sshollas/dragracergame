import type { CarConfig, UpgradeLevels, UpgradeType } from '../sim/types';

export type CarId = 'comet-r' | 'apex-rs' | 'brickhouse-v8' | 'needle-dragster' | 'starbolt-x1';
export type FinalDriveTune = 'short' | 'balanced' | 'long';
export type TireTune = 'launch' | 'balanced' | 'speed';
export type GearProgressionTune = 'early' | 'balanced' | 'late';
export interface CarTune { finalDrive: FinalDriveTune; gearCount: number; gearProgression: GearProgressionTune; nitroFlow: number; shiftLightRatio: number; tireSetup: TireTune; }
export const DEFAULT_TUNE: CarTune = { finalDrive: 'balanced', gearCount: 0, gearProgression: 'balanced', nitroFlow: 1, shiftLightRatio: .9, tireSetup: 'balanced' };
export interface CarDefinition { id: CarId; name: string; price: number; tagline: string; maxUpgradeLevel: number; torquePerLevel: number; weightStepKg: number; visualLengthPx: number; config: CarConfig; }

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

export const BRICKHOUSE_V8: CarConfig = {
  name: 'Brickhouse V8', massKg: 2380, wheelRadiusM: .37, finalDrive: 4.1,
  gearRatios: [2.85, 1.78, 1.19, .82], drivetrainEfficiency: .78,
  dragCoefficient: .46, frontalAreaM2: 3.3, rollingResistance: .018,
  gripCoefficient: .9, idleRpm: 750, redlineRpm: 6100, shiftTimeS: .24,
  nitroForceN: 2600, nitroCapacityS: 4,
  torqueCurve: [[750,290],[1800,390],[3200,445],[4500,410],[5600,330],[6100,270]],
};

export const NEEDLE_DRAGSTER: CarConfig = {
  name: 'Needle Dragster', massKg: 760, wheelRadiusM: .49, finalDrive: 4.55,
  gearRatios: [2.35, 1.48, 1.0], drivetrainEfficiency: .94,
  dragCoefficient: .56, frontalAreaM2: 1.05, rollingResistance: .012,
  gripCoefficient: 1.72, idleRpm: 1100, redlineRpm: 7800, shiftTimeS: .075,
  nitroForceN: 3400, nitroCapacityS: 2.8,
  torqueCurve: [[1100,430],[2500,690],[4300,860],[6000,900],[7200,820],[7800,680]],
};

export const STARBOLT_X1: CarConfig = {
  name: 'Starbolt X1', massKg: 1420, wheelRadiusM: .42, finalDrive: 2.05,
  gearRatios: [1.72, .86], drivetrainEfficiency: .95,
  dragCoefficient: .13, frontalAreaM2: 1.35, rollingResistance: .01,
  gripCoefficient: 1.3, idleRpm: 1200, redlineRpm: 14500, shiftTimeS: .18,
  nitroForceN: 5000, nitroCapacityS: 5.5, launchDelayS: 2.4, powerRampS: 3.2,
  torqueCurve: [[1200,300],[3500,620],[7000,1040],[10500,1320],[13000,1280],[14500,1050]],
};

export const CARS: Record<CarId, CarDefinition> = {
  'comet-r': { id: 'comet-r', name: 'Comet R', price: 0, tagline: 'Balanced street racer', maxUpgradeLevel: 5, torquePerLevel: .07, weightStepKg: 35, visualLengthPx: 132, config: BASE_CAR },
  'apex-rs': { id: 'apex-rs', name: 'Apex RS', price: 25000, tagline: 'Rear-engine precision', maxUpgradeLevel: 5, torquePerLevel: .07, weightStepKg: 30, visualLengthPx: 140, config: APEX_RS },
  'brickhouse-v8': { id: 'brickhouse-v8', name: 'Brickhouse V8', price: 12000, tagline: 'Heavy van · enormous tuning ceiling', maxUpgradeLevel: 10, torquePerLevel: .1, weightStepKg: 55, visualLengthPx: 154, config: BRICKHOUSE_V8 },
  'needle-dragster': { id: 'needle-dragster', name: 'Needle Dragster', price: 60000, tagline: 'Built to own the quarter mile', maxUpgradeLevel: 7, torquePerLevel: .065, weightStepKg: 22, visualLengthPx: 236, config: NEEDLE_DRAGSTER },
  'starbolt-x1': { id: 'starbolt-x1', name: 'Starbolt X1', price: 120000, tagline: 'Slow ignition · extreme top speed', maxUpgradeLevel: 5, torquePerLevel: .055, weightStepKg: 28, visualLengthPx: 190, config: STARBOLT_X1 },
};

export const UPGRADE_INFO: Record<UpgradeType, { label: string; baseCost: number; description: string }> = {
  engine: { label: 'Engine', baseCost: 900, description: '+vehicle-specific torque gain' },
  turbo: { label: 'Turbo', baseCost: 1100, description: '+high-RPM power' },
  nitro: { label: 'NOS System', baseCost: 1250, description: '+12% boost · +0.4 s capacity' },
  tires: { label: 'Tires', baseCost: 700, description: '+8% grip' },
  gearbox: { label: 'Gearbox', baseCost: 800, description: 'faster shifts' },
  weight: { label: 'Weight', baseCost: 950, description: '−35 kg' },
};

export const upgradeCost = (type: UpgradeType, level: number) => Math.round(UPGRADE_INFO[type].baseCost * (1 + level * 0.75));

export function buildCar(levels: UpgradeLevels, carId: CarId = 'comet-r', tune: CarTune = DEFAULT_TUNE): CarConfig {
  const definition = CARS[carId], base = definition.config;
  const engine = 1 + levels.engine * definition.torquePerLevel;
  const turbo = levels.turbo;
  const finalDriveMultiplier = tune.finalDrive === 'short' ? 1.12 : tune.finalDrive === 'long' ? .88 : 1;
  const gripMultiplier = tune.tireSetup === 'launch' ? 1.08 : tune.tireSetup === 'speed' ? .96 : 1;
  const rollingMultiplier = tune.tireSetup === 'launch' ? 1.08 : tune.tireSetup === 'speed' ? .78 : 1;
  const gearCount = tune.gearCount >= 2 ? Math.min(8, tune.gearCount) : base.gearRatios.length;
  const topGearMultiplier = tune.gearProgression === 'early' ? 1.12 : tune.gearProgression === 'late' ? .82 : 1;
  const firstGear = base.gearRatios[0], topGear = base.gearRatios[base.gearRatios.length - 1] * topGearMultiplier;
  const gearRatios = gearCount === base.gearRatios.length && tune.gearProgression === 'balanced'
    ? [...base.gearRatios]
    : Array.from({ length: gearCount }, (_, index) => firstGear * Math.pow(topGear / firstGear, index / Math.max(1, gearCount - 1)));
  return {
    ...base,
    massKg: Math.max(base.massKg * .65, base.massKg - levels.weight * definition.weightStepKg),
    finalDrive: base.finalDrive * finalDriveMultiplier,
    gearRatios,
    rollingResistance: base.rollingResistance * rollingMultiplier,
    gripCoefficient: base.gripCoefficient * (1 + levels.tires * 0.08) * gripMultiplier,
    shiftTimeS: Math.max(0.055, base.shiftTimeS - levels.gearbox * 0.018),
    nitroCapacityS: base.nitroCapacityS + levels.nitro * 0.4,
    nitroForceN: base.nitroForceN * (1 + turbo * 0.03 + levels.nitro * 0.12) * tune.nitroFlow,
    nitroConsumptionRate: tune.nitroFlow,
    torqueCurve: base.torqueCurve.map(([rpm, torque]) => [rpm, torque * engine * (1 + turbo * Math.max(0, rpm - 2500) / 35000)]),
  };
}
