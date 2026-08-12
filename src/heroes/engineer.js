// src/heroes/engineer.js — Grimald Točkar, opsadni majstor
//
// Nizak i vrlo širok kovač-opsadar: kratke debele noge u okovanim čizmama,
// ogromna ramena, kožna kecelja puna opekotina i pojas pretovaren alatom.
// Desna ruka je mesingano-bakarna mašina sa vidljivim klipom i stezačem,
// preko leđa nosi ručnu balistu, a naočare su podignute na čelo.
// Gleda u +Z, stopala na y = 0, visina ~1.45, oči na 1.30.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh, Glow,
  box, cyl, sphere, cone, torus, bar, group,
  curve, strap, rivets, rivetRing, fur, edged,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createEngineer() {
  const g = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  const brass    = Metal(C.brass);
  const brassD   = Metal(0x8c6428, { roughness: 0.46 });
  const copper   = Metal(C.copper);
  const copperD  = Metal(0x79431e, { roughness: 0.52 });
  const steel    = Metal(C.steel, { roughness: 0.3 });
  const iron     = Metal(C.iron, { roughness: 0.52 });
  const blackI   = Metal(C.blackIron, { roughness: 0.62 });
  const leather  = Hide(C.leather);
  const leatherD = Hide(C.leatherDark);
  const leatherP = Hide(C.leatherPale);
  const wood     = M(C.wood);
  const woodD    = M(C.woodDark);
  const shirt    = Cloth(0x8b7c62);
  const shirtD   = Cloth(0x6b5f49);
  const skin     = Flesh(C.skinTan);
  const skinD    = Flesh(0x9a6440);
  const noseM    = Flesh(0xb3583c);
  const sootM    = M(0x322e29, { roughness: 1 });
  const hairM    = M(C.hairGrey);
  const hairW    = M(C.hairWhite);
  const glassM   = M(0x1b2228, { roughness: 0.16, metalness: 0.55, flat: false });
  const emberM   = Glow(C.emberPale, 1.5);
  const paperM   = Cloth(0xd6c9a8);
  const ropeM    = Cloth(0xa5906a);
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
  const pelvis = box(0.365, 0.17, 0.245, shirtD, 0, 0.705, 0.005);
  g.add(pelvis);
  g.add(box(0.20, 0.13, 0.06, leatherD, 0, 0.635, 0.135));          // prednja preklopnica

  // ------------------------------------------------------------------ trup --
  // Trup je odvojena grana da disanje ne razvlači ruke i glavu.
  const chest = new THREE.Group();
  chest.add(box(0.445, 0.30, 0.305, shirt, 0, 0.955, 0.0));         // grudni koš
  chest.add(box(0.405, 0.165, 0.285, shirt, 0, 0.795, 0.008));      // stomak
  chest.add(box(0.40, 0.105, 0.265, shirtD, 0, 1.065, -0.005));     // trapezi
  chest.add(box(0.30, 0.10, 0.05, shirtD, 0, 0.90, 0.16));          // šav na košulji
  g.add(chest);

  // ramena, ključne kosti i vrat
  for (const s of [-1, 1]) {
    const sh = sphere(0.118, s < 0 ? shirtD : shirt, s * 0.272, 1.048, 0.005, 11, 9);
    sh.scale.set(1.0, 0.92, 1.0);
    g.add(sh);
    g.add(bar([s * 0.045, 1.125, 0.10], [s * 0.215, 1.075, 0.055], 0.019, skin, 6));
  }
  g.add(cyl(0.079, 0.092, 0.095, skin, 0, 1.155, 0.008, 10));
  g.add(bar([-0.045, 1.20, 0.03], [-0.10, 1.10, -0.02], 0.016, skinD, 5));
  g.add(bar([0.045, 1.20, 0.03], [0.10, 1.10, -0.02], 0.016, skinD, 5));
  const collar = torus(0.098, 0.022, shirtD, 0, 1.115, 0.005, 6, 16);
  collar.rotation.x = Math.PI / 2;
  g.add(collar);

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
  // naramenice preko ramena do leđa, sa kopčama
  for (const s of [-1, 1]) {
    apron.add(strap([[s * 0.125, 1.075, 0.175], [s * 0.20, 1.13, 0.015], [s * 0.14, 1.06, -0.155]], 0.016, leatherD, 6));
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
  for (const s of [-1, 1]) {
    const ring = torus(0.028, 0.008, iron, s * 0.235, 0.735, 0.02, 6, 12);
    ring.rotation.y = Math.PI / 2;
    belt.add(ring);
  }
  g.add(belt);

  // ------------------------------------------------- pojas sa alatom -------
  // Svaki alat visi iz sopstvene grupe čije je poreklo u ušici, pa se njiše
  // oko prave točke.
  // čekić
  const hammer = group([], 0.235, 0.735, -0.05);
  hammer.add(torus(0.019, 0.006, iron, 0, 0.005, 0, 6, 10));
  hammer.add(cyl(0.014, 0.016, 0.175, wood, 0, -0.085, 0, 7));
  hammer.add(torus(0.018, 0.005, leatherD, 0, -0.055, 0, 6, 10));
  hammer.add(box(0.052, 0.05, 0.115, steel, 0, -0.185, 0));
  hammer.add(box(0.056, 0.022, 0.05, blackI, 0, -0.185, 0.055));
  hammer.add(cone(0.026, 0.05, blackI, 0, -0.185, -0.082, 6));
  hammer.children[hammer.children.length - 1].rotation.x = -Math.PI / 2;
  g.add(hammer);

  // ključ
  const wrench = group([], -0.262, 0.705, -0.10);
  wrench.add(torus(0.017, 0.006, iron, 0, 0.005, 0, 6, 10));
  wrench.add(box(0.026, 0.155, 0.014, steel, 0, -0.085, 0));
  wrench.add(box(0.062, 0.032, 0.016, steel, 0, -0.172, 0));
  wrench.add(box(0.018, 0.03, 0.016, steel, -0.026, -0.198, 0));
  wrench.add(torus(0.024, 0.009, steel, 0, -0.035, 0, 6, 12));
  g.add(wrench);

  // klešta
  const pliers = group([], 0.245, 0.725, -0.175);
  pliers.add(torus(0.016, 0.006, iron, 0, 0.005, 0, 6, 10));
  pliers.add(bar([0, -0.02, 0], [-0.02, -0.155, 0.01], 0.011, blackI, 6));
  pliers.add(bar([0, -0.02, 0], [0.022, -0.155, -0.01], 0.011, blackI, 6));
  pliers.add(sphere(0.016, steel, 0, -0.075, 0, 7, 6));
  pliers.add(box(0.014, 0.05, 0.012, steel, -0.026, -0.185, 0.012));
  g.add(pliers);

  // svrdlo
  const auger = group([], 0.095, 0.72, -0.245);
  auger.add(torus(0.015, 0.005, iron, 0, 0.005, 0, 6, 10));
  auger.add(cyl(0.012, 0.010, 0.18, steel, 0, -0.09, 0, 7));
  for (let i = 0; i < 2; i++) {
    const fl = box(0.03, 0.03, 0.008, steel, 0, -0.075 - i * 0.055, 0);
    fl.rotation.y = i * 1.1;
    auger.add(fl);
  }
  auger.add(cone(0.013, 0.035, steel, 0, -0.198, 0, 6));
  auger.children[auger.children.length - 1].rotation.x = Math.PI;
  g.add(auger);

  // kalem konopca
  const coil = group([], -0.115, 0.70, -0.255);
  for (let i = 0; i < 3; i++) {
    const k = torus(0.052 - i * 0.005, 0.014, ropeM, 0, -i * 0.014, 0, 6, 14);
    k.rotation.x = Math.PI / 2 + 0.1;
    coil.add(k);
  }
  coil.add(sphere(0.017, ropeM, 0.05, -0.045, 0.01, 7, 6));
  coil.add(bar([0.05, -0.045, 0.01], [0.06, -0.11, 0.03], 0.008, ropeM, 5));
  g.add(coil);

  // futrola sa nacrtima
  const tube = group([], -0.215, 0.70, -0.215);
  tube.rotation.set(-0.22, 0, 0.30);
  tube.add(cyl(0.043, 0.046, 0.26, leatherD, 0, 0.06, 0, 9));
  tube.add(cyl(0.048, 0.048, 0.022, leather, 0, -0.075, 0, 9));
  tube.add(torus(0.046, 0.008, brass, 0, 0.185, 0, 6, 12));
  tube.children[tube.children.length - 1].rotation.x = Math.PI / 2;
  tube.add(cyl(0.012, 0.012, 0.14, paperM, -0.014, 0.245, 0.008, 7));
  tube.add(cyl(0.011, 0.011, 0.115, paperM, 0.016, 0.232, -0.01, 7));
  tube.add(cyl(0.010, 0.010, 0.13, paperM, 0.002, 0.24, 0.022, 7));
  tube.children[tube.children.length - 1].rotation.z = 0.12;
  tube.add(strap([[-0.05, 0.10, 0], [0.05, 0.06, 0]], 0.007, leather, 5));
  g.add(tube);

  // --------------------------------------------------- leva ruka i ključ ---
  // Levom, zdravom rukom se opire o opsadni ključ zaboden u pod.
  const prop = group([], 0.425, 0, 0.135);
  prop.rotation.set(0.08, 0, -0.10);
  prop.add(cyl(0.026, 0.031, 0.86, iron, 0, 0.43, 0, 9));
  for (let i = 0; i < 3; i++) prop.add(torus(0.031, 0.008, leatherD, 0, 0.50 + i * 0.075, 0, 6, 12));
  prop.add(box(0.105, 0.085, 0.05, steel, 0, 0.90, 0));
  prop.add(box(0.036, 0.075, 0.05, steel, -0.058, 0.955, 0));
  prop.add(box(0.036, 0.055, 0.05, steel, 0.058, 0.945, 0));
  prop.add(cyl(0.014, 0.014, 0.06, brass, 0, 0.885, 0, 7));
  prop.children[prop.children.length - 1].rotation.x = Math.PI / 2;
  prop.add(box(0.062, 0.03, 0.062, blackI, 0, 0.014, 0));
  // šaka u kožnoj rukavici bez prstiju — dete alata, jer je osa drške Y osa šake
  const handL = makeHand({ skin, s: 1.12, pose: 'grip', side: -1, cuff: leather });
  handL.position.set(0, 0.585, 0);
  handL.rotation.y = -0.55;
  handL.add(box(0.075, 0.055, 0.035, leatherP, 0, 0.02, -0.075));   // nadlanica rukavice
  handL.add(box(0.08, 0.022, 0.03, leatherD, 0, 0.075, -0.06));
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
  // Mesing i bakar: ploča na ramenu sa zupčanicima, cev nadlaktice sa klipom
  // u cilindru, tri prstena-zgloba, kablovi i stezač umesto šake.
  const mech = new THREE.Group();

  // --- spoj sa telom: velika mesingana ploča
  const mShoulder = group([], -0.292, 1.045, 0.0);
  const pauld = sphere(0.152, brass, 0, 0.012, 0, 12, 10);
  pauld.scale.set(1.06, 0.86, 1.0);
  mShoulder.add(pauld);
  const pRim = torus(0.148, 0.017, copper, 0, -0.028, 0, 6, 16);
  pRim.rotation.x = Math.PI / 2;
  mShoulder.add(pRim);
  mShoulder.add(rivetRing(0.128, 6, 0.014, copper, 0.058, 1, 0.4));
  const boss = cyl(0.078, 0.088, 0.05, brassD, -0.148, 0.012, 0, 10);
  boss.rotation.z = Math.PI / 2;
  mShoulder.add(boss);
  // ogrebotine po ploči
  mShoulder.add(box(0.005, 0.004, 0.09, brassD, -0.03, 0.10, 0.04));
  mShoulder.add(box(0.10, 0.004, 0.005, brassD, 0.04, 0.075, 0.09));
  // veliki zupčanik koji se neprekidno okreće + manji u suprotnom smeru
  const gearBig = gear(0.076, 8, 0.026, brass, copper);
  gearBig.position.set(-0.186, 0.012, 0);
  gearBig.rotation.y = Math.PI / 2;
  mShoulder.add(gearBig);
  const gearSml = gear(0.042, 6, 0.02, copper, brassD);
  gearSml.position.set(-0.178, 0.108, 0.028);
  gearSml.rotation.y = Math.PI / 2;
  mShoulder.add(gearSml);
  // lampica na ploči
  mShoulder.add(sphere(0.016, emberM, -0.05, 0.06, 0.115, 7, 6));
  // mesingane trake do grudi
  mShoulder.add(strap([[-0.10, -0.01, 0.105], [0.02, -0.03, 0.15]], 0.013, brass, 5));
  mShoulder.add(strap([[-0.10, -0.01, -0.105], [0.02, -0.04, -0.14]], 0.013, brass, 5));
  mech.add(mShoulder);

  // --- nadlaktica: cev, cilindar sa klipom, kablovi
  const mUpper = group([], -0.30, 1.02, 0.0);
  mUpper.rotation.set(-0.06, 0, -0.14);
  const j1 = torus(0.072, 0.021, copperD, 0, -0.005, 0, 6, 14);
  j1.rotation.x = Math.PI / 2;
  mUpper.add(j1);
  mUpper.add(cyl(0.062, 0.055, 0.20, brass, 0, -0.105, 0, 10));
  for (const yy of [-0.052, -0.165]) {
    const bnd = torus(0.064, 0.012, copper, 0, yy, 0, 6, 14);
    bnd.rotation.x = Math.PI / 2;
    mUpper.add(bnd);
  }
  mUpper.add(rivets([0.0, -0.035, 0.062], [0.0, -0.175, 0.055], 2, 0.010, steel));
  // cilindar sa poklopcima
  mUpper.add(cyl(0.034, 0.034, 0.115, copperD, 0, -0.088, 0.072, 8));
  mUpper.add(cyl(0.038, 0.038, 0.015, brassD, 0, -0.028, 0.072, 8));
  mUpper.add(cyl(0.038, 0.038, 0.015, brassD, 0, -0.148, 0.072, 8));
  // KLIP — klizi po Y unutar cilindra
  const piston = group([], 0, 0, 0);
  piston.add(cyl(0.0135, 0.0135, 0.135, steel, 0, 0.052, 0.072, 7));
  piston.add(cyl(0.03, 0.03, 0.02, brass, 0, 0.125, 0.072, 8));
  piston.add(box(0.05, 0.014, 0.03, brassD, 0, 0.142, 0.072));
  mUpper.add(piston);
  // kabl kroz nekoliko tačaka, od ploče do lakta
  mUpper.add(strap([[0.052, -0.015, -0.032], [0.064, -0.095, -0.052], [0.05, -0.185, -0.028]], 0.008, blackI, 5));

  // --- podlaktica
  const mFore = group([], 0, -0.212, 0);
  mFore.rotation.set(-1.02, 0, 0.10);
  const j2 = torus(0.064, 0.021, brassD, 0, 0, 0, 6, 14);
  j2.rotation.x = Math.PI / 2;
  mFore.add(j2);
  mFore.add(sphere(0.05, copper, 0, 0, 0, 9, 8));
  mFore.add(cyl(0.016, 0.016, 0.145, steel, 0, 0, 0, 7));
  mFore.children[mFore.children.length - 1].rotation.z = Math.PI / 2;
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
  mech.add(mUpper);
  g.add(mech);

  // ------------------------------------------------------------------ glava --
  const headPivot = group([], 0, 1.285, 0.012);
  headPivot.rotation.set(0.035, 0, -0.025);

  const face = makeFace({
    skin, r: 0.136, wide: 1.14, tall: 0.97, deep: 0.94,
    eye: 0x40503c, eyeSize: 0.0205, eyeSpread: 0.058, eyeY: 0.014, eyeZ: 0.110,
    brow: C.hairGrey, browAngle: 0.26, browY: 0.058,
    noseWide: 1.2, noseLen: 0.052, noseY: -0.026,
    mouth: 'frown', mouthY: -0.078, mouthColor: 0x8a4a40,
  });
  headPivot.add(face.group);

  // crven, razvaljen nos preko onog iz alatnice
  const rnose = sphere(0.036, noseM, 0, -0.03, 0.128, 9, 8);
  rnose.scale.set(1.15, 0.95, 1.25);
  headPivot.add(rnose);

  // gusta obrva — spojena greda iznad očiju
  const browBar = box(0.155, 0.022, 0.03, hairM, 0, 0.062, 0.108);
  headPivot.add(browBar);
  headPivot.add(box(0.045, 0.026, 0.028, hairM, -0.062, 0.066, 0.104));
  headPivot.add(box(0.045, 0.026, 0.028, hairM, 0.062, 0.066, 0.104));

  // čađ na levom obrazu (tamnija mrlja)
  const soot1 = sphere(0.042, sootM, 0.082, -0.035, 0.09, 8, 7);
  soot1.scale.set(1.0, 0.8, 0.4);
  headPivot.add(soot1);
  const soot2 = sphere(0.022, sootM, 0.10, 0.01, 0.07, 7, 6);
  soot2.scale.set(1.0, 0.7, 0.4);
  headPivot.add(soot2);

  // čekinjava seda brada, kratko podsečena, i brkovi
  const beard = fur(hairM, 10, [0.098, 0.034, 0.052], 0.034, 913);
  beard.position.set(0, -0.095, 0.068);
  headPivot.add(beard);
  headPivot.add(box(0.055, 0.018, 0.025, hairW, -0.028, -0.058, 0.118));
  headPivot.add(box(0.055, 0.018, 0.025, hairW, 0.028, -0.058, 0.118));
  headPivot.add(box(0.115, 0.026, 0.03, hairM, 0, -0.128, 0.075));

  // kosa: ćelavo teme, sede zaliske i čuperci
  for (const s of [-1, 1]) {
    const tuft = sphere(0.048, hairM, s * 0.115, 0.045, -0.03, 8, 7);
    tuft.scale.set(0.7, 1.0, 1.0);
    headPivot.add(tuft);
  }
  headPivot.add(sphere(0.075, hairM, 0, 0.02, -0.10, 9, 8));
  const top1 = sphere(0.034, hairM, -0.03, 0.128, -0.02, 7, 6);
  top1.scale.set(1.1, 0.7, 1.0);
  headPivot.add(top1);
  const top2 = sphere(0.031, hairW, 0.035, 0.125, -0.04, 7, 6);
  top2.scale.set(1.0, 0.7, 1.0);
  headPivot.add(top2);

  // NAOČARE PODIGNUTE NA ČELO
  const goggles = group([], 0, 0.098, 0.0);
  for (const s of [-1, 1]) {
    goggles.add(torus(0.046, 0.015, brass, s * 0.052, 0.0, 0.098, 6, 16));
    const lens = cyl(0.041, 0.041, 0.008, glassM, s * 0.052, 0.0, 0.101, 10);
    lens.rotation.x = Math.PI / 2;
    goggles.add(lens);
  }
  goggles.add(box(0.03, 0.014, 0.02, brassD, 0, 0.0, 0.10));
  goggles.add(strap([
    [-0.096, 0.0, 0.085], [-0.132, -0.012, -0.01], [0, -0.02, -0.128],
    [0.132, -0.012, -0.01], [0.096, 0.0, 0.085],
  ], 0.013, leatherD, 5));
  goggles.add(box(0.03, 0.026, 0.014, brass, -0.128, -0.014, -0.03));
  headPivot.add(goggles);
  g.add(headPivot);

  // ------------------------------------------------- ručna balista na leđima --
  const bal = group([], 0, 1.00, -0.315);
  bal.rotation.set(0.10, 0, 0.16);
  bal.add(box(0.24, 0.115, 0.055, blackI, 0, 0, 0.055));            // nosač
  bal.add(rivets([-0.09, 0.04, 0.085], [0.09, 0.04, 0.085], 2, 0.011, brass));
  // kratki debeli luk
  for (const s of [-1, 1]) {
    bal.add(curve([s * 0.03, 0.01, 0.0], [s * 0.42, 0.03, 0.115], [s * 0.04, 0.01, 0.02], wood, 0.032, 0.015, 3));
    bal.add(sphere(0.017, blackI, s * 0.42, 0.03, 0.115, 7, 6));
  }
  // zategnuta tetiva
  bal.add(bar([-0.42, 0.03, 0.115], [0, 0.02, 0.135], 0.006, ropeM, 5));
  bal.add(bar([0, 0.02, 0.135], [0.42, 0.03, 0.115], 0.006, ropeM, 5));
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
    bal.add(bar([sx2, 0.075, -0.20], [sx2 * 0.6, 0.055, 0.16], 0.009, wood, 6));
    bal.add(cone(0.014, 0.05, steel, sx2 * 0.55, 0.052, 0.20, 6));
    bal.children[bal.children.length - 1].rotation.x = Math.PI / 2;
    bal.add(box(0.004, 0.03, 0.045, leatherP, sx2, 0.078, -0.185));
  }
  // kaiševi kojima je balista privezana preko ramena
  bal.add(strap([[-0.11, 0.05, 0.075], [-0.16, 0.13, 0.16]], 0.013, leatherD, 5));
  bal.add(strap([[0.11, 0.05, 0.075], [0.17, 0.12, 0.16]], 0.013, leatherD, 5));
  g.add(bal);

  // =============================================================== POKRET ===
  // Sve se prijavljuje POSLE zauzimanja mirne poze, pa svaki pokret pamti
  // zatečenu vrednost kao osnovu. update(t) je čista funkcija vremena.
  anim.spin(gearBig, 'z', 0.82);            // glavni zupčanik na ramenu
  anim.spin(gearSml, 'z', -1.48);           // manji, u suprotnom smeru
  anim.spin(gearFore, 'z', 1.15);
  anim.spin(gearBal, 'z', -0.42);
  anim.pos(piston, 'y', 0.032, 2.55, 0.6);  // klip klizi u cilindru
  anim.pulse(emberM, 1.45, 0.7, 2.05);      // sjaj u zglobu pulsira
  anim.rot(jaws[0], 'z', 0.055, 1.7, 0.0);  // stezač se blago otvara i zatvara
  anim.rot(jaws[1], 'z', -0.055, 1.7, 0.0);
  anim.rot(hammer, 'x', 0.10, 1.35, 0.4);   // alat o pojasu se njiše
  anim.rot(wrench, 'z', 0.07, 1.05, 2.1);
  anim.rot(pliers, 'x', 0.085, 1.55, 1.2);
  anim.rot(coil, 'x', 0.05, 0.9, 0.3);
  anim.breathe(chest, 0.019, 1.02);         // teško disanje
  anim.rot(mShoulder, 'x', 0.035, 1.02, 0.0);
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
    eyeY: 1.3,
    group: g,
    update: (t) => anim.tick(t),
  };
}
