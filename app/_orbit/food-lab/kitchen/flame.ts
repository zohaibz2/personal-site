// @ts-nocheck
/* eslint-disable */
// The gas flame on a burner: a crown of blue jets, a glow on the black glass,
// a flickering light and the sparks from the lighter. Everything is unlit and
// additive, so it reads as light rather than as geometry.
//
//   update(dt, time, flow, lit, capped)  flow is 0..1 (how far the knob is
//                                open); capped = a pot is sitting on the burner
//   spark()                      one click of the lighter at the burner rim
//   ignite(k)                    the flame catches; k = 0..1 is how much gas had built up
import * as THREE from "three";
import { makeCanvas } from "./textures";

const JETS = 30;
const TAU = Math.PI * 2;
const RIM = 0.044; // burner cap radius, where the jets come out
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

function radial(stops, size = 128) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  for (const [o, col] of stops) g.addColorStop(o, col);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

const additive = (o) => new THREE.MeshBasicMaterial(Object.assign({
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false, side: THREE.DoubleSide,
}, o));

// Fades each jet out towards its tip, so the flame has soft ends instead of
// hard spikes. Cone UVs run 0 at the base to 1 at the tip, which is the top
// row of this canvas.
function jetFade() {
  const c = makeCanvas(8, 64);
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, 64);
  g.addColorStop(0, "rgba(255,255,255,0)");
  g.addColorStop(0.45, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,1)");
  x.fillStyle = g;
  x.fillRect(0, 0, 8, 64);
  return new THREE.CanvasTexture(c);
}

// A cone standing on its base, so scaling y grows it upwards from the port.
function jetGeometry(r, h) {
  const g = new THREE.ConeGeometry(r, h, 7, 1, true);
  g.translate(0, h / 2, 0);
  return g;
}

