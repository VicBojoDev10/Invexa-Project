/**
 * Invexa Sound & Audio Synthesizer Subsystem
 * Uses browser Web Audio API to synthesize premium lo-fi and retro sound effects programmatically.
 * Works 100% offline, requires zero external downloads/assets, and operates with sub-millisecond precision.
 */

const SoundManager = {
  ctx: null,
  bgmInterval: null,
  currentBeat: 0,
  settings: {
    music: true,
    sound: true
  },
  isInitialized: false,

  /**
   * Initializes the AudioContext. Must run after a user gesture due to browser autoplay protections.
   */
  init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    try {
      this.ctx = new AudioContextClass();
      this.isInitialized = true;

      // Sync settings from active application state if available
      if (window.App && window.App.state && window.App.state.settings) {
        this.settings.music = !!window.App.state.settings.music;
        this.settings.sound = !!window.App.state.settings.sound;
      }

      if (this.settings.music) {
        this.startBGM();
      }
    } catch (e) {
      console.error("Failed to initialize SoundManager AudioContext:", e);
    }
  },

  /**
   * Play synthesized sound effects
   * @param {string} type - Sound effect key ('click', 'pop', 'coin', 'success', 'error')
   */
  play(type) {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.settings.sound) return;
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    try {
      const now = this.ctx.currentTime;

      switch (type) {
        case 'click': {
          // Soft short high-frequency tick for navigation buttons
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(900, now);
          osc.frequency.exponentialRampToValueAtTime(150, now + 0.05);

          gain.gain.setValueAtTime(0.04, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.06);
          break;
        }

        case 'pop': {
          // Very rapid popping feedback sound for clickers
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(650, now + 0.04);

          gain.gain.setValueAtTime(0.06, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.05);
          break;
        }

        case 'coin': {
          // Classic shiny retro double-ding pickup chord
          const osc1 = this.ctx.createOscillator();
          const osc2 = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';

          // First note B5, second note E6 scheduled slightly later
          osc1.frequency.setValueAtTime(987.77, now);
          osc2.frequency.setValueAtTime(1318.51, now + 0.08);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(this.ctx.destination);

          osc1.start(now);
          osc1.stop(now + 0.24);
          osc2.start(now + 0.08);
          osc2.stop(now + 0.28);
          break;
        }

        case 'success': {
          // Ascending bright C-Major arpeggio chord (C4 - E4 - G4 - C5)
          const notes = [261.63, 329.63, 392.00, 523.25];
          const filter = this.ctx.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.value = 1200;

          notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now + idx * 0.08);

            gain.gain.setValueAtTime(0, now + idx * 0.08);
            gain.gain.linearRampToValueAtTime(0.06, now + idx * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.26);

            osc.connect(gain);
            gain.connect(filter);

            osc.start(now + idx * 0.08);
            osc.stop(now + idx * 0.08 + 0.3);
          });

          filter.connect(this.ctx.destination);
          break;
        }

        case 'error': {
          // Low buzzing pitch-fall for errors and missed coins
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(160, now);
          osc.frequency.linearRampToValueAtTime(60, now + 0.3);

          filter.type = 'lowpass';
          filter.frequency.value = 300; // Muffly low buzz

          gain.gain.setValueAtTime(0.08, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }
      }
    } catch (e) {
      console.warn("Failed to play sound effect:", e);
    }
  },

  /**
   * Play soothing, low-volume background ambient music
   */
  startBGM() {
    if (!this.isInitialized) {
      this.init();
    }
    if (!this.settings.music) return;
    if (this.bgmInterval) return;

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    const tempo = 110; // Relaxing slow BPM
    const beatDuration = 60 / tempo; // Duration per beat

    // Relaxing lo-fi chords progression in A minor (Am, F, C, G)
    const chords = [
      { bass: 110.00, melody: [220.00, 261.63, 329.63, 440.00] }, // Am (A2 bass, A3 C4 E4 A4)
      { bass: 87.31,  melody: [174.61, 261.63, 349.23, 440.00] }, // F (F2 bass, F3 C4 F4 A4)
      { bass: 130.81, melody: [261.63, 329.63, 392.00, 523.25] }, // C (C3 bass, C4 E4 G4 C5)
      { bass: 98.00,  melody: [196.00, 293.66, 392.00, 493.88] }  // G (G2 bass, G3 D4 G4 B4)
    ];

    this.currentBeat = 0;

    const playTick = () => {
      if (!this.isInitialized || !this.settings.music) return;
      const now = this.ctx.currentTime;
      const chordIdx = Math.floor(this.currentBeat / 8) % chords.length;
      const chord = chords[chordIdx];
      const beatInBar = this.currentBeat % 8;

      try {
        // Deep warm triangle bass on first and fifth beat of each chord
        if (beatInBar === 0 || beatInBar === 4) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          const bassFilter = this.ctx.createBiquadFilter();

          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(chord.bass, now);

          bassFilter.type = 'lowpass';
          bassFilter.frequency.setValueAtTime(140, now);

          bassGain.gain.setValueAtTime(0, now);
          bassGain.gain.linearRampToValueAtTime(0.08, now + 0.05);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration * 3.5);

          bassOsc.connect(bassFilter);
          bassFilter.connect(bassGain);
          bassGain.connect(this.ctx.destination);

          bassOsc.start(now);
          bassOsc.stop(now + beatDuration * 3.6);
        }

        // Soft arpeggiated ambient melody (gentle, muffled plucks)
        const melodyPattern = [0, 2, 4, 5, 6, 7];
        if (melodyPattern.includes(beatInBar)) {
          const melodyNotes = chord.melody;
          let noteFreq = melodyNotes[0];
          if (beatInBar === 2) noteFreq = melodyNotes[1];
          if (beatInBar === 4) noteFreq = melodyNotes[2];
          if (beatInBar === 5) noteFreq = melodyNotes[1];
          if (beatInBar === 6) noteFreq = melodyNotes[3];
          if (beatInBar === 7) noteFreq = melodyNotes[2];

          const melOsc = this.ctx.createOscillator();
          const melGain = this.ctx.createGain();
          const melFilter = this.ctx.createBiquadFilter();

          melOsc.type = 'sine';
          melOsc.frequency.setValueAtTime(noteFreq, now);

          melFilter.type = 'lowpass';
          melFilter.frequency.setValueAtTime(450, now); // Sweet warm tone filter

          melGain.gain.setValueAtTime(0, now);
          melGain.gain.linearRampToValueAtTime(0.025, now + 0.04); // Extremely soft volume
          melGain.gain.exponentialRampToValueAtTime(0.001, now + beatDuration * 1.5);

          melOsc.connect(melFilter);
          melFilter.connect(melGain);
          melGain.connect(this.ctx.destination);

          melOsc.start(now);
          melOsc.stop(now + beatDuration * 1.6);
        }

        this.currentBeat++;
      } catch (err) {
        console.warn("BGM sequencer tick error:", err);
      }
    };

    // Run first tick immediately
    playTick();

    // Loop interval
    this.bgmInterval = setInterval(playTick, beatDuration * 1000);
  },

  /**
   * Stop background music
   */
  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  },

  /**
   * Toggle background music on or off
   */
  toggleMusic(enable) {
    this.settings.music = !!enable;
    if (enable) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  },

  /**
   * Toggle sound effects on or off
   */
  toggleSound(enable) {
    this.settings.sound = !!enable;
  }
};

// Global click/keypress listeners to auto-resume browser audio state if blocked
["click", "touchstart", "keydown"].forEach(evtType => {
  document.addEventListener(evtType, () => {
    if (!SoundManager.isInitialized) {
      SoundManager.init();
    } else if (SoundManager.ctx && SoundManager.ctx.state === 'suspended') {
      SoundManager.ctx.resume();
    }
  }, { once: false });
});

// Export to window
window.SoundManager = SoundManager;
