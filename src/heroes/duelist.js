// src/heroes/duelist.js — Dorijan Tri Uboda, dvobojac
//
// Silueta: vitka figura u kontrapostu, šešir širokog oboda sa jednim podignutim
// krajem i tri ogromna pera, čipkasta kragna i manžetne, dublet vinske boje sa
// rasecanim rukavima kroz koje se vidi krem podstava, polukružni ogrtač preko
// levog ramena i dugačak rapir čiji vrh počiva na tlu pored stopala.
//
// Junak gleda u +Z, pa je njegova DESNA strana -X (rapir), a LEVA +X (bodež,
// ogrtač). Težina je na desnoj nozi, leva je blago napred i van: desni kuk je
// viši, a ramena su nakrivljena u suprotnom smeru od kukova.
//
// Pokret: svaki deo ima svoju brzinu i fazu, ništa se ne klati uglas. Najveću
// amplitudu nose pera na šeširu; sve ostalo je sitno — leprša ogrtač, tapka vrh
// rapira, prebacuje se težina, mrda se podignuta obrva, trepti čipka na
// manžetnama.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh,
  box, cyl, sphere, cone, torus, lathe, bar, group, curve, strap, chain,
  rivets, rivetRing, makeFace, makeHand, makeBoot, Anim,
} from '../kit.js';

// brzine pokreta — namerno neuporedivi brojevi da se faze nikad ne poklope
const SW_PERO = 1.12;    // njihanje perja (glavni pokret)
const SW_OGRTAC = 0.87;  // paneli ogrtača
const SW_RAPIR = 2.31;   // tapkanje vrha rapira
const SW_TEZINA = 0.41;  // prebacivanje težine
const SW_CIPKA = 3.27;   // treperenje čipke
const SW_DAH = 1.06;     // dah

