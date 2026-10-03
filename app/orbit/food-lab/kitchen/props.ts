// @ts-nocheck
/* eslint-disable */
// Ingredient and prop models for the Biryani Kitchen. Units are metres.
// Every builder returns a Group whose origin sits at the bottom centre,
// so placing it on a surface is just `position.y = surfaceHeight`.
import * as THREE from "three";
import { rng } from "./textures";

const TAU = Math.PI * 2;
const V2 = (x, y) => new THREE.Vector2(x, y);

// ---------------------------------------------------------------- noise
function h3(x, y, z) {
  let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1274126177);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
export function noise3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const xf = x - xi, yf = y - yi, zf = z - zi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
  const l = (a, b, t) => a + (b - a) * t;
  return l(
    l(l(h3(xi, yi, zi), h3(xi + 1, yi, zi), u), l(h3(xi, yi + 1, zi), h3(xi + 1, yi + 1, zi), u), v),
    l(l(h3(xi, yi, zi + 1), h3(xi + 1, yi, zi + 1), u), l(h3(xi, yi + 1, zi + 1), h3(xi + 1, yi + 1, zi + 1), u), v),
    w
  );
}

// ---------------------------------------------------------------- geometry helpers
export function shadowed(o) {
  o.traverse((m) => {
    if (!m.isMesh) return;
    const mats = Array.isArray(m.material) ? m.material : [m.material];
    const clear = mats.some((x) => x.transparent);
    m.castShadow = !clear;
    m.receiveShadow = true;
  });
  return o;
}

export function roundedBox(w, h, d, r = 0.008, seg = 2) {
  r = Math.max(0.0006, Math.min(r, w / 2 - 0.0006, h / 2 - 0.0006, d / 2 - 0.0006));
  const hw = w / 2 - r, hh = h / 2 - r;
  const e = Math.min(0.0004, hw * 0.5, hh * 0.5);
  const s = new THREE.Shape();
  s.moveTo(-hw + e, -hh);
  s.lineTo(hw - e, -hh); s.quadraticCurveTo(hw, -hh, hw, -hh + e);
  s.lineTo(hw, hh - e); s.quadraticCurveTo(hw, hh, hw - e, hh);
  s.lineTo(-hw + e, hh); s.quadraticCurveTo(-hw, hh, -hw, hh - e);
  s.lineTo(-hw, -hh + e); s.quadraticCurveTo(-hw, -hh, -hw + e, -hh);
  const g = new THREE.ExtrudeGeometry(s, {
    depth: Math.max(0.0002, d - 2 * r),
    bevelEnabled: true, bevelThickness: r, bevelSize: r, bevelSegments: seg,
    curveSegments: 3, steps: 1,
  });
  g.center();
  return g;
}

export function lathe(pts, seg = 32) {
  return new THREE.LatheGeometry(pts.map(([r, y]) => V2(Math.max(r, 0.00002), y)), seg);
}

// Deformed ellipsoid: chicken pieces, potatoes, ginger knobs, dried plums.
export function blob(rx, ry, rz, seed, amp = 0.12, freq = 2, ws = 26, hs = 18) {
  const g = new THREE.SphereGeometry(1, ws, hs);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = noise3(x * freq + seed, y * freq + seed * 1.7, z * freq - seed);
    const k = 1 + (n - 0.5) * 2 * amp;
    p.setXYZ(i, x * rx * k, y * ry * k, z * rz * k);
  }
  g.computeVertexNormals();
  return g;
}

function leafGeo(len, wid, bend = 0.25, cup = 0.15, serr = 0) {
  const N = 14, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let w = Math.sin(Math.PI * Math.pow(t, 0.8)) * wid;
    if (serr && i > 0 && i < N) w *= 1 - serr * (i % 2);
    pts.push([w, t * len]);
  }
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  for (const [x, y] of pts) s.lineTo(x, y);
  for (let i = N - 1; i >= 0; i--) s.lineTo(-pts[i][0], pts[i][1]);
  const g = new THREE.ShapeGeometry(s, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / len, x = p.getX(i) / wid;
    p.setZ(i, bend * len * y * y + cup * wid * x * x);
  }
  g.computeVertexNormals();
  return g;
}

