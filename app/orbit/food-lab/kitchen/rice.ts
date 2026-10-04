// @ts-nocheck
/* eslint-disable */
// Parboiling the rice: water in the pateela (filled at the tap), the grains
// tumbling in a rolling boil and turning from translucent to white and
// longer as they cook, bubbles, steam, and the grains left in the colander
// when it's drained.
//
// Pot positions are local to the pateela (origin at the centre of its base);
// colander positions are local to the colander. The grains in the pot and in
// the colander are two instanced meshes sharing one plain material (neither
// uses per-instance colours, so sharing is safe).
import * as THREE from "three";
import { makeCanvas } from "./textures";

const TAU = Math.PI * 2;
const N = 260;               // grains of rice
const POT_R = 0.13;          // inside radius of the pateela
const RAW = new THREE.Color(0xd9d3c2), COOKED = new THREE.Color(0xfbfaf4);

function dot(stops, size = 64) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

export function buildRice(M) {
  const pot = new THREE.Group(), col = new THREE.Group();
  let level = 0, cook = 0, boil = 0;

  // ---- water: a faint cool tint plus a gloss, like the oil
  const waterMat = M.liquidOil.clone();
  waterMat.color.setRGB(0.9, 0.95, 1.0);
  const waterGeo = new THREE.CircleGeometry(1, 48);
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.add(new THREE.Mesh(waterGeo, M.oilGloss));
  water.rotation.x = -Math.PI / 2;
  water.visible = false;
  pot.add(water);
  function setLevel(l) { level = l; water.visible = l > 0.002; water.position.y = 0.002 + l; water.scale.setScalar(POT_R - 0.002); }

  // ---- grains
  const grainMat = new THREE.MeshStandardMaterial({ color: RAW.clone(), roughness: 0.55 });
  const grainGeo = new THREE.SphereGeometry(1, 8, 6);
  const potGrains = new THREE.InstancedMesh(grainGeo, grainMat, N);
  const colGrains = new THREE.InstancedMesh(grainGeo, grainMat, N);
  for (const m of [potGrains, colGrains]) { m.count = 0; m.frustumCulled = false; m.receiveShadow = true; }
  pot.add(potGrains);
  col.add(colGrains);
  const grains = [];
  const dummy = new THREE.Object3D();
  const swell = () => 1 + 0.4 * Math.min(1.3, cook);
  function put(mesh, i, x, y, z, rx, ry) {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, ry, 0);
    const s = swell();
    dummy.scale.set(0.0022 * (1 + 0.15 * (s - 1)), 0.0022 * (1 + 0.15 * (s - 1)), 0.0075 * s);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }

  // Rice poured in from `from` (pot space): grains rain into the water and
  // spread through it.
  function pourIn(from) {
    for (let j = 0; j < N; j++) {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (POT_R - 0.012);
      grains.push({
        x: Math.cos(a) * d, z: Math.sin(a) * d, y: 0.01 + Math.random() * Math.max(0.01, level - 0.02),
        rx: Math.random() * TAU, ry: Math.random() * TAU, ph: Math.random() * TAU,
        fall: { from: from.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.03)), t: -(j / N) * 1.1, dur: 0.35 },
      });
    }
    potGrains.count = grains.length;
  }

  // ---- bubbles and steam
  const bubbleMat = new THREE.SpriteMaterial({ map: dot([[0, "rgba(255,255,255,0)"], [0.6, "rgba(255,255,255,0.2)"], [0.82, "rgba(255,255,255,0.9)"], [1, "rgba(255,255,255,0)"]]), transparent: true, depthWrite: false });
  const bubbles = [];
  for (let i = 0; i < 40; i++) { const b = new THREE.Sprite(bubbleMat); b.visible = false; pot.add(b); bubbles.push({ b, life: 0, max: 1, size: 0.005 }); }
  const steamTex = dot([[0, "rgba(255,255,255,0.5)"], [0.5, "rgba(250,250,250,0.22)"], [1, "rgba(250,250,250,0)"]]);
  const steam = [];
  for (let i = 0; i < 14; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, depthWrite: false, opacity: 0 })); s.visible = false; pot.add(s); steam.push({ s, life: 0, max: 1 }); }
  let bAcc = 0, sAcc = 0;

  // ---- draining: the grains go from the pot into the colander
  const draining = [];
  function drainTo(fromCol) {
    potGrains.count = 0;
    colGrains.count = grains.length;
    grains.forEach((g, i) => {
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * 0.065;
      const to = { x: Math.cos(a) * d, y: 0.012 + (1 - d / 0.065) * 0.03 + Math.random() * 0.008, z: Math.sin(a) * d };
      draining.push({ i, g, from: fromCol.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.04, 0, (Math.random() - 0.5) * 0.04)), to, t: -(i / grains.length) * 0.7 });
      put(colGrains, i, fromCol.x, fromCol.y, fromCol.z, g.rx, g.ry);
    });
    colGrains.instanceMatrix.needsUpdate = true;
  }

  function setCook(c) {
    cook = c;
    grainMat.color.copy(RAW).lerp(COOKED, Math.min(1, c));
  }
  function setBoil(b) { boil = b; }

  function update(dt, time) {
    // grains: falling in, then tumbling with the boil
    let any = false;
    for (let i = 0; i < grains.length && potGrains.count; i++) {
      const g = grains[i];
      if (g.fall) {
        g.fall.t += dt;
        if (g.fall.t < 0) { put(potGrains, i, g.fall.from.x, g.fall.from.y, g.fall.from.z, g.rx, g.ry); continue; }
        const k = Math.min(1, g.fall.t / g.fall.dur);
        put(potGrains, i, g.fall.from.x + (g.x - g.fall.from.x) * k, g.fall.from.y + (g.y - g.fall.from.y) * k * k, g.fall.from.z + (g.z - g.fall.from.z) * k, g.rx, g.ry);
        if (k >= 1) g.fall = null;
      } else {
        // a rolling boil turns them over and carries them round
        const sw = boil * 0.4 * dt, c = Math.cos(sw), s = Math.sin(sw);
        const x = g.x * c - g.z * s, z = g.x * s + g.z * c;
        g.x = x; g.z = z;
        g.rx += boil * dt * 1.5; g.ry += boil * dt;
        const bob = boil * 0.006 * Math.sin(time * 3 + g.ph);
        put(potGrains, i, g.x, Math.max(0.006, Math.min(level - 0.004, g.y + bob)), g.z, g.rx, g.ry);
      }
      any = true;
    }
    if (any) potGrains.instanceMatrix.needsUpdate = true;
    for (let n = draining.length - 1; n >= 0; n--) {
      const d = draining[n];
      d.t += dt;
      if (d.t < 0) continue;
      const k = Math.min(1, d.t / 0.35);
      put(colGrains, d.i, d.from.x + (d.to.x - d.from.x) * k, d.from.y + (d.to.y - d.from.y) * k * k, d.from.z + (d.to.z - d.from.z) * k, d.g.rx, d.g.ry);
      colGrains.instanceMatrix.needsUpdate = true;
      if (k >= 1) draining.splice(n, 1);
    }
    // bubbles at the surface, steam above it
    bAcc += dt * boil * 60;
    while (bAcc >= 1 && level > 0.01) {
      bAcc -= 1;
      const p = bubbles.find((q) => q.life <= 0);
      if (!p) break;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * (POT_R - 0.01);
      p.b.position.set(Math.cos(a) * d, level + 0.003, Math.sin(a) * d);
      p.life = p.max = 0.15 + Math.random() * 0.3;
      p.size = 0.004 + Math.random() * 0.008;
      p.b.visible = true;
    }
    for (const p of bubbles) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.b.visible = false; continue; }
      p.b.scale.setScalar(p.size * (0.4 + 0.6 * (1 - p.life / p.max)));
    }
    sAcc += dt * boil * 5;
    while (sAcc >= 1) {
      sAcc -= 1;
      const s = steam.find((q) => q.life <= 0);
      if (!s) break;
      s.s.position.set((Math.random() - 0.5) * 0.15, Math.max(level, 0.05) + 0.03, (Math.random() - 0.5) * 0.15);
      s.life = s.max = 1.8 + Math.random();
      s.s.visible = true;
    }
    for (const s of steam) {
      if (s.life <= 0) continue;
      s.life -= dt;
      if (s.life <= 0) { s.s.visible = false; continue; }
      const k = 1 - s.life / s.max;
      s.s.position.y += dt * 0.12;
      s.s.scale.setScalar(0.05 + k * 0.18);
      s.s.material.opacity = Math.sin(Math.PI * k) * 0.4;
    }
  }

  return {
    pot, col, setLevel, pourIn, drainTo, setCook, setBoil, update,
    get level() { return level; },
    get inPot() { return potGrains.count; },
    get inColander() { return colGrains.count; },
    get falling() { return grains.some((g) => g.fall) || draining.length > 0; },
  };
}
