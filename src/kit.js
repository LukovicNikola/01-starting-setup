// src/kit.js — alatnica za gradnju junaka i dvorane
//
// KONVENCIJE ZA SVAKOG JUNAKA:
//  - stopala na y = 0, junak gleda u pravcu +Z
//  - visina 1.2 do 2.3 (sa šeširom / štapom), otisak unutar ±0.9 po x i z
//  - orijentiri za visinu ~1.80: kukovi 0.88, struk 1.02, grudi 1.22,
//    ramena 1.42, brada 1.52, centar glave 1.62, teme 1.78
//  - bez svetala, tekstura i asinhronog koda unutar junaka; sjaj ide kroz emissive
//
// Alatnica nudi tri sloja:
//  1. materijali i primitivi  — M/Metal/Glow, box/cyl/sphere/cone/torus/lathe/bar
//  2. složeni oblici          — curve, strap, rivets, chainmail, fringe, fur, edged
//  3. figura i pokret         — makeFace, makeHand, Anim
//
// Anim je deklarativan: pokreti se PRIJAVE jednom (pamteći zatečenu pozu kao
// osnovu), a update(t) ih samo izvrti. Nema alokacija po kadru.

import * as THREE from 'three';

// ------------------------------------------------------------------ paleta ---
// Hladnija paleta od uobičajene fantazijske — dvorana je noćna i kamena,
// pa toplina dolazi samo iz žeravnika i pojedinih tkanina.

export const C = {
  // kamen
  stone: 0x6d7480,
  stoneDark: 0x4b515c,
  stoneLight: 0x8d939c,
  rubble: 0x585d66,

  // metal
  steel: 0xa3adb8,
  steelDark: 0x69727d,
  iron: 0x484d55,
  blackIron: 0x33373d,
  brass: 0xc08a3e,
  copper: 0xa8622f,
  gold: 0xd8a84a,
  goldPale: 0xf0cf82,
  silver: 0xd0d7de,

  // organika
  leather: 0x77502f,
  leatherDark: 0x4a3220,
  leatherPale: 0x9d7448,
  wood: 0x6b4728,
  woodDark: 0x422c18,
  woodPale: 0x9c7043,
  bone: 0xe7dfc8,
  fur: 0x6c6257,
  furDark: 0x413a33,
  furPale: 0xa89880,

  // tkanine
  crimson: 0x8d2230,
  wine: 0x5c1b2a,
  teal: 0x1f5560,
  indigo: 0x2b3a6b,
  moss: 0x46603a,
  saffron: 0xc98b2b,
  ivory: 0xe6e0cf,
  charcoal: 0x272a30,
  plum: 0x4a2f52,
  slate: 0x3d4652,

  // ten i kosa
  skin: 0xd9a179,
  skinPale: 0xe6c6a4,
  skinTan: 0xb4794f,
  skinDark: 0x7f5136,
  skinGrey: 0xb9b3ab,
  hairBlack: 0x2b2420,
  hairBrown: 0x5b3a20,
  hairGrey: 0xb9b2a4,
  hairWhite: 0xe2ddd0,
  hairRed: 0xa8451c,
  hairBlond: 0xd4b166,

  // svetleće
  moon: 0xbdd0ff,
  ember: 0xff8a3c,
  emberPale: 0xffc46a,
  frost: 0x9fe3ff,
  poison: 0x7fe06a,
  arcane: 0xb98cff,
  bloodGlow: 0xff5a4a,
};

// ------------------------------------------------------------- materijali ---

export function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: o.roughness ?? 0.85,
    metalness: o.metalness ?? 0.0,
    flatShading: o.flat ?? true,
    emissive: o.emissive ?? 0x000000,
    emissiveIntensity: o.emissiveIntensity ?? 1,
    transparent: o.transparent ?? false,
    opacity: o.opacity ?? 1,
    side: o.side ?? THREE.FrontSide,
    depthWrite: o.depthWrite ?? true,
  });
}

/** Uglačan metal — za oklope, sečiva, okove. */
export function Metal(color, o = {}) {
  return M(color, { roughness: 0.34, metalness: 0.9, ...o });
}

