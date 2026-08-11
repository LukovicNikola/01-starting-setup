// heroes/barbarian.js — Kragmar Krvavi Vuk, varvarin severnih pustara
//
// Ogroman, mišićav severnjak golog torza: ratne šare, ožiljci, vučja koža
// preko levog ramena i džinovska dvoručna sekira naslonjena na desno rame.
// Stopala na y=0, gleda ka +Z, ukupna visina ~2.05-2.1.

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, bar, group, shaded,
} from './common.js';

export function createBarbarian() {
  // ------------------------------------------------------------ materijali --
  const skin       = mat(COLORS.skinTan);
  const skinDark   = mat(COLORS.skinDark);
  const scarM      = mat(0x7e4c2e, { roughness: 0.9 });       // ožiljci, tamniji ten
  const paintM     = mat(0x3a66c4, { roughness: 0.6 });       // plava ratna boja
  const hairM      = mat(COLORS.hairBlack);
  const boneM      = mat(COLORS.bone);
  const fangM      = mat(0xcfc4a4);
  const furM       = mat(0x878d96, { roughness: 0.95 });      // siva vučja dlaka
  const furDarkM   = mat(0x666c75, { roughness: 0.95 });
  const bootFurM   = mat(0x7d6b52, { roughness: 0.95 });      // krzno na čizmama
  const leatherM   = mat(COLORS.leather);
  const leatherDkM = mat(COLORS.leatherDark);
  const woodM      = mat(COLORS.woodDark);
  const ironM      = metalMat(COLORS.iron);
  const steelM     = metalMat(COLORS.steel);
  const darkM      = mat(0x241a12);
  const redPaintM  = mat(0x7e1d18, { roughness: 0.7 });       // krvavo-crvena pruga
  const gemM       = glowMat(COLORS.glowAmber, 1.4);          // runski kamen na sekiri

  const root = group();

  // ------------------------------------------------------- noge i čizme -----
  // blagi raskorak: leva noga (X+) napred, desna nazad
  const legDefs = [
    { x:  0.18, zf: 0.08 },   // leva
    { x: -0.18, zf: -0.06 },  // desna
  ];
  for (const L of legDefs) {
    // stopalo i krznena čizma sa ukrštenim kaiševima
    root.add(box(0.15, 0.09, 0.28, leatherDkM, L.x, 0.05, L.zf + 0.05));
    root.add(box(0.14, 0.07, 0.10, bootFurM, L.x, 0.085, L.zf + 0.15));
    root.add(cyl(0.10, 0.12, 0.30, bootFurM, L.x, 0.28, L.zf));
    const rim = torus(0.10, 0.028, bootFurM, L.x, 0.425, L.zf);
    rim.rotation.x = Math.PI / 2;
    root.add(rim);
    root.add(bar([L.x - 0.09, 0.16, L.zf + 0.10], [L.x + 0.09, 0.28, L.zf + 0.08], 0.011, leatherDkM));
    root.add(bar([L.x + 0.09, 0.16, L.zf + 0.10], [L.x - 0.09, 0.28, L.zf + 0.08], 0.011, leatherDkM));
    root.add(box(0.028, 0.028, 0.014, steelM, L.x, 0.22, L.zf + 0.105));
    // koleno i butina (vrh se krije pod suknjom)
    root.add(sphere(0.095, skin, L.x, 0.46, L.zf * 0.8));
    root.add(cyl(0.115, 0.10, 0.34, skin, L.x, 0.63, L.zf * 0.5));
  }

  // --------------------------------------------- kožna suknja sa nitnama ----
  const kilt = cyl(0.27, 0.36, 0.34, leatherM, 0, 0.82, 0);
  kilt.scale.z = 0.85;
  root.add(kilt);
  // 8 visećih kožnih traka, svaka sa dve nitne
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const strip = group([
      box(0.085, 0.30, 0.028, leatherDkM, 0, 0, 0.014),
      sphere(0.013, ironM, 0, 0.06, 0.034),
      sphere(0.013, ironM, 0, -0.05, 0.034),
    ], Math.sin(a) * 0.30, 0.80, Math.cos(a) * 0.26);
    strip.rotation.y = a;
    root.add(strip);
  }
  // pojas sa nitnama
  const belt = cyl(0.29, 0.30, 0.08, leatherDkM, 0, 1.0, 0);
  belt.scale.z = 0.85;
  root.add(belt);
  for (const a of [0.9, 1.7, 2.5, 3.8, 4.6, 5.4]) {
    root.add(sphere(0.014, ironM, Math.sin(a) * 0.30, 1.0, Math.cos(a) * 0.26));
  }
  // kopča: minijaturna lobanja od kostiju
  const skull = sphere(0.045, boneM, 0, 1.012, 0.262);
  skull.scale.set(0.85, 1, 0.75);
  root.add(skull);
  root.add(box(0.05, 0.026, 0.03, boneM, 0, 0.972, 0.262));
  root.add(sphere(0.011, darkM, -0.017, 1.018, 0.292));
  root.add(sphere(0.011, darkM, 0.017, 1.018, 0.292));
  root.add(box(0.008, 0.014, 0.008, boneM, -0.011, 0.988, 0.288));
  root.add(box(0.008, 0.014, 0.008, boneM, 0.011, 0.988, 0.288));

  // ------------------------------------------------------------ donji trup --
  const waist = cyl(0.24, 0.26, 0.24, skin, 0, 1.05, 0);
  waist.scale.z = 0.8;
  root.add(waist);
  // šest kockica trbušnjaka
  for (const [ax, ay, az] of [
    [-0.052, 1.24, 0.185], [0.052, 1.24, 0.185],
    [-0.052, 1.16, 0.195], [0.052, 1.16, 0.195],
    [-0.052, 1.08, 0.20],  [0.052, 1.08, 0.20],
  ]) {
    root.add(box(0.088, 0.066, 0.05, skin, ax, ay, az));
  }
  // ožiljak preko trbuha
  const scarAbs = box(0.012, 0.07, 0.01, scarM, 0.06, 1.13, 0.228);
  scarAbs.rotation.z = 0.5;
  root.add(scarAbs);

  // ------------------------------- grudni koš (grupa koja "diše" u update) --
  const CHEST_Y = 1.35;
  const chestG = group([], 0, CHEST_Y, 0);
  root.add(chestG);

  const chest = cyl(0.33, 0.24, 0.38, skin, 0, 0.02, -0.01);
  chest.scale.z = 0.78;
  chestG.add(chest);
  // isklesane grudi — dve spljoštene sfere
  for (const sx of [-1, 1]) {
    const pec = sphere(0.13, skin, sx * 0.13, 0.07, 0.17);
    pec.scale.set(1.0, 0.75, 0.55);
    chestG.add(pec);
    // trapezi i leđna masa
    const trap = sphere(0.11, skin, sx * 0.16, 0.20, -0.03);
    trap.scale.set(1.4, 0.55, 0.9);
    chestG.add(trap);
  }
  const backM = sphere(0.16, skin, 0, 0.08, -0.13);
  backM.scale.set(1.3, 1.0, 0.6);
  chestG.add(backM);
  // debeo vrat
  chestG.add(cyl(0.075, 0.098, 0.18, skin, 0, 0.28, 0));

  // plave ratne pruge preko grudi (tanke ploče tik uz kožu)
  const warChest = [
    [0.34, 0.040, 0.0,  0.10, 0.247],
    [0.30, 0.035, 0.02, 0.02, 0.242],
    [0.22, 0.030, -0.05, -0.07, 0.212],
  ];
  for (const [w, h, px, py, pz] of warChest) {
    const stripe = box(w, h, 0.012, paintM, px, py, pz);
    stripe.rotation.z = 0.28;
    chestG.add(stripe);
  }
  // ožiljci na grudima
  const scar1 = box(0.014, 0.10, 0.01, scarM, -0.11, 0.09, 0.252);
  scar1.rotation.z = 0.45;
  chestG.add(scar1);
  const scar2 = box(0.012, 0.08, 0.01, scarM, 0.14, 0.03, 0.238);
  scar2.rotation.z = -0.3;
  chestG.add(scar2);

  // ogrlica: kožna vrpca + naizmenične kandže i očnjaci
  const cord = torus(0.145, 0.008, leatherDkM, 0, 0.19, 0.03, 8, 24);
  cord.rotation.x = 1.22;
  chestG.add(cord);
  const clawX = [-0.15, -0.10, -0.05, 0, 0.05, 0.10, 0.15];
  const clawY = [0.145, 0.13, 0.12, 0.112, 0.12, 0.13, 0.145];
  const clawZ = [0.20, 0.215, 0.225, 0.23, 0.225, 0.215, 0.20];
  for (let i = 0; i < 7; i++) {
    const big = i % 2 === 0;
    const claw = cone(big ? 0.014 : 0.011, big ? 0.06 : 0.045,
      big ? boneM : fangM, clawX[i], clawY[i], clawZ[i]);
    claw.rotation.x = Math.PI;
    claw.rotation.z = clawX[i] * 0.8;
    chestG.add(claw);
  }

  // ------------------------------------------------------------------ glava --
  const headG = group([], 0, 1.80, 0.02);
  root.add(headG);

  const skullH = sphere(0.145, skin, 0, 0, 0);
  skullH.scale.set(0.95, 1.05, 1.0);
  headG.add(skullH);
  headG.add(box(0.15, 0.09, 0.12, skin, 0, -0.075, 0.045));       // vilica
  // teška obrva i mrke oči
  const brow = box(0.20, 0.04, 0.06, skin, 0, 0.045, 0.108);
  brow.rotation.x = 0.15;
  headG.add(brow);
  headG.add(sphere(0.017, darkM, -0.052, 0.005, 0.124));
  headG.add(sphere(0.017, darkM, 0.052, 0.005, 0.124));
  // slomljen, kriv nos
  const nose = box(0.035, 0.062, 0.042, skin, 0, -0.008, 0.142);
  nose.rotation.z = 0.14;
  nose.rotation.x = -0.1;
  headG.add(nose);
  headG.add(sphere(0.016, skin, 0.01, 0.008, 0.152));             // kvrga na nosu
  // usta, brkovi i kratka tamna brada
  headG.add(box(0.06, 0.012, 0.02, darkM, 0, -0.06, 0.132));
  for (const sx of [-1, 1]) {
    const mst = box(0.05, 0.018, 0.03, hairM, sx * 0.037, -0.052, 0.126);
    mst.rotation.z = -sx * 0.3;
    headG.add(mst);
  }
  headG.add(box(0.16, 0.10, 0.10, hairM, 0, -0.115, 0.055));
  headG.add(box(0.06, 0.05, 0.05, hairM, 0, -0.155, 0.09));
  // uši i koštana minđuša na desnom uhu
  headG.add(sphere(0.035, skin, -0.14, -0.01, 0.01));
  headG.add(sphere(0.035, skin, 0.14, -0.01, 0.01));
  headG.add(torus(0.018, 0.005, boneM, -0.145, -0.05, 0.01, 6, 14));
  const earFang = cone(0.008, 0.026, boneM, -0.145, -0.082, 0.01);
  earFang.rotation.x = Math.PI;
  headG.add(earFang);
  // ratna boja preko čela i preko nosa/obraza
  headG.add(box(0.17, 0.02, 0.012, paintM, 0, 0.085, 0.118));
  headG.add(box(0.18, 0.018, 0.012, paintM, 0, -0.028, 0.138));
  // ožiljak na obrazu
  const scarFace = box(0.01, 0.06, 0.008, scarM, 0.088, 0.015, 0.108);
  scarFace.rotation.z = 0.3;
  headG.add(scarFace);
  // tamna kresta (niz kupa) preko temena
  const moZ = [0.115, 0.075, 0.035, -0.005, -0.045, -0.085, -0.12];
  const moY = [0.115, 0.145, 0.16, 0.165, 0.16, 0.145, 0.12];
  for (let i = 0; i < 7; i++) {
    const spike = cone(0.026, 0.11, hairM, 0, moY[i], moZ[i]);
    spike.rotation.x = 0.35 - i * 0.13;
    headG.add(spike);
  }
  // duga tanka kika na potiljku (grupa da bi se njihala)
  const braidG = group([], 0, 0.0, -0.14);
  headG.add(braidG);
  const brY = [-0.04, -0.10, -0.16, -0.22, -0.28];
  const brZ = [-0.02, -0.035, -0.04, -0.04, -0.035];
  for (let i = 0; i < 5; i++) {
    braidG.add(sphere(0.024 - i * 0.0015, hairM, 0, brY[i], brZ[i]));
  }
  braidG.add(cyl(0.012, 0.012, 0.03, boneM, 0, -0.315, -0.03));
  const braidTip = cone(0.014, 0.05, hairM, 0, -0.352, -0.03);
  braidTip.rotation.x = Math.PI;
  braidG.add(braidTip);

  // ----------------------------------- vučja koža preko levog ramena (X+) ---
  const peltG = group([], 0.30, 1.58, 0);
  root.add(peltG);
  const fur1 = sphere(0.15, furM, 0.03, 0.02, 0);
  fur1.scale.set(1.25, 0.6, 1.25);
  peltG.add(fur1);
  const fur2 = sphere(0.11, furM, 0.14, -0.03, -0.06);
  fur2.scale.set(1.1, 0.65, 1.2);
  peltG.add(fur2);
  const fur3 = sphere(0.12, furDarkM, -0.05, 0.03, -0.06);
  fur3.scale.set(1.1, 0.5, 1.1);
  peltG.add(fur3);
  const drape = box(0.22, 0.32, 0.06, furM, 0.05, -0.16, -0.19);
  drape.rotation.x = 0.22;
  peltG.add(drape);
  for (const tx of [-0.03, 0.05, 0.13]) {
    const tuft = cone(0.028, 0.08, furDarkM, tx, -0.345, -0.24);
    tuft.rotation.x = Math.PI - 0.22;
    peltG.add(tuft);
  }
  // stilizovana vučja GLAVA položena na rame
  const wolfG = group([], 0.06, 0.10, 0.09);
  peltG.add(wolfG);
  const wSkull = sphere(0.085, furM, 0, 0, 0);
  wSkull.scale.set(0.9, 0.8, 1.0);
  wolfG.add(wSkull);
  wolfG.add(box(0.09, 0.06, 0.11, furM, 0, -0.02, 0.09));         // njuška
  wolfG.add(sphere(0.02, darkM, 0, -0.005, 0.148));               // nos
  for (const sx of [-1, 1]) {
    wolfG.add(cone(0.025, 0.055, furDarkM, sx * 0.05, 0.068, -0.02)); // uši
    wolfG.add(sphere(0.016, darkM, sx * 0.042, 0.022, 0.066));    // tamne duplje
    const fang = cone(0.008, 0.03, boneM, sx * 0.028, -0.062, 0.12);
    fang.rotation.x = Math.PI;
    wolfG.add(fang);
  }
  // dve šape vise na grudima
  peltG.add(bar([0.13, -0.04, 0.12], [0.05, -0.30, 0.20], 0.032, furM));
  peltG.add(sphere(0.038, furDarkM, 0.05, -0.31, 0.21));
  peltG.add(bar([0.19, -0.06, 0.06], [0.16, -0.34, 0.12], 0.030, furM));
  peltG.add(sphere(0.036, furDarkM, 0.16, -0.35, 0.13));

  // ------------------------------------ desna ruka (X-) drži veliku sekiru --
  const armRG = group([], -0.33, 1.52, 0);
  root.add(armRG);
  const deltR = sphere(0.125, skin, -0.02, 0.005, 0);
  deltR.scale.set(1.15, 0.9, 1.0);
  armRG.add(deltR);
  armRG.add(bar([-0.03, -0.02, 0.01], [-0.09, -0.26, 0.13], 0.088, skin));
  armRG.add(sphere(0.068, skin, -0.065, -0.12, 0.085));           // biceps
  armRG.add(sphere(0.075, skin, -0.09, -0.26, 0.13));             // lakat
  armRG.add(bar([-0.09, -0.26, 0.13], [-0.04, -0.10, 0.26], 0.07, skin));
  // gvozdeni štitnik podlaktice sa nitnama
  armRG.add(bar([-0.075, -0.215, 0.168], [-0.058, -0.16, 0.212], 0.088, ironM));
  armRG.add(sphere(0.013, steelM, -0.155, -0.19, 0.19));
  armRG.add(sphere(0.013, steelM, -0.065, -0.19, 0.275));
  armRG.add(sphere(0.013, steelM, -0.065, -0.135, 0.155));

  // sekira: grupa u tački hvata, nagnuta preko ramena unazad
  const axeG = group([], -0.04, -0.10, 0.26);
  axeG.rotation.x = -1.25;
  armRG.add(axeG);
  // držalja + kožni omotači + jabuka
  axeG.add(cyl(0.032, 0.036, 1.75, woodM, 0, 0.275, 0, 8));
  for (const wy of [-0.42, -0.30, -0.18, 0.15]) {
    axeG.add(cyl(0.04, 0.04, 0.07, leatherM, 0, wy, 0, 8));
  }
  axeG.add(cyl(0.045, 0.05, 0.06, ironM, 0, -0.58, 0, 8));
  axeG.add(sphere(0.04, ironM, 0, -0.62, 0));
  // čaura sečiva, zakivci i runski kamen koji tinja
  axeG.add(cyl(0.05, 0.055, 0.22, ironM, 0, 0.80, 0, 8));
  axeG.add(sphere(0.013, steelM, -0.05, 0.86, 0));
  axeG.add(sphere(0.013, steelM, 0.05, 0.86, 0));
  axeG.add(sphere(0.021, gemM, 0, 0.70, 0.05));
  // ogromno polumesečasto sečivo (delimični valjak otvoren ka držalji)
  const blade = shaded(new THREE.Mesh(
    new THREE.CylinderGeometry(0.30, 0.30, 0.032, 18, 1, false, -2.1, 4.2),
    steelM,
  ));
  blade.rotation.z = Math.PI / 2;
  blade.position.set(0, 0.80, 0.10);
  axeG.add(blade);
  const bladeRim = torus(0.30, 0.012, ironM, 0, 0.80, 0.10, 8, 26);
  bladeRim.rotation.y = Math.PI / 2;
  axeG.add(bladeRim);
  // tamnocrvena pruga boje na obe strane sečiva
  axeG.add(box(0.008, 0.30, 0.05, redPaintM, 0.022, 0.80, 0.19));
  axeG.add(box(0.008, 0.30, 0.05, redPaintM, -0.022, 0.80, 0.19));
  // šiljak na poleđini
  const spike = cone(0.05, 0.28, ironM, 0, 0.80, -0.19);
  spike.rotation.x = -Math.PI / 2;
  axeG.add(spike);
  // desna šaka obavijena oko držalje (dlan + 4 prsta + palac)
  axeG.add(box(0.05, 0.11, 0.09, skin, -0.055, 0, 0));
  for (const fy of [-0.045, -0.015, 0.015, 0.045]) {
    axeG.add(box(0.095, 0.026, 0.028, skin, 0, fy, -0.045));
  }
  const thumbR = box(0.03, 0.055, 0.03, skin, -0.045, -0.055, 0.035);
  thumbR.rotation.x = -0.4;
  axeG.add(thumbR);

  // -------------------------------- leva ruka (X+), slobodna pesnica dole ---
  const armLG = group([], 0.34, 1.52, 0);
  root.add(armLG);
  const deltL = sphere(0.125, skin, 0.02, 0.005, 0);
  deltL.scale.set(1.15, 0.9, 1.0);
  armLG.add(deltL);
  armLG.add(bar([0.03, -0.02, 0.01], [0.09, -0.28, 0.05], 0.088, skin));
  armLG.add(sphere(0.068, skin, 0.065, -0.14, 0.045));            // biceps
  armLG.add(sphere(0.075, skin, 0.09, -0.28, 0.05));              // lakat
  armLG.add(bar([0.09, -0.28, 0.05], [0.09, -0.46, 0.22], 0.068, skin));
  // štitnik podlaktice
  armLG.add(bar([0.09, -0.355, 0.12], [0.09, -0.415, 0.177], 0.086, ironM));
  armLG.add(sphere(0.013, steelM, 0.175, -0.385, 0.15));
  armLG.add(sphere(0.013, steelM, 0.09, -0.35, 0.235));
  armLG.add(sphere(0.013, steelM, 0.09, -0.44, 0.11));
  // ožiljak preko nadlaktice
  const scarArm = box(0.012, 0.09, 0.01, scarM, 0.155, -0.14, 0.055);
  scarArm.rotation.z = -0.35;
  armLG.add(scarArm);
  // pesnica: prsti se polako stežu u update()
  const fistL = group([], 0.09, -0.49, 0.25);
  fistL.rotation.x = -0.7;
  armLG.add(fistL);
  fistL.add(box(0.085, 0.10, 0.08, skin, 0, 0, 0));
  const fingersL = [];
  for (const fx of [-0.03, -0.01, 0.01, 0.03]) {
    const f = box(0.019, 0.05, 0.032, skin, fx, -0.008, 0.05);
    f.rotation.x = -0.55;
    fistL.add(f);
    fingersL.push(f);
  }
  const thumbL = box(0.028, 0.05, 0.028, skin, -0.052, -0.012, 0.02);
  thumbL.rotation.z = 0.5;
  fistL.add(thumbL);

  // -------------------------------------------------------------- animacija --
  // 6 nezavisnih mikro-pokreta: disanje grudi, njihanje kože i kike,
  // lagano osmatranje glavom, stezanje pesnice, poskok sekire uz dah
  // + pulsiranje runskog kamena. Sve je čista funkcija od t, bez alokacija.
  const PH1 = 0.35, PH2 = 1.7, PH3 = 0.8, PH4 = 1.1, PH5 = 2.0, PH6 = 0.9;

  function update(t) {
    const breath = Math.sin(t * 1.1);
    const b = 0.022 * breath;
    chestG.scale.set(1 + b, 1 + b * 0.45, 1 + b);        // duboko disanje
    chestG.position.y = CHEST_Y + 0.008 * breath;

    peltG.rotation.z = 0.045 * Math.sin(t * 0.85 + PH2); // njihanje vučje kože
    peltG.rotation.x = 0.03 * Math.sin(t * 0.62 + 0.6);

    braidG.rotation.x = 0.10 * Math.sin(t * 1.4 + PH3);  // kika se klati
    braidG.rotation.z = 0.08 * Math.sin(t * 1.13 + 2.3);

    headG.rotation.y = 0.07 * Math.sin(t * PH1 + PH5);   // mrko osmatranje
    headG.rotation.x = 0.025 * Math.sin(t * 0.9 + 0.3);

    armRG.rotation.x = 0.02 * Math.sin(t * 1.1 + PH1);   // sekira prati dah
    axeG.rotation.z = 0.018 * Math.sin(t * PH4 + 0.6);

    const cl = 0.5 + 0.5 * Math.sin(t * 0.55 + PH4);     // sporo stezanje pesnice
    for (let i = 0; i < fingersL.length; i++) {
      fingersL[i].rotation.x = -0.55 - 0.14 * cl;
    }
    thumbL.rotation.z = 0.5 + 0.08 * cl;

    gemM.emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 2.1 + PH6); // runa tinja
  }

  return {
    name: 'Kragmar Krvavi Vuk',
    title: 'Varvarin severnih pustara',
    blurb: 'Kada zatrubi rog severa, Kragmar je prvi u jurišu. Ne nosi oklop — kaže da ožiljci pamte bolje od čelika.',
    group: root,
    update,
  };
}
