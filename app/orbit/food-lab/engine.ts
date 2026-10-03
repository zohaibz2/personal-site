// @ts-nocheck
/* eslint-disable */
// The Biryani Kitchen. Stage 1: walk a Karachi kitchen in first person and
// gather every ingredient for a chicken biryani. Stage 2 (prep): light the
// stove (pick up the lighter, open the gas, click until it catches, turn the
// flame down until it burns steady), then slice the onions: bring one to the
// board and pick up the knife, and the view settles over the board with the
// knife following your mouse or finger. Push it down through the onion to
// trim the tip and the root, swipe sideways to peel, then slice it into
// rings. No text anywhere: the HUD is pictures, and guidance is a soft glow
// on the next thing to use.
//
// Testing shortcuts: /orbit/food-lab?stage=2 starts with everything already
// unloaded on the prep table; ?step=slice also has the stove already lit.
// root.dataset (phase, stove, gas, hold, cut, slices, view) mirrors the game state
// for the test kit; it is never shown on screen.
import * as THREE from "three";
import { makeTextures } from "./kitchen/textures";
import { buildKitchen, ITEMS, TABLE, ROOM, COUNTER_TOP } from "./kitchen/kitchen";
import { buildHandBasket } from "./kitchen/props";
import { buildBurnerFlame } from "./kitchen/flame";
import { buildOnionStation, CUT, TRIM_TIP, TRIM_ROOT, SLICE_T, radiusAt, zAt } from "./kitchen/onion";

const LOCS = ["fridge", "cupboard", "sabzi", "pantry"];
const LOC_ICONS = {
  fridge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2.5" width="12" height="19" rx="2"/><path d="M6 9.5h12M9 5.5v1.5M9 12.5v3"/></svg>',
  cupboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="3" width="15" height="18" rx="1.5"/><path d="M12 3v18M10 10.5v3M14 10.5v3"/></svg>',
  sabzi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5h18l-2.2 8.2A2 2 0 0 1 16.9 20H7.1a2 2 0 0 1-1.9-1.3z"/><path d="M8 10.5l3.2-6M16 10.5l-3.2-6M7 14.5h10"/></svg>',
  pantry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 3.5h7l-1.6 3.2c3.2 1.6 5.1 4.6 5.1 8.6 0 3.6-2.7 5.7-7 5.7s-7-2.1-7-5.7c0-4 1.9-7 5.1-8.6z"/><path d="M9.4 6.7h5.2"/></svg>',
};

// Stage 2 steps, shown as pictograms at the top once the ingredients are out.
const STEPS = ["light", "slice", "fry", "marinate"];
const STEP_ICONS = {
  // a flame over a burner
  light: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c2.2 2.6 4 4.7 4 7.3a4 4 0 0 1-8 0c0-1.4.6-2.6 1.5-3.4.2 1.3.9 2.2 1.8 2.5-.4-2.3.1-4.5.7-6.4z"/><path d="M4.5 17.5h15M7 21h10"/></svg>',
  // an onion and a knife
  slice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="15" r="5.5"/><path d="M9 9.5c-1.7 1.5-2.4 3.3-2.4 5.5s.7 4 2.4 5.5M9 9.5c1.7 1.5 2.4 3.3 2.4 5.5s-.7 4-2.4 5.5M9 9.5V8"/><path d="M13.5 11.5L20.5 3.5c.8 2.9-.3 5.9-3.3 8.1l-1.4 1.1z"/></svg>',
  // a degchi with heat rising
  fry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 12h15v4a4 4 0 0 1-4 4h-7a4 4 0 0 1-4-4z"/><path d="M2.5 13h2M19.5 13h2"/><path d="M8.5 9c-.9-1-.9-2 0-3M12 9c-.9-1-.9-2 0-3s.9-2 0-3M15.5 9c-.9-1-.9-2 0-3"/></svg>',
  // a mixing bowl and spoon
  marinate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 12.5h17a8.5 8 0 0 1-17 0z"/><path d="M14.5 12.5l5-9"/><path d="M8 16c1.2.7 2.5 1 4 1"/></svg>',
};

// Gas knob: rotation.y from 0 (off) to KNOB_MAX (full). The flame burns
// steady when the gas sits inside BAND (as a 0..1 fraction of full).
const KNOB_MAX = 1.75;
const BAND = [0.42, 0.82];
const STEADY_S = 1.5;
// How a tool sits in the right hand of the first-person view.
const HAND_POSES = {
  lighter: { p: [0.17, -0.2, -0.36], r: [0, Math.PI / 2 + 0.3, -0.2, "YXZ"] },
};
// Board view (slicing): the camera settles over the chopping board and the
// mouse or a finger moves the knife. Metres of knife travel per pixel.
const KNIFE_PX = { lock: 0.00045, mouse: 0.0005, touch: 0.0007 };
const PEEL_PX = 170;   // sideways movement that tears off one half of the skin
const LIFT = 0.105;    // knife height above the board when raised (just clears the biggest onion)

const EYE = 1.62;
const REACH = 2.3;
const SLOT_R = 0.03;
const BASKET_S = 0.88;
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

// Soft environment shaped like this kitchen: the warm window to the north,
// the tube light above and a gentle bounce elsewhere. It drives ambient light
// and reflections, so it deliberately has no studio hot-spots.
function kitchenEnvironment() {
  const scene = new THREE.Scene();
  const g = new THREE.BoxGeometry();
  const room = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xc9bca8, side: THREE.BackSide, roughness: 1 }));
  room.scale.set(9, 5.5, 8); room.position.set(0, 2.75, 0);
  scene.add(room);
  const floor = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x8a7f70, roughness: 1 }));
  floor.scale.set(9, 0.1, 8); floor.position.set(0, 0.05, 0);
  scene.add(floor);
  const fill = new THREE.PointLight(0xfff0dc, 1.4, 30, 2);
  fill.position.set(0, 3.8, 0.5);
  scene.add(fill);
  const panel = (w, h, d, x, y, z, k, hex) => {
    const m = new THREE.MeshBasicMaterial({ color: hex });
    m.color.multiplyScalar(k);
    const b = new THREE.Mesh(g, m);
    b.scale.set(w, h, d); b.position.set(x, y, z);
    scene.add(b);
  };
  panel(2.6, 2.2, 0.05, -1.6, 2.4, -3.95, 7, 0xffe2bd); // window
  panel(2.4, 0.06, 0.25, 0, 5.4, -0.3, 5, 0xfff4e4);    // ceiling tube
  panel(3, 2.2, 0.05, 1.3, 1.6, 3.95, 0.9, 0xf3e6d2);   // bounce off the south wall
  return scene;
}

