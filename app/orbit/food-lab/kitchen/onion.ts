// @ts-nocheck
/* eslint-disable */
// The onion station on the chopping board. A whole onion lies on its side
// with the root at the back and the tip towards you (+z). It is prepared the
// way a cook does it: trim the tip, trim the root, peel the skin off in two
// pieces, then slice it into rings from the front back.
//
// Cutting is done with two clipping planes (front and back) on the onion's
// materials; a disc with a ringed cross-section sits at each cut face. The
// slices are real geometry: concentric layers, each with a purple outer
// skin, and some of them fall apart into loose rings on the pile.
//
// Positions are local to `root`, which sits on the board's top surface.
// Along the onion, `a` runs from 0 (root) to LEN (tip).
import * as THREE from "three";
import { makeCanvas } from "./textures";

const TAU = Math.PI * 2;
// Same outline as the onions on the table (see onionGeo in props.ts).
const PROFILE = [[0.0001, 0], [0.006, 0.001], [0.017, 0.006], [0.031, 0.016], [0.04, 0.029], [0.042, 0.04], [0.038, 0.052], [0.028, 0.063], [0.016, 0.071], [0.007, 0.078], [0.0032, 0.087], [0.0001, 0.093]];
export const LEN = 0.093;
export const TRIM_TIP = LEN - 0.012;
export const TRIM_ROOT = 0.008;
export const SLICES = 10;                         // rings per onion
export const SLICE_T = (TRIM_TIP - TRIM_ROOT) / SLICES;
export const CUT = new THREE.Vector3(-0.04, 0, -0.06); // centre of the onion on the board
const FLESH = 0.965;                              // peeled onion is this much of the skin's size
// where the two peeled skin pieces end up (left side of the board)
const SCRAPS = [new THREE.Vector3(-0.19, 0, -0.03), new THREE.Vector3(-0.125, 0, -0.1)];
const PILE = { x: CUT.x, z: CUT.z + LEN / 2 + 0.05, sx: 0.045, sz: 0.022 };
const MAX = 3 * SLICES + 4;

// radius of the onion at `a` along its length
export function radiusAt(a, sq = 1) {
  if (a <= 0 || a >= LEN) return 0.0001;
  for (let i = 1; i < PROFILE.length; i++) {
    const [r1, y1] = PROFILE[i];
    if (a <= y1) {
      const [r0, y0] = PROFILE[i - 1];
      return (r0 + ((a - y0) / (y1 - y0)) * (r1 - r0)) * sq;
    }
  }
  return 0.0001;
}
export const zAt = (a) => CUT.z - LEN / 2 + a;

// Cross-section texture for the cut faces: pale rings, thin magenta lines,
// a darker outer layer.
function ringsTexture(size = 256) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const h = size / 2;
  x.clearRect(0, 0, size, size);
  let i = 0;
  for (let r = h; r > 3; r -= size * 0.043, i++) {
    const t = r / h;
    x.beginPath(); x.arc(h, h, r, 0, TAU);
    x.fillStyle = i === 0 ? "#a5487a" : `rgb(${Math.round(246 - 22 * t)},${Math.round(236 - 52 * t)},${Math.round(242 - 30 * t)})`;
    x.fill();
    if (i > 0) { x.lineWidth = size * 0.009; x.strokeStyle = `rgba(160,60,115,${0.35 + 0.45 * t})`; x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

// Onion layers as flat bands around the y axis (unit radius, `h` thick),
// each with a pale top and bottom, a purple outer wall and a white inner wall.
function layersGeometry(bands, arc, h) {
  const pos = [], nor = [], col = [];
  const C = (hex) => new THREE.Color(hex);
  const outerWall = C(0x8f3468), innerWall = C(0xf1e6ec);
  const quad = (a, b, c, d, n0, n1, n2, n3, color) => {
    for (const [p, n] of [[a, n0], [b, n1], [c, n2], [a, n0], [c, n2], [d, n3]]) {
      pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]); col.push(color.r, color.g, color.b);
    }
  };
  bands.forEach(([r0, r1], bi) => {
    const k = bi / Math.max(1, bands.length - 1);
    const face = C(0xf4ebf0).lerp(C(0xe2b9cf), k * k);
    const seg = Math.max(8, Math.ceil(36 * arc / TAU));
    for (let i = 0; i < seg; i++) {
      const t0 = (i / seg) * arc, t1 = ((i + 1) / seg) * arc;
      const c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1);
      const P = (r, c, s, y) => [r * c, y, r * s];
      const up = [0, 1, 0], dn = [0, -1, 0];
      quad(P(r0, c0, s0, h / 2), P(r0, c1, s1, h / 2), P(r1, c1, s1, h / 2), P(r1, c0, s0, h / 2), up, up, up, up, face);
      quad(P(r0, c0, s0, -h / 2), P(r1, c0, s0, -h / 2), P(r1, c1, s1, -h / 2), P(r0, c1, s1, -h / 2), dn, dn, dn, dn, face);
      quad(P(r1, c0, s0, h / 2), P(r1, c1, s1, h / 2), P(r1, c1, s1, -h / 2), P(r1, c0, s0, -h / 2), [c0, 0, s0], [c1, 0, s1], [c1, 0, s1], [c0, 0, s0], outerWall);
      quad(P(r0, c0, s0, -h / 2), P(r0, c1, s1, -h / 2), P(r0, c1, s1, h / 2), P(r0, c0, s0, h / 2), [-c0, 0, -s0], [-c1, 0, -s1], [-c1, 0, -s1], [-c0, 0, -s0], innerWall);
    }
  });
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  return g;
}
const LAYER_H = 0.003;
const SLICE_BANDS = [[0.16, 0.27], [0.285, 0.41], [0.425, 0.55], [0.565, 0.69], [0.705, 0.83], [0.845, 0.955], [0.965, 1.0]];

