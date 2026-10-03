// @ts-nocheck
/* eslint-disable */
// The Biryani Kitchen, stage 1: walk a Karachi kitchen in first person and
// gather every ingredient for a chicken biryani. No text anywhere: the HUD is
// pictures of the ingredients, grouped by where they're found.
import * as THREE from "three";
import { makeTextures } from "./kitchen/textures";
import { buildKitchen, ITEMS, TABLE, ROOM } from "./kitchen/kitchen";
import { buildHandBasket } from "./kitchen/props";

const LOCS = ["fridge", "cupboard", "sabzi", "pantry"];
const LOC_ICONS = {
  fridge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 9.5h12M9 5.5v1.5M9 12.5v3"/></svg>',
  cupboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3" width="15" height="18" rx="1.5"/><path d="M12 3v18M10 10.5v3M14 10.5v3"/></svg>',
  sabzi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5h18l-2.2 8.2A2 2 0 0 1 16.9 20H7.1a2 2 0 0 1-1.9-1.3z"/><path d="M8 10.5l3.2-6M16 10.5l-3.2-6M7 14.5h10"/></svg>',
  pantry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 3.5h7l-1.6 3.2c3.2 1.6 5.1 4.6 5.1 8.6 0 3.6-2.7 5.7-7 5.7s-7-2.1-7-5.7c0-4 1.9-7 5.1-8.6z"/><path d="M9.4 6.7h5.2"/></svg>',
};

const EYE = 1.62;
const REACH = 2.3;
const SLOT_R = 0.03;
const ease = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// Neutral studio environment for reflections (same construction as three's RoomEnvironment).
function roomEnvironment() {
  const scene = new THREE.Scene();
  const geometry = new THREE.BoxGeometry();
  const roomMaterial = new THREE.MeshStandardMaterial({ side: THREE.BackSide });
  const boxMaterial = new THREE.MeshStandardMaterial();
  const main = new THREE.PointLight(0xffffff, 5.0, 28, 2);
  main.position.set(0.418, 16.199, 0.3);
  scene.add(main);
  const room = new THREE.Mesh(geometry, roomMaterial);
  room.position.set(-0.757, 13.219, 0.717);
  room.scale.set(31.713, 28.305, 28.591);
  scene.add(room);
  const boxes = [
    [[-10.906, 2.009, 1.846], -0.195, [2.328, 7.905, 4.651]],
    [[-5.607, -0.754, -0.758], 0.994, [1.97, 1.534, 3.955]],
    [[6.167, 0.857, 7.803], 0.561, [3.927, 6.285, 3.687]],
    [[-2.017, 0.018, 6.124], 0.333, [2.002, 4.566, 2.064]],
    [[2.291, -0.756, -2.621], -0.286, [1.546, 1.552, 1.496]],
    [[-2.193, -0.369, -5.547], 0.516, [3.875, 3.487, 2.986]],
  ];
  for (const [p, ry, s] of boxes) {
    const b = new THREE.Mesh(geometry, boxMaterial);
    b.position.set(p[0], p[1], p[2]); b.rotation.y = ry; b.scale.set(s[0], s[1], s[2]);
    scene.add(b);
  }
  const lights = [
    [[-16.116, 14.37, 8.208], [0.1, 2.428, 2.739], 50],
    [[-16.109, 18.021, -8.207], [0.1, 2.425, 2.751], 50],
    [[14.904, 12.198, -1.832], [0.15, 4.265, 6.331], 17],
    [[-0.462, 8.89, 14.52], [4.38, 5.441, 0.088], 43],
    [[3.235, 11.486, -12.541], [2.5, 2.0, 0.1], 20],
    [[0.0, 20.0, 0.0], [1.0, 0.1, 1.0], 100],
  ];
  for (const [p, s, k] of lights) {
    const mat = new THREE.MeshBasicMaterial();
    mat.color.setScalar(k);
    const l = new THREE.Mesh(geometry, mat);
    l.position.set(p[0], p[1], p[2]); l.scale.set(s[0], s[1], s[2]);
    scene.add(l);
  }
  return scene;
}

