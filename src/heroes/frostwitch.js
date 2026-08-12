// src/heroes/frostwitch.js — Baba Zimoveja, zimska veštica
//
// Pogrbljena starica: trup nagnut napred oko 0.22 rad, glava izbačena,
// desno rame više od levog. Silueta je piramida od slojevitih šalova iz koje
// vire koščane bose noge, kvrgav štap sa ledenim kristalom i vrana na ramenu.
//
// Sklop (junak gleda u +Z, stopala na y = 0):
//   R
//   ├─ noge i bosa stopala   — težina na desnoj nozi, leva savijenija
//   ├─ hipsG   — pojas, tkana suknja sa iscepanim rubom, torbica, privesci
//   ├─ torsoG  — nagnut; grudi u chestG (diše), grba, šalovi, vrat, glava
//   ├─ armL / armR — koščane ruke, lakat je zaseban zglob, rukav do lakta
//   ├─ staffG  — kvrgav štap; leva šaka je NJEGOVO dete (osa drške = Y šake)
//   ├─ herbG   — snop suvog bilja u desnoj šaci (desna šaka je njegovo dete)
//   ├─ crowG   — vrana: nožice o rame, telo, tri reda pera, glava kao podgrupa
//   └─ pet mraznih trunki koje kruže oko nje

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh, Glow, Ghost,
  box, cyl, sphere, cone, torus, lathe, rock, crystal, bar, group,
  curve, strap, rivetRing, fringe, makeFace, makeHand, Anim, seeded,
} from '../kit.js';

