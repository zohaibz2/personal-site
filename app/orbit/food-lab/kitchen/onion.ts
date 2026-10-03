// @ts-nocheck
/* eslint-disable */
// The onion station on the chopping board. A peeled half onion lies cut-side
// down with its long axis along +z (towards the player). Each knife stroke
// moves a clipping plane back along z, shows the fresh cut face (rings) at the
// plane, and drops a fan of thin half-moon slices that tip over towards you
// onto a pile at the front of the board.
//
// All coordinates are local to `root`, which sits on the board's top surface.
import * as THREE from "three";
import { makeCanvas } from "./textures";

export const STROKES = 6;          // knife strokes per half onion
const PER_STROKE = 3;              // thin slices that fall per stroke
const A = 0.046, B = 0.04, C = 0.042; // half-length (z), height (y), half-width (x)
const THICK = 0.004;
const MAX_SLICES = 3 * 2 * STROKES * PER_STROKE;

export const CUT = new THREE.Vector3(-0.06, 0, -0.04);    // where the half onion is cut
const WAIT = new THREE.Vector3(0.11, 0, 0.05);            // the other half waits here
const PILE = { x: -0.075, z: 0.035, sx: 0.06, sz: 0.025 }; // slices land around here

// Cross-section of a red onion: pale pink-white rings with thin magenta lines
// and a darker outer layer. Centred, so a half disc shows half moons.
function ringsTexture(size = 256) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const h = size / 2;
  x.clearRect(0, 0, size, size);
  let i = 0;
  for (let r = h; r > 3; r -= size * 0.043, i++) {
    const t = r / h;
    x.beginPath(); x.arc(h, h, r, 0, Math.PI * 2);
    x.fillStyle = i === 0 ? "#a5487a" : `rgb(${Math.round(246 - 22 * t)},${Math.round(236 - 52 * t)},${Math.round(242 - 30 * t)})`;
    x.fill();
    if (i > 0) { x.lineWidth = size * 0.009; x.strokeStyle = `rgba(160,60,115,${0.35 + 0.45 * t})`; x.stroke(); }
  }
  const t = new THREE.CanvasTexture(c);
  t.encoding = THREE.sRGBEncoding;
  return t;
}

// Half ellipsoid, flat side down, long axis along z.
function halfOnionGeometry() {
  const g = new THREE.SphereGeometry(1, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2);
  g.scale(C, B, A);
  return g;
}

