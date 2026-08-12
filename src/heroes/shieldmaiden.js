// src/heroes/shieldmaiden.js — Hilda Gvozdena Kosa, štitonoša severa
//
// Silueta: širok i čvrst stav, brada podignuta, ramena unazad. Uz nju levo
// stoji okrugao drveni štit oslonjen na tlo, u desnici je uspravno koplje
// čiji vrh prelazi iznad glave, preko levog ramena je krzneni ogrtač, a
// preko grudi padaju dve debele pletenice.
//
// Orijentacija: junakinja gleda u +Z, pa je NJENA desna strana na -X
// (koplje na -X, štit na +X).
//
// Visinski orijentiri: stopala 0, kolena 0.48, kukovi 0.88, pojas 1.00,
// grudi 1.14, ramena 1.385, brada 1.53, oči 1.66, teme 1.78, vrh koplja 2.02.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh,
  box, cyl, sphere, cone, torus, lathe, bar, group,
  curve, strap, rivets, rivetRing, chainmail, fringe, fur, edged,
  makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

export function createShieldmaiden() {
  const g = new THREE.Group();
  const anim = new Anim();

  // dodaje dete u grupu i VRAĆA dete — da mu se rotacija odmah namesti
  const put = (parent, obj) => { parent.add(obj); return obj; };

  // tačka između dve tačke sa odmakom — za kolena, kaiševe, zakivke
  const mid = (a, b, f, off = [0, 0, 0]) => [
    a[0] + (b[0] - a[0]) * f + off[0],
    a[1] + (b[1] - a[1]) * f + off[1],
    a[2] + (b[2] - a[2]) * f + off[2],
  ];

  // Lakat iz dužina kostiju (dvokosna kinematika): nadlaktica i podlaktica
  // ostaju istih dužina, a `dirRaw` samo bira na koju stranu lakat izlazi.
  function elbow(S, W, upper, fore, dirRaw) {
    const dx = W[0] - S[0], dy = W[1] - S[1], dz = W[2] - S[2];
    const c = Math.hypot(dx, dy, dz) || 1e-4;
    const ux = dx / c, uy = dy / c, uz = dz / c;
    const d = dirRaw[0] * ux + dirRaw[1] * uy + dirRaw[2] * uz;
    let px = dirRaw[0] - ux * d, py = dirRaw[1] - uy * d, pz = dirRaw[2] - uz * d;
    const pl = Math.hypot(px, py, pz) || 1e-4;
    px /= pl; py /= pl; pz /= pl;
    const t = Math.min(Math.max((upper * upper - fore * fore + c * c) / (2 * c * c), 0.08), 0.92);
    const h = Math.sqrt(Math.max(upper * upper - (t * c) * (t * c), 0.0009));
    return [S[0] + dx * t + px * h, S[1] + dy * t + py * h, S[2] + dz * t + pz * h];
  }

  // ------------------------------------------------------------ materijali --
  const skin = Flesh(C.skinPale);
  const scarMat = Flesh(0xf0d3b4);                     // ožiljak je svetliji od tena
  const freckle = M(0xb07a52, { flat: false });
  const hair = M(C.hairGrey);                          // pepeljasta „gvozdena" kosa
  const hairDark = M(0x8d8676);                        // tanji pramenovi u pletenici
  const wool = Cloth(C.indigo);
  const woolLathe = Cloth(C.indigo, { side: THREE.DoubleSide });
  const woolDark = Cloth(0x1e2a4c);
  const woolTrim = Cloth(C.ivory);
  const mailM = Metal(C.steelDark, { roughness: 0.52 });
  const iron = Metal(C.iron, { roughness: 0.5 });
  const steel = Metal(C.steel, { roughness: 0.3 });
  const silver = Metal(C.silver);
  const brass = Metal(C.brass);
  const goldPale = Metal(C.goldPale);
  const copper = Metal(C.copper);
  const leather = Hide(C.leather);
  const leatherD = Hide(C.leatherDark);
  const leatherP = Hide(C.leatherPale);
  const furM = M(C.fur, { roughness: 1 });
  const furD = M(C.furDark, { roughness: 1 });
  const furP = M(C.furPale, { roughness: 1 });
  const ash = M(C.woodPale, { roughness: 0.9 });       // jasenova motka
  const plankA = M(C.woodPale, { roughness: 0.95 });
  const plankB = M(C.wood, { roughness: 0.95 });
  const plankBurnt = M(0x2d241b, { roughness: 1 });    // pocrnela, neobojena strana
  const woodD = M(C.woodDark, { roughness: 1 });
  const paintA = Cloth(C.indigo);
  const paintB = Cloth(C.ivory);
  const boneM = M(C.bone, { flat: false });

  // ------------------------------------------------------------------ noge --
  // Širok stav: stopala razmaknuta i izvrnuta, težina na levoj nozi (x+),
  // desno koleno malo popušteno.
  const HIP_Y = 0.88;
  for (const s of [1, -1]) {
    const load = s === 1;                              // noseća noga
    const hipP = [s * 0.152, HIP_Y, 0];
    const kneeP = [s * (load ? 0.238 : 0.262), load ? 0.495 : 0.472, load ? 0.015 : 0.055];
    const ankP = [s * 0.286, 0.148, load ? 0.0 : 0.02];

    g.add(bar(hipP, kneeP, 0.09, wool, 8, 0.073));                        // butina
    g.add(sphere(0.074, wool, kneeP[0], kneeP[1], kneeP[2], 9, 8));        // koleno
    g.add(bar(kneeP, ankP, 0.07, wool, 8, 0.05));                         // list
    g.add(sphere(0.052, wool, ankP[0], ankP[1] + 0.03, ankP[2] - 0.035, 8, 7)); // Ahilova žila

    // vunene obojke — tri obruča po cevanici, namotana ukoso
    for (let i = 0; i < 3; i++) {
      const p = mid(ankP, kneeP, 0.14 + i * 0.3);
      const w = put(g, torus(0.062 - i * 0.003, 0.017, leatherP, p[0], p[1], p[2], 6, 12));
      w.rotation.x = Math.PI / 2 + 0.16;
      w.rotation.z = s * 0.1;
    }
    g.add(box(0.034, 0.055, 0.02, leatherD, s * 0.30, 0.30, 0.045));      // kraj obojka

    // čizma sa krznenim rubom
    const boot = makeBoot({ mat: leather, sole: leatherD, cuff: furM, buckle: brass, s: 1.06 });
    boot.position.set(ankP[0], 0, load ? 0.0 : 0.02);
    boot.rotation.y = s * 0.2;
    g.add(boot);
    const bf = fur(furP, 4, [0.085, 0.02, 0.085], 0.048, load ? 31 : 47);
    bf.position.set(ankP[0], 0.39, (load ? 0.0 : 0.02) - 0.03);
    bf.rotation.y = s * 0.2;
    g.add(bf);
  }

  // ---------------------------------------------------------------- kukovi --
  g.add(box(0.30, 0.18, 0.215, wool, 0, HIP_Y + 0.03, 0));
  for (const s of [-1, 1]) g.add(sphere(0.102, wool, s * 0.138, HIP_Y + 0.01, 0, 9, 8));

  // vunena tunika do pola butine — telo obrtanja sa resastim rubom
  const skirt = lathe([[0.256, 0], [0.244, 0.10], [0.226, 0.22], [0.208, 0.335]], woolLathe, 16);
  skirt.position.y = 0.665;
  g.add(skirt);
  const hem = fringe(0.252, 9, woolDark, 0.08, 0, 1, 0.5);
  hem.position.y = 0.668;
  g.add(hem);
  put(g, torus(0.252, 0.014, woolTrim, 0, 0.684, 0, 6, 20)).rotation.x = Math.PI / 2;
  for (let i = 0; i < 6; i++) {                        // opšiv u dve boje uz rub
    const a = (i / 6) * Math.PI * 2 + 0.2;
    put(g, box(0.05, 0.035, 0.018, woolTrim, Math.sin(a) * 0.248, 0.742, Math.cos(a) * 0.248))
      .rotation.y = a;
  }

  // ----------------------------------------------------------------- trup ---
  // Grudni koš je u svojoj grupi da bi mogao da diše zajedno sa verižnjačom.
  const chest = group([], 0, 1.14, 0);
  chest.rotation.z = 0.022;                            // ramena blago ukoso
  chest.rotation.y = 0.035;                            // sitan uvrt trupa
  g.add(chest);

  const core = cyl(0.19, 0.166, 0.42, wool, 0, 0, 0, 12);
  core.scale.z = 0.82;
  chest.add(core);
  const bellyM = cyl(0.168, 0.178, 0.12, wool, 0, -0.245, 0, 12);
  bellyM.scale.z = 0.82;
  chest.add(bellyM);
  for (const s of [-1, 1]) {                           // grudi pod tunikom
    const b = sphere(0.079, wool, s * 0.076, 0.055, 0.106, 9, 8);
    b.scale.set(1, 0.92, 0.72);
    chest.add(b);
  }
  for (const s of [-1, 1]) {                           // ključne kosti i trapezi
    chest.add(bar([s * 0.018, 0.245, 0.07], [s * 0.152, 0.25, 0.034], 0.019, skin, 7));
    chest.add(sphere(0.072, wool, s * 0.098, 0.243, -0.032, 8, 7));
  }
  chest.add(sphere(0.03, skin, 0, 0.243, 0.072, 8, 7));                   // jamica na vratu

  // verižnjača preko tunike — četiri reda karika, širi se ka ramenima
  chest.add(chainmail(0.196, 4, 9, mailM, -0.095, 0.058, 0.80, -0.006));
  put(chest, torus(0.106, 0.015, mailM, 0, 0.252, -0.01, 6, 18)).rotation.x = Math.PI / 2;
  put(chest, torus(0.108, 0.016, iron, 0, 0.23, -0.012, 6, 16)).rotation.x = Math.PI / 2;

  // kožni steznik: dve prednje ploče sa unakrsnim vezicama u sredini
  for (const s of [-1, 1]) {
    const panel = edged(0.115, 0.30, 0.032, leather, leatherD, s * 0.083, 0.005, 0.163, 0.018);
    panel.rotation.y = -s * 0.16;
    chest.add(panel);
  }
  chest.add(box(0.26, 0.28, 0.03, leather, 0, 0.005, -0.168));            // zadnja ploča
  for (const s of [-1, 1]) {                           // bočne spone steznika
    chest.add(bar([s * 0.147, 0.02, 0.125], [s * 0.157, 0.01, -0.13], 0.024, leatherD, 6));
  }
  const lace = [];                                     // cik-cak vezica i rupice
  for (let i = 0; i < 6; i++) {
    const y = -0.13 + i * 0.05;
    lace.push([(i % 2 ? 0.042 : -0.042), y, 0.184]);
    chest.add(sphere(0.008, brass, (i % 2 ? 0.045 : -0.045), y, 0.185, 6, 5));
  }
  chest.add(strap(lace, 0.008, leatherP, 5));
  chest.add(box(0.02, 0.045, 0.014, leatherP, -0.048, -0.162, 0.188));
  chest.add(box(0.02, 0.05, 0.014, leatherP, 0.05, -0.156, 0.188));

  // ---------------------------------------------------------------- pojas ---
  const belt = cyl(0.226, 0.232, 0.088, leather, 0, 0.995, 0, 16);
  belt.scale.z = 0.80;
  g.add(belt);
  g.add(rivetRing(0.231, 10, 0.013, brass, 0.995, 0.80, 0.2));
  const buck = group([], 0, 0.995, 0.192);             // velika kopča
  buck.add(box(0.105, 0.086, 0.014, brass));
  buck.add(box(0.126, 0.018, 0.02, brass, 0, 0.048, 0.004));
  buck.add(box(0.126, 0.018, 0.02, brass, 0, -0.048, 0.004));
  buck.add(box(0.018, 0.112, 0.02, brass, 0.055, 0, 0.004));
  buck.add(box(0.018, 0.112, 0.02, brass, -0.055, 0, 0.004));
  buck.add(box(0.014, 0.062, 0.026, goldPale, 0, 0, 0.016));              // trn kopče
  buck.add(sphere(0.016, brass, 0, 0, 0.03, 8, 7));
  g.add(buck);
  put(g, box(0.056, 0.15, 0.022, leatherD, 0.078, 0.905, 0.176)).rotation.z = 0.12;
  g.add(box(0.05, 0.03, 0.026, brass, 0.083, 0.828, 0.176));              // okov na kraju pojasa

  // ------------------------------------------------------- seaks o pojasu ---
  const shA = [-0.238, 0.972, 0.098];
  const shB = [-0.322, 0.775, 0.052];
  g.add(bar(shA, shB, 0.034, leather, 7, 0.026));                         // korice
  put(g, cone(0.026, 0.05, iron, shB[0] - 0.012, shB[1] - 0.03, shB[2] - 0.006, 7))
    .rotation.z = -0.4;
  g.add(rivets(mid(shA, shB, 0.15), mid(shA, shB, 0.9), 4, 0.009, brass));
  put(g, torus(0.036, 0.009, leatherD, shA[0], shA[1] - 0.012, shA[2], 6, 12)).rotation.x = 1.2;
  const gripA = [-0.214, 1.05, 0.126];
  g.add(bar(shA, gripA, 0.024, boneM, 7, 0.02));                          // drška od kosti
  g.add(box(0.05, 0.016, 0.03, iron, shA[0] + 0.004, shA[1] + 0.022, shA[2] + 0.006));
  g.add(sphere(0.019, iron, gripA[0], gripA[1] + 0.008, gripA[2], 8, 7));
  for (let i = 0; i < 2; i++) {
    put(g, torus(0.023, 0.006, leatherD, -0.226 + i * 0.008, 1.0 + i * 0.026, 0.108 + i * 0.008, 6, 10))
      .rotation.x = 1.3;
  }
  g.add(bar([-0.22, 1.0, 0.128], [-0.245, 0.955, 0.09], 0.009, leatherD, 6));
  g.add(bar([-0.27, 0.985, 0.02], [-0.29, 0.9, 0.055], 0.009, leatherD, 6));

  // ------------------------------------------------ amajlija od kosti -------
  const amu = group([], 0, 1.44, 0.045);
  amu.add(strap([[-0.072, 0, -0.03], [-0.045, -0.06, 0.07], [0, -0.105, 0.14]], 0.006, leatherD, 5));
  amu.add(strap([[0.072, 0, -0.03], [0.045, -0.06, 0.07], [0, -0.105, 0.14]], 0.006, leatherD, 5));
  amu.add(sphere(0.011, boneM, 0, -0.108, 0.143, 7, 6));
  const tal = box(0.034, 0.058, 0.011, boneM, 0, -0.148, 0.15);
  tal.rotation.z = 0.12;
  amu.add(tal);
  amu.add(box(0.02, 0.006, 0.006, woodD, 0, -0.138, 0.157));              // urezana runa
  amu.add(box(0.006, 0.03, 0.006, woodD, 0, -0.155, 0.157));
  amu.add(sphere(0.008, brass, -0.03, -0.078, 0.105, 6, 5));
  g.add(amu);

  // ----------------------------------------------------------------- vrat ---
  g.add(cyl(0.053, 0.062, 0.14, skin, 0, 1.452, -0.004, 10));
  g.add(sphere(0.036, skin, 0, 1.402, 0.03, 8, 7));                       // grlo
  for (const s of [-1, 1]) g.add(bar([s * 0.03, 1.512, -0.02], [s * 0.075, 1.40, -0.032], 0.016, skin, 6));

  // ---------------------------------------------------------------- glava ---
  const head = group([], 0, 1.512, 0);
  head.rotation.x = -0.09;                             // brada podignuta
  g.add(head);

  const face = makeFace({
    skin, r: 0.113, tall: 1.04, wide: 1.0, deep: 0.96,
    eye: 0x8fc3d6, eyeSize: 0.0195, brow: 0x958c79, browAngle: 0.24,
    mouth: 'line', mouthColor: 0x8b4a45, noseLen: 0.036, noseWide: 0.8,
  });
  face.group.position.set(0, 0.129, 0.012);
  head.add(face.group);
  const hd = face.group;                               // dalje je sve u ravni lobanje

  // odlučan izraz: uska, čvrsto stisnuta usta i krupnije zenice
  face.mouth.scale.set(0.86, 1, 1);
  face.mouth.rotation.x = 0.1;
  face.mouth.rotation.z = -0.03;
  face.irisL.scale.setScalar(1.1);
  face.irisR.scale.setScalar(1.1);

  // pegice preko nosa i jagodica
  for (const [x, y, z] of [
    [0, 0.002, 0.106], [-0.021, 0.007, 0.102], [0.023, 0.004, 0.101],
    [-0.042, -0.014, 0.094], [0.045, -0.012, 0.093], [0.03, -0.026, 0.095],
  ]) hd.add(sphere(0.0055, freckle, x, y, z, 6, 5));

  // ožiljak preko brade
  const sc1 = box(0.011, 0.072, 0.012, scarMat, 0.026, -0.078, 0.081);
  sc1.rotation.set(-0.35, 0, 0.55);
  hd.add(sc1);
  const sc2 = box(0.009, 0.03, 0.011, scarMat, 0.048, -0.052, 0.067);
  sc2.rotation.set(-0.3, 0, 0.5);
  hd.add(sc2);

  // kosa: zadnja masa, kapa preko lobanje, punđa i pramenovi uz uši
  const backHair = sphere(0.118, hair, 0, 0.018, -0.05, 12, 10);
  backHair.scale.set(1.04, 1.02, 0.98);
  hd.add(backHair);
  const cap = sphere(0.113, hair, 0, 0.046, -0.032, 12, 10);   // kapa je povučena
  cap.scale.set(1.04, 0.8, 0.94);                              // nazad, da čelo i
  cap.rotation.x = -0.1;                                       // obrve ostanu vidljivi
  hd.add(cap);
  hd.add(sphere(0.072, hair, 0, -0.014, -0.11, 9, 8));
  for (const s of [-1, 1]) {
    const sd = box(0.028, 0.12, 0.05, hair, s * 0.103, -0.03, 0.028);
    sd.rotation.z = -s * 0.1;
    hd.add(sd);
  }
  for (let i = 0; i < 3; i++) {                        // sitne pletenice uz čelo
    const x = -0.05 + i * 0.05;
    hd.add(curve([x, 0.062, 0.085], [x * 1.5, 0.03, -0.1], [x * 0.2, 0.078, 0], hairDark, 0.014, 0.011, 2));
  }
  put(hd, box(0.145, 0.014, 0.022, leatherD, 0, 0.112, 0.042)).rotation.x = 0.32; // vrpca

  // ------------------------------------------------------------ pletenice ---
  // Svaka je niz ugnežđenih grupa, pa talas može da putuje kroz nju umesto
  // da se klati kao jedan komad.
  function makeBraid(side, tilt) {
    const root = new THREE.Group();
    root.position.set(side * 0.1, 0.038, -0.004);
    root.rotation.z = side * 0.05;                     // blago se razmiče od vrata
    root.rotation.x = -tilt;                           // pada NAPRED, preko grudi
    const segs = [];
    let parent = root;
    const N = 10;                                      // deset čvorova koji se smanjuju
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? -0.03 : -0.055, i === 0 ? 0.004 : 0.006);
      seg.rotation.x = -0.035;                         // svija se preko grudi
      seg.rotation.z = side * 0.002;
      const r = 0.05 - 0.026 * t;
      const k = sphere(r, hair, 0, -0.016, 0, 9, 8);
      k.scale.set(1.02, 0.92, 0.94);
      k.rotation.y = i * 0.8;
      seg.add(k);
      if (i % 2 === 0) {                              // tanji pramen preko svakog drugog čvora
        const strand = box(r * 2.2, r * 0.46, r * 1.75, hairDark, 0, -0.016, 0.004);
        strand.rotation.z = (i % 4 ? 0.6 : -0.6);
        strand.rotation.y = i * 0.4;
        seg.add(strand);
      }
      parent.add(seg);
      parent = seg;
      segs.push(seg);
    }
    // kožna vrpca i sitan metalni prsten na kraju
    put(parent, torus(0.021, 0.009, leatherD, 0, -0.054, 0, 6, 12)).rotation.x = Math.PI / 2;
    put(parent, torus(0.017, 0.006, steel, 0, -0.078, 0, 6, 12)).rotation.x = Math.PI / 2;
    put(parent, cone(0.017, 0.05, hair, 0, -0.108, 0, 7)).rotation.x = Math.PI;
    return { root, segs };
  }
  const braidL = makeBraid(1, 0.1);
  const braidR = makeBraid(-1, 0.13);
  hd.add(braidL.root);
  hd.add(braidR.root);

  // --------------------------------------------------------------- koplje ---
  // Jasenova motka, dugačak listoliki vrh, kožni omot na hvatu.
  const spear = group([], -0.345, 0, 0.1);
  spear.rotation.set(-0.02, 0, 0.03);
  g.add(spear);
  const GRIP = 1.03;

  spear.add(cyl(0.022, 0.025, 1.66, ash, 0, 0.87, 0, 9));                 // motka
  spear.add(cyl(0.028, 0.026, 0.09, iron, 0, 0.075, 0, 8));               // okov na dnu
  spear.add(cyl(0.02, 0.009, 0.05, iron, 0, 0.02, 0, 7));
  put(spear, torus(0.028, 0.006, iron, 0, 0.125, 0, 6, 12)).rotation.x = Math.PI / 2;
  spear.add(cyl(0.027, 0.027, 0.2, leatherD, 0, GRIP, 0, 9));             // kožni omot
  for (let i = 0; i < 4; i++) {
    put(spear, torus(0.029, 0.0075, leather, 0, GRIP - 0.075 + i * 0.05, 0, 6, 12))
      .rotation.x = Math.PI / 2 + 0.12;
  }
  spear.add(box(0.014, 0.03, 0.012, leatherP, 0.026, GRIP - 0.112, 0.006));
  spear.add(cyl(0.031, 0.027, 0.11, iron, 0, 1.655, 0, 9));               // okov pod vrhom
  for (const s of [-1, 1]) {
    spear.add(box(0.009, 0.17, 0.022, iron, s * 0.024, 1.53, 0));         // jezici uz motku
    spear.add(sphere(0.008, steel, s * 0.026, 1.468, 0, 6, 5));
  }
  put(spear, torus(0.032, 0.007, steel, 0, 1.712, 0, 6, 12)).rotation.x = Math.PI / 2;
  const bl1 = cone(0.058, 0.11, steel, 0, 1.772, 0, 4);                   // list se širi iz okova
  bl1.rotation.set(Math.PI, Math.PI / 4, 0);
  bl1.scale.z = 0.3;
  spear.add(bl1);
  const bl2 = cone(0.058, 0.3, steel, 0, 1.872, 0, 4);                    // sečivo do vrha
  bl2.rotation.y = Math.PI / 4;
  bl2.scale.z = 0.3;
  spear.add(bl2);
  spear.add(box(0.015, 0.36, 0.026, silver, 0, 1.852, 0));                // rebro sečiva
  spear.add(box(0.05, 0.02, 0.026, steel, 0, 1.745, 0));

  // kožna resica sa dva pera ispod vrha
  const tassel = group([], 0, 1.6, 0);
  spear.add(tassel);
  put(tassel, torus(0.03, 0.008, leatherD, 0, 0, 0, 6, 12)).rotation.x = Math.PI / 2;
  tassel.add(bar([0, 0, 0.02], [0.03, -0.06, 0.05], 0.007, leatherD, 6));
  tassel.add(bar([0, 0, -0.02], [-0.02, -0.07, -0.04], 0.007, leatherD, 6));
  for (const [col, s, dz] of [[C.ivory, 1, 0.02], [C.charcoal, -1, -0.03]]) {
    const fm = M(col, { roughness: 0.95 });
    const fg = group([], s * 0.03, -0.055, dz);
    tassel.add(fg);
    fg.add(curve([0, 0, 0], [s * 0.035, -0.19, 0.02], [s * 0.02, -0.05, 0.03], fm, 0.01, 0.004, 2));
    for (let i = 0; i < 2; i++) {
      const v = box(0.028, 0.075, 0.008, fm, s * (0.012 + i * 0.012), -0.06 - i * 0.06, 0.012 + i * 0.008);
      v.rotation.z = -s * 0.2;
      fg.add(v);
    }
  }

  // desna šaka obuhvata motku — osa drške je Y osa šake
  const handR = makeHand({ pose: 'grip', side: 1, skin, s: 1.02 });
  handR.position.set(0, GRIP, 0);
  spear.add(handR);

  // ----------------------------------------------------------------- štit ---
  // Okrugao drveni štit oslonjen na tlo levo od nje, blago iza njene noge.
  const SH_R = 0.4;
  const shield = group([], 0.42, 0.455, -0.15);
  shield.rotation.set(0.05, 0.22, -0.12);
  g.add(shield);

  const backDisc = cyl(SH_R - 0.008, SH_R - 0.008, 0.026, plankB, 0, 0, 0, 22);
  backDisc.rotation.x = Math.PI / 2;
  shield.add(backDisc);
  // osam vidljivih dasaka; tri spoljne su neobojene i pocrnele od vatre
  for (let i = 0; i < 8; i++) {
    const x = -0.35 + i * 0.1;
    const xo = Math.abs(x) + 0.045;
    const h = 2 * Math.sqrt(Math.max(SH_R * SH_R - xo * xo, 0.0028));
    const mat = i >= 5 ? plankBurnt : (i % 2 ? plankA : plankB);
    shield.add(box(0.1, h, 0.022, mat, x, 0, 0.026));
    if (i < 7) {                                       // fuga između dasaka
      const x2 = x + 0.05;
      const xo2 = Math.abs(x2) + 0.04;
      const h2 = 2 * Math.sqrt(Math.max(SH_R * SH_R - xo2 * xo2, 0.0028));
      shield.add(box(0.008, h2, 0.026, woodD, x2, 0, 0.03));
    }
  }
  // oslikana strana: severnjački klinovi u dve boje, samo po neizgoreloj polovini
  const wedges = [0.5, 1.16, 1.82, 2.48, 3.14];
  for (let i = 0; i < wedges.length; i++) {
    const wg = group([]);
    wg.rotation.z = wedges[i];
    const w = cone(0.07, 0.2, i % 2 ? paintB : paintA, 0, 0.22, 0.042, 3);
    w.scale.z = 0.22;
    wg.add(w);
    shield.add(wg);
  }
  for (let i = 0; i < 5; i++) {                        // isprekidan oslikan luk oko umba
    const a = 0.5 + i * 0.56;
    put(shield, box(0.05, 0.022, 0.012, paintB, Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.042))
      .rotation.z = -a;
  }
  const boss = sphere(0.086, iron, 0, 0, 0.046, 12, 10);                  // gvozdeni umbo
  boss.scale.z = 0.85;
  shield.add(boss);
  const flange = cyl(0.112, 0.112, 0.012, iron, 0, 0, 0.036, 14);
  flange.rotation.x = Math.PI / 2;
  shield.add(flange);
  const bossRiv = group([rivetRing(0.098, 5, 0.013, steel, 0.044, 1, 0.3)]);
  bossRiv.rotation.x = Math.PI / 2;                    // prsten zakivaka u ravan lica
  shield.add(bossRiv);
  shield.add(sphere(0.022, steel, 0, 0, 0.132, 8, 7));
  shield.add(torus(SH_R, 0.021, iron, 0, 0, 0.014, 6, 30));               // gvozdeni obruč
  const rimRiv = group([rivetRing(SH_R - 0.014, 10, 0.015, steel, 0.038, 1, 0.11)]);
  rimRiv.rotation.x = Math.PI / 2;
  shield.add(rimRiv);
  for (const [x, y, rz] of [[-0.16, 0.1, 0.5], [-0.05, -0.19, -0.7]]) {
    put(shield, box(0.006, 0.11, 0.01, woodD, x, y, 0.041)).rotation.z = rz;  // zaseci
  }
  shield.add(box(0.33, 0.045, 0.022, woodD, 0, 0, -0.026));               // prečka za hvat
  put(shield, cyl(0.03, 0.03, 0.12, leatherD, 0, 0, -0.04, 8)).rotation.z = Math.PI / 2;

  // mesto na obruču gde ga ona drži: kožni omot i tanka vezica
  const GA = 0.38;                                     // ugao hvata od gornje točke
  const gx = -SH_R * Math.sin(GA), gy = SH_R * Math.cos(GA);
  const rimWrap = cyl(0.03, 0.03, 0.1, leatherD, gx, gy, 0, 8);
  rimWrap.rotation.z = Math.PI / 2 + GA;
  shield.add(rimWrap);
  put(shield, torus(0.032, 0.007, leatherP, gx, gy, 0, 6, 10)).rotation.y = Math.PI / 2;

  // resice provučene kroz zakivke umba
  const shTassels = [];
  for (let i = 0; i < 2; i++) {
    const tg = group([], -0.04 + i * 0.075, -0.088, 0.058);
    shield.add(tg);
    tg.add(bar([0, 0, 0], [0.006, -0.11, 0.004], 0.008, leatherD, 6));
    tg.add(bar([0.006, -0.11, 0.004], [0.014, -0.21, 0.012], 0.007, leather, 6));
    tg.add(sphere(0.012, brass, 0.01, -0.152, 0.008, 6, 5));
    shTassels.push(tg);
  }

  // leva šaka drži gvozdeni obruč štita (Y osa šake ide duž obruča)
  const handL = makeHand({ pose: 'grip', side: -1, skin, cuff: leatherD, s: 1.02 });
  handL.position.set(gx, gy, 0);
  handL.rotation.z = Math.PI / 2 + GA;
  shield.add(handL);

  // ----------------------------------------------------------------- ruke ---
  // Zglobovi se čitaju iz matrica oružja, da šake i podlaktice ostanu spojene.
  shield.updateMatrix();
  spear.updateMatrix();
  const wl = new THREE.Vector3(gx - 0.087, gy - 0.023, -0.05).applyMatrix4(shield.matrix);
  const wr = new THREE.Vector3(0, GRIP - 0.03, -0.075).applyMatrix4(spear.matrix);

  function buildArm(side, W, dir) {
    const S = [side * 0.185, 1.385, -0.018];
    const E = elbow(S, W, 0.29, 0.285, dir);
    g.add(sphere(0.09, mailM, S[0], S[1], S[2] - 0.006, 10, 9));           // veriški naramak
    g.add(bar(S, E, 0.072, wool, 8, 0.056));                               // nadlaktica
    g.add(bar(S, mid(S, E, 0.6), 0.079, mailM, 9, 0.072));                 // kratak veriški rukav
    g.add(sphere(0.058, skin, E[0], E[1], E[2], 9, 8));                    // lakat
    g.add(bar(E, W, 0.05, skin, 8, 0.04));                                 // podlaktica
    // kožna narukvica sa zakivcima u dva reda
    const bA = mid(E, W, 0.22), bB = mid(E, W, 0.94);
    g.add(bar(bA, bB, 0.056, leather, 9, 0.05));
    g.add(rivets(mid(bA, bB, 0.15, [side * 0.05, 0, 0.02]), mid(bA, bB, 0.85, [side * 0.05, 0, 0.02]),
      3, 0.01, brass));
    g.add(rivets(mid(bA, bB, 0.2, [-side * 0.02, 0, -0.05]), mid(bA, bB, 0.8, [-side * 0.02, 0, -0.05]),
      2, 0.009, brass));
    g.add(bar(mid(bA, bB, 0.42), mid(bA, bB, 0.48), 0.058, leatherD, 8));
  }
  buildArm(1, [wl.x, wl.y, wl.z], [0.85, -0.1, -0.5]);
  buildArm(-1, [wr.x, wr.y, wr.z], [-0.6, -0.15, -0.78]);

  // ------------------------------------------------------- krzneni ogrtač ---
  // Preko levog ramena, prikopčan velikom okruglom kopčom.
  const cloak = group([], 0.09, 1.44, -0.06);
  cloak.rotation.z = -0.06;
  g.add(cloak);
  const sh1 = sphere(0.13, furM, 0.075, -0.01, 0.035, 10, 9);
  sh1.scale.set(1.1, 0.72, 0.95);
  cloak.add(sh1);
  const sh2 = sphere(0.115, furD, -0.02, -0.02, -0.05, 10, 9);
  sh2.scale.set(1.2, 0.7, 0.9);
  cloak.add(sh2);
  const cf1 = fur(furP, 4, [0.17, 0.035, 0.07], 0.06, 5);
  cf1.position.y = 0.02;
  cloak.add(cf1);
  const cf2 = fur(furD, 3, [0.15, 0.03, 0.06], 0.055, 91);
  cf2.position.y = -0.06;
  cloak.add(cf2);

  // panelima visi niz leđa; svaki je zglobna grupa da talas može da putuje
  const cloakPanels = [];
  for (const [x, len, tilt, roll] of [
    [-0.13, 0.62, 0.16, -0.06], [-0.055, 0.72, 0.13, -0.03],
    [0.02, 0.8, 0.11, 0.0], [0.095, 0.76, 0.12, 0.02],
    [0.17, 0.66, 0.15, 0.05], [0.225, 0.52, 0.18, 0.08],
  ]) {
    const p = group([], x, -0.05, -0.012);
    p.rotation.x = tilt;
    p.rotation.z = roll;
    p.add(box(0.11, len, 0.05, furM, 0, -len / 2, 0));
    p.add(box(0.115, 0.045, 0.055, furD, 0, -len + 0.02, 0.004));         // rub panela
    if (roll <= 0) {                                   // krzno na svakom drugom panelu
      const pf = fur(furP, 2, [0.05, 0.02, 0.025], 0.042, 13 + Math.round(x * 100) * 7);
      pf.position.y = -len + 0.01;
      p.add(pf);
    }
    cloak.add(p);
    cloakPanels.push(p);
  }

  // velika okrugla kopča sa urezanim šarama
  const brooch = group([], 0.2, 1.4, 0.055);
  brooch.rotation.set(-0.12, 0.62, 0);
  g.add(brooch);
  put(brooch, cyl(0.058, 0.058, 0.014, brass, 0, 0, 0, 16)).rotation.x = Math.PI / 2;
  brooch.add(torus(0.058, 0.011, goldPale, 0, 0, 0.008, 6, 18));
  brooch.add(sphere(0.02, goldPale, 0, 0, 0.017, 8, 7));
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + 0.4;
    put(brooch, box(0.011, 0.05, 0.008, copper, Math.sin(a) * 0.028, Math.cos(a) * 0.028, 0.014))
      .rotation.z = -a;
  }
  const brRiv = group([rivetRing(0.044, 5, 0.008, goldPale, 0.012, 1, 0.2)]);
  brRiv.rotation.x = Math.PI / 2;
  brooch.add(brRiv);
  put(brooch, box(0.006, 0.09, 0.006, iron, 0, -0.01, -0.012)).rotation.z = 0.4;

  // ------------------------------------------------------------- animacija --
  // Šest nezavisnih pokreta, svaki svoje brzine i faze. Mirna poza je već
  // zauzeta, pa svaki pokret pamti zatečenu vrednost kao osnovu.
  anim.breathe(chest, 0.013, 1.02, 0.4);                                   // disanje i širenje grudi
  anim.rot(chest, 'y', 0.012, 0.51, 1.3);

  anim.wave(braidL.segs, 'z', 0.02, 0.92, 0.42, 0.0);                      // leva pletenica
  anim.wave(braidL.segs, 'x', 0.012, 0.61, 0.3, 1.9);
  anim.wave(braidR.segs, 'z', 0.018, 1.27, -0.36, 2.4);                    // desna, svojim ritmom
  anim.wave(braidR.segs, 'x', 0.011, 0.83, 0.26, 0.7);

  anim.wave(cloakPanels, 'x', 0.05, 0.58, 0.52, 0.2);                      // krzno talasa
  anim.wave(cloakPanels, 'z', 0.032, 0.87, -0.44, 1.6);

  anim.rot(spear, 'z', 0.011, 0.4, 0.9);                                   // koplje se jedva naginje
  anim.rot(spear, 'x', 0.008, 0.29, 2.3);
  anim.rot(tassel, 'x', 0.07, 1.85, 0.3);
  anim.rot(tassel, 'z', 0.05, 1.31, 1.1);

  anim.scan(head, 0.13, 11, 2.0);                                          // ponosan okret glave
  anim.rot(head, 'x', 0.016, 0.63, 1.1);
  anim.rot(head, 'z', 0.011, 0.44, 0.2);

  anim.wave(shTassels, 'z', 0.06, 1.34, 0.68, 0.5);                        // resice na štitu
  anim.wave(shTassels, 'x', 0.045, 0.97, -0.5, 2.1);

  anim.blink(face.lidL, 4.6, 0.0, 0.03);
  anim.blink(face.lidR, 4.6, 0.06, 0.03);
  anim.rot(face.browL, 'z', 0.035, 0.33, 0.4);
  anim.rot(face.browR, 'z', 0.035, 0.33, 3.5);
  anim.rot(amu, 'x', 0.04, 1.12, 0.8);

  return {
    name: 'Hilda Gvozdena Kosa',
    title: 'Štitonoša severa',
    blurb: 'Njena kuća je izgorela dok je bila devojčica, a ona je iz pepela izvukla očev štit i nikada ga nije spustila. Kaže da drvo pamti vatru bolje od ljudi — zato ga i dalje nosi neobojenog sa te strane.',
    heraldry: { color: C.indigo, sigil: 'spear' },
    eyeY: 1.66,
    group: g,
    update: (t) => anim.tick(t),
  };
}