/** Mat tkanina — upija svetlo, ne blješti. */
export function Cloth(color, o = {}) {
  return M(color, { roughness: 0.96, ...o });
}

/** Koža — polusjajna. */
export function Hide(color, o = {}) {
  return M(color, { roughness: 0.78, ...o });
}

/** Ten — mekan, bez fasetiranja da lice ne bude oštro. */
export function Flesh(color, o = {}) {
  return M(color, { roughness: 0.7, flat: false, ...o });
}

/** Materijal koji sam svetli. */
export function Glow(color, intensity = 1.6, o = {}) {
  return M(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4, ...o });
}

/** Prozirno svetlucanje — magle, duhovi, staklo. */
export function Ghost(color, intensity = 1.2, opacity = 0.45) {
  return M(color, {
    emissive: color, emissiveIntensity: intensity,
    transparent: true, opacity, depthWrite: false, roughness: 0.3,
  });
}

// -------------------------------------------------------------- primitivi ---

function fin(m) { m.castShadow = true; m.receiveShadow = true; return m; }

export function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return fin(m);
}
export const bx = box; // kraći alias, koristi se unutar alatnice

export function cyl(rTop, rBot, h, mat, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
  m.position.set(x, y, z);
  return fin(m);
}

export function sphere(r, mat, x = 0, y = 0, z = 0, w = 12, h = 10) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, w, h), mat);
  m.position.set(x, y, z);
  return fin(m);
}

export function cone(r, h, mat, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), mat);
  m.position.set(x, y, z);
  return fin(m);
}

export function torus(r, tube, mat, x = 0, y = 0, z = 0, seg = 8, tSeg = 18) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, seg, tSeg), mat);
  m.position.set(x, y, z);
  return fin(m);
}

/** Telo obrtanja — odore, suknje, šeširi, pehari. points: [[r, y], ...] od dna. */
export function lathe(points, mat, seg = 14) {
  const pts = points.map(([r, y]) => new THREE.Vector2(r, y));
  return fin(new THREE.Mesh(new THREE.LatheGeometry(pts, seg), mat));
}

/** Poliedar — kamenje, kristali, grumenje. */
export function rock(r, mat, x = 0, y = 0, z = 0, detail = 0) {
  const m = new THREE.Mesh(new THREE.DodecahedronGeometry(r, detail), mat);
  m.position.set(x, y, z);
  return fin(m);
}

export function crystal(r, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(r, 0), mat);
  m.position.set(x, y, z);
  return fin(m);
}

/** Valjak razapet između dve tačke — kaiševi, motke pod uglom, prečke. */
export function bar(a, b, r, mat, seg = 7, rEnd = null) {
  const ax = a[0], ay = a[1], az = a[2];
  const dx = b[0] - ax, dy = b[1] - ay, dz = b[2] - az;
  const len = Math.hypot(dx, dy, dz) || 1e-5;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rEnd ?? r, r, len, seg), mat);
  m.position.set(ax + dx * 0.5, ay + dy * 0.5, az + dz * 0.5);
  _v1.set(0, 1, 0);
  _v2.set(dx / len, dy / len, dz / len);
  m.quaternion.setFromUnitVectors(_v1, _v2);
  return fin(m);
}
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();

export function group(children = [], x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  for (const c of children) if (c) g.add(c);
  g.position.set(x, y, z);
  return g;
}

// --------------------------------------------------------- složeni oblici ---

/**
 * Savijen niz valjaka po kvadratnoj Bezijeovoj krivoj — rogovi, rebra,
 * krakovi luka, repovi, korenje, lokne. Poluprečnik se sužava od r0 do r1.
 */
export function curve(a, b, bulge, mat, r0 = 0.03, r1 = 0.01, seg = 6) {
  const g = new THREE.Group();
  const cx = (a[0] + b[0]) * 0.5 + bulge[0];
  const cy = (a[1] + b[1]) * 0.5 + bulge[1];
  const cz = (a[2] + b[2]) * 0.5 + bulge[2];
  const at = (t) => {
    const u = 1 - t;
    return [
      u * u * a[0] + 2 * u * t * cx + t * t * b[0],
      u * u * a[1] + 2 * u * t * cy + t * t * b[1],
      u * u * a[2] + 2 * u * t * cz + t * t * b[2],
    ];
  };
  let prev = at(0);
  for (let i = 1; i <= seg; i++) {
    const t = i / seg;
    const cur = at(t);
    const rA = r0 + (r1 - r0) * ((i - 1) / seg);
    const rB = r0 + (r1 - r0) * t;
    g.add(bar(prev, cur, rA, mat, 6, rB));
    prev = cur;
  }
  return g;
}

