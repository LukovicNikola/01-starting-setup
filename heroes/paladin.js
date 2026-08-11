// heroes/paladin.js — Dama Serafina, Paladinka Reda Sunca
// Srebrno-beli oklop sa zlatnim filigranom, plavi plašt, barjak Reda Sunca
// i uzemljeni ratni čekić. Stopala na y=0, gleda ka +Z.

import * as THREE from 'three';
import {
  mat, metalMat, glowMat, box, cyl, sphere, cone, torus, bar, group, COLORS,
} from './common.js';

export function createPaladin() {
  // ------------------------------------------------------------ materijali
  const silver = metalMat(COLORS.silver);
  const steel = metalMat(COLORS.steel);
  const gold = metalMat(COLORS.gold);
  const goldL = metalMat(COLORS.goldLight);
  // suptilni topli sjaj na zlatnim obrubima (animira se u update)
  const trimGlow = mat(COLORS.gold, {
    emissive: COLORS.glowGold, emissiveIntensity: 0.3,
    metalness: 0.8, roughness: 0.35,
  });
  const sunGlow = glowMat(COLORS.glowGold, 0.55);   // centar sunca na grudima
  const medGlow = glowMat(COLORS.glowAmber, 0.55);  // medaljon
  const blue = mat(COLORS.clothBlue, { side: THREE.DoubleSide, roughness: 0.9 });
  const blueSolid = mat(COLORS.clothBlue);
  const skin = mat(COLORS.skinPale);
  const hair = mat(COLORS.hairBlond);
  const wood = mat(COLORS.woodDark);
  const lipsM = mat(0xc06858);
  const eyeWhite = mat(0xf2efe6, { roughness: 0.4 });
  const iris = mat(0x4a6fa5, { roughness: 0.4 });

  const g = new THREE.Group();

  // mali pomoćnik: zlatno sunce (disk + zraci-kupice), okrenuto ka +Z
  function sunce(rDisk, rZrak, hZrak, matDisk, matZrak) {
    const s = new THREE.Group();
    const disk = cyl(rDisk, rDisk, 0.012, matDisk, 0, 0, 0, 16);
    disk.rotation.x = Math.PI / 2;
    s.add(disk);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rad = rDisk + hZrak * 0.62;
      const c = cone(rZrak, hZrak, matZrak, Math.cos(a) * rad, Math.sin(a) * rad, 0, 4);
      c.rotation.z = a - Math.PI / 2;
      s.add(c);
    }
    return s;
  }

  // ------------------------------------------------------------------ noge
  for (const s of [-1, 1]) {
    const x = 0.14 * s;
    // sabaton sa zlatnim vrhom
    const sab = box(0.13, 0.09, 0.28, silver, x, 0.055, 0.085);
    sab.rotation.y = 0.12 * s;
    const vrh = box(0.135, 0.07, 0.08, goldL, x + 0.02 * s, 0.048, 0.22);
    vrh.rotation.y = 0.12 * s;
    // gležanj — zlatni prsten
    const glez = torus(0.07, 0.012, gold, x, 0.13, 0.03);
    glez.rotation.x = Math.PI / 2;
    // potkolenica (greva) + zlatno rebro
    const greva = cyl(0.062, 0.075, 0.4, silver, x, 0.315, 0.03);
    const rebro = box(0.02, 0.34, 0.02, goldL, x, 0.315, 0.09);
    // zlatna kolena
    const koleno = sphere(0.062, gold, x, 0.53, 0.045);
    koleno.scale.set(1, 1.15, 1);
    const siljak = cone(0.02, 0.05, goldL, x, 0.53, 0.11, 6);
    siljak.rotation.x = Math.PI / 2;
    // butina
    const but = cyl(0.08, 0.07, 0.32, silver, x, 0.7, 0.02);
    g.add(sab, vrh, glez, greva, rebro, koleno, siljak, but);
  }

  // -------------------------------------------------- kukovi, suknja, kaiš
  g.add(box(0.3, 0.16, 0.2, silver, 0, 0.885, 0.01));           // karlica
  g.add(cyl(0.185, 0.245, 0.3, blueSolid, 0, 0.78, 0.01, 12));  // platnena suknja

  // preklopljeni taseti (8 ploča oko kukova) sa zlatnim porubom
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const tg = group([], 0, 0.93, 0.01);
    tg.rotation.y = a;
    const ploca = box(0.13, 0.24, 0.022, silver, 0, -0.13, 0.195);
    ploca.rotation.x = 0.16;
    const porub = box(0.135, 0.024, 0.026, gold, 0, -0.246, 0.214);
    porub.rotation.x = 0.16;
    tg.add(ploca, porub);
    g.add(tg);
  }

  // gravirani kaiš sa zlatnom kopčom-suncem i klinovima
  g.add(box(0.35, 0.06, 0.24, mat(COLORS.leatherDark), 0, 0.965, 0.01));
  g.add(box(0.055, 0.065, 0.02, gold, 0, 0.965, 0.13));
  const kopcaSun = cyl(0.02, 0.02, 0.012, goldL, 0, 0.965, 0.143, 12);
  kopcaSun.rotation.x = Math.PI / 2;
  g.add(kopcaSun);
  for (const sx of [-0.15, -0.09, 0.09, 0.15]) {
    g.add(box(0.016, 0.028, 0.012, goldL, sx, 0.965, 0.125));
  }

  // ------------------------------------------------- grudni deo (sa dahom)
  const chestG = new THREE.Group(); // grupa koja "diše" u update
  chestG.add(box(0.34, 0.3, 0.2, silver, 0, 1.16, 0.01));       // oklop grudi
  const oblina = sphere(0.1, silver, 0, 1.24, 0.075);
  oblina.scale.set(1.5, 0.9, 0.6);
  chestG.add(oblina);
  chestG.add(box(0.26, 0.14, 0.18, steel, 0, 0.995, 0.015));    // trbušna ploča

  // zlatni filigranski obrubi ivica oklopa
  chestG.add(box(0.34, 0.016, 0.016, gold, 0, 1.315, 0.108));
  chestG.add(box(0.34, 0.016, 0.016, gold, 0, 1.008, 0.108));
  chestG.add(box(0.016, 0.31, 0.016, gold, -0.17, 1.16, 0.108));
  chestG.add(box(0.016, 0.31, 0.016, gold, 0.17, 1.16, 0.108));
  chestG.add(box(0.02, 0.3, 0.015, gold, 0, 1.16, -0.095));     // kičmena traka

  // ugravirano zlatno sunce na grudima + užareni centar
  const grudnoSunce = sunce(0.05, 0.013, 0.05, goldL, gold);
  grudnoSunce.position.set(0, 1.17, 0.115);
  const sunCentar = cyl(0.02, 0.02, 0.014, sunGlow, 0, 1.17, 0.122, 12);
  sunCentar.rotation.x = Math.PI / 2;
  chestG.add(grudnoSunce, sunCentar);

  // medaljon sunca ispod vrata
  const med = cyl(0.034, 0.034, 0.012, gold, 0, 1.335, 0.112, 12);
  med.rotation.x = Math.PI / 2;
  const medC = cyl(0.014, 0.014, 0.014, medGlow, 0, 1.335, 0.118, 10);
  medC.rotation.x = Math.PI / 2;
  chestG.add(med, medC);

  // kopče plašta na grudima + lančić
  for (const s of [-1, 1]) {
    const kop = cyl(0.032, 0.032, 0.018, goldL, 0.2 * s, 1.415, 0.105, 12);
    kop.rotation.x = Math.PI / 2;
    chestG.add(kop);
  }
  chestG.add(bar([-0.19, 1.405, 0.112], [0, 1.372, 0.118], 0.008, gold, 6));
  chestG.add(bar([0, 1.372, 0.118], [0.19, 1.405, 0.112], 0.008, gold, 6));
  g.add(chestG);

  // ------------------------------------------------------------- naramenice
  for (const s of [-1, 1]) {
    const pg = group([], 0.29 * s, 1.4, 0.02);
    const kupola = sphere(0.105, silver, 0, 0, 0);
    kupola.scale.set(1.05, 0.8, 1.05);
    const ploca2 = sphere(0.085, silver, 0.05 * s, -0.055, 0);
    ploca2.scale.set(1, 0.7, 1);
    const rub = torus(0.095, 0.012, gold, 0, -0.012, 0);
    rub.rotation.x = Math.PI / 2;
    rub.rotation.z = -0.2 * s;
    const n1 = sphere(0.012, goldL, 0, 0.088, 0.035);
    const n2 = sphere(0.012, goldL, 0, 0.088, -0.035);
    pg.add(kupola, ploca2, rub, n1, n2);
    g.add(pg);
  }

  // ------------------------------------------------------------------ ruke
  // desna ruka — počiva na balčaku čekića
  g.add(bar([-0.28, 1.34, 0.02], [-0.36, 1.1, 0.04], 0.052, silver));
  g.add(sphere(0.055, silver, -0.36, 1.1, 0.04));
  g.add(bar([-0.36, 1.1, 0.04], [-0.44, 1.11, 0.19], 0.048, silver));
  g.add(torus(0.055, 0.011, gold, -0.42, 1.11, 0.15));
  // leva ruka — drži barjak
  g.add(bar([0.28, 1.34, 0.02], [0.35, 1.06, 0.0], 0.052, silver));
  g.add(sphere(0.055, silver, 0.35, 1.06, 0.0));
  g.add(bar([0.35, 1.06, 0.0], [0.41, 1.13, 0.07], 0.048, silver));
  const lZglob = torus(0.055, 0.011, gold, 0.39, 1.1, 0.045);
  lZglob.rotation.x = 0.6;
  g.add(lZglob);

  // ------------------------------------------- čekić (uzemljen, glava dole)
  const HX = -0.46, HZ = 0.24;
  g.add(box(0.26, 0.13, 0.13, steel, HX, 0.085, HZ));            // blok glave
  g.add(box(0.05, 0.148, 0.148, gold, HX - 0.155, 0.086, HZ));   // zlatna kapa
  g.add(box(0.05, 0.148, 0.148, gold, HX + 0.155, 0.086, HZ));   // zlatna kapa
  for (const s of [-1, 1]) { // mala sunca na stranama glave
    const em = cyl(0.03, 0.03, 0.012, goldL, HX, 0.09, HZ + 0.071 * s, 12);
    em.rotation.x = Math.PI / 2;
    g.add(em);
  }
  const drska = cyl(0.02, 0.024, 0.88, wood, HX, 0.6, HZ, 8);
  g.add(drska);
  const gravPrsten = torus(0.035, 0.01, gold, HX, 0.18, HZ);     // gravirani prsten
  gravPrsten.rotation.x = Math.PI / 2;
  g.add(gravPrsten);
  for (const hy of [0.42, 0.86]) {
    const pr = torus(0.027, 0.008, gold, HX, hy, HZ);
    pr.rotation.x = Math.PI / 2;
    g.add(pr);
  }
  g.add(sphere(0.05, gold, HX, 1.06, HZ));                       // balčak
  g.add(cyl(0.016, 0.03, 0.05, goldL, HX, 1.1, HZ, 8));

  // desna šaka na balčaku (grupa radi sitnog pomeranja u update)
  const rHandG = group([], HX, 1.115, HZ);
  rHandG.add(box(0.07, 0.028, 0.085, silver, 0, 0.01, 0));       // dlan odozgo
  for (let i = 0; i < 4; i++) { // prsti preko prednje strane balčaka
    const f = box(0.017, 0.05, 0.02, silver, -0.033 + i * 0.022, -0.02, 0.045);
    f.rotation.x = 0.3;
    rHandG.add(f);
  }
  const rPalac = box(0.018, 0.045, 0.02, silver, 0.042, -0.015, -0.025);
  rPalac.rotation.x = -0.25;
  rPalac.rotation.z = -0.3;
  rHandG.add(rPalac);
  g.add(rHandG);

  // ------------------------------------------------- barjak (u levoj šaci)
  const BX = 0.45, BZ = 0.1;
  const bannerG = group([], BX, 0, BZ); // njiše se oko osnove u update
  bannerG.add(cyl(0.017, 0.021, 2.36, wood, 0, 1.2, 0, 8));      // motka do 2.38
  bannerG.add(sphere(0.03, gold, 0, 2.4, 0));                    // vrh: kugla
  bannerG.add(cone(0.022, 0.12, goldL, 0, 2.47, 0, 8));          // + zlatni šiljak
  for (const ry of [0.6, 1.9]) { // zlatni prstenovi na motki
    const pr = torus(0.024, 0.007, gold, 0, ry, 0);
    pr.rotation.x = Math.PI / 2;
    bannerG.add(pr);
  }
  const precka = cyl(0.013, 0.013, 0.55, gold, 0, 2.26, 0, 8);   // prečka
  precka.rotation.z = Math.PI / 2;
  bannerG.add(precka);
  bannerG.add(sphere(0.02, goldL, -0.275, 2.26, 0));
  bannerG.add(sphere(0.02, goldL, 0.275, 2.26, 0));

  // 5 vertikalnih traka barjaka, okačene o prečku — talasaju u update
  // dužine daju račvasto dno (srednje kraće)
  const strips = [];
  const STRIP_LEN = [0.74, 0.62, 0.54, 0.62, 0.74];
  for (let i = 0; i < 5; i++) {
    const sg = group([], (i - 2) * 0.098, 2.243, 0.02);
    const len = STRIP_LEN[i];
    sg.add(box(0.092, len, 0.012, blue, 0, -len / 2, 0));
    sg.add(box(0.095, 0.022, 0.014, gold, 0, -len + 0.012, 0.002)); // zlatni porub
    if (i === 2) { // zlatni sigil sunca na srednjoj traci
      const sig = sunce(0.03, 0.008, 0.026, goldL, goldL);
      sig.position.set(0, -0.22, 0.014);
      sg.add(sig);
    }
    strips.push(sg);
    bannerG.add(sg);
  }
  g.add(bannerG);

  // leva šaka steže motku
  g.add(box(0.045, 0.105, 0.07, silver, 0.405, 1.14, 0.075));    // dlan
  for (let i = 0; i < 4; i++) { // prsti obavijaju prednju stranu motke
    g.add(box(0.075, 0.02, 0.018, silver, 0.452, 1.095 + i * 0.027, 0.132));
  }
  g.add(box(0.07, 0.02, 0.018, silver, 0.448, 1.115, 0.052));    // palac pozadi

  // ---------------------------------------------------------------- plašt
  // 4 panela okačena o ramena, do gležnjeva; njišu se sa faznim pomakom
  const capes = [];
  const CAPE_X = [-0.21, -0.07, 0.07, 0.21];
  const CAPE_RY = [0.1, 0.035, -0.035, -0.1];
  for (let i = 0; i < 4; i++) {
    const cg = group([], CAPE_X[i], 1.4, -0.13);
    cg.rotation.order = 'YXZ';
    cg.rotation.y = CAPE_RY[i];
    cg.rotation.x = 0.1;
    cg.add(box(0.145, 1.26, 0.02, blue, 0, -0.63, 0));
    cg.add(box(0.148, 0.026, 0.024, gold, 0, -1.248, 0));        // zlatni rub
    capes.push(cg);
    g.add(cg);
  }

  // ------------------------------------------------------------ vrat i glava
  g.add(cyl(0.045, 0.055, 0.1, skin, 0, 1.505, 0.01, 8));
  const gorget = torus(0.085, 0.02, silver, 0, 1.448, 0.01);
  gorget.rotation.x = Math.PI / 2;
  g.add(gorget);

  const headG = group([], 0, 1.6, 0.01); // okreće se blago u update
  const glava = sphere(0.105, skin, 0, 0.005, -0.01);
  glava.scale.set(0.92, 1.08, 0.95);
  headG.add(glava);
  // mirne oči
  for (const s of [-1, 1]) {
    headG.add(sphere(0.016, eyeWhite, 0.037 * s, 0.02, 0.072, 8, 6));
    headG.add(sphere(0.008, iris, 0.037 * s, 0.02, 0.085, 8, 6));
    const obrva = box(0.042, 0.009, 0.012, hair, 0.04 * s, 0.052, 0.078);
    obrva.rotation.z = -0.12 * s;
    headG.add(obrva);
  }
  headG.add(box(0.017, 0.036, 0.022, skin, 0, -0.005, 0.092));   // nos
  headG.add(box(0.034, 0.011, 0.012, lipsM, 0, -0.048, 0.086));  // male usne
  // plava kosa: šiške, pramenovi i punđa
  headG.add(box(0.13, 0.022, 0.02, hair, 0, 0.062, 0.075));
  for (const s of [-1, 1]) {
    headG.add(box(0.02, 0.09, 0.03, hair, 0.095 * s, -0.02, -0.04));
  }
  const bun = sphere(0.045, hair, 0, 0.0, -0.115);
  headG.add(bun);

  // otvoreni krilati šlem
  const kupola = sphere(0.122, silver, 0, 0.075, -0.005);
  kupola.scale.set(1, 0.82, 1);
  headG.add(kupola);
  const obod = torus(0.112, 0.018, silver, 0, 0.045, -0.005);
  obod.rotation.x = Math.PI / 2;
  headG.add(obod);
  const obodZlato = torus(0.112, 0.007, trimGlow, 0, 0.022, -0.005); // topli sjaj
  obodZlato.rotation.x = Math.PI / 2;
  headG.add(obodZlato);
  for (const s of [-1, 1]) {
    headG.add(box(0.028, 0.085, 0.065, silver, 0.105 * s, -0.025, 0.015)); // obrazine
  }
  const zastitnik = box(0.15, 0.045, 0.028, silver, 0, -0.055, -0.115);
  zastitnik.rotation.x = 0.35;
  headG.add(zastitnik);

  // zlatna krila šlema — slojevite tanke ploče zabačene unazad
  for (const s of [-1, 1]) {
    const wg = group([], 0.118 * s, 0.075, -0.01);
    const w1 = box(0.012, 0.055, 0.1, goldL, 0, 0.01, -0.01);
    w1.rotation.x = -0.35;
    const w2 = box(0.012, 0.07, 0.13, goldL, 0, 0.032, -0.05);
    w2.rotation.x = -0.6;
    const w3 = box(0.012, 0.08, 0.15, gold, 0, 0.055, -0.1);
    w3.rotation.x = -0.85;
    const wt = cone(0.014, 0.07, goldL, 0, 0.09, -0.16, 6);
    wt.rotation.x = -1.2;
    wg.add(w1, w2, w3, wt);
    headG.add(wg);
  }
  g.add(headG);

  // ------------------------------------------------------------- animacija
  // fazni pomaci su fiksne konstante — update je čista funkcija od t
  const STRIP_PH = [0.0, 0.9, 1.7, 2.6, 3.4];
  const CAPE_PH = [0.0, 0.9, 1.8, 2.7];

  function update(t) {
    // trake barjaka talasaju sa razmaknutim fazama (dve frekvencije)
    for (let i = 0; i < 5; i++) {
      strips[i].rotation.x =
        0.1 * Math.sin(t * 1.9 + STRIP_PH[i]) +
        0.04 * Math.sin(t * 3.1 + STRIP_PH[i] * 1.4);
    }
    // paneli plašta se lagano njišu
    for (let i = 0; i < 4; i++) {
      capes[i].rotation.x = 0.1 + 0.05 * Math.sin(t * 1.25 + CAPE_PH[i]);
      capes[i].rotation.z = 0.02 * Math.sin(t * 0.9 + CAPE_PH[i] * 0.7);
    }
    // disanje grudnog dela i blagi pokret glave
    chestG.position.y = 0.013 * Math.sin(t * 1.6);
    headG.position.y = 1.6 + 0.006 * Math.sin(t * 1.6 + 0.5);
    headG.rotation.y = 0.055 * Math.sin(t * 0.45);
    // sitno nameštanje šake na čekiću
    rHandG.rotation.z = 0.035 * Math.sin(t * 0.85 + 2.1);
    // ceo barjak diše na vetru
    bannerG.rotation.z = 0.014 * Math.sin(t * 0.7 + 0.3);
    bannerG.rotation.x = 0.01 * Math.sin(t * 0.55 + 1.1);
    // pulsiranje toplog zlatnog sjaja
    trimGlow.emissiveIntensity = 0.3 + 0.14 * Math.sin(t * 2.1);
    sunGlow.emissiveIntensity = 0.55 + 0.2 * Math.sin(t * 1.8 + 0.6);
    medGlow.emissiveIntensity = 0.55 + 0.2 * Math.sin(t * 2.6 + 1.3);
  }

  return {
    name: 'Dama Serafina',
    title: 'Paladinka Reda Sunca',
    blurb: 'Njen zavet je jednostavan: štit za slabe, čekić za tirane. Njen barjak se nikada nije spustio — čak ni kod Slomljenog Mosta, gde je stajala sama do zore.',
    group: g,
    update,
  };
}
