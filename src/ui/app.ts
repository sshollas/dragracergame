import { buildCar, CARS, MAX_UPGRADE_LEVEL, UPGRADE_INFO, upgradeCost, type CarId } from '../data/cars';
import { RACES, raceReward, type RaceId } from '../data/races';
import { TRACKS, type TrackId } from '../data/tracks';
import { RaceController } from '../game/RaceController';
import { RaceView, type StartLight } from '../game/RaceView';
import type { UpgradeType } from '../sim/types';
import { EMPTY_UPGRADES, levelSummary, loadProfile, saveProfile, type Profile } from '../storage/profile';

export class GameApp {
  private profile: Profile = loadProfile(); private selectedRace: RaceId = 'quarter'; private controller?: RaceController; private view?: RaceView; private raf = 0; private last = 0; private startAt = 0; private rewarded = false; private rewardAmount = 0; private maxSpeedKph = 0;
  constructor(private root: HTMLElement) { this.showGarage(); }
  private showGarage() {
    this.stopRace(); const levels = this.currentUpgrades; const carDefinition = CARS[this.profile.selectedCarId]; const car = buildCar(levels, this.profile.selectedCarId); const race = RACES[this.selectedRace];
    const results = this.profile.leaderboard.filter(x => (x.raceId ?? 'quarter') === this.selectedRace).sort((a,b) => a.timeS-b.timeS); const best = results[0];
    this.root.innerHTML = `<main class="shell"><header><div><span class="eyebrow">NIGHT SHIFT MOTOR CLUB</span><h1>Quarter Mile</h1></div><div class="cash">$${this.profile.money.toLocaleString()}</div></header>
      <section class="race-picker">${Object.values(RACES).map(item=>`<button data-race="${item.id}" class="race-option ${item.id===this.selectedRace?'active':''}"><b>${item.name}</b><span>${item.description}</span><strong>Prize from $${item.baseReward.toLocaleString()}</strong></button>`).join('')}</section>
      <section class="track-picker">${Object.values(TRACKS).map(item=>`<button data-track="${item.id}" class="track-option ${item.id===this.profile.selectedTrackId?'active':''}"><i class="track-swatch ${item.id}"></i><b>${item.name}</b><span>${item.description}</span></button>`).join('')}</section>
      <section class="car-picker">${Object.values(CARS).map(item=>this.carOption(item.id)).join('')}</section>
      <section class="garage"><div class="panel car-card"><div class="hero-car ${carDefinition.id}">${carDefinition.id==='apex-rs'?'APEX <b>RS</b>':'COMET <b>R</b>'}</div><h2>${car.name}</h2><div class="stat-grid"><span>Mass<b>${car.massKg} kg</b></span><span>Grip<b>${car.gripCoefficient.toFixed(2)}</b></span><span>Torque<b>${Math.round(Math.max(...car.torqueCurve.map(x=>x[1])))} Nm</b></span><span>Best ET<b>${best ? best.timeS.toFixed(3)+' s' : '—'}</b></span></div><button class="race primary">Race ${race.name}</button></div>
      <div class="panel"><div class="section-title"><h2>Workshop</h2><span>Max level ${MAX_UPGRADE_LEVEL}</span></div><div class="upgrades">${(Object.keys(UPGRADE_INFO) as UpgradeType[]).map(type => this.upgradeRow(type)).join('')}</div></div></section>
      <section class="panel leaderboard"><div class="section-title"><h2>${race.name} leaderboard</h2><span>Top 5 runs</span></div>${best ? results.slice(0,5).map((x,i)=>`<div class="score"><b>#${i+1}</b><span>${x.timeS.toFixed(3)} s</span><small>${CARS[x.carId ?? 'comet-r'].name} · ${x.maxSpeedKph ? Math.round(x.maxSpeedKph)+' km/h · ' : ''}${levelSummary(x.upgrades)}</small></div>`).join('') : '<p class="muted">Complete a run to set your first time.</p>'}</section></main>`;
    this.root.querySelector('.race')?.addEventListener('click', () => this.startRace());
    this.root.querySelectorAll<HTMLButtonElement>('[data-race]').forEach(b => b.addEventListener('click', () => { this.selectedRace=b.dataset.race as RaceId; this.showGarage(); }));
    this.root.querySelectorAll<HTMLButtonElement>('[data-track]').forEach(b => b.addEventListener('click', () => { this.profile.selectedTrackId=b.dataset.track as TrackId; saveProfile(this.profile); this.showGarage(); }));
    this.root.querySelectorAll<HTMLButtonElement>('[data-select-car]').forEach(b => b.addEventListener('click', () => { this.profile.selectedCarId=b.dataset.selectCar as CarId; saveProfile(this.profile); this.showGarage(); }));
    this.root.querySelectorAll<HTMLButtonElement>('[data-buy-car]').forEach(b => b.addEventListener('click', () => this.buyCar(b.dataset.buyCar as CarId)));
    this.root.querySelectorAll<HTMLButtonElement>('[data-upgrade]').forEach(b => b.addEventListener('click', () => this.buy(b.dataset.upgrade as UpgradeType)));
  }
  private upgradeRow(type: UpgradeType) {
    const level = this.currentUpgrades[type], cost = upgradeCost(type, level), max = level >= MAX_UPGRADE_LEVEL;
    return `<div class="upgrade"><div><b>${UPGRADE_INFO[type].label}</b><small>${UPGRADE_INFO[type].description}</small></div><div class="levels">${Array.from({length:MAX_UPGRADE_LEVEL},(_,i)=>`<i class="${i<level?'on':''}"></i>`).join('')}</div><button data-upgrade="${type}" ${max || this.profile.money < cost ? 'disabled':''}>${max ? 'MAX' : '$'+cost.toLocaleString()}</button></div>`;
  }
  private buy(type: UpgradeType) { const levels=this.currentUpgrades, level=levels[type], cost=upgradeCost(type,level); if(level>=MAX_UPGRADE_LEVEL||this.profile.money<cost)return; this.profile.money-=cost; levels[type]++; saveProfile(this.profile); this.showGarage(); }
  private carOption(id: CarId) { const car=CARS[id], owned=this.profile.ownedCars.includes(id), selected=this.profile.selectedCarId===id; return `<article class="car-option ${selected?'active':''}"><div><b>${car.name}</b><span>${car.tagline}</span></div><strong>${owned?'OWNED':'$'+car.price.toLocaleString()}</strong>${owned?`<button data-select-car="${id}" ${selected?'disabled':''}>${selected?'SELECTED':'SELECT'}</button>`:`<button data-buy-car="${id}" ${this.profile.money<car.price?'disabled':''}>BUY</button>`}</article>`; }
  private buyCar(id: CarId) { const car=CARS[id]; if(this.profile.ownedCars.includes(id)||this.profile.money<car.price)return; this.profile.money-=car.price; this.profile.ownedCars.push(id); this.profile.carUpgrades[id]={...EMPTY_UPGRADES}; this.profile.selectedCarId=id; saveProfile(this.profile); this.showGarage(); }
  private get currentUpgrades() { return this.profile.carUpgrades[this.profile.selectedCarId] ??= {...EMPTY_UPGRADES}; }
  private async startRace() {
    const race = RACES[this.selectedRace];
    const finishClearanceM = 12;
    this.root.innerHTML = `<main class="race-shell"><div id="race-view"></div><div class="controls"><button data-key="throttle">THROTTLE<br><small>SPACE</small></button><button data-key="down">− GEAR<br><small>↓</small></button><button data-key="up">+ GEAR<br><small>↑</small></button><button data-key="nitro">NITRO<br><small>N</small></button></div><div class="race-actions"><span>Hold throttle · Shift when the green light comes on</span><button class="back">Garage</button></div></main>`;
    const raceCar = buildCar(this.currentUpgrades, this.profile.selectedCarId);
    this.controller = new RaceController(this.currentUpgrades, race.distanceM + finishClearanceM, this.profile.selectedCarId); this.view = new RaceView(this.root.querySelector('#race-view')!, race.distanceM, this.profile.selectedCarId, this.profile.selectedTrackId, raceCar.nitroCapacityS); await this.view.init(); this.bindControls(); this.last=performance.now(); this.startAt=this.last; this.rewarded=false; this.rewardAmount=0; this.maxSpeedKph=0; this.raf=requestAnimationFrame(this.tick);
    this.root.querySelector('.back')?.addEventListener('click',()=>this.showGarage());
  }
  private tick = (now:number) => { if(!this.controller||!this.view)return; const phase=this.startPhase((now-this.startAt)/1000); if(phase==='green'||phase==='clear')this.controller.update((now-this.last)/1000); this.last=now; this.maxSpeedKph=Math.max(this.maxSpeedKph,this.controller.sim.state.speedMps*3.6); if(this.controller.sim.state.finished&&!this.rewarded)this.finish(); this.view.render(this.controller.sim.state,phase,this.rewardAmount); this.raf=requestAnimationFrame(this.tick); };
  private startPhase(seconds:number):StartLight { if(seconds<.7)return 'staged'; if(seconds<1.15)return 'amber1'; if(seconds<1.6)return 'amber2'; if(seconds<2.05)return 'amber3'; if(seconds<2.75)return 'green'; return 'clear'; }
  private finish() { if(!this.controller)return; this.rewarded=true; const time=this.controller.sim.state.finishTimeS!; const race=RACES[this.selectedRace]; this.rewardAmount=raceReward(race,time); this.profile.money+=this.rewardAmount; this.profile.leaderboard.push({timeS:time,date:new Date().toISOString(),upgrades:{...this.currentUpgrades},replay:this.controller.recorder.events,raceId:this.selectedRace,maxSpeedKph:this.maxSpeedKph,carId:this.profile.selectedCarId}); this.profile.leaderboard=this.profile.leaderboard.slice(-30); saveProfile(this.profile); }
  private bindControls() {
    const c=this.controller!; const map=(key:string,down:boolean)=>{ if(key===' ')c.input.throttle=down; if(key==='n'||key==='N')c.input.nitro=down; if(down&&key==='ArrowUp')c.input.shiftUp=true; if(down&&key==='ArrowDown')c.input.shiftDown=true; };
    window.onkeydown=e=>{if([' ','ArrowUp','ArrowDown'].includes(e.key))e.preventDefault(); if(e.key===' '&&c.sim.state.finished){this.showGarage();return} map(e.key,true)}; window.onkeyup=e=>map(e.key,false);
    this.root.querySelectorAll<HTMLButtonElement>('[data-key]').forEach(b=>{ const action=b.dataset.key!; const set=(down:boolean)=>{if(action==='throttle')c.input.throttle=down;if(action==='nitro')c.input.nitro=down;if(down&&action==='up')c.input.shiftUp=true;if(down&&action==='down')c.input.shiftDown=true;}; b.addEventListener('pointerdown',e=>{e.preventDefault();set(true)}); b.addEventListener('pointerup',()=>set(false)); b.addEventListener('pointercancel',()=>set(false)); });
  }
  private stopRace(){ cancelAnimationFrame(this.raf); window.onkeydown=null; window.onkeyup=null; this.view?.destroy(); this.view=undefined; this.controller=undefined; }
}
