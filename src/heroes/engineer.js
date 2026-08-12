// src/heroes/engineer.js — Grimald Točkar, opsadni majstor
//
// Nizak i vrlo širok kovač-opsadar: kratke debele noge u okovanim čizmama,
// ogromna ramena, kožna kecelja puna opekotina i pojas pretovaren alatom.
// Desna ruka je mesingano-bakarna mašina sa vidljivim klipom i stezačem,
// preko leđa nosi ručnu balistu, a naočare su podignute na čelo.
// Gleda u +Z, stopala na y = 0, visina ~1.45, oči na 1.33.
//
// Sve što stoji na glavi (naočare, kaiš, brada, kosa) postavlja se po
// IZRAČUNATOJ površini lobanje, da nijedan deo ne lebdi ispred lica.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh, Glow,
  box, cyl, sphere, cone, torus, bar, group,
  curve, strap, rivets, rivetRing, edged,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createEngineer() {
  const g = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  // Noćna dvorana: tkanine su prigušene, a metal ide na manje površine, jer
  // jako metalan materijal bez okoline pocrni.
  const brass    = Metal(C.brass, { roughness: 0.42, metalness: 0.72 });
  const brassD   = Metal(0x8c6428, { roughness: 0.5, metalness: 0.66 });
  const copper   = Metal(C.copper, { roughness: 0.46, metalness: 0.68 });
  const copperD  = Metal(0x79431e, { roughness: 0.55, metalness: 0.6 });
  const steel    = Metal(C.steel, { roughness: 0.38, metalness: 0.6 });
  const iron     = M(0x585e68, { roughness: 0.55, metalness: 0.3 });
  const blackI   = M(0x3b4046, { roughness: 0.66, metalness: 0.25 });
  const leather  = Hide(C.leather);
  const leatherD = Hide(C.leatherDark);
  const leatherP = Hide(0x8a6540);
  const wood     = M(C.wood);
  const woodD    = M(C.woodDark);
  const shirt    = Cloth(0x776a52);
  const shirtD   = Cloth(0x574d3c);
  const skin     = Flesh(C.skinTan);
  const skinD    = Flesh(0x9a6440);
  const noseM    = Flesh(0xa2603f);
  const sootM    = M(0x322e29, { roughness: 1 });
  const hairM    = M(0xa9a294);
  const hairW    = M(0xc6bfaf);
  const glassM   = M(0x1b2228, { roughness: 0.16, metalness: 0.55, flat: false });
  const emberM   = Glow(C.emberPale, 1.5);
  const paperM   = Cloth(0xbfb28f);
  const ropeM    = Cloth(0x9b8663);
  const burnM    = M(0x3a2a1c, { roughness: 1 });

  // Zupčanik čija je osa LOKALNA Z osa — zato se okreće preko rotation.z, a
  // usmerava se preko rotation.y (u redosledu XYZ vrtnja po z ide prva).
  function gear(r, teeth, thick, faceMat, toothMat) {
    const gg = new THREE.Group();
    const disc = cyl(r, r, thick, faceMat, 0, 0, 0, Math.max(8, teeth));
    disc.rotation.x = Math.PI / 2;
    gg.add(disc);
    const hub = cyl(r * 0.32, r * 0.32, thick * 1.8, toothMat, 0, 0, 0, 8);
    hub.rotation.x = Math.PI / 2;
    gg.add(hub);
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const tth = box(r * 0.38, r * 0.26, thick, toothMat, Math.cos(a) * r, Math.sin(a) * r, 0);
      tth.rotation.z = a;
      gg.add(tth);
    }
    return gg;
  }

  // ------------------------------------------------------------------ noge --
  // Težina je na desnoj nozi (x < 0) — ona stoji pravo, leva je odmorena,
  // blago savijena u kolenu i izvrnuta u stranu.
  const HIP = 0.655;
  const LEGS = [
    { sx: -1, hx: -0.155, kx: -0.172, ky: 0.415, kz: 0.015, bx2: -0.175, bz: 0.00, yaw: -0.13 },
    { sx:  1, hx:  0.155, kx:  0.198, ky: 0.400, kz: 0.055, bx2:  0.225, bz: -0.02, yaw:  0.42 },
  ];

  for (const L of LEGS) {
    const leg = new THREE.Group();
    const hipP = [L.hx, HIP, 0.005];
    const kneeP = [L.kx, L.ky, L.kz];
    const anklP = [L.bx2, 0.215, L.bz + 0.01];

    // kuk, butina u pantalonama, koleno i cevanica kao zasebni zglobovi
    leg.add(sphere(0.098, shirtD, hipP[0], hipP[1], hipP[2], 10, 8));
    leg.add(bar(hipP, kneeP, 0.092, shirtD, 9));
    leg.add(sphere(0.076, shirtD, kneeP[0], kneeP[1], kneeP[2], 9, 7));
    leg.add(bar(kneeP, anklP, 0.068, leatherD, 8));

    // nabori na nogavici — da butina ne bude gola cev
    for (let i = 0; i < 3; i++) {
      const t = 0.28 + i * 0.2;
      const fx = hipP[0] + (kneeP[0] - hipP[0]) * t;
      const fy = hipP[1] + (kneeP[1] - hipP[1]) * t;
      const fz = hipP[2] + (kneeP[2] - hipP[2]) * t;
      const fold = torus(0.088 - i * 0.004, 0.011, shirt, fx, fy, fz, 6, 12);
      fold.rotation.set(Math.PI / 2 + 0.12 * (i % 2 ? 1 : -1), 0, L.sx * 0.08);
      leg.add(fold);
    }

    // mesingani štitnik kolena sa zakivcima
    const kn = group([], kneeP[0], kneeP[1], kneeP[2] + 0.055);
    const plate = sphere(0.082, brass, 0, 0, 0, 10, 8);
    plate.scale.set(1.0, 0.94, 0.55);
    kn.add(plate);
    const knRim = torus(0.074, 0.014, brassD, 0, 0, 0.012, 6, 14);
    kn.add(knRim);
    kn.add(rivets([-0.052, -0.045, 0.03], [0.052, -0.045, 0.03], 3, 0.012, copper));
    leg.add(kn);

    // okovana čizma
    const boot = makeBoot({ mat: leatherD, sole: blackI, cuff: leather, buckle: brass, s: 0.9 });
    boot.position.set(L.bx2, 0, L.bz);
    boot.rotation.y = L.yaw;
    boot.add(box(0.135, 0.075, 0.10, steel, 0, 0.085, 0.135));      // metalna kapica
    boot.add(box(0.125, 0.032, 0.09, blackI, 0, 0.014, -0.065));    // potkovana peta
    boot.add(box(0.155, 0.028, 0.245, leatherP, 0, 0.185, 0.02));   // kaiš preko stopala
    boot.add(box(0.045, 0.038, 0.022, brass, 0, 0.185, 0.155));     // kopča
    boot.add(rivets([-L.sx * 0.072, 0.30, -0.05], [-L.sx * 0.072, 0.30, 0.05], 2, 0.011, steel));
    leg.add(boot);

    g.add(leg);
  }

  // ------------------------------------------------------------- karlica ----
  const pelvis = box(0.385, 0.17, 0.245, shirtD, 0, 0.705, 0.005);
  g.add(pelvis);
  g.add(box(0.20, 0.13, 0.06, leatherD, 0, 0.635, 0.135));          // prednja preklopnica

  // ------------------------------------------------------------------ trup --
  // Trup je odvojena grana da disanje ne razvlači ruke i glavu. Kutije nisu
  // gole: uspravne ivice su izlomljene kosim letvicama, a preko njih idu
  // šavovi, jaram i nabori.
  const chest = new THREE.Group();
  chest.add(box(0.445, 0.30, 0.305, shirt, 0, 0.955, 0.0));         // grudni koš
  chest.add(edged(0.415, 0.17, 0.29, shirt, shirtD, 0, 0.79, 0.006));   // stomak sa opšivom
  chest.add(edged(0.415, 0.10, 0.275, shirtD, leatherD, 0, 1.065, -0.005)); // jaram/trapezi
  for (const s of [-1, 1]) {
    // obla bočna strana, da silueta nije oštra kutija
    const side = sphere(0.10, shirt, s * 0.198, 0.945, 0.0, 10, 9);
    side.scale.set(0.52, 1.5, 1.48);
    chest.add(side);
    // faseta po uspravnim ivicama
    for (const q of [-1, 1]) {
      const bev = box(0.03, 0.302, 0.03, shirtD, s * 0.2015, 0.955, q * 0.1315);
      bev.rotation.y = Math.PI / 4;
      chest.add(bev);
    }
    // bočni šavovi
    chest.add(box(0.013, 0.29, 0.013, shirtD, s * 0.2245, 0.955, 0.055));
    chest.add(box(0.013, 0.29, 0.013, shirtD, s * 0.2245, 0.955, -0.055));
    // nabori tkanine na boku
    for (let i = 0; i < 3; i++) {
      const fold = box(0.028, 0.02, 0.095, shirtD, s * 0.2245, 0.865 + i * 0.062, 0.015);
      fold.rotation.x = 0.14 * (i % 2 ? 1 : -1);
      chest.add(fold);
    }
  }
  // razdrljen okovratnik: dve preklopnice od vrata ka prsniku
  for (const s of [-1, 1]) {
    const lap = box(0.075, 0.10, 0.026, shirtD, s * 0.058, 1.055, 0.148);
    lap.rotation.z = s * 0.28;
    chest.add(lap);
  }
  chest.add(box(0.055, 0.09, 0.022, shirt, 0, 1.05, 0.150));
  g.add(chest);

  // ramena, ključne kosti i vrat
  for (const s of [-1, 1]) {
    const sh = sphere(0.118, s < 0 ? shirtD : shirt, s * 0.272, 1.048, 0.005, 11, 9);
    sh.scale.set(1.0, 0.92, 1.0);
    g.add(sh);
    g.add(bar([s * 0.042, 1.112, 0.092], [s * 0.208, 1.072, 0.048], 0.019, skin, 6));
    // šav rukava oko ramena
    const seam = torus(0.104, 0.014, shirtD, s * 0.243, 1.04, 0.005, 6, 14);
    seam.rotation.set(0, 0, Math.PI / 2);
    g.add(seam);
  }
  // vrat je izdužen i vidljiv — glava ne sme da sedi na grudima
  g.add(cyl(0.082, 0.098, 0.14, skin, 0, 1.145, 0.006, 11));
  g.add(sphere(0.021, skin, 0, 1.152, 0.078, 8, 7));                // Adamova jabučica
  g.add(bar([-0.042, 1.202, 0.036], [-0.088, 1.088, -0.012], 0.016, skinD, 5));
  g.add(bar([0.042, 1.202, 0.036], [0.088, 1.088, -0.012], 0.016, skinD, 5));
  g.add(bar([-0.03, 1.198, -0.05], [-0.06, 1.10, -0.075], 0.014, skinD, 5));
  g.add(bar([0.03, 1.198, -0.05], [0.06, 1.10, -0.075], 0.014, skinD, 5));
  const collar = torus(0.101, 0.024, shirtD, 0, 1.10, 0.005, 6, 16);
  collar.rotation.x = Math.PI / 2;
  g.add(collar);
  const collar2 = torus(0.096, 0.013, leatherD, 0, 1.122, 0.005, 6, 16);
  collar2.rotation.x = Math.PI / 2;
  g.add(collar2);

  // ---------------------------------------------------------- kecelja ------
  // Kožna kecelja kovača: prsni deo sa opšivom, donji deo sa opekotinama.
  const apron = new THREE.Group();
  apron.add(edged(0.30, 0.27, 0.032, leather, leatherD, 0, 0.945, 0.172));  // prsnik
  const skirt = box(0.435, 0.345, 0.032, leather, 0, 0.615, 0.175);
  skirt.rotation.x = -0.05;
  apron.add(skirt);
  const hem = box(0.395, 0.115, 0.03, leatherP, 0, 0.435, 0.195);
  hem.rotation.x = 0.14;
  apron.add(hem);
  // opekotine — tamne, spljoštene mrlje
  for (const [bx1, by1, bs] of [[-0.11, 0.70, 0.045], [0.09, 0.56, 0.055], [0.14, 0.90, 0.035]]) {
    const bn = sphere(bs, burnM, bx1, by1, 0.192, 7, 6);
    bn.scale.set(1.0, 0.85, 0.16);
    apron.add(bn);
  }
  // šavovi po ivicama
  apron.add(strap([[-0.205, 0.45, 0.198], [-0.212, 0.78, 0.19]], 0.006, leatherD, 5));
  apron.add(strap([[0.205, 0.45, 0.198], [0.212, 0.78, 0.19]], 0.006, leatherD, 5));
  apron.add(box(0.40, 0.012, 0.012, leatherD, 0, 0.79, 0.196));
  apron.add(box(0.40, 0.01, 0.01, leatherD, 0, 0.50, 0.20));
  // naramenice preko ramena do leđa, sa kopčama
  for (const s of [-1, 1]) {
    apron.add(strap([[s * 0.125, 1.075, 0.175], [s * 0.207, 1.128, 0.015], [s * 0.145, 1.058, -0.15]], 0.016, leatherD, 6));
    apron.add(box(0.05, 0.042, 0.022, brass, s * 0.135, 1.03, 0.178));
  }
  // džep sa preklopom
  apron.add(box(0.115, 0.09, 0.03, leatherP, 0.115, 0.635, 0.196));
  apron.add(box(0.125, 0.03, 0.028, leatherD, 0.115, 0.685, 0.20));
  g.add(apron);

  // ------------------------------------------------------------- pojas -----
  const belt = new THREE.Group();
  belt.add(box(0.455, 0.09, 0.315, leatherD, 0, 0.765, 0.005));
  belt.add(box(0.435, 0.05, 0.30, leather, 0, 0.688, 0.005));
  belt.add(box(0.095, 0.095, 0.032, brass, 0, 0.765, 0.20));        // kopča
  belt.add(box(0.052, 0.052, 0.038, brassD, 0, 0.765, 0.205));
  belt.add(box(0.02, 0.055, 0.02, brass, 0.06, 0.765, 0.205));
  belt.add(rivetRing(0.225, 6, 0.012, brass, 0.803, 0.70, 0.35));
  // bočni jastučići pod pojasom — pojas ne visi u vazduhu pored bokova
  for (const s of [-1, 1]) {
    const pad = sphere(0.062, leather, s * 0.196, 0.752, 0.005, 9, 8);
    pad.scale.set(0.78, 0.8, 1.55);
    belt.add(pad);
    const ring = torus(0.026, 0.008, iron, s * 0.222, 0.742, -0.03, 6, 12);
    ring.rotation.y = Math.PI / 2;
    belt.add(ring);
  }
  g.add(belt);

  // ------------------------------------------------- pojas sa alatom -------
  // Svaki alat visi iz sopstvene grupe čije je poreklo u ušici, a do ušice
  // ide vidljiva kožna omča sa pojasa. Sve visi POKRAJ butine, ne kroz nju.
  const hammer = group([], 0.258, 0.688, -0.155);
  hammer.add(torus(0.019, 0.006, iron, 0, 0.005, 0, 6, 10));
  hammer.add(cyl(0.014, 0.016, 0.175, wood, 0, -0.085, 0, 7));
  hammer.add(torus(0.018, 0.005, leatherD, 0, -0.055, 0, 6, 10));
  hammer.add(box(0.052, 0.05, 0.115, steel, 0, -0.185, 0));
  hammer.add(box(0.056, 0.022, 0.05, blackI, 0, -0.185, -0.055));   // rasklepani rog ka nazad
  const hpk = cone(0.026, 0.05, blackI, 0, -0.185, 0.082, 6);
  hpk.rotation.x = Math.PI / 2;
  hammer.add(hpk);
  g.add(hammer);
  g.add(strap([[0.222, 0.758, -0.06], [0.246, 0.718, -0.115], [0.258, 0.692, -0.152]], 0.009, leatherD, 5));

  // ključ
  const wrench = group([], -0.245, 0.690, -0.085);
  wrench.add(torus(0.017, 0.006, iron, 0, 0.005, 0, 6, 10));
  wrench.add(box(0.026, 0.155, 0.014, steel, 0, -0.085, 0));
  wrench.add(box(0.062, 0.032, 0.016, steel, 0, -0.172, 0));
  wrench.add(box(0.018, 0.03, 0.016, steel, -0.026, -0.198, 0));
  wrench.add(torus(0.024, 0.009, steel, 0, -0.035, 0, 6, 12));
  g.add(wrench);
  g.add(strap([[-0.222, 0.758, -0.03], [-0.238, 0.72, -0.062], [-0.245, 0.694, -0.083]], 0.009, leatherD, 5));

  // klešta
  const pliers = group([], 0.15, 0.70, -0.172);
  pliers.add(torus(0.016, 0.006, iron, 0, 0.005, 0, 6, 10));
  pliers.add(bar([0, -0.02, 0], [-0.02, -0.155, 0.01], 0.011, blackI, 6));
  pliers.add(bar([0, -0.02, 0], [0.022, -0.155, -0.01], 0.011, blackI, 6));
  pliers.add(sphere(0.016, steel, 0, -0.075, 0, 7, 6));
  pliers.add(box(0.014, 0.05, 0.012, steel, -0.026, -0.185, 0.012));
  g.add(pliers);
  g.add(strap([[0.148, 0.79, -0.12], [0.152, 0.745, -0.155], [0.15, 0.706, -0.17]], 0.009, leatherD, 5));

  // svrdlo
  const auger = group([], 0.058, 0.70, -0.172);
  auger.add(torus(0.015, 0.005, iron, 0, 0.005, 0, 6, 10));
  auger.add(cyl(0.012, 0.010, 0.18, steel, 0, -0.09, 0, 7));
  for (let i = 0; i < 2; i++) {
    const fl = box(0.03, 0.03, 0.008, steel, 0, -0.075 - i * 0.055, 0);
    fl.rotation.y = i * 1.1;
    auger.add(fl);
  }
  const atip = cone(0.013, 0.035, steel, 0, -0.198, 0, 6);
  atip.rotation.x = Math.PI;
  auger.add(atip);
  g.add(auger);
  g.add(strap([[0.056, 0.79, -0.118], [0.058, 0.745, -0.152], [0.058, 0.706, -0.17]], 0.009, leatherD, 5));

  // kalem konopca
  const coil = group([], -0.075, 0.718, -0.182);
  for (let i = 0; i < 3; i++) {
    const k = torus(0.052 - i * 0.005, 0.014, ropeM, 0, -i * 0.014, 0, 6, 14);
    k.rotation.x = Math.PI / 2 + 0.1;
    coil.add(k);
  }
  coil.add(sphere(0.017, ropeM, 0.05, -0.045, 0.01, 7, 6));
  coil.add(bar([0.05, -0.045, 0.01], [0.06, -0.11, 0.03], 0.008, ropeM, 5));
  g.add(coil);
  g.add(strap([[-0.072, 0.79, -0.12], [-0.075, 0.75, -0.155], [-0.075, 0.722, -0.178]], 0.009, leatherD, 5));

  // futrola sa nacrtima
  const tube = group([], -0.20, 0.70, -0.175);
  tube.rotation.set(-0.20, 0, 0.28);
  tube.add(cyl(0.043, 0.046, 0.26, leatherD, 0, 0.06, 0, 9));
  tube.add(cyl(0.048, 0.048, 0.022, leather, 0, -0.075, 0, 9));
  const tRim = torus(0.046, 0.008, brass, 0, 0.185, 0, 6, 12);
  tRim.rotation.x = Math.PI / 2;
  tube.add(tRim);
  tube.add(cyl(0.012, 0.012, 0.14, paperM, -0.014, 0.245, 0.008, 7));
  tube.add(cyl(0.011, 0.011, 0.115, paperM, 0.016, 0.232, -0.01, 7));
  const tp3 = cyl(0.010, 0.010, 0.13, paperM, 0.002, 0.24, 0.022, 7);
  tp3.rotation.z = 0.12;
  tube.add(tp3);
  tube.add(strap([[-0.05, 0.10, 0], [0.05, 0.06, 0]], 0.007, leather, 5));
  g.add(tube);
  g.add(strap([[-0.20, 0.80, -0.115], [-0.212, 0.765, -0.15], [-0.218, 0.735, -0.172]], 0.009, leatherD, 5));

  // --------------------------------------------------- leva ruka i ključ ---
  // Levom, zdravom rukom se opire o opsadni ključ zaboden u pod. Drška je
  // tanja od dohvata prstiju, da šaka zaista OBUHVATA motku.
  const prop = group([], 0.425, 0, 0.135);
  prop.rotation.set(0.08, 0, -0.10);
  prop.add(cyl(0.019, 0.026, 0.86, woodD, 0, 0.43, 0, 9));
  for (let i = 0; i < 4; i++) {
    const bnd = torus(0.023 - i * 0.001, 0.007, iron, 0, 0.20 + i * 0.16, 0, 6, 12);
    bnd.rotation.x = Math.PI / 2;
    prop.add(bnd);
  }
  for (let i = 0; i < 3; i++) prop.add(torus(0.024, 0.008, leatherD, 0, 0.70 + i * 0.055, 0, 6, 12));
  prop.add(box(0.105, 0.085, 0.05, steel, 0, 0.90, 0));
  prop.add(box(0.036, 0.075, 0.05, steel, -0.058, 0.955, 0));
  prop.add(box(0.036, 0.055, 0.05, steel, 0.058, 0.945, 0));
  prop.add(box(0.115, 0.016, 0.055, iron, 0, 0.862, 0));
  const pPin = cyl(0.014, 0.014, 0.06, brass, 0, 0.885, 0, 7);
  pPin.rotation.x = Math.PI / 2;
  prop.add(pPin);
  prop.add(box(0.062, 0.03, 0.062, blackI, 0, 0.014, 0));
  prop.add(cone(0.03, 0.05, iron, 0, 0.055, 0, 7));
  // šaka u kožnoj rukavici bez prstiju — dete alata, jer je osa drške Y osa šake
  const handL = makeHand({ skin, s: 1.1, pose: 'grip', side: -1, cuff: leather });
  handL.position.set(0, 0.585, 0);
  handL.rotation.y = -0.55;
  const hBack = sphere(0.062, leatherP, 0, 0.006, -0.058, 9, 8);
  hBack.scale.set(1.0, 1.12, 0.6);
  handL.add(hBack);                                                  // obla nadlanica rukavice
  handL.add(box(0.086, 0.02, 0.03, leatherD, 0, 0.062, -0.05));      // rub rukavice
  for (let i = 0; i < 3; i++) {
    handL.add(bar([-0.055, 0.036 - i * 0.036, -0.03], [0.055, 0.03 - i * 0.036, -0.03], 0.008, leatherD, 5));
  }
  handL.add(sphere(0.02, leatherD, 0.052, -0.04, -0.012, 7, 6));     // jastuče palca
  prop.add(handL);
  g.add(prop);

  // ruka: rame -> lakat -> zglob, sa zavrnutim rukavom
  const shL = [0.272, 1.045, 0.01];
  const elL = [0.378, 0.785, 0.07];
  const wrL = [0.472, 0.578, 0.185];
  g.add(bar(shL, [0.325, 0.915, 0.035], 0.082, shirt, 9));           // rukav
  const rollL = torus(0.076, 0.024, shirtD, 0.328, 0.905, 0.038, 6, 14);
  rollL.rotation.set(0.4, 0, 0.35);
  g.add(rollL);
  const rollL2 = torus(0.072, 0.014, shirtD, 0.318, 0.938, 0.03, 6, 14);
  rollL2.rotation.set(0.4, 0, 0.35);
  g.add(rollL2);
  g.add(bar([0.322, 0.925, 0.035], elL, 0.062, skin, 9));            // biceps
  const bicep = sphere(0.062, skin, 0.345, 0.865, 0.06, 9, 8);
  bicep.scale.set(0.9, 1.15, 0.9);
  g.add(bicep);
  g.add(sphere(0.054, skin, elL[0], elL[1], elL[2], 9, 8));          // lakat
  g.add(bar(elL, wrL, 0.052, skin, 9));                              // podlaktica
  const fore = sphere(0.055, skin, 0.41, 0.70, 0.115, 9, 8);
  fore.scale.set(0.85, 1.2, 0.85);
  g.add(fore);
  g.add(bar([0.395, 0.745, 0.15], [0.445, 0.645, 0.18], 0.009, skinD, 5));  // izbočena žila

  // ============================================ MEHANIČKA DESNA RUKA ======
  // Mesing i bakar. Rame je BUBANJ čija je osa X: naslanja se na bočnu stranu
  // trupa (spoj je nevidljiv), pa nijedan zupčanik ne ulazi u grudi. Klip je
  // spušten niz nadlakticu, izvan poluprečnika bubnja, da ne probija rame.
  const mech = new THREE.Group();

  const mShoulder = group([], -0.30, 1.035, 0.0);
  const drum = cyl(0.118, 0.126, 0.16, brass, 0.005, 0, 0, 12);
  drum.rotation.z = Math.PI / 2;
  mShoulder.add(drum);
  for (const [dx, dr, dt, dm] of [[0.072, 0.128, 0.013, copper], [0.005, 0.122, 0.011, copper], [-0.055, 0.119, 0.011, brassD]]) {
    const rib = torus(dr, dt, dm, dx, 0, 0, 6, 16);
    rib.rotation.y = Math.PI / 2;
    mShoulder.add(rib);
  }
  const dCap = sphere(0.113, brass, -0.075, 0, 0, 12, 10);
  dCap.scale.set(0.55, 1, 1);
  mShoulder.add(dCap);
  // zakivci po obodu bubnja
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    mShoulder.add(sphere(0.011, copper, 0.048, Math.sin(a) * 0.119, Math.cos(a) * 0.119, 6, 5));
  }
  // ogrebotine po oklopu
  mShoulder.add(box(0.09, 0.005, 0.004, brassD, -0.02, 0.10, 0.055));
  mShoulder.add(box(0.07, 0.004, 0.005, brassD, 0.02, 0.075, 0.095));
  // osovina i veliki zupčanik na spoljnoj strani, pa manji koji se hvata o njega
  const boss = cyl(0.05, 0.058, 0.055, brassD, -0.105, 0, 0, 10);
  boss.rotation.z = Math.PI / 2;
  mShoulder.add(boss);
  const gearBig = gear(0.078, 8, 0.026, brass, copper);
  gearBig.position.set(-0.128, 0, 0);
  gearBig.rotation.y = Math.PI / 2;
  mShoulder.add(gearBig);
  const gearSml = gear(0.04, 6, 0.02, copper, brassD);
  gearSml.position.set(-0.128, 0.116, 0.022);
  gearSml.rotation.y = Math.PI / 2;
  mShoulder.add(gearSml);
  mShoulder.add(bar([-0.055, 0.082, 0.028], [-0.128, 0.116, 0.022], 0.011, brassD, 6));  // nosač osovine
  // lampica utonula u oklop
  mShoulder.add(sphere(0.015, emberM, 0.045, 0.072, 0.098, 8, 7));
  const lampRim = torus(0.021, 0.006, brassD, 0.045, 0.07, 0.095, 6, 12);
  lampRim.rotation.set(0.9, 0, 0);
  mShoulder.add(lampRim);
  // ploče kojima je ruka prikovana za trup, spreda i sa leđa
  for (const zz of [0.152, -0.152]) {
    const pl = box(0.075, 0.135, 0.022, brass, 0.132, -0.045, zz);
    mShoulder.add(pl);
    mShoulder.add(rivets([0.132, -0.095, zz + (zz > 0 ? 0.014 : -0.014)],
      [0.132, 0.005, zz + (zz > 0 ? 0.014 : -0.014)], 3, 0.009, copper));
    mShoulder.add(strap([[0.132, -0.045, zz * 0.92], [0.10, -0.03, zz * 0.75],
      [0.055, -0.02, zz * 0.58]], 0.012, brass, 5));
  }
  mech.add(mShoulder);

  // --- nadlaktica: cev, cilindar sa klipom, kablovi
  const mUpper = group([], -0.005, -0.05, 0.0);
  mUpper.rotation.set(-0.06, 0, -0.12);
  const j1 = torus(0.07, 0.02, copperD, 0, -0.055, 0, 6, 14);
  j1.rotation.x = Math.PI / 2;
  mUpper.add(j1);
  mUpper.add(cyl(0.062, 0.055, 0.20, brass, 0, -0.14, 0, 10));
  for (const yy of [-0.09, -0.20]) {
    const bnd = torus(0.064, 0.012, copper, 0, yy, 0, 6, 14);
    bnd.rotation.x = Math.PI / 2;
    mUpper.add(bnd);
  }
  mUpper.add(rivets([0.0, -0.07, 0.062], [0.0, -0.21, 0.055], 2, 0.010, steel));
  // cilindar sa poklopcima — spušten niz cev i izvučen napred, tako da mu ni
  // najviši položaj klipa ne ulazi u rameni bubanj
  mUpper.add(cyl(0.034, 0.034, 0.115, copperD, 0, -0.193, 0.082, 8));
  mUpper.add(cyl(0.038, 0.038, 0.015, brassD, 0, -0.133, 0.082, 8));
  mUpper.add(cyl(0.038, 0.038, 0.015, brassD, 0, -0.253, 0.082, 8));
  // KLIP — klizi po Y unutar cilindra, vrh mu ostaje izvan ramenog bubnja
  const piston = group([], 0, 0, 0);
  piston.add(cyl(0.0135, 0.0135, 0.14, steel, 0, -0.178, 0.082, 7));
  piston.add(cyl(0.03, 0.03, 0.018, brass, 0, -0.100, 0.082, 8));
  piston.add(box(0.05, 0.014, 0.03, brassD, 0, -0.088, 0.082));
  mUpper.add(piston);
  // kabl kroz nekoliko tačaka, od ploče do lakta
  mUpper.add(strap([[0.052, -0.05, -0.032], [0.064, -0.13, -0.052], [0.05, -0.215, -0.028]], 0.008, blackI, 5));

  // --- podlaktica
  const mFore = group([], 0, -0.245, 0);
  mFore.rotation.set(-0.98, 0, 0.10);
  const j2 = torus(0.064, 0.021, brassD, 0, 0, 0, 6, 14);
  j2.rotation.x = Math.PI / 2;
  mFore.add(j2);
  mFore.add(sphere(0.05, copper, 0, 0, 0, 9, 8));
  const axle = cyl(0.016, 0.016, 0.145, steel, 0, 0, 0, 7);
  axle.rotation.z = Math.PI / 2;
  mFore.add(axle);
  mFore.add(cyl(0.055, 0.046, 0.19, copper, 0, -0.10, 0, 10));
  mFore.add(cyl(0.058, 0.058, 0.045, brass, 0, -0.055, 0, 10));
  mFore.add(rivets([0.0, -0.04, 0.05], [0.0, -0.165, 0.042], 2, 0.010, brassD));
  // mali cilindar sa šipkom uz podlakticu
  mFore.add(cyl(0.022, 0.022, 0.085, brassD, 0, -0.095, 0.058, 8));
  mFore.add(cyl(0.009, 0.009, 0.05, steel, 0, -0.032, 0.058, 6));
  // sitan zupčanik uz zglob
  const gearFore = gear(0.03, 5, 0.014, brass, copperD);
  gearFore.position.set(0.058, -0.10, 0.012);
  gearFore.rotation.y = Math.PI / 2;
  mFore.add(gearFore);
  mFore.add(strap([[-0.05, -0.02, -0.03], [-0.058, -0.10, -0.045], [-0.042, -0.185, -0.02]], 0.007, blackI, 5));

  // --- STEZAČ: dva klešta-prsta sa nazubljenim vrhovima
  const clamp = group([], 0, -0.208, 0);
  const j3 = torus(0.05, 0.017, copperD, 0, 0, 0, 6, 14);
  j3.rotation.x = Math.PI / 2;
  clamp.add(j3);
  clamp.add(box(0.078, 0.062, 0.072, brass, 0, -0.042, 0));
  clamp.add(box(0.086, 0.016, 0.078, brassD, 0, -0.072, 0));
  clamp.add(sphere(0.021, emberM, 0, -0.038, 0.042, 8, 7));          // sjaj u zglobu
  for (let i = 0; i < 2; i++) clamp.add(torus(0.014, 0.005, steel, 0, -0.032 - i * 0.018, -0.048, 6, 10));
  const jaws = [];
  for (const s of [-1, 1]) {
    const jaw = group([], s * 0.032, -0.072, 0.006);
    jaw.rotation.z = -s * 0.20;
    jaw.add(box(0.026, 0.055, 0.045, brass, 0, -0.026, 0));
    jaw.add(box(0.022, 0.05, 0.038, copper, s * 0.006, -0.072, 0.008));
    const tip = cone(0.017, 0.045, brassD, s * 0.014, -0.115, 0.016, 6);
    tip.rotation.set(0.2, 0, s * 0.35);
    jaw.add(tip);
    for (let i = 0; i < 2; i++) {
      jaw.add(cone(0.006, 0.014, steel, -s * 0.009, -0.10 - i * 0.018, 0.024, 5));
    }
    clamp.add(jaw);
    jaws.push(jaw);
  }
  mFore.add(clamp);
  mUpper.add(mFore);
  mShoulder.add(mUpper);
  g.add(mech);

  // ------------------------------------------------------------------ glava --
  // Glava je podignuta tako da se vrat vidi; bez zavrtanja po z, da oči ostanu
  // na istoj visini.
  const headPivot = group([], 0, 1.315, 0.012);
  headPivot.rotation.set(0.03, 0, 0);

  const HR = 0.136, HW = 1.14, HT = 0.97, HD = 0.94;
  const AX = HR * HW, AY = HR * HT, AZ = HR * HD;
  // površina lobanje: z za dato (x, y)
  const sZ = (x, y) => {
    const k = 1 - (x / AX) ** 2 - (y / AY) ** 2;
    return k <= 0.02 ? 0 : AZ * Math.sqrt(k);
  };
  // tačka na lobanji na visini y, pod uglom a (0 = ispred, raste ka +x)
  const sPt = (a, y, inset = 1) => {
    const k = Math.max(0, 1 - (y / AY) ** 2);
    const c = Math.sqrt(k) * inset;
    return [Math.sin(a) * AX * c, y, Math.cos(a) * AZ * c];
  };

  const face = makeFace({
    skin, r: HR, wide: HW, tall: HT, deep: HD,
    eye: 0x40503c, eyeSize: 0.0205, eyeSpread: 0.058, eyeY: 0.014, eyeZ: 0.110,
    brow: 0x8d8779, browAngle: 0.26, browY: 0.058,
    noseWide: 1.2, noseLen: 0.052, noseY: -0.026,
    mouth: 'frown', mouthY: -0.078, mouthColor: 0x8a4a40,
  });
  headPivot.add(face.group);

  // crven, razvaljen nos — utonuo u koren nosa iz alatnice, ne nalepljen ispred
  const rnose = sphere(0.031, noseM, 0, -0.028, 0.117, 9, 8);
  rnose.scale.set(1.2, 0.95, 1.1);
  headPivot.add(rnose);
  for (const s of [-1, 1]) {
    headPivot.add(sphere(0.009, M(0x6d3a2a), s * 0.019, -0.043, 0.128, 6, 5));  // nozdrve
  }
  headPivot.add(sphere(0.012, noseM, 0, -0.012, 0.128, 7, 6));

  // guste sede obrve: čuperci polegli PO nadočnom grebenu, ne ravna daščica
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const bxp = s * (0.024 + i * 0.021);
      const byp = 0.048 + i * 0.009;
      const t = box(0.030, 0.019, 0.026, i === 3 ? hairW : hairM, bxp, byp, sZ(bxp, byp) - 0.006);
      t.rotation.set(0, -s * (0.28 + i * 0.16), -s * (0.16 + i * 0.10));
      headPivot.add(t);
    }
  }

  // čađ na obrazu — spljoštene mrlje po površini
  const soot1 = sphere(0.042, sootM, 0.082, -0.035, sZ(0.082, -0.035) - 0.028, 8, 7);
  soot1.scale.set(1.0, 0.8, 0.4);
  headPivot.add(soot1);
  const soot2 = sphere(0.020, sootM, 0.104, 0.012, sZ(0.104, 0.012) - 0.022, 7, 6);
  soot2.scale.set(1.0, 0.7, 0.4);
  headPivot.add(soot2);
  const soot3 = sphere(0.016, sootM, -0.072, -0.062, sZ(-0.072, -0.062) - 0.018, 7, 6);
  soot3.scale.set(1.0, 0.7, 0.4);
  headPivot.add(soot3);

  // ------------------------------------------------------ brada i brkovi ---
  // Pramenovi počinju NA lobanji i skupljaju se pod bradom — nema odvojenih
  // grudvi u vazduhu i nema jedne glatke ploče.
  const strand = (base, tip, r0, r1, mat) => headPivot.add(bar(base, tip, r0, mat, 5, r1));

  for (let i = 0; i < 13; i++) {                       // gornji red: jagodice i vilica
    const u = (i / 12) * 2 - 1;
    const a = u * 1.16;
    const y0 = -0.016 + Math.abs(u) * 0.036;
    const base = sPt(a, y0, 0.985);
    const tip = [Math.sin(a) * 0.086, -0.108 - Math.cos(a) * 0.012, Math.cos(a) * 0.094];
    strand(base, tip, 0.021, 0.011, i % 4 === 1 ? hairW : hairM);
  }
  for (let i = 0; i < 12; i++) {                       // donji red: pod bradom
    const u = (i / 11) * 2 - 1;
    const a = u * 1.02;
    const y0 = -0.066 + Math.abs(u) * 0.03;
    const base = sPt(a, y0, 0.98);
    const tip = [Math.sin(a) * 0.062, -0.156 - Math.cos(a) * 0.006, Math.cos(a) * 0.072];
    strand(base, tip, 0.019, 0.009, i % 3 === 0 ? hairW : hairM);
  }
  // brkovi: dva krila od korena nosa ka uglovima usta
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bxp = s * (0.016 + i * 0.017);
      const byp = -0.050 - i * 0.004;
      const base = [bxp, byp, sZ(bxp, byp) - 0.008];
      const tip = [s * (0.048 + i * 0.024), -0.088 - i * 0.012, 0.082 - i * 0.014];
      strand(base, tip, 0.014, 0.007, i === 1 ? hairW : hairM);
    }
  }

  // ------------------------------------------------------------------ kosa --
  // Teme je ćelavo; venac pramenova ide od zaliska preko potiljka.
  for (let i = 0; i < 16; i++) {
    const a = 1.30 + (i / 15) * (Math.PI * 2 - 2.60);
    const y0 = 0.058 - Math.abs(Math.cos(a)) * 0.010;
    const base = sPt(a, y0, 0.985);
    const tip = sPt(a, y0 - 0.088, 1.05);
    strand(base, tip, 0.022, 0.010, i % 3 === 0 ? hairW : hairM);
  }
  // zalisci koji se spajaju sa bradom
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const a = s * (1.30 - i * 0.14);
      const base = sPt(a, 0.030 - i * 0.012, 0.985);
      const tip = sPt(a, -0.052 - i * 0.014, 1.02);
      strand(base, tip, 0.021, 0.011, hairM);
    }
  }
  // retke vlasi prebačene preko ćelavog temena — kratke tetive, da ne utonu
  for (let i = 0; i < 3; i++) {
    const a = -0.55 + i * 0.5;
    strand(sPt(a, 0.106, 1.02), sPt(a + 0.6, 0.100, 1.02), 0.013, 0.006, i === 1 ? hairW : hairM);
  }
  // uši dobijaju obrub, da ne budu gole kapljice
  for (const s of [-1, 1]) {
    const er = torus(0.019, 0.005, skinD, s * 0.137, 0.008, 0.0, 6, 12);
    er.rotation.set(0, s * Math.PI / 2, 0.2);
    headPivot.add(er);
  }

  // ------------------------------------------- NAOČARE PODIGNUTE NA ČELO ---
  // Svako staklo je u svojoj grupi nagnutoj po normali čela, pa okvir LEŽI na
  // čelu; kaiš obilazi glavu po njenoj površini i vidi se sa strane.
  const goggles = new THREE.Group();
  const GX = 0.053, GY = 0.085, GZ = 0.085;
  for (const s of [-1, 1]) {
    const lensG = group([], s * GX, GY, GZ);
    lensG.rotation.set(-0.75, s * 0.297, 0);          // po normali čela na toj visini
    lensG.add(torus(0.036, 0.011, brass, 0, 0, 0, 7, 16));
    const glass = cyl(0.031, 0.031, 0.006, glassM, 0, 0, 0.004, 10);
    glass.rotation.x = Math.PI / 2;
    lensG.add(glass);
    const inner = torus(0.026, 0.006, brassD, 0, 0, 0.007, 6, 14);
    lensG.add(inner);
    for (let i = 0; i < 5; i++) {
      const a = 0.4 + (i / 5) * Math.PI * 2;
      lensG.add(sphere(0.0055, brassD, Math.cos(a) * 0.040, Math.sin(a) * 0.040, 0.002, 6, 5));
    }
    goggles.add(lensG);
  }
  goggles.add(bar([-0.012, 0.094, 0.0953], [0.012, 0.094, 0.0953], 0.009, brassD, 7));
  // kaiš: tačke leže na lobanji, pa se traka vidi kako je obuhvata
  const gsR = [
    [0.098, 0.076, 0.073],
    sPt(1.08, 0.058, 0.99),
    sPt(1.66, 0.052, 0.99),
    sPt(2.27, 0.046, 0.99),
    sPt(2.79, 0.042, 0.99),
  ];
  const gsL = gsR.map(([x, y, z]) => [-x, y, z]);
  goggles.add(strap([...gsL, sPt(Math.PI, 0.040, 0.99), ...gsR.slice().reverse()], 0.011, leatherD, 6));
  // kopča i prevoj kaiša uz levu slepoočnicu
  const gb = sPt(1.66, 0.052, 1.0);
  goggles.add(box(0.022, 0.028, 0.016, brass, -gb[0] - 0.004, gb[1], gb[2]));
  goggles.add(box(0.02, 0.024, 0.014, brassD, gb[0] + 0.004, gb[1] - 0.002, gb[2]));
  headPivot.add(goggles);
  g.add(headPivot);

  // ------------------------------------------------- ručna balista na leđima --
  // Spuštena i skupljena: krakovi luka ostaju unutar siluete, da nijedna motka
  // ne izbija kroz rame. Leži na kožnom jastuku uz leđa i drže je naramenice.
  g.add(box(0.24, 0.17, 0.055, leatherD, 0, 1.0, -0.185));
  g.add(box(0.26, 0.02, 0.03, leatherP, 0, 1.075, -0.19));
  const bal = group([], 0, 0.955, -0.295);
  bal.rotation.set(0.10, 0, 0.16);
  bal.add(box(0.24, 0.115, 0.055, blackI, 0, 0, 0.055));            // nosač
  bal.add(rivets([-0.09, 0.04, 0.085], [0.09, 0.04, 0.085], 2, 0.011, brass));
  // kratki debeli luk
  for (const s of [-1, 1]) {
    bal.add(curve([s * 0.03, 0.01, 0.0], [s * 0.295, 0.0, 0.085], [s * 0.04, 0.006, 0.03], wood, 0.032, 0.016, 3));
    bal.add(sphere(0.017, blackI, s * 0.295, 0.0, 0.085, 7, 6));
  }
  // zategnuta tetiva
  bal.add(bar([-0.295, 0.0, 0.085], [0, 0.015, 0.115], 0.006, ropeM, 5));
  bal.add(bar([0, 0.015, 0.115], [0.295, 0.0, 0.085], 0.006, ropeM, 5));
  // kundak sa mehanizmom
  bal.add(box(0.07, 0.062, 0.30, woodD, 0, 0.0, -0.10));
  bal.add(box(0.03, 0.022, 0.26, iron, 0, 0.042, -0.09));
  const gearBal = gear(0.038, 5, 0.016, brass, copperD);
  gearBal.position.set(0.045, 0.0, -0.20);
  gearBal.rotation.y = Math.PI / 2;
  bal.add(gearBal);
  bal.add(bar([0.05, 0.0, -0.20], [0.085, 0.055, -0.20], 0.008, iron, 6));
  bal.add(sphere(0.016, wood, 0.088, 0.062, -0.20, 7, 6));
  bal.add(box(0.014, 0.045, 0.02, iron, 0, -0.045, -0.16));
  // dve strele u ležištu
  for (let i = 0; i < 2; i++) {
    const s = i === 0 ? -1 : 1;
    const sx2 = 0.055 * s;
    bal.add(bar([sx2, 0.075, -0.20], [sx2 * 0.6, 0.055, 0.135], 0.009, wood, 6));
    const atp = cone(0.014, 0.05, steel, sx2 * 0.55, 0.052, 0.175, 6);
    atp.rotation.x = Math.PI / 2;
    bal.add(atp);
    bal.add(box(0.004, 0.03, 0.045, leatherP, sx2, 0.078, -0.185));
  }
  g.add(bal);
  // naramenice: preko ramena na grudi, tako da se vidi da je oružje nošeno
  for (const s of [-1, 1]) {
    g.add(strap([
      [s * 0.095, 1.005, -0.235], [s * 0.14, 1.075, -0.14],
      [s * 0.152, 1.122, 0.0], [s * 0.115, 1.055, 0.14],
    ], 0.013, leatherD, 5));
    g.add(box(0.042, 0.036, 0.02, brass, s * 0.118, 1.02, 0.152));
  }

  // =============================================================== POKRET ===
  // Sve se prijavljuje POSLE zauzimanja mirne poze, pa svaki pokret pamti
  // zatečenu vrednost kao osnovu. update(t) je čista funkcija vremena.
  anim.spin(gearBig, 'z', 0.82);            // glavni zupčanik na ramenu
  anim.spin(gearSml, 'z', -1.60);           // manji, u suprotnom smeru
  anim.spin(gearFore, 'z', 1.15);
  anim.spin(gearBal, 'z', -0.42);
  anim.pos(piston, 'y', 0.014, 2.55, 0.6);  // klip klizi u cilindru
  anim.pulse(emberM, 1.45, 0.7, 2.05);      // sjaj u zglobu pulsira
  anim.rot(jaws[0], 'z', 0.055, 1.7, 0.0);  // stezač se blago otvara i zatvara
  anim.rot(jaws[1], 'z', -0.055, 1.7, 0.0);
  anim.rot(hammer, 'x', 0.06, 1.35, 0.4);   // alat o pojasu se njiše
  anim.rot(wrench, 'z', 0.05, 1.05, 2.1);
  anim.rot(pliers, 'x', 0.07, 1.55, 1.2);
  anim.rot(coil, 'x', 0.045, 0.9, 0.3);
  anim.breathe(chest, 0.019, 1.02);         // teško disanje
  anim.rot(mShoulder, 'x', 0.022, 1.02, 0.0);
  anim.scan(headPivot, 0.13, 8.5, 1.6);     // povremeni okret glave
  anim.blink(face.lidL, 4.6, 0.0, 0.028);
  anim.blink(face.lidR, 4.6, 0.05, 0.028);
  anim.rot(mFore, 'x', 0.045, 0.68, 1.9);   // mehanička ruka se lagano pomera
  anim.rot(handL, 'y', 0.03, 0.74, 2.6);

  return {
    name: 'Grimald Točkar',
    title: 'Opsadni majstor',
    blurb: 'Tvrdi da nijedna kapija nije zaključana, samo nedovoljno shvaćena. Desnu ruku je izgubio pod vlastitim ovnom na Tvrdoj Steni, pa ju je iskovao ponovo — kaže da je ova bolja, jer ova ne drhti.',
    heraldry: { color: C.brass, sigil: 'gear' },
    eyeY: 1.33,
    group: g,
    update: (t) => anim.tick(t),
  };
}
