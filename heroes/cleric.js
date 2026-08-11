// heroes/cleric.js — Sestra Lumina, Svestenica Vecne Svetlosti
//
// Ljudska svestenica svetlosti, visina ~1.7, smiren uspravan stav.
// Bela odora sa zlatnim porubima, zlatna stola sa suncevim diskovima,
// lebdeci oreol, svetlece iskre koje kruze, buzdovan i sveta knjiga.
//
// Konvencije: stopala na y=0, lice gleda ka +Z (desna ruka heroja je na +X).

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, lathe, bar, group, shaded,
} from './common.js';

export function createCleric() {
  const root = new THREE.Group();

  // ------------------------------------------------------ deljeni materijali
  const whiteM = mat(COLORS.clothWhite);          // bela odora
  const ivoryM = mat(COLORS.bone);                // veo / vimpl
  const goldM = metalMat(COLORS.gold);            // zlatni okovi i porubi
  const goldLM = metalMat(COLORS.goldLight);      // svetlije zlato (ukrasi)
  const stoleM = mat(COLORS.gold, { roughness: 0.7 });  // zlatna stola (tkanina)
  const skinM = mat(COLORS.skinPale);
  const browM = mat(COLORS.hairBrown);
  const eyeWhiteM = mat(0xf5f2ea);
  const irisM = mat(COLORS.clothBlue);
  const lipM = mat(COLORS.clothRed, { roughness: 0.9 });
  const cheekM = mat(COLORS.skinTan);
  const woodM = mat(COLORS.wood);
  const leatherM = mat(COLORS.leather);
  const pageM = mat(0xf7f3e8, { roughness: 0.95 });

  // svetleci materijali — intenziteti im pulsiraju u update()
  const haloMat = glowMat(COLORS.glowGold, 1.55); // oreol
  const moteMat = glowMat(COLORS.glowGold, 1.7);  // iskre svetlosti
  const coreMat = glowMat(COLORS.glowAmber, 1.5); // jezgro buzdovana
  const runeMat = glowMat(COLORS.glowGold, 1.2);  // sitni stalni sjaj (rune, medaljon)

  // ================================================================== ODORA
  // grupa za lelujanje suknje — pivot kod grudi, tako da porub blago njise
  const robeSway = new THREE.Group();
  robeSway.position.set(0, 1.25, 0);
  root.add(robeSway);

  // glavna bela odora (lathe od poruba do okovratnika)
  const robe = lathe([
    [0.305, 0.02], [0.300, 0.06], [0.270, 0.22], [0.235, 0.42],
    [0.200, 0.62], [0.165, 0.80], [0.148, 0.92], [0.150, 1.02],
    [0.163, 1.14], [0.168, 1.22], [0.125, 1.29], [0.100, 1.31],
  ], whiteM, 16);
  robe.position.y = -1.25;
  robeSway.add(robe);

  // siroki zlatni porub uz sam porub odore
  const hemTrim = cyl(0.272, 0.318, 0.15, goldM, 0, 0.095 - 1.25, 0, 16);
  robeSway.add(hemTrim);

  // tanka zlatna linija malo iznad poruba
  const hemLine = torus(0.278, 0.008, goldLM, 0, 0.20 - 1.25, 0, 8, 24);
  hemLine.rotation.x = Math.PI / 2;
  robeSway.add(hemLine);

  // ---------------------------------------------------------- gornje telo
  // grudni deo (disanje mu menja razmeru u update)
  const chest = sphere(0.12, whiteM, 0, 1.16, 0.03);
  chest.scale.set(1.15, 0.85, 0.8);
  root.add(chest);

  // ramena
  root.add(sphere(0.062, whiteM, 0.185, 1.275, 0.02));
  root.add(sphere(0.062, whiteM, -0.185, 1.275, 0.02));

  // vrat
  root.add(cyl(0.038, 0.042, 0.09, skinM, 0, 1.35, 0.02));

  // zlatni porub oko okovratnika
  const collar = torus(0.105, 0.016, goldM, 0, 1.29, 0.01, 8, 20);
  collar.rotation.x = Math.PI / 2;
  root.add(collar);

  // pojas sa kopcom
  const belt = torus(0.152, 0.018, goldM, 0, 0.92, 0, 8, 22);
  belt.rotation.x = Math.PI / 2;
  root.add(belt);
  root.add(box(0.05, 0.05, 0.016, goldLM, 0, 0.92, 0.15));

  // ------------------------------------------------------------- zlatna stola
  // dve duge trake niz prednju stranu, sa sitnim suncevim diskovima
  for (const sx of [1, -1]) {
    // deo preko ramena
    const top = box(0.075, 0.16, 0.02, stoleM, sx * 0.065, 1.305, 0.045);
    top.rotation.x = 1.15;
    root.add(top);
    // gornji deo na grudima
    const up = box(0.075, 0.22, 0.02, stoleM, sx * 0.065, 1.17, 0.14);
    up.rotation.x = 0.10;
    root.add(up);
    // srednji deo
    const mid = box(0.075, 0.30, 0.02, stoleM, sx * 0.065, 0.93, 0.155);
    mid.rotation.x = -0.10;
    root.add(mid);
    // donji deo koji prati sirenje odore
    const low = box(0.075, 0.34, 0.02, stoleM, sx * 0.065, 0.60, 0.215);
    low.rotation.x = -0.18;
    root.add(low);
    // sitni suncevi diskovi na stoli
    for (const [dy, dz, rx] of [[1.10, 0.155, 0.10], [0.85, 0.170, -0.10], [0.52, 0.235, -0.18]]) {
      const disc = cyl(0.02, 0.02, 0.01, goldLM, sx * 0.065, dy, dz, 12);
      disc.rotation.x = Math.PI / 2 + rx;
      root.add(disc);
    }
  }

  // ------------------------------------------------------ ogrlica sa medaljonom
  root.add(bar([0.085, 1.285, 0.09], [0, 1.175, 0.148], 0.005, goldM, 6));
  root.add(bar([-0.085, 1.285, 0.09], [0, 1.175, 0.148], 0.005, goldM, 6));
  const medallion = cyl(0.036, 0.036, 0.012, goldLM, 0, 1.165, 0.155, 14);
  medallion.rotation.x = Math.PI / 2;
  root.add(medallion);
  // zraci oko medaljona
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2;
    const ray = box(0.008, 0.022, 0.006, goldM,
      Math.sin(a) * 0.048, 1.165 + Math.cos(a) * 0.048, 0.153);
    ray.rotation.z = -a;
    root.add(ray);
  }
  root.add(sphere(0.012, runeMat, 0, 1.165, 0.163, 8, 6));

  // ==================================================================== GLAVA
  // pivot kod vrata, da blagi okreti glave izgledaju prirodno
  const headG = new THREE.Group();
  headG.position.set(0, 1.40, 0.02);
  root.add(headG);

  // lice
  headG.add(sphere(0.115, skinM, 0, 0.075, 0.012, 14, 12));
  // veo preko kose (pozadi i odozgo)
  const veilBack = sphere(0.127, ivoryM, 0, 0.085, -0.012, 14, 12);
  veilBack.scale.set(1.02, 1.03, 1.0);
  headG.add(veilBack);
  // vimpl — nabor koji pada ispod brade ka ramenima
  headG.add(lathe([[0.185, -0.15], [0.148, -0.04], [0.112, 0.02]], ivoryM, 14));
  // gornji nabor vela
  const veilTop = sphere(0.05, ivoryM, 0, 0.195, -0.01, 10, 8);
  veilTop.scale.set(1.35, 0.5, 1.1);
  headG.add(veilTop);
  // bocni nabori koji uokviruju lice
  for (const sx of [1, -1]) {
    const fold = sphere(0.035, ivoryM, sx * 0.105, 0.02, 0.045, 8, 8);
    fold.scale.set(0.8, 1.45, 0.9);
    headG.add(fold);
  }

  // oci: beonjace + duzice
  for (const sx of [1, -1]) {
    headG.add(sphere(0.02, eyeWhiteM, sx * 0.046, 0.085, 0.106, 8, 6));
    headG.add(sphere(0.011, irisM, sx * 0.046, 0.085, 0.121, 8, 6));
    // obrve — blago podignute, blag izraz
    const brow = box(0.045, 0.008, 0.01, browM, sx * 0.048, 0.118, 0.108);
    brow.rotation.z = sx * -0.12;
    headG.add(brow);
    // rumeni obrazi
    const cheek = sphere(0.02, cheekM, sx * 0.066, 0.042, 0.088, 8, 6);
    cheek.scale.set(1, 0.7, 0.5);
    headG.add(cheek);
  }
  // nos
  const nose = sphere(0.013, skinM, 0, 0.062, 0.12, 8, 6);
  nose.scale.set(0.8, 1.3, 1.0);
  headG.add(nose);
  // blagi osmeh — luk torusa na dnu kruga
  const smile = shaded(new THREE.Mesh(
    new THREE.TorusGeometry(0.026, 0.005, 6, 12, Math.PI * 0.75), lipM));
  smile.position.set(0, 0.036, 0.107);
  smile.rotation.z = Math.PI * 1.125;
  smile.rotation.x = -0.12;
  headG.add(smile);

  // zlatni dijadem sa suncevim diskom na celu
  const circlet = torus(0.12, 0.008, goldM, 0, 0.115, 0.005, 8, 22);
  circlet.rotation.x = Math.PI / 2;
  headG.add(circlet);
  const browDisc = cyl(0.02, 0.02, 0.012, goldLM, 0, 0.115, 0.122, 12);
  browDisc.rotation.x = Math.PI / 2;
  headG.add(browDisc);
  // cetiri zraka oko diska na celu
  for (const a of [0, Math.PI / 2, Math.PI / 4, -Math.PI / 4]) {
    const ray = box(0.007, 0.018, 0.005, goldM,
      Math.sin(a) * 0.032, 0.115 + Math.cos(a) * 0.032, 0.121);
    ray.rotation.z = -a;
    headG.add(ray);
  }

  // ================================================================== OREOL
  // lebdeci zlatni prsten iznad glave — rotira se i pulsira
  const HALO_Y = 1.695;
  const haloG = new THREE.Group();
  haloG.position.set(0, HALO_Y, 0);
  root.add(haloG);
  const haloRing = torus(0.13, 0.013, haloMat, 0, 0, 0, 10, 28);
  haloRing.rotation.x = Math.PI / 2;
  haloG.add(haloRing);
  const haloInner = torus(0.082, 0.006, moteMat, 0, 0, 0, 8, 20);
  haloInner.rotation.x = Math.PI / 2;
  haloG.add(haloInner);
  // cetiri perle na prstenu — cine rotaciju vidljivom
  for (let k = 0; k < 4; k++) {
    const a = (k / 4) * Math.PI * 2 + 0.4;
    haloG.add(sphere(0.016, goldLM, Math.cos(a) * 0.13, 0, Math.sin(a) * 0.13, 8, 6));
  }

  // ------------------------------------------------- iskre svetlosti (orbite)
  // sest sitnih svetlecih kugli koje kruze u visini ramena
  const MOTES = [
    { r: 0.36, sp: 0.70, ph: 0.0, y0: 1.26, ba: 0.040, bs: 1.10, sz: 0.020 },
    { r: 0.42, sp: -0.55, ph: 1.3, y0: 1.32, ba: 0.050, bs: 0.90, sz: 0.017 },
    { r: 0.48, sp: 0.62, ph: 2.7, y0: 1.22, ba: 0.060, bs: 1.30, sz: 0.022 },
    { r: 0.33, sp: -0.80, ph: 3.9, y0: 1.35, ba: 0.045, bs: 0.80, sz: 0.016 },
    { r: 0.45, sp: 0.50, ph: 4.7, y0: 1.29, ba: 0.055, bs: 1.15, sz: 0.024 },
    { r: 0.52, sp: 0.66, ph: 5.6, y0: 1.18, ba: 0.050, bs: 0.95, sz: 0.018 },
  ];
  const moteMeshes = [];
  for (const p of MOTES) {
    const m = sphere(p.sz, moteMat, Math.cos(p.ph) * p.r, p.y0, Math.sin(p.ph) * p.r, 8, 6);
    moteMeshes.push(m);
    root.add(m);
  }

  // ============================================================= DESNA RUKA
  // savijena, drzi buzdovan uspravno (glavom nagore)
  root.add(bar([0.19, 1.28, 0.02], [0.28, 1.06, 0.0], 0.045, whiteM, 8));   // nadlaktica
  root.add(bar([0.28, 1.06, 0.0], [0.33, 1.04, 0.21], 0.038, whiteM, 8));   // podlaktica
  root.add(bar([0.318, 1.045, 0.16], [0.328, 1.041, 0.20], 0.046, goldM, 8)); // zlatna manzetna
  // saka koja steze drsku: dlan pozadi, prsti obavijaju napred, palac sa strane
  root.add(box(0.055, 0.09, 0.04, skinM, 0.33, 1.035, 0.212));
  for (let i = 0; i < 4; i++) {
    root.add(box(0.05, 0.017, 0.048, skinM, 0.33, 1.068 - i * 0.024, 0.264));
  }
  const rThumb = box(0.018, 0.045, 0.02, skinM, 0.301, 1.035, 0.243);
  rThumb.rotation.z = 0.25;
  root.add(rThumb);

  // ------------------------------------------------------------- BUZDOVAN
  const maceG = new THREE.Group();
  maceG.position.set(0.33, 1.0, 0.25);
  root.add(maceG);
  maceG.add(sphere(0.03, goldM, 0, -0.30, 0, 10, 8));                 // jabuka na dnu
  maceG.add(cyl(0.015, 0.017, 0.62, woodM, 0, 0.01, 0, 10));          // drska
  maceG.add(cyl(0.021, 0.022, 0.11, leatherM, 0, 0.035, 0, 10));      // kozni rukohvat
  for (const by of [-0.18, 0.16, 0.26]) {                             // zlatne trake
    maceG.add(cyl(0.021, 0.021, 0.024, goldM, 0, by, 0, 10));
  }
  maceG.add(cyl(0.032, 0.018, 0.05, goldM, 0, 0.315, 0, 10));         // kragna ispod glave
  maceG.add(sphere(0.052, coreMat, 0, 0.40, 0, 12, 10));              // svetlece jezgro
  // osam zlatnih perajastih secva radijalno oko jezgra
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const flange = box(0.014, 0.15, 0.06, goldM, Math.sin(a) * 0.045, 0.40, Math.cos(a) * 0.045);
    flange.rotation.y = a;
    maceG.add(flange);
  }
  maceG.add(cone(0.016, 0.055, goldLM, 0, 0.505, 0, 8));              // vrh

  // ============================================================== LEVA RUKA
  // pridrzava otvorenu svetu knjigu
  root.add(bar([-0.19, 1.28, 0.02], [-0.28, 1.07, 0.0], 0.045, whiteM, 8));  // nadlaktica
  root.add(bar([-0.28, 1.07, 0.0], [-0.22, 1.07, 0.22], 0.038, whiteM, 8));  // podlaktica
  root.add(bar([-0.234, 1.07, 0.17], [-0.226, 1.07, 0.21], 0.046, goldM, 8)); // manzetna
  // dlan okrenut nagore, prsti se blago uvijaju oko ivice knjige
  const lPalm = box(0.06, 0.02, 0.07, skinM, -0.21, 1.075, 0.29);
  lPalm.rotation.x = -0.1;
  root.add(lPalm);
  for (let i = 0; i < 4; i++) {
    const f = box(0.013, 0.015, 0.05, skinM, -0.233 + i * 0.015, 1.08, 0.335);
    f.rotation.x = -0.25;
    root.add(f);
  }
  const lThumb = box(0.016, 0.015, 0.045, skinM, -0.158, 1.088, 0.28);
  lThumb.rotation.z = -0.35;
  root.add(lThumb);

  // ----------------------------------------------------------- SVETA KNJIGA
  const tomeG = new THREE.Group();
  tomeG.position.set(-0.20, 1.115, 0.31);
  tomeG.rotation.y = 0.12;
  tomeG.rotation.x = -0.06;
  root.add(tomeG);
  tomeG.add(box(0.03, 0.018, 0.16, goldM, 0, -0.006, 0));             // hrbat
  for (const sx of [1, -1]) {
    // korica pod uglom (otvorena knjiga)
    const cover = box(0.105, 0.012, 0.155, ivoryM, sx * 0.052, 0.012, 0);
    cover.rotation.z = sx * -0.24;
    tomeG.add(cover);
    // zlatni porub spoljne ivice korice (dete korice — prati njen ugao)
    cover.add(box(0.012, 0.015, 0.155, goldM, sx * 0.05, 0, 0));
    // okovi na uglovima
    cover.add(box(0.02, 0.016, 0.02, goldLM, sx * 0.044, 0, 0.068));
    cover.add(box(0.02, 0.016, 0.02, goldLM, sx * 0.044, 0, -0.068));
    // stranice preko korice
    const pages = box(0.095, 0.016, 0.142, pageM, sx * 0.05, 0.026, 0);
    pages.rotation.z = sx * -0.24;
    tomeG.add(pages);
    // blagi sjaj svetih slova iznad stranica
    const rune = sphere(0.018, runeMat, sx * 0.05, 0.042, 0.01, 8, 6);
    rune.scale.set(1.4, 0.3, 1.6);
    tomeG.add(rune);
  }
  tomeG.add(box(0.024, 0.028, 0.02, goldLM, 0, 0.006, 0.088));        // kopca

  // lancic od knjige do pojasa (niz sitnih karika)
  const c0 = new THREE.Vector3(-0.14, 0.90, 0.13);   // pojas
  const c1 = new THREE.Vector3(-0.19, 1.07, 0.27);   // donja strana knjige
  for (let i = 0; i < 7; i++) {
    const s = i / 6;
    const link = torus(0.012, 0.004, goldM,
      c0.x + (c1.x - c0.x) * s,
      c0.y + (c1.y - c0.y) * s - 0.03 * Math.sin(Math.PI * s),
      c0.z + (c1.z - c0.z) * s, 6, 10);
    if (i % 2 === 0) link.rotation.y = 0.9; else link.rotation.x = 0.7;
    root.add(link);
  }

  // ---------------------------------------------------------- BROJANICE
  // niska perli o pojasu, zavrsava se suncevim priveskom; blago se njise
  const beadsG = new THREE.Group();
  beadsG.position.set(0.135, 0.905, 0.115);
  root.add(beadsG);
  for (let i = 0; i < 9; i++) {
    const m = (i % 3 === 2) ? goldLM : woodM;   // svaka treca perla zlatna
    beadsG.add(sphere(0.014, m, 0.015 * Math.sin(i * 0.5), -0.028 * (i + 1), 0.008 * i * 0.12, 8, 6));
  }
  const pend = cyl(0.03, 0.03, 0.01, goldLM, 0, -0.30, 0.012, 12);
  pend.rotation.x = Math.PI / 2;
  beadsG.add(pend);
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2;
    const ray = box(0.007, 0.018, 0.005, goldM,
      Math.sin(a) * 0.04, -0.30 + Math.cos(a) * 0.04, 0.011);
    ray.rotation.z = -a;
    beadsG.add(ray);
  }
  beadsG.add(sphere(0.011, runeMat, 0, -0.30, 0.018, 8, 6));

  // ------------------------------------------------------------- PAPUCE
  // vire ispod odore, sa pozlacenim vrhovima
  for (const sx of [1, -1]) {
    const slip = box(0.075, 0.045, 0.13, ivoryM, sx * 0.085, 0.032, 0.24);
    slip.rotation.y = sx * -0.08;
    root.add(slip);
    const tip = sphere(0.028, goldLM, sx * 0.092, 0.03, 0.305, 8, 6);
    tip.scale.set(1, 0.7, 1);
    root.add(tip);
  }

  // ============================================================== ANIMACIJA
  // sve je cista funkcija od t — bez akumulacije i bez alokacija
  function update(t) {
    // 1) oreol: spora rotacija, blago lebdenje i pulsiranje sjaja
    haloG.rotation.y = t * 0.5;
    haloG.position.y = HALO_Y + 0.018 * Math.sin(t * 0.8 + 0.6);
    haloMat.emissiveIntensity = 1.55 + 0.40 * Math.sin(t * 1.7);

    // 2) iskre svetlosti: svaka svojom putanjom, poluprecnikom i fazom
    moteMat.emissiveIntensity = 1.70 + 0.30 * Math.sin(t * 2.1 + 0.9);
    for (let i = 0; i < MOTES.length; i++) {
      const p = MOTES[i];
      const a = t * p.sp + p.ph;
      moteMeshes[i].position.set(
        Math.cos(a) * p.r,
        p.y0 + p.ba * Math.sin(t * p.bs + p.ph * 2.0),
        Math.sin(a) * p.r);
    }

    // 3) lelujanje odore (pivot kod grudi, porub blago njise)
    robeSway.rotation.z = 0.016 * Math.sin(t * 0.9 + 2.1);
    robeSway.rotation.x = 0.011 * Math.sin(t * 0.7 + 0.3);

    // 4) brojanice se klate o pojasu
    beadsG.rotation.z = 0.07 * Math.sin(t * 1.25 + 0.4);
    beadsG.rotation.x = 0.05 * Math.sin(t * 1.05 + 1.7);

    // 5) blagi okreti glave, kao da posmatra svoje stado
    headG.rotation.y = 0.060 * Math.sin(t * 0.45 + 0.7);
    headG.rotation.x = 0.022 * Math.sin(t * 1.15 + 0.2);

    // 6) disanje — grudni kos se siri i skuplja
    const b = Math.sin(t * 1.4 + 0.9);
    chest.scale.set(1.15 + 0.018 * b, 0.85 + 0.010 * b, 0.8 + 0.014 * b);

    // 7) jezgro buzdovana pulsira svojim ritmom
    coreMat.emissiveIntensity = 1.50 + 0.50 * Math.sin(t * 2.3 + 1.3);
  }

  return {
    name: 'Sestra Lumina',
    title: 'Sveštenica Večne Svetlosti',
    blurb: 'Njene molitve zatvaraju rane, a njen buzdovan otvara puteve kroz tamu. Svetlost koja je prati nije čudo — čudo je što nikada ne gasne.',
    group: root,
    update,
  };
}
