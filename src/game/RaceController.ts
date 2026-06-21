import { buildCar, type CarId } from '../data/cars';
import { RaceSimulator } from '../sim/RaceSimulator';
import type { RaceInput, UpgradeLevels } from '../sim/types';
import { InputRecorder } from './InputRecorder';

const FIXED_DT = 1 / 120;
export class RaceController {
  sim: RaceSimulator; recorder = new InputRecorder(); input: RaceInput = { throttle: false, nitro: false, shiftUp: false, shiftDown: false };
  private accumulator = 0;
  constructor(levels: UpgradeLevels, finishDistanceM?: number, carId: CarId = 'comet-r') { this.sim = new RaceSimulator(buildCar(levels, carId), finishDistanceM); }
  update(realDt: number) {
    this.accumulator += Math.min(realDt, 0.1);
    while (this.accumulator >= FIXED_DT) {
      this.recorder.record(this.sim.state.elapsedS, this.input); this.sim.step(FIXED_DT, this.input);
      this.input.shiftUp = false; this.input.shiftDown = false; this.accumulator -= FIXED_DT;
    }
  }
}