function corianderGeo(r0) {
  const s = new THREE.Shape(), N = 36;
  s.moveTo(0, 0);
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (0.06 + (i / N) * 0.88);
    const rr = r0 * (0.68 + 0.32 * Math.abs(Math.cos(a * 3.5)));
    s.lineTo(Math.cos(a) * rr, Math.sin(a) * rr + r0 * 0.2);
  }
  s.lineTo(0, 0);
  const g = new THREE.ShapeGeometry(s, 1);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) / r0, y = p.getY(i) / r0;
    p.setZ(i, 0.18 * r0 * (x * x + y * y));
  }
  g.computeVertexNormals();
  return g;
}

function mesh(geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}

// ================================================================ FRIDGE ITEMS

export function buildChicken(M) {
  const g = new THREE.Group();
  g.add(mesh(roundedBox(0.25, 0.018, 0.18, 0.007), M.foam, 0, 0.009, 0));
  const r = rng(41);
  const spots = [[-0.074, -0.04], [0, -0.046], [0.074, -0.04], [-0.07, 0.042], [0.004, 0.046], [0.074, 0.04]];
  spots.forEach(([x, z], i) => {
    const rx = 0.036 + r() * 0.008, ry = 0.017 + r() * 0.006, rz = 0.027 + r() * 0.006;
    const m = mesh(blob(rx, ry, rz, i * 7.3 + 1, 0.16, 2.4), M.chicken, x, 0.018 + ry * 0.8, z);
    m.rotation.y = r() * TAU;
    g.add(m);
  });
  const bone = mesh(new THREE.CylinderGeometry(0.006, 0.008, 0.022, 10), M.bone, 0.112, 0.032, 0.04);
  bone.rotation.z = Math.PI / 2;
  g.add(bone);
  const film = mesh(roundedBox(0.254, 0.05, 0.184, 0.018), M.film, 0, 0.044, 0);
  film.renderOrder = 2;
  g.add(film);
  return shadowed(g);
}

// Dahi set in a matka-style clay pot.
export function buildDahi(M) {
  const g = new THREE.Group();
  const prof = [[0.0001, 0], [0.044, 0], [0.05, 0.004], [0.067, 0.028], [0.074, 0.052], [0.07, 0.073], [0.063, 0.081], [0.068, 0.087], [0.066, 0.093], [0.058, 0.091]];
  g.add(mesh(lathe(prof, 44), M.terracotta));
  const top = mesh(new THREE.CircleGeometry(0.059, 44), M.dahi, 0, 0.082, 0);
  top.rotation.x = -Math.PI / 2;
  g.add(top);
  return shadowed(g);
}

function tomatoGeo(seed) {
  const g = new THREE.SphereGeometry(1, 40, 28);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const th = Math.atan2(z, x);
    const lobe = 1 + 0.05 * Math.cos(5 * th + seed) * (1 - Math.abs(y));
    let yy = y * 0.82;
    if (y > 0.82) yy -= (y - 0.82) * 0.6;
    p.setXYZ(i, x * lobe, yy, z * lobe);
  }
  g.computeVertexNormals();
  return g;
}

function calyx(M, R) {
  const c = new THREE.Group();
  const lg = leafGeo(R * 0.55, R * 0.13, -0.5, 0.2);
  for (let k = 0; k < 5; k++) {
    const pivot = new THREE.Group();
    pivot.rotation.y = (k / 5) * TAU + 0.3;
    const leaf = new THREE.Mesh(lg, M.calyx);
    leaf.rotation.x = -Math.PI / 2;
    pivot.add(leaf);
    c.add(pivot);
  }
  c.add(mesh(new THREE.CylinderGeometry(R * 0.05, R * 0.07, R * 0.28, 8), M.stem, 0, R * 0.12, 0));
  return c;
}

export function buildTomatoes(M) {
  const g = new THREE.Group();
  const spots = [[-0.036, 0, -0.012, 0.034], [0.034, 0, -0.02, 0.032], [0.002, 0, 0.042, 0.035]];
  spots.forEach(([x, , z, R], i) => {
    const t = new THREE.Group();
    const body = mesh(tomatoGeo(i * 1.3), M.tomato);
    body.scale.setScalar(R);
    body.position.y = R * 0.82;
    t.add(body);
    const cx = calyx(M, R);
    cx.position.y = R * 0.82 * 2 - R * 0.06;
    t.add(cx);
    t.position.set(x, 0, z);
    t.rotation.y = i * 2.1;
    g.add(t);
  });
  return shadowed(g);
}