function makeMaterials(T) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const clear = (o) => phys(Object.assign({ transparent: true, depthWrite: false, metalness: 0 }, o));
  T.plaster.repeat.set(3, 2);
  T.wicker.repeat.set(4, 1.5);
  T.burlap.repeat.set(2, 1);
  T.onion.repeat.set(2, 1);
  T.garlic.repeat.set(2, 1);
  T.terracotta.repeat.set(3, 1);
  return {
    floor: std({ map: T.floor, bumpMap: T.floorBump, bumpScale: 0.0015, roughness: 0.3 }),
    wall: std({ map: T.plaster, roughness: 0.92, envMapIntensity: 0.8 }),
    ceiling: std({ color: 0xf3f0e9, roughness: 0.95, envMapIntensity: 0.7 }),
    skirting: std({ color: 0xd9d0c1, roughness: 0.6 }),
    frame: std({ color: 0xf1f0ec, roughness: 0.45 }),
    windowGlass: clear({ color: 0xffffff, roughness: 0.02, opacity: 0.07 }),
    marble: std({ color: 0xe9e4da, roughness: 0.28 }),
    sky: new THREE.MeshBasicMaterial({ map: T.sky, color: new THREE.Color(1.3, 1.25, 1.15) }),
    plinth: std({ color: 0x2a2623, roughness: 0.8 }),
    carcass: std({ color: 0x4f3423, roughness: 0.7 }),
    carcassInside: std({ map: T.oak, color: 0xf3e6d2, roughness: 0.7 }),
    cabinetDoor: std({ map: T.teak, roughness: 0.46 }),
    teakShelf: std({ map: T.teak, roughness: 0.5 }),
    tableWood: std({ map: T.oak, roughness: 0.55 }),
    boardWood: std({ map: T.oak, color: 0xf2e2c8, roughness: 0.6 }),
    doorWood: std({ map: T.teak, color: 0xd9c6b2, roughness: 0.55 }),
    chrome: std({ color: 0xffffff, metalness: 1, roughness: 0.12 }),
    steel: std({ map: T.brushed, color: 0xdadcde, metalness: 1, roughness: 0.3 }),
    aluminium: std({ color: 0xcfd1d3, metalness: 1, roughness: 0.38 }),
    tin: std({ color: 0xd4d6d8, metalness: 1, roughness: 0.3 }),
    brass: std({ color: 0xb48a3e, metalness: 1, roughness: 0.3 }),
    castIron: std({ color: 0x1b1b1b, metalness: 0.5, roughness: 0.6 }),
    knob: std({ color: 0x151515, roughness: 0.35 }),
    granite: phys({ map: T.granite, roughness: 0.18, clearcoat: 0.6, clearcoatRoughness: 0.08 }),
    subway: std({ map: T.subway, bumpMap: T.subwayBump, bumpScale: 0.0012, roughness: 0.16 }),
    blackGlass: phys({ color: 0x050505, roughness: 0.06, clearcoat: 1, clearcoatRoughness: 0.03 }),
    enamel: phys({ color: 0xf3f3f0, roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.1 }),
    fridgePlastic: std({ color: 0xf7f7f4, roughness: 0.4 }),
    gasket: std({ color: 0x8d8f91, roughness: 0.7 }),
    shelfGlass: clear({ color: 0xe6f3f1, roughness: 0.05, opacity: 0.28 }),
    crisper: clear({ color: 0xeaf6ff, roughness: 0.1, opacity: 0.22 }),
    waterBottle: clear({ color: 0xdff1ff, roughness: 0.05, opacity: 0.35 }),
    fridgeLamp: std({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0 }),
    magnetRed: std({ color: 0xc8352a, roughness: 0.35 }),
    magnetGreen: std({ color: 0x2f8a52, roughness: 0.35 }),
    clockFace: std({ map: T.clock, roughness: 0.4 }),
    clockHand: std({ color: 0x1d1a17, roughness: 0.4 }),
    tube: std({ color: 0xffffff, emissive: 0xfff5e6, emissiveIntensity: 1.6 }),
    // ingredients
    foam: std({ color: 0xf2efe8, roughness: 0.9 }),
    chicken: phys({ map: T.chicken, roughness: 0.42, clearcoat: 0.35, clearcoatRoughness: 0.25 }),
    bone: std({ color: 0xf0e6d6, roughness: 0.5 }),
    film: clear({ color: 0xffffff, roughness: 0.12, opacity: 0.16 }),
    terracotta: std({ map: T.terracotta, roughness: 0.88, side: THREE.DoubleSide }),
    dahi: phys({ color: 0xf7f4ec, roughness: 0.35, clearcoat: 0.4 }),
    tomato: phys({ color: 0xc8241a, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.12 }),
    calyx: std({ color: 0x3f6b2a, roughness: 0.6, side: THREE.DoubleSide }),
    stem: std({ color: 0x5c7a35, roughness: 0.7 }),
    chilli: phys({ color: 0x2d7a1f, roughness: 0.25, clearcoat: 1, clearcoatRoughness: 0.15 }),
    lemon: std({ color: 0xe3c63a, roughness: 0.45, bumpMap: T.bumpFine, bumpScale: 0.0006 }),
    mint: std({ color: 0x3b7a37, roughness: 0.55, side: THREE.DoubleSide }),
    coriander: std({ color: 0x4f9440, roughness: 0.5, side: THREE.DoubleSide }),
    rubber: std({ color: 0xc73a2c, roughness: 0.5 }),
    glass: clear({ color: 0xffffff, roughness: 0.04, opacity: 0.2, envMapIntensity: 1.4 }),
    lidRed: std({ color: 0xb3261c, roughness: 0.4 }),
    lidYellow: std({ color: 0xe0a51b, roughness: 0.4 }),
    lidWhite: std({ color: 0xf2f0ea, roughness: 0.4 }),
    lidBrown: std({ color: 0x5b3a22, roughness: 0.4 }),
    powderRed: std({ map: T.redChilli, roughness: 0.95 }),
    powderHaldi: std({ map: T.haldi, roughness: 0.95 }),
    powderSalt: std({ map: T.salt, roughness: 0.6 }),
    powderGaram: std({ map: T.garam, roughness: 0.9 }),
    plum: phys({ color: 0x3b130e, roughness: 0.45, clearcoat: 0.5, bumpMap: T.bump, bumpScale: 0.0008 }),
    cinnamon: std({ color: 0x7a4422, roughness: 0.8, bumpMap: T.bumpFine, bumpScale: 0.0005 }),
    anise: std({ color: 0x4a2c1a, roughness: 0.75 }),
    bayLeaf: std({ color: 0x7d8a4a, roughness: 0.6, side: THREE.DoubleSide }),
    boxFront: std({ map: T.masala, roughness: 0.55 }),
    boxSide: std({ color: 0xa61f16, roughness: 0.55 }),
    liquidKewra: clear({ color: 0xe9f5df, roughness: 0.05, opacity: 0.55 }),
    liquidZarda: phys({ color: 0xf28c0c, roughness: 0.05, transparent: true, opacity: 0.88 }),
    liquidOil: phys({ color: 0xe0a91f, roughness: 0.05, transparent: true, opacity: 0.86 }),
    capGreen: std({ color: 0x2a7a3e, roughness: 0.4 }),
    capRed: std({ color: 0xc0281e, roughness: 0.4 }),
    labelKewra: std({ map: T.kewraLabel, roughness: 0.6 }),
    labelZarda: std({ map: T.zardaLabel, roughness: 0.6 }),
    labelOil: std({ map: T.oilLabel, roughness: 0.6 }),
    labelGhee: std({ map: T.gheeLabel, roughness: 0.5 }),
    onion: std({ map: T.onion, roughness: 0.55, bumpMap: T.bumpFine, bumpScale: 0.0004 }),
    onionRoot: std({ color: 0xc9b393, roughness: 0.9 }),
    potato: std({ color: 0xc4a06a, roughness: 0.9, bumpMap: T.bump, bumpScale: 0.0012 }),
    ginger: std({ color: 0xc69b62, roughness: 0.85, bumpMap: T.bump, bumpScale: 0.0015 }),
    garlic: std({ map: T.garlic, roughness: 0.6 }),
    burlap: std({ map: T.burlap, roughness: 0.95, bumpMap: T.burlap, bumpScale: 0.002 }),
    rope: std({ color: 0x9a7b4f, roughness: 0.95 }),
    pet: clear({ color: 0xfafcff, roughness: 0.05, opacity: 0.25 }),
    knife: std({ color: 0xe8eaec, metalness: 1, roughness: 0.18 }),
    knifeHandle: std({ color: 0x1a1512, roughness: 0.5 }),
    wicker: std({ map: T.wicker, roughness: 0.85, side: THREE.DoubleSide, bumpMap: T.wicker, bumpScale: 0.002 }),
    wickerRim: std({ color: 0x9a6c39, roughness: 0.8 }),
    daalYellow: std({ color: 0xe8b934, roughness: 0.9, bumpMap: T.bumpFine, bumpScale: 0.0008 }),
    daalRed: std({ color: 0xd2652d, roughness: 0.9, bumpMap: T.bumpFine, bumpScale: 0.0008 }),
    daalGreen: std({ color: 0x6e8a3a, roughness: 0.9, bumpMap: T.bumpFine, bumpScale: 0.0008 }),
  };
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(128, 128, 10, 128, 128, 128);
  g.addColorStop(0, "rgba(255,214,150,0.9)");
  g.addColorStop(0.55, "rgba(255,190,110,0.35)");
  g.addColorStop(1, "rgba(255,170,90,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  return new THREE.CanvasTexture(c);
}

