// heroes/wizard.js — Maldrik Sivi, Arhimag Kule Zvezda
//
// Stari ljudski arhimag: ponoćnoplava odora posuta zlatnim zvezdama,
// duga bela brada, polumesečaste naočare, šiljati šešir sa savijenim vrhom
// i kvrgav štap krunisan sjajnim cijan kristalom oko koga kruže rune.
// Stopala na y=0, heroj gleda u +Z, ukupna visina ~1.9 (štap je viši od njega).

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, lathe, bar, group, shaded,
} from './common.js';

// ---------------------------------------------------------------- pomoćnici ---

// zarubljena kupa razapeta između dve tačke (za rukave koji se šire)
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

// oktaedar (kristal, kopče u obliku zvezde)
function octa(r, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(r), material);
  m.position.set(x, y, z);
  return shaded(m);
}

// tetraedar (zvezdane zakovice na odori)
function tetra(r, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.TetrahedronGeometry(r), material);
  m.position.set(x, y, z);
  return shaded(m);
}

// profil odore: [poluprečnik, y] od poruba ka okovratniku
const ROBE_PTS = [
  [0.44, 0.02], [0.42, 0.06], [0.36, 0.22], [0.30, 0.45], [0.25, 0.70],
  [0.215, 0.90], [0.205, 1.05], [0.215, 1.18], [0.23, 1.28], [0.19, 1.36], [0.10, 1.40],
];