function chilliGeo(len, curve, seed) {
  const N = 18, pts = [[0.0001, 0], [0.0052, 0.0015]];
  for (let i = 1; i <= N; i++) {
    const t = i / N;
    const r = i === N ? 0.0001 : 0.0066 * Math.pow(1 - t, 0.55) * (1 + 0.07 * Math.sin(t * 9 + seed)) + 0.0004;
    pts.push([r, 0.0015 + t * len]);
  }
  const g = lathe(pts, 12);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / len;
    p.setZ(i, p.getZ(i) + curve * y * y * len * 0.35);
  }
  g.computeVertexNormals();
  return g;
}

export function buildChillies(M) {
  const g = new THREE.Group();
  const r = rng(71);
  for (let i = 0; i < 5; i++) {
    const len = 0.075 + r() * 0.03;
    const c = new THREE.Group();
    const body = new THREE.Mesh(chilliGeo(len, (r() - 0.5) * 1.6, i), M.chilli);
    c.add(body);
    const cap = mesh(new THREE.SphereGeometry(0.0062, 10, 8), M.calyx, 0, 0.0005, 0);
    cap.scale.y = 0.6;
    c.add(cap);
    c.add(mesh(new THREE.CylinderGeometry(0.0013, 0.0018, 0.014, 6), M.stem, 0, -0.007, 0));
    c.rotation.z = -Math.PI / 2;
    const holder = new THREE.Group();
    holder.add(c);
    holder.position.set((r() - 0.5) * 0.03, 0.0066, (i - 2) * 0.016);
    holder.rotation.y = (r() - 0.5) * 0.7;
    g.add(holder);
  }
  return shadowed(g);
}

export function buildLemons(M) {
  const g = new THREE.Group();
  const L = 0.064, R = 0.026, N = 20, pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    let r = R * Math.pow(Math.sin(Math.PI * t), 0.72);
    if (i === 0 || i === N) r = 0.0001;
    pts.push([r, t * L]);
  }
  const geo = lathe(pts, 28);
  [[-0.018, 0.4], [0.022, -0.3]].forEach(([z, ry], i) => {
    const m = new THREE.Mesh(geo, M.lemon);
    m.rotation.z = Math.PI / 2;
    const hold = new THREE.Group();
    m.position.set(L / 2, 0, 0);
    hold.add(m);
    hold.position.set(0, R, z * 1.2);
    hold.rotation.y = ry + i * 0.2;
    g.add(hold);
  });
  return shadowed(g);
}

function herbBunch(M, kind) {
  const g = new THREE.Group();
  const isMint = kind === "mint";
  const r = rng(isMint ? 81 : 83);
  const stems = isMint ? 9 : 13;
  const leafGeometry = isMint ? leafGeo(0.026, 0.011, 0.25, 0.25, 0.25) : corianderGeo(0.009);
  const count = isMint ? 72 : 120;
  const leaves = new THREE.InstancedMesh(leafGeometry, isMint ? M.mint : M.coriander, count);
  const dummy = new THREE.Object3D();
  let n = 0;
  for (let s = 0; s < stems; s++) {
    const spread = (s / (stems - 1) - 0.5);
    const end = new THREE.Vector3(0.15 + r() * 0.03, 0.012 + r() * 0.022, spread * 0.075 + (r() - 0.5) * 0.01);
    const mid = new THREE.Vector3(0.07, 0.008 + r() * 0.008, spread * 0.03);
    const curve = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.01, 0.006, spread * 0.008), mid, end]);
    g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.0013, 4, false), M.stem));
    const per = Math.floor(count / stems);
    for (let k = 0; k < per && n < count; k++, n++) {
      const t = 0.35 + 0.65 * (k / per);
      const pos = curve.getPoint(t);
      dummy.position.set(pos.x, pos.y + 0.002, pos.z + (r() - 0.5) * 0.012);
      dummy.rotation.set(-Math.PI / 2 + (r() - 0.5) * 0.9, r() * TAU, (r() - 0.5) * 0.6);
      const sc = (isMint ? 0.75 : 0.8) + r() * 0.5 * (t + 0.2);
      dummy.scale.setScalar(sc);
      dummy.updateMatrix();
      leaves.setMatrixAt(n, dummy.matrix);
    }
  }
  leaves.count = n;
  leaves.instanceMatrix.needsUpdate = true;
  g.add(leaves);
  const band = mesh(new THREE.TorusGeometry(0.009, 0.0016, 6, 16), M.rubber, 0.012, 0.007, 0);
  band.rotation.y = Math.PI / 2;
  g.add(band);
  return shadowed(g);
}
export const buildMint = (M) => herbBunch(M, "mint");
export const buildCoriander = (M) => herbBunch(M, "coriander");

