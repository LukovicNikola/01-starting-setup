// heroes/dwarf.js — Borin Kamenobrad, Ratnik Gvozdene Dvorane
//
// Patuljak ratnik: nizak (~1.25) ali VEOMA sirok i zdepast. Ogromna ridja
// brada do kaisa sa dve pletenice stegnute zlatnim prstenovima (tri ukupno),
// celicni slem sa dva zakrivljena roga i zakivcima, verizni oklop od sitnih
// alki pod koznom keceljom, siroki kais sa zlatnom kopcom i nakovnjem,
// dvorucna sekira Drobilica drzana dijagonalno preko grudi obema sakama,
// okrugli drveni stit na ledjima, krigla o kuku i mali cekic za bacanje.
//
// Stopala na y = 0, heroj gleda u +Z, ukupna visina ~1.28 (sa rogovima).

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, bar, group,
} from './common.js';

export function createDwarf() {
  // ------------------------------------------------------------ materijali --
  const celik    = metalMat(COLORS.steel);
  const celikT   = metalMat(COLORS.steelDark);
  const gvozdje  = metalMat(COLORS.iron);
  const gvozdjeT = metalMat(0x3a3e44);          // tamno gvozdje za alke
  const zlato    = metalMat(COLORS.gold);
  const zlatoS   = metalMat(COLORS.goldLight);
  const srebro   = metalMat(COLORS.silver);
  const bronza   = metalMat(COLORS.bronze);
  const koza     = mat(COLORS.leather);
  const kozaT    = mat(COLORS.leatherDark);
  const kozaS    = mat(COLORS.leatherLight);
  const drvo     = mat(COLORS.wood);
  const drvoT    = mat(COLORS.woodDark);
  const tkanina  = mat(COLORS.clothBrown);
  const ridja    = mat(COLORS.hairGinger);      // brada
  const ridjaT   = mat(0x8f3c14);               // tamniji pramenovi
  const ten      = mat(COLORS.skin);
  const belo     = mat(COLORS.bone);
  const zenica   = mat(0x1c1a18, { roughness: 0.5 });
  const rog      = mat(COLORS.bone, { roughness: 0.6 });
  const runa     = glowMat(COLORS.glowAmber, 1.4); // runa na glavi sekire

  const koren = group();

  // ------------------------------------------------------- noge i cizme -----
  // Kratke debele noge u blagom raskoraku: leva napred, desna nazad.
  function noga(s, z0) {
    const g = group();
    g.add(cyl(0.105, 0.115, 0.16, tkanina, 0.15 * s, 0.40, z0 * 0.5)); // butina
    const koleno = sphere(0.078, celikT, 0.15 * s, 0.305, z0 * 0.8);   // stitnik kolena
    koleno.scale.z = 0.9;
    g.add(koleno);
    g.add(cyl(0.08, 0.093, 0.16, tkanina, 0.15 * s, 0.24, z0));        // cevanica
    return g;
  }
  koren.add(noga(-1, 0.05));
  koren.add(noga(1, -0.03));

  // Teske cizme sa zakivcima, celicnim vrhom i kopcom.
  function cizma(s, z0, rotY) {
    const g = group([], 0.15 * s, 0, z0);
    g.rotation.y = rotY;
    g.add(box(0.17, 0.045, 0.26, kozaT, 0, 0.022, 0.02));   // djon
    g.add(box(0.15, 0.11, 0.20, koza, 0, 0.10, 0.0));       // telo cizme
    g.add(box(0.13, 0.075, 0.07, celikT, 0, 0.082, 0.115)); // celicni vrh
    g.add(cyl(0.098, 0.090, 0.07, kozaS, 0, 0.175, -0.01)); // manzetna
    g.add(box(0.155, 0.03, 0.205, kozaT, 0, 0.135, 0.0));   // kais oko cizme
    g.add(box(0.024, 0.036, 0.014, bronza, 0.079 * s, 0.135, 0.045)); // kopcica
    g.add(sphere(0.010, gvozdje, -0.035, 0.085, 0.152));    // zakivak na vrhu
    g.add(sphere(0.010, gvozdje, 0.035, 0.085, 0.152));     // zakivak na vrhu
    g.add(sphere(0.010, gvozdje, 0.077 * s, 0.10, 0.02));   // bocni zakivak
    return g;
  }
  koren.add(cizma(-1, 0.05, -0.13));
  koren.add(cizma(1, -0.03, 0.13));

  // ----------------------------------------------- kais, kopca i nakovanj ---
  const kais = torus(0.295, 0.034, kozaT, 0, 0.475, 0, 8, 20);
  kais.rotation.x = Math.PI / 2;
  kais.scale.y = 0.85; // spljosten po dubini (lokalno y = svetsko z)
  koren.add(kais);
  koren.add(box(0.115, 0.115, 0.02, zlatoS, 0, 0.475, 0.235)); // okvir kopce
  koren.add(box(0.10, 0.10, 0.028, zlato, 0, 0.475, 0.245));   // velika kopca
  // sicusni nakovanj na kopci — ponos Gvozdene Dvorane
  koren.add(box(0.040, 0.012, 0.018, gvozdjeT, 0, 0.448, 0.262)); // postolje
  koren.add(box(0.018, 0.016, 0.014, gvozdjeT, 0, 0.462, 0.262)); // struk
  koren.add(box(0.055, 0.018, 0.016, gvozdjeT, 0, 0.478, 0.262)); // telo nakovnja
  const rogNak = cone(0.008, 0.02, gvozdjeT, 0.036, 0.478, 0.262); // rog nakovnja
  rogNak.rotation.z = -Math.PI / 2;
  koren.add(rogNak);

  // ------------------------------------------------- kozna kecelja sa nitnama
  const kecelja = box(0.30, 0.30, 0.022, koza, 0, 0.32, 0.215);
  kecelja.rotation.x = 0.10;
  koren.add(kecelja);
  const rubKecelje = box(0.30, 0.035, 0.026, kozaT, 0, 0.172, 0.232);
  rubKecelje.rotation.x = 0.10;
  koren.add(rubKecelje);
  for (const s of [-1, 1]) {
    const bok = box(0.10, 0.22, 0.02, koza, 0.19 * s, 0.35, 0.185);
    bok.rotation.x = 0.10;
    bok.rotation.y = 0.35 * s;
    koren.add(bok);
  }
  // metalne nitne na kecelji (2 reda x 3)
  for (const nx of [-0.09, 0, 0.09]) {
    koren.add(sphere(0.013, gvozdje, nx, 0.38, 0.222));
    koren.add(sphere(0.013, gvozdje, nx, 0.26, 0.236));
  }

  // ----------------------------------------------------- krigla o kuku ------
  // Visi o kuki na kaisu i lagano se njise; pivot je na kuki.
  const krigla = group([], 0.29, 0.55, 0.10);
  krigla.add(bar([0, 0, 0], [0, -0.035, 0], 0.008, gvozdje));      // kuka
  krigla.add(cyl(0.047, 0.041, 0.10, srebro, 0, -0.095, 0, 10));   // telo krigle
  krigla.add(cyl(0.050, 0.050, 0.014, celikT, 0, -0.040, 0, 10));  // poklopac
  krigla.add(cyl(0.049, 0.049, 0.012, celikT, 0, -0.148, 0, 10));  // dno
  krigla.add(torus(0.030, 0.009, celikT, 0.055, -0.095, 0, 8, 14)); // drska
  koren.add(krigla);

  // ------------------------------------------- mali cekic za bacanje o kaisu
  const cekic = group([], -0.28, 0.46, -0.10);
  cekic.rotation.y = 0.5;
  cekic.rotation.x = 0.1;
  cekic.add(cyl(0.014, 0.016, 0.22, drvoT, 0, -0.07, 0, 8));       // drska
  cekic.add(box(0.095, 0.048, 0.048, gvozdje, 0, 0.045, 0));       // glava
  cekic.add(cyl(0.018, 0.018, 0.022, bronza, 0, 0.012, 0, 8));     // prsten
  cekic.add(torus(0.020, 0.006, kozaT, 0, 0.075, 0, 8, 12));       // omca
  koren.add(cekic);

  // ------------------------------------------------------------- torzo ------
  // Torzo grupa nosi grudni kos, ramena, ruke, glavu, sekiru i stit — sve dise.
  const torzo = group();
  koren.add(torzo);

  const bure = cyl(0.25, 0.29, 0.44, gvozdje, 0, 0.69, 0, 12); // sirok trup
  bure.scale.z = 0.8;
  torzo.add(bure);

  // verizni oklop — tri reda sitnih tamnih alki oko trupa, fazno pomerene
  for (let red = 0; red < 3; red++) {
    const y = 0.60 + red * 0.09;
    const r = 0.28 - red * 0.012;
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2 + red * 0.31;
      const alka = torus(0.02, 0.0065, gvozdjeT,
        (r + 0.004) * Math.sin(a), y, (r + 0.004) * 0.8 * Math.cos(a), 6, 10);
      alka.rotation.y = a;
      torzo.add(alka);
    }
  }
  torzo.add(box(0.34, 0.28, 0.05, celikT, 0, 0.72, -0.185));   // ledjna ploca
  const okovratnik = torus(0.10, 0.018, gvozdjeT, 0, 0.925, 0.01, 8, 16);
  okovratnik.rotation.x = Math.PI / 2;
  torzo.add(okovratnik);
  torzo.add(cyl(0.075, 0.085, 0.07, gvozdje, 0, 0.925, 0.01)); // vrat

  // kozni remen stita preko grudi i preko ledja, sa nitnama
  torzo.add(bar([0.22, 0.92, 0.16], [-0.26, 0.52, 0.205], 0.018, kozaT));
  torzo.add(bar([0.22, 0.92, -0.15], [-0.26, 0.52, -0.17], 0.018, kozaT));
  torzo.add(sphere(0.012, bronza, 0.12, 0.835, 0.195));
  torzo.add(sphere(0.012, bronza, -0.16, 0.605, 0.215));

  // ------------------------------------------------------- siroka ramena ----
  // Slojevite naramenice sa zakivcima; podizu se pri teskom disanju.
  const NAR_Y = 0.90;
  function naramenica(s) {
    const g = group([], 0.30 * s, NAR_Y, 0.01);
    const gornja = sphere(0.125, celik, 0, 0, 0);
    gornja.scale.y = 0.7;
    g.add(gornja);
    const donja = cyl(0.095, 0.115, 0.055, celikT, 0.04 * s, -0.06, 0);
    donja.rotation.z = -0.25 * s;
    g.add(donja);
    g.add(sphere(0.011, zlatoS, 0, 0.086, 0));            // zakivak vrh
    g.add(sphere(0.011, zlatoS, 0.045 * s, 0.055, 0.075)); // zakivak napred
    g.add(sphere(0.011, zlatoS, 0.045 * s, 0.055, -0.075)); // zakivak nazad
    return g;
  }
  const narD = naramenica(1);
  const narL = naramenica(-1);
  torzo.add(narD);
  torzo.add(narL);

  // ------------------------------------------------------------- ruke -------
  // Kratke debele ruke, obe savijene ka drsci sekire preko grudi.
  function ruka(S, E, W) {
    const g = group();
    g.add(sphere(0.068, gvozdje, S[0], S[1], S[2]));  // rameni zglob
    g.add(bar(S, E, 0.056, gvozdje));                 // nadlaktica
    g.add(sphere(0.060, celikT, E[0], E[1], E[2]));   // lakat
    g.add(bar(E, W, 0.050, gvozdje));                 // podlaktica
    // kozni grebenaste narukvice (bracer) pred sakom
    const M = [E[0] + (W[0] - E[0]) * 0.45, E[1] + (W[1] - E[1]) * 0.45, E[2] + (W[2] - E[2]) * 0.45];
    g.add(bar(M, W, 0.058, koza));
    const N = [E[0] + (W[0] - E[0]) * 0.78, E[1] + (W[1] - E[1]) * 0.78, E[2] + (W[2] - E[2]) * 0.78];
    g.add(bar(N, W, 0.062, kozaT));                   // traka narukvice
    return g;
  }
  // desna: rame -> lakat dole -> zglob na gornjem delu drske
  torzo.add(ruka([0.34, 0.89, 0.04], [0.34, 0.75, 0.19], [0.10, 0.81, 0.29]));
  // leva: rame -> lakat u stranu -> zglob na donjem delu drske
  torzo.add(ruka([-0.34, 0.89, 0.04], [-0.37, 0.68, 0.14], [-0.11, 0.60, 0.29]));

  // ---------------------------------------------------- sekira Drobilica ----
  // Drzana dijagonalno preko grudi; sake su deca sekire pa se dizu s njom.
  const SEK_Y = 0.60;
  const SEK_ROT_Z = -1.02; // polozenije — glava sekire u visini struka, ne brade
  const sekira = group([], 0, SEK_Y, 0.30);
  sekira.rotation.z = SEK_ROT_Z;
  sekira.rotation.x = 0.06;
  sekira.rotation.y = 0.30; // seciva blago pod uglom, da ne zaklanjaju bradu spreda

  sekira.add(cyl(0.024, 0.027, 1.0, drvo, 0, 0, 0, 8));        // debela drska
  sekira.add(cyl(0.031, 0.033, 0.045, gvozdje, 0, -0.51, 0, 8)); // kapica na dnu
  for (const wy of [0.02, -0.05, -0.28, -0.34]) {
    const omot = torus(0.030, 0.009, kozaT, 0, wy, 0, 8, 12);  // kozni omotaci
    omot.rotation.x = Math.PI / 2;
    sekira.add(omot);
  }
  sekira.add(box(0.11, 0.10, 0.055, gvozdje, 0, 0.30, 0));     // blok glave
  sekira.add(cyl(0.031, 0.031, 0.026, bronza, 0, 0.21, 0, 8)); // ojacanje ispod
  sekira.add(cyl(0.031, 0.031, 0.026, bronza, 0, 0.39, 0, 8)); // ojacanje iznad
  sekira.add(sphere(0.010, zlatoS, -0.035, 0.30, 0.030));      // zakivak bloka
  sekira.add(sphere(0.010, zlatoS, 0.035, 0.30, 0.030));       // zakivak bloka
  // dvostruka polumesecasta seciva: spljosteni valjci + srebrna ostrica
  for (const s of [-1, 1]) {
    const secivo = cyl(0.155, 0.155, 0.034, celik, 0.16 * s, 0.30, 0, 14);
    secivo.rotation.x = Math.PI / 2;
    secivo.scale.z = 1.18;          // izduzeno duz drske — polumesec
    sekira.add(secivo);
    const ostrica = cyl(0.168, 0.168, 0.018, srebro, 0.165 * s, 0.30, 0, 14);
    ostrica.rotation.x = Math.PI / 2;
    ostrica.scale.z = 1.18;         // siri tanji disk — sjajna ivica viri
    sekira.add(ostrica);
    const usek = cyl(0.055, 0.055, 0.042, gvozdjeT, 0.085 * s, 0.30, 0, 10);
    usek.rotation.x = Math.PI / 2;  // tamni krug uz drsku — utisak useka
    sekira.add(usek);
  }
  sekira.add(cone(0.026, 0.11, celikT, 0, 0.475, 0));          // siljak na vrhu
  sekira.add(sphere(0.016, runa, 0, 0.30, 0.034));             // runa koja tinja

  // sake — velike, sa prstima obavijenim oko drske i zlatnim stitnicima zglobova
  function saka(yG, s) {
    const g = group([], 0, yG, 0);
    g.rotation.y = 0.15 * s;
    g.add(box(0.075, 0.085, 0.05, ten, 0, 0, -0.048));   // dlan iza drske
    for (const fy of [0.030, 0.010, -0.010, -0.030]) {
      g.add(box(0.060, 0.019, 0.024, ten, 0, fy, 0.045)); // prsti preko drske
    }
    g.add(box(0.022, 0.082, 0.055, ten, -0.046, 0, 0));  // obuhvat sa strane
    g.add(box(0.022, 0.082, 0.055, ten, 0.046, 0, 0));   // obuhvat sa strane
    const palac = box(0.022, 0.05, 0.022, ten, 0.05 * s, -0.052, -0.02);
    palac.rotation.z = 0.4 * s;
    g.add(palac);
    g.add(box(0.062, 0.072, 0.014, zlato, 0, 0, 0.062)); // stitnik zglobova
    return g;
  }
  sekira.add(saka(0.14, 1));   // desna saka — gornji hvat
  sekira.add(saka(-0.16, -1)); // leva saka — donji hvat
  torzo.add(sekira);

  // ------------------------------------------------- stit na ledjima --------
  // Okrugli drveni stit: daske, celicni umbo, obruc sa zakivcima, kaisevi.
  const stit = group([], 0, 0.70, -0.30);
  stit.rotation.x = -0.08;
  stit.rotation.z = 0.18;
  const DASKE = [[-0.192, 0.30], [-0.096, 0.44], [0, 0.50], [0.096, 0.44], [0.192, 0.30]];
  for (const [dx, dh] of DASKE) {
    stit.add(box(0.094, dh, 0.024, drvo, dx, 0, 0));     // daska
  }
  const umbo = sphere(0.09, celik, 0, 0, -0.03);         // centralni umbo
  umbo.scale.z = 0.55;
  stit.add(umbo);
  stit.add(torus(0.235, 0.02, celikT, 0, 0, 0, 8, 22));  // celicni obruc
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.39;
    stit.add(sphere(0.013, srebro, 0.235 * Math.sin(a), 0.235 * Math.cos(a), -0.012));
  }
  stit.add(box(0.05, 0.16, 0.016, koza, -0.06, 0, 0.022));  // kais pozadi
  stit.add(box(0.05, 0.16, 0.016, koza, 0.08, 0, 0.022));   // kais pozadi
  stit.add(bar([-0.02, -0.09, 0.03], [-0.02, 0.09, 0.03], 0.011, kozaT)); // rucka
  torzo.add(stit);

  // ------------------------------------------------------------- glava ------
  const glava = group([], 0, 0.96, 0.02);
  const lobanja = sphere(0.115, ten, 0, 0.10, 0.0);
  lobanja.scale.set(1.05, 0.95, 0.95);
  glava.add(lobanja);
  // veliki nos
  const nos = sphere(0.037, ten, 0, 0.075, 0.108);
  nos.scale.set(0.85, 1.15, 1.0);
  glava.add(nos);
  // stroge oci pod teskim obrvama
  glava.add(sphere(0.017, belo, -0.047, 0.105, 0.093));
  glava.add(sphere(0.017, belo, 0.047, 0.105, 0.093));
  glava.add(sphere(0.008, zenica, -0.047, 0.105, 0.108));
  glava.add(sphere(0.008, zenica, 0.047, 0.105, 0.108));
  const obrvaL = box(0.06, 0.022, 0.028, ridja, -0.05, 0.135, 0.098);
  obrvaL.rotation.z = -0.30; // namrstena — unutrasnji kraj dole
  glava.add(obrvaL);
  const obrvaD = box(0.06, 0.022, 0.028, ridja, 0.05, 0.135, 0.098);
  obrvaD.rotation.z = 0.30;
  glava.add(obrvaD);
  // gusti brkovi koji se spustaju niz bradu
  glava.add(box(0.05, 0.02, 0.022, ridjaT, 0, 0.043, 0.118));   // pod nosom
  glava.add(bar([0.015, 0.045, 0.125], [0.085, -0.005, 0.112], 0.019, ridja));
  glava.add(bar([-0.015, 0.045, 0.125], [-0.085, -0.005, 0.112], 0.019, ridja));
  glava.add(sphere(0.018, ridja, 0.092, -0.022, 0.108));        // vrh brka
  glava.add(sphere(0.018, ridja, -0.092, -0.022, 0.108));       // vrh brka

  // ------------------------------------------------------------- slem -------
  const kupola = sphere(0.135, celik, 0, 0.14, 0.005);
  kupola.scale.y = 0.8;
  glava.add(kupola);
  glava.add(cyl(0.14, 0.142, 0.05, celikT, 0, 0.115, 0.005, 12)); // obod
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2;
    glava.add(sphere(0.010, bronza, 0.143 * Math.sin(a), 0.115, 0.005 + 0.143 * Math.cos(a)));
  }
  glava.add(box(0.034, 0.11, 0.02, celik, 0, 0.075, 0.136));    // stitnik nosa
  glava.add(box(0.06, 0.024, 0.02, celikT, 0, 0.128, 0.136));   // spoj stitnika
  // dva zakrivljena roga — nizovi sve manjih segmenata
  for (const s of [-1, 1]) {
    glava.add(sphere(0.050, rog, 0.135 * s, 0.15, 0.005));
    glava.add(sphere(0.042, rog, 0.185 * s, 0.175, 0.005));
    glava.add(sphere(0.034, rog, 0.222 * s, 0.21, 0.005));
    glava.add(sphere(0.027, rog, 0.248 * s, 0.25, 0.005));
    const vrhRoga = cone(0.019, 0.06, rog, 0.265 * s, 0.293, 0.005);
    vrhRoga.rotation.z = -0.45 * s; // vrh se izvija napolje-gore
    glava.add(vrhRoga);
  }

  // ------------------------------------------------------------- brada ------
  // Ogromna ridja brada do kaisa; pivot na bradi (donjoj vilici) da se njise.
  const brada = group([], 0, -0.02, 0.05);
  const gornjiSloj = sphere(0.095, ridja, 0, -0.02, 0.055);
  gornjiSloj.scale.set(1.25, 0.75, 0.7);
  brada.add(gornjiSloj);
  const sloj1 = cone(0.13, 0.30, ridja, 0, -0.16, 0.055);   // gornji sloj
  sloj1.rotation.x = Math.PI;
  brada.add(sloj1);
  const sloj2 = cone(0.10, 0.30, ridja, 0, -0.27, 0.075);   // srednji sloj
  sloj2.rotation.x = Math.PI;
  brada.add(sloj2);
  const sloj3 = cone(0.075, 0.26, ridjaT, 0, -0.335, 0.085); // donji vrh do kaisa
  sloj3.rotation.x = Math.PI;
  brada.add(sloj3);
  for (const s of [-1, 1]) {
    const pramen = cone(0.055, 0.20, ridjaT, 0.095 * s, -0.12, 0.045); // bocni pramen
    pramen.rotation.x = Math.PI;
    pramen.rotation.z = 0.15 * s;
    brada.add(pramen);
    const trag = box(0.028, 0.20, 0.02, ridjaT, 0.045 * s, -0.19, 0.148); // tamna pruga
    trag.rotation.x = 0.08;
    brada.add(trag);
  }

  // dve pletenice — lanci sve manjih kugli, stegnute zlatnim prstenovima;
  // tri prstena ukupno: po jedan za svakog palog kralja.
  function pletenica(s, prstenovi) {
    const g = group([], 0.08 * s, -0.02, 0.075);
    for (let k = 0; k < 6; k++) {
      const r = 0.031 - 0.0028 * k;
      const px = s * 0.012 * Math.sin(k * 0.9); // blago vijuganje
      g.add(sphere(r, ridja, px, -0.03 - 0.058 * k, 0.012 * k * 0.3));
    }
    for (const k of prstenovi) {
      const prsten = torus(0.030 - 0.0028 * k, 0.008, zlatoS,
        s * 0.012 * Math.sin(k * 0.9), -0.03 - 0.058 * k, 0.012 * k * 0.3, 8, 14);
      prsten.rotation.x = Math.PI / 2; // prsten obavija pletenicu
      g.add(prsten);
    }
    return g;
  }
  const pletL = pletenica(-1, [1, 4]); // dva prstena na levoj
  const pletD = pletenica(1, [3]);     // jedan prsten na desnoj
  brada.add(pletL);
  brada.add(pletD);
  glava.add(brada);
  torzo.add(glava);

  // -------------------------------------------------------------- animacija --
  // Sest nezavisnih mikro-pokreta, sve ciste funkcije od t (bez alokacija):
  //  1) tesko disanje torza + podizanje ramena  2) osvrtanje glave
  //  3) njihanje brade  4) njihanje pletenica (razlicite faze)
  //  5) blago podizanje sekire uz dah  6) ljuljanje krigle + puls rune
  function update(t) {
    // tesko disanje — ceo gornji deo tela se dize, ramena jos malo uz to
    torzo.position.y = 0.016 * Math.sin(t * 1.5);
    narD.position.y = NAR_Y + 0.008 * Math.sin(t * 1.5 + 0.4);
    narL.position.y = NAR_Y + 0.008 * Math.sin(t * 1.5 + 0.9);
    // glava se strogo osvrce levo-desno, uz jedva vidljivo klimanje
    glava.rotation.y = 0.09 * Math.sin(t * 0.37 + 2.0);
    glava.rotation.x = 0.02 * Math.sin(t * 0.9 + 0.3);
    // brada se njise kao celina, pletenice svaka za sebe
    brada.rotation.x = 0.04 * Math.sin(t * 1.15 + 0.8);
    pletL.rotation.z = 0.07 * Math.sin(t * 1.6 + 1.1);
    pletL.rotation.x = 0.05 * Math.sin(t * 1.35 + 0.5);
    pletD.rotation.z = 0.07 * Math.sin(t * 1.45 + 2.6);
    pletD.rotation.x = 0.05 * Math.sin(t * 1.22 + 3.4);
    // sekira se blago podize uz dah i jedva primetno naginje
    sekira.position.y = SEK_Y + 0.02 * Math.sin(t * 1.5 - 0.7);
    sekira.rotation.z = SEK_ROT_Z + 0.025 * Math.sin(t * 0.62 + 1.7);
    // krigla se klati o kuki
    krigla.rotation.x = 0.12 * Math.sin(t * 1.9 + 0.9);
    krigla.rotation.z = 0.09 * Math.sin(t * 1.31 + 2.2);
    // runa na glavi sekire tinja
    runa.emissiveIntensity = 1.4 + 0.5 * Math.sin(t * 2.1 + 0.6);
  }

  return {
    name: 'Borin Kamenobrad',
    title: 'Ratnik Gvozdene Dvorane',
    blurb: 'Rođen pod planinom, kovan u ratu. Njegova sekira Drobilica pamti svaki udarac, a brada svaku pobedu — u nju su upletena tri zlatna prstena, po jedan za svakog palog kralja.',
    group: koren,
    update,
  };
}