// poluprečnik odore na visini y (linearna interpolacija profila)
function robeR(y) {
  for (let i = 1; i < ROBE_PTS.length; i++) {
    const [r0, y0] = ROBE_PTS[i - 1];
    const [r1, y1] = ROBE_PTS[i];
    if (y <= y1) return r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return ROBE_PTS[ROBE_PTS.length - 1][0];
}

// fiksne fazne konstante za mikro-pokrete (izračunate jednom, nikad u update)
const PH_BREATH = 0.3, PH_HEAD = 4.0, PH_BEARD = 1.7, PH_HAT = 2.1,
      PH_TIP = 0.6, PH_CRY = 0.8, PH_MOTE = 2.5;

// ------------------------------------------------------------------- heroj ---

export function createWizard() {
  // materijali (deljeni gde ima smisla)
  const robeM = mat(0x27306e, { roughness: 0.85 });      // ponoćno plava odora
  const robeDarkM = mat(0x1d2452);                        // senka / postava
  const tunicM = mat(0x1f2a5e);                           // grudni sloj (diše)
  const goldM = metalMat(COLORS.gold);
  const goldLightM = metalMat(COLORS.goldLight);
  const skinM = mat(COLORS.skinPale);
  const whiteM = mat(COLORS.hairWhite);
  const woodM = mat(COLORS.woodDark);
  const ropeM = mat(0xb59a63);                            // konopac za pojas
  const leatherM = mat(COLORS.leather);
  const leatherDarkM = mat(COLORS.leatherDark);
  const boneM = mat(COLORS.bone);
  const eyeM = mat(0x23262e, { roughness: 0.3 });
  const glassM = mat(0xd8ecf4, { transparent: true, opacity: 0.4, roughness: 0.15 });
  const corkM = mat(0x8a6a42);
  const crystalM = glowMat(COLORS.glowCyan);              // pulsira u update
  const runeM = mat(0x39465c, { emissive: COLORS.glowCyan, emissiveIntensity: 0.55, roughness: 0.5 });
  const moteM = glowMat(COLORS.glowGold, 1.3);            // iskra na dlanu

  const root = new THREE.Group();

  // ------------------------------------------------------------- odora ---
  const robe = lathe(ROBE_PTS, robeM, 20);
  root.add(robe);
  // dno odore (zatvara lathe odozdo)
  root.add(cyl(0.43, 0.435, 0.018, robeDarkM, 0, 0.02, 0, 20));

  // zlatni obrub na porubu + tanji prsten više
  const hem1 = torus(0.435, 0.016, goldM, 0, 0.05, 0, 10, 28);
  hem1.rotation.x = Math.PI / 2;
  const hem2 = torus(0.365, 0.010, goldM, 0, 0.215, 0, 8, 24);
  hem2.rotation.x = Math.PI / 2;
  root.add(hem1, hem2);

  // grudni sloj tunike — referenca za disanje
  const chest = cyl(0.225, 0.245, 0.30, tunicM, 0, 1.13, 0, 14);
  root.add(chest);

  // okovratnik i zlatni broš u obliku zvezde
  const collar = torus(0.10, 0.02, robeDarkM, 0, 1.375, 0.01, 8, 20);
  collar.rotation.x = Math.PI / 2;
  root.add(collar);
  const brooch = octa(0.025, goldLightM, 0, 1.305, 0.235);
  brooch.scale.set(1, 1, 0.5);
  root.add(brooch);

  // vrat
  root.add(cyl(0.055, 0.062, 0.10, skinM, 0, 1.40, 0.01));

  // zvezdane zakovice po odori (kuglice + tetraedri, po površini lathe-a)
  const studSpheres = [
    [0.16, 15], [0.24, -40], [0.33, 70], [0.30, -95], [0.45, 25], [0.42, -15],
    [0.55, 55], [0.52, -70], [0.65, 5], [0.62, 100], [0.75, -35], [0.72, 40],
    [0.85, -10], [0.88, 65],
  ];
  for (const [sy, deg] of studSpheres) {
    const a = (deg * Math.PI) / 180;
    const r = robeR(sy) + 0.006;
    root.add(sphere(0.013, goldLightM, r * Math.sin(a), sy, r * Math.cos(a), 6, 5));
  }
  const studTetras = [[0.20, 130, 0.4], [0.38, -150, 1.3], [0.58, 165, 2.2], [0.80, -125, 0.9]];
  for (const [sy, deg, spin] of studTetras) {
    const a = (deg * Math.PI) / 180;
    const r = robeR(sy) + 0.008;
    const t4 = tetra(0.02, goldM, r * Math.sin(a), sy, r * Math.cos(a));
    t4.rotation.set(spin, a, spin * 0.7);
    root.add(t4);
  }

  // ------------------------------------------------------ pojas od užeta ---
  const belt1 = torus(0.225, 0.020, ropeM, 0, 0.97, 0.01, 8, 24);
  belt1.rotation.x = Math.PI / 2;
  const belt2 = torus(0.225, 0.014, ropeM, 0, 0.935, 0.01, 8, 24);
  belt2.rotation.x = Math.PI / 2;
  root.add(belt1, belt2);
  root.add(sphere(0.035, ropeM, 0, 0.955, 0.235, 8, 6)); // čvor
  root.add(bar([0.012, 0.94, 0.235], [0.048, 0.80, 0.26], 0.013, ropeM, 6));
  root.add(bar([-0.012, 0.94, 0.235], [-0.032, 0.77, 0.255], 0.013, ropeM, 6));
  root.add(sphere(0.02, ropeM, 0.05, 0.79, 0.262, 6, 5));   // krajevi užeta
  root.add(sphere(0.02, ropeM, -0.034, 0.76, 0.257, 6, 5));

  // ------------------------------------------- bočice sa napicima na pojasu ---
  const vialDefs = [
    { x: 0.14, z: 0.17, c: COLORS.glowGreen },
    { x: 0.21, z: 0.045, c: 0xff5040 },
    { x: -0.17, z: 0.135, c: COLORS.glowAmber },
  ];
  for (const v of vialDefs) {
    root.add(bar([v.x * 0.98, 0.962, v.z * 0.98], [v.x, 0.935, v.z], 0.008, leatherM, 5)); // vešalica
    root.add(cyl(0.024, 0.027, 0.085, glassM, v.x, 0.885, v.z, 8));                        // staklo
    root.add(cyl(0.016, 0.018, 0.048, glowMat(v.c, 0.9), v.x, 0.872, v.z, 8));             // tečnost
    const cork = sphere(0.02, corkM, v.x, 0.938, v.z, 7, 6);
    cork.scale.set(1, 0.8, 1);                                                             // čep
    root.add(cork);
  }

  // --------------------------------------------- knjižica čini na pojasu ---
  const bookG = group([], -0.21, 0.80, -0.045);
  bookG.rotation.y = -0.35;
  bookG.add(box(0.042, 0.15, 0.11, leatherDarkM));                       // korica
  bookG.add(box(0.030, 0.132, 0.096, boneM, 0.014, 0, 0.004));           // listovi
  bookG.add(box(0.05, 0.15, 0.022, leatherM, -0.004, 0, -0.052));        // hrbat
  bookG.add(box(0.05, 0.028, 0.02, goldM, 0.004, 0, 0.056));             // zlatna kopča
  bookG.add(sphere(0.007, goldM, -0.018, 0.062, 0.048, 5, 4));           // okovi ćoškova
  bookG.add(sphere(0.007, goldM, -0.018, -0.062, 0.048, 5, 4));
  root.add(bookG);
  root.add(bar([-0.20, 0.952, -0.028], [-0.21, 0.875, -0.045], 0.008, leatherM, 5)); // kaišić

  // ------------------------------------------------- vrhovi sandala vire ---
  for (const s of [-1, 1]) {
    const sole = box(0.085, 0.03, 0.11, leatherDarkM, s * 0.11, 0.032, 0.40);
    sole.rotation.y = s * 0.08;
    root.add(sole);
    root.add(sphere(0.017, skinM, s * 0.13, 0.052, 0.432, 6, 5));   // nožni prsti
    root.add(sphere(0.017, skinM, s * 0.093, 0.052, 0.442, 6, 5));
    root.add(box(0.09, 0.012, 0.02, leatherM, s * 0.11, 0.056, 0.412));  // kaišić
  }

  // ------------------------------------------------------------- glava ---
  // pivot u vratu, da klimanje glave nosi i šešir i bradu
  const headG = group([], 0, 1.42, 0);
  root.add(headG);

  headG.add(sphere(0.135, skinM, 0, 0.10, 0.01, 14, 12)); // lobanja

  // istaknut nos: greben + vrh
  const noseC = cone(0.03, 0.10, skinM, 0, 0.115, 0.148, 7);
  noseC.rotation.x = 1.85;
  headG.add(noseC);
  headG.add(sphere(0.024, skinM, 0, 0.092, 0.19, 7, 6));

  // oči
  headG.add(sphere(0.017, eyeM, 0.05, 0.13, 0.128, 7, 6));
  headG.add(sphere(0.017, eyeM, -0.05, 0.13, 0.128, 7, 6));

  // čupave bele obrve
  for (const s of [-1, 1]) {
    const brow = box(0.062, 0.02, 0.022, whiteM, s * 0.052, 0.168, 0.122);
    brow.rotation.z = -s * 0.18;
    brow.rotation.x = 0.15;
    headG.add(brow);
  }

  // bora na čelu
  headG.add(box(0.09, 0.007, 0.012, mat(COLORS.skinTan), 0, 0.175, 0.128));

  // uši
  for (const s of [-1, 1]) {
    const ear = sphere(0.028, skinM, s * 0.132, 0.10, 0.01, 7, 6);
    ear.scale.set(0.6, 1, 0.8);
    headG.add(ear);
  }

  // beli pramenovi na obrazima
  for (const s of [-1, 1]) {
    const tuft = cone(0.03, 0.10, whiteM, s * 0.105, 0.045, 0.075, 6);
    tuft.rotation.x = Math.PI - 0.35;
    tuft.rotation.z = s * 0.5;
    headG.add(tuft);
  }

  // polumesečaste naočare: dva tanka torusa, mostić i drške ka ušima
  for (const s of [-1, 1]) {
    const lens = torus(0.033, 0.0045, goldM, s * 0.05, 0.122, 0.142, 6, 18);
    lens.scale.set(1, 0.7, 1); // spljošteno = polumesec
    headG.add(lens);
    headG.add(bar([s * 0.08, 0.122, 0.138], [s * 0.132, 0.135, 0.02], 0.004, goldM, 5));
  }
  headG.add(bar([-0.022, 0.128, 0.143], [0.022, 0.128, 0.143], 0.004, goldM, 5));

  // seda kosa pozadi + dva pramena niz vrat
  const hairBack = sphere(0.105, whiteM, 0, 0.05, -0.05, 12, 10);
  hairBack.scale.set(1.08, 1.2, 1.0);
  headG.add(hairBack);
  for (const s of [-1, 1]) {
    const strand = cone(0.025, 0.16, whiteM, s * 0.06, -0.06, -0.10, 6);
    strand.rotation.x = Math.PI + 0.25;
    headG.add(strand);
  }

  // --------------------------------------------------- duga bela brada ---
  // pivot u bradi (donja vilica) — njiše se u update
  const beardG = group([], 0, 0.02, 0.115);
  headG.add(beardG);

  const beardMain = cone(0.085, 0.36, whiteM, 0, -0.19, -0.01, 9);
  beardMain.rotation.x = Math.PI - 0.15;
  beardG.add(beardMain);
  for (const s of [-1, 1]) {
    const side = cone(0.05, 0.24, whiteM, s * 0.06, -0.13, -0.025, 7);
    side.rotation.x = Math.PI - 0.22;
    side.rotation.z = s * 0.18;
    beardG.add(side);
    const base = sphere(0.055, whiteM, s * 0.05, -0.045, -0.02, 8, 6);
    base.scale.set(1, 1.25, 0.85);
    beardG.add(base);
    const wisp = cone(0.018, 0.15, whiteM, s * 0.03, -0.335, 0.005, 5);
    wisp.rotation.x = Math.PI - 0.1;
    beardG.add(wisp);
    // brkovi padaju ispod nosa u stranu
    beardG.add(bar([s * 0.008, 0.055, 0.03], [s * 0.09, 0.008, 0.012], 0.015, whiteM, 6));
  }
  const lipTuft = sphere(0.032, whiteM, 0, 0.0, 0.0, 6, 5);
  lipTuft.scale.set(1.2, 0.8, 0.9);
  beardG.add(lipTuft);

  // ------------------------------------- šiljati šešir sa savijenim vrhom ---
  const hatG = group([], 0, 0.195, 0);
  hatG.rotation.x = -0.06; // blago naheren napred-nazad
  headG.add(hatG);

  hatG.add(cyl(0.31, 0.335, 0.028, robeM, 0, 0, 0, 18));            // širok obod
  hatG.add(cyl(0.115, 0.195, 0.17, robeM, 0, 0.095, 0, 14));        // kruna, segment 1
  hatG.add(cyl(0.19, 0.21, 0.055, goldM, 0, 0.035, 0, 16));         // zlatna traka
  const buckle = octa(0.026, goldLightM, 0, 0.035, 0.212);          // zvezdana kopča
  buckle.scale.set(1, 1, 0.5);
  hatG.add(buckle);
  hatG.add(sphere(0.011, goldLightM, 0, 0.035, 0.228, 5, 4));

  const seg2 = cyl(0.06, 0.112, 0.13, robeM, 0.012, 0.245, 0, 12);  // segment 2, nagnut
  seg2.rotation.z = -0.18;
  hatG.add(seg2);

  // vrh šešira u svojoj grupi — njiše se u update
  const tipG = group([], 0.03, 0.30, 0);
  const tipCone = cone(0.058, 0.14, robeM, 0.025, 0.05, 0, 10);
  tipCone.rotation.z = -0.55;
  tipG.add(tipCone);
  tipG.add(sphere(0.018, goldLightM, 0.078, 0.098, 0, 6, 5));       // zlatna kuglica na vrhu
  hatG.add(tipG);

  // sitne zvezde po kruni šešira
  const hatStuds = [[0.5, 0.06], [2.2, 0.10], [4.2, 0.13]];
  for (const [a, sy] of hatStuds) {
    const r = 0.195 - (sy - 0.01) * (0.08 / 0.17) + 0.006;
    const st = tetra(0.014, goldLightM, r * Math.sin(a), sy, r * Math.cos(a));
    st.rotation.set(a, sy * 7, a * 0.5);
    hatG.add(st);
  }

  // -------------------------------------------------------------- ruke ---
  // ramena i laktovi
  root.add(sphere(0.075, robeM, -0.245, 1.315, 0.02, 10, 8));
  root.add(sphere(0.075, robeM, 0.245, 1.315, 0.02, 10, 8));
  root.add(sphere(0.055, robeM, -0.36, 1.08, 0.09, 8, 6));
  root.add(sphere(0.055, robeM, 0.33, 1.06, 0.10, 8, 6));

  // leva ruka — podignuta, drži štap
  root.add(frustum([-0.245, 1.30, 0.02], [-0.36, 1.08, 0.09], 0.05, 0.07, robeM));   // nadlaktica
  root.add(bar([-0.36, 1.08, 0.09], [-0.385, 1.28, 0.14], 0.032, skinM, 8));         // podlaktica
  root.add(frustum([-0.372, 1.115, 0.10], [-0.39, 1.275, 0.142], 0.052, 0.10, robeDarkM)); // širok rukav
  root.add(bar([-0.385, 1.27, 0.14], [-0.36, 1.335, 0.145], 0.028, skinM, 7));       // zglob
  const lPalm = sphere(0.042, skinM, -0.352, 1.345, 0.145, 8, 6);
  lPalm.scale.set(0.7, 1.1, 1.2);
  root.add(lPalm);
  // prsti obavijeni oko štapa (štap je na x=-0.40, z=0.15)
  for (let i = 0; i < 4; i++) {
    const fy = 1.385 - i * 0.026;
    root.add(bar([-0.355, fy, 0.183], [-0.437, fy, 0.180], 0.012, skinM, 5));
  }
  root.add(bar([-0.355, 1.315, 0.125], [-0.432, 1.35, 0.118], 0.013, skinM, 5));     // palac

  // desna ruka — savijena napred, dlan nagore sa iskrom
  root.add(frustum([0.245, 1.30, 0.02], [0.33, 1.06, 0.10], 0.05, 0.07, robeM));     // nadlaktica
  root.add(bar([0.33, 1.06, 0.10], [0.27, 1.10, 0.30], 0.030, skinM, 8));            // podlaktica
  root.add(frustum([0.325, 1.065, 0.115], [0.28, 1.095, 0.27], 0.05, 0.095, robeDarkM)); // širok rukav
  root.add(bar([0.278, 1.10, 0.28], [0.264, 1.10, 0.32], 0.028, skinM, 7));          // zglob
  const rPalm = sphere(0.042, skinM, 0.26, 1.10, 0.33, 8, 6);
  rPalm.scale.set(1.1, 0.6, 1.3);
  root.add(rPalm);
  const fingerX = [0.216, 0.246, 0.276, 0.304];
  for (const fx of fingerX) {
    root.add(bar([fx, 1.10, 0.375], [fx - 0.004, 1.148, 0.424], 0.011, skinM, 5));   // povijeni prsti
  }
  root.add(bar([0.298, 1.10, 0.308], [0.348, 1.128, 0.352], 0.012, skinM, 5));       // palac
  // zlatna iskra koja lebdi nad dlanom
  const mote = sphere(0.02, moteM, 0.26, 1.205, 0.365, 8, 6);
  root.add(mote);

  // ------------------------------------------------------ kvrgavi štap ---
  // 3-4 blago izlomljena segmenta, viši od čarobnjaka
  const staffPts = [
    [-0.44, 0.02, 0.24], [-0.40, 0.55, 0.20], [-0.43, 1.10, 0.14],
    [-0.37, 1.60, 0.16], [-0.40, 1.92, 0.10],
  ];
  const staffR = [0.035, 0.032, 0.030, 0.027];
  for (let i = 0; i < 4; i++) {
    root.add(bar(staffPts[i], staffPts[i + 1], staffR[i], woodM, 7));
  }
  // čvorovi na spojevima i kvrge po dužini
  root.add(sphere(0.040, woodM, -0.40, 0.55, 0.20, 7, 6));
  root.add(sphere(0.037, woodM, -0.43, 1.10, 0.14, 7, 6));
  root.add(sphere(0.034, woodM, -0.37, 1.60, 0.16, 7, 6));
  root.add(sphere(0.022, woodM, -0.415, 0.32, 0.222, 6, 5));
  root.add(sphere(0.020, woodM, -0.438, 0.85, 0.163, 6, 5));
  root.add(sphere(0.019, woodM, -0.392, 1.45, 0.152, 6, 5));

  // korenasti kraci koji drže kristal
  const prongDefs = [
    [-0.36, 0.10, 0, -0.35], [-0.44, 0.10, 0, 0.35],
    [-0.40, 0.14, 0.35, 0], [-0.40, 0.06, -0.35, 0],
  ];
  for (const [px, pz, rx, rz] of prongDefs) {
    const p = cone(0.018, 0.10, woodM, px, 1.97, pz, 5);
    p.rotation.x = rx;
    p.rotation.z = rz;
    root.add(p);
  }

  // sjajni cijan kristal (oktaedar) — pulsira u update
  const crystal = octa(0.062, crystalM, -0.40, 2.02, 0.10);
  crystal.scale.set(1, 1.45, 1);
  crystal.rotation.y = 0.5;
  root.add(crystal);

  // 3 rune-kocke koje kruže oko kristala
  const orbitG = group([], -0.40, 2.02, 0.10);
  root.add(orbitG);
  const runes = [];
  for (let i = 0; i < 3; i++) {
    const a = (i * 2 * Math.PI) / 3;
    const rc = box(0.032, 0.032, 0.032, runeM, 0.13 * Math.cos(a), 0, 0.13 * Math.sin(a));
    runes.push(rc);
    orbitG.add(rc);
  }

  // ----------------------------------------------------------- animacija ---
  // 8 nezavisnih mikro-pokreta, sve čiste funkcije od t, bez alokacija
  function update(t) {
    // disanje — grudni sloj se blago širi
    const b = Math.sin(t * 1.35 + PH_BREATH);
    chest.scale.set(1 + 0.02 * b, 1, 1 + 0.02 * b);

    // glava se lagano osvrće i klima
    headG.rotation.y = 0.06 * Math.sin(t * 0.42 + PH_HEAD);
    headG.rotation.x = 0.03 * Math.sin(t * 0.9 + 1.1);

    // brada se njiše
    beardG.rotation.x = 0.06 + 0.05 * Math.sin(t * 1.15 + PH_BEARD);

    // šešir se blago naginje, savijeni vrh se klati svojim ritmom
    hatG.rotation.z = 0.05 + 0.02 * Math.sin(t * 0.6 + PH_HAT);
    tipG.rotation.z = 0.10 * Math.sin(t * 0.8 + PH_TIP);

    // kristal pulsira i okreće se
    const p = Math.sin(t * 2.2 + PH_CRY);
    crystalM.emissiveIntensity = 1.6 + 0.55 * p;
    crystal.rotation.y = 0.5 + t * 0.9;
    crystal.scale.set(1 + 0.05 * p, 1.45 * (1 + 0.05 * p), 1 + 0.05 * p);

    // rune kruže oko kristala i poskakuju
    orbitG.rotation.y = t * 1.25;
    for (let i = 0; i < 3; i++) {
      runes[i].rotation.x = t * 1.6 + i * 2.09;
      runes[i].rotation.z = t * 1.05 + i * 1.4;
      runes[i].position.y = 0.05 * Math.sin(t * 1.8 + i * 2.09);
    }

    // iskra nad dlanom lebdi i treperi
    mote.position.y = 1.205 + 0.035 * Math.sin(t * 1.55 + PH_MOTE);
    moteM.emissiveIntensity = 1.3 + 0.5 * Math.sin(t * 2.8 + 1.0);
  }

  return {
    name: 'Maldrik Sivi',
    title: 'Arhimag Kule Zvezda',
    blurb: 'Sedamdeset godina proučava zvezde i tajne drevnog jezika. Kažu da je jednom rečju ugasio požar koji je gutao čitav grad — i istom rečju ga ponovo zapalio.',
    group: root,
    update,
  };
}
