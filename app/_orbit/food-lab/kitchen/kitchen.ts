// @ts-nocheck
/* eslint-disable */
// The kitchen: room shell, furniture, appliances and where every ingredient lives.
// Coordinates in metres. +x east, +z south (towards the player), north wall at z = -2.
import * as THREE from "three";
import * as P from "./props";
import { repeated, makeCanvas, toTexture } from "./textures";

export const ROOM = { x0: -2.3, x1: 2.3, z0: -2.0, z1: 2.0, h: 2.75 };
export const COUNTER_TOP = 0.9;

// The 21 ingredients, grouped by where they are found. `name` is only used
// for screen readers; nothing is ever printed on screen.
export const ITEMS = [
  { id: "chicken", loc: "fridge", name: "Chicken", build: P.buildChicken },
  { id: "dahi", loc: "fridge", name: "Yogurt", build: P.buildDahi },
  { id: "tomatoes", loc: "fridge", name: "Tomatoes", build: P.buildTomatoes },
  { id: "chillies", loc: "fridge", name: "Green chillies", build: P.buildChillies },
  { id: "lemons", loc: "fridge", name: "Lemons", build: P.buildLemons },
  { id: "mint", loc: "fridge", name: "Mint", build: P.buildMint },
  { id: "coriander", loc: "fridge", name: "Coriander", build: P.buildCoriander },
  { id: "redChilli", loc: "cupboard", name: "Red chilli powder", build: P.buildRedChilli },
  { id: "haldi", loc: "cupboard", name: "Turmeric", build: P.buildHaldi },
  { id: "salt", loc: "cupboard", name: "Salt", build: P.buildSalt },
  { id: "masala", loc: "cupboard", name: "Biryani masala", build: P.buildMasalaBox },
  { id: "garam", loc: "cupboard", name: "Whole spices", build: P.buildGaram },
  { id: "alooBukhara", loc: "cupboard", name: "Dried plums", build: P.buildAlooBukhara },
  { id: "kewra", loc: "cupboard", name: "Kewra water", build: P.buildKewra },
  { id: "zarda", loc: "cupboard", name: "Food colour", build: P.buildZarda },
  { id: "onions", loc: "sabzi", name: "Onions", build: P.buildOnions },
  { id: "potatoes", loc: "sabzi", name: "Potatoes", build: P.buildPotatoes },
  { id: "adrak", loc: "sabzi", name: "Ginger", build: P.buildAdrak },
  { id: "lassan", loc: "sabzi", name: "Garlic", build: P.buildLassan },
  { id: "rice", loc: "pantry", name: "Basmati rice", build: P.buildRiceBowl }, // scooped from the sack
  { id: "oil", loc: "pantry", name: "Cooking oil", build: P.buildOil },
];

// Where each ingredient starts: [x, surfaceY, z, rotationY]
const HOME = {
  // fridge: crisper floor 0.135, lower glass shelf 0.523, upper glass shelf 0.903
  tomatoes: [1.27, 0.135, -1.62, 0.2],
  lemons: [1.63, 0.135, -1.6, -0.3],
  mint: [1.12, 0.523, -1.7, 0.05],
  coriander: [1.12, 0.523, -1.52, -0.06],
  chillies: [1.66, 0.523, -1.58, 0.4],
  chicken: [1.3, 0.903, -1.62, 0.04],
  dahi: [1.64, 0.903, -1.65, 0],
  // spice cupboard: bottom shelf 1.498, middle shelf 1.838
  redChilli: [0.18, 1.498, -1.83, 0],
  haldi: [0.39, 1.498, -1.83, 0.3],
  salt: [0.61, 1.498, -1.83, -0.2],
  masala: [0.82, 1.498, -1.84, -0.12],
  garam: [0.18, 1.838, -1.83, 0.4],
  alooBukhara: [0.39, 1.838, -1.83, 0],
  kewra: [0.61, 1.838, -1.83, 0.5],
  zarda: [0.82, 1.838, -1.82, 0],
  // sabzi: wicker tokri and steel thaal on the west counter
  // both resting on the tokri's floor, one to each side: every onion and
  // potato sits at least 1 cm inside its wall (checked against their shapes)
  onions: [-1.97, 0.915, -0.581, 0],
  potatoes: [-1.99, 0.9165, -0.659, 0.6],
  adrak: [-1.99, 0.906, 0.13, 0.3],
  lassan: [-1.99, 0.906, 0.25, -0.4],
  // pantry: rack shelf and the floor
  oil: [2.08, 0.866, -0.62, 0.3],
  rice: [2.03, 0.5, 0.55, 0.5],   // the bowl starts hidden at the sack's mouth
};

