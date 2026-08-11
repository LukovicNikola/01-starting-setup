// heroes/necromancer.js — Mordekai Bledi, Gospodar Tihe Legije
// Nekromant "Kruga Heroja": iscepana crno-ljubicasta odora, kostana ramena,
// kruna od kostiju, stap sa rogatom lobanjom i tri lobanje koje kruze oko njega.
// Konvencije: stopala na y=0, gleda ka +Z, visina ~1.85.

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, lathe, bar, group,
} from './common.js';

export function createNecromancer() {
  const g = new THREE.Group();

  // ------------------------------------------------------------ materijali --
  const odoraLjub = mat(COLORS.clothPurple, { roughness: 0.92 });
  const odoraCrna = mat(COLORS.clothBlack, { roughness: 0.95 });
  const kost = mat(COLORS.bone, { roughness: 0.6 });
  const kozaBleda = mat(0xb9c0b0, { roughness: 0.75 });   // bledo-sivkasta put
  const kozaSenka = mat(0x828b78, { roughness: 0.8 });    // senke lica
  const duplja = mat(0x0d0d13, { roughness: 0.9 });       // upale ocne duplje
  const uze = mat(COLORS.leatherDark, { roughness: 0.95 });
  const gvozdje = metalMat(COLORS.iron);
  const kamen = mat(0x3a3f3a, { roughness: 0.85 });
  const papir = mat(0xcfc7ae, { roughness: 0.9 });
  const koricaKnjige = mat(0x241d2c, { roughness: 0.85 });
  const drvoStapa = mat(0x1d1a22, { roughness: 0.7 });
  const zeleniSjaj = glowMat(COLORS.glowGreen, 1.6);      // staticne zenice
  const runaSjaj = glowMat(COLORS.glowGreen, 1.2);        // rune na pojasu
  // oci lobanje na stapu — posebna instanca da bi treperile
  const okoStapaMat = glowMat(COLORS.glowGreen, 1.8);
  // orb u levoj ruci — pulsira
  const orbMat = glowMat(COLORS.glowGreen, 1.4);

  // providna zelena maglica (svaka dobija svoju instancu zbog opacity animacije)
  function maglicaMat(op) {
    return mat(COLORS.glowGreen, {
      emissive: COLORS.glowGreen, emissiveIntensity: 1.3,
      transparent: true, opacity: op, roughness: 0.4,
    });
  }

  // ------------------------------------------------- donja odora (suknja) ---
  // pivot u struku (y=0.95) da bi se rub odore lagano njihao
  const suknjaGrp = new THREE.Group();
  suknjaGrp.position.set(0, 0.95, 0);
  g.add(suknjaGrp);

  const suknja = lathe([
    [0.10, -0.93], [0.41, -0.91], [0.40, -0.83], [0.35, -0.60],
    [0.29, -0.35], [0.24, -0.13], [0.22, 0.05],
  ], odoraLjub, 16);
  suknjaGrp.add(suknja);

  // nazubljen rub — naizmenicni obrnutim kupama (duze/krace, ljubicasto/crno)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const dug = i % 2 === 0;
    const zub = cone(0.055, dug ? 0.18 : 0.13, dug ? odoraCrna : odoraLjub,
      Math.cos(a) * 0.385, -0.85, Math.sin(a) * 0.385);
    zub.rotation.x = Math.PI; // vrh nadole
    zub.rotation.y = -a;
    suknjaGrp.add(zub);
  }
  // tamni porub iznad zuba
  const porub = torus(0.395, 0.016, odoraCrna, 0, -0.86, 0, 8, 22);
  porub.rotation.x = Math.PI / 2;
  suknjaGrp.add(porub);

  // ------------------------------------------------------- torzo i ogrtac ---
  g.add(lathe([
    [0.235, 0.92], [0.25, 1.08], [0.26, 1.22], [0.22, 1.32],
    [0.15, 1.40], [0.115, 1.47],
  ], odoraCrna, 14));

  // ukrsteni slojevi tkanine na grudima
  const zavoj1 = box(0.16, 0.32, 0.028, odoraLjub, 0.055, 1.18, 0.235);
  zavoj1.rotation.z = 0.5;
  g.add(zavoj1);
  const zavoj2 = box(0.16, 0.32, 0.028, odoraCrna, -0.055, 1.18, 0.245);
  zavoj2.rotation.z = -0.5;
  g.add(zavoj2);
  // grubi savovi (sivenje) preko zavoja
  for (let i = 0; i < 4; i++) {
    g.add(bar(
      [-0.02 + i * 0.03, 1.24 - i * 0.045, 0.262],
      [0.035 + i * 0.03, 1.27 - i * 0.045, 0.262],
      0.005, gvozdje, 5));
  }

  // prednja traka odore (sash) sa dve svetlece rune
  g.add(box(0.10, 0.50, 0.02, odoraCrna, 0, 0.62, 0.315));
  const sasVrh = cone(0.05, 0.10, odoraCrna, 0, 0.33, 0.315, 4);
  sasVrh.rotation.x = Math.PI;
  g.add(sasVrh);
  g.add(box(0.032, 0.05, 0.006, runaSjaj, 0, 0.74, 0.328));
  g.add(box(0.032, 0.05, 0.006, runaSjaj, 0, 0.56, 0.328));

  // ------------------------------------------------------------- pojas ------
  const kanap1 = torus(0.245, 0.017, uze, 0, 0.985, 0, 8, 22);
  kanap1.rotation.x = Math.PI / 2;
  g.add(kanap1);
  const kanap2 = torus(0.248, 0.015, uze, 0, 0.955, 0, 8, 22);
  kanap2.rotation.x = Math.PI / 2;
  kanap2.rotation.z = 0.15;
  g.add(kanap2);
  // cvor i dva kraja uzeta sa resama
  g.add(sphere(0.032, uze, -0.10, 0.965, 0.225));
  g.add(bar([-0.10, 0.955, 0.23], [-0.13, 0.78, 0.27], 0.012, uze, 6));
  g.add(bar([-0.10, 0.955, 0.23], [-0.06, 0.75, 0.29], 0.012, uze, 6));
  const resa1 = cone(0.022, 0.06, uze, -0.13, 0.755, 0.27, 6);
  resa1.rotation.x = Math.PI;
  g.add(resa1);
  const resa2 = cone(0.022, 0.06, uze, -0.06, 0.725, 0.29, 6);
  resa2.rotation.x = Math.PI;
  g.add(resa2);

  // kamene plocice sa runama oko prednjeg dela pojasa
  const ugloviPlocica = [-1.0, -0.5, 0, 0.5, 1.0];
  for (const a of ugloviPlocica) {
    const piv = new THREE.Group();
    piv.rotation.y = a;
    piv.add(box(0.05, 0.075, 0.018, kamen, 0, 0.97, 0.255));
    piv.add(box(0.024, 0.042, 0.006, runaSjaj, 0, 0.97, 0.267));
    g.add(piv);
  }

  // --------------------------------------------- grimorijum na lancu (kuk) --
  const grimGrp = new THREE.Group();
  grimGrp.position.set(0.26, 0.945, 0.12);
  g.add(grimGrp);
  // tri karike lanca
  grimGrp.add(bar([0, 0, 0], [0.012, -0.045, 0.008], 0.009, gvozdje, 6));
  grimGrp.add(bar([0.012, -0.045, 0.008], [0.008, -0.09, 0.018], 0.009, gvozdje, 6));
  grimGrp.add(bar([0.008, -0.09, 0.018], [0.02, -0.13, 0.025], 0.009, gvozdje, 6));
  // knjiga: korica, stranice, kostana kopca sa dugmetom, dva okova na uglu
  grimGrp.add(box(0.05, 0.20, 0.15, koricaKnjige, 0.025, -0.235, 0.03));
  grimGrp.add(box(0.034, 0.18, 0.132, papir, 0.038, -0.235, 0.03));
  grimGrp.add(bar([0.055, -0.235, -0.045], [0.055, -0.235, 0.105], 0.008, kost, 6));
  grimGrp.add(sphere(0.016, kost, 0.058, -0.235, 0.03));
  grimGrp.add(sphere(0.011, gvozdje, 0.03, -0.15, 0.10));
  grimGrp.add(sphere(0.011, gvozdje, 0.03, -0.32, 0.10));

  // --------------------------------------------------------- visoka kragna --
  const kragnaGrp = new THREE.Group();
  kragnaGrp.position.set(0, 1.40, -0.03);
  g.add(kragnaGrp);
  const visine = [0.26, 0.32, 0.38, 0.32, 0.26];
  const ugloviKragne = [-0.95, -0.5, 0, 0.5, 0.95];
  for (let i = 0; i < 5; i++) {
    const th = ugloviKragne[i];
    const h = visine[i];
    const ploca = box(0.115, h, 0.018, odoraLjub,
      0.19 * Math.sin(th), h / 2 + 0.02, -0.14 * Math.cos(th));
    ploca.rotation.y = -th;
    ploca.rotation.x = -0.13;
    kragnaGrp.add(ploca);
  }
  // unutrasnje crne ploce, malo vise
  const unut1 = box(0.10, 0.42, 0.015, odoraCrna, -0.05, 0.235, -0.165);
  unut1.rotation.x = -0.12;
  kragnaGrp.add(unut1);
  const unut2 = box(0.10, 0.42, 0.015, odoraCrna, 0.05, 0.235, -0.165);
  unut2.rotation.x = -0.12;
  kragnaGrp.add(unut2);
  // tri kostana klina na sredisnjoj ploci
  kragnaGrp.add(sphere(0.012, kost, 0, 0.30, -0.145));
  kragnaGrp.add(sphere(0.012, kost, -0.045, 0.26, -0.14));
  kragnaGrp.add(sphere(0.012, kost, 0.045, 0.26, -0.14));

  // ------------------------------------------ ramena: kosti i male lobanje --
  for (const s of [-1, 1]) {
    // podloga od tkanine
    const jastuk = sphere(0.085, odoraCrna, s * 0.27, 1.40, 0.02);
    jastuk.scale.set(1, 0.7, 1);
    g.add(jastuk);
    // mala lobanja-kapa na vrhu ramena
    const kapa = sphere(0.05, kost, s * 0.29, 1.465, 0.03);
    kapa.scale.set(0.95, 0.85, 0.9);
    g.add(kapa);
    g.add(box(0.05, 0.02, 0.036, kost, s * 0.29, 1.428, 0.048));
    g.add(sphere(0.011, duplja, s * 0.29 - 0.018, 1.468, 0.072));
    g.add(sphere(0.011, duplja, s * 0.29 + 0.018, 1.468, 0.072));
    // tri "rebra" — lancici od po tri kratke kosti preko ramena
    const rebra = [
      [[0.13, 1.47, 0.02], [0.24, 1.455, 0.02], [0.33, 1.40, 0.02], [0.375, 1.30, 0.02]],
      [[0.14, 1.45, 0.10], [0.25, 1.43, 0.10], [0.335, 1.375, 0.09], [0.375, 1.28, 0.08]],
      [[0.14, 1.45, -0.06], [0.25, 1.43, -0.06], [0.335, 1.375, -0.05], [0.375, 1.28, -0.05]],
    ];
    for (const rebro of rebra) {
      for (let k = 0; k < 3; k++) {
        const p = rebro[k];
        const q = rebro[k + 1];
        g.add(bar([s * p[0], p[1], p[2]], [s * q[0], q[1], q[2]], 0.016, kost, 6));
      }
    }
  }

  // ----------------------------------------------------------- vrat i glava --
  g.add(cyl(0.045, 0.058, 0.10, kozaBleda, 0, 1.44, 0.01, 8));

  const glavaGrp = new THREE.Group();
  glavaGrp.position.set(0, 1.47, 0);
  g.add(glavaGrp);

  // ispijena lobanjasta glava
  const lobanjaGlave = sphere(0.125, kozaBleda, 0, 0.12, 0.005);
  lobanjaGlave.scale.set(0.86, 1.06, 0.92);
  glavaGrp.add(lobanjaGlave);
  // uska vilica / brada
  glavaGrp.add(box(0.072, 0.055, 0.06, kozaBleda, 0, 0.015, 0.05));
  // ostre jagodice
  glavaGrp.add(sphere(0.02, kozaSenka, -0.068, 0.105, 0.072));
  glavaGrp.add(sphere(0.02, kozaSenka, 0.068, 0.105, 0.072));
  // upale tamne duplje sa zelenim zenicama
  const dupljaL = sphere(0.03, duplja, -0.045, 0.145, 0.083);
  dupljaL.scale.set(1, 1.15, 0.7);
  glavaGrp.add(dupljaL);
  const dupljaD = sphere(0.03, duplja, 0.045, 0.145, 0.083);
  dupljaD.scale.set(1, 1.15, 0.7);
  glavaGrp.add(dupljaD);
  glavaGrp.add(sphere(0.011, zeleniSjaj, -0.045, 0.145, 0.106));
  glavaGrp.add(sphere(0.011, zeleniSjaj, 0.045, 0.145, 0.106));
  // namrstene obrve
  const obrvaL = box(0.046, 0.012, 0.02, kozaSenka, -0.05, 0.185, 0.096);
  obrvaL.rotation.z = -0.3;
  glavaGrp.add(obrvaL);
  const obrvaD = box(0.046, 0.012, 0.02, kozaSenka, 0.05, 0.185, 0.096);
  obrvaD.rotation.z = 0.3;
  glavaGrp.add(obrvaD);
  // tanak nos i stroga usta
  const nos = cone(0.014, 0.05, kozaBleda, 0, 0.128, 0.104, 6);
  nos.rotation.x = 1.75;
  glavaGrp.add(nos);
  glavaGrp.add(box(0.05, 0.008, 0.012, duplja, 0, 0.058, 0.088));

  // kruna od kostanih siljaka oko glave
  const krunaObruc = torus(0.114, 0.011, kost, 0, 0.205, 0, 8, 18);
  krunaObruc.rotation.x = Math.PI / 2;
  glavaGrp.add(krunaObruc);
  for (let i = 0; i < 8; i++) {
    const piv = new THREE.Group();
    piv.rotation.y = (i / 8) * Math.PI * 2;
    const siljak = cone(0.016, i % 2 === 0 ? 0.095 : 0.07, kost, 0.112, 0.225, 0, 6);
    siljak.rotation.z = -0.55; // vrh nagnut ka spolja
    piv.add(siljak);
    glavaGrp.add(piv);
  }

  // ------------------------------------------------- desna ruka (uz stap) ---
  // ramena: desna strana heroja je na -X
  g.add(bar([-0.28, 1.37, 0.02], [-0.38, 1.16, 0.10], 0.052, odoraLjub, 8));
  g.add(sphere(0.05, odoraCrna, -0.38, 1.16, 0.10));
  g.add(bar([-0.38, 1.16, 0.10], [-0.44, 1.05, 0.22], 0.045, odoraCrna, 8));
  // pocepan rub rukava — tri visece krpice
  for (let i = 0; i < 3; i++) {
    const krpa = cone(0.02, 0.065, i === 1 ? odoraCrna : odoraLjub,
      -0.44 + (i - 1) * 0.035, 1.0, 0.22 + (i === 1 ? 0.03 : 0), 5);
    krpa.rotation.x = Math.PI;
    g.add(krpa);
  }
  // saka koja steze stap
  const dlanD = box(0.05, 0.088, 0.058, kozaBleda, -0.455, 1.02, 0.25);
  dlanD.rotation.y = 0.2;
  g.add(dlanD);
  for (let i = 0; i < 4; i++) {
    const y = 1.056 - i * 0.023;
    g.add(bar([-0.468, y, 0.288], [-0.392, y, 0.29], 0.010, kozaBleda, 5));
  }
  g.add(bar([-0.45, 0.985, 0.225], [-0.402, 1.0, 0.235], 0.011, kozaBleda, 5));

  // ------------------------------------------------------------- stap -------
  const stapGrp = new THREE.Group();
  stapGrp.position.set(-0.42, 1.02, 0.26);
  stapGrp.rotation.z = 0.06;
  g.add(stapGrp);

  stapGrp.add(cyl(0.020, 0.024, 1.58, drvoStapa, 0.005, -0.16, 0.005, 8));
  // gvozdeni prstenovi
  for (const ry of [0.30, -0.55, 0.52]) {
    const prsten = torus(0.028, 0.007, gvozdje, 0.005, ry, 0.005, 6, 14);
    prsten.rotation.x = Math.PI / 2;
    stapGrp.add(prsten);
  }
  // siljati donji okov
  const okov = cone(0.03, 0.07, gvozdje, 0.005, -0.965, 0.005, 8);
  okov.rotation.x = Math.PI;
  stapGrp.add(okov);
  // leziste lobanje
  stapGrp.add(cyl(0.036, 0.028, 0.05, gvozdje, 0.005, 0.615, 0.005, 8));
  // rogata lobanja na vrhu
  const kranStapa = sphere(0.08, kost, 0, 0.70, 0.01);
  kranStapa.scale.set(0.92, 1.0, 0.95);
  stapGrp.add(kranStapa);
  stapGrp.add(box(0.085, 0.045, 0.06, kost, 0, 0.635, 0.03));
  for (let i = 0; i < 3; i++) {
    stapGrp.add(box(0.01, 0.018, 0.008, kost, -0.02 + i * 0.02, 0.612, 0.062));
  }
  stapGrp.add(sphere(0.021, duplja, -0.028, 0.715, 0.068));
  stapGrp.add(sphere(0.021, duplja, 0.028, 0.715, 0.068));
  stapGrp.add(sphere(0.012, okoStapaMat, -0.028, 0.715, 0.082));
  stapGrp.add(sphere(0.012, okoStapaMat, 0.028, 0.715, 0.082));
  const rogL = cone(0.018, 0.13, kost, -0.082, 0.775, 0.005, 7);
  rogL.rotation.z = 0.65;
  stapGrp.add(rogL);
  const rogD = cone(0.018, 0.13, kost, 0.082, 0.775, 0.005, 7);
  rogD.rotation.z = -0.65;
  stapGrp.add(rogD);
  // mala kostana amajlija okacena o stap
  stapGrp.add(bar([0.02, 0.52, 0.01], [0.05, 0.45, 0.02], 0.006, uze, 5));
  stapGrp.add(sphere(0.018, kost, 0.052, 0.44, 0.021));
  stapGrp.add(sphere(0.006, duplja, 0.052, 0.443, 0.038));

  // maglice oko lobanje stapa (lokalne koordinate stapa)
  const stapMaglice = [];
  const stapMagCfg = [
    { r: 0.115, brz: 1.6, faza: 0.4, dig: 0.31, dfaza: 0.15, vel: 0.030 },
    { r: 0.135, brz: -1.25, faza: 2.5, dig: 0.26, dfaza: 0.55, vel: 0.024 },
    { r: 0.10, brz: 1.95, faza: 4.6, dig: 0.36, dfaza: 0.85, vel: 0.020 },
  ];
  for (const c of stapMagCfg) {
    const m = sphere(c.vel, maglicaMat(0.5), c.r, 0.70, 0);
    stapGrp.add(m);
    stapMaglice.push({ m, c });
  }

  // ------------------------------------------------ leva ruka (bacanje cini) --
  g.add(bar([0.28, 1.37, 0.02], [0.37, 1.17, 0.09], 0.052, odoraLjub, 8));
  g.add(sphere(0.05, odoraCrna, 0.37, 1.17, 0.09));
  g.add(bar([0.37, 1.17, 0.09], [0.35, 1.10, 0.25], 0.045, odoraCrna, 8));
  for (let i = 0; i < 3; i++) {
    const krpa = cone(0.02, 0.065, i === 1 ? odoraCrna : odoraLjub,
      0.35 + (i - 1) * 0.035, 1.06, 0.24 + (i === 1 ? 0.03 : 0), 5);
    krpa.rotation.x = Math.PI;
    g.add(krpa);
  }
  // dlan okrenut nagore, prsti poluzgrceni
  g.add(box(0.055, 0.02, 0.075, kozaBleda, 0.35, 1.095, 0.29));
  for (let i = 0; i < 4; i++) {
    const x = 0.325 + i * 0.017;
    g.add(bar([x, 1.10, 0.325], [x, 1.138, 0.35], 0.009, kozaBleda, 5));
  }
  g.add(bar([0.315, 1.10, 0.265], [0.298, 1.132, 0.298], 0.010, kozaBleda, 5));
  // pulsirajuci orb iznad dlana
  const orb = sphere(0.035, orbMat, 0.35, 1.19, 0.31);
  g.add(orb);

  // ----------------------------------- tri lobanje koje kruze oko nekromanta --
  // svaka lobanja: lobanja + vilica + dve tamne duplje + dva zelena oka
  function lebdecaLobanja() {
    const lg = new THREE.Group();
    const kr = sphere(0.062, kost, 0, 0.015, 0);
    kr.scale.set(0.94, 1.0, 0.9);
    lg.add(kr);
    lg.add(box(0.068, 0.03, 0.05, kost, 0, -0.04, 0.016));
    lg.add(sphere(0.016, duplja, -0.023, 0.028, 0.047));
    lg.add(sphere(0.016, duplja, 0.023, 0.028, 0.047));
    lg.add(sphere(0.008, zeleniSjaj, -0.023, 0.028, 0.059));
    lg.add(sphere(0.008, zeleniSjaj, 0.023, 0.028, 0.059));
    return lg;
  }

  const orbite = [];
  const orbitaCfg = [
    { r: 0.72, h: 0.05, brz: 0.45, faza: 0.0, bob: 1.3, bfaza: 0.7 },
    { r: 0.92, h: 0.22, brz: -0.34, faza: 2.1, bob: 1.7, bfaza: 2.9 },
    { r: 1.06, h: -0.10, brz: 0.28, faza: 4.2, bob: 1.1, bfaza: 4.4 },
  ];
  for (const c of orbitaCfg) {
    const piv = new THREE.Group();
    piv.position.set(0, 1.22, 0);
    const drzac = new THREE.Group();
    drzac.position.set(c.r, c.h, 0);
    drzac.add(lebdecaLobanja());
    piv.add(drzac);
    g.add(piv);
    orbite.push({ piv, drzac, c });
  }

  // ------------------------- maglice koje spiralno kruze uz rub odore ---------
  const rubneMaglice = [];
  const rubCfg = [
    { brz: 0.14, faza: 0.00, ugao: 0.0, vel: 0.030 },
    { brz: 0.17, faza: 0.31, ugao: 1.9, vel: 0.024 },
    { brz: 0.12, faza: 0.55, ugao: 3.5, vel: 0.034 },
    { brz: 0.19, faza: 0.72, ugao: 4.8, vel: 0.021 },
    { brz: 0.15, faza: 0.90, ugao: 5.9, vel: 0.027 },
  ];
  for (const c of rubCfg) {
    const m = sphere(c.vel, maglicaMat(0.4), 0.5, 0.15, 0);
    g.add(m);
    rubneMaglice.push({ m, c });
  }

  // ------------------------------------------------------------- animacija ---
  // Sve je cista funkcija od t: iste vrednosti t -> ista poza; bez alokacija.
  function update(t) {
    // 1) tri lobanje kruze, ljuljaju se i lagano se okrecu oko svoje ose
    for (let i = 0; i < orbite.length; i++) {
      const o = orbite[i];
      o.piv.rotation.y = t * o.c.brz + o.c.faza;
      o.drzac.position.y = o.c.h + 0.08 * Math.sin(t * o.c.bob + o.c.bfaza);
      o.drzac.rotation.y = t * 0.6 + o.c.faza;
    }

    // 2) treperenje ociju lobanje na stapu + puls orba u levoj ruci
    okoStapaMat.emissiveIntensity =
      1.7 + 0.6 * Math.sin(t * 6.7) + 0.25 * Math.sin(t * 11.3 + 1.7);
    orbMat.emissiveIntensity = 1.3 + 0.45 * Math.sin(t * 2.7 + 0.6);
    orb.scale.setScalar(1 + 0.1 * Math.sin(t * 2.7 + 0.6));

    // 3) maglice oko lobanje stapa — kruze i dizu se u petlji (modulo)
    for (let i = 0; i < stapMaglice.length; i++) {
      const w = stapMaglice[i];
      const u = (t * w.c.dig + w.c.dfaza) % 1;
      const a = t * w.c.brz + w.c.faza;
      w.m.position.set(
        Math.cos(a) * w.c.r,
        0.58 + u * 0.30,
        0.01 + Math.sin(a) * w.c.r);
      w.m.material.opacity = 0.5 * Math.sin(u * Math.PI);
    }

    // 4) maglice uz rub odore — spirala navise u petlji
    for (let i = 0; i < rubneMaglice.length; i++) {
      const w = rubneMaglice[i];
      const u = (t * w.c.brz + w.c.faza) % 1;
      const a = u * 5.5 + w.c.ugao;
      const r = 0.50 - u * 0.16;
      w.m.position.set(Math.cos(a) * r, 0.12 + u * 1.05, Math.sin(a) * r);
      w.m.material.opacity = 0.55 * Math.sin(u * Math.PI);
    }

    // 5) njihanje ruba odore (pivot u struku)
    suknjaGrp.rotation.z = 0.028 * Math.sin(t * 0.85 + 0.3);
    suknjaGrp.rotation.x = 0.02 * Math.sin(t * 0.7 + 1.1);

    // 6) njihanje visoke kragne
    kragnaGrp.rotation.x = 0.04 * Math.sin(t * 1.25 + 0.9);
    kragnaGrp.rotation.z = 0.03 * Math.sin(t * 0.8 + 1.3);

    // 7) glava se lagano osvrce
    glavaGrp.rotation.y = 0.07 * Math.sin(t * 0.45 + 2.1);
    glavaGrp.rotation.x = 0.03 * Math.sin(t * 0.6 + 0.2);

    // 8) stap jedva primetno podrhtava u saci
    stapGrp.rotation.z = 0.06 + 0.02 * Math.sin(t * 1.1 + 0.7);

    // 9) grimorijum se njise o lancu
    grimGrp.rotation.z = 0.05 * Math.sin(t * 1.6 + 2.2);
    grimGrp.rotation.x = 0.04 * Math.sin(t * 1.3 + 0.4);
  }

  update(0);

  return {
    name: 'Mordekai Bledi',
    title: 'Gospodar Tihe Legije',
    blurb: 'Prognan sa Akademije jer je postavljao pogrešna pitanja — i pronalazio odgovore. Tri lobanje koje kruže oko njega nekada su bile trojica njegovih tužilaca.',
    group: g,
    update,
  };
}
