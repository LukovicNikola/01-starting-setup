// heroes/ranger.js — Silvara Listopad, vilenjačka izvidnica
//
// Vitka vilenjakinja sa podignutom kapuljačom: plašt od preklopljenih panela,
// kožni prsluk sa vidljivim šavovima, recurve luk u levoj ruci, tobolac sa
// strelama na leđima, debela plava pletenica preko levog ramena.
// Stopala na y=0, gleda u +Z, ukupna visina ~1.75.

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, lathe, bar, group, shaded,
} from './common.js';

export function createRanger() {
  const root = new THREE.Group();

  // ------------------------------------------------------------ materijali
  const mLeather = mat(COLORS.leather);
  const mLeatherD = mat(COLORS.leatherDark);
  const mLeatherL = mat(COLORS.leatherLight);
  const mGreen = mat(COLORS.clothGreen);
  const mGreenD = mat(0x2f5027);                 // tamnija šumska zelena (porub)
  const mTrouser = mat(COLORS.clothBrown);
  const mSkin = mat(COLORS.skinPale);
  const mHair = mat(COLORS.hairBlond);
  const mWood = mat(COLORS.wood);
  const mWoodD = mat(COLORS.woodDark);
  const mGold = metalMat(COLORS.gold);
  const mBronze = metalMat(COLORS.bronze);
  const mStitch = mat(0x3a2716);                 // tamni konac šavova
  const mString = mat(COLORS.clothWhite, { roughness: 0.5 });
  const mRed = mat(COLORS.clothRed);
  const mWhite = mat(COLORS.clothWhite);
  const mLips = mat(0x8a4a3b);
  const eyeMat = glowMat(COLORS.glowGreen, 0.9); // zelene oči — tinjaju
  const gemMat = glowMat(COLORS.glowAmber, 1.1); // dragulj na brošu

  // ------------------------------------------------------------ noge i čizme
  const mkBoot = (x, z, rotY) => {
    const g = group([], x, 0, z);
    g.rotation.y = rotY;
    g.add(box(0.10, 0.025, 0.24, mLeatherD, 0, 0.013, 0.03));   // đon
    g.add(box(0.085, 0.06, 0.21, mLeatherD, 0, 0.055, 0.035));  // stopalo
    g.add(cyl(0.055, 0.066, 0.30, mLeatherD, 0, 0.23, 0));      // sara
    g.add(cyl(0.078, 0.068, 0.075, mLeather, 0, 0.395, 0));     // presavijena manžetna
    g.add(box(0.05, 0.012, 0.01, mLeatherD, 0, 0.393, 0.072));  // kaišić
    g.add(box(0.02, 0.026, 0.012, mBronze, 0, 0.393, 0.079));   // kopča
    return g;
  };
  root.add(mkBoot(0.095, 0.03, 0.14));   // leva noga malo napred
  root.add(mkBoot(-0.095, -0.02, -0.18));

  const thighL = cyl(0.062, 0.056, 0.42, mTrouser, 0.095, 0.63, 0.02);
  thighL.rotation.x = -0.05;
  const thighR = cyl(0.062, 0.056, 0.42, mTrouser, -0.095, 0.63, -0.01);
  thighR.rotation.x = 0.03;
  root.add(thighL, thighR);
  root.add(sphere(0.055, mTrouser, 0.095, 0.44, 0.035));   // koleno
  root.add(sphere(0.055, mTrouser, -0.095, 0.44, -0.015)); // koleno
  root.add(box(0.23, 0.13, 0.16, mTrouser, 0, 0.82, 0));   // karlica

  // ------------------------------------------------------------------ trup
  const TORSO_Y = 0.85;
  const torsoG = group([], 0, TORSO_Y, 0);
  root.add(torsoG);

  // kožni prsluk (jerkin)
  torsoG.add(lathe(
    [[0.145, 0], [0.155, 0.06], [0.145, 0.16], [0.125, 0.28], [0.115, 0.36], [0.125, 0.44]],
    mLeather, 16
  ));

  // redovi šavova — napred dve kolone, sa strane po jedan red
  const FRONT_ST = [[0.10, 0.154], [0.165, 0.147], [0.23, 0.137], [0.295, 0.126], [0.36, 0.118]];
  for (const [sy, sz] of FRONT_ST) {
    torsoG.add(box(0.007, 0.018, 0.006, mStitch, -0.028, sy, sz));
    torsoG.add(box(0.007, 0.018, 0.006, mStitch, 0.028, sy, sz));
  }
  const SIDE_ST = [[0.08, 0.156], [0.16, 0.148], [0.24, 0.135], [0.32, 0.124]];
  for (const [sy, sx] of SIDE_ST) {
    torsoG.add(box(0.006, 0.02, 0.018, mStitch, -sx, sy, 0));
    torsoG.add(box(0.006, 0.02, 0.018, mStitch, sx, sy, 0));
  }

  // pojas sa zlatnom kopčom
  torsoG.add(cyl(0.163, 0.168, 0.055, mLeatherD, 0, 0.035, 0, 14));
  torsoG.add(box(0.055, 0.045, 0.018, mGold, 0, 0.035, 0.162));
  torsoG.add(box(0.008, 0.032, 0.02, mGold, 0, 0.035, 0.168)); // trn kopče

  // kožni jezičci ispod pojasa
  for (const a of [-1.0, -0.4, 0.4, 1.0]) {
    const tab = box(0.09, 0.11, 0.016, mLeather, Math.sin(a) * 0.150, -0.045, Math.cos(a) * 0.150);
    tab.rotation.y = a;
    tab.rotation.x = 0.10;
    torsoG.add(tab);
  }

  // torbica na pojasu (desna strana)
  const pouchG = group([], -0.13, -0.005, 0.105);
  pouchG.rotation.y = -0.5;
  pouchG.add(box(0.085, 0.095, 0.05, mLeatherL, 0, -0.03, 0));
  const flap = box(0.088, 0.05, 0.054, mLeather, 0, 0.02, 0);
  flap.rotation.x = 0.12;
  pouchG.add(flap);
  pouchG.add(sphere(0.009, mGold, 0, -0.005, 0.032, 8, 8)); // dugme
  torsoG.add(pouchG);

  // bodež u koricama na pojasu
  const daggerG = group([], -0.165, 0.005, 0.02);
  daggerG.rotation.z = 0.15;
  daggerG.add(box(0.036, 0.17, 0.024, mLeatherD, 0, -0.095, 0));   // korice
  const dTip = cone(0.016, 0.04, mLeatherD, 0, -0.195, 0, 6);
  dTip.rotation.x = Math.PI;
  daggerG.add(dTip);
  daggerG.add(box(0.042, 0.02, 0.028, mBronze, 0, -0.015, 0));     // grlo korica
  daggerG.add(box(0.056, 0.012, 0.03, mBronze, 0, 0.012, 0));      // štitnik
  daggerG.add(cyl(0.011, 0.013, 0.06, mWoodD, 0, 0.045, 0, 8));    // drška
  daggerG.add(sphere(0.015, mGold, 0, 0.082, 0, 8, 8));            // jabuka
  torsoG.add(daggerG);

  // kaiš tobolca preko grudi (dva segmenta + kopča) i preko leđa
  torsoG.add(bar([-0.10, 0.42, 0.095], [0.035, 0.25, 0.148], 0.011, mLeatherD));
  torsoG.add(bar([0.035, 0.25, 0.148], [0.155, 0.04, 0.125], 0.011, mLeatherD));
  torsoG.add(box(0.03, 0.032, 0.012, mBronze, 0.035, 0.25, 0.153));
  torsoG.add(bar([-0.10, 0.43, -0.10], [0.15, 0.05, -0.13], 0.011, mLeatherD));

  // zelena kragna/ogrtač oko vrata (baza kapuljače)
  torsoG.add(cyl(0.075, 0.15, 0.14, mGreen, 0, 0.50, 0.005, 12));
  torsoG.add(cyl(0.038, 0.044, 0.12, mSkin, 0, 0.55, 0.02)); // vrat

  // ------------------------------------------------- plašt od 4 panela
  const cloakPivots = [];
  const CLOAK = [
    [-0.135, 0.17, 0.20, 0.0],
    [-0.046, 0.11, 0.07, 1.4],
    [0.046, 0.11, -0.07, 2.6],
    [0.135, 0.17, -0.20, 4.1],
  ];
  for (const [px, bx, by, ph] of CLOAK) {
    const pivot = group([], 0, 0.47, -0.115);
    pivot.rotation.x = bx;
    pivot.rotation.y = by;
    pivot.userData = { baseX: bx, baseY: by, ph };
    pivot.add(box(0.16, 0.88, 0.014, mGreen, px, -0.435, 0));
    cloakPivots.push(pivot);
    torsoG.add(pivot);
  }
  // zlatni porub na unutrašnja dva panela
  cloakPivots[1].add(box(0.15, 0.022, 0.016, mGold, -0.046, -0.862, 0.002));
  cloakPivots[2].add(box(0.15, 0.022, 0.016, mGold, 0.046, -0.862, 0.002));

  // zlatni broš u obliku lista — kopča plašta na grudima
  const broochG = group([], 0.055, 0.415, 0.118);
  broochG.rotation.x = -0.15;
  const leaf1 = cone(0.022, 0.052, mGold, 0, -0.018, 0, 6);
  leaf1.rotation.z = Math.PI;
  leaf1.scale.set(1, 1, 0.35);
  const leaf2 = cone(0.015, 0.034, mGold, 0, 0.024, 0, 6);
  leaf2.scale.set(1, 1, 0.35);
  broochG.add(leaf1, leaf2, sphere(0.009, gemMat, 0, 0.002, 0.01, 8, 8));
  torsoG.add(broochG);

  // ------------------------------------------------------------------ glava
  const headG = group([], 0, 0.68, 0.02);
  torsoG.add(headG);
  const skull = sphere(0.105, mSkin, 0, 0, 0);
  skull.scale.set(0.92, 1.02, 0.98);
  headG.add(skull);
  const chin = sphere(0.052, mSkin, 0, -0.062, 0.045);
  chin.scale.set(0.85, 0.6, 0.8);
  headG.add(chin);
  const nose = cone(0.014, 0.045, mSkin, 0, -0.005, 0.105, 6);
  nose.rotation.x = Math.PI / 2;
  headG.add(nose);
  headG.add(box(0.032, 0.007, 0.01, mLips, 0, -0.048, 0.092)); // usta
  headG.add(sphere(0.011, eyeMat, -0.037, 0.012, 0.092, 8, 8));
  headG.add(sphere(0.011, eyeMat, 0.037, 0.012, 0.092, 8, 8));
  const browL = box(0.036, 0.008, 0.01, mHair, -0.038, 0.042, 0.092);
  browL.rotation.z = -0.14;
  const browR = box(0.036, 0.008, 0.01, mHair, 0.038, 0.042, 0.092);
  browR.rotation.z = 0.14;
  headG.add(browL, browR);

  // špicaste vilenjačke uši — kupe nagnute u stranu i blago nagore
  const earR = cone(0.02, 0.10, mSkin, -0.10, 0.02, 0.055, 6);
  earR.rotation.z = 1.35;
  const earL = cone(0.02, 0.10, mSkin, 0.10, 0.02, 0.055, 6);
  earL.rotation.z = -1.35;
  headG.add(earR, earL);

  // plavi pramenovi ispod ruba kapuljače
  const FRINGE = [
    [-0.05, 0.075, 0.062, 0.3],
    [-0.012, 0.088, 0.068, -0.2],
    [0.028, 0.083, 0.066, 0.25],
    [0.058, 0.068, 0.058, -0.35],
  ];
  for (const [fx, fy, fz, rz] of FRINGE) {
    const f = box(0.034, 0.026, 0.03, mHair, fx, fy, fz);
    f.rotation.z = rz;
    headG.add(f);
  }
  const nape = sphere(0.075, mHair, 0, -0.09, -0.05); // kosa na potiljku
  nape.scale.set(1.1, 0.8, 0.9);
  headG.add(nape);

  // debela pletenica preko levog ramena — lanac spheres koje se smanjuju
  const braidG = group([], 0.09, -0.10, 0.05);
  headG.add(braidG);
  const BRAID = [
    [0.005, -0.055, 0.028, 0.032],
    [0.012, -0.115, 0.048, 0.030],
    [0.018, -0.175, 0.060, 0.028],
    [0.022, -0.235, 0.064, 0.026],
    [0.024, -0.295, 0.060, 0.023],
    [0.025, -0.350, 0.054, 0.020],
    [0.026, -0.400, 0.048, 0.017],
  ];
  for (const [bx, by, bz, br] of BRAID) braidG.add(sphere(br, mHair, bx, by, bz, 10, 8));
  braidG.add(cyl(0.013, 0.013, 0.026, mLeatherD, 0.026, -0.432, 0.045, 8)); // kožna vezica
  const tuft = cone(0.014, 0.045, mHair, 0.026, -0.468, 0.042, 8);          // kićanka
  tuft.rotation.x = Math.PI;
  braidG.add(tuft);

  // podignuta kapuljača — otvoreni lathe (otvor napred, oko lica)
  const hoodPts = [
    [0.115, -0.02], [0.165, 0.06], [0.175, 0.16], [0.14, 0.26], [0.06, 0.32], [0.005, 0.335],
  ].map((p) => new THREE.Vector2(p[0], p[1]));
  const hood = shaded(new THREE.Mesh(
    new THREE.LatheGeometry(hoodPts, 18, Math.PI * 0.38, Math.PI * 1.24),
    mat(COLORS.clothGreen, { side: THREE.DoubleSide })
  ));
  hood.position.set(0, -0.12, -0.01);
  hood.rotation.x = -0.06;
  headG.add(hood);
  const hoodRim = torus(0.148, 0.014, mGreenD, 0, 0.035, 0.05); // porub otvora
  hoodRim.rotation.x = -0.32;
  headG.add(hoodRim);

  // ------------------------------------------------------------------ ruke
  // leva ruka — savijena napred, drži luk
  const armL = group([], 0.175, 0.44, 0.01);
  armL.rotation.x = -0.38;
  armL.rotation.z = 0.22;
  torsoG.add(armL);
  armL.add(sphere(0.052, mLeather, 0, -0.01, 0));          // rameni jastučić
  armL.add(cyl(0.042, 0.038, 0.24, mGreen, 0, -0.13, 0));  // nadlaktica
  armL.add(sphere(0.036, mGreen, 0, -0.25, 0));            // lakat
  const foreL = group([], 0, -0.25, 0);
  foreL.rotation.x = -0.52;
  armL.add(foreL);
  foreL.add(cyl(0.035, 0.031, 0.22, mGreen, 0, -0.11, 0));
  foreL.add(cyl(0.042, 0.048, 0.13, mLeather, 0, -0.135, 0)); // kožni bracer
  const strapA = torus(0.046, 0.006, mLeatherD, 0, -0.09, 0);
  strapA.rotation.x = Math.PI / 2;
  const strapB = torus(0.049, 0.006, mLeatherD, 0, -0.18, 0);
  strapB.rotation.x = Math.PI / 2;
  foreL.add(strapA, strapB);
  foreL.add(box(0.014, 0.014, 0.01, mBronze, 0, -0.09, 0.05)); // kopča bracer-a
  foreL.add(sphere(0.028, mSkin, 0, -0.245, 0));               // zglob šake
  const wristL = group([], 0, -0.245, 0);                      // marker za hvat luka
  foreL.add(wristL);

  // desna ruka — opuštena uz telo
  const armR = group([], -0.175, 0.44, 0.01);
  const ARM_R_X = 0.10;
  armR.rotation.x = ARM_R_X;
  armR.rotation.z = -0.14;
  torsoG.add(armR);
  armR.add(sphere(0.052, mLeather, 0, -0.01, 0));
  armR.add(cyl(0.042, 0.038, 0.24, mGreen, 0, -0.13, 0));
  armR.add(sphere(0.036, mGreen, 0, -0.25, 0));
  const foreR = group([], 0, -0.25, 0);
  foreR.rotation.x = -0.30;
  armR.add(foreR);
  foreR.add(cyl(0.035, 0.031, 0.22, mGreen, 0, -0.11, 0));
  foreR.add(cyl(0.040, 0.045, 0.11, mLeatherD, 0, -0.125, 0)); // štitnik podlaktice
  const strapC = torus(0.044, 0.005, mLeather, 0, -0.155, 0);
  strapC.rotation.x = Math.PI / 2;
  foreR.add(strapC);
  const handR = group([], 0, -0.245, 0); // opuštena šaka sa prstima
  foreR.add(handR);
  handR.add(box(0.048, 0.065, 0.03, mSkin, 0, -0.02, 0));
  for (let i = 0; i < 4; i++) {
    const f = box(0.012, 0.045, 0.013, mSkin, -0.017 + i * 0.0115, -0.068, 0.004);
    f.rotation.x = -0.45;
    handR.add(f);
  }
  const thumbR = box(0.012, 0.036, 0.012, mSkin, 0.026, -0.032, 0.01);
  thumbR.rotation.z = -0.5;
  handR.add(thumbR);

  // ---------------------------------------------------------- recurve luk
  const bowG = new THREE.Group();
  root.add(bowG);
  // profil kraka: [y, z] od rukohvata ka vrhu (recurve — vrh se savija unazad)
  const LIMB = [
    [0.075, 0.010], [0.19, 0.052], [0.31, 0.070], [0.42, 0.050], [0.51, 0.005], [0.565, -0.055],
  ];
  const LIMB_R = [0.015, 0.013, 0.012, 0.010, 0.008];
  for (const s of [1, -1]) {
    for (let i = 0; i < LIMB.length - 1; i++) {
      bowG.add(bar(
        [0, s * LIMB[i][0], LIMB[i][1]],
        [0, s * LIMB[i + 1][0], LIMB[i + 1][1]],
        LIMB_R[i], mWoodD, 6
      ));
    }
    bowG.add(sphere(0.009, mGold, 0, s * 0.565, -0.055, 6, 6));       // vrh kraka
    bowG.add(cyl(0.021, 0.021, 0.02, mGold, 0, s * 0.09, 0.009, 8));  // zlatni prsten
  }
  bowG.add(bar([0, -0.085, 0.008], [0, 0.085, 0.008], 0.018, mWood, 8)); // riser
  for (let i = -1; i <= 1; i++) {
    bowG.add(cyl(0.021, 0.021, 0.03, mLeatherD, 0, i * 0.031, 0.006, 8)); // kožni omot rukohvata
  }
  bowG.add(bar([0, 0.565, -0.055], [0, -0.565, -0.055], 0.0032, mString, 5)); // zategnuta tetiva
  bowG.add(cyl(0.006, 0.006, 0.022, mLeatherD, 0, 0, -0.055, 6));           // omot na sredini tetive

  // leva šaka modelovana uz sam rukohvat — prsti obavijaju luk
  bowG.add(box(0.036, 0.08, 0.042, mSkin, -0.006, 0, -0.026)); // dlan
  for (let i = 0; i < 4; i++) {
    const f = box(0.05, 0.015, 0.02, mSkin, 0.002, 0.028 - i * 0.019, 0.024);
    f.rotation.y = -0.25;
    bowG.add(f);
  }
  const thumbL = box(0.016, 0.045, 0.016, mSkin, -0.03, 0.012, -0.006);
  thumbL.rotation.x = -0.3;
  bowG.add(thumbL);

  // ------------------------------------------- tobolac sa strelama (leđa)
  const quiverG = group([], -0.10, 0.30, -0.185);
  quiverG.rotation.z = 0.22;
  quiverG.rotation.x = -0.10;
  torsoG.add(quiverG);
  quiverG.add(cyl(0.055, 0.048, 0.42, mLeather, 0, 0, 0, 12));      // telo tobolca
  const qRim = torus(0.054, 0.012, mGold, 0, 0.21, 0);              // zlatni obod
  qRim.rotation.x = Math.PI / 2;
  quiverG.add(qRim);
  const qBottom = sphere(0.05, mLeatherD, 0, -0.21, 0);
  qBottom.scale.set(1, 0.5, 1);
  quiverG.add(qBottom);
  quiverG.add(cyl(0.058, 0.058, 0.035, mLeatherD, 0, 0.02, 0, 12)); // kožni pojas

  // 6 strela na različitim visinama i nagibima, crveno-belo perje
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI * 2 * i) / 6 + 0.4;
    const arrow = group([], Math.cos(a) * 0.026, 0.24 + 0.028 * Math.sin(i * 2.1), Math.sin(a) * 0.026);
    arrow.rotation.x = 0.05 * Math.sin(i * 1.7);
    arrow.rotation.z = 0.05 * Math.cos(i * 1.3);
    arrow.add(cyl(0.005, 0.005, 0.30, mWood, 0, 0, 0, 6));                       // šipka
    arrow.add(box(0.003, 0.055, 0.024, i % 2 ? mRed : mWhite, 0, 0.115, 0));     // perje
    arrow.add(box(0.024, 0.055, 0.003, i % 2 ? mWhite : mRed, 0, 0.115, 0));     // perje ukršteno
    quiverG.add(arrow);
  }

  // --------------------------------- postavljanje luka u levu šaku (build-time)
  root.updateMatrixWorld(true);
  const wp = new THREE.Vector3();
  wristL.getWorldPosition(wp);
  bowG.position.set(wp.x + 0.011, wp.y - 0.031, wp.z + 0.065);
  bowG.rotation.y = 0.12;
  bowG.rotation.z = 0.06;

  // ------------------------------------------------------------- animacija
  // Nekoliko nezavisnih mikro-pokreta na različitim frekvencijama i fazama.
  // Čista funkcija od t, bez alokacija.
  const CP = cloakPivots;
  function update(t) {
    // 1) disanje — trup se blago podiže i naginje
    torsoG.position.y = TORSO_Y + 0.012 * Math.sin(t * 1.9);
    torsoG.rotation.x = 0.014 * Math.sin(t * 1.9 + 0.5);
    // 2) sporo osmatranje — glava se okreće levo-desno
    headG.rotation.y = 0.13 * Math.sin(t * 0.31 + 1.7);
    headG.rotation.z = 0.03 * Math.sin(t * 0.23 + 0.5);
    // 3) pletenica se lagano njiše
    braidG.rotation.x = 0.06 * Math.sin(t * 1.15 + 0.6);
    braidG.rotation.z = 0.05 * Math.sin(t * 0.93 + 2.1);
    // 4) paneli plašta lelujaju svaki svojom fazom
    for (let i = 0; i < CP.length; i++) {
      const p = CP[i];
      p.rotation.x = p.userData.baseX + 0.05 * Math.sin(t * 0.82 + p.userData.ph);
      p.rotation.y = p.userData.baseY + 0.02 * Math.sin(t * 0.61 + p.userData.ph * 1.7);
    }
    // 5) luk blago poigrava u šaci
    bowG.rotation.z = 0.06 + 0.02 * Math.sin(t * 0.71 + 0.9);
    // 6) desna ruka prati ritam daha (druga faza)
    armR.rotation.x = ARM_R_X + 0.03 * Math.sin(t * 1.9 + 2.6);
    // 7) oči tinjaju zelenim sjajem
    eyeMat.emissiveIntensity = 0.9 + 0.25 * Math.sin(t * 2.6);
  }

  return {
    name: 'Silvara Listopad',
    title: 'Vilenjačka izvidnica',
    blurb: 'Niko ne poznaje šume Zapada bolje od nje. Strela koju odapne u sumrak pogađa metu pre nego što se čuje zvuk tetive.',
    group: root,
    update,
  };
}
