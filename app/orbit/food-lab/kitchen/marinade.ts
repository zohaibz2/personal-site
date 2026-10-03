// @ts-nocheck
/* eslint-disable */
// What's in the mixing bowl while marinating: chicken pieces (the real ones,
// moved over from their tray), a dollop of dahi, ginger and garlic paste,
// little mounds of each spice, a stream of powder while a jar is tipped, and
// the marinade itself, which goes from white dahi to an even orange-red as
// it's mixed, coating the chicken.
//
// Positions are local to the bowl (origin at the centre of its base).
import * as THREE from "three";
import { makeCanvas } from "./textures";

const TAU = Math.PI * 2;
export const MIX_R = 0.055;      // the chicken pieces stay inside this radius
const FLOOR = 0.004;              // the bowl's inside bottom
// the bowl's inside radius at height y (same outline as MIX_BOWL in props.ts)
export function bowlRadius(y) {
  const P = [[0.045, 0], [0.07, 0.008], [0.09, 0.022], [0.104, 0.042], [0.113, 0.065], [0.117, 0.088], [0.118, 0.1]];
  if (y <= 0) return 0.045;
  for (let i = 1; i < P.length; i++) if (y <= P[i][1]) return P[i - 1][0] + ((y - P[i - 1][1]) / (P[i][1] - P[i - 1][1])) * (P[i][0] - P[i - 1][0]);
  return 0.118;
}

// the marinade's colour as it's mixed: white dahi -> pale orange -> even orange-red
// (darker than it looks: three.js brightens colours on the way to the screen)
const DAHI = new THREE.Color(0xf2ece0), MIXED = new THREE.Color(0x9a2f10);
// what mixing does to the chicken's own colour (multiplies its texture)
const RAW = new THREE.Color(1, 1, 1), COATED = new THREE.Color(1.0, 0.55, 0.32);