// Where they end up on the prep table once unloaded: [x, y, z, rotationY]
export const TABLE = {
  chicken: [-0.4, 0.9, -0.02, 0], dahi: [-0.14, 0.9, -0.02, 0], tomatoes: [0.04, 0.9, -0.02, 0.4],
  lemons: [0.2, 0.9, -0.02, 0], chillies: [0.34, 0.9, -0.02, 0.2], oil: [0.56, 0.9, -0.02, 0],
  mint: [-0.56, 0.9, 0.16, 0], coriander: [-0.34, 0.9, 0.16, 0],
  redChilli: [-0.06, 0.9, 0.16, 0], haldi: [0.03, 0.9, 0.16, 0], salt: [0.12, 0.9, 0.16, 0], masala: [0.22, 0.9, 0.16, 0],
  garam: [0.32, 0.9, 0.16, 0], alooBukhara: [0.41, 0.9, 0.16, 0], kewra: [0.5, 0.9, 0.16, 0], zarda: [0.58, 0.9, 0.16, 0],
  onions: [0.0, 0.9, 0.38, 0], potatoes: [0.18, 0.9, 0.38, 0], adrak: [0.36, 0.9, 0.38, 0], lassan: [0.52, 0.9, 0.38, 0],
  rice: [0.62, 0.9, 0.5, 0.0],    // on the table, front right
};

// Soft floor shading where furniture meets the floor (used as an aoMap).
function floorAO() {
  const W = ROOM.x1 - ROOM.x0, D = ROOM.z1 - ROOM.z0;
  const cw = 512, ch = Math.round((512 * D) / W);
  const c = makeCanvas(cw, ch);
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, cw, ch);
  const px = (v) => ((v - ROOM.x0) / W) * cw, pz = (v) => ((v - ROOM.z0) / D) * ch;
  const lin = (x0, y0, x1, y1, a) => {
    const g = x.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, `rgba(0,0,0,${a})`); g.addColorStop(1, "rgba(0,0,0,0)");
    return g;
  };
  const e = (0.3 / W) * cw;
  x.fillStyle = lin(0, 0, e, 0, 0.35); x.fillRect(0, 0, e, ch);
  x.fillStyle = lin(cw, 0, cw - e, 0, 0.35); x.fillRect(cw - e, 0, e, ch);
  x.fillStyle = lin(0, 0, 0, e, 0.35); x.fillRect(0, 0, cw, e);
  x.fillStyle = lin(0, ch, 0, ch - e, 0.35); x.fillRect(0, ch - e, cw, e);
  const soft = (x0, x1, z0, z1, a, blur) => {
    x.save();
    x.shadowColor = `rgba(0,0,0,${a})`; x.shadowBlur = blur; x.fillStyle = `rgba(0,0,0,${a})`;
    x.fillRect(px(x0), pz(z0), px(x1) - px(x0), pz(z1) - pz(z0));
    x.restore();
  };
  soft(ROOM.x0, 0.95, ROOM.z0, -1.42, 0.6, 16);   // north counter toe-kick
  soft(ROOM.x0, -1.72, -1.42, 0.85, 0.6, 16);     // west counter toe-kick
  soft(1.07, 1.83, ROOM.z0, -1.34, 0.6, 14);      // fridge
  soft(1.9, 2.26, -0.88, 0.18, 0.3, 18);          // pantry rack
  soft(-0.5, 0.6, -0.02, 0.52, 0.28, 30);         // under the prep table
  for (const [lx, lz] of [[-0.54, -0.05], [0.64, -0.05], [-0.54, 0.55], [0.64, 0.55]]) soft(lx - 0.025, lx + 0.025, lz - 0.025, lz + 0.025, 0.5, 10);
  return toTexture(c, { srgb: false });
}

