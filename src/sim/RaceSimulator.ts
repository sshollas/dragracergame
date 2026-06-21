import type { CarConfig, RaceInput, RaceState } from './types';

export const QUARTER_MILE_M = 402.336;
const AIR_DENSITY = 1.225;
const GRAVITY = 9.81;

export class RaceSimulator {
  readonly car: CarConfig;
  readonly finishDistanceM: number;
  state: RaceState;

  constructor(car: CarConfig, finishDistanceM = QUARTER_MILE_M) {
    this.car = structuredClone(car);
    this.finishDistanceM = finishDistanceM;
    this.state = this.initialState();
  }

  reset(): RaceState { this.state = this.initialState(); return this.state; }

  step(dt: number, input: RaceInput): RaceState {
    if (dt <= 0 || this.state.finished) return this.state;
    const s = this.state;
    if (input.shiftUp && s.shiftingS <= 0 && s.gear < this.car.gearRatios.length) this.shift(s.gear + 1);
    if (input.shiftDown && s.shiftingS <= 0 && s.gear > 1) this.shift(s.gear - 1);
    s.shiftingS = Math.max(0, s.shiftingS - dt);

    const ratio = this.car.gearRatios[s.gear - 1] * this.car.finalDrive;
    const coupledRpm = s.speedMps / this.car.wheelRadiusM * ratio * 60 / (2 * Math.PI);
    const targetRpm = Math.max(this.car.idleRpm, coupledRpm);
    s.rpm += (targetRpm - s.rpm) * Math.min(1, dt * 14);

    let driveForce = 0;
    if (input.throttle && s.shiftingS <= 0 && s.rpm < this.car.redlineRpm * 1.04) {
      driveForce = this.torqueAt(s.rpm) * ratio * this.car.drivetrainEfficiency / this.car.wheelRadiusM;
    }
    const nitroActive = input.nitro && input.throttle && s.nitroRemainingS > 0;
    if (nitroActive) { driveForce += this.car.nitroForceN; s.nitroRemainingS = Math.max(0, s.nitroRemainingS - dt); }
    const tractionLimit = this.car.massKg * GRAVITY * this.car.gripCoefficient;
    s.wheelspin = driveForce > tractionLimit ? (driveForce - tractionLimit) / tractionLimit : 0;
    driveForce = Math.min(driveForce, tractionLimit);
    const drag = 0.5 * AIR_DENSITY * this.car.dragCoefficient * this.car.frontalAreaM2 * s.speedMps ** 2;
    const rolling = s.speedMps > 0 || driveForce > 0 ? this.car.rollingResistance * this.car.massKg * GRAVITY : 0;
    const acceleration = (driveForce - drag - rolling) / this.car.massKg;
    const previousDistance = s.distanceM;
    s.speedMps = Math.max(0, s.speedMps + acceleration * dt);
    s.distanceM += s.speedMps * dt;
    s.elapsedS += dt;
    if (s.distanceM >= this.finishDistanceM) {
      const segment = s.distanceM - previousDistance;
      const fraction = segment > 0 ? (this.finishDistanceM - previousDistance) / segment : 1;
      s.finishTimeS = s.elapsedS - dt + dt * fraction;
      s.distanceM = this.finishDistanceM; s.finished = true;
    }
    return s;
  }

  torqueAt(rpm: number): number {
    const curve = this.car.torqueCurve;
    if (rpm <= curve[0][0]) return curve[0][1];
    for (let i = 1; i < curve.length; i++) {
      if (rpm <= curve[i][0]) {
        const [r0, t0] = curve[i - 1]; const [r1, t1] = curve[i];
        return t0 + (t1 - t0) * (rpm - r0) / (r1 - r0);
      }
    }
    return curve[curve.length - 1][1];
  }

  private shift(gear: number) { const up = gear > this.state.gear; this.state.gear = gear; this.state.shiftingS = this.car.shiftTimeS; this.state.rpm *= up ? 0.72 : 1.25; }
  private initialState(): RaceState {
    return { elapsedS: 0, distanceM: 0, speedMps: 0, rpm: this.car.idleRpm, gear: 1, wheelspin: 0,
      nitroRemainingS: this.car.nitroCapacityS, shiftingS: 0, finished: false, finishTimeS: null };
  }
}
