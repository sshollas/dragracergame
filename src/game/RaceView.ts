import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js';
import { CARS, type CarId } from '../data/cars';
import { TRACKS, type TrackId } from '../data/tracks';
import type { RaceState } from '../sim/types';

export type StartLight = 'staged' | 'amber1' | 'amber2' | 'amber3' | 'green' | 'clear';

export class RaceView {
  app = new Application(); private world = new Container(); private car = new Container(); private road = new Graphics();
  private hud: Text; private status: Text; private rpmText: Text; private gearText: Text; private speedText: Text; private nitroText: Text; private shiftText: Text; private ready = false;
  private finishVisualStartedAt: number | null = null;
  constructor(private host: HTMLElement, private finishDistanceM = 402.336, private carId: CarId = 'comet-r', private trackId: TrackId = 'sunset', private nitroCapacityS = 3.5, private shiftLightRatio = .9) {
    const style = new TextStyle({ fontFamily: 'monospace', fill: '#f6f2df', fontSize: 18, fontWeight: 'bold', dropShadow: { color: '#000', distance: 2, blur: 2 } });
    this.hud = new Text({ text: '', style }); this.status = new Text({ text: '', style: new TextStyle({ ...style, fontSize: 30, fill: '#ffcf42' }) });
    this.rpmText = new Text({ text: '', style: new TextStyle({ ...style, fontSize: 25, fill: '#ffcf42' }) });
    this.gearText = new Text({ text: '', style: new TextStyle({ ...style, fontSize: 45, fill: '#f6f2df' }) });
    this.speedText = new Text({ text: '', style: new TextStyle({ ...style, fontSize: 22, fill: '#f6f2df' }) });
    this.nitroText = new Text({ text: '', style: new TextStyle({ ...style, fontSize: 15, fill: '#58dbd0' }) });
    this.shiftText = new Text({ text: 'SHIFT', style: new TextStyle({ ...style, fontSize: 10, fill: '#b8b7b0' }) });
  }
  async init() {
    await this.app.init({ resizeTo: this.host, antialias: true, background: '#151b2d' }); this.host.appendChild(this.app.canvas);
    this.app.stage.addChild(this.world, this.hud, this.status, this.rpmText, this.gearText, this.speedText, this.nitroText, this.shiftText); this.world.addChild(this.road, this.makeCar());
    this.ready = true; this.resize(); window.addEventListener('resize', () => this.resize());
  }
  render(s: RaceState, startLight: StartLight = 'green', reward = 0) {
    if (!this.ready) return; const w = this.app.screen.width, h = this.app.screen.height;
    this.drawWorld(s, w, h);
    const vibration = s.speedMps > 12 ? Math.sin(s.elapsedS * 42) * Math.min(1.8, s.speedMps / 35) : 0;
    if (s.finished && this.finishVisualStartedAt === null) this.finishVisualStartedAt = performance.now();
    const runoutM = this.finishVisualStartedAt === null ? 0 : (performance.now() - this.finishVisualStartedAt) / 1000 * s.speedMps;
    const postLineM = Math.max(0, s.distanceM - this.finishDistanceM) + runoutM;
    this.car.position.set(w * 0.2 + postLineM * 12, h * 0.66 + vibration);
    const kph = s.speedMps * 3.6; const progress = Math.min(1, s.distanceM / this.finishDistanceM);
    const displayedDistanceM = Math.min(s.distanceM, this.finishDistanceM);
    const distance = this.finishDistanceM >= 5000 ? `${(displayedDistanceM / 1000).toFixed(2)} / ${(this.finishDistanceM / 1000).toFixed(0)} km` : `${displayedDistanceM.toFixed(1)} / ${this.finishDistanceM.toFixed(1)} m`;
    this.hud.text = `${s.elapsedS.toFixed(2)} s\n${distance}`;
    const prize = reward > 0 ? `\nPRIZE  $${reward.toLocaleString()}` : '';
    this.hud.position.set(18, 16); this.status.text = s.finished ? `FINISH  ${s.finishTimeS?.toFixed(3)} s${prize}\nSPACE — GARAGE` : s.wheelspin > .05 ? 'WHEELSPIN' : '';
    this.status.anchor.set(.5); this.status.position.set(w / 2, h * .22);
    this.drawGauges(s, progress, w, h);
    this.drawStartLight(startLight, w, h);
  }
  destroy() { this.app.destroy(true, { children: true }); }
  private makeCar() {
    if (this.carId === 'brickhouse-v8') {
      const body = new Graphics().roundRect(0, -17, 154, 61, 7).fill('#4ea56f').roundRect(14, -9, 50, 27, 4).fill('#9bc8cb').rect(105,-26,22,11).fill('#353840');
      body.rect(91,-31,5,30).fill('#b9b2a0');
      for (const x of [29, 124]) body.circle(x, 45, 16).fill('#0c0e12').circle(x,45,8).fill('#aeb1aa');
      this.car = new Container(); this.car.addChild(body); return this.car;
    }
    if (this.carId === 'needle-dragster') {
      const body = new Graphics().poly([0,26,28,15,175,14,232,27,177,35,30,35]).fill('#be3347').roundRect(42,2,72,22,10).fill('#20232a');
      body.circle(30,36,25).fill('#090a0d').circle(30,36,10).fill('#bab7ad').circle(210,33,9).fill('#090a0d').circle(210,33,4).fill('#bab7ad');
      body.rect(5,-9,8,35).fill('#c6c2b7').rect(0,-12,32,5).fill('#be3347');
      this.car = new Container(); this.car.addChild(body); return this.car;
    }
    if (this.carId === 'starbolt-x1') {
      const body = new Graphics().poly([0,22,37,5,150,4,190,25,151,39,35,38]).fill('#d8dce2').poly([52,7,82,-11,119,2,132,8]).fill('#557d91');
      body.poly([-28,18,2,9,2,35,-28,28]).fill('#f07b2d');
      for (const x of [39, 153]) body.circle(x,39,13).fill('#0b0d11').circle(x,39,6).fill('#969ba1');
      this.car = new Container(); this.car.addChild(body); return this.car;
    }
    if (this.carId === 'apex-rs') {
      const body = new Graphics().roundRect(0, 15, 138, 29, 12).fill('#f0b92f')
        .poly([18,15,44,-3,92,-7,125,15]).fill('#f0b92f')
        .poly([46,11,60,0,89,-3,108,11]).fill('#446b78')
        .roundRect(121, 18, 19, 7, 3).fill('#d73543');
      body.rect(4, 26, 12, 5).fill('#f6e9ba');
      for (const x of [27, 109]) body.circle(x, 44, 15).fill('#0b0d12').circle(x, 44, 8).fill('#c5c1b5').circle(x, 44, 3).fill('#363943');
      this.car = new Container(); this.car.addChild(body); return this.car;
    }
    const body = new Graphics().roundRect(0, 12, 126, 34, 8).fill('#e14d3f').poly([25,12,45,-8,91,-8,111,12]).fill('#e14d3f')
      .poly([48,9,58,-4,84,-4,97,9]).fill('#75b5c7');
    for (const x of [25, 101]) body.circle(x, 47, 14).fill('#101218').circle(x, 47, 7).fill('#9da2aa');
    this.car = new Container(); this.car.addChild(body); return this.car;
  }
  private drawWorld(s: RaceState, w: number, h: number) {
    const track = TRACKS[this.trackId];
    const pixelsPerMeter = 12;
    const cameraDistanceM = Math.min(s.distanceM, this.finishDistanceM);
    const dashOffset = (cameraDistanceM * pixelsPerMeter) % 120;
    const mountainOffset = (cameraDistanceM * 1.8) % 190;
    const foregroundOffset = (cameraDistanceM * 18) % 260;
    this.road.clear().rect(0, 0, w, h * .58).fill(track.sky).circle(w*.8, h*.2, 52).fill(track.sun)
      .rect(0, h*.52, w, h*.18).fill(track.ground).rect(0, h*.58, w, h*.42).fill(track.road).rect(0,h*.72,w,5).fill(track.lane);
    for (let x = -mountainOffset - 190; x < w + 190; x += 190) {
      if (this.trackId === 'desert') this.road.roundRect(x, h*.43, 105, h*.15, 8).fill(track.distant).rect(x-20,h*.52,145,h*.06).fill(track.distant);
      else if (this.trackId === 'arctic') this.road.poly([x,h*.58,x+38,h*.43,x+68,h*.51,x+103,h*.37,x+145,h*.58]).fill(track.distant);
      else this.road.poly([x,h*.58,x+45,h*.41,x+95,h*.58]).fill(track.distant);
    }
    for (let x = -dashOffset - 120; x < w + 120; x += 120) this.road.rect(x, h*.82, 68, 7).fill(track.lane);
    for (let x = -foregroundOffset - 260; x < w + 260; x += 260) {
      if (this.trackId === 'desert') this.road.rect(x, h*.47, 9, h*.25).fill(track.accent).rect(x-13,h*.53,17,7).fill(track.accent).rect(x-13,h*.49,6,h*.08).fill(track.accent).rect(x+5,h*.57,16,7).fill(track.accent).rect(x+15,h*.52,6,h*.09).fill(track.accent);
      else if (this.trackId === 'arctic') this.road.poly([x-20,h*.7,x,h*.49,x+24,h*.7]).fill(track.accent).stroke({color:'#87bcc8',width:2});
      else this.road.rect(x, h * .54, 7, h * .18).fill('#171922').rect(x - 10, h * .54, 27, 6).fill(track.accent);
    }
    if (s.speedMps > 10) {
      const streakOffset = (cameraDistanceM * 24) % 150;
      const streakLength = Math.min(110, 16 + s.speedMps * 1.35);
      const alpha = Math.min(.45, (s.speedMps - 10) / 100);
      for (let x = -streakOffset - 150; x < w + 150; x += 150) {
        this.road.roundRect(x, h * .76, streakLength, 2, 1).fill({ color: track.lane, alpha });
        this.road.roundRect(x + 65, h * .9, streakLength * .7, 3, 1).fill({ color: track.lane, alpha: alpha * .8 });
      }
    }
    const carFront = CARS[this.carId].visualLengthPx;
    this.drawTrackLine(w * .2 + carFront - cameraDistanceM * pixelsPerMeter, h, false);
    this.drawTrackLine(w * .2 + carFront + (this.finishDistanceM - cameraDistanceM) * pixelsPerMeter, h, true);
  }
  private drawGauges(s: RaceState, progress: number, w: number, h: number) {
    const g = this.world.getChildByLabel('gauges') as Graphics | undefined; g?.destroy();
    const gauges = new Graphics({ label: 'gauges' });
    gauges.roundRect(18,h-28,w-36,10,5).fill('#3a3d48').roundRect(18,h-28,(w-36)*progress,10,5).fill('#42d392');
    const definition = CARS[this.carId].config;
    const rpmP = Math.min(1, s.rpm / definition.redlineRpm);
    const panelW = Math.min(390, w * .62), panelH = Math.min(260, h * .46), panelX = w - panelW - 18, panelY = h - panelH - 43;
    gauges.roundRect(panelX, panelY, panelW, panelH, 12).fill({ color: '#10121a', alpha: .94 }).stroke({ color: '#505360', width: 2 });
    const radius = Math.min(panelH * .39, panelW * .27), cx = panelX + radius + 24, cy = panelY + panelH * .49;
    gauges.circle(cx, cy, radius + 8).fill('#08090d').stroke({ color: '#626570', width: 3 });
    gauges.circle(cx, cy, radius - 5).stroke({ color: '#2d3039', width: 2 });
    const startAngle = Math.PI * .75, sweep = Math.PI * 1.5;
    for (let i = 0; i <= 8; i++) {
      const angle = startAngle + sweep * i / 8;
      const inner = radius - (i >= 7 ? 18 : 13), outer = radius - 5;
      const color = i >= 7 ? '#ff4d5e' : '#eee9d8';
      gauges.moveTo(cx + Math.cos(angle) * inner, cy + Math.sin(angle) * inner)
        .lineTo(cx + Math.cos(angle) * outer, cy + Math.sin(angle) * outer).stroke({ color, width: i >= 7 ? 4 : 2 });
    }
    const needleAngle = startAngle + sweep * rpmP;
    gauges.moveTo(cx, cy).lineTo(cx + Math.cos(needleAngle) * (radius - 22), cy + Math.sin(needleAngle) * (radius - 22)).stroke({ color: '#ff4d5e', width: 4 });
    gauges.circle(cx, cy, 8).fill('#d8d4c7').circle(cx, cy, 4).fill('#282a31');
    const infoX = panelX + radius * 2 + 42;
    gauges.moveTo(infoX, panelY + 18).lineTo(infoX, panelY + panelH - 18).stroke({ color: '#373a44', width: 1 });
    const nitroP = Math.min(1, s.nitroRemainingS / this.nitroCapacityS);
    gauges.roundRect(infoX + 16, panelY + panelH - 42, Math.max(40, panelW - (infoX-panelX) - 32), 10, 5).fill('#292c35');
    gauges.roundRect(infoX + 16, panelY + panelH - 42, Math.max(0, panelW - (infoX-panelX) - 32) * nitroP, 10, 5).fill('#58dbd0');
    const shiftX = infoX + Math.max(42, (panelW - (infoX - panelX)) * .62), shiftY = panelY + 49;
    const shiftReady = s.rpm >= definition.redlineRpm * this.shiftLightRatio && s.rpm < definition.redlineRpm * .985 && s.gear < definition.gearRatios.length;
    const overRev = s.rpm >= definition.redlineRpm * .985 && s.gear < definition.gearRatios.length;
    gauges.circle(shiftX, shiftY, 18).fill(shiftReady ? '#52ed89' : overRev ? '#ff4d5e' : '#24272d')
      .stroke({ color: shiftReady || overRev ? '#f5f1dc' : '#484b54', width: 3 });
    if (shiftReady) gauges.circle(shiftX, shiftY, 25).stroke({ color: '#52ed89', width: 2, alpha: .45 });
    this.world.addChild(gauges);
    this.rpmText.text = `${Math.round(s.rpm).toString().padStart(4)}\nRPM`;
    this.rpmText.anchor.set(.5); this.rpmText.position.set(cx, cy + radius * .45);
    this.gearText.text = `G ${s.gear}`; this.gearText.anchor.set(0, 0); this.gearText.position.set(infoX + 16, panelY + 15);
    this.speedText.text = `${Math.round(s.speedMps * 3.6)}\nkm/h`; this.speedText.position.set(infoX + 16, panelY + 82);
    this.nitroText.text = `N₂O  ${s.nitroRemainingS.toFixed(1)} s`; this.nitroText.position.set(infoX + 16, panelY + panelH - 70);
    this.shiftText.anchor.set(.5, 0); this.shiftText.position.set(shiftX, shiftY + 24);
  }
  private drawStartLight(phase: StartLight, w: number, h: number) {
    const old = this.world.getChildByLabel('start-light') as Graphics | undefined; old?.destroy();
    if (phase === 'clear') return;
    const light = new Graphics({ label: 'start-light' });
    const x = w * .66, y = Math.max(30, h * .08), lit = '#ffb329', off = '#30271e';
    light.roundRect(x - 27, y - 13, 54, 174, 13).fill('#121318').stroke({ color: '#4a4d55', width: 3 });
    light.rect(x - 4, y + 160, 8, h * .55).fill('#24262c');
    const phases: StartLight[] = ['amber1', 'amber2', 'amber3'];
    phases.forEach((p, i) => light.circle(x, y + 19 + i * 43, 15).fill(phase === p ? lit : off).stroke({ color: '#08090c', width: 3 }));
    light.circle(x, y + 148, 15).fill(phase === 'green' ? '#4ee18a' : '#193325').stroke({ color: '#08090c', width: 3 });
    this.world.addChild(light);
  }
  private drawTrackLine(x: number, h: number, finish: boolean) {
    if (x < -30 || x > this.app.screen.width + 30) return;
    const top = h * .58, bottom = h * .94, cell = 10;
    this.road.rect(x - 3, top - 13, 6, bottom - top + 13).fill(finish ? '#f2f0e5' : '#ffcf42');
    for (let row = 0; top + row * cell < bottom; row++) {
      for (let col = 0; col < 2; col++) {
        const light = (row + col) % 2 === 0;
        this.road.rect(x + 4 + col * cell, top + row * cell, cell, cell).fill(light ? '#f2f0e5' : '#161820');
      }
    }
    this.road.roundRect(x - 28, top - 29, 76, 18, 3).fill(finish ? '#f2f0e5' : '#ffcf42');
  }
  private resize() { /* resizeTo handles dimensions */ }
}
