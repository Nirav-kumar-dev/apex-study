// Web Audio API ambient noise synthesizer and notification chime generator

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private ambientGain: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isAmbientPlaying: boolean = false;
  private currentMode: 'rain' | 'white_noise' | 'binaural' | 'none' = 'none';

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Play high-quality gentle session complete chime
  public playChime(type: 'complete' | 'click' | 'break' = 'complete') {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      if (type === 'complete') {
        // Multi-harmonic bell chime (Root E5: 659.25Hz, G#5: 830.6Hz, B5: 987.77Hz)
        const freqs = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        freqs.forEach((freq, idx) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);

          gain.gain.setValueAtTime(0.001, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.12 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 1.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.7);
        });
      } else if (type === 'click') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'break') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.3);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      }
    } catch {
      // AudioContext might be blocked until user gesture
    }
  }

  // Start continuous ambient background audio
  public startAmbient(mode: 'rain' | 'white_noise' | 'binaural') {
    this.stopAmbient();
    this.initContext();
    if (!this.ctx) return;

    this.currentMode = mode;
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    if (mode === 'white_noise') {
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.3;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;
      whiteNoise.connect(this.ambientGain);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } else if (mode === 'rain') {
      // Pink / Brown noise simulation with lowpass filter
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 1.5;
      }
      const brownNoise = this.ctx.createBufferSource();
      brownNoise.buffer = noiseBuffer;
      brownNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      brownNoise.connect(filter);
      filter.connect(this.ambientGain);
      brownNoise.start();
      this.noiseNode = brownNoise;
    } else if (mode === 'binaural') {
      // Alpha wave binaural generator (200Hz + 210Hz => 10Hz Alpha beat)
      const oscL = this.ctx.createOscillator();
      const oscR = this.ctx.createOscillator();
      oscL.frequency.setValueAtTime(200, this.ctx.currentTime);
      oscR.frequency.setValueAtTime(210, this.ctx.currentTime);

      const merger = this.ctx.createChannelMerger(2);
      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);

      merger.connect(this.ambientGain);
      oscL.start();
      oscR.start();
      this.noiseNode = oscL;
    }

    this.isAmbientPlaying = true;
  }

  public stopAmbient() {
    if (this.ambientGain && this.ctx) {
      try {
        this.ambientGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
        setTimeout(() => {
          if (this.noiseNode) {
            try {
              (this.noiseNode as AudioBufferSourceNode).stop?.();
              this.noiseNode.disconnect();
            } catch {}
            this.noiseNode = null;
          }
        }, 250);
      } catch {}
    }
    this.isAmbientPlaying = false;
    this.currentMode = 'none';
  }

  public toggleAmbient(mode: 'rain' | 'white_noise' | 'binaural') {
    if (this.isAmbientPlaying && this.currentMode === mode) {
      this.stopAmbient();
      return false;
    } else {
      this.startAmbient(mode);
      return true;
    }
  }

  public isPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  public getMode(): string {
    return this.currentMode;
  }
}

export const soundSynth = new SoundSynthesizer();