// A lathe of part of the onion's outline (a0..a1), for the trimmed-off ends.
function endGeometry(a0, a1, sq) {
  const pts = [new THREE.Vector2(radiusAt(a0, sq), a0)];
  for (const [r, y] of PROFILE) if (y > a0 && y < a1) pts.push(new THREE.Vector2(Math.max(r * sq, 0.0001), y));
  pts.push(new THREE.Vector2(Math.max(radiusAt(a1, sq), 0.0001), a1));
  if (a0 > 0.0005) pts.unshift(new THREE.Vector2(0.0001, a0)); // close the cut side
  if (a1 < LEN - 0.0005) pts.push(new THREE.Vector2(0.0001, a1));
  return new THREE.LatheGeometry(pts, 20);
}

export function buildOnionStation(M) {
  const root = new THREE.Group();
  const ringMat = new THREE.MeshStandardMaterial({ map: ringsTexture(), roughness: 0.4, alphaTest: 0.5 });
  const layerMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.3, side: THREE.DoubleSide });
  const fleshMat = new THREE.MeshPhysicalMaterial({ color: 0xa0507e, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });

  // the two cut planes; materials on the onion keep only what's between them
  const front = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const back = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  const clipped = (m) => { const c = m.clone(); c.clippingPlanes = [front, back]; c.clipShadows = true; return c; };
  const skinMat = clipped(M.onion);
  const fleshClip = clipped(fleshMat);

  // the onion on the board: lathe axis turned to point along +z
  const onion = new THREE.Group();
  onion.rotation.x = Math.PI / 2;
  onion.position.set(CUT.x, 0, zAt(0));
  onion.visible = false;
  root.add(onion);
  let skins = [], flesh = null, sq = 1, aF = LEN, aB = 0;
  const capF = new THREE.Mesh(new THREE.CircleGeometry(1, 36), ringMat);
  capF.rotation.x = -Math.PI / 2; // faces +y of the lathe = towards you
  const capB = new THREE.Mesh(new THREE.CircleGeometry(1, 36), ringMat);
  capB.rotation.x = Math.PI / 2;
  onion.add(capF, capB);

  function setPlanes() {
    root.updateWorldMatrix(true, false);
    const e = root.matrixWorld.elements;
    let zx = e[8], zy = e[9], zz = e[10];
    const l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    const o = zx * e[12] + zy * e[13] + zz * e[14];
    front.normal.set(-zx, -zy, -zz); front.constant = o + zAt(aF);   // keep z <= front cut
    back.normal.set(zx, zy, zz); back.constant = -(o + zAt(aB));     // keep z >= back cut
    const peeled = skins.every((s) => !s.visible);
    const k = peeled ? FLESH : 1;
    capF.visible = aF < LEN - 0.001 && aF > aB + 0.002;
    capF.position.y = aF - 0.0002;
    capF.scale.setScalar(Math.max(0.001, radiusAt(aF, sq) * k * 0.99));
    capB.visible = aB > 0.001 && aF > aB + 0.002;
    capB.position.y = aB + 0.0002;
    capB.scale.setScalar(Math.max(0.001, radiusAt(aB, sq) * k * 0.99));
  }

  // ---- things that fall or fly: trimmed ends, peeled skin, slices
  const movers = [];
  const move = (obj, to, rot, dur, arc = 0.03, scale = null) => movers.push({
    obj, from: obj.position.clone(), to, r0: obj.rotation.clone(), r1: rot, t: 0, dur, arc,
    s0: obj.scale.clone(), s1: scale,
  });

  const slices = new THREE.InstancedMesh(layersGeometry(SLICE_BANDS, TAU, LAYER_H), layerMat, MAX);
  const loose = new THREE.InstancedMesh(layersGeometry([[0.88, 1.0]], TAU * 0.62, LAYER_H), layerMat, MAX * 2);
  for (const m of [slices, loose]) { m.count = 0; m.frustumCulled = false; m.receiveShadow = true; root.add(m); }
  const falling = [];
  const dummy = new THREE.Object3D();
  let landed = 0;
  function place(mesh, i, p, tip, yaw, r, thick) {
    dummy.position.copy(p);
    dummy.rotation.set(tip, yaw, 0, "YXZ");
    dummy.scale.set(r, thick / LAYER_H, r);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }
  const pileY = () => Math.min(0.016, 0.0015 + landed * 0.0004) + Math.random() * 0.0015;

  // A new whole onion at the cutting spot (same shape factor as the one
  // that flew over from the table, so the swap is invisible).
  function newOnion(shape) {
    sq = shape;
    for (const s of skins) onion.remove(s);
    if (flesh) onion.remove(flesh);
    const pts = PROFILE.map(([r, y]) => new THREE.Vector2(Math.max(r * sq, 0.0001), y));
    skins = [0, Math.PI].map((phi) => {
      const m = new THREE.Mesh(new THREE.LatheGeometry(pts, 16, phi, Math.PI), skinMat);
      m.castShadow = true; m.receiveShadow = true;
      onion.add(m);
      return m;
    });
    flesh = new THREE.Mesh(new THREE.LatheGeometry(pts.map((p) => new THREE.Vector2(p.x * FLESH, p.y)), 32), fleshClip);
    flesh.castShadow = true; flesh.receiveShadow = true;
    onion.add(flesh);
    onion.position.y = radiusAt(0.04, sq); // resting on its widest point
    onion.visible = true;
    aF = LEN; aB = 0;
    setPlanes();
  }

  // Trim an end off; the piece drops away from the onion.
  function trim(which) {
    const tip = which === "tip";
    const a = tip ? TRIM_TIP : TRIM_ROOT;
    if (tip) aF = a; else aB = a;
    setPlanes();
    const a0 = tip ? a : 0, a1 = tip ? LEN : a, mid = (a0 + a1) / 2;
    // built around its own middle, so it tumbles in place rather than swinging
    const inner = new THREE.Group();
    inner.position.y = -mid;
    const lathe = new THREE.Mesh(endGeometry(a0, a1, sq), M.onionSkin);
    lathe.castShadow = true;
    const face = new THREE.Mesh(new THREE.CircleGeometry(radiusAt(a, sq) * 0.99, 24), ringMat);
    face.rotation.x = tip ? Math.PI / 2 : -Math.PI / 2;
    face.position.y = a + (tip ? 0.0002 : -0.0002);
    inner.add(lathe, face);
    const piece = new THREE.Group();
    piece.add(inner);
    piece.position.set(CUT.x, onion.position.y, zAt(mid));
    piece.rotation.copy(onion.rotation);
    root.add(piece);
    // the tip tips forward onto its side; the root end rocks back onto its
    // round bottom with the cut face up
    const to = new THREE.Vector3(CUT.x + (tip ? 0.01 : -0.012), tip ? 0.005 : 0.007, zAt(mid) + (tip ? 0.03 : -0.022));
    const rot = new THREE.Euler(onion.rotation.x + (tip ? 0.5 : -1.2), 0.5 * (Math.random() - 0.5), 0);
    move(piece, to, rot, 0.4, 0.015);
  }

  // Peeling: `p` (0..1) lifts one half of the skin away from the onion.
  // half 0 is the right side (+x), half 1 the left.
  function peelProgress(half, p) {
    const s = skins[half];
    if (!s || !s.visible) return;
    const side = half === 0 ? 1 : -1;
    s.position.set(side * p * 0.008, 0, -p * 0.006); // lathe -z is up once laid on its side
    s.rotation.y = side * p * 0.12;
  }
  function peelOff(half) {
    const s = skins[half];
    if (!s) return;
    // The torn skin lands on the left of the board as a flattened curl with
    // its hollow side up. Rotating z by -/+90 degrees turns the skin's outer
    // side (+x or -x) downwards and lays its length along x.
    const scrap = new THREE.Mesh(s.geometry, M.onionSkin);
    scrap.castShadow = true; scrap.receiveShadow = true;
    root.add(scrap);
    scrap.position.set(CUT.x + (half === 0 ? 0.01 : -0.01), onion.position.y + 0.004, zAt(0));
    scrap.rotation.set(onion.rotation.x, 0, 0, "YXZ");
    s.visible = false;
    const spot = SCRAPS[half];
    const to = new THREE.Vector3(spot.x + (Math.random() - 0.5) * 0.015, 0.042 * sq * 0.3 + 0.001, spot.z + (Math.random() - 0.5) * 0.02);
    const rot = new THREE.Euler(0, (Math.random() - 0.5) * 0.8, half === 0 ? -Math.PI / 2 : Math.PI / 2, "YXZ");
    move(scrap, to, rot, 0.45, 0.05, new THREE.Vector3(0.3, 0.6, 0.6));
    setPlanes();
  }

  // Slice from the front cut back to `a1`: a ring falls forward onto the pile.
  function slice(a1) {
    const a0 = aF, mid = (a0 + a1) / 2;
    aF = a1;
    const done = aF <= aB + SLICE_T * 0.5;
    if (done) { onion.visible = false; capF.visible = capB.visible = false; }
    else setPlanes();
    if (slices.count >= MAX) return done;
    const i = slices.count++;
    const r = Math.max(0.012, radiusAt(mid, sq) * FLESH);
    const from = new THREE.Vector3(CUT.x, onion.position.y, zAt(mid));
    const to = new THREE.Vector3(PILE.x + (Math.random() * 2 - 1) * PILE.sx, 0, PILE.z + (Math.random() * 2 - 1) * PILE.sz);
    const thick = (a0 - a1) * 0.8;
    const f = { mesh: slices, i, from, to, toY: pileY() + thick / 2, yaw: (Math.random() - 0.5) * 1.5, r, thick, t: 0, dur: 0.38 };
    place(slices, i, from, Math.PI / 2, 0, r, f.thick);
    falling.push(f);
    return done;
  }

  const p = new THREE.Vector3();
  function update(dt) {
    let thuds = 0;
    for (let n = movers.length - 1; n >= 0; n--) {
      const m = movers[n];
      m.t += dt;
      const k = Math.min(1, m.t / m.dur), e = 1 - (1 - k) * (1 - k);
      m.obj.position.lerpVectors(m.from, m.to, e);
      m.obj.position.y += Math.sin(Math.PI * k) * m.arc;
      m.obj.rotation.set(m.r0.x + (m.r1.x - m.r0.x) * e, m.r0.y + (m.r1.y - m.r0.y) * e, m.r0.z + (m.r1.z - m.r0.z) * e);
      if (m.s1) m.obj.scale.lerpVectors(m.s0, m.s1, e);
      if (k >= 1) { movers.splice(n, 1); thuds++; }
    }
    for (let n = falling.length - 1; n >= 0; n--) {
      const f = falling[n];
      f.t += dt;
      const k = Math.min(1, f.t / f.dur), e = k * k;
      p.lerpVectors(f.from, f.to, k);
      p.y = f.from.y * (1 - e) + f.toY * e + Math.sin(Math.PI * k) * 0.012;
      place(f.mesh, f.i, p, Math.PI / 2 + (Math.PI / 2) * e, f.yaw * k, f.r, f.thick);
      if (k >= 1) {
        falling.splice(n, 1);
        landed++; thuds++;
        // some outer layers come loose and lie beside the slice
        const nLoose = Math.random() < 0.6 ? 1 + (Math.random() < 0.35 ? 1 : 0) : 0;
        for (let j = 0; j < nLoose && loose.count < MAX * 2; j++) {
          const q = new THREE.Vector3(f.to.x + (Math.random() - 0.5) * 0.05, pileY() + 0.002, f.to.z + (Math.random() - 0.5) * 0.04);
          place(loose, loose.count++, q, Math.PI, Math.random() * TAU, f.r * (0.75 + Math.random() * 0.3), f.thick * 0.8);
        }
      }
    }
    return thuds;
  }

  return {
    root, onion, newOnion, trim, peelProgress, peelOff, slice, update,
    get aF() { return aF; },
    get sq() { return sq; },
    get landed() { return landed; },
    get loose() { return loose.count; },
    get busy() { return movers.length > 0 || falling.length > 0; },
  };
}