// ================================================================ CUPBOARD ITEMS

function jar(M, { h = 0.1, r = 0.034, fill = 0.75, content = null, lid = M.lidRed, contentGeo = null }) {
  const g = new THREE.Group();
  const shell = [[0.0001, 0], [r * 0.9, 0], [r, 0.006], [r, h * 0.86], [r * 0.84, h * 0.93], [r * 0.84, h]];
  const glass = mesh(lathe(shell, 36), M.glass);
  glass.renderOrder = 3;
  if (content) {
    const fh = h * 0.84 * fill;
    const pr = [[0.0001, 0.003], [r * 0.92, 0.003], [r * 0.93, fh], [r * 0.6, fh + 0.004], [0.0001, fh + 0.006]];
    g.add(mesh(contentGeo || lathe(pr, 28), content));
  }
  g.add(glass);
  const lidM = mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 0.018, 36), lid, 0, h + 0.006, 0);
  g.add(lidM);
  const ring = mesh(new THREE.TorusGeometry(r * 0.9, 0.0016, 6, 36), lid, 0, h - 0.002, 0);
  ring.rotation.x = Math.PI / 2;
  g.add(ring);
  return g;
}

export function buildRedChilli(M) { return shadowed(jar(M, { content: M.powderRed, lid: M.lidRed, fill: 0.8 })); }
export function buildHaldi(M) { return shadowed(jar(M, { content: M.powderHaldi, lid: M.lidYellow, fill: 0.7 })); }
export function buildSalt(M) { return shadowed(jar(M, { content: M.powderSalt, lid: M.lidWhite, fill: 0.85, h: 0.11 })); }

export function buildGaram(M) {
  const g = jar(M, { content: M.powderGaram, lid: M.lidBrown, fill: 0.55, h: 0.11, r: 0.036 });
  const r = rng(91);
  const top = 0.11 * 0.84 * 0.55 + 0.006;
  for (let i = 0; i < 3; i++) {
    const stick = mesh(new THREE.CylinderGeometry(0.0042, 0.0042, 0.05, 10), M.cinnamon, (r() - 0.5) * 0.02, top + 0.005 + i * 0.006, (r() - 0.5) * 0.02);
    stick.rotation.set(Math.PI / 2, r() * TAU, 0.2);
    g.add(stick);
  }
  const star = new THREE.Shape();
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * TAU, rr = i % 2 ? 0.004 : 0.012;
    i ? star.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : star.moveTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  const anise = mesh(new THREE.ExtrudeGeometry(star, { depth: 0.004, bevelEnabled: true, bevelThickness: 0.0015, bevelSize: 0.001, bevelSegments: 1 }), M.anise, 0.012, top + 0.016, -0.008);
  anise.rotation.x = -Math.PI / 2 + 0.3;
  g.add(anise);
  const bay = mesh(leafGeo(0.045, 0.011, 0.1, 0.1), M.bayLeaf, -0.006, top + 0.02, 0.01);
  bay.rotation.set(-1.2, 0.4, 0.3);
  g.add(bay);
  return shadowed(g);
}

export function buildAlooBukhara(M) {
  const g = jar(M, { content: null, lid: M.lidRed, h: 0.1, r: 0.034 });
  const r = rng(93);
  for (let i = 0; i < 13; i++) {
    const a = r() * TAU, rr = r() * 0.018;
    const m = mesh(blob(0.011, 0.009, 0.01, i * 3.1, 0.28, 3.4, 16, 12), M.plum, Math.cos(a) * rr, 0.012 + Math.floor(i / 4) * 0.016 + r() * 0.004, Math.sin(a) * rr);
    m.rotation.set(r() * TAU, r() * TAU, 0);
    g.add(m);
  }
  return shadowed(g);
}