export function buildBurnerFlame(center) {
  const root = new THREE.Group();
  root.position.copy(center);

  const crown = (geo, mat) => {
    const m = new THREE.InstancedMesh(geo, mat, JETS);
    m.frustumCulled = false;
    m.renderOrder = 6;
    m.visible = false;
    root.add(m);
    return m;
  };
  const fade = jetFade();
  const outer = crown(jetGeometry(0.0078, 0.022), additive({ color: 0x1446ff, opacity: 0.5, map: fade }));
  const inner = crown(jetGeometry(0.0042, 0.0095), additive({ color: 0x4f9dff, opacity: 0.6, map: fade }));
  const tips = crown(jetGeometry(0.0055, 0.013), additive({ color: 0xff8a2a, opacity: 0, map: fade }));

  // blue glow pooled on the hob glass around the burner
  const glow = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 0.32), additive({
    map: radial([[0, "rgba(130,175,255,0.9)"], [0.3, "rgba(70,120,255,0.35)"], [1, "rgba(40,80,255,0)"]]),
    opacity: 0, side: THREE.FrontSide,
  }));
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -0.0185;
  glow.renderOrder = 5;
  root.add(glow);

  // created up front at zero so lighting the stove never recompiles shaders
  const light = new THREE.PointLight(0x8fb2ff, 0, 1.4, 2);
  light.position.set(0, 0.06, 0);
  light.userData.flameLight = true;
  root.add(light);

  // spark pool
  const sparkMat = new THREE.SpriteMaterial({
    map: radial([[0, "rgba(255,255,240,1)"], [0.3, "rgba(255,205,130,0.85)"], [1, "rgba(255,140,40,0)"]], 64),
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false,
  });
  const sparks = [];
  for (let i = 0; i < 24; i++) {
    const s = new THREE.Sprite(sparkMat);
    s.visible = false;
    s.renderOrder = 7;
    root.add(s);
    sparks.push({ s, v: new THREE.Vector3(), life: 0, max: 1 });
  }

  const seeds = [];
  for (let i = 0; i < JETS; i++) seeds.push([Math.random() * 10, 0.7 + Math.random() * 0.6]);
  const dummy = new THREE.Object3D();
  let size = 0, flare = 0, flash = 0, lift = 0, weak = 0, cap = 0;

  function update(dt, time, flow, lit, capped = false) {
    // with a pot on the burner (its base is only ~5 mm above the ports) the
    // flame spreads out flat underneath it instead of rising
    cap += ((capped ? 1 : 0) - cap) * (1 - Math.exp(-dt * 5));
    const target = lit ? 0.45 + 0.75 * flow : 0;
    size += (target - size) * (1 - Math.exp(-dt * (lit ? 9 : 16)));
    if (!lit && size < 0.01) size = 0;
    flare = Math.max(0, flare - dt * 2.2);
    flash = Math.max(0, flash - dt * 9);
    // too much gas: the flame lifts off the ports, roars and grows orange tips;
    // too little: it shrinks and gutters, jet by jet
    const hi = lit ? clamp01((flow - 0.82) / 0.18) : 0;
    const lo = lit ? clamp01((0.42 - flow) / 0.27) : 0;
    const a = 1 - Math.exp(-dt * 6);
    lift += (hi - lift) * a;
    weak += (lo - weak) * a;

    const show = size > 0;
    outer.visible = inner.visible = tips.visible = show;
    if (show) {
      const lean = (0.9 - 0.3 * lift) * (1 - cap) + 1.47 * cap;
      const sl = Math.sin(lean), cl = Math.cos(lean);
      const w = 0.85 + 0.35 * Math.min(1, size) + 0.25 * lift;
      const wx = w * (1 - 0.8 * cap); // under a pot the jets are squashed flat too, not just leaned
      const amp = 0.05 + 0.3 * lift + 0.5 * weak;
      for (let i = 0; i < JETS; i++) {
        const ang = (i / JETS) * TAU;
        const [sd, sp] = seeds[i];
        const n = Math.sin(time * 7.3 * sp + sd * 2) * 0.5 + Math.sin(time * 17.1 + sd * 5) * 0.5;
        let h = size * (1 + flare * 1.6) * (1 + 0.05 * Math.sin(time * 13 * sp + sd) + n * amp);
        if (weak > 0.25 && Math.sin(time * 4.3 * sp + sd * 9) > 1 - weak * 0.8) h *= 0.15;
        h = Math.max(0.05, h);
        const r = RIM + 0.004 * lift;
        const y = (0.0015 + lift * 0.006 * (0.5 + 0.5 * Math.sin(time * 23 + sd))) * (1 - cap);
        const ca = Math.cos(ang), sa = Math.sin(ang);
        dummy.position.set(ca * r, y, -sa * r);
        dummy.rotation.set(0, ang, -lean);
        dummy.scale.set(wx, h, w);
        dummy.updateMatrix();
        outer.setMatrixAt(i, dummy.matrix);
        dummy.scale.set(wx, h * 0.9, w);
        dummy.updateMatrix();
        inner.setMatrixAt(i, dummy.matrix);
        // orange tips sit at the end of each jet
        const reach = 0.024 * h * 0.82;
        dummy.position.set(ca * (r + sl * reach), y + cl * reach, -sa * (r + sl * reach));
        dummy.scale.set(wx, h * 0.8, w);
        dummy.updateMatrix();
        tips.setMatrixAt(i, dummy.matrix);
      }
      outer.instanceMatrix.needsUpdate = inner.instanceMatrix.needsUpdate = tips.instanceMatrix.needsUpdate = true;
      outer.material.opacity = 0.45 + 0.2 * Math.min(1, size) - 0.15 * weak;
      inner.material.opacity = 0.55 - 0.3 * weak;
      tips.material.opacity = 0.45 * Math.max(lift, flare * 0.8);
    }
    glow.material.opacity = Math.min(1, size) * (0.5 + 0.08 * Math.sin(time * 31)) + flash * 0.35 + flare * 0.5;
    const flick = 1 + 0.1 * Math.sin(time * 29) + 0.3 * lift * Math.sin(time * 11.7);
    light.intensity = size * 0.45 * flick + flare * 1.4 + flash * 0.5;
    light.color.setHex(flash > 0.05 && size < 0.05 ? 0xffb35c : 0x8fb2ff);

    for (const p of sparks) {
      if (p.life <= 0) continue;
      p.life -= dt;
      if (p.life <= 0) { p.s.visible = false; continue; }
      p.v.y -= 3 * dt;
      p.s.position.addScaledVector(p.v, dt);
      p.s.scale.setScalar(0.003 + 0.011 * (p.life / p.max));
    }
  }

  function spark() {
    let n = 7 + Math.floor(Math.random() * 5);
    for (const p of sparks) {
      if (n <= 0) break;
      if (p.life > 0) continue;
      n--;
      const ang = Math.random() * TAU, sp = 0.2 + Math.random() * 0.5;
      p.s.position.set(Math.cos(ang) * (RIM + 0.008), 0.004 + Math.random() * 0.01, -Math.sin(ang) * (RIM + 0.008));
      p.v.set(Math.cos(ang) * sp, 0.25 + Math.random() * 0.6, -Math.sin(ang) * sp);
      p.life = p.max = 0.1 + Math.random() * 0.2;
      p.s.visible = true;
    }
    flash = 1;
  }

  function ignite(k) {
    flare = 0.6 + 0.4 * clamp01(k);
    size = Math.max(size, 0.3);
  }

  return { root, light, update, spark, ignite };
}
