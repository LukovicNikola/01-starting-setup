// main.js — Dvorana Barjaka
//
// Deset junaka stoji u dva reda niz razrušenu kamenu lađu. Iza svakog visi
// njegov barjak, ispred njega je uklesana pločica sa imenom. Kroz probijen
// krov pada sneg i mesečina; jedina toplina su žeravnici uz stubove.

import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { createHall, HERO_Z, HERO_X, PLINTH_H, BANNER_X } from './src/hall.js';
import { HEROES } from './src/heroes/index.js';
import { C, M, Metal, Cloth, Glow, box, cyl, sphere, cone, torus, group, seeded, countMeshes } from './src/kit.js';

const rand = seeded(51207);

// ------------------------------------------------------------ osnova scene ---

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.32;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0d16);
scene.fog = new THREE.FogExp2(0x121628, 0.017);

const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 300);
const HOME_CAM = new THREE.Vector3(0, 4.3, 20.5);
const HOME_TGT = new THREE.Vector3(0, 2.4, 0.5);
camera.position.copy(HOME_CAM);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TGT);
controls.enableDamping = true;
controls.dampingFactor = 0.065;
controls.maxPolarAngle = Math.PI * 0.495;
controls.minDistance = 0.6;   // dovoljno nisko da bliski kadar ne bude odbijen
controls.maxDistance = 46;

// ---------------------------------------------------------------- dvorana ---

const hall = createHall();
scene.add(hall.group);
const flames = hall.flames.slice();
const flickerLights = hall.lights.slice();

// ------------------------------------------------------------- osvetljenje ---

// Mesečina ulazi kroz rozetu na začelju i seče lađu po dužini.
const moon = new THREE.DirectionalLight(0xa8c4ff, 2.5);
moon.position.set(-6, 21, -34);
moon.target.position.set(0, 1, 2);
scene.add(moon.target);
moon.castShadow = true;
moon.shadow.mapSize.set(2048, 2048);
moon.shadow.camera.left = -12;
moon.shadow.camera.right = 12;
moon.shadow.camera.top = 16;
moon.shadow.camera.bottom = -16;
moon.shadow.camera.near = 8;
moon.shadow.camera.far = 80;
moon.shadow.bias = -0.0007;
scene.add(moon);

// hladno ispunjenje odozgo, mrko od kamenog poda
scene.add(new THREE.HemisphereLight(0x5468a8, 0x2a2620, 0.72));

// obodno svetlo iz pravca ulaza — odvaja junake od tamnog kamena iza njih
const rim = new THREE.DirectionalLight(0x7f9fd8, 0.55);
rim.position.set(9, 8, 26);
scene.add(rim);

// meka topla dopuna niz lađu, da junaci ne budu samo siluete
const naveFill = new THREE.PointLight(0xffb877, 9, 30, 2);
naveFill.position.set(0, 5.2, 2);
scene.add(naveFill);

// reflektor koji prati izabranog junaka
const spot = new THREE.PointLight(0xffe0bc, 0, 11, 2);
scene.add(spot);

// ------------------------------------------------------------------- sneg ---

