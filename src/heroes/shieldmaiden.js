// src/heroes/shieldmaiden.js — Hilda Gvozdena Kosa, štitonoša severa
//
// Silueta: širok i čvrst stav, brada podignuta, ramena unazad. Uz nju levo
// stoji okrugao drveni štit oslonjen obručem na tlo, u desnici je uspravno
// koplje zabodeno pored stopala, preko levog ramena je krzneni ogrtač, a dve
// pletenice padaju preko ramena i staju na gornju ivicu steznika.
//
// Orijentacija: junakinja gleda u +Z, pa je NJENA desna strana na -X
// (koplje na -X, štit na +X).
//
// Visinski orijentiri: stopala 0, kolena 0.48, kukovi 0.88, pojas 1.00,
// grudi 1.14, ramena 1.385, brada 1.53, oči 1.66, teme 1.78, vrh koplja 2.02.
//
// PRAVILA RASPOREDA kojih se držati pri svakoj izmeni:
//  - pletenica pada uz telo sa nagibom ~0.34 rad i ne sme da uđe u steznik
//    (prednja ravan ploča je na z ≈ 0.19) ni u krzno na ramenu
//  - motka koplja stoji van otiska desne čizme (x ≈ -0.47), dnom na tlu
//  - štit je okrenut za -0.26 po Y: unutrašnja ivica beži IZA cevanice, pa
//    zato paneli ogrtača na toj strani moraju biti kraći
//  - vrh koplja (svet y ≈ 2.36) ostaje ispod donjeg ruba barjaka (2.43)

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
  // Dvorana je noćna i osvetljena žeravnicima, pa su svi tonovi utišani: ništa
  // ne sme da bude belo, inače se čita kao svetleća krpica.
  const skin = Flesh(0xd3ab88, { roughness: 0.88 });   // mat ten, bez voštanog sjaja
  const scarMat = Flesh(0xdcb193, { roughness: 0.9 }); // ožiljak samo malo svetliji
  const freckle = M(0xa9754e, { flat: false });
  const hair = M(0x998f80);                            // pepeljasta „gvozdena" kosa
  const hairDark = M(0x6e6659);                        // tanji pramenovi u pletenici
  const browM = M(0x7d7466);                           // obrve i čuperci nad njima
  const wool = Cloth(C.indigo);
  const woolLathe = Cloth(C.indigo, { side: THREE.DoubleSide });
  const woolDark = Cloth(0x1e2a4c);
  const woolTrim = Cloth(0xb3ad9a);                    // ugašen kostreti opšiv
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
  const furP = M(0x8a7f6e, { roughness: 1 });          // svetliji čuperci, ali ne beli
  const ash = M(0x87613a, { roughness: 0.9 });         // jasenova motka
  const plankA = M(0x936a3d, { roughness: 0.95 });     // svetlija daska štita
  const plankB = M(C.wood, { roughness: 0.95 });
  const plankBurnt = M(0x342a20, { roughness: 1 });    // pocrnela, neobojena strana
  const soot = M(0x1e1915, { roughness: 1 });          // garež na granici izgorelog
  const woodD = M(C.woodDark, { roughness: 1 });
  const paintA = Cloth(C.indigo);
  const paintB = Cloth(0xc2bba6);
  const boneM = M(0xc7bc9c, { flat: false });

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
  for (let i = 0; i < 6; i++) {
    // vezene zakrpe UTONULE u tkaninu (poluprečnik manji od poluprečnika suknje),
    // da ne stoje kao pločice zalepljene u vazduhu
    const a = (i / 6) * Math.PI * 2 + 0.2;
    const rr = 0.236;
    put(g, box(0.052, 0.036, 0.028, woolTrim, Math.sin(a) * rr, 0.742, Math.cos(a) * rr))
      .rotation.y = a;
    put(g, box(0.03, 0.008, 0.024, woolDark,                   // bod preko zakrpe
      Math.sin(a) * (rr + 0.006), 0.742, Math.cos(a) * (rr + 0.006))).rotation.y = a;
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
  // Gornji deo grudi je jedna mesnata masa iz koje raste vrat — bez nje vrat
  // izgleda kao cev nasađena na tuniku.
  const yoke = sphere(0.09, skin, 0, 0.238, 0.045, 12, 10);
  yoke.scale.set(1.45, 0.46, 0.82);
  chest.add(yoke);
  for (const s of [-1, 1]) {                           // ključne kosti i trapezi
    chest.add(bar([s * 0.018, 0.247, 0.078], [s * 0.128, 0.252, 0.042], 0.017, skin, 7));
    chest.add(sphere(0.072, wool, s * 0.098, 0.243, -0.032, 8, 7));
    chest.add(sphere(0.03, skin, s * 0.132, 0.238, 0.026, 8, 7));         // rame ključne kosti
  }
  chest.add(sphere(0.03, skin, 0, 0.243, 0.078, 8, 7));                   // jamica na vratu
  // izrez tunike: dvobojni opšiv koji zatvara prelaz kože i vune
  put(chest, torus(0.128, 0.017, woolDark, 0, 0.216, 0.012, 6, 20)).rotation.x = Math.PI / 2 - 0.16;
  put(chest, torus(0.132, 0.008, woolTrim, 0, 0.204, 0.012, 6, 20)).rotation.x = Math.PI / 2 - 0.16;

  // verižnjača preko tunike — četiri reda karika, širi se ka ramenima
  chest.add(chainmail(0.196, 4, 9, mailM, -0.095, 0.058, 0.80, -0.006));
  // torkves oko vrata stoji IZNAD mesa gornjih grudi, da ga jaram ne proguta
  put(chest, torus(0.079, 0.013, mailM, 0, 0.302, 0.004, 6, 18)).rotation.x = Math.PI / 2 + 0.07;
  put(chest, torus(0.085, 0.011, iron, 0, 0.282, 0.004, 6, 16)).rotation.x = Math.PI / 2 + 0.07;
  for (let i = 0; i < 3; i++) {                        // tri zrna na torkvesu
    const a = 0.5 + i * 0.55;
    chest.add(sphere(0.014, brass, Math.sin(a) * 0.079, 0.296, Math.cos(a) * 0.079 + 0.004, 7, 6));
  }

  // kožni steznik: dve prednje ploče sa unakrsnim vezicama u sredini
  for (const s of [-1, 1]) {
    const panel = edged(0.115, 0.30, 0.032, leather, leatherD, s * 0.083, 0.005, 0.163, 0.018);
    panel.rotation.y = -s * 0.16;
    chest.add(panel);
  }
  // zadnja ploča sa opšivom po ivicama (gola kutija se čita kao daska)
  chest.add(edged(0.26, 0.28, 0.03, leather, leatherD, 0, 0.005, -0.168, 0.018));
  for (let i = 0; i < 3; i++) {                        // šavovi po zadnjoj ploči
    chest.add(box(0.2, 0.012, 0.034, leatherD, 0, -0.09 + i * 0.09, -0.169));
  }
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
  const amu = group([], 0, 1.44, 0.054);
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
    // beonjača i dužica utišane: bela beonjača u polumraku svetli kao staklo
    eyeWhiteMat: M(0xcdc3ae, { flat: false, roughness: 0.74 }),
    irisMat: M(0x5d8899, { flat: false, roughness: 0.55 }),
    eyeSize: 0.019, browMat: browM, browAngle: 0.22,
    mouth: 'line', mouthColor: 0x8b4a45, noseLen: 0.03, noseWide: 0.8,
  });
  face.group.position.set(0, 0.129, 0.012);
  head.add(face.group);
  const hd = face.group;                               // dalje je sve u ravni lobanje

  // odlučan izraz: uska, čvrsto stisnuta usta i krupnije zenice
  face.mouth.scale.set(0.86, 1, 1);
  face.mouth.rotation.x = 0.1;
  face.mouth.rotation.z = -0.03;
  face.irisL.scale.setScalar(1.06);
  face.irisR.scale.setScalar(1.06);

  // Obrve iz alatnice su prave daščice: spolja im ugao odlepi od lobanje. Uže
  // su i utisnute, pa prate greben; simetrija se čuva istom obradom obe.
  for (const b of [face.browL, face.browR]) {
    b.scale.set(0.8, 0.9, 0.7);
    b.position.z -= 0.008;
    b.position.y -= 0.002;
  }
  // po tri čuperka na svakoj obrvi, priljubljena uz kožu
  for (const s of [-1, 1]) {
    for (let i = 0; i < 3; i++) {
      const bx2 = s * (0.032 + i * 0.0135);
      const by2 = 0.046 - i * 0.004;
      const bz2 = 0.1085 * Math.sqrt(Math.max(1 - (bx2 / 0.113) ** 2 - (by2 / 0.1175) ** 2, 0.02)) - 0.006;
      const tuft = box(0.014, 0.008, 0.01, browM, bx2, by2, bz2);
      tuft.rotation.z = -s * (0.22 + i * 0.08);
      hd.add(tuft);
    }
  }

  // pegice preko nosa i jagodica
  for (const [x, y, z] of [
    [0, 0.002, 0.106], [-0.021, 0.007, 0.102], [0.023, 0.004, 0.101],
    [-0.042, -0.014, 0.094], [0.045, -0.012, 0.093], [0.03, -0.026, 0.095],
  ]) hd.add(sphere(0.0055, freckle, x, y, z, 6, 5));

  // ožiljak preko brade — utisnut u kožu; ranije je stajao kao svetla pločica
  const sc1 = box(0.008, 0.062, 0.008, scarMat, 0.027, -0.076, 0.072);
  sc1.rotation.set(-0.35, 0, 0.55);
  hd.add(sc1);
  const sc2 = box(0.007, 0.026, 0.008, scarMat, 0.047, -0.052, 0.06);
  sc2.rotation.set(-0.3, 0, 0.5);
  hd.add(sc2);
  const sc3 = box(0.006, 0.02, 0.007, scarMat, 0.014, -0.098, 0.062);
  sc3.rotation.set(-0.4, 0, 0.5);
  hd.add(sc3);

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
  // Pramenovi preko kape: luk počinje na liniji kose, jaše po kapi i utapa se u
  // zadnju masu. Kontrolna tačka je nad kapom, pa nijedan pramen ne uleće u
  // lobanju ni ne visi pred čelom (pre su to bile daščice nad obrvama).
  const capTop = (x) => 0.046 + 0.0904 * Math.sqrt(Math.max(1 - (x / 0.1175) ** 2, 0.04));
  const hairSurf = (x, y) => 0.1085 * Math.sqrt(Math.max(1 - (x / 0.113) ** 2 - (y / 0.1175) ** 2, 0.03));
  for (const [x, mt] of [[-0.079, hairDark], [-0.031, hair], [0.031, hairDark], [0.079, hair]]) {
    const ax = x * 0.85, ay = 0.088 - 0.16 * Math.abs(x);
    const a = [ax, ay, hairSurf(ax, ay) - 0.004];
    const b = [x * 1.22, -0.014, -0.112];
    const mt2 = [x * 1.12, capTop(x * 1.12) + 0.004, -0.024];
    hd.add(curve(a, b, [
      2 * (mt2[0] - (a[0] + b[0]) / 2),
      2 * (mt2[1] - (a[1] + b[1]) / 2),
      2 * (mt2[2] - (a[2] + b[2]) / 2),
    ], mt, 0.013, 0.0095, 4));
  }
  // grudve po liniji kose — razbijaju glatku ivicu „kacige" nad čelom
  for (let i = 0; i < 5; i++) {
    const a = -1.2 + i * 0.6;
    const k = sphere(0.023 + (i % 2) * 0.004, i % 2 ? hairDark : hair,
      Math.sin(a) * 0.079, 0.086 - (i % 2) * 0.006, Math.cos(a) * 0.0755, 7, 6);
    k.scale.set(1.1, 0.75, 0.9);
    k.rotation.set(a, a * 0.5, i);
    hd.add(k);
  }

  // vrpca oko čela — segmenti nanizani po izračunatoj površini lobanje
  const bandK = Math.sqrt(1 - (0.062 / 0.1175) ** 2);
  const bandAt = (a) => [Math.sin(a) * 0.1145 * bandK, 0.062, Math.cos(a) * 0.11 * bandK];
  for (let i = 0; i < 9; i++) {
    hd.add(bar(bandAt(-1.75 + i * 0.3889), bandAt(-1.75 + (i + 1) * 0.3889), 0.0105, leatherD, 6));
  }
  for (const s of [-1, 1]) {
    const p = bandAt(s * 1.75);
    hd.add(sphere(0.014, leatherP, p[0], p[1], p[2], 7, 6));
  }

  // ------------------------------------------------------------ pletenice ---
  // Svaka je niz ugnežđenih grupa, pa talas može da putuje kroz nju umesto
  // da se klati kao jedan komad.
  //
  // GEOMETRIJA PUTANJE: pletenica izlazi ispred uveta i pada uz grudi sa
  // stalnim nagibom ~0.34 rad. Time prati oblinu tela i STAJE na gornju ivicu
  // steznika (y ≈ 1.36) umesto da mu prođe kroz ploče i kroz verižnjaču, kao
  // pre. Kika se završava ispred ploča, ne u njima.
  //
  // OBLIK: svaki čvor su dva poluzrna koja se prepliću, plus tanka žica preko
  // spoja — ranije je to bila jedna kugla sa daščicom koja je stajala kao peraje.
  function makeBraid(side) {
    const root = new THREE.Group();
    root.position.set(side * 0.102, -0.012, 0.048);
    root.rotation.z = side * 0.055;                    // blago se razmiče od vrata
    root.rotation.x = -0.34;                           // pada NAPRED, uz grudi
    const segs = [];
    let parent = root;
    const N = 10;                                      // deset čvorova koji se smanjuju
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      const seg = new THREE.Group();
      seg.position.set(0, i === 0 ? -0.026 : -0.031, 0);
      seg.rotation.x = -0.012;                         // svija se preko grudi
      seg.rotation.z = side * 0.004;
      const r = 0.036 - 0.018 * t;
      const ph = i % 2 ? 1 : -1;                       // smena strana prepleta
      for (const lobe of [-1, 1]) {
        const k = sphere(r * 0.78, i % 3 === 2 ? hairDark : hair,
          lobe * r * 0.42, -0.012 + lobe * ph * r * 0.16, lobe * ph * r * 0.18, 8, 7);
        k.scale.set(1.0, 0.92, 0.9);
        k.rotation.y = i * 0.7 + (lobe > 0 ? 0.8 : 0);
        seg.add(k);
      }
      if (i % 2 === 0) {                               // žica prepleta, unutar obima čvora
        const strand = box(r * 1.7, r * 0.44, r * 1.3, hairDark, 0, -0.012, 0);
        strand.rotation.z = ph * 0.5;
        strand.rotation.y = i * 0.35;
        seg.add(strand);
      }
      parent.add(seg);
      parent = seg;
      segs.push(seg);
    }
    // kožna vrpca i sitan metalni prsten na kraju
    put(parent, torus(0.017, 0.008, leatherD, 0, -0.03, 0.004, 6, 12)).rotation.x = Math.PI / 2;
    put(parent, torus(0.014, 0.005, steel, 0, -0.048, 0.006, 6, 12)).rotation.x = Math.PI / 2;
    put(parent, cone(0.013, 0.042, hair, 0, -0.07, 0.008, 7)).rotation.x = Math.PI;
    put(parent, sphere(0.008, brass, 0, -0.062, 0.007, 6, 5));
    return { root, segs };
  }
  const braidL = makeBraid(1);
  const braidR = makeBraid(-1);
  hd.add(braidL.root);
  hd.add(braidR.root);

  // --------------------------------------------------------------- koplje ---
  // Jasenova motka, dugačak listoliki vrh, kožni omot na hvatu.
  // Motka je izmaknuta van njenog stopala: pre je okov na dnu stajao UNUTAR
  // čizme. Vrh se blago naginje NAPRED (+x rotacija), da se ne primiče barjaku
  // koji visi za njom.
  const spear = group([], -0.472, 0, 0.135);
  spear.rotation.set(0.035, 0, 0.03);
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
  // Pera: rebro pa tri para lopatica NABIJENIH na rebro. Pre su lopatice bile
  // dve svetle daščice pored rebra, pa su lebdele kao krpice u vazduhu.
  for (const [col, s, dz] of [[0xb8af97, 1, 0.02], [C.charcoal, -1, -0.03]]) {
    const fm = M(col, { roughness: 0.95 });
    const fg = group([], s * 0.028, -0.05, dz);
    tassel.add(fg);
    const qb = [s * 0.032, -0.178, 0.018];
    fg.add(bar([0, 0, 0], qb, 0.008, fm, 6, 0.0035));
    for (let i = 0; i < 3; i++) {
      const t = 0.2 + i * 0.26;
      const px = qb[0] * t, py = qb[1] * t, pz = qb[2] * t;
      const v = box(0.03 - i * 0.006, 0.06 - i * 0.008, 0.006, fm, px + s * 0.011, py - 0.012, pz + 0.003);
      v.rotation.z = -s * 0.2;
      v.rotation.y = s * 0.22;
      fg.add(v);
      const v2 = box(0.022 - i * 0.004, 0.05 - i * 0.006, 0.005, fm, px - s * 0.008, py - 0.01, pz + 0.001);
      v2.rotation.z = s * 0.24;
      fg.add(v2);
    }
  }

  // desna šaka obuhvata motku — osa drške je Y osa šake
  const handR = makeHand({ pose: 'grip', side: 1, skin, cuff: leatherD, s: 1.02 });
  handR.position.set(0, GRIP, 0);
  spear.add(handR);
  // kožne trake preko zglobova, da se šaka ne čita kao naslagane kocke
  for (let i = 0; i < 2; i++) {
    const st = box(0.052, 0.014, 0.03, leather, 0, GRIP + 0.035 - i * 0.026, 0.026);
    st.rotation.x = -0.2;
    spear.add(st);
  }
  spear.add(sphere(0.009, brass, 0.03, GRIP + 0.03, 0.02, 6, 5));

  // ----------------------------------------------------------------- štit ---
  // Okrugao drveni štit oslonjen na tlo levo od nje, blago iza njene noge.
  // Obruč DODIRUJE tlo (y = poluprečnik + obruč), a okretanje po Y je sada
  // negativno: tako unutrašnja ivica beži IZA njene cevanice i čizme (pre je
  // prolazila kroz njih), a pocrnela spoljna strana se izvija ka gledaocu.
  const SH_R = 0.4;
  const shield = group([], 0.435, 0.4205, -0.185);
  shield.rotation.set(-0.05, -0.26, -0.09);
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
  // POCRNELA STRANA IZ NJENE PRIČE: granica gari preko daske 4-5 i garež po
  // pocrnelim daskama, da se izgorela polovina i u polumraku jasno čita.
  for (let i = 0; i < 7; i++) {
    const y = 0.28 - i * 0.095;
    const w = 0.055 + (i % 3) * 0.022;
    const bxs = box(w, 0.05 + (i % 2) * 0.02, 0.008, soot, 0.115 - (i % 2) * 0.03, y, 0.04);
    bxs.rotation.z = (i % 2 ? 0.4 : -0.3);
    shield.add(bxs);
  }
  for (let i = 0; i < 5; i++) {                        // jezici gari, svi na +x strani
    const a = 0.35 + i * 0.25;
    const r0 = 0.3 + (i % 2) * 0.04;
    const t = box(0.03, 0.075, 0.007, soot, Math.sin(a) * r0, Math.cos(a) * r0 * 0.8, 0.04);
    t.rotation.z = -a;
    shield.add(t);
  }
  // ugoreo, ižvrljan rub sa spoljne (pocrnele) strane
  for (let i = 0; i < 4; i++) {
    const a = 0.3 + i * 0.32;
    shield.add(box(0.055, 0.03, 0.03, soot, Math.sin(a) * 0.372, Math.cos(a) * 0.372, 0.02));
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
  for (let i = 0; i < 5; i++) {                        // luk oko umba, po oslikanoj -x strani
    const a = 0.5 + i * 0.56;
    put(shield, box(0.05, 0.022, 0.012, paintB, -Math.sin(a) * 0.15, Math.cos(a) * 0.15, 0.042))
      .rotation.z = a;
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
  // šiljak na umbu: ovratnik pa glava, da glava ne visi sama pred umbom
  put(shield, cyl(0.021, 0.032, 0.036, iron, 0, 0, 0.106, 8)).rotation.x = Math.PI / 2;
  shield.add(torus(0.026, 0.007, steel, 0, 0, 0.118, 6, 12));
  shield.add(sphere(0.021, steel, 0, 0, 0.132, 8, 7));
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
  const GA = 0.32;                                     // ugao hvata od gornje točke
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
  // Zglob leve ruke je ISPRED ravni štita (lokalno +z), jer ruka pada s prednje
  // strane obruča; sa -z je izlazio iza štita i ruka se rastezala preko kosti.
  shield.updateMatrix();
  spear.updateMatrix();
  const wl = new THREE.Vector3(gx - 0.075, gy + 0.012, 0.055).applyMatrix4(shield.matrix);
  const wr = new THREE.Vector3(0, GRIP - 0.03, -0.075).applyMatrix4(spear.matrix);

  // Rame ruke koja se odupire o štit je niže i malo unazad — ona se na taj štit
  // naslanja; time i kost ruke stiže do obruča bez rastezanja.
  function buildArm(side, W, dir, o = {}) {
    const S = o.S ?? [side * 0.185, 1.385, -0.018];
    const E = elbow(S, W, o.upper ?? 0.29, o.fore ?? 0.285, dir);
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
  // lakat leve ruke izlazi u stranu i NAPRED, da ne uleti u krzneni ogrtač
  buildArm(1, [wl.x, wl.y, wl.z], [0.95, -0.05, 0.25],
    { S: [0.19, 1.352, -0.032], upper: 0.30, fore: 0.295 });
  buildArm(-1, [wr.x, wr.y, wr.z], [-0.6, -0.15, -0.78]);

  // ------------------------------------------------------- krzneni ogrtač ---
  // Preko levog ramena, prikopčan velikom okruglom kopčom. Masa preko ramena
  // NIJE jedna glatka kugla (tako je ličila na uvijenu ponjavu): to je tamna
  // podloga pa niz zbijenih grudvi i čuperaka po rubu, povučena unazad da
  // pletenica pada ISPRED nje.
  const cloak = group([], 0.09, 1.44, -0.105);
  cloak.rotation.z = -0.06;
  g.add(cloak);
  const sh2 = sphere(0.122, furD, 0.02, -0.018, -0.035, 10, 9);              // podloga
  sh2.scale.set(1.28, 0.7, 0.94);
  cloak.add(sh2);
  // grudve krzna preko ramena, od vrata ka nadlaktici
  const lumps = [
    [-0.055, 0.012, 0.005, 0.052, furD], [0.01, 0.028, -0.01, 0.062, furM],
    [0.075, 0.026, 0.008, 0.058, furD], [0.135, 0.012, -0.005, 0.062, furM],
    [0.19, -0.008, -0.02, 0.056, furD], [0.235, -0.036, -0.045, 0.05, furM],
    [0.04, 0.004, -0.075, 0.058, furD], [0.15, -0.014, -0.08, 0.054, furM],
  ];
  for (const [lx, ly, lz, lr, lm] of lumps) {
    const k = sphere(lr, lm, lx, ly, lz, 8, 7);
    k.scale.set(1.05, 0.82, 1.0);
    k.rotation.set(lx * 6, lz * 5, ly * 4);
    cloak.add(k);
  }
  // resasti rub krzna po donjoj liniji ogrtača
  for (let i = 0; i < 7; i++) {
    const lx = -0.07 + i * 0.052;
    const tuft = sphere(0.03 + (i % 3) * 0.006, i % 2 ? furP : furM, lx, -0.062 - (i % 2) * 0.012, 0.012 - Math.abs(lx) * 0.2, 7, 6);
    tuft.scale.set(1, 0.8, 0.8);
    tuft.rotation.set(i * 0.7, i * 0.4, i);
    cloak.add(tuft);
  }
  const cf1 = fur(furP, 4, [0.17, 0.03, 0.055], 0.05, 5);
  cf1.position.set(0.05, 0.022, -0.02);
  cloak.add(cf1);
  const cf2 = fur(furD, 4, [0.16, 0.03, 0.05], 0.05, 91);
  cf2.position.set(0.06, -0.05, -0.03);
  cloak.add(cf2);

  // Panelima visi niz leđa; svaki je zglobna grupa da talas može da putuje.
  // Spoljni paneli su odmaknuti dublje unazad (dz), jer preko njih pada leva
  // ruka, i kraći su, jer im inače donji rub upada u gornju ivicu štita.
  const cloakPanels = [];
  for (const [x, len, tilt, roll, dz] of [
    [-0.13, 0.68, 0.16, -0.07, 0], [-0.065, 0.64, 0.13, -0.04, 0],
    [0.0, 0.56, 0.11, 0.0, -0.006], [0.06, 0.50, 0.12, 0.02, -0.016],
    [0.12, 0.44, 0.15, 0.05, -0.036], [0.175, 0.36, 0.18, 0.08, -0.06],
  ]) {
    const p = group([], x, -0.05, -0.012 + dz);
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

  // velika okrugla kopča sa urezanim šarama — sedi NA prednjem rubu krzna
  // (ranije je bila do pola utopljena u njega, pa se čitala kao zlatan srp)
  const brooch = group([], 0.216, 1.402, 0.008);
  brooch.rotation.set(-0.12, 0.78, 0);
  g.add(brooch);
  // kožni jezičak ispod kopče, koji je spaja sa krznom (bez njega kopča visi
  // ispred krzna kao zlatan novčić u vazduhu)
  put(g, box(0.075, 0.05, 0.062, leatherD, 0.209, 1.398, -0.028)).rotation.y = 0.78;
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
