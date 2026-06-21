export type TrackId = 'sunset' | 'desert' | 'arctic';

export interface TrackDefinition {
  id: TrackId; name: string; description: string;
  sky: string; sun: string; ground: string; road: string; lane: string; distant: string; accent: string;
}

export const TRACKS: Record<TrackId, TrackDefinition> = {
  sunset: { id: 'sunset', name: 'Neon Dusk', description: 'Purple mountains at sunset', sky: '#5d426c', sun: '#f2b84b', ground: '#242735', road: '#292b32', lane: '#eee8d5', distant: '#222739', accent: '#d9b64b' },
  desert: { id: 'desert', name: 'Red Mesa', description: 'Hot midday desert highway', sky: '#69c8e7', sun: '#fff0a8', ground: '#d3904e', road: '#544f4b', lane: '#fff1c2', distant: '#a94f35', accent: '#477343' },
  arctic: { id: 'arctic', name: 'Polar Run', description: 'Ice road under a pale sky', sky: '#a9dce8', sun: '#f5fbef', ground: '#dcecf1', road: '#60747d', lane: '#f8ffff', distant: '#83bdcf', accent: '#d9f5fa' },
};