let snow, snowData;
{
  const N = 520;
  const pos = new Float32Array(N * 3);
  snowData = new Array(N);
  for (let i = 0; i < N; i++) {
    snowData[i] = {
      x: (rand() - 0.5) * 15.5,
      z: -15 + rand() * 31,
      speed: 0.35 + rand() * 0.5,
      offset: rand(),
      drift: 0.25 + rand() * 0.5,
      phase: rand() * 6.283,
    };
    pos[i * 3 + 1] = -50;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  snow = new THREE.Points(geo, new THREE.PointsMaterial({
    color: 0xdce8ff, size: 0.055, transparent: true, opacity: 0.8, depthWrite: false, fog: true,
  }));
  scene.add(snow);
}

// ------------------------------------------------------------------ grbovi ---

/** Prosti heraldički znaci od primitiva — svaki junak nosi svoj. */
function makeSigil(kind, mat) {
  const g = new THREE.Group();
  const B = (w, h, d, x, y, z) => g.add(box(w, h, d, mat, x, y, z));
  const S = (r, x, y, z) => g.add(sphere(r, mat, x, y, z, 8, 7));
  const K = (r, h, x, y, z, rx = 0, rz = 0) => {
    const c = cone(r, h, mat, x, y, z, 7); c.rotation.set(rx, 0, rz); g.add(c);
  };
  const R = (r, t, x, y, z) => { const o = torus(r, t, mat, x, y, z, 6, 18); g.add(o); };

  switch (kind) {
    case 'fang':            // lovac na čudovišta — tri očnjaka
      K(0.09, 0.42, -0.19, -0.02, 0, Math.PI, 0.16);
      K(0.11, 0.54, 0, 0.02, 0, Math.PI, 0);
      K(0.09, 0.42, 0.19, -0.02, 0, Math.PI, -0.16);
      break;
    case 'flask':           // alhemičar — bočica i kap
      K(0.24, 0.42, 0, -0.05, 0, 0, 0);
      B(0.12, 0.2, 0.05, 0, 0.24, 0);
      B(0.2, 0.06, 0.06, 0, 0.36, 0);
      S(0.07, 0, -0.14, 0.03);
      break;
    case 'feather':         // sokolar — pero
      B(0.05, 0.62, 0.05, 0, 0, 0);
      for (let i = 0; i < 5; i++) {
        const y = 0.24 - i * 0.12, w = 0.1 + i * 0.045;
        const l = box(w, 0.07, 0.04, mat, -w / 2 - 0.02, y, 0); l.rotation.z = 0.42; g.add(l);
        const r2 = box(w, 0.07, 0.04, mat, w / 2 + 0.02, y, 0); r2.rotation.z = -0.42; g.add(r2);
      }
      break;
    case 'spear':           // štitonoša — koplje preko štita
      R(0.26, 0.05, 0, 0, -0.03);
      B(0.05, 0.78, 0.05, 0, 0, 0.02);
      K(0.09, 0.22, 0, 0.44, 0.02);
      break;
    case 'gear':            // opsadni majstor — zupčanik
      R(0.2, 0.06, 0, 0, 0);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        B(0.09, 0.09, 0.05, Math.sin(a) * 0.26, Math.cos(a) * 0.26, 0);
      }
      S(0.07, 0, 0, 0);
      break;
    case 'lute':            // pevač — lutnja
      S(0.2, 0, -0.14, 0);
      g.children[g.children.length - 1].scale.set(1, 0.92, 0.4);
      B(0.08, 0.56, 0.05, 0, 0.3, 0);
      B(0.18, 0.09, 0.05, 0, 0.58, 0);
      for (let i = 0; i < 3; i++) B(0.02, 0.5, 0.03, -0.04 + i * 0.04, 0.16, 0.05);
      break;
    case 'ring':            // monah — tri prstena
      R(0.24, 0.045, 0, 0.08, 0);
      R(0.16, 0.04, -0.14, -0.14, 0);
      R(0.16, 0.04, 0.14, -0.14, 0);
      break;
    case 'lantern':         // inkvizitorka — fenjer
      B(0.3, 0.34, 0.08, 0, 0, 0);
      B(0.38, 0.06, 0.1, 0, 0.2, 0);
      B(0.38, 0.06, 0.1, 0, -0.2, 0);
      R(0.1, 0.03, 0, 0.32, 0);
      S(0.1, 0, 0, 0.05);
      break;
    case 'snowflake':       // zimska veštica — pahulja
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const arm = box(0.05, 0.56, 0.05, mat, 0, 0, 0);
        arm.rotation.z = a; g.add(arm);
        B(0.16, 0.04, 0.04, Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0);
      }
      S(0.09, 0, 0, 0.02);
      break;
    case 'rapier':          // dvobojac — ukršteni mačevi
      for (const s of [-1, 1]) {
        const bl = box(0.045, 0.72, 0.045, mat, 0, 0, 0);
        bl.rotation.z = s * 0.62; g.add(bl);
        const gd = box(0.22, 0.05, 0.05, mat, s * 0.12, -0.22, 0);
        gd.rotation.z = s * 0.62; g.add(gd);
      }
      break;
    default:
      R(0.24, 0.06, 0, 0, 0);
      S(0.1, 0, 0, 0);
  }
  return g;
}

// ---------------------------------------------------------------- pločica ---

/**
 * Uklesana pločica sa imenom, na nakrivljenoj kamenoj tabli pri prednjoj ivici
 * postamenta — kao legenda pored eksponata. Vertikalna pločica na tako niskom
 * postamentu ne bi bila čitljiva iz kadra koji gleda blago nadole.
 */