/** Kaiš kroz niz tačaka — remenje, lanci, konopci. */
export function strap(points, r, mat, seg = 6) {
  const g = new THREE.Group();
  for (let i = 1; i < points.length; i++) g.add(bar(points[i - 1], points[i], r, mat, seg));
  return g;
}

/** Lanac od karika između dve tačke. */
export function chain(a, b, links, r, mat) {
  const g = new THREE.Group();
  for (let i = 0; i < links; i++) {
    const t = (i + 0.5) / links;
    const k = torus(r, r * 0.32, mat,
      a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 6, 10);
    k.rotation.x = Math.PI / 2;
    k.rotation.y = (i % 2) * Math.PI / 2;
    g.add(k);
  }
  return g;
}

/** Zakivci duž linije — rubovi oklopa, pojasevi, štitovi. */
export function rivets(a, b, count, r, mat) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const t = count === 1 ? 0.5 : i / (count - 1);
    g.add(sphere(r, mat,
      a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t, 6, 5));
  }
  return g;
}

/** Zakivci u krug — obruči štitova, kacige, bačve. */
export function rivetRing(radius, count, r, mat, y = 0, squashZ = 1, phase = 0) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const a = phase + (i / count) * Math.PI * 2;
    g.add(sphere(r, mat, Math.sin(a) * radius, y, Math.cos(a) * radius * squashZ, 6, 5));
  }
  return g;
}

/** Verižnjača — redovi sitnih karika oko trupa. */
export function chainmail(radius, rows, perRow, mat, y0 = 0, dy = 0.055, squashZ = 0.82, taper = 0) {
  const g = new THREE.Group();
  for (let row = 0; row < rows; row++) {
    const r = radius - taper * row;
    const y = y0 + row * dy;
    for (let i = 0; i < perRow; i++) {
      const a = (i / perRow) * Math.PI * 2 + row * 0.34;
      const k = torus(dy * 0.36, dy * 0.12, mat,
        Math.sin(a) * r, y, Math.cos(a) * r * squashZ, 6, 8);
      k.rotation.y = a;
      g.add(k);
    }
  }
  return g;
}

/** Iscepan/resast rub — donji rub odore, ogrtača, zastave. */
export function fringe(radius, count, mat, len = 0.12, y = 0, squashZ = 1, wobble = 0.4) {
  const g = new THREE.Group();
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;
    const L = len * (1 - wobble * 0.5 + wobble * ((i * 7919) % 100) / 100);
    const c = cone(radius * 0.13, L, mat, Math.sin(a) * radius, y - L * 0.5, Math.cos(a) * radius * squashZ, 5);
    c.rotation.x = Math.PI;
    g.add(c);
  }
  return g;
}

/** Krzno — nasumično raspoređene spljoštene grudve oko tačke. */
export function fur(mat, count, spread = [0.2, 0.08, 0.16], size = 0.06, seed = 1) {
  const g = new THREE.Group();
  let s = seed;
  const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < count; i++) {
    const k = sphere(size * (0.6 + rnd() * 0.8), mat,
      (rnd() - 0.5) * 2 * spread[0], (rnd() - 0.5) * 2 * spread[1], (rnd() - 0.5) * 2 * spread[2], 7, 6);
    k.scale.set(1, 0.62, 1);
    k.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    g.add(k);
  }
  return g;
}

/** Ploča sa opšivom — osnovna ploča i četiri tanke trake po ivicama. */
export function edged(w, h, d, mat, trimMat, x = 0, y = 0, z = 0, t = 0.016) {
  const g = group([bx(w, h, d, mat)], x, y, z);
  g.add(bx(w + t, t * 1.6, d + t, trimMat, 0, h / 2, 0));
  g.add(bx(w + t, t * 1.6, d + t, trimMat, 0, -h / 2, 0));
  g.add(bx(t * 1.6, h, d + t, trimMat, w / 2, 0, 0));
  g.add(bx(t * 1.6, h, d + t, trimMat, -w / 2, 0, 0));
  return g;
}

