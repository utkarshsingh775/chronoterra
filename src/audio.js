// A generative ambient score: slow evolving pads, a low drone, wind, and sparse bells.
// Each age of history gets its own scale and chord progression.

const MOODS = {
  Prehistory: { root: 38, scale: [0, 3, 5, 7, 10], chords: [[0, 7, 12], [-2, 5, 10], [-4, 3, 8], [-5, 2, 7]], bellEvery: 7, wind: 0.05 },
  Ancient: { root: 40, scale: [0, 1, 4, 5, 7, 8, 10], chords: [[0, 7, 16], [1, 8, 13], [-2, 5, 10], [-4, 4, 11]], bellEvery: 4.5, wind: 0.03 },
  Medieval: { root: 38, scale: [0, 2, 3, 5, 7, 9, 10], chords: [[0, 7, 15], [5, 12, 21], [-2, 5, 14], [3, 10, 19]], bellEvery: 4, wind: 0.02 },
  'Early Modern': { root: 41, scale: [0, 2, 4, 6, 7, 9, 11], chords: [[0, 7, 16, 23], [2, 9, 18], [-3, 4, 12, 19], [-5, 2, 11, 19]], bellEvery: 3.5, wind: 0.015 },
  Modern: { root: 37, scale: [0, 2, 3, 7, 10], chords: [[0, 7, 14, 15], [-4, 3, 10, 14], [-7, 0, 7, 10], [-2, 5, 12, 17]], bellEvery: 3.2, wind: 0.015 },
};

const midiToHz = (m) => 440 * 2 ** ((m - 69) / 12);
const CHORD_SECONDS = 11;

export function createAmbience() {
  let ctx, master, music, sfx, reverb, windGain, drone;
  let mood = MOODS.Ancient;
  let chordIndex = 0;
  let muted = false;

  function impulse(seconds, decay) {
    const len = ctx.sampleRate * seconds;
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** decay;
    }
    return buf;
  }

  let noise;
  function noiseBuffer() {
    if (noise) return noise;
    noise = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noise;
  }

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    reverb = ctx.createConvolver();
    reverb.buffer = impulse(6, 2.6);
    const wet = ctx.createGain();
    wet.gain.value = 0.9;
    reverb.connect(wet).connect(master);

    music = ctx.createGain();
    music.gain.value = 0.55;
    music.connect(master);
    music.connect(reverb);

    sfx = ctx.createGain();
    sfx.gain.value = 0.5;
    sfx.connect(master);
    sfx.connect(reverb);

    // Low drone
    drone = ctx.createOscillator();
    drone.type = 'sine';
    drone.frequency.value = midiToHz(mood.root - 12);
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.12;
    drone.connect(droneGain).connect(music);
    drone.start();

    // Wind: band-passed noise with a slow sweep
    const wind = ctx.createBufferSource();
    wind.buffer = noiseBuffer();
    wind.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = 'bandpass';
    band.frequency.value = 500;
    band.Q.value = 0.8;
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 300;
    lfo.connect(lfoGain).connect(band.frequency);
    windGain = ctx.createGain();
    windGain.gain.value = mood.wind;
    wind.connect(band).connect(windGain).connect(music);
    wind.start();
    lfo.start();
  }

  // While the context is suspended its clock is frozen, so anything scheduled would pile up and fire at once on resume.
  const running = () => ctx.state === 'running' && !muted;

  function playChord() {
    setTimeout(playChord, CHORD_SECONDS * 1000);
    if (!running()) return;
    const t = ctx.currentTime;
    const chord = mood.chords[chordIndex++ % mood.chords.length];
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, t);
    filter.frequency.linearRampToValueAtTime(1100, t + CHORD_SECONDS * 0.5);
    filter.frequency.linearRampToValueAtTime(500, t + CHORD_SECONDS + 4);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(0.05, t + 3.5);
    env.gain.setValueAtTime(0.05, t + CHORD_SECONDS - 1);
    env.gain.linearRampToValueAtTime(0, t + CHORD_SECONDS + 4);
    filter.connect(env).connect(music);

    for (const interval of chord) {
      const f = midiToHz(mood.root + 12 + interval);
      for (const [type, detune] of [['sawtooth', -7], ['triangle', 6], ['sine', 0]]) {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        o.detune.value = detune;
        o.connect(filter);
        o.start(t);
        o.stop(t + CHORD_SECONDS + 4.5);
      }
    }
    drone.frequency.setTargetAtTime(midiToHz(mood.root - 12 + chord[0]), t, 2);
  }

  function bell(midi, gain = 0.06, when = ctx.currentTime, dest = music) {
    const f = midiToHz(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, when);
    env.gain.linearRampToValueAtTime(gain, when + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0001, when + 4);
    env.connect(dest);
    for (const [ratio, amp] of [[1, 1], [2.76, 0.25], [5.4, 0.08]]) {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = f * ratio;
      g.gain.value = amp;
      o.connect(g).connect(env);
      o.start(when);
      o.stop(when + 4.2);
    }
  }

  function playBells() {
    setTimeout(playBells, mood.bellEvery * (0.5 + Math.random()) * 1000);
    if (!running()) return;
    const s = mood.scale;
    const octave = Math.random() < 0.6 ? 36 : 24;
    const note = mood.root + octave + s[Math.floor(Math.random() * s.length)];
    bell(note);
    if (Math.random() < 0.35) bell(note + (s[2] ?? 7), 0.035, ctx.currentTime + 0.35);
  }

  function fadeTo(value, seconds = 2) {
    if (!ctx) return;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(value, ctx.currentTime, seconds / 3);
  }

  document.addEventListener('visibilitychange', () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else ctx.resume();
  });

  return {
    get started() {
      return !!ctx;
    },
    get muted() {
      return muted;
    },
    start() {
      muted = false;
      if (!ctx) {
        build();
        setTimeout(playChord, 300);
        setTimeout(playBells, 2500);
      }
      ctx.resume();
      fadeTo(0.55, 5);
    },
    setMuted(on) {
      if (!ctx && !on) return this.start();
      muted = on;
      if (!on) ctx.resume();
      fadeTo(on ? 0 : 0.55, on ? 1 : 3);
    },
    setAge(age) {
      mood = MOODS[age] || mood;
      if (windGain) windGain.gain.setTargetAtTime(mood.wind, ctx.currentTime, 3);
    },
    // A soft rising shimmer when travelling to another era.
    whoosh() {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.Q.value = 2;
      f.frequency.setValueAtTime(300, t);
      f.frequency.exponentialRampToValueAtTime(2400, t + 0.9);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(0.12, t + 0.3);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.4);
      src.connect(f).connect(g).connect(sfx);
      src.start(t);
      src.stop(t + 1.5);
    },
    chime() {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      bell(mood.root + 36, 0.05, t, sfx);
      bell(mood.root + 43, 0.035, t + 0.12, sfx);
    },
  };
}
