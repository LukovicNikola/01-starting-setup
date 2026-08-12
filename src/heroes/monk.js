// src/heroes/monk.js — Brat Tihomir, Monah Praznog Puta
//
// Borbeni monah: stoji savršeno uspravno, bo štap uspravno ispred tela, obe
// šake na drvetu, pogled poluspušten. Poza je simetrična i sabrana — mir je
// ono što ga čini opasnim. Sve se kreće, ali toliko malo da posmatrač pre
// pomisli da gleda kip nego čoveka: disanje je dvostruko sporije od ostalih
// junaka, a težina se prebacuje jedva primetno.
//
// Orijentiri: stopala 0, kukovi 0.88, struk 1.02, grudi 1.22, ramena 1.40,
// brada 1.52, centar glave 1.615, teme 1.74, vrh štapa 1.79.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh,
  box, cyl, sphere, cone, torus, lathe, bar, group,
  curve, rivetRing, fringe,
  makeFace, makeHand, Anim,
} from '../kit.js';

const UP = new THREE.Vector3(0, 1, 0);

/** Okvir uda — grupa čija +Y osa gleda od a ka b, da prstenovi legnu po udu. */
function limb(a, b) {
  const g = new THREE.Group();
  g.position.set(a[0], a[1], a[2]);
  const dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2];
  const len = Math.hypot(dx, dy, dz) || 1e-5;
  g.quaternion.setFromUnitVectors(UP, new THREE.Vector3(dx / len, dy / len, dz / len));
  return { g, len };
}

/** Karika oko uda unutar okvira — povoj, tetovažna traka, okov. */
function ring(g, r, tube, mat, y, seg = 6, tSeg = 14) {
  const t = torus(r, tube, mat, 0, y, 0, seg, tSeg);
  t.rotation.x = Math.PI / 2;
  g.add(t);
  return t;
}