export function buildMasalaBox(M) {
  const g = new THREE.Group();
  const box = mesh(new THREE.BoxGeometry(0.09, 0.125, 0.034), [M.boxSide, M.boxSide, M.boxSide, M.boxSide, M.boxFront, M.boxFront], 0, 0.0625, 0);
  g.add(box);
  return shadowed(g);
}

function bottle(M, { h, r, neck, liquid, cap, label, fill = 0.8, capColorMat }) {
  const g = new THREE.Group();
  const shell = [[0.0001, 0], [r * 0.92, 0], [r, 0.004], [r, h * 0.7], [r * 0.82, h * 0.8], [neck * 1.1, h * 0.9], [neck, h * 0.92], [neck, h]];
  const liq = [[0.0001, 0.003], [r * 0.9, 0.003], [r * 0.9, Math.min(h * 0.7, h * fill)], [0.0001, Math.min(h * 0.7, h * fill)]];
  g.add(mesh(lathe(liq, 28), liquid));
  const glass = mesh(lathe(shell, 32), M.glass);
  glass.renderOrder = 3;
  g.add(glass);
  g.add(mesh(new THREE.CylinderGeometry(neck * 1.25, neck * 1.25, h * 0.14, 20), cap, 0, h + h * 0.06, 0));
  if (label) {
    const band = mesh(new THREE.CylinderGeometry(r * 1.012, r * 1.012, h * 0.34, 32, 1, true), label, 0, h * 0.36, 0);
    g.add(band);
  }
  return g;
}

export function buildKewra(M) {
  return shadowed(bottle(M, { h: 0.12, r: 0.022, neck: 0.008, liquid: M.liquidKewra, cap: M.capGreen, label: M.labelKewra }));
}
export function buildZarda(M) {
  return shadowed(bottle(M, { h: 0.07, r: 0.016, neck: 0.007, liquid: M.liquidZarda, cap: M.lidYellow, label: M.labelZarda }));
}

// ================================================================ SABZI (tokri and thaal)

function onionGeo(sq) {
  const pts = [[0.0001, 0], [0.006, 0.001], [0.017, 0.006], [0.031, 0.016], [0.04, 0.029], [0.042, 0.04], [0.038, 0.052], [0.028, 0.063], [0.016, 0.071], [0.007, 0.078], [0.0032, 0.087], [0.0001, 0.093]]
    .map(([r, y]) => [r * sq, y]);
  return lathe(pts, 30);
}

export function buildOnions(M) {
  const g = new THREE.Group();
  const spots = [[-0.045, 0.0, 0.3, 1.0], [0.04, 0.012, -0.5, 0.95], [0.0, 0.03, 0.2, 1.06]];
  spots.forEach(([x, z, tilt, sq], i) => {
    const o = new THREE.Group();
    o.add(mesh(onionGeo(sq), M.onion));
    for (let k = 0; k < 7; k++) {
      const root = mesh(new THREE.CylinderGeometry(0.0005, 0.0007, 0.01, 4), M.onionRoot, Math.cos(k) * 0.004, -0.003, Math.sin(k) * 0.004);
      root.rotation.set(Math.cos(k * 2) * 0.6, 0, Math.sin(k * 2) * 0.6);
      o.add(root);
    }
    o.position.set(x, 0.004, z + i * 0.012);
    o.rotation.set(tilt * 0.3, i * 1.7, tilt * 0.4);
    g.add(o);
  });
  return shadowed(g);
}

export function buildPotatoes(M) {
  const g = new THREE.Group();
  [[-0.03, -0.02, 0.046, 0.03, 0.034], [0.035, 0.0, 0.042, 0.028, 0.032], [0.0, 0.04, 0.038, 0.027, 0.03]].forEach(([x, z, rx, ry, rz], i) => {
    const m = mesh(blob(rx, ry, rz, i * 5.7 + 2, 0.14, 1.6), M.potato, x, ry * 0.92, z);
    m.rotation.y = i * 1.9;
    g.add(m);
  });
  return shadowed(g);
}

