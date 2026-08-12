// src/heroes/frostwitch.js — Baba Zimoveja, zimska veštica
//
// Pogrbljena starica: trup nagnut napred oko 0.22 rad, glava izbačena i
// UVUČENA među ramena, grba na gornjem delu leđa. Silueta nije jaje već
// STEPENASTA piramida od pet zasebnih traka šala — svaka ima isturenu donju
// ivicu, opšiv, resast rub i uzdužne falde, pa se čita kao poseban komad
// tkanine. Iz nje vire koščane bose noge, kvrgav štap i vrana na ramenu.
//
// Sklop (junak gleda u +Z, stopala na y = 0):
//   R
//   ├─ noge i bosa stopala   — težina na desnoj nozi, leva savijenija
//   ├─ hipsG   — tkana suknja sa faldama i iscepanim rubom
//   ├─ torsoG  — nagnut; chestG (diše): pet traka šala, grba, kragna, pojas,
//   │            kožni kaiš preko grudi, torbica; vrat i glava; ležaj za vranu
//   ├─ armL / armR — TANKE koščane ruke, lakat i zglob su izbočene kosti
//   ├─ staffG  — kvrgav štap; leva šaka je NJEGOVO dete (osa drške = Y šake)
//   ├─ herbG   — snop suvog bilja u desnoj šaci
//   ├─ crowG   — vrana: dete trupa, nožice STOJE NA kožnom ležaju na ramenu
//   └─ pet sitnih mraznih trunki koje kruže oko nje
//
// Mraz nikad ne ide kao jedan veliki kristal (čita se kao bela strelica) —
// uvek kao gnezdo od nekoliko sitnih, okrenutih na različite strane.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh, Glow, Ghost,
  box, cyl, sphere, cone, torus, lathe, rock, crystal, bar, group,
  curve, strap, rivets, rivetRing, fringe, makeFace, makeHand, Anim, seeded,
} from '../kit.js';

