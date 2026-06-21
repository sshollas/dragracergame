import { describe, expect, it } from 'vitest';
import { APEX_RS, BASE_CAR, NEEDLE_DRAGSTER, STARBOLT_X1, buildCar } from '../data/cars';
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
  it('drops speed and RPM quickly when throttle is released in gear', () => {
    const sim = new RaceSimulator(BASE_CAR);
    for (let i=0;i<180;i++) sim.step(1/120, throttle);
    const speed = sim.state.speedMps; const rpm = sim.state.rpm;
    for (let i=0;i<120;i++) sim.step(1/120, {...throttle, throttle:false});
    expect(sim.state.speedMps).toBeLessThan(speed); expect(sim.state.rpm).toBeLessThan(rpm);
  });
  it('the tuned Brickhouse V8 gains dramatically over stock', () => {
    const stockLevels = {engine:0,turbo:0,nitro:0,tires:0,gearbox:0,weight:0};
    const maxLevels = {engine:10,turbo:10,nitro:10,tires:10,gearbox:10,weight:10};
    const stock = runAutoRace(buildCar(stockLevels,'brickhouse-v8'));
    const tuned = runAutoRace(buildCar(maxLevels,'brickhouse-v8'));
    expect(tuned.state.finishTimeS!).toBeLessThan(stock.state.finishTimeS! * .78);
  });
  it('the dragster is optimized for the quarter mile', () => {
    expect(runAutoRace(NEEDLE_DRAGSTER).state.finishTimeS!).toBeLessThan(runAutoRace(APEX_RS).state.finishTimeS!);
  });
  it('the rocket has ignition delay and extreme long-run speed', () => {
    const launch = new RaceSimulator(STARBOLT_X1); for(let i=0;i<240;i++)launch.step(1/120,throttle);
    expect(launch.state.distanceM).toBe(0);
    const rocket = runAutoRace(STARBOLT_X1,300,10000); const dragster = runAutoRace(NEEDLE_DRAGSTER,300,10000);
    expect(rocket.state.speedMps).toBeGreaterThan(dragster.state.speedMps);
  });
  it('Pro Setup changes gearing and NOS delivery without adding energy', () => {
    const levels = {engine:5,turbo:5,nitro:5,tires:5,gearbox:5,weight:5};
    const endurance = buildCar(levels,'comet-r',{finalDrive:'long',gearCount:6,gearProgression:'late',nitroFlow:.65,shiftLightRatio:.85,tireSetup:'speed'});
    const burst = buildCar(levels,'comet-r',{finalDrive:'short',gearCount:4,gearProgression:'early',nitroFlow:1.45,shiftLightRatio:.95,tireSetup:'launch'});
    expect(endurance.finalDrive).toBeLessThan(burst.finalDrive);
    expect(endurance.nitroForceN).toBeLessThan(burst.nitroForceN);
    expect(endurance.nitroConsumptionRate ?? 1).toBeLessThan(burst.nitroConsumptionRate ?? 1);
    expect(endurance.gearRatios).toHaveLength(6); expect(burst.gearRatios).toHaveLength(4);
    expect(endurance.gearRatios.at(-1)!).toBeLessThan(burst.gearRatios.at(-1)!);
  });
});