export function createMonk() {
  const root = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  const skin = Flesh(C.skinTan);
  const skinD = Flesh(C.skinDark);
  const skinP = Flesh(0xc78d5c);        // odsjaj kože — tek nijansu iznad tena, ne kost
  const nailM = M(0xcdc2a9, { flat: false, roughness: 0.5 });

  // Dvorana je noćna i obasjana žeravnicima: odora je dublja od čiste šafranske
  // žute, jer pod plamenom svaka svetla tkanina blješti.
  const robeM = Cloth(0xc4831c, { side: THREE.DoubleSide });
  const robeIn = Cloth(0x7d4c0c, { side: THREE.DoubleSide });
  const robeTrim = Cloth(0x8f5a10);
  const dustM = Cloth(0x7c6c4c);

  const wrapM = Cloth(0xc7bca1);        // pohabano platno, ne blistavo belo
  const wrapSh = Cloth(0xa2967c);
  const ropeM = Hide(C.leatherPale);
  const ropeD = Hide(C.leather);
  const thread = Cloth(0xb5aa91);

  const woodM = M(C.woodPale, { roughness: 0.72 });
  const woodD = M(C.woodDark, { roughness: 0.8 });
  const brass = Metal(C.brass);
  const iron = Metal(C.blackIron, { roughness: 0.5 });
  const ink = M(0x1a181c, { flat: false });
  const beadM = M(C.woodDark, { flat: false, roughness: 0.5 });

  // ===================================================== bosa stopala i noge
  // Prsti su modelovani pojedinačno — monah nikad ne obuva ništa.
  function foot(sx) {
    const f = group([], sx * 0.138, 0, 0.015);
    f.rotation.y = sx * 0.12;
    f.add(box(0.098, 0.052, 0.185, skin, 0, 0.04, 0));                 // telo stopala
    const heel = sphere(0.05, skin, 0, 0.05, -0.072, 9, 8);
    heel.scale.set(1, 0.95, 0.86);
    f.add(heel);
    const arch = sphere(0.056, skin, 0, 0.056, 0.02, 9, 8);
    arch.scale.set(0.94, 0.9, 1.55);
    f.add(arch);
    f.add(box(0.096, 0.028, 0.045, skinD, 0, 0.021, 0.075));           // jastučići pod prstima
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const w = 0.027 - t * 0.008;
      const L = 0.05 - t * 0.014;
      const x = sx * (-0.034 + t * 0.068);
      const z = 0.093 + (i === 0 ? 0.014 : 0.006 - t * 0.014);
      f.add(box(w, 0.026 - t * 0.005, L, skin, x, 0.027, z));
      f.add(sphere(0.013 - t * 0.002, skin, x, 0.028, z + L * 0.46, 6, 5));
    }
    f.add(box(0.02, 0.005, 0.011, nailM, sx * -0.034, 0.04, 0.128));   // nokat velikog prsta
    f.add(sphere(0.053, skin, 0, 0.086, -0.025, 9, 8));                // gležanj
    f.add(sphere(0.02, skinP, sx * 0.044, 0.088, -0.022, 6, 5));       // koščica gležnja
    return f;
  }

  function leg(sx) {
    const g = new THREE.Group();
    const ank = [sx * 0.138, 0.105, 0.015];
    const kne = [sx * 0.128, 0.465, 0.02];
    const hip = [sx * 0.112, 0.88, 0];
    const sh = limb(ank, kne);
    sh.g.add(cyl(0.052, 0.036, sh.len, skin, 0, sh.len * 0.5, 0, 10));
    const calf = sphere(0.056, skin, 0, sh.len * 0.64, -0.02, 9, 8);
    calf.scale.set(0.92, 1.45, 0.95);
    sh.g.add(calf);
    g.add(sh.g);
    g.add(sphere(0.057, skin, kne[0], kne[1], kne[2], 10, 8));         // koleno
    g.add(box(0.056, 0.046, 0.018, skinP, kne[0], kne[1] + 0.004, kne[2] + 0.044));
    const th = limb(kne, hip);
    th.g.add(cyl(0.078, 0.058, th.len, skin, 0, th.len * 0.5, 0, 10));
    const quad = sphere(0.068, skin, 0, th.len * 0.5, 0.018, 9, 8);
    quad.scale.set(0.95, 1.25, 0.8);
    th.g.add(quad);
    g.add(th.g);
    return g;
  }

  for (const s of [-1, 1]) { root.add(foot(s)); root.add(leg(s)); }

  // ========================================================== trup i odora ==
  // Ceo gornji deo tela visi na jednoj grupi da bi prebacivanje težine moglo
  // da se odigra oko tačke između stopala.
  const torso = new THREE.Group();
  root.add(torso);

  const core = new THREE.Group();
  torso.add(core);

  core.add(cyl(0.152, 0.142, 0.20, skin, 0, 0.90, 0, 12));             // kukovi
  const belly = sphere(0.155, skin, 0, 1.04, 0.012, 12, 10);
  belly.scale.set(1.0, 0.92, 0.78);
  core.add(belly);

  // --------------------------------------------------------- grudni koš -----
  // Ova grupa diše; ramena i glava su van nje pa se šav ne otvara.
  const ribs = new THREE.Group();
  ribs.position.set(0, 1.22, 0);
  torso.add(ribs);
  const cage = sphere(0.172, skin, 0, 0, 0, 14, 12);
  cage.scale.set(1.02, 0.95, 0.72);
  ribs.add(cage);
  ribs.add(box(0.046, 0.19, 0.026, skinP, 0, -0.01, 0.126));           // grudna kost
  for (const s of [-1, 1]) {
    const pec = sphere(0.082, skin, s * 0.072, 0.022, 0.1, 10, 8);
    pec.scale.set(1.12, 0.7, 0.56);
    ribs.add(pec);
    ribs.add(sphere(0.012, skinD, s * 0.076, 0.006, 0.153, 6, 5));
    const rb = box(0.125, 0.011, 0.028, skinP, s * 0.088, -0.062, 0.098);   // rebro pod kožom
    rb.rotation.z = -s * 0.26;
    ribs.add(rb);
  }
  const back = sphere(0.168, skin, 0, 0.02, -0.055, 12, 10);
  back.scale.set(1.0, 0.95, 0.6);
  ribs.add(back);
  for (const s of [-1, 1]) ribs.add(box(0.085, 0.125, 0.026, skinP, s * 0.072, 0.06, -0.132));

  // ------------------------------------------------- ključne kosti i vrat ---
  for (const s of [-1, 1]) {
    core.add(bar([s * 0.028, 1.393, 0.078], [s * 0.172, 1.4, 0.028], 0.016, skinP, 7));
    core.add(sphere(0.026, skinP, s * 0.028, 1.394, 0.082, 7, 6));
    const trap = sphere(0.072, skin, s * 0.1, 1.412, -0.012, 9, 8);
    trap.scale.set(1.3, 0.6, 0.9);
    core.add(trap);
    core.add(bar([s * 0.042, 1.532, 0.022], [s * 0.019, 1.418, 0.046], 0.01, skinP, 6)); // tetiva vrata
  }
  core.add(cyl(0.05, 0.062, 0.115, skin, 0, 1.474, 0.006, 10));        // vrat
  core.add(sphere(0.046, skin, 0, 1.442, 0.038, 9, 8));                // grlo
  core.add(sphere(0.018, skinP, 0, 1.468, 0.052, 6, 5));               // Adamova jabučica
  core.add(sphere(0.05, skin, 0, 1.452, -0.03, 9, 8));                 // zatiljak

  // ======================================================= obrijana glava ===
  const head = new THREE.Group();
  head.position.set(0, 1.615, 0.012);
  torso.add(head);

  // Površina lobanje za dato (x, y) — svaka crta lica koju sam dodajem legne
  // UZ nju. Ista formula kao u alatnici, jer su i mere lobanje iste.
  const HR = 0.115, HT = 1.06, HD = 0.96;
  const skullZ = (x, y) => {
    const k = 1 - (x / HR) ** 2 - (y / (HR * HT)) ** 2;
    return k <= 0.02 ? 0 : HR * HD * Math.sqrt(k);
  };

  const EYE = 0.0185, EYE_Y = HR * 0.10;
  const face = makeFace({
    skin,
    r: HR, tall: HT, deep: HD,
    eye: 0x3b2b1d, eyeSize: EYE,
    eyeZ: 0.083,                          // oko utonulo u duplju, ne ispupčeno
    brow: 0x241d18, browAngle: 0.04,
    mouth: 'smile',
    noseWide: 0.8, noseLen: 0.026,
  });
  head.add(face.group);

  // Poluzatvorene oči: kapak je tanka spljoštena kapica koja pokriva gornjih
  // ~40% oka, pa se ispod nje i dalje vide beonjača i zenica.
  const LID_R = EYE * 1.16, LID_SY = 0.35;
  // donja ivica kapka = gornjih 40% oka: (1 - 2·0.40) polovine oka iznad centra
  const lidY = EYE_Y + EYE * 0.84 * 0.2 + LID_R * LID_SY;
  for (const lid of [face.lidL, face.lidR]) {
    lid.scale.set(1.0, LID_SY, 0.9);
    lid.position.y = lidY;
  }
  face.nose.scale.set(0.72, 1.05, 0.95);   // plići nos, da ne bude nalepljena grudva
  // usta tek nagoveste osmeh — na površini vilice, ne utonula u nju
  if (face.mouth) {
    face.mouth.scale.set(1.15, 0.9, 1);
    face.mouth.rotation.x = -0.42;
    face.mouth.position.z = 0.088;
  }

  // Obrve: umesto dve daščice u vazduhu — po četiri tanka segmenta koja prate
  // zakrivljenost čela. Segment iz alatnice je najbliži nosu, ostali su dodati.
  const browMat = face.browL.material;
  for (const s of [-1, 1]) {
    for (let i = 0; i < 4; i++) {
      const bxp = s * (0.024 + i * 0.0155);
      const byp = 0.047 - i * 0.0022;                  // rep obrve blago pada
      const seg = i === 0 ? (s < 0 ? face.browL : face.browR)
        : box(0.019, 0.0045, 0.007, browMat);
      if (i === 0) seg.scale.set(0.37, 0.63, 1.1);
      seg.position.set(bxp, byp, skullZ(bxp, byp) - 0.003);
      seg.rotation.set(0, Math.asin(bxp / HR), -0.02 * s);
      if (i > 0) head.add(seg);
    }
  }

  // izražene jagodice i borice osmeha — sve utonulo u kožu, ništa nalepljeno
  for (const s of [-1, 1]) {
    const cb = sphere(0.028, skin, s * 0.062, -0.014, skullZ(s * 0.062, -0.014) - 0.010, 8, 7);
    cb.scale.set(1.3, 0.5, 0.42);
    head.add(cb);
    const wr = box(0.007, 0.026, 0.008, skinD, s * 0.05, -0.062, skullZ(s * 0.05, -0.062) - 0.003);
    wr.rotation.y = Math.asin(s * 0.05 / HR);
    head.add(wr);                                                       // borica uz usta
    head.add(sphere(0.02, skin, s * 0.104, -0.052, -0.002, 6, 5));      // ušna resica
  }
  const chin = sphere(0.023, skin, 0, -0.094, 0.062, 9, 8);             // brada
  chin.scale.set(1.3, 0.7, 0.8);
  head.add(chin);
  head.add(sphere(0.056, skin, 0, 0.036, -0.088, 9, 8));                // potiljak

  // Tetovaža na temenu: TRI odvojena koncentrična kruga i tačka u središtu.
  // Svaki prsten sedi na visini na kojoj mu poluprečnik pada tačno na kožu, i
  // spljošten je po z jer je lobanja uža od okrugle — zato nigde ne odleće.
  for (const rr of [0.026, 0.048, 0.070]) {
    const ty = HR * HT * Math.sqrt(Math.max(0, 1 - (rr / HR) ** 2)) - 0.0018;
    const t = torus(rr, 0.003, ink, 0, ty, 0, 5, 26);
    t.rotation.x = Math.PI / 2;
    t.scale.set(1, HD, 1);
    head.add(t);
  }
  head.add(cyl(0.0085, 0.0085, 0.004, ink, 0, HR * HT - 0.0018, 0, 12));  // tačka u središtu

  // Prednja površina trupa po visini — elipsa (poluosa po x, po z, pomeraj z).
  // Sve što leži po telu (traka odore, brojanica) postavlja se UZ nju, jer se
  // ravna ploča razapeta pred oblim trupom vidi kao daska.
  const GIRTH = [
    [1.02, 0.152, 0.120, 0.012],
    [1.10, 0.150, 0.126, 0.010],
    [1.18, 0.158, 0.132, 0.006],
    [1.30, 0.176, 0.128, 0.000],
    [1.44, 0.166, 0.116, 0.000],
  ];
  /** Dubina prednje površine trupa u (x, y) i ugao njene normale oko y ose. */
  function trunkFront(x, y) {
    let i = 0;
    while (i < GIRTH.length - 2 && y > GIRTH[i + 1][0]) i++;
    const g0 = GIRTH[i], g1 = GIRTH[i + 1];
    const t = Math.min(1, Math.max(0, (y - g0[0]) / (g1[0] - g0[0])));
    const a = g0[1] + (g1[1] - g0[1]) * t;
    const b = g0[2] + (g1[2] - g0[2]) * t;
    const c = g0[3] + (g1[3] - g0[3]) * t;
    const z = c + b * Math.sqrt(Math.max(0.05, 1 - (x / a) ** 2));
    return { z, ang: Math.atan2(x / (a * a), (z - c) / (b * b)) };
  }
  /** Tačka tik iznad odenutog trupa — za niske koje leže po odori. */
  const over = (x, y, lift) => [x, y, trunkFront(x, y).z + lift];

  // =========================================================== odora ======
  const robe = new THREE.Group();
  torso.add(robe);

  const skirtPts = [
    [0.315, 0.32], [0.302, 0.4], [0.286, 0.54], [0.266, 0.7],
    [0.246, 0.85], [0.226, 0.97], [0.213, 1.06], [0.198, 1.12],
  ];
  robe.add(lathe(skirtPts, robeM, 20));
  robe.add(lathe(skirtPts.map(([r, y]) => [r * 0.955, y + 0.004]), robeIn, 18));
  robe.add(lathe([[0.318, 0.32], [0.312, 0.37], [0.304, 0.42]], dustM, 20)); // prašina na rubu
  const hemRing = torus(0.311, 0.013, robeTrim, 0, 0.328, 0, 6, 24);
  hemRing.rotation.x = Math.PI / 2;
  robe.add(hemRing);
  robe.add(fringe(0.307, 8, dustM, 0.045, 0.324, 1, 0.6));               // iskrzan rub
  robe.add(rivetRing(0.3, 8, 0.007, thread, 0.395, 1, 0.3));             // šav iznad ruba

  // uzdužni preklopi odore — njišu se kao tkanina, svaki sa svojom fazom
  const folds = [];
  for (let i = 0; i < 6; i++) {
    const fg = new THREE.Group();
    fg.position.set(0, 1.02, 0);
    fg.rotation.y = i * (Math.PI * 2 / 6) + 0.18;
    fg.add(bar([0, -0.02, 0.206], [0, -0.66, 0.3], 0.025, robeM, 6));
    fg.add(bar([0.032, -0.06, 0.203], [0.042, -0.65, 0.292], 0.01, robeTrim, 6));
    folds.push(fg);
    robe.add(fg);
  }

  // zakrpa sa šavom — odora je krpljena više puta
  const patch = group([], 0.148, 0.6, 0.235);
  patch.rotation.y = 0.56;
  patch.add(box(0.11, 0.088, 0.014, robeTrim));
  for (let i = 0; i < 3; i++) {
    patch.add(box(0.009, 0.016, 0.012, thread, -0.038 + i * 0.038, 0.05, 0.008));
    patch.add(box(0.009, 0.016, 0.012, thread, -0.038 + i * 0.038, -0.05, 0.008));
  }
  robe.add(patch);

  // ------------------------------- dijagonalna traka preko trupa -----------
  // Odora ide preko levog ramena i pada pod desnu ruku: desno rame ostaje golo.
  // traka je dete grudnog koša (koji diše), pa su koordinate relativne na 1.22
  const sash = new THREE.Group();
  sash.position.set(-0.015, 0.015, 0);
  ribs.add(sash);

  // Prednjica trake: šest kratkih polja koja LEŽE po grudima i struku. Jedna
  // dugačka ravna kutija je pred oblim trupom štrčala kao daska i završavala se
  // oštrim uglom u vazduhu pored kuka; ovako tkanina prati telo, ima šavove i
  // uvire u odoru na struku.
  const BAND_K = 0.684;                          // nagib trake (tan 0.6 rad)
  for (let i = 0; i < 6; i++) {
    const y = 1.42 - i * 0.056;
    const x = -0.015 - BAND_K * (y - 1.235);
    const f = trunkFront(x, y);
    const p = group([], x + 0.015, y - 1.235, f.z + 0.018);
    p.rotation.set(0, f.ang, 0.6);
    p.add(box(0.168, 0.078, 0.036, robeM));
    p.add(box(0.016, 0.08, 0.042, robeTrim, 0.083, 0, 0.001));         // opšiv uz ivicu
    p.add(box(0.016, 0.08, 0.042, robeTrim, -0.083, 0, 0.001));
    p.add(box(0.15, 0.008, 0.038, robeIn, 0, 0.039, 0));               // šav prema susednom polju
    if (i > 0 && i < 5) {
      p.add(box(0.009, 0.006, 0.012, thread, 0.083, 0.02, 0.024));     // šav utonuo u opšiv
      p.add(box(0.026, 0.026, 0.016, woodD, 0.052, -0.01, 0.024));     // drveni gumb
    }
    sash.add(p);
  }

  // Zadnje polje odore: pet uzanih pola savijenih po obimu leđa. Jedna ravna
  // ploča se čitala kao daska koja viri pored tela — tkanina mora da prati telo.
  const backPanels = [];
  for (let i = 0; i < 5; i++) {
    const a = (i - 2) * 0.40;
    const d = Math.abs(i - 2);
    const hh = 0.58 - d * 0.03;                                         // spoljna pola su kraća,
    const cy = -0.02 - d * 0.012;                                       // da gornji rub prati ramena
    const p = group([], Math.sin(a) * 0.178 + 0.012, cy, -Math.cos(a) * 0.168);
    p.rotation.y = Math.PI - a;
    p.add(box(0.084, hh, 0.028, robeM));
    p.add(box(0.088, 0.02, 0.032, robeTrim, 0, hh / 2, 0.001));         // gornji opšiv
    p.add(box(0.088, 0.018, 0.032, robeTrim, 0, -hh / 2, 0.001));       // donji opšiv
    p.add(box(0.009, hh - 0.02, 0.032, robeIn, 0.042, 0, 0));           // šav prema susednom polu
    backPanels.push(p);
    sash.add(p);
  }
  // traka koja spaja prednjicu i zadnje polje ispod desne ruke
  sash.add(bar([0.185, -0.185, 0.09], [0.175, -0.15, 0.0], 0.022, robeM, 6));
  sash.add(bar([0.175, -0.15, 0.0], [0.15, -0.12, -0.09], 0.021, robeM, 6));
  sash.add(bar([0.19, -0.21, 0.085], [0.178, -0.17, -0.005], 0.008, robeTrim, 5));
  const shoulderCap = sphere(0.098, robeM, -0.185, 0.222, 0.008, 11, 9);
  shoulderCap.scale.set(1.12, 0.8, 1.22);
  sash.add(shoulderCap);
  sash.add(bar([-0.26, 0.2, 0.02], [-0.13, 0.26, -0.02], 0.018, robeTrim, 6));
  sash.add(bar([-0.25, 0.15, 0.06], [-0.1, 0.24, 0.05], 0.014, robeTrim, 6));
  sash.add(box(0.1, 0.09, 0.04, robeM, -0.2, 0.145, 0.06));             // pregib pod ramenom

  // ======================================================== konopac o pojasu
  const belt = new THREE.Group();
  core.add(belt);
  const bRing = torus(0.231, 0.017, ropeM, 0, 1.005, 0, 7, 26);
  bRing.rotation.x = Math.PI / 2;
  belt.add(bRing);
  const bRing2 = torus(0.234, 0.01, ropeD, 0, 1.03, 0, 7, 26);
  bRing2.rotation.x = Math.PI / 2;
  belt.add(bRing2);
  belt.add(sphere(0.031, ropeM, 0.028, 1.006, 0.222, 9, 8));            // čvor
  belt.add(sphere(0.024, ropeM, -0.022, 1.014, 0.226, 9, 8));
  const knot = torus(0.028, 0.011, ropeD, 0.004, 1.0, 0.232, 6, 14);
  knot.rotation.y = 0.4;
  belt.add(knot);

  // Dva kraja konopca padaju uz kosinu odore — ne pravo nadole, jer se odora
  // širi ka rubu i pojela bi ih.
  const ropeEnds = [];
  for (const s of [1, -1]) {
    const e = new THREE.Group();
    e.position.set(s * 0.05, 0.982, 0.243);
    e.add(curve([0, 0, 0], [s * 0.014, -0.32, 0.045], [s * 0.012, -0.02, 0.028], ropeM, 0.013, 0.009, 4));
    e.add(cone(0.011, 0.03, ropeM, s * 0.016, -0.344, 0.05, 6));
    ropeEnds.push(e);
    belt.add(e);
  }

  // drvena posuda za milostinju, uvučena u tkaninu uz desni kuk
  const bowl = group([], 0.275, 0.85, 0.09);
  bowl.rotation.z = -0.16;
  bowl.add(lathe([[0.0, 0], [0.026, 0.002], [0.044, 0.02], [0.052, 0.046], [0.048, 0.053]], woodM, 14));
  const bowlRim = torus(0.05, 0.006, woodD, 0, 0.048, 0, 6, 18);
  bowlRim.rotation.x = Math.PI / 2;
  bowl.add(bowlRim);
  bowl.add(cyl(0.042, 0.038, 0.005, woodD, 0, 0.045, 0, 14));
  bowl.add(bar([-0.042, 0.044, 0], [-0.046, 0.15, -0.006], 0.005, ropeM, 6));
  bowl.add(bar([0.042, 0.044, 0], [-0.012, 0.152, -0.006], 0.005, ropeM, 6));
  belt.add(bowl);

  // ============================================================== brojanica
  // Petlja od 24 sitne drvene perle. Oba niza obilaze vrat, prelaze preko
  // ključnih kostiju i padaju ispred odore do struka, gde se spajaju levo od
  // štapa — šake su brojanicu vremenom potisnule u stranu. Tačke putanje su
  // probrane da niz nigde ne uđe u vrat, u odoru ni u štap.
  const PV = [0, 1.5, -0.04];
  const L = (w) => [w[0] - PV[0], w[1] - PV[1], w[2] - PV[2]];
  // Desni niz pada golim grudima, u praznini između kože i podlaktice koja se
  // penje ka štapu; levi ide PREKO dijagonalne trake, jer brojanica leži na
  // odori, a ne u njoj. Svaka tačka je birana tako da niz nigde ne uđe u vrat,
  // u grudi, u traku ni u ruku.
  const ON_ROBE = 0.042 + 0.017;                 // debljina trake + poluprečnik perle
  const knotPt = over(-0.062, 1.142, 0.062);
  const malaR = [
    [0.014, 1.502, -0.078], [0.062, 1.492, -0.050], [0.090, 1.452, 0.032],
    [0.098, 1.402, 0.112], [0.088, 1.344, 0.156], [0.068, 1.288, 0.172],
    over(0.040, 1.232, ON_ROBE), over(0.005, 1.186, ON_ROBE), knotPt,
  ];
  const malaL = [
    [-0.014, 1.502, -0.078], [-0.052, 1.494, -0.055], [-0.048, 1.483, 0.078],
    [-0.055, 1.452, 0.100], over(-0.070, 1.400, ON_ROBE),
    over(-0.086, 1.336, ON_ROBE), over(-0.096, 1.272, ON_ROBE),
    over(-0.092, 1.208, ON_ROBE), knotPt,
  ];
  const mala = new THREE.Group();
  mala.position.set(PV[0], PV[1], PV[2]);
  core.add(mala);

  /** Perle ravnomerno raspoređene po izlomljenoj liniji. */
  function beadsAlong(path, n, r, mat) {
    const seg = [];
    let total = 0;
    for (let i = 1; i < path.length; i++) {
      const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1],
        path[i][2] - path[i - 1][2]);
      seg.push(d);
      total += d;
    }
    for (let k = 0; k < n; k++) {
      let want = ((k + 0.5) / n) * total;
      let i = 0;
      while (i < seg.length - 1 && want > seg[i]) { want -= seg[i]; i++; }
      const t = seg[i] > 0 ? want / seg[i] : 0;
      const a = path[i], b = path[i + 1];
      const q = L([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]);
      mala.add(sphere(r, mat, q[0], q[1], q[2], 7, 6));
    }
  }
  beadsAlong(malaR, 12, 0.017, beadM);
  beadsAlong(malaL, 12, 0.017, beadM);

  const guru = L(knotPt);
  mala.add(sphere(0.025, woodD, guru[0], guru[1], guru[2], 8, 7));      // krupna perla
  for (let i = 0; i < 2; i++) {
    mala.add(bar([guru[0], guru[1] - 0.022, guru[2] + 0.006],
      [guru[0] + (i * 2 - 1) * 0.011, guru[1] - 0.058, guru[2] + 0.04], 0.005, thread, 5));
  }

  // ============================================================ štap i šake
  // Bo štap stoji na kamenu, obe šake su na drvetu, ruke savijene u laktovima.
  const staff = new THREE.Group();
  staff.position.set(0, 0, 0.34);
  torso.add(staff);

  staff.add(cyl(0.0245, 0.0262, 0.9, woodM, 0, 0.46, 0, 12));
  staff.add(cyl(0.0228, 0.0245, 0.9, woodM, 0, 1.34, 0, 12));
  staff.add(cyl(0.0272, 0.0285, 0.075, brass, 0, 0.046, 0, 12));        // donji okov
  staff.add(cyl(0.0255, 0.0268, 0.07, brass, 0, 1.752, 0, 12));         // gornji okov
  for (const [y, r] of [[0.088, 0.0288], [1.706, 0.0268]]) {
    const t = torus(r, 0.006, iron, 0, y, 0, 6, 16);
    t.rotation.x = Math.PI / 2;
    staff.add(t);
  }
  staff.add(rivetRing(0.029, 3, 0.005, iron, 0.032, 1, 0.4));
  staff.add(rivetRing(0.027, 3, 0.005, iron, 1.774, 1, 0.4));
  // kožni omot u sredini
  staff.add(cyl(0.0272, 0.0278, 0.30, Hide(C.leatherDark), 0, 1.115, 0, 12));
  // karike omota staju IZMEĐU šaka, da ne prolaze kroz dlanove
  for (let i = 0; i < 4; i++) {
    const t = torus(0.0288, 0.0055, Hide(C.leather), 0, 1.06 + i * 0.042, 0, 6, 14);
    t.rotation.x = Math.PI / 2;
    staff.add(t);
  }
  // sitni urezi u drvetu — svaki je nečiji promašeni udarac
  for (let i = 0; i < 3; i++) {
    const n = box(0.006, 0.014, 0.006, woodD, 0.0225, 0.55 + i * 0.14, 0.008);
    n.rotation.z = 0.3 + i * 0.3;
    staff.add(n);
  }
  staff.add(box(0.005, 0.05, 0.005, woodD, -0.022, 1.5, 0.006));        // duža ogrebotina

  /**
   * Šaka na štapu. Osa drške je Y osa šake, kako alatnica i predviđa, a grupa
   * je stisnuta po x da prsti obuhvate tanku motku umesto da vire pored nje.
   * Dodati su članci i kvrge: bez njih se šaka čita kao naslagane kocke.
   */
  function staffHand(y, side, rotY) {
    const h = makeHand({ skin, pose: 'grip', side });
    h.position.set(0, y, 0);
    h.rotation.y = rotY;
    h.scale.set(0.66, 1, 1);
    const P = 0.052;                       // pola širine dlana u alatnici
    for (let i = 0; i < 4; i++) {
      const fy = P * (0.78 - i * 0.52);
      const sh = 1 - Math.abs(i - 1.2) * 0.09;
      // obli prst preko drške: pokriva ravnu prednjicu članka iz alatnice, pa
      // se šaka vidi kao četiri prsta koja obuhvataju motku, a ne kao kocke
      const f = cyl(P * 0.24 * sh, P * 0.24 * sh, P * 1.75, skin, 0, fy, P * 0.5, 8);
      f.rotation.z = Math.PI / 2;
      h.add(f);
      h.add(sphere(P * 0.28 * sh, skin, -P * 0.88 * side, fy, P * 0.34, 7, 6));  // kvrga uz dlan
      h.add(sphere(P * 0.25 * sh, skin, P * 0.86 * side, fy, P * 0.46, 7, 6));   // vrh prsta
      if (i < 3) h.add(box(P * 1.5, P * 0.07, P * 0.3, skinD, 0, fy - P * 0.26, P * 0.44));
    }
    // povoj: dve tanke trake preko nadlanice i jedna preko ivice dlana
    h.add(box(P * 2.06, P * 0.3, P * 1.15, wrapM, 0, P * 0.62, -P * 0.95));
    h.add(box(P * 2.0, P * 0.26, P * 1.1, wrapSh, 0, -P * 0.66, -P * 1.0));
    h.add(box(P * 0.42, P * 1.9, P * 0.8, wrapM, -P * 0.98 * side, 0, -P * 0.62));
    return h;
  }
  const handTop = staffHand(1.26, 1, -0.34);
  staff.add(handTop);
  const handBot = staffHand(0.99, -1, 0.34);
  staff.add(handBot);

  // =================================================================== ruke
  // Laktovi su na istoj visini — poza je simetrična; zglobovi ulaze u dlanove
  // koji su deca štapa, pa se šav ruke i šake ne otvara.
  const shR = [0.198, 1.4, 0.015], elR = [0.24, 1.145, 0.105], wrR = [0.058, 1.295, 0.258];
  const shL = [-0.198, 1.4, 0.015], elL = [-0.25, 1.145, 0.085], wrL = [-0.058, 1.035, 0.258];

  /** Podlaktica: koža, pa beli povoji u slojevima, pa kraj platna koji visi. */
  function forearm(el, wr, sx) {
    const g = new THREE.Group();
    const f = limb(el, wr);
    f.g.add(cyl(0.033, 0.048, f.len, skin, 0, f.len * 0.5, 0, 10));
    const brach = sphere(0.046, skin, 0, f.len * 0.26, 0.012, 9, 8);
    brach.scale.set(0.95, 1.3, 0.95);
    f.g.add(brach);
    for (let i = 0; i < 4; i++) {
      const fr = 0.32 + i * 0.17;
      const r = 0.0475 + (0.0335 - 0.0475) * fr + 0.0055;
      ring(f.g, r, 0.0105, i % 2 ? wrapSh : wrapM, f.len * fr, 6, 14);
    }
    f.g.add(cyl(0.0395, 0.043, f.len * 0.26, wrapM, 0, f.len * 0.78, 0, 10));
    f.g.add(cyl(0.0425, 0.0455, f.len * 0.16, wrapSh, 0, f.len * 0.44, 0, 10));
    g.add(f.g);
    // kraj platna koji visi sa zgloba
    g.add(curve([wr[0] + sx * 0.012, wr[1] - 0.012, wr[2] - 0.03],
      [wr[0] + sx * 0.045, wr[1] - 0.125, wr[2] - 0.08],
      [sx * 0.024, -0.008, -0.02], wrapM, 0.013, 0.008, 3));
    // ožiljak na zglobu — stara pukotina u koži
    g.add(box(0.03, 0.006, 0.008, skinP, wr[0] + sx * 0.008, wr[1] + 0.012, wr[2] - 0.028));
    return g;
  }

  // desna ruka: gola, vidljiv mišić, tri crne tetovažne trake oko nadlaktice
  const armR = new THREE.Group();
  torso.add(armR);
  const delR = sphere(0.072, skin, shR[0], shR[1] + 0.016, shR[2], 10, 9);
  delR.scale.set(0.95, 1.05, 0.95);
  armR.add(delR);
  const uR = limb(shR, elR);
  uR.g.add(cyl(0.046, 0.06, uR.len, skin, 0, uR.len * 0.5, 0, 10));
  const bicR = sphere(0.05, skin, 0, uR.len * 0.44, 0.026, 9, 8);
  bicR.scale.set(0.95, 1.45, 0.85);
  uR.g.add(bicR);
  const triR = sphere(0.046, skin, 0, uR.len * 0.5, -0.03, 9, 8);
  triR.scale.set(0.9, 1.4, 0.8);
  uR.g.add(triR);
  // tri crne tetovažne trake: spljoštene po stvarnom preseku ruke (biceps
  // ispred, triceps iza), pa nigde ne odlepe od kože
  for (let i = 0; i < 3; i++) {
    const t = ring(uR.g, 0.0555 - i * 0.0016, 0.0055, ink, uR.len * (0.28 + i * 0.115), 6, 18);
    t.scale.set(1, 1.18, 1);
  }
  armR.add(uR.g);
  armR.add(sphere(0.044, skin, elR[0], elR[1], elR[2], 9, 8));          // lakat
  armR.add(sphere(0.02, skinP, elR[0] + 0.03, elR[1] - 0.012, elR[2] - 0.02, 6, 5));
  armR.add(forearm(elR, wrR, 1));

  // leva ruka: rukav odore preko nadlaktice, povezana podlaktica, brojanica o zglobu
  const armL = new THREE.Group();
  torso.add(armL);
  const delL = sphere(0.07, skin, shL[0], shL[1] + 0.014, shL[2], 10, 9);
  delL.scale.set(0.95, 1.05, 0.95);
  armL.add(delL);
  const uL = limb(shL, elL);
  uL.g.add(cyl(0.045, 0.058, uL.len, skin, 0, uL.len * 0.5, 0, 10));
  const bicL = sphere(0.048, skin, 0, uL.len * 0.46, 0.024, 9, 8);
  bicL.scale.set(0.95, 1.4, 0.85);
  uL.g.add(bicL);
  uL.g.add(cyl(0.058, 0.075, uL.len * 0.62, robeM, 0, uL.len * 0.3, 0, 12));   // rukav
  ring(uL.g, 0.0595, 0.008, robeTrim, uL.len * 0.6, 6, 18);       // rub rukava
  ring(uL.g, 0.0735, 0.008, robeTrim, uL.len * 0.05, 6, 18);
  armL.add(uL.g);
  armL.add(sphere(0.043, skin, elL[0], elL[1], elL[2], 9, 8));
  armL.add(sphere(0.019, skinP, elL[0] - 0.028, elL[1] - 0.012, elL[2] - 0.02, 6, 5));
  armL.add(forearm(elL, wrL, -1));

  // manja brojanica oko levog zgloba — osam perli u prstenu po osi podlaktice
  const wristF = limb(elL, wrL);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    wristF.g.add(sphere(0.0115, beadM, Math.sin(a) * 0.042, wristF.len * 0.93, Math.cos(a) * 0.042, 7, 6));
  }
  wristF.g.add(sphere(0.0085, thread, 0, wristF.len * 0.93, 0.05, 6, 5));
  armL.add(wristF.g);

  // ============================================================= animacija ==
  // Nekoliko nezavisnih pokreta, svaki svoje brzine i faze. Disanje je glavno i
  // sporije je nego kod ostalih junaka; ruke ga tek nagoveste, jer su šake
  // vezane za štap i ne smeju da se odvoje od zglobova.
  anim.breathe(ribs, 0.015, 0.55);                       // vrlo sporo duboko disanje
  anim.pos(head, 'y', 0.0045, 0.55, 0.35);               // glava prati grudni koš
  anim.rot(armR, 'x', 0.004, 0.55, 0.2);
  anim.rot(armL, 'x', 0.0035, 0.55, 0.5);

  anim.rot(torso, 'z', 0.008, 0.21, 1.1);                // jedva primetno prebacivanje težine
  anim.rot(torso, 'x', 0.004, 0.13, 2.4);

  anim.wave(folds, 'x', 0.03, 0.42, 0.6);                // njihanje odore
  anim.wave(ropeEnds, 'x', 0.05, 0.37, 1.1);             // krajevi konopca
  anim.rot(bowl, 'z', 0.03, 0.33, 0.8);

  anim.wave(backPanels, 'x', 0.012, 0.39, 0.5);          // zadnja pola odore
  anim.rot(mala, 'z', 0.018, 0.62, 0.4);                 // njihanje brojanice
  anim.rot(mala, 'x', 0.014, 0.47, 2.1);                 // (malo, da niz ostane preko odore)

  anim.rot(staff, 'x', 0.0055, 0.31, 0.6);               // sitno pomeranje štapa
  anim.rot(staff, 'z', 0.0045, 0.19, 2.2);

  anim.rot(head, 'x', 0.009, 0.17, 0.9);                 // spušten pogled se tek pomeri

  // Treptaj: poluzatvoren kapak se na trenutak IZDUŽI nadole i zaklopi oko, a
  // gornja ivica mu ostaje u duplji. Sve se računa iz t, ništa se ne pamti.
  for (const [lid, phase] of [[face.lidL, 0.0], [face.lidR, 0.06]]) {
    anim.custom((t) => {
      const k = ((((t + phase) / 6.4) % 1) + 1) % 1;
      const c = k < 0.055 ? Math.sin((k / 0.055) * Math.PI) : 0;
      const sy = LID_SY + c * 0.95;
      lid.scale.y = sy;
      lid.position.y = lidY - (sy - LID_SY) * LID_R;
    });
  }

  return {
    name: 'Brat Tihomir',
    title: 'Monah Praznog Puta',
    blurb: 'Četrnaest godina nije izgovorio nijednu reč, a ipak ga ceo red sluša. Štap koji drži nije oružje sve dok neko ne pokuša da prođe pored njega — a niko još nije prošao.',
    heraldry: { color: C.saffron, sigil: 'ring' },
    eyeY: 1.63,
    group: root,
    update: (t) => anim.tick(t),
  };
}
