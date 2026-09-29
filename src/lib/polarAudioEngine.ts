/**
 * polarAudioEngine.ts
 * Procedural Web Audio API soundscape engine for the Antarctica Digital Twin.
 * Synthesizes dynamic katabatic polar wind, mechanical 50Hz powerhouse hum,
 * and high-latitude ISRO/Inmarsat satcom telemetry pings with zero external assets.
 */

class PolarAudioEngine {
  private ctx: AudioContext | null = null;
  private isInitialized = false;
  private isMuted = true;
  private masterGain: GainNode | null = null;

  // Wind Synthesis Nodes
  private windGain: GainNode | null = null;
  private windFilter: BiquadFilterNode | null = null;
  private windLfo: OscillatorNode | null = null;
  private windLfoGain: GainNode | null = null;

  // Generator 50Hz Hum Nodes
  private genGain: GainNode | null = null;
  private genOsc1: OscillatorNode | null = null;
  private genOsc2: OscillatorNode | null = null;
  private genFilter: BiquadFilterNode | null = null;

  // Blizzard Howl Nodes
  private blizzardGain: GainNode | null = null;
  private blizzardFilter: BiquadFilterNode | null = null;
  private blizzardOsc: OscillatorNode | null = null;

  // Satcom Chirp Timer
  private satcomInterval: any = null;

  // State
  private currentWindKmh = 28;
  private isBlizzardActive = false;
  private isInside = false;
  private isPowerhouse = false;
  private volumeLevel = 0.55;

