// src/heroes/hunter.js — Ravna Vukodav, lovac na čudovišta
//
// Silueta: uska i asimetrična. Levo rame nosi tri čelične ploče i kožu vuka,
// desno je golo krzno. Sablja visi o levom kuku, samostrel je zabačen preko
// leđa po dijagonali, a bandolir sa bočicama seče grudi od desnog ramena.
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

  // ------------------------------------------------------------- materijali --
  const skin = Flesh(C.skinTan);                                    // ispijen, preplanuo ten
  const skinLow = Flesh(C.skinDark);                                // senka pod jagodicama
  const scarM = Flesh(0xd6ac83, { roughness: 0.5 });                // ožiljak je svetliji od kože
  const milkyWhite = M(0xd8d1c1, { flat: false, roughness: 0.28 }); // mlečna beonjača slepog oka
  const milkyIris = M(0xc6bda9, { flat: false, roughness: 0.34 });
  const hairM = M(C.hairBlack, { roughness: 0.96 });
  const stubbleM = M(0x3a3129, { roughness: 1 });                   // obrijana strana glave

  const shirtM = Cloth(C.slate);
  const lea = Hide(C.leather);
  const leaD = Hide(C.leatherDark);
  const leaP = Hide(C.leatherPale);
  const gloveM = Hide(0x543a24);
  const steel = Metal(C.steel);
  const steelD = Metal(C.steelDark);
  const iron = Metal(C.blackIron, { roughness: 0.52 });
  const brass = Metal(C.brass);
  const mailM = Metal(C.steelDark, { roughness: 0.58 });
  const furM = M(C.fur, { roughness: 1 });
  const furD = M(C.furDark, { roughness: 1 });
  const furP = M(C.furPale, { roughness: 1 });
  const boneM = M(C.bone, { roughness: 0.62 });
  const clawM = M(0x2f2822, { roughness: 0.7 });
  const wood = Hide(C.woodDark);
  const woodP = Hide(C.wood);
  const glass = M(C.frost, { flat: false, transparent: true, opacity: 0.42, roughness: 0.22 });
  const silverLiq = Glow(C.silver, 0.85);                           // srebro tinja u bočici
  const oilLiq = M(0x372c18, { flat: false });
  const bloodLiq = M(0x6d1a1c, { flat: false });
  const saltLiq = M(0xe8e2d2, { flat: false });
  const acidLiq = M(0x8ec03a, { flat: false });

  // ---------------------------------------------------------------- orijentiri --
  const hipL = [-0.115, 0.885, 0.00], hipR = [0.115, 0.915, 0.00];
  const kneeL = [-0.148, 0.495, 0.085], kneeR = [0.134, 0.485, -0.030];
  const ankL = [-0.150, 0.140, 0.145], ankR = [0.128, 0.140, -0.105];
  const shL = [-0.200, 1.405, 0.00], shR = [0.200, 1.405, 0.00];
  const elbL = [-0.248, 1.135, 0.048], elbR = [0.192, 1.160, 0.040];
  const wrL = [-0.238, 0.958, 0.046], wrR = [-0.086, 1.148, 0.152];
  const HEAD_Y = 1.6487;   // makeFace stavlja oči na r*0.10 iznad centra -> eyeY = 1.66

  // ================================================================== NOGE ====
  // Zadnja (desna) noga je ispravljena i nosi težinu, prednja je opružena.
  for (const [hip, knee, ank, s] of [[hipL, kneeL, ankL, -1], [hipR, kneeR, ankR, 1]]) {
    g.add(sphere(0.088, lea, hip[0], hip[1], hip[2], 9, 8));               // zglob kuka
    g.add(bar(hip, knee, 0.084, lea, 9, 0.070));                           // butina
    g.add(sphere(0.072, lea, knee[0], knee[1], knee[2], 9, 8));            // koleno kao zglob
    // zakrpa na kolenu, prošivena po gornjem obodu
    g.add(rot(box(0.115, 0.100, 0.020, leaP, knee[0] + s * 0.006, knee[1] + 0.012, knee[2] + 0.062),
      0.16, s * 0.12, s * 0.10));
    g.add(rivets([knee[0] - 0.05, knee[1] + 0.055, knee[2] + 0.068],
      [knee[0] + 0.05, knee[1] + 0.055, knee[2] + 0.068], 4, 0.006, leaD));
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
    for (let i = 0; i < 2; i++) {
      const y = ank[1] + 0.11 + i * 0.145;
      const r = 0.076 - i * 0.006;
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
  const pouch = group([], 0.185, 0.925, 0.030);
  pouch.rotation.y = -0.25;
  pouch.add(box(0.090, 0.105, 0.062, lea, 0, 0, 0));
  pouch.add(box(0.094, 0.030, 0.066, leaD, 0, 0.048, 0.004));        // preklop
  pouch.add(box(0.020, 0.026, 0.014, brass, 0, 0.030, 0.038));       // kopča preklopa
  pouch.add(sphere(0.008, brass, -0.030, 0.048, 0.034, 6, 5));
  pouch.add(sphere(0.008, brass, 0.030, 0.048, 0.034, 6, 5));
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

  chest.add(flat(cyl(0.160, 0.150, 0.300, shirtM, 0, 1.140, 0, 12), 0.76));   // košulja
  chest.add(flat(cyl(0.188, 0.166, 0.220, lea, 0, 1.235, 0, 12), 0.76));      // prsluk
  chest.add(box(0.360, 0.120, 0.190, lea, 0, 1.352, 0));
  chest.add(box(0.420, 0.095, 0.195, lea, 0, 1.418, 0));                      // jaram prsluka

  // prednje ploče prsluka sa opšivom po rubu
  for (const s of [-1, 1]) {
    chest.add(rot(box(0.128, 0.300, 0.028, lea, s * 0.082, 1.200, 0.146), 0.04, -s * 0.16, 0));
    chest.add(rot(box(0.016, 0.310, 0.032, leaD, s * 0.142, 1.200, 0.140), 0.04, -s * 0.16, 0));
  }
  chest.add(box(0.276, 0.300, 0.026, lea, 0, 1.200, -0.148));                 // ploča na leđima
  chest.add(box(0.290, 0.014, 0.030, leaD, 0, 1.352, -0.148));
  chest.add(box(0.290, 0.014, 0.030, leaD, 0, 1.048, -0.148));

  // pertle po sredini prsluka
  for (let i = 0; i < 3; i++) {
    const y = 1.115 + i * 0.078;
    chest.add(rot(box(0.052, 0.008, 0.008, leaP, 0, y, 0.166), 0, 0, 0.62));
    chest.add(rot(box(0.052, 0.008, 0.008, leaP, 0, y, 0.166), 0, 0, -0.62));
  }

  // zakivci po rubovima prsluka i jarma
  chest.add(rivets([-0.155, 1.086, 0.118], [-0.155, 1.322, 0.118], 4, 0.011, steel));
  chest.add(rivets([0.155, 1.086, 0.118], [0.155, 1.322, 0.118], 4, 0.011, steel));
  chest.add(rivets([-0.180, 1.418, 0.092], [0.180, 1.418, 0.092], 5, 0.010, steel));
  chest.add(rivets([-0.160, 1.418, -0.098], [0.160, 1.418, -0.098], 4, 0.010, steel));
  // ogrebotine preko prsluka — dva stara reza
  for (let i = 0; i < 2; i++) {
    chest.add(rot(box(0.006, 0.135, 0.006, leaD, 0.078 + i * 0.032, 1.215, 0.162), 0, 0, -0.34));
  }

  // verižnjača na vratu — vidi se ispod prsluka
  chest.add(chainmail(0.108, 2, 5, mailM, 1.392, 0.052, 0.86, 0.004));

  // ključne kosti i vrat
  chest.add(bar([-0.020, 1.462, 0.036], [-0.168, 1.418, 0.046], 0.020, skin, 6, 0.013));
  chest.add(bar([0.020, 1.462, 0.036], [0.168, 1.418, 0.046], 0.020, skin, 6, 0.013));
  chest.add(cyl(0.058, 0.070, 0.145, skin, 0, 1.510, 0.006, 10));
  chest.add(flat(sphere(0.048, skinLow, 0, 1.492, 0.052, 8, 7), 0.6, 0.9));
  for (const s of [-1, 1]) chest.add(flat(sphere(0.062, skin, s * 0.098, 1.442, -0.010, 8, 7), 0.8, 1.1));
  chest.add(cyl(0.076, 0.070, 0.030, leaD, 0, 1.432, 0.006, 10));   // kožna ogrlica pod verižnjačom

  // ============================================== BANDOLIR SA PET BOČICA =====
  chest.add(strap([
    [0.168, 1.446, -0.020], [0.150, 1.372, 0.126], [0.052, 1.238, 0.170],
    [-0.056, 1.108, 0.164], [-0.150, 1.006, 0.084],
  ], 0.024, leaD, 7));
  chest.add(sphere(0.016, brass, 0.150, 1.372, 0.140, 7, 6));
  chest.add(sphere(0.016, brass, -0.150, 1.006, 0.096, 7, 6));

  // srebro, ulje, krv, so, kiselina
  const liquids = [silverLiq, oilLiq, bloodLiq, saltLiq, acidLiq];
  for (let i = 0; i < 5; i++) {
    const t = 0.10 + i * 0.185;
    const v = vial(glass, liquids[i], 0.138 - t * 0.290, 1.352 - t * 0.330,
      0.176 - Math.abs(t - 0.5) * 0.030, 0.078, 0.019);
    v.rotation.set(-0.12, 0, -0.66);
    chest.add(v);
  }

  // ============================================ OGRLICA OD TROFEJA ===========
  chest.add(strap([
    [-0.100, 1.428, -0.026], [-0.092, 1.386, 0.074], [-0.038, 1.352, 0.116],
    [0.038, 1.352, 0.116], [0.092, 1.386, 0.074], [0.100, 1.428, -0.026],
  ], 0.008, leaD, 5));
  for (let i = 0; i < 5; i++) {
    const a = (i / 4 - 0.5) * 1.9;
    const x = Math.sin(a) * 0.100, z = 0.124 - Math.abs(a) * 0.030, y = 1.344 + Math.abs(a) * 0.030;
    if (i % 2 === 0) {
      chest.add(rot(cone(0.011, 0.052, boneM, x, y - 0.030, z, 6), 0.20, 0, Math.PI + a * 0.3));   // očnjak
    } else {
      chest.add(rot(cone(0.010, 0.044, clawM, x, y - 0.026, z, 6), 0.42, 0, Math.PI + a * 0.4));   // kandža
    }
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

  const shoulderFur = fur(furM, 8, [0.088, 0.048, 0.082], 0.054, 17);
  shoulderFur.position.set(0.212, 1.428, 0.004);
  g.add(shoulderFur);
  const shoulderFur2 = fur(furD, 3, [0.070, 0.030, 0.070], 0.046, 41);
  shoulderFur2.position.set(0.216, 1.396, 0.004);
  g.add(shoulderFur2);
  g.add(bar([0.140, 1.470, 0.030], [0.240, 1.416, 0.030], 0.014, leaD, 5));

  // ================================== KOŽA VUKA PREKO LEVOG RAMENA ==========
  const pelt = group([], -0.184, 1.452, 0.020);
  chest.add(pelt);
  pelt.add(rot(box(0.190, 0.230, 0.040, leaD, 0.020, -0.072, -0.030), 0.10, 0.26, 0.10));
  pelt.add(fur(furM, 7, [0.108, 0.070, 0.096], 0.060, 7));
  pelt.add(fur(furD, 3, [0.086, 0.056, 0.080], 0.052, 23));
  pelt.add(fur(furP, 2, [0.070, 0.040, 0.062], 0.042, 91));

  // dve šape vise na grudima — svaka o svom zglobu, da se mogu njihati
  const paws = [];
  for (const [px, py, pz, len] of [[0.060, -0.086, 0.104, 0.150], [0.148, -0.124, 0.062, 0.126]]) {
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
      [mid[0] + 0.05, mid[1] + 0.030, mid[2] + 0.048], 3, 0.008, brass));
    g.add(rivets([mid[0] - 0.05, mid[1] - 0.040, mid[2] + 0.048],
      [mid[0] + 0.05, mid[1] - 0.040, mid[2] + 0.048], 3, 0.008, brass));
    g.add(box(0.026, 0.020, 0.014, brass, mid[0] + s * 0.052, mid[1], mid[2] + 0.020));
  }
  // levi lakat nosi malu čeličnu kapicu (deo istog kompleta kao naramenik)
  g.add(rot(box(0.080, 0.070, 0.062, steel, elbL[0] - 0.026, elbL[1] + 0.004, elbL[2] - 0.012), 0, 0, 0.30));
  g.add(sphere(0.009, brass, elbL[0] - 0.052, elbL[1] + 0.030, elbL[2] - 0.012, 6, 5));

  // leva rukavica — visi uz butinu, prsti poluskupljeni ali ne stisnuti
  const handL = makeHand({ skin: gloveM, cuff: lea, pose: 'grip', side: -1, s: 0.98 });
  handL.position.set(wrL[0], wrL[1] - 0.030, wrL[2] + 0.004);
  handL.rotation.set(-0.28, 0.22, 0.14);
  g.add(handL);

  // ================================================================= GLAVA ===
  const head = group([], 0, HEAD_Y, 0.008);
  head.rotation.y = 0.06;
  g.add(head);

  const face = makeFace({
    skin, r: 0.113,
    eye: 0x241c16, brow: C.hairBlack,
    browAngle: 0.30,                   // namrštena
    eyeSize: 0.0185, eyeSpread: 0.048,
    mouth: 'line', mouthColor: 0x7d453c,
    wide: 0.96, tall: 1.04, deep: 0.96,
    noseLen: 0.036, noseWide: 0.78,
  });
  head.add(face.group);

  // levo oko je slepo: mlečna beonjača, bez tamne zenice
  face.eyeL.material = milkyWhite;
  face.irisL.material = milkyIris;
  face.irisL.scale.setScalar(0.72);
  // stisnuta usta, sa tvrdim borama u uglovima
  face.mouth.rotation.x = 0.18;
  face.mouth.scale.set(1.05, 0.8, 1);
  const lineM = M(0x8c5a4c);
  for (const s of [-1, 1]) head.add(box(0.010, 0.014, 0.010, lineM, s * 0.026, -0.070, 0.096));
  // podočnjaci — lice je ispijeno
  for (const s of [-1, 1]) {
    const u = sphere(0.020, skinLow, s * 0.048, -0.006, 0.096, 7, 6);
    u.scale.set(1.5, 0.5, 0.4);
    head.add(u);
  }

  // OŽILJAK preko levog oka — tri kratke trake preko obrve, oka i obraza
  head.add(bar([-0.032, 0.076, 0.086], [-0.062, 0.034, 0.082], 0.0068, scarM, 5));
  head.add(bar([-0.062, 0.034, 0.082], [-0.058, -0.014, 0.092], 0.0062, scarM, 5));
  head.add(bar([-0.058, -0.014, 0.092], [-0.070, -0.062, 0.070], 0.0058, scarM, 5));
  head.add(box(0.030, 0.008, 0.010, scarM, -0.046, 0.058, 0.092));            // preseca obrvu
  for (let i = 0; i < 2; i++) {
    head.add(rot(box(0.014, 0.004, 0.006, scarM, -0.052 - i * 0.006, 0.040 - i * 0.048, 0.090), 0, 0, -0.5));
  }

  // kratka crna kosa: desna strana ostavljena, leva obrijana na linije
  const cap = sphere(0.104, hairM, 0.016, 0.030, -0.014, 12, 10);
  cap.scale.set(1.04, 0.96, 1.10);
  head.add(cap);
  head.add(rot(box(0.032, 0.108, 0.116, hairM, 0.094, 0.014, 0.006), 0, 0, -0.10));  // pramen preko desnog uha
  head.add(box(0.070, 0.040, 0.036, hairM, 0.030, 0.048, 0.086));
  head.add(box(0.052, 0.030, 0.030, hairM, 0.010, -0.070, -0.086));                  // potiljak
  head.add(box(0.044, 0.028, 0.028, hairM, 0.008, -0.094, -0.078));
  // pramenovi preko čela
  for (let i = 0; i < 4; i++) {
    head.add(rot(box(0.014, 0.052, 0.012, hairM, -0.022 + i * 0.028, 0.066 - i * 0.004, 0.096),
      0.30, 0, -0.6 + i * 0.32));
  }
  // obrijana strana — koža sa tankim linijama
  head.add(flat(sphere(0.100, stubbleM, -0.032, 0.026, -0.020, 9, 8), 0.62, 1.08));
  for (let i = 0; i < 4; i++) {
    head.add(rot(box(0.004, 0.058, 0.088, hairM, -0.086 + i * 0.004, 0.036 - i * 0.028, -0.020 - i * 0.006), 0, 0, 0.2));
  }
  // koštana alka u desnom uhu
  head.add(rot(torus(0.014, 0.004, boneM, 0.104, -0.030, 0.004, 5, 10), 0, Math.PI / 2));
  head.add(cone(0.006, 0.022, boneM, 0.104, -0.052, 0.004, 5));

  // ======================================================= SABLJA U KORICAMA ==
  // Grupa je osa oružja: +Y je drška, -Y ide u korice. Šaka je dete drške.
  const sword = group([], -0.130, 0.920, 0.060);
  sword.rotation.set(0.42, 0, -0.20);
  g.add(sword);

  sword.add(flat(cyl(0.030, 0.038, 0.660, leaD, 0, -0.360, 0, 8), 0.56));
  sword.add(flat(cyl(0.041, 0.040, 0.052, brass, 0, -0.024, 0, 8), 0.60));      // grlić korica
  for (let i = 0; i < 2; i++) {
    // obruč korica: prsten se posle obrtanja spljošti u istoj osi kao i korice
    const y = -0.070 - i * 0.320;
    const ring = rot(torus(0.040 - i * 0.002, 0.010, brass, 0, y, 0, 6, 14), Math.PI / 2);
    ring.scale.set(1, 0.62, 1);
    sword.add(ring);
    sword.add(sphere(0.008, brass, 0.040, y, 0, 5, 4));
  }
  sword.add(flat(rot(cone(0.030, 0.075, brass, 0, -0.722, 0, 8), Math.PI), 0.60));   // okov na vrhu
  for (let i = 0; i < 3; i++) sword.add(box(0.052, 0.006, 0.024, leaP, 0, -0.180 - i * 0.180, 0.020));

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

  // desna šaka na balčaku; prsti su izdvojeni da se mogu stezati
  const handR = makeHand({ skin: gloveM, cuff: lea, pose: 'grip', side: 1, s: 1.0 });
  handR.position.set(0, 0.140, 0);
  handR.rotation.set(0.10, Math.PI / 2, 0);
  sword.add(handR);
  const fingersR = new THREE.Group();
  for (const c of handR.children.slice(2, 14)) fingersR.add(c);
  handR.add(fingersR);

  // remenje kojim korice vise o pojasu
  g.add(bar([-0.176, 0.992, 0.072], [-0.146, 0.868, 0.046], 0.010, leaD, 5));
  g.add(bar([-0.190, 0.986, 0.014], [-0.150, 0.862, 0.026], 0.010, leaD, 5));
  g.add(sphere(0.010, brass, -0.148, 0.868, 0.046, 6, 5));

  // ============================================== SAMOSTREL PREKO LEĐA =======
  const xb = group([], 0.010, 1.225, -0.238);
  xb.rotation.set(-0.12, 0, 0.62);
  g.add(xb);

  xb.add(box(0.056, 0.600, 0.048, woodP, 0, 0, 0));                     // kundak
  xb.add(box(0.070, 0.100, 0.062, wood, 0, -0.338, 0));                 // peta kundaka
  xb.add(box(0.062, 0.030, 0.052, iron, 0, -0.392, 0));
  xb.add(box(0.058, 0.090, 0.056, leaD, 0, -0.240, 0));                 // kožna obloga
  xb.add(box(0.022, 0.440, 0.020, wood, 0, 0.062, 0.032));              // žleb
  xb.add(box(0.006, 0.440, 0.010, iron, 0, 0.062, 0.042));
  xb.add(box(0.108, 0.058, 0.064, wood, 0, 0.272, 0));                  // mostić za krakove
  xb.add(rivets([-0.040, 0.272, 0.034], [0.040, 0.272, 0.034], 3, 0.008, iron));

  for (const s of [-1, 1]) {
    xb.add(curve([s * 0.046, 0.272, 0.004], [s * 0.330, 0.214, -0.028], [s * 0.030, 0.056, 0], steelD, 0.016, 0.008, 4));
    xb.add(box(0.026, 0.026, 0.030, iron, s * 0.058, 0.268, 0.004));    // vez kraka
    xb.add(bar([s * 0.330, 0.214, -0.028], [0, 0.104, 0.030], 0.005, boneM, 5));    // tetiva
    xb.add(sphere(0.008, leaP, s * 0.322, 0.216, -0.028, 5, 4));
  }
  xb.add(box(0.044, 0.032, 0.038, iron, 0, 0.104, 0.036));              // orah
  xb.add(rot(box(0.018, 0.090, 0.018, iron, 0, 0.030, -0.040), -0.25)); // obarač
  xb.add(box(0.014, 0.030, 0.038, iron, 0, -0.020, -0.030));
  xb.add(curve([-0.040, 0.352, 0.010], [0.040, 0.352, 0.010], [0, 0.090, 0], iron, 0.010, 0.010, 4));  // uzengija
  for (let i = 0; i < 2; i++) xb.add(rot(torus(0.034, 0.008, leaD, 0, -0.110 + i * 0.180, 0, 5, 10), Math.PI / 2));

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
  const fBaseZ = fingersR.position.z;
  anim.custom((t) => {
    const k = ((t % 6.4) + 6.4) % 6.4 / 6.4;
    const e = k < 0.24 ? Math.sin((k / 0.24) * Math.PI) : 0;
    fingersR.position.z = fBaseZ - 0.014 * e;
    fingersR.rotation.y = -0.075 * e;
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
