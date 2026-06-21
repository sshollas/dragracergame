import { describe, expect, it } from 'vitest';
import { APEX_RS, BASE_CAR, buildCar } from '../data/cars';
import { runAutoRace } from '../sim/autoRace';
import { QUARTER_MILE_M, RaceSimulator } from '../sim/RaceSimulator';

const throttle = { throttle: true, nitro: false, shiftUp: false, shiftDown: false };
describe('RaceSimulator', () => {
  it('progresses over time under throttle', () => {
    const sim = new RaceSimulator(BASE_CAR); for (let i=0;i<240;i++) sim.step(1/120, throttle);
    expect(sim.state.elapsedS).toBeCloseTo(2, 5); expect(sim.state.distanceM).toBeGreaterThan(0); expect(sim.state.speedMps).toBeGreaterThan(0);
  });
  it('shifting changes gear and RPM', () => {
    const sim = new RaceSimulator(BASE_CAR); for (let i=0;i<300;i++) sim.step(1/120, throttle);
    const rpm = sim.state.rpm; sim.step(1/120, {...throttle, shiftUp:true});
    expect(sim.state.gear).toBe(2); expect(sim.state.rpm).toBeLessThan(rpm);
  });
  it('upgrades improve elapsed time', () => {
    const stock = runAutoRace(buildCar({engine:0,turbo:0,nitro:0,tires:0,gearbox:0,weight:0}));
    const upgraded = runAutoRace(buildCar({engine:3,turbo:3,nitro:3,tires:3,gearbox:3,weight:3}));
    expect(stock.state.finished).toBe(true); expect(upgraded.state.finishTimeS!).toBeLessThan(stock.state.finishTimeS!);
  });
  it('completes exactly at a quarter mile', () => {
    const sim=runAutoRace(BASE_CAR); expect(sim.state.finished).toBe(true); expect(sim.state.distanceM).toBe(QUARTER_MILE_M); expect(sim.state.finishTimeS).toBeGreaterThan(5);
  });
  it('supports configurable longer race distances', () => {
    const mile = 1609.344; const sim = runAutoRace(BASE_CAR, 90, mile);
    expect(sim.state.finished).toBe(true); expect(sim.state.distanceM).toBe(mile); expect(sim.state.finishTimeS).toBeGreaterThan(20);
  });
  it('the Apex RS is faster than the stock Comet R', () => {
    const comet = runAutoRace(BASE_CAR); const apex = runAutoRace(APEX_RS);
    expect(apex.state.finishTimeS!).toBeLessThan(comet.state.finishTimeS!);
  });
  it('NOS upgrades increase boost capacity and improve performance', () => {
    const baseLevels = {engine:0,turbo:0,nitro:0,tires:0,gearbox:0,weight:0};
    const stock = buildCar(baseLevels); const nos = buildCar({...baseLevels,nitro:5});
    expect(nos.nitroCapacityS).toBeGreaterThan(stock.nitroCapacityS);
    expect(runAutoRace(nos).state.finishTimeS!).toBeLessThan(runAutoRace(stock).state.finishTimeS!);
  });
});
