import type { RecordedInputEvent, UpgradeLevels, UpgradeType } from '../sim/types';
import type { RaceId } from '../data/races';
import type { CarId } from '../data/cars';
import type { TrackId } from '../data/tracks';

export interface LeaderboardEntry { timeS: number; date: string; upgrades: UpgradeLevels; replay: RecordedInputEvent[]; raceId?: RaceId; maxSpeedKph?: number; carId?: CarId; }
export interface Profile { money: number; selectedCarId: CarId; selectedTrackId: TrackId; ownedCars: CarId[]; carUpgrades: Record<string, UpgradeLevels>; leaderboard: LeaderboardEntry[]; }
const KEY = 'quarter-mile-arcade-profile-v1';
export const EMPTY_UPGRADES: UpgradeLevels = { engine: 0, turbo: 0, nitro: 0, tires: 0, gearbox: 0, weight: 0 };
export const NEW_PROFILE: Profile = { money: 2500, selectedCarId: 'comet-r', selectedTrackId: 'sunset', ownedCars: ['comet-r'], carUpgrades: { 'comet-r': { ...EMPTY_UPGRADES } }, leaderboard: [] };

function normalizeUpgrades(levels?: Partial<UpgradeLevels>): UpgradeLevels {
  return { ...EMPTY_UPGRADES, ...levels };
}

export function loadProfile(): Profile {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? '') as Profile & { upgrades?: UpgradeLevels };
    if (typeof parsed.money === 'number' && Array.isArray(parsed.leaderboard)) {
      const ownedCars: CarId[] = parsed.ownedCars?.length ? parsed.ownedCars : ['comet-r'];
      const selectedCarId = ownedCars.includes(parsed.selectedCarId) ? parsed.selectedCarId : 'comet-r';
      const rawUpgrades = parsed.carUpgrades ?? { 'comet-r': parsed.upgrades ?? { ...EMPTY_UPGRADES } };
      const carUpgrades: Record<string, UpgradeLevels> = {};
      for (const id of ownedCars) carUpgrades[id] = normalizeUpgrades(rawUpgrades[id]);
      return { money: parsed.money, selectedCarId, selectedTrackId: parsed.selectedTrackId ?? 'sunset', ownedCars, carUpgrades, leaderboard: parsed.leaderboard };
    }
  } catch { /* start fresh */ }
  return structuredClone(NEW_PROFILE);
}
export function saveProfile(profile: Profile) { localStorage.setItem(KEY, JSON.stringify(profile)); }
export function levelSummary(levels: UpgradeLevels) { return (Object.keys(levels) as UpgradeType[]).map(k => `${k}:${levels[k]}`).join(' · '); }
