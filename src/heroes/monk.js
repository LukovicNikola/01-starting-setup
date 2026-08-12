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
  const skinP = Flesh(C.skinPale);
  const nailM = M(C.bone, { flat: false, roughness: 0.5 });

  const robeM = Cloth(C.saffron, { side: THREE.DoubleSide });
  const robeIn = Cloth(0x8a5a1a, { side: THREE.DoubleSide });
  const robeTrim = Cloth(0xa9701f);
  const dustM = Cloth(0x8b7a58);

  const wrapM = Cloth(C.ivory);
  const wrapSh = Cloth(0xc6bda6);
  const ropeM = Hide(C.leatherPale);
  const ropeD = Hide(C.leather);
  const thread = Cloth(C.bone);

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

  const face = makeFace({
    skin,
    r: 0.115, tall: 1.06, deep: 0.96,
    eye: 0x3b2b1d, eyeSize: 0.0185,
    brow: 0x241d18, browAngle: 0.04,
    mouth: 'smile',
    noseWide: 0.8, noseLen: 0.026,
  });
  head.add(face.group);

  // Poluzatvoreni kapci: donja ivica kapka pada tačno na sredinu oka, pa
  // treptaj (drop 0.019) zaklopi oko do kraja.
  for (const lid of [face.lidL, face.lidR]) {
    lid.position.y -= 0.011;
    lid.position.z += 0.002;
    lid.scale.set(1.08, 1.15, 1.05);
  }
  // tanke obrve, blago spuštene ka spolja
  for (const b of [face.browL, face.browR]) b.scale.set(1.0, 0.5, 0.75);
  // usta tek nagoveste osmeh
  if (face.mouth) { face.mouth.scale.set(1.15, 0.9, 1); face.mouth.rotation.x = -0.42; }

  // izražene jagodice i borice osmeha
  for (const s of [-1, 1]) {
    const cb = sphere(0.036, skin, s * 0.062, -0.014, 0.082, 8, 7);
    cb.scale.set(1.15, 0.62, 0.9);
    head.add(cb);
    head.add(box(0.008, 0.028, 0.012, skinD, s * 0.05, -0.062, 0.094));   // borica uz usta
    head.add(sphere(0.02, skin, s * 0.104, -0.052, -0.002, 6, 5));        // ušna resica
  }
  head.add(box(0.05, 0.02, 0.016, skinP, 0, -0.096, 0.09));               // brada
  head.add(sphere(0.056, skin, 0, 0.036, -0.088, 9, 8));                 // potiljak

  // tetovaža na temenu: tri koncentrična kruga, tanki torusi malo iznad kože
  const tatY = [0.121, 0.112, 0.098];
  const tatR = [0.03, 0.052, 0.075];
  for (let i = 0; i < 3; i++) {
    const t = torus(tatR[i], 0.0035, ink, 0, tatY[i], -0.004, 5, 22);
    t.rotation.x = Math.PI / 2;
    head.add(t);
  }
  head.add(sphere(0.008, ink, 0, 0.1225, -0.004, 6, 5));                 // tačka u središtu

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

  // traka leži PREKO grudi (prednja strana na z ≈ 0.16), a zadnja joj je ivica
  // utopljena u telo da se šav ne vidi
  const band = new THREE.Group();
  band.rotation.z = 0.6;
  band.position.z = 0.134;
  band.add(box(0.168, 0.66, 0.052, robeM));
  band.add(box(0.019, 0.68, 0.06, robeTrim, 0.088, 0, 0.004));
  band.add(box(0.019, 0.68, 0.06, robeTrim, -0.088, 0, 0.004));
  for (let i = 0; i < 5; i++) {
    band.add(box(0.011, 0.008, 0.018, thread, 0.088, -0.26 + i * 0.13, 0.034));
  }
  band.add(box(0.03, 0.03, 0.02, woodD, 0.06, -0.24, 0.04));            // drveni gumb
  band.add(box(0.026, 0.026, 0.018, woodD, 0.04, 0.19, 0.04));
  sash.add(band);

  // zadnje polje odore i kapa preko levog ramena
  sash.add(box(0.33, 0.6, 0.055, robeM, 0.015, -0.01, -0.115));
  sash.add(box(0.35, 0.022, 0.062, robeTrim, 0.015, 0.28, -0.115));
  sash.add(box(0.35, 0.022, 0.062, robeTrim, 0.015, -0.3, -0.115));
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
  // desni niz prolazi IZA podlaktice koja se penje ka štapu, levi pada ispred
  // dijagonalne trake; oba se sastaju u krupnoj perli iznad donje šake
  const knotPt = [-0.075, 1.13, 0.262];
  const malaR = [
    [0.014, 1.502, -0.075], [0.062, 1.49, -0.05], [0.086, 1.452, 0.022],
    [0.096, 1.4, 0.108], [0.078, 1.33, 0.142], [0.062, 1.27, 0.148],
    [0.04, 1.2, 0.196], [-0.02, 1.155, 0.235], knotPt,
  ];
  const malaL = [
    [-0.014, 1.502, -0.075], [-0.062, 1.49, -0.05], [-0.086, 1.452, 0.022],
    [-0.096, 1.4, 0.108], [-0.102, 1.355, 0.185], [-0.105, 1.26, 0.208],
    [-0.1, 1.19, 0.238], [-0.09, 1.16, 0.252], knotPt,
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
    mala.add(bar([guru[0], guru[1] - 0.022, guru[2]],
      [guru[0] + (i * 2 - 1) * 0.011, guru[1] - 0.058, guru[2] - 0.006], 0.005, thread, 5));
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
  for (let i = 0; i < 4; i++) {
    const t = torus(0.0288, 0.0055, Hide(C.leather), 0, 0.99 + i * 0.082, 0, 6, 14);
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

  const handTop = makeHand({ skin, pose: 'grip', side: 1 });
  handTop.position.set(0, 1.26, 0);
  handTop.rotation.y = -0.34;
  staff.add(handTop);
  handTop.add(box(0.115, 0.024, 0.072, wrapM, 0, 0.03, -0.05));         // povoj preko šake
  handTop.add(box(0.106, 0.02, 0.068, wrapSh, -0.004, -0.032, -0.052));

  const handBot = makeHand({ skin, pose: 'grip', side: -1 });
  handBot.position.set(0, 0.99, 0);
  handBot.rotation.y = 0.34;
  staff.add(handBot);
  handBot.add(box(0.115, 0.024, 0.072, wrapM, 0, 0.03, -0.05));
  handBot.add(box(0.106, 0.02, 0.068, wrapSh, 0.004, -0.032, -0.052));

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
  for (let i = 0; i < 3; i++) ring(uR.g, 0.0555 - i * 0.0026, 0.0075, ink, uR.len * (0.28 + i * 0.115), 6, 16);
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
  ring(uL.g, 0.06, 0.011, robeTrim, uL.len * 0.6, 6, 16);
  ring(uL.g, 0.072, 0.009, robeTrim, uL.len * 0.05, 6, 16);
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
  // Šest nezavisnih pokreta, svaki svoje brzine i faze. Disanje je glavno i
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

  anim.rot(mala, 'z', 0.028, 0.62, 0.4);                 // njihanje brojanice
  anim.rot(mala, 'x', 0.02, 0.47, 2.1);

  anim.rot(staff, 'x', 0.0055, 0.31, 0.6);               // sitno pomeranje štapa
  anim.rot(staff, 'z', 0.0045, 0.19, 2.2);

  anim.rot(head, 'x', 0.009, 0.17, 0.9);                 // spušten pogled se tek pomeri
  anim.blink(face.lidL, 6.4, 0.0, 0.019);                // kapci povremeno padnu do kraja
  anim.blink(face.lidR, 6.4, 0.06, 0.019);

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
