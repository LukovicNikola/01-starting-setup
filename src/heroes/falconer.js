// src/heroes/falconer.js — Ser Kolm od Sivog Sokola, vitez sokolar
//
// Silueta: leva ruka podignuta u stranu i savijena, na debeloj sokolarskoj
// rukavici sedi soko sa kapuljačom; desna ruka opuštena, u njoj smotan povodac.
// Težina je na desnoj nozi, glava blago okrenuta ka ptici, brada uzdignuta.
// Soko je zvezda figure — gradi se sa najviše delova i nosi glavni pokret.
//
// Orijentiri (svet): stopala 0, kolena 0.47, kukovi 0.88, pojas 1.00,
// grudi 1.22, ramena 1.42, brada 1.54, centar glave 1.67, oči 1.68, teme 1.81.

import * as THREE from 'three';
import {
  C, M, Metal, Cloth, Hide, Flesh,
  box, cyl, sphere, cone, torus, lathe, bar, group,
  curve, strap, rivets, rivetRing, chainmail, fringe, edged,
  makeFace, makeHand, makeBoot, Anim, seeded,
} from '../kit.js';

export function createFalconer() {
  const rnd = seeded(90211);              // samo pri gradnji, nikad u update

  // ------------------------------------------------------------ materijali --
  const skin   = Flesh(C.skin);
  const skinD  = Flesh(C.skinTan);
  const hairM  = M(0x7a5730);             // svetlosmeđa kosa do ramena
  const beardM = M(0x8b6839);             // brada nijansu svetlija od kose
  const mailM  = Metal(C.steelDark, { roughness: 0.5 });
  const steelM = Metal(C.steel);
  const ironM  = Metal(C.iron, { roughness: 0.58 });
  const brassM = Metal(C.brass);
  const coatM  = Cloth(C.teal);           // nadkošulja, morska zelena
  const coatD  = Cloth(0x184249);
  const trimM  = M(C.goldPale, { roughness: 0.6, metalness: 0.3 });
  const gambM  = Cloth(0x3a4a49);         // podstava ispod verižnjače
  const hideM  = Hide(C.leather);
  const hideD  = Hide(C.leatherDark);
  const hideP  = Hide(C.leatherPale);
  const hoseM  = Cloth(C.slate);          // jahačke čakšire

  // soko
  const pluD   = M(C.slate);              // tamna leđa i krila
  const pluM   = M(0x59636f);
  const pluL   = M(C.stoneLight);         // svetli rubovi pera
  const brstM  = M(C.ivory);              // prsa
  const barsM  = M(0x3a4048);             // pruge po prsima
  const beakM  = M(C.blackIron, { flat: false });
  const cereM  = M(C.saffron);
  const clawM  = M(0x2b2c31);
  const footM  = M(0xd9b855);             // žuta koža sokolovih nogu

  const root = new THREE.Group();

  // ================================================================= noge ==
  // Težina je na desnoj nozi (-X), leva je opuštena i izvrnuta u stranu.
  const R_HIP = [-0.135, 0.90, 0.00], R_KNEE = [-0.148, 0.48, 0.02], R_ANK = [-0.150, 0.15, 0.00];
  const L_HIP = [ 0.140, 0.885, 0.00], L_KNEE = [ 0.185, 0.47, 0.06], L_ANK = [ 0.225, 0.15, -0.02];

  function legBones(hip, knee, ank) {
    const g = new THREE.Group();
    g.add(bar(hip, knee, 0.078, hoseM, 8, 0.060));                        // butina
    g.add(sphere(0.062, hoseM, knee[0], knee[1], knee[2], 9, 8));         // koleno
    g.add(bar(knee, ank, 0.052, hoseM, 8, 0.042));                        // list
    return g;
  }
  root.add(legBones(R_HIP, R_KNEE, R_ANK));
  root.add(legBones(L_HIP, L_KNEE, L_ANK));

  // Čizme za jahanje: sara ide do kolena, rub je preklopljen, na peti mamuza.
  function ridingBoot(ank, turn) {
    const g = makeBoot({ mat: hideM, sole: hideD, buckle: brassM, s: 1.0 });
    g.position.set(ank[0], 0, ank[2]);
    g.rotation.y = turn;
    g.add(cyl(0.072, 0.090, 0.22, hideM, 0, 0.37, -0.015, 9));            // sara do kolena
    g.add(cyl(0.094, 0.076, 0.08, hideP, 0, 0.50, -0.015, 9));            // preklopljen rub
    const rim = torus(0.090, 0.011, hideD, 0, 0.465, -0.015, 6, 12);
    rim.rotation.x = Math.PI / 2;
    g.add(rim);
    g.add(bar([-0.068, 0.35, 0.052], [0.068, 0.37, 0.052], 0.010, hideD)); // kaiš preko sare
    g.add(box(0.035, 0.026, 0.016, brassM, 0.0, 0.36, 0.085));            // kopča
    // mamuza: krak, čvor i zvezdica od tri konusa
    g.add(bar([0, 0.105, -0.10], [0, 0.128, -0.185], 0.011, steelM));
    g.add(sphere(0.016, steelM, 0, 0.132, -0.195, 7, 6));
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      const p = cone(0.009, 0.028, steelM,
        Math.sin(a) * 0.027, 0.132 + Math.cos(a) * 0.027, -0.205, 5);
      p.rotation.z = -a;
      g.add(p);
    }
    return g;
  }
  root.add(ridingBoot(R_ANK, -0.06));
  root.add(ridingBoot(L_ANK, 0.34));

  // ================================================================ trup ==
  // Pivot torza je u kukovima (0.88), sve unutra je u lokalnim koordinatama.
  const TY = 0.88;
  const torso = group([], -0.018, TY, 0);        // težina prebačena na desnu nogu
  torso.rotation.z = -0.022;
  torso.rotation.y = 0.05;                       // trup blago otvoren ka ptici
  root.add(torso);

  torso.add(box(0.31, 0.17, 0.215, gambM, 0, 0.015, 0));                  // karlica
  torso.add(box(0.285, 0.20, 0.205, gambM, 0, 0.175, 0));                 // pojasni deo
  torso.add(box(0.335, 0.26, 0.225, gambM, 0, 0.375, 0.005));             // grudni koš
  torso.add(box(0.325, 0.10, 0.215, gambM, 0, 0.505, 0.005));             // gornje grudi
  torso.add(box(0.44, 0.085, 0.20, mailM, 0, 0.545, 0));                  // rameni jaram
  for (const s of [-1, 1]) {
    const pec = sphere(0.075, gambM, s * 0.085, 0.415, 0.095, 9, 8);       // grudni mišić
    pec.scale.set(1, 0.7, 0.5);
    torso.add(pec);
    const trap = sphere(0.072, mailM, s * 0.115, 0.525, -0.01, 9, 8);      // trapez
    trap.scale.set(1, 0.62, 0.9);
    torso.add(trap);
    torso.add(bar([0.02, 0.555, 0.075], [s * 0.185, 0.525, 0.045], 0.017, mailM)); // ključna kost
    const sh = sphere(0.085, mailM, s * 0.205, 0.535, 0.005, 10, 9);       // rame
    sh.scale.set(1, 0.85, 0.95);
    torso.add(sh);
  }
  // vrat: dva sloja — mišić i grkljan
  torso.add(cyl(0.058, 0.072, 0.135, skin, 0, 0.625, 0.008, 9));
  torso.add(sphere(0.028, skin, 0, 0.615, 0.055, 7, 6));
  for (const s of [-1, 1]) torso.add(bar([s * 0.045, 0.70, 0.01], [s * 0.075, 0.575, -0.02], 0.016, skin));

  // verižnjača: okovratnik oko vrata i rub koji viri ispod nadkošulje
  torso.add(chainmail(0.108, 2, 6, mailM, 0.525, 0.046, 0.92));
  torso.add(chainmail(0.205, 1, 10, mailM, -0.285, 0.05, 0.82));

  // ------------------------------------------------------- nadkošulja --
  // Suknja nadkošulje je telo obrtanja; rub je opšiven i zubast.
  const coat = group([], 0, -0.22, 0);                                     // svet 0.66
  const skirt = lathe([[0.238, 0], [0.228, 0.14], [0.208, 0.30], [0.192, 0.46]], coatM, 16);
  coat.add(skirt);
  const hemRing = torus(0.239, 0.013, trimM, 0, 0.008, 0, 6, 20);
  hemRing.rotation.x = Math.PI / 2;
  coat.add(hemRing);
  coat.add(fringe(0.235, 6, coatD, 0.05, 0.005, 1, 0.5));                  // zubast rub
  // prorezi za jahanje po sredini spreda i iza, naglašeni tamnijom trakom
  // (traka je nagnuta kao i suknja, da ne izađe iz tkanine pri vrhu)
  for (const s of [-1, 1]) {
    const slit = box(0.026, 0.36, 0.012, coatD, 0, 0.19, s * 0.222);
    slit.rotation.x = -s * 0.10;
    coat.add(slit);
  }
  torso.add(coat);

  // prednji plastron nadkošulje sa opšivom po ivicama
  torso.add(edged(0.30, 0.40, 0.235, coatM, trimM, 0, 0.35, 0.005, 0.02));
  for (const s of [-1, 1]) torso.add(box(0.085, 0.10, 0.19, coatM, s * 0.12, 0.545, 0.005)); // preko ramena

  // grb: pero — okosnica i niz sitnih vlakana
  const sig = group([], 0.0, 0.375, 0.134);
  sig.rotation.z = 0.18;
  sig.add(bar([0, -0.085, 0], [0.01, 0.085, 0.004], 0.006, trimM, 6, 0.003));
  for (let i = 0; i < 3; i++) {
    const y = -0.05 + i * 0.055;
    const L = 0.052 - i * 0.010;
    for (const s of [-1, 1]) {
      const b = box(L, 0.008, 0.006, trimM, s * L * 0.5, y, 0.002);
      b.rotation.z = -s * 0.55;
      sig.add(b);
    }
  }
  torso.add(sig);

  // ------------------------------------------------------------ pojas --
  // pojas ide PREKO nadkošulje, pa mu je poluprečnik veći od suknje
  const beltY = 0.12;                                                      // svet 1.00
  const belt = torus(0.225, 0.021, hideM, 0, beltY, 0, 6, 22);
  belt.rotation.x = Math.PI / 2;
  torso.add(belt);
  torso.add(rivetRing(0.226, 5, 0.012, brassM, beltY + 0.002, 1, 0.3));
  torso.add(box(0.062, 0.05, 0.022, brassM, 0.01, beltY, 0.215));          // kopča
  torso.add(box(0.042, 0.03, 0.026, gambM, 0.01, beltY, 0.218));           // otvor kopče
  torso.add(box(0.03, 0.11, 0.016, hideD, -0.055, beltY - 0.055, 0.212));  // slobodan kraj
  torso.add(box(0.032, 0.02, 0.02, brassM, -0.055, beltY - 0.105, 0.212)); // metalni okov kraja

  // torbica sa hranom za pticu, o pojasu sa leve strane
  const pouch = group([], 0.175, beltY - 0.075, 0.185);
  pouch.rotation.y = 0.42;
  pouch.add(box(0.105, 0.115, 0.062, hideM));
  pouch.add(box(0.11, 0.045, 0.068, hideP, 0, 0.05, 0.004));               // preklop
  pouch.add(box(0.024, 0.05, 0.012, hideD, 0, 0.02, 0.037));               // jezičak
  pouch.add(box(0.018, 0.014, 0.01, brassM, 0, -0.005, 0.04));             // dugme
  pouch.add(bar([-0.03, 0.06, 0], [-0.03, 0.10, 0.01], 0.007, hideD));
  pouch.add(bar([0.03, 0.06, 0], [0.03, 0.10, 0.01], 0.007, hideD));
  torso.add(pouch);

  // nož za pero, u kanijama o pojasu sa desne strane
  const knife = group([], -0.205, beltY - 0.085, 0.155);
  knife.rotation.set(0.2, 0.25, 0.35);
  knife.add(cyl(0.017, 0.013, 0.13, hideD, 0, -0.055, 0, 7));              // kanije
  knife.add(torus(0.018, 0.005, brassM, 0, 0.005, 0, 6, 10));
  knife.children[knife.children.length - 1].rotation.x = Math.PI / 2;
  knife.add(cyl(0.011, 0.012, 0.055, Hide(C.woodDark), 0, 0.04, 0, 7));    // drška od tamnog drveta
  knife.add(box(0.03, 0.008, 0.012, brassM, 0, 0.012, 0));                 // nakrsnica
  knife.add(sphere(0.011, brassM, 0, 0.072, 0, 7, 6));                     // jabučica
  torso.add(knife);

  // ------------------------------------------------- kaiš preko ramena --
  // Nosi lovački rog: prednja i zadnja grana, preklopljene preko levog ramena.
  torso.add(strap([[0.11, 0.575, 0.065], [0.03, 0.42, 0.148], [-0.09, 0.28, 0.148], [-0.19, 0.185, 0.085]], 0.017, hideD));
  torso.add(strap([[0.11, 0.575, -0.06], [0.0, 0.38, -0.132], [-0.18, 0.19, -0.07]], 0.017, hideD));
  torso.add(strap([[0.11, 0.575, 0.065], [0.138, 0.602, 0.0], [0.11, 0.575, -0.06]], 0.017, hideD));
  torso.add(box(0.045, 0.032, 0.02, brassM, -0.02, 0.35, 0.158));          // kopča na kaišu
  torso.add(box(0.038, 0.026, 0.018, brassM, 0.078, 0.50, 0.105));

  // lovački rog — zakrivljen, sa metalnim okovom i usnikom
  const horn = group([], -0.205, 0.17, 0.055);                             // pivot na kaišu
  horn.rotation.set(0.1, 0.25, 0.12);
  const hornBody = curve([0, 0.0, 0.03], [-0.115, -0.255, -0.10], [-0.10, -0.02, -0.055], hideP, 0.022, 0.056, 5);
  horn.add(hornBody);
  horn.add(bar([-0.105, -0.235, -0.088], [-0.12, -0.275, -0.112], 0.058, brassM, 10, 0.076)); // grlo levka
  horn.add(bar([-0.02, -0.045, 0.008], [-0.038, -0.085, -0.008], 0.036, brassM, 9, 0.04));    // okov
  horn.add(bar([-0.072, -0.155, -0.05], [-0.086, -0.19, -0.066], 0.05, brassM, 9, 0.053));    // drugi okov
  horn.add(cyl(0.019, 0.024, 0.03, brassM, 0.004, 0.015, 0.036, 8));       // usnik
  horn.add(torus(0.015, 0.004, brassM, -0.03, -0.03, 0.0, 6, 10));         // alka za kaiš
  torso.add(horn);

  // ============================================================= glava ==
  const headG = group([], 0, 0.79, 0.012);                                 // centar glave 1.67
  headG.rotation.x = -0.05;                                                // uzdignuta brada
  headG.rotation.y = 0.12;                                                 // pogled ka ptici
  torso.add(headG);

  const face = makeFace({
    skin, r: 0.115, eye: 0x4d6a5b, brow: 0x6f5028, mouth: 'smile',
    browAngle: -0.06, tall: 1.04, deep: 0.97, mouthColor: 0x8a4a42,
  });
  headG.add(face.group);

  // sitne bore oko očiju — osmeh koji je ostao od mnogo jutara na vetru
  for (const s of [-1, 1]) {
    for (let i = 0; i < 2; i++) {
      const w = box(0.026, 0.005, 0.004, skinD, s * (0.078 + i * 0.008), 0.004 - i * 0.014, 0.082);
      w.rotation.z = s * (0.5 - i * 0.2);
      headG.add(w);
    }
  }

  // kratka svetlosmeđa brada i brkovi
  for (const s of [-1, 1]) {
    const cheek = sphere(0.044, beardM, s * 0.074, -0.048, 0.058, 8, 7);
    cheek.scale.set(0.85, 0.85, 0.72);
    headG.add(cheek);
    headG.add(bar([s * 0.086, -0.042, 0.045], [s * 0.018, -0.095, 0.082], 0.02, beardM, 6, 0.026));
    const must = box(0.038, 0.014, 0.014, beardM, s * 0.024, -0.038, 0.10);
    must.rotation.z = s * 0.22;
    headG.add(must);
  }
  const chin = sphere(0.048, beardM, 0, -0.095, 0.072, 9, 8);
  chin.scale.set(1, 0.82, 0.8);
  headG.add(chin);
  headG.add(box(0.03, 0.022, 0.014, beardM, 0, -0.062, 0.098));            // čuperak pod usnom

  // kosa do ramena
  const hairCap = sphere(0.122, hairM, 0, 0.016, -0.014, 12, 10);
  hairCap.scale.set(1.0, 1.0, 1.03);
  headG.add(hairCap);
  for (const s of [-1, 1]) {
    headG.add(box(0.06, 0.03, 0.02, hairM, s * 0.045, 0.082, 0.098));      // šiške
    const lock = bar([s * 0.105, 0.02, 0.01], [s * 0.128, -0.245 - rnd() * 0.035, -0.02], 0.034, hairM, 6, 0.02);
    headG.add(lock);
  }
  const nape = box(0.19, 0.24, 0.075, hairM, 0, -0.10, -0.085);
  headG.add(nape);
  headG.add(box(0.155, 0.09, 0.06, hairM, 0, -0.215, -0.078));

  // ======================================================== desna ruka ==
  // Opuštena niz telo; u šaci smotan povodac (creance).
  const armR = group([], -0.205, 0.535, 0.005);                            // rame, svet 1.415
  torso.add(armR);
  armR.add(sphere(0.072, mailM, 0, 0, 0, 9, 8));                           // deltoid
  armR.add(bar([0, -0.01, 0], [-0.05, -0.29, 0.03], 0.062, mailM, 9, 0.046)); // nadlaktica u verižnjači
  armR.add(sphere(0.05, hideM, -0.05, -0.29, 0.03, 9, 8));                 // lakat
  armR.add(bar([-0.05, -0.29, 0.03], [-0.05, -0.52, 0.085], 0.05, hideM, 9, 0.042)); // podlaktica u naruklju
  armR.add(bar([-0.05, -0.325, 0.038], [-0.05, -0.345, 0.043], 0.053, hideD, 9, 0.053)); // kaiš naruklja
  armR.add(bar([-0.05, -0.455, 0.068], [-0.05, -0.475, 0.073], 0.048, hideD, 9, 0.048));
  armR.add(rivets([-0.088, -0.33, 0.04], [-0.088, -0.47, 0.072], 3, 0.008, brassM));
  const shR = sphere(0.078, hideP, -0.01, 0.03, 0.0, 9, 8);                // kožni naramenik
  shR.scale.set(1.1, 0.62, 1.05);
  armR.add(shR);
  armR.add(rivets([-0.075, 0.04, -0.05], [-0.075, 0.04, 0.06], 2, 0.009, brassM));

  // povodac u pesnici — osa drške je Y osa šake
  const leash = group([], -0.05, -0.565, 0.095);
  leash.rotation.set(0.12, 0.0, -0.10);
  leash.add(cyl(0.016, 0.016, 0.16, hideD, 0, 0, 0, 7));                   // dvostruko presavijen kaiš
  for (let i = 0; i < 2; i++) {
    const c = torus(0.028, 0.007, hideD, 0, -0.09 - i * 0.024, 0.005, 6, 12);
    c.rotation.x = Math.PI / 2 - 0.25;
    c.rotation.z = 0.2 * i;
    leash.add(c);
  }
  leash.add(bar([0.01, -0.155, 0.01], [0.03, -0.20, 0.03], 0.008, hideD));
  leash.add(makeHand({ pose: 'grip', side: 1, s: 1.0, skin, cuff: hideP }));
  armR.add(leash);

  // ========================================================= leva ruka ==
  // Podignuta u stranu i savijena; podlaktica u krutoj sokolarskoj rukavici.
  const armL = group([], 0.205, 0.535, 0.005);                             // rame, svet 1.415
  torso.add(armL);
  const L_EL = [0.195, -0.21, -0.03];                                      // lakat
  const L_WR = [0.180, -0.105, 0.215];                                     // zglob
  armL.add(sphere(0.074, mailM, 0, 0, 0, 9, 8));                           // deltoid
  armL.add(bar([0, -0.005, 0], L_EL, 0.063, mailM, 9, 0.05));              // nadlaktica
  armL.add(sphere(0.055, hideM, L_EL[0], L_EL[1], L_EL[2], 9, 8));         // lakat
  const shL = sphere(0.08, hideP, 0.012, 0.035, 0.0, 9, 8);
  shL.scale.set(1.1, 0.62, 1.05);
  armL.add(shL);
  armL.add(rivets([0.078, 0.045, -0.05], [0.078, 0.045, 0.06], 2, 0.009, brassM));

  // rukavica: sopstvena grupa čija +Y osa gleda od zgloba ka laktu
  const gl = new THREE.Group();
  gl.position.set(L_WR[0], L_WR[1], L_WR[2]);
  {
    const up = new THREE.Vector3(0, 1, 0);
    const dir = new THREE.Vector3(L_EL[0] - L_WR[0], L_EL[1] - L_WR[1], L_EL[2] - L_WR[2]).normalize();
    gl.quaternion.setFromUnitVectors(up, dir);
  }
  armL.add(gl);
  gl.add(cyl(0.082, 0.094, 0.245, hideM, 0, 0.125, 0, 11));                // kruta cev rukavice
  gl.add(cyl(0.086, 0.09, 0.06, hideP, 0, 0.06, 0, 11));                   // pojačanje preko zgloba
  gl.add(box(0.05, 0.20, 0.012, hideD, 0, 0.13, 0.09));                    // šav po dužini
  const glRim = torus(0.095, 0.014, ironM, 0, 0.248, 0, 6, 14);            // okovan rub kod lakta
  glRim.rotation.x = Math.PI / 2;
  gl.add(glRim);
  const glRim2 = torus(0.086, 0.009, ironM, 0, 0.035, 0, 6, 14);
  glRim2.rotation.x = Math.PI / 2;
  gl.add(glRim2);
  gl.add(rivetRing(0.096, 6, 0.012, ironM, 0.232, 1, 0.2));
  for (const y of [0.10, 0.19]) {                                          // kaišići rukavice
    const st = torus(0.09, 0.009, hideD, 0, y, 0, 6, 14);
    st.rotation.x = Math.PI / 2;
    gl.add(st);
    gl.add(box(0.03, 0.024, 0.018, brassM, 0.0, y, 0.095));
  }
  // resice od kože na rubu rukavice
  for (let i = 0; i < 2; i++) {
    gl.add(bar([-0.01 + i * 0.03, 0.245, -0.062], [-0.02 + i * 0.04, 0.155, -0.115], 0.007, hideD));
  }

  // gola pesnica u rukavici — soko stoji na njoj
  const fistL = makeHand({ pose: 'fist', side: -1, s: 1.2, skin: hideM });
  fistL.position.set(0.183, -0.088, 0.238);
  fistL.rotation.set(0.16, -0.55, -0.30);
  armL.add(fistL);
  // podstavljen nadlanik: njegova gornja ravan je prečka na kojoj soko stoji
  armL.add(box(0.078, 0.030, 0.072, hideP, 0.183, -0.088, 0.234));
  armL.add(box(0.07, 0.022, 0.05, hideD, 0.183, -0.132, 0.255));           // pojačanje ispod prstiju

  // povodac koji ide od obrtaljke do desne šake — spaja pticu sa vitezom
  root.add(strap([[0.42, 1.225, 0.275], [0.21, 1.055, 0.235], [-0.06, 0.955, 0.175], [-0.245, 0.93, 0.12]], 0.008, hideD));

  // ============================================================== SOKO ==
  // Pivot je na kandžama; telo se premešta sa noge na nogu, glava se trza.
  const falcon = group([], 0.180, -0.060, 0.205);                          // na pesnici
  falcon.rotation.y = -0.30;                                               // okrenut ka vitezu
  armL.add(falcon);

  const fBody = new THREE.Group();                                         // nosi premeštanje težine
  falcon.add(fBody);

  // trup: spljoštena, izdužena sfera
  const trunk = sphere(0.082, pluD, 0, 0.155, -0.012, 12, 10);
  trunk.scale.set(0.86, 0.96, 1.32);
  fBody.add(trunk);
  const mantle = sphere(0.072, pluM, 0, 0.198, -0.03, 10, 9);              // plašt preko leđa
  mantle.scale.set(0.86, 0.5, 1.1);
  fBody.add(mantle);
  // slojevita prsa: tri sloja pera i pruge preko njih
  const b1 = sphere(0.064, brstM, 0, 0.152, 0.055, 10, 9); b1.scale.set(0.86, 1.0, 0.72); fBody.add(b1);
  const b2 = sphere(0.054, brstM, 0, 0.105, 0.05, 9, 8);  b2.scale.set(0.9, 0.95, 0.7);  fBody.add(b2);
  const b3 = sphere(0.042, brstM, 0, 0.062, 0.038, 9, 8); b3.scale.set(0.92, 0.9, 0.7);  fBody.add(b3);
  for (let i = 0; i < 3; i++) {
    fBody.add(box(0.072 - i * 0.010, 0.007, 0.008, barsM, 0, 0.185 - i * 0.046, 0.088 - i * 0.008));
  }
  fBody.add(sphere(0.032, pluL, 0, 0.075, -0.075, 8, 7));                  // podrepno perje

  // krila: tri reda pera, sklopljena uz telo
  const featherRows = [];
  function wing(sx) {
    const w = group([], sx * 0.062, 0.185, -0.012);
    w.rotation.z = -sx * 0.06;
    const rows = [
      { n: 3, len: 0.075, wd: 0.023, y: 0.028, z: 0.03, mat: pluM },
      { n: 3, len: 0.115, wd: 0.025, y: -0.002, z: 0.005, mat: pluD },
      { n: 3, len: 0.165, wd: 0.026, y: -0.032, z: -0.02, mat: pluD },
    ];
    for (let r = 0; r < rows.length; r++) {
      const cfg = rows[r];
      const rg = group([], 0, cfg.y, cfg.z);
      for (let i = 0; i < cfg.n; i++) {
        const L = cfg.len * (1 - i * 0.07);
        const f = box(cfg.wd, 0.009, L, r === 2 && i === 0 ? pluL : cfg.mat,
          sx * i * 0.008, -i * 0.009, -L * 0.5);
        f.rotation.x = 0.05 + i * 0.02;
        f.rotation.y = -sx * (0.05 + i * 0.03);
        rg.add(f);
      }
      w.add(rg);
      featherRows.push({ g: rg, by: rg.rotation.y, bx: rg.rotation.x, ky: sx * (0.10 + r * 0.06), kx: -0.06 - r * 0.03 });
    }
    return w;
  }
  const wingL = wing(1);
  const wingR = wing(-1);
  fBody.add(wingL);
  fBody.add(wingR);

  // rep od pet pera
  const tailG = group([], 0, 0.135, -0.10);
  for (let i = 0; i < 5; i++) {
    const t = box(0.022, 0.008, 0.16, i % 2 ? pluD : pluM, 0, 0, -0.08);
    t.rotation.y = (i - 2) * 0.10;
    t.rotation.x = 0.12 + Math.abs(i - 2) * 0.02;
    tailG.add(t);
  }
  tailG.add(box(0.055, 0.012, 0.045, pluM, 0, 0.012, -0.015));             // gornje pokrivno perje
  fBody.add(tailG);

  // glava — zasebna podgrupa, da može da se trza
  const fHead = group([], 0, 0.238, 0.042);
  fBody.add(fHead);
  const fSkull = sphere(0.048, pluD, 0, 0, 0, 11, 9);
  fSkull.scale.set(0.95, 0.95, 1.06);
  fHead.add(fSkull);
  const fNape = sphere(0.05, pluM, 0, -0.038, -0.014, 9, 8);
  fNape.scale.set(1, 0.82, 1);
  fHead.add(fNape);
  fHead.add(sphere(0.026, brstM, 0, -0.048, 0.03, 8, 7));                  // grlo
  // sokolarska kapica od kože, sa čuperkom na vrhu
  const hood = sphere(0.053, hideM, 0, 0.008, -0.002, 11, 9);
  hood.scale.set(1.02, 1.08, 1.0);
  fHead.add(hood);
  const hoodRim = torus(0.05, 0.008, hideD, 0, -0.03, 0.0, 6, 14);
  hoodRim.rotation.x = Math.PI / 2;
  fHead.add(hoodRim);
  for (const s of [-1, 1]) fHead.add(box(0.006, 0.055, 0.055, hideD, s * 0.042, 0.012, -0.004)); // šavovi
  fHead.add(box(0.03, 0.02, 0.012, hideP, 0, 0.006, -0.05));               // vezice pozadi
  fHead.add(cyl(0.008, 0.012, 0.014, hideD, 0, 0.058, -0.004, 7));         // ležište čuperka
  for (let i = 0; i < 3; i++) {
    const q = box(0.008, 0.03, 0.006, i === 1 ? coatM : coatD, (i - 1) * 0.007, 0.078, -0.006);
    q.rotation.z = (i - 1) * 0.3;
    q.rotation.x = -0.2;
    fHead.add(q);
  }
  // kljun viri ispod kapice
  fHead.add(sphere(0.016, cereM, 0, -0.018, 0.04, 8, 7));                  // voštanica
  const beak = cone(0.015, 0.034, beakM, 0, -0.032, 0.05, 7);
  beak.rotation.x = 2.35;
  fHead.add(beak);
  fHead.add(box(0.014, 0.012, 0.008, beakM, 0, -0.044, 0.045));            // zubac na kljunu
  for (const s of [-1, 1]) fHead.add(sphere(0.003, barsM, s * 0.007, -0.014, 0.052, 5, 4)); // nozdrve

  // noge i kandže — obuhvataju rukavicu
  function talon(sx) {
    const f = group([], sx * 0.036, 0.0, 0.012);
    f.rotation.y = -sx * 0.12;
    f.add(cyl(0.014, 0.017, 0.058, footM, 0, 0.03, 0, 7));                 // nožica
    f.add(sphere(0.019, footM, 0, 0.062, 0, 8, 7));                        // skočni zglob
    // tri prsta naprijed: prvi članak leže preko rukavice, drugi se zavija pod nju
    const toes = [[-0.55, 0.032, false], [0.0, 0.038, true], [0.55, 0.030, false]];
    for (const [sp, len, twoJoints] of toes) {
      const a = [0, 0.008, 0.004];
      const b = [Math.sin(sp) * len, -0.004, Math.cos(sp) * len];
      const c2 = [Math.sin(sp) * len * 1.8, -0.028, Math.cos(sp) * len * 1.8];
      if (twoJoints) {
        f.add(bar(a, b, 0.009, footM, 6, 0.008));
        f.add(bar(b, c2, 0.008, footM, 6, 0.006));
      } else {
        f.add(bar(a, c2, 0.009, footM, 6, 0.006));
      }
      const cl = cone(0.006, 0.02, clawM, c2[0], c2[1], c2[2], 6);
      cl.rotation.x = Math.PI - 0.5;
      cl.rotation.z = -sp * 0.4;
      f.add(cl);
    }
    // palac hvata sa zadnje strane
    const h1 = [0, 0.006, -0.006], h2 = [0, -0.026, -0.036];
    f.add(bar(h1, h2, 0.008, footM, 6, 0.006));
    const hc = cone(0.006, 0.02, clawM, 0, -0.036, -0.046, 6);
    hc.rotation.x = Math.PI + 0.6;
    f.add(hc);
    return f;
  }
  falcon.add(talon(1));
  falcon.add(talon(-1));

  // Kožni kaišići (jesses) sa obrtaljkom i zvoncetom: silaze između prstiju
  // i vise slobodno ispred vanjske ivice rukavice, da ne ulaze u pesnicu.
  const jess = group([], 0.03, 0.008, 0.03);
  falcon.add(jess);
  jess.add(bar([-0.066, 0, -0.02], [-0.012, -0.058, 0.012], 0.005, hideD));  // od leve nožice
  jess.add(bar([0.006, 0, -0.02], [0.022, -0.058, 0.016], 0.005, hideD));    // od desne nožice
  jess.add(bar([-0.012, -0.058, 0.012], [0.03, -0.104, 0.04], 0.005, hideD));
  jess.add(bar([0.022, -0.058, 0.016], [0.03, -0.104, 0.04], 0.005, hideD));
  const swivel = torus(0.009, 0.003, brassM, 0.031, -0.114, 0.042, 6, 10);
  jess.add(swivel);
  const bellG = group([], 0.032, -0.122, 0.043);
  jess.add(bellG);
  bellG.add(cyl(0.006, 0.012, 0.013, brassM, 0, -0.004, 0, 8));
  bellG.add(sphere(0.014, brassM, 0, -0.018, 0, 9, 8));
  bellG.add(box(0.018, 0.003, 0.007, M(C.blackIron), 0, -0.029, 0));       // prorez zvonca
  const bellRing = torus(0.005, 0.0018, brassM, 0, 0.006, 0, 5, 8);
  bellG.add(bellRing);

  // ========================================================== ANIMACIJA ==
  // Sve osnove su zapamćene POSLE zauzimanja mirne poze; tick(t) je čist po t.
  const anim = new Anim();

  // 1) soko premešta težinu sa noge na nogu — glavni, najkrupniji pokret
  anim.rot(fBody, 'z', 0.085, 1.22, 0.4);
  anim.pos(fBody, 'x', 0.013, 1.22, 0.4);
  anim.pos(fBody, 'y', 0.004, 2.44, 1.1);

  // 2) ptičji trzaji glave — kratki nagli okreti, pa mirovanje
  const jit = (k) => {
    const s = Math.sin(k * 12.9898 + 78.233) * 43758.5453;
    return (s - Math.floor(s)) * 2 - 1;
  };
  const fhY = fHead.rotation.y, fhX = fHead.rotation.x, fhZ = fHead.rotation.z;
  anim.custom((t) => {
    const per = 0.78;
    const q = t / per;
    const k = Math.floor(q);
    const f = q - k;
    const e = f < 0.13 ? f / 0.13 : 1;
    const s = e * e * (3 - 2 * e);
    const y0 = jit(k), y1 = jit(k + 1);
    const x0 = jit(k + 101), x1 = jit(k + 102);
    const z0 = jit(k + 211), z1 = jit(k + 212);
    fHead.rotation.y = fhY + (y0 + (y1 - y0) * s) * 0.36;
    fHead.rotation.x = fhX + (x0 + (x1 - x0) * s) * 0.12;
    fHead.rotation.z = fhZ + (z0 + (z1 - z0) * s) * 0.09;
  });

  // 3) krila se povremeno nakostreše, pa se slegnu
  const wlz = wingL.rotation.z, wrz = wingR.rotation.z;
  const wlx = wingL.rotation.x, wrx = wingR.rotation.x;
  anim.custom((t) => {
    const p = 5.6;
    const u = (((t % p) + p) % p) / p;
    const k = u < 0.15 ? Math.sin((u / 0.15) * Math.PI) : 0;
    const g = k * k;
    wingL.rotation.z = wlz - g * 0.19;
    wingR.rotation.z = wrz + g * 0.19;
    wingL.rotation.x = wlx - g * 0.05;
    wingR.rotation.x = wrx - g * 0.05;
    for (let i = 0; i < featherRows.length; i++) {
      const r = featherRows[i];
      r.g.rotation.y = r.by + g * r.ky;
      r.g.rotation.x = r.bx + g * r.kx;
    }
  });
  anim.rot(tailG, 'x', 0.05, 1.9, 0.7);

  // 4) kaišići i zvonce se njišu, svaki svojim ritmom
  anim.rot(jess, 'x', 0.10, 2.05, 0.3);
  anim.rot(jess, 'z', 0.06, 1.55, 1.2);
  anim.rot(bellG, 'z', 0.13, 3.1, 0.6);
  anim.rot(bellG, 'x', 0.09, 2.7, 2.0);

  // 5) vitez diše i jedva primetno se premešta
  anim.breathe(torso, 0.010, 1.02, 0.2);
  anim.rot(torso, 'z', 0.008, 0.51, 1.4);

  // 6) glava se sporo okreće ka ptici, kapci trepću
  anim.rot(headG, 'y', 0.09, 0.33, 0.6);
  anim.rot(headG, 'x', 0.025, 0.47, 1.2);
  anim.blink(face.lidL, 4.6, 0.0, 0.028);
  anim.blink(face.lidR, 4.6, 0.0, 0.028);

  // 7) desna ruka, povodac i rog — najsitniji pokreti
  anim.rot(armR, 'x', 0.022, 0.62, 1.7);
  anim.rot(leash, 'z', 0.05, 1.31, 0.4);
  anim.rot(horn, 'z', 0.02, 0.85, 2.2);
  anim.rot(horn, 'x', 0.015, 0.67, 0.9);

  const update = (t) => anim.tick(t);

  return {
    name: "Ser Kolm od Sivog Sokola",
    title: "Vitez sokolar",
    blurb: "Ne šalje glasnike i ne piše pisma. Ono što treba da se zna stigne pre zore, u kandžama ptice koja poznaje svaki krov između Sivog Sokola i mora — i koja ne sleti nikome osim njemu.",
    heraldry: { color: C.teal, sigil: 'feather' },
    eyeY: 1.68,
    group: root,
    update,
  };
}
