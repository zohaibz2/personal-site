// @ts-nocheck
/* eslint-disable */
// Frying in the degchi: the oil, the onion rings as they fry into birista
// (shrinking, and browning from pale pink through gold to deep golden brown,
// with darker scorched rings where they weren't stirred), bubbles, smoke,
// and the stream of oil while pouring.
//
// Positions are local to the degchi (origin at the centre of its base).
import * as THREE from "three";
import { makeCanvas } from "./textures";
import { ringGeometries, LAYER_H } from "./onion";

const TAU = Math.PI * 2;
export const OIL_TARGET = 0.018;  // depth of oil to fry in
export const SPOON_R = 0.1;       // the spoon's head stays inside this radius
const WALL_R = 0.148;             // ring edges stay inside this radius
const MAX_RINGS = 80;
const SLIDE_A = 2.2;              // how fast rings accelerate down the tilted board (m/s^2)
const G = 9.8;

// inner radius of the degchi at height y (same outline as buildDegchi)
export function potRadius(y) {
  if (y <= 0.01) return 0.13 + 2.2 * Math.max(0, y);
  return Math.min(0.16, 0.152 + 0.2 * (y - 0.01));
}

function dotTexture(stops, size = 64) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// raw onion -> translucent -> golden -> deep golden brown (multiplies the rings' colours)
const BROWN = [[0, [1, 1, 1]], [0.35, [1.0, 0.9, 0.68]], [0.7, [0.95, 0.66, 0.3]], [1, [0.7, 0.4, 0.15]]];
function brownAt(p) {
  for (let i = 1; i < BROWN.length; i++) {
    const [p1, c1] = BROWN[i];
    if (p <= p1) {
      const [p0, c0] = BROWN[i - 1], k = (p - p0) / (p1 - p0);
      return c0.map((v, j) => v + (c1[j] - v) * k);
    }
  }
  return BROWN[BROWN.length - 1][1];
}