/** Bočica sa svetlucavim sadržajem — pojasevi alhemičara, lovaca, magova. */
export function vial(mat, liquid, x = 0, y = 0, z = 0, h = 0.075, r = 0.019) {
  const g = group([], x, y, z);
  g.add(cyl(r, r, h, mat, 0, 0, 0, 8));
  g.add(cyl(r * 0.72, r * 0.72, h * 0.62, liquid, 0, -h * 0.14, 0, 8));
  g.add(cyl(r * 0.5, r * 0.62, h * 0.2, Hide(C.woodDark), 0, h * 0.58, 0, 7));
  return g;
}

// -------------------------------------------------------------------- lice ---

/**
 * Gradi lice okrenuto ka +Z, sa centrom lobanje u koordinatnom početku.
 * Vraća reference na delove da junak može da trepće, mršti se i mrda vilicom.
 */
export function makeFace(o = {}) {
  const skin = o.skin ?? Flesh(C.skin);
  const r = o.r ?? 0.115;
  const eyeWhiteMat = o.eyeWhiteMat ?? M(C.bone, { flat: false, roughness: 0.5 });
  const irisMat = o.irisMat ?? (o.eyeGlow ? Glow(o.eyeGlow, 2.2) : M(o.eye ?? 0x2c2620, { flat: false }));
  const browMat = o.browMat ?? M(o.brow ?? C.hairBrown);
  const mouthMat = o.mouthMat ?? M(o.mouthColor ?? 0x7a4038);

  const eyeSize = o.eyeSize ?? 0.019;
  const eyeSpread = o.eyeSpread ?? r * 0.42;
  const eyeY = o.eyeY ?? r * 0.10;
  const eyeZ = o.eyeZ ?? r * 0.80;
  const browY = o.browY ?? eyeY + r * 0.30;
  const browAngle = o.browAngle ?? 0.18;      // + = namršten
  const noseLen = o.noseLen ?? r * 0.28;
  const noseY = o.noseY ?? eyeY - r * 0.30;
  const mouthStyle = o.mouth ?? 'line';
  const mouthY = o.mouthY ?? eyeY - r * 0.72;

  const g = new THREE.Group();

  const skull = sphere(r, skin, 0, 0, 0, 14, 12);
  skull.scale.set(o.wide ?? 1.0, o.tall ?? 1.05, o.deep ?? 0.95);
  g.add(skull);

  // jagodice daju licu karakter i hvataju svetlo sa strane
  if (o.cheeks !== false) {
    for (const s of [-1, 1]) {
      const c = sphere(r * 0.30, skin, s * r * 0.52, eyeY - r * 0.26, r * 0.56, 8, 7);
      c.scale.set(1, 0.72, 0.66);
      g.add(c);
    }
  }

  // oči: beonjača + zenica + kapak koji pada pri treptaju
  const eyes = [];
  const irises = [];
  const lids = [];
  for (const s of [-1, 1]) {
    const w = sphere(eyeSize, eyeWhiteMat, s * eyeSpread, eyeY, eyeZ, 9, 8);
    w.scale.set(1, 0.86, 0.6);
    g.add(w); eyes.push(w);

    const iris = sphere(eyeSize * 0.48, irisMat, s * eyeSpread, eyeY, eyeZ + eyeSize * 0.5, 8, 7);
    g.add(iris); irises.push(iris);

    const lid = bx(eyeSize * 2.3, eyeSize * 1.5, eyeSize * 0.8, skin,
      s * eyeSpread, eyeY + eyeSize * 1.5, eyeZ + eyeSize * 0.18);
    g.add(lid); lids.push(lid);
  }

  // obrve — ugao nosi izraz lica
  const brows = [];
  for (const s of [-1, 1]) {
    const b = bx(r * 0.46, r * 0.10, r * 0.14, browMat, s * eyeSpread * 1.06, browY, eyeZ * 0.92);
    b.rotation.z = -browAngle * s;
    g.add(b); brows.push(b);
  }

  // nos
  const nose = sphere(r * 0.20, skin, 0, noseY, eyeZ * 0.98, 8, 7);
  nose.scale.set(o.noseWide ?? 0.85, 1.25, 1.0 + noseLen * 3);
  g.add(nose);

  // usta
  let mouth = null;
  if (mouthStyle !== 'none') {
    if (mouthStyle === 'open') {
      mouth = bx(r * 0.30, r * 0.16, r * 0.10, M(0x2a1a18), 0, mouthY, eyeZ * 0.86);
    } else {
      mouth = bx(r * 0.34, r * 0.045, r * 0.09, mouthMat, 0, mouthY, eyeZ * 0.88);
      if (mouthStyle === 'smile') mouth.rotation.x = -0.35;
      if (mouthStyle === 'frown') mouth.rotation.x = 0.35;
    }
    g.add(mouth);
    // donja usna daje ustima dubinu
    g.add(bx(r * 0.26, r * 0.05, r * 0.07, skin, 0, mouthY - r * 0.10, eyeZ * 0.84));
  }

  // vilica
  const jaw = sphere(r * 0.62, skin, 0, -r * 0.55, r * 0.24, 10, 8);
  jaw.scale.set(0.94, 0.66, 0.9);
  g.add(jaw);

  // uši
  if (o.ears !== false) {
    for (const s of [-1, 1]) {
      const e = sphere(r * 0.20, skin, s * r * 0.96, eyeY - r * 0.05, 0, 7, 6);
      e.scale.set(0.42, 1.0, 0.72);
      g.add(e);
    }
  }

  return {
    group: g, skull, jaw, nose, mouth,
    eyeL: eyes[0], eyeR: eyes[1],
    irisL: irises[0], irisR: irises[1],
    lidL: lids[0], lidR: lids[1],
    browL: brows[0], browR: brows[1],
    irisMat,
  };
}

