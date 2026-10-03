// @ts-nocheck
/* eslint-disable */
// Procedural textures for the Biryani Kitchen. Everything is painted on
// <canvas> at load time, so the game ships no image files.
import * as THREE from "three";

export function rng(seed) {
  let s = (Math.imul(seed | 0, 2654435761) >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Tileable value noise: lattice wraps every (px, py) cells.
function makeNoise(seed) {
  const r = rng(seed + 11);
  const base = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    const t = base[i]; base[i] = base[j]; base[j] = t;
  }
  const perm = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255];
  const val = new Float32Array(256);
  for (let i = 0; i < 256; i++) val[i] = r();
  const h = (x, y) => val[perm[(x & 255) + perm[y & 255]]];
  return function (x, y, px, py) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const x0 = ((xi % px) + px) % px, y0 = ((yi % py) + py) % py;
    const x1 = (x0 + 1) % px, y1 = (y0 + 1) % py;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = h(x0, y0), b = h(x1, y0), c = h(x0, y1), d = h(x1, y1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(n, x, y, px, py, oct = 4) {
  let s = 0, a = 0.5, f = 1, t = 0;
  for (let i = 0; i < oct; i++) {
    s += a * n(x * f, y * f, px * f, py * f);
    t += a; a *= 0.5; f *= 2;
  }
  return s / t;
}

const hex = (c) => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function makeCanvas(w, h = w) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

function paint(w, h, fn) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext("2d");
  const img = ctx.createImageData(w, h);
  const d = img.data;
  const o = [0, 0, 0];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      fn(x, y, o);
      const i = (y * w + x) * 4;
      d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

export function toTexture(c, { repeat = null, srgb = true, aniso = 8 } = {}) {
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  if (repeat) t.repeat.set(repeat[0], repeat[1]);
  if (srgb) t.encoding = THREE.sRGBEncoding;
  t.anisotropy = aniso;
  return t;
}

// A copy of a texture with its own repeat (shares the same image).
export function repeated(tex, rx, ry) {
  const t = tex.clone();
  t.repeat.set(rx, ry);
  t.needsUpdate = true;
  return t;
}

// ---------------------------------------------------------------- floor
// 4 x 4 large-format porcelain tiles (texture spans 1.2 m).
export function floorCanvases(size = 1024) {
  const n = makeNoise(3), tiles = 4, tp = size / tiles, grout = 3;
  const r = rng(7);
  const tint = Array.from({ length: tiles * tiles }, () => (r() - 0.5) * 0.08);
  const A = hex(0xe3ddd1), B = hex(0xc8bfaf), G = hex(0x8c8478);
  const color = paint(size, size, (x, y, o) => {
    const tx = Math.floor(x / tp), ty = Math.floor(y / tp);
    const lx = x - tx * tp, ly = y - ty * tp;
    const edge = Math.min(lx, ly, tp - 1 - lx, tp - 1 - ly);
    if (edge < grout) {
      const g = 0.9 + 0.12 * n(x / 6, y / 6, size / 6, size / 6);
      o[0] = G[0] * g; o[1] = G[1] * g; o[2] = G[2] * g;
      return;
    }
    const u = x / size, v = y / size;
    const f = fbm(n, u * 8, v * 8, 8, 8, 5);
    const vein = Math.pow(1 - Math.abs(Math.sin((u * 4 + v * 2 + f * 1.6) * Math.PI)), 9);
    const k = clamp01(0.6 + (f - 0.5) * 0.9 + tint[ty * tiles + tx]);
    const bevel = edge < grout + 4 ? 0.9 + 0.025 * (edge - grout) : 1;
    for (let c = 0; c < 3; c++) o[c] = mix(B[c], A[c], k) * (1 - vein * 0.06) * bevel;
  });
  const bump = paint(size / 2, size / 2, (x, y, o) => {
    const tp2 = tp / 2;
    const lx = x % tp2, ly = y % tp2;
    const edge = Math.min(lx, ly, tp2 - 1 - lx, tp2 - 1 - ly);
    const v = edge < 2 ? 40 : edge < 4 ? 140 : 235;
    o[0] = o[1] = o[2] = v;
  });
  return { color, bump };
}

// ---------------------------------------------------------------- plaster
export function plasterCanvas(size = 512) {
  const n = makeNoise(5);
  const A = hex(0xeee4d3);
  return paint(size, size, (x, y, o) => {
    const f = fbm(n, (x / size) * 16, (y / size) * 16, 16, 16, 4);
    const k = 0.965 + (f - 0.5) * 0.07;
    o[0] = A[0] * k; o[1] = A[1] * k; o[2] = A[2] * k;
  });
}

// ---------------------------------------------------------------- subway tiles
// Texture spans 0.6 x 0.6 m: 8 rows of 15 x 7.5 cm bevelled tiles.
export function subwayCanvases(size = 512) {
  const n = makeNoise(9), rows = 8, rh = size / rows, tw = rh * 2;
  const T = hex(0xf6f4ef), G = hex(0xd3cec4);
  const tileAt = (x, y) => {
    const row = Math.floor(y / rh);
    const off = row % 2 ? tw / 2 : 0;
    const lx = (x + off) % tw, ly = y - row * rh;
    return Math.min(lx, ly, tw - 1 - lx, rh - 1 - ly);
  };
  const color = paint(size, size, (x, y, o) => {
    const e = tileAt(x, y);
    if (e < 2) { o[0] = G[0]; o[1] = G[1]; o[2] = G[2]; return; }
    const s = e < 7 ? 0.9 + 0.1 * ((e - 2) / 5) : 1;
    const f = 0.985 + 0.03 * n(x / 20, y / 20, size / 20, size / 20);
    for (let c = 0; c < 3; c++) o[c] = T[c] * s * f;
  });
  const bump = paint(size, size, (x, y, o) => {
    const e = tileAt(x, y);
    const v = e < 2 ? 30 : e < 7 ? 30 + (e - 2) * 40 : 240;
    o[0] = o[1] = o[2] = v;
  });
  return { color, bump };
}

// ---------------------------------------------------------------- granite
// "Black galaxy" granite: dark mottled base with mineral speckle.
export function graniteCanvas(size = 1024) {
  const n = makeNoise(13);
  const base = paint(size / 2, size / 2, (x, y, o) => {
    const s = size / 2;
    const f = fbm(n, (x / s) * 6, (y / s) * 6, 6, 6, 5);
    const k = 16 + f * 30;
    o[0] = k; o[1] = k * 0.98; o[2] = k * 0.95;
  });
  const c = makeCanvas(size);
  const ctx = c.getContext("2d");
  ctx.drawImage(base, 0, 0, size, size);
  const r = rng(21);
  const dot = (x, y, rad, col) => {
    ctx.fillStyle = col;
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) {
      if (x + dx + rad < 0 || x + dx - rad > size || y + dy + rad < 0 || y + dy - rad > size) continue;
      ctx.beginPath(); ctx.arc(x + dx, y + dy, rad, 0, Math.PI * 2); ctx.fill();
    }
  };
  for (let i = 0; i < 9000; i++) {
    const g = 50 + r() * 70;
    dot(r() * size, r() * size, 0.4 + r() * 1.6, `rgba(${g},${g},${g * 0.97},${0.5 + r() * 0.5})`);
  }
  for (let i = 0; i < 1400; i++) {
    const gold = r() < 0.55;
    dot(r() * size, r() * size, 0.5 + r() * 1.1, gold ? `rgba(196,160,96,${0.6 + r() * 0.4})` : `rgba(235,232,225,${0.5 + r() * 0.5})`);
  }
  return c;
}

// ---------------------------------------------------------------- wood
export function woodCanvas(size = 512, light = 0xa3703f, dark = 0x6e4426, seed = 17) {
  const n = makeNoise(seed);
  const L = hex(light), D = hex(dark);
  return paint(size, size, (x, y, o) => {
    const u = x / size, v = y / size;
    const warp = fbm(n, u * 3, v * 2, 3, 2, 4);
    const rings = 0.5 + 0.5 * Math.sin((u * 24 + warp * 0.9) * Math.PI * 2);
    const fine = fbm(n, u * 220, v * 4, 220, 4, 2);
    const pores = n(u * 512, v * 48, 512, 48);
    const k = clamp01(0.42 + rings * 0.22 + (fine - 0.5) * 0.55 + (pores - 0.5) * 0.12);
    for (let c = 0; c < 3; c++) o[c] = mix(D[c], L[c], k);
  });
}

// ---------------------------------------------------------------- brushed steel
export function brushedCanvas(size = 512) {
  const n = makeNoise(23);
  return paint(size, size, (x, y, o) => {
    const v = 0.62 + 0.22 * fbm(n, (x / size) * 3, (y / size) * 180, 3, 180, 3);
    const k = v * 255;
    o[0] = k; o[1] = k; o[2] = k * 1.01;
  });
}

// ---------------------------------------------------------------- jute / burlap with a printed band
export function burlapCanvas(size = 512) {
  const n = makeNoise(29);
  const A = hex(0xcdb183), B = hex(0xa98a5c);
  const c = paint(size, size, (x, y, o) => {
    const wx = 0.5 + 0.5 * Math.sin((x / size) * 128 * Math.PI * 2);
    const wy = 0.5 + 0.5 * Math.sin((y / size) * 128 * Math.PI * 2);
    const over = ((Math.floor(x / 4) + Math.floor(y / 4)) % 2) ? wx : wy;
    const f = n((x / size) * 64, (y / size) * 64, 64, 64);
    const k = clamp01(0.25 + over * 0.55 + (f - 0.5) * 0.4);
    for (let ch = 0; ch < 3; ch++) o[ch] = mix(B[ch], A[ch], k);
  });
  const ctx = c.getContext("2d");
  // printed band: red and green stripes with a grain motif (no lettering)
  ctx.globalAlpha = 0.82;
  ctx.fillStyle = "#a3241c"; ctx.fillRect(0, size * 0.38, size, size * 0.05);
  ctx.fillRect(0, size * 0.6, size, size * 0.05);
  ctx.fillStyle = "#2e6a3c"; ctx.fillRect(0, size * 0.445, size, size * 0.15);
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = "#f4ecd6";
  for (let i = 0; i < 6; i++) {
    const cx = (i + 0.5) * (size / 6), cy = size * 0.52;
    for (let k = 0; k < 7; k++) {
      ctx.beginPath();
      ctx.ellipse(cx + (k - 3) * 7, cy + Math.sin(k) * 6, 3, 9, (k - 3) * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
  return c;
}

// ---------------------------------------------------------------- wicker
export function wickerCanvas(size = 512) {
  const n = makeNoise(31);
  const A = hex(0xc69a5e), B = hex(0x8a6234);
  return paint(size, size, (x, y, o) => {
    const cell = 32;
    const cx = Math.floor(x / cell), cy = Math.floor(y / cell);
    const lx = (x % cell) / cell, ly = (y % cell) / cell;
    const horiz = (cx + cy) % 2 === 0;
    const across = horiz ? ly : lx;
    const strand = Math.sin(across * Math.PI);
    const shade = horiz ? 0.92 : 1.0;
    const f = n((x / size) * 90, (y / size) * 90, 90, 90);
    const k = clamp01(0.15 + strand * 0.8 * shade + (f - 0.5) * 0.25);
    for (let c = 0; c < 3; c++) o[c] = mix(B[c], A[c], k);
  });
}

// ---------------------------------------------------------------- generic bumps and food skins
export function bumpCanvas(seed = 37, scale = 24, size = 256) {
  const n = makeNoise(seed);
  return paint(size, size, (x, y, o) => {
    const f = fbm(n, (x / size) * scale, (y / size) * scale, scale, scale, 3);
    const v = 255 * f;
    o[0] = o[1] = o[2] = v;
  });
}

export function streakCanvas(a, b, seed = 41, size = 256, freq = 40) {
  const n = makeNoise(seed);
  const A = hex(a), B = hex(b);
  return paint(size, size, (x, y, o) => {
    const s = fbm(n, (x / size) * freq, (y / size) * 3, freq, 3, 3);
    const k = clamp01((s - 0.3) * 1.8);
    for (let c = 0; c < 3; c++) o[c] = mix(A[c], B[c], k);
  });
}

export function chickenCanvas(size = 256) {
  const n = makeNoise(43);
  const A = hex(0xe7b2a0), B = hex(0xf2d1bf), C = hex(0xcf8f80);
  return paint(size, size, (x, y, o) => {
    const u = x / size, v = y / size;
    const f = fbm(n, u * 6, v * 6, 6, 6, 5);
    const fat = Math.pow(clamp01((f - 0.55) * 4), 2);
    const deep = clamp01((0.42 - f) * 4);
    for (let c = 0; c < 3; c++) o[c] = mix(mix(A[c], B[c], fat), C[c], deep * 0.6);
  });
}

export function speckleCanvas(baseHex, speckHex, seed = 51, size = 256, density = 0.08) {
  const n = makeNoise(seed);
  const A = hex(baseHex), S = hex(speckHex);
  const r = rng(seed);
  return paint(size, size, (x, y, o) => {
    const f = fbm(n, (x / size) * 32, (y / size) * 32, 32, 32, 3);
    const sp = r() < density ? 1 : 0;
    const k = 0.86 + (f - 0.5) * 0.35;
    for (let c = 0; c < 3; c++) o[c] = mix(A[c] * k, S[c], sp * 0.85);
  });
}

export function terracottaCanvas(size = 256) {
  const n = makeNoise(57);
  const A = hex(0xb8673f), B = hex(0x8f4a2b);
  return paint(size, size, (x, y, o) => {
    const f = fbm(n, (x / size) * 10, (y / size) * 10, 10, 10, 4);
    const rings = 0.5 + 0.5 * Math.sin((y / size) * 60);
    const k = clamp01(0.55 + (f - 0.5) * 0.9 + rings * 0.06);
    for (let c = 0; c < 3; c++) o[c] = mix(B[c], A[c], k);
  });
}

// ---------------------------------------------------------------- printed labels (graphics only)
export function masalaBoxCanvas() {
  const w = 256, h = 356;
  const c = makeCanvas(w, h);
  const x = c.getContext("2d");
  const g = x.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#c8261a"); g.addColorStop(1, "#7e1410");
  x.fillStyle = g; x.fillRect(0, 0, w, h);
  // sunburst
  x.save(); x.translate(w / 2, h * 0.52);
  for (let i = 0; i < 24; i++) {
    x.rotate((Math.PI * 2) / 24);
    x.fillStyle = i % 2 ? "rgba(255,190,60,0.28)" : "rgba(255,120,40,0.18)";
    x.beginPath(); x.moveTo(0, 0); x.lineTo(-18, -200); x.lineTo(18, -200); x.closePath(); x.fill();
  }
  x.restore();
  // biryani plate illustration
  x.fillStyle = "#f3e2b8"; x.beginPath(); x.ellipse(w / 2, h * 0.58, 92, 46, 0, 0, Math.PI * 2); x.fill();
  x.fillStyle = "#e0a63a"; x.beginPath(); x.ellipse(w / 2, h * 0.55, 74, 30, 0, Math.PI, 0); x.fill();
  x.fillStyle = "#f6edd0";
  for (let i = 0; i < 70; i++) {
    const a = Math.random() * Math.PI, rr = Math.random();
    x.fillRect(w / 2 + Math.cos(a) * 70 * rr, h * 0.55 - Math.sin(a) * 28 * rr, 4, 1.6);
  }
  x.fillStyle = "#8a3b14";
  for (let i = 0; i < 6; i++) { x.beginPath(); x.ellipse(w / 2 - 50 + i * 20, h * 0.53 - (i % 2) * 10, 9, 6, i, 0, Math.PI * 2); x.fill(); }
  // gold bands top and bottom
  x.fillStyle = "#e9b949"; x.fillRect(0, 22, w, 10); x.fillRect(0, h - 32, w, 10);
  x.fillStyle = "#1f6b3a"; x.fillRect(0, 36, w, 46);
  return c;
}

export function bandCanvas(bg, fg, motif = "leaf", w = 512, h = 128) {
  const c = makeCanvas(w, h);
  const x = c.getContext("2d");
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.fillStyle = fg;
  x.fillRect(0, 8, w, 6); x.fillRect(0, h - 14, w, 6);
  for (let i = 0; i < 4; i++) {
    const cx = (i + 0.5) * (w / 4), cy = h / 2;
    x.save(); x.translate(cx, cy);
    if (motif === "leaf") {
      for (let k = 0; k < 3; k++) {
        x.rotate(0.9);
        x.beginPath(); x.ellipse(0, -16, 8, 20, 0, 0, Math.PI * 2); x.fill();
      }
    } else if (motif === "sun") {
      x.beginPath(); x.arc(0, 0, 18, 0, Math.PI * 2); x.fill();
      for (let k = 0; k < 12; k++) { x.rotate(Math.PI / 6); x.fillRect(-2, -34, 4, 10); }
    } else {
      x.beginPath(); x.arc(0, 0, 22, 0, Math.PI * 2); x.fill();
      x.fillStyle = bg; x.beginPath(); x.arc(0, 0, 13, 0, Math.PI * 2); x.fill(); x.fillStyle = fg;
    }
    x.restore();
  }
  return c;
}

// ---------------------------------------------------------------- the window view
// Late-afternoon Karachi rooftops: haze, flat roofs, water tanks, a dish or two.
export function skylineCanvas(w = 1024, h = 512) {
  const c = makeCanvas(w, h);
  const x = c.getContext("2d");
  const sky = x.createLinearGradient(0, 0, 0, h);
  sky.addColorStop(0, "#8fb8d8"); sky.addColorStop(0.55, "#d9d6c8"); sky.addColorStop(0.8, "#f1d3a1"); sky.addColorStop(1, "#e9c18e");
  x.fillStyle = sky; x.fillRect(0, 0, w, h);
  const sun = x.createRadialGradient(w * 0.22, h * 0.62, 0, w * 0.22, h * 0.62, w * 0.35);
  sun.addColorStop(0, "rgba(255,236,190,0.95)"); sun.addColorStop(0.15, "rgba(255,214,150,0.55)"); sun.addColorStop(1, "rgba(255,200,140,0)");
  x.fillStyle = sun; x.fillRect(0, 0, w, h);
  const r = rng(61);
  const layers = [
    { y: 0.6, col: [196, 184, 170], var: 40, hmin: 30, hmax: 90 },
    { y: 0.72, col: [164, 148, 130], var: 50, hmin: 40, hmax: 130 },
    { y: 0.86, col: [126, 108, 92], var: 60, hmin: 60, hmax: 170 },
  ];
  for (const L of layers) {
    let px = -20;
    while (px < w + 20) {
      const bw = 60 + r() * 120, bh = L.hmin + r() * (L.hmax - L.hmin);
      const top = h * L.y - bh * 0.6;
      const k = 0.9 + r() * 0.2;
      x.fillStyle = `rgb(${L.col[0] * k},${L.col[1] * k},${L.col[2] * k})`;
      x.fillRect(px, top, bw, h - top);
      // windows
      x.fillStyle = "rgba(60,48,40,0.25)";
      for (let wy = top + 12; wy < h - 10; wy += 22) for (let wx = px + 8; wx < px + bw - 12; wx += 18) if (r() < 0.6) x.fillRect(wx, wy, 8, 10);
      // rooftop water tanks
      if (r() < 0.7) {
        const tx = px + 10 + r() * (bw - 40), tw = 16 + r() * 14, th = 14 + r() * 10;
        x.fillStyle = r() < 0.5 ? "#2d2b2a" : "#e7e1d4";
        x.fillRect(tx, top - th, tw, th);
        x.beginPath(); x.ellipse(tx + tw / 2, top - th, tw / 2, 3, 0, 0, Math.PI * 2); x.fill();
        x.fillStyle = "rgba(40,36,32,0.6)"; x.fillRect(tx + 2, top - 3, tw - 4, 3);
      }
      if (r() < 0.25) {
        x.strokeStyle = "rgba(70,64,58,0.8)"; x.lineWidth = 2;
        const dx = px + bw * 0.7, dy = top - 10;
        x.beginPath(); x.arc(dx, dy, 9, Math.PI * 0.15, Math.PI * 1.15); x.stroke();
        x.beginPath(); x.moveTo(dx, dy); x.lineTo(dx, top); x.stroke();
      }
      px += bw + r() * 6;
    }
    // haze between layers
    const hz = x.createLinearGradient(0, h * (L.y - 0.15), 0, h);
    hz.addColorStop(0, "rgba(240,220,190,0)"); hz.addColorStop(1, "rgba(240,215,180,0.18)");
    x.fillStyle = hz; x.fillRect(0, 0, w, h);
  }
  // overhead wires
  x.strokeStyle = "rgba(40,36,34,0.55)"; x.lineWidth = 1.2;
  for (let i = 0; i < 3; i++) {
    x.beginPath(); x.moveTo(0, h * (0.28 + i * 0.05));
    x.quadraticCurveTo(w / 2, h * (0.36 + i * 0.05), w, h * (0.27 + i * 0.05)); x.stroke();
  }
  return c;
}

export function clockCanvas(size = 256) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  x.fillStyle = "#fbf8f1"; x.fillRect(0, 0, size, size);
  x.translate(size / 2, size / 2);
  x.strokeStyle = "#2a2622"; x.lineWidth = 10;
  x.beginPath(); x.arc(0, 0, size / 2 - 8, 0, Math.PI * 2); x.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, big = i % 5 === 0;
    x.lineWidth = big ? 5 : 2;
    const r0 = size / 2 - (big ? 34 : 26), r1 = size / 2 - 18;
    x.beginPath(); x.moveTo(Math.sin(a) * r0, -Math.cos(a) * r0); x.lineTo(Math.sin(a) * r1, -Math.cos(a) * r1); x.stroke();
  }
  return c;
}

// Soft darkening where walls meet the floor, ceiling and each other.
// Canvas bottom = bottom of each wall face.
export function wallAOCanvas(size = 256) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  x.fillStyle = "#fff"; x.fillRect(0, 0, size, size);
  const g = (x0, y0, x1, y1, a) => {
    const gr = x.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, `rgba(0,0,0,${a})`); gr.addColorStop(1, "rgba(0,0,0,0)");
    return gr;
  };
  x.fillStyle = g(0, size, 0, size * 0.86, 0.5); x.fillRect(0, size * 0.86, size, size * 0.14);
  x.fillStyle = g(0, 0, 0, size * 0.07, 0.32); x.fillRect(0, 0, size, size * 0.07);
  x.fillStyle = g(0, 0, size * 0.06, 0, 0.38); x.fillRect(0, 0, size * 0.06, size);
  x.fillStyle = g(size, 0, size * 0.94, 0, 0.38); x.fillRect(size * 0.94, 0, size * 0.06, size);
  return c;
}

