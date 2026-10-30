/**
 * Web Audio API synthesizer for Google Snake Game
 * Authentic retro sound effects without external audio assets.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  /**
   * Google Snake Apple Munch Chime:
   * Two rapid playful ascending tones (bloop-pop)
   */
  public playEat() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // First pop: 480Hz -> 680Hz
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(480, now);
      osc1.frequency.exponentialRampToValueAtTime(720, now + 0.06);

      gain1.gain.setValueAtTime(0.22, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc1.connect(gain1);
      gain1.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.09);

      // Second harmonic pop: 720Hz -> 1080Hz
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(680, now + 0.04);
      osc2.frequency.exponentialRampToValueAtTime(1040, now + 0.11);

      gain2.gain.setValueAtTime(0.18, now + 0.04);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);

      osc2.start(now + 0.04);
      osc2.stop(now + 0.15);
    } catch {}
  }

  /**
   * Google Snake Turn Sound:
   * Crisp, subtle soft wooden tick/pop
   */
  public playTurn() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Soft crisp 420Hz -> 220Hz tick
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.035);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  public playDie() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(75, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {}
  }

  public playWin() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5, 1318.5]; // C5, E5, G5, C6, G5, C6, E6
      const step = 0.09;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = idx === notes.length - 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * step);

        const duration = idx === notes.length - 1 ? 0.4 : step * 0.9;
        gain.gain.setValueAtTime(0.16, now + idx * step);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + duration);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * step);
        osc.stop(now + idx * step + duration);
      });
    } catch {}
  }

  public playSecretToggle(active: boolean) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      const notes = active ? [587.33, 739.99, 880, 1174.66] : [880, 659.25, 440];
      const step = 0.06;

      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * step);

        gain.gain.setValueAtTime(0.12, now + idx * step);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * step + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + idx * step);
        osc.stop(now + idx * step + 0.1);
      });
    } catch {}
  }
}

export const sounds = new SoundEngine();