// -------------------------------------------------------------------- šaka ---

/**
 * Šaka čija Y osa je osa predmeta koji drži (drška, motka, uzda).
 * Dlan je na strani -Z, prsti prelaze preko +Z. Postavlja se kao dete oružja.
 *   pose 'grip' — prsti obuhvataju dršku
 *   pose 'fist' — stisnuta pesnica
 *   pose 'open' — otvoren dlan, prsti ispruženi nadole po Y
 */
export function makeHand(o = {}) {
  const skin = o.skin ?? Flesh(C.skin);
  const s = o.s ?? 1;
  const pose = o.pose ?? 'grip';
  const side = o.side ?? 1;              // 1 = desna, -1 = leva (položaj palca)
  const cuffMat = o.cuff ?? null;

  const g = new THREE.Group();
  const P = 0.052 * s;                   // pola širine dlana

  const palm = bx(P * 2, P * 2.1, P * 1.05, skin, 0, 0, -P * 0.95);
  g.add(palm);
  // meko jastuče dlana — obli obris umesto gole kocke
  const pad = sphere(P * 0.92, skin, 0, -P * 0.35, -P * 1.05, 8, 7);
  pad.scale.set(1.05, 0.85, 0.62);
  g.add(pad);

  const reach = pose === 'open' ? 0 : (pose === 'fist' ? 0.85 : 1);
  const fingerY = [P * 0.78, P * 0.26, -P * 0.26, -P * 0.78];

  for (let i = 0; i < 4; i++) {
    const y = fingerY[i];
    const shrink = 1 - Math.abs(i - 1.2) * 0.09;
    if (pose === 'open') {
      const f = bx(P * 0.42 * shrink, P * 1.5, P * 0.44, skin, (i - 1.5) * P * 0.52, -P * 1.9, -P * 0.9);
      g.add(f);
      g.add(sphere(P * 0.22 * shrink, skin, (i - 1.5) * P * 0.52, -P * 2.6, -P * 0.9, 6, 5));
    } else {
      // članak preko drške, pa vrh prsta koji se savija nazad ka dlanu
      const knuckle = bx(P * 1.9 * shrink, P * 0.42, P * 0.46, skin, 0, y, P * 0.42 * reach);
      g.add(knuckle);
      g.add(bx(P * 0.5, P * 0.40, P * 0.52 * shrink, skin, -P * 0.86 * side, y, P * 0.04));
      g.add(sphere(P * 0.24 * shrink, skin, P * 0.82 * side, y, P * 0.40 * reach, 6, 5));
    }
  }

  // palac prelazi dijagonalno preko ostalih prstiju
  const thumb = bx(P * 0.52, P * 1.25, P * 0.5, skin, P * 0.92 * side, -P * 0.42, -P * 0.30);
  thumb.rotation.z = 0.55 * side;
  thumb.rotation.x = -0.3 * reach;
  g.add(thumb);
  g.add(sphere(P * 0.27, skin, P * 0.66 * side, -P * 1.15, P * 0.06 * reach, 6, 5));

  // manžetna / štitnik zgloba
  if (cuffMat) {
    const cuff = cyl(P * 1.35, P * 1.5, P * 0.9, cuffMat, 0, P * 1.75, -P * 0.5, 9);
    g.add(cuff);
    g.add(torus(P * 1.42, P * 0.13, cuffMat, 0, P * 2.15, -P * 0.5, 6, 12));
    g.children[g.children.length - 1].rotation.x = Math.PI / 2;
  }

  return g;
}

