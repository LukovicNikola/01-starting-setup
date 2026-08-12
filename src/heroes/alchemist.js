// src/heroes/alchemist.js — Majstor Ilarion, Alhemičar Kužne Kapije
//
// Visok i mršav lik u kužnoj maski: uska ramena, izduženi udovi, voštani mantil
// do članaka. Silueta se čita po tri stvari — široki ravni obod šešira, dugačak
// kljun koji ide UNAPRED (pa se blago spušta pri vrhu) i kadionica koja se
// njiše na lancu iz desne šake, sa strane kuka.
//
// Sklop (svaki zglob je zasebna grupa, nigde jedan valjak od ramena do šake):
//   root
//    ├── noge (kukovi → koleno → čizma)
//    ├── skut mantila: 5 panela, svaki yaw-grupa + swing-grupa
//    └── torso
//         ├── grudi (dišu), pojas, bandolir sa šest bočica, knjiga, torba
//         ├── vrat → glava (maska, kljun, okulari, kaiševi, šešir)
//         ├── levo rame → lakat → zglob → bočica podignuta pred masku
//         └── desno rame → lakat → zglob → kadionica (šaka je dete kadionice)
//
// Sve što visi o pojasu (knjiga, torba, alat, sumpor) postavljeno je NA spoljnu
// stranu odgovarajućeg panela skuta, po njegovoj normali, da ništa ne uleće u
// tkaninu.