export function createFrostWitch() {
  const rnd = seeded(20713);          // nasumične konstante — samo pri gradnji
  const R = new THREE.Group();
  const D = THREE.DoubleSide;

  // ---------------------------------------------------------- materijali ---
  // Noćna dvorana je osvetljena samo žeravnicima, pa je sve povučeno u tamnije
  // tonove — bela tkanina i bledi ten bi inače blještali.
  const skin = Flesh(0xa29b91);
  const skinDeep = Flesh(0x878076);
  const wrinkleM = M(0x6f6860, { flat: false, roughness: 0.94 });
  const veinM = M(0x77808d, { flat: false, roughness: 0.8 });
  const nailM = M(0xb4ab97, { roughness: 0.55 });
  const hairM = M(0xbdb7a8, { roughness: 0.96 });

  const clothDeep = Cloth(0x3f4b57, { side: D });     // najniža, najtamnija traka
  const clothGrey = Cloth(0x5f666f, { side: D });     // siva
  const clothBlue = Cloth(0x546a80, { side: D });     // bledoplava
  const clothWhite = Cloth(0x939ba3, { side: D });    // najsvetlija, uz lice
  const clothUnder = Cloth(0x333b45, { side: D });    // donja tkana suknja
  const trimM = Cloth(0x7c8894);                      // opšiv
  const seamM = Cloth(0x4b535c);                      // šavovi i falde

  const hide = Hide(0x3c2818);
  const hidePale = Hide(0x60401f);
  const boneM = M(0xc8c0a9, { roughness: 0.7 });
  const boneDim = M(0xafa793, { roughness: 0.8 });
  const woodM = Hide(C.woodDark);
  const woodPale = Hide(0x53381f);
  const ironM = Metal(0x3c4048);
  const brass = Metal(0x9c6f32);

  const iceM = Glow(C.frost, 0.30, { transparent: true, opacity: 0.80 });
  const iceM2 = Glow(C.frost, 0.20, { transparent: true, opacity: 0.66 });
  const crystalM = Glow(C.frost, 1.15, { transparent: true, opacity: 0.86 });
  const coreM = Glow(0xd8effc, 1.70, { transparent: true, opacity: 0.94 });
  const flakeM = Ghost(C.frost, 0.80, 0.52);
  const eyeGlowM = Glow(C.frost, 0.90);

  const crowM = M(0x191c21, { roughness: 0.74 });
  const crowSheen = Metal(0x2c323b, { roughness: 0.44 });
  const beakM = M(0x322d29, { roughness: 0.55 });
  const crowEyeM = Glow(C.frost, 1.20);

  const herbGreen = M(0x676a44, { roughness: 1 });
  const herbDry = M(0x7d6a3c, { roughness: 1 });

  // ============================================================= NOGE ======
  // Koščane, kvrgave, bose. Težina je na desnoj nozi — ona je pravija,
  // leva je više savijena i izbačena u stranu.
  const HIP_L = [-0.115, 0.795, 0.000], KNEE_L = [-0.142, 0.420, 0.040], ANK_L = [-0.150, 0.098, -0.014];
  const HIP_R = [0.120, 0.808, -0.010], KNEE_R = [0.126, 0.444, -0.004], ANK_R = [0.114, 0.098, 0.018];

  function makeLeg(hip, knee, ank, s) {
    const g = new THREE.Group();
    g.add(bar(hip, knee, 0.072, skin, 9, 0.052));                   // butina
    g.add(sphere(0.058, skin, knee[0], knee[1], knee[2], 10, 8));   // koleno
    const kb = sphere(0.034, skinDeep, knee[0], knee[1] + 0.006, knee[2] + 0.042, 8, 7);
    kb.scale.set(1.05, 0.8, 0.6);                                   // kvrga kolena
    g.add(kb);
    g.add(bar(knee, ank, 0.048, skin, 9, 0.037));                   // cevanica
    const calf = sphere(0.044, skin, (knee[0] + ank[0]) / 2, knee[1] - 0.092, (knee[2] + ank[2]) / 2 - 0.032, 9, 7);
    calf.scale.set(0.9, 1.5, 0.85);                                 // uvenuo list
    g.add(calf);
    g.add(sphere(0.042, skin, ank[0], ank[1], ank[2], 9, 7));       // gležanj
    g.add(sphere(0.019, skinDeep, ank[0] + s * 0.032, ank[1] + 0.006, ank[2] - 0.004, 7, 6));  // kost gležnja
    g.add(sphere(0.016, skinDeep, ank[0] - s * 0.028, ank[1] + 0.004, ank[2] - 0.006, 7, 6));
    g.add(bar([knee[0] - s * 0.026, knee[1] - 0.070, knee[2] + 0.028],
      [ank[0] - s * 0.016, ank[1] + 0.060, ank[2] + 0.026], 0.0055, veinM, 5));  // nabrekla vena
    g.add(bar([knee[0] + s * 0.020, knee[1] - 0.130, knee[2] - 0.030],
      [ank[0] + s * 0.010, ank[1] + 0.040, ank[2] - 0.024], 0.0045, veinM, 5));  // ahilova tetiva
    return g;
  }
  R.add(makeLeg(HIP_L, KNEE_L, ANK_L, -1));
  R.add(makeLeg(HIP_R, KNEE_R, ANK_R, 1));

  // bosa stopala sa dugim noktima
  function makeFoot(x, z, yaw) {
    const g = group([], x, 0, z);
    g.rotation.y = yaw;
    g.add(box(0.112, 0.030, 0.232, skinDeep, 0, 0.016, 0.020));     // đon
    g.add(box(0.104, 0.056, 0.198, skin, 0, 0.054, 0.014));         // stopalo
    const inst = sphere(0.062, skin, 0, 0.062, -0.010, 9, 8);       // oblo nadstopalo
    inst.scale.set(0.86, 0.62, 1.25);
    g.add(inst);
    const heel = sphere(0.054, skin, 0, 0.046, -0.080, 9, 7);
    heel.scale.set(1, 0.92, 0.9);
    g.add(heel);
    for (const s of [-1, 1]) {                                      // tetive po nadstopalu
      g.add(bar([s * 0.026, 0.078, -0.018], [s * 0.020, 0.058, 0.078], 0.0045, skinDeep, 5));
    }
    g.add(sphere(0.024, skinDeep, -0.042, 0.050, 0.060, 7, 6));     // starački iskrivljen palac
    const off = [-0.038, -0.008, 0.028];
    for (let i = 0; i < 3; i++) {
      const t = sphere(0.020 - i * 0.003, skin, off[i], 0.030, 0.114 - i * 0.008, 7, 6);
      t.scale.set(1.4, 0.85, 1.6);
      g.add(t);
      const n = cone(0.0105 - i * 0.0012, 0.036, nailM, off[i], 0.034, 0.148 - i * 0.008, 6);
      n.rotation.x = Math.PI / 2 - 0.22;                            // dug nokat
      g.add(n);
    }
    return g;
  }
  R.add(makeFoot(ANK_L[0], ANK_L[2], -0.16));
  R.add(makeFoot(ANK_R[0], ANK_R[2], 0.11));

  // =========================================================== KUKOVI =====
  const hipsG = group([], 0, 0, 0);
  R.add(hipsG);

  const pelvis = sphere(0.160, clothUnder, 0, 0.855, -0.004, 12, 10);
  pelvis.scale.set(1.06, 0.72, 0.86);
  hipsG.add(pelvis);

  // tkana suknja — kratka i iscepana, da se vide bose noge
  hipsG.add(lathe([[0.202, 0.442], [0.216, 0.560], [0.206, 0.700], [0.180, 0.812], [0.150, 0.885]], clothUnder, 16));
  hipsG.add(lathe([[0.192, 0.512], [0.200, 0.606], [0.186, 0.726], [0.160, 0.836]], clothGrey, 14));
  const hem = fringe(0.206, 8, clothUnder, 0.086, 0.446, 1, 0.9);
  hipsG.add(hem);
  const hemTrim = torus(0.208, 0.008, trimM, 0, 0.470, 0, 6, 22);
  hemTrim.rotation.x = Math.PI / 2;
  hipsG.add(hemTrim);
  // uzdužne falde na suknji — inače je gladak valjak
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.35;
    hipsG.add(bar([Math.sin(a) * 0.206, 0.478, Math.cos(a) * 0.206],
      [Math.sin(a) * 0.176, 0.820, Math.cos(a) * 0.176], 0.0075, seamM, 5, 0.005));
  }
  // zakrpa sa prošivom na levom kolenu suknje
  const patch = box(0.078, 0.070, 0.010, clothBlue, -0.128, 0.590, 0.164);
  patch.rotation.y = -0.66;
  hipsG.add(patch);
  for (let i = 0; i < 3; i++) {
    const p = box(0.082, 0.006, 0.008, seamM, -0.128, 0.556 + i * 0.034, 0.168);
    p.rotation.y = -0.66;
    hipsG.add(p);
  }

  // ============================================================ TRUP ======
  const torsoG = group([], 0, 0.880, 0);
  torsoG.rotation.x = 0.220;            // pogrbljen nagib napred
  R.add(torsoG);

  // Sve što je zaogrnuto tkaninom je u chestG — tako ceo umotan trup diše
  // kao jedno, bez smicanja slojeva jednog preko drugog.
  const chestG = group([], 0, 0, 0);
  torsoG.add(chestG);

  // jezgro trupa: uska donja odora koja se vidi samo u otvoru oko vrata
  chestG.add(lathe([[0.150, -0.020], [0.148, 0.100], [0.152, 0.260], [0.140, 0.380], [0.104, 0.470], [0.076, 0.522]], clothUnder, 14));

  // ------------------------------------------------ POVRŠINA TKANINE -----
  // Najveći poluprečnik šala na datoj visini. Kaiš, privesci, torbica i mraz
  // postavljaju se PO ovoj krivoj — ništa ne lebdi ispred platna ni ne utone.
  const RPROF = [
    [-0.100, 0.326], [-0.020, 0.296], [0.100, 0.314], [0.170, 0.284],
    [0.230, 0.298], [0.300, 0.260], [0.344, 0.272], [0.400, 0.234],
    [0.428, 0.224], [0.470, 0.180], [0.500, 0.136], [0.560, 0.100],
  ];
  function bandR(y) {
    if (y <= RPROF[0][0]) return RPROF[0][1];
    for (let i = 1; i < RPROF.length; i++) {
      if (y <= RPROF[i][0]) {
        const a = RPROF[i - 1], b = RPROF[i];
        return a[1] + (b[1] - a[1]) * ((y - a[0]) / (b[0] - a[0]));
      }
    }
    return RPROF[RPROF.length - 1][1];
  }
  /** Tačka na spoljnoj tkanini za dato (x, y); k > 1 = malo iznad platna. */
  function onSurf(x, y, k = 1.02) {
    const r = bandR(y) * k;
    const z2 = r * r - x * x;
    return [x, y, z2 <= 0.0009 ? 0.03 : Math.sqrt(z2)];
  }

  // -------------------------------------------------- SLOJEVITI ŠALOVI ----
  // Pet KRATKIH traka naslaganih po visini. Donja ivica svake je isturena
  // (kao crep na krovu) i nosi opšiv i rese, pa se rub svakog komada tkanine
  // vidi kao zaseban prelom u silueti, a ne kao glatko jaje.
  const shawlLayers = [];
  const shawlFringes = [];
  function shawlBand(o) {
    const g = group([], o.dx || 0, 0, o.dz || 0);
    g.rotation.z = o.rz || 0;
    g.rotation.x = o.rx || 0;
    const y0 = o.y0, y1 = o.y1, rb = o.rb, rt = o.rt, lip = o.lip;
    g.add(lathe([
      [rb * 0.86, y0 - 0.018],
      [lip, y0 + 0.004],
      [lip - 0.008, y0 + 0.030],
      [rb, y0 + 0.072],
      [(rb + rt) / 2 + 0.004, (y0 + y1) / 2 + 0.02],
      [rt, y1 - 0.012],
      [rt * 0.93, y1],
    ], o.mat, 16));
    // resast rub visi sa isturene ivice
    const f = fringe(lip - 0.006, o.frn, o.mat, o.frl, y0 - 0.004, 1, 0.9);
    g.add(f);
    // opšiv po ivici
    const tr = torus(lip + 0.004, 0.0075, o.trim || trimM, 0, y0 + 0.012, 0, 6, 24);
    tr.rotation.x = Math.PI / 2;
    g.add(tr);
    // uzdužne falde po traci
    for (let i = 0; i < o.pl; i++) {
      const a = (i / o.pl) * Math.PI * 2 + (o.ph || 0);
      const rA = lip * 0.98, rB = rt * 1.02;
      g.add(bar([Math.sin(a) * rA, y0 + 0.034, Math.cos(a) * rA],
        [Math.sin(a) * rB, y1 - 0.024, Math.cos(a) * rB], 0.0080, seamM, 5, 0.0050));
    }
    chestG.add(g);
    shawlLayers.push(g);
    shawlFringes.push(f);
    return g;
  }
  shawlBand({ mat: clothDeep, y0: -0.100, y1: 0.145, rb: 0.294, rt: 0.290, lip: 0.326, frn: 10, frl: 0.074, pl: 5, ph: 0.20, dx: 0.005, rz: 0.030, rx: 0.014 });
  shawlBand({ mat: clothGrey, y0: 0.100, y1: 0.272, rb: 0.282, rt: 0.272, lip: 0.314, frn: 9, frl: 0.064, pl: 5, ph: 0.55, dx: -0.009, rz: -0.042, rx: -0.020 });
  shawlBand({ mat: clothBlue, y0: 0.230, y1: 0.386, rb: 0.262, rt: 0.246, lip: 0.298, frn: 8, frl: 0.058, pl: 4, ph: 0.95, dx: 0.008, rz: 0.048, rx: 0.022 });
  shawlBand({ mat: clothDeep, y0: 0.344, y1: 0.462, rb: 0.238, rt: 0.208, lip: 0.272, frn: 7, frl: 0.050, pl: 4, ph: 1.40, dx: -0.007, rz: -0.036, rx: -0.016 });
  shawlBand({ mat: clothWhite, y0: 0.428, y1: 0.500, rb: 0.188, rt: 0.130, lip: 0.224, frn: 7, frl: 0.042, pl: 3, ph: 1.90, dx: 0.004, rz: 0.026, rx: 0.014 });

  // GRBA — izbočina koja se čita KROZ tkaninu na gornjem delu leđa, sa
  // prekrivkom i nizom pršljenova koji se ocrtavaju pod platnom.
  const hump = sphere(0.166, clothGrey, 0.012, 0.374, -0.176, 13, 11);
  hump.scale.set(1.10, 0.98, 0.92);
  chestG.add(hump);
  const humpCap = sphere(0.140, clothDeep, 0.014, 0.416, -0.186, 12, 10);
  humpCap.scale.set(1.06, 0.70, 0.86);                                // prebačen šal preko grbe
  chestG.add(humpCap);
  const humpTrim = torus(0.132, 0.0085, trimM, 0.014, 0.376, -0.196, 6, 20);
  humpTrim.rotation.x = Math.PI / 2 - 0.42;
  chestG.add(humpTrim);
  const blade = sphere(0.098, clothGrey, -0.132, 0.312, -0.192, 10, 8);
  blade.scale.set(1.0, 1.05, 0.72);                                   // lopatica niže, s druge strane
  chestG.add(blade);
  for (let i = 0; i < 3; i++) {                                       // pršljenovi pod platnom
    chestG.add(sphere(0.020 - i * 0.0025, clothDeep, 0.008, 0.262 + i * 0.062, -0.276 - i * 0.006, 7, 6));
  }

  // podignuta kragna sa potiljka — vrat je uvučen, glava vire iz tkanine
  const backCollar = sphere(0.148, clothBlue, 0.004, 0.492, -0.084, 12, 10);
  backCollar.scale.set(1.00, 0.66, 0.78);
  chestG.add(backCollar);
  const bcTrim = torus(0.126, 0.0095, trimM, 0.004, 0.552, -0.072, 6, 20);
  bcTrim.rotation.x = Math.PI / 2 - 0.34;
  chestG.add(bcTrim);
  for (let i = 0; i < 3; i++) {                                       // šavovi kragne
    const a = -0.5 + i * 0.5;
    chestG.add(bar([Math.sin(a) * 0.120, 0.436, -0.084 - Math.cos(a) * 0.060],
      [Math.sin(a) * 0.096, 0.540, -0.078 - Math.cos(a) * 0.048], 0.006, seamM, 5, 0.004));
  }

  // ------------------------------------- POJAS PREKO SPOLJNOG ŠALA ------
  // Kaiš je stegnut PREKO najniže trake, pa se kopča, zakivci, koščani
  // privesci i torbica vide izvan tkanine, među resama.
  chestG.add(cyl(0.310, 0.316, 0.052, hide, 0, 0.030, 0, 16));
  chestG.add(box(0.062, 0.050, 0.024, brass, 0, 0.028, 0.312));       // kopča
  chestG.add(box(0.038, 0.030, 0.014, hide, 0, 0.028, 0.326));        // jezičak
  chestG.add(rivetRing(0.316, 6, 0.0105, brass, 0.054, 1, 0.3));
  chestG.add(strap([[-0.190, 0.020, 0.252], [-0.208, -0.070, 0.256], [-0.192, -0.140, 0.262]], 0.013, hide));
  chestG.add(box(0.028, 0.024, 0.010, brass, -0.192, -0.152, 0.264));

  // ---------------------------------- KOŽNI KAIŠ PREKO GRUDI ------------
  // Ono što je pre bila bleda dijagonalna traka sada je prepoznatljiv kaiš:
  // tamna koža po tkanini, sa zakivcima po spoljnoj strani, kopčom na
  // grudima i dva privezaka.
  const SASH = [
    onSurf(-0.170, 0.430), onSurf(-0.132, 0.348), onSurf(-0.052, 0.262),
    onSurf(0.040, 0.180), onSurf(0.120, 0.104), onSurf(0.186, 0.046),
  ];
  chestG.add(strap(SASH, 0.017, hide));
  for (let i = 1; i < SASH.length; i++) {
    const a = onSurf(SASH[i - 1][0], SASH[i - 1][1], 1.085);
    const b = onSurf(SASH[i][0], SASH[i][1], 1.085);
    chestG.add(rivets(a, b, 2, 0.0068, brass));
  }
  {
    const bp = onSurf(0.040, 0.180, 1.055);
    const yaw = Math.atan2(bp[0], bp[2]);
    const plate = box(0.056, 0.062, 0.014, hidePale, bp[0], bp[1], bp[2]);
    plate.rotation.y = yaw;
    chestG.add(plate);
    const ring = torus(0.026, 0.0065, brass, bp[0], bp[1], bp[2] + 0.008, 6, 16);
    ring.rotation.y = yaw;
    chestG.add(ring);
    chestG.add(sphere(0.010, brass, bp[0], bp[1], bp[2] + 0.014, 7, 6));
    // dva privezaka o kaišu
    for (const [dx, len, kind] of [[-0.052, 0.086, 0], [0.048, 0.062, 1]]) {
      const q = onSurf(0.040 + dx, 0.164, 1.05);
      chestG.add(bar([q[0], q[1], q[2]], [q[0], q[1] - len, q[2]], 0.0040, hidePale, 5));
      if (kind === 0) chestG.add(cyl(0.009, 0.012, 0.042, boneM, q[0], q[1] - len - 0.021, q[2], 7));
      else chestG.add(sphere(0.016, boneDim, q[0], q[1] - len - 0.014, q[2], 8, 6));
    }
  }
  // brošna kopča na levom ramenu drži gornji kraj kaiša
  {
    const bq = onSurf(-0.176, 0.436, 1.04);
    const yaw = Math.atan2(bq[0], bq[2]);
    const disc = sphere(0.029, brass, bq[0], bq[1], bq[2], 10, 8);
    disc.scale.set(1, 1, 0.36);
    disc.rotation.y = yaw;
    chestG.add(disc);
    const ring = torus(0.030, 0.0058, brass, bq[0], bq[1], bq[2], 6, 16);
    ring.rotation.y = yaw;
    chestG.add(ring);
  }

  // koščani privesci o pojasu — vise među resama najniže trake
  for (const [ang, len, kind] of [[-0.52, 0.128, 0], [0.44, 0.170, 1], [1.22, 0.100, 2]]) {
    const rr0 = bandR(0.010) * 1.05;
    const cx = Math.sin(ang) * rr0, cz = Math.cos(ang) * rr0, y0 = 0.010;
    chestG.add(bar([cx, y0, cz], [cx, y0 - len, cz], 0.0045, hidePale, 5));
    if (kind === 0) chestG.add(cyl(0.010, 0.013, 0.048, boneM, cx, y0 - len - 0.024, cz, 7));
    else if (kind === 1) {
      const b = box(0.018, 0.044, 0.010, boneDim, cx, y0 - len - 0.022, cz);
      b.rotation.z = 0.18;
      chestG.add(b);
    } else {
      for (let i = 0; i < 3; i++) {
        chestG.add(crystal(0.008, iceM2, cx + (i - 1) * 0.010, y0 - len - 0.014 - (i % 2) * 0.008, cz + (i - 1) * 0.006));
      }
    }
  }

  // torbica sa suvim biljem, obešena o pojas na desnom kuku
  const pouch = group([], 0.248, -0.132, 0.216);
  pouch.rotation.set(0.10, 0.86, 0.06);        // prednja strana gleda od tela
  pouch.add(box(0.094, 0.100, 0.056, hidePale, 0, 0, 0));
  pouch.add(box(0.098, 0.028, 0.060, hide, 0, 0.050, 0));            // poklopac
  pouch.add(box(0.034, 0.036, 0.012, hide, 0, 0.038, 0.032));        // jezičak
  pouch.add(box(0.018, 0.013, 0.008, brass, 0, 0.024, 0.034));       // kopča
  pouch.add(box(0.102, 0.008, 0.058, seamM, 0, -0.048, 0));          // šav po dnu
  pouch.add(box(0.008, 0.098, 0.060, seamM, 0.048, 0, 0));           // bočni šav
  for (let i = 0; i < 2; i++) {                                      // suvo bilje viri
    const a = -0.22 + i * 0.44;
    pouch.add(bar([Math.sin(a) * 0.022, 0.054, 0.014],
      [Math.sin(a) * 0.050, 0.124 + i * 0.018, 0.030], 0.0038, herbDry, 5));
    pouch.add(box(0.014, 0.020, 0.004, i % 2 ? herbGreen : herbDry,
      Math.sin(a) * 0.046, 0.108 + i * 0.014, 0.028));
  }
  chestG.add(pouch);
  {   // remen torbice ide do pojasa, da ne visi u vazduhu
    const a = onSurf(0.238, 0.038, 1.06), b = onSurf(0.252, -0.062, 1.07);
    chestG.add(bar([a[0], a[1], a[2]], [b[0], b[1], b[2]], 0.0085, hide, 6));
    chestG.add(bar([b[0], b[1], b[2]], [0.248, -0.086, 0.216], 0.0080, hide, 6));
  }

  // ključne kosti i ramena — desno je više od levog; šal ih prekriva, pa se
  // asimetrija čita kroz nagib gornje ivice tkanine
  const SH_L = [-0.175, 0.385, 0.000];
  const SH_R = [0.185, 0.435, -0.005];
  torsoG.add(bar([-0.026, 0.446, 0.088], [SH_L[0] + 0.030, 0.412, 0.052], 0.012, skin, 6, 0.009));
  torsoG.add(bar([0.026, 0.454, 0.088], [SH_R[0] - 0.030, 0.462, 0.048], 0.012, skin, 6, 0.009));
  const shL = sphere(0.060, clothDeep, SH_L[0], SH_L[1], SH_L[2], 10, 8);
  shL.scale.set(1, 0.9, 0.96);
  torsoG.add(shL);
  const shR = sphere(0.062, clothDeep, SH_R[0], SH_R[1], SH_R[2], 10, 8);
  shR.scale.set(1, 0.9, 0.96);
  torsoG.add(shR);

  // KOŽNI LEŽAJ ZA VRANU na desnom ramenu — ravna gornja površina na koju
  // nožice stvarno staju (gore je y = 0.497 u koordinatama trupa)
  const perchG = group([], 0.192, 0, -0.010);
  torsoG.add(perchG);
  perchG.add(cyl(0.080, 0.092, 0.030, hide, 0, 0.482, 0, 12));
  const perchRim = torus(0.086, 0.010, hidePale, 0, 0.472, 0, 6, 18);
  perchRim.rotation.x = Math.PI / 2;
  perchG.add(perchRim);
  for (let i = 0; i < 3; i++) {                     // prošiv po ležaju
    perchG.add(bar([-0.062 + i * 0.062, 0.498, -0.058], [-0.054 + i * 0.062, 0.498, 0.058], 0.0035, seamM, 5));
  }
  perchG.add(box(0.030, 0.012, 0.026, hidePale, -0.050, 0.492, 0.046));   // izlizana ivica

  // vrat — tanak, izbačen napred, sa tetivom i podvoljkom
  torsoG.add(bar([0, 0.436, 0.046], [0, 0.552, 0.128], 0.042, skin, 10, 0.036));
  torsoG.add(bar([-0.026, 0.442, 0.070], [-0.014, 0.538, 0.140], 0.0065, skin, 5));
  const wattle = sphere(0.036, skin, 0, 0.506, 0.136, 9, 7);
  wattle.scale.set(0.9, 0.72, 0.7);
  torsoG.add(wattle);
  const neckW = torus(0.042, 0.0045, wrinkleM, 0, 0.482, 0.082, 5, 14);
  neckW.rotation.x = Math.PI / 2 - 0.5;
  torsoG.add(neckW);

  // dva kraja šala vise sa leve strane i sa grbe — njišu se u talasu
  const shawlTails = [];
  function tail(px, py, pz, rz, w, h, mat) {
    const g = group([], px, py, pz);
    g.rotation.z = rz;
    // tri komada tkanine sa preklopom, ne jedna ravna daska
    g.add(box(w, h * 0.48, 0.024, mat, 0, -h * 0.24, 0));
    const mid = box(w * 0.88, h * 0.40, 0.020, mat, 0.006, -h * 0.62, 0.008);
    mid.rotation.z = -0.10;
    mid.rotation.x = 0.06;
    g.add(mid);
    const low = box(w * 0.72, h * 0.26, 0.018, mat, -0.005, -h * 0.90, 0.016);
    low.rotation.z = 0.15;
    g.add(low);
    g.add(box(w * 1.03, 0.012, 0.028, trimM, 0, -h * 0.02, 0.002));        // opšiv gore
    g.add(box(w * 0.74, 0.012, 0.022, trimM, -0.005, -h * 1.02, 0.016));   // opšiv dole
    g.add(fringe(w * 0.40, 4, mat, 0.042, -h * 1.03, 0.5, 0.7));
    torsoG.add(g);
    shawlTails.push(g);
    return g;
  }
  tail(-0.256, 0.344, -0.146, 0.14, 0.084, 0.238, clothBlue);
  tail(0.176, 0.318, -0.256, -0.12, 0.070, 0.272, clothGrey);

  // ------------------------------------------- MRAZ RASTE PO NJOJ --------
  // Ne jedan veliki kristal, već gnezda sitnih igala inja — na rubu šala,
  // na ramenu, na marami i na štapu, svako okrenuto na svoju stranu.
  const frostBits = [];
  function frostNest(parent, p, n, r, mat, spread = 0.016) {
    for (let i = 0; i < n; i++) {
      const c = crystal(r * (0.55 + rnd() * 0.75), mat,
        p[0] + (rnd() - 0.5) * 2 * spread,
        p[1] + (rnd() - 0.5) * 1.6 * spread,
        p[2] + (rnd() - 0.5) * 1.4 * spread);
      c.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
      c.scale.set(0.72, 1.00 + rnd() * 0.40, 0.72);
      parent.add(c);
      frostBits.push(c);
    }
  }
  frostNest(chestG, onSurf(-0.148, 0.016, 1.02), 3, 0.0080, iceM);
  frostNest(chestG, onSurf(0.196, 0.126, 1.02), 3, 0.0075, iceM2);
  frostNest(chestG, onSurf(0.062, 0.256, 1.02), 3, 0.0070, iceM);
  frostNest(chestG, onSurf(-0.185, 0.428, 1.02), 3, 0.0078, iceM);
  frostNest(chestG, [-0.058, 0.446, -0.298], 3, 0.0075, iceM2, 0.018);
  frostNest(chestG, [0.234, 0.408, 0.050], 3, 0.0070, iceM2);

  // ============================================================ GLAVA =====
  // Niska i izbačena napred: teme je tek malo iznad ramena, a brada je uz
  // podignutu kragnu — tako se pogrbljenost vidi i sa lica.
  const headG = group([], 0, 0.588, 0.135);
  headG.rotation.x = -0.130;             // lice ostaje skoro vodoravno
  headG.rotation.y = 0.060;
  torsoG.add(headG);

  const FR = 0.108;
  const face = makeFace({
    skin,
    r: FR,
    eye: 0x241f1b,
    brow: 0xbdb7a8,
    browAngle: 0.22,
    eyeSize: 0.0165,
    eyeSpread: 0.0455,
    eyeZ: FR * 0.76,                    // duboko upale oči
    mouth: 'open',
    mouthY: -0.058,
    noseLen: FR * 0.30,
    noseWide: 0.62,
    wide: 0.94, tall: 1.02, deep: 0.99,
  });
  headG.add(face.group);
  // jedno oko bledo svetli, drugo ostaje tamno i lukavo — ali su OBA
  // istog oblika i na istoj visini
  face.irisL.material = eyeGlowM;
  face.browR.rotation.z += 0.10;         // jedna obrva podignuta — lukav izraz
  // uvučene očne duplje — tanak obod, ne naočare
  for (const s of [-1, 1]) headG.add(torus(0.021, 0.0035, wrinkleM, s * 0.0455, 0.006, 0.092, 5, 12));

  // KUKAST NOS — koren je nos iz makeFace, na njega se nastavlja TANAK
  // savijen vrh; debeo pramen bi se čitao kao surla
  face.nose.scale.set(0.66, 1.12, 1.24);
  headG.add(curve([0, 0.026, 0.060], [0.001, -0.048, 0.094], [0, -0.006, 0.032], skinDeep, 0.0145, 0.0075, 4));
  headG.add(sphere(0.0060, wrinkleM, -0.011, -0.040, 0.092, 6, 5));   // nozdrve
  headG.add(sphere(0.0060, wrinkleM, 0.011, -0.040, 0.092, 6, 5));
  headG.add(sphere(0.0070, skinDeep, 0.003, -0.050, 0.093, 6, 5));    // kvržica na vrhu

  // upali obrazi: svetla jagodica i tamna udubina pod njom
  for (const s of [-1, 1]) {
    const cb = sphere(0.026, skin, s * 0.062, -0.006, 0.070, 8, 7);
    cb.scale.set(1.2, 0.6, 0.7);
    headG.add(cb);
    const holl = sphere(0.030, wrinkleM, s * 0.058, -0.050, 0.062, 8, 7);
    holl.scale.set(1.0, 1.1, 0.30);
    headG.add(holl);
  }

  // BEZUBI OSMEH: razvučena tamna usta, uvučena gornja usna, jedan beo zub
  face.mouth.scale.set(1.30, 1.05, 1);
  face.mouth.rotation.z = 0.10;
  face.mouth.position.z = 0.086;        // makeFace ih ostavlja iza površine vilice
  headG.add(box(0.0090, 0.014, 0.008, boneM, 0.012, -0.052, 0.090));
  headG.add(box(0.040, 0.007, 0.008, wrinkleM, 0, -0.040, 0.094));
  headG.add(bar([-0.029, -0.030, 0.092], [-0.040, -0.068, 0.070], 0.0035, wrinkleM, 5));
  headG.add(bar([0.029, -0.030, 0.092], [0.040, -0.068, 0.070], 0.0035, wrinkleM, 5));
  // šiljata brada sa bradavicom i jednom dlakom
  const chin = cone(0.030, 0.048, skin, 0, -0.098, 0.062, 8);
  chin.rotation.x = 2.9;
  headG.add(chin);
  headG.add(sphere(0.008, skinDeep, 0.022, -0.086, 0.074, 6, 5));
  headG.add(bar([0.022, -0.086, 0.078], [0.031, -0.106, 0.092], 0.0022, hairM, 4));

  // DUBOKE BORE — tanke tamnije trake preko čela i obraza
  for (const [x, y, z, w, rz] of [[-0.050, 0.070, 0.082, 0.092, 0.05], [-0.046, 0.050, 0.092, 0.086, -0.04]]) {
    const b = box(w, 0.0055, 0.0055, wrinkleM, x + w / 2, y, z);
    b.rotation.z = rz;
    b.rotation.x = -0.35;
    headG.add(b);
  }
  headG.add(box(0.020, 0.005, 0.006, wrinkleM, -0.004, 0.030, 0.100));  // brazda na korenu nosa
  for (const s of [-1, 1]) {
    const b = box(0.040, 0.0045, 0.005, wrinkleM, s * 0.062, -0.032, 0.076);
    b.rotation.z = s * 0.5;
    b.rotation.y = -s * 0.5;
    headG.add(b);
  }

  // ------------------------------------------------- RETKA BELA KOSA -----
  // Tanki pramenovi koji padaju NIZ SLEPOOČNICE i za vilicu, nikad preko
  // nosa — debeo pramen preko lica se čita kao surla.
  const hairG = group([], 0, 0, 0);
  headG.add(hairG);
  for (const [a, b, bl] of [
    [[-0.098, 0.040, 0.022], [-0.104, -0.132, 0.012], [-0.020, -0.026, -0.016]],
    [[-0.088, 0.048, 0.048], [-0.098, -0.158, 0.024], [-0.016, -0.032, -0.012]],
    [[-0.076, 0.036, -0.062], [-0.106, -0.176, -0.052], [-0.022, -0.036, -0.018]],
    [[-0.102, 0.024, -0.020], [-0.118, -0.196, -0.014], [-0.026, -0.042, -0.014]],
    [[0.090, 0.046, 0.040], [0.102, -0.148, 0.018], [0.018, -0.030, -0.014]],
    [[0.100, 0.036, 0.012], [0.112, -0.180, 0.004], [0.024, -0.038, -0.016]],
    [[0.080, 0.034, -0.058], [0.108, -0.166, -0.048], [0.020, -0.034, -0.020]],
    [[0.040, 0.018, -0.098], [0.050, -0.206, -0.094], [0.010, -0.046, -0.028]],
    [[-0.036, 0.016, -0.100], [-0.046, -0.188, -0.096], [-0.010, -0.042, -0.030]],
  ]) hairG.add(curve(a, b, bl, hairM, 0.0032, 0.0011, 3));
  for (const s of [-1, 1]) {   // dve kratke vlasi ispod ruba marame
    hairG.add(bar([s * 0.048, 0.062, 0.072], [s * 0.070, 0.026, 0.084], 0.0026, hairM, 4));
  }

  // ----------------------------------------------- MARAMA PREKO GLAVE ----
  // Nije glatka kaciga: rub je preklopljen, po kapi idu zrakaste falde i
  // dve zgužvane nabreknine.
  const scarfG = group([], 0, 0.030, -0.020);
  scarfG.rotation.x = -0.220;
  headG.add(scarfG);
  scarfG.add(lathe([[0.114, 0.014], [0.120, 0.054], [0.106, 0.096], [0.064, 0.126], [0.020, 0.138]], clothBlue, 16));
  const rim = torus(0.113, 0.015, clothGrey, 0, 0.018, 0, 6, 22);      // preklopljen rub
  rim.rotation.x = Math.PI / 2;
  scarfG.add(rim);
  const band = torus(0.108, 0.0095, clothWhite, 0, 0.056, 0.004, 6, 22);
  band.rotation.x = Math.PI / 2 - 0.10;
  scarfG.add(band);
  for (let i = 0; i < 6; i++) {                                        // zrakaste falde
    const a = (i / 6) * Math.PI * 2 + 0.25;
    scarfG.add(curve([Math.sin(a) * 0.112, 0.030, Math.cos(a) * 0.112],
      [Math.sin(a) * 0.036, 0.130, Math.cos(a) * 0.036],
      [Math.sin(a) * 0.014, 0.010, Math.cos(a) * 0.014], clothGrey, 0.0060, 0.0035, 2));
  }
  const crease1 = sphere(0.042, clothBlue, -0.054, 0.074, 0.042, 8, 7);
  crease1.scale.set(1, 0.46, 0.80);
  scarfG.add(crease1);
  const crease2 = sphere(0.038, clothBlue, 0.058, 0.086, -0.028, 8, 7);
  crease2.scale.set(0.9, 0.42, 0.86);
  scarfG.add(crease2);
  scarfG.add(fringe(0.114, 4, clothBlue, 0.044, 0.012, 1, 0.7));
  scarfG.add(sphere(0.030, clothWhite, 0, 0.006, -0.104, 9, 7));       // čvor na potiljku
  const kn1 = group([], -0.032, -0.004, -0.104);
  kn1.add(box(0.044, 0.088, 0.016, clothBlue, 0, -0.044, 0));
  const kn1b = box(0.038, 0.070, 0.014, clothBlue, 0.004, -0.114, 0.006);
  kn1b.rotation.z = -0.12;
  kn1.add(kn1b);
  kn1.add(box(0.042, 0.010, 0.020, trimM, 0.004, -0.150, 0.008));
  scarfG.add(kn1);
  const kn2 = group([], 0.030, -0.006, -0.100);
  kn2.rotation.z = -0.16;
  kn2.add(box(0.040, 0.066, 0.014, clothWhite, 0, -0.033, 0));
  kn2.add(box(0.034, 0.052, 0.012, clothWhite, -0.004, -0.088, 0.006));
  kn2.add(box(0.036, 0.009, 0.016, trimM, -0.004, -0.116, 0.008));
  scarfG.add(kn2);
  shawlTails.push(kn1, kn2);
  frostNest(scarfG, [0.109, 0.058, 0.050], 3, 0.0065, iceM2, 0.013);
  frostNest(scarfG, [-0.1055, 0.084, -0.030], 3, 0.0060, iceM2, 0.013);

  // ============================================================ ŠTAP =====
  // Kvrgav, u nekoliko prelomljenih segmenata; račvast vrh drži veliki
  // ledeni kristal, oko drške je namotana vrpca sa koščanim priveskom.
  const staffG = group([], -0.305, 0, 0.145);
  R.add(staffG);
  const S = [
    [0.056, 0.014, 0.030],
    [0.030, 0.278, -0.006],
    [0.058, 0.548, 0.022],
    [0.020, 0.812, -0.010],
    [0.048, 1.070, 0.016],
    [0.025, 1.312, 0.000],
    [0.025, 1.500, -0.006],
  ];
  const GRIP = [0.029, 1.270, 0.003];     // tačka hvata na dršci
  const rr = [0.030, 0.028, 0.026, 0.024, 0.022, 0.019, 0.017];
  for (let i = 1; i < S.length; i++) {
    staffG.add(bar(S[i - 1], S[i], rr[i - 1], woodM, 7, rr[i]));
    if (i < S.length - 1) {
      const k = sphere(rr[i] * 1.55, woodPale, S[i][0], S[i][1], S[i][2], 8, 7);
      k.scale.set(1.1, 0.75, 1.05);
      k.rotation.y = rnd() * 3;
      staffG.add(k);
    }
  }
  staffG.add(cyl(0.028, 0.033, 0.056, ironM, S[0][0], 0.026, S[0][2], 9));       // okov o zemlju
  const burl = rock(0.026, woodPale, 0.072, 0.404, 0.014, 0);
  burl.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
  burl.scale.set(1, 0.7, 0.8);
  staffG.add(burl);
  staffG.add(curve([0.050, 0.560, 0.022], [0.132, 0.648, 0.064], [0.032, 0.012, 0.020], woodM, 0.011, 0.004, 2));
  // vrpca namotana oko drške
  {
    let prev = null;
    for (let i = 0; i <= 4; i++) {
      const t = i / 4;
      const a = t * Math.PI * 3.2;
      const p = [0.036 + Math.cos(a) * 0.030, 0.902 + 0.292 * t, Math.sin(a) * 0.030];
      if (prev) staffG.add(bar(prev, p, 0.0065, hidePale, 5));
      prev = p;
    }
  }
  for (const [cx, cy, cz, len] of [[0.062, 1.098, 0.034, 0.066]]) {
    staffG.add(bar([cx, cy, cz], [cx, cy - len, cz], 0.0040, hidePale, 5));
    staffG.add(cyl(0.010, 0.013, 0.046, boneM, cx, cy - len - 0.023, cz, 7));
  }
  for (const yy of [1.212]) {
    const t = torus(0.026, 0.006, ironM, 0.031, yy, 0.000, 6, 16);
    t.rotation.x = Math.PI / 2;
    staffG.add(t);
  }
  // RAČVAST VRH i veliki ledeni kristal koji pulsira
  staffG.add(curve([0.025, 1.500, -0.006], [-0.058, 1.604, 0.010], [-0.038, 0.030, 0.006], woodM, 0.016, 0.006, 2));
  staffG.add(curve([0.025, 1.500, -0.006], [0.110, 1.600, 0.008], [0.042, 0.028, 0.004], woodM, 0.016, 0.006, 2));
  staffG.add(curve([0.025, 1.500, -0.006], [0.028, 1.584, -0.064], [0.004, 0.026, -0.026], woodM, 0.013, 0.005, 2));
  const bigC = crystal(0.066, crystalM, 0.026, 1.566, 0.000);
  bigC.scale.set(0.78, 1.14, 0.78);
  staffG.add(bigC);
  staffG.add(crystal(0.028, coreM, 0.026, 1.566, 0.000));
  frostNest(staffG, [0.092, 1.562, 0.011], 3, 0.0078, iceM, 0.009);
  frostNest(staffG, [-0.041, 1.572, 0.013], 3, 0.0070, iceM2, 0.009);
  frostNest(staffG, [0.040, 1.372, 0.011], 3, 0.0065, iceM2, 0.009);

  // leva šaka — DETE ŠTAPA, jer je osa drške Y osa šake
  const handL = makeHand({ skin, s: 0.80, pose: 'grip', side: -1 });
  handL.position.set(GRIP[0], GRIP[1], GRIP[2]);
  handL.rotation.set(0.14, -Math.PI / 2, 0.20);
  staffG.add(handL);
  {
    const P = 0.052 * 0.80;             // dugi nokti preko drške
    for (const y of [P * 0.72, P * 0.16]) {
      const n = cone(0.0070, 0.024, nailM, -P * 0.86, y, P * 0.58, 6);
      n.rotation.x = Math.PI / 2;
      handL.add(n);
    }
  }

  // ============================================================= RUKE =====
  // TANKE i koščane, kako starici i priliči: nadlaktica i podlaktica su
  // svedene, a lakat i zglob su izbočene kosti.
  const W_SH_L = [-0.175, 1.256, 0.084];
  const W_EL_L = [-0.345, 1.055, 0.075];
  const W_HA_L = [-0.276, 1.270, 0.148];
  const W_SH_R = [0.185, 1.303, 0.095];
  const W_EL_R = [0.345, 1.100, 0.085];
  const W_HA_R = [0.278, 0.985, 0.268];

  function makeArm(sh, el, ha, s) {
    const g = new THREE.Group();
    const m = [sh[0] + (el[0] - sh[0]) * 0.58, sh[1] + (el[1] - sh[1]) * 0.58, sh[2] + (el[2] - sh[2]) * 0.58];
    g.add(bar(sh, m, 0.052, clothGrey, 9, 0.040));                    // rukav
    const cuff = sphere(0.042, clothDeep, m[0], m[1], m[2], 9, 7);
    cuff.scale.set(1.06, 0.58, 1.06);
    g.add(cuff);
    g.add(bar([m[0] - s * 0.030, m[1] + 0.010, m[2]], [m[0] + s * 0.030, m[1] - 0.006, m[2]], 0.0045, trimM, 5));  // opšiv rukava
    g.add(bar(sh, el, 0.029, skin, 9, 0.024));                        // nadlaktica
    g.add(sphere(0.031, skin, el[0], el[1], el[2], 10, 8));            // lakat
    g.add(sphere(0.019, skinDeep, el[0] + s * 0.014, el[1] - 0.008, el[2] - 0.026, 7, 6));   // koščani vrh lakta
    g.add(bar(el, ha, 0.023, skin, 9, 0.018));                        // podlaktica
    g.add(sphere(0.021, skin, ha[0], ha[1], ha[2], 9, 7));             // zglob
    g.add(sphere(0.011, skinDeep, ha[0] + s * 0.016, ha[1] + 0.004, ha[2] - 0.008, 7, 6));   // izbočena kost zgloba
    g.add(sphere(0.009, skinDeep, ha[0] - s * 0.014, ha[1] - 0.002, ha[2] - 0.010, 7, 6));
    g.add(bar([el[0] + s * 0.012, el[1] - 0.010, el[2] + 0.020],
      [ha[0] + s * 0.008, ha[1] + 0.010, ha[2] + 0.016], 0.0048, veinM, 5));                 // nabrekla vena
    g.add(bar([el[0] - s * 0.010, el[1] - 0.016, el[2] - 0.014],
      [ha[0] - s * 0.006, ha[1] + 0.014, ha[2] - 0.012], 0.0040, veinM, 5));                 // tetiva
    const b = [el[0] + (ha[0] - el[0]) * 0.78, el[1] + (ha[1] - el[1]) * 0.78, el[2] + (ha[2] - el[2]) * 0.78];
    g.add(sphere(0.026, hidePale, b[0], b[1], b[2], 8, 6));            // narukvica od vrpce
    g.add(sphere(0.013, boneDim, b[0], b[1] - 0.020, b[2] + 0.010, 7, 6));  // koščani privezak na narukvici
    return g;
  }
  R.add(makeArm(W_SH_L, W_EL_L, W_HA_L, -1));
  R.add(makeArm(W_SH_R, W_EL_R, W_HA_R, 1));

  // ----------------------------------- SNOP SUVOG BILJA U DESNOJ ŠACI ----
  const herbG = group([], W_HA_R[0], W_HA_R[1], W_HA_R[2]);
  herbG.rotation.set(0.42, 0.24, -0.34);
  R.add(herbG);
  const handR = makeHand({ skin, s: 0.80, pose: 'grip', side: 1 });
  handR.rotation.set(-0.10, Math.PI * 0.62, 0);
  herbG.add(handR);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    const dx = Math.cos(a) * 0.034, dz = Math.sin(a) * 0.028;
    herbG.add(bar([dx * 0.25, 0.014, dz * 0.25], [dx, 0.144 + (i % 3) * 0.022, dz], 0.0040, herbDry, 5));
    herbG.add(box(0.015, 0.024, 0.005, i % 2 ? herbGreen : herbDry, dx * 0.86, 0.108 + (i % 3) * 0.018, dz * 0.86));
  }
  const twine = torus(0.024, 0.0045, hidePale, 0, 0.050, 0, 5, 14);
  twine.rotation.x = Math.PI / 2;
  herbG.add(twine);
  herbG.add(curve([0.010, -0.030, 0.010], [0.040, -0.106, 0.024], [0.014, -0.010, 0.006], herbDry, 0.005, 0.002, 2));

  // ============================================================ VRANA =====
  // Dete trupa (da se ne odlepi kad se ramena pokrenu). Nožice STOJE NA
  // kožnom ležaju: prsti se prevaljuju preko njegove ivice, a ne u njega.
  const crowG = group([], 0.216, 0.545, -0.010);
  crowG.rotation.x = -0.220;               // uspravna, iako je trup nagnut
  torsoG.add(crowG);
  for (const s of [-1, 1]) {
    const hx = -0.024 + s * 0.026;
    crowG.add(bar([hx, 0.048, 0.008], [hx, -0.018, 0.018], 0.0080, beakM, 6, 0.0070));   // nožica
    crowG.add(sphere(0.0090, beakM, hx, -0.014, 0.018, 7, 6));                            // zglob prstiju
    for (let i = 0; i < 3; i++) {
      const a = -0.62 + i * 0.62;
      const dx = Math.sin(a) * 0.030, dz = Math.cos(a) * 0.034;
      const ey = -0.048 - Math.max(0, dz) * 0.42;      // prsti se spuštaju preko ležaja
      crowG.add(bar([hx, -0.020, 0.018], [hx + dx, ey, 0.018 + dz], 0.0048, beakM, 5, 0.0028));
      const cl = cone(0.0032, 0.013, beakM, hx + dx * 1.12, ey - 0.005, 0.018 + dz * 1.12, 5);
      cl.rotation.x = Math.PI - 0.55;          // kandža se prevaljuje preko ivice ležaja
      cl.rotation.z = -dx * 6;
      crowG.add(cl);
    }
    crowG.add(bar([hx, -0.020, 0.014], [hx - s * 0.012, -0.050, -0.022], 0.0042, beakM, 5, 0.0026));  // zadnji prst
  }

  const crowBody = group([], 0, 0, 0);
  crowBody.rotation.set(-0.08, 0.34, 0.04);
  crowG.add(crowBody);
  const cb = sphere(0.062, crowM, 0, 0.062, -0.004, 12, 10);
  cb.scale.set(0.86, 0.96, 1.34);
  crowBody.add(cb);
  const cbr = sphere(0.044, crowM, 0, 0.048, 0.046, 10, 8);
  cbr.scale.set(0.92, 1.0, 0.82);
  crowBody.add(cbr);
  const mantle = sphere(0.052, crowSheen, 0, 0.088, -0.012, 11, 9);
  mantle.scale.set(1.02, 0.68, 1.22);
  crowBody.add(mantle);
  const rump = sphere(0.036, crowM, 0, 0.056, -0.068, 9, 7);
  rump.scale.set(0.9, 0.9, 1.1);
  crowBody.add(rump);

  const tailG = group([], 0, 0.052, -0.082);    // rep se trzne uz zamah krila
  tailG.rotation.x = 0.28;
  crowBody.add(tailG);
  tailG.add(box(0.038, 0.014, 0.030, crowM, 0, 0, -0.012));
  for (let i = 0; i < 3; i++) {
    const f = box(0.015, 0.007, 0.108, i % 2 ? crowM : crowSheen, (i - 1) * 0.013, -0.002 - Math.abs(i - 1) * 0.002, -0.064);
    f.rotation.y = (i - 1) * 0.16;
    tailG.add(f);
  }

  // sklopljena krila, tri reda pera po strani
  const wings = [];
  for (const s of [-1, 1]) {
    const w = group([], s * 0.046, 0.078, 0.006);
    w.rotation.z = s * 0.10;
    w.rotation.x = 0.06;
    crowBody.add(w);
    wings.push(w);
    const cov = sphere(0.038, crowSheen, 0, 0.004, -0.006, 9, 7);
    cov.scale.set(0.5, 0.8, 1.15);
    w.add(cov);
    for (let row = 0; row < 3; row++) {
      const f = box(0.016 - row * 0.002, 0.008, 0.066 + row * 0.030, row % 2 ? crowM : crowSheen,
        s * (0.008 + row * 0.005), 0.010 - row * 0.026, -0.020 - row * 0.014);
      f.rotation.x = -0.16 - row * 0.10;
      f.rotation.y = s * (0.10 + row * 0.05);
      w.add(f);
    }
  }

  // GLAVA VRANE — zasebna podgrupa sa šiljatim kljunom i svetlim okom
  const crowHeadG = group([], 0, 0.132, 0.046);
  crowBody.add(crowHeadG);
  const ch = sphere(0.037, crowM, 0, 0, 0, 11, 9);
  ch.scale.set(0.92, 0.96, 1.06);
  crowHeadG.add(ch);
  const nape = sphere(0.030, crowSheen, 0, 0.010, -0.024, 9, 7);
  nape.scale.set(0.95, 0.92, 1.05);
  crowHeadG.add(nape);
  crowHeadG.add(sphere(0.020, crowM, 0.000, -0.028, 0.014, 8, 6));       // nakostrešeno grlo
  const bkU = cone(0.0155, 0.072, beakM, 0, 0.004, 0.070, 7);            // ŠILJAT KLJUN
  bkU.rotation.x = Math.PI / 2 + 0.06;
  crowHeadG.add(bkU);
  const bkHook = cone(0.0075, 0.020, beakM, 0, -0.004, 0.102, 6);
  bkHook.rotation.x = Math.PI / 2 + 0.7;
  crowHeadG.add(bkHook);
  const bkL = cone(0.0115, 0.052, beakM, 0, -0.012, 0.058, 6);
  bkL.rotation.x = Math.PI / 2 - 0.04;
  crowHeadG.add(bkL);
  crowHeadG.add(box(0.024, 0.008, 0.016, crowSheen, 0, 0.010, 0.036));   // koren kljuna
  crowHeadG.add(sphere(0.0035, beakM, 0.007, 0.013, 0.040, 5, 4));       // nozdrva
  for (const s of [-1, 1]) {
    crowHeadG.add(sphere(0.0105, M(0x0d0e11, { flat: false }), s * 0.026, 0.010, 0.020, 7, 6));
    crowHeadG.add(sphere(0.0062, crowEyeM, s * 0.029, 0.011, 0.024, 6, 5));  // sitno svetlo oko
  }

  // =================================================== PAHULJE OKO NJE ====
  // Sitne, da se ne čitaju kao bele strelice u vazduhu.
  const flakes = [];
  for (const [rad, spd, ph, y0, yAmp, ySpd, size] of [
    [0.44, 0.72, 0.0, 1.16, 0.070, 1.7, 0.0110],
    [0.56, -0.52, 1.9, 1.42, 0.055, 1.3, 0.0090],
    [0.38, 0.94, 3.4, 0.96, 0.080, 2.1, 0.0075],
    [0.62, -0.36, 5.0, 1.28, 0.062, 1.1, 0.0095],
    [0.48, 0.62, 2.6, 1.54, 0.048, 2.4, 0.0065],
  ]) {
    const f = group([], rad, y0, 0);
    f.add(crystal(size, flakeM, 0, 0, 0));
    f.add(bar([-size * 1.8, 0, 0], [size * 1.8, 0, 0], size * 0.14, flakeM, 4));
    R.add(f);
    flakes.push({ obj: f, rad, spd, ph, y0, yAmp, ySpd });
  }

  // =========================================================== POKRET =====
  // Prijave idu POSLE zauzimanja mirne poze — Anim pamti zatečene vrednosti,
  // pa je update(t) čista funkcija vremena bez akumulacije.
  const anim = new Anim();

  // 1) pogrbljeno sporo disanje
  anim.breathe(chestG, 0.009, 0.62, 0.30);
  anim.rot(torsoG, 'x', 0.013, 0.62, 0.30);
  anim.pos(headG, 'y', 0.005, 0.62, 0.62);
  anim.rot(headG, 'x', 0.018, 0.62, 1.10);

  // 2) kristal na štapu pulsira hladnim sjajem, mraz svetluca za njim
  anim.pulse(crystalM, 1.15, 0.42, 1.28, 0.20);
  anim.flicker(coreM, 1.70, 0.40, 4.4, 11.7, 0.9);
  anim.pos(bigC, 'y', 0.006, 1.28, 0.20);
  anim.pulse(iceM, 0.30, 0.12, 0.86, 1.40);
  anim.pulse(iceM2, 0.20, 0.08, 0.61, 2.70);
  anim.pulse(eyeGlowM, 0.85, 0.22, 0.74, 0.40);
  for (let i = 0; i < frostBits.length; i++) anim.rot(frostBits[i], 'z', 0.050, 0.5 + i * 0.05, i * 0.7);

  // 3) pet mraznih trunki kruži oko nje, svaka svojim radijusom i brzinom
  for (const f of flakes) anim.orbit(f.obj, f.rad, f.spd, f.ph, f.y0, f.yAmp, f.ySpd);

  // 4) rubovi traka šala se njišu — talas putuje kroz slojeve
  anim.wave(shawlFringes, 'x', 0.040, 0.94, 0.62, 0.30);
  anim.wave(shawlLayers, 'z', 0.020, 0.71, 0.48, 1.40);
  anim.wave(shawlTails, 'z', 0.055, 0.83, 0.70, 0.80);
  anim.wave(shawlTails, 'x', 0.036, 0.58, 0.55, 2.10);
  anim.rot(hairG, 'z', 0.030, 0.67, 1.20);
  anim.rot(hairG, 'x', 0.020, 0.49, 2.40);
  anim.rot(hem, 'x', 0.026, 0.88, 0.50);
  anim.rot(herbG, 'x', 0.045, 0.52, 2.00);

  // 5) lice: lukav pogled, nejednaki treptaji, obrve
  anim.blink(face.lidR, 4.4, 1.10, 0.026);
  anim.blink(face.lidL, 6.9, 2.70, 0.020);
  anim.rot(face.browL, 'z', 0.055, 0.44, 0.70);
  anim.rot(face.browR, 'z', 0.048, 0.37, 2.30);
  anim.pos(face.jaw, 'y', 0.004, 0.29, 1.70);
  anim.scan(headG, 0.075, 11.3, 3.40);

  // 6) VRANA — glavni pokret: nagli trzaji glavom u kratkim skokovima
  const chBaseRY = crowHeadG.rotation.y;
  const chBaseRZ = crowHeadG.rotation.z;
  const chBaseRX = crowHeadG.rotation.x;
  const chBasePY = crowHeadG.position.y;
  const chBasePZ = crowHeadG.position.z;
  const JERK = 1.06;                       // trajanje jednog skoka
  const hA = (i) => Math.sin(i * 78.233);  // deterministički „nasumičan" cilj
  const hB = (i) => Math.sin(i * 31.417);
  anim.custom((t) => {
    const k = t / JERK;
    const i = Math.floor(k);
    const f = k - i;
    const e = f < 0.13 ? f / 0.13 : 1;     // nagao skok, pa mirovanje
    const s = e * e * (3 - 2 * e);
    const a0 = hA(i), a1 = hA(i + 1);
    const b0 = hB(i), b1 = hB(i + 1);
    crowHeadG.rotation.y = chBaseRY + (a0 + (a1 - a0) * s) * 0.52;
    crowHeadG.rotation.z = chBaseRZ + (b0 + (b1 - b0) * s) * 0.16;
  });
  const PECK = 3.34;                       // povremeno kljucne, pa još jednom
  anim.custom((t) => {
    const k = (t % PECK) / PECK;
    const c1 = k < 0.11 ? Math.sin((k / 0.11) * Math.PI) : 0;
    const c2 = (k > 0.16 && k < 0.25) ? Math.sin(((k - 0.16) / 0.09) * Math.PI) : 0;
    const d = c1 * 0.52 + c2 * 0.30;
    crowHeadG.rotation.x = chBaseRX + d;
    crowHeadG.position.y = chBasePY - d * 0.030;
    crowHeadG.position.z = chBasePZ + d * 0.016;
  });
  const wingBase = wings.map((w) => [w.rotation.z, w.rotation.x, w.rotation.y]);
  const tailBaseX = tailG.rotation.x;
  const FLAP = 6.7;                        // povremeno rastvori i sklopi krila
  anim.custom((t) => {
    const k = (t % FLAP) / FLAP;
    const o = k < 0.17 ? Math.sin((k / 0.17) * Math.PI) : 0;
    const s = o * o * (3 - 2 * o);
    for (let i = 0; i < wings.length; i++) {
      const sgn = i === 0 ? -1 : 1;
      wings[i].rotation.z = wingBase[i][0] + sgn * s * 0.80;
      wings[i].rotation.x = wingBase[i][1] - s * 0.26;
      wings[i].rotation.y = wingBase[i][2] + sgn * s * 0.34;
    }
    tailG.rotation.x = tailBaseX + s * 0.22 + Math.sin(t * 1.9) * 0.030;
  });
  anim.rot(crowBody, 'z', 0.030, 0.83, 2.20);
  anim.rot(crowBody, 'x', 0.022, 1.31, 0.90);   // premeštanje težine, stopala ostaju na ležaju
  anim.pulse(crowEyeM, 1.15, 0.30, 2.10, 1.30);

  return {
    name: "Baba Zimoveja",
    title: "Zimska veštica",
    blurb: "Seljaci joj ostavljaju mleko na pragu i ne pitaju zašto im bunar ne mrzne. Vrana na njenom ramenu starija je od sela, a Baba tvrdi da ptica pamti imena svih koji su joj se ikada narugali.",
    heraldry: { color: C.frost, sigil: 'snowflake' },
    eyeY: 1.43,
    group: R,
    update: (t) => anim.tick(t),
  };
}
