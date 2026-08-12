// src/heroes/bard.js — Lirien Sedmostruna, putujući pevač
//
// Silueta: nakrivljena kapa sa dugačkim perom, motley dublet podeljen po
// sredini (leva polovina šljiva, desna šafran), polukružni ogrtač preko jednog
// ramena i velika lutnja sa sedam žica prebačena preko tela.
//
// Sav pokret deli isti osnovni ritam (TEMPO) — ruka koja svira, klimanje glave,
// tapkanje stopala, njihanje ogrtača i poskakivanje pera su umnošci iste brzine,
// pa izgleda kao da svira jednu pesmu.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh,
  box, cyl, sphere, torus, bar, group, curve, strap, chain,
  rivets, rivetRing, fringe, makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

const TEMPO = 2.4;          // osnovni ritam pesme
const HALF = TEMPO * 0.5;   // pola takta — ogrtač, dah
const DOUBLE = TEMPO * 2;   // dvostruko — trzanje žica, zvonca, pero

export function createBard() {
  const root = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  const skin = Flesh(C.skinPale);
  const plum = Cloth(C.plum);
  const plumD = Cloth(0x37223d);
  const saff = Cloth(C.saffron);
  const saffD = Cloth(0x9c6b1d);
  const trim = Cloth(C.goldPale);
  const linen = Cloth(C.ivory);
  const wine = Cloth(C.wine);
  const hairM = M(C.hairBrown, { flat: false });
  const hairD = M(0x442810, { flat: false });
  const hide = Hide(C.leather);
  const hideD = Hide(C.leatherDark);
  const gold = Metal(C.gold);
  const brass = Metal(C.brass);
  const silver = Metal(C.silver);
  const wood = M(C.woodPale);
  const woodD = M(C.woodDark);
  const boneM = M(C.bone);
  const dark = M(C.charcoal);

  // -------------------------------------------------------- pomoćne alatke --
  // Zaokreće mesh i vraća ga, da može da se ubaci pravo u add().
  function rotX(m, a) { m.rotation.x = a; return m; }

  // Usmerava grupu tako da njena lokalna -Y osa gleda u dati pravac.
  const DOWN = new THREE.Vector3(0, -1, 0);
  function aim(g, dx, dy, dz) {
    g.quaternion.setFromUnitVectors(DOWN, new THREE.Vector3(dx, dy, dz).normalize());
  }

  /**
   * Dvočlani ud (rame → lakat → zglob) kao lanac grupa, sa lopaticom izbočenom
   * u smeru bendRef. Vraća zglobove da animacija može da ih vrti nezavisno.
   */
  function limb(parent, S, W, L1, L2, bendRef) {
    const s = new THREE.Vector3(S[0], S[1], S[2]);
    const w = new THREE.Vector3(W[0], W[1], W[2]);
    const d = new THREE.Vector3().subVectors(w, s);
    let len = d.length();
    const maxLen = (L1 + L2) * 0.985;
    if (len > maxLen) { d.multiplyScalar(maxLen / len); w.copy(s).add(d); len = maxLen; }
    const dir = d.clone().divideScalar(len);
    const a = (len * len + L1 * L1 - L2 * L2) / (2 * len);
    const h = Math.sqrt(Math.max(1e-6, L1 * L1 - a * a));
    const perp = new THREE.Vector3(bendRef[0], bendRef[1], bendRef[2]);
    perp.sub(dir.clone().multiplyScalar(perp.dot(dir)));
    if (perp.lengthSq() < 1e-8) perp.set(0, -1, 0);
    perp.normalize();
    const E = s.clone().addScaledVector(dir, a).addScaledVector(perp, h);

    const sh = new THREE.Group();
    sh.position.copy(s);
    parent.add(sh);
    const dSE = new THREE.Vector3().subVectors(E, s);
    aim(sh, dSE.x, dSE.y, dSE.z);

    const el = new THREE.Group();
    el.position.set(0, -dSE.length(), 0);
    sh.add(el);
    const dEW = new THREE.Vector3().subVectors(w, E).applyQuaternion(sh.quaternion.clone().invert());
    aim(el, dEW.x, dEW.y, dEW.z);

    const wr = new THREE.Group();
    wr.position.set(0, -dEW.length(), 0);
    el.add(wr);
    return { sh, el, wr, l1: dSE.length(), l2: dEW.length() };
  }

  // ============================================================ KUKOVI ======
  // Težina je na levoj nozi (+X), pa je taj kuk viši.
  const hips = group([], 0, 0.865, 0.004);
  hips.rotation.z = 0.05;
  hips.rotation.y = -0.05;
  root.add(hips);

  hips.add(box(0.285, 0.17, 0.185, hideD, 0, 0, 0));                   // karlica
  // kratka suknjica dubleta — i ona je podeljena po sredini
  for (const s of [1, -1]) {
    const mat = s > 0 ? plum : saff;
    const skirt = box(0.155, 0.155, 0.205, mat, s * 0.078, -0.075, 0);
    skirt.rotation.z = -s * 0.06;
    hips.add(skirt);
    hips.add(box(0.16, 0.022, 0.212, trim, s * 0.079, -0.145, 0));     // opšiv ruba
    hips.add(box(0.018, 0.15, 0.026, s > 0 ? saffD : plumD, s * 0.13, -0.075, 0.104));
  }
  hips.add(box(0.022, 0.17, 0.215, trim, 0, -0.075, 0));               // šav po sredini
  hips.add(fringe(0.145, 10, trim, 0.05, -0.15, 0.75, 0.8));           // resice po rubu

  // pojas
  hips.add(cyl(0.163, 0.166, 0.058, hide, 0, 0.03, 0, 16));
  hips.add(rotX(torus(0.166, 0.011, hideD, 0, 0.058, 0, 6, 18), Math.PI / 2));
  hips.add(rotX(torus(0.168, 0.011, hideD, 0, 0.002, 0, 6, 18), Math.PI / 2));
  hips.add(rivetRing(0.168, 8, 0.011, brass, 0.03, 0.86, 0.2));        // zakivci po pojasu
  hips.add(box(0.062, 0.062, 0.022, gold, 0, 0.03, 0.152));            // kopča
  hips.add(box(0.036, 0.036, 0.03, hideD, 0, 0.03, 0.156));
  hips.add(box(0.014, 0.05, 0.026, gold, 0, 0.03, 0.166));             // jezičak kopče
  // drugi, kosi kaiš preko kuka
  hips.add(strap([[-0.16, 0.075, 0.06], [-0.02, -0.01, 0.15], [0.14, -0.05, 0.06]], 0.014, hideD));
  hips.add(box(0.03, 0.03, 0.016, brass, 0.14, -0.05, 0.062));

  // kesa sa novcem (na desnom kuku junaka)
  const purse = group([], -0.155, -0.035, 0.075);
  purse.rotation.z = -0.18;
  hips.add(purse);
  const purseBody = sphere(0.052, hide, 0, -0.02, 0, 10, 8);
  purseBody.scale.set(1, 1.15, 0.72);
  purse.add(purseBody);
  purse.add(cyl(0.03, 0.042, 0.03, hideD, 0, 0.038, 0, 9));            // grlić
  purse.add(rotX(torus(0.032, 0.007, wine, 0, 0.045, 0, 5, 12), Math.PI / 2));
  purse.add(bar([-0.03, 0.05, 0], [0.03, 0.05, 0], 0.005, wine));      // gajtan
  purse.add(sphere(0.011, gold, 0.016, -0.055, 0.03, 6, 5));           // novčić koji viri

  // futrola sa svicima (na levom kuku, iza)
  const caseG = group([], 0.155, -0.03, -0.055);
  caseG.rotation.set(0.16, 0, -0.24);
  hips.add(caseG);
  caseG.add(cyl(0.036, 0.034, 0.2, hide, 0, 0, 0, 10));
  caseG.add(cyl(0.04, 0.04, 0.03, hideD, 0, 0.105, 0, 10));            // kapak
  caseG.add(rotX(torus(0.038, 0.008, hideD, 0, 0.086, 0, 5, 14), Math.PI / 2));
  caseG.add(cyl(0.012, 0.012, 0.07, linen, -0.012, 0.15, 0.006, 8));   // svitak
  caseG.add(cyl(0.011, 0.011, 0.055, linen, 0.014, 0.135, -0.008, 8));
  caseG.add(strap([[-0.036, 0.05, 0.02], [0, 0.06, 0.04], [0.036, 0.05, 0.02]], 0.007, hideD));
  caseG.add(box(0.02, 0.014, 0.01, brass, 0, 0.062, 0.042));

  // ============================================================ NOGE ========
  // Leva nogavica šafran, desna šljiva — dijagonalno u odnosu na dublet.
  const legL = { hip: [0.098, 0.86, 0.006], knee: [0.108, 0.475, 0.028], ankle: [0.104, 0.118, -0.004] };
  const legR = { hip: [-0.112, 0.855, 0.006], knee: [-0.15, 0.468, 0.062], ankle: [-0.163, 0.118, 0.078] };

  function buildLeg(L, mat, alt) {
    const g = new THREE.Group();
    g.add(bar(L.hip, L.knee, 0.079, mat, 10, 0.057));                  // butina
    g.add(sphere(0.058, mat, L.knee[0], L.knee[1], L.knee[2], 10, 8)); // koleno
    g.add(bar(L.knee, L.ankle, 0.056, mat, 10, 0.041));                // list
    // uzdužna pruga druge boje — motley se nastavlja i po nozi
    const fx = (p, dz) => [p[0], p[1], p[2] + dz];
    g.add(bar(fx(L.hip, 0.062), fx(L.knee, 0.045), 0.014, alt, 6));
    g.add(bar(fx(L.knee, 0.045), fx(L.ankle, 0.036), 0.012, alt, 6));
    // podvezica i mašna nad kolenom
    const gt = torus(0.062, 0.011, wine, L.knee[0], L.knee[1] + 0.052, L.knee[2] + 0.004, 6, 14);
    gt.rotation.x = Math.PI / 2 - 0.1;
    g.add(gt);
    g.add(box(0.03, 0.016, 0.012, wine, L.knee[0] + 0.05, L.knee[1] + 0.052, L.knee[2] + 0.04));
    g.add(box(0.024, 0.013, 0.01, wine, L.knee[0] + 0.062, L.knee[1] + 0.03, L.knee[2] + 0.038));
    // šav sa unutrašnje strane
    g.add(bar(fx(L.knee, -0.05), fx(L.ankle, -0.036), 0.005, alt, 5));
    return g;
  }
  root.add(buildLeg(legL, saff, plumD));
  root.add(buildLeg(legR, plum, saffD));

  // ---------------------------------------------------------- čizme --------
  // Zvonca na sarama — svako u svojoj grupici da može da se njiše.
  const bells = [];
  function buildBoot(x, z, rotY, s) {
    const g = new THREE.Group();
    const b = makeBoot({ mat: hideD, sole: hide, cuff: hide, buckle: brass, s: 1.02 });
    g.add(b);
    // zavrnuta sara
    const cuff = cyl(0.105, 0.088, 0.075, hide, 0, 0.40, -0.03, 10);
    cuff.rotation.x = -0.1;
    g.add(cuff);
    g.add(rotX(torus(0.098, 0.012, hideD, 0, 0.437, -0.03, 6, 14), Math.PI / 2 - 0.1));
    g.add(box(0.09, 0.05, 0.016, hide, 0, 0.425, 0.055));              // preklop napred
    g.add(box(0.04, 0.024, 0.012, brass, 0, 0.30, 0.075));             // kopča
    g.add(box(0.016, 0.09, 0.014, hide, 0.07, 0.28, 0.02));            // remen sa strane
    g.add(box(0.115, 0.007, 0.007, hideD, 0, 0.19, 0.052));            // šav preko stopala
    // dva zvonca
    for (let i = 0; i < 2; i++) {
      const bg = group([], (i === 0 ? -0.075 : 0.062), 0.415, (i === 0 ? 0.03 : -0.045));
      g.add(bg);
      bg.add(bar([0, 0, 0], [0, -0.032, 0], 0.004, hideD, 5));
      const bell = sphere(0.019, gold, 0, -0.048, 0, 8, 7);
      bell.scale.set(1, 0.94, 1);
      bg.add(bell);
      bells.push(bg);
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    g.scale.setScalar(s);
    return g;
  }
  root.add(buildBoot(0.104, -0.02, 0.12, 1.0));
  // desno stopalo tapka — obrtište je na prstima, da peta poskakuje gore
  const tap = group([], -0.163, 0, 0.078 + 0.2);
  root.add(tap);
  const bootR = buildBoot(0, -0.2, -0.24, 1.0);
  tap.add(bootR);

  // ============================================================ TRUP ========
  const torso = group([], 0, 0.98, 0.004);
  torso.rotation.set(-0.025, -0.12, 0.022);   // telo blago uvijeno ka lutnji
  root.add(torso);

  const chest = new THREE.Group();            // samo grudni koš — on diše
  torso.add(chest);

  // dublet: dve polovine, leva šljiva, desna šafran
  for (const s of [1, -1]) {
    const mat = s > 0 ? plum : saff;
    const matD = s > 0 ? plumD : saffD;
    const waist = box(0.138, 0.14, 0.178, mat, s * 0.07, 0.055, 0);
    waist.rotation.z = -s * 0.04;
    chest.add(waist);
    chest.add(box(0.152, 0.155, 0.197, mat, s * 0.077, 0.205, 0.002));
    chest.add(box(0.142, 0.085, 0.183, mat, s * 0.074, 0.322, 0.002));
    // grudi i rame — obline preko kutija
    const pec = sphere(0.075, mat, s * 0.062, 0.25, 0.072, 9, 8);
    pec.scale.set(1, 0.72, 0.5);
    chest.add(pec);
    const shoulderRoll = sphere(0.062, matD, s * 0.155, 0.36, 0.004, 9, 8);
    shoulderRoll.scale.set(0.9, 0.78, 1.0);
    chest.add(shoulderRoll);
    // razrezi kroz koje se vidi platnena košulja
    for (let i = 0; i < 2; i++) {
      chest.add(box(0.016, 0.062, 0.014, linen, s * (0.06 + i * 0.042), 0.23, 0.095));
    }
    chest.add(box(0.018, 0.05, 0.012, linen, s * 0.09, 0.12, 0.09));
    // bočni šav sa gajtanom
    chest.add(bar([s * 0.146, 0.13, 0.06], [s * 0.15, 0.33, 0.05], 0.008, trim, 6));
    chest.add(bar([s * 0.05, 0.135, 0.096], [s * 0.125, 0.135, 0.088], 0.006, matD, 5));
    chest.add(box(0.15, 0.02, 0.19, trim, s * 0.077, -0.012, 0.002));  // opšiv donjeg ruba
  }

  // srednji šav sa opšivom i dugmadima
  chest.add(box(0.024, 0.40, 0.026, trim, 0, 0.17, 0.095));            // opšiv po šavu, spreda
  chest.add(box(0.024, 0.40, 0.026, trim, 0, 0.17, -0.09));            // i po sredini leđa
  chest.add(box(0.02, 0.40, 0.19, trim, 0, 0.17, 0.002));              // sam šav između polovina
  for (let i = 0; i < 6; i++) {
    const y = 0.03 + i * 0.062;
    chest.add(sphere(0.011, gold, 0, y, 0.112, 7, 6));                 // dugmad po šavu
  }
  chest.add(box(0.014, 0.36, 0.008, woodD, 0.021, 0.17, 0.106));       // niz rupica
  // šavovi po grudima
  chest.add(rivets([-0.115, 0.288, 0.075], [0.115, 0.288, 0.075], 5, 0.007, trim));
  chest.add(box(0.24, 0.007, 0.007, trim, 0, 0.058, 0.088));

  // vrat, ključne kosti, kragna — vrat ide dovoljno visoko da uđe pod vilicu
  chest.add(cyl(0.048, 0.056, 0.135, skin, 0, 0.43, 0.008, 10));
  const throat = sphere(0.04, skin, 0, 0.4, 0.042, 9, 8);
  throat.scale.set(1, 0.8, 0.7);
  chest.add(throat);
  for (const s of [1, -1]) {
    chest.add(bar([s * 0.014, 0.372, 0.052], [s * 0.108, 0.352, 0.03], 0.011, skin, 6));
    chest.add(sphere(0.017, skin, s * 0.115, 0.35, 0.028, 7, 6));
  }
  chest.add(cyl(0.09, 0.082, 0.05, linen, 0, 0.385, 0.008, 12));       // okovratnik košulje
  chest.add(cyl(0.078, 0.086, 0.035, plumD, 0, 0.352, 0.008, 12));

  // čipkasta kragna — venac sitnih listića i petljica
  const ruff = group([], 0, 0.402, 0.008);
  chest.add(ruff);
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const p = box(0.044, 0.01, 0.024, linen, Math.sin(a) * 0.082, 0, Math.cos(a) * 0.076);
    p.rotation.y = a;
    p.rotation.x = -0.5;
    ruff.add(p);
  }
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.3;
    const l = torus(0.013, 0.004, linen, Math.sin(a) * 0.092, -0.012, Math.cos(a) * 0.086, 5, 10);
    l.rotation.x = Math.PI / 2;
    l.rotation.z = a;
    ruff.add(l);
  }

  // ============================================================ OGRTAČ ======
  // Polukruž preko levog ramena, sa opšivom po rubu; paneli se njišu u pola takta.
  const cloak = group([], 0.02, 0.375, -0.03);
  torso.add(cloak);
  const cloakPanels = [];
  for (let i = 0; i < 6; i++) {
    const a = 0.14 + i * 0.52;                     // od levog ramena, oko leđa, do desnog boka
    const px = Math.cos(a) * 0.148;
    const pz = -Math.sin(a) * 0.115 - 0.015;
    const len = 0.58 - 0.3 * Math.pow(i / 5, 1.6);
    const pg = group([], px, 0.02, pz);
    pg.rotation.y = Math.PI / 2 - a;
    pg.rotation.x = 0.07;
    cloak.add(pg);
    pg.add(box(0.105, len, 0.026, wine, 0, -len / 2, 0));
    pg.add(box(0.11, 0.026, 0.032, trim, 0, -len, 0));                 // opšiv ruba
    // pruga druge boje na svakom drugom panelu
    if (i % 2 === 0) pg.add(box(0.014, len * 0.9, 0.03, plumD, 0.045, -len / 2, 0.004));
    cloakPanels.push(pg);
  }
  // naramenica ogrtača preko levog ramena
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    const m = box(0.075, 0.05, 0.13 - t * 0.03, wine, 0.04 + t * 0.14, 0.05 - t * 0.055, -0.01 + t * 0.02);
    m.rotation.z = -0.5 - t * 0.35;
    cloak.add(m);
  }
  cloak.add(bar([0.03, 0.055, 0.035], [0.2, -0.03, 0.02], 0.009, trim, 6));

  // kopča ogrtača na desnoj strani grudi
  const clasp = group([], -0.115, 0.01, 0.085);
  cloak.add(clasp);
  clasp.add(torus(0.026, 0.008, gold, 0, 0, 0, 6, 14));
  clasp.add(sphere(0.014, Metal(C.plum, { roughness: 0.25 }), 0, 0, 0.008, 8, 7));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    clasp.add(box(0.008, 0.018, 0.006, gold, Math.sin(a) * 0.03, Math.cos(a) * 0.03, 0));
  }
  cloak.add(chain([-0.1, 0.02, 0.09], [0.06, 0.06, 0.06], 4, 0.011, gold));

  // ============================================================ GLAVA =======
  const neckPivot = group([], 0, 0.452, 0.004);
  torso.add(neckPivot);
  const head = group([], 0, 0.155, 0.012);   // tako da zenice padnu na eyeY = 1.6
  neckPivot.add(head);

  const face = makeFace({
    r: 0.112, skin, tall: 1.04, wide: 0.97, deep: 0.96,
    mouth: 'smile', eye: 0x3d2a18, brow: C.hairBrown, browAngle: 0.1,
  });
  head.add(face.group);
  // lukav izraz — jedna obrva podignuta, osmeh malo iskošen
  face.browL.rotation.z = 0.34;
  face.browL.position.y += 0.016;
  face.browL.position.x += 0.004;
  face.browR.rotation.z = -0.06;
  face.browR.position.y -= 0.004;
  face.mouth.rotation.z = 0.2;
  face.mouth.position.x = 0.006;

  // tanki brčići
  for (const s of [1, -1]) {
    const m = box(0.03, 0.008, 0.01, hairD, s * 0.019, -0.046, 0.098);
    m.rotation.z = s * 0.22;
    head.add(m);
    const tip = box(0.016, 0.006, 0.009, hairD, s * 0.04, -0.052, 0.09);
    tip.rotation.z = s * 0.6;
    head.add(tip);
  }
  // trag brade pod usnom
  head.add(box(0.022, 0.012, 0.01, hairD, 0.002, -0.086, 0.09));

  // dugačka kestenjasta kosa
  // kapa kose mora da ostane ISPOD glave kape, da kosa ne probija šešir
  const hairCap = sphere(0.118, hairM, 0, 0.018, -0.03, 14, 12);
  hairCap.scale.set(1.02, 0.97, 1.02);
  head.add(hairCap);
  const nape = box(0.19, 0.16, 0.1, hairM, 0, -0.05, -0.075);
  head.add(nape);
  const backMass = sphere(0.115, hairD, 0, -0.06, -0.06, 12, 10);
  backMass.scale.set(1.05, 1.1, 0.8);
  head.add(backMass);
  // šiške nad obrvama
  for (let i = 0; i < 4; i++) {
    const f = box(0.04, 0.03, 0.016, hairM, -0.06 + i * 0.04, 0.07 - (i % 2) * 0.008, 0.086);
    f.rotation.z = 0.28 - i * 0.19;
    head.add(f);
  }
  // zalisci
  for (const s of [1, -1]) {
    head.add(box(0.016, 0.06, 0.05, hairD, s * 0.104, -0.012, 0.026));
  }
  // lokne do ramena — savijeni nizovi
  const lockSpec = [
    [0.098, 0.03, 0.03, 0.126, -0.215, 0.04, 0.05, -0.02],
    [-0.098, 0.03, 0.03, -0.126, -0.215, 0.03, -0.05, -0.02],
    [0.088, 0.02, -0.07, 0.132, -0.238, -0.06, 0.055, 0.0],
    [-0.088, 0.02, -0.07, -0.132, -0.238, -0.06, -0.055, 0.0],
    [0.0, 0.0, -0.115, 0.01, -0.25, -0.1, 0.0, -0.03],
  ];
  for (const [ax, ay, az, bx2, by2, bz2, bgx, bgz] of lockSpec) {
    head.add(curve([ax, ay, az], [bx2, by2, bz2], [bgx, -0.02, bgz], hairM, 0.032, 0.018, 3));
  }
  // minđuša u levom uhu
  const earring = torus(0.016, 0.004, gold, 0.108, -0.038, 0.006, 5, 12);
  earring.rotation.y = Math.PI / 2;
  head.add(earring);
  head.add(sphere(0.008, gold, 0.108, -0.055, 0.006, 6, 5));

  // ------------------------------------------------------------- kapa -------
  // Nakrivljena na jednu stranu: rotacija po Z podiže levu (+X) stranu oboda,
  // pa pero stoji na uzdignutoj strani.
  // Obod mora da ostane NAD obrvama (obrve su na head-local y = 0.045), inače
  // preseca lice; visina kape se štedi na niskoj glavi kape, ne na obodu.
  const hat = group([], 0, 0.058, -0.008);
  hat.rotation.set(-0.07, 0.12, 0.17);
  head.add(hat);
  hat.add(cyl(0.19, 0.2, 0.015, plum, 0, 0.006, 0, 18));               // široki obod
  hat.add(rotX(torus(0.197, 0.013, plumD, 0, 0.005, 0, 6, 22), Math.PI / 2));
  hat.add(cyl(0.118, 0.134, 0.055, plum, 0, 0.038, 0, 14));            // niska glava kape
  const crownTop = sphere(0.115, plum, 0, 0.056, 0, 14, 10);
  crownTop.scale.set(1, 0.22, 1);
  hat.add(crownTop);
  hat.add(box(0.018, 0.022, 0.18, plumD, 0.026, 0.06, 0));             // pregib na glavi kape
  hat.add(rotX(torus(0.13, 0.014, saff, 0, 0.022, 0, 6, 20), Math.PI / 2));
  hat.add(box(0.036, 0.028, 0.016, gold, 0.02, 0.022, 0.13));          // kopča na traci
  hat.add(box(0.02, 0.016, 0.012, brass, 0.02, 0.022, 0.138));
  for (let i = 0; i < 2; i++) {
    hat.add(sphere(0.011, brass, -0.06 - i * 0.03, 0.024, 0.112 - i * 0.02, 6, 5));
  }
  hat.add(box(0.08, 0.02, 0.05, plumD, -0.145, 0.022, 0.05));          // obod prikačen uz glavu
  hat.add(box(0.36, 0.006, 0.006, trim, 0, 0.015, 0.058));             // opšiv po obodu

  // pero — spljošteni boksovi u nizu po savijenoj krivoj, u svojoj grupi da poskakuje
  const plume = group([], 0.082, 0.03, -0.05);
  hat.add(plume);
  plume.add(rotX(cyl(0.006, 0.004, 0.05, boneM, 0.01, 0.005, -0.02, 6), 1.3));
  const pA = [0, 0, 0], pB = [0.06, -0.02, -0.31], pC = [0.035, 0.055, -0.15];
  for (let i = 0; i <= 7; i++) {
    const t = i / 7;
    const u = 1 - t;
    const x = u * u * pA[0] + 2 * u * t * pC[0] + t * t * pB[0];
    const y = u * u * pA[1] + 2 * u * t * pC[1] + t * t * pB[1];
    const z = u * u * pA[2] + 2 * u * t * pC[2] + t * t * pB[2];
    const w = 0.055 * (0.35 + Math.sin(t * Math.PI) * 0.9);
    const q = box(w, 0.01, 0.055, i < 6 ? saff : trim, x, y, z);
    q.rotation.y = -0.2 - t * 0.3;
    q.rotation.z = 0.5 - t * 1.1;
    q.rotation.x = -0.2 + t * 0.4;
    plume.add(q);
  }
  // drugo, kraće pero
  const plume2 = group([], 0.03, 0.03, -0.06);
  plume2.rotation.set(0.2, 0.5, 0);
  hat.add(plume2);
  for (let i = 0; i <= 3; i++) {
    const t = i / 3;
    const q = box(0.045 * (0.4 + Math.sin(t * Math.PI) * 0.8), 0.009, 0.045,
      wine, t * 0.02, t * 0.03 - t * t * 0.02, -t * 0.16);
    q.rotation.z = 0.3 - t * 0.7;
    plume2.add(q);
  }

  // ============================================================ LUTNJA ======
  // Lokalni prostor: kruškasto telo u koordinatnom početku, vrat po +Y,
  // trbuh (poklopac) gleda u +Z.
  const lute = group([], -0.2, 0.99, 0.22);
  lute.rotation.set(0.1, 0.16, -1.15);
  root.add(lute);

  // korpa (leđa) — dve spljoštene sfere daju krušku
  const bowl = sphere(0.148, woodD, 0, -0.02, -0.028, 14, 12);
  bowl.scale.set(1, 1.16, 0.62);
  lute.add(bowl);
  const bowlTop = sphere(0.098, woodD, 0, 0.115, -0.022, 12, 10);
  bowlTop.scale.set(1, 0.92, 0.56);
  lute.add(bowlTop);
  // rebra korpe
  for (const s of [-1, 1]) {
    lute.add(curve([s * 0.075, 0.105, -0.03], [s * 0.03, -0.165, -0.02], [s * 0.05, 0, -0.075], wood, 0.009, 0.006, 3));
  }
  // trbuh (poklopac) sa opšivom
  const belly = sphere(0.15, wood, 0, -0.014, 0.052, 16, 12);
  belly.scale.set(1, 1.14, 0.1);
  lute.add(belly);
  const bellyTop = sphere(0.1, wood, 0, 0.12, 0.048, 12, 10);
  bellyTop.scale.set(1, 0.9, 0.1);
  lute.add(bellyTop);
  const binding = torus(0.151, 0.008, woodD, 0, -0.014, 0.05, 6, 26);
  binding.scale.set(1, 1.13, 1);
  lute.add(binding);
  // ogrebotine od godina puta
  const scar = M(0x5c4020);
  lute.add(box(0.05, 0.005, 0.004, scar, 0.05, -0.08, 0.062));
  lute.add(box(0.004, 0.06, 0.004, scar, -0.07, -0.03, 0.06));

  // okrugla rozeta na trbuhu
  const rose = group([], 0, 0.022, 0.062);
  lute.add(rose);
  rose.add(torus(0.046, 0.008, woodD, 0, 0, 0, 6, 20));
  rose.add(torus(0.026, 0.006, woodD, 0, 0, 0.002, 6, 16));
  for (let i = 0; i < 4; i++) {
    const d = box(0.092, 0.006, 0.005, woodD, 0, 0, 0.001);
    d.rotation.z = (i / 4) * Math.PI;
    rose.add(d);
  }
  rose.add(sphere(0.007, dark, 0, 0, 0.004, 6, 5));

  // kobilica sa nizom čepića za žice
  lute.add(box(0.088, 0.013, 0.014, woodD, 0, -0.098, 0.062));
  lute.add(box(0.078, 0.005, 0.006, boneM, 0, -0.09, 0.066));
  lute.add(box(0.03, 0.02, 0.014, woodD, 0, -0.15, 0.05));             // dugme za kaiš
  lute.add(rotX(cyl(0.008, 0.01, 0.022, boneM, 0, -0.168, 0.04, 8), 0.4));

  // vrat sa pragovima
  lute.add(box(0.046, 0.5, 0.03, woodD, 0, 0.37, 0.004));
  lute.add(box(0.05, 0.5, 0.009, wood, 0, 0.37, 0.021));               // hvataljka
  lute.add(box(0.056, 0.05, 0.036, woodD, 0, 0.13, 0.008));            // spoj sa telom
  const fretY = [0.185, 0.245, 0.3, 0.35, 0.395, 0.435, 0.47];
  for (const fy of fretY) {
    lute.add(box(0.052, 0.005, 0.004, boneM, 0, fy, 0.027));
  }
  lute.add(sphere(0.005, boneM, 0.02, 0.272, 0.027, 6, 5));            // oznaka na hvataljci
  lute.add(box(0.052, 0.009, 0.014, boneM, 0, 0.62, 0.022));           // nulti prag

  // glava vrata savijena unazad, sa sedam čivija
  const pegbox = group([], 0, 0.622, 0.012);
  pegbox.rotation.x = -1.1;
  lute.add(pegbox);
  pegbox.add(box(0.042, 0.16, 0.03, woodD, 0, 0.078, 0));
  pegbox.add(box(0.048, 0.016, 0.034, wood, 0, 0.006, 0));
  // sedam čivija, naizmenično sa dve strane glave vrata; šira glava gleda spolja
  for (let i = 0; i < 7; i++) {
    const side = i % 2 === 0 ? 1 : -1;
    const py = 0.03 + Math.floor(i / 2) * 0.036 + (side < 0 ? 0.016 : 0);
    const peg = cyl(0.012, 0.0055, 0.058, woodD, side * 0.032, py, 0, 7);
    peg.rotation.z = -side * Math.PI / 2;
    pegbox.add(peg);
  }
  pegbox.add(box(0.03, 0.03, 0.026, woodD, 0, 0.168, 0));              // završni zavijutak
  pegbox.add(sphere(0.016, woodD, 0, 0.185, -0.004, 8, 7));

  // sedam žica od kobilice do nultog praga
  for (let i = 0; i < 7; i++) {
    const x = -0.018 + i * 0.006;
    lute.add(bar([x, -0.092, 0.068], [x, 0.622, 0.028], 0.0016, silver, 5));
  }

  // leva šaka obuhvata vrat — dete lutnje, jer je osa drške Y osa šake
  const handL = makeHand({ skin, pose: 'grip', side: -1, s: 0.98 });
  handL.position.set(0, 0.55, -0.004);
  handL.rotation.y = 0.15;
  handL.rotation.z = -0.1;
  lute.add(handL);
  handL.add(cyl(0.05, 0.05, 0.045, linen, 0, 0.1, -0.03, 9));          // manžetna košulje
  handL.add(torus(0.014, 0.004, gold, -0.022, 0.014, 0.03, 5, 10));    // prsten
  handL.add(torus(0.013, 0.004, brass, -0.02, -0.038, 0.028, 5, 10));  // prsten na drugom prstu

  // kožni kaiš preko ramena (u prostoru junaka)
  root.add(strap([
    [-0.3, 0.86, 0.28], [-0.34, 1.16, 0.16], [-0.26, 1.4, -0.05], [-0.05, 1.42, -0.12],
  ], 0.013, hide));
  root.add(box(0.03, 0.026, 0.014, brass, -0.335, 1.15, 0.155));
  root.add(box(0.026, 0.022, 0.012, brass, -0.07, 1.415, -0.115));

  // ============================================================ RUKE ========
  // Zglobove računamo u prostoru trupa, pa ruke stvarno hvataju lutnju.
  root.updateMatrixWorld(true);
  const wLeft = new THREE.Vector3();
  handL.getWorldPosition(wLeft);
  const localL = torso.worldToLocal(wLeft.clone());

  const shL = [0.183, 0.383, 0.006];
  const shR = [-0.183, 0.381, 0.006];
  // lakat svirača je izbačen u stranu, podlaktica se vraća napred ka vratu lutnje
  const armL = limb(torso, shL, [localL.x, localL.y, localL.z], 0.245, 0.232, [0.6, -1, 0.1]);

  // desna (svirajuća) ruka: zglob lebdi iznad žica kod kobilice
  const wBridge = new THREE.Vector3(0, -0.098, 0.09);
  lute.localToWorld(wBridge);
  const localR = torso.worldToLocal(wBridge.clone().add(new THREE.Vector3(0.01, 0.07, 0.0)));
  const armR = limb(torso, shR, [localR.x, localR.y, localR.z], 0.245, 0.232, [-0.5, -0.55, -0.7]);

  function dressArm(A, mat, matD) {
    // nadlaktica sa napuhanim rukavom
    const puff = sphere(0.072, matD, 0, -0.045, 0, 10, 9);
    puff.scale.set(1, 0.95, 1);
    A.sh.add(puff);
    A.sh.add(cyl(0.056, 0.047, A.l1 - 0.02, mat, 0, -A.l1 * 0.5 - 0.01, 0, 10));
    for (let i = 0; i < 2; i++) {
      const sl = box(0.016, 0.055, 0.014, linen, 0, -0.06 - i * 0.06, 0.056);
      sl.rotation.x = 0.2;
      A.sh.add(sl);
    }
    A.sh.add(rotX(torus(0.058, 0.009, trim, 0, -0.1, 0, 5, 14), Math.PI / 2));
    A.sh.add(box(0.075, 0.007, 0.007, trim, 0, -0.03, 0.05));          // šav preko rukava
    // lakat kao zaseban zglob
    A.el.add(sphere(0.048, mat, 0, 0, 0, 10, 8));
    A.el.add(cyl(0.045, 0.036, A.l2 - 0.03, mat, 0, -A.l2 * 0.5 - 0.012, 0, 10));
    A.el.add(box(0.05, 0.03, 0.05, matD, 0, -0.02, 0));                // zakrpa na laktu
    A.el.add(rotX(torus(0.04, 0.009, trim, 0, -A.l2 + 0.035, 0, 5, 14), Math.PI / 2));
    A.el.add(cyl(0.043, 0.038, 0.05, linen, 0, -A.l2 + 0.01, 0, 9));   // manžetna
    // podlaktica/zglob
    A.wr.add(sphere(0.034, skin, 0, 0.006, 0, 9, 8));
  }
  dressArm(armL, plum, plumD);
  dressArm(armR, saff, saffD);

  // desna šaka: drži perce (kičicu) i lebdi preko žica
  const pick = group([], 0, -0.012, 0.012);
  pick.rotation.set(0.95, 0.1, -0.35);
  armR.wr.add(pick);
  pick.add(cyl(0.005, 0.004, 0.07, boneM, 0, -0.02, 0, 6));
  pick.add(box(0.011, 0.03, 0.003, boneM, 0, -0.064, 0));
  const handR = makeHand({ skin, pose: 'grip', side: 1, s: 0.98 });
  pick.add(handR);
  handR.add(cyl(0.05, 0.05, 0.045, linen, 0, 0.1, -0.03, 9));
  handR.add(torus(0.014, 0.004, gold, 0.022, 0.014, 0.03, 5, 10));

  // ============================================================ POKRET ======
  // Sve prijavljujemo POSLE zauzimanja mirne poze — Anim pamti zatečene vrednosti.

  // 1) glavni pokret: ruka koja svira prelazi preko žica gore-dole (hod ~12 cm)
  anim.rot(armR.el, 'x', 0.2, TEMPO, 0);
  anim.rot(armR.sh, 'x', 0.06, TEMPO, 0.25);
  anim.rot(armR.wr, 'z', 0.15, DOUBLE, 0.6);
  anim.rot(pick, 'x', 0.12, DOUBLE, 1.1);
  // leva šaka radi prstima po vratu — sitno
  anim.rot(armL.wr, 'x', 0.06, TEMPO, 1.6);
  anim.rot(armL.el, 'z', 0.035, HALF, 0.4);

  // 2) lutnja se blago naginje u ritmu
  anim.rot(lute, 'z', 0.022, TEMPO, 0.7);
  anim.pos(lute, 'y', 0.008, TEMPO, 0.7);

  // 3) pero na kapi poskakuje
  anim.rot(plume, 'x', 0.1, DOUBLE, 1.4);
  anim.rot(plume, 'z', 0.07, TEMPO, 0.2);
  anim.rot(plume2, 'x', 0.1, DOUBLE, 2.2);

  // 4) stopalo tapka u taktu — obrtište je na prstima, peta se diže
  tap.rotation.x = 0.055;
  anim.rot(tap, 'x', 0.055, TEMPO, -0.4);

  // 5) ogrtač se njiše u pola takta, talas putuje kroz panele
  anim.wave(cloakPanels, 'x', 0.05, HALF, 0.42, 0.3);
  anim.wave(cloakPanels, 'z', 0.025, TEMPO, 0.3, 1.1);

  // 6) glava klima u ritmu, telo diše u pola takta
  anim.rot(neckPivot, 'x', 0.05, TEMPO, 0.5);
  anim.rot(neckPivot, 'z', 0.028, HALF, 1.2);
  anim.rot(neckPivot, 'y', 0.03, HALF, 2.0);
  anim.breathe(chest, 0.012, HALF, 0.9);
  anim.rot(torso, 'y', 0.022, HALF, 0.2);

  // 7) zvonca na čizmama zvecka
  for (let i = 0; i < bells.length; i++) {
    anim.rot(bells[i], 'z', 0.11, DOUBLE, i * 0.9);
    anim.rot(bells[i], 'x', 0.07, TEMPO, i * 1.3);
  }

  // 8) treptaji i podignuta obrva koja igra
  anim.blink(face.lidL, 5.0, 0.4, 0.03);
  anim.blink(face.lidR, 5.0, 0.4, 0.03);
  anim.rot(face.browL, 'z', 0.06, HALF, 1.5);
  anim.pos(face.jaw, 'y', 0.004, TEMPO, 0.2);

  return {
    name: 'Lirien Sedmostruna',
    title: 'Putujući pevač',
    blurb: 'Ima sedam žica i bar dvadeset imena, u zavisnosti od toga koliko je dugova ostavio iza sebe u kom gradu. Peva istinu o kraljevima samo dok je dovoljno blizu vrata.',
    heraldry: { color: C.plum, sigil: 'lute' },
    eyeY: 1.6,
    group: root,
    update: (t) => anim.tick(t),
  };
}