// Radial contact shadow that sits under objects so they don't float.
export function blobCanvas(size = 128) {
  const c = makeCanvas(size);
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(0,0,0,0.62)");
  g.addColorStop(0.45, "rgba(0,0,0,0.32)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return c;
}

// Build every shared texture once.
export function makeTextures() {
  const floor = floorCanvases();
  const sub = subwayCanvases();
  return {
    floor: toTexture(floor.color),
    floorBump: toTexture(floor.bump, { srgb: false }),
    plaster: toTexture(plasterCanvas()),
    subway: toTexture(sub.color),
    subwayBump: toTexture(sub.bump, { srgb: false }),
    granite: toTexture(graniteCanvas()),
    oak: toTexture(woodCanvas(512, 0xc49c6b, 0x9f774a, 17)),
    teak: toTexture(woodCanvas(512, 0x8a5b38, 0x603d25, 19)),
    wallAO: toTexture(wallAOCanvas(), { srgb: false }),
    blob: toTexture(blobCanvas(), { srgb: false }),
    brushed: toTexture(brushedCanvas()),
    burlap: toTexture(burlapCanvas()),
    wicker: toTexture(wickerCanvas()),
    sky: toTexture(skylineCanvas(), { aniso: 4 }),
    chicken: toTexture(chickenCanvas()),
    onion: toTexture(streakCanvas(0x9c3f2a, 0xcf7a52, 41, 256, 46)),
    onionFlesh: toTexture(streakCanvas(0x7a2d5a, 0xb9739d, 47, 256, 38)),
    garlic: toTexture(streakCanvas(0xf1e9dc, 0xc9a7b4, 43, 256, 36)),
    bump: toTexture(bumpCanvas(37, 24), { srgb: false }),
    bumpFine: toTexture(bumpCanvas(39, 64), { srgb: false }),
    terracotta: toTexture(terracottaCanvas()),
    redChilli: toTexture(speckleCanvas(0xa8250f, 0x5e0f06, 51, 256, 0.1)),
    haldi: toTexture(speckleCanvas(0xe3a01b, 0xb36f0a, 53, 256, 0.06)),
    salt: toTexture(speckleCanvas(0xf2f1ec, 0xffffff, 55, 256, 0.25)),
    garam: toTexture(speckleCanvas(0x5a3a22, 0x1c120c, 57, 256, 0.3)),
    masala: toTexture(masalaBoxCanvas()),
    kewraLabel: toTexture(bandCanvas("#2f7a45", "#e4f2d8", "leaf")),
    zardaLabel: toTexture(bandCanvas("#f0a01a", "#7a1c0c", "sun")),
    oilLabel: toTexture(bandCanvas("#f3c623", "#2c6b2f", "sun")),
    gheeLabel: toTexture(bandCanvas("#1f5c9e", "#f6e7a1", "ring")),
    clock: toTexture(clockCanvas(), { aniso: 4 }),
  };
}
