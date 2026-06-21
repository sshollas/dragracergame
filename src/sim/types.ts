export type TorquePoint = readonly [rpm: number, torqueNm: number];
export interface CarConfig {
  name: string; massKg: number; wheelRadiusM: number; finalDrive: number;
  gearRatios: number[]; drivetrainEfficiency: number; dragCoefficient: number;
  frontalAreaM2: number; rollingResistance: number; gripCoefficient: number;
  idleRpm: number; redlineRpm: number; shiftTimeS: number;
  nitroForceN: number; nitroCapacityS: number; torqueCurve: TorquePoint[];
}
export interface RaceInput { throttle: boolean; nitro: boolean; shiftUp: boolean; shiftDown: boolean; }
export interface RaceState {
  elapsedS: number; distanceM: number; speedMps: number; rpm: number; gear: number;
  wheelspin: number; nitroRemainingS: number; shiftingS: number; finished: boolean;
  finishTimeS: number | null;
}
export type UpgradeType = 'engine' | 'turbo' | 'nitro' | 'tires' | 'gearbox' | 'weight';
export type UpgradeLevels = Record<UpgradeType, number>;
export interface RecordedInputEvent { timeS: number; action: keyof RaceInput; active: boolean; }