/** Stopalo u čizmi — sa đonom, prstima i (opciono) kopčom. */
export function makeBoot(o = {}) {
  const mat = o.mat ?? Hide(C.leather);
  const soleMat = o.sole ?? Hide(C.leatherDark);
  const s = o.s ?? 1;
  const g = new THREE.Group();
  g.add(bx(0.16 * s, 0.05 * s, 0.30 * s, soleMat, 0, 0.025 * s, 0.03 * s));   // đon
  g.add(bx(0.15 * s, 0.11 * s, 0.27 * s, mat, 0, 0.105 * s, 0.03 * s));       // stopalo
  const toe = sphere(0.075 * s, mat, 0, 0.10 * s, 0.15 * s, 8, 7);
  toe.scale.set(1, 0.72, 0.9);
  g.add(toe);
  g.add(bx(0.145 * s, 0.20 * s, 0.16 * s, mat, 0, 0.24 * s, -0.03 * s));      // sara
  if (o.cuff) {
    const c = bx(0.17 * s, 0.07 * s, 0.19 * s, o.cuff, 0, 0.36 * s, -0.03 * s);
    g.add(c);
  }
  if (o.buckle) {
    g.add(bx(0.05 * s, 0.035 * s, 0.02 * s, o.buckle, 0, 0.29 * s, 0.06 * s));
  }
  return g;
}

// ------------------------------------------------------------------ pokret ---

/**
 * Deklarativni animator. Pokreti se prijavljuju POSLE zauzimanja mirne poze —
 * svaki pamti zatečenu vrednost kao osnovu i osciluje oko nje.
 * tick(t) je čista funkcija vremena i ne alocira ništa.
 */
export class Anim {
  constructor() { this.ops = []; }

  add(fn) { this.ops.push(fn); return this; }

  /** Oscilacija rotacije oko osnovne poze. axis: 'x' | 'y' | 'z' */
  rot(obj, axis, amp, speed, phase = 0) {
    const base = obj.rotation[axis];
    return this.add((t) => { obj.rotation[axis] = base + Math.sin(t * speed + phase) * amp; });
  }

  /** Oscilacija pozicije po osi. */
  pos(obj, axis, amp, speed, phase = 0) {
    const base = obj.position[axis];
    return this.add((t) => { obj.position[axis] = base + Math.sin(t * speed + phase) * amp; });
  }

  /** Disanje — grudni koš se širi i blago diže. */
  breathe(obj, amp = 0.014, speed = 1.15, phase = 0) {
    const by = obj.position.y;
    const sx = obj.scale.x, sz = obj.scale.z;
    return this.add((t) => {
      const k = Math.sin(t * speed + phase);
      obj.position.y = by + k * amp;
      obj.scale.x = sx * (1 + k * amp * 0.7);
      obj.scale.z = sz * (1 + k * amp * 0.9);
    });
  }

