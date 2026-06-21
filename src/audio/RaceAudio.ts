import type { RaceInput, RaceState } from '../sim/types';
import type { StartLight } from '../game/RaceView';

export class RaceAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private engineGain?: GainNode;
  private engineLow?: OscillatorNode;
  private engineHigh?: OscillatorNode;
  private tireGain?: GainNode;
  private windGain?: GainNode;
  private nitroGain?: GainNode;
  private sources: AudioScheduledSourceNode[] = [];
  private previousGear = 1;
  private previousPhase: StartLight = 'staged';
  private finished = false;
  private finishFadeStartedAt: number | null = null;
  private muted = false;

  async init() {
    const AudioContextClass = window.AudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass(); this.context = context;
    const master = context.createGain(); master.gain.value = .22; master.connect(context.destination); this.master = master;

    const engineGain = context.createGain(); engineGain.gain.value = 0;
    const engineFilter = context.createBiquadFilter(); engineFilter.type = 'lowpass'; engineFilter.frequency.value = 1300;
    engineGain.connect(engineFilter).connect(master); this.engineGain = engineGain;
    this.engineLow = this.oscillator('sawtooth', engineGain, .7);
    this.engineHigh = this.oscillator('square', engineGain, .16);

    this.tireGain = this.noiseBus('bandpass', 1700, master);
    this.windGain = this.noiseBus('highpass', 750, master);
    this.nitroGain = this.noiseBus('bandpass', 3200, master);
    await context.resume();
  }

  update(state: RaceState, input: RaceInput, phase: StartLight) {
    const context = this.context; if (!context) return; const now = context.currentTime;
    if (state.finished && this.finishFadeStartedAt === null) this.finishFadeStartedAt = now;
    const finishFade = this.finishFadeStartedAt === null ? 1 : Math.max(0, 1 - (now - this.finishFadeStartedAt) / 3);
    const firingHz = Math.max(28, state.rpm / 30);
    this.engineLow?.frequency.setTargetAtTime(firingHz, now, .025);
    this.engineHigh?.frequency.setTargetAtTime(firingHz * 2.01, now, .025);
    this.engineGain?.gain.setTargetAtTime((input.throttle ? .2 : .065) * finishFade, now, .045);

    const tire = state.speedMps < 28 ? Math.min(.28, Math.max(0, state.wheelspin - .025) * .65) : 0;
    this.tireGain?.gain.setTargetAtTime(tire * finishFade, now, .025);
    this.windGain?.gain.setTargetAtTime(Math.min(.08, Math.max(0, state.speedMps - 8) / 650) * finishFade, now, .12);
    this.nitroGain?.gain.setTargetAtTime((input.nitro && input.throttle && state.nitroRemainingS > 0 ? .13 : 0) * finishFade, now, .035);

    if (state.gear !== this.previousGear) { this.tone(105, .055, .09, 'square'); this.previousGear = state.gear; }
    if (phase !== this.previousPhase) {
      if (phase.startsWith('amber')) this.tone(440, .07, .08);
      if (phase === 'green') this.tone(880, .12, .13);
      this.previousPhase = phase;
    }
    if (state.finished && !this.finished) { this.finished = true; this.tone(660, .12, .12); this.tone(990, .18, .1, 'sine', .13); }
  }

  toggleMuted() {
    this.muted = !this.muted;
    this.master?.gain.setTargetAtTime(this.muted ? 0 : .22, this.context?.currentTime ?? 0, .03);
    return this.muted;
  }

  destroy() {
    for (const source of this.sources) { try { source.stop(); } catch { /* already stopped */ } }
    this.sources = []; void this.context?.close(); this.context = undefined;
  }

  private oscillator(type: OscillatorType, destination: AudioNode, gainValue: number) {
    const context = this.context!; const oscillator = context.createOscillator(); const gain = context.createGain();
    oscillator.type = type; gain.gain.value = gainValue; oscillator.connect(gain).connect(destination); oscillator.start(); this.sources.push(oscillator); return oscillator;
  }

  private noiseBus(filterType: BiquadFilterType, frequency: number, destination: AudioNode) {
    const context = this.context!; const length = context.sampleRate * 2; const buffer = context.createBuffer(1, length, context.sampleRate); const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    const source = context.createBufferSource(); source.buffer = buffer; source.loop = true;
    const filter = context.createBiquadFilter(); filter.type = filterType; filter.frequency.value = frequency; filter.Q.value = 1.2;
    const gain = context.createGain(); gain.gain.value = 0; source.connect(filter).connect(gain).connect(destination); source.start(); this.sources.push(source); return gain;
  }

  private tone(frequency: number, duration: number, volume: number, type: OscillatorType = 'sine', delay = 0) {
    const context = this.context; const master = this.master; if (!context || !master || this.muted) return;
    const start = context.currentTime + delay; const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.type = type; oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .01); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(master); oscillator.start(start); oscillator.stop(start + duration + .02);
  }
}
