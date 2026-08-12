// src/hall.js — Dvorana Barjaka: razrušena kamena lađa pod mesečinom
//
// Lađa teče duž Z ose. Junaci stoje u dva reda sa strane (x = ±3.4), leđima
// okrenuti kolonadi (x = ±5.3) i barjaku koji visi iza njih. Na dnu lađe, pod
// rozetom, stoji postolje sa mačem zabijenim u napukli kamen — tačka u koju
// pogled prirodno otiče niz tepih.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Glow, Ghost,
  box, cyl, sphere, cone, torus, rock, bar, group, strap, rivetRing, seeded,
} from './kit.js';

export const HERO_Z = [-9, -4.5, 0, 4.5, 9];   // pet niša po strani
export const HERO_X = 3.4;                      // odstojanje junaka od ose lađe
export const PLINTH_H = 0.34;                   // visina postamenta
export const BANNER_X = 5.25;                   // ravan barjaka iza junaka

const COL_Z = [-11.4, -6.9, -2.3, 2.3, 6.9, 11.4];
const COL_X = 5.3;
const WALL_X = 7.7;
const FAR_Z = -15.2;
const NEAR_Z = 16.5;

export function createHall() {
  const rand = seeded(74133);
  const g = new THREE.Group();
  const flames = [];      // { mesh, speed, phase } — main.js ih treperi
  const lights = [];      // { light, base, amp, speed, phase }

  // ------------------------------------------------------------ materijali --
  const stone = M(C.stone, { roughness: 0.97 });
  const stoneD = M(C.stoneDark, { roughness: 1 });
  const stoneL = M(C.stoneLight, { roughness: 0.94 });
  const rubbleM = M(C.rubble, { roughness: 1 });
  const iron = Metal(C.blackIron, { roughness: 0.55 });
  const gold = Metal(C.gold);
  const carpetM = Cloth(C.wine);
  const carpetTrim = Cloth(C.saffron);

  // ------------------------------------------------------------------ pod --
  const floor = box(WALL_X * 2, 0.6, NEAR_Z - FAR_Z, stoneD, 0, -0.3, (NEAR_Z + FAR_Z) / 2);
  g.add(floor);

  // kamene ploče — mreža plitkih pravougaonika sa fugama između
  const slabMats = [stone, stoneL, M(0x646a76, { roughness: 0.98 })];
  for (let ix = 0; ix < 8; ix++) {
    for (let iz = 0; iz < 16; iz++) {
      const x = -WALL_X + 0.96 + ix * 1.94;
      const z = FAR_Z + 1.0 + iz * 1.98;
      const s = slabMats[(ix * 5 + iz * 3) % 3];
      const slab = box(1.86, 0.06, 1.9, s, x, 0.03, z);
      slab.receiveShadow = true;
      g.add(slab);
    }
  }

  // tepih niz lađu, sa zlatnim rubom
  g.add(box(3.6, 0.04, 27.4, carpetM, 0, 0.075, 0.6));
  g.add(box(0.16, 0.05, 27.4, carpetTrim, -1.72, 0.085, 0.6));
  g.add(box(0.16, 0.05, 27.4, carpetTrim, 1.72, 0.085, 0.6));
  // poprečne šare na tepihu
  for (let i = 0; i < 13; i++) {
    g.add(box(2.9, 0.05, 0.1, carpetTrim, 0, 0.085, -12.4 + i * 2.15));
  }

  // ------------------------------------------------------------- kolonada --
  function column(x, z) {
    const c = group([], x, 0, z);
    c.add(box(1.24, 0.28, 1.24, stoneL, 0, 0.14, 0));            // stopa
    c.add(box(1.06, 0.22, 1.06, stone, 0, 0.39, 0));
    c.add(cyl(0.40, 0.46, 5.6, stone, 0, 3.3, 0, 12));            // stablo
    // kanelure — tanke trake koje hvataju bočno svetlo
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      c.add(box(0.055, 5.2, 0.055, stoneD, Math.sin(a) * 0.41, 3.3, Math.cos(a) * 0.41));
    }
    c.add(cyl(0.50, 0.42, 0.26, stoneL, 0, 6.22, 0, 12));         // vrat kapitela
    c.add(box(1.1, 0.30, 1.1, stoneL, 0, 6.50, 0));               // kapitel
    c.add(box(1.22, 0.14, 1.22, stone, 0, 6.72, 0));
    // ugaoni listovi kapitela
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const leaf = cone(0.16, 0.3, stoneL, sx * 0.42, 6.42, sz * 0.42, 5);
      leaf.rotation.x = sz * 0.5;
      leaf.rotation.z = -sx * 0.5;
      c.add(leaf);
    }
    return c;
  }

  // luk između dva susedna stuba — klinasti kamenovi po polukrugu
  function archRib(x, z0, z1, yBase, broken) {
    const a = new THREE.Group();
    const span = (z1 - z0) / 2;
    const mz = (z0 + z1) / 2;
    const N = 9;
    const stopAt = broken ? Math.floor(N * 0.55) : N;
    for (let i = 0; i < stopAt; i++) {
      const t = (i + 0.5) / N;
      const ang = Math.PI * t;
      const vz = mz - Math.cos(ang) * span;
      const vy = yBase + Math.sin(ang) * span * 0.62;
      const v = box(0.5, 0.42, span * (Math.PI / N) * 1.15, stone, x, vy, vz);
      v.rotation.x = -ang + Math.PI / 2;
      a.add(v);
    }
    return a;
  }

  for (const sx of [-1, 1]) {
    for (let i = 0; i < COL_Z.length; i++) {
      g.add(column(sx * COL_X, COL_Z[i]));
      if (i < COL_Z.length - 1) {
        // svaki treći luk je urušen — dvorana je davno napuštena
        g.add(archRib(sx * COL_X, COL_Z[i], COL_Z[i + 1], 6.7, i === 1 || i === 4));
      }
    }
  }

  // poprečna rebra krova preko lađe — većina polomljena, ostali skeleti
  for (let i = 0; i < COL_Z.length; i++) {
    const z = COL_Z[i];
    const whole = i === 0 || i === 3;
    const rib = new THREE.Group();
    const N = 11;
    const stop = whole ? N : 4;
    for (let k = 0; k < stop; k++) {
      const t = (k + 0.5) / N;
      const ang = Math.PI * t;
      const vx = -COL_X + (1 - Math.cos(ang)) * COL_X;
      const vy = 6.75 + Math.sin(ang) * 2.5;
      const v = box(COL_X * 2 * (Math.PI / N) * 0.62, 0.34, 0.5, stoneD, vx, vy, z);
      v.rotation.z = ang - Math.PI / 2;
      rib.add(v);
      if (!whole) { // simetrični patrljak sa druge strane
        const v2 = box(COL_X * 2 * (Math.PI / N) * 0.62, 0.34, 0.5, stoneD, -vx, vy, z);
        v2.rotation.z = -ang + Math.PI / 2;
        rib.add(v2);
      }
    }
    g.add(rib);
  }

  // ---------------------------------------------------------------- zidovi --
  for (const sx of [-1, 1]) {
    const wall = new THREE.Group();
    // zid u segmentima, sa nišom iza svakog junaka
    for (let i = 0; i <= HERO_Z.length; i++) {
      const z0 = i === 0 ? FAR_Z : HERO_Z[i - 1] + 1.5;
      const z1 = i === HERO_Z.length ? NEAR_Z : HERO_Z[i] - 1.5;
      if (z1 <= z0) continue;
      wall.add(box(0.7, 9.4, z1 - z0, stone, sx * WALL_X, 4.7, (z0 + z1) / 2));
    }
    // niše: tanji zid pozadi + polukružni luk iznad
    for (const z of HERO_Z) {
      wall.add(box(0.34, 9.4, 3.0, stoneD, sx * (WALL_X + 0.18), 4.7, z));
      wall.add(box(0.7, 3.2, 3.0, stone, sx * WALL_X, 7.8, z));
      for (let k = 0; k < 7; k++) {
        const ang = Math.PI * ((k + 0.5) / 7);
        const v = box(0.66, 0.34, 3.0 * (Math.PI / 7) * 0.62, stoneL,
          sx * WALL_X, 5.9 + Math.sin(ang) * 0.95, z - Math.cos(ang) * 1.5);
        v.rotation.x = -ang + Math.PI / 2;
        wall.add(v);
      }
    }
    // horizontalni venac po celoj dužini
    wall.add(box(0.86, 0.2, NEAR_Z - FAR_Z, stoneL, sx * WALL_X, 8.9, (NEAR_Z + FAR_Z) / 2));
    wall.add(box(0.86, 0.16, NEAR_Z - FAR_Z, stoneD, sx * WALL_X, 2.6, (NEAR_Z + FAR_Z) / 2));
    // nazubljen vrh — krov je odavno pao
    for (let i = 0; i < 26; i++) {
      const z = FAR_Z + 0.6 + i * 1.22;
      const h = 0.3 + rand() * 0.95;
      wall.add(box(0.7, h, 1.1, stone, sx * WALL_X, 9.4 + h / 2, z));
    }
    g.add(wall);
  }

  // ------------------------------------------------- začelje sa rozetom ----
  const far = new THREE.Group();
  far.add(box(WALL_X * 2, 11.5, 0.8, stone, 0, 5.75, FAR_Z));
  // otvor rozete: prsten kamena + tracerija + svetla opna
  const RY = 7.0, RR = 2.55;
  far.add(torus(RR + 0.34, 0.36, stoneL, 0, RY, FAR_Z + 0.1, 8, 26));
  const paneMat = Glow(C.moon, 0.55, { transparent: true, opacity: 0.85 });
  const pane = new THREE.Mesh(new THREE.CircleGeometry(RR, 28), paneMat);
  pane.position.set(0, RY, FAR_Z + 0.42);
  far.add(pane);
  // kameni prečnici rozete
  for (let i = 0; i < 8; i++) {
    const spoke = box(RR * 2, 0.15, 0.22, stoneL, 0, RY, FAR_Z + 0.5);
    spoke.rotation.z = (i / 8) * Math.PI;
    far.add(spoke);
  }
  far.add(torus(RR * 0.52, 0.12, stoneL, 0, RY, FAR_Z + 0.5, 6, 20));
  // dva uska prozora ispod rozete
  for (const sx of [-1, 1]) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 2.6), paneMat);
    w.position.set(sx * 2.2, 3.4, FAR_Z + 0.42);
    far.add(w);
    far.add(box(1.0, 3.0, 0.24, stoneL, sx * 2.2, 3.4, FAR_Z + 0.3));
    const inner = new THREE.Mesh(new THREE.PlaneGeometry(0.66, 2.5), paneMat);
    inner.position.set(sx * 2.2, 3.4, FAR_Z + 0.44);
    far.add(inner);
  }
  g.add(far);

  // ------------------------------------- postolje sa mačem u kamenu --------
  const dais = group([], 0, 0, FAR_Z + 2.9);
  dais.add(cyl(2.5, 2.8, 0.22, stoneL, 0, 0.11, 0, 16));
  dais.add(cyl(2.1, 2.35, 0.22, stone, 0, 0.33, 0, 16));
  dais.add(cyl(1.7, 1.95, 0.22, stoneL, 0, 0.55, 0, 16));
  // napukli blok iz kojeg viri mač
  const blockM = M(0x5a606b, { roughness: 1 });
  const blk = rock(0.86, blockM, 0, 0.95, 0, 0);
  blk.scale.set(1, 0.72, 0.95);
  dais.add(blk);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 + 0.4;
    dais.add(box(0.05, 0.5, 0.05, stoneD, Math.sin(a) * 0.6, 1.05, Math.cos(a) * 0.6));
  }
  // sam mač — tup, star, ali još uspravan
  const bladeM = Metal(C.steelDark, { roughness: 0.45 });
  dais.add(box(0.17, 2.0, 0.05, bladeM, 0, 2.3, 0));
  dais.add(box(0.055, 1.9, 0.062, Metal(C.silver), 0, 2.32, 0));
  dais.add(box(0.86, 0.09, 0.11, Metal(C.brass), 0, 3.28, 0));
  dais.add(cyl(0.055, 0.05, 0.42, Hide(C.leatherDark), 0, 3.55, 0, 8));
  for (let i = 0; i < 5; i++) dais.add(torus(0.058, 0.012, Hide(C.leather), 0, 3.4 + i * 0.08, 0, 6, 10));
  const pommel = sphere(0.095, Metal(C.brass), 0, 3.8, 0, 10, 8);
  dais.add(pommel);
  dais.add(sphere(0.042, Glow(C.moon, 1.4), 0, 3.8, 0.055, 8, 7));
  g.add(dais);

  // ------------------------------------------------------------ žeravnici --
  // Stoje uz stubove, po četiri sa svake strane — jedini topao izvor svetla.
  function brazier(x, z) {
    const b = group([], x, 0, z);
    b.add(cyl(0.1, 0.14, 0.1, iron, 0, 0.05, 0, 8));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      b.add(bar([Math.sin(a) * 0.26, 0.02, Math.cos(a) * 0.26], [0, 1.0, 0], 0.035, iron));
    }
    b.add(cyl(0.34, 0.2, 0.28, iron, 0, 1.1, 0, 10));
    b.add(torus(0.345, 0.035, iron, 0, 1.23, 0, 6, 16));
    b.children[b.children.length - 1].rotation.x = Math.PI / 2;
    b.add(rivetRing(0.345, 8, 0.022, Metal(C.brass), 1.16, 1));
    // ugljevlje i plamen
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      b.add(rock(0.07, M(0x241c18, { roughness: 1 }), Math.sin(a) * 0.14, 1.2, Math.cos(a) * 0.14));
    }
    for (const [size, col, inten, dy] of [
      [0.62, 0xff6a22, 2.1, 1.5], [0.42, 0xffa63c, 2.5, 1.42], [0.26, 0xffd77e, 3.0, 1.36],
    ]) {
      const f = cone(size * 0.42, size, Glow(col, inten, { transparent: true, opacity: 0.92 }), 0, dy, 0, 7);
      flames.push({ mesh: f, speed: 8 + (x * 3 + z) % 5, phase: (x * 7 + z * 3) % 6 });
      b.add(f);
    }
    const l = new THREE.PointLight(0xff8a3c, 14, 13, 2);
    l.position.set(x, 1.6, z);
    lights.push({ light: l, base: 14, amp: 3.6, speed: 9 + (z % 4), phase: (x + z) % 6 });
    return { grp: b, light: l };
  }

  for (const sx of [-1, 1]) {
    for (const z of [-11.4, -2.3, 6.9]) {
      const { grp, light } = brazier(sx * (COL_X - 0.95), z);
      g.add(grp);
      g.add(light);
    }
  }

  // ---------------------------------------------------------------- ruševine --
  for (let i = 0; i < 26; i++) {
    const side = rand() < 0.5 ? -1 : 1;
    const x = side * (2.6 + rand() * 4.4);
    const z = FAR_Z + 2 + rand() * (NEAR_Z - FAR_Z - 4);
    const s = 0.16 + rand() * 0.42;
    const r = rock(s, rubbleM, x, s * 0.42, z);
    r.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    r.scale.y = 0.5 + rand() * 0.5;
    g.add(r);
  }
  // pali blok kolone preko tepiha
  const fallen = cyl(0.4, 0.42, 2.4, stone, 2.9, 0.42, 13.6, 12);
  fallen.rotation.set(0.06, 0.5, Math.PI / 2);
  g.add(fallen);
  g.add(box(1.05, 0.28, 1.05, stoneL, 4.3, 0.16, 14.6));

  // --------------------------------------------------------------- stepenice --
  for (let i = 0; i < 4; i++) {
    g.add(box(WALL_X * 2 - 1.2, 0.18, 0.9, stoneL, 0, -0.09 - i * 0.18, NEAR_Z - 0.6 + i * 0.9));
  }

  // ------------------------------------------------------- snopovi mesečine --
  // Prozirni konusi iz rozete i sa razvaljenog krova; ne bacaju svetlo, samo
  // daju vazduhu telo. Additive, bez upisa u dubinu.
  const shaftMat = new THREE.MeshBasicMaterial({
    color: 0x9fc0ff, transparent: true, opacity: 0.055,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false,
  });
  function shaft(x, z, len, spread, tilt, roll) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(spread * 0.28, spread, len, 12, 1, true), shaftMat);
    m.position.set(x, 9.4 - len * 0.42, z);
    m.rotation.set(tilt, 0, roll);
    return m;
  }
  g.add(shaft(0.4, FAR_Z + 5.5, 15, 3.0, 0.38, 0.06));
  g.add(shaft(-2.4, -3.5, 13, 1.9, 0.26, 0.14));
  g.add(shaft(2.9, 5.2, 13, 1.7, 0.22, -0.12));
  g.add(shaft(-1.2, 11.5, 12, 1.5, 0.2, 0.1));

  return { group: g, flames, lights };
}
