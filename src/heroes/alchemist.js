// src/heroes/alchemist.js — Majstor Ilarion, Alhemičar Kužne Kapije
//
// Visok i mršav lik u kužnoj maski: uska ramena, izduženi udovi, voštani mantil
// do članaka. Silueta se čita po tri stvari — široki ravni obod šešira, dugačak
// zakrivljen kljun i kadionica koja se njiše na lancu iz desne šake.
//
// Sklop (svaki zglob je zasebna grupa, nigde jedan valjak od ramena do šake):
//   root
//    ├── noge (kukovi → koleno → čizma)
//    ├── skut mantila: 5 panela, svaki yaw-grupa + swing-grupa
//    └── torso
//         ├── grudi (dišu), pojas, bandolir sa šest bočica, knjiga, torba
//         ├── vrat → glava (maska, kljun, naočari, kaiševi, šešir)
//         ├── levo rame → lakat → zglob → bočica u šaci
//         └── desno rame → lakat → zglob → kadionica (šaka je dete kadionice)

import * as THREE from 'three';
import {
  C, M, Metal, Hide, Flesh, Glow, Ghost,
  box, cyl, sphere, cone, torus, lathe, rock, crystal, bar, group,
  curve, strap, chain, rivets, rivetRing, fringe, edged, vial,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createAlchemist() {
  // ------------------------------------------------------------ materijali --
  const coat = M(C.charcoal, { roughness: 0.62 });            // voštano platno
  const coatDark = M(0x1b1e23, { roughness: 0.74 });
  const coatSeam = M(0x3a3f47, { roughness: 0.82 });          // opšivi i šavovi
  const hatMat = M(0x191b1f, { roughness: 0.84, side: THREE.DoubleSide });
  const wax = M(0xc9b48c, { roughness: 0.36, flat: false });   // vosak maske
  const waxDark = M(0xa38f6b, { roughness: 0.44, flat: false });
  const glass = M(0x12171b, {
    roughness: 0.1, metalness: 0.45, flat: false, transparent: true, opacity: 0.62,
  });
  const hide = Hide(C.leatherDark);
  const hidePale = Hide(C.leather);
  const glove = Hide(0x2c2018);
  const bootMat = Hide(0x1d2024);
  const brass = Metal(C.brass);
  const iron = Metal(C.blackIron, { roughness: 0.5 });
  const steel = Metal(C.steelDark, { roughness: 0.4 });
  const linen = M(C.ivory, { roughness: 0.95 });
  const skin = Flesh(C.skinGrey);                              // ten pod maskom
  const paper = M(0xd8cdb0, { roughness: 0.98 });
  const soleMat = Hide(0x121316);
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
    g.add(box(0.028, 0.02, 0.012, brass, kneeX, kneeY - 0.07, kneeZ + 0.05));
    // visoka crna čizma sa kopčama
    const b = makeBoot({ mat: bootMat, sole: soleMat, s: 1.08, cuff: hide, buckle: brass });
    b.position.set(ankleX, 0, ankleZ);
    b.rotation.y = toeYaw;
    g.add(b);
    g.add(box(0.05, 0.03, 0.02, brass, ankleX, 0.30, ankleZ + 0.072));   // druga kopča
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
    const cl = bar([s * 0.02, 1.425, 0.075], [s * 0.145, 1.44, 0.03], 0.018, coatSeam);
    torso.add(cl);
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
    const y = 1.40 - i * 0.036;
    torso.add(sphere(0.0105, brass, 0, y, 0.113, 7, 6));
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
  torso.add(torus(0.128, 0.011, coatSeam, 0, 1.532, 0, 6, 18));
  torso.children[torso.children.length - 1].rotation.x = Math.PI / 2;
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
  const bframe = torus(0.036, 0.008, brass, 0, 1.032, 0.132, 5, 12);
  torso.add(bframe);
  torso.add(box(0.01, 0.05, 0.01, brass, 0, 1.032, 0.138));
  // slobodan kraj pojasa visi niz kuk
  const tail = box(0.045, 0.16, 0.014, hide, -0.075, 0.965, 0.118);
  tail.rotation.z = 0.12;
  torso.add(tail);
  torso.add(box(0.045, 0.016, 0.016, brass, -0.083, 0.888, 0.118));

  // =========================================================== BANDOLIR ====
  // Preko grudi, sa levog ramena na desni kuk, sa šest bočica u kožnim ušicama.
  const bandPts = [
    [0.148, 1.452, -0.058], [0.128, 1.375, 0.072], [0.06, 1.265, 0.112],
    [-0.035, 1.155, 0.108], [-0.125, 1.055, 0.062], [-0.158, 0.99, -0.055],
  ];
  torso.add(strap(bandPts, 0.024, hidePale, 7));
  torso.add(box(0.055, 0.05, 0.02, brass, 0.138, 1.412, 0.02));
  torso.add(box(0.05, 0.045, 0.018, brass, -0.148, 1.02, 0.04));
  torso.add(rivets([0.115, 1.335, 0.098], [-0.105, 1.095, 0.096], 4, 0.0085, brass));

  // šest bočica: otrovno zelena, ljubičasta, ćilibarna, plava, crvena, mlečna
  const vialSpec = [
    [C.poison, 1.9, 0.55, 2.30, 0.0],
    [C.arcane, 1.7, 0.50, 1.70, 1.1],
    [C.saffron, 1.5, 0.45, 2.90, 2.2],
    [C.frost, 1.6, 0.50, 1.30, 3.4],
    [C.bloodGlow, 1.8, 0.60, 3.40, 4.1],
    [C.ivory, 1.2, 0.40, 0.95, 5.0],
  ];
  const vialMats = [];
  for (let i = 0; i < 6; i++) {
    const t = 0.10 + i * 0.155;
    // tačka na bandoliru (linearna interpolacija kroz zadate karike)
    const seg = Math.min(4, Math.floor(t * 5));
    const f = t * 5 - seg;
    const a = bandPts[seg], b = bandPts[seg + 1];
    const px = a[0] + (b[0] - a[0]) * f;
    const py = a[1] + (b[1] - a[1]) * f;
    const pz = a[2] + (b[2] - a[2]) * f;
    const liquid = Glow(vialSpec[i][0], vialSpec[i][1]);
    vialMats.push(liquid);
    const v = vial(M(0xdfe6e4, { roughness: 0.2, transparent: true, opacity: 0.5 }),
      liquid, px * 1.12, py - 0.035, pz * 1.12 + 0.022, 0.078, 0.019);
    v.rotation.z = (px > 0 ? -1 : 1) * 0.22;
    torso.add(v);
    // kožna ušica koja drži bočicu za bandolir
    const loop = torus(0.024, 0.007, hide, px * 1.12, py + 0.012, pz * 1.12 + 0.018, 5, 10);
    loop.rotation.x = Math.PI / 2;
    torso.add(loop);
  }

  // ======================================================= SITNICE O POJASU =
  // knjiga sa kožnim povezom i mesinganom kopčom, na levom kuku
  const bookG = group([], 0.185, 0.905, 0.045);
  bookG.rotation.set(0.1, -0.32, 0.06);
  bookG.add(edged(0.125, 0.165, 0.055, hide, hidePale, 0, 0, 0, 0.014));
  bookG.add(box(0.115, 0.152, 0.062, paper, 0.006, 0, 0));
  bookG.add(box(0.112, 0.006, 0.061, M(0xb9ad92), 0.008, -0.03, 0));  // razdvojeni listovi
  bookG.add(box(0.022, 0.168, 0.06, hide, -0.062, 0, 0));            // rikna
  bookG.add(box(0.02, 0.03, 0.068, brass, 0.062, 0.05, 0));          // mesingana kopča
  bookG.add(box(0.03, 0.012, 0.07, brass, 0.058, 0.05, 0));
  bookG.add(strap([[0, 0.085, 0.032], [0.03, 0.20, 0.0]], 0.01, hide));
  torso.add(bookG);

  // torba sa suvim biljem na desnom kuku
  const pouch = group([], -0.185, 0.925, 0.085);
  pouch.rotation.y = 0.3;
  pouch.add(box(0.115, 0.115, 0.075, hidePale, 0, 0, 0));
  pouch.add(box(0.12, 0.03, 0.08, hide, 0, 0.06, 0));                // poklopac
  pouch.add(box(0.118, 0.045, 0.012, hide, 0, 0.045, 0.042));
  pouch.add(box(0.02, 0.02, 0.014, brass, 0, 0.03, 0.045));
  pouch.add(strap([[0, 0.062, 0], [0.02, 0.16, -0.03]], 0.009, hide));
  // suvo bilje koje viri iz torbe
  const herb = M(0x6d7a4a, { roughness: 0.98 });
  const seed = M(0x8e9a5c);
  for (let i = 0; i < 5; i++) {
    const hx = -0.036 + i * 0.018;
    const st = cone(0.008, 0.09 + (i % 3) * 0.022, herb, hx, 0.11, -0.012 + (i % 2) * 0.02, 5);
    st.rotation.z = (i - 2) * 0.14;
    st.rotation.x = -0.18 + (i % 2) * 0.1;
    pouch.add(st);
    if (i % 2 === 0) pouch.add(sphere(0.009, seed, hx * 1.25, 0.16 + (i % 3) * 0.02, 0, 5, 4));
  }
  torso.add(pouch);

  // makaze i pinceta o pojasu, sa desne strane pozadi
  const tools = group([], -0.155, 0.99, -0.075);
  tools.rotation.set(0.18, 0, 0.1);
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

  // grumen sumpora na kožnoj uzici
  const lump = rock(0.032, M(0xc4a63a, { roughness: 0.9 }), 0.075, 0.845, -0.09);
  lump.scale.set(1, 0.8, 0.9);
  torso.add(lump);
  torso.add(bar([0.075, 0.845, -0.09], [0.09, 0.995, -0.075], 0.005, hide));

  // ============================================================== SKUT ====
  // Pet panela do članaka, razdvojenih razrezom sprede (~38°) kroz koji se vide
  // kolena i sare čizama. Svaki panel ima svoj yaw (pravac), svoj swing
  // (njihanje oko pojasa) i svoj tilt (raširenost pri rubu), pa talas može da
  // putuje kroz tkaninu bez da se paneli seku međusobno.
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
    tilt.add(box(0.014, 0.86, 0.052, coatSeam, 0.123, 0, 0.003));      // bočni šav
    if (i % 2 === 0) {
      tilt.add(box(0.058, 0.062, 0.05, coatDark, 0.05, -0.28, 0.006)); // zakrpa
      tilt.add(box(0.052, 0.008, 0.05, coatSeam, 0.048, -0.247, 0.009));
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
  torso.add(torus(0.052, 0.012, hide, 0, 1.435, -0.005, 6, 12));
  torso.children[torso.children.length - 1].rotation.x = Math.PI / 2;

  const head = group([], 0, 1.56, 0.005);
  torso.add(head);

  // Lice pod maskom — ispijeno i sivo. Lobanja, nos i usta ostaju u senci
  // ljuske, ali oči, kapke i obrve izvlačimo unapred, u same okulare, pa se
  // kroz tamno staklo vidi pogled koji trepće.
  const face = makeFace({
    r: 0.085,
    skin,
    eyeWhiteMat: M(0xd8d2c2, { flat: false, roughness: 0.5 }),
    eyeGlow: C.poison,
    eyeSize: 0.016,
    eyeSpread: 0.055,
    eyeY: 0.007,
    brow: 0x8d8578,
    mouth: 'line',
    ears: false,
    cheeks: false,
    tall: 1.0,
    deep: 0.9,
    browAngle: 0.26,
  });
  face.group.position.set(0, 0.055, 0.0);
  head.add(face.group);
  face.eyeL.position.z = 0.128; face.eyeR.position.z = 0.128;
  face.irisL.position.z = 0.136; face.irisR.position.z = 0.136;
  face.lidL.position.z = 0.131; face.lidR.position.z = 0.131;
  face.browL.position.set(-0.058, 0.040, 0.129);   // namrštena obrva u gornjem
  face.browR.position.set(0.058, 0.040, 0.129);    // delu okulara

  // ------------------------------------------------------- voštana maska ---
  // Ljuska preko cele glave, sa pločama, šavovima i kožnim remenjem.
  const shell = sphere(0.126, wax, 0, 0.06, -0.004, 16, 14);
  shell.scale.set(0.98, 1.16, 1.03);
  head.add(shell);
  const nape = sphere(0.112, waxDark, 0, 0.035, -0.045, 12, 10);   // potiljak
  nape.scale.set(0.96, 1.05, 0.9);
  head.add(nape);
  const brow = box(0.19, 0.03, 0.09, waxDark, 0, 0.108, 0.082);     // greben čela
  brow.rotation.x = -0.22;
  head.add(brow);
  for (const s of [-1, 1]) {                                        // ploče jagodica
    const cheek = sphere(0.062, wax, s * 0.082, 0.012, 0.056, 9, 8);
    cheek.scale.set(0.7, 1.05, 0.86);
    head.add(cheek);
    // slepoočni šav
    head.add(box(0.012, 0.13, 0.012, waxDark, s * 0.106, 0.05, 0.026));
  }
  const chin = sphere(0.098, wax, 0, -0.048, 0.03, 12, 10);          // brada maske
  chin.scale.set(0.9, 0.66, 0.95);
  head.add(chin);
  head.add(box(0.10, 0.02, 0.04, waxDark, 0, -0.085, 0.062));
  // šavovi po maski — sitni čvorići umesto crtane linije
  head.add(rivets([-0.10, 0.118, 0.036], [0.10, 0.118, 0.036], 5, 0.0055, waxDark));
  head.add(rivets([0, 0.148, 0.055], [0, -0.06, 0.108], 4, 0.005, waxDark));

  // ----------------------------------------------------------- naočari ----
  // Torus okvir + tamno staklo sa slabim odsjajem, na kratkoj tubi iz maske.
  for (const s of [-1, 1]) {
    // udubljeni okular: tuba je zatvorena SA ZADNJE strane, da oko ima tamnu
    // podlogu, a otvorena ka staklu
    const socket = cyl(0.038, 0.043, 0.05, waxDark, s * 0.055, 0.062, 0.10, 12);
    socket.rotation.x = Math.PI / 2;
    head.add(socket);
    const frame = torus(0.039, 0.009, iron, s * 0.055, 0.062, 0.149, 7, 16);
    head.add(frame);
    const inner = torus(0.030, 0.005, brass, s * 0.055, 0.062, 0.153, 6, 14);
    head.add(inner);
    const pane = cyl(0.034, 0.034, 0.005, glass, s * 0.055, 0.062, 0.148, 14);
    pane.rotation.x = Math.PI / 2;
    head.add(pane);
    const rr = rivetRing(0.042, 4, 0.0055, brass, 0, 1, 0.4);
    rr.position.set(s * 0.055, 0.062, 0.145);
    rr.rotation.x = Math.PI / 2;
    head.add(rr);
  }
  head.add(box(0.055, 0.012, 0.02, iron, 0, 0.075, 0.142));          // most okvira

  // -------------------------------------------------------------- kljun ---
  // Dugačak, zakrivljen nadole; niz sve užih segmenata po Bezijeovoj krivoj.
  const beak = curve([0, 0.028, 0.10], [0, -0.09, 0.285], [0, 0.028, 0.075],
    wax, 0.062, 0.011, 7);
  head.add(beak);
  const beakBase = sphere(0.07, wax, 0, 0.02, 0.075, 10, 9);
  beakBase.scale.set(0.82, 0.9, 1.0);
  head.add(beakBase);
  // greben po gornjoj strani kljuna
  head.add(curve([0, 0.058, 0.10], [0, -0.062, 0.283], [0, 0.03, 0.075],
    waxDark, 0.012, 0.005, 4));
  // dve rupice na vrhu kljuna
  const nostril = M(0x14100c);
  for (const s of [-1, 1]) {
    const hole = cyl(0.0055, 0.0055, 0.02, nostril, s * 0.011, -0.083, 0.281, 6);
    hole.rotation.x = 0.9;
    head.add(hole);
  }
  head.add(torus(0.017, 0.005, waxDark, 0, -0.078, 0.272, 5, 12));   // prsten pri vrhu
  head.children[head.children.length - 1].rotation.x = 1.1;

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
  head.add(torus(0.106, 0.009, hide, 0, -0.112, 0, 6, 16));
  head.children[head.children.length - 1].rotation.x = Math.PI / 2;

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
  hat.add(torus(0.343, 0.008, coatDark, 0, -0.03, 0, 5, 24));        // ivica oboda
  hat.children[hat.children.length - 1].rotation.x = Math.PI / 2;
  hat.add(cyl(0.142, 0.142, 0.032, hide, 0, 0.03, 0, 16));           // traka
  hat.add(box(0.038, 0.038, 0.014, brass, 0, 0.03, 0.142));          // kopča trake
  hat.add(box(0.046, 0.012, 0.016, brass, 0, 0.03, 0.145));
  hat.add(rivets([-0.055, 0.048, 0.128], [0.055, 0.048, 0.128], 3, 0.0055, coatSeam));
  hat.rotation.set(0.05, 0.12, -0.03);
  head.add(hat);

  // ================================================================ RUKE ====
  // Rame → nadlaktica → lakat (zaseban zglob) → podlaktica → zglob šake.
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
    shoulder.add(box(0.014, 0.28, 0.014, coatSeam, side * 0.05, -0.15, 0));

    const elbow = group([], 0, -0.30, 0);
    elbow.rotation.set(el[0], el[1], el[2]);
    shoulder.add(elbow);
    elbow.add(sphere(0.046, coatDark, 0, 0, 0, 10, 9));               // lakat
    elbow.add(torus(0.047, 0.01, coatSeam, 0, -0.01, 0, 6, 12));
    elbow.children[elbow.children.length - 1].rotation.x = Math.PI / 2;
    // rukavica do lakta: manžetna, pa podlaktica u koži
    elbow.add(cyl(0.055, 0.048, 0.07, hide, 0, -0.045, 0, 10));
    elbow.add(torus(0.056, 0.011, hidePale, 0, -0.075, 0, 6, 14));
    elbow.children[elbow.children.length - 1].rotation.x = Math.PI / 2;
    elbow.add(cyl(0.042, 0.034, 0.22, glove, 0, -0.175, 0, 10));
    elbow.add(box(0.012, 0.2, 0.012, hidePale, side * 0.036, -0.175, 0));

    const wrist = group([], 0, -0.29, 0);
    elbow.add(wrist);
    return { shoulder, elbow, wrist };
  }

  // Desna ruka je opuštena niz telo i drži kadionicu, leva je podignuta i
  // prinosi bočicu okularima — asimetrija drži pozu živom.
  const armR = arm(-1, [-0.35, 0.10, -0.18], [-0.75, 0.14, 0]);
  const armL = arm(1, [-0.45, -0.25, 0.20], [-1.35, -0.45, 0]);

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

  const handR = makeHand({ skin: glove, pose: 'grip', side: 1, s: 1.02, cuff: hide });
  handR.rotation.set(0.18, -0.45, 0.06);
  censerHold.add(handR);
  censerHold.add(torus(0.016, 0.005, iron, 0, 0.03, 0, 5, 12));      // alka u prstima

  const censer = group([], 0, -0.02, 0);                             // pivot GORE u šaci
  censerHold.add(censer);
  censer.add(chain([0, -0.01, 0], [0, -0.33, 0], 8, 0.016, iron));    // lanac od 8 karika
  censer.add(torus(0.021, 0.006, iron, 0, -0.345, 0, 5, 12));         // sabirna alka
  const bowl = group([], 0, -0.44, 0);
  censer.add(bowl);
  // tri kratka lanca od alke do poklopca
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    censer.add(bar([0, -0.352, 0], [Math.sin(a) * 0.045, -0.415, Math.cos(a) * 0.045],
      0.005, iron));
  }
  // perforirana metalna kugla
  const ball = sphere(0.072, steel, 0, 0, 0, 14, 12);
  bowl.add(ball);
  bowl.add(torus(0.074, 0.008, brass, 0, 0, 0, 6, 18));               // pojas po ekvatoru
  bowl.children[bowl.children.length - 1].rotation.x = Math.PI / 2;
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
  bowl.add(torus(0.053, 0.007, brass, 0, 0.068, 0, 5, 14));
  bowl.children[bowl.children.length - 1].rotation.x = Math.PI / 2;
  bowl.add(bar([-0.03, 0.078, 0], [0.03, 0.078, 0], 0.005, brass));
  bowl.add(bar([0, 0.078, -0.03], [0, 0.078, 0.03], 0.005, brass));
  bowl.add(cyl(0.008, 0.012, 0.03, brass, 0, 0.094, 0, 8));
  bowl.add(sphere(0.012, brass, 0, 0.112, 0, 8, 7));
  bowl.add(cone(0.022, 0.045, steel, 0, -0.085, 0, 10));              // šiljak pod kuglom
  bowl.children[bowl.children.length - 1].rotation.x = Math.PI;
  bowl.add(sphere(0.011, brass, 0, -0.108, 0, 7, 6));
  // tri prozirne zelenkaste magle iz kadionice
  const mistMat = Ghost(C.poison, 1.0, 0.22);
  const mists = [];
  for (let i = 0; i < 3; i++) {
    const m = sphere(0.055, mistMat, 0, 0.1, 0, 9, 8);
    bowl.add(m);
    mists.push(m);
  }

  // ------------------------------------------------ BOČICA U LEVOJ ŠACI ----
  const flaskHold = group([], 0, 0, 0);
  armL.wrist.getWorldQuaternion(qTmp);
  flaskHold.quaternion.copy(qTmp.invert());
  flaskHold.rotateZ(0.22);          // okvir je poravnat sa svetom, pa je i nagib po svetskom Z
  flaskHold.rotateX(-0.14);
  armL.wrist.add(flaskHold);

  const handL = makeHand({ skin: glove, pose: 'grip', side: -1, s: 1.02, cuff: hide });
  handL.rotation.set(0.1, 0.55, -0.05);
  flaskHold.add(handL);

  const flaskGlow = Glow(C.arcane, 1.6);
  flaskHold.add(cyl(0.019, 0.022, 0.11, M(0xdfe6e4, {
    roughness: 0.18, transparent: true, opacity: 0.45,
  }), 0, -0.005, 0, 10));                                            // grlo
  const bulb = sphere(0.052, M(0xdfe6e4, {
    roughness: 0.18, transparent: true, opacity: 0.42,
  }), 0, -0.105, 0, 12, 10);
  flaskHold.add(bulb);
  flaskHold.add(sphere(0.041, flaskGlow, 0, -0.112, 0, 10, 9));       // sadržaj
  flaskHold.add(cyl(0.017, 0.02, 0.026, Hide(C.woodDark), 0, 0.062, 0, 8)); // čep
  flaskHold.add(crystal(0.014, Glow(C.goldPale, 1.2), 0, 0.086, 0));
  flaskHold.add(torus(0.023, 0.005, brass, 0, 0.046, 0, 5, 12));
  flaskHold.add(box(0.032, 0.024, 0.004, linen, 0, -0.105, 0.05));    // nalepnica na trbuhu

  // ============================================================ POKRET ====
  // Sve prijave idu POSLE zauzimanja mirne poze — svaki pokret pamti zatečenu
  // vrednost kao osnovu i osciluje oko nje.
  const anim = new Anim();

  // 1. kadionica se njiše na lancu kao klatno (glavni pokret)
  anim.rot(censer, 'z', 0.30, 1.1);
  anim.rot(censer, 'x', 0.12, 0.74, 0.9);
  anim.rot(bowl, 'y', 0.14, 0.55, 2.1);              // kugla se blago vrti u lancu
  anim.flicker(emberMat, 1.9, 0.5, 5.3, 12.7, 0.4);

  // 2. tri magle se dižu iz kadionice i vraćaju u petlju
  anim.rise(mists[0], 0.035, 3.1, 0.0, 0.06, 0.42, 1.1);
  anim.rise(mists[1], 0.045, 3.9, 0.33, 0.05, 0.46, -0.8);
  anim.rise(mists[2], 0.03, 4.7, 0.66, 0.07, 0.38, 1.6);

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
  anim.rot(armR.shoulder, 'x', 0.035, 0.62, 1.4);
  anim.rot(armL.elbow, 'x', 0.045, 0.53, 2.7);
  anim.rot(torso, 'y', 0.02, 0.29, 0.8);
  anim.blink(face.lidL, 5.1, 0.0, 0.030);
  anim.blink(face.lidR, 5.1, 0.05, 0.030);
  anim.pulse(face.irisMat, 2.0, 0.5, 1.9, 0.0);

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