export function buildAdrak(M) {
  const g = new THREE.Group();
  const parts = [[0, 0.013, 0, 0.032, 0.013, 0.016, 0], [0.03, 0.015, 0.012, 0.016, 0.012, 0.013, 0.6], [-0.028, 0.014, -0.01, 0.017, 0.012, 0.013, -0.5], [0.012, 0.022, -0.016, 0.012, 0.01, 0.011, 1.2]];
  parts.forEach(([x, y, z, rx, ry, rz, rot], i) => {
    const m = mesh(blob(rx, ry, rz, i * 4.4 + 9, 0.2, 3.2), M.ginger, x, y, z);
    m.rotation.y = rot;
    g.add(m);
  });
  return shadowed(g);
}

function garlicGeo(seed) {
  const pts = [[0.0001, 0], [0.008, 0.001], [0.02, 0.006], [0.027, 0.016], [0.028, 0.024], [0.024, 0.034], [0.014, 0.042], [0.006, 0.048], [0.003, 0.057], [0.0001, 0.061]];
  const g = lathe(pts, 40);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), y = p.getY(i);
    const th = Math.atan2(z, x);
    const w = Math.sin(Math.min(1, y / 0.045) * Math.PI);
    const k = 1 + 0.07 * Math.abs(Math.sin(5 * th + seed)) * w;
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  g.computeVertexNormals();
  return g;
}

export function buildLassan(M) {
  const g = new THREE.Group();
  [[-0.022, 0, 0.0], [0.026, 0.008, 0.5]].forEach(([x, z, ry], i) => {
    const m = mesh(garlicGeo(i * 2), M.garlic, x, 0, z);
    m.rotation.set(i ? 0.25 : -0.1, ry, i ? -0.2 : 0.1);
    g.add(m);
  });
  return shadowed(g);
}

// ================================================================ PANTRY

export function buildRiceSack(M) {
  const prof = [[0.0001, 0], [0.13, 0.002], [0.16, 0.03], [0.172, 0.1], [0.176, 0.22], [0.166, 0.31], [0.13, 0.38], [0.07, 0.425], [0.036, 0.445], [0.034, 0.46], [0.05, 0.49], [0.062, 0.505], [0.0001, 0.5]];
  const geo = lathe(prof, 40);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const n = noise3(x * 14, y * 14, z * 14);
    const w = Math.sin(Math.min(1, y / 0.42) * Math.PI);
    const k = 1 + (n - 0.5) * 0.12 * w;
    p.setX(i, x * k); p.setZ(i, z * k);
  }
  geo.computeVertexNormals();
  const g = new THREE.Group();
  const sack = mesh(geo, M.burlap);
  g.add(sack);
  const rope = mesh(new THREE.TorusGeometry(0.038, 0.006, 8, 28), M.rope, 0, 0.447, 0);
  rope.rotation.x = Math.PI / 2;
  g.add(rope);
  return shadowed(g);
}

export function buildOil(M) {
  const g = new THREE.Group();
  const h = 0.26, r = 0.042;
  const shell = [[0.0001, 0], [r * 0.9, 0], [r, 0.008], [r, 0.18], [r * 0.82, 0.21], [0.017, 0.236], [0.015, 0.248], [0.015, h]];
  const liq = [[0.0001, 0.004], [r * 0.93, 0.004], [r * 0.95, 0.176], [r * 0.78, 0.2], [0.0001, 0.2]];
  g.add(mesh(lathe(liq, 30), M.liquidOil));
  const pet = mesh(lathe(shell, 32), M.pet);
  pet.renderOrder = 3;
  g.add(pet);
  g.add(mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.022, 24), M.capRed, 0, h + 0.008, 0));
  g.add(mesh(new THREE.CylinderGeometry(r * 1.012, r * 1.012, 0.09, 32, 1, true), M.labelOil, 0, 0.1, 0));
  return shadowed(g);
}

// ================================================================ DECOR

export function buildDegchi(M) {
  const g = new THREE.Group();
  const body = [[0.0001, 0], [0.13, 0], [0.152, 0.01], [0.16, 0.05], [0.158, 0.13], [0.15, 0.148], [0.155, 0.152], [0.148, 0.154]];
  const pot = mesh(lathe(body, 48), M.aluminium);
  g.add(pot);
  const lid = mesh(lathe([[0.156, 0], [0.152, 0.004], [0.11, 0.018], [0.04, 0.03], [0.0001, 0.034]], 48), M.aluminium, 0, 0.152, 0);
  g.add(lid);
  g.add(mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.018, 16), M.knob, 0, 0.152 + 0.042, 0));
  for (const s of [-1, 1]) {
    const hnd = mesh(new THREE.TorusGeometry(0.024, 0.0045, 8, 16, Math.PI), M.aluminium, s * 0.168, 0.118, 0);
    hnd.rotation.set(Math.PI / 2, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2);
    g.add(hnd);
  }
  return shadowed(g);
}