  /** Neprekidno okretanje. */
  spin(obj, axis, speed) {
    const base = obj.rotation[axis];
    return this.add((t) => { obj.rotation[axis] = base + t * speed; });
  }

  /** Kruženje oko junaka, sa blagim propinjanjem gore-dole. */
  orbit(obj, radius, speed, phase = 0, y0 = 1.2, yAmp = 0.07, ySpeed = 1.7) {
    return this.add((t) => {
      const a = t * speed + phase;
      obj.position.x = Math.cos(a) * radius;
      obj.position.z = Math.sin(a) * radius;
      obj.position.y = y0 + Math.sin(t * ySpeed + phase) * yAmp;
      obj.rotation.y = -a;
    });
  }

  /** Uzlazna spirala koja se vraća na dno — varnice, magle, latice. */
  rise(obj, radius, period, phase, y0, y1, swirl = 2.2) {
    return this.add((t) => {
      const k = ((t / period) + phase) % 1;
      const a = phase * 6.283 + k * swirl * 6.283;
      const r = radius * (0.5 + k * 0.9);
      obj.position.set(Math.cos(a) * r, y0 + (y1 - y0) * k, Math.sin(a) * r);
      const s = Math.sin(k * Math.PI);
      obj.scale.setScalar(0.35 + s * 0.75);
    });
  }

  /** Pulsiranje sjaja. */
  pulse(mat, base, amp, speed, phase = 0) {
    return this.add((t) => { mat.emissiveIntensity = base + Math.sin(t * speed + phase) * amp; });
  }

  /** Nemirno treperenje sjaja — plamen, magija koja se opire. */
  flicker(mat, base, amp, s1 = 9, s2 = 23, phase = 0) {
    return this.add((t) => {
      mat.emissiveIntensity = base
        + Math.sin(t * s1 + phase) * amp * 0.6
        + Math.sin(t * s2 + phase * 2.3) * amp * 0.4;
    });
  }

  /** Treptaj — kapak povremeno padne preko oka. */
  blink(lid, period = 4.2, phase = 0, drop = 0.03) {
    const base = lid.position.y;
    return this.add((t) => {
      const k = (((t + phase) % period) + period) % period / period;
      const c = k < 0.08 ? Math.sin((k / 0.08) * Math.PI) : 0;
      lid.position.y = base - drop * c;
    });
  }

  /**
   * Njihanje niza panela (ogrtač, barjak, resa) sa pomerenom fazom po panelu,
   * tako da talas putuje kroz tkaninu umesto da se svi klate uglas.
   */
  wave(panels, axis, amp, speed, stagger = 0.5, phase = 0) {
    for (let i = 0; i < panels.length; i++) {
      this.rot(panels[i], axis, amp * (0.6 + 0.4 * (i / Math.max(1, panels.length - 1))),
        speed, phase + i * stagger);
    }
    return this;
  }

  /** Povremeni okret glave — pogled koji pretražuje prostor. */
  scan(obj, amp = 0.16, period = 9, phase = 0) {
    const base = obj.rotation.y;
    return this.add((t) => {
      const k = (((t + phase) % period) + period) % period / period;
      // miruje veći deo ciklusa, pa se glatko okrene i vrati
      const e = k < 0.5 ? 0 : Math.sin((k - 0.5) * 2 * Math.PI);
      obj.rotation.y = base + e * amp;
    });
  }

  /** Sopstvena funkcija — za sve što ne staje u obrasce iznad. */
  custom(fn) { return this.add(fn); }

  tick(t) {
    const ops = this.ops;
    for (let i = 0; i < ops.length; i++) ops[i](t);
  }
}

// ---------------------------------------------------------------- sitnice ---

/** Deterministički generator — ista scena pri svakom učitavanju. */
export function seeded(seed) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6D2B79F5) | 0;
    let x = Math.imul(s ^ (s >>> 15), 1 | s);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

/** Broj mesheva u grani — koristi se za prikaz „od koliko delova". */
export function countMeshes(obj) {
  let n = 0;
  obj.traverse((o) => { if (o.isMesh) n++; });
  return n;
}
