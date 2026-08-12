// src/heroes/hunter.js — Ravna Vukodav, lovac na čudovišta
//
// Silueta: uska i asimetrična. Levo rame nosi tri čelične ploče i kožu vuka,
// desno je golo krzno. Sablja visi O LEVOM KUKU i leva šaka počiva na balčaku,
// samostrel je nizak i uspravan na leđima, a bandolir sa razmaknutim bočicama
// seče grudi od desnog ramena. Desna strana glave nosi pramenove, leva je
// obrijana i preko nje ide ožiljak — tanka linija priljubljena uz kožu.
// Težina je na zadnjoj (desnoj) nozi, prednja je opružena i lagana — stav
// nekoga ko sluša mrak, a ne nekoga ko pozira za portret.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh, Glow,
  box, cyl, sphere, cone, torus, rock, bar, group,
  curve, strap, chain, rivets, rivetRing, chainmail, fringe, fur, vial,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createHunter() {
  const g = new THREE.Group();

  // ---------------------------------------------------------- pomoćne sitnice --
  /** Spljošti telo obrtanja — trup i kukovi nisu valjci. */
  const flat = (m, sz = 0.76, sx = 1) => { m.scale.set(sx, 1, sz); return m; };
  /** Postavi rotaciju i vrati mesh, da sve staje u jedan red. */
  const rot = (m, x = 0, y = 0, z = 0) => { m.rotation.set(x, y, z); return m; };

  // ------------------------------------------------- geometrija glave i trupa --
  // Mere lobanje moraju da se slažu sa makeFace, da bi crte lica, kosa i
  // ožiljak sedeli UZ kožu a ne pred njom.
  const HR = 0.113, HWX = 0.96, HTY = 1.04, HDZ = 0.96;
  /** Z površine lobanje za dato (x, y) — ista formula kao u makeFace. */
  const faceZ = (x, y) => {
    const k = 1 - (x / (HR * HWX)) ** 2 - (y / (HR * HTY)) ** 2;
    return k <= 0.02 ? 0 : HR * HDZ * Math.sqrt(k);
  };
  /** Tačka na lobanji: az = 0 napred (+Z), pozitivan ka +X; el = visina. */
  const onHead = (az, el, out = 0) => {
    const ce = Math.cos(el);
    return [
      Math.sin(az) * ce * (HR * HWX + out),
      Math.sin(el) * (HR * HTY + out),
      Math.cos(az) * ce * (HR * HDZ + out),
    ];
  };
  /** Tačka na spljoštenom trupu: ugao 0 = napred, pozitivan ka +X. */
  const onTorso = (ang, y, rx, rz) => [Math.sin(ang) * rx, y, Math.cos(ang) * rz];
  /** Ploča priljubljena uz trup, sa licem po tangenti. */
  const panel = (ang, y, w, h, t, mat, rx, rz) => {
    const m = box(w, h, t, mat, Math.sin(ang) * rx, y, Math.cos(ang) * rz);
    m.rotation.y = ang;
    return m;
  };
  /** Šav ili opšiv oko trupa — prsten spljošten u istoj osi kao trup. */
  const seam = (r, tube, mat, y, sz = 0.78, tSeg = 20) => {
    const m = rot(torus(r, tube, mat, 0, y, 0, 8, tSeg), Math.PI / 2);
    m.scale.set(1, sz, 1);
    return m;
  };

  // ------------------------------------------------------------- materijali --
  const skin = Flesh(C.skinTan);                                    // ispijen, preplanuo ten
  const skinLow = Flesh(C.skinDark);                                // senka pod jagodicama
  const skinShade = Flesh(0x94603c);                                // podočnjaci, bore
  const lipM = Flesh(0x8f5545);                                     // usna
  const scarPale = Flesh(0xb4855f, { roughness: 0.55 });            // greben ožiljka
  const scarDark = Flesh(0x6f4530, { roughness: 0.62 });            // žleb ožiljka
  const milkyWhite = M(0xbdb6a4, { flat: false, roughness: 0.3 });  // zamućena beonjača slepog oka
  const milkyIris = M(0x9d9789, { flat: false, roughness: 0.38 });
  const hairM = M(0x221b17, { roughness: 0.98 });
  const hairM2 = M(0x322721, { roughness: 0.98 });                  // svetliji pramenovi
  const stubbleM = M(0x4a3d33, { roughness: 1 });                   // obrijana strana glave

  const shirtM = Cloth(C.slate);
  const lea = Hide(0x66452a);                                       // prsluk — tamnija koža za noć
  const leaMid = Hide(C.leather);
  const leaD = Hide(C.leatherDark);
  const leaP = Hide(C.leatherPale);
  const gloveM = Hide(0x543a24);
  const steel = Metal(0x8d97a2);
  const steelD = Metal(C.steelDark);
  const iron = Metal(C.blackIron, { roughness: 0.52 });
  const brass = Metal(C.brass);
  const mailM = Metal(C.steelDark, { roughness: 0.58 });
  const furM = M(0x4d4339, { roughness: 1 });
  const furD = M(C.furDark, { roughness: 1 });
  const furP = M(0x7d6f5d, { roughness: 1 });
  const boneM = M(0xc4b99e, { roughness: 0.62 });
  const clawM = M(0x2f2822, { roughness: 0.7 });
  const cordM = M(0x6b5a44, { roughness: 1 });                      // voštana tetiva i uzice
  const wood = Hide(C.woodDark);
  const woodP = Hide(C.wood);
  // staklo je tamno i mutno: bistra bočica na noćnoj sceni čita se kao sečivo
  const glass = M(0x36494a, { flat: false, transparent: true, opacity: 0.82, roughness: 0.3 });
  const silverLiq = Glow(C.silver, 0.42);                           // srebro tinja u bočici
  const oilLiq = M(0x372c18, { flat: false });
  const bloodLiq = M(0x5a1618, { flat: false });
  const saltLiq = M(0xa79f8c, { flat: false });

  // ---------------------------------------------------------------- orijentiri --
  const hipL = [-0.115, 0.885, 0.00], hipR = [0.115, 0.915, 0.00];
  const kneeL = [-0.148, 0.495, 0.085], kneeR = [0.134, 0.485, -0.030];
  const ankL = [-0.150, 0.140, 0.145], ankR = [0.128, 0.140, -0.105];
  const shL = [-0.200, 1.405, 0.00], shR = [0.200, 1.405, 0.00];
  // Obe ruke padaju uz telo: leva počiva na jabuci sablje o kuku, desna drži
  // strelu. Nijedna ne preseca trup — stara poza je provlačila desnu šaku
  // kroz prsluk.
  const elbL = [-0.272, 1.176, 0.014], elbR = [0.256, 1.160, 0.024];
  const wrL = [-0.160, 0.991, 0.094], wrR = [0.256, 0.940, 0.066];
  const HEAD_Y = 1.6487;   // makeFace stavlja oči na r*0.10 iznad centra -> eyeY = 1.66

  // ================================================================== NOGE ====
  // Zadnja (desna) noga je ispravljena i nosi težinu, prednja je opružena.
  for (const [hip, knee, ank, s] of [[hipL, kneeL, ankL, -1], [hipR, kneeR, ankR, 1]]) {
    g.add(sphere(0.088, lea, hip[0], hip[1], hip[2], 9, 8));               // zglob kuka
    g.add(bar(hip, knee, 0.084, lea, 9, 0.070));                           // butina
    g.add(sphere(0.072, lea, knee[0], knee[1], knee[2], 9, 8));            // koleno kao zglob
    // zakrpa na kolenu — kapica koja PRATI koleno, ne ravna daščica pred njim
    const patch = sphere(0.074, leaP, knee[0] + s * 0.004, knee[1] + 0.006, knee[2] + 0.026, 9, 8);
    patch.scale.set(1.03, 0.94, 0.62);
    g.add(patch);
    // štep po obodu zakrpe
    for (let k = 0; k < 5; k++) {
      const a = (k / 4 - 0.5) * 2.4;
      g.add(sphere(0.0055, leaD,
        knee[0] + Math.sin(a) * 0.070, knee[1] + 0.006 + Math.cos(a) * 0.064, knee[2] + 0.052, 5, 4));
    }
    // spoljni šav pantalona od kuka do kolena, sa krupnim štepom
    g.add(bar([hip[0] + s * 0.075, hip[1] - 0.02, hip[2]], [knee[0] + s * 0.062, knee[1], knee[2]], 0.007, leaD, 5));
    g.add(rivets([hip[0] + s * 0.078, hip[1] - 0.03, hip[2] + 0.01],
      [knee[0] + s * 0.065, knee[1] + 0.01, knee[2] + 0.01], 4, 0.0055, leaP));
    g.add(bar([knee[0], knee[1] - 0.03, knee[2]], ank, 0.070, leaD, 9, 0.055));   // list u sari
  }

  // čizme — visoke, sa kaiševima i kopčama
  const bootL = makeBoot({ mat: leaD, sole: Hide(0x2e2016), cuff: lea, buckle: brass, s: 1.02 });
  bootL.position.set(-0.150, 0, 0.108);
  bootL.rotation.y = -0.20;
  g.add(bootL);
  const bootR = makeBoot({ mat: leaD, sole: Hide(0x2e2016), cuff: lea, buckle: brass, s: 1.02 });
  bootR.position.set(0.128, 0, -0.128);
  bootR.rotation.y = 0.30;
  g.add(bootR);

  for (const [ank, s] of [[ankL, -1], [ankR, 1]]) {
    for (let i = 0; i < 1; i++) {
      const y = ank[1] + 0.175;
      const r = 0.072;
      g.add(rot(torus(r, 0.013, lea, ank[0], y, ank[2], 6, 14), Math.PI / 2));
      g.add(box(0.036, 0.030, 0.018, brass, ank[0] + s * 0.004, y, ank[2] + r + 0.008));
    }
  }

  // nožić zaboden u saru prednje čizme
  const knifeG = group([], -0.168, 0.400, -0.015);
  knifeG.rotation.set(-0.22, 0.20, 0.14);
  knifeG.add(cyl(0.013, 0.015, 0.085, wood, 0, 0, 0, 7));
  knifeG.add(box(0.036, 0.010, 0.016, iron, 0, -0.048, 0));
  knifeG.add(box(0.016, 0.070, 0.006, steel, 0, -0.085, 0));
  knifeG.add(sphere(0.014, brass, 0, 0.048, 0, 7, 6));
  knifeG.add(rot(torus(0.015, 0.004, leaP, 0, 0.012, 0, 5, 10), Math.PI / 2));
  g.add(knifeG);

  // ================================================================ KUKOVI ====
  g.add(flat(sphere(0.168, lea, 0, 0.905, 0, 11, 9), 0.80, 1.04));
  g.add(flat(cyl(0.150, 0.162, 0.140, lea, 0, 1.005, 0, 12), 0.78));

  // dva pojasa: široki radni i tanji iznad njega
  g.add(flat(cyl(0.176, 0.176, 0.068, leaD, 0, 0.982, 0, 14), 0.78));
  g.add(flat(cyl(0.168, 0.168, 0.030, lea, 0, 1.048, 0, 14), 0.79));
  g.add(rivetRing(0.176, 8, 0.011, brass, 0.982, 0.78, 0.32));
  g.add(box(0.080, 0.062, 0.024, brass, 0, 0.982, 0.146));           // šnala
  g.add(box(0.052, 0.036, 0.026, leaD, 0, 0.982, 0.152));
  g.add(box(0.010, 0.050, 0.020, brass, 0, 0.982, 0.158));           // jezičak šnale
  g.add(box(0.030, 0.070, 0.016, lea, 0.072, 0.978, 0.140));         // prevučen kraj pojasa
  g.add(fringe(0.172, 8, leaD, 0.085, 0.952, 0.79, 0.55));           // isečen kožni skut

  // torbica na desnom kuku i mala na leđima
  const pouch = group([], 0.095, 0.903, 0.112);
  pouch.rotation.y = -0.18;
  pouch.add(box(0.082, 0.104, 0.058, lea, 0, 0, 0));
  pouch.add(box(0.086, 0.030, 0.062, leaD, 0, 0.048, 0.004));        // preklop
  pouch.add(box(0.020, 0.026, 0.014, brass, 0, 0.030, 0.036));       // kopča preklopa
  pouch.add(sphere(0.008, brass, -0.028, 0.048, 0.032, 6, 5));
  pouch.add(sphere(0.008, brass, 0.028, 0.048, 0.032, 6, 5));
  g.add(pouch);

  const pouch2 = group([], -0.055, 0.930, -0.172);
  pouch2.add(box(0.075, 0.085, 0.045, leaD, 0, 0, 0));
  pouch2.add(box(0.079, 0.024, 0.049, lea, 0, 0.040, -0.002));
  pouch2.add(sphere(0.009, brass, 0, 0.030, -0.026, 6, 5));
  g.add(pouch2);

  // brus na lančiću o pojasu
  g.add(chain([0.208, 0.965, -0.052], [0.214, 0.910, -0.056], 3, 0.011, iron));
  const stoneM = rock(0.030, M(C.stoneDark, { roughness: 1 }), 0.216, 0.880, -0.058);
  stoneM.scale.set(0.7, 1.3, 0.5);
  g.add(stoneM);

  // ================================================== TRUP (grupa koja diše) ==
  const chest = new THREE.Group();
  g.add(chest);

  // košulja u tri visine — trup se sužava ka struku
  chest.add(flat(cyl(0.150, 0.142, 0.120, shirtM, 0, 1.080, 0, 12), 0.76));
  chest.add(flat(cyl(0.166, 0.150, 0.180, shirtM, 0, 1.230, 0, 12), 0.76));
  chest.add(flat(cyl(0.172, 0.166, 0.100, shirtM, 0, 1.370, 0, 12), 0.76));

  // ---- PRSLUK: telo koje prati trup, pa preklop, šavovi i opšiv po obodu ----
  chest.add(flat(cyl(0.168, 0.158, 0.086, lea, 0, 1.118, 0, 14), 0.78));
  chest.add(flat(cyl(0.184, 0.168, 0.130, lea, 0, 1.226, 0, 14), 0.78));
  chest.add(flat(cyl(0.186, 0.184, 0.086, lea, 0, 1.334, 0, 14), 0.78));

  // donji sloj preklopa — desna polovina prsluka ide POD levu
  for (const a of [0.06, 0.30, 0.54, 0.78, 1.02]) {
    chest.add(panel(a, 1.206, 0.058, 0.262, 0.020, lea, 0.180, 0.141));
  }
  // gornji sloj preklopa — prelazi preko sredine grudi ka levoj strani
  for (const a of [0.14, -0.11, -0.36, -0.61, -0.86]) {
    chest.add(panel(a, 1.212, 0.060, 0.258, 0.024, leaMid, 0.192, 0.150));
  }
  // ploče na leđima, isto po obodu trupa
  for (const a of [2.86, 3.14, 3.42]) {
    chest.add(panel(a, 1.206, 0.062, 0.256, 0.022, lea, 0.182, 0.142));
  }

  // opšiv po ivici preklopa, sa nizom zakivaka umesto pertli
  chest.add(panel(0.175, 1.212, 0.014, 0.272, 0.034, leaD, 0.194, 0.152));
  for (let i = 0; i < 5; i++) {
    const y = 1.100 + i * 0.056;
    chest.add(sphere(0.0085, brass, Math.sin(0.175) * 0.208, y, Math.cos(0.175) * 0.163, 6, 5));
  }
  // opšiv po dnu i vrhu preklopa
  for (const a of [0.14, -0.11, -0.36, -0.61, -0.86]) {
    chest.add(panel(a, 1.086, 0.062, 0.014, 0.030, leaD, 0.194, 0.152));
  }
  for (const a of [0.02, -0.36, -0.74]) {
    chest.add(panel(a, 1.338, 0.064, 0.014, 0.030, leaD, 0.194, 0.152));
  }
  for (const a of [0.18, 0.54, 0.90]) {
    chest.add(panel(a, 1.080, 0.062, 0.013, 0.026, leaD, 0.182, 0.143));
  }

  // šavovi oko prsluka — prstenovi spljošteni u istoj osi kao trup
  chest.add(seam(0.176, 0.008, leaD, 1.078));
  chest.add(seam(0.190, 0.007, leaD, 1.166));
  chest.add(seam(0.190, 0.007, leaD, 1.286));
  chest.add(seam(0.190, 0.009, leaD, 1.372));

  // kaiš preko rebara, sa šnalom na levoj strani
  chest.add(strap([
    onTorso(1.18, 1.148, 0.202, 0.158), onTorso(0.60, 1.152, 0.202, 0.158),
    onTorso(0.00, 1.156, 0.202, 0.158), onTorso(-0.60, 1.152, 0.202, 0.158),
    onTorso(-1.18, 1.148, 0.202, 0.158),
  ], 0.012, leaD, 6));
  chest.add(panel(-0.52, 1.152, 0.044, 0.038, 0.020, brass, 0.206, 0.161));
  chest.add(panel(-0.52, 1.152, 0.010, 0.030, 0.026, leaD, 0.208, 0.163));

  // ogrebotine preko prsluka — dva stara reza priljubljena uz kožu prsluka
  for (let i = 0; i < 2; i++) {
    const p = panel(0.46 + i * 0.16, 1.212, 0.006, 0.120, 0.026, leaD, 0.183, 0.143);
    p.rotation.z = -0.30;
    chest.add(p);
  }

  // verižnjača oko vrata — sitne karike koje se vide iznad prsluka
  chest.add(chainmail(0.080, 1, 10, mailM, 1.418, 0.032, 0.84, 0));

  // jaram prsluka — prati padinu ramena, nije kvadar preko grudi
  for (const s of [-1, 1]) {
    const yk = flat(sphere(0.104, lea, s * 0.122, 1.402, 0, 10, 9), 0.80, 0.98);
    yk.rotation.z = -s * 0.24;
    chest.add(yk);
    chest.add(rot(box(0.148, 0.052, 0.170, lea, s * 0.104, 1.428, 0), 0, 0, -s * 0.22));
    chest.add(rot(box(0.154, 0.014, 0.178, leaD, s * 0.104, 1.398, 0), 0, 0, -s * 0.22));
    chest.add(rivets([s * 0.048, 1.436, 0.078], [s * 0.168, 1.406, 0.070], 3, 0.009, brass));
  }
  chest.add(flat(cyl(0.176, 0.184, 0.062, lea, 0, 1.372, 0, 14), 0.80));
  // opšiv oko izreza za vrat
  const nk = rot(torus(0.088, 0.010, leaD, 0, 1.418, 0.004, 8, 20), Math.PI / 2);
  nk.scale.set(1, 0.82, 1);
  chest.add(nk);

  // ključne kosti i vrat
  chest.add(bar([-0.020, 1.462, 0.036], [-0.168, 1.418, 0.046], 0.020, skin, 6, 0.013));
  chest.add(bar([0.020, 1.462, 0.036], [0.168, 1.418, 0.046], 0.020, skin, 6, 0.013));
  chest.add(cyl(0.058, 0.070, 0.145, skin, 0, 1.510, 0.006, 10));
  chest.add(flat(sphere(0.048, skinLow, 0, 1.492, 0.052, 8, 7), 0.6, 0.9));
  for (const s of [-1, 1]) chest.add(flat(sphere(0.062, skin, s * 0.098, 1.442, -0.010, 8, 7), 0.8, 1.1));
  chest.add(cyl(0.076, 0.070, 0.030, leaD, 0, 1.432, 0.006, 10));   // kožna ogrlica pod verižnjačom

  // ============================================ BANDOLIR SA BOČICAMA =========
  // Bočice su RAZMAKNUTE i vise u kožnim alkama. Ranije su se, zbite jedna
  // uz drugu i od bistrog stakla, čitale kao jedno bledo sečivo preko grudi.
  const VA = [[0.72, 1.336], [0.34, 1.252], [-0.06, 1.168], [-0.46, 1.084]];
  chest.add(strap([
    onTorso(1.06, 1.436, 0.198, 0.155),
    ...VA.map(([a, y]) => onTorso(a, y, 0.198, 0.155)),
    onTorso(-0.88, 1.014, 0.198, 0.155),
  ], 0.020, leaD, 7));
  chest.add(sphere(0.014, brass, ...onTorso(1.06, 1.436, 0.204, 0.160), 7, 6));
  chest.add(sphere(0.014, brass, ...onTorso(-0.88, 1.014, 0.204, 0.160), 7, 6));

  // srebro, ulje, krv, so — četiri bočice, sa jasnim prazninama između
  const liquids = [silverLiq, oilLiq, bloodLiq, saltLiq];
  for (let i = 0; i < 4; i++) {
    const [a, y] = VA[i];
    const loop = rot(torus(0.021, 0.006, leaD, ...onTorso(a, y - 0.006, 0.206, 0.162), 6, 12), Math.PI / 2);
    loop.rotation.z = a * 0.5;
    chest.add(loop);
    const p = onTorso(a, y - 0.050, 0.212, 0.170);
    const v = vial(glass, liquids[i], p[0], p[1], p[2], 0.060, 0.016);
    v.rotation.set(-0.10, 0, a * 0.22);
    chest.add(v);
  }

  // ============================================ OGRLICA OD TROFEJA ===========
  // Trofeji vise o vratu, IZNAD prsluka — pre su probijali kroz jaram i
  // izgledali kao beli šiljci iz nedra.
  chest.add(strap([
    onTorso(-1.05, 1.474, 0.100, 0.082), onTorso(-0.60, 1.452, 0.100, 0.082),
    onTorso(0.00, 1.436, 0.100, 0.082),
    onTorso(0.60, 1.452, 0.100, 0.082), onTorso(1.05, 1.474, 0.100, 0.082),
  ], 0.007, cordM, 5));
  for (let i = 0; i < 5; i++) {
    const a = (i / 4 - 0.5) * 1.5;
    const p = onTorso(a, 1.436 + Math.abs(a) * 0.026, 0.104, 0.086);
    const trophy = i % 2 === 0
      ? rot(cone(0.010, 0.046, boneM, p[0], p[1] - 0.026, p[2] + 0.004, 6), 0.34, 0, Math.PI + a * 0.4)
      : rot(cone(0.009, 0.038, clawM, p[0], p[1] - 0.022, p[2] + 0.004, 6), 0.52, 0, Math.PI + a * 0.5);
    chest.add(trophy);
  }

  // ============================== NARAMENIK (levo) I GOLO KRZNO (desno) ======
  // Asimetrija je celo lice ovog junaka: čelik na jednom ramenu, krzno na drugom.
  const pauld = group([], -0.206, 1.442, 0.004);
  pauld.add(flat(sphere(0.098, steel, 0, 0.006, 0, 10, 9), 1, 1.02));
  const plates = [[0.020, 0.30, 0.196], [-0.052, 0.44, 0.208], [-0.126, 0.56, 0.200]];
  for (let i = 0; i < 3; i++) {
    const [dy, tilt, w] = plates[i];
    pauld.add(rot(box(w, 0.070, 0.190 - i * 0.012, steel, -0.014 * i, dy, 0), 0, 0, tilt));
    pauld.add(rot(box(w + 0.014, 0.016, 0.202 - i * 0.012, steelD, -0.014 * i, dy - 0.040, 0), 0, 0, tilt));
    pauld.add(rivets([-w * 0.40 - 0.014 * i, dy - w * 0.38 * Math.sin(tilt), 0.100],
      [w * 0.40 - 0.014 * i, dy + w * 0.38 * Math.sin(tilt), 0.100], 3, 0.010, brass));
  }
  pauld.add(bar([0.02, 0.03, 0.088], [0.02, -0.16, 0.056], 0.012, leaD, 5));   // remen ispod ruke
  pauld.add(bar([0.02, 0.03, -0.088], [0.02, -0.16, -0.056], 0.012, leaD, 5));
  pauld.add(sphere(0.013, brass, 0.02, -0.16, 0.056, 6, 5));
  g.add(pauld);

  const shoulderFur = fur(furM, 6, [0.088, 0.048, 0.082], 0.056, 17);
  shoulderFur.position.set(0.212, 1.428, 0.004);
  g.add(shoulderFur);
  const shoulderFur2 = fur(furD, 3, [0.070, 0.030, 0.070], 0.046, 41);
  shoulderFur2.position.set(0.216, 1.396, 0.004);
  g.add(shoulderFur2);
  const shoulderFur3 = fur(furP, 2, [0.062, 0.026, 0.058], 0.034, 53);
  shoulderFur3.position.set(0.222, 1.446, 0.010);
  g.add(shoulderFur3);
  // kožna kapica preko krzna, da se čita kao okovratnik a ne kao gomila kamenja
  const furCap = flat(sphere(0.088, leaD, 0.198, 1.462, 0.002, 10, 8), 0.86, 0.92);
  furCap.scale.y = 0.52;
  g.add(furCap);
  g.add(bar([0.138, 1.478, 0.026], [0.246, 1.428, 0.026], 0.013, leaD, 5));
  g.add(bar([0.138, 1.470, -0.030], [0.246, 1.420, -0.030], 0.013, leaD, 5));
  g.add(sphere(0.011, brass, 0.246, 1.428, 0.026, 6, 5));

  // ================================== KOŽA VUKA PREKO LEVOG RAMENA ==========
  const pelt = group([], -0.184, 1.452, 0.020);
  chest.add(pelt);
  pelt.add(rot(box(0.190, 0.230, 0.040, leaD, 0.020, -0.072, -0.030), 0.10, 0.26, 0.10));
  pelt.add(fur(furM, 6, [0.108, 0.070, 0.096], 0.060, 7));
  pelt.add(fur(furD, 3, [0.086, 0.056, 0.080], 0.052, 23));
  pelt.add(fur(furP, 2, [0.070, 0.040, 0.062], 0.042, 91));

  // dve šape vise na grudima — svaka o svom zglobu, da se mogu njihati
  const paws = [];
  for (const [px, py, pz, len] of [[0.058, -0.086, 0.124, 0.150], [0.142, -0.126, 0.086, 0.126]]) {
    const paw = group([], px, py, pz);
    paw.add(bar([0, 0, 0], [0.010, -len * 0.58, 0.006], 0.019, furM, 6, 0.015));
    paw.add(sphere(0.020, furD, 0.010, -len * 0.58, 0.006, 7, 6));           // zglob šape
    paw.add(bar([0.010, -len * 0.58, 0.006], [0.014, -len, 0.016], 0.016, furP, 6, 0.014));
    const pad = sphere(0.026, furD, 0.014, -len - 0.014, 0.020, 8, 7);
    pad.scale.set(1, 0.7, 1.1);
    paw.add(pad);
    for (let k = 0; k < 3; k++) {
      paw.add(rot(cone(0.006, 0.024, clawM, 0.014 + (k - 1) * 0.014, -len - 0.030, 0.030, 5), 0.5, 0, Math.PI));
    }
    pelt.add(paw);
    paws.push(paw);
  }

  // ================================================================= RUKE ====
  // Svaka ruka: rame, nadlaktica, lakat kao zglob, podlaktica, štitnik, rukavica.
  for (const [sh, elb, wr, s] of [[shL, elbL, wrL, -1], [shR, elbR, wrR, 1]]) {
    g.add(sphere(0.078, shirtM, sh[0], sh[1], sh[2], 9, 8));               // rame
    g.add(bar(sh, elb, 0.064, shirtM, 9, 0.052));                          // nadlaktica
    // verižnjača na rukavu
    const sleeve = chainmail(0.062, 1, 5, mailM, 0, 0.052, 1, 0);
    sleeve.position.set((sh[0] + elb[0]) / 2 + s * 0.002, (sh[1] + elb[1]) / 2 + 0.012, (sh[2] + elb[2]) / 2);
    sleeve.rotation.set(0.16, 0, s * -0.16);
    g.add(sleeve);
    g.add(sphere(0.058, shirtM, elb[0], elb[1], elb[2], 9, 8));            // lakat
    g.add(bar(elb, wr, 0.054, skin, 9, 0.044));                            // podlaktica
    // kožni štitnik na podlaktici, sa štepom i kopčom
    const at = (k) => [elb[0] + (wr[0] - elb[0]) * k, elb[1] + (wr[1] - elb[1]) * k, elb[2] + (wr[2] - elb[2]) * k];
    const mid = at(0.55);
    g.add(bar(at(0.22), at(0.92), 0.060, leaD, 9, 0.050));
    g.add(rivets([mid[0] - 0.05, mid[1] + 0.030, mid[2] + 0.048],
      [mid[0] + 0.05, mid[1] + 0.030, mid[2] + 0.048], 2, 0.008, brass));
    g.add(rivets([mid[0] - 0.05, mid[1] - 0.040, mid[2] + 0.048],
      [mid[0] + 0.05, mid[1] - 0.040, mid[2] + 0.048], 2, 0.008, brass));
    g.add(box(0.026, 0.020, 0.014, brass, mid[0] + s * 0.052, mid[1], mid[2] + 0.020));
  }
  // levi lakat nosi malu čeličnu kapicu (deo istog kompleta kao naramenik)
  g.add(rot(box(0.080, 0.070, 0.062, steel, elbL[0] - 0.026, elbL[1] + 0.004, elbL[2] - 0.012), 0, 0, 0.30));
  g.add(sphere(0.009, brass, elbL[0] - 0.052, elbL[1] + 0.030, elbL[2] - 0.012, 6, 5));

  // desna rukavica drži strelu uz butinu — šaka nešto DRŽI, ne visi kao kocka
  const boltG = group([], 0.260, 0.902, 0.076);
  boltG.rotation.set(0.12, 0, 0.10);
  boltG.add(cyl(0.0055, 0.0055, 0.240, woodP, 0, -0.030, 0, 6));
  boltG.add(rot(cone(0.012, 0.034, iron, 0, -0.167, 0, 6), Math.PI));
  boltG.add(cyl(0.008, 0.007, 0.016, iron, 0, -0.142, 0, 6));
  boltG.add(cyl(0.007, 0.006, 0.014, boneM, 0, 0.085, 0, 6));
  for (let i = 0; i < 3; i++) {
    boltG.add(rot(box(0.003, 0.036, 0.020, leaP, 0, 0.066, 0), 0, (i / 3) * Math.PI * 2, 0));
  }
  const handR = makeHand({ skin: gloveM, cuff: lea, pose: 'grip', side: 1, s: 1.0 });
  handR.rotation.set(0.06, Math.PI / 2, 0);
  boltG.add(handR);
  g.add(boltG);

  // ================================================================= GLAVA ===
  const head = group([], 0, HEAD_Y, 0.008);
  head.rotation.y = 0.03;
  g.add(head);

  const face = makeFace({
    skin, r: HR,
    eye: 0x241c16, brow: 0x241d19,
    browAngle: 0.24,                   // namrštena
    eyeSize: 0.0185, eyeSpread: 0.048,
    mouth: 'line', mouthColor: 0x7d453c,
    wide: HWX, tall: HTY, deep: HDZ,
    noseLen: 0.026, noseWide: 0.82,
  });
  head.add(face.group);

  // Levo oko je slepo, ali je ISTE VELIČINE i na ISTOJ VISINI kao zdravo —
  // razlika je samo u boji: zamućena beonjača i bleda, razlivena zenica.
  face.eyeL.material = milkyWhite;
  face.irisL.material = milkyIris;
  face.irisL.scale.set(1.15, 1.15, 0.7);
  // kapak nad slepim okom malo pada
  face.lidL.position.y -= 0.0035;
  face.lidL.scale.y *= 1.18;
  // leva obrva je presečena ožiljkom — kraća i pomerena ka nosu
  face.browL.scale.x = 0.58;
  face.browL.position.x = -0.034;

  // stisnuta usta
  face.mouth.rotation.x = 0.14;
  face.mouth.scale.set(1.06, 0.85, 1);
  // gornja usna daje ustima obline; ništa ne viri iz usta
  head.add(box(0.036, 0.009, 0.012, lipM, 0, -0.058, faceZ(0, -0.058) - 0.006));
  // bore u uglovima usta — tanke linije uz kožu, ne nalepljene kockice
  for (const s of [-1, 1]) {
    const cx = s * 0.028, cx2 = s * 0.034;
    head.add(bar([cx, -0.052, faceZ(cx, -0.052) - 0.004],
      [cx2, -0.078, faceZ(cx2, -0.078) - 0.005], 0.0032, skinShade, 5));
  }
  // nozdrve — dve tamne tačke pod vrhom nosa
  for (const s of [-1, 1]) head.add(sphere(0.0036, skinShade, s * 0.009, -0.038, 0.1155, 6, 5));
  // podočnjaci — plitka senka uz kožu, ne braon grudve pred licem
  for (const s of [-1, 1]) {
    head.add(bar([s * 0.026, -0.004, faceZ(0.026, -0.004) - 0.005],
      [s * 0.066, -0.014, faceZ(0.066, -0.014) - 0.005], 0.0055, skinShade, 6, 0.0038));
  }

  // ================================================== OŽILJAK PREKO LEVOG OKA ==
  // Tanka linija PRILJUBLJENA uz kožu, dijagonalno od čela preko obrve i
  // spoljnog ugla oka do obraza — nekada je to bila bela pločica na čelu.
  const SCAR = [[-0.022, 0.094], [-0.038, 0.064], [-0.052, 0.032],
    [-0.064, 0.000], [-0.064, -0.034], [-0.056, -0.062]];
  const sp = SCAR.map(([x, y]) => [x, y, faceZ(x, y) - 0.0016]);
  for (let i = 1; i < sp.length; i++) {
    head.add(bar(sp[i - 1], sp[i], 0.0050 - i * 0.0004, scarPale, 6));
    // žleb: tamnija nit uz svetli greben
    head.add(bar([sp[i - 1][0] - 0.0075, sp[i - 1][1] - 0.002, sp[i - 1][2] - 0.0045],
      [sp[i][0] - 0.0075, sp[i][1] - 0.002, sp[i][2] - 0.0045], 0.0030, scarDark, 5));
  }
  // stari šavovi popreko
  for (let i = 0; i < 4; i++) {
    const p = sp[i + 1];
    head.add(rot(box(0.013, 0.0032, 0.0036, scarDark, p[0], p[1], p[2] + 0.0018), 0, 0, -0.95));
  }

  // ============================================================= KOSA =========
  // Nije jedna „kaciga" preko glave: krunu drži kapica, a sve ostalo su
  // PRAMENOVI razne dužine koji padaju uz lobanju. Desna strana je puna,
  // leva obrijana na tanke linije uz kožu.
  const crown = sphere(0.050, hairM, 0.010, 0.096, -0.010, 10, 8);
  crown.scale.set(1.55, 0.48, 1.55);
  head.add(crown);

  // [az, kraj po visini, poluprečnik, materijal] — kratki pramenovi napred,
  // sve duži ka potiljku
  const LOCKS = [
    [-0.28, 0.60, 0.016, hairM], [-0.03, 0.48, 0.017, hairM2],
    [0.24, 0.40, 0.017, hairM], [0.52, 0.26, 0.018, hairM2],
    [0.80, 0.10, 0.018, hairM], [1.08, -0.04, 0.018, hairM2],
    [1.36, -0.14, 0.018, hairM], [1.64, -0.21, 0.017, hairM],
    [1.92, -0.26, 0.017, hairM2], [2.20, -0.30, 0.017, hairM],
    [2.48, -0.31, 0.016, hairM], [2.76, -0.28, 0.016, hairM2],
    [3.04, -0.22, 0.015, hairM], [3.32, -0.14, 0.015, hairM],
  ];
  for (const [az, elEnd, rr, mat] of LOCKS) {
    const a = onHead(az, 1.30, 0.005);
    const b = onHead(az, (1.30 + elEnd) * 0.5, 0.011);
    const c = onHead(az, elEnd, 0.009);
    head.add(bar(a, b, rr, mat, 6, rr));
    head.add(bar(b, c, rr, mat, 6, rr * 0.66));
  }
  // dva duža pramena ispred desnog uha i jedan na potiljku
  head.add(bar(onHead(1.24, 0.10, 0.010), onHead(1.30, -0.46, 0.012), 0.014, hairM2, 6, 0.008));
  head.add(bar(onHead(1.44, 0.02, 0.010), onHead(1.50, -0.52, 0.012), 0.013, hairM, 6, 0.007));
  head.add(bar(onHead(2.95, -0.24, 0.010), onHead(3.05, -0.62, 0.012), 0.016, hairM, 6, 0.009));

  // obrijana leva strana: potamnela koža i tanke linije uz nju
  for (let i = 0; i < 4; i++) {
    const az = 3.76 + i * 0.38;
    head.add(bar(onHead(az, 0.86, -0.006), onHead(az, 0.30, -0.006), 0.014, stubbleM, 6));
    head.add(bar(onHead(az, 0.30, -0.006), onHead(az, -0.22, -0.006), 0.014, stubbleM, 6));
  }
  for (let i = 0; i < 4; i++) {
    const az = 3.70 + i * 0.42;
    head.add(bar(onHead(az, 0.90, 0.004), onHead(az, 0.32, 0.005), 0.0030, hairM, 5));
    head.add(bar(onHead(az, 0.32, 0.005), onHead(az, -0.20, 0.004), 0.0028, hairM, 5));
  }

  // koštana alka u desnom uhu
  head.add(rot(torus(0.014, 0.004, boneM, 0.104, -0.030, 0.004, 5, 10), 0, Math.PI / 2));
  head.add(cone(0.006, 0.020, boneM, 0.104, -0.050, 0.004, 5));

  // ======================================================= SABLJA U KORICAMA ==
  // Grupa je osa oružja: +Y je drška, -Y ide u korice. Šaka je dete drške.
  // Visi O LEVOM KUKU: jabuka je u visini pojasa, korice padaju uz butinu
  // nazad. Pre je balčak stajao na grudima i probijao prsluk.
  const sword = group([], -0.222, 0.782, 0.038);
  sword.rotation.set(0.26, 0, -0.28);
  g.add(sword);

  sword.add(flat(cyl(0.030, 0.038, 0.600, leaD, 0, -0.330, 0, 8), 0.56));
  sword.add(flat(cyl(0.041, 0.040, 0.052, brass, 0, -0.024, 0, 8), 0.60));      // grlić korica
  for (let i = 0; i < 2; i++) {
    // obruč korica: prsten se posle obrtanja spljošti u istoj osi kao i korice
    const y = -0.100 - i * 0.300;
    const ring = rot(torus(0.040 - i * 0.002, 0.010, brass, 0, y, 0, 6, 14), Math.PI / 2);
    ring.scale.set(1, 0.62, 1);
    sword.add(ring);
    sword.add(sphere(0.008, brass, 0.040, y, 0, 5, 4));
  }
  sword.add(flat(rot(cone(0.030, 0.072, brass, 0, -0.662, 0, 8), Math.PI), 0.60));   // okov na vrhu
  for (let i = 0; i < 3; i++) sword.add(box(0.052, 0.006, 0.024, leaP, 0, -0.190 - i * 0.160, 0.020));

  // balčak
  sword.add(box(0.140, 0.020, 0.038, steelD, 0, 0.046, 0));                     // nakrsnica
  sword.add(box(0.028, 0.016, 0.056, steelD, 0, 0.046, 0));
  sword.add(box(0.020, 0.048, 0.020, steelD, 0, 0.020, 0.026));                 // langet
  sword.add(cyl(0.019, 0.022, 0.170, leaD, 0, 0.142, 0, 8));                    // drška
  for (let i = 0; i < 5; i++) sword.add(rot(torus(0.021, 0.005, leaP, 0, 0.082 + i * 0.032, 0, 5, 10), Math.PI / 2));
  sword.add(sphere(0.028, brass, 0, 0.246, 0, 9, 8));                           // jabuka
  sword.add(cyl(0.014, 0.020, 0.018, brass, 0, 0.226, 0, 8));
  sword.add(curve([0.058, 0.046, 0], [0.014, 0.240, 0], [0.078, 0.010, 0], steelD, 0.011, 0.008, 5));  // luk za prste
  sword.add(rot(cone(0.011, 0.046, steelD, -0.072, 0.062, 0, 6), 0, 0, -0.5));  // donji krak nakrsnice

  // leva šaka počiva na balčaku; prsti su izdvojeni da se mogu stezati
  const handL = makeHand({ skin: gloveM, cuff: lea, pose: 'grip', side: -1, s: 0.98 });
  handL.position.set(0, 0.150, 0);
  handL.rotation.set(0.08, -Math.PI / 2, 0);
  sword.add(handL);
  const fingersL = new THREE.Group();
  for (const c of handL.children.slice(2, 14)) fingersL.add(c);
  handL.add(fingersL);

  // remenje kojim korice vise o pojasu — dva duga nosača do grlića korica
  g.add(bar([-0.172, 0.986, 0.076], [-0.228, 0.762, 0.036], 0.010, leaD, 5));
  g.add(bar([-0.196, 0.978, 0.008], [-0.246, 0.700, 0.006], 0.010, leaD, 5));
  g.add(sphere(0.010, brass, -0.228, 0.762, 0.036, 6, 5));
  g.add(sphere(0.010, brass, -0.246, 0.700, 0.006, 6, 5));

  // ============================================== SAMOSTREL NA LEĐIMA ========
  // Nisko na leđima i skoro uspravno: pre je gornji krak sa tetivom izbijao
  // pored uha i sekao glavu.
  const xb = group([], 0.014, 1.075, -0.252);
  xb.rotation.set(-0.10, 0.14, 0.12);
  g.add(xb);

  xb.add(box(0.056, 0.520, 0.048, woodP, 0, 0, 0));                     // kundak
  xb.add(box(0.070, 0.096, 0.062, wood, 0, -0.296, 0));                 // peta kundaka
  xb.add(box(0.062, 0.030, 0.052, iron, 0, -0.348, 0));
  xb.add(box(0.058, 0.090, 0.056, leaD, 0, -0.204, 0));                 // kožna obloga
  xb.add(box(0.022, 0.380, 0.020, wood, 0, 0.050, 0.032));              // žleb
  xb.add(box(0.006, 0.380, 0.010, iron, 0, 0.050, 0.042));
  xb.add(box(0.104, 0.056, 0.062, wood, 0, 0.240, 0));                  // mostić za krakove
  xb.add(rivets([-0.038, 0.240, 0.034], [0.038, 0.240, 0.034], 3, 0.008, iron));

  for (const s of [-1, 1]) {
    xb.add(curve([s * 0.044, 0.240, 0.004], [s * 0.290, 0.190, -0.026], [s * 0.028, 0.050, 0], steelD, 0.015, 0.008, 4));
    xb.add(box(0.026, 0.026, 0.030, iron, s * 0.056, 0.236, 0.004));    // vez kraka
    xb.add(bar([s * 0.290, 0.190, -0.026], [0, 0.092, 0.030], 0.005, cordM, 5));    // tetiva
    xb.add(sphere(0.008, leaP, s * 0.283, 0.192, -0.026, 5, 4));
  }
  xb.add(box(0.044, 0.032, 0.038, iron, 0, 0.092, 0.036));              // orah
  xb.add(rot(box(0.018, 0.086, 0.018, iron, 0, 0.026, -0.040), -0.25)); // obarač
  xb.add(box(0.014, 0.030, 0.038, iron, 0, -0.020, -0.030));
  xb.add(curve([-0.036, 0.298, 0.010], [0.036, 0.298, 0.010], [0, 0.070, 0], iron, 0.009, 0.009, 4));  // uzengija
  for (let i = 0; i < 2; i++) xb.add(rot(torus(0.034, 0.008, leaD, 0, -0.096 + i * 0.160, 0, 5, 10), Math.PI / 2));

  // tobolac sa četiri kratke strele
  const qv = group([], 0.232, 0.958, -0.164);
  qv.rotation.set(0.28, 0, -0.40);
  g.add(qv);
  qv.add(cyl(0.048, 0.042, 0.240, leaD, 0, 0, 0, 9));
  qv.add(rot(torus(0.050, 0.010, brass, 0, 0.112, 0, 6, 12), Math.PI / 2));
  qv.add(rot(torus(0.046, 0.010, brass, 0, -0.100, 0, 6, 12), Math.PI / 2));
  qv.add(cyl(0.043, 0.043, 0.020, leaD, 0, -0.126, 0, 9));
  qv.add(bar([-0.046, 0.090, 0], [-0.052, -0.070, 0], 0.010, lea, 5));
  qv.add(sphere(0.009, brass, -0.048, 0.060, 0.010, 6, 5));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    const dx = Math.sin(a) * 0.022, dz = Math.cos(a) * 0.022;
    qv.add(cyl(0.006, 0.006, 0.200, woodP, dx, 0.170, dz, 6));
    qv.add(cone(0.013, 0.038, iron, dx, 0.288, dz, 6));
    qv.add(rot(box(0.004, 0.048, 0.024, leaP, dx, 0.096, dz), 0, a, 0));
  }

  // ============================================================== ANIMACIJA ===
  // Mirna poza je zauzeta; sada se prijavljuju pokreti, svaki oko svoje osnove.
  const anim = new Anim();
  anim.breathe(chest, 0.011, 1.02, 0.4);                 // sporo, plitko disanje
  anim.scan(head, 0.15, 11.5, 2.6);                      // pogled pretražuje mrak
  anim.rot(head, 'x', 0.026, 0.83, 1.2);                 // sitno klimanje glavom
  anim.blink(face.lidR, 4.7, 1.3, 0.030);                // trepće samo zdravo oko
  anim.wave(paws, 'x', 0.055, 1.24, 0.7, 0.3);           // šape vuka se njišu
  anim.rot(pelt, 'z', 0.022, 0.62, 0.9);                 // celo krzno teško se pomera
  anim.rot(shoulderFur, 'x', 0.030, 1.40, 2.1);
  anim.pulse(silverLiq, 0.85, 0.38, 1.35);               // srebro tinja u bočici

  // prsti se povremeno stegnu oko balčaka i puste
  const fBaseZ = fingersL.position.z;
  anim.custom((t) => {
    const k = ((t % 6.4) + 6.4) % 6.4 / 6.4;
    const e = k < 0.24 ? Math.sin((k / 0.24) * Math.PI) : 0;
    fingersL.position.z = fBaseZ - 0.014 * e;
    fingersL.rotation.y = -0.075 * e;
  });

  return {
    name: 'Ravna Vukodav',
    title: 'Lovac na čudovišta',
    blurb: 'Ne uzima poslove za koje postoji mapa. Levo oko izgubila je kod Trnovog Broda, kada je nešto što nema ime izašlo iz vode — a ona se vratila sa njegovim zubom o vratu i bez ijedne reči o tome šta je tamo videla.',
    heraldry: { color: C.crimson, sigil: 'fang' },
    eyeY: 1.66,
    group: g,
    update: (t) => anim.tick(t),
  };
}
