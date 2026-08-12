// src/heroes/inquisitor.js — Inkvizitorka Vela, Inkvizitorka Otvorenog Oka
//
// Silueta: uspravan, nepomičan stub od gvožđa i tkanine. Ramena su široka od
// oklopnih naramenika, glava je velika zatvorena kaciga bez ijednog otvora
// osim uskog vodoravnog proreza iza kojeg tinjaju dve svetle tačke. U desnici
// (na -X, jer gleda u +Z) drži visoku gvozdenu motku sa fenjerom obešenim o
// zakrivljenu kuku; levu ruku je spustila na balčak mača o levom boku.
// Sa pojasa vise okovana knjiga, okovi, svežanj ključeva i pečatnjak.
//
// Orijentacija: gleda u +Z, pa je NJENA desna strana na -X.
//
// Visinski orijentiri: stopala 0, kolena 0.50, kukovi 0.90, pojas 1.005,
// grudi 1.24, ramena 1.44, okovratnik 1.50, prorez kacige 1.68, teme 1.84.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Glow, Ghost,
  box, cyl, sphere, cone, torus, bar, group,
  curve, chain, rivets, rivetRing, chainmail, edged,
  makeHand, makeBoot, Anim,
} from '../kit.js';

export function createInquisitor() {
  const g = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  const iron = Metal(C.iron, { roughness: 0.5 });
  const ironD = Metal(C.blackIron, { roughness: 0.58 });
  const steel = Metal(C.steel, { roughness: 0.32 });
  const steelD = Metal(C.steelDark, { roughness: 0.44 });
  const mail = Metal(C.steelDark, { roughness: 0.6 });
  const gold = Metal(C.gold);
  const goldP = Metal(C.goldPale);
  const brass = Metal(C.brass);
  const leather = Hide(C.leatherDark);
  const leatherP = Hide(C.leather);
  const tab = Cloth(C.charcoal);                 // nadkošulja — ugljena boja
  const tabD = Cloth(0x1b1e23);                  // njena zadnja, izlizana strana
  const tabTrim = Cloth(0x3c424b);               // opšiv nadkošulje
  const cloakM = Cloth(0x171a1e);                // plašt, još tamniji od tabarda
  const cloakIn = Cloth(0x35232b);               // postava sa primesom vina
  const waxM = M(0x8d2230, { roughness: 0.55, flat: false });
  const paper = M(0xcfc4a6, { roughness: 0.96 });
  const dark = M(0x06070a, { roughness: 1 });    // mrak u prorezu i rupicama
  const glassM = Ghost(C.emberPale, 0.7, 0.28);  // okna fenjera
  const eyeML = Glow(C.emberPale, 2.3);          // leva tačka u prorezu
  const eyeMR = Glow(C.emberPale, 2.3);          // desna tačka, svoj ritam
  const flameM = Glow(0xffa63c, 2.5, { transparent: true, opacity: 0.9 });
  const flameCoreM = Glow(0xffd77e, 3.0, { transparent: true, opacity: 0.95 });

  // ---------------------------------------------------------------- pomoćno --
  // tačka između dve tačke sa odmakom — za laktove, kolena, kaiševe
  const mid = (a, b, f, off = [0, 0, 0]) => [
    a[0] + (b[0] - a[0]) * f + off[0],
    a[1] + (b[1] - a[1]) * f + off[1],
    a[2] + (b[2] - a[2]) * f + off[2],
  ];
  // obruč u vodoravnoj ravni (torus je po difoltu u XY ravni)
  const hoop = (r, tube, mat, x, y, z, seg = 6, tSeg = 16, tilt = 0) => {
    const t = torus(r, tube, mat, x, y, z, seg, tSeg);
    t.rotation.x = Math.PI / 2 + tilt;
    return t;
  };
  // disk okrenut ka +Z (pločice, kopče, okna)
  const disc = (r, h, mat, x, y, z, seg = 14) => {
    const d = cyl(r, r, h, mat, x, y, z, seg);
    d.rotation.x = Math.PI / 2;
    return d;
  };

  // ==========================================================================
  // NOGE — težina na desnoj (-X) nozi u koju je uprta motka, leva popuštena
  // ==========================================================================
  const HIP_Y = 0.90;
  for (const s of [1, -1]) {
    const load = s === -1;                        // noseća noga
    const hipP = [s * 0.148, HIP_Y, 0];
    const kneeP = [s * (load ? 0.172 : 0.208), load ? 0.505 : 0.486, load ? 0.006 : 0.052];
    const ankP = [s * (load ? 0.180 : 0.226), 0.148, load ? 0.0 : 0.030];

    // veriške čakšire ispod oklopa
    g.add(bar(hipP, kneeP, 0.098, mail, 9, 0.076));
    g.add(bar(kneeP, ankP, 0.072, mail, 9, 0.055));
    g.add(sphere(0.052, mail, ankP[0], ankP[1] + 0.02, ankP[2] - 0.032, 8, 7));

    // oklopna butna ploča preko prednje strane butine
    const cA = mid(hipP, kneeP, 0.22, [0, 0, 0.062]);
    const cB = mid(hipP, kneeP, 0.86, [0, 0, 0.052]);
    g.add(bar(cA, cB, 0.066, steelD, 8, 0.058));
    g.add(rivets(mid(cA, cB, 0.08, [s * 0.05, 0, 0.006]),
      mid(cA, cB, 0.92, [s * 0.05, 0, 0.006]), 3, 0.009, brass));

    // štitnik kolena: kapa, obruč i bočno krilce
    g.add(sphere(0.079, steel, kneeP[0], kneeP[1], kneeP[2] + 0.012, 10, 9));
    const rim = torus(0.078, 0.011, steelD, kneeP[0], kneeP[1] - 0.052, kneeP[2] + 0.008, 6, 14);
    rim.rotation.x = Math.PI / 2 + 0.2;
    g.add(rim);
    const wing = cone(0.05, 0.07, steel, kneeP[0] + s * 0.072, kneeP[1] - 0.01, kneeP[2] - 0.005, 5);
    wing.rotation.z = -s * 1.35;
    wing.scale.z = 0.5;
    g.add(wing);

    // cevanica: oklopna ploča, zakivci i kaiš
    const gA = mid(kneeP, ankP, 0.16, [0, 0, 0.05]);
    const gB = mid(kneeP, ankP, 0.88, [0, 0, 0.042]);
    g.add(bar(gA, gB, 0.052, steel, 8, 0.046));
    g.add(rivets(mid(gA, gB, 0.12, [s * 0.038, 0, 0]),
      mid(gA, gB, 0.9, [s * 0.038, 0, 0]), 3, 0.008, brass));
    const strapP = mid(kneeP, ankP, 0.52);
    g.add(hoop(0.064, 0.014, leather, strapP[0], strapP[1], strapP[2], 6, 12, 0.16));
    g.add(box(0.03, 0.024, 0.014, brass, strapP[0] + s * 0.06, strapP[1], strapP[2] + 0.012));
    // ogrebotina po oklopu cevanice
    const scr = box(0.006, 0.05, 0.008, ironD, gA[0] + s * 0.02, gA[1] - 0.05, gA[2] + 0.036);
    scr.rotation.z = 0.5;
    g.add(scr);

    // okovana čizma
    const boot = makeBoot({ mat: leather, sole: ironD, cuff: steelD, buckle: brass, s: 1.05 });
    boot.position.set(ankP[0], 0, load ? 0.0 : 0.030);
    boot.rotation.y = s * 0.18;
    g.add(boot);
    // gvozdena kapa preko prstiju i dve prečke preko stopala
    const cap = sphere(0.072, steelD, ankP[0], 0.098, (load ? 0.0 : 0.030) + 0.152, 8, 7);
    cap.scale.set(1.02, 0.7, 0.92);
    cap.rotation.y = s * 0.18;
    g.add(cap);
    const bnd = box(0.155, 0.016, 0.05, iron, ankP[0], 0.128, (load ? 0.0 : 0.030) + 0.05);
    bnd.rotation.y = s * 0.18;
    g.add(bnd);
    g.add(sphere(0.01, brass, ankP[0] + s * 0.07, 0.128, (load ? 0.0 : 0.030) + 0.05, 6, 5));
  }

  // ==========================================================================
  // KUKOVI, SUKNJA OD PLOČA I POJAS
  // ==========================================================================
  g.add(box(0.30, 0.19, 0.225, steelD, 0, HIP_Y + 0.02, 0));
  for (const s of [-1, 1]) g.add(sphere(0.104, mail, s * 0.14, HIP_Y - 0.01, 0, 9, 8));

  // dve lame suknje od pločica, širih ka dole
  const fauldA = cyl(0.242, 0.256, 0.078, steelD, 0, 0.862, 0, 16);
  fauldA.scale.z = 0.86;
  g.add(fauldA);
  const fauldB = cyl(0.256, 0.268, 0.072, steel, 0, 0.796, 0, 16);
  fauldB.scale.z = 0.86;
  g.add(fauldB);
  g.add(rivetRing(0.262, 7, 0.011, brass, 0.796, 0.86, 0.2));
  g.add(hoop(0.27, 0.012, ironD, 0, 0.764, 0, 6, 20));

  // veriška krila ispod suknje
  g.add(chainmail(0.246, 1, 10, mail, 0.706, 0.052, 0.86));

  // pojas: debela koža, zakivci, velika kopča
  const belt = cyl(0.236, 0.242, 0.086, leatherP, 0, 1.005, 0, 16);
  belt.scale.z = 0.85;
  g.add(belt);
  g.add(rivetRing(0.244, 10, 0.011, brass, 1.005, 0.85, 0.15));
  g.add(hoop(0.246, 0.009, leather, 0, 1.046, 0, 6, 20));
  g.add(hoop(0.246, 0.009, leather, 0, 0.966, 0, 6, 20));
  const buck = group([], 0, 1.005, 0.198);
  buck.add(box(0.11, 0.09, 0.014, brass, 0, 0, 0));
  buck.add(box(0.13, 0.018, 0.02, brass, 0, 0.05, 0.004));
  buck.add(box(0.13, 0.018, 0.02, brass, 0, -0.05, 0.004));
  buck.add(box(0.018, 0.115, 0.02, brass, 0.058, 0, 0.004));
  buck.add(box(0.018, 0.115, 0.02, brass, -0.058, 0, 0.004));
  buck.add(box(0.014, 0.066, 0.026, goldP, 0, 0, 0.016));
  buck.add(sphere(0.009, dark, 0, 0, 0.032, 6, 5));
  g.add(buck);
  // slobodan kraj pojasa visi niz kuk
  const tail = box(0.058, 0.16, 0.022, leather, -0.082, 0.915, 0.19);
  tail.rotation.z = -0.1;
  g.add(tail);
  g.add(box(0.052, 0.03, 0.026, brass, -0.09, 0.836, 0.19));
  g.add(rivets([-0.07, 0.98, 0.196], [-0.086, 0.87, 0.192], 3, 0.008, brass));

  // ==========================================================================
  // TRUP — oklopni prsnik u grupi koja diše
  // ==========================================================================
  const chest = group([], 0, 1.24, 0);
  chest.rotation.z = 0.014;
  chest.rotation.y = -0.03;
  g.add(chest);

  const core = cyl(0.206, 0.19, 0.40, steelD, 0, 0, 0, 14);
  core.scale.z = 0.80;
  chest.add(core);
  const belly = cyl(0.19, 0.20, 0.10, steelD, 0, -0.235, 0, 14);
  belly.scale.z = 0.80;
  chest.add(belly);
  // izbačena rebra prsnika i središnji greben
  for (const s of [-1, 1]) {
    const p = sphere(0.088, steel, s * 0.078, 0.055, 0.108, 10, 9);
    p.scale.set(1.05, 0.95, 0.66);
    chest.add(p);
  }
  chest.add(box(0.032, 0.36, 0.036, steel, 0, 0.0, 0.168));
  chest.add(box(0.24, 0.026, 0.03, steel, 0, 0.19, 0.152));
  chest.add(hoop(0.198, 0.014, iron, 0, 0.202, 0, 6, 20));
  chest.add(hoop(0.202, 0.012, iron, 0, -0.196, 0, 6, 20));
  chest.add(rivetRing(0.2, 8, 0.010, brass, 0.176, 0.80, 0.3));
  // zadnja ploča sa uzdužnim grebenom
  chest.add(box(0.30, 0.36, 0.03, steelD, 0, 0.0, -0.168));
  chest.add(box(0.036, 0.34, 0.03, steel, 0, 0.0, -0.184));
  chest.add(rivets([-0.13, 0.17, -0.178], [0.13, 0.17, -0.178], 4, 0.009, brass));
  // veriške karike koje se vide u pazuhu i oko struka
  chest.add(chainmail(0.198, 1, 11, mail, -0.285, 0.05, 0.82));
  // ogrebotine i zaseci po prsniku
  for (const [x, y, rz] of [[-0.10, 0.07, 0.6], [0.12, -0.05, -0.4]]) {
    const sc = box(0.006, 0.09, 0.01, ironD, x, y, 0.168);
    sc.rotation.z = rz;
    chest.add(sc);
  }

  // ==========================================================================
  // NADKOŠULJA (TABARD) do kolena, sa znakom Otvorenog Oka
  // ==========================================================================
  const tabF = edged(0.30, 0.80, 0.026, tab, tabTrim, 0, 0.95, 0.185, 0.018);
  g.add(tabF);
  const tabB = edged(0.30, 0.78, 0.026, tabD, tabTrim, 0, 0.96, -0.185, 0.018);
  g.add(tabB);
  // ramena nadkošulje prelaze preko naramenika
  for (const s of [-1, 1]) {
    const sh = box(0.13, 0.026, 0.34, tab, s * 0.10, 1.395, 0.0);
    sh.rotation.z = -s * 0.14;
    g.add(sh);
  }
  // bočne vezice koje spajaju prednji i zadnji plat
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const y = 1.08 - i * 0.19;
      g.add(bar([s * 0.145, y, 0.17], [s * 0.155, y - 0.02, -0.17], 0.008, leather, 5));
      g.add(sphere(0.008, brass, s * 0.152, y, 0.176, 6, 5));
    }
  }
  // iskrzan donji rub prednjeg plata
  for (let i = 0; i < 4; i++) {
    const n = box(0.045, 0.05, 0.03, tabD, -0.084 + i * 0.056, 0.552 - (i % 2) * 0.018, 0.185);
    g.add(n);
  }

  // znak: zlatno otvoreno oko u sunčevom vencu
  const sigil = group([], 0, 1.28, 0.198);
  g.add(sigil);
  sigil.add(disc(0.082, 0.010, gold, 0, 0, 0, 16));
  sigil.add(disc(0.088, 0.006, goldP, 0, 0, -0.004, 16));
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const sp = cone(0.017, 0.064, goldP, Math.sin(a) * 0.104, Math.cos(a) * 0.104, 0.002, 5);
    sp.rotation.z = -a;
    sp.scale.z = 0.45;
    sigil.add(sp);
  }
  const sclera = sphere(0.042, dark, 0, 0, 0.008, 12, 10);
  sclera.scale.set(1.38, 0.60, 0.28);
  sigil.add(sclera);
  sigil.add(disc(0.021, 0.014, goldP, 0, 0, 0.014, 12));
  sigil.add(disc(0.009, 0.016, dark, 0, 0, 0.019, 8));
  const lidU = box(0.10, 0.013, 0.014, gold, 0, 0.028, 0.010);
  lidU.rotation.z = 0.0;
  sigil.add(lidU);
  const lidD = box(0.096, 0.012, 0.014, gold, 0, -0.027, 0.010);
  sigil.add(lidD);
  for (let i = 0; i < 4; i++) {
    const x = -0.036 + i * 0.024;
    const l = box(0.007, 0.024, 0.008, gold, x, 0.042, 0.008);
    l.rotation.z = -x * 3.5;
    sigil.add(l);
  }

  // ==========================================================================
  // NARAMENICI — široka ramena od oklopa
  // ==========================================================================
  for (const s of [-1, 1]) {
    const paul = group([], s * 0.215, 1.435, -0.008);
    paul.rotation.z = s * 0.16;
    g.add(paul);
    const capM = sphere(0.118, steelD, 0, 0, 0, 12, 10);
    capM.scale.set(1.1, 0.86, 1.02);
    paul.add(capM);
    // tri lame koje se spuštaju preko nadlaktice
    for (let i = 0; i < 3; i++) {
      const l = sphere(0.114 - i * 0.008, i % 2 ? steel : steelD, s * 0.014 * (i + 1), -0.052 - i * 0.048, 0.004, 11, 9);
      l.scale.set(1.02, 0.4, 0.98);
      paul.add(l);
      if (i !== 1) {
        paul.add(rivets([-0.07, -0.036 - i * 0.048, 0.086], [0.07, -0.036 - i * 0.048, 0.086],
          3, 0.009, brass));
      }
    }
    // greben i šiljak na vrhu naramenika
    paul.add(box(0.028, 0.036, 0.2, steel, 0, 0.09, 0));
    const spk = cone(0.03, 0.075, iron, s * 0.09, 0.058, 0, 6);
    spk.rotation.z = -s * 1.0;
    paul.add(spk);
    paul.add(hoop(0.12, 0.011, iron, 0, 0.03, 0, 6, 16));
    // okrugla pločica koja štiti pazuh
    const bes = disc(0.055, 0.012, steelD, s * 0.03, -0.12, 0.115, 12);
    paul.add(bes);
    paul.add(sphere(0.014, brass, s * 0.03, -0.12, 0.126, 7, 6));
  }

  // ==========================================================================
  // MOTKA SA FENJEROM u desnoj (-X) ruci
  // ==========================================================================
  const pole = group([], -0.318, 0, 0.148);
  pole.rotation.z = 0.022;
  pole.rotation.x = -0.018;
  g.add(pole);
  const GRIP_Y = 1.13;

  pole.add(cyl(0.021, 0.024, 1.70, iron, 0, 0.92, 0, 9));            // gvozdena motka
  pole.add(cyl(0.029, 0.026, 0.085, ironD, 0, 0.075, 0, 8));         // okov na dnu
  const spike = cone(0.021, 0.055, steel, 0, 0.030, 0, 7);           // šiljak dodiruje kamen
  spike.rotation.x = Math.PI;
  pole.add(spike);
  pole.add(hoop(0.03, 0.007, ironD, 0, 0.124, 0, 6, 12));
  // kožni omot na hvatu, sa četiri navoja
  pole.add(cyl(0.027, 0.027, 0.205, leather, 0, GRIP_Y, 0, 9));
  for (let i = 0; i < 4; i++) {
    pole.add(hoop(0.029, 0.0062, leatherP, 0, GRIP_Y - 0.072 + i * 0.048, 0, 6, 12, 0.12));
  }
  pole.add(box(0.014, 0.032, 0.012, leatherP, 0.026, GRIP_Y - 0.112, 0.006));
  // srednji i gornji okov
  pole.add(cyl(0.031, 0.028, 0.055, ironD, 0, 1.44, 0, 8));
  pole.add(hoop(0.032, 0.007, steel, 0, 1.47, 0, 6, 12));
  pole.add(rivetRing(0.03, 3, 0.008, brass, 1.44, 1, 0.4));
  pole.add(cyl(0.03, 0.027, 0.07, ironD, 0, 1.69, 0, 8));
  pole.add(hoop(0.031, 0.007, steel, 0, 1.655, 0, 6, 12));
  // zakrivljena kuka na vrhu
  const HOOK = [-0.148, 1.700, 0.014];
  pole.add(curve([0, 1.752, 0], HOOK, [-0.052, 0.082, 0.004], iron, 0.017, 0.011, 5));
  pole.add(sphere(0.016, iron, HOOK[0], HOOK[1], HOOK[2], 8, 7));
  const hookTip = cone(0.014, 0.045, steel, HOOK[0] - 0.006, HOOK[1] - 0.03, HOOK[2], 6);
  hookTip.rotation.x = Math.PI;
  pole.add(hookTip);
  pole.add(torus(0.026, 0.007, iron, HOOK[0], HOOK[1] - 0.014, HOOK[2], 6, 12));

  // ------------------------------------------------- fenjer (pivot na kuki) --
  const lanternPivot = group([], HOOK[0], HOOK[1] - 0.016, HOOK[2]);
  pole.add(lanternPivot);
  const lant = group([], 0, 0, 0);
  lanternPivot.add(lant);

  lant.add(torus(0.019, 0.006, iron, 0, -0.008, 0, 6, 12));           // prsten za nošenje
  lant.add(curve([-0.052, -0.052, 0], [0.052, -0.052, 0], [0, 0.072, 0], iron, 0.008, 0.008, 4));
  lant.add(cone(0.106, 0.062, ironD, 0, -0.094, 0, 8));               // krov
  lant.add(hoop(0.10, 0.008, iron, 0, -0.124, 0, 6, 16));
  lant.add(cyl(0.024, 0.03, 0.05, ironD, 0, -0.05, 0, 8));            // dimnjak
  lant.add(cyl(0.034, 0.028, 0.012, iron, 0, -0.02, 0, 8));
  lant.add(sphere(0.012, ironD, 0, -0.008, 0, 7, 6));
  lant.add(box(0.15, 0.014, 0.15, ironD, 0, -0.136, 0));              // gornji ram
  lant.add(box(0.158, 0.016, 0.158, ironD, 0, -0.302, 0));            // donji ram
  // četiri ugaone šipke
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    lant.add(bar([sx * 0.066, -0.142, sz * 0.066], [sx * 0.07, -0.296, sz * 0.07], 0.0085, iron, 5));
  }
  // četiri staklena okna
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2;
    const pane = box(0.12, 0.152, 0.006, glassM, Math.sin(a) * 0.066, -0.219, Math.cos(a) * 0.066);
    pane.rotation.y = a;
    lant.add(pane);
  }
  // vratanca sa šarkama i rezom na prednjem oknu
  lant.add(box(0.01, 0.15, 0.012, iron, -0.06, -0.219, 0.07));
  lant.add(box(0.01, 0.15, 0.012, iron, 0.06, -0.219, 0.07));
  for (let i = 0; i < 2; i++) lant.add(box(0.022, 0.016, 0.016, ironD, -0.058, -0.17 - i * 0.098, 0.072));
  lant.add(box(0.026, 0.014, 0.016, brass, 0.062, -0.216, 0.072));
  lant.add(sphere(0.009, brass, 0.072, -0.216, 0.072, 6, 5));
  lant.add(rivetRing(0.07, 4, 0.009, brass, -0.302, 1, 0.785));
  // plamen unutra
  lant.add(cyl(0.032, 0.038, 0.022, ironD, 0, -0.286, 0, 8));         // ležište
  lant.add(box(0.008, 0.022, 0.008, dark, 0, -0.266, 0));             // fitilj
  const flame = cone(0.033, 0.095, flameM, 0, -0.215, 0, 7);
  lant.add(flame);
  const flameCore = cone(0.017, 0.055, flameCoreM, 0, -0.232, 0, 6);
  lant.add(flameCore);
  const halo = sphere(0.05, Ghost(C.ember, 1.4, 0.22), 0, -0.222, 0, 9, 8);
  lant.add(halo);
  lant.add(cyl(0.062, 0.072, 0.014, ironD, 0, -0.316, 0, 9));         // tacna za vosak
  lant.add(hoop(0.03, 0.007, iron, 0, -0.33, 0, 6, 12));

  // desna oklopna rukavica obuhvata motku (osa drške je Y osa šake)
  const handR = makeHand({ pose: 'grip', side: 1, skin: steel, cuff: steelD, s: 1.06 });
  handR.position.set(0, GRIP_Y, 0);
  handR.rotation.y = -0.22;
  pole.add(handR);
  // člankovite pločice preko prstiju desne rukavice
  for (let i = 0; i < 3; i++) {
    const pl = box(0.048, 0.016, 0.03, steelD, 0.01, GRIP_Y + 0.036 - i * 0.032, 0.03);
    pl.rotation.y = -0.22;
    pole.add(pl);
  }
  pole.add(cyl(0.036, 0.042, 0.09, steelD, 0, GRIP_Y + 0.155, -0.03, 9));

  // ==========================================================================
  // MAČ U KORICAMA o levom (+X) boku
  // ==========================================================================
  const sword = group([], 0.238, 0.985, 0.03);
  sword.rotation.x = 0.40;
  sword.rotation.z = -0.16;
  g.add(sword);

  sword.add(bar([0, -0.02, 0], [0.0, -0.50, 0], 0.032, leather, 8, 0.022));   // korice
  const chape = cone(0.024, 0.055, iron, 0, -0.53, 0, 7);
  chape.rotation.x = Math.PI;
  sword.add(chape);
  sword.add(cyl(0.036, 0.034, 0.06, iron, 0, -0.02, 0, 9));                   // grlić korica
  for (let i = 0; i < 3; i++) {
    sword.add(hoop(0.033 - i * 0.003, 0.008, ironD, 0, -0.13 - i * 0.13, 0, 6, 12));
  }
  sword.add(rivets([0.0, -0.08, 0.03], [0.0, -0.44, 0.024], 3, 0.008, brass));
  // dva kaiša kojima korice vise sa pojasa
  sword.add(bar([0.02, 0.01, 0.028], [-0.03, 0.05, -0.02], 0.01, leather, 6));
  sword.add(bar([-0.02, -0.09, 0.03], [0.03, -0.03, -0.03], 0.01, leather, 6));
  sword.add(torus(0.024, 0.007, iron, 0, 0.0, 0.034, 6, 12));
  // balčak
  sword.add(box(0.17, 0.022, 0.036, steelD, 0, 0.036, 0));                    // nakrsnica
  for (const sx of [-1, 1]) {
    const q = sphere(0.018, steel, sx * 0.088, 0.036, 0, 7, 6);
    q.scale.set(1.3, 0.9, 0.9);
    sword.add(q);
  }
  sword.add(cyl(0.021, 0.019, 0.13, leather, 0, 0.114, 0, 9));                // drška
  for (let i = 0; i < 3; i++) sword.add(hoop(0.023, 0.005, leatherP, 0, 0.068 + i * 0.04, 0, 6, 10));
  sword.add(sphere(0.03, steelD, 0, 0.196, 0, 10, 8));                        // jabuka
  sword.add(disc(0.016, 0.02, brass, 0, 0.196, 0.026, 10));
  sword.add(sphere(0.009, goldP, 0, 0.216, 0, 6, 5));

  // leva oklopna rukavica počiva na drški
  const handL = makeHand({ pose: 'grip', side: -1, skin: steel, cuff: steelD, s: 1.06 });
  handL.position.set(0, 0.118, 0);
  handL.rotation.y = 0.26;
  sword.add(handL);
  for (let i = 0; i < 3; i++) {
    const pl = box(0.046, 0.016, 0.03, steelD, -0.008, 0.152 - i * 0.032, 0.03);
    pl.rotation.y = 0.26;
    sword.add(pl);
  }
  sword.add(cyl(0.036, 0.042, 0.09, steelD, 0, 0.272, -0.028, 9));

  // ==========================================================================
  // RUKE — zglobovi se čitaju iz matrica oružja da šake ostanu spojene
  // ==========================================================================
  pole.updateMatrix();
  sword.updateMatrix();
  const wR = new THREE.Vector3(0, GRIP_Y + 0.21, -0.05).applyMatrix4(pole.matrix);
  const wL = new THREE.Vector3(0, 0.33, -0.05).applyMatrix4(sword.matrix);

  function buildArm(side, W, bendOut, bendBack) {
    const S = [side * 0.20, 1.40, -0.012];
    const E = mid(S, W, 0.52, [side * bendOut, 0.02, bendBack]);
    g.add(sphere(0.085, mail, S[0], S[1] - 0.03, S[2], 9, 8));            // veriški rukav
    g.add(bar(S, E, 0.072, steelD, 9, 0.058));                            // nadlaktica u oklopu
    g.add(hoop(0.075, 0.011, iron, ...mid(S, E, 0.3), 6, 14, side * 0.3));
    g.add(rivets(mid(S, E, 0.2, [0, 0, 0.055]), mid(S, E, 0.85, [0, 0, 0.048]), 3, 0.009, brass));
    // lakat: kapa i krilce
    g.add(sphere(0.065, steel, E[0], E[1], E[2], 10, 9));
    const fan = disc(0.05, 0.012, steelD, E[0] + side * 0.05, E[1] - 0.01, E[2] - 0.03, 10);
    fan.rotation.y = side * 1.2;
    g.add(fan);
    // podlaktica u oklopu, sa dva kaiša
    g.add(bar(E, W, 0.058, steel, 9, 0.046));
    const bA = mid(E, W, 0.22), bB = mid(E, W, 0.88);
    g.add(hoop(0.06, 0.012, leather, bA[0], bA[1], bA[2], 6, 12, side * 0.4));
    g.add(hoop(0.056, 0.012, leather, bB[0], bB[1], bB[2], 6, 12, side * 0.4));
    g.add(rivets(mid(E, W, 0.2, [0, 0, 0.045]), mid(E, W, 0.9, [0, 0, 0.04]), 3, 0.008, brass));
    g.add(box(0.026, 0.022, 0.014, brass, bA[0] + side * 0.055, bA[1], bA[2]));
    return E;
  }
  buildArm(-1, [wR.x, wR.y, wR.z], -0.05, -0.075);
  buildArm(1, [wL.x, wL.y, wL.z], 0.055, -0.085);

  // ==========================================================================
  // O POJASU: knjiga na lancu, okovi, ključevi, pečatnjak
  // ==========================================================================
  // — okovana knjiga koja visi i njiše se
  const bookPivot = group([], -0.14, 0.985, 0.20);
  g.add(bookPivot);
  bookPivot.add(torus(0.016, 0.005, iron, 0, 0, 0, 6, 10));
  bookPivot.add(chain([0, -0.012, 0], [0.008, -0.175, 0.008], 6, 0.017, iron));
  const bookG = group([], 0.01, -0.255, 0.01);
  bookPivot.add(bookG);
  bookG.rotation.y = 0.3;
  bookG.rotation.z = 0.08;
  bookG.add(box(0.10, 0.145, 0.038, paper, 0.006, 0, 0));                 // list na listu
  for (let i = 0; i < 2; i++) bookG.add(box(0.102, 0.006, 0.04, M(0xb8ab8c), 0.006, -0.036 + i * 0.072, 0));
  bookG.add(box(0.112, 0.158, 0.014, leatherP, 0, 0, 0.026));             // prednja korica
  bookG.add(box(0.112, 0.158, 0.014, leatherP, 0, 0, -0.026));            // zadnja korica
  bookG.add(box(0.026, 0.162, 0.07, leather, -0.058, 0, 0));              // rikna
  for (let i = 0; i < 2; i++) bookG.add(box(0.03, 0.008, 0.074, ironD, -0.058, -0.04 + i * 0.08, 0));
  for (const sy of [-1, 1]) for (const sz of [-1, 1]) {
    bookG.add(box(0.026, 0.026, 0.018, brass, 0.044, sy * 0.062, sz * 0.028));
  }
  bookG.add(box(0.04, 0.03, 0.06, brass, 0.062, 0.0, 0));                 // kopča
  bookG.add(box(0.014, 0.02, 0.024, goldP, 0.076, 0.0, 0.012));
  bookG.add(disc(0.02, 0.008, gold, 0.02, 0.0, 0.036, 10));               // zlatno oko na korici
  bookG.add(disc(0.008, 0.012, dark, 0.02, 0.0, 0.042, 8));
  bookG.add(torus(0.014, 0.005, iron, 0.0, 0.086, 0.0, 6, 10));

  // — okovi: dva obruča spojena lancem
  const shackles = group([], -0.212, 0.982, -0.055);
  g.add(shackles);
  shackles.add(bar([0, 0, 0], [0.004, -0.075, 0.006], 0.011, leather, 6));
  shackles.add(torus(0.016, 0.005, iron, 0.004, -0.082, 0.006, 6, 10));
  for (let i = 0; i < 2; i++) {
    const cuffR = torus(0.046, 0.014, ironD, -0.036 + i * 0.072, -0.148 - i * 0.02, 0.006, 8, 16);
    cuffR.rotation.x = 0.35;
    cuffR.rotation.z = (i ? 1 : -1) * 0.25;
    shackles.add(cuffR);
    shackles.add(box(0.022, 0.03, 0.018, iron, -0.036 + i * 0.072, -0.104 - i * 0.02, 0.006));
    shackles.add(sphere(0.011, brass, -0.036 + i * 0.072, -0.19 - i * 0.02, 0.012, 6, 5));
  }
  shackles.add(chain([-0.016, -0.16, 0.006], [0.02, -0.176, 0.006], 4, 0.013, iron));
  shackles.add(box(0.03, 0.036, 0.022, ironD, 0.002, -0.198, 0.008));      // katanac
  shackles.add(sphere(0.007, dark, 0.002, -0.198, 0.021, 6, 5));

  // — svežanj ključeva
  const keys = group([], -0.226, 0.978, 0.062);
  g.add(keys);
  keys.add(bar([0, 0, 0], [0.002, -0.058, 0.004], 0.009, leather, 6));
  keys.add(torus(0.03, 0.007, iron, 0.002, -0.086, 0.004, 6, 14));
  const keyDef = [[-0.022, -0.13, 0.24], [0.0, -0.145, -0.05], [0.024, -0.126, -0.3]];
  for (const [kx, ky, rz] of keyDef) {
    const k = group([], kx, ky, 0.006);
    k.rotation.z = rz;
    keys.add(k);
    k.add(cyl(0.006, 0.006, 0.086, iron, 0, 0, 0, 6));
    k.add(torus(0.014, 0.005, ironD, 0, 0.05, 0, 6, 10));
    k.add(box(0.02, 0.008, 0.006, iron, 0.008, -0.034, 0));
  }

  // — pečatnjak sa voskom
  const seal = group([], 0.13, 0.982, 0.196);
  g.add(seal);
  seal.add(bar([0, 0, 0], [-0.004, -0.05, 0.002], 0.008, leather, 6));
  seal.add(cyl(0.013, 0.016, 0.07, brass, -0.006, -0.09, 0.002, 8));
  seal.add(hoop(0.017, 0.005, goldP, -0.006, -0.062, 0.002, 6, 10));
  seal.add(cyl(0.03, 0.028, 0.014, brass, -0.006, -0.13, 0.002, 12));
  const blob = sphere(0.026, waxM, -0.006, -0.145, 0.004, 9, 8);
  blob.scale.set(1.1, 0.5, 1.05);
  seal.add(blob);
  seal.add(disc(0.012, 0.008, goldP, -0.006, -0.152, 0.02, 8));

  // ==========================================================================
  // OKOVRATNIK I VRAT — ispod kacige nema kože, samo mrak i gvožđe
  // ==========================================================================
  g.add(cyl(0.064, 0.07, 0.10, dark, 0, 1.478, -0.004, 10));
  g.add(chainmail(0.108, 1, 8, mail, 1.436, 0.05, 0.92));
  const gorget = cyl(0.118, 0.142, 0.082, steelD, 0, 1.498, 0, 14);
  gorget.scale.z = 0.94;
  g.add(gorget);
  g.add(hoop(0.146, 0.012, steel, 0, 1.462, 0, 6, 18));
  g.add(hoop(0.126, 0.011, steel, 0, 1.534, 0, 6, 18));
  g.add(rivetRing(0.144, 7, 0.010, brass, 1.478, 0.94, 0.25));
  for (const s of [-1, 1]) {
    const wingP = box(0.07, 0.05, 0.09, steel, s * 0.132, 1.478, 0.02);
    wingP.rotation.y = -s * 0.4;
    g.add(wingP);
  }
  g.add(box(0.10, 0.036, 0.03, steel, 0, 1.518, 0.128));                  // podbradni jezik

  // ==========================================================================
  // KACIGA — zatvorena, bez lica; samo uski prorez i dve tačke u mraku
  // ==========================================================================
  const head = group([], 0, 1.60, 0);
  head.rotation.x = -0.02;
  g.add(head);

  head.add(cyl(0.118, 0.134, 0.215, iron, 0, 0.02, 0, 12));               // cilindrično telo
  head.add(cyl(0.138, 0.128, 0.046, iron, 0, -0.102, 0, 12));             // donji rub, malo raširen
  head.add(hoop(0.14, 0.012, steel, 0, -0.122, 0, 6, 20));
  head.add(rivetRing(0.139, 7, 0.010, brass, -0.102, 1, 0.2));
  head.add(cyl(0.058, 0.118, 0.078, iron, 0, 0.166, 0, 12));              // konusno teme
  head.add(hoop(0.12, 0.010, steel, 0, 0.128, 0, 6, 18));
  head.add(cone(0.056, 0.05, iron, 0, 0.215, 0, 10));                     // vrh (teme 1.84)
  // uzan greben po sredini temena, sa zakivcima
  head.add(box(0.026, 0.05, 0.236, steel, 0, 0.172, 0));
  head.add(box(0.026, 0.062, 0.05, steel, 0, 0.14, 0.118));
  head.add(box(0.026, 0.056, 0.05, steel, 0, 0.142, -0.116));
  head.add(rivets([0, 0.2, -0.088], [0, 0.2, 0.088], 3, 0.010, brass));
  // uski vodoravni prorez — tamna traka na visini očiju (1.68)
  head.add(box(0.246, 0.030, 0.026, dark, 0, 0.080, 0.116));
  head.add(box(0.226, 0.026, 0.05, dark, 0, 0.080, 0.086));
  for (const s of [-1, 1]) {
    const sideSlit = box(0.05, 0.024, 0.03, dark, s * 0.116, 0.080, 0.07);
    sideSlit.rotation.y = -s * 0.9;
    head.add(sideSlit);
  }
  // ojačanje iznad i ispod proreza
  head.add(box(0.262, 0.03, 0.032, steel, 0, 0.110, 0.114));
  head.add(box(0.10, 0.034, 0.036, steel, 0, 0.120, 0.122));
  head.add(box(0.252, 0.024, 0.03, iron, 0, 0.054, 0.115));
  head.add(rivets([-0.098, 0.112, 0.132], [0.098, 0.112, 0.132], 4, 0.009, brass));
  // dve sitne svetle tačke iza proreza — jedino što se vidi od nje
  head.add(sphere(0.011, eyeML, -0.043, 0.081, 0.100, 8, 7));
  head.add(sphere(0.011, eyeMR, 0.043, 0.081, 0.100, 8, 7));
  head.add(sphere(0.02, Ghost(C.emberPale, 1.0, 0.16), -0.043, 0.081, 0.104, 8, 7));
  head.add(sphere(0.02, Ghost(C.emberPale, 1.0, 0.16), 0.043, 0.081, 0.104, 8, 7));
  // središnje ojačanje niz prednju stranu, ispod proreza
  head.add(box(0.034, 0.13, 0.03, steel, 0, -0.008, 0.122));
  head.add(sphere(0.012, brass, 0, 0.03, 0.136, 6, 5));
  head.add(sphere(0.012, brass, 0, -0.062, 0.132, 6, 5));
  // red rupica za disanje — dva luka sa obe strane središnjeg ojačanja
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const a = -0.5 + i * 0.25;
      const hx = s * (0.032 + Math.cos(a) * 0.052);
      const hy = -0.01 - Math.sin(a) * 0.05 - i * 0.008;
      const hl = cyl(0.008, 0.008, 0.03, dark, hx, hy, 0.114, 6);
      hl.rotation.x = Math.PI / 2;
      head.add(hl);
    }
  }
  // bočne pločice preko ušiju sa okretnim zakivkom
  for (const s of [-1, 1]) {
    const rond = disc(0.042, 0.014, steelD, s * 0.126, 0.01, 0.0, 10);
    rond.rotation.z = Math.PI / 2;
    rond.rotation.y = -s * Math.PI / 2;
    head.add(rond);
    head.add(sphere(0.013, brass, s * 0.138, 0.01, 0.0, 7, 6));
    const hinge = box(0.02, 0.08, 0.028, iron, s * 0.13, -0.05, 0.03);
    hinge.rotation.y = -s * 0.5;
    head.add(hinge);
  }
  // zadnji šav i mali prsten na zatiljku
  head.add(box(0.03, 0.2, 0.028, steel, 0, 0.02, -0.126));
  head.add(rivets([0, -0.06, -0.134], [0, 0.1, -0.134], 3, 0.009, brass));
  head.add(torus(0.016, 0.005, iron, 0, -0.09, -0.136, 6, 10));
  // ogrebotina po kaljenoj kacigi
  const hsc = box(0.005, 0.06, 0.01, ironD, -0.07, -0.03, 0.126);
  hsc.rotation.z = 0.5;
  head.add(hsc);

  // ==========================================================================
  // PLAŠT do zemlje — četiri panela koja talasaju
  // ==========================================================================
  const cloak = group([], 0, 1.42, -0.145);
  g.add(cloak);
  // pelerina preko ramena
  const mantle = sphere(0.28, cloakM, 0, 0.0, 0.06, 14, 10);
  mantle.scale.set(1.02, 0.42, 0.78);
  cloak.add(mantle);
  cloak.add(box(0.30, 0.06, 0.14, cloakM, 0, 0.03, -0.02));
  cloak.add(box(0.34, 0.03, 0.16, cloakIn, 0, -0.04, -0.01));
  cloak.add(hoop(0.13, 0.014, cloakM, 0, 0.06, 0.09, 6, 16));

  const cloakPanels = [];
  const panelDef = [
    [-0.255, 1.352, 0.10, -0.05], [-0.086, 1.396, 0.075, -0.02],
    [0.086, 1.396, 0.075, 0.02], [0.255, 1.352, 0.10, 0.05],
  ];
  for (const [x, len, tilt, roll] of panelDef) {
    const p = group([], x, -0.02, 0.0);
    p.rotation.x = tilt;
    p.rotation.z = roll;
    p.add(box(0.176, len, 0.038, cloakM, 0, -len / 2, 0));
    p.add(box(0.15, len - 0.06, 0.02, cloakIn, 0, -len / 2, 0.026));      // postava
    p.add(box(0.184, 0.05, 0.046, cloakIn, 0, -len + 0.024, 0.004));      // donji rub
    p.add(box(0.016, len * 0.9, 0.044, cloakM, 0.086, -len / 2, 0));      // šav
    cloak.add(p);
    cloakPanels.push(p);
  }
  // dve okrugle kopče kojima je plašt prikopčan za naramenike
  for (const s of [-1, 1]) {
    const cl = group([], s * 0.19, 0.03, 0.1);
    cl.rotation.y = -s * 0.35;
    cloak.add(cl);
    cl.add(disc(0.048, 0.014, ironD, 0, 0, 0, 14));
    cl.add(torus(0.048, 0.01, steel, 0, 0, 0.008, 6, 16));
    cl.add(disc(0.018, 0.016, gold, 0, 0, 0.014, 10));
    cl.add(disc(0.007, 0.018, dark, 0, 0, 0.018, 8));
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const sp = box(0.009, 0.038, 0.008, steel, Math.sin(a) * 0.03, Math.cos(a) * 0.03, 0.012);
      sp.rotation.z = -a;
      cl.add(sp);
    }
    cl.add(sphere(0.008, brass, 0, -0.05, 0.006, 6, 5));
  }

  // ==========================================================================
  // ANIMACIJA — mirna poza je zauzeta, pa svaki pokret pamti zatečenu vrednost
  // ==========================================================================
  // 1. fenjer se njiše o kuki (glavni pokret) i sjaj mu treperi
  anim.rot(lanternPivot, 'x', 0.13, 1.02, 0.4);
  anim.rot(lanternPivot, 'z', 0.088, 0.71, 1.9);
  anim.rot(lant, 'y', 0.09, 0.43, 2.6);
  anim.flicker(flameM, 2.4, 0.85, 9.3, 23.1, 0.3);
  anim.flicker(flameCoreM, 2.9, 1.0, 11.7, 27.4, 1.2);
  anim.flicker(glassM, 0.72, 0.22, 8.6, 21.5, 0.7);
  anim.pos(flameCore, 'y', 0.005, 7.4, 0.5);

  // 2. dve tačke u prorezu tinjaju, svaka svojim ritmom
  anim.pulse(eyeML, 2.3, 0.62, 1.83, 0.0);
  anim.pulse(eyeMR, 2.3, 0.62, 2.11, 1.4);

  // 3. plašt talasa u panelima
  anim.wave(cloakPanels, 'x', 0.042, 0.49, 0.55, 0.2);
  anim.wave(cloakPanels, 'z', 0.028, 0.77, -0.46, 1.6);

  // 4. okovi na pojasu se ljuljaju
  anim.rot(shackles, 'x', 0.10, 1.31, 0.6);
  anim.rot(shackles, 'z', 0.07, 0.94, 2.3);
  anim.rot(keys, 'x', 0.055, 1.62, 1.1);
  anim.rot(keys, 'z', 0.04, 1.13, 0.2);

  // 5. spor, preteći okret glave
  anim.scan(head, 0.14, 13, 3.4);
  anim.rot(head, 'x', 0.012, 0.37, 1.7);

  // 6. lanac knjige se njiše
  anim.rot(bookPivot, 'z', 0.075, 0.88, 2.2);
  anim.rot(bookPivot, 'x', 0.05, 0.61, 0.4);
  anim.rot(bookG, 'y', 0.06, 0.35, 1.1);

  // sitno: dah pod oklopom, težina koja se prebacuje, pečat na kaišu
  anim.breathe(chest, 0.009, 0.86, 0.5);
  anim.rot(pole, 'z', 0.008, 0.33, 1.4);
  anim.rot(seal, 'x', 0.045, 1.44, 2.8);
  anim.rot(cloak, 'y', 0.01, 0.29, 0.9);

  return {
    name: 'Inkvizitorka Vela',
    title: 'Inkvizitorka Otvorenog Oka',
    blurb: 'Niko u tri pokrajine ne zna kako izgleda njeno lice, a mnogi bi platili da saznaju. Kada fenjer stane pred nečija vrata, sud je već donet — ono što sledi je samo čitanje.',
    heraldry: { color: C.charcoal, sigil: 'lantern' },
    eyeY: 1.68,
    group: g,
    update: (t) => anim.tick(t),
  };
}
