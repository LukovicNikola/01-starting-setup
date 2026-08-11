// heroes/knight.js — Ser Aldrik, Vitez Zore
//
// Vitez u punom plocastom oklopu: celik sa zlatnim obrubima, crveni plast od
// cetiri panela, veliki slem sa uskim prorezom i visokom perjanicom, grudni
// oklop sa zlatnim lavom, verizna suknja pod crvenim tabardom, stit sa lavom
// na levoj ruci i mac Zorolom oslonjen vrhom o tlo pod desnom sakom.
//
// Stopala na y = 0, heroj gleda u +Z, ukupna visina ~1.88 (sa perjanicom).

import * as THREE from 'three';
import {
  COLORS, mat, metalMat, glowMat,
  box, cyl, sphere, cone, torus, bar, group,
} from './common.js';

export function createKnight() {
  // ------------------------------------------------------------ materijali --
  const celik   = metalMat(COLORS.steel);
  const celikT  = metalMat(COLORS.steelDark);
  const gvozdje = metalMat(COLORS.iron);
  const zlato   = metalMat(COLORS.gold);
  const zlatoS  = metalMat(COLORS.goldLight);
  const srebro  = metalMat(COLORS.silver);
  const srebroS = metalMat(0xe9eef4); // svetliji zleb (fuller) seciva
  const crvena  = mat(COLORS.clothRed);
  const bela    = mat(COLORS.clothWhite);
  const koza    = mat(COLORS.leather);
  const kozaT   = mat(COLORS.leatherDark);
  const drvo    = mat(COLORS.woodDark);
  const crna    = mat(0x15151a, { roughness: 0.95 });
  const dragulj = glowMat(0xff4a3c, 1.2); // rubin na jabuci maca
  const oko     = mat(COLORS.glowAmber, {
    emissive: COLORS.glowAmber, emissiveIntensity: 0.55,
  });

  const koren = group();

  // ---------------------------------------------------------------- noge ----
  // Blagi raskorak: leva noga malo napred, desna malo nazad (uz mac).
  function noga(x0, z0) {
    const g = group();
    g.add(box(0.13, 0.085, 0.24, celik,  x0, 0.043, z0 + 0.03));   // sabaton
    g.add(box(0.11, 0.06,  0.09, celikT, x0, 0.032, z0 + 0.17));   // vrh stopala
    g.add(box(0.125, 0.014, 0.02, zlato, x0, 0.088, z0 + 0.05));   // rebro sabatona
    g.add(box(0.125, 0.014, 0.02, zlato, x0, 0.082, z0 + 0.11));   // drugo rebro
    g.add(cyl(0.058, 0.07, 0.34, celik,  x0, 0.28, z0));           // grevna (cev)
    g.add(cyl(0.063, 0.063, 0.03, zlato, x0, 0.44, z0));           // zlatni obrub grevne
    const koleno = sphere(0.072, celik, x0, 0.49, z0);             // stitnik kolena
    koleno.scale.z = 0.9;
    g.add(koleno);
    const siljak = cone(0.028, 0.05, zlato, x0, 0.49, z0 + 0.075); // siljak kolena
    siljak.rotation.x = Math.PI / 2;
    g.add(siljak);
    g.add(cyl(0.082, 0.072, 0.30, celik, x0, 0.67, z0));           // butni oklop
    g.add(cyl(0.087, 0.087, 0.03, zlato, x0, 0.80, z0));           // obrub butnog oklopa
    g.add(sphere(0.011, zlatoS, x0 - 0.03, 0.72, z0 + 0.078));     // zakivak
    g.add(sphere(0.011, zlatoS, x0 + 0.03, 0.63, z0 + 0.076));     // zakivak
    return g;
  }
  koren.add(noga(-0.16, 0.05));
  koren.add(noga(0.16, -0.03));

  // ------------------------------------------------- kukovi i verizna suknja --
  const kukPlat = cyl(0.19, 0.17, 0.14, celik, 0, 0.88, 0);
  kukPlat.scale.z = 0.85;
  koren.add(kukPlat);

  // tri reda verizne suknje (tamno gvozdje)
  const red1 = cyl(0.165, 0.19, 0.10, gvozdje, 0, 0.80, 0);
  const red2 = cyl(0.185, 0.205, 0.09, gvozdje, 0, 0.72, 0);
  const red3 = cyl(0.20, 0.215, 0.08, gvozdje, 0, 0.645, 0);
  for (const r of [red1, red2, red3]) { r.scale.z = 0.9; koren.add(r); }

  // sitne alke koje vise uz donju ivicu suknje
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const alka = torus(0.02, 0.007, gvozdje, 0.21 * Math.sin(a), 0.60, 0.19 * Math.cos(a), 8, 12);
    alka.rotation.y = a;
    koren.add(alka);
  }

  // tabard — crveni prednji panel preko suknje
  const tabard = box(0.22, 0.34, 0.018, crvena, 0, 0.70, 0.20);
  tabard.rotation.x = 0.06;
  koren.add(tabard);
  const tabardRub = box(0.22, 0.026, 0.022, zlato, 0, 0.545, 0.21);
  tabardRub.rotation.x = 0.06;
  koren.add(tabardRub);

  // ---------------------------------------------------------------- torzo ---
  // Grupa torza nosi grudni kos, ruke, glavu, plast i stit — dise kao celina.
  const torzo = group();
  koren.add(torzo);

  const trup = cyl(0.205, 0.165, 0.40, celik, 0, 1.13, 0, 10);
  trup.scale.z = 0.8;
  torzo.add(trup);
  torzo.add(box(0.32, 0.30, 0.07, celik, 0, 1.17, 0.13));          // grudna ploca
  torzo.add(box(0.28, 0.05, 0.06, celikT, 0, 1.00, 0.135));        // donje rebro ploce
  torzo.add(box(0.32, 0.022, 0.02, zlato, 0, 1.315, 0.155));       // zlatni obrub gore
  torzo.add(box(0.32, 0.022, 0.02, zlato, 0, 1.03, 0.168));        // zlatni obrub dole
  torzo.add(box(0.02, 0.30, 0.02, zlato, -0.155, 1.17, 0.155));    // bocni obrub levo
  torzo.add(box(0.02, 0.30, 0.02, zlato, 0.155, 1.17, 0.155));     // bocni obrub desno
  torzo.add(box(0.30, 0.32, 0.05, celikT, 0, 1.16, -0.12));        // ledjna ploca
  const okovratnik = torus(0.115, 0.018, zlato, 0, 1.345, 0.01, 8, 18);
  okovratnik.rotation.x = Math.PI / 2;
  torzo.add(okovratnik);
  torzo.add(cyl(0.06, 0.07, 0.10, gvozdje, 0, 1.40, 0.01));        // vratni oklop

  // zlatni lav na grudima — glava, telo, noge, rep i kruna
  torzo.add(box(0.075, 0.032, 0.014, zlato, 0.005, 1.185, 0.176)); // telo lava
  torzo.add(sphere(0.021, zlato, 0.052, 1.208, 0.176));            // glava lava
  torzo.add(cone(0.012, 0.022, zlatoS, 0.052, 1.228, 0.176));      // mala kruna
  for (const lx of [-0.028, -0.012, 0.02, 0.034]) {
    torzo.add(box(0.011, 0.03, 0.012, zlato, lx, 1.16, 0.176));    // noga lava
  }
  torzo.add(bar([-0.032, 1.192, 0.176], [-0.058, 1.218, 0.176], 0.006, zlato)); // rep

  // ------------------------------------------------------------ kais i torba --
  const kais = torus(0.185, 0.02, kozaT, 0, 0.925, 0, 8, 18);
  kais.rotation.x = Math.PI / 2;
  kais.scale.z = 0.85;
  koren.add(kais);
  koren.add(box(0.055, 0.055, 0.02, zlato, 0, 0.925, 0.168));      // kopca
  koren.add(box(0.008, 0.042, 0.024, zlatoS, 0, 0.925, 0.172));    // trn kopce
  const torba = box(0.085, 0.10, 0.05, koza, -0.19, 0.855, 0.09);
  torba.rotation.y = 0.5;
  koren.add(torba);
  const poklopac = box(0.088, 0.045, 0.054, kozaT, -0.19, 0.895, 0.09);
  poklopac.rotation.y = 0.5;
  koren.add(poklopac);
  koren.add(sphere(0.012, zlato, -0.177, 0.872, 0.115));           // dugme torbe

  // ------------------------------------------------------------- naramenice --
  // Slojevite naramenice sa zakivcima; blago nagnute preko ramena.
  function naramenica(s) {
    const g = group();
    const gornja = sphere(0.115, celik, 0.27 * s, 1.375, 0.02);
    gornja.scale.y = 0.72;
    g.add(gornja);
    const srednja = cyl(0.10, 0.115, 0.055, celik, 0.30 * s, 1.315, 0.02);
    srednja.rotation.z = -0.18 * s;
    g.add(srednja);
    const donja = cyl(0.085, 0.10, 0.05, celikT, 0.325 * s, 1.255, 0.02);
    donja.rotation.z = -0.26 * s;
    g.add(donja);
    g.add(sphere(0.011, zlatoS, 0.27 * s, 1.452, 0.02));           // zakivak vrh
    g.add(sphere(0.011, zlatoS, 0.34 * s, 1.415, 0.075));          // zakivak napred
    g.add(sphere(0.011, zlatoS, 0.34 * s, 1.415, -0.035));         // zakivak nazad
    return g;
  }
  torzo.add(naramenica(1));
  torzo.add(naramenica(-1));

  // ----------------------------------------------------------------- ruke ---
  // Desna ruka: savijena, saka na balcaku maca. Leva ruka: nosi stit.
  function rukaSegmenti(S, E, W) {
    const g = group();
    g.add(sphere(0.065, celik, S[0], S[1], S[2]));                 // rameni zglob
    g.add(bar(S, E, 0.052, celik));                                // nadlaktica
    g.add(sphere(0.058, celikT, E[0], E[1], E[2]));                // lakat
    g.add(bar(E, W, 0.048, celik));                                // podlaktica
    // zlatna manzetna pred sakom
    const M = [E[0] + (W[0] - E[0]) * 0.72, E[1] + (W[1] - E[1]) * 0.72, E[2] + (W[2] - E[2]) * 0.72];
    g.add(bar(M, W, 0.055, zlato));
    return g;
  }
  torzo.add(rukaSegmenti([0.28, 1.33, 0.02], [0.38, 1.12, 0.13], [0.43, 1.00, 0.24]));
  torzo.add(rukaSegmenti([-0.28, 1.33, 0.02], [-0.37, 1.11, 0.07], [-0.33, 1.04, 0.23]));

  // desna saka — rukavica koja obuhvata balcak (prsti oko vertikalnog drska)
  const sakaD = group([], 0.44, 0.945, 0.25);
  sakaD.rotation.y = -0.1;
  sakaD.add(box(0.065, 0.08, 0.05, celikT, 0, 0, 0.01));           // dlan
  for (const fy of [0.027, 0.009, -0.009, -0.027]) {
    sakaD.add(box(0.055, 0.017, 0.02, celik, 0, fy, 0.058));       // prst
  }
  const palacD = box(0.02, 0.045, 0.02, celik, 0.036, -0.012, 0.042);
  palacD.rotation.z = -0.3;
  sakaD.add(palacD);
  sakaD.add(box(0.05, 0.05, 0.012, zlato, 0, 0.005, -0.018));      // plocica na nadlanici
  torzo.add(sakaD);

  // leva saka — drzi rucku sa zadnje strane stita
  const sakaL = group([], -0.36, 1.045, 0.255);
  sakaL.rotation.y = -0.35;
  sakaL.add(box(0.06, 0.075, 0.045, celikT, 0, 0, 0));             // dlan
  for (const fy of [0.024, 0.008, -0.008, -0.024]) {
    sakaL.add(box(0.05, 0.016, 0.02, celik, 0, fy, 0.03));         // prst
  }
  const palacL = box(0.018, 0.04, 0.018, celik, -0.03, -0.005, 0.02);
  palacL.rotation.z = 0.3;
  sakaL.add(palacL);
  sakaL.add(box(0.045, 0.045, 0.012, zlato, 0, 0.005, -0.026));    // plocica na nadlanici
  torzo.add(sakaL);

  // ----------------------------------------------------------------- stit ---
  // Grejanski stit: cetvrt crveno/belo, zlatni rub, lav u sredini, kaisevi.
  const stit = group([], -0.40, 1.05, 0.30);
  stit.rotation.y = -0.35;
  const STIT_BAZA_Z = 0.06;
  stit.rotation.z = STIT_BAZA_Z;
  stit.add(box(0.36, 0.33, 0.016, drvo, 0, 0.02, 0));              // drvena osnova
  stit.add(box(0.165, 0.155, 0.018, crvena, -0.088, 0.10, 0.012)); // cetvrt gore-levo
  stit.add(box(0.165, 0.155, 0.018, bela, 0.088, 0.10, 0.012));    // cetvrt gore-desno
  stit.add(box(0.165, 0.155, 0.018, bela, -0.088, -0.055, 0.012)); // cetvrt dole-levo
  stit.add(box(0.165, 0.155, 0.018, crvena, 0.088, -0.055, 0.012));// cetvrt dole-desno
  const vrhL = box(0.20, 0.22, 0.016, crvena, -0.062, -0.195, 0.006);
  vrhL.rotation.z = 0.5;
  stit.add(vrhL);
  const vrhD = box(0.20, 0.22, 0.016, bela, 0.062, -0.195, 0.006);
  vrhD.rotation.z = -0.5;
  stit.add(vrhD);
  const siljakStita = cone(0.03, 0.08, celikT, 0, -0.305, 0.006);
  siljakStita.rotation.z = Math.PI;
  stit.add(siljakStita);
  // zlatni rub — sipke duz ivica
  stit.add(bar([-0.18, 0.185, 0.012], [0.18, 0.185, 0.012], 0.013, zlato));
  stit.add(bar([-0.18, 0.185, 0.012], [-0.18, -0.06, 0.012], 0.013, zlato));
  stit.add(bar([0.18, 0.185, 0.012], [0.18, -0.06, 0.012], 0.013, zlato));
  stit.add(bar([-0.18, -0.06, 0.012], [0, -0.33, 0.012], 0.013, zlato));
  stit.add(bar([0.18, -0.06, 0.012], [0, -0.33, 0.012], 0.013, zlato));
  // zlatni lav u sredini stita
  stit.add(box(0.085, 0.036, 0.014, zlato, 0, 0.02, 0.03));        // telo
  stit.add(sphere(0.023, zlato, 0.055, 0.046, 0.03));              // glava
  stit.add(cone(0.013, 0.022, zlatoS, 0.055, 0.068, 0.03));        // kruna
  for (const lx of [-0.03, -0.012, 0.016, 0.032]) {
    stit.add(box(0.012, 0.03, 0.012, zlato, lx, -0.006, 0.03));    // noga
  }
  stit.add(bar([-0.042, 0.028, 0.03], [-0.07, 0.058, 0.03], 0.006, zlato)); // rep
  // kaisevi i rucka sa zadnje strane
  stit.add(box(0.05, 0.11, 0.014, koza, -0.05, 0.0, -0.016));
  stit.add(box(0.05, 0.11, 0.014, koza, 0.07, 0.0, -0.016));
  stit.add(bar([0.0, -0.08, -0.026], [0.0, 0.08, -0.026], 0.011, kozaT));
  torzo.add(stit);

  // ------------------------------------------------------------------ mac ---
  // Zorolom stoji vrhom na tlu; tacka oslonca je pivot grupe pa se lako ljulja.
  const mac = group([], 0.44, 0, 0.30);
  const vrhMaca = cone(0.024, 0.10, srebro, 0, 0.05, 0);
  vrhMaca.rotation.z = Math.PI; // vrh nadole
  mac.add(vrhMaca);
  mac.add(box(0.055, 0.72, 0.016, srebro, 0, 0.46, 0));            // secivo
  mac.add(box(0.018, 0.62, 0.02, srebroS, 0, 0.44, 0));            // svetliji zleb
  mac.add(box(0.06, 0.05, 0.02, celikT, 0, 0.835, 0));             // rikaso
  mac.add(box(0.21, 0.024, 0.036, zlato, 0, 0.865, 0));            // nakrsnica
  mac.add(sphere(0.017, zlatoS, -0.105, 0.865, 0));                // kugla nakrsnice
  mac.add(sphere(0.017, zlatoS, 0.105, 0.865, 0));                 // kugla nakrsnice
  mac.add(cyl(0.018, 0.02, 0.17, kozaT, 0, 0.955, 0));             // balcak
  for (const ty of [0.895, 0.935, 0.975, 1.015]) {
    const omot = torus(0.021, 0.006, koza, 0, ty, 0, 8, 14);       // kozni omot
    omot.rotation.x = Math.PI / 2;
    mac.add(omot);
  }
  mac.add(sphere(0.032, zlato, 0, 1.065, 0));                      // jabuka
  mac.add(sphere(0.014, dragulj, 0, 1.098, 0));                    // rubin koji tinja
  koren.add(mac);

  // ---------------------------------------------------------------- glava ---
  // Veliki slem: uzan prorez, rupice za disanje, zlatni krst i obruc.
  const glava = group([], 0, 1.45, 0);
  glava.add(cyl(0.085, 0.10, 0.05, celikT, 0, 0.0, 0.01));         // stitnik vrata
  glava.add(cyl(0.115, 0.115, 0.26, celik, 0, 0.15, 0.01, 12));    // zvono slema
  glava.add(cyl(0.118, 0.118, 0.025, celikT, 0, 0.29, 0.01, 12));  // ravan vrh
  glava.add(box(0.15, 0.014, 0.02, crna, 0, 0.185, 0.118));        // prorez vizira
  glava.add(sphere(0.008, oko, -0.032, 0.185, 0.112));             // odsjaj oka
  glava.add(sphere(0.008, oko, 0.032, 0.185, 0.112));              // odsjaj oka
  glava.add(box(0.026, 0.13, 0.014, zlato, 0, 0.095, 0.122));      // vertikala krsta
  glava.add(box(0.19, 0.018, 0.012, zlato, 0, 0.166, 0.118));      // horizontala krsta
  // rupice za disanje — dva grozda po tri
  for (const [hx, hy] of [[-0.052, 0.115], [-0.078, 0.10], [-0.052, 0.085],
                          [0.052, 0.115], [0.078, 0.10], [0.052, 0.085]]) {
    const hz = Math.sqrt(Math.max(0.115 * 0.115 - hx * hx, 0)) + 0.008;
    glava.add(sphere(0.0065, crna, hx, hy, hz));
  }
  const obruc = torus(0.118, 0.012, zlato, 0, 0.03, 0.01, 8, 18);
  obruc.rotation.x = Math.PI / 2;
  glava.add(obruc);
  glava.add(sphere(0.009, zlatoS, -0.06, 0.03, 0.112));            // zakivak obruca
  glava.add(sphere(0.009, zlatoS, 0.06, 0.03, 0.112));             // zakivak obruca
  torzo.add(glava);

  // perjanica — luk spljostenih kugli od vrha ka potiljku
  const perjanica = group([], 0, 0.28, -0.01);
  perjanica.add(cyl(0.02, 0.028, 0.05, zlato, 0, 0.015, 0));       // drzac perjanice
  const PERJE = [
    [0.05, 0.005, 0.048], [0.085, -0.03, 0.046], [0.10, -0.085, 0.043],
    [0.10, -0.145, 0.040], [0.085, -0.20, 0.036], [0.06, -0.25, 0.032],
    [0.03, -0.295, 0.028], [-0.005, -0.33, 0.024],
  ];
  for (const [py, pz, pr] of PERJE) {
    const pero = sphere(pr, crvena, 0, py, pz);
    pero.scale.set(0.55, 1, 1.2);
    perjanica.add(pero);
  }
  glava.add(perjanica);

  // ---------------------------------------------------------------- plast ---
  // Cetiri panela plasta vise ispod naramenica; svaki ima svoj pivot i fazu.
  const paneli = [];
  const PANEL_X = [-0.165, -0.055, 0.055, 0.165];
  const PANEL_LEPEZA = [0.16, 0.05, -0.05, -0.16];
  const PANEL_BAZA = [0.10, 0.13, 0.13, 0.10];
  const PANEL_FAZA = [0.0, 1.7, 3.1, 4.6];
  for (let i = 0; i < 4; i++) {
    const p = group([], PANEL_X[i], 1.36, -0.13);
    p.rotation.y = PANEL_LEPEZA[i];
    p.rotation.x = PANEL_BAZA[i];
    p.add(box(0.155, 0.74, 0.014, crvena, 0, -0.37, -0.015));      // panel tkanine
    p.add(box(0.155, 0.032, 0.016, zlato, 0, -0.725, -0.015));     // zlatni porub
    paneli.push(p);
    torzo.add(p);
  }
  // ogrtac preko ramena i dve zlatne brose
  torzo.add(box(0.34, 0.06, 0.06, crvena, 0, 1.365, -0.09));
  torzo.add(sphere(0.02, zlatoS, -0.16, 1.36, 0.12));
  torzo.add(sphere(0.02, zlatoS, 0.16, 1.36, 0.12));

  // -------------------------------------------------------------- animacija --
  // Pet nezavisnih mikro-pokreta, sve ciste funkcije od t (bez alokacija):
  //  1) disanje torza  2) osvrtanje glave  3) leprsanje perjanice
  //  4) talasanje panela plasta (fazno pomereno)  5) ljuljanje maca i stita
  function update(t) {
    // disanje — grudni kos se blago podize i spusta
    torzo.position.y = 0.012 * Math.sin(t * 1.6);
    // glava se lagano osvrce levo-desno
    glava.rotation.y = 0.06 * Math.sin(t * 0.53 + 0.7);
    // perjanica leprsa na vetru
    perjanica.rotation.x = 0.07 * Math.sin(t * 1.9 + 1.3);
    perjanica.rotation.z = 0.05 * Math.sin(t * 1.37 + 0.4);
    // paneli plasta se talasaju, svaki sa svojom fazom
    for (let i = 0; i < 4; i++) {
      paneli[i].rotation.x = PANEL_BAZA[i] + 0.05 * Math.sin(t * 1.21 + PANEL_FAZA[i]);
    }
    // mac se jedva primetno ljulja oko tacke oslonca na tlu
    mac.rotation.x = 0.02 * Math.sin(t * 0.83 + 2.0);
    mac.rotation.z = 0.016 * Math.sin(t * 0.67 + 0.4);
    // stit blago dise zajedno sa rukom
    stit.rotation.z = STIT_BAZA_Z + 0.022 * Math.sin(t * 1.05 + 0.9);
    // rubin na jabuci maca tinja
    dragulj.emissiveIntensity = 1.2 + 0.35 * Math.sin(t * 2.3);
  }

  return {
    name: 'Ser Aldrik',
    title: 'Vitez Zore',
    blurb: 'Zakleti branilac kraljevstva koji je odbranio Sivi Bedem od trostruko brojnijeg neprijatelja. Njegov oklop nosi tragove stotinu bitaka, a mač Zorolom nikada nije okusio poraz.',
    group: koren,
    update,
  };
}
