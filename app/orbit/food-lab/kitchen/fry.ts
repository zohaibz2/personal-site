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
export const SPOON_R = 0.1;       // the spoon and the rings stay inside this radius
const MAX_RINGS = 80;
const THICK = 0.0058;

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
  const OIL_FRESH = new THREE.Color(0xc4841a), OIL_USED = new THREE.Color(0x8a4a0c);
  const oilMat = new THREE.MeshPhysicalMaterial({ color: OIL_FRESH.clone(), roughness: 0.02, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.62, envMapIntensity: 1.4 });
  const oil = new THREE.Mesh(new THREE.CircleGeometry(1, 48), oilMat);
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
    m.count = 0; m.frustumCulled = false; m.receiveShadow = true;
    root.add(m);
    return m;
  });
  const rings = [];
  let shrink = 1;
  const dummy = new THREE.Object3D();
  const white = new THREE.Color(1, 1, 1), scorched = new THREE.Color(0.32, 0.24, 0.18), tmpC = new THREE.Color();
  function place(r) {
    dummy.position.set(r.x, r.y, r.z);
    dummy.rotation.set(r.tilt, r.yaw, 0, "YXZ");
    const s = r.r * shrink;
    dummy.scale.set(s, THICK / LAYER_H, s);
    dummy.updateMatrix();
    r.mesh.setMatrixAt(r.i, dummy.matrix);
    r.mesh.instanceMatrix.needsUpdate = true;
  }
  function paint(r) {
    r.mesh.setColorAt(r.i, tmpC.copy(white).lerp(scorched, r.burnt));
    if (r.mesh.instanceColor) r.mesh.instanceColor.needsUpdate = true;
  }

  // Tip `n` whole slices and `nLoose` loose rings in, falling from `from`.
  function addRings(n, nLoose, from) {
    const add = (kind, count) => {
      const mesh = meshes[kind];
      for (let j = 0; j < count && mesh.count < MAX_RINGS; j++) {
        const i = mesh.count++;
        const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * SPOON_R * 0.9;
        const r = {
          mesh, i, x: Math.cos(a) * d, z: Math.sin(a) * d, y: surface() + 0.003 + Math.random() * 0.016,
          tilt: (Math.random() - 0.5) * 0.7, yaw: Math.random() * TAU,
          r: kind === 0 ? 0.018 + Math.random() * 0.022 : 0.02 + Math.random() * 0.018, burnt: 0,
          fall: { x: from.x + (Math.random() - 0.5) * 0.04, y: from.y + (Math.random() - 0.5) * 0.02, z: from.z + (Math.random() - 0.5) * 0.06, t: -rings.length * 0.012, dur: 0.4 },
        };
        rings.push(r);
        paint(r);
        place({ ...r, x: r.fall.x, y: r.fall.y, z: r.fall.z });
      }
    };
    add(0, n);
    add(1, nLoose);
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
      if (r.fall) continue;
      const near = Math.max(0, 1 - Math.hypot(r.x - sx, r.z - sz) / 0.06);
      let x = r.x * c - r.z * s + dx * 0.8 * near, z = r.x * s + r.z * c + dz * 0.8 * near;
      const d = Math.hypot(x, z);
      if (d > SPOON_R) { x *= SPOON_R / d; z *= SPOON_R / d; }
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
    shrink = 1 - 0.28 * Math.max(0, Math.min(1, p));
  }

  // Unstirred onions catch on the bottom: darken `k` rings a bit more.
  function scorch(k) {
    let burnt = 0;
    for (let j = 0; j < k && rings.length; j++) {
      const r = rings[Math.floor(Math.random() * rings.length)];
      r.burnt = Math.min(1, r.burnt + 0.35);
      paint(r);
    }
    for (const r of rings) if (r.burnt >= 0.6) burnt++;
    return burnt;
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
    for (const r of rings) {
      if (!r.fall) continue;
      r.fall.t += dt;
      if (r.fall.t < 0) continue;
      const k = Math.min(1, r.fall.t / r.fall.dur), e = k * k;
      place({ ...r, x: r.fall.x + (r.x - r.fall.x) * k, y: r.fall.y + (r.y - r.fall.y) * e, z: r.fall.z + (r.z - r.fall.z) * k, tilt: r.tilt * k });
      if (k >= 1) { r.fall = null; landed++; place(r); }
    }
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

  return {
    root, stream, setOil, addRings, stir, setBrown, scorch, setStream, update,
    get surface() { return surface(); },
    get count() { return rings.length; },
    get falling() { return rings.some((r) => r.fall); },
  };
}