function makeMaterials(T) {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  const clear = (o) => phys(Object.assign({ transparent: true, depthWrite: false, metalness: 0 }, o));
  T.plaster.repeat.set(3, 2);
  T.brushed.repeat.set(3, 3);
  T.wicker.repeat.set(4, 1.5);
  T.burlap.repeat.set(2, 1);
  T.onion.repeat.set(2, 1);
  T.garlic.repeat.set(2, 1);
  T.terracotta.repeat.set(3, 1);
  return {
    floor: std({ map: T.floor, bumpMap: T.floorBump, bumpScale: 0.0015, roughness: 0.3 }),
    wall: std({ map: T.plaster, roughness: 0.92, envMapIntensity: 0.8, aoMap: T.wallAO, aoMapIntensity: 0.9 }),
    ceiling: std({ color: 0xf3f0e9, roughness: 0.95, envMapIntensity: 0.7, aoMap: T.wallAO, aoMapIntensity: 0.7 }),
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
    steel: std({ color: 0xd9dbdd, metalness: 1, roughness: 0.22 }),
    steelBrushed: std({ map: T.brushed, color: 0xd6d8da, metalness: 1, roughness: 0.34 }),
    aluminium: std({ color: 0xcfd1d3, metalness: 1, roughness: 0.38 }),
    tin: std({ color: 0xd4d6d8, metalness: 1, roughness: 0.3 }),
    brass: std({ color: 0xb48a3e, metalness: 1, roughness: 0.3 }),
    castIron: std({ color: 0x1b1b1b, metalness: 0.5, roughness: 0.6 }),
    knob: std({ color: 0x151515, roughness: 0.35 }),
    granite: phys({ map: T.granite, roughness: 0.24, clearcoat: 0.3, clearcoatRoughness: 0.14 }),
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
    // brushed rather than mirror steel: a mirror reflects the dim room and reads as black
    knife: std({ color: 0xdfe3e6, metalness: 0.6, roughness: 0.3, envMapIntensity: 1.3 }),
    knifeHandle: std({ color: 0x1a1512, roughness: 0.5 }),
    lighterBody: std({ color: 0xc8361d, roughness: 0.42 }),
    lighterGrip: std({ color: 0x262422, roughness: 0.6 }),
    onionSkin: std({ map: T.onion, roughness: 0.7, side: THREE.DoubleSide }),
    onionFlesh: phys({ map: T.onionFlesh, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.15 }),
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
    steps: $(".fl-steps"), back: $(".fl-back"), gesture: $(".fl-gesture"),
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
    stepDone() { [784, 988, 1175].forEach((f, i) => this.tone(f, 0.6, 0.045, "sine", i * 0.1)); },
    // stove
    click() { this.noise(0.025, 3800, 1.2, 0.09, "highpass"); this.tone(2200, 0.03, 0.025, "square"); },
    spark() { for (let i = 0; i < 3; i++) this.noise(0.018, 5200 + Math.random() * 1500, 2, 0.07, "bandpass", i * 0.022 + Math.random() * 0.01); },
    whoomph(k) {
      this.noise(0.55, 170, 0.7, 0.16 + 0.2 * k, "lowpass");
      this.noise(0.25, 900, 0.6, 0.05 + 0.06 * k, "bandpass", 0.03);
      this.tone(62, 0.45, 0.07 + 0.08 * k, "sine", 0, 30);
    },
    knobTick() { this.noise(0.015, 3200, 3, 0.05, "bandpass"); this.tone(1800, 0.02, 0.012, "triangle"); },
    puff() { this.noise(0.14, 260, 0.8, 0.06, "lowpass"); },
    // knife and board
    knifeUp() { this.tone(2400, 0.3, 0.012, "sine", 0, 300); this.noise(0.12, 5200, 1.5, 0.03, "highpass"); },
    chop() {
      this.noise(0.05, 190, 0.9, 0.2, "lowpass");            // the board
      this.noise(0.035, 2600, 1.4, 0.07, "bandpass", 0.005); // crisp onion
      this.tone(120, 0.06, 0.06, "triangle");
    },
    crunch(k = 1) { this.noise(0.03, 2300 + Math.random() * 900, 1.4, 0.07 * k, "bandpass"); },
    peel() { this.noise(0.2, 3600, 0.7, 0.06, "highpass"); this.noise(0.12, 1300, 0.9, 0.035, "bandpass", 0.03); },
    thud() { this.noise(0.02, 1500 + Math.random() * 500, 1.5, 0.025, "bandpass"); },
    // One looping noise source feeds two voices: the hiss of raw gas and the
    // low roar of a burning flame. Levels are set with gasSet(hiss, roar).
    gasSet(hiss, roar) {
      if (!this.ctx) return;
      const c = this.ctx, t = c.currentTime;
      if (!this.gas) {
        const s = c.createBufferSource(); s.buffer = this.buf; s.loop = true;
        const hp = c.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 2600;
        const hissG = c.createGain(); hissG.gain.value = 0;
        const bp = c.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = 380; bp.Q.value = 0.6;
        const roarG = c.createGain(); roarG.gain.value = 0;
        s.connect(hp); hp.connect(hissG); hissG.connect(this.master);
        s.connect(bp); bp.connect(roarG); roarG.connect(this.master);
        s.start();
        this.gas = { s, hissG, roarG };
      }
      this.gas.hissG.gain.setTargetAtTime(hiss, t, 0.08);
      this.gas.roarG.gain.setTargetAtTime(roar, t, 0.12);
    },
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
      this.gas = null;
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
    renderer.toneMappingExposure = 0.92;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = false;
    renderer.autoClear = false;
    renderer.localClippingEnabled = true; // the onion being sliced is clipped
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
    // a low sun, so the window throws a long warm streak across the prep table
    const sun = new THREE.DirectionalLight(0xffd7a3, 3.0);
    sun.position.set(-3.9, 2.65, -5.3);
    sun.target.position.set(0.0, 0.9, 0.2);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    const sc = sun.shadow.camera;
    sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 0.5; sc.far = 16;
    sun.shadow.bias = -0.0005;
    sun.shadow.normalBias = 0.025;
    scene.add(sun, sun.target);
    scene.add(new THREE.HemisphereLight(0xfff4e6, 0xb8a58c, 0.15));
    const lamp = new THREE.PointLight(0xfff1df, 0.45, 7, 2);
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
    vm.add(new THREE.HemisphereLight(0xfff4e6, 0x8a7a66, 0.35));
    const vmKey = new THREE.DirectionalLight(0xffe6c4, 0.75);
    vmKey.position.set(-1, 2, 1);
    vm.add(vmKey);
    const vmRoot = new THREE.Group();
    vmRoot.matrixAutoUpdate = false;
    vm.add(vmRoot);
    const basket = buildHandBasket(M);
    basket.position.set(0.27, -0.35, -0.6);
    basket.rotation.set(0.42, -0.25, 0.05);
    basket.scale.setScalar(BASKET_S);
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

    // ---- stage 2: the stove. These only become interactive once prep starts.
    const glowMats = (o) => {
      const mats = [];
      o.traverse((m) => {
        if (!m.isMesh || !m.material || m.material.visible === false) return;
        m.material = m.material.clone();
        if (m.material.emissive) mats.push(m.material);
        m.userData.cast = m.castShadow;
      });
      return mats;
    };
    // the left burner is the free one (the degchi sits on the right)
    const knob = K.knobs[0];
    knob.pivot.userData.interact = { type: "knob" };
    S.knob = { pivot: knob.pivot, mats: glowMats(knob.pivot) };
    // tools you can pick up: each remembers where it rests so it can go back
    const tool = (name, obj) => {
      obj.userData.interact = { type: name };
      return { name, obj, mats: glowMats(obj), parent: obj.parent, home: obj.position.clone(), homeRy: obj.rotation.y, flying: false };
    };
    const L = K.lighter;
    S.tools = { lighter: tool("lighter", L), knife: tool("knife", K.knife) };
    S.lighter = S.tools.lighter;
    S.knife = S.tools.knife;
    const bc = K.burners[0];
    const burnerPick = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.09, 16), new THREE.MeshBasicMaterial({ visible: false }));
    burnerPick.position.set(bc.x, bc.y + 0.03, bc.z);
    burnerPick.userData.interact = { type: "burner" };
    scene.add(burnerPick);
    S.burnerPick = burnerPick;
    S.flame = buildBurnerFlame(bc);
    scene.add(S.flame.root);
    // a soft warm pool of light under whatever should be used next
    const hint = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
      map: glowTexture(), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    hint.rotation.x = -Math.PI / 2;
    hint.renderOrder = 2;
    hint.visible = false;
    hint.userData.hint = true;
    scene.add(hint);
    S.hint = hint;
    S.hintSpots = {
      lighter: [L.position.x + 0.02, COUNTER_TOP + 0.002, L.position.z, 0.36],
      knob: [knob.pivot.position.x, COUNTER_TOP + 0.0125, knob.pivot.position.z, 0.13],
      burner: [bc.x, COUNTER_TOP + 0.0125, bc.z, 0.3],
    };
    K.root.updateMatrixWorld(true);
    const onBoard = (x, z, size) => {
      const v = new THREE.Vector3(x, 0.024 + 0.002, z);
      K.board.localToWorld(v);
      return [v.x, v.y, v.z, size];
    };
    S.hintSpots.knife = onBoard(K.knife.position.x + 0.08, K.knife.position.z - 0.02, 0.4);

    // The onion station sits on the chopping board's top surface, turned so
    // the onion lies left to right with its tip to the right: you slice from
    // the right end, the rings fall to the right, and the knife's handle
    // points at you. (Station z is board +x; station -x is board +z.)
    const station = buildOnionStation(M);
    station.root.position.set(-0.01, 0.024, -0.07);
    station.root.rotation.y = Math.PI / 2;
    K.board.add(station.root);
    S.station = station;
    S.boardCam = new THREE.PerspectiveCamera(66, 1, 0.03, 40); // only used to aim the board view
    S.knifeHomeQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, K.knife.rotation.y, 0));
    S.onions = S.items.onions;
    S.onionsLeft = S.onions.obj.children.slice();
    // the right hand, for holding tools in the first-person pass
    const hand = new THREE.Group();
    vmRoot.add(hand);
    S.hand = hand;
    setHandPose("lighter");
  }

  function setupEnvAndThumbs() {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envRT = pmrem.fromScene(kitchenEnvironment(), 0.04);
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
    tr.toneMappingExposure = 1.15;
    tr.setClearColor(0x000000, 0);
    const pm = new THREE.PMREMGenerator(tr);
    const env = pm.fromScene(roomEnvironment(), 0.04);
    const ts = new THREE.Scene();
    ts.environment = env.texture;
    const key = new THREE.DirectionalLight(0xffffff, 1.5);
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
  let phase = "gather", holding = null, basketDrop = 0, handJab = 0;
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
    if (board.blend > 0) {
      const e = ease(board.blend);
      camera.position.lerp(board.pos, e);
      camera.quaternion.slerp(board.q, e);
    }
    camera.updateMatrixWorld();
    vmRoot.matrix.copy(camera.matrixWorld);
    vmRoot.matrixWorldNeedsUpdate = true;
    // basket sways with walking and lags a touch behind fast turns
    swayYaw += (yaw - lastYaw - swayYaw) * 0.2;
    swayPitch += (pitch - lastPitch - swayPitch) * 0.2;
    lastYaw = yaw; lastPitch = pitch;
    basket.position.set(
      0.27 + Math.sin(bobPhase * 0.5) * 0.006 + clamp(swayYaw, -0.05, 0.05) * 0.4,
      -0.35 + Math.abs(Math.cos(bobPhase * 0.5)) * 0.006 - clamp(swayPitch, -0.05, 0.05) * 0.3 - basketDrop,
      -0.6
    );
    // a held tool sways the same way, and the lighter jabs forward when used
    const hp = handPose.p;
    S.hand.position.set(
      hp[0] + Math.sin(bobPhase * 0.5) * 0.005 + clamp(swayYaw, -0.05, 0.05) * 0.35,
      hp[1] + Math.abs(Math.cos(bobPhase * 0.5)) * 0.005 - clamp(swayPitch, -0.05, 0.05) * 0.3,
      hp[2] - handJab * 0.035
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
  const RETICLE = { item: "grab", lighter: "grab", knife: "grab", knob: "turn", burner: "spark", door: "door", place: "place" };
  function setHover(o) {
    if (o === hover) return;
    if (hover && hover.userData.interact && hover.userData.interact.type === "item") glowItem(hover, 0);
    hover = o;
    const type = hover ? hover.userData.interact.type : null;
    ui.reticle.className = "fl-reticle" + (type ? " on " + (RETICLE[type] || type) : "");
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
    if (it.type === "item" && phase === "slice") { if (it.id === "onions") bringOnion(); }
    else if (it.type === "item") collect(o);
    else if (it.type === "door") toggleDoor(it.door);
    else if (it.type === "place") unload();
    else if (it.type === "lighter") takeTool("lighter");
    else if (it.type === "knife") enterBoard();
    else if (it.type === "knob") knobClick();
    else if (it.type === "burner") clickLighter();
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
    if (o.userData.blob) o.userData.blob.visible = false;
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
      o.scale.setScalar(1 + (scaleTo * BASKET_S - 1) * e);
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
      const b = o.userData.blob;
      if (b) { b.position.set(x, y + 0.0015, z); b.visible = true; }
      Sound.place();
      if (++placed === ITEMS.length) finish();
    });
  }

  function finish() {
    Sound.done();
    tween(0.8, (k) => { S.glow.material.opacity = 0.55 * (1 - k); });
    tableReady = false;
    later(() => ui.done.classList.add("show"), 400);
    later(beginPrep, 3200);
  }

  // ================================================================ STAGE 2: PREP
  // Put the basket down, swap the ingredient strip for the step pictograms
  // and start the first step: lighting the stove.
  function beginPrep() {
    ui.done.classList.remove("show");
    ui.strip.classList.add("away");
    tween(0.7, (k) => { basketDrop = ease(k) * 0.45; }, () => { S.basket.visible = false; });
    enterLight();
  }

  // ?stage=2 jumps straight here, with everything already unloaded on the table.
  function skipGather() {
    for (const def of ITEMS) {
      const st = S.items[def.id], o = st.obj;
      const [x, y, z, ry] = TABLE[def.id];
      o.position.set(x, y, z);
      o.rotation.set(0, ry, 0);
      if (o.userData.blob) { o.userData.blob.position.set(x, y + 0.0015, z); o.userData.blob.visible = true; }
      st.collected = true;
      const i = S.pickables.indexOf(o);
      if (i >= 0) S.pickables.splice(i, 1);
      if (slotEls[def.id]) slotEls[def.id].classList.add("got");
    }
    basketCount = placed = ITEMS.length;
    basketDrop = 0.45;
    S.basket.visible = false;
    ui.strip.classList.add("away");
    shadowsDirty = true;
    drawCard();
    enterLight();
  }

  const stepEls = {};
  function buildSteps() {
    if (!ui.steps) return;
    ui.steps.innerHTML = "";
    for (const s of STEPS) {
      const el = document.createElement("span");
      el.className = "fl-step";
      el.innerHTML = STEP_ICONS[s];
      ui.steps.appendChild(el);
      stepEls[s] = el;
    }
    ui.steps.classList.add("show");
  }
  function setStep(s, state) {
    const el = stepEls[s];
    if (!el) return;
    el.classList.toggle("now", state === "now");
    el.classList.toggle("got", state === "got");
  }

  const stove = { angle: 0, flow: 0, lit: false, done: false, gasAccum: 0, gasTries: 0, steady: 0, tick: 0, tw: null, hiss: -1, roar: -1 };
  const inBand = () => stove.flow >= BAND[0] && stove.flow <= BAND[1];
  const addPick = (o) => { if (S.pickables.indexOf(o) < 0) S.pickables.push(o); };
  const dropPick = (o) => { const i = S.pickables.indexOf(o); if (i >= 0) S.pickables.splice(i, 1); if (hover === o) setHover(null); };

  function enterLight() {
    phase = "light";
    buildSteps();
    setStep("light", "now");
    addPick(S.lighter.obj);
    addPick(S.knob.pivot);
  }

  // What should glow next: the lighter, then the knob, then the burner; once
  // lit, the knob again until the flame is turned down to a steady burn.
  function guideTarget() {
    if (phase === "slice") {
      if (ob.done || board.on) return null;
      if (!ob.started) return "onions";
      return "knife";
    }
    if (phase !== "light" || stove.done) return null;
    if (stove.lit) return inBand() ? null : "knob";
    if (holding !== "lighter") return S.lighter.flying ? null : "lighter";
    return stove.flow < 0.3 ? "knob" : "burner";
  }

  function updateGuide(time) {
    const target = guideTarget();
    const pulse = 0.5 + 0.5 * Math.sin(time * 3.2);
    const hovered = (o) => hover === o;
    const set = (mats, k) => { for (const m of mats) { m.emissive.setHex(0x8a5a1c); m.emissiveIntensity = k; } };
    const hk = 0.22 + 0.14 * Math.sin(time * 6);
    set(S.lighter.mats, holding ? 0 : hovered(S.lighter.obj) ? hk : target === "lighter" ? 0.08 + 0.14 * pulse : 0);
    set(S.knob.mats, hovered(S.knob.pivot) ? hk + 0.2 : target === "knob" ? 0.15 + 0.35 * pulse : 0);
    set(S.knife.mats, board.on ? 0 : hovered(S.knife.obj) ? hk : target === "knife" ? 0.08 + 0.14 * pulse : 0);
    if (phase === "slice" && !ob.started) set(S.onions.mats, hovered(S.onions.obj) ? hk : target === "onions" ? 0.08 + 0.14 * pulse : 0);
    const spot = target && S.hintSpots[target];
    S.hint.visible = !!spot;
    if (spot) {
      S.hint.position.set(spot[0], spot[1], spot[2]);
      S.hint.scale.set(spot[3], spot[3], 1);
      S.hint.material.opacity = 0.22 + 0.3 * pulse;
    }
  }

  // ---- tools (the lighter, the knife): picked up into the right hand, and
  // put back where they came from when their step is done
  let handPose = HAND_POSES.lighter;
  function setHandPose(name) {
    handPose = HAND_POSES[name];
    const r = handPose.r;
    S.hand.rotation.set(r[0], r[1], r[2], r[3]);
  }

  function takeTool(name) {
    const t = S.tools[name];
    if (holding || t.flying) return;
    if (name === "lighter" && phase !== "light") return;
    const o = t.obj;
    t.flying = true;
    dropPick(o);
    if (o.userData.blob) o.userData.blob.visible = false;
    setHandPose(name);
    Sound.pick();
    S.scene.attach(o);
    const startP = o.position.clone(), startQ = o.quaternion.clone();
    const tp = new THREE.Vector3(), tq = new THREE.Quaternion();
    tween(0.55, (k) => {
      const e = ease(k);
      S.hand.getWorldPosition(tp);
      S.hand.getWorldQuaternion(tq);
      o.position.lerpVectors(startP, tp, e);
      o.position.y += Math.sin(Math.PI * k) * 0.08;
      o.quaternion.copy(startQ).slerp(tq, e);
      shadowsDirty = true;
    }, () => {
      S.hand.attach(o);
      o.position.set(0, 0, 0);
      o.rotation.set(0, 0, 0);
      o.traverse((m) => { if (m.isMesh) m.castShadow = false; });
      t.flying = false;
      holding = name;
      if (name === "lighter") { if (!stove.lit) addPick(S.burnerPick); Sound.collect(); }
    });
  }

  function returnTool(name) {
    const t = S.tools[name];
    if (holding !== name) return;
    const o = t.obj;
    holding = null;
    t.flying = true;
    if (name === "lighter") dropPick(S.burnerPick);
    S.scene.attach(o);
    const startP = o.position.clone(), startQ = o.quaternion.clone();
    const endP = t.parent.localToWorld(t.home.clone());
    const endQ = t.parent.getWorldQuaternion(new THREE.Quaternion())
      .multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, t.homeRy, 0)));
    tween(0.65, (k) => {
      const e = ease(k);
      o.position.lerpVectors(startP, endP, e);
      o.position.y += Math.sin(Math.PI * k) * 0.1;
      o.quaternion.copy(startQ).slerp(endQ, e);
      shadowsDirty = true;
    }, () => {
      t.parent.attach(o);
      o.position.copy(t.home);
      o.rotation.set(0, t.homeRy, 0);
      o.traverse((m) => { if (m.isMesh) m.castShadow = !!m.userData.cast; });
      if (o.userData.blob) o.userData.blob.visible = true;
      t.flying = false;
      Sound.place();
    });
  }

  // One squeeze of the trigger: a jab, a click, sparks at the burner. With gas
  // flowing it may catch; it always catches by the third try with gas.
  let jabTw = null;
  function clickLighter() {
    if (holding !== "lighter" || stove.lit) return;
    Sound.click();
    if (jabTw) jabTw.dead = true;
    const trig = S.lighter.obj.userData.trigger;
    jabTw = tween(0.18, (k) => {
      handJab = Math.sin(Math.PI * k);
      if (trig) trig.position.y = 0.0065 + 0.004 * handJab;
    });
    later(() => {
      if (stove.lit) return;
      S.flame.spark();
      Sound.spark();
      if (stove.flow > 0.08) {
        stove.gasTries++;
        if (stove.gasTries >= 3 || Math.random() < clamp(0.3 + stove.flow * 0.45, 0, 0.85)) ignite();
      }
    }, 60);
  }

  function ignite() {
    const k = clamp(stove.gasAccum / 2, 0, 1);
    stove.lit = true;
    stove.gasAccum = 0; stove.gasTries = 0; stove.steady = 0;
    S.flame.ignite(k);
    Sound.whoomph(k);
    dropPick(S.burnerPick);
  }

  function extinguish() {
    stove.lit = false;
    stove.gasTries = 0; stove.steady = 0;
    Sound.puff();
    if (holding === "lighter") addPick(S.burnerPick);
  }

  // ---- the gas knob: drag to turn it, or click for a quick turn
  function setKnob(a) {
    stove.angle = clamp(a, 0, KNOB_MAX);
    stove.flow = stove.angle / KNOB_MAX;
    S.knob.pivot.rotation.y = stove.angle;
    const tick = Math.floor(stove.angle / 0.22 + 0.001);
    if (tick !== stove.tick) { stove.tick = tick; Sound.knobTick(); }
  }

  function knobClick() {
    if (phase !== "light" || stove.done) return;
    let to;
    if (stove.angle < 0.05) to = KNOB_MAX;                    // off: open it right up
    else if (stove.lit) to = inBand() ? 0 : KNOB_MAX * 0.62;  // lit: settle it to a steady flame
    else to = 0;                                              // gas on, no flame: shut it
    if (stove.tw) stove.tw.dead = true;
    const from = stove.angle;
    stove.tw = tween(0.45, (k) => setKnob(from + (to - from) * ease(k)), () => { stove.tw = null; });
  }

  const dial = { on: false, id: null, lock: false, lx: 0, moved: 0, t: 0 };
  const isKnob = (o) => !!(o && o.userData.interact && o.userData.interact.type === "knob");
  function startDial(id, lock, x) {
    if (phase !== "light" || stove.done) return false;
    if (stove.tw) { stove.tw.dead = true; stove.tw = null; }
    Object.assign(dial, { on: true, id, lock, lx: x, moved: 0, t: performance.now() });
    return true;
  }
  function dialMove(dx) {
    dial.moved += Math.abs(dx);
    setKnob(stove.angle - dx * (touchMode ? 0.011 : 0.0075)); // drag left to open
  }
  function endDial(cancel) {
    const tapped = !cancel && dial.moved < 6 && performance.now() - dial.t < 400;
    dial.on = false; dial.id = null;
    if (tapped) knobClick();
  }

  function lightDone() {
    stove.done = true;
    Sound.stepDone();
    setStep("light", "got");
    dropPick(S.knob.pivot);
    dropPick(S.burnerPick);
    if (dial.on) endDial(true);
    later(() => returnTool("lighter"), 700);
    later(enterSlice, 1500);
  }

  // Runs every frame during the stove step.
  function updateStove(dt) {
    const gasOn = stove.flow > 0.08;
    if (!stove.lit) stove.gasAccum = gasOn ? Math.min(3, stove.gasAccum + stove.flow * dt) : Math.max(0, stove.gasAccum - dt);
    if (stove.lit && stove.flow < 0.15) extinguish();
    if (stove.lit && !stove.done) {
      stove.steady = inBand() ? stove.steady + dt : 0;
      if (stove.steady >= STEADY_S) lightDone();
    }
    const hiss = stove.lit ? 0.01 * stove.flow : gasOn ? 0.01 + 0.045 * stove.flow : 0;
    const roar = stove.lit ? 0.025 + 0.05 * stove.flow + (stove.flow > BAND[1] ? 0.03 : 0) : 0;
    if (Math.abs(hiss - stove.hiss) > 0.002 || Math.abs(roar - stove.roar) > 0.002) {
      stove.hiss = hiss; stove.roar = roar;
      Sound.gasSet(hiss, roar);
    }
  }

  // ================================================================ SLICE THE ONIONS
  // Bring an onion to the board, then pick up the knife: the view settles over
  // the board and the knife follows your mouse (or finger). Push it down
  // through the onion to cut, lift it to move on. Each onion is trimmed at the
  // tip and the root, peeled with two sideways swipes, then sliced into rings.
  // A click, tap or Space does one stroke for you.
  const ob = {
    state: "none",   // none, fly, tip, root, peel, slice
    started: false, done: false,
    ka: TRIM_TIP,    // where the blade is along the onion
    ky: LIFT,        // blade height above the board
    kx: CUT.x - 0.135, rock: 0, armed: true, half: 0, peel: 0, auto: null, crunchAt: 0,
  };
  const board = { on: false, blend: 0, kBlend: 0, pos: new THREE.Vector3(), q: new THREE.Quaternion(), drag: null, lastKy: -1 };
  // In station space the knife's heel sits on the -x side (towards you on the
  // board) and the blade runs along +x across the onion.
  const KX = CUT.x - 0.085;
  const seen = { cut: false, peel: false };
  const cutting = () => ob.state === "tip" || ob.state === "root" || ob.state === "slice";
  const topAt = (a) => S.station.onion.position.y + radiusAt(a, S.station.sq);
  const maxTop = (a0, a1) => { let m = 0; for (let i = 0; i <= 6; i++) m = Math.max(m, topAt(a0 + ((a1 - a0) * i) / 6)); return m; };
  const targetA = () => (ob.state === "tip" ? TRIM_TIP : ob.state === "root" ? TRIM_ROOT : S.station.aF - SLICE_T);
  const aligned = () => Math.abs(ob.ka - targetA()) <= 0.0004;

  function enterSlice() {
    if (phase === "slice") return;
    phase = "slice";
    setStep("slice", "now");
    const op = S.onions.obj.position;
    S.hintSpots.onions = [op.x, op.y + 0.002, op.z, 0.32];
    addPick(S.onions.obj);
    addPick(S.knife.obj);
  }

  // Fly the next whole onion from the table onto the board, lying on its side.
  function bringOnion() {
    if (phase !== "slice" || ob.done || ob.state !== "none") return;
    const o = S.onionsLeft.shift();
    if (!o) return;
    ob.started = true;
    ob.state = "fly";
    dropPick(S.onions.obj);
    for (const m of S.onions.mats) m.emissiveIntensity = 0;
    const blob = S.onions.obj.userData.blob;
    if (blob && !S.onionsLeft.length) blob.visible = false; // last one off the table
    Sound.pick();
    const st = S.station.root, sq = o.userData.sq || 1;
    S.scene.attach(o);
    st.updateWorldMatrix(true, false);
    const startP = o.position.clone(), startQ = o.quaternion.clone();
    const endP = st.localToWorld(new THREE.Vector3(CUT.x, radiusAt(0.04, sq), zAt(0)));
    const endQ = st.getWorldQuaternion(new THREE.Quaternion()).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0)));
    tween(0.6, (k) => {
      const e = ease(k);
      o.position.lerpVectors(startP, endP, e);
      o.position.y += Math.sin(Math.PI * k) * 0.12;
      o.quaternion.copy(startQ).slerp(endQ, e);
      shadowsDirty = true;
    }, () => {
      // swap for the board's own copy of this onion, which can be cut
      o.visible = false;
      S.station.newOnion(sq);
      ob.state = "tip";
      ob.ka = TRIM_TIP;
      ob.armed = false;
      shadowsDirty = true;
      Sound.place();
    });
  }

  function enterBoard() {
    if (phase !== "slice" || ob.done || board.on) return;
    board.on = true;
    holding = "knife";
    dropPick(S.knife.obj);
    setHover(null);
    root.classList.add("board");
    // aim the board view: where a cook stands, a little to the right so the
    // fresh cut face (towards the tip) is in view, looking down at the onion.
    // Station -x is towards you, station +z is to your right.
    const st = S.station.root, cam = S.boardCam;
    st.updateWorldMatrix(true, false);
    cam.position.copy(st.localToWorld(new THREE.Vector3(CUT.x - 0.25, 0.25, CUT.z + 0.1)));
    cam.lookAt(st.localToWorld(new THREE.Vector3(CUT.x - 0.005, 0.03, CUT.z + 0.02)));
    cam.updateMatrixWorld();
    board.pos.copy(cam.position);
    board.q.copy(cam.quaternion);
    ob.ky = LIFT;
    ob.auto = null;
    Sound.knifeUp();
    if (ob.state === "none") bringOnion();
  }

  function exitBoard() {
    if (!board.on) return;
    board.on = false;
    holding = null;
    board.drag = null;
    ob.auto = null;
    root.classList.remove("board");
    if (!ob.done) addPick(S.knife.obj);
  }

  // Move the knife (or peel) by a pointer movement of dx, dy pixels.
  function knifeMove(dx, dy, sens) {
    if (!board.on || board.kBlend < 0.98 || ob.auto) return;
    if (ob.state === "peel") { peelMove(Math.abs(dx) + Math.abs(dy) * 0.4); return; }
    if (!cutting()) return;
    ob.rock = clamp(ob.rock + dx * 0.0015, -0.1, 0.1);
    const top = topAt(ob.ka);
    let ky = clamp(ob.ky - dy * sens * (ob.ky < top ? 0.45 : 1), 0, LIFT); // the onion resists
    // the blade can't go back into the onion until it's lined up for the next cut
    if (!aligned() && ob.ky >= top + 0.003 && ky < top + 0.003) ky = top + 0.003;
    setKnifeY(ky);
  }

  function setKnifeY(ky) {
    const top = topAt(ob.ka), was = ob.ky;
    ob.ky = ky;
    if (ky >= top + 0.004) ob.armed = true;
    if (!ob.armed) return;
    if (was >= top && ky < top) { Sound.crunch(); ob.crunchAt = ky; }
    else if (ky < top && Math.abs(ky - ob.crunchAt) > 0.006) { ob.crunchAt = ky; Sound.crunch(0.5); }
    if (ky <= 0.0015 && aligned()) doCut();
  }

  function doCut() {
    ob.armed = false;
    seen.cut = true;
    Sound.chop();
    shadowsDirty = true;
    if (ob.state === "tip") {
      S.station.trim("tip");
      ob.state = "root";
    } else if (ob.state === "root") {
      S.station.trim("root");
      ob.state = "peel"; ob.half = 0; ob.peel = 0;
    } else if (ob.state === "slice") {
      if (S.station.slice(S.station.aF - SLICE_T)) onionDone();
    }
  }

  function peelMove(px) {
    ob.peel = Math.min(1, ob.peel + px / PEEL_PX);
    S.station.peelProgress(ob.half, ob.peel);
    if (ob.peel < 1) return;
    S.station.peelOff(ob.half);
    Sound.peel();
    seen.peel = true;
    shadowsDirty = true;
    ob.half++;
    ob.peel = 0;
    if (ob.half >= 2) { ob.state = "slice"; ob.armed = false; }
  }

  function onionDone() {
    ob.state = "none";
    if (S.onionsLeft.length) later(bringOnion, 450);
    else sliceDone();
  }

  function sliceDone() {
    ob.done = true;
    Sound.stepDone();
    setStep("slice", "got");
    later(exitBoard, 1400);
  }

  // A click, tap or Space: do one whole stroke (or one peel) automatically.
  function autoStroke() {
    if (!board.on || board.kBlend < 0.98 || ob.auto) return;
    if (ob.state === "peel") ob.auto = { kind: "peel" };
    else if (cutting()) ob.auto = { kind: "cut", stage: "up" };
  }
  function runAuto(dt) {
    const a = ob.auto;
    if (a.kind === "peel") {
      if (ob.state !== "peel") { ob.auto = null; return; }
      const half = ob.half;
      peelMove((dt * PEEL_PX) / 0.35);
      if (ob.half !== half) ob.auto = null;
      return;
    }
    if (!cutting()) { ob.auto = null; return; }
    const top = topAt(ob.ka);
    if (a.stage === "up") {
      setKnifeY(Math.min(LIFT, ob.ky + 0.5 * dt));
      if (aligned() && ob.ky >= top + 0.01) a.stage = "down";
    } else if (a.stage === "down") {
      setKnifeY(Math.max(0, ob.ky - (ob.ky < top ? 0.28 : 0.6) * dt));
      if (!ob.armed) a.stage = "back";
    } else {
      setKnifeY(Math.min(LIFT, ob.ky + 0.6 * dt));
      if (ob.ky >= Math.min(LIFT, top + 0.02)) ob.auto = null;
    }
  }

  // Runs every frame during the slicing step.
  const kActP = new THREE.Vector3(), kActQ = new THREE.Quaternion(), kQs = new THREE.Quaternion(), kEuler = new THREE.Euler();
  let gestureCls = "";
  function updateBoard(dt) {
    const dir = board.on ? 1 : -1;
    board.blend = clamp(board.blend + (dir * dt) / 0.7, 0, 1);
    board.kBlend = clamp(board.kBlend + (dir * dt) / 0.45, 0, 1);
    if (board.on && ob.auto) runAuto(dt);
    if (cutting()) {
      // the knife glides along the onion only while it's lifted clear of it
      const ta = targetA();
      if (!aligned() && ob.ky >= maxTop(ob.ka, ta) + 0.003) ob.ka += clamp(ta - ob.ka, -0.3 * dt, 0.3 * dt);
      if (ob.ky >= topAt(ob.ka) + 0.004) ob.armed = true;
    }
    // over the onion while cutting, raised and to the side otherwise
    const park = !cutting();
    ob.kx += ((park ? KX - 0.05 : KX) - ob.kx) * (1 - Math.exp(-dt * 10));
    if (park) ob.ky += (LIFT - ob.ky) * (1 - Math.exp(-dt * 8));
    ob.rock *= Math.exp(-dt * 4);
    // the knife: from its resting place on the board to the cutting pose
    const t = S.knife, k = t.obj, e = ease(board.kBlend);
    // worked out in station space, then turned into the board's space (the
    // knife lives on the board): blade upright, edge down, along station +x
    const sr = S.station.root;
    kActP.set(ob.kx, ob.ky, zAt(ob.ka) - 0.003).applyQuaternion(sr.quaternion).add(sr.position);
    kEuler.set(Math.PI / 2, 0, ob.rock, "ZYX");
    kActQ.copy(sr.quaternion).multiply(kQs.setFromEuler(kEuler));
    k.position.lerpVectors(t.home, kActP, e);
    k.quaternion.copy(S.knifeHomeQ).slerp(kActQ, e);
    const key = ob.ky + e;
    if (Math.abs(key - board.lastKy) > 0.0005) { board.lastKy = key; shadowsDirty = true; }
    // a pictogram of the gesture, until you've done it once
    const g = !board.on || board.kBlend < 1 ? "" : ob.state === "peel" ? (seen.peel ? "" : "peel") : cutting() && !seen.cut ? "cut" : "";
    if (g !== gestureCls && ui.gesture) { gestureCls = g; ui.gesture.className = "fl-gesture" + (g ? " show " + g : ""); }
    if (S.station.busy) shadowsDirty = true; // trimmed ends and skins are still moving
    if (S.station.update(dt) > 0) Sound.thud();
  }

  // ?step=slice: the stove is already burning steady
  function skipLight() {
    setKnob(KNOB_MAX * 0.62);
    stove.lit = true;
    stove.done = true;
    setStep("light", "got");
    dropPick(S.lighter.obj);
    dropPick(S.knob.pivot);
    enterSlice();
  }

  // Mirror state onto data-* attributes for the test kit (never displayed).
  function syncDebug() {
    const d = root.dataset;
    const st = stove.done ? "steady" : stove.lit ? "lit" : stove.flow > 0.08 ? "gas" : "off";
    const gas = stove.flow.toFixed(2), hold = holding || "";
    if (d.phase !== phase) d.phase = phase;
    if (d.stove !== st) d.stove = st;
    if (d.gas !== gas) d.gas = gas;
    if (d.hold !== hold) d.hold = hold;
    const cutSt = ob.done ? "done" : ob.state;
    const sl = String(S.station.landed), view = board.on ? "board" : "stand";
    if (d.cut !== cutSt) d.cut = cutSt;
    if (d.slices !== sl) d.slices = sl;
    if (d.view !== view) d.view = view;
  }

  // ---------------------------------------------------------------- input
  function setPlaying(v) {
    playing = v;
    ui.start.classList.toggle("hide", v);
    if (!v) { keys.clear(); joy.id = null; joy.x = joy.y = 0; look.id = null; ui.joy.classList.remove("on"); setHover(null); if (dial.on) endDial(true); board.drag = null; }
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
      if (board.on) { knifeMove(e.movementX || 0, e.movementY || 0, KNIFE_PX.lock); return; }
      if (dial.on && dial.lock) { dialMove(e.movementX || 0); return; }
      yaw -= e.movementX * 0.0022;
      pitch -= e.movementY * 0.0022;
      clampPitch();
    });

    on(canvas, "contextmenu", (e) => e.preventDefault());
    on(canvas, "pointerdown", (e) => {
      if (e.pointerType === "touch") markTouch();
      if (!playing) return;
      if (document.pointerLockElement === canvas) {
        if (board.on) { if (e.button === 0) autoStroke(); return; }
        if (e.button === 0) { if (!(isKnob(pickAt(0, 0)) && startDial(e.pointerId, true, 0))) interactAt(0, 0); }
        return;
      }
      // board view: any press and drag moves the knife (a quick tap does a stroke)
      if (board.on) {
        if (!board.drag) {
          board.drag = { id: e.pointerId, lx: e.clientX, ly: e.clientY, moved: 0, t: performance.now(), sens: e.pointerType === "touch" ? KNIFE_PX.touch : KNIFE_PX.mouse };
          try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        }
        return;
      }
      const r = canvas.getBoundingClientRect();
      const lx = e.clientX - r.left, ly = e.clientY - r.top;
      // pressing on the gas knob grabs it; dragging sideways turns it
      if (phase === "light" && !dial.on && isKnob(pickAt((lx / r.width) * 2 - 1, -(ly / r.height) * 2 + 1)) && startDial(e.pointerId, false, e.clientX)) {
        try { canvas.setPointerCapture(e.pointerId); } catch (err) {}
        return;
      }
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
      const bd = board.drag;
      if (bd && e.pointerId === bd.id) {
        const dx = e.clientX - bd.lx, dy = e.clientY - bd.ly;
        bd.lx = e.clientX; bd.ly = e.clientY;
        bd.moved += Math.abs(dx) + Math.abs(dy);
        knifeMove(dx, dy, bd.sens);
      } else if (dial.on && !dial.lock && e.pointerId === dial.id) {
        dialMove(e.clientX - dial.lx);
        dial.lx = e.clientX;
      } else if (e.pointerId === joy.id) {
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
      const bd = board.drag;
      if (bd && e.pointerId === bd.id) {
        board.drag = null;
        if (e.type !== "pointercancel" && bd.moved < 8 && performance.now() - bd.t < 350) autoStroke();
      } else if (dial.on && e.pointerId === dial.id) {
        endDial(e.type === "pointercancel");
      } else if (e.pointerId === joy.id) {
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
    const WALK = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    on(window, "keydown", (e) => {
      if (!playing) return;
      if (board.on) {
        // walking away puts the knife down; E or Space does one stroke
        if (WALK.has(e.code)) { e.preventDefault(); exitBoard(); }
        else if (e.code === "KeyE" || e.code === "Space") { e.preventDefault(); autoStroke(); }
        return;
      }
      if (MOVE.has(e.code)) { keys.add(e.code); e.preventDefault(); }
      if (e.code === "KeyE" || e.code === "Space") { e.preventDefault(); interactAt(0, 0); }
    });
    on(window, "keyup", (e) => keys.delete(e.code));
    on(window, "blur", () => { keys.clear(); if (dial.on) endDial(true); board.drag = null; });
    if (ui.back) on(ui.back, "click", (e) => { e.stopPropagation(); exitBoard(); });
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
    if (playing && !board.on) move(dt);
    if (phase === "slice") updateBoard(dt);
    syncView();
    runTweens(dt);
    if (playing && !touchMode && !board.on) setHover(pickAt(0, 0));
    if (hover && hover.userData.interact && hover.userData.interact.type === "item") glowItem(hover, 0.22 + 0.14 * Math.sin(time * 6));
    if (tableReady && !unloading) S.glow.material.opacity = 0.32 + 0.2 * Math.sin(time * 3);
    if (phase !== "gather") {
      updateStove(dt);
      updateGuide(time);
      S.flame.update(dt, time, stove.flow, stove.lit);
    }
    syncDebug();
    if (shadowsDirty) { renderer.shadowMap.needsUpdate = true; shadowsDirty = false; }
    renderer.clear();
    renderer.render(S.scene, S.camera);
    renderer.clearDepth();
    renderer.render(S.vm, S.camera);
  }

  function ready() {
    let jump = null;
    try { jump = new URLSearchParams(window.location.search).get("stage"); } catch (e) {}
    let step = null;
    try { step = new URLSearchParams(window.location.search).get("step"); } catch (e) {}
    if (jump === "2" || step === "slice") skipGather();
    if (step === "slice") skipLight();
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