export function createFrostWitch() {
  const rnd = seeded(20713);          // nasumične konstante — samo pri gradnji
  const R = new THREE.Group();
  const D = THREE.DoubleSide;

  // ---------------------------------------------------------- materijali ---
  const skin = Flesh(C.skinGrey);
  const skinDeep = Flesh(0x9c948a);
  const wrinkleM = M(0x867e75, { flat: false, roughness: 0.92 });
  const veinM = M(0x8d9bab, { flat: false, roughness: 0.8 });
  const nailM = M(0xd2c9b4, { roughness: 0.55 });
  const hairM = M(C.hairWhite, { roughness: 0.96 });

  const clothDeep = Cloth(0x5c6e80, { side: D });    // najniži, najtamniji sloj
  const clothBlue = Cloth(0x91acc4, { side: D });    // bledoplavi
  const clothGrey = Cloth(0x8a8f98, { side: D });    // sivi
  const clothWhite = Cloth(0xdadee2, { side: D });   // beli, uz vrat
  const clothUnder = Cloth(C.slate, { side: D });    // donja tkana suknja
  const trimM = Cloth(0xb7c5d2);                     // opšiv
  const seamM = Cloth(0x6d7783);                     // šavovi

  const hide = Hide(C.leatherDark);
  const hidePale = Hide(C.leather);
  const boneM = M(C.bone, { roughness: 0.7 });
  const boneDim = M(0xcbc3ad, { roughness: 0.8 });
  const woodM = Hide(C.woodDark);
  const woodPale = Hide(C.wood);
  const ironM = Metal(C.iron);
  const brass = Metal(C.brass);

  const iceM = Glow(C.frost, 0.5, { transparent: true, opacity: 0.84 });
  const iceM2 = Glow(C.frost, 0.34, { transparent: true, opacity: 0.7 });
  const crystalM = Glow(C.frost, 1.7, { transparent: true, opacity: 0.86 });
  const coreM = Glow(0xe6f7ff, 2.3, { transparent: true, opacity: 0.95 });
  const flakeM = Ghost(C.frost, 1.5, 0.72);
  const eyeGlowM = Glow(C.frost, 2.2);

  const crowM = M(0x191c21, { roughness: 0.74 });
  const crowSheen = Metal(0x2c323b, { roughness: 0.44 });
  const beakM = M(0x322d29, { roughness: 0.55 });
  const crowEyeM = Glow(C.frost, 1.9);

  const herbGreen = M(0x76794f, { roughness: 1 });
  const herbDry = M(0x907b46, { roughness: 1 });

  // ============================================================= NOGE ======
  // Koščane, kvrgave, bose. Težina je na desnoj nozi — ona je pravija,
  // leva je više savijena i izbačena u stranu.
  const HIP_L = [-0.115, 0.795, 0.000], KNEE_L = [-0.142, 0.420, 0.040], ANK_L = [-0.150, 0.098, -0.014];
  const HIP_R = [0.120, 0.808, -0.010], KNEE_R = [0.126, 0.444, -0.004], ANK_R = [0.114, 0.098, 0.018];

  function makeLeg(hip, knee, ank, s) {
    const g = new THREE.Group();
    g.add(bar(hip, knee, 0.077, skin, 9, 0.056));                  // butina
    g.add(sphere(0.062, skin, knee[0], knee[1], knee[2], 10, 8));   // koleno
    const kb = sphere(0.036, skinDeep, knee[0], knee[1] + 0.006, knee[2] + 0.044, 8, 7);
    kb.scale.set(1.05, 0.8, 0.6);                                   // kvrga kolena
    g.add(kb);
    g.add(bar(knee, ank, 0.053, skin, 9, 0.041));                   // cevanica
    const calf = sphere(0.048, skin, (knee[0] + ank[0]) / 2, knee[1] - 0.092, (knee[2] + ank[2]) / 2 - 0.032, 9, 7);
    calf.scale.set(0.9, 1.5, 0.85);                                 // uvenuo list
    g.add(calf);
    g.add(sphere(0.045, skin, ank[0], ank[1], ank[2], 9, 7));        // gležanj
    g.add(bar([knee[0] - s * 0.028, knee[1] - 0.070, knee[2] + 0.030],
      [ank[0] - s * 0.018, ank[1] + 0.060, ank[2] + 0.028], 0.006, veinM, 5));  // nabrekla vena
    return g;
  }
  R.add(makeLeg(HIP_L, KNEE_L, ANK_L, -1));
  R.add(makeLeg(HIP_R, KNEE_R, ANK_R, 1));

  // bosa stopala sa dugim noktima
  function makeFoot(x, z, yaw) {
    const g = group([], x, 0, z);
    g.rotation.y = yaw;
    g.add(box(0.112, 0.034, 0.232, skinDeep, 0, 0.018, 0.020));     // stopalo odozdo
    g.add(box(0.104, 0.058, 0.198, skin, 0, 0.058, 0.014));         // nadstopalo
    const heel = sphere(0.056, skin, 0, 0.048, -0.080, 9, 7);
    heel.scale.set(1, 0.92, 0.9);
    g.add(heel);
    g.add(sphere(0.024, skinDeep, -0.042, 0.052, 0.060, 7, 6));     // starački iskrivljen palac
    const off = [-0.038, -0.008, 0.028];
    for (let i = 0; i < 3; i++) {
      const t = sphere(0.020 - i * 0.003, skin, off[i], 0.032, 0.114 - i * 0.008, 7, 6);
      t.scale.set(1.4, 0.85, 1.6);
      g.add(t);
      const n = cone(0.0105 - i * 0.0012, 0.038, nailM, off[i], 0.036, 0.150 - i * 0.008, 6);
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
  hipsG.add(lathe([[0.202, 0.442], [0.216, 0.560], [0.206, 0.700], [0.180, 0.812], [0.150, 0.885]], clothUnder, 14));
  hipsG.add(lathe([[0.192, 0.512], [0.200, 0.606], [0.186, 0.726], [0.160, 0.836]], clothGrey, 13));
  const hem = fringe(0.206, 5, clothUnder, 0.088, 0.446, 1, 0.85);
  hipsG.add(hem);
  const hemTrim = torus(0.208, 0.008, trimM, 0, 0.470, 0, 6, 22);
  hemTrim.rotation.x = Math.PI / 2;
  hipsG.add(hemTrim);

  hipsG.add(cyl(0.180, 0.188, 0.050, hide, 0, 0.862, 0, 14));        // uska donja traka

  // ============================================================ TRUP ======
  const torsoG = group([], 0, 0.880, 0);
  torsoG.rotation.x = 0.220;            // pogrbljen nagib napred
  R.add(torsoG);

  // Sve što je zaogrnuto tkaninom je u chestG — tako ceo umotan trup diše
  // kao jedno, bez smicanja slojeva jednog preko drugog.
  const chestG = group([], 0, 0, 0);
  torsoG.add(chestG);

  // jezgro trupa: uska donja odora koja se vidi samo u otvoru oko vrata
  chestG.add(lathe([[0.150, -0.020], [0.148, 0.100], [0.152, 0.260], [0.140, 0.380], [0.100, 0.456]], clothUnder, 14));

  // -------------------------------------------------- SLOJEVITI ŠALOVI ----
  // Četiri lathe sloja u bledoplavoj, sivoj i beloj; svaki sa iscepanim rubom
  // i drugačijim nagibom, tako da se ispod svakog vidi onaj pre njega.
  // Profil se naglo širi na visini ramena — šal ih prekriva kao polica.
  const shawlLayers = [];
  const shawlFringes = [];
  function shawl(points, mat, rimR, rimY, count, len, rotZ, rotX, offX, trim) {
    const g = group([], offX, 0, 0);
    g.rotation.z = rotZ;
    g.rotation.x = rotX;
    g.add(lathe(points, mat, 16));
    const f = fringe(rimR, count, mat, len, rimY, 1, 0.85);
    g.add(f);
    if (trim) {
      const tr = torus(rimR + 0.004, 0.007, trimM, 0, rimY + 0.014, 0, 6, 24);
      tr.rotation.x = Math.PI / 2;
      g.add(tr);
    }
    chestG.add(g);
    shawlLayers.push(g);
    shawlFringes.push(f);
  }
  shawl([[0.300, -0.086], [0.316, 0.026], [0.302, 0.190], [0.286, 0.330], [0.268, 0.420], [0.240, 0.470], [0.170, 0.510], [0.100, 0.532]],
    clothDeep, 0.312, -0.080, 4, 0.108, 0.05, 0.02, 0.006, true);
  shawl([[0.258, 0.032], [0.272, 0.124], [0.262, 0.262], [0.244, 0.376], [0.222, 0.446], [0.160, 0.492], [0.096, 0.516]],
    clothGrey, 0.266, 0.038, 3, 0.094, -0.07, -0.02, -0.010, false);
  shawl([[0.222, 0.132], [0.234, 0.204], [0.226, 0.306], [0.206, 0.400], [0.180, 0.458], [0.126, 0.500], [0.088, 0.520]],
    clothBlue, 0.228, 0.138, 3, 0.082, 0.07, 0.03, 0.008, true);
  shawl([[0.186, 0.244], [0.196, 0.306], [0.188, 0.386], [0.164, 0.442], [0.130, 0.480], [0.086, 0.508]],
    clothWhite, 0.192, 0.250, 2, 0.066, -0.05, -0.03, -0.006, false);

  // GRBA — izbočina koja se čita KROZ tkaninu, na spoljnom sloju šala,
  // sa nizom pršljenova koji se ocrtavaju pod platnom.
  const hump = sphere(0.152, clothDeep, 0.016, 0.372, -0.180, 13, 11);
  hump.scale.set(1.14, 0.94, 0.96);
  chestG.add(hump);
  const blade = sphere(0.096, clothDeep, -0.128, 0.316, -0.196, 10, 8);
  blade.scale.set(1.0, 1.05, 0.72);                                   // lopatica niže, s druge strane
  chestG.add(blade);
  for (let i = 0; i < 3; i++) {
    chestG.add(sphere(0.021 - i * 0.002, clothGrey, 0.010, 0.286 + i * 0.088, -0.278 - i * 0.008, 7, 6));
  }

  // dijagonalni preklop preko spoljnog šala + brošna kopča na levom ramenu
  chestG.add(strap([[-0.244, 0.396, 0.116], [-0.062, 0.244, 0.298], [0.192, 0.056, 0.262]], 0.028, clothBlue));
  chestG.add(cyl(0.026, 0.026, 0.012, brass, -0.250, 0.400, 0.118, 10));
  chestG.add(crystal(0.017, iceM, -0.256, 0.406, 0.126));

  // ------------------------------------- POJAS PREKO SPOLJNOG ŠALA ------
  // Kaiš je stegnut PREKO najnižeg sloja, pa se kopča, zakivci, koščani
  // privesci i torbica vide izvan tkanine, među resama.
  chestG.add(cyl(0.318, 0.324, 0.052, hide, 0, 0.030, 0, 16));
  chestG.add(box(0.064, 0.052, 0.024, brass, 0, 0.028, 0.320));       // kopča
  chestG.add(box(0.040, 0.032, 0.014, hide, 0, 0.028, 0.334));        // jezičak
  chestG.add(rivetRing(0.324, 6, 0.0115, brass, 0.054, 1, 0.3));
  chestG.add(strap([[-0.196, 0.020, 0.258], [-0.214, -0.070, 0.262], [-0.198, -0.140, 0.268]], 0.014, hide));
  chestG.add(box(0.030, 0.026, 0.010, brass, -0.198, -0.152, 0.270));

  // koščani privesci o pojasu — vise među resama spoljnog šala
  for (const [ang, len, kind] of [[-0.52, 0.132, 0], [0.44, 0.176, 1], [1.22, 0.104, 2]]) {
    const cx = Math.sin(ang) * 0.306, cz = Math.cos(ang) * 0.306, y0 = 0.010;
    chestG.add(bar([cx, y0, cz], [cx, y0 - len, cz], 0.0045, hidePale, 5));
    if (kind === 0) chestG.add(cyl(0.011, 0.015, 0.054, boneM, cx, y0 - len - 0.027, cz, 7));
    else if (kind === 1) {
      const b = box(0.020, 0.048, 0.010, boneDim, cx, y0 - len - 0.024, cz);
      b.rotation.z = 0.18;
      chestG.add(b);
    } else chestG.add(crystal(0.021, iceM2, cx, y0 - len - 0.020, cz));
  }

  // torbica sa suvim biljem, obešena o pojas na desnom kuku
  const pouch = group([], 0.290, -0.118, 0.154);
  pouch.rotation.set(0.10, -0.86, 0.06);
  pouch.add(bar([-0.022, 0.106, 0], [-0.022, 0.056, 0], 0.008, hide, 5));
  pouch.add(box(0.096, 0.104, 0.058, hidePale, 0, 0, 0));
  pouch.add(box(0.100, 0.030, 0.062, hide, 0, 0.052, 0));            // poklopac
  pouch.add(box(0.036, 0.038, 0.012, hide, 0, 0.040, 0.034));        // jezičak
  pouch.add(box(0.020, 0.014, 0.008, brass, 0, 0.026, 0.036));       // kopča
  pouch.add(box(0.104, 0.008, 0.060, seamM, 0, -0.050, 0));          // šav po dnu
  for (let i = 0; i < 2; i++) {                                      // suvo bilje viri
    const a = -0.22 + i * 0.44;
    pouch.add(bar([Math.sin(a) * 0.022, 0.056, 0.014],
      [Math.sin(a) * 0.052, 0.128 + i * 0.018, 0.032], 0.0038, herbDry, 5));
    pouch.add(box(0.014, 0.020, 0.004, i % 2 ? herbGreen : herbDry,
      Math.sin(a) * 0.048, 0.112 + i * 0.014, 0.030));
  }
  chestG.add(pouch);

  // ključne kosti i ramena — desno je više od levog; šal ih prekriva, pa se
  // asimetrija čita kroz nagib gornje ivice tkanine
  const SH_L = [-0.175, 0.385, 0.000];
  const SH_R = [0.185, 0.435, -0.005];
  torsoG.add(bar([-0.026, 0.446, 0.088], [SH_L[0] + 0.030, 0.412, 0.052], 0.013, skin, 6, 0.010));
  torsoG.add(bar([0.026, 0.454, 0.088], [SH_R[0] - 0.030, 0.462, 0.048], 0.013, skin, 6, 0.010));
  const shL = sphere(0.062, clothDeep, SH_L[0], SH_L[1], SH_L[2], 10, 8);
  shL.scale.set(1, 0.9, 0.96);
  torsoG.add(shL);
  const shR = sphere(0.064, clothDeep, SH_R[0], SH_R[1], SH_R[2], 10, 8);
  shR.scale.set(1, 0.9, 0.96);
  torsoG.add(shR);

  // vrat — tanak, izbačen napred, sa tetivom i podvoljkom
  torsoG.add(bar([0, 0.430, 0.028], [0, 0.556, 0.098], 0.046, skin, 10, 0.040));
  torsoG.add(bar([-0.026, 0.436, 0.056], [-0.014, 0.540, 0.116], 0.007, skin, 5));
  const wattle = sphere(0.038, skin, 0, 0.510, 0.108, 9, 7);
  wattle.scale.set(0.9, 0.72, 0.7);
  torsoG.add(wattle);
  const neckW = torus(0.045, 0.0045, wrinkleM, 0, 0.480, 0.056, 5, 14);
  neckW.rotation.x = Math.PI / 2 - 0.5;
  torsoG.add(neckW);

  // dva kraja šala vise preko leve ruke i preko grbe — njišu se
  const shawlTails = [];
  {
    const t1 = group([], -0.252, 0.342, -0.150);
    t1.rotation.z = 0.14;
    t1.add(box(0.084, 0.234, 0.024, clothBlue, 0, -0.117, 0));
    t1.add(box(0.088, 0.014, 0.028, trimM, 0, -0.230, 0));
    t1.add(fringe(0.042, 2, clothBlue, 0.054, -0.236, 0.4, 0.7));
    torsoG.add(t1);
    shawlTails.push(t1);

    const t2 = group([], 0.170, 0.316, -0.252);
    t2.rotation.z = -0.12;
    t2.add(box(0.070, 0.272, 0.022, clothGrey, 0, -0.136, 0));
    t2.add(fringe(0.036, 2, clothGrey, 0.048, -0.274, 0.4, 0.7));
    torsoG.add(t2);
    shawlTails.push(t2);
  }

  // ------------------------------------------- MRAZ RASTE PO NJOJ --------
  // Sitni kristali niču po rubu šala, na ramenu, po marami i po štapu.
  const frostBits = [];
  function frostAt(parent, x, y, z, r, mat) {
    const c = crystal(r, mat, x, y, z);
    c.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3);
    c.scale.set(0.62, 1.6, 0.62);
    parent.add(c);
    frostBits.push(c);
    return c;
  }
  frostAt(chestG, -0.256, 0.040, 0.190, 0.024, iceM);
  frostAt(chestG, 0.208, -0.010, 0.252, 0.019, iceM2);
  frostAt(chestG, -0.286, 0.140, -0.108, 0.021, iceM);
  frostAt(chestG, 0.060, -0.062, 0.308, 0.026, iceM);
  frostAt(chestG, 0.262, 0.404, 0.074, 0.023, iceM);
  frostAt(chestG, 0.196, 0.454, -0.116, 0.017, iceM2);

  // ============================================================ GLAVA =====
  const headG = group([], 0, 0.600, 0.115);
  headG.rotation.x = -0.140;            // lice ostaje skoro vodoravno
  headG.rotation.y = 0.060;
  torsoG.add(headG);

  const FR = 0.108;
  const face = makeFace({
    skin,
    r: FR,
    eye: 0x241f1b,
    brow: C.hairWhite,
    browAngle: 0.22,
    eyeSize: 0.0165,
    eyeSpread: 0.0455,
    eyeZ: FR * 0.76,                    // duboko upale oči
    mouth: 'open',
    mouthY: -0.058,
    noseLen: FR * 0.42,
    noseWide: 0.60,
    wide: 0.94, tall: 1.02, deep: 0.99,
  });
  headG.add(face.group);
  // jedno oko bledo svetli, drugo ostaje tamno i lukavo
  face.irisL.material = eyeGlowM;
  face.irisL.scale.setScalar(1.3);
  face.browR.rotation.z += 0.16;        // jedna obrva podignuta — lukav izraz
  // duboke očne duplje
  for (const s of [-1, 1]) headG.add(torus(0.026, 0.006, wrinkleM, s * 0.0455, 0.008, FR * 0.80, 5, 12));
  headG.add(bar([-0.070, 0.044, 0.064], [0.070, 0.044, 0.064], 0.011, skin, 6));  // nadočni greben

  // KUKAST NOS — koren je nos iz makeFace, na njega se nastavlja savijen vrh
  face.nose.scale.set(0.68, 1.15, 1.5);
  headG.add(curve([0, 0.030, 0.066], [0.002, -0.080, 0.098], [0, -0.014, 0.058], skinDeep, 0.024, 0.014, 3));
  headG.add(sphere(0.0065, wrinkleM, -0.013, -0.066, 0.094, 6, 5));   // nozdrve
  headG.add(sphere(0.0065, wrinkleM, 0.013, -0.066, 0.094, 6, 5));
  headG.add(sphere(0.009, skinDeep, 0.004, -0.086, 0.090, 6, 5));     // kvržica na vrhu

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
  face.mouth.scale.set(1.40, 1.15, 1);
  face.mouth.rotation.z = 0.10;
  headG.add(box(0.0095, 0.015, 0.008, boneM, 0.013, -0.050, 0.084));
  headG.add(box(0.042, 0.007, 0.008, wrinkleM, 0, -0.036, 0.086));
  headG.add(bar([-0.030, -0.030, 0.082], [-0.041, -0.070, 0.068], 0.0035, wrinkleM, 5));
  headG.add(bar([0.030, -0.030, 0.082], [0.041, -0.070, 0.068], 0.0035, wrinkleM, 5));
  // šiljata brada sa bradavicom i jednom dlakom
  const chin = cone(0.030, 0.048, skin, 0, -0.098, 0.062, 8);
  chin.rotation.x = 2.9;
  headG.add(chin);
  headG.add(sphere(0.008, skinDeep, 0.022, -0.086, 0.074, 6, 5));
  headG.add(bar([0.022, -0.086, 0.078], [0.031, -0.106, 0.092], 0.0022, hairM, 4));

  // DUBOKE BORE — tanke tamnije trake preko čela i obraza
  for (const [x, y, z, w, rz] of [[-0.050, 0.070, 0.076, 0.092, 0.05], [-0.046, 0.050, 0.084, 0.086, -0.04]]) {
    const b = box(w, 0.0055, 0.0055, wrinkleM, x + w / 2, y, z);
    b.rotation.z = rz;
    b.rotation.x = -0.35;
    headG.add(b);
  }
  headG.add(box(0.022, 0.005, 0.006, wrinkleM, -0.004, 0.032, 0.078));  // brazda na korenu nosa
  for (const s of [-1, 1]) {
    const b = box(0.040, 0.0045, 0.005, wrinkleM, s * 0.062, -0.032, 0.062);
    b.rotation.z = s * 0.5;
    b.rotation.y = -s * 0.5;
    headG.add(b);
  }

  // ------------------------------------------------- RETKA BELA KOSA -----
  // Pramenovi koji padaju preko lica, retki i neujednačeni.
  const hairG = group([], 0, 0, 0);
  headG.add(hairG);
  // Tanke i sa mnogo segmenata, i spuštene NIZ SLEPOOČNICE a ne preko nosa —
  // debeli pramen preko lica čita se kao surla, ne kao kosa.
  for (const [a, b, bl] of [
    [[-0.094, 0.050, 0.030], [-0.086, -0.150, 0.052], [-0.026, -0.030, 0.026]],
    [[-0.070, 0.072, 0.052], [-0.078, -0.182, 0.030], [-0.024, -0.038, 0.030]],
    [[0.072, 0.070, 0.050], [0.082, -0.168, 0.028], [0.024, -0.036, 0.028]],
    [[0.096, 0.046, 0.026], [0.092, -0.196, 0.010], [0.028, -0.048, 0.018]],
    [[-0.096, 0.026, -0.030], [-0.108, -0.212, -0.004], [-0.032, -0.054, 0.014]],
    [[0.020, 0.018, -0.100], [0.034, -0.230, -0.098], [0.008, -0.058, -0.030]],
  ]) hairG.add(curve(a, b, bl, hairM, 0.0055, 0.0016, 5));
  hairG.add(bar([-0.048, 0.064, 0.074], [-0.084, 0.104, 0.060], 0.004, hairM, 4));  // vlas ispod ruba marame

  // ----------------------------------------------- MARAMA PREKO GLAVE ----
  const scarfG = group([], 0, 0.030, -0.020);
  scarfG.rotation.x = -0.220;
  headG.add(scarfG);
  scarfG.add(lathe([[0.114, 0.018], [0.120, 0.058], [0.104, 0.098], [0.062, 0.128], [0.020, 0.140]], clothBlue, 15));
  const band = torus(0.114, 0.011, clothGrey, 0, 0.040, 0, 6, 22);
  band.rotation.x = Math.PI / 2;
  scarfG.add(band);
  scarfG.add(fringe(0.116, 3, clothBlue, 0.052, 0.014, 1, 0.7));
  scarfG.add(sphere(0.030, clothWhite, 0, 0.006, -0.104, 9, 7));        // čvor na potiljku
  const kn1 = group([], -0.032, -0.004, -0.104);
  kn1.add(box(0.044, 0.152, 0.016, clothBlue, 0, -0.076, 0));
  kn1.add(box(0.048, 0.010, 0.020, trimM, 0, -0.148, 0));
  scarfG.add(kn1);
  const kn2 = group([], 0.030, -0.006, -0.100);
  kn2.rotation.z = -0.16;
  kn2.add(box(0.040, 0.118, 0.014, clothWhite, 0, -0.059, 0));
  scarfG.add(kn2);
  shawlTails.push(kn1, kn2);
  frostAt(scarfG, 0.078, 0.070, 0.030, 0.014, iceM2);
  frostAt(scarfG, -0.064, 0.086, -0.016, 0.011, iceM2);

  // ============================================================ ŠTAP =====
  // Kvrgav, u nekoliko prelomljenih segmenata; račvast vrh drži veliki
  // ledeni kristal, oko drške je namotana vrpca sa koščanim privescima.
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
  const bigC = crystal(0.072, crystalM, 0.026, 1.570, 0.000);
  bigC.scale.set(0.78, 1.16, 0.78);
  staffG.add(bigC);
  staffG.add(crystal(0.032, coreM, 0.026, 1.570, 0.000));
  frostAt(staffG, 0.070, 1.538, 0.030, 0.020, iceM);
  frostAt(staffG, -0.014, 1.524, -0.034, 0.017, iceM);
  frostAt(staffG, 0.058, 1.418, 0.022, 0.015, iceM2);

  // leva šaka — DETE ŠTAPA, jer je osa drške Y osa šake
  const handL = makeHand({ skin, s: 0.88, pose: 'grip', side: -1 });
  handL.position.set(GRIP[0], GRIP[1], GRIP[2]);
  handL.rotation.set(0.14, -Math.PI / 2, 0.20);
  staffG.add(handL);
  {
    const P = 0.052 * 0.88;             // dugi nokti preko drške
    for (const y of [P * 0.72, P * 0.16]) {
      const n = cone(0.0075, 0.026, nailM, -P * 0.86, y, P * 0.58, 6);
      n.rotation.x = Math.PI / 2;
      handL.add(n);
    }
  }

  // ============================================================= RUKE =====
  // Koščane; lakat je zaseban zglob, rukav se završava iznad njega.
  const W_SH_L = [-0.175, 1.256, 0.084];
  const W_EL_L = [-0.345, 1.055, 0.075];
  const W_HA_L = [-0.276, 1.270, 0.148];
  const W_SH_R = [0.185, 1.303, 0.095];
  const W_EL_R = [0.345, 1.100, 0.085];
  const W_HA_R = [0.278, 0.985, 0.268];

  function makeArm(sh, el, ha, s) {
    const g = new THREE.Group();
    const m = [sh[0] + (el[0] - sh[0]) * 0.62, sh[1] + (el[1] - sh[1]) * 0.62, sh[2] + (el[2] - sh[2]) * 0.62];
    g.add(bar(sh, m, 0.062, clothGrey, 9, 0.048));                    // rukav
    const cuff = sphere(0.050, clothDeep, m[0], m[1], m[2], 9, 7);
    cuff.scale.set(1.05, 0.6, 1.05);
    g.add(cuff);
    g.add(bar(sh, el, 0.041, skin, 9, 0.034));                        // nadlaktica
    g.add(sphere(0.043, skin, el[0], el[1], el[2], 10, 8));            // lakat
    g.add(sphere(0.024, skinDeep, el[0] + s * 0.016, el[1] - 0.010, el[2] - 0.030, 7, 6));
    g.add(bar(el, ha, 0.033, skin, 9, 0.026));                        // podlaktica
    g.add(sphere(0.026, skin, ha[0], ha[1], ha[2], 9, 7));             // zglob
    g.add(bar([el[0] + s * 0.014, el[1] - 0.012, el[2] + 0.026],
      [ha[0] + s * 0.010, ha[1] + 0.010, ha[2] + 0.020], 0.0055, veinM, 5));
    const b = [el[0] + (ha[0] - el[0]) * 0.80, el[1] + (ha[1] - el[1]) * 0.80, el[2] + (ha[2] - el[2]) * 0.80];
    g.add(sphere(0.031, hidePale, b[0], b[1], b[2], 8, 6));            // narukvica od vrpce
    return g;
  }
  R.add(makeArm(W_SH_L, W_EL_L, W_HA_L, -1));
  R.add(makeArm(W_SH_R, W_EL_R, W_HA_R, 1));

  // ----------------------------------- SNOP SUVOG BILJA U DESNOJ ŠACI ----
  const herbG = group([], W_HA_R[0], W_HA_R[1], W_HA_R[2]);
  herbG.rotation.set(0.42, 0.24, -0.34);
  R.add(herbG);
  const handR = makeHand({ skin, s: 0.86, pose: 'grip', side: 1 });
  handR.rotation.set(-0.10, Math.PI * 0.62, 0);
  herbG.add(handR);
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.3;
    const dx = Math.cos(a) * 0.036, dz = Math.sin(a) * 0.030;
    herbG.add(bar([dx * 0.25, 0.014, dz * 0.25], [dx, 0.148 + (i % 3) * 0.022, dz], 0.0042, herbDry, 5));
    herbG.add(box(0.016, 0.026, 0.005, i % 2 ? herbGreen : herbDry, dx * 0.86, 0.110 + (i % 3) * 0.018, dz * 0.86));
  }
  const twine = torus(0.026, 0.0045, hidePale, 0, 0.052, 0, 5, 14);
  twine.rotation.x = Math.PI / 2;
  herbG.add(twine);
  herbG.add(curve([0.010, -0.030, 0.010], [0.042, -0.110, 0.026], [0.014, -0.010, 0.006], herbDry, 0.005, 0.002, 2));

  // ============================================================ VRANA =====
  // Nožice obuhvataju rame, telo je zaokrenuto od nje, glava je zasebna
  // podgrupa koja se naglo trza i kljuca.
  const crowG = group([], 0.212, 1.415, 0.082);
  R.add(crowG);
  for (const s of [-1, 1]) {                    // nožice o rame
    const hx = -0.030 + s * 0.032;
    crowG.add(bar([hx, 0.048, 0.010], [hx, -0.016, 0.020], 0.0085, beakM, 6, 0.0075));
    for (let i = 0; i < 3; i++) {
      const a = -0.6 + i * 0.6;
      crowG.add(bar([hx, -0.018, 0.022],
        [hx + Math.sin(a) * 0.036, -0.054, 0.024 + Math.cos(a) * 0.038], 0.0050, beakM, 5, 0.0030));
    }
    crowG.add(bar([hx, -0.018, 0.016], [hx - s * 0.014, -0.050, -0.024], 0.0045, beakM, 5, 0.0030));
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
  const flakes = [];
  for (const [rad, spd, ph, y0, yAmp, ySpd, size] of [
    [0.44, 0.72, 0.0, 1.16, 0.070, 1.7, 0.020],
    [0.56, -0.52, 1.9, 1.42, 0.055, 1.3, 0.016],
    [0.38, 0.94, 3.4, 0.96, 0.080, 2.1, 0.013],
    [0.62, -0.36, 5.0, 1.28, 0.062, 1.1, 0.017],
    [0.48, 0.62, 2.6, 1.54, 0.048, 2.4, 0.011],
  ]) {
    const f = group([], rad, y0, 0);
    f.add(crystal(size, flakeM, 0, 0, 0));
    f.add(bar([-size * 2.2, 0, 0], [size * 2.2, 0, 0], size * 0.17, flakeM, 4));
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
  anim.pulse(crystalM, 1.70, 0.62, 1.28, 0.20);
  anim.flicker(coreM, 2.25, 0.55, 4.4, 11.7, 0.9);
  anim.pos(bigC, 'y', 0.006, 1.28, 0.20);
  anim.pulse(iceM, 0.50, 0.20, 0.86, 1.40);
  anim.pulse(iceM2, 0.34, 0.14, 0.61, 2.70);
  anim.pulse(eyeGlowM, 2.10, 0.45, 0.74, 0.40);
  for (let i = 0; i < frostBits.length; i++) anim.rot(frostBits[i], 'z', 0.070, 0.5 + i * 0.07, i * 0.9);

  // 3) pet mraznih trunki kruži oko nje, svaka svojim radijusom i brzinom
  for (const f of flakes) anim.orbit(f.obj, f.rad, f.spd, f.ph, f.y0, f.yAmp, f.ySpd);

  // 4) rubovi šalova se njišu — talas putuje kroz slojeve
  anim.wave(shawlFringes, 'x', 0.040, 0.94, 0.62, 0.30);
  anim.wave(shawlLayers, 'z', 0.022, 0.71, 0.48, 1.40);
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
  anim.pos(crowG, 'y', 0.005, 1.31, 0.90);   // sitno premeštanje težine
  anim.rot(crowBody, 'z', 0.030, 0.83, 2.20);
  anim.pulse(crowEyeM, 1.85, 0.45, 2.10, 1.30);

  return {
    name: "Baba Zimoveja",
    title: "Zimska veštica",
    blurb: "Seljaci joj ostavljaju mleko na pragu i ne pitaju zašto im bunar ne mrzne. Vrana na njenom ramenu starija je od sela, a Baba tvrdi da ptica pamti imena svih koji su joj se ikada narugali.",
    heraldry: { color: C.frost, sigil: 'snowflake' },
    eyeY: 1.44,
    group: R,
    update: (t) => anim.tick(t),
  };
}
