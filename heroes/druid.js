// heroes/druid.js — Eldan Hrastov Sin, Cuvar Starog Gaja
//
// Ljudski druid starog gaja: slojevita odora od zemljanih boja — mahovinasto
// zeleni pohabani ogrtac preko smedje donje odore, pojas od uzeta sa drvenim
// talismanima i torbicom bilja, rogata kapa od jelenskih rogova, kvrgav stap
// sa lisćem i jantarnim kristalom smole, a na levom ramenu mu sedi mala sova
// koja povremeno okrece glavu. Pet listova lebdi i kruzi oko njega.
// Stopala na y=0, heroj gleda u +Z, telo ~1.8, rogovi do ~2.07.

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, lathe, bar, group, shaded,
} from './common.js';

// ---------------------------------------------------------------- pomoćnici ---

// zarubljena kupa razapeta izmedju dve tacke (rukavi koji se sire ka saci)
// poluprecnik rTop je na tacki b, rBottom na tacki a
function frustum(a, b, rTop, rBottom, material, seg = 10) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, len, seg), material);
  m.position.copy(va).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return shaded(m);
}

// oktaedar — kristal smole
function octa(r, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(r), material);
  m.position.set(x, y, z);
  return shaded(m);
}

// tanak prsten obavijen oko sipke a→b na razlomku tPos (za loze/povoje)
function ringOnBar(a, b, tPos, ringR, tube, material) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va).normalize();
  const m = torus(ringR, tube, material, 0, 0, 0, 7, 16);
  m.position.set(
    a[0] + (b[0] - a[0]) * tPos,
    a[1] + (b[1] - a[1]) * tPos,
    a[2] + (b[2] - a[2]) * tPos,
  );
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
  return m;
}

// fiksne fazne konstante mikro-pokreta (izracunate jednom, nikad u update)
const PH_BREATH = 0.9, PH_HEAD = 2.6, PH_BEARD = 1.2, PH_MANTLE = 3.4,
      PH_OWL = 0.4, PH_BLINK = 5.1, PH_BOB = 1.9, PH_CRY = 0.6, PH_SEED = 2.2;

// definicije 5 lebdecih listova: visina, poluprecnik, brzina, faza, frekvencija leprsanja
const ORBITS = [
  { h: 0.55, r: 0.62, sp: 0.35,  ph: 0.7, f: 1.7 },
  { h: 0.92, r: 0.74, sp: -0.27, ph: 2.1, f: 2.3 },
  { h: 1.28, r: 0.66, sp: 0.31,  ph: 4.0, f: 1.4 },
  { h: 1.55, r: 0.52, sp: -0.40, ph: 1.3, f: 2.0 },
  { h: 0.75, r: 0.82, sp: 0.22,  ph: 5.2, f: 1.1 },
];

// ------------------------------------------------------------------- heroj ---

