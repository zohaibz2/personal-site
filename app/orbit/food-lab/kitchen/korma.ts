// @ts-nocheck
/* eslint-disable */
// The korma in the degchi. Whole spices go into the hot oil first, then
// chopped tomatoes, slit green chillies, potato halves and aloo bukhara, then
// the marinated chicken with its masala. As it's cooked and stirred (bhuno)
// the masala darkens from orange to a deep red-brown, the tomatoes and
// chillies break down into it, the chicken browns, and a ring of oil
// separates at the edge: the sign a korma is done.
//
// Positions are local to the degchi (origin at the centre of its base).
import * as THREE from "three";
import { potRadius } from "./fry";

const TAU = Math.PI * 2;
const WALL = 0.13;            // pieces stay inside this radius
const RAW = new THREE.Color(0xb8461a), DONE = new THREE.Color(0x5e1a08);           // the masala
const COATED = new THREE.Color(1.0, 0.55, 0.32), BROWNED = new THREE.Color(0.72, 0.36, 0.2); // the chicken's tint

export function buildKorma(M) {
  const root = new THREE.Group();
  let cook = 0, level = 0;

  // the masala: a layer over the bottom, shown once the chicken goes in
  const gravyMat = new THREE.MeshPhysicalMaterial({ color: RAW.clone(), roughness: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.3 });
  const gravy = new THREE.Mesh(new THREE.CircleGeometry(1, 48), gravyMat);
  gravy.rotation.x = -Math.PI / 2;
  gravy.visible = false;
  root.add(gravy);
  // the oil that separates at the edge: clear amber (a tint, like the oil in
  // the bottle) that fades in as it cooks; white means "no tint"
  const sheenMat = M.liquidOil.clone();
  sheenMat.color.setRGB(1, 1, 1);
  const sheen = new THREE.Mesh(new THREE.RingGeometry(0.78, 1, 48), sheenMat);
  sheen.add(new THREE.Mesh(sheen.geometry, M.oilGloss));
  sheen.rotation.x = -Math.PI / 2;
  sheen.visible = false;
  root.add(sheen);
  function setLevel(l) {
    level = l;
    const r = potRadius(l) - 0.003;
    gravy.visible = sheen.visible = l > 0.001;
    gravy.position.y = l;
    gravy.scale.setScalar(r);
    sheen.position.y = l + 0.0015;
    sheen.scale.setScalar(r);
  }

  // ---- pieces: they drop in from where they were tipped, then sit, swirl
  // when stirred, and (tomatoes, chillies) break down as it cooks
  const pieces = [];
  const geo = { ball: new THREE.SphereGeometry(1, 12, 9), stick: new THREE.CylinderGeometry(1, 1, 1, 8), leaf: new THREE.CircleGeometry(1, 10), star: new THREE.ConeGeometry(1, 0.35, 8) };
  function add(kind, mesh, size, from, opts = {}) {
    mesh.userData.kpiece = true;
    mesh.castShadow = false; mesh.receiveShadow = true;
    root.add(mesh);
    const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (opts.spread || 0.09);
    const p = {
      kind, mesh, size, x: Math.cos(a) * d, z: Math.sin(a) * d, y: (opts.y || 0.03) + Math.random() * 0.012,
      yaw: Math.random() * TAU, tilt: opts.tilt !== undefined ? opts.tilt : (Math.random() - 0.5) * 0.6, melts: !!opts.melts,
      fall: { from: from.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.03)), t: -pieces.length * 0.01 - Math.random() * 0.08, dur: 0.35 },
    };
    pieces.push(p);
    size3(p);
    mesh.position.copy(p.fall.from);
    return p;
  }
  function size3(p) {
    const k = p.melts ? 1 - 0.85 * cook : 1;
    p.mesh.visible = k > 0.05;
    p.mesh.scale.set(p.size[0] * k, p.size[1] * k, p.size[2] * k);
  }
  function place(p) {
    p.mesh.position.set(p.x, p.y, p.z);
    p.mesh.rotation.set(p.tilt, p.yaw, 0, "YXZ");
  }

  // whole spices: bay leaves, cinnamon, cloves, cardamom, star anise
  const clove = new THREE.MeshStandardMaterial({ color: 0x2b1a12, roughness: 0.8 });
  const cardamom = new THREE.MeshStandardMaterial({ color: 0x7f8f52, roughness: 0.7 });
  function addSpices(from) {
    for (let i = 0; i < 2; i++) add("bay", new THREE.Mesh(geo.leaf, M.bayLeaf), [0.012, 0.03, 1], from, { tilt: -Math.PI / 2 + 0.2, y: 0.024 });
    for (let i = 0; i < 2; i++) add("cinnamon", new THREE.Mesh(geo.stick, M.cinnamon), [0.004, 0.04, 0.004], from, { tilt: Math.PI / 2, y: 0.024 });
    for (let i = 0; i < 5; i++) add("clove", new THREE.Mesh(geo.ball, clove), [0.0025, 0.0025, 0.004], from, { y: 0.022 });
    for (let i = 0; i < 4; i++) add("cardamom", new THREE.Mesh(geo.ball, cardamom), [0.003, 0.003, 0.005], from, { y: 0.022 });
    add("anise", new THREE.Mesh(geo.star, M.anise), [0.011, 0.011, 0.011], from, { tilt: 0, y: 0.022 });
  }
  // chopped and whole vegetables
  function addVeg(kind, from) {
    if (kind === "tomatoes") for (let i = 0; i < 12; i++) add(kind, new THREE.Mesh(geo.ball, M.tomato), [0.011, 0.007, 0.01], from, { melts: true });
    if (kind === "chillies") for (let i = 0; i < 4; i++) add(kind, new THREE.Mesh(geo.ball, M.chilli), [0.0045, 0.0045, 0.03], from, { melts: true, tilt: Math.PI / 2 - 0.1 });
    if (kind === "potatoes") for (let i = 0; i < 4; i++) add(kind, new THREE.Mesh(geo.ball, M.potato), [0.024, 0.016, 0.02], from, { y: 0.035, spread: 0.08 });
    if (kind === "alooBukhara") for (let i = 0; i < 5; i++) add(kind, new THREE.Mesh(geo.ball, M.plum), [0.009, 0.008, 0.009], from, {});
  }
  // the chicken pieces themselves (moved from the bowl), and their masala
  const chicken = [];
  function addChicken(mesh, from) {
    const p = add("chicken", mesh, [mesh.scale.x, mesh.scale.y, mesh.scale.z], from, { y: 0.04, spread: 0.085, tilt: (Math.random() - 0.5) * 0.4 });
    chicken.push(p);
  }

  // ---- cooking
  function stir(sx, sz, dx, dz) {
    const a0 = Math.atan2(sz, sx), a1 = Math.atan2(sz + dz, sx + dx);
    let da = a1 - a0;
    if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
    if (Math.hypot(sx, sz) < 0.015) da = 0;
    const c = Math.cos(da * 0.3), s = Math.sin(da * 0.3);
    for (const p of pieces) {
      if (p.fall) continue;
      const near = Math.max(0, 1 - Math.hypot(p.x - sx, p.z - sz) / 0.06);
      let x = p.x * c - p.z * s + dx * 0.8 * near, z = p.x * s + p.z * c + dz * 0.8 * near;
      const d = Math.hypot(x, z);
      if (d > WALL) { x *= WALL / d; z *= WALL / d; }
      p.x = x; p.z = z;
      p.yaw += da * 0.3 + (Math.random() - 0.5) * 0.2 * near;
      place(p);
    }
  }
  function setCook(p) {
    cook = Math.max(0, Math.min(1, p));
    gravyMat.color.copy(RAW).lerp(DONE, cook);
    // the oil separates over the last part of the cooking
    const o = Math.max(0, (cook - 0.55) / 0.45);
    sheenMat.color.setRGB(1, 1 - 0.4 * o, 1 - 0.85 * o);
    for (const ch of chicken) if (ch.mesh.material && ch.mesh.material.color) ch.mesh.material.color.copy(COATED).lerp(BROWNED, cook);
    for (const pc of pieces) if (pc.melts) size3(pc);
  }

  function update(dt) {
    let landed = 0;
    for (const p of pieces) {
      if (!p.fall) continue;
      const f = p.fall;
      f.t += dt;
      if (f.t < 0) continue;
      const k = Math.min(1, f.t / f.dur);
      p.mesh.position.set(f.from.x + (p.x - f.from.x) * k, f.from.y + (p.y - f.from.y) * k * k, f.from.z + (p.z - f.from.z) * k);
      p.mesh.rotation.set(p.tilt * k, p.yaw, 0, "YXZ");
      if (k >= 1) { p.fall = null; place(p); landed++; }
    }
    return landed;
  }

  return {
    root, addSpices, addVeg, addChicken, setLevel, stir, setCook, update,
    get level() { return level; },
    get pieces() { return pieces.length; },
    get falling() { return pieces.some((p) => p.fall); },
  };
}
