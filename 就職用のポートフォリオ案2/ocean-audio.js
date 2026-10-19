
(() => {
  'use strict';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'ocean-sound';
  button.textContent = '海の音を聴く';
  button.setAttribute('aria-pressed', 'false');
  document.body.append(button);
  let context, volume, timer, playing = false, busy = false;
  function createOcean() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) throw new Error('Audio unavailable');
    context = new Audio();
    volume = context.createGain();
    volume.gain.value = 0;
    volume.connect(context.destination);
    const buffer = context.createBuffer(1, context.sampleRate * 8, context.sampleRate);
    const samples = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < samples.length; i++) {
      last = (last + Math.random() * 0.04 - 0.02) / 1.02;
      samples[i] = last * 3.5;
    }
    const noise = context.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 550;
    const swell = context.createOscillator();
    const depth = context.createGain();
    swell.frequency.value = 0.12;
    depth.gain.value = 180;
    swell.connect(depth).connect(filter.frequency);
    noise.connect(filter).connect(volume);
    noise.start();
    swell.start();
  }
  function bubble() {
    if (!playing || context.state !== 'running') return;
    const now = context.currentTime;
    const tone = context.createOscillator();
    const gain = context.createGain();
    tone.frequency.setValueAtTime(260 + Math.random() * 300, now);
    tone.frequency.exponentialRampToValueAtTime(100, now + 0.22);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.025);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
    tone.connect(gain).connect(volume);
    tone.start(now);
    tone.stop(now + 0.3);
    tone.onended = () => { tone.disconnect(); gain.disconnect(); };
    timer = setTimeout(bubble, 900 + Math.random() * 2100);
  }
  button.addEventListener('click', async () => {
    if (busy) return;
    busy = true;
    try {
      if (!context) createOcean();
      if (playing) {
        await context.suspend();
        playing = false;
        clearTimeout(timer);
      } else {
        await context.resume();
        playing = true;
        volume.gain.setTargetAtTime(0.45, context.currentTime, 0.4);
        bubble();
      }
      button.setAttribute('aria-pressed', String(playing));
      button.textContent = playing ? '海の音を止める' : '海の音を聴く';
    } catch {
      button.textContent = '海の音を再生できません';
    } finally { busy = false; }
  });
  document.addEventListener('visibilitychange', () => {
    if (!context || !playing) return;
    clearTimeout(timer);
    if (document.hidden) context.suspend().catch(() => {});
    else context.resume().then(bubble).catch(() => {});
  });
})();
