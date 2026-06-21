export type RaceId = 'quarter' | 'mile' | 'top-speed';

export interface RaceConfig {
  id: RaceId;
  name: string;
  distanceM: number;
  description: string;
  baseReward: number;
  targetTimeS: number;
  timeBonusPerS: number;
}

export const RACES: Record<RaceId, RaceConfig> = {
  quarter: { id: 'quarter', name: 'Quarter Mile', distanceM: 402.336, description: 'Classic acceleration run', baseReward: 350, targetTimeS: 16, timeBonusPerS: 120 },
  mile: { id: 'mile', name: 'Standing Mile', distanceM: 1609.344, description: 'Acceleration and high speed', baseReward: 1200, targetTimeS: 55, timeBonusPerS: 45 },
  'top-speed': { id: 'top-speed', name: '10 km Top Speed', distanceM: 10000, description: 'Find the car’s maximum speed', baseReward: 4500, targetTimeS: 230, timeBonusPerS: 18 },
};

export const raceReward = (race: RaceConfig, timeS: number) =>
  race.baseReward + Math.max(0, Math.round((race.targetTimeS - timeS) * race.timeBonusPerS));