import * as THREE from 'three';
import {
  C, M, Metal, Hide, Flesh, Glow, Ghost,
  box, cyl, sphere, cone, torus, lathe, rock, crystal, bar, group,
  curve, strap, rivets, rivetRing, fringe, edged, vial,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createAlchemist() {
  // ------------------------------------------------------------ materijali --
  // Dvorana je noćna i obasjana žeravnicima, pa je i vosak maske prigušen —
  // svetla krem boja je pri ovom svetlu blještala kao porcelan.
  const coat = M(C.charcoal, { roughness: 0.62 });            // voštano platno
  const coatDark = M(0x1b1e23, { roughness: 0.74 });
  const coatFold = M(0x20242a, { roughness: 0.7 });           // pregibi tkanine
  const coatSeam = M(0x32373e, { roughness: 0.82 });          // opšivi i šavovi
  const hatMat = M(0x191b1f, { roughness: 0.84, side: THREE.DoubleSide });
  const wax = M(0xa89577, { roughness: 0.42, flat: false });   // vosak maske
  const waxDark = M(0x7d6c54, { roughness: 0.5, flat: false });
  const waxIn = M(0x50463a, { roughness: 0.7, flat: false, side: THREE.DoubleSide });
  // Staklo okulara je samo tanka tamna opna — kroz nju se MORA videti pogled.
  const glass = M(0x243036, {
    roughness: 0.14, metalness: 0.3, flat: false, transparent: true, opacity: 0.28,
  });
  const hide = Hide(C.leatherDark);
  const hidePale = Hide(C.leather);
  const glove = Hide(0x2c2018);
  const bootMat = Hide(0x1d2024);
  const brass = Metal(C.brass);
  const iron = Metal(C.blackIron, { roughness: 0.5 });
  const steel = Metal(C.steelDark, { roughness: 0.4 });
  const linen = M(0xb3ac9a, { roughness: 0.95 });
  const skin = Flesh(C.skinGrey);                              // ten pod maskom
  const paper = M(0x9e937b, { roughness: 0.98 });
  const soleMat = Hide(0x121316);
  const vialGlass = M(0xa9bcbd, { roughness: 0.28, transparent: true, opacity: 0.42 });
  // Tela obrtanja (kragna, podstava, okovratnik maske) vide se i sa unutrašnje
  // strane, pa im materijal mora biti dvostran.
  const coatDarkIn = M(0x1b1e23, { roughness: 0.74, side: THREE.DoubleSide });
  const liningMat = M(0x14161a, { roughness: 0.9, side: THREE.DoubleSide });
  const liningEdge = M(0x14161a, { roughness: 0.9 });
  const hidePaleIn = M(C.leather, { roughness: 0.78, side: THREE.DoubleSide });

  const root = new THREE.Group();

  // ================================================================ NOGE ====
  // Težina je na desnoj nozi (junak gleda u +Z, pa mu je desna strana −X):
  // ta noga je uspravna, leva je odmaknuta u stranu i blago savijena u kolenu.
  const HIP_Y = 0.92;

  function leg(hipX, kneeX, kneeZ, ankleX, ankleZ, kneeY, toeYaw) {
    const g = group([], 0, 0, 0);
    // butina, koleno kao zaseban zglob, pa cevanica
    g.add(bar([hipX, HIP_Y, 0], [kneeX, kneeY, kneeZ], 0.068, coatDark, 8, 0.054));
    g.add(sphere(0.05, coatDark, kneeX, kneeY, kneeZ, 9, 8));
    g.add(bar([kneeX, kneeY, kneeZ], [ankleX, 0.17, ankleZ], 0.046, coatDark, 8, 0.04));
    // podvezica ispod kolena — vidi se kroz razrez skuta
    const gart = torus(0.05, 0.01, hide, kneeX, kneeY - 0.07, kneeZ, 6, 12);
    gart.rotation.x = Math.PI / 2;
    g.add(gart);
    g.add(box(0.026, 0.02, 0.012, brass, kneeX, kneeY - 0.07, kneeZ + 0.046));
    // visoka crna čizma sa kopčama
    const b = makeBoot({ mat: bootMat, sole: soleMat, s: 1.08, cuff: hide, buckle: brass });
    b.position.set(ankleX, 0, ankleZ);
    b.rotation.y = toeYaw;
    g.add(b);
    g.add(box(0.05, 0.03, 0.02, brass, ankleX, 0.30, ankleZ + 0.06));   // druga kopča
    root.add(g);
    return g;
  }

  // Uzak stav: sare čizama moraju da ostanu unutar skuta, a asimetriju nose
  // dubina koraka i izvrnuto stopalo, ne raskrečene noge.
  leg(-0.115, -0.122, 0.005, -0.126, 0.02, 0.50, -0.06);  // desna, nosi težinu
  leg(0.115, 0.132, 0.05, 0.14, 0.095, 0.485, 0.26);      // leva, odmaknuta

  // karlica
  const pelvis = cyl(0.155, 0.145, 0.17, coatDark, 0, 0.965, 0, 12);
  pelvis.scale.z = 0.74;
  root.add(pelvis);

  // =============================================================== TORSO ====
  const torso = group([], 0, 0, 0);
  root.add(torso);

  // trup mantila — uzak, blago se širi ka ramenima
  const body = cyl(0.152, 0.142, 0.46, coat, 0, 1.25, 0, 14);
  body.scale.z = 0.70;
  torso.add(body);
  // grudni koš koji diše (poseban sloj preko trupa)
  const chest = sphere(0.145, coat, 0, 1.30, 0.012, 12, 10);
  chest.scale.set(1.0, 0.92, 0.72);
  torso.add(chest);
  // leđna ploča i pregib mantila na krstima
  torso.add(box(0.25, 0.42, 0.05, coatDark, 0, 1.26, -0.098));
  torso.add(box(0.28, 0.035, 0.16, coatSeam, 0, 1.055, -0.03));
  // ključne kosti — dva kosa grebena ispod kragne
  for (const s of [-1, 1]) {
    torso.add(bar([s * 0.02, 1.425, 0.075], [s * 0.145, 1.44, 0.03], 0.018, coatSeam));
  }
  // preklop mantila (revere) i šav po sredini grudi
  for (const s of [-1, 1]) {
    const lap = box(0.085, 0.34, 0.03, coatDark, s * 0.06, 1.28, 0.098);
    lap.rotation.z = s * 0.09;
    torso.add(lap);
    torso.add(box(0.012, 0.34, 0.02, coatSeam, s * 0.103, 1.28, 0.098));
  }
  // deset sitnih dugmadi niz grudi
  for (let i = 0; i < 10; i++) {
    torso.add(sphere(0.0105, brass, 0, 1.40 - i * 0.036, 0.113, 7, 6));
  }
  // bočni šavovi mantila
  for (const s of [-1, 1]) {
    torso.add(box(0.014, 0.44, 0.016, coatSeam, s * 0.148, 1.25, 0.02));
  }

  // ------------------------------------------------------------- kragna ----
  // Visoka uspravna kragna: donji pojas u krug + dva krila koja se dižu iza glave.
  const collar = lathe([[0.112, 0], [0.126, 0.045], [0.142, 0.092]], coatDarkIn, 16);
  collar.position.set(0, 1.44, 0);
  collar.scale.z = 0.86;
  torso.add(collar);
  const collarRim = torus(0.128, 0.011, coatSeam, 0, 1.532, 0, 6, 18);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.scale.y = 0.86;
  torso.add(collarRim);
  for (const s of [-1, 1]) {
    const wing = box(0.045, 0.20, 0.135, coatDark, s * 0.115, 1.585, -0.035);
    wing.rotation.z = s * 0.16;
    wing.rotation.x = -0.12;
    torso.add(wing);
    const wtrim = box(0.05, 0.016, 0.14, coatSeam, s * 0.126, 1.682, -0.048);
    wtrim.rotation.z = s * 0.16;
    torso.add(wtrim);
  }
  const backCollar = box(0.20, 0.17, 0.035, coatDark, 0, 1.575, -0.115);
  backCollar.rotation.x = 0.14;
  torso.add(backCollar);
  torso.add(box(0.20, 0.014, 0.04, coatSeam, 0, 1.655, -0.128));

  // -------------------------------------------------------------- pojas ----
  const belt = cyl(0.163, 0.16, 0.078, hide, 0, 1.032, 0, 14);
  belt.scale.z = 0.74;
  torso.add(belt);
  torso.add(rivetRing(0.168, 6, 0.0095, brass, 1.032, 0.74, 0.31));
  // kopča pojasa
  torso.add(box(0.062, 0.062, 0.016, brass, 0, 1.032, 0.126));
  torso.add(torus(0.036, 0.008, brass, 0, 1.032, 0.132, 5, 12));
  torso.add(box(0.01, 0.05, 0.01, brass, 0, 1.032, 0.138));
  // slobodan kraj pojasa visi niz kuk
  const tail = box(0.045, 0.16, 0.014, hide, -0.075, 0.965, 0.118);
  tail.rotation.z = 0.12;
  torso.add(tail);
  torso.add(box(0.045, 0.016, 0.016, brass, -0.083, 0.888, 0.118));

  // =========================================================== BANDOLIR ====
  // Preko grudi, ispod kragne pa na desni kuk. Gornji kraj NE ide preko ramena:
  // tamo je rukav (poluprečnik 0.052) i kaiš bi prošao kroz nadlakticu. Tačke
  // leže na prednjoj strani mantila, a u svakom pregibu stoji kožni čvor — niz
  // golih valjaka bez čvorova izgleda kao lomljene krhotine, ne kao kaiš.
  const bandPts = [
    [0.070, 1.462, 0.052],
    [0.098, 1.408, 0.098],
    [0.110, 1.352, 0.118],
    [0.098, 1.292, 0.126],
    [0.058, 1.242, 0.132],
    [0.010, 1.192, 0.132],
    [-0.040, 1.140, 0.124],
    [-0.090, 1.086, 0.104],
    [-0.135, 1.036, 0.058],
    [-0.160, 0.998, -0.018],
  ];
  torso.add(strap(bandPts, 0.022, hidePale, 8));
  for (let i = 1; i < bandPts.length - 1; i++) {
    const k = sphere(0.023, hidePale, bandPts[i][0], bandPts[i][1], bandPts[i][2], 8, 6);
    k.scale.set(1, 0.9, 1);
    torso.add(k);
  }
  torso.add(box(0.046, 0.044, 0.022, brass, 0.121, 1.352, 0.142));   // kopča na grudima
  torso.add(box(0.048, 0.042, 0.02, brass, -0.155, 1.036, 0.075));   // kopča na kuku
  torso.add(sphere(0.0085, brass, 0.106, 1.408, 0.114, 7, 6));       // zakivci na kaišu
  torso.add(sphere(0.0085, brass, -0.097, 1.086, 0.121, 7, 6));

  // Šest bočica visi u kožnim ušicama na SREDNJEM delu bandolira (od grudi do
  // struka): tamo su daleko i od podignute leve ruke i od torbe na kuku.
  // Svaka se izmiče po spoljnoj normali trupa, pa nijedna ne ulazi u mantil.
  const vialSpec = [
    [C.poison, 1.5, 0.45, 2.30, 0.0],
    [C.arcane, 1.4, 0.40, 1.70, 1.1],
    [C.saffron, 1.2, 0.36, 2.90, 2.2],
    [C.frost, 1.3, 0.40, 1.30, 3.4],
    [C.bloodGlow, 1.5, 0.50, 3.40, 4.1],
    [C.ivory, 1.0, 0.32, 0.95, 5.0],
  ];
  // dužine karika, da bočice mogu da se rasporede po pravoj dužini kaiša
  const bandLen = [];
  let bandTotal = 0;
  for (let i = 1; i < bandPts.length; i++) {
    const a = bandPts[i - 1], b = bandPts[i];
    const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    bandLen.push(d);
    bandTotal += d;
  }
  const vialMats = [];
  for (let i = 0; i < 6; i++) {
    // tačka na kaišu po dužini (0.40 do 0.72 — grudi do struka)
    let want = bandTotal * (0.40 + i * 0.064);
    let seg = 0;
    while (seg < bandLen.length - 1 && want > bandLen[seg]) { want -= bandLen[seg]; seg++; }
    const f = want / bandLen[seg];
    const a = bandPts[seg], b = bandPts[seg + 1];
    const mx = a[0] + (b[0] - a[0]) * f;
    const my = a[1] + (b[1] - a[1]) * f;
    const mz = a[2] + (b[2] - a[2]) * f;
    // spoljna normala preseka trupa (elipsa 0.147 x 0.103)
    let nx = mx / (0.147 * 0.147), nz = mz / (0.103 * 0.103);
    const nl = Math.hypot(nx, nz) || 1;
    nx /= nl; nz /= nl;
    const OUT = 0.041;                       // kaiš 0.022 + staklo 0.019
    const holder = group([], mx + nx * OUT, my, mz + nz * OUT);
    holder.rotation.y = Math.atan2(nx, nz);
    holder.rotation.z = Math.atan2(b[0] - a[0], -(b[1] - a[1])) * 0.5;
    torso.add(holder);

    const liquid = Glow(vialSpec[i][0], vialSpec[i][1]);
    vialMats.push(liquid);
    holder.add(vial(vialGlass, liquid, 0, 0, 0, 0.076, 0.019));
    // dve kožne ušice oko bočice i jezičak koji ih veže za kaiš — bez toga
    // bočica izgleda kao da lebdi pred mantilom
    for (const ly of [0.024, -0.026]) {
      const loop = torus(0.026, 0.0065, hide, 0, ly, -0.004, 5, 10);
      loop.rotation.x = Math.PI / 2;
      holder.add(loop);
    }
    holder.add(box(0.018, 0.036, 0.030, hide, 0, 0.018, -0.026));
    holder.add(box(0.022, 0.008, 0.008, brass, 0, 0.036, -0.030));
  }

  // ======================================================= SITNICE O POJASU =
  // Knjiga i torba leže NA spoljnoj strani prednjih panela skuta (panel je
  // zaokrenut za ±1.15 rad, površina mu je na 0.215 od ose), pa ih postavljamo
  // po toj normali umesto pravo u tkaninu.
  function onSkirt(yaw, radial, y) {
    return [Math.sin(yaw) * radial, y, Math.cos(yaw) * radial];
  }

  // knjiga sa kožnim povezom i mesinganom kopčom, na levom kuku
  const bp = onSkirt(1.15, 0.258, 0.900);
  const bookG = group([], bp[0], bp[1], bp[2]);
  bookG.rotation.set(0.08, 1.15, 0.05);
  bookG.add(edged(0.125, 0.165, 0.055, hide, hidePale, 0, 0, 0, 0.014));
  bookG.add(box(0.112, 0.150, 0.046, paper, 0.008, 0, 0));            // blok listova
  bookG.add(box(0.108, 0.006, 0.045, M(0x8a806a), 0.010, -0.032, 0));  // razdvojeni listovi
  bookG.add(box(0.108, 0.006, 0.045, M(0x8a806a), 0.010, 0.030, 0));
  bookG.add(box(0.022, 0.168, 0.058, hide, -0.062, 0, 0));            // rikna
  bookG.add(box(0.012, 0.168, 0.062, hidePale, -0.068, 0, 0));        // opšiv rikne
  bookG.add(box(0.02, 0.03, 0.066, brass, 0.062, 0.05, 0));           // mesingana kopča
  bookG.add(box(0.03, 0.012, 0.068, brass, 0.058, 0.05, 0));
  bookG.add(rivets([-0.05, 0.072, 0.030], [0.05, 0.072, 0.030], 3, 0.005, hidePale));
  bookG.add(strap([[0, 0.086, 0.026], [0.012, 0.150, -0.028]], 0.01, hide));
  torso.add(bookG);

  // torba sa suvim biljem na desnom kuku
  const pp = onSkirt(-1.15, 0.262, 0.905);
  const pouch = group([], pp[0], pp[1], pp[2]);
  pouch.rotation.y = -1.15;
  pouch.add(box(0.112, 0.10, 0.072, hidePale, 0, 0.005, 0));           // telo torbe
  const pbot = sphere(0.062, hidePale, 0, -0.046, 0, 10, 8);            // obao dno
  pbot.scale.set(0.9, 0.5, 0.58);
  pouch.add(pbot);
  pouch.add(box(0.118, 0.026, 0.078, hide, 0, 0.062, 0));              // poklopac
  const flap = box(0.112, 0.052, 0.014, hide, 0, 0.040, 0.040);        // preklop sprede
  flap.rotation.x = 0.16;
  pouch.add(flap);
  pouch.add(box(0.108, 0.008, 0.010, hidePale, 0, 0.016, 0.044));      // šav preklopa
  pouch.add(box(0.02, 0.02, 0.014, brass, 0, 0.026, 0.046));           // kopča
  pouch.add(rivets([-0.046, 0.062, 0.042], [0.046, 0.062, 0.042], 4, 0.005, hidePale));
  for (const s of [-1, 1]) {                                           // bočni šavovi
    pouch.add(box(0.008, 0.10, 0.076, hide, s * 0.056, 0.005, 0));
  }
  pouch.add(strap([[0, 0.070, -0.01], [-0.03, 0.140, -0.045]], 0.009, hide));
  // suvo bilje koje viri iz usta torbe
  const herb = M(0x55603a, { roughness: 0.98 });
  const seedMat = M(0x6c7546);
  for (let i = 0; i < 5; i++) {
    const hx = -0.034 + i * 0.017;
    const st = cone(0.008, 0.075 + (i % 3) * 0.02, herb, hx, 0.098, -0.006 + (i % 2) * 0.014, 5);
    st.rotation.z = (i - 2) * 0.12;
    st.rotation.x = -0.14 + (i % 2) * 0.08;
    pouch.add(st);
    if (i % 2 === 0) pouch.add(sphere(0.008, seedMat, hx * 1.2, 0.138 + (i % 3) * 0.018, 0, 5, 4));
  }
  torso.add(pouch);

  // makaze i pinceta o pojasu, sa desne strane pozadi — takođe preko panela
  const tp = onSkirt(-2.35, 0.246, 0.985);
  const tools = group([], tp[0], tp[1], tp[2]);
  tools.rotation.set(0.16, -2.35, 0.1);
  tools.add(bar([0, 0, 0], [0.012, -0.13, 0.01], 0.006, steel));       // sečivo 1
  tools.add(bar([0, 0, 0], [-0.012, -0.13, 0.01], 0.006, steel));      // sečivo 2
  tools.add(sphere(0.009, steel, 0, 0, 0, 6, 5));                      // osovina
  tools.add(torus(0.019, 0.005, steel, 0.017, 0.048, 0, 5, 10));       // uške makaza
  tools.add(torus(0.019, 0.005, steel, -0.017, 0.048, 0, 5, 10));
  tools.add(bar([0.017, 0.03, 0], [0.004, 0.002, 0], 0.005, steel));
  tools.add(bar([-0.017, 0.03, 0], [-0.004, 0.002, 0], 0.005, steel));
  tools.add(bar([0.035, 0.03, -0.01], [0.045, -0.09, -0.005], 0.005, brass)); // pinceta
  tools.add(bar([0.041, 0.03, -0.01], [0.052, -0.09, -0.005], 0.005, brass));
  tools.add(box(0.016, 0.014, 0.012, brass, 0.038, 0.036, -0.01));
  torso.add(tools);

  // grumen sumpora na kožnoj uzici, preko levog zadnjeg panela
  const sp = onSkirt(2.35, 0.252, 0.858);
  const lump = rock(0.032, M(0x9c8330, { roughness: 0.9 }), sp[0], sp[1], sp[2]);
  lump.scale.set(1, 0.8, 0.9);
  torso.add(lump);
  torso.add(bar(sp, [sp[0] * 0.66, 1.005, sp[2] * 0.66], 0.005, hide));

  // ============================================================== SKUT ====
  // Pet panela do članaka, razdvojenih razrezom sprede kroz koji se vide kolena
  // i sare čizama. Svaki panel ima svoj yaw (pravac), svoj swing (njihanje oko
  // pojasa) i svoj tilt (raširenost pri rubu). Šavovi idu UNUTAR lica panela —
  // pomereni na samu ivicu izgledali su kao šipke zabodene pred cevanicu.
  const skirtPivots = [];
  const skirtAngles = [1.15, 2.35, Math.PI, -2.35, -1.15];
  for (let i = 0; i < skirtAngles.length; i++) {
    const yaw = group([], 0, 1.03, 0);
    yaw.rotation.y = skirtAngles[i];
    const swing = group([], 0, 0, 0);
    yaw.add(swing);
    // tilt: panel je od pojasa (r 0.14) razliven do ruba (r 0.24)
    const tilt = group([], 0, -0.44, 0.19);
    tilt.rotation.x = -0.12;
    swing.add(tilt);
    tilt.add(box(0.24, 0.86, 0.05, coat, 0, 0, 0));
    tilt.add(box(0.248, 0.036, 0.058, coatSeam, 0, -0.412, 0.004));    // opšiv ruba
    tilt.add(box(0.012, 0.80, 0.046, coatSeam, 0.102, 0.01, 0.004));   // šav u licu panela
    // dva uzdužna pregiba — bez njih je panel gola ravna daska
    tilt.add(bar([0.052, 0.40, 0.028], [0.038, -0.40, 0.034], 0.014, coatFold, 6, 0.018));
    tilt.add(bar([-0.052, 0.40, 0.028], [-0.040, -0.40, 0.034], 0.013, coatFold, 6, 0.017));
    if (i % 2 === 0) {
      tilt.add(box(0.058, 0.062, 0.05, coatDark, 0.05, -0.28, 0.008)); // zakrpa
      tilt.add(box(0.052, 0.008, 0.05, coatSeam, 0.048, -0.247, 0.011));
    }
    root.add(yaw);
    skirtPivots.push(swing);
  }
  // Podstava zatvara skut do kolena; niže od nje vide se noge i čizme.
  const lining = lathe([[0.15, 0], [0.175, -0.28], [0.19, -0.51]], liningMat, 14);
  lining.position.set(0, 1.03, 0);
  root.add(lining);
  root.add(fringe(0.187, 8, liningEdge, 0.06, 0.522, 1, 0.6));  // iscepan unutrašnji rub

  // ============================================================== GLAVA ====
  const neck = cyl(0.048, 0.055, 0.14, skin, 0, 1.485, -0.005, 10);
  torso.add(neck);
  const neckBand = torus(0.052, 0.012, hide, 0, 1.435, -0.005, 6, 12);
  neckBand.rotation.x = Math.PI / 2;
  torso.add(neckBand);

  const head = group([], 0, 1.56, 0.005);
  torso.add(head);

  // Lice pod maskom — ispijeno i sivo. Lobanja, nos i usta ostaju u senci
  // ljuske; oči, kapke i obrve izvlačimo unapred, u same okulare, tako da
  // beonjača stoji PRED tamnom podlogom tube, dužica pred beonjačom, a zenica
  // pred dužicom — samo tako se kroz staklo čita pogled, a ne siva mrlja.
  const irisMat = Glow(C.poison, 2.6);
  const face = makeFace({
    r: 0.085,
    skin,
    eyeWhiteMat: M(0xcdc7b6, { flat: false, roughness: 0.5 }),
    irisMat,
    eyeSize: 0.019,
    eyeSpread: 0.055,
    eyeY: 0.007,
    brow: 0x6e685c,
    mouth: 'line',
    ears: false,
    cheeks: false,
    tall: 1.0,
    deep: 0.9,
    browAngle: 0.26,
  });
  face.group.position.set(0, 0.055, 0.0);
  head.add(face.group);
  face.eyeL.position.z = 0.124; face.eyeR.position.z = 0.124;
  face.irisL.position.z = 0.137; face.irisR.position.z = 0.137;
  face.lidL.position.z = 0.130; face.lidR.position.z = 0.130;
  face.browL.position.set(-0.058, 0.033, 0.137);   // namrštena obrva u gornjem
  face.browR.position.set(0.058, 0.033, 0.137);    // delu okulara
  const pupilMat = M(0x0c1207, { flat: false });
  for (const s of [-1, 1]) {
    face.group.add(sphere(0.0034, pupilMat, s * 0.055, 0.007, 0.1424, 7, 6));
  }

  // ------------------------------------------------------- voštana maska ---
  // Ljuska preko cele glave, sa pločama, šavovima i kožnim remenjem.
  const shell = sphere(0.126, wax, 0, 0.06, -0.004, 16, 14);
  shell.scale.set(0.98, 1.16, 1.03);
  head.add(shell);
  // Površina ljuske za dato (x, y): svaka zakivka i šav idu UZ nju. Sitan
  // detalj postavljen „na oko" ili utone u masku ili lebdi pred njom.
  const SHX = 0.126 * 0.98, SHY = 0.126 * 1.16, SHZ = 0.126 * 1.03;
  const shellZ = (x, y) => {
    const k = 1 - (x / SHX) ** 2 - ((y - 0.06) / SHY) ** 2;
    return k <= 0.02 ? -0.004 : -0.004 + SHZ * Math.sqrt(k);
  };
  const nape = sphere(0.112, waxDark, 0, 0.035, -0.045, 12, 10);   // potiljak
  nape.scale.set(0.96, 1.05, 0.9);
  head.add(nape);
  // Greben čela — niz kratkih pločica po ljusci. Jedna duga daska bi u sredini
  // utonula u masku, a na slepoočnicama izbila iz nje kao polica.
  for (let i = 0; i < 5; i++) {
    const x = -0.084 + i * 0.042;
    const b = box(0.046, 0.026, 0.020, waxDark, x, 0.115, shellZ(x, 0.115) - 0.004);
    b.rotation.y = Math.atan2(x, 0.10) * 0.9;   // pločica se okreće za ljuskom
    b.rotation.x = -0.20;
    head.add(b);
  }
  // Ploče jagodica: tanke, zakivane, priljubljene uz ljusku po njenoj normali.
  // Pre su bile pune kugle i izbijale su iz maske kao nalepljena jaja.
  for (const s of [-1, 1]) {
    const pg = group([], s * 0.082, 0.020, shellZ(0.082, 0.020) + 0.002);
    pg.rotation.y = s * 0.82;
    pg.rotation.z = -s * 0.08;
    pg.add(box(0.050, 0.080, 0.013, wax, 0, 0, 0));
    pg.add(box(0.054, 0.010, 0.016, waxDark, 0, 0.039, 0));
    pg.add(box(0.054, 0.010, 0.016, waxDark, 0, -0.039, 0));
    pg.add(rivets([-0.014, 0.026, 0.008], [-0.014, -0.026, 0.008], 3, 0.0045, waxDark));
    head.add(pg);
    // slepoočni šav — na samoj površini ljuske
    head.add(box(0.011, 0.10, 0.011, waxDark, s * 0.104, 0.062, shellZ(0.104, 0.062) - 0.004));
  }
  const chin = sphere(0.098, wax, 0, -0.048, 0.018, 12, 10);          // brada maske
  chin.scale.set(0.88, 0.62, 0.86);
  head.add(chin);
  head.add(box(0.096, 0.02, 0.036, waxDark, 0, -0.082, 0.075));       // rub ispod brade
  // šavovi po maski — sitni čvorići umesto crtane linije, svaki uz ljusku
  for (let i = 0; i < 5; i++) {
    const x = -0.080 + i * 0.040;
    head.add(sphere(0.0055, waxDark, x, 0.150, shellZ(x, 0.150) - 0.002, 6, 5));
  }
  for (let i = 0; i < 3; i++) {                                        // šav po temenu
    const y = 0.198 - i * 0.018;
    head.add(sphere(0.005, waxDark, 0, y, shellZ(0, y) - 0.002, 6, 5));
  }

  // ---------------------------------------------------------- okulari -----
  // Udubljena tuba (otvorena, dvostrana) sa tamnim dnom, pa okvir i staklo.
  // Dno je IZA oka, zid tube oko njega — tako oko stoji u senci a vidi se.
  for (const s of [-1, 1]) {
    const back = cyl(0.036, 0.036, 0.007, waxIn, s * 0.055, 0.062, 0.1175, 14);
    back.rotation.x = Math.PI / 2;
    head.add(back);
    const tube = lathe([[0.040, 0], [0.043, 0.032]], waxIn, 14);
    tube.position.set(s * 0.055, 0.062, 0.118);
    tube.rotation.x = Math.PI / 2;
    head.add(tube);
    const frame = torus(0.045, 0.010, iron, s * 0.055, 0.062, 0.151, 8, 16);
    head.add(frame);
    const inner = torus(0.033, 0.005, brass, s * 0.055, 0.062, 0.155, 6, 14);
    head.add(inner);
    const bezel = torus(0.034, 0.004, iron, s * 0.055, 0.062, 0.1445, 6, 14);
    head.add(bezel);
    const pane = cyl(0.041, 0.041, 0.005, glass, s * 0.055, 0.062, 0.150, 14);
    pane.rotation.x = Math.PI / 2;
    head.add(pane);
    const rr = rivetRing(0.048, 4, 0.0055, brass, 0, 1, 0.4);
    rr.position.set(s * 0.055, 0.062, 0.147);
    rr.rotation.x = Math.PI / 2;
    head.add(rr);
  }
  head.add(box(0.052, 0.012, 0.02, iron, 0, 0.076, 0.146));          // most okvira

  // -------------------------------------------------------------- kljun ---
  // Kreće ISPOD okulara i ide gotovo vodoravno UNAPRED, pa se pri vrhu spusti.
  // Pre je izlazio između okulara i padao naglo nadole, pa se čitao kao rog.
  const beakBase = sphere(0.058, wax, 0, -0.022, 0.052, 11, 9);
  beakBase.scale.set(0.74, 0.80, 1.0);
  head.add(beakBase);
  head.add(curve([0, 0.000, 0.070], [0, -0.028, 0.300], [0, 0.012, 0.050],
    wax, 0.046, 0.009, 9));
  // greben po gornjoj i šav po donjoj strani — kljun dobija kobilicu; oba prate
  // samu površinu kljuna (računato po istoj krivoj, pa ne vise u vazduhu)
  head.add(curve([0, 0.046, 0.070], [0, -0.019, 0.300], [0, 0.0165, 0.050],
    waxDark, 0.010, 0.004, 7));
  head.add(curve([0, -0.046, 0.070], [0, -0.037, 0.300], [0, 0.0114, 0.050],
    waxDark, 0.009, 0.004, 7));
  // tri šivena obruča duž kljuna — poluprečnik i nagib uzeti sa krive
  const beakRings = [[-0.001, 0.120, 0.042, 0.039], [-0.006, 0.190, 0.032, 0.098],
    [-0.014, 0.250, 0.022, 0.191]];
  for (const [ry, rz, rr, rt] of beakRings) {
    const ring = torus(rr, 0.005, waxDark, 0, ry, rz, 6, 14);
    ring.rotation.x = rt;
    head.add(ring);
  }
  // dve rupice pri vrhu kljuna
  const nostril = M(0x14100c);
  for (const s of [-1, 1]) {
    const hole = cyl(0.005, 0.005, 0.018, nostril, s * 0.009, -0.031, 0.286, 6);
    hole.rotation.x = 0.9;
    head.add(hole);
  }

  // ------------------------------------------- kaiševi i kopče oko potiljka -
  head.add(strap([
    [-0.115, 0.075, 0.045], [-0.10, 0.088, -0.09], [0.10, 0.088, -0.09],
    [0.115, 0.075, 0.045],
  ], 0.011, hidePale, 6));
  head.add(strap([
    [-0.10, -0.03, 0.06], [-0.095, -0.018, -0.08], [0.095, -0.018, -0.08],
    [0.10, -0.03, 0.06],
  ], 0.01, hidePale, 6));
  head.add(strap([[0, 0.145, -0.03], [-0.02, 0.09, -0.115], [-0.02, -0.02, -0.11]],
    0.009, hidePale, 6));
  for (const s of [-1, 1]) {                                          // kopče
    head.add(box(0.028, 0.026, 0.014, brass, s * 0.108, 0.082, -0.085));
    head.add(box(0.03, 0.01, 0.016, brass, s * 0.108, 0.082, -0.09));
    head.add(box(0.024, 0.022, 0.012, brass, s * 0.098, -0.022, -0.075));
  }
  // kožni okovratnik maske — pokriva spoj sa vratom
  head.add(lathe([[0.088, -0.16], [0.104, -0.11], [0.118, -0.06]], hidePaleIn, 14));
  const collarRing = torus(0.106, 0.009, hide, 0, -0.112, 0, 6, 16);
  collarRing.rotation.x = Math.PI / 2;
  head.add(collarRing);

  // ------------------------------------------------------------- šešir ----
  // Širok ravan obod (lathe) + niski cilindar krune + traka sa kopčom.
  const hat = group([], 0, 0.158, -0.012);
  const brim = lathe([
    [0.135, 0.012], [0.235, -0.004], [0.325, -0.016], [0.342, -0.028],
    [0.325, -0.036], [0.20, -0.026], [0.135, -0.012],
  ], hatMat, 20);
  hat.add(brim);
  hat.add(cyl(0.133, 0.138, 0.115, hatMat, 0, 0.068, 0, 16));
  hat.add(cyl(0.132, 0.132, 0.008, M(0x22252a, { roughness: 0.8 }), 0, 0.126, 0, 16));
  const brimEdge = torus(0.343, 0.008, coatDark, 0, -0.03, 0, 5, 24);
  brimEdge.rotation.x = Math.PI / 2;
  hat.add(brimEdge);
  hat.add(cyl(0.142, 0.142, 0.032, hide, 0, 0.03, 0, 16));           // traka
  hat.add(box(0.038, 0.038, 0.014, brass, 0, 0.03, 0.142));          // kopča trake
  hat.add(box(0.046, 0.012, 0.016, brass, 0, 0.03, 0.145));
  hat.add(rivets([-0.055, 0.048, 0.128], [0.055, 0.048, 0.128], 3, 0.0055, coatSeam));
  hat.rotation.set(0.05, 0.12, -0.03);
  head.add(hat);

  // ================================================================ RUKE ====
  // Rame → nadlaktica → lakat (zaseban zglob) → podlaktica → zglob šake.
  // Manžetna stoji na PODLAKTICI, u njenoj osi — kad je nosi šaka (čiji je
  // okvir poravnat sa svetom), odvoji se od rukava i izgleda kao lebdeća bačva.
  function arm(side, sh, el) {
    const shoulder = group([], side * 0.155, 1.44, 0);
    shoulder.rotation.set(sh[0], sh[1], sh[2]);
    torso.add(shoulder);
    // naramenica i deltoid
    const cap = sphere(0.062, coat, 0, 0.012, 0, 10, 9);
    cap.scale.set(1.0, 0.9, 0.95);
    shoulder.add(cap);
    const pad = sphere(0.068, coatDark, 0, 0.028, 0, 10, 8);
    pad.scale.set(1.05, 0.5, 1.0);
    shoulder.add(pad);
    shoulder.add(cyl(0.052, 0.043, 0.30, coat, 0, -0.15, 0, 10));     // nadlaktica
    shoulder.add(box(0.012, 0.28, 0.012, coatSeam, side * 0.05, -0.15, 0));

    const elbow = group([], 0, -0.30, 0);
    elbow.rotation.set(el[0], el[1], el[2]);
    shoulder.add(elbow);
    elbow.add(sphere(0.046, coatDark, 0, 0, 0, 10, 9));               // lakat
    const eband = torus(0.047, 0.01, coatSeam, 0, -0.01, 0, 6, 12);
    eband.rotation.x = Math.PI / 2;
    elbow.add(eband);
    // rukavica do lakta: manžetna, pa podlaktica u koži
    elbow.add(cyl(0.055, 0.048, 0.07, hide, 0, -0.045, 0, 10));
    const ecuff = torus(0.056, 0.011, hide, 0, -0.075, 0, 6, 14);
    ecuff.rotation.x = Math.PI / 2;
    elbow.add(ecuff);
    elbow.add(cyl(0.042, 0.034, 0.22, glove, 0, -0.175, 0, 10));
    elbow.add(box(0.01, 0.2, 0.01, hide, side * 0.036, -0.175, 0));

    const wrist = group([], 0, -0.29, 0);
    elbow.add(wrist);
    // manžetna zgloba: u osi podlaktice, tesna (rukav je tanak)
    wrist.add(cyl(0.044, 0.038, 0.055, hide, 0, 0.024, 0, 10));
    const wband = torus(0.045, 0.008, hidePale, 0, 0.05, 0, 6, 14);
    wband.rotation.x = Math.PI / 2;
    wrist.add(wband);
    wrist.add(box(0.014, 0.012, 0.05, brass, side * 0.036, 0.03, 0));
    return { shoulder, elbow, wrist };
  }

  // Desna ruka visi niz telo, malo odmaknuta i unapred, i drži kadionicu tako
  // da ona ostane IZVAN skuta i noge. Leva je podignuta i prinosi bočicu pred
  // masku — podlaktica ide gore-koso, a ne pravo u kameru.
  const armR = arm(-1, [-0.321, -0.318, -0.187], [-0.572, -0.12, 0]);
  const armL = arm(1, [-0.348, -0.149, 0.264], [-2.319, 0.18, 0]);

  // Poza je zauzeta — sada čitamo svetske rotacije zglobova da bi predmeti u
  // šakama mogli da vise uspravno (radi se jednom, pri gradnji).
  root.updateMatrixWorld(true);
  const qTmp = new THREE.Quaternion();

  // ---------------------------------------------------- KADIONICA (desna) --
  // censerHold poništava rotaciju podlaktice, pa lanac visi po svetskom −Y.
  // Šaka je dete kadionice (osa drške = Y osa šake), a klatno je unutar nje.
  const censerHold = group([], 0, 0, 0);
  armR.wrist.getWorldQuaternion(qTmp);
  censerHold.quaternion.copy(qTmp.invert());
  armR.wrist.add(censerHold);

  const handR = makeHand({ skin: glove, pose: 'grip', side: 1, s: 0.96 });
  handR.rotation.set(0.12, -0.55, 0.05);
  censerHold.add(handR);

  const censer = group([], 0, 0, 0);                                 // pivot U šaci
  censerHold.add(censer);
  // Lanac počinje UNUTAR pesnice (prva karika je pod dlanom) i ide bez prekida
  // do kadionice: karike se naizmenično uklapaju — položena, uspravna — sa
  // korakom manjim od same karike, pa niz nema šupljina. Iznad šake se ništa
  // ne stavlja: tamo je rukav, i svaka alka bi zašla u manžetnu.
  const LINKS = 17;
  for (let i = 0; i < LINKS; i++) {
    const y = 0.004 - 0.298 * ((i + 0.5) / LINKS);
    const k = torus(0.014, 0.005, iron, 0, y, 0, 6, 10);
    if (i % 2 === 0) k.rotation.x = Math.PI / 2;
    else k.rotation.y = Math.PI / 2;
    censer.add(k);
  }
  // alka na izlazu iz pesnice, da se vidi odakle lanac izlazi
  const swivel = torus(0.019, 0.006, iron, 0, -0.062, 0, 6, 14);
  swivel.rotation.x = Math.PI / 2;
  censer.add(swivel);
  const gather = torus(0.021, 0.006, iron, 0, -0.292, 0, 5, 12);
  gather.rotation.x = Math.PI / 2;
  censer.add(gather);

  const bowl = group([], 0, -0.36, 0);
  censer.add(bowl);
  // tri kratka lanca od alke do poklopca
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    censer.add(bar([0, -0.296, 0], [Math.sin(a) * 0.045, -0.338, Math.cos(a) * 0.045],
      0.005, iron));
  }
  // perforirana metalna kugla
  bowl.add(sphere(0.072, steel, 0, 0, 0, 14, 12));
  const belt2 = torus(0.074, 0.008, brass, 0, 0, 0, 6, 18);           // pojas po ekvatoru
  belt2.rotation.x = Math.PI / 2;
  bowl.add(belt2);
  const hollow = M(0x120f0c, { roughness: 1 });
  for (let i = 0; i < 8; i++) {                                       // osam rupica
    const a = (i / 8) * Math.PI * 2;
    const hx = Math.sin(a) * 0.064, hz = Math.cos(a) * 0.064;
    const h = cyl(0.013, 0.013, 0.022, hollow, hx, 0.018, hz, 7);
    h.rotation.z = -Math.atan2(hx, 0.07) * 0.9;
    h.rotation.x = Math.atan2(hz, 0.07) * 0.9;
    bowl.add(h);
  }
  // žar unutra — vidi se kroz rupice
  const emberMat = Glow(C.poison, 2.1);
  bowl.add(sphere(0.048, emberMat, 0, 0, 0, 10, 8));
  // poklopac sa krstićem od šipki
  bowl.add(cyl(0.052, 0.072, 0.036, steel, 0, 0.052, 0, 14));
  const lidRim = torus(0.053, 0.007, brass, 0, 0.068, 0, 5, 14);
  lidRim.rotation.x = Math.PI / 2;
  bowl.add(lidRim);
  bowl.add(bar([-0.03, 0.078, 0], [0.03, 0.078, 0], 0.005, brass));
  bowl.add(bar([0, 0.078, -0.03], [0, 0.078, 0.03], 0.005, brass));
  bowl.add(cyl(0.008, 0.012, 0.03, brass, 0, 0.094, 0, 8));
  bowl.add(sphere(0.012, brass, 0, 0.112, 0, 8, 7));
  const spike = cone(0.022, 0.045, steel, 0, -0.085, 0, 10);          // šiljak pod kuglom
  spike.rotation.x = Math.PI;
  bowl.add(spike);
  bowl.add(sphere(0.011, brass, 0, -0.108, 0, 7, 6));
  // Tri prozirne zelenkaste magle — nisko nad poklopcem. Kad su se dizale
  // visoko, odvajale su se od kadionice i čitale kao bele grudve na lancu.
  const mistMat = Ghost(C.poison, 0.9, 0.14);
  const mists = [];
  for (let i = 0; i < 3; i++) {
    const m = sphere(0.042, mistMat, 0, 0.14, 0, 9, 8);
    bowl.add(m);
    mists.push(m);
  }

  // ------------------------------------------------ BOČICA U LEVOJ ŠACI ----
  const flaskHold = group([], 0, 0, 0);
  armL.wrist.getWorldQuaternion(qTmp);
  flaskHold.quaternion.copy(qTmp.invert());
  // Šaka je prelomljena preko podlaktice i boca visi PRED njom, unapred i malo
  // ka telu: kad je visila pravo nadole, trbuh boce je ulazio u rukav.
  flaskHold.rotateZ(-0.25);
  flaskHold.rotateX(-0.75);
  armL.wrist.add(flaskHold);

  const handL = makeHand({ skin: glove, pose: 'grip', side: -1, s: 0.96 });
  handL.rotation.set(0.05, 0.9, -0.04);
  flaskHold.add(handL);

  // Staklo je tamnije od tena: pre je bela boca čitala kao biserna kugla
  // prilepljena na mantil; sada svetli samo sadržaj.
  const flaskGlass = M(0x8fa5a6, { roughness: 0.3, transparent: true, opacity: 0.34 });
  const flaskGlow = Glow(C.arcane, 1.6);
  flaskHold.add(cyl(0.018, 0.021, 0.10, flaskGlass, 0, -0.002, 0, 10));   // grlo
  flaskHold.add(cyl(0.021, 0.044, 0.045, flaskGlass, 0, -0.072, 0, 12));  // rame boce
  flaskHold.add(sphere(0.046, flaskGlass, 0, -0.108, 0, 12, 10));         // trbuh
  flaskHold.add(sphere(0.036, flaskGlow, 0, -0.114, 0, 10, 9));           // sadržaj
  flaskHold.add(cyl(0.016, 0.019, 0.026, Hide(C.woodDark), 0, 0.062, 0, 8)); // čep
  flaskHold.add(crystal(0.013, Glow(C.goldPale, 1.1), 0, 0.086, 0));
  const flaskRing = torus(0.022, 0.005, brass, 0, 0.044, 0, 5, 12);
  flaskRing.rotation.x = Math.PI / 2;
  flaskHold.add(flaskRing);
  flaskHold.add(box(0.03, 0.022, 0.004, linen, 0, -0.108, 0.046));        // nalepnica

  // ============================================================ POKRET ====
  // Sve prijave idu POSLE zauzimanja mirne poze — svaki pokret pamti zatečenu
  // vrednost kao osnovu i osciluje oko nje.
  const anim = new Anim();

  // 1. kadionica se njiše na lancu kao klatno — pretežno napred-nazad, jer
  //    zamah u stranu bi je prislonio na skut
  anim.rot(censer, 'x', 0.18, 1.05);
  anim.rot(censer, 'z', 0.07, 0.71, 0.9);
  anim.rot(bowl, 'y', 0.14, 0.55, 2.1);              // kugla se blago vrti u lancu
  anim.flicker(emberMat, 1.9, 0.5, 5.3, 12.7, 0.4);

  // 2. tri magle se dižu iz kadionice i vraćaju u petlju
  anim.rise(mists[0], 0.028, 3.1, 0.0, 0.13, 0.30, 1.1);
  anim.rise(mists[1], 0.034, 3.9, 0.33, 0.12, 0.32, -0.8);
  anim.rise(mists[2], 0.024, 4.7, 0.66, 0.14, 0.27, 1.6);

  // 3. bočice na bandoliru pulsiraju, svaka svojim ritmom
  for (let i = 0; i < vialMats.length; i++) {
    const [, base, amp, speed, phase] = vialSpec[i];
    anim.pulse(vialMats[i], base, amp, speed, phase);
  }
  anim.pulse(flaskGlow, 1.6, 0.35, 1.45, 2.6);

  // 4. skut mantila se njiše — talas putuje kroz panele
  anim.wave(skirtPivots, 'x', 0.055, 0.86, 0.42, 0.3);

  // 5. blago naginjanje glave sa kljunom
  anim.rot(head, 'x', 0.05, 0.47, 0.6);
  anim.rot(head, 'z', 0.035, 0.31, 1.9);
  anim.scan(head, 0.11, 11, 2.0);

  // 6. dah, sitno njihanje ruku i treptaj pod maskom
  anim.breathe(chest, 0.012, 1.05, 0.2);
  anim.rot(armR.shoulder, 'x', 0.03, 0.62, 1.4);
  anim.rot(armL.elbow, 'x', 0.035, 0.53, 2.7);
  anim.rot(torso, 'y', 0.02, 0.29, 0.8);
  anim.blink(face.lidL, 5.1, 0.0, 0.030);
  anim.blink(face.lidR, 5.1, 0.05, 0.030);
  anim.pulse(irisMat, 2.4, 0.5, 1.9, 0.0);

  return {
    name: 'Majstor Ilarion',
    title: 'Alhemičar Kužne Kapije',
    blurb: 'Prošao je kroz tri grada u kojima niko drugi nije preživeo prvu nedelju. Maska mu nije zaštita nego navika — kaže da je odavno prestao da razlikuje vazduh koji leči od vazduha koji ubija, pa je najbezbednije ne udisati nijedan.',
    heraldry: { color: C.poison, sigil: 'flask' },
    eyeY: 1.62,
    group: root,
    update: (t) => anim.tick(t),
  };
}