export function buildKitchen(M, T) {
  const root = new THREE.Group();
  const colliders = [];
  const blockers = [];
  const doors = [];
  const add = (o, parent = root) => { parent.add(o); return o; };
  const box = (w, h, d, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return add(m, parent);
  };
  const rbox = (w, h, d, r, mat, x, y, z, parent = root) => {
    const m = new THREE.Mesh(P.roundedBox(w, h, d, r), mat);
    m.position.set(x, y, z);
    m.castShadow = true; m.receiveShadow = true;
    return add(m, parent);
  };
  const place = (o, x, y, z, ry = 0) => { o.position.set(x, y, z); o.rotation.y = ry; return add(o); };
  const blobMat = new THREE.MeshBasicMaterial({ map: T.blob, color: 0x000000, transparent: true, depthWrite: false });
  const blob = (x, y, z, sx, sz = sx, strength = 1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), strength === 1 ? blobMat : blobMat.clone());
    if (strength !== 1) m.material.opacity = strength;
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y + 0.0015, z);
    m.scale.set(sx, sz, 1);
    m.renderOrder = 1;
    return add(m);
  };

  // ============================================================ ROOM SHELL
  const W = ROOM.x1 - ROOM.x0, D = ROOM.z1 - ROOM.z0, H = ROOM.h;
  const floorMat = M.floor.clone();
  floorMat.map = repeated(T.floor, W / 1.2, D / 1.2);
  floorMat.bumpMap = repeated(T.floorBump, W / 1.2, D / 1.2);
  floorMat.aoMap = floorAO();
  floorMat.aoMapIntensity = 1;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D), floorMat);
  floor.geometry.setAttribute("uv2", floor.geometry.attributes.uv);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  add(floor);

  box(W + 0.24, 0.1, D + 0.24, M.ceiling, 0, H + 0.05, 0);
  const wt = 0.12;
  box(W + 0.24, H, wt, M.wall, 0, H / 2, ROOM.z1 + wt / 2);           // south
  box(wt, H, D + 0.24, M.wall, ROOM.x1 + wt / 2, H / 2, 0);           // east
  box(wt, H, D + 0.24, M.wall, ROOM.x0 - wt / 2, H / 2, 0);           // west
  // north wall, built around the window opening x -2.1..-1.0, y 1.1..2.1
  const WX0 = -2.1, WX1 = -1.0, WY0 = 1.1, WY1 = 2.1, nz = ROOM.z0 - wt / 2;
  box(WX0 - (ROOM.x0 - 0.12), H, wt, M.wall, (ROOM.x0 - 0.12 + WX0) / 2, H / 2, nz);
  box(ROOM.x1 + 0.12 - WX1, H, wt, M.wall, (WX1 + ROOM.x1 + 0.12) / 2, H / 2, nz);
  box(WX1 - WX0, WY0, wt, M.wall, (WX0 + WX1) / 2, WY0 / 2, nz);
  box(WX1 - WX0, H - WY1, wt, M.wall, (WX0 + WX1) / 2, (WY1 + H) / 2, nz);

  // skirting
  box(W, 0.08, 0.012, M.skirting, 0, 0.04, ROOM.z1 - 0.006);
  box(0.012, 0.08, D, M.skirting, ROOM.x1 - 0.006, 0.04, 0);

  // window: frame, mullion, glass and the view outside
  const fw = 0.05, fz = ROOM.z0 - 0.03;
  box(WX1 - WX0, fw, 0.06, M.frame, (WX0 + WX1) / 2, WY0 + fw / 2, fz);
  box(WX1 - WX0, fw, 0.06, M.frame, (WX0 + WX1) / 2, WY1 - fw / 2, fz);
  box(fw, WY1 - WY0, 0.06, M.frame, WX0 + fw / 2, (WY0 + WY1) / 2, fz);
  box(fw, WY1 - WY0, 0.06, M.frame, WX1 - fw / 2, (WY0 + WY1) / 2, fz);
  box(0.035, WY1 - WY0, 0.05, M.frame, (WX0 + WX1) / 2, (WY0 + WY1) / 2, fz);
  const pane = new THREE.Mesh(new THREE.PlaneGeometry(WX1 - WX0, WY1 - WY0), M.windowGlass);
  pane.position.set((WX0 + WX1) / 2, (WY0 + WY1) / 2, fz - 0.005);
  pane.renderOrder = 4;
  add(pane);
  box(WX1 - WX0 + 0.1, 0.03, 0.14, M.marble, (WX0 + WX1) / 2, WY0 - 0.015, ROOM.z0 + 0.05);
  const view = new THREE.Mesh(new THREE.PlaneGeometry(9, 4.5), M.sky);
  view.position.set(-1.55, 1.9, -5.2);
  add(view);

  // ============================================================ NORTH COUNTER (with sink)
  const CT = COUNTER_TOP, cz0 = ROOM.z0, cd = 0.62;
  const SX0 = -1.86, SX1 = -1.24, SZ0 = -1.88, SZ1 = -1.48, SINK_Y = 0.72;
  const nx0 = ROOM.x0, nx1 = 0.95;
  box(nx1 - nx0, 0.1, cd - 0.06, M.plinth, (nx0 + nx1) / 2, 0.05, cz0 + (cd - 0.06) / 2);
  box(SX0 - nx0, 0.76, cd - 0.04, M.carcass, (nx0 + SX0) / 2, 0.48, cz0 + (cd - 0.04) / 2);
  box(SX1 - SX0, SINK_Y - 0.1, cd - 0.04, M.carcass, (SX0 + SX1) / 2, 0.1 + (SINK_Y - 0.1) / 2, cz0 + (cd - 0.04) / 2);
  box(nx1 - SX1, 0.76, cd - 0.04, M.carcass, (SX1 + nx1) / 2, 0.48, cz0 + (cd - 0.04) / 2);
  // cabinet doors and handles
  const doorZ = cz0 + cd - 0.04 + 0.011;
  const nDoors = 5, dw = (nx1 - nx0) / nDoors;
  for (let i = 0; i < nDoors; i++) {
    const cx = nx0 + dw * (i + 0.5);
    rbox(dw - 0.006, 0.72, 0.02, 0.004, M.cabinetDoor, cx, 0.48, doorZ);
    rbox(0.16, 0.012, 0.014, 0.005, M.chrome, cx, 0.78, doorZ + 0.022);
  }
  // granite top split around the sink opening
  const ctz = cz0 + 0.32, ctd = 0.64;
  rbox(SX0 - nx0, 0.04, ctd, 0.004, M.granite, (nx0 + SX0) / 2, CT - 0.02, ctz);
  rbox(nx1 - SX1, 0.04, ctd, 0.004, M.granite, (SX1 + nx1) / 2, CT - 0.02, ctz);
  rbox(SX1 - SX0, 0.04, SZ0 - cz0, 0.004, M.granite, (SX0 + SX1) / 2, CT - 0.02, (cz0 + SZ0) / 2);
  rbox(SX1 - SX0, 0.04, cz0 + ctd - SZ1, 0.004, M.granite, (SX0 + SX1) / 2, CT - 0.02, (SZ1 + cz0 + ctd) / 2);
  // steel sink basin
  const sw = SX1 - SX0, sd = SZ1 - SZ0, sh = CT - SINK_Y;
  box(sw, 0.006, sd, M.steel, (SX0 + SX1) / 2, SINK_Y + 0.003, (SZ0 + SZ1) / 2);
  box(sw, sh, 0.006, M.steel, (SX0 + SX1) / 2, SINK_Y + sh / 2, SZ0 + 0.003);
  box(sw, sh, 0.006, M.steel, (SX0 + SX1) / 2, SINK_Y + sh / 2, SZ1 - 0.003);
  box(0.006, sh, sd, M.steel, SX0 + 0.003, SINK_Y + sh / 2, (SZ0 + SZ1) / 2);
  box(0.006, sh, sd, M.steel, SX1 - 0.003, SINK_Y + sh / 2, (SZ0 + SZ1) / 2);
  const drain = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.004, 24), M.chrome);
  drain.position.set((SX0 + SX1) / 2, SINK_Y + 0.008, (SZ0 + SZ1) / 2);
  add(drain);
  // faucet
  const tapCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.55, CT, -1.94), new THREE.Vector3(-1.55, CT + 0.2, -1.94),
    new THREE.Vector3(-1.55, CT + 0.27, -1.86), new THREE.Vector3(-1.55, CT + 0.23, -1.73),
  ]);
  const tap = new THREE.Mesh(new THREE.TubeGeometry(tapCurve, 40, 0.012, 12, false), M.chrome);
  tap.castShadow = true;
  add(tap);
  box(0.06, 0.02, 0.06, M.chrome, -1.55, CT + 0.01, -1.94);

  // backsplash: subway tiles around the window
  const splash = (x0, x1, y0, y1) => {
    const mat = M.subway.clone();
    mat.map = repeated(T.subway, (x1 - x0) / 0.6, (y1 - y0) / 0.6);
    mat.bumpMap = repeated(T.subwayBump, (x1 - x0) / 0.6, (y1 - y0) / 0.6);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, y1 - y0), mat);
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, ROOM.z0 + 0.004);
    m.receiveShadow = true;
    add(m);
  };
  splash(ROOM.x0, WX0, CT, 1.5);
  splash(WX0, WX1, CT, WY0);
  splash(WX1, nx1, CT, 1.5);
  splash(nx1, 1.05, CT, 1.5);

  // gas hob with two burners. Each knob is a pivot (rotation.y = how far the
  // gas is open) with an invisible, larger pick target so it's easy to grab.
  const hobX = -0.55, hobZ = -1.72;
  const knobs = [], burners = [];
  const pickMat = new THREE.MeshBasicMaterial({ visible: false });
  rbox(0.72, 0.012, 0.42, 0.004, M.blackGlass, hobX, CT + 0.006, hobZ);
  for (const bx of [-0.19, 0.19]) {
    const x = hobX + bx;
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.006, 32), M.castIron);
    ring.position.set(x, CT + 0.015, hobZ - 0.02); add(ring);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.045, 0.014, 32), M.brass);
    cap.position.set(x, CT + 0.024, hobZ - 0.02); add(cap);
    for (let k = 0; k < 4; k++) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.012, 0.012), M.castIron);
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      arm.position.set(x + Math.cos(a) * 0.075, CT + 0.03, hobZ - 0.02 + Math.sin(a) * 0.075);
      arm.rotation.y = -a;
      arm.castShadow = true; add(arm);
    }
    burners.push(new THREE.Vector3(x, CT + 0.031, hobZ - 0.02));
    const pivot = new THREE.Group();
    pivot.position.set(x, CT + 0.021, hobZ + 0.165);
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.019, 0.021, 0.018, 24), M.knob);
    pivot.add(knob);
    // a grip fin across the top, with a chrome pointer that faces you when off
    const fin = new THREE.Mesh(P.roundedBox(0.007, 0.01, 0.034, 0.003), M.knob);
    fin.position.y = 0.012; pivot.add(fin);
    const mark = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.0014, 0.012), M.chrome);
    mark.position.set(0, 0.0172, 0.0095); pivot.add(mark);
    const grab = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.06, 12), pickMat);
    grab.position.y = 0.02; pivot.add(grab);
    add(pivot);
    knobs.push({ pivot, x });
  }
  // resting on the pan supports, whose tops are at CT + 0.036; a hair above
  // them so the two surfaces don't flicker through each other
  const degchi = place(P.buildDegchi(M), hobX + 0.19, CT + 0.0372, hobZ - 0.02);
  // a steel plate on the counter between the sink and the hob, for the birista
  // (2 mm up so its flat bottom doesn't flicker through the counter)
  const plate = place(P.buildPlate(M), -1.08, CT + 0.002, -1.72, 0);
  // the rice pot waits at the far right of the counter; the colander on the
  // counter left of the sink (both 2 mm up, off the granite)
  const pateela = place(P.buildPateela(M), 0.72, CT + 0.002, -1.72, 0);
  const colander = place(P.buildColander(M), -2.06, CT + 0.002, -1.68, 0);
  // the kafgir rests on the counter between the hob and the spice cupboard
  const kafgir = place(P.buildKafgir(M), -0.13, CT + 0.003, -1.86, 0); // lies flat; the handle's underside just touches

  // the long gas lighter, lying on the counter to the right of the hob
  const LIGHTER = [-0.02, CT, -1.64, 0.35];
  const lighter = place(P.buildLighter(M), LIGHTER[0], LIGHTER[1], LIGHTER[2], LIGHTER[3]);
  lighter.userData.blob = blob(LIGHTER[0] + 0.01, CT, LIGHTER[2], 0.34, 0.07, 0.8);
  lighter.userData.blob.rotation.z = LIGHTER[3];

  colliders.push([ROOM.x0, nx1, ROOM.z0, ROOM.z0 + 0.64]);

  // ============================================================ SPICE CUPBOARD (wall cabinet)
  const cx0 = 0.05, cx1 = 0.95, cy0 = 1.48, cy1 = 2.18, cdp = 0.32, cZ = ROOM.z0;
  const cab = new THREE.Group();
  const t = 0.018, ccx = (cx0 + cx1) / 2, ccy = (cy0 + cy1) / 2;
  box(cx1 - cx0, cy1 - cy0, 0.01, M.carcassInside, ccx, ccy, cZ + 0.005, cab);
  box(t, cy1 - cy0, cdp, M.cabinetDoor, cx0 + t / 2, ccy, cZ + cdp / 2, cab);
  box(t, cy1 - cy0, cdp, M.cabinetDoor, cx1 - t / 2, ccy, cZ + cdp / 2, cab);
  box(cx1 - cx0, t, cdp, M.cabinetDoor, ccx, cy1 - t / 2, cZ + cdp / 2, cab);
  box(cx1 - cx0, t, cdp, M.cabinetDoor, ccx, cy0 + t / 2, cZ + cdp / 2, cab);
  box(cx1 - cx0 - 2 * t, 0.016, cdp - 0.02, M.carcassInside, ccx, 1.83, cZ + (cdp - 0.02) / 2, cab);
  cab.userData.block = true;
  add(cab);
  blockers.push(cab);
  const dW = (cx1 - cx0) / 2 - 0.003, dH = cy1 - cy0 - 0.004, frontZ = cZ + cdp + 0.009;
  const makeCabDoor = (hingeX, dir) => {
    const pivot = new THREE.Group();
    pivot.position.set(hingeX, ccy, frontZ);
    const slab = new THREE.Mesh(P.roundedBox(dW, dH, 0.018, 0.004), M.cabinetDoor);
    slab.position.x = dir * dW / 2;
    slab.castShadow = true; slab.receiveShadow = true;
    pivot.add(slab);
    const kb = new THREE.Mesh(new THREE.SphereGeometry(0.012, 16, 12), M.chrome);
    kb.position.set(dir * (dW - 0.04), -0.2, 0.016);
    pivot.add(kb);
    add(pivot);
    const door = { pivot, angle: 0, target: 0, openAngle: dir > 0 ? -1.85 : 1.85, kind: "cabinet", open: false };
    pivot.userData.interact = { type: "door", door };
    doors.push(door);
  };
  makeCabDoor(cx0 + 0.002, 1);
  makeCabDoor(cx1 - 0.002, -1);

  // ============================================================ FRIDGE
  const fx0 = 1.05, fx1 = 1.85, fz0 = ROOM.z0, fd = 0.68, fz1 = fz0 + fd, FH = 1.85;
  const fcx = (fx0 + fx1) / 2;
  const shell = new THREE.Group();
  const pnl = (w, h, d, inner, x, y, z) => {
    const mats = [M.enamel, M.enamel, M.enamel, M.enamel, M.enamel, M.enamel];
    mats[inner] = M.fridgePlastic;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mats);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    shell.add(m);
  };
  pnl(0.04, FH - 0.05, fd, 0, fx0 + 0.02, 0.05 + (FH - 0.05) / 2, fz0 + fd / 2);   // left, inner face +x
  pnl(0.04, FH - 0.05, fd, 1, fx1 - 0.02, 0.05 + (FH - 0.05) / 2, fz0 + fd / 2);   // right, inner face -x
  pnl(fx1 - fx0 - 0.08, FH - 0.05, 0.04, 4, fcx, 0.05 + (FH - 0.05) / 2, fz0 + 0.02); // back, inner +z
  pnl(fx1 - fx0 - 0.08, 0.08, fd, 2, fcx, 0.09, fz0 + fd / 2);                   // floor, inner +y
  pnl(fx1 - fx0 - 0.08, 0.06, fd, 3, fcx, 1.3, fz0 + fd / 2);                    // divider, inner -y
  pnl(fx1 - fx0 - 0.08, 0.5, fd, 5, fcx, 1.58, fz0 + fd / 2);                    // freezer block (hidden back face)
  const kick = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.04, 0.05, fd - 0.06), M.plinth);
  kick.position.set(fcx, 0.025, fz0 + (fd - 0.06) / 2); shell.add(kick);
  // freezer door (fixed) and its handle
  const fzd = new THREE.Mesh(P.roundedBox(fx1 - fx0, 0.5, 0.055, 0.014), M.enamel);
  fzd.position.set(fcx, 1.6, fz1 + 0.027); fzd.castShadow = true; shell.add(fzd);
  const fzh = new THREE.Mesh(P.roundedBox(0.22, 0.018, 0.03, 0.008), M.chrome);
  fzh.position.set(fcx, 1.38, fz1 + 0.065); shell.add(fzh);
  shell.userData.block = true;
  add(shell);
  blockers.push(shell);

  // interior: glass shelves, crisper drawer, light
  for (const sy of [0.52, 0.9]) {
    // shelves stop 10 cm short of the door so the door bins clear them
    const s = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.08, 0.006, 0.54), M.shelfGlass);
    s.position.set(fcx, sy, fz0 + 0.04 + 0.27); s.renderOrder = 3; add(s);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.08, 0.02, 0.012), M.fridgePlastic);
    trim.position.set(fcx, sy, fz0 + 0.574); add(trim);
  }
  const crisper = new THREE.Group();
  const cw = fx1 - fx0 - 0.1, cdd = fd - 0.14, chh = 0.2;
  const cpanel = (w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.crisper); m.position.set(x, y, z); m.renderOrder = 3; crisper.add(m); };
  cpanel(cw, 0.004, cdd, 0, 0.002, 0);
  cpanel(cw, chh, 0.004, 0, chh / 2, cdd / 2);
  cpanel(0.004, chh, cdd, -cw / 2, chh / 2, 0);
  cpanel(0.004, chh, cdd, cw / 2, chh / 2, 0);
  crisper.position.set(fcx, 0.131, fz0 + 0.06 + cdd / 2);
  add(crisper);
  const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.06), M.fridgeLamp);
  lamp.position.set(fcx, 1.264, fz0 + 0.3); add(lamp);
  const fridgeLight = new THREE.PointLight(0xf2f7ff, 0, 1.6, 2);
  fridgeLight.position.set(fcx, 1.18, fz0 + 0.4);
  add(fridgeLight);

  // main door, hinged on the right edge, swings out into the room
  const fPivot = new THREE.Group();
  fPivot.position.set(fx1, 0, fz1);
  const fdoor = new THREE.Mesh(P.roundedBox(fx1 - fx0, 1.14, 0.06, 0.014), M.enamel);
  fdoor.position.set(-(fx1 - fx0) / 2, 0.7, 0.03); fdoor.castShadow = true; fdoor.receiveShadow = true;
  fPivot.add(fdoor);
  const liner = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.07, 1.06, 0.01), M.fridgePlastic);
  liner.position.set(-(fx1 - fx0) / 2, 0.7, -0.005); fPivot.add(liner);
  const gasket = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.03, 1.1, 0.006), M.gasket);
  gasket.position.set(-(fx1 - fx0) / 2, 0.7, -0.002); fPivot.add(gasket);
  for (const by of [0.42, 0.78]) {
    const bin = new THREE.Mesh(new THREE.BoxGeometry(fx1 - fx0 - 0.14, 0.07, 0.07), M.crisper);
    bin.position.set(-(fx1 - fx0) / 2, by, -0.045); bin.renderOrder = 3; fPivot.add(bin);
  }
  const water = (x, y) => {
    const b = new THREE.Mesh(P.lathe([[0.0001, 0], [0.032, 0], [0.034, 0.01], [0.034, 0.2], [0.02, 0.24], [0.013, 0.26], [0.0001, 0.262]], 24), M.waterBottle);
    b.position.set(x, y, -0.045); b.renderOrder = 3; fPivot.add(b);
  };
  water(-0.25, 0.39); water(-0.47, 0.39);
  const fh = new THREE.Mesh(P.roundedBox(0.03, 0.42, 0.03, 0.01), M.chrome);
  fh.position.set(-(fx1 - fx0) + 0.05, 1.02, 0.08); fPivot.add(fh);
  // the illustrated recipe card, held by magnets
  const cardCanvas = makeCanvas(512, 720);
  const cardTex = toTexture(cardCanvas, { aniso: 4 });
  const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.85 });
  const card = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.28), cardMat);
  card.position.set(-0.42, 0.95, 0.0615); fPivot.add(card);
  [[-0.5, 1.08, M.magnetRed], [-0.34, 1.08, M.magnetGreen], [-0.5, 0.82, M.magnetGreen], [-0.34, 0.82, M.magnetRed]].forEach(([x, y, m]) => {
    const mg = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.006, 16), m);
    mg.rotation.x = Math.PI / 2; mg.position.set(x, y, 0.064); fPivot.add(mg);
  });
  add(fPivot);
  const fridgeDoor = { pivot: fPivot, angle: 0, target: 0, openAngle: 1.75, kind: "fridge", open: false };
  fPivot.userData.interact = { type: "door", door: fridgeDoor };
  doors.push(fridgeDoor);
  colliders.push([fx0 - 0.02, fx1 + 0.02, ROOM.z0, fz1 + 0.06]);

  // ============================================================ WEST COUNTER (sabzi)
  const wx0 = ROOM.x0, wx1 = ROOM.x0 + cd, wz0 = ROOM.z0 + 0.64, wz1 = 0.85;
  box(cd - 0.06, 0.1, wz1 - wz0, M.plinth, wx0 + (cd - 0.06) / 2, 0.05, (wz0 + wz1) / 2);
  box(cd - 0.04, 0.76, wz1 - wz0, M.carcass, wx0 + (cd - 0.04) / 2, 0.48, (wz0 + wz1) / 2);
  const wdz = (wz1 - wz0) / 3;
  for (let i = 0; i < 3; i++) {
    const z = wz0 + wdz * (i + 0.5);
    rbox(wdz - 0.006, 0.72, 0.02, 0.004, M.cabinetDoor, wx1 - 0.04 + 0.011, 0.48, z).rotation.y = Math.PI / 2;
    rbox(0.014, 0.012, 0.16, 0.005, M.chrome, wx1 - 0.04 + 0.033, 0.78, z);
  }
  rbox(0.64, 0.04, wz1 - wz0 + 0.01, 0.004, M.granite, wx0 + 0.32, CT - 0.02, (wz0 + wz1 + 0.01) / 2);
  // 36 cm across: big enough for three onions and three potatoes side by side
  place(P.buildTokri(M), -1.98, CT, -0.62).scale.setScalar(1.1);
  blob(-1.98, CT, -0.62, 0.48);
  place(P.buildThaal(M), -1.99, CT, 0.19);
  blob(-1.99, CT, 0.19, 0.3);
  // the big mixing bowl for the marinade, with a serving spoon resting in it
  // 2 mm up: a flat bottom exactly level with the counter flickers through it
  const mixBowl = place(P.buildMixingBowl(M), -1.98, CT + 0.002, -0.22, 0);
  // (12.2 cm radius: fits on the table between the chopping board and the potatoes)
  const spoon = P.buildSpoon(M);
  spoon.position.set(-0.03, 0.03, 0.0);
  spoon.rotation.set(0, 0.4, 0.5); // the handle rests on the rim (checked: its underside meets the lip)
  mixBowl.add(spoon);
  mixBowl.userData.blob = blob(-1.98, CT, -0.22, 0.3);
  colliders.push([ROOM.x0, wx1 + 0.02, wz0, wz1 + 0.02]);

  // steel plates and bowls on a wall shelf above
  box(0.25, 0.025, 1.6, M.teakShelf, ROOM.x0 + 0.125, 1.62, -0.3);
  place(P.buildPlateStack(M, 5, 0.11), ROOM.x0 + 0.13, 1.6325, -0.85);
  blob(ROOM.x0 + 0.13, 1.6325, -0.85, 0.27);
  place(P.buildTumbler(M), ROOM.x0 + 0.12, 1.6325, 0.32);
  place(P.buildTumbler(M), ROOM.x0 + 0.13, 1.6325, 0.41);
  place(P.buildSteelBowl(M, 0.07), ROOM.x0 + 0.13, 1.6325, -0.3);
  place(P.buildSteelBowl(M, 0.06), ROOM.x0 + 0.13, 1.6325, -0.1);
  place(P.buildSteelBowl(M, 0.065), ROOM.x0 + 0.13, 1.6325, 0.12);

  // ============================================================ PANTRY RACK (east wall)
  const rx0 = 1.88, rx1 = 2.28, rz0 = -0.9, rz1 = 0.2;
  for (const [x, z] of [[rx0 + 0.015, rz0 + 0.015], [rx1 - 0.015, rz0 + 0.015], [rx0 + 0.015, rz1 - 0.015], [rx1 - 0.015, rz1 - 0.015]]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.42, 12), M.steelBrushed);
    post.position.set(x, 0.71, z); post.castShadow = true; add(post);
  }
  for (const y of [0.04, 0.45, 0.86, 1.27]) box(rx1 - rx0, 0.012, rz1 - rz0, M.steelBrushed, (rx0 + rx1) / 2, y, (rz0 + rz1) / 2);
  place(P.buildGheeTin(M), 2.08, 0.866, -0.3, 0.4);
  blob(2.08, 0.866, -0.3, 0.2);
  place(P.buildLentilJar(M, M.daalYellow), 2.08, 1.276, -0.72);
  place(P.buildLentilJar(M, M.daalRed), 2.08, 1.276, -0.46);
  place(P.buildLentilJar(M, M.daalGreen), 2.08, 1.276, -0.2);
  for (const z of [-0.72, -0.46, -0.2]) blob(2.08, 1.276, z, 0.15);
  place(P.buildSteelBowl(M, 0.09), 2.08, 0.456, -0.55);
  place(P.buildSteelBowl(M, 0.07), 2.08, 0.456, -0.2);
  colliders.push([rx0 - 0.02, ROOM.x1, rz0 - 0.02, rz1 + 0.02]);
  colliders.push([1.84, ROOM.x1, 0.35, 0.75]);

  // ============================================================ PREP TABLE
  const tx0 = -0.6, tx1 = 0.7, tz0 = -0.11, tz1 = 0.61;
  const tableTop = new THREE.Mesh(P.roundedBox(tz1 - tz0, 0.04, tx1 - tx0, 0.012), M.tableWood);
  tableTop.rotation.y = Math.PI / 2;
  tableTop.position.set((tx0 + tx1) / 2, CT - 0.02, (tz0 + tz1) / 2);
  tableTop.castShadow = true; tableTop.receiveShadow = true;
  add(tableTop);
  for (const [x, z] of [[tx0 + 0.06, tz0 + 0.06], [tx1 - 0.06, tz0 + 0.06], [tx0 + 0.06, tz1 - 0.06], [tx1 - 0.06, tz1 - 0.06]]) {
    box(0.05, CT - 0.04, 0.05, M.tableWood, x, (CT - 0.04) / 2, z);
  }
  box(tx1 - tx0 - 0.12, 0.08, 0.02, M.tableWood, (tx0 + tx1) / 2, CT - 0.08, tz0 + 0.06);
  box(tx1 - tx0 - 0.12, 0.08, 0.02, M.tableWood, (tx0 + tx1) / 2, CT - 0.08, tz1 - 0.06);
  const board = place(P.buildBoard(M), -0.36, CT, 0.43, 0.08);
  // the knife rests along the front edge of the board, blade to the right
  // (board top is 0.024 up)
  const knife = P.buildKnife(M);
  knife.position.set(-0.12, 0.024, 0.128);
  board.add(knife);
  blob(-0.36, CT, 0.43, 0.5, 0.34, 0.6);
  blob(0.05, 0, 0.25, 1.5, 0.95, 0.35);
  colliders.push([tx0, tx1, tz0, tz1]);

  // ============================================================ SOUTH WALL: door and clock
  rbox(0.92, 2.06, 0.05, 0.01, M.doorWood, 1.3, 1.03, ROOM.z1 - 0.025);
  box(1.02, 0.06, 0.06, M.frame, 1.3, 2.09, ROOM.z1 - 0.03);
  box(0.05, 2.12, 0.06, M.frame, 0.79, 1.06, ROOM.z1 - 0.03);
  box(0.05, 2.12, 0.06, M.frame, 1.81, 1.06, ROOM.z1 - 0.03);
  const lever = new THREE.Mesh(P.roundedBox(0.12, 0.02, 0.025, 0.008), M.brass);
  lever.position.set(0.94, 1.02, ROOM.z1 - 0.07); add(lever);
  const clock = new THREE.Mesh(new THREE.CircleGeometry(0.15, 48), M.clockFace);
  clock.position.set(-0.6, 2.05, ROOM.z1 - 0.012); clock.rotation.y = Math.PI; add(clock);
  const now = new Date();
  const hrA = ((now.getHours() % 12) + now.getMinutes() / 60) / 12 * Math.PI * 2;
  const mnA = (now.getMinutes() / 60) * Math.PI * 2;
  for (const [len, wid, ang] of [[0.07, 0.008, hrA], [0.105, 0.005, mnA]]) {
    const hand = new THREE.Mesh(new THREE.BoxGeometry(wid, len, 0.003), M.clockHand);
    const hp = new THREE.Group();
    hand.position.y = len / 2 - 0.012;
    hp.add(hand);
    hp.position.set(-0.6, 2.05, ROOM.z1 - 0.016);
    hp.rotation.z = -ang; // clockwise as seen from inside the room
    hp.rotation.y = Math.PI;
    add(hp);
  }

  // ceiling tube light
  box(1.24, 0.04, 0.09, M.frame, 0, ROOM.h - 0.02, -0.3);
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 1.18, 16), M.tube);
  tube.rotation.z = Math.PI / 2; tube.position.set(0, ROOM.h - 0.055, -0.3); add(tube);

  // ============================================================ INGREDIENTS
  const items = {};
  for (const def of ITEMS) {
    const obj = def.build(M);
    const [x, y, z, ry] = HOME[def.id];
    obj.position.set(x, y, z);
    obj.rotation.y = ry;
    obj.userData.interact = { type: "item", id: def.id };
    add(obj);
    const size = new THREE.Box3().setFromObject(obj).getSize(new THREE.Vector3());
    obj.userData.blob = blob(x, y, z, Math.max(size.x, size.z) * 1.35);
    items[def.id] = obj;
  }

  // The rice sack stays on the pantry floor; you scoop from it.
  const sack = P.buildRiceSack(M);
  sack.position.set(2.03, 0, 0.55);
  sack.rotation.y = 0.5;
  sack.userData.interact = { type: "sack" };
  add(sack);
  blob(2.03, 0, 0.55, 0.47);

  root.traverse((m) => {
    if (m.isMesh && (m.material === M.wall || m.material === M.ceiling)) m.geometry.setAttribute("uv2", m.geometry.attributes.uv);
  });

  return {
    root, colliders, blockers, doors, items, fridgeDoor, fridgeLight, lamp, tableTop,
    knobs, burners, lighter, board, knife, degchi, kafgir, mixBowl, spoon, plate, pateela, colander, sack,
    card: { mesh: card, canvas: cardCanvas, texture: cardTex },
    window: { x0: WX0, x1: WX1, y0: WY0, y1: WY1 },
  };
}