export function buildBoard(M) {
  const g = new THREE.Group();
  g.add(mesh(roundedBox(0.42, 0.024, 0.27, 0.01), M.boardWood, 0, 0.012, 0));
  const blade = new THREE.Shape();
  blade.moveTo(0, 0); blade.lineTo(0.17, 0); blade.quadraticCurveTo(0.2, 0.002, 0.205, 0.035); blade.lineTo(0, 0.04); blade.lineTo(0, 0);
  const b = mesh(new THREE.ExtrudeGeometry(blade, { depth: 0.0018, bevelEnabled: false }), M.knife, -0.04, 0.0262, 0.06);
  b.rotation.x = -Math.PI / 2;
  g.add(b);
  const handle = mesh(roundedBox(0.11, 0.016, 0.024, 0.006), M.knifeHandle, -0.096, 0.032, 0.04);
  g.add(handle);
  return shadowed(g);
}

export function buildTokri(M) {
  const g = new THREE.Group();
  const bowl = [[0.0001, 0], [0.1, 0], [0.13, 0.02], [0.155, 0.06], [0.165, 0.09], [0.16, 0.088], [0.15, 0.06], [0.125, 0.025], [0.095, 0.012], [0.0001, 0.012]];
  const b = mesh(lathe(bowl, 48), M.wicker);
  g.add(b);
  const rim = mesh(new THREE.TorusGeometry(0.163, 0.007, 8, 48), M.wickerRim, 0, 0.09, 0);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  return shadowed(g);
}

export function buildThaal(M) {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.0001, 0], [0.1, 0], [0.11, 0.004], [0.122, 0.014], [0.118, 0.015], [0.105, 0.006], [0.0001, 0.006]], 48), M.steel));
  return shadowed(g);
}

export function buildGheeTin(M) {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.14, 36), M.tin, 0, 0.07, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.0605, 0.0605, 0.1, 36, 1, true), M.labelGhee, 0, 0.068, 0));
  g.add(mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.008, 36), M.tin, 0, 0.144, 0));
  return shadowed(g);
}

export function buildLentilJar(M, mat) {
  return shadowed(jar(M, { h: 0.16, r: 0.05, fill: 0.7, content: mat, lid: M.lidWhite }));
}

export function buildSteelBowl(M, r = 0.07) {
  const g = new THREE.Group();
  g.add(mesh(lathe([[0.0001, 0], [r * 0.55, 0], [r * 0.85, r * 0.25], [r, r * 0.62], [r * 0.97, r * 0.64], [r * 0.82, r * 0.28], [r * 0.5, r * 0.06], [0.0001, r * 0.06]], 40), M.steel));
  return shadowed(g);
}

export function buildPlateOnEdge(M, r = 0.13) {
  const g = new THREE.Group();
  const p = mesh(lathe([[0.0001, 0], [r * 0.7, 0], [r, r * 0.12], [r * 0.98, r * 0.13], [r * 0.68, r * 0.03], [0.0001, r * 0.03]], 44), M.steel, 0, r, 0);
  p.rotation.x = Math.PI / 2 - 0.12;
  g.add(p);
  return shadowed(g);
}

// The wicker basket carried in first person.
export function buildHandBasket(M) {
  const g = new THREE.Group();
  const bowl = [[0.0001, 0], [0.08, 0], [0.11, 0.02], [0.13, 0.06], [0.135, 0.085], [0.13, 0.083], [0.122, 0.058], [0.104, 0.024], [0.078, 0.01], [0.0001, 0.01]];
  g.add(mesh(lathe(bowl, 40), M.wicker));
  const rim = mesh(new THREE.TorusGeometry(0.133, 0.006, 8, 40), M.wickerRim, 0, 0.086, 0);
  rim.rotation.x = Math.PI / 2;
  g.add(rim);
  const handle = mesh(new THREE.TorusGeometry(0.13, 0.007, 8, 32, Math.PI), M.wickerRim, 0, 0.086, 0);
  g.add(handle);
  return g;
}
