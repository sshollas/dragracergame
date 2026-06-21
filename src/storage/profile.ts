import type { RecordedInputEvent, UpgradeLevels, UpgradeType } from '../sim/types';
import type { RaceId } from '../data/races';
import { CARS, DEFAULT_TUNE, type CarId, type CarTune } from '../data/cars';
import type { TrackId } from '../data/tracks';

export interface LeaderboardEntry { timeS: number; date: string; upgrades: UpgradeLevels; tune?: CarTune; replay: RecordedInputEvent[]; raceId?: RaceId; maxSpeedKph?: number; carId?: CarId; }
export interface Profile { money: number; selectedCarId: CarId; selectedTrackId: TrackId; ownedCars: CarId[]; carUpgrades: Record<string, UpgradeLevels>; carTunes: Record<string, CarTune>; leaderboard: LeaderboardEntry[]; }
const KEY = 'quarter-mile-arcade-profile-v1';
export const EMPTY_UPGRADES: UpgradeLevels = { engine: 0, turbo: 0, nitro: 0, tires: 0, gearbox: 0, weight: 0 };
export const NEW_PROFILE: Profile = { money: 2500, selectedCarId: 'comet-r', selectedTrackId: 'sunset', ownedCars: ['comet-r'], carUpgrades: { 'comet-r': { ...EMPTY_UPGRADES } }, carTunes: { 'comet-r': { ...DEFAULT_TUNE } }, leaderboard: [] };

function normalizeUpgrades(levels?: Partial<UpgradeLevels>): UpgradeLevels {
  return { ...EMPTY_UPGRADES, ...levels };
}

function withDevelopmentAccess(profile: Profile): Profile {
  if (!import.meta.env.DEV) return profile;
  const allCars = Object.keys(CARS) as CarId[];
  profile.money = Math.max(profile.money, 10_000_000);
  profile.ownedCars = allCars;
  for (const id of allCars) {
    profile.carUpgrades[id] ??= { ...EMPTY_UPGRADES };
    profile.carTunes[id] ??= { ...DEFAULT_TUNE };
  }
  return profile;
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
      const carTunes: Record<string, CarTune> = {};
      for (const id of ownedCars) carTunes[id] = { ...DEFAULT_TUNE, ...parsed.carTunes?.[id] };
      return withDevelopmentAccess({ money: parsed.money, selectedCarId, selectedTrackId: parsed.selectedTrackId ?? 'sunset', ownedCars, carUpgrades, carTunes, leaderboard: parsed.leaderboard });
    }
  } catch { /* start fresh */ }
  return withDevelopmentAccess(structuredClone(NEW_PROFILE));
}
export function saveProfile(profile: Profile) { localStorage.setItem(KEY, JSON.stringify(profile)); }
export function levelSummary(levels: UpgradeLevels) { return (Object.keys(levels) as UpgradeType[]).map(k => `${k}:${levels[k]}`).join(' · '); }