export function buildFry(M) {
  const root = new THREE.Group();

  // ---- oil
  // Clear oil, as two layers (see the materials in the engine): an amber tint
  // over the pot's bottom, deeper than in the bottle because it's 2 cm deep,
  // and a gloss layer for the shine. The tint deepens as the onions fry.
  const OIL_FRESH = new THREE.Color(0xe36b10), OIL_USED = new THREE.Color(0xb04208);
  const oilMat = M.liquidOil.clone();
  oilMat.color.copy(OIL_FRESH);
  oilMat.side = THREE.FrontSide;
  const oilGeo = new THREE.CircleGeometry(1, 48);
  const oil = new THREE.Mesh(oilGeo, oilMat);
  oil.add(new THREE.Mesh(oilGeo, M.oilGloss));
  oil.rotation.x = -Math.PI / 2;
  oil.visible = false;
  oil.renderOrder = 2;
  root.add(oil);
  let level = 0;
  const surface = () => 0.002 + level;
  function setOil(l) {
    level = l;
    oil.visible = l > 0.0005;
    oil.position.y = surface();
    oil.scale.setScalar(potRadius(surface()) - 0.002);
  }

  // ---- onion rings in the pot
  const geos = ringGeometries();
  const ringMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const meshes = [geos.slice, geos.loose].map((g) => {
    const m = new THREE.InstancedMesh(g, ringMat, MAX_RINGS);
    // Both groups share ringMat, and three.js compiles that material with
    // per-instance colours as soon as one of them has them; a group without
    // its own colour list then crashes the whole frame mid-draw. So each
    // group gets a full, white colour list from the start.
    m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(MAX_RINGS * 3).fill(1), 3);
    m.count = 0; m.frustumCulled = false; m.receiveShadow = true;
    root.add(m);
    return m;
  });
  const rings = [];
  let shrink = 1;
  const dummy = new THREE.Object3D();
  const wallFor = (r) => Math.max(0.01, WALL_R - r.r * shrink);
  const white = new THREE.Color(1, 1, 1), scorched = new THREE.Color(0.32, 0.24, 0.18), tmpC = new THREE.Color();
  // R = Rz(roll) * Rx(tilt) * Ry(yaw): spin about its own axis, tip, then
  // lean with the board (roll is only non-zero while on the tilted board)
  function place(r, x = r.x, y = r.y, z = r.z, tilt = r.tilt, roll = 0) {
    dummy.position.set(x, y, z);
    dummy.rotation.set(tilt, r.yaw, roll, "ZXY");
    const s = r.r * shrink;
    dummy.scale.set(s, r.thick / LAYER_H, s);
    dummy.updateMatrix();
    r.mesh.setMatrixAt(r.i, dummy.matrix);
    r.mesh.instanceMatrix.needsUpdate = true;
  }
  function paint(r) {
    r.mesh.setColorAt(r.i, tmpC.copy(white).lerp(scorched, r.burnt));
    if (r.mesh.instanceColor) r.mesh.instanceColor.needsUpdate = true;
  }

  // Take over the rings from the tilted board. Each item: { kind (0 slice,
  // 1 loose), from (where it lies on the board, in the degchi's space), slide
  // (how far it is from the board's low edge), r, thick, yaw }. `dir` is
  // straight down the board's slope and `roll` the board's tilt. Each ring
  // slides down the board, tips off the edge and drops into the oil, and
  // they spread out across the pot.
  function addRings(list, dir, roll) {
    for (const it of list) {
      const mesh = meshes[it.kind];
      if (mesh.count >= MAX_RINGS) continue;
      const i = mesh.count++;
      const r = { mesh, i, r: it.r, thick: it.thick, yaw: it.yaw, burnt: 0, tilt: (Math.random() - 0.5) * 0.5, x: 0, y: 0, z: 0 };
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * Math.max(0.01, WALL_R - it.r);
      r.x = Math.cos(a) * d; r.z = Math.sin(a) * d;
      r.y = surface() + 0.002 + it.thick / 2 + Math.random() * 0.01;
      // a ring sliding from rest reaches the edge after t = sqrt(2 * slide / a)
      const ts = Math.sqrt((2 * Math.max(0, it.slide)) / SLIDE_A);
      r.fall = { from: it.from.clone(), dir: dir.clone(), roll, slide: it.slide, ts, wait: Math.random() * 0.12, t: 0, edge: null, v: 0, tumble: (Math.random() - 0.5) * 2 };
      rings.push(r);
      paint(r);
      place(r, it.from.x, it.from.y, it.from.z, 0, roll);
    }
  }

  // One step of a ring's trip from the board into the oil. Returns true on landing.
  function fallStep(r, dt) {
    const f = r.fall;
    f.t += dt;
    const t = f.t - f.wait;
    if (t < 0) return false;
    if (t < f.ts) {
      // sliding down the board, still lying on it
      const s = 0.5 * SLIDE_A * t * t;
      place(r, f.from.x + f.dir.x * s, f.from.y + f.dir.y * s, f.from.z + f.dir.z * s, 0, f.roll);
      return false;
    }
    if (!f.edge) {
      f.edge = new THREE.Vector3(f.from.x + f.dir.x * f.slide, f.from.y + f.dir.y * f.slide, f.from.z + f.dir.z * f.slide);
      f.v = SLIDE_A * f.ts + 0.2;
      f.drop = Math.sqrt((2 * Math.max(0.01, f.edge.y - r.y)) / G) + 0.05; // time to fall to the oil
    }
    // off the edge: carried on by its speed, pulled down, steered to its spot
    const tf = t - f.ts, k = Math.min(1, tf / f.drop), steer = k * k * (3 - 2 * k);
    const fx = f.edge.x + f.dir.x * f.v * tf, fz = f.edge.z + f.dir.z * f.v * tf;
    const fy = Math.max(r.y, f.edge.y + f.dir.y * f.v * tf - 0.5 * G * tf * tf);
    const rollNow = f.roll * (1 - k) + f.tumble * Math.sin(Math.PI * k) * 0.6;
    place(r, fx + (r.x - fx) * steer, k >= 1 ? r.y : fy, fz + (r.z - fz) * steer, r.tilt * k, k >= 1 ? 0 : rollNow);
    if (k < 1) return false;
    r.fall = null;
    place(r);
    return true;
  }

  // The spoon moved from (sx, sz) by (dx, dz): rings near it are pushed
  // along, and the whole pot swirls a little with the stirring.
  function stir(sx, sz, dx, dz) {
    const a0 = Math.atan2(sz, sx), a1 = Math.atan2(sz + dz, sx + dx);
    let da = a1 - a0;
    if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
    if (Math.hypot(sx, sz) < 0.015) da = 0;
    const swirl = da * 0.3, c = Math.cos(swirl), s = Math.sin(swirl);
    for (const r of rings) {
      if (r.fall || r.taken) continue;
      const near = Math.max(0, 1 - Math.hypot(r.x - sx, r.z - sz) / 0.06);
      let x = r.x * c - r.z * s + dx * 0.8 * near, z = r.x * s + r.z * c + dz * 0.8 * near;
      const d = Math.hypot(x, z), w = wallFor(r);
      if (d > w) { x *= w / d; z *= w / d; }
      r.x = x; r.z = z;
      if (near > 0.3) { r.tilt += (Math.random() - 0.5) * 0.2 * near; r.yaw += (Math.random() - 0.5) * 0.3 * near; r.tilt = Math.max(-0.5, Math.min(0.5, r.tilt)); }
      place(r);
    }
  }

  // How far the frying has got (0..1): colour and shrinkage.
  function setBrown(p) {
    const c = brownAt(Math.max(0, Math.min(1, p)));
    ringMat.color.setRGB(c[0], c[1], c[2]);
    oilMat.color.copy(OIL_FRESH).lerp(OIL_USED, 0.6 * Math.max(0, Math.min(1, p))); // the oil takes on colour too
    shrink = 1 - 0.15 * Math.max(0, Math.min(1, p));
  }

  // Unstirred onions catch on the bottom: darken `k` rings a bit more.
  function scorch(k) {
    let burnt = 0;
    // the ones that catch are those lying lowest, on the hot bottom of the pot
    const bottom = rings.filter((r) => !r.fall && !r.taken).sort((a, b) => a.y - b.y).slice(0, 10);
    for (let j = 0; j < k && bottom.length; j++) {
      const r = bottom[Math.floor(Math.random() * bottom.length)];
      r.burnt = Math.min(1, r.burnt + 0.35);
      paint(r);
    }
    for (const r of rings) if (r.burnt >= 0.6) burnt++;
    return burnt;
  }

  // Rings in the oil gently push apart, so they spread across the pot
  // rather than bunching up where the spoon left them. They may overlap a
  // little, as real fried onions do.
  function spread(dt) {
    const k = Math.min(1, dt * 5);
    const settled = rings.filter((r) => !r.fall && !r.taken);
    for (let a = 0; a < settled.length; a++) {
      const p = settled[a];
      for (let b = a + 1; b < settled.length; b++) {
        const q = settled[b];
        const dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz) || 1e-4;
        const want = (p.r + q.r) * shrink * 0.6;
        if (d >= want) continue;
        const push = ((want - d) / d) * 0.5 * k;
        p.x -= dx * push; p.z -= dz * push;
        q.x += dx * push; q.z += dz * push;
        p.moved = q.moved = true;
      }
    }
    for (const r of settled) {
      const d = Math.hypot(r.x, r.z), w = wallFor(r);
      if (d > w) { r.x *= w / d; r.z *= w / d; r.moved = true; }
      if (r.moved) { place(r); r.moved = false; }
    }
  }

  // ---- bubbles and smoke
  const bubbleMat = new THREE.SpriteMaterial({ map: dotTexture([[0, "rgba(255,250,235,0)"], [0.55, "rgba(255,250,235,0.15)"], [0.8, "rgba(255,250,235,0.9)"], [1, "rgba(255,250,235,0)"]]), transparent: true, depthWrite: false });
  const bubbles = [];
  for (let i = 0; i < 28; i++) {
    const b = new THREE.Sprite(bubbleMat);
    b.visible = false;
    root.add(b);
    bubbles.push({ b, life: 0, max: 1, size: 0.006 });
  }
  const smokeTex = dotTexture([[0, "rgba(235,232,228,0.55)"], [0.5, "rgba(225,222,218,0.25)"], [1, "rgba(220,218,214,0)"]]);
  const smoke = [];
  for (let i = 0; i < 10; i++) {
    const m = new THREE.SpriteMaterial({ map: smokeTex, transparent: true, depthWrite: false, opacity: 0 });
    const sp = new THREE.Sprite(m);
    sp.visible = false;
    root.add(sp);
    smoke.push({ sp, life: 0, max: 1 });
  }
  let bubbleAcc = 0, smokeAcc = 0;

  // ---- the stream of oil while pouring (lives in the scene, not the pot)
  const streamGeo = new THREE.CylinderGeometry(0.0035, 0.0045, 1, 8, 1, true);
  streamGeo.translate(0, -0.5, 0); // hangs down from its top
  const stream = new THREE.Mesh(streamGeo, M.liquidOil);
  stream.add(new THREE.Mesh(streamGeo, M.oilGloss));
  stream.visible = false;
  function setStream(top, bottomY) {
    if (!top) { stream.visible = false; return; }
    stream.visible = true;
    stream.position.copy(top);
    stream.scale.set(1, Math.max(0.01, top.y - bottomY), 1);
  }

  // Animate falling rings, bubbles and smoke. `bubbling` and `smoky` are
  // 0..1. Returns how many rings landed in the oil this frame.
  function update(dt, bubbling, smoky) {
    let landed = 0;
    for (const r of rings) if (r.fall && fallStep(r, dt)) landed++;
    spread(dt);
    bubbleAcc += dt * bubbling * 40;
    while (bubbleAcc >= 1) {
      bubbleAcc -= 1;
      const p = bubbles.find((q) => q.life <= 0);
      if (!p) break;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (potRadius(surface()) - 0.01);
      p.b.position.set(Math.cos(a) * d, surface() + 0.001, Math.sin(a) * d);
      p.life = p.max = 0.15 + Math.random() * 0.3;
      p.size = 0.003 + Math.random() * 0.006;
      p.b.visible = true;
    }
    for (const p of bubbles) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.b.visible = false; continue; }
      p.b.scale.setScalar(p.size * (0.4 + 0.6 * (1 - p.life / p.max)));
    }
    smokeAcc += dt * smoky * 4;
    while (smokeAcc >= 1) {
      smokeAcc -= 1;
      const s = smoke.find((q) => q.life <= 0);
      if (!s) break;
      s.sp.position.set((Math.random() - 0.5) * 0.12, surface() + 0.02, (Math.random() - 0.5) * 0.12);
      s.life = s.max = 1.6 + Math.random();
      s.sp.visible = true;
    }
    for (const s of smoke) {
      if (s.life <= 0) continue;
      s.life -= dt;
      if (s.life <= 0) { s.sp.visible = false; continue; }
      const k = 1 - s.life / s.max;
      s.sp.position.y += dt * 0.09;
      s.sp.position.x += Math.sin(k * 6 + s.max * 3) * dt * 0.01;
      s.sp.scale.setScalar(0.04 + k * 0.14);
      s.sp.material.opacity = Math.sin(Math.PI * k) * 0.45;
    }
    return landed;
  }

  // Lifting the birista out: take up to `n` rings nearest (x, z) out of the
  // pot (they're hidden here; the caller shows them on the kafgir).
  function takeNear(x, z, n) {
    const left = rings.filter((r) => !r.taken && !r.fall);
    left.sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z));
    const out = left.slice(0, n);
    for (const r of out) {
      r.taken = true;
      dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.set(0, 0, 0);
      dummy.updateMatrix();
      r.mesh.setMatrixAt(r.i, dummy.matrix);
      r.mesh.instanceMatrix.needsUpdate = true;
    }
    return out.map((r) => ({ r: r.r * shrink, thick: r.thick, yaw: r.yaw, loose: r.mesh === meshes[1] }));
  }
  // where the most birista still is (a ring near the middle of what's left)
  function biristaSpot() {
    const left = rings.filter((r) => !r.taken && !r.fall);
    if (!left.length) return null;
    let cx = 0, cz = 0;
    for (const r of left) { cx += r.x; cz += r.z; }
    cx /= left.length; cz /= left.length;
    left.sort((a, b) => Math.hypot(a.x - cx, a.z - cz) - Math.hypot(b.x - cx, b.z - cz));
    return { x: left[0].x, z: left[0].z };
  }

  // A pot of birista straight away (the ?step=marinate shortcut).
  function fillRings(n) {
    for (let j = 0; j < n && meshes[0].count < MAX_RINGS; j++) {
      const i = meshes[0].count++;
      const r = { mesh: meshes[0], i, r: 0.015 + Math.random() * 0.025, thick: 0.0058, yaw: Math.random() * TAU, burnt: 0, tilt: (Math.random() - 0.5) * 0.5, x: 0, y: 0, z: 0, fall: null };
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (WALL_R - r.r);
      r.x = Math.cos(a) * d; r.z = Math.sin(a) * d; r.y = surface() + 0.005 + Math.random() * 0.01;
      rings.push(r);
      paint(r);
      place(r);
    }
  }

  return {
    root, stream, setOil, addRings, fillRings, stir, setBrown, scorch, setStream, update, takeNear, biristaSpot, ringMat,
    get remaining() { return rings.filter((r) => !r.taken).length; },
    get surface() { return surface(); },
    get count() { return rings.length; },
    get falling() { return rings.some((r) => r.fall); },
  };
}
