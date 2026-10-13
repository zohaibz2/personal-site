// @ts-nocheck
/* eslint-disable */
// The birista once it's lifted out of the oil: a heap carried on the kafgir,
// and the pile it's tipped onto on the plate by the stove.
//
// These are their own instanced meshes with their own material (a copy of the
// frying rings' look, fixed at golden brown). They never share a material
// with the frying rings, whose material uses per-ring colours: sharing it with
// a mesh that has no per-ring colours crashes three.js mid-frame.
import * as THREE from "three";
import { ringGeometries, LAYER_H } from "./onion";

const TAU = Math.PI * 2;
const MAX_CARRY = 16, MAX_PILE = 90;

export function buildBirista(friedMat) {
  const mat = friedMat.clone();
  const geos = ringGeometries();
  const make = (geo, n) => {
    const m = new THREE.InstancedMesh(geo, mat, n);
    m.count = 0; m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false;
    return m;
  };
  // on the kafgir's head (kafgir space: the head is a disc at the origin)
  const carry = new THREE.Group();
  const carrySlices = make(geos.slice, MAX_CARRY), carryLoose = make(geos.loose, MAX_CARRY);
  carry.add(carrySlices, carryLoose);
  // on the plate (plate space)
  const pile = new THREE.Group();
  const pileSlices = make(geos.slice, MAX_PILE), pileLoose = make(geos.loose, MAX_PILE);
  pile.add(pileSlices, pileLoose);

  const dummy = new THREE.Object3D();
  function put(mesh, i, x, y, z, tilt, yaw, r, thick) {
    dummy.position.set(x, y, z);
    dummy.rotation.set(tilt, yaw, 0, "YXZ");
    dummy.scale.set(r, thick / LAYER_H, r);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
    mesh.instanceMatrix.needsUpdate = true;
  }

  let held = [];
  // Show `list` (from the pot) heaped on the kafgir's head.
  function load(list) {
    held = list.slice(0, MAX_CARRY);
    carrySlices.count = 0; carryLoose.count = 0;
    held.forEach((h, j) => {
      const a = Math.random() * TAU, d = Math.random() * 0.022, m = h.loose ? carryLoose : carrySlices;
      put(m, m.count++, Math.cos(a) * d, 0.004 + j * 0.0022, Math.sin(a) * d, (Math.random() - 0.5) * 0.6, h.yaw, h.r * 0.9, h.thick);
    });
  }

  // Tip the heap onto the plate: the rings drop onto the pile from `from`
  // (plate space) and spread out a little.
  const falling = [];
  let landed = 0;
  function tipOnto(from) {
    for (const h of held) {
      const m = h.loose ? pileLoose : pileSlices;
      if (m.count >= MAX_PILE) continue;
      const i = m.count++;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * 0.06;
      const to = { x: Math.cos(a) * d, y: 0.008 + Math.min(0.03, landed * 0.0006) + Math.random() * 0.004, z: Math.sin(a) * d };
      falling.push({ m, i, from: from.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.03, 0, (Math.random() - 0.5) * 0.03)), to, h, t: -Math.random() * 0.1, tilt: (Math.random() - 0.5) * 0.6 });
      landed++;
    }
    held = [];
    carrySlices.count = 0; carryLoose.count = 0;
  }

  // A plateful straight away (the ?step=korma shortcut, later).
  function fillPlate(n) {
    for (let j = 0; j < n; j++) {
      const m = j % 3 === 2 ? pileLoose : pileSlices;
      const a = Math.random() * TAU, d = Math.sqrt(Math.random()) * 0.06;
      put(m, m.count++, Math.cos(a) * d, 0.008 + Math.min(0.03, j * 0.0006) + Math.random() * 0.004, Math.sin(a) * d, (Math.random() - 0.5) * 0.6, Math.random() * TAU, 0.015 + Math.random() * 0.02, 0.0058);
      landed++;
    }
  }

  function update(dt) {
    for (let n = falling.length - 1; n >= 0; n--) {
      const f = falling[n];
      f.t += dt;
      if (f.t < 0) continue;
      const k = Math.min(1, f.t / 0.3);
      put(f.m, f.i, f.from.x + (f.to.x - f.from.x) * k, f.from.y + (f.to.y - f.from.y) * k * k, f.from.z + (f.to.z - f.from.z) * k, f.tilt * k, f.h.yaw, f.h.r * 0.9, f.h.thick);
      if (k >= 1) falling.splice(n, 1);
    }
  }

  // match the colour the onions were fried to
  function matchColor(c) { mat.color.copy(c); }

  return {
    carry, pile, load, tipOnto, fillPlate, update, matchColor,
    get held() { return held.length; },
    get onPlate() { return landed; },
  };
}