export function createDuelist() {
  const root = new THREE.Group();
  const anim = new Anim();

  // ------------------------------------------------------------ materijali --
  const skin = Flesh(C.skinPale);
  const skinD = Flesh(0xc9a583);
  const scarM = Flesh(0xd7a58c);
  const wine = Cloth(C.wine);
  const wineD = Cloth(0x3f1220);
  const wineL = Cloth(0x74263c);
  // Krem i čipka su namerno prigušeni: u noćnoj dvorani obasjanoj žeravnicima
  // čista bela tkanina bukne u belu mrlju i pojede svaki šav na sebi.
  const cream = Cloth(0xd2c8ac);
  const creamD = Cloth(0xa89c7f);
  const lace = Cloth(0xd9d2bc);
  const hose = Cloth(0x322c37);
  const hoseD = Cloth(0x241f28);
  const hairM = M(C.hairBlack, { flat: false });
  const hairD = M(0x1a1512, { flat: false });
  const hide = Hide(C.leatherDark);
  const hideL = Hide(C.leather);
  const scuff = M(0x36230f);
  const steel = Metal(C.steel);
  const steelD = Metal(C.steelDark);
  const silver = Metal(C.silver, { roughness: 0.22 });
  const iron = Metal(C.blackIron, { roughness: 0.5 });
  const gold = Metal(C.gold);
  const brass = Metal(C.brass);
  const boneM = M(C.bone);

  // -------------------------------------------------------- pomoćne alatke --
  function rotX(m, a) { m.rotation.x = a; return m; }

  const DOWN = new THREE.Vector3(0, -1, 0);
  const FWD = new THREE.Vector3(0, 0, 1);
  const _aimV = new THREE.Vector3();
  /** Usmerava objekat tako da njegova lokalna -Y osa gleda u dati pravac. */
  function aim(g, dx, dy, dz) {
    g.quaternion.setFromUnitVectors(DOWN, _aimV.set(dx, dy, dz).normalize());
  }
  /** Usmerava objekat tako da njegova lokalna +Z osa gleda u dati pravac. */
  function aimZ(g, dx, dy, dz) {
    g.quaternion.setFromUnitVectors(FWD, _aimV.set(dx, dy, dz).normalize());
  }

  /**
   * Zavrće šaku oko ose drške tako da prsti (lokalni +Z šake) gledaju u dati
   * pravac. aim() na oružju ostavlja slučajan zavrtaj oko sečiva, pa šaka lako
   * ispadne dlanom ka gledaocu — a tada se čita kao ploča, ne kao šaka.
   */
  function fingersToward(hand, hilt, dx, dy, dz) {
    const q = new THREE.Quaternion();
    hilt.getWorldQuaternion(q).invert();
    const v = new THREE.Vector3(dx, dy, dz).applyQuaternion(q);
    hand.rotation.y = Math.atan2(v.x, v.z);
  }

  /**
   * Dopuna kit-šake: obla masa iza prstiju. Bez nje se između članaka vidi
   * pozadina i šaka se čita kao naslagane kocke.
   */
  function knitHand(h, s) {
    const P = 0.052 * s;
    const back = sphere(P * 1.2, skin, 0, 0, -P * 0.5, 10, 8);
    back.scale.set(0.86, 1.02, 0.58);
    h.add(back);
    // jastuk IZA članaka: prsti ostaju ispred njega kao brazde, a kroz razmake
    // se više ne vidi pozadina
    h.add(box(P * 1.8, P * 1.95, P * 0.34, skin, 0, 0, P * 0.10));
    // oble grudve preko drške — po njima se šaka čita kao četiri savijena prsta
    for (let i = 0; i < 4; i++) {
      const k = sphere(P * 0.30, skin, 0, P * (0.78 - i * 0.52), P * 0.52, 7, 6);
      k.scale.set(1.6, 0.88, 0.92);
      h.add(k);
    }
    // članci se skraćuju po osi prsta — kit-prsti su dvaput duži od drške
    h.scale.set(0.78, 1, 1);
  }

  /**
   * Dvočlani ud (rame → lakat → zglob) kao lanac grupa, sa laktom izbačenim u
   * smeru bendRef. Vraća zglobove da animacija može da ih vrti nezavisno.
   */
  function limb(parent, S, W, L1, L2, bendRef) {
    const s = new THREE.Vector3(S[0], S[1], S[2]);
    const w = new THREE.Vector3(W[0], W[1], W[2]);
    const d = new THREE.Vector3().subVectors(w, s);
    let len = d.length();
    const maxLen = (L1 + L2) * 0.98;
    if (len > maxLen) { d.multiplyScalar(maxLen / len); w.copy(s).add(d); len = maxLen; }
    const dir = d.clone().divideScalar(len);
    const a = (len * len + L1 * L1 - L2 * L2) / (2 * len);
    const h = Math.sqrt(Math.max(1e-6, L1 * L1 - a * a));
    const perp = new THREE.Vector3(bendRef[0], bendRef[1], bendRef[2]);
    perp.sub(dir.clone().multiplyScalar(perp.dot(dir)));
    if (perp.lengthSq() < 1e-8) perp.set(0, -1, 0);
    perp.normalize();
    const E = s.clone().addScaledVector(dir, a).addScaledVector(perp, h);

    const sh = new THREE.Group();
    sh.position.copy(s);
    parent.add(sh);
    const dSE = new THREE.Vector3().subVectors(E, s);
    aim(sh, dSE.x, dSE.y, dSE.z);

    const el = new THREE.Group();
    el.position.set(0, -dSE.length(), 0);
    sh.add(el);
    const dEW = new THREE.Vector3().subVectors(w, E).applyQuaternion(sh.quaternion.clone().invert());
    aim(el, dEW.x, dEW.y, dEW.z);

    const wr = new THREE.Group();
    wr.position.set(0, -dEW.length(), 0);
    el.add(wr);
    return { sh, el, wr, l1: dSE.length(), l2: dEW.length() };
  }

  /**
   * Venac čipke — nazubljeni listići u krug. Svaki listić visi na svom kraku
   * (grupa zarotirana oko Y), pa se naginje RADIJALNO, ka spolja: ako se nagne
   * preko rotation.x na samom listiću, nagib ostaje u svetskoj ravni, te pola
   * venca padne u vrat a pola štrči u vazduh — tako je i izgledalo.
   * Listići su izduženi nadole i širi od koraka, da se preklapaju umesto da
   * između njih zjapi rupa. Sve u svojoj grupi, da ceo venac može da trepti.
   */
  function laceRing(y, r, count, w, len, tilt, phase, mat) {
    const g = group([], 0, y, 0);
    for (let i = 0; i < count; i++) {
      const a = phase + (i / count) * Math.PI * 2;
      const k = i % 2 ? 1 : 0.74;                      // nazubljen rub
      const spoke = new THREE.Group();
      spoke.rotation.y = a;
      g.add(spoke);
      const p = box(w, len * k, 0.011, mat, 0, -len * k * 0.44, r);
      p.rotation.x = tilt;
      spoke.add(p);
    }
    return g;
  }

  /**
   * Pero: savijen kalem (curve) i niz spljoštenih boksova po istoj krivoj.
   * Vraća grupu da bi celo pero moglo da se njiše oko svog korena.
   */
  function feather(base, tipRel, bulge, n, w, matA, matB, roll) {
    const g = group([], base[0], base[1], base[2]);
    g.add(curve([0, 0, 0], tipRel, bulge, boneM, 0.0095, 0.0025, 5));
    const K = [tipRel[0] * 0.5 + bulge[0], tipRel[1] * 0.5 + bulge[1], tipRel[2] * 0.5 + bulge[2]];
    const at = (t) => {
      const u = 1 - t;
      return [2 * u * t * K[0] + t * t * tipRel[0],
        2 * u * t * K[1] + t * t * tipRel[1],
        2 * u * t * K[2] + t * t * tipRel[2]];
    };
    // Listovi peruške moraju da se PREKLAPAJU: kad su dugi kao korak po krivoj,
    // pero se raspadne na niz odvojenih daščica.
    const span = Math.hypot(tipRel[0], tipRel[1], tipRel[2]) * 1.12;
    const leaf = (span / n) * 1.9;
    let prev = at(0);
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      const p = at(t);
      const wid = w * (0.30 + Math.sin(t * Math.PI * 0.94) * 1.0);
      const q = box(wid, 0.0095, leaf, i % 2 ? matA : matB, p[0], p[1], p[2]);
      aimZ(q, p[0] - prev[0], p[1] - prev[1], p[2] - prev[2]);
      q.rotateZ(roll * (0.4 + t));       // pero se uvija ka vrhu
      g.add(q);
      prev = p;
    }
    return g;
  }

  // ============================================================ NOGE ========
  // Desna noga (-X) nosi težinu i skoro je prava; leva (+X) je napred i van.
  const legR = { hip: [-0.100, 0.855, 0.000], knee: [-0.117, 0.475, 0.010], ankle: [-0.121, 0.150, 0.018] };
  const legL = { hip: [0.098, 0.840, 0.008], knee: [0.150, 0.465, 0.088], ankle: [0.176, 0.150, 0.152] };

  function buildLeg(L, s) {
    const g = new THREE.Group();
    g.add(bar(L.hip, L.knee, 0.077, hose, 10, 0.055));                       // butina
    g.add(sphere(0.055, hose, L.knee[0], L.knee[1], L.knee[2], 10, 8));      // koleno
    g.add(bar(L.knee, L.ankle, 0.053, hose, 10, 0.040));                     // list
    // šav sa spoljne strane nogavice
    g.add(bar([L.hip[0] + s * 0.07, L.hip[1] - 0.02, L.hip[2]],
      [L.knee[0] + s * 0.05, L.knee[1] + 0.02, L.knee[2]], 0.008, hoseD, 5));
    // nabori na butini — gola cev čita se kao cev, a ne kao pletena čarapa
    for (let i = 0; i < 3; i++) {
      const t = 0.20 + i * 0.19;
      const px = L.hip[0] + (L.knee[0] - L.hip[0]) * t;
      const py = L.hip[1] + (L.knee[1] - L.hip[1]) * t;
      const pz = L.hip[2] + (L.knee[2] - L.hip[2]) * t;
      const r = 0.077 + (0.055 - 0.077) * t;
      const wr = box(0.022, 0.040, 0.014, hoseD, px + s * r * 0.52, py, pz + r * 0.74);
      wr.rotation.y = -s * 0.62;
      g.add(wr);
    }
    // podvezica sa mašnicom ispod kolena
    const gt = torus(0.058, 0.010, wineL, L.knee[0], L.knee[1] - 0.052, L.knee[2] + 0.004, 6, 14);
    gt.rotation.x = Math.PI / 2 - 0.08;
    g.add(gt);
    g.add(box(0.028, 0.014, 0.011, wineL, L.knee[0] + s * 0.05, L.knee[1] - 0.052, L.knee[2] + 0.038));
    g.add(box(0.02, 0.011, 0.009, wineL, L.knee[0] + s * 0.062, L.knee[1] - 0.072, L.knee[2] + 0.034));
    return g;
  }
  root.add(buildLeg(legR, -1));
  root.add(buildLeg(legL, 1));

  // ---------------------------------------------------------- ČIZME --------
  // Visoke, sa zavrnutom širokom sarom i mamuzom na peti.
  function buildBoot(x, z, rotY) {
    const g = new THREE.Group();
    // Bez kit-manžetne: njena kutija 0.173×0.194 uglovima je izlazila iz oble
    // sare i čitala se kao zalepljen sanduk sa strane čizme.
    g.add(makeBoot({ mat: hide, sole: Hide(0x33210f), buckle: brass, s: 1.02 }));
    g.add(cyl(0.086, 0.091, 0.155, hide, 0, 0.265, -0.028, 12));          // obla sara preko kutije stopala
    g.add(cyl(0.084, 0.086, 0.052, hideL, 0, 0.360, -0.024, 12));         // pojas sare
    g.add(rotX(torus(0.086, 0.008, Hide(0x3a2517), 0, 0.386, -0.024, 5, 16), Math.PI / 2));
    g.add(cyl(0.079, 0.088, 0.20, hide, 0, 0.40, -0.012, 11));            // sara do kolena
    g.add(box(0.02, 0.19, 0.014, Hide(0x3a2517), 0.072, 0.40, 0.0));      // bočni šav sare
    g.add(rotX(torus(0.082, 0.009, Hide(0x3a2517), 0, 0.318, -0.012, 5, 14), Math.PI / 2));
    // Zavrnut obod sare. Grlo je ZATVORENO konusom do noge — pređašnji obod je
    // bio širok kao levak, pa se između cevanice i oboda videla pozadina.
    const cuff = cyl(0.101, 0.086, 0.092, hideL, 0, 0.425, -0.008, 13);
    cuff.rotation.x = -0.05;
    g.add(cuff);
    g.add(cyl(0.090, 0.080, 0.055, Hide(0x8d7a52), 0, 0.446, -0.008, 12));  // podstava iznutra
    g.add(cyl(0.057, 0.089, 0.042, hide, 0, 0.452, -0.008, 12));            // unutrašnji zid grla
    g.add(rotX(torus(0.099, 0.011, hide, 0, 0.468, -0.008, 6, 18), Math.PI / 2 - 0.05));
    g.add(box(0.082, 0.05, 0.018, hideL, 0, 0.452, 0.082));               // šiljak oboda napred
    g.add(box(0.036, 0.022, 0.012, brass, 0, 0.352, 0.082));              // kopča na sari
    g.add(box(0.112, 0.008, 0.008, Hide(0x3a2517), 0, 0.19, 0.055));      // šav preko stopala
    g.add(box(0.026, 0.007, 0.045, scuff, -0.045, 0.135, 0.06));          // ogrebotina na koži
    // mamuza: kaišić, vilica i zvezdasti kolut
    g.add(strap([[-0.072, 0.10, -0.03], [0, 0.135, -0.06], [0.072, 0.10, -0.03]], 0.008, hideL));
    g.add(bar([-0.04, 0.09, -0.08], [0, 0.085, -0.135], 0.008, iron, 6));
    g.add(bar([0.04, 0.09, -0.08], [0, 0.085, -0.135], 0.008, iron, 6));
    const rowel = torus(0.026, 0.006, steelD, 0, 0.085, -0.155, 6, 12);
    rowel.rotation.y = Math.PI / 2;
    g.add(rowel);
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + 0.4;
      g.add(box(0.006, 0.016, 0.006, steelD, 0, 0.085 + Math.cos(a) * 0.026, -0.155 + Math.sin(a) * 0.026));
    }
    g.position.set(x, 0, z);
    g.rotation.y = rotY;
    return g;
  }
  root.add(buildBoot(legR.ankle[0], legR.ankle[2] - 0.006, -0.16));
  root.add(buildBoot(legL.ankle[0], legL.ankle[2] + 0.004, 0.44));

  // ============================================================ KUKOVI =====
  // Levi kuk je niži (težina je na desnoj nozi).
  const hips = group([], 0, 0.872, 0.004);
  hips.rotation.z = -0.055;
  hips.rotation.y = 0.07;
  root.add(hips);

  hips.add(box(0.245, 0.155, 0.165, hide, 0, 0, 0));                      // karlica
  // Pumpaste čakšire sa rasečenim trakama. Trake leže NA lopti čakšira (r malo
  // veći od poluprečnika lopte na svojoj visini) — ranije su visile ispod nje
  // kao odvojene daščice u vazduhu.
  for (const s of [1, -1]) {
    const puff = sphere(0.101, wine, s * 0.072, -0.055, 0.004, 11, 9);
    puff.scale.set(1, 0.86, 0.95);
    hips.add(puff);
    for (let i = 0; i < 4; i++) {
      const a = -0.78 + i * 0.52;
      const st = box(0.021, 0.095, 0.017, i % 2 ? cream : wineD,
        s * 0.072 + Math.sin(a) * 0.086, -0.0675, 0.004 + Math.cos(a) * 0.081);
      st.rotation.y = a;
      hips.add(st);
    }
    hips.add(rotX(torus(0.082, 0.009, wineD, s * 0.075, -0.118, 0.004, 6, 14), Math.PI / 2));
    hips.add(box(0.055, 0.02, 0.09, wineD, s * 0.086, -0.126, 0.01));     // rub nogavice
  }

  // Ušiven pojas sa kopčom. Presek je OVALAN kao trup: pun krug poluprečnika
  // 0.15 stajao je 6 cm od tela napred i nazad, kao obruč na bačvi.
  const BZ = 0.62;
  const belt = cyl(0.148, 0.152, 0.056, hideL, 0, 0.036, 0, 16);
  belt.scale.z = BZ; hips.add(belt);
  for (const by of [0.064, 0.008]) {
    const rim = rotX(torus(0.153, 0.010, hide, 0, by, 0, 6, 18), Math.PI / 2);
    rim.scale.y = BZ; hips.add(rim);                                      // posle rotX lokalni Y je svetski Z
  }
  hips.add(rivetRing(0.152, 7, 0.010, brass, 0.036, BZ, 0.25));
  hips.add(box(0.066, 0.06, 0.02, gold, 0, 0.036, 0.093));                // kopča
  hips.add(box(0.04, 0.038, 0.028, hide, 0, 0.036, 0.098));
  hips.add(box(0.012, 0.05, 0.024, gold, 0, 0.036, 0.108));               // jezičak
  hips.add(box(0.03, 0.03, 0.012, brass, -0.062, 0.036, 0.086));
  // kosi kaiš koji nosi korice bodeža — prati istu ovalnu liniju
  hips.add(strap([[-0.132, 0.09, 0.052], [0.01, 0.032, 0.094], [0.142, 0.05, 0.044], [0.186, 0.05, 0.014]], 0.013, hide));
  hips.add(box(0.028, 0.028, 0.014, brass, 0.142, 0.05, 0.046));

  // kožne rukavice zadenute za pojas, sa desne strane
  const gloves = group([], -0.125, 0.02, 0.09);
  gloves.rotation.set(0.2, -0.3, 0.35);
  hips.add(gloves);
  gloves.add(box(0.052, 0.09, 0.024, hideL, 0, -0.03, 0));
  gloves.add(box(0.048, 0.085, 0.022, Hide(0x8a6238), 0.01, -0.045, 0.016));
  for (let i = 0; i < 2; i++) {
    gloves.add(box(0.014, 0.038, 0.016, hideL, -0.012 + i * 0.022, -0.098, 0.006));
  }
  gloves.add(box(0.056, 0.018, 0.026, hide, 0, 0.014, 0.002));            // manžetna rukavice

  // kesa na desnom kuku
  const purse = group([], -0.15, -0.045, 0.02);
  purse.rotation.z = -0.2;
  hips.add(purse);
  const pb = sphere(0.048, hideL, 0, -0.022, 0, 10, 8);
  pb.scale.set(1, 1.12, 0.7);
  purse.add(pb);
  purse.add(cyl(0.028, 0.038, 0.026, hide, 0, 0.032, 0, 9));
  purse.add(rotX(torus(0.03, 0.006, wineL, 0, 0.04, 0, 5, 12), Math.PI / 2));
  purse.add(bar([-0.028, 0.046, 0], [0.028, 0.046, 0], 0.005, wineL));
  purse.add(sphere(0.009, gold, 0.012, -0.05, 0.028, 6, 5));

  // ============================================================ TRUP =======
  // Ramena su nakrivljena i zaokrenuta suprotno od kukova — teatralna poza.
  const torso = group([], 0, 0.985, 0.006);
  torso.rotation.set(-0.035, 0.16, 0.052);
  root.add(torso);

  const chest = new THREE.Group();     // samo grudni koš diše
  torso.add(chest);

  // dublet: vitak, sa ušitim strukom
  chest.add(box(0.225, 0.145, 0.155, wine, 0, 0.05, 0));
  chest.add(box(0.288, 0.185, 0.182, wine, 0, 0.195, 0.002));
  chest.add(box(0.268, 0.09, 0.172, wine, 0, 0.30, 0.004));
  for (const s of [1, -1]) {
    const pec = sphere(0.072, wine, s * 0.058, 0.245, 0.07, 9, 8);
    pec.scale.set(1, 0.7, 0.5);
    chest.add(pec);
    const roll = sphere(0.058, wineL, s * 0.152, 0.355, 0.004, 9, 8);
    roll.scale.set(0.9, 0.76, 1.0);
    chest.add(roll);
    // Rasečeni prorezi: tamna raseklina pa uža podstava u njoj. Same krem
    // daščice na licu dubleta čitale su se kao nalepljene crtice.
    for (let i = 0; i < 3; i++) {
      const sx = s * (0.048 + i * 0.036);
      const hh = 0.062 - i * 0.008;
      chest.add(box(0.021, hh, 0.007, wineD, sx, 0.222, 0.0925));
      chest.add(box(0.011, hh - 0.014, 0.010, creamD, sx, 0.222, 0.0945));
    }
    chest.add(box(0.019, 0.05, 0.007, wineD, s * 0.086, 0.115, 0.0895));
    chest.add(box(0.010, 0.036, 0.010, creamD, s * 0.086, 0.115, 0.0915));
    chest.add(bar([s * 0.118, 0.115, 0.086], [s * 0.122, 0.325, 0.078], 0.006, creamD, 6));  // šav na licu
    chest.add(box(0.145, 0.018, 0.185, wineD, s * 0.07, -0.018, 0.002));                    // opšiv ruba
    chest.add(box(0.02, 0.03, 0.175, wineD, s * 0.128, 0.05, 0.0));
    // zakošen prednji ugao — trup nije ravna kutija
    const bev = box(0.058, 0.20, 0.028, wineL, s * 0.110, 0.195, 0.062);
    bev.rotation.y = s * 0.66;
    chest.add(bev);
    const bevD = box(0.05, 0.20, 0.024, wineD, s * 0.114, 0.195, -0.062);
    bevD.rotation.y = -s * 0.60;
    chest.add(bevD);
  }
  // pesice (jezičci) dubleta oko struka
  for (let i = 0; i < 6; i++) {
    const a = -1.05 + i * 0.42;
    const tab = box(0.052, 0.058, 0.02, wineL, Math.sin(a) * 0.128, -0.044, Math.cos(a) * 0.10);
    tab.rotation.y = a;
    tab.rotation.x = 0.12;
    chest.add(tab);
  }
  // srednji šav sa opšivom i redom sitnih dugmadi
  chest.add(box(0.026, 0.36, 0.024, creamD, 0, 0.16, 0.092));
  chest.add(box(0.012, 0.34, 0.008, wineD, 0.02, 0.16, 0.104));
  for (let i = 0; i < 8; i++) {
    chest.add(sphere(0.0095, gold, 0, 0.005 + i * 0.045, 0.106, 7, 6));
  }
  chest.add(box(0.024, 0.34, 0.024, creamD, 0, 0.17, -0.088));            // šav po sredini leđa
  chest.add(rivets([-0.115, 0.29, 0.058], [0.115, 0.29, 0.058], 5, 0.005, creamD));
  chest.add(rivets([-0.10, 0.20, -0.09], [0.10, 0.20, -0.09], 4, 0.005, wineD));

  // Vrat, grlo i ključne kosti. Vrat je izdužen do vilice — ranije mu je vrh
  // stajao 5 cm ispod brade, a tu prazninu je slučajno krila bradica.
  chest.add(cyl(0.045, 0.053, 0.145, skin, 0, 0.425, 0.008, 10));
  const throat = sphere(0.038, skin, 0, 0.398, 0.04, 9, 8);
  throat.scale.set(1, 0.82, 0.7);
  chest.add(throat);
  for (const s of [1, -1]) {
    chest.add(bar([s * 0.013, 0.368, 0.05], [s * 0.104, 0.348, 0.028], 0.010, skin, 6));
    chest.add(sphere(0.016, skin, s * 0.111, 0.346, 0.026, 7, 6));
  }
  chest.add(cyl(0.075, 0.082, 0.04, wineD, 0, 0.372, 0.008, 12));         // okovratnik dubleta

  // ------------------------------------------------- čipkasta kragna -------
  // Tri sloja nazubljenih listića koji padaju preko okovratnika. Venac počinje
  // UZ vrat (traka poluprečnika kao vrat) i širi se nadole; ranije je ležao
  // vodoravno na grudima kao razbacana hrpa daščica, a vrat je ostajao gol.
  const collar = group([], 0, 0.422, 0.006);
  chest.add(collar);
  collar.add(cyl(0.052, 0.070, 0.058, lace, 0, -0.004, 0, 14));           // traka uz vrat
  collar.add(rotX(torus(0.053, 0.007, lace, 0, 0.024, 0, 5, 14), Math.PI / 2));
  const collarRings = [
    laceRing(0.014, 0.068, 11, 0.046, 0.046, -0.60, 0.10, lace),
    laceRing(-0.006, 0.082, 12, 0.050, 0.052, -0.76, 0.42, lace),
    laceRing(-0.030, 0.094, 12, 0.054, 0.056, -0.95, 0.95, lace),
  ];
  for (const r of collarRings) collar.add(r);
  // vezica sa kićankama pod grlom
  collar.add(bar([-0.026, 0.012, 0.056], [0.026, 0.012, 0.056], 0.005, lace));
  collar.add(sphere(0.011, lace, -0.030, -0.016, 0.062, 7, 6));
  collar.add(sphere(0.011, lace, 0.030, -0.016, 0.062, 7, 6));

  // ============================================================ OGRTAČ =====
  // Polukružni, preko levog (+X) ramena, tri panela koja leprša.
  const cloak = group([], 0.045, 0.362, -0.03);
  torso.add(cloak);
  const cloakPanels = [];
  for (let i = 0; i < 3; i++) {
    const a = 0.30 + i * 0.62;                       // od levog ramena preko leđa
    const px = Math.cos(a) * 0.15;
    const pz = -Math.sin(a) * 0.095 - 0.02;
    const len = 0.66 - 0.13 * i;
    const pg = group([], px, 0.01, pz);
    pg.rotation.y = Math.PI / 2 - a;
    pg.rotation.x = 0.06;
    pg.rotation.z = -0.05 + i * 0.05;
    cloak.add(pg);
    pg.add(box(0.135, len, 0.026, wine, 0, -len / 2, 0));                 // lice panela
    // Podstava se vidi samo kao ZAVRNUT rub. Cela ploča krem tkanine na licu
    // panela čitala se kao list papira zalepljen na ogrtač.
    pg.add(box(0.128, len * 0.97, 0.014, wineD, 0, -len / 2 - 0.004, -0.018));
    pg.add(box(0.030, len * 0.92, 0.013, creamD, -0.052, -len / 2 - 0.008, 0.016));
    pg.add(box(0.014, len * 0.94, 0.020, wineD, -0.066, -len / 2 - 0.004, 0.010));
    pg.add(box(0.142, 0.03, 0.034, wineD, 0, -len, 0));                   // opšiv ruba
    pg.add(box(0.014, len * 0.9, 0.03, wineD, 0.058, -len / 2, 0.002));   // šav
    // nabori — panel nije ravna daska
    for (let j = 0; j < 2; j++) {
      const f = box(0.016, len * 0.86, 0.022, wineL, -0.012 + j * 0.042, -len / 2 - 0.02, 0.014);
      f.rotation.z = (j ? 1 : -1) * 0.035;
      pg.add(f);
    }
    cloakPanels.push(pg);
  }
  // naramenica ogrtača preko levog ramena
  for (let i = 0; i < 3; i++) {
    const t = i / 2;
    const m = box(0.085, 0.05, 0.135 - t * 0.03, wine, 0.02 + t * 0.135, 0.045 - t * 0.06, -0.005 + t * 0.03);
    m.rotation.z = -0.45 - t * 0.4;
    cloak.add(m);
  }
  cloak.add(bar([0.01, 0.05, 0.04], [0.19, -0.035, 0.02], 0.008, creamD, 6));

  // zlatna kopča na desnoj strani grudi
  const clasp = group([], -0.135, 0.0, 0.082);
  cloak.add(clasp);
  clasp.add(torus(0.025, 0.008, gold, 0, 0, 0, 6, 14));
  clasp.add(sphere(0.013, Metal(C.wine, { roughness: 0.25 }), 0, 0, 0.008, 8, 7));
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    clasp.add(box(0.007, 0.017, 0.006, gold, Math.sin(a) * 0.029, Math.cos(a) * 0.029, 0));
  }
  cloak.add(chain([-0.12, 0.012, 0.088], [0.05, 0.05, 0.055], 4, 0.010, gold));

  // ============================================================ GLAVA ======
  const neckPivot = group([], 0, 0.44, 0.006);
  torso.add(neckPivot);
  const head = group([], 0, 0.183, 0.012);      // centar glave ≈ y 1.61
  neckPivot.add(head);

  // Mere lobanje. Svaki dodatak na licu se postavlja UZ ovu površinu preko
  // surf(): kutija koja počinje u vazduhu ispred lica na blizini je daščica.
  const HR = 0.113, HW = 0.94, HT = 1.06, HD = 1.0;
  const surf = (x, y) => {
    const k = 1 - (x / (HR * HW)) ** 2 - (y / (HR * HT)) ** 2;
    return k <= 0.02 ? 0 : HR * HD * Math.sqrt(k);
  };

  const face = makeFace({
    r: HR, skin, tall: HT, wide: HW, deep: HD,
    mouth: 'smile', eye: 0x3a2a1e, brow: C.hairBlack, browAngle: 0.14,
    eyeSize: 0.018, noseWide: 0.7, noseLen: 0.038,
  });
  head.add(face.group);

  // Jagodice: utonule oble grudve, ne ravne ploče zalepljene preko obraza —
  // stare kutije su ivicama izlazile iz obrisa glave pored oka.
  for (const s of [1, -1]) {
    const cb = sphere(0.036, skinD, s * 0.058, -0.008, surf(0.058, -0.008) - 0.026, 9, 7);
    cb.scale.set(1.2, 0.62, 0.55);
    head.add(cb);
    const hollow = sphere(0.030, skinD, s * 0.062, -0.046, surf(0.062, -0.046) - 0.014, 8, 6);
    hollow.scale.set(1.0, 0.8, 0.5);
    head.add(hollow);
  }
  // brada — obla, utonula u vilicu; stara kutija je visila 2 cm ispred lica
  const chinM = sphere(0.038, skin, 0, -0.086, 0.050, 9, 8);
  chinM.scale.set(0.92, 0.78, 0.84);
  head.add(chinM);
  // vrh vrata pod vilicom, da između glave i trupa ne ostane šupljina
  const underJaw = sphere(0.046, skin, 0, -0.114, 0.008, 9, 7);
  underJaw.scale.set(0.86, 0.62, 0.86);
  head.add(underJaw);
  // slepoočnice — spajaju nadočni greben sa lobanjom
  for (const s of [1, -1]) {
    const tp = sphere(0.026, skin, s * 0.086, 0.036, surf(0.086, 0.036) - 0.008, 8, 6);
    tp.scale.set(0.8, 1.1, 0.75);
    head.add(tp);
  }

  // Jedna obrva je podignuta znatno više od druge — podrugljiv izraz. Podignuta
  // obrva mora da se i POMERI ka lobanji, jer je gore lobanja plića.
  face.browL.rotation.z = 0.40;
  face.browL.position.y += 0.019;
  face.browL.position.x -= 0.004;
  face.browL.position.z = surf(Math.abs(face.browL.position.x), face.browL.position.y) - 0.004;
  face.browR.rotation.z = -0.03;
  face.browR.position.y -= 0.005;
  face.browR.position.z = surf(Math.abs(face.browR.position.x), face.browR.position.y) - 0.004;
  // oči: beonjača dublje u duplji, kapak sedne na oko umesto da lebdi nad njim
  for (const e of [face.eyeL, face.eyeR]) e.scale.set(0.92, 0.78, 0.62);
  for (const ir of [face.irisL, face.irisR]) ir.position.z -= 0.003;
  for (const l of [face.lidL, face.lidR]) {
    l.position.y -= 0.005;
    l.position.z += 0.002;
    l.scale.set(1.06, 0.5, 0.9);
  }
  // nos: kraći i uži, da ne bude jaje nalepljeno na sredinu lica
  face.nose.scale.set(0.82, 0.95, 0.9);
  const nostrilM = M(0x8a6146);
  for (const s of [1, -1]) head.add(sphere(0.0055, nostrilM, s * 0.011, -0.0455, 0.1005, 6, 5));
  // poluosmeh, iskošen na jednu stranu — usta izvučena do površine kože
  face.mouth.rotation.z = 0.22;
  face.mouth.rotation.x = -0.30;
  face.mouth.position.x = 0.008;
  face.mouth.position.z = 0.0895;
  face.mouth.scale.set(1.3, 1.7, 1.5);
  const lip = sphere(0.016, skin, 0.004, -0.0835, surf(0, -0.0835) - 0.004, 8, 7);
  lip.scale.set(1.5, 0.66, 0.8);
  head.add(lip);
  head.add(sphere(0.006, skinD, 0.040, -0.069, surf(0.040, -0.069) - 0.003, 6, 5));  // jamica

  // Tanki brčići — niz sitnih pramenova priljubljenih uz gornju usnu, sa
  // uzvijenim vrhovima. Dve daščice u vazduhu ispred lica su otišle.
  for (const s of [1, -1]) {
    for (let i = 0; i < 4; i++) {
      const t = i / 3;
      const mx = s * (0.006 + t * 0.030);
      const my = -0.0525 + t * t * 0.006;
      const seg = box(0.021 - t * 0.005, 0.0105 - t * 0.0025, 0.018,
        i % 2 ? hairD : hairM, mx, my, surf(Math.abs(mx), my) - 0.006);
      seg.rotation.y = -s * (0.30 + t * 0.55);
      seg.rotation.z = s * (0.10 + t * 0.60);
      head.add(seg);
    }
    head.add(sphere(0.0072, hairM, s * 0.041, -0.0405, surf(0.041, -0.0405) - 0.005, 6, 5));
  }
  // Šiljata bradica — pramenovi od donje usne preko brade, pa kratak šiljak.
  // Stari kupasti klin visio je ispod vilice odvojen od lica, kao daščica.
  for (let i = 0; i < 5; i++) {
    const t = i / 4;
    const gy = -0.094 - t * 0.020;
    const seg = box(0.030 - t * 0.015, 0.014, 0.016, i % 2 ? hairM : hairD, 0.001, gy, 0.078 - t * 0.013);
    seg.rotation.x = -0.10 * t;
    head.add(seg);
  }
  for (const s of [1, -1]) {
    const w = box(0.011, 0.030, 0.014, hairD, s * 0.018, -0.080, 0.078);
    w.rotation.z = -s * 0.30;
    head.add(w);
  }
  const goatee = cone(0.012, 0.034, hairM, 0.001, -0.122, 0.062, 6);
  goatee.rotation.x = Math.PI - 0.42;                                     // vrh nadole i ka vratu
  head.add(goatee);

  // tanak ožiljak preko levog (+X) obraza
  const scar = box(0.006, 0.062, 0.006, scarM, 0.07, -0.006, surf(0.07, -0.006) - 0.002);
  scar.rotation.set(0.16, 0, 0.38);
  head.add(scar);
  head.add(box(0.013, 0.005, 0.005, scarM, 0.083, -0.03, surf(0.083, -0.03) - 0.002));

  // Crna kosa, zaglađena, vezana u kratak rep pozadi. Potiljak je obla masa sa
  // pramenovima preko nje — pređašnja kutija 18×15 cm je uglovima izlazila iz
  // obrisa glave i čitala se kao kaciga.
  const hairCap = sphere(0.119, hairM, 0, 0.010, -0.026, 14, 12);
  hairCap.scale.set(1.02, 0.98, 1.02);
  head.add(hairCap);
  const nape = sphere(0.106, hairM, 0, -0.042, -0.056, 12, 10);
  nape.scale.set(1.02, 0.96, 0.88);
  head.add(nape);
  const backMass = sphere(0.105, hairD, 0, -0.03, -0.075, 12, 10);
  backMass.scale.set(1.02, 1.0, 0.82);
  head.add(backMass);
  for (let i = 0; i < 9; i++) {                                           // pramenovi ka potiljku
    const a = 2.05 + i * 0.272;
    const st = box(0.030, 0.064, 0.020, i % 2 ? hairM : hairD,
      Math.sin(a) * 0.106, -0.026 - 0.010 * Math.cos(a * 1.6), -0.022 + Math.cos(a) * 0.098);
    st.rotation.y = a;
    st.rotation.x = -0.16;
    head.add(st);
  }
  for (let i = 0; i < 3; i++) {                                           // pramenovi preko čela
    const fx = -0.05 + i * 0.05;
    const fy = 0.072 - (i % 2) * 0.007;
    const f = box(0.042, 0.028, 0.018, hairD, fx, fy, surf(Math.abs(fx), fy) - 0.007);
    f.rotation.z = 0.28 - i * 0.28;
    head.add(f);
  }
  for (const s of [1, -1]) {                                              // zalisci u dva pramena
    head.add(box(0.014, 0.050, 0.046, hairD, s * 0.100, -0.014, 0.024));
    const lower = box(0.012, 0.028, 0.030, hairM, s * 0.097, -0.052, 0.030);
    lower.rotation.z = s * 0.2;
    head.add(lower);
  }
  // rep: vezica pa savijena kita
  head.add(rotX(torus(0.028, 0.011, wineD, 0, -0.052, -0.128, 6, 12), Math.PI / 2));
  head.add(curve([0, -0.058, -0.135], [0.004, -0.132, -0.212], [0, 0.014, -0.05], hairM, 0.03, 0.014, 4));
  head.add(curve([0, -0.05, -0.13], [-0.03, -0.108, -0.20], [-0.01, 0.01, -0.04], hairD, 0.018, 0.008, 3));
  head.add(sphere(0.01, wineD, 0, -0.072, -0.15, 6, 5));

  // ---------------------------------------------------------- ŠEŠIR -------
  // Nakrivljen: rotacija po Z podiže levu (+X) stranu oboda. Nagib je smanjen
  // sa 0.3 na 0.2 i šešir podignut, jer je spuštena desna strana oboda ulazila
  // ispred desnog oka — jedno oko je bilo u senci, drugo otvoreno.
  const hat = group([], 0, 0.038, -0.014);
  hat.rotation.set(-0.06, 0.24, 0.2);
  head.add(hat);
  // široki obod — telo obrtanja sa zadebljanim rubom
  hat.add(lathe([[0.10, 0.004], [0.165, -0.006], [0.212, -0.004], [0.232, 0.012],
    [0.226, 0.026], [0.19, 0.014], [0.12, 0.018], [0.10, 0.022]], wine, 22));
  hat.add(rotX(torus(0.229, 0.013, wineD, 0, 0.01, 0, 6, 24), Math.PI / 2));
  hat.add(cyl(0.126, 0.142, 0.062, wine, 0, 0.048, 0, 15));               // glava šešira
  const crownTop = sphere(0.126, wine, 0, 0.074, 0, 15, 10);
  crownTop.scale.set(1, 0.25, 1);
  hat.add(crownTop);
  hat.add(box(0.02, 0.022, 0.2, wineD, 0.03, 0.082, 0));                  // pregib na temenu
  hat.add(rotX(torus(0.138, 0.014, cream, 0, 0.028, 0, 6, 20), Math.PI / 2));  // traka
  hat.add(rotX(torus(0.14, 0.006, gold, 0, 0.044, 0, 5, 20), Math.PI / 2));
  hat.add(box(0.038, 0.032, 0.016, gold, 0.03, 0.028, 0.135));            // kopča na traci
  hat.add(box(0.022, 0.02, 0.012, brass, 0.03, 0.028, 0.144));
  hat.add(box(0.44, 0.006, 0.006, creamD, 0, 0.02, 0.07));                // opšiv oboda
  hat.add(box(0.006, 0.006, 0.42, creamD, 0.08, 0.02, 0));
  // podignut kraj oboda, prikačen uz glavu šešira iglom
  const brimUp = group([], 0.0, 0.012, -0.02);
  hat.add(brimUp);
  for (let i = 0; i < 5; i++) {
    const a = 2.0 + i * 0.36;
    const w = box(0.075, 0.014, 0.062, wine, Math.sin(a) * 0.185, 0.018 + i * 0.005, Math.cos(a) * 0.185);
    w.rotation.y = a;
    w.rotation.x = -0.7;
    brimUp.add(w);
  }
  brimUp.add(box(0.06, 0.05, 0.02, wineD, 0.15, 0.058, -0.11));
  brimUp.add(sphere(0.012, gold, 0.14, 0.066, -0.1, 6, 5));               // igla koja drži obod
  brimUp.add(bar([0.16, 0.05, -0.12], [0.075, 0.055, -0.06], 0.005, gold, 5));

  // -------------------------------------------------- OGROMNO PERJE -------
  // Tri pera različitih dužina, u vinskoj i krem boji; njišu se u širokom luku.
  // Ležište je pomereno više i nazad, da prve peruške ne prelaze preko uha.
  const plumeBase = group([], 0.058, 0.042, -0.086);
  plumeBase.rotation.set(0.16, -0.2, 0.1);
  hat.add(plumeBase);
  plumeBase.add(cyl(0.018, 0.024, 0.03, wineD, 0, -0.01, 0.01, 8));       // ležište perja
  plumeBase.add(rotX(torus(0.02, 0.006, gold, 0, 0.006, 0.008, 5, 12), Math.PI / 2));
  for (let i = 0; i < 4; i++) {                                           // rozeta od trake
    const a = (i / 4) * Math.PI * 2 + 0.3;
    const pt = box(0.026, 0.010, 0.020, wineL, Math.sin(a) * 0.022, 0.004, 0.008 + Math.cos(a) * 0.022);
    pt.rotation.y = a;
    plumeBase.add(pt);
  }

  const feathers = [
    feather([0.0, 0.008, 0.0], [0.05, -0.15, -0.50], [0.03, 0.13, -0.06], 10, 0.062, cream, creamD, 0.35),
    feather([0.012, 0.0, -0.012], [0.20, -0.19, -0.36], [0.10, 0.11, -0.04], 9, 0.056, wine, wineL, -0.3),
    feather([-0.014, 0.002, -0.006], [-0.13, -0.20, -0.29], [-0.06, 0.09, -0.03], 8, 0.05, wineL, cream, 0.45),
  ];
  for (const f of feathers) plumeBase.add(f);

  // ============================================================ RAPIR ======
  // Lokalni prostor: osa drške je Y, sečivo ide u -Y, jabuka u +Y.
  // Vrh počiva na tlu pored desnog stopala.
  const GRIP = [-0.315, 1.03, 0.155];
  const TIP = [-0.47, 0.02, 0.40];
  const rapier = group([], GRIP[0], GRIP[1], GRIP[2]);
  aim(rapier, TIP[0] - GRIP[0], TIP[1] - GRIP[1], TIP[2] - GRIP[2]);
  root.add(rapier);
  const LEN = Math.hypot(TIP[0] - GRIP[0], TIP[1] - GRIP[1], TIP[2] - GRIP[2]);

  // uvijena drška sa žicom
  rapier.add(cyl(0.016, 0.0145, 0.115, hide, 0, 0.005, 0, 9));
  for (let i = 0; i < 6; i++) {
    const w = torus(0.0168, 0.0035, brass, 0, -0.04 + i * 0.017, 0, 5, 12);
    w.rotation.x = Math.PI / 2 - 0.22;
    rapier.add(w);
  }
  rapier.add(cyl(0.019, 0.018, 0.012, gold, 0, 0.066, 0, 10));            // ovratnik
  rapier.add(sphere(0.027, gold, 0, 0.086, 0, 10, 8));                    // jabuka
  rapier.add(rotX(torus(0.02, 0.005, brass, 0, 0.086, 0, 5, 12), Math.PI / 2));
  rapier.add(sphere(0.009, brass, 0, 0.106, 0, 7, 6));                    // kapica jabuke
  rapier.add(cyl(0.019, 0.017, 0.016, gold, 0, -0.058, 0, 10));           // ovratnik pod drškom

  // razrađen košarasti štitnik: krstnica, luk preko prstiju, savijene šipke
  rapier.add(bar([-0.108, -0.084, 0.012], [0.108, -0.084, -0.012], 0.0085, gold, 7));
  rapier.add(sphere(0.014, gold, -0.112, -0.084, 0.013, 8, 6));
  rapier.add(sphere(0.014, gold, 0.112, -0.084, -0.013, 8, 6));
  rapier.add(curve([-0.112, -0.084, 0.013], [-0.13, -0.05, 0.052], [-0.02, 0.012, 0.02], gold, 0.008, 0.006, 2));
  rapier.add(curve([0.112, -0.084, -0.013], [0.128, -0.046, -0.054], [0.02, 0.014, -0.02], gold, 0.008, 0.006, 2));
  // luk preko prstiju, od krstnice do jabuke
  rapier.add(curve([0.104, -0.082, 0.0], [0.006, 0.062, 0.0], [0.09, 0.01, 0.005], gold, 0.0085, 0.007, 4));
  // obruč u osnovi korpe i pet šipki koje se šire ka krstnici
  const basketRing = torus(0.052, 0.0075, gold, 0, -0.052, 0, 6, 16);
  basketRing.rotation.x = Math.PI / 2;
  rapier.add(basketRing);
  for (let i = 0; i < 5; i++) {
    const a = -0.25 + i * 0.72;
    rapier.add(curve(
      [Math.sin(a) * 0.05, -0.05, Math.cos(a) * 0.05],
      [Math.sin(a) * 0.098, -0.086, Math.cos(a) * 0.098],
      [Math.sin(a) * 0.055, 0.014, Math.cos(a) * 0.055],
      gold, 0.0075, 0.006, 2));
  }
  // prsten ispod krstnice (pas d'âne)
  const pasdane = torus(0.026, 0.006, gold, 0.03, -0.10, 0, 5, 14);
  pasdane.rotation.y = Math.PI / 2;
  pasdane.rotation.z = 0.25;
  rapier.add(pasdane);
  rapier.add(box(0.022, 0.05, 0.014, steelD, 0, -0.108, 0));              // ricasso

  // tanko dugo sečivo
  rapier.add(bar([0, -0.125, 0], [0, -0.58, 0], 0.0125, steel, 6, 0.0092));
  rapier.add(bar([0, -0.58, 0], [0, -LEN + 0.012, 0], 0.0092, steel, 6, 0.0022));
  // Srednje rebro u DVA suženja: jedno rebro dubine 0.019 duž celog sečiva
  // izlazilo je iz njega i čitalo se kao druga, tanja oštrica pored prve.
  rapier.add(box(0.0045, 0.29, 0.015, silver, 0, -0.27, 0));
  rapier.add(box(0.0035, 0.30, 0.008, silver, 0, -0.57, 0));
  const rapTip = cone(0.0035, 0.02, silver, 0, -LEN + 0.003, 0, 6);
  rapTip.rotation.x = Math.PI;
  rapier.add(rapTip);

  // Desna šaka drži dršku (osa drške je Y osa šake, jabuka ostaje uz zglob).
  // Manja je nego pre: kit-šaka na 0.99 bila je široka pola glave.
  const handR = makeHand({ skin, pose: 'grip', side: 1, s: 0.86 });
  rapier.add(handR);
  fingersToward(handR, rapier, 0.55, 0.10, 1);
  knitHand(handR, 0.86);

  // ================================================== MAIN-GAUCHE ==========
  // Kratki bodež u koricama o levom kuku; leva šaka počiva na njegovoj drški.
  const DHILT = [0.222, 1.008, 0.078];
  const dagger = group([], DHILT[0], DHILT[1], DHILT[2]);
  aim(dagger, 0.12, -0.90, -0.42);      // korice leže uz levi kuk, nagnute nazad
  root.add(dagger);

  dagger.add(cyl(0.0145, 0.013, 0.085, hide, 0, 0.005, 0, 8));            // drška
  for (let i = 0; i < 4; i++) {
    const w = torus(0.0152, 0.003, brass, 0, -0.026 + i * 0.018, 0, 5, 10);
    w.rotation.x = Math.PI / 2 - 0.2;
    dagger.add(w);
  }
  dagger.add(sphere(0.021, gold, 0, 0.062, 0, 9, 8));                     // jabuka
  dagger.add(sphere(0.007, brass, 0, 0.078, 0, 6, 5));
  dagger.add(cyl(0.016, 0.015, 0.01, gold, 0, 0.046, 0, 9));
  // sopstveni, manji štitnik
  dagger.add(bar([-0.062, -0.055, 0.008], [0.062, -0.055, -0.008], 0.0075, gold, 7));
  dagger.add(sphere(0.011, gold, -0.065, -0.055, 0.009, 7, 6));
  dagger.add(sphere(0.011, gold, 0.065, -0.055, -0.009, 7, 6));
  dagger.add(curve([0.062, -0.055, 0.0], [0.004, 0.04, 0.0], [0.058, 0.008, 0.004], gold, 0.0075, 0.006, 3));
  const dRing = torus(0.03, 0.0055, gold, 0, -0.062, 0, 5, 14);
  dRing.rotation.x = Math.PI / 2;
  dagger.add(dRing);
  for (let i = 0; i < 2; i++) {
    const a = -0.4 + i * 0.8;
    dagger.add(curve(
      [Math.sin(a) * 0.028, -0.06, Math.cos(a) * 0.028],
      [Math.sin(a) * 0.06, -0.052, Math.cos(a) * 0.06],
      [Math.sin(a) * 0.035, 0.014, Math.cos(a) * 0.035],
      gold, 0.0065, 0.005, 2));
  }
  // korice
  dagger.add(cyl(0.026, 0.02, 0.27, hideL, 0, -0.212, 0, 9));
  dagger.add(cyl(0.029, 0.028, 0.03, hide, 0, -0.086, 0, 9));             // grlić korica
  dagger.add(rotX(torus(0.027, 0.007, hide, 0, -0.2, 0, 5, 12), Math.PI / 2));
  dagger.add(rotX(torus(0.024, 0.007, hide, 0, -0.29, 0, 5, 12), Math.PI / 2));
  const dTip = cone(0.02, 0.05, iron, 0, -0.36, 0, 8);
  dTip.rotation.x = Math.PI;
  dagger.add(dTip);
  dagger.add(box(0.012, 0.09, 0.03, hide, 0.024, -0.13, 0));              // kaišić na koricama
  dagger.add(box(0.02, 0.016, 0.01, brass, 0.03, -0.10, 0.014));

  const handL = makeHand({ skin, pose: 'grip', side: -1, s: 0.86 });
  handL.position.y = 0.012;
  dagger.add(handL);
  fingersToward(handL, dagger, 0.45, 0.10, 1);
  knitHand(handL, 0.86);

  // ============================================================ RUKE =======
  // Zglobovi ciljaju na mesta gde šake već stoje na oružju.
  root.updateMatrixWorld(true);
  const wp = new THREE.Vector3();
  handR.getWorldPosition(wp);
  const tR = torso.worldToLocal(wp.clone());
  handL.getWorldPosition(wp);
  const tL = torso.worldToLocal(wp.clone());

  const armR = limb(torso, [-0.172, 0.398, 0.004], [tR.x, tR.y, tR.z], 0.242, 0.228, [-0.85, -0.2, -0.5]);
  const armL = limb(torso, [0.172, 0.402, 0.004], [tL.x, tL.y, tL.z], 0.242, 0.228, [0.85, -0.25, -0.55]);

  function dressArm(A) {
    // rame sa napuhanim rukavom i vencem zakivaka
    const puff = sphere(0.075, wineL, 0, -0.04, 0, 11, 9);
    puff.scale.set(1, 0.92, 1);
    A.sh.add(puff);
    A.sh.add(rivetRing(0.07, 5, 0.008, gold, -0.005, 1, 0.2));
    // šavovi rasečenog ramena — inače je puf gola balon-lopta
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2 + 0.4;
      const rib = box(0.013, 0.10, 0.013, wineD, Math.sin(a) * 0.072, -0.036, Math.cos(a) * 0.072);
      rib.rotation.y = a;
      A.sh.add(rib);
      A.sh.add(box(0.008, 0.05, 0.008, creamD, Math.sin(a) * 0.075, -0.052, Math.cos(a) * 0.075));
    }
    // RASECAN RUKAV: naizmenične trake vinske i krem boje po nadlaktici;
    // krem trake su uže od vinskih, da ruka ne izgleda kao zavijena u gazu.
    // Ispod traka ide jedro rukava, da se kroz razmake ne vidi pozadina.
    A.sh.add(cyl(0.051, 0.040, 0.205, wine, 0, -0.150, 0, 11));
    for (let i = 0; i < 6; i++) {
      const r = 0.056 - i * 0.0022;
      A.sh.add(cyl(r, r, i % 2 ? 0.014 : 0.026, i % 2 ? cream : wine, 0, -0.075 - i * 0.029, 0, 10));
      if (i % 2) A.sh.add(cyl(r + 0.001, r + 0.001, 0.005, wineD, 0, -0.075 - i * 0.029 + 0.010, 0, 10));
    }
    A.sh.add(cyl(0.054, 0.054, 0.012, wineD, 0, -0.12, 0, 9));
    A.sh.add(cyl(0.05, 0.05, 0.012, wineD, 0, -0.208, 0, 9));
    A.sh.add(bar([0, -0.06, 0.05], [0, -0.235, 0.045], 0.005, creamD, 5));   // gajtan po rukavu
    // lakat kao zaseban zglob
    A.el.add(sphere(0.047, wine, 0, 0, 0, 10, 8));
    A.el.add(cyl(0.045, 0.034, A.l2 - 0.04, wine, 0, -A.l2 * 0.5 - 0.015, 0, 10));
    A.el.add(box(0.05, 0.032, 0.05, wineD, 0, -0.018, 0));                   // zakrpa na laktu
    A.el.add(bar([0, -0.05, 0.042], [0, -A.l2 + 0.05, 0.032], 0.005, creamD, 5));
    A.el.add(rotX(torus(0.038, 0.008, creamD, 0, -A.l2 + 0.045, 0, 5, 14), Math.PI / 2));
    A.el.add(cyl(0.04, 0.036, 0.05, wineD, 0, -A.l2 + 0.015, 0, 9));         // manžetna rukava
    A.el.add(rivets([-0.02, -0.06, 0.04], [0.02, -0.06, 0.04], 3, 0.005, gold));
    // podlaktica/zglob
    A.wr.add(sphere(0.032, skin, 0, 0.008, 0, 9, 8));
    A.wr.add(cyl(0.03, 0.028, 0.03, skin, 0, 0.024, 0, 8));
    return A;
  }
  dressArm(armR);
  dressArm(armL);

  /**
   * ČIPKASTA MANŽETNA — preliva se iz rukava preko zgloba, na podlaktici da
   * ne ulazi u jabuku oružja. Vraća venac čipke, jer se on trepti.
   */
  function laceCuff(A, phase) {
    const g = group([], 0, 0, 0);
    A.wr.add(g);
    // Manžetna sedi VIŠE od šake (šaka zauzima ±0.047 oko zgloba): dok je bila
    // na samom zglobu, listići čipke su ležali preko prstiju kao krljušt.
    g.add(cyl(0.046, 0.040, 0.038, cream, 0, 0.086, 0, 11));
    g.add(rotX(torus(0.046, 0.006, creamD, 0, 0.104, 0, 5, 14), Math.PI / 2));
    const ring = laceRing(0.062, 0.040, 10, 0.031, 0.042, -0.95, phase, lace);
    g.add(ring);
    return ring;
  }
  const laceR = laceCuff(armR, 0.2);
  const laceL = laceCuff(armL, 0.7);

  // ============================================================ POKRET =====
  // Sve se prijavljuje POSLE zauzimanja mirne poze — Anim pamti zatečene uglove.

  // 1) GLAVNI POKRET: perje se njiše u širokom luku, svako pero svojom fazom
  const fAmp = [0.30, 0.25, 0.20];
  for (let i = 0; i < feathers.length; i++) {
    anim.rot(feathers[i], 'z', fAmp[i], SW_PERO, i * 0.75);
    anim.rot(feathers[i], 'x', fAmp[i] * 0.34, SW_PERO * 0.63, 1.1 + i * 0.5);
  }
  anim.rot(plumeBase, 'z', 0.07, SW_PERO * 0.47, 0.4);

  // 2) ogrtač leprša u panelima — talas putuje kroz tkaninu
  anim.wave(cloakPanels, 'x', 0.075, SW_OGRTAC, 0.5, 0.2);
  anim.wave(cloakPanels, 'z', 0.045, SW_OGRTAC * 1.53, 0.36, 1.2);

  // 3) vrh rapira lagano tapka po kamenu
  anim.pos(rapier, 'y', 0.005, SW_RAPIR, 0.3);
  anim.rot(rapier, 'x', 0.009, SW_RAPIR, 0.3);
  anim.rot(armR.wr, 'x', 0.035, SW_RAPIR, 0.3);
  anim.rot(armR.el, 'z', 0.02, SW_RAPIR * 0.5, 1.0);

  // 4) prebacivanje težine — kukovi i ramena se ljuljaju u protivfazi
  anim.rot(hips, 'z', 0.022, SW_TEZINA, 0.0);
  anim.pos(hips, 'y', 0.005, SW_TEZINA, 0.0);
  anim.rot(torso, 'z', 0.018, SW_TEZINA, Math.PI);
  anim.pos(torso, 'y', 0.006, SW_TEZINA, 0.0);
  anim.rot(root, 'z', 0.007, SW_TEZINA, 0.2);
  anim.rot(armL.sh, 'z', 0.03, SW_TEZINA * 1.3, 0.8);

  // 5) podignuta obrva se mrda, oči trepću, vilica sitno radi
  anim.rot(face.browL, 'z', 0.085, 0.63, 1.1);
  anim.pos(face.browL, 'y', 0.004, 0.63, 1.1);
  anim.blink(face.lidL, 4.6, 0.5, 0.03);
  anim.blink(face.lidR, 4.6, 0.52, 0.03);
  anim.pos(face.jaw, 'y', 0.0035, 0.79, 0.4);

  // 6) čipka trepti — manžetne najbrže, kragna lenjo
  anim.rot(laceR, 'x', 0.11, SW_CIPKA, 0.3);
  anim.rot(laceR, 'z', 0.07, SW_CIPKA * 0.71, 1.6);
  anim.rot(laceL, 'x', 0.095, SW_CIPKA * 0.86, 1.9);
  anim.rot(laceL, 'z', 0.06, SW_CIPKA * 0.6, 0.7);
  for (let i = 0; i < collarRings.length; i++) {
    anim.rot(collarRings[i], 'x', 0.03, 1.43, i * 0.7);
    anim.rot(collarRings[i], 'y', 0.035, 0.97, i * 0.9);
  }

  // 7) dah i glava — kratki pogledi u stranu, brada gore (nadmeno)
  anim.breathe(chest, 0.011, SW_DAH, 0.5);
  anim.scan(neckPivot, 0.13, 8.3, 1.4);
  anim.rot(neckPivot, 'x', 0.022, SW_DAH * 0.53, 0.9);
  anim.rot(neckPivot, 'z', 0.018, 0.71, 2.1);
  anim.rot(hat, 'z', 0.012, 0.58, 0.9);
  anim.rot(gloves, 'x', 0.05, 1.21, 0.6);
  anim.rot(purse, 'z', 0.04, 1.09, 1.7);

  return {
    name: 'Dorijan Tri Uboda',
    title: 'Dvobojac',
    blurb: 'Ime je zaradio jednog jutra u vrtu pod kišom, kada su trojica došla po njegovu čast i nijedan nije stigao da završi rečenicu. Tvrdi da je to bio nesporazum i da on zapravo mrzi rano ustajanje.',
    heraldry: { color: C.wine, sigil: 'rapier' },
    eyeY: 1.62,
    group: root,
    update: (t) => anim.tick(t),
  };
}