// ============================================================================
export function initFoodLab(root) {
  const ac = new AbortController();
  const sig = ac.signal;
  const timers = new Set();
  let dead = false, raf = 0;
  const on = (t, type, fn, opts) => t.addEventListener(type, fn, Object.assign({ signal: sig }, opts || {}));
  const later = (fn, ms) => {
    const id = window.setTimeout(() => { timers.delete(id); if (!dead) fn(); }, ms);
    timers.add(id);
    return id;
  };
  const $ = (s) => root.querySelector(s);
  const ui = {
    stage: $(".fl-stage"), strip: $(".fl-strip"), reticle: $(".fl-reticle"),
    start: $(".fl-start"), loading: $(".fl-loading"), done: $(".fl-done"),
    joy: $(".fl-joy"), joyKnob: $(".fl-joy i"), fallback: $(".fl-fallback"),
  };

  let renderer = null, canvas = null, envRT = null, ro = null;

  // ---------------------------------------------------------------- sound
  const Sound = {
    ctx: null, master: null, buf: null, hum: null, amb: null,
    init() {
      if (this.ctx) { if (this.ctx.state === "suspended") this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.7;
      this.master.connect(this.ctx.destination);
      const len = this.ctx.sampleRate * 2;
      this.buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.ambience();
    },
    noise(dur, freq, q, gain, type = "bandpass", when = 0) {
      if (!this.ctx) return;
      const c = this.ctx, t = c.currentTime + when;
      const s = c.createBufferSource(); s.buffer = this.buf;
      const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(this.master);
      s.start(t, Math.random()); s.stop(t + dur + 0.02);
    },
    tone(freq, dur, gain, type = "sine", when = 0, slide = 0) {
      if (!this.ctx) return;
      const c = this.ctx, t = c.currentTime + when;
      const o = c.createOscillator(); o.type = type;
      o.frequency.setValueAtTime(freq, t);
      if (slide) o.frequency.exponentialRampToValueAtTime(freq + slide, t + dur * 0.6);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(this.master);
      o.start(t); o.stop(t + dur + 0.02);
    },
    step() { this.noise(0.09, 380 + Math.random() * 160, 1.1, 0.16); this.noise(0.04, 2600, 0.7, 0.025, "highpass"); },
    pick() { this.tone(520, 0.14, 0.11, "sine", 0, 360); this.noise(0.05, 1600, 1.2, 0.04); },
    collect() { this.tone(880, 0.35, 0.06); this.tone(1320, 0.45, 0.045, "sine", 0.06); this.noise(0.08, 900, 0.9, 0.08, "bandpass", 0.04); },
    cabinet(open) { this.noise(0.05, 1900, 2, 0.1); this.tone(open ? 150 : 115, 0.09, 0.09, "triangle"); },
    fridge(open) {
      if (open) { this.noise(0.14, 950, 0.7, 0.14); this.humStart(); }
      else { this.tone(68, 0.2, 0.22); this.noise(0.08, 320, 1, 0.16); this.humStop(); }
    },
    humStart() {
      if (!this.ctx || this.hum) return;
      const c = this.ctx, t = c.currentTime;
      const o1 = c.createOscillator(); o1.frequency.value = 50;
      const o2 = c.createOscillator(); o2.frequency.value = 100;
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.02, t + 0.4);
      o1.connect(g); o2.connect(g); g.connect(this.master);
      o1.start(); o2.start();
      this.hum = { o1, o2, g };
    },
    humStop() {
      if (!this.hum) return;
      const { o1, o2, g } = this.hum, t = this.ctx.currentTime;
      this.hum = null;
      g.gain.cancelScheduledValues(t);
      g.gain.setValueAtTime(Math.max(g.gain.value, 0.0001), t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
      o1.stop(t + 0.35); o2.stop(t + 0.35);
    },
    place() { this.noise(0.06, 700, 1.5, 0.1); this.tone(240, 0.08, 0.05, "triangle"); },
    ready() { [660, 880, 1100].forEach((f, i) => this.tone(f, 0.55, 0.045, "sine", i * 0.09)); },
    done() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.95, 0.045, "sine", i * 0.12)); },
    ambience() {
      const c = this.ctx;
      const s = c.createBufferSource(); s.buffer = this.buf; s.loop = true;
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 360;
      const g = c.createGain(); g.gain.value = 0.03;
      const lfo = c.createOscillator(); lfo.frequency.value = 0.07;
      const lg = c.createGain(); lg.gain.value = 0.014;
      lfo.connect(lg); lg.connect(g.gain);
      s.connect(lp); lp.connect(g); g.connect(this.master);
      s.start(); lfo.start();
      this.amb = { s, lfo };
    },
    close() {
      if (!this.ctx) return;
      try { this.humStop(); } catch (e) {}
      try { this.ctx.close(); } catch (e) {}
      this.ctx = null;
    },
  };

  // ---------------------------------------------------------------- boot in stages so the loader can paint
  const S = {};
  const fail = (err) => {
    if (err) console.error("[food-lab]", err);
    ui.loading && ui.loading.classList.add("hide");
    ui.fallback && ui.fallback.classList.add("show");
  };
  const stage = (fn, next, ms = 16) => later(() => { try { fn(); if (next) next(); } catch (e) { fail(e); } }, ms);

  stage(setupRenderer, () => stage(setupWorld, () => stage(setupEnvAndThumbs, () => stage(setupInput, ready))), 40);

  function setupRenderer() {
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    } catch (e) {
      throw new Error("WebGL unavailable");
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.autoClear = false;
    canvas = renderer.domElement;
    ui.stage.appendChild(canvas);
  }

  function setupWorld() {
    const T = makeTextures();
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    for (const k in T) T[k].anisotropy = aniso;
    const M = makeMaterials(T);
    S.M = M;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd9d2c6);
    const camera = new THREE.PerspectiveCamera(66, 1, 0.03, 40);
    camera.rotation.order = "YXZ";
    S.scene = scene; S.camera = camera;

    const K = buildKitchen(M, T);
    scene.add(K.root);
    S.K = K;

    // late-afternoon sun through the window
    const sun = new THREE.DirectionalLight(0xffdcae, 2.4);
    sun.position.set(-3.2, 4.4, -5.6);
    sun.target.position.set(-0.4, 0.4, 0.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 1; sc.far = 16;
    sun.shadow.bias = -0.0004;
    sun.shadow.normalBias = 0.02;
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0xb8a58c, 0.28));
    const lamp = new THREE.PointLight(0xfff1df, 0.55, 7, 2);
    lamp.position.set(0, 2.5, -0.3);
    scene.add(lamp);

    // the glow that appears on the prep table once the basket is full
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 0.95), new THREE.MeshBasicMaterial({
      map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(0.05, 0.903, 0.25);
    scene.add(glow);
    S.glow = glow;

    // first-person basket, drawn in its own pass so it never clips into counters
    const vm = new THREE.Scene();
    vm.add(new THREE.HemisphereLight(0xfff4e6, 0x8a7a66, 0.55));
    const vmKey = new THREE.DirectionalLight(0xffe6c4, 1.1);
    vmKey.position.set(-1, 2, 1);
    vm.add(vmKey);
    const vmRoot = new THREE.Group();
    vmRoot.matrixAutoUpdate = false;
    vm.add(vmRoot);
    const basket = buildHandBasket(M);
    basket.position.set(0.25, -0.34, -0.58);
    basket.rotation.set(0.42, -0.25, 0.05);
    vmRoot.add(basket);
    S.vm = vm; S.vmRoot = vmRoot; S.basket = basket;

    // per-item state; materials cloned so each item can glow on its own
    S.items = {};
    for (const def of ITEMS) {
      const obj = K.items[def.id];
      const mats = [];
      obj.traverse((m) => {
        if (!m.isMesh) return;
        m.material = Array.isArray(m.material) ? m.material.map((x) => x.clone()) : m.material.clone();
        (Array.isArray(m.material) ? m.material : [m.material]).forEach((x) => { if (x.emissive) mats.push(x); });
        m.userData.cast = m.castShadow;
      });
      const sph = new THREE.Box3().setFromObject(obj).getBoundingSphere(new THREE.Sphere());
      S.items[def.id] = { def, obj, mats, radius: Math.max(0.02, sph.radius), collected: false, flying: false };
    }
    S.pickables = [...K.blockers, ...K.doors.map((d) => d.pivot), ...ITEMS.map((d) => S.items[d.id].obj)];
  }

  function setupEnvAndThumbs() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envRT = pmrem.fromScene(roomEnvironment(), 0.04);
    pmrem.dispose();
    S.scene.environment = envRT.texture;
    S.vm.environment = envRT.texture;
    S.thumbs = makeThumbs();
    buildStrip();
    S.thumbImgs = {};
    let pending = 0;
    for (const def of ITEMS) {
      const url = S.thumbs[def.id];
      if (!url) continue;
      const img = new Image();
      pending++;
      img.onload = () => { if (--pending === 0 && !dead) drawCard(); };
      img.src = url;
      S.thumbImgs[def.id] = img;
    }
    drawCard();
  }

  // Render a little picture of every ingredient (used by the HUD and the fridge card).
  function makeThumbs() {
    let tr;
    try {
      tr = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    } catch (e) { return {}; }
    tr.setPixelRatio(1);
    tr.setSize(128, 128, false);
    tr.outputEncoding = THREE.sRGBEncoding;
    tr.toneMapping = THREE.ACESFilmicToneMapping;
    tr.toneMappingExposure = 1.05;
    tr.setClearColor(0x000000, 0);
    const pm = new THREE.PMREMGenerator(tr);
    const env = pm.fromScene(roomEnvironment(), 0.04);
    const ts = new THREE.Scene();
    ts.environment = env.texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.3);
    key.position.set(1, 2, 1.5);
    ts.add(key);
    ts.add(new THREE.HemisphereLight(0xffffff, 0x6f665c, 0.35));
    const cam = new THREE.PerspectiveCamera(26, 1, 0.005, 10);
    const dir = new THREE.Vector3(0.5, 0.62, 1).normalize();
    const urls = {};
    for (const def of ITEMS) {
      const src = S.items[def.id].obj;
      const c = src.clone(true);
      c.position.set(0, 0, 0);
      c.rotation.set(0, 0.35, 0);
      c.scale.set(1, 1, 1);
      ts.add(c);
      c.updateMatrixWorld(true);
      const s = new THREE.Box3().setFromObject(c).getBoundingSphere(new THREE.Sphere());
      const dist = (s.radius / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2))) * 1.02;
      cam.position.copy(s.center).addScaledVector(dir, dist);
      cam.near = dist / 40; cam.far = dist * 4;
      cam.lookAt(s.center);
      cam.updateProjectionMatrix();
      tr.clear();
      tr.render(ts, cam);
      urls[def.id] = tr.domElement.toDataURL("image/png");
      ts.remove(c);
    }
    env.dispose(); pm.dispose();
    tr.dispose();
    if (tr.forceContextLoss) tr.forceContextLoss();
    return urls;
  }

  // ---------------------------------------------------------------- HUD
  const slotEls = {};
  function buildStrip() {
    ui.strip.innerHTML = "";
    for (const loc of LOCS) {
      const g = document.createElement("div");
      g.className = "fl-group";
      const ic = document.createElement("span");
      ic.className = "fl-loc";
      ic.innerHTML = LOC_ICONS[loc];
      g.appendChild(ic);
      for (const def of ITEMS.filter((d) => d.loc === loc)) {
        const s = document.createElement("span");
        s.className = "fl-slot";
        const img = document.createElement("img");
        img.alt = def.name;
        img.draggable = false;
        if (S.thumbs[def.id]) img.src = S.thumbs[def.id];
        s.appendChild(img);
        g.appendChild(s);
        slotEls[def.id] = s;
      }
      ui.strip.appendChild(g);
    }
  }

  // The illustrated recipe card stuck to the fridge door.
  function drawCard() {
    const { canvas: c, texture } = S.K.card;
    const x = c.getContext("2d"), w = c.width, h = c.height;
    x.fillStyle = "#fbf6ea"; x.fillRect(0, 0, w, h);
    x.strokeStyle = "rgba(160,120,80,0.18)"; x.lineWidth = 2;
    for (let y = 200; y < h - 20; y += 28) { x.beginPath(); x.moveTo(24, y); x.lineTo(w - 24, y); x.stroke(); }
    // header: a degchi with steam
    x.save(); x.translate(w / 2, 104);
    x.fillStyle = "#9aa1a6"; x.beginPath(); x.ellipse(0, 18, 92, 22, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#b9bfc3"; x.fillRect(-88, -22, 176, 40);
    x.fillStyle = "#d8dcdf"; x.beginPath(); x.ellipse(0, -22, 88, 20, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = "#e7a33a"; x.beginPath(); x.ellipse(0, -24, 74, 14, 0, 0, Math.PI * 2); x.fill();
    x.strokeStyle = "rgba(120,120,120,0.55)"; x.lineWidth = 5; x.lineCap = "round";
    for (const sx of [-36, 0, 36]) {
      x.beginPath(); x.moveTo(sx, -48);
      x.bezierCurveTo(sx - 14, -64, sx + 14, -76, sx, -92); x.stroke();
    }
    x.restore();
    let y = 196;
    for (const loc of LOCS) {
      const defs = ITEMS.filter((d) => d.loc === loc);
      drawLocIcon(x, loc, 46, y + 26);
      defs.forEach((d, i) => {
        const px = 88 + (i % 7) * 58, py = y + Math.floor(i / 7) * 58;
        const img = S.thumbImgs && S.thumbImgs[d.id];
        const got = S.items[d.id].collected;
        x.globalAlpha = got ? 0.45 : 1;
        if (img && img.complete && img.naturalWidth) x.drawImage(img, px, py, 54, 54);
        x.globalAlpha = 1;
        if (got) {
          x.fillStyle = "#2f9e5b"; x.beginPath(); x.arc(px + 44, py + 44, 11, 0, Math.PI * 2); x.fill();
          x.strokeStyle = "#fff"; x.lineWidth = 3.5; x.lineCap = "round"; x.lineJoin = "round";
          x.beginPath(); x.moveTo(px + 39, py + 44); x.lineTo(px + 43, py + 48); x.lineTo(px + 50, py + 40); x.stroke();
        }
      });
      y += 58 * Math.ceil(defs.length / 7) + 22;
    }
    texture.needsUpdate = true;
  }

  function drawLocIcon(x, loc, cx, cy) {
    x.save(); x.translate(cx, cy);
    x.strokeStyle = "#6b5a48"; x.lineWidth = 3; x.lineJoin = "round"; x.lineCap = "round";
    x.beginPath();
    if (loc === "fridge") { x.rect(-12, -20, 24, 40); x.moveTo(-12, -6); x.lineTo(12, -6); x.moveTo(-6, -14); x.lineTo(-6, -10); x.moveTo(-6, 0); x.lineTo(-6, 8); }
    else if (loc === "cupboard") { x.rect(-18, -14, 36, 26); x.moveTo(0, -14); x.lineTo(0, 12); x.moveTo(-4, -2); x.lineTo(-4, 2); x.moveTo(4, -2); x.lineTo(4, 2); }
    else if (loc === "sabzi") { x.moveTo(-19, -4); x.lineTo(19, -4); x.lineTo(14, 16); x.lineTo(-14, 16); x.closePath(); x.moveTo(-9, -4); x.lineTo(-2, -16); x.moveTo(9, -4); x.lineTo(2, -16); }
    else { x.moveTo(-6, -18); x.lineTo(6, -18); x.lineTo(3, -12); x.bezierCurveTo(16, -6, 18, 18, 0, 18); x.bezierCurveTo(-18, 18, -16, -6, -3, -12); x.closePath(); }
    x.stroke();
    x.restore();
  }

  function markCollected(id) {
    const el = slotEls[id];
    if (el) el.classList.add("got");
    drawCard();
  }

  // ---------------------------------------------------------------- tweens
  const tweens = [];
  const tween = (dur, update, done) => { const t = { t: 0, dur, update, done, dead: false }; tweens.push(t); return t; };
  const runTweens = (dt) => {
    for (let i = tweens.length - 1; i >= 0; i--) {
      const tw = tweens[i];
      if (tw.dead) { tweens.splice(i, 1); continue; }
      tw.t = Math.min(tw.dur, tw.t + dt);
      tw.update(tw.t / tw.dur);
      if (tw.t >= tw.dur) { tweens.splice(i, 1); if (tw.done) tw.done(); }
    }
  };

  // ---------------------------------------------------------------- player state
  const pos = new THREE.Vector3(0.05, 0, 1.45);
  const vel = new THREE.Vector2();
  let yaw = 0, pitch = -0.12, bobPhase = 0, stepDist = 0, bob = 0;
  let playing = false, touchMode = false, lockedOnce = false, dragLook = false;
  let shadowsDirty = true, lastYaw = 0, swayYaw = 0, swayPitch = 0, lastPitch = -0.12;
  const keys = new Set();
  const joy = { id: null, ox: 0, oy: 0, x: 0, y: 0 };
  const look = { id: null, lx: 0, ly: 0, sx: 0, sy: 0, t: 0, moved: false };

  function collide(p) {
    const R = 0.28;
    p.x = clamp(p.x, ROOM.x0 + R, ROOM.x1 - R);
    p.z = clamp(p.z, ROOM.z0 + R, ROOM.z1 - R);
    for (const b of S.K.colliders) {
      const cx = clamp(p.x, b[0], b[1]), cz = clamp(p.z, b[2], b[3]);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-10) {
        const d = Math.sqrt(d2);
        p.x = cx + (dx / d) * R; p.z = cz + (dz / d) * R;
      } else {
        const pen = [p.x - b[0], b[1] - p.x, p.z - b[2], b[3] - p.z];
        const m = Math.min(...pen);
        if (m === pen[0]) p.x = b[0] - R; else if (m === pen[1]) p.x = b[1] + R;
        else if (m === pen[2]) p.z = b[2] - R; else p.z = b[3] + R;
      }
    }
  }

  function move(dt) {
    let fx = 0, fz = 0;
    if (keys.has("KeyW") || keys.has("ArrowUp")) fz += 1;
    if (keys.has("KeyS") || keys.has("ArrowDown")) fz -= 1;
    if (keys.has("KeyA") || keys.has("ArrowLeft")) fx -= 1;
    if (keys.has("KeyD") || keys.has("ArrowRight")) fx += 1;
    fx += joy.x; fz += joy.y;
    const len = Math.hypot(fx, fz);
    if (len > 1) { fx /= len; fz /= len; }
    const speed = keys.has("ShiftLeft") || keys.has("ShiftRight") ? 2.6 : 1.6;
    const sy = Math.sin(yaw), cy = Math.cos(yaw);
    const tx = (-sy * fz + cy * fx) * speed, tz = (-cy * fz - sy * fx) * speed;
    const a = 1 - Math.exp(-dt * 10);
    vel.x += (tx - vel.x) * a; vel.y += (tz - vel.y) * a;
    pos.x += vel.x * dt; pos.z += vel.y * dt;
    collide(pos);
    const sp = Math.hypot(vel.x, vel.y);
    bobPhase += sp * dt * 5.4;
    bob = Math.sin(bobPhase) * 0.014 * Math.min(1, sp / 1.6);
    stepDist += sp * dt;
    if (stepDist > 0.62) { stepDist = 0; Sound.step(); }
  }

  function syncView() {
    const { camera, vmRoot, basket } = S;
    camera.position.set(pos.x, EYE + bob, pos.z);
    camera.rotation.set(pitch, yaw, 0);
    camera.updateMatrixWorld();
    vmRoot.matrix.copy(camera.matrixWorld);
    vmRoot.matrixWorldNeedsUpdate = true;
    // basket sways with walking and lags a touch behind fast turns
    swayYaw += (yaw - lastYaw - swayYaw) * 0.2;
    swayPitch += (pitch - lastPitch - swayPitch) * 0.2;
    lastYaw = yaw; lastPitch = pitch;
    basket.position.set(
      0.25 + Math.sin(bobPhase * 0.5) * 0.006 + clamp(swayYaw, -0.05, 0.05) * 0.4,
      -0.34 + Math.abs(Math.cos(bobPhase * 0.5)) * 0.006 - clamp(swayPitch, -0.05, 0.05) * 0.3,
      -0.58
    );
    S.vm.updateMatrixWorld();
  }

  // ---------------------------------------------------------------- picking
  const ray = new THREE.Raycaster();
  ray.far = REACH;
  const ndc = new THREE.Vector2();
  function pickAt(x, y) {
    ndc.set(x, y);
    ray.setFromCamera(ndc, S.camera);
    const hits = ray.intersectObjects(S.pickables, true);
    for (const h of hits) {
      let o = h.object;
      while (o && !o.userData.interact && !o.userData.block) o = o.parent;
      if (!o) continue;
      if (o.userData.block) return null;
      return o;
    }
    return null;
  }

  let hover = null;
  function setHover(o) {
    if (o === hover) return;
    if (hover && hover.userData.interact && hover.userData.interact.type === "item") glowItem(hover, 0);
    hover = o;
    const type = hover ? hover.userData.interact.type : null;
    ui.reticle.className = "fl-reticle" + (type ? " on " + (type === "item" ? "grab" : type) : "");
  }
  function glowItem(o, k) {
    const st = S.items[o.userData.interact.id];
    if (!st) return;
    for (const m of st.mats) { m.emissive.setHex(0x8a5a1c); m.emissiveIntensity = k; }
  }

  function interactAt(x, y) {
    if (!playing) return;
    const o = pickAt(x, y);
    if (!o) return;
    const it = o.userData.interact;
    if (it.type === "item") collect(o);
    else if (it.type === "door") toggleDoor(it.door);
    else if (it.type === "place") unload();
  }

  function toggleDoor(d) {
    d.open = !d.open;
    if (d.tw) d.tw.dead = true;
    const from = d.pivot.rotation.y, to = d.open ? d.openAngle : 0;
    d.tw = tween(d.kind === "fridge" ? 0.75 : 0.55, (k) => { d.pivot.rotation.y = from + (to - from) * ease(k); shadowsDirty = true; });
    if (d.kind === "fridge") {
      Sound.fridge(d.open);
      const l0 = S.K.fridgeLight.intensity, l1 = d.open ? 0.9 : 0;
      if (d.lw) d.lw.dead = true;
      d.lw = tween(0.35, (k) => {
        S.K.fridgeLight.intensity = l0 + (l1 - l0) * k;
        S.K.lamp.material.emissiveIntensity = (l0 + (l1 - l0) * k) * 1.4;
      });
    } else {
      Sound.cabinet(d.open);
    }
  }

  // ---------------------------------------------------------------- collecting
  const slots = (() => {
    const s = [];
    const ring = (n, r, y, a0) => {
      for (let i = 0; i < n; i++) {
        const a = a0 + (i / n) * Math.PI * 2;
        s.push({ pos: new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r), ry: -a + Math.PI / 2 });
      }
    };
    ring(1, 0, 0.016, 0); ring(6, 0.05, 0.016, 0.3); ring(8, 0.092, 0.03, 0.1); ring(6, 0.045, 0.052, 0.6);
    return s;
  })();
  let basketCount = 0, tableReady = false, unloading = false, placed = 0;

  function collect(o) {
    const id = o.userData.interact.id, st = S.items[id];
    if (!st || st.collected || st.flying) return;
    st.flying = true;
    glowItem(o, 0);
    setHover(null);
    S.pickables.splice(S.pickables.indexOf(o), 1);
    Sound.pick();
    S.scene.attach(o);
    const startP = o.position.clone(), startQ = o.quaternion.clone();
    const slot = slots[basketCount++];
    const scaleTo = SLOT_R / st.radius;
    const slotQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, slot.ry, 0));
    const tp = new THREE.Vector3(), tq = new THREE.Quaternion(), bq = new THREE.Quaternion();
    tween(0.62, (k) => {
      const e = ease(k);
      tp.copy(slot.pos); S.basket.localToWorld(tp);
      S.basket.getWorldQuaternion(bq); tq.copy(bq).multiply(slotQ);
      o.position.lerpVectors(startP, tp, e);
      o.position.y += Math.sin(Math.PI * k) * 0.12;
      o.quaternion.copy(startQ).slerp(tq, e);
      o.scale.setScalar(1 + (scaleTo - 1) * e);
      shadowsDirty = true;
    }, () => {
      S.basket.attach(o);
      o.position.copy(slot.pos);
      o.quaternion.copy(slotQ);
      o.scale.setScalar(scaleTo);
      o.traverse((m) => { if (m.isMesh) m.castShadow = false; });
      st.flying = false; st.collected = true;
      markCollected(id);
      Sound.collect();
      if (ITEMS.every((d) => S.items[d.id].collected)) basketFull();
    });
  }

  function basketFull() {
    tableReady = true;
    ui.strip.classList.add("complete");
    Sound.ready();
    S.K.tableTop.userData.interact = { type: "place" };
    S.pickables.push(S.K.tableTop);
  }

  function unload() {
    if (!tableReady || unloading) return;
    unloading = true;
    S.pickables.splice(S.pickables.indexOf(S.K.tableTop), 1);
    setHover(null);
    ITEMS.forEach((def, i) => later(() => flyToTable(def.id), i * 90));
  }

  function flyToTable(id) {
    const o = S.items[id].obj;
    S.scene.attach(o);
    o.traverse((m) => { if (m.isMesh) m.castShadow = !!m.userData.cast; });
    const [x, y, z, ry] = TABLE[id];
    const startP = o.position.clone(), startQ = o.quaternion.clone(), s0 = o.scale.x;
    const end = new THREE.Vector3(x, y, z);
    const endQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, ry, 0));
    tween(0.7, (k) => {
      const e = ease(k);
      o.position.lerpVectors(startP, end, e);
      o.position.y += Math.sin(Math.PI * k) * 0.15;
      o.quaternion.copy(startQ).slerp(endQ, e);
      o.scale.setScalar(s0 + (1 - s0) * e);
      shadowsDirty = true;
    }, () => {
      Sound.place();
      if (++placed === ITEMS.length) finish();
    });
  }

  function finish() {
    Sound.done();
    tween(0.8, (k) => { S.glow.material.opacity = 0.55 * (1 - k); });
    tableReady = false;
    later(() => ui.done.classList.add("show"), 400);
  }

  // ---------------------------------------------------------------- input
  function setPlaying(v) {
    playing = v;
    ui.start.classList.toggle("hide", v);
    if (!v) { keys.clear(); joy.id = null; joy.x = joy.y = 0; look.id = null; ui.joy.classList.remove("on"); setHover(null); }
  }
  function lockFailed() { if (!lockedOnce) { dragLook = true; setPlaying(true); } }
  function begin() {
    Sound.init();
    if (touchMode) { setPlaying(true); return; }
    try {
      const p = canvas.requestPointerLock();
      if (p && p.catch) p.catch(lockFailed);
    } catch (e) { lockFailed(); }
  }
  const markTouch = () => { if (!touchMode) { touchMode = true; root.classList.add("touch"); } };
  const clampPitch = () => { pitch = clamp(pitch, -1.35, 1.2); };

  function setupInput() {
    resize();
    if (window.ResizeObserver) { ro = new ResizeObserver(resize); ro.observe(ui.stage); }
    on(window, "resize", resize);
    if (window.matchMedia && window.matchMedia("(pointer: coarse)").matches) markTouch();

    on(ui.start, "pointerdown", (e) => { if (e.pointerType === "touch") markTouch(); });
    on(ui.start, "click", begin);
    on(ui.start, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); begin(); } });

    on(document, "pointerlockchange", () => {
      const locked = document.pointerLockElement === canvas;
      if (locked) { lockedOnce = true; dragLook = false; setPlaying(true); }
      else if (!dragLook && !touchMode) setPlaying(false);
    });
    on(document, "pointerlockerror", lockFailed);
    on(document, "mousemove", (e) => {
      if (document.pointerLockElement !== canvas) return;
      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      clampPitch();
    });

    on(canvas, "contextmenu", (e) => e.preventDefault());
    on(canvas, "pointerdown", (e) => {
      if (e.pointerType === "touch") markTouch();
      if (!playing) return;
      if (document.pointerLockElement === canvas) { if (e.button === 0) interactAt(0, 0); return; }
      const r = canvas.getBoundingClientRect();
      const lx = e.clientX - r.left, ly = e.clientY - r.top;
      if (touchMode && lx < r.width * 0.42 && joy.id === null) {
        joy.id = e.pointerId; joy.ox = e.clientX; joy.oy = e.clientY;
        ui.joy.style.left = lx + "px"; ui.joy.style.top = ly + "px";
        ui.joyKnob.style.transform = "translate(0px, 0px)";
        ui.joy.classList.add("on");
      } else if (look.id === null) {
        look.id = e.pointerId; look.lx = look.sx = e.clientX; look.ly = look.sy = e.clientY;
        look.t = performance.now(); look.moved = false;
      }
      try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
    });
    on(canvas, "pointermove", (e) => {
      if (e.pointerId === joy.id) {
        const dx = e.clientX - joy.ox, dy = e.clientY - joy.oy;
        const m = Math.min(1, Math.hypot(dx, dy) / 55), a = Math.atan2(dy, dx);
        joy.x = Math.cos(a) * m; joy.y = -Math.sin(a) * m;
        ui.joyKnob.style.transform = `translate(${Math.cos(a) * m * 34}px, ${Math.sin(a) * m * 34}px)`;
      } else if (e.pointerId === look.id) {
        const dx = e.clientX - look.lx, dy = e.clientY - look.ly;
        look.lx = e.clientX; look.ly = e.clientY;
        const sens = touchMode ? 0.0055 : 0.004;
        yaw -= dx * sens; pitch -= dy * sens; clampPitch();
        if (Math.hypot(e.clientX - look.sx, e.clientY - look.sy) > 8) look.moved = true;
      }
    });
    const endPointer = (e) => {
      if (e.pointerId === joy.id) {
        joy.id = null; joy.x = joy.y = 0; ui.joy.classList.remove("on");
      } else if (e.pointerId === look.id) {
        look.id = null;
        if (!look.moved && performance.now() - look.t < 350) {
          const r = canvas.getBoundingClientRect();
          interactAt(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
        }
      }
    };
    on(canvas, "pointerup", endPointer);
    on(canvas, "pointercancel", endPointer);

    const MOVE = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "ShiftLeft", "ShiftRight"]);
    on(window, "keydown", (e) => {
      if (!playing) return;
      if (MOVE.has(e.code)) { keys.add(e.code); e.preventDefault(); }
      if (e.code === "KeyE" || e.code === "Space") { e.preventDefault(); interactAt(0, 0); }
    });
    on(window, "keyup", (e) => keys.delete(e.code));
    on(window, "blur", () => keys.clear());
  }

  function resize() {
    if (!renderer) return;
    const w = ui.stage.clientWidth, h = ui.stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    S.camera.aspect = w / h;
    S.camera.updateProjectionMatrix();
  }

  // ---------------------------------------------------------------- main loop
  let last = performance.now(), time = 0;
  function frame(now) {
    if (dead) return;
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now; time += dt;
    if (playing) move(dt);
    syncView();
    runTweens(dt);
    if (playing && !touchMode) setHover(pickAt(0, 0));
    if (hover && hover.userData.interact && hover.userData.interact.type === "item") glowItem(hover, 0.22 + 0.14 * Math.sin(time * 6));
    if (tableReady && !unloading) S.glow.material.opacity = 0.32 + 0.2 * Math.sin(time * 3);
    if (shadowsDirty) { renderer.shadowMap.needsUpdate = true; shadowsDirty = false; }
    renderer.clear();
    renderer.render(S.scene, S.camera);
    renderer.clearDepth();
    renderer.render(S.vm, S.camera);
  }

  function ready() {
    ui.loading.classList.add("hide");
    ui.start.classList.remove("hide");
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- teardown
  return function dispose() {
    dead = true;
    ac.abort();
    cancelAnimationFrame(raf);
    timers.forEach((id) => window.clearTimeout(id));
    timers.clear();
    try { if (canvas && document.pointerLockElement === canvas) document.exitPointerLock(); } catch (e) {}
    try { if (ro) ro.disconnect(); } catch (e) {}
    Sound.close();
    try { if (envRT) envRT.dispose(); } catch (e) {}
    try { if (renderer) { renderer.dispose(); if (renderer.forceContextLoss) renderer.forceContextLoss(); } } catch (e) {}
    if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
  };
}