function makePlaque(name, title) {
  const cv = document.createElement('canvas');
  cv.width = 640; cv.height = 168;
  const c = cv.getContext('2d');

  c.fillStyle = '#2b2e37';
  c.fillRect(0, 0, cv.width, cv.height);
  // blaga zrnastost kamena
  for (let i = 0; i < 900; i++) {
    c.fillStyle = `rgba(255,255,255,${0.012 + Math.random() * 0.03})`;
    c.fillRect(Math.random() * cv.width, Math.random() * cv.height, 2, 2);
  }
  c.strokeStyle = 'rgba(216, 168, 74, 0.75)';
  c.lineWidth = 4;
  c.strokeRect(12, 12, cv.width - 24, cv.height - 24);

  c.textAlign = 'center';
  // urezan trag ispod slova, pa zlatna slova preko — utisak klesanja
  c.font = 'bold 54px Georgia, serif';
  c.fillStyle = 'rgba(0,0,0,0.75)';
  c.fillText(name.toUpperCase(), cv.width / 2 + 2, 80 + 3);
  c.fillStyle = '#e8c477';
  c.fillText(name.toUpperCase(), cv.width / 2, 80);

  c.font = 'italic 30px Georgia, serif';
  c.fillStyle = 'rgba(0,0,0,0.7)';
  c.fillText(title, cv.width / 2 + 1, 126 + 2);
  c.fillStyle = '#b9c3dd';
  c.fillText(title, cv.width / 2, 126);

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const g = new THREE.Group();
  g.add(cyl(0.40, 0.44, 0.05, plinthB, 0, 0.025, 0, 4));           // kameni klin
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.184),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 })
  );
  m.rotation.x = -1.02;                                             // nakrivljena ka kameri
  m.position.set(0, 0.075, 0.012);
  g.add(m);
  return g;
}

// ------------------------------------------------------------------ junaci ---

const heroes = [];
const heroRoots = [];

const plinthA = M(C.stoneLight, { roughness: 0.95 });
const plinthB = M(C.stone, { roughness: 0.98 });
const trimMat = Metal(C.gold, { emissive: C.gold, emissiveIntensity: 0 });

HEROES.forEach((create, i) => {
  const side = i < 5 ? 1 : -1;                       // 0..4 desni red, 5..9 levi
  const z = HERO_Z[i % 5];
  const x = HERO_X * side;
  const facing = side === 1 ? -Math.PI / 2 : Math.PI / 2;   // gleda ka osi lađe

  const data = create();
  const root = new THREE.Group();
  root.position.set(x, PLINTH_H, z);
  root.rotation.y = facing;
  root.add(data.group);
  root.userData.hero = i;
  scene.add(root);
  heroRoots.push(root);

  // --- postament -----------------------------------------------------------
  const plinth = group([], x, 0, z);
  plinth.rotation.y = facing;
  plinth.add(cyl(1.06, 1.16, 0.1, plinthB, 0, 0.05, 0, 14));
  plinth.add(cyl(0.94, 1.02, 0.18, plinthA, 0, 0.19, 0, 14));
  plinth.add(cyl(1.0, 0.94, 0.06, plinthB, 0, 0.31, 0, 14));
  const ring = torus(0.97, 0.022, trimMat, 0, 0.335, 0, 6, 26);
  ring.rotation.x = Math.PI / 2;
  plinth.add(ring);

  const plaque = makePlaque(data.name, data.title);
  plaque.position.set(0, PLINTH_H, 0.6);
  plinth.add(plaque);
  scene.add(plinth);

  // --- barjak iza junaka ---------------------------------------------------
  const her = data.heraldry ?? { color: C.slate, sigil: 'ring' };
  const bannerGrp = group([], BANNER_X * side, 0, z);
  bannerGrp.rotation.y = facing;

  const poleMat = Metal(C.blackIron, { roughness: 0.6 });
  bannerGrp.add(box(2.0, 0.075, 0.075, poleMat, 0, 5.25, 0));
  for (const s of [-1, 1]) {
    bannerGrp.add(sphere(0.08, Metal(C.brass), s * 1.02, 5.25, 0, 8, 7));
    bannerGrp.add(box(0.05, 0.5, 0.05, poleMat, s * 0.86, 5.5, 0));
  }

  const clothMat = Cloth(her.color);
  const clothDark = Cloth(new THREE.Color(her.color).multiplyScalar(0.62).getHex());
  const strips = [];
  const SW = 5;
  for (let k = 0; k < SW; k++) {
    const sx = (k - (SW - 1) / 2) * 0.35;
    const st = group([], sx, 5.2, 0);
    st.add(box(0.34, 2.5, 0.03, k % 2 ? clothDark : clothMat, 0, -1.25, 0));
    st.add(cone(0.17, 0.3, k % 2 ? clothDark : clothMat, 0, -2.62, 0, 4));
    st.children[st.children.length - 1].rotation.x = Math.PI;
    bannerGrp.add(st);
    strips.push(st);
  }
  // grb na sredini barjaka
  const sigil = makeSigil(her.sigil, Metal(C.goldPale, { roughness: 0.4 }));
  sigil.position.set(0, 3.9, 0.045);
  sigil.scale.setScalar(0.92);
  bannerGrp.add(sigil);
  scene.add(bannerGrp);

  const parts = countMeshes(data.group);
  heroes.push({ root, data, strips, ring, sigil, parts, side, z, facing });
});