  constructor() {
    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("antarctica_audio_muted");
      if (savedMute !== null) {
        this.isMuted = savedMute === "true";
      }
      const savedVol = localStorage.getItem("antarctica_audio_vol");
      if (savedVol !== null) {
        this.volumeLevel = parseFloat(savedVol) || 0.55;
      }
    }
  }

  public init() {
    if (this.isInitialized || typeof window === "undefined") return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volumeLevel, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.setupWind();
      this.setupGeneratorHum();
      this.setupBlizzardHowl();
      this.setupSatcomTelemetry();

      this.isInitialized = true;
      this.updateParameters();
    } catch (e) {
      console.warn("[PolarAudioEngine] Failed to initialize Web Audio", e);
    }
  }

  private setupWind() {
    if (!this.ctx || !this.masterGain) return;

    // Generate Pink/Brown Noise buffer for rich natural wind texture
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11; // normalise
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Resonant lowpass filter for polar wind sweeping
    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = "lowpass";
    this.windFilter.frequency.setValueAtTime(320, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    // LFO for slow gusting dynamics
    this.windLfo = this.ctx.createOscillator();
    this.windLfo.frequency.setValueAtTime(0.18, this.ctx.currentTime); // 5.5s gusts
    this.windLfoGain = this.ctx.createGain();
    this.windLfoGain.gain.setValueAtTime(140, this.ctx.currentTime);
    this.windLfo.connect(this.windLfoGain);
    this.windLfoGain.connect(this.windFilter.frequency);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    whiteNoise.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    whiteNoise.start();
    this.windLfo.start();
  }

  private setupGeneratorHum() {
    if (!this.ctx || !this.masterGain) return;

    // 50Hz Indian grid / Kirloskar / Volvo Penta diesel fundamental
    this.genOsc1 = this.ctx.createOscillator();
    this.genOsc1.type = "sawtooth";
    this.genOsc1.frequency.setValueAtTime(50.0, this.ctx.currentTime);

    // 100Hz 2nd harmonic
    this.genOsc2 = this.ctx.createOscillator();
    this.genOsc2.type = "sine";
    this.genOsc2.frequency.setValueAtTime(100.0, this.ctx.currentTime);

    this.genFilter = this.ctx.createBiquadFilter();
    this.genFilter.type = "lowpass";
    this.genFilter.frequency.setValueAtTime(120, this.ctx.currentTime);
    this.genFilter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    this.genGain = this.ctx.createGain();
    this.genGain.gain.setValueAtTime(0.06, this.ctx.currentTime); // Subtle background hum

    this.genOsc1.connect(this.genFilter);
    this.genOsc2.connect(this.genFilter);
    this.genFilter.connect(this.genGain);
    this.genGain.connect(this.masterGain);

    this.genOsc1.start();
    this.genOsc2.start();
  }

  private setupBlizzardHowl() {
    if (!this.ctx || !this.masterGain) return;

    // Resonant high howling wind whistle
    this.blizzardOsc = this.ctx.createOscillator();
    this.blizzardOsc.type = "sine";
    this.blizzardOsc.frequency.setValueAtTime(440, this.ctx.currentTime);

    const howlMod = this.ctx.createOscillator();
    howlMod.frequency.setValueAtTime(0.35, this.ctx.currentTime);
    const howlModGain = this.ctx.createGain();
    howlModGain.gain.setValueAtTime(120, this.ctx.currentTime);
    howlMod.connect(howlModGain);
    howlModGain.connect(this.blizzardOsc.frequency);

    this.blizzardFilter = this.ctx.createBiquadFilter();
    this.blizzardFilter.type = "bandpass";
    this.blizzardFilter.frequency.setValueAtTime(520, this.ctx.currentTime);
    this.blizzardFilter.Q.setValueAtTime(4.0, this.ctx.currentTime);

    this.blizzardGain = this.ctx.createGain();
    this.blizzardGain.gain.setValueAtTime(0.0, this.ctx.currentTime); // Off by default

    this.blizzardOsc.connect(this.blizzardFilter);
    this.blizzardFilter.connect(this.blizzardGain);
    this.blizzardGain.connect(this.masterGain);

    this.blizzardOsc.start();
    howlMod.start();
  }

  private setupSatcomTelemetry() {
    // Periodic subtle ISRO GSAT carrier tone
    if (typeof window === "undefined") return;
    this.satcomInterval = setInterval(() => {
      if (this.isMuted || !this.ctx || !this.masterGain || this.isBlizzardActive) return;
      // 15% random chance every 8s of a subtle data burst ping
      if (Math.random() < 0.25) {
        this.playSatcomDataBurst();
      }
    }, 7000);
  }

  private playSatcomDataBurst() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1760, now); // A6
    osc.frequency.exponentialRampToValueAtTime(2349, now + 0.08); // D7

    gain.gain.setValueAtTime(0.025, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  private updateParameters() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Master Mute
    this.masterGain.gain.setTargetAtTime(
      this.isMuted ? 0 : this.volumeLevel,
      now,
      0.08
    );

    // Wind Dynamics based on Speed & Indoor/Outdoor state
    if (this.windGain && this.windFilter) {
      let targetGain = 0.35;
      let targetFreq = 300 + this.currentWindKmh * 6;

      if (this.isBlizzardActive) {
        targetGain = 0.85;
        targetFreq = 750;
      }

      if (this.isInside) {
        targetGain *= 0.22; // Well-insulated triple-pane Antarctic building
        targetFreq = 180;
      }

      this.windGain.gain.setTargetAtTime(targetGain, now, 0.3);
      this.windFilter.frequency.setTargetAtTime(targetFreq, now, 0.3);
    }

    // Generator Hum Dynamics
    if (this.genGain && this.genFilter) {
      let targetGenGain = 0.04;
      if (this.isPowerhouse) {
        targetGenGain = 0.45; // Prominent mechanical hum inside powerhouse
        this.genFilter.frequency.setTargetAtTime(450, now, 0.2);
      } else if (this.isInside) {
        targetGenGain = 0.08;
        this.genFilter.frequency.setTargetAtTime(160, now, 0.2);
      } else {
        targetGenGain = 0.03;
        this.genFilter.frequency.setTargetAtTime(120, now, 0.2);
      }
      this.genGain.gain.setTargetAtTime(targetGenGain, now, 0.2);
    }

    // Blizzard Howling Whistle
    if (this.blizzardGain) {
      const blizzardTarget = this.isBlizzardActive && !this.isInside ? 0.35 : 0.0;
      this.blizzardGain.gain.setTargetAtTime(blizzardTarget, now, 0.5);
    }
  }

  // ── PUBLIC API ──

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && !this.isInitialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("antarctica_audio_muted", String(this.isMuted));
    }
    this.updateParameters();
    return this.isMuted;
  }

  public setVolume(volume: number) {
    this.volumeLevel = Math.max(0, Math.min(1, volume));
    if (typeof window !== "undefined") {
      localStorage.setItem("antarctica_audio_vol", String(this.volumeLevel));
    }
    this.updateParameters();
  }

  public setBlizzard(active: boolean) {
    this.isBlizzardActive = active;
    this.updateParameters();
  }

  public setWindSpeed(kmh: number) {
    this.currentWindKmh = kmh;
    if (kmh > 75 && !this.isBlizzardActive) {
      this.isBlizzardActive = true;
    }
    this.updateParameters();
  }

  public setLocationState(isInside: boolean, isPowerhouse: boolean = false) {
    this.isInside = isInside;
    this.isPowerhouse = isPowerhouse;
    this.updateParameters();
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return this.volumeLevel;
  }

  public getIsBlizzard(): boolean {
    return this.isBlizzardActive;
  }

  public playClickFeedback() {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.04);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const polarAudio = new PolarAudioEngine();