function dotTexture(size = 32) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.6, "rgba(255,255,255,0.8)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function buildMarinade(M) {
  const root = new THREE.Group();
  let mix = 0;

  // the marinade pool: a shallow layer over the bowl's bottom, shown once dahi is in
  const poolMat = new THREE.MeshPhysicalMaterial({ color: DAHI.clone(), roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.4 });
  const pool = new THREE.Mesh(new THREE.CircleGeometry(1, 40), poolMat);
  pool.rotation.x = -Math.PI / 2;
  pool.visible = false;
  root.add(pool);
  let poolLevel = 0;
  function setPool(level) {
    poolLevel = level;
    pool.visible = level > 0.001;
    pool.position.y = FLOOR + level;
    pool.scale.setScalar(bowlRadius(FLOOR + level) - 0.003);
  }

  // chicken pieces moved in from the tray (we keep their materials to colour them)
  const pieces = [];
  // where the next piece will go (so it can fly straight there), then add it
  function planPiece() {
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * MIX_R * 0.8;
    return { x: Math.cos(a) * d, z: Math.sin(a) * d, y: FLOOR + 0.012 + Math.random() * 0.008, yaw: Math.random() * TAU };
  }
  function addPiece(mesh, at) {
    root.attach(mesh);
    const p = Object.assign({ mesh }, at || planPiece());
    pieces.push(p);
    placePiece(p);
    return p;
  }
  function placePiece(p) {
    p.mesh.position.set(p.x, p.y, p.z);
    p.mesh.rotation.set(0, p.yaw, 0);
  }

  // lumps (dahi, pastes) and powder mounds sit on top and blend in as it's mixed
  const lumps = [];
  const sphere = new THREE.SphereGeometry(1, 16, 10);
  const cone = new THREE.ConeGeometry(1, 1, 16, 1);
  cone.translate(0, 0.5, 0);
  function addLump(mat, r, h, cone_ = false) {
    const m = new THREE.Mesh(cone_ ? cone : sphere, mat);
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * MIX_R * 0.7;
    m.position.set(Math.cos(a) * d, FLOOR + 0.024, Math.sin(a) * d);
    m.rotation.y = Math.random() * TAU;
    m.receiveShadow = true;
    m.userData.lump = true;
    root.add(m);
    const l = { m, r, h, grow: 0 };
    lumps.push(l);
    sizeLump(l); // sized (and hidden, at grow 0) right away: never drawn at its raw 1 m size
    return l;
  }
  const sizeLump = (l) => {
    const k = l.grow * (1 - mix);
    l.m.visible = k > 0.02;
    l.m.scale.set(l.r * k, l.h * k, l.r * k);
  };
  const dahiMat = M.dahi, gingerMat = new THREE.MeshStandardMaterial({ color: 0xd9b56e, roughness: 0.7 }), garlicMat = new THREE.MeshStandardMaterial({ color: 0xf0e6cc, roughness: 0.6 });
  const POWDER = { redChilli: M.powderRed, haldi: M.powderHaldi, salt: M.powderSalt, masala: M.powderGaram };
  // hidden stand-ins, so the engine's warm-up compiles the paste materials at
  // load instead of stalling a frame the first time one goes in
  for (const mat of [gingerMat, garlicMat]) { const w = new THREE.Mesh(sphere, mat); w.visible = false; root.add(w); }

  // ---- powder stream while a jar is tipped over the bowl
  const dotMats = {};
  const dotTex = dotTexture();
  const COLORS = { redChilli: 0xa8250f, haldi: 0xe3a01b, salt: 0xf4f2ec, masala: 0x6b3a1c };
  for (const k in COLORS) dotMats[k] = new THREE.SpriteMaterial({ map: dotTex, color: COLORS[k], transparent: true, depthWrite: false });
  const grains = [];
  for (let i = 0; i < 60; i++) { const s = new THREE.Sprite(dotMats.salt); s.visible = false; root.add(s); grains.push({ s, v: new THREE.Vector3(), life: 0 }); }
  let pouring = null, grainAcc = 0;
  // from: where the powder leaves the jar, in the bowl's space
  function pourPowder(kind, from) { pouring = from ? { kind, from: from.clone() } : null; }

  // ---- adding things
  function addDahi() { const l = addLump(dahiMat, 0.038, 0.022); setPool(0.006); return l; }
  function addPaste(kind) { return addLump(kind === "adrak" ? gingerMat : garlicMat, 0.016, 0.009); }
  function addMound(kind) { return addLump(POWDER[kind], 0.018, 0.013, true); }

  // ---- mixing
  // The spoon moved from (sx, sz) by (dx, dz): pieces near it are pushed and
  // the whole bowl swirls a little (as in the frying pot).
  function stir(sx, sz, dx, dz) {
    const a0 = Math.atan2(sz, sx), a1 = Math.atan2(sz + dz, sx + dx);
    let da = a1 - a0;
    if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
    if (Math.hypot(sx, sz) < 0.012) da = 0;
    const c = Math.cos(da * 0.3), s = Math.sin(da * 0.3);
    for (const p of pieces) {
      const near = Math.max(0, 1 - Math.hypot(p.x - sx, p.z - sz) / 0.05);
      let x = p.x * c - p.z * s + dx * 0.8 * near, z = p.x * s + p.z * c + dz * 0.8 * near;
      const d = Math.hypot(x, z);
      if (d > MIX_R) { x *= MIX_R / d; z *= MIX_R / d; }
      p.x = x; p.z = z;
      p.yaw += da * 0.3 + (Math.random() - 0.5) * 0.2 * near;
      placePiece(p);
    }
    for (const l of lumps) {
      const x = l.m.position.x, z = l.m.position.z;
      l.m.position.x = x * c - z * s; l.m.position.z = x * s + z * c;
    }
  }
  // how far the mixing has got (0..1)
  function setMix(m) {
    mix = Math.max(0, Math.min(1, m));
    poolMat.color.copy(DAHI).lerp(MIXED, mix);
    if (pool.visible) setPool(0.006 + 0.004 * mix); // it loosens and spreads a little
    for (const p of pieces) {
      const mat = p.mesh.material;
      if (mat && mat.color) mat.color.copy(RAW).lerp(COATED, mix);
    }
    for (const l of lumps) sizeLump(l);
  }

  // pieces settle into place; lumps grow in as they land; powder falls
  function update(dt) {
    for (const p of pieces) placePiece(p);
    for (const l of lumps) if (l.grow < 1) { l.grow = Math.min(1, l.grow + dt * 3); sizeLump(l); }
    if (pouring) {
      grainAcc += dt * 70;
      while (grainAcc >= 1) {
        grainAcc -= 1;
        const g = grains.find((q) => q.life <= 0);
        if (!g) break;
        g.s.material = dotMats[pouring.kind];
        g.s.position.copy(pouring.from).add(new THREE.Vector3((Math.random() - 0.5) * 0.01, 0, (Math.random() - 0.5) * 0.01));
        g.v.set((Math.random() - 0.5) * 0.04, -0.05, (Math.random() - 0.5) * 0.04);
        g.life = 0.6;
        g.s.scale.setScalar(0.003 + Math.random() * 0.003);
        g.s.visible = true;
      }
    }
    for (const g of grains) {
      if (g.life <= 0) continue;
      g.life -= dt;
      g.v.y -= 6 * dt;
      g.s.position.addScaledVector(g.v, dt);
      if (g.s.position.y < FLOOR + 0.02 || g.life <= 0) { g.life = 0; g.s.visible = false; }
    }
  }

  return {
    root, planPiece, addPiece, addDahi, addPaste, addMound, pourPowder, stir, setMix, update,
    get pieces() { return pieces.length; },
    get lumps() { return lumps.length; },
  };
}