// ------------------------------------------------------- korisnički sloj ---

const panel = document.getElementById('panel');
const elIme = document.getElementById('p-ime');
const elTitula = document.getElementById('p-titula');
const elOpis = document.getElementById('p-opis');
const elDelovi = document.getElementById('p-delovi');
const rail = document.getElementById('rail');

heroes.forEach((h, i) => {
  const chip = document.createElement('button');
  chip.className = 'chip';
  chip.innerHTML = `<span class="chip-br">${String(i + 1).padStart(2, '0')}</span>${h.data.name}`;
  chip.addEventListener('click', () => select(i));
  rail.appendChild(chip);
});
const chips = Array.from(rail.children);

// ------------------------------------------------------------- kretanje ---

let selected = -1;
let hovered = -1;
let tween = null;

function glide(camTo, tgtTo, dur = 1150) {
  tween = {
    t0: performance.now(), dur,
    cf: camera.position.clone(), ct: camTo,
    tf: controls.target.clone(), tt: tgtTo,
  };
}

const _f = new THREE.Vector3();
const _r = new THREE.Vector3();
function select(i) {
  selected = i;
  const h = heroes[i];
  const p = h.root.position;

  // pravac u koji junak gleda i njegova desna strana — kamera staje u lađu,
  // pomerena u stranu da kadar bude iz tri četvrtine
  _f.set(Math.sin(h.facing), 0, Math.cos(h.facing));
  _r.set(_f.z, 0, -_f.x);

  const eye = h.data.eyeY ?? 1.5;
  const camTo = new THREE.Vector3(
    p.x + _f.x * 2.25 + _r.x * 0.9,
    PLINTH_H + eye + 0.16,
    p.z + _f.z * 2.25 + _r.z * 0.9
  );
  // meta niže od očiju: kadar tako uhvati i postament sa pločicom
  const tgtTo = new THREE.Vector3(p.x, PLINTH_H + eye * 0.70, p.z);
  glide(camTo, tgtTo);

  // reflektor sa strane kamere, dovoljno blizu da izvuče detalje iz mraka
  spot.position.set(p.x + _f.x * 1.9 + _r.x * 1.15, PLINTH_H + eye + 0.95, p.z + _f.z * 1.9 + _r.z * 1.15);
  spot.intensity = 24;

  elIme.textContent = h.data.name;
  elTitula.textContent = h.data.title;
  elOpis.textContent = h.data.blurb;
  elDelovi.textContent = `${h.parts} delova`;
  panel.classList.add('open');
  chips.forEach((c, k) => c.classList.toggle('on', k === i));
}

function reset() {
  selected = -1;
  spot.intensity = 0;
  panel.classList.remove('open');
  chips.forEach((c) => c.classList.remove('on'));
  glide(HOME_CAM.clone(), HOME_TGT.clone());
}

document.getElementById('zatvori').addEventListener('click', reset);

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') reset();
  else if (e.key === 'ArrowRight') select((selected + 1 + heroes.length) % heroes.length);
  else if (e.key === 'ArrowLeft') select((selected - 1 + heroes.length) % heroes.length);
});

// ------------------------------------------------------------------ pogled ---