export function buildOnionStation(M) {
  const root = new THREE.Group();
  const rings = ringsTexture();
  const flesh = new THREE.MeshPhysicalMaterial({ color: 0xc77fa3, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.25 });
  const ringMat = new THREE.MeshStandardMaterial({ map: rings, roughness: 0.4, alphaTest: 0.5 });
  const geo = halfOnionGeometry();

  // the half being cut, clipped by a plane that moves back along z
  const plane = new THREE.Plane(new THREE.Vector3(0, 0, -1), 0);
  const cutMat = flesh.clone();
  cutMat.clippingPlanes = [plane];
  cutMat.clipShadows = true;
  const cutter = new THREE.Mesh(geo, cutMat);
  cutter.position.copy(CUT);
  cutter.castShadow = true; cutter.receiveShadow = true;
  cutter.visible = false;
  root.add(cutter);
  const cap = new THREE.Mesh(new THREE.CircleGeometry(1, 32, 0, Math.PI), ringMat);
  cap.visible = false;
  cutter.add(cap);

  // the other half, waiting its turn
  const waiting = new THREE.Mesh(geo, flesh);
  waiting.castShadow = true; waiting.receiveShadow = true;
  waiting.visible = false;
  root.add(waiting);

  // papery skin scraps left on the board
  const skinGeo = new THREE.SphereGeometry(0.028, 10, 6, 0, 1.3, 0.5, 0.9);
  const skins = [];
  function dropSkins() {
    for (let i = 0; i < 2; i++) {
      const s = new THREE.Mesh(skinGeo, M.onionSkin);
      s.position.set(WAIT.x + 0.03 + Math.random() * 0.04, 0.0, WAIT.z - 0.09 + Math.random() * 0.05);
      s.rotation.set(Math.PI + 0.3 * Math.random(), Math.random() * 6.28, 0.4 * (Math.random() - 0.5));
      s.receiveShadow = true;
      root.add(s);
      skins.push(s);
    }
  }

  // half-moon slices: one instanced mesh, a half disc (z <= 0 half) of unit radius
  const sliceGeo = new THREE.CylinderGeometry(1, 1, THICK, 20, 1, false, Math.PI / 2, Math.PI);
  const slices = new THREE.InstancedMesh(sliceGeo, ringMat, MAX_SLICES);
  slices.count = 0;
  slices.frustumCulled = false;
  slices.receiveShadow = true;
  root.add(slices);
  const falling = [];
  const dummy = new THREE.Object3D();
  let landed = 0;

  // Rotation x is the tip: PI/2 stands the half moon up (dome on top),
  // PI lays it flat with the dome towards +z.
  function place(i, p, tip, yaw, k) {
    dummy.position.copy(p);
    dummy.rotation.set(tip, yaw, 0, "YXZ");
    dummy.scale.set(C * k, 1, B * k);
    dummy.updateMatrix();
    slices.setMatrixAt(i, dummy.matrix);
  }

  let cutZ = A;
  function setCut(z) {
    cutZ = z;
    // keep the part with local z <= cutZ: plane normal is -z in world space
    cutter.updateWorldMatrix(true, false);
    const e = cutter.matrixWorld.elements;
    let zx = e[8], zy = e[9], zz = e[10];
    const l = Math.hypot(zx, zy, zz) || 1;
    zx /= l; zy /= l; zz /= l;
    plane.normal.set(-zx, -zy, -zz);
    plane.constant = zx * e[12] + zy * e[13] + zz * e[14] + z;
    const k = Math.sqrt(Math.max(0, 1 - (z / A) * (z / A)));
    cap.visible = cutter.visible && z < A - 0.001 && k > 0.05;
    cap.position.set(0, 0.0003, z);
    cap.scale.set(C * k, B * k, 1);
  }

  // a fresh half onion at the cutting spot; with `withOther` the second half
  // appears at the waiting spot along with some peeled skin
  function startHalf(withOther) {
    cutter.visible = true;
    cutter.rotation.set(0, 0, 0);
    setCut(A);
    if (withOther) {
      waiting.visible = true;
      waiting.position.copy(WAIT);
      waiting.rotation.set(0, 0.6 + Math.random() * 0.5, 0);
      dropSkins();
    }
  }

  // One stroke of the knife: frac is how much of this half is now cut (0..1).
  function stroke(frac) {
    const z0 = cutZ, z1 = A - 2 * A * frac;
    for (let j = 0; j < PER_STROKE && slices.count < MAX_SLICES; j++) {
      const z = z0 - ((j + 0.5) / PER_STROKE) * (z0 - z1);
      const k = Math.max(0.3, Math.sqrt(Math.max(0, 1 - (z / A) * (z / A))));
      const i = slices.count++;
      const from = new THREE.Vector3(CUT.x, 0, CUT.z + z);
      const to = new THREE.Vector3(
        PILE.x + (Math.random() * 2 - 1) * PILE.sx,
        Math.min(0.014, 0.0015 + landed * 0.00016) + Math.random() * 0.002 + THICK / 2,
        PILE.z + (Math.random() * 2 - 1) * PILE.sz
      );
      const yaw = (Math.random() - 0.5) * 1.2;
      place(i, from, Math.PI / 2, 0, k);
      falling.push({ i, from, to, yaw, k, t: -j * 0.05, dur: 0.32 + Math.random() * 0.1 });
    }
    slices.instanceMatrix.needsUpdate = true;
    if (frac >= 1) { cutter.visible = false; cap.visible = false; cutZ = -A; }
    else setCut(z1);
  }

  const p = new THREE.Vector3();
  function update(dt) {
    if (!falling.length) return 0;
    let thuds = 0;
    for (let n = falling.length - 1; n >= 0; n--) {
      const f = falling[n];
      f.t += dt;
      if (f.t < 0) continue;
      const k = Math.min(1, f.t / f.dur), e = k * k;
      p.lerpVectors(f.from, f.to, k);
      p.y += Math.sin(Math.PI * k) * 0.02;
      place(f.i, p, Math.PI / 2 + (Math.PI / 2) * e, f.yaw * k, f.k);
      if (k >= 1) { falling.splice(n, 1); landed++; thuds++; }
    }
    slices.instanceMatrix.needsUpdate = true;
    return thuds;
  }

  return {
    root, cutter, waiting, startHalf, stroke, update,
    hideWaiting() { waiting.visible = false; },
    get landed() { return landed; },
    get settling() { return falling.length > 0; },
  };
}
