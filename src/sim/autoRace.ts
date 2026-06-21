import { RaceSimulator } from './RaceSimulator';
import type { CarConfig } from './types';

export function runAutoRace(car: CarConfig, maxSeconds = 60, finishDistanceM?: number): RaceSimulator {
  const sim = new RaceSimulator(car, finishDistanceM); const dt = 1 / 120;
  while (!sim.state.finished && sim.state.elapsedS < maxSeconds) {
    const shift = sim.state.rpm >= car.redlineRpm * 0.94 && sim.state.shiftingS === 0;
    sim.step(dt, { throttle: true, nitro: sim.state.elapsedS > 1, shiftUp: shift, shiftDown: false });
  }
  return sim;
}