const ray = new THREE.Raycaster();
const ptr = new THREE.Vector2(-9, -9);
renderer.domElement.addEventListener('pointermove', (e) => {
  ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
  ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

let down = null;
renderer.domElement.addEventListener('pointerdown', (e) => { down = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down[0], e.clientY - down[1]);
  down = null;
  if (moved > 6) return;
  if (hovered >= 0) select(hovered);
  else if (selected >= 0) reset();
});

function heroOf(o) {
  while (o) { if (o.userData.hero !== undefined) return o.userData.hero; o = o.parent; }
  return -1;
}

// ---------------------------------------------------------------- animacija ---

const clock = new THREE.Clock();
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  frame++;

  for (const h of heroes) h.data.update(t);

  // barjaci se talasaju, svaki sa svojim ritmom
  for (let i = 0; i < heroes.length; i++) {
    const st = heroes[i].strips;
    for (let k = 0; k < st.length; k++) {
      st[k].rotation.x = Math.sin(t * (0.72 + i * 0.035) + k * 0.55 + i) * 0.055;
      st[k].rotation.z = Math.sin(t * (0.51 + i * 0.028) + k * 0.4) * 0.03;
    }
  }

  // plamenovi i njihova svetla
  for (const f of flames) {
    const s = 1 + Math.sin(t * f.speed + f.phase) * 0.17 + Math.sin(t * f.speed * 2.6 + f.phase) * 0.08;
    f.mesh.scale.set(s, 1 + (s - 1) * 1.7, s);
  }
  for (const fl of flickerLights) {
    fl.light.intensity = fl.base
      + Math.sin(t * fl.speed + fl.phase) * fl.amp * 0.6
      + Math.sin(t * fl.speed * 2.4 + fl.phase * 1.6) * fl.amp * 0.4;
  }

  // sneg pada i lelujavo se pomera u stranu
  {
    const pos = snow.geometry.attributes.position;
    for (let i = 0; i < snowData.length; i++) {
      const d = snowData[i];
      const k = ((t * d.speed * 0.09 + d.offset) % 1);
      const y = 11.5 - k * 12.2;
      pos.setXYZ(i, d.x + Math.sin(t * d.drift + d.phase) * 0.6, y, d.z + Math.cos(t * d.drift * 0.7 + d.phase) * 0.4);
    }
    pos.needsUpdate = true;
  }

  // šta je pod pokazivačem
  if (frame % 2 === 0) {
    ray.setFromCamera(ptr, camera);
    const hit = ray.intersectObjects(heroRoots, true);
    const idx = hit.length ? heroOf(hit[0].object) : -1;
    if (idx !== hovered) {
      hovered = idx;
      renderer.domElement.style.cursor = idx >= 0 ? 'pointer' : 'default';
    }
  }
  // obruč postamenta zasvetli pod pokazivačem ili kod izabranog junaka
  for (let i = 0; i < heroes.length; i++) {
    const want = (i === hovered || i === selected) ? 0.9 : 0;
    const m = heroes[i].ring.material;
    m.emissiveIntensity += (want - m.emissiveIntensity) * 0.12;
  }

  if (tween) {
    const k = Math.min(1, (performance.now() - tween.t0) / tween.dur);
    const e = k * k * (3 - 2 * k);
    camera.position.lerpVectors(tween.cf, tween.ct, e);
    controls.target.lerpVectors(tween.tf, tween.tt, e);
    if (k >= 1) tween = null;
  }

  controls.update();
  renderer.render(scene, camera);

  if (frame === 1) {
    document.getElementById('ucitavanje').style.display = 'none';
    window.__sceneReady = true;
  }
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// hook za snimanje slika i za konzolu
window.__dvorana = {
  select, reset,
  names: heroes.map((h) => h.data.name),
  parts: heroes.map((h) => h.parts),
  /** Bliski kadar gornjeg dela tela — za proveru lica i opreme. */
  closeup(i) {
    const h = heroes[i];
    const p = h.root.position;
    _f.set(Math.sin(h.facing), 0, Math.cos(h.facing));
    _r.set(_f.z, 0, -_f.x);
    const eye = h.data.eyeY ?? 1.5;
    camera.position.set(
      p.x + _f.x * 1.05 + _r.x * 0.42,
      PLINTH_H + eye + 0.07,
      p.z + _f.z * 1.05 + _r.z * 0.42
    );
    controls.target.set(p.x, PLINTH_H + eye - 0.08, p.z);
    tween = null;
    spot.position.set(p.x + _f.x * 1.5 + _r.x * 0.9, PLINTH_H + eye + 0.7, p.z + _f.z * 1.5 + _r.z * 0.9);
    spot.intensity = 20;
  },
  renderInfo: () => ({
    calls: renderer.info.render.calls,
    triangles: renderer.info.render.triangles,
    geometries: renderer.info.memory.geometries,
  }),
  hideUI() { for (const id of ['zaglavlje', 'uputstvo', 'rail']) document.getElementById(id).style.display = 'none'; },
};

animate();