export function createDruid() {
  // materijali (deljeni gde ima smisla)
  const underM = mat(COLORS.clothBrown);                       // smedja donja odora
  const underDarkM = mat(0x53381f);                            // porub / senka
  const mantleM = mat(0x4a6b3a, { side: THREE.DoubleSide });   // mahovinasto zeleni ogrtac
  const mantleDarkM = mat(0x3a5a2e, { side: THREE.DoubleSide });
  const mossM = mat(0x5d8a3c, { roughness: 0.95 });            // jastucici mahovine
  const leafM = mat(0x4f8f3a);                                 // lisce
  const leafLightM = mat(0x6fae4a);                            // mladje lisce
  const vineM = mat(0x3f7030);                                 // loza / povoji
  const ropeM = mat(0xb59a63);                                 // pojas od uzeta
  const woodM = mat(COLORS.wood);                              // drveni talismani
  const woodDarkM = mat(COLORS.woodDark);                      // stap
  const boneM = mat(COLORS.bone);                              // jelenski rogovi
  const leatherM = mat(COLORS.leather);
  const leatherDarkM = mat(COLORS.leatherDark);
  const skinM = mat(COLORS.skinTan);                           // preplanulo, vremesno lice
  const beardM = mat(0x74675a);                                // smedje-siva brada
  const hairM = mat(0x6a5c4c);                                 // proseda kosa
  const eyeM = mat(0x2c3626, { roughness: 0.3 });              // mirne, sumski tamne oci
  const owlM = mat(0x8a6f4e);                                  // perje sove
  const owlDarkM = mat(0x6b5438);                              // krila i rep
  const owlLightM = mat(0xcbb591);                             // grudi i lice sove
  const beakM = mat(0x3a2f22, { roughness: 0.4 });
  const clawM = mat(0x35302a);
  const crystalM = glowMat(COLORS.glowAmber);                  // kristal smole — pulsira
  const seedM = glowMat(COLORS.glowGreen, 1.2);                // seme zivota nad dlanom
  const owlEyeM = glowMat(COLORS.glowGold, 1.1);               // zlatne oci sove

  const root = new THREE.Group();

  // ------------------------------------------------- donja smedja odora ---
  root.add(lathe([
    [0.40, 0.02], [0.38, 0.10], [0.32, 0.35], [0.27, 0.60], [0.235, 0.85],
    [0.22, 1.00], [0.225, 1.12], [0.235, 1.22], [0.20, 1.32], [0.11, 1.38],
  ], underM, 18));
  root.add(cyl(0.39, 0.395, 0.018, underDarkM, 0, 0.02, 0, 18)); // dno odore
  const hemRing = torus(0.395, 0.012, underDarkM, 0, 0.045, 0, 8, 26);
  hemRing.rotation.x = Math.PI / 2;
  root.add(hemRing);

  // grudni sloj tunike — referenca za disanje
  const chest = cyl(0.24, 0.26, 0.26, underM, 0, 1.14, 0, 14);
  root.add(chest);

  // vrat
  root.add(cyl(0.055, 0.065, 0.10, skinM, 0, 1.40, 0.01));

  // --------------------------------- spoljni pohabani zeleni ogrtac ---
  // pivot kod ramena da se porub njise u update
  const mantleG = group([], 0, 1.36, 0);
  root.add(mantleG);
  const LY = (y) => y - 1.36; // svetska visina → lokalna u mantleG

  const mantle = lathe([
    [0.335, LY(0.42)], [0.315, LY(0.55)], [0.285, LY(0.75)], [0.26, LY(0.92)],
    [0.25, LY(1.04)], [0.24, LY(1.16)], [0.235, LY(1.25)], [0.245, LY(1.33)],
    [0.205, LY(1.385)], [0.115, LY(1.425)],
  ], mantleM, 18);
  mantleG.add(mantle);

  // nazubljen porub: naizmenicne kupice i kockice po obodu
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI * 2) / 12;
    const rr = 0.322;
    const px = rr * Math.sin(a), pz = rr * Math.cos(a);
    if (i % 2 === 0) {
      const jag = cone(0.045, 0.11, mantleDarkM, px, LY(0.385), pz, 5);
      jag.rotation.z = Math.PI;             // vrh nadole
      jag.rotation.y = a;
      mantleG.add(jag);
    } else {
      const jag = box(0.07, 0.075, 0.02, mantleDarkM, px, LY(0.40), pz);
      jag.rotation.y = a;
      jag.rotation.x = 0.12;
      mantleG.add(jag);
    }
  }

  // grubi savovi (krpljeni ogrtac) — sitne tamne "niti" po prednjici
  const stitchDefs = [
    [0.05, 0.68, 0.292, 0.5], [0.075, 0.73, 0.288, -0.4], [0.10, 0.78, 0.282, 0.5],
    [-0.14, 0.88, 0.255, 0.6], [-0.115, 0.93, 0.252, -0.5],
  ];
  for (const [sx, sy, sz, rz] of stitchDefs) {
    const st = box(0.008, 0.034, 0.008, underDarkM, sx, LY(sy), sz);
    st.rotation.z = rz;
    mantleG.add(st);
  }

  // debeli okovratnik od mahovine
  const collar = torus(0.13, 0.036, mossM, 0, LY(1.40), 0.01, 9, 20);
  collar.rotation.x = Math.PI / 2;
  mantleG.add(collar);

  // jastucici mahovine po ramenima
  const mossDefs = [
    [0.19, 1.38, 0.05, 0.062], [-0.19, 1.38, 0.05, 0.058],
    [0.155, 1.405, -0.07, 0.05], [-0.155, 1.405, -0.07, 0.048],
    [0.06, 1.43, -0.10, 0.04], [0.23, 1.345, 0.10, 0.042],
  ];
  for (const [mx, my, mz, mr] of mossDefs) {
    const patch = sphere(mr, mossM, mx, LY(my), mz, 8, 6);
    patch.scale.set(1, 0.35, 0.85);
    mantleG.add(patch);
  }

  // ------------------------------------------------- pojas od uzeta ---
  const belt1 = torus(0.265, 0.020, ropeM, 0, 0.955, 0.005, 8, 24);
  belt1.rotation.x = Math.PI / 2;
  const belt2 = torus(0.263, 0.014, ropeM, 0, 0.92, 0.005, 8, 24);
  belt2.rotation.x = Math.PI / 2;
  root.add(belt1, belt2);
  root.add(sphere(0.034, ropeM, 0.02, 0.94, 0.265, 8, 6));                 // cvor
  root.add(bar([0.03, 0.925, 0.265], [0.055, 0.79, 0.29], 0.013, ropeM, 6));
  root.add(bar([0.005, 0.925, 0.268], [-0.02, 0.82, 0.285], 0.013, ropeM, 6));
  root.add(sphere(0.019, ropeM, 0.057, 0.78, 0.292, 6, 5));                // krajevi uzeta
  root.add(sphere(0.019, ropeM, -0.022, 0.81, 0.287, 6, 5));

  // drveni talismani sa urezima, okaceni o pojas
  const talismanDefs = [
    [0.10, 0.845, 0.262, 0.15], [-0.055, 0.838, 0.268, -0.1], [0.185, 0.85, 0.215, 0.55],
  ];
  for (const [tx, ty, tz, ry] of talismanDefs) {
    root.add(bar([tx * 0.96, 0.925, tz * 0.96], [tx, ty + 0.03, tz], 0.007, leatherDarkM, 5));
    const disc = cyl(0.032, 0.032, 0.013, woodM, tx, ty, tz, 10);
    disc.rotation.x = Math.PI / 2;
    disc.rotation.z = ry;
    root.add(disc);
    const carve = box(0.02, 0.02, 0.007, woodDarkM, tx, ty, tz + 0.008);
    carve.rotation.z = 0.785 + ry;                                          // urezana runa
    root.add(carve);
  }

  // torbica sa biljem na levom boku
  const satchelG = group([], -0.21, 0.79, 0.145);
  satchelG.rotation.y = -0.45;
  satchelG.add(box(0.13, 0.11, 0.055, leatherM));                          // telo
  const flap = box(0.135, 0.055, 0.06, leatherDarkM, 0, 0.045, 0.004);
  flap.rotation.x = 0.18;                                                  // preklop
  satchelG.add(flap);
  satchelG.add(cyl(0.012, 0.012, 0.03, woodM, 0, 0.005, 0.034, 6));        // drveni zatvarac
  // suvo bilje viri iz torbice
  const herbDefs = [[-0.04, 0.09, -0.01, 0.25], [0.0, 0.105, -0.015, -0.15], [0.045, 0.085, -0.005, 0.35]];
  for (const [hx, hy, hz, rz] of herbDefs) {
    const herb = cone(0.014, 0.06, leafM, hx, hy, hz, 5);
    herb.rotation.z = rz;
    satchelG.add(herb);
  }
  root.add(satchelG);
  root.add(bar([-0.185, 0.925, 0.19], [-0.205, 0.85, 0.165], 0.009, leatherM, 5)); // kais torbice

  // ----------------------------------------------- proste sandale ---
  for (const s of [-1, 1]) {
    const fz = s > 0 ? 0.395 : 0.345;                                      // blagi iskorak
    const sole = box(0.088, 0.03, 0.125, leatherDarkM, s * 0.12, 0.032, fz);
    sole.rotation.y = s * 0.10;
    root.add(sole);
    root.add(sphere(0.017, skinM, s * 0.14, 0.052, fz + 0.038, 6, 5));     // nozni prsti
    root.add(sphere(0.017, skinM, s * 0.10, 0.052, fz + 0.048, 6, 5));
    root.add(box(0.092, 0.013, 0.02, leatherM, s * 0.12, 0.056, fz + 0.012)); // kaisic
    root.add(box(0.08, 0.011, 0.016, leatherM, s * 0.12, 0.052, fz - 0.04));  // zadnji kaisic
  }

  // ------------------------------------------------------------- glava ---
  // pivot u vratu — klimanje nosi bradu, rogove i lice
  const headG = group([], 0, 1.42, 0.01);
  root.add(headG);

  headG.add(sphere(0.13, skinM, 0, 0.10, 0.01, 14, 12));                   // lobanja

  // vremesan nos
  const noseC = cone(0.028, 0.09, skinM, 0, 0.11, 0.143, 7);
  noseC.rotation.x = 1.85;
  headG.add(noseC);
  headG.add(sphere(0.022, skinM, 0, 0.088, 0.18, 7, 6));

  // mirne oci pod teskim kapcima
  headG.add(sphere(0.016, eyeM, 0.048, 0.125, 0.122, 7, 6));
  headG.add(sphere(0.016, eyeM, -0.048, 0.125, 0.122, 7, 6));
  for (const s of [-1, 1]) {
    const lid = box(0.036, 0.012, 0.018, skinM, s * 0.048, 0.139, 0.126);
    lid.rotation.x = 0.35;
    headG.add(lid);
    const brow = box(0.06, 0.018, 0.022, beardM, s * 0.052, 0.162, 0.118); // sede obrve
    brow.rotation.z = -s * 0.12;
    brow.rotation.x = 0.15;
    headG.add(brow);
  }
  headG.add(box(0.085, 0.007, 0.012, mat(COLORS.skinDark), 0, 0.185, 0.115)); // bora na celu

  // usi
  for (const s of [-1, 1]) {
    const ear = sphere(0.027, skinM, s * 0.127, 0.10, 0.005, 7, 6);
    ear.scale.set(0.6, 1, 0.8);
    headG.add(ear);
  }

  // proseda kosa pozadi
  const hairBack = sphere(0.104, hairM, 0, 0.05, -0.045, 12, 10);
  hairBack.scale.set(1.06, 1.18, 0.95);
  headG.add(hairBack);

  // ------------------------------------------- smedje-siva brada ---
  const beardG = group([], 0, 0.02, 0.105);
  headG.add(beardG);
  const beardMain = cone(0.08, 0.30, beardM, 0, -0.16, -0.01, 9);
  beardMain.rotation.x = Math.PI - 0.14;
  beardG.add(beardMain);
  for (const s of [-1, 1]) {
    const side = cone(0.046, 0.20, beardM, s * 0.055, -0.11, -0.02, 7);
    side.rotation.x = Math.PI - 0.20;
    side.rotation.z = s * 0.17;
    beardG.add(side);
    const base = sphere(0.052, beardM, s * 0.048, -0.04, -0.018, 8, 6);
    base.scale.set(1, 1.2, 0.85);
    beardG.add(base);
    const wisp = cone(0.016, 0.12, beardM, s * 0.026, -0.29, 0.0, 5);
    wisp.rotation.x = Math.PI - 0.1;
    beardG.add(wisp);
    beardG.add(bar([s * 0.008, 0.052, 0.03], [s * 0.085, 0.01, 0.01], 0.014, beardM, 6)); // brkovi
  }
  const lipTuft = sphere(0.03, beardM, 0, 0.0, 0.0, 6, 5);
  lipTuft.scale.set(1.2, 0.75, 0.9);
  beardG.add(lipTuft);

  // ------------------------------ rogata kapa: kozna traka + rogovi ---
  const band = torus(0.134, 0.017, leatherDarkM, 0, 0.15, 0.005, 8, 22);
  band.rotation.x = Math.PI / 2;
  headG.add(band);
  const bandDisc = cyl(0.026, 0.026, 0.012, woodM, 0, 0.15, 0.142, 9);     // celni medaljon
  bandDisc.rotation.x = Math.PI / 2;
  headG.add(bandDisc);
  headG.add(sphere(0.009, crystalM, 0, 0.15, 0.152, 6, 5));                // jantarno zrno

  // jelenski rogovi: po 3 segmenta + parosci, kost
  for (const s of [-1, 1]) {
    const A0 = [s * 0.095, 0.185, -0.02];
    const A1 = [s * 0.175, 0.315, -0.055];
    const A2 = [s * 0.225, 0.455, -0.025];
    const A3 = [s * 0.245, 0.595, 0.025];
    headG.add(bar(A0, A1, 0.017, boneM, 6));
    headG.add(bar(A1, A2, 0.014, boneM, 6));
    headG.add(bar(A2, A3, 0.011, boneM, 6));
    headG.add(sphere(0.019, boneM, ...A1, 6, 5));
    headG.add(sphere(0.016, boneM, ...A2, 6, 5));
    headG.add(bar(A1, [s * 0.26, 0.37, 0.035], 0.009, boneM, 5));          // parozak 1
    headG.add(bar(A2, [s * 0.29, 0.50, -0.085], 0.008, boneM, 5));         // parozak 2
    const tip = cone(0.011, 0.05, boneM, s * 0.25, 0.615, 0.03, 5);
    tip.rotation.z = -s * 0.35;
    headG.add(tip);
  }

  // ------------------------------------------------------------- ruke ---
  root.add(sphere(0.075, mantleM, 0.245, 1.315, 0.02, 10, 8));             // ramena
  root.add(sphere(0.075, mantleM, -0.245, 1.315, 0.02, 10, 8));

  // desna ruka (+x) — savijena, drzi stap
  root.add(frustum([0.245, 1.30, 0.02], [0.35, 1.05, 0.09], 0.052, 0.07, mantleM));
  root.add(sphere(0.055, mantleM, 0.35, 1.05, 0.09, 8, 6));                // lakat
  const rForeA = [0.35, 1.05, 0.09], rForeB = [0.415, 1.095, 0.17];
  root.add(bar(rForeA, rForeB, 0.030, skinM, 8));
  root.add(frustum([0.345, 1.055, 0.095], [0.405, 1.09, 0.155], 0.08, 0.055, underM)); // rukav
  const rPalm = sphere(0.042, skinM, 0.425, 1.10, 0.185, 8, 6);
  rPalm.scale.set(0.75, 1.15, 1.2);
  root.add(rPalm);
  // prsti obavijeni oko stapa (stap je kod x≈0.46, z≈0.195 na visini saka)
  for (let i = 0; i < 4; i++) {
    const fy = 1.148 - i * 0.028;
    root.add(bar([0.415, fy, 0.235], [0.50, fy, 0.225], 0.0115, skinM, 5));
  }
  root.add(bar([0.412, 1.07, 0.155], [0.49, 1.085, 0.165], 0.012, skinM, 5)); // palac

  // leva ruka (-x) — savijena napred, dlan nagore; podlaktica u lozi
  root.add(frustum([-0.245, 1.30, 0.02], [-0.31, 1.06, 0.10], 0.052, 0.07, mantleM));
  root.add(sphere(0.055, mantleM, -0.31, 1.06, 0.10, 8, 6));               // lakat
  const lForeA = [-0.31, 1.06, 0.10], lForeB = [-0.185, 0.965, 0.30];
  root.add(bar(lForeA, lForeB, 0.030, skinM, 8));
  root.add(frustum([-0.305, 1.055, 0.11], [-0.245, 1.01, 0.21], 0.075, 0.055, underM)); // rukav
  // povoji od loze oko podlaktice
  for (const tp of [0.42, 0.58, 0.74]) {
    root.add(ringOnBar(lForeA, lForeB, tp, 0.036, 0.008, vineM));
  }
  const vineLeaf = cone(0.016, 0.045, leafLightM, -0.235, 1.02, 0.22, 5);
  vineLeaf.rotation.z = 1.0;
  root.add(vineLeaf);
  const lPalm = sphere(0.042, skinM, -0.175, 0.955, 0.315, 8, 6);
  lPalm.scale.set(1.15, 0.6, 1.3);
  root.add(lPalm);
  const lFingerX = [-0.215, -0.19, -0.165, -0.14];
  for (const fx of lFingerX) {
    root.add(bar([fx, 0.955, 0.36], [fx - 0.003, 1.0, 0.39], 0.010, skinM, 5)); // povijeni prsti
  }
  root.add(bar([-0.135, 0.96, 0.30], [-0.10, 0.995, 0.345], 0.011, skinM, 5)); // palac

  // mladica u dlanu i zeleno seme zivota koje lebdi
  root.add(bar([-0.175, 0.96, 0.335], [-0.17, 1.01, 0.34], 0.005, vineM, 5));
  const sprout1 = cone(0.015, 0.04, leafM, -0.185, 1.012, 0.335, 5);
  sprout1.rotation.z = 0.6;
  const sprout2 = cone(0.015, 0.04, leafLightM, -0.157, 1.01, 0.348, 5);
  sprout2.rotation.z = -0.55;
  root.add(sprout1, sprout2);
  const seed = sphere(0.018, seedM, -0.17, 1.045, 0.34, 8, 6);
  root.add(seed);

  // ------------------------------------------------- kvrgavi stap ---
  const S = [
    [0.47, 0.02, 0.28], [0.44, 0.50, 0.23], [0.465, 1.02, 0.19],
    [0.43, 1.50, 0.22], [0.455, 1.88, 0.17],
  ];
  const sr = [0.034, 0.031, 0.029, 0.026];
  for (let i = 0; i < 4; i++) root.add(bar(S[i], S[i + 1], sr[i], woodDarkM, 7));
  root.add(sphere(0.039, woodDarkM, ...S[1], 7, 6));                       // cvorovi na spojevima
  root.add(sphere(0.036, woodDarkM, ...S[2], 7, 6));
  root.add(sphere(0.033, woodDarkM, ...S[3], 7, 6));
  root.add(sphere(0.020, woodDarkM, 0.452, 0.27, 0.255, 6, 5));            // kvrge
  root.add(sphere(0.019, woodDarkM, 0.457, 0.76, 0.208, 6, 5));
  root.add(sphere(0.018, woodDarkM, 0.443, 1.68, 0.196, 6, 5));

  // loza obavijena oko stapa
  root.add(ringOnBar(S[0], S[1], 0.65, 0.041, 0.008, vineM));
  root.add(ringOnBar(S[1], S[2], 0.45, 0.039, 0.008, vineM));
  root.add(ringOnBar(S[2], S[3], 0.70, 0.036, 0.007, vineM));
  root.add(bar([0.475, 0.35, 0.27], [0.44, 0.62, 0.245], 0.007, vineM, 5)); // izdanak loze
  root.add(bar([0.44, 0.62, 0.245], [0.478, 0.90, 0.215], 0.006, vineM, 5));

  // sitno lisce pri vrhu stapa (spljostene kupice)
  const staffLeafDefs = [
    [0.485, 1.58, 0.225, 0.9, 0.3, leafM], [0.39, 1.63, 0.19, -0.9, -0.2, leafLightM],
    [0.478, 1.72, 0.155, 0.8, 0.5, leafLightM], [0.405, 1.79, 0.21, -0.85, 0.2, leafM],
    [0.49, 1.84, 0.17, 0.95, -0.4, leafM],
  ];
  for (const [lx, ly, lz, rz, rx, lm] of staffLeafDefs) {
    const lf = cone(0.028, 0.07, lm, lx, ly, lz, 5);
    lf.scale.set(1, 1, 0.35);
    lf.rotation.z = rz;
    lf.rotation.x = rx;
    root.add(lf);
  }

  // koreni kraci koji drze kristal smole
  const prongDefs = [[0.42, 0.17, 0, -0.32], [0.49, 0.17, 0, 0.32], [0.455, 0.205, 0.32, 0]];
  for (const [px, pz, rx, rz] of prongDefs) {
    const p = cone(0.016, 0.09, woodDarkM, px, 1.925, pz, 5);
    p.rotation.x = rx;
    p.rotation.z = rz;
    root.add(p);
  }

  // sjajni jantarni kristal smole — pulsira u update
  const crystal = octa(0.058, crystalM, 0.455, 1.975, 0.17);
  crystal.scale.set(1, 1.4, 1);
  crystal.rotation.y = 0.4;
  root.add(crystal);
  root.add(sphere(0.012, crystalM, 0.468, 1.885, 0.19, 6, 5));             // kapi smole
  root.add(sphere(0.009, crystalM, 0.44, 1.855, 0.175, 6, 5));

  // ------------------------------------- sova na levom ramenu ---
  const owlG = group([], -0.26, 1.385, 0.02);
  owlG.rotation.y = 0.30;                                                  // blago okrenuta ka napred-spolja
  root.add(owlG);

  // kandzice stezu rame
  owlG.add(bar([-0.028, 0.03, 0.025], [-0.038, 0.0, 0.06], 0.006, clawM, 4));
  owlG.add(bar([-0.012, 0.03, 0.028], [-0.008, 0.0, 0.065], 0.006, clawM, 4));
  owlG.add(bar([0.012, 0.03, 0.028], [0.008, 0.0, 0.065], 0.006, clawM, 4));
  owlG.add(bar([0.028, 0.03, 0.025], [0.038, 0.0, 0.06], 0.006, clawM, 4));

  // okruglo telo i svetle grudi
  const owlBody = sphere(0.072, owlM, 0, 0.085, 0, 12, 10);
  owlBody.scale.set(0.95, 1.1, 0.9);
  owlG.add(owlBody);
  const owlBelly = sphere(0.05, owlLightM, 0, 0.072, 0.043, 10, 8);
  owlBelly.scale.set(0.85, 1.0, 0.5);
  owlG.add(owlBelly);
  // pege na grudima
  owlG.add(sphere(0.007, owlDarkM, -0.014, 0.09, 0.068, 5, 4));
  owlG.add(sphere(0.007, owlDarkM, 0.015, 0.065, 0.072, 5, 4));
  owlG.add(sphere(0.006, owlDarkM, -0.004, 0.045, 0.068, 5, 4));

  // sklopljena krila
  for (const s of [-1, 1]) {
    const wing = sphere(0.046, owlDarkM, s * 0.06, 0.088, -0.006, 9, 7);
    wing.scale.set(0.45, 1.15, 0.75);
    wing.rotation.z = -s * 0.12;
    owlG.add(wing);
    const wtip = cone(0.016, 0.05, owlDarkM, s * 0.062, 0.022, -0.02, 5);
    wtip.rotation.x = Math.PI;                                             // vrh krila nadole
    owlG.add(wtip);
  }

  // repna pera
  for (let i = -1; i <= 1; i++) {
    const tf = box(0.018, 0.055, 0.008, owlDarkM, i * 0.018, 0.035, -0.062);
    tf.rotation.x = -0.85;
    tf.rotation.z = i * 0.22;
    owlG.add(tf);
  }

  // glava sove — okrece se levo-desno u update
  const owlHeadG = group([], 0, 0.175, 0.005);
  owlG.add(owlHeadG);
  const owlHead = sphere(0.058, owlM, 0, 0, 0, 12, 10);
  owlHead.scale.set(1.1, 0.95, 0.95);
  owlHeadG.add(owlHead);
  // svetli lični diskovi
  for (const s of [-1, 1]) {
    const face = sphere(0.027, owlLightM, s * 0.024, 0.004, 0.044, 8, 6);
    face.scale.set(1, 1, 0.4);
    owlHeadG.add(face);
  }
  // velike zlatne oci (emisivne) + zenice — trepcu u update
  const owlEyeL = sphere(0.016, owlEyeM, -0.024, 0.005, 0.056, 8, 6);
  const owlEyeR = sphere(0.016, owlEyeM, 0.024, 0.005, 0.056, 8, 6);
  owlEyeL.scale.set(1, 1, 0.55);
  owlEyeR.scale.set(1, 1, 0.55);
  const owlPupL = sphere(0.0075, beakM, -0.024, 0.005, 0.0655, 6, 5);
  const owlPupR = sphere(0.0075, beakM, 0.024, 0.005, 0.0655, 6, 5);
  owlHeadG.add(owlEyeL, owlEyeR, owlPupL, owlPupR);
  // kljunic
  const beak = cone(0.009, 0.026, beakM, 0, -0.014, 0.06, 5);
  beak.rotation.x = 1.95;
  owlHeadG.add(beak);
  // usne cuperke
  for (const s of [-1, 1]) {
    const tuft = cone(0.012, 0.045, owlM, s * 0.038, 0.052, 0.004, 5);
    tuft.rotation.z = -s * 0.45;
    owlHeadG.add(tuft);
  }

  // --------------------------------------- 5 lebdecih listova ---
  const orbiters = [];
  for (const o of ORBITS) {
    const orbitG = group([], 0, o.h, 0);
    const holder = group([], o.r, 0, 0);
    const lf = cone(0.035, 0.09, o.f > 1.6 ? leafLightM : leafM, 0, 0, 0, 5);
    lf.scale.set(1, 1, 0.3);
    lf.rotation.z = Math.PI / 2;                                           // list lezi polozeno
    holder.add(lf);
    holder.add(bar([0, 0, 0], [0.05, 0.012, 0], 0.004, vineM, 4));         // peteljka
    orbitG.add(holder);
    root.add(orbitG);
    orbiters.push({ g: orbitG, holder, def: o });
  }

  // ----------------------------------------------------------- animacija ---
  // nezavisni mikro-pokreti; cista funkcija od t, bez alokacija
  function update(t) {
    // disanje — grudni sloj se blago siri
    const b = Math.sin(t * 1.35 + PH_BREATH);
    chest.scale.set(1 + 0.02 * b, 1, 1 + 0.02 * b);

    // glava se lagano osvrce po gaju i klima
    headG.rotation.y = 0.06 * Math.sin(t * 0.42 + PH_HEAD);
    headG.rotation.x = 0.025 * Math.sin(t * 0.85 + 1.4);

    // brada na povetarcu
    beardG.rotation.x = 0.05 + 0.04 * Math.sin(t * 1.1 + PH_BEARD);

    // ogrtac se njise oko ramena
    mantleG.rotation.z = 0.02 * Math.sin(t * 0.55 + PH_MANTLE);
    mantleG.rotation.x = 0.012 * Math.sin(t * 0.7 + 0.9);

    // sova: glava se glatko okrece levo-desno (ublazen sinus), uz blagi nagib
    const so = Math.sin(t * 0.45 + PH_OWL);
    owlHeadG.rotation.y = 0.65 * so * so * so;
    owlHeadG.rotation.z = 0.08 * Math.sin(t * 0.9 + 2.0);
    // povremeni treptaj (zlatne oci se skupe po visini)
    const blink = Math.pow(Math.max(0, Math.sin(t * 0.5 + PH_BLINK)), 40);
    const ey = 1 - 0.85 * blink;
    owlEyeL.scale.set(1, ey, 0.55);
    owlEyeR.scale.set(1, ey, 0.55);
    owlPupL.scale.set(1, ey, 1);
    owlPupR.scale.set(1, ey, 1);
    // sova sitno poskakuje s disanjem domacina
    owlG.position.y = 1.385 + 0.008 * Math.sin(t * 1.35 + PH_BOB);

    // kristal smole pulsira i sija
    const p = Math.sin(t * 2.1 + PH_CRY);
    crystalM.emissiveIntensity = 1.6 + 0.5 * p;
    crystal.rotation.y = 0.4 + t * 0.6;
    crystal.scale.set(1 + 0.05 * p, 1.4 * (1 + 0.05 * p), 1 + 0.05 * p);

    // seme zivota lebdi nad dlanom i treperi
    seed.position.y = 1.045 + 0.03 * Math.sin(t * 1.6 + PH_SEED);
    seedM.emissiveIntensity = 1.2 + 0.4 * Math.sin(t * 2.6 + 0.5);

    // listovi kruze, lepršaju i talasaju se po visini
    for (let i = 0; i < orbiters.length; i++) {
      const { g, holder, def } = orbiters[i];
      g.rotation.y = t * def.sp + def.ph;
      holder.position.y = 0.05 * Math.sin(t * 0.9 + def.ph);
      holder.rotation.z = 0.35 * Math.sin(t * def.f + def.ph);
      holder.rotation.x = 0.5 * Math.sin(t * def.f * 0.7 + def.ph * 2);
    }
  }

  return {
    name: 'Eldan Hrastov Sin',
    title: 'Čuvar Starog Gaja',
    blurb: 'Govori jezikom korenja i vetra. Sova na njegovom ramenu nije ljubimac nego savetnik — stariji od svakog kralja koji je ikada krunisan.',
    group: root,
    update,
  };
}
