// main.js — Krug Heroja: prosta scena u sumrak sa deset junaka na postamentima
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { HERO_CREATORS } from './heroes/index.js';

// ------------------------------------------------------------ osnova scene ---

const app = document.getElementById('app');

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
app.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x2c2440, 30, 170);

const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 500);
const DEFAULT_CAM = new THREE.Vector3(0, 7.2, 17.5);
const DEFAULT_TARGET = new THREE.Vector3(0, 1.4, 0);
camera.position.copy(DEFAULT_CAM);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(DEFAULT_TARGET);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.maxPolarAngle = Math.PI * 0.49;
controls.minDistance = 3;
controls.maxDistance = 70;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// deterministički pseudo-slučajni brojevi (scena uvek izgleda isto)
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260811);

// ------------------------------------------------------------------- nebo ---

const sky = new THREE.Mesh(
  new THREE.SphereGeometry(300, 32, 16),
  new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: {
      cTop: { value: new THREE.Color(0x121a3c) },
      cMid: { value: new THREE.Color(0x4a3768) },
      cBot: { value: new THREE.Color(0xd96f3f) },
    },
    vertexShader: /* glsl */ `
      varying vec3 vPos;
      void main() {
        vPos = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vPos;
      uniform vec3 cTop, cMid, cBot;
      void main() {
        float h = normalize(vPos).y;
        vec3 col = h > 0.12
          ? mix(cMid, cTop, smoothstep(0.12, 0.65, h))
          : mix(cBot, cMid, smoothstep(-0.08, 0.12, h));
        gl_FragColor = vec4(col, 1.0);
      }`,
  })
);
scene.add(sky);

// zvezde
{
  const n = 800;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const phi = rand() * Math.PI * 2;
    const y = 0.12 + rand() * 0.85;                    // samo gornja polulopta
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    pos[i * 3] = Math.cos(phi) * r * 285;
    pos[i * 3 + 1] = y * 285;
    pos[i * 3 + 2] = Math.sin(phi) * r * 285;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const stars = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xcdd8ff, size: 1.6, sizeAttenuation: false,
    transparent: true, opacity: 0.85, fog: false, depthWrite: false,
  }));
  scene.add(stars);
}

// mesec
{
  const moon = new THREE.Mesh(
    new THREE.SphereGeometry(9, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xf5eedc, fog: false })
  );
  moon.position.set(-120, 150, -190);
  scene.add(moon);
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(13, 24, 18),
    new THREE.MeshBasicMaterial({ color: 0xf5eedc, transparent: true, opacity: 0.16, fog: false })
  );
  halo.position.copy(moon.position);
  scene.add(halo);
}

// ---------------------------------------------------------------- osvetljenje ---

const sun = new THREE.DirectionalLight(0xffb37a, 2.1);          // nisko sunce na zalasku
sun.position.set(30, 16, -20);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -24;
sun.shadow.camera.right = 24;
sun.shadow.camera.top = 24;
sun.shadow.camera.bottom = -24;
sun.shadow.camera.near = 5;
sun.shadow.camera.far = 100;
sun.shadow.bias = -0.0006;
scene.add(sun);

scene.add(new THREE.HemisphereLight(0x5a68b8, 0x3a2c22, 0.6));

const moonFill = new THREE.DirectionalLight(0x8fa8ff, 0.35);
moonFill.position.set(-25, 30, 25);
scene.add(moonFill);

// -------------------------------------------------------------------- tlo ---

{
  const geo = new THREE.PlaneGeometry(220, 220, 72, 72);
  geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i);
    const d = Math.hypot(x, z);
    if (d > 13.5) {
      const talas = Math.sin(x * 0.16) * Math.cos(z * 0.13) * 0.5 + (rand() - 0.5) * 0.35;
      p.setY(i, talas * Math.min(1, (d - 13.5) / 12));
    }
  }
  geo.computeVertexNormals();
  const ground = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x3f5834, roughness: 1 }));
  ground.receiveShadow = true;
  scene.add(ground);
}

// kameni plato u sredini
{
  const plaza = new THREE.Mesh(
    new THREE.CircleGeometry(11.5, 56).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x6b6560, roughness: 0.95 })
  );
  plaza.position.y = 0.02;
  plaza.receiveShadow = true;
  scene.add(plaza);

  const staza = new THREE.Mesh(
    new THREE.RingGeometry(7.0, 9.0, 56).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0x59524b, roughness: 1 })
  );
  staza.position.y = 0.035;
  staza.receiveShadow = true;
  scene.add(staza);

  // radijalne fuge između ploča
  const fugMat = new THREE.MeshStandardMaterial({ color: 0x4a443e, roughness: 1 });
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2;
    const fuga = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.015, 4.6), fugMat);
    fuga.position.set(Math.cos(a) * 9.2, 0.04, Math.sin(a) * 9.2);
    fuga.rotation.y = -a + Math.PI / 2;
    fuga.receiveShadow = true;
    scene.add(fuga);
  }
}

// ------------------------------------------------------- okolina (dekor) ---

const stoneMat = new THREE.MeshStandardMaterial({ color: 0x7d7a75, roughness: 1, flatShading: true });
const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3018, roughness: 1, flatShading: true });
const pineMat = new THREE.MeshStandardMaterial({ color: 0x28422a, roughness: 1, flatShading: true });
const bushMat = new THREE.MeshStandardMaterial({ color: 0x3a5c33, roughness: 1, flatShading: true });

function scatterAngle(rMin, rMax) {
  const a = rand() * Math.PI * 2;
  const r = rMin + rand() * (rMax - rMin);
  return [Math.cos(a) * r, Math.sin(a) * r];
}

// stenje
for (let i = 0; i < 34; i++) {
  const [x, z] = scatterAngle(14, 70);
  const s = 0.25 + rand() * 0.8;
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), stoneMat);
  rock.position.set(x, s * 0.4, z);
  rock.rotation.set(rand() * 3, rand() * 3, rand() * 3);
  rock.scale.y = 0.6 + rand() * 0.5;
  rock.castShadow = rock.receiveShadow = true;
  scene.add(rock);
}

// četinari
for (let i = 0; i < 30; i++) {
  const [x, z] = scatterAngle(17, 85);
  const h = 3 + rand() * 4;
  const tree = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(h * 0.045, h * 0.07, h * 0.35, 7), trunkMat);
  trunk.position.y = h * 0.17;
  trunk.castShadow = true;
  tree.add(trunk);
  for (let k = 0; k < 3; k++) {
    const kr = h * (0.34 - k * 0.08);
    const kh = h * (0.42 - k * 0.06);
    const crown = new THREE.Mesh(new THREE.ConeGeometry(kr, kh, 8), pineMat);
    crown.position.y = h * (0.38 + k * 0.24);
    crown.castShadow = true;
    tree.add(crown);
  }
  tree.position.set(x, 0, z);
  tree.rotation.y = rand() * Math.PI * 2;
  scene.add(tree);
}

// žbunje
for (let i = 0; i < 22; i++) {
  const [x, z] = scatterAngle(13, 50);
  const s = 0.3 + rand() * 0.5;
  const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), bushMat);
  bush.position.set(x, s * 0.55, z);
  bush.scale.y = 0.7;
  bush.rotation.y = rand() * 3;
  bush.castShadow = bush.receiveShadow = true;
  scene.add(bush);
}

// planine u daljini
const mountainMat = new THREE.MeshStandardMaterial({ color: 0x2c3350, roughness: 1, flatShading: true });
for (let i = 0; i < 9; i++) {
  const a = (i / 9) * Math.PI * 2 + rand() * 0.4;
  const r = 170 + rand() * 60;
  const h = 45 + rand() * 55;
  const m = new THREE.Mesh(new THREE.ConeGeometry(h * (0.7 + rand() * 0.5), h, 6), mountainMat);
  m.position.set(Math.cos(a) * r, h * 0.42, Math.sin(a) * r);
  m.rotation.y = rand() * 3;
  scene.add(m);
}

// ------------------------------------------------------------ logorska vatra ---

const flames = [];       // { mesh, speed, phase, baseScale }
const flickerLights = []; // { light, base, amp, speed, phase }

function makeFlame(size, color, intensity, x, y, z) {
  const f = new THREE.Mesh(
    new THREE.ConeGeometry(size * 0.42, size, 7),
    new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: intensity,
      roughness: 0.5, transparent: true, opacity: 0.92, flatShading: true,
    })
  );
  f.position.set(x, y, z);
  flames.push({ mesh: f, speed: 9 + rand() * 6, phase: rand() * 9, baseScale: 1 });
  return f;
}

{
  const vatra = new THREE.Group();
  // kameni obruč
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2;
    const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.22 + rand() * 0.1, 0), stoneMat);
    st.position.set(Math.cos(a) * 0.95, 0.14, Math.sin(a) * 0.95);
    st.rotation.set(rand() * 3, rand() * 3, rand() * 3);
    st.castShadow = st.receiveShadow = true;
    vatra.add(st);
  }
  // cepanice
  for (let i = 0; i < 5; i++) {
    const log = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 1.15, 7), trunkMat);
    const a = (i / 5) * Math.PI * 2;
    log.position.set(Math.cos(a) * 0.18, 0.22, Math.sin(a) * 0.18);
    log.rotation.set(Math.PI / 2.6, 0, a);
    log.castShadow = true;
    vatra.add(log);
  }
  // plamenovi
  vatra.add(makeFlame(1.15, 0xff6a22, 2.2, 0, 0.75, 0));
  vatra.add(makeFlame(0.75, 0xffb23a, 2.6, 0.14, 0.62, 0.1));
  vatra.add(makeFlame(0.5, 0xffe08a, 3.0, -0.1, 0.55, -0.08));
  scene.add(vatra);

  const fireLight = new THREE.PointLight(0xff8033, 26, 22, 2);
  fireLight.position.set(0, 1.3, 0);
  scene.add(fireLight);
  flickerLights.push({ light: fireLight, base: 26, amp: 6, speed: 11, phase: 0 });
}

// žar koji leti sa vatre
let embers, emberData;
{
  const n = 90;
  const pos = new Float32Array(n * 3);
  emberData = [];
  for (let i = 0; i < n; i++) {
    emberData.push({
      a: rand() * Math.PI * 2,
      r: 0.05 + rand() * 0.3,
      speed: 0.5 + rand() * 0.9,
      offset: rand() * 4,
      swirl: 0.5 + rand() * 1.5,
    });
    pos[i * 3 + 1] = -10;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  embers = new THREE.Points(g, new THREE.PointsMaterial({
    color: 0xffa04d, size: 0.07, transparent: true, opacity: 0.9,
    blending: THREE.AdditiveBlending, depthWrite: false,
  }));
  scene.add(embers);
}

// ----------------------------------------------------------------- baklje ---

{
  const NUM = 10;
  for (let i = 0; i < NUM; i++) {
    const a = ((i + 0.5) / NUM) * Math.PI * 2;
    const x = Math.cos(a) * 10.6, z = Math.sin(a) * 10.6;
    const t = new THREE.Group();

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 2.3, 7), trunkMat);
    pole.position.y = 1.15;
    pole.castShadow = true;
    t.add(pole);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.02, 6, 12),
      new THREE.MeshStandardMaterial({ color: 0x4d5157, metalness: 0.7, roughness: 0.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 2.1;
    t.add(ring);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.11, 0.05, 0.16, 8),
      new THREE.MeshStandardMaterial({ color: 0x4d5157, metalness: 0.7, roughness: 0.5 })
    );
    cup.position.y = 2.32;
    t.add(cup);

    t.add(makeFlame(0.42, 0xff7a2a, 2.4, 0, 2.6, 0));
    t.add(makeFlame(0.26, 0xffd06a, 2.8, 0.03, 2.55, 0.02));

    t.position.set(x, 0, z);
    scene.add(t);

    if (i % 2 === 0) { // svetlo na svakoj drugoj baklji (zbog performansi)
      const l = new THREE.PointLight(0xff9040, 7, 9, 2);
      l.position.set(x, 2.7, z);
      scene.add(l);
      flickerLights.push({ light: l, base: 7, amp: 2.2, speed: 9 + rand() * 4, phase: rand() * 7 });
    }
  }
}

// ---------------------------------------------------------------- postamenti ---

const pedestalTopY = 0.62;
function makePedestal(x, z, angle) {
  const g = new THREE.Group();
  const m1 = new THREE.MeshStandardMaterial({ color: 0x5f5a55, roughness: 0.95, flatShading: true });
  const m2 = new THREE.MeshStandardMaterial({ color: 0x6e6862, roughness: 0.9, flatShading: true });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.5, 0.24, 12), m1);
  base.position.y = 0.12;
  const mid = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.18, 0.32, 12), m2);
  mid.position.y = 0.4;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.08, 1.0, 0.12, 12), m1);
  top.position.y = 0.56;
  const trim = new THREE.Mesh(
    new THREE.TorusGeometry(1.04, 0.025, 6, 24),
    new THREE.MeshStandardMaterial({ color: 0xd9a13b, metalness: 0.8, roughness: 0.35 })
  );
  trim.rotation.x = Math.PI / 2;
  trim.position.y = 0.615;

  for (const p of [base, mid, top, trim]) { p.castShadow = p.receiveShadow = true; g.add(p); }
  g.position.set(x, 0, z);
  g.rotation.y = angle;
  return g;
}

// ------------------------------------------------------------------ heroji ---

function makeNameplate(name, title) {
  const canvas = document.createElement('canvas');
  canvas.width = 640; canvas.height = 168;
  const c = canvas.getContext('2d');

  const r = 26;
  c.fillStyle = 'rgba(10, 12, 24, 0.74)';
  c.strokeStyle = 'rgba(242, 217, 138, 0.85)';
  c.lineWidth = 4;
  c.beginPath();
  c.roundRect(6, 6, canvas.width - 12, canvas.height - 12, r);
  c.fill();
  c.stroke();

  c.textAlign = 'center';
  c.fillStyle = '#f2d98a';
  c.font = 'bold 58px Georgia, serif';
  c.fillText(name, canvas.width / 2, 74);
  c.fillStyle = '#c8cfe8';
  c.font = 'italic 34px Georgia, serif';
  c.fillText(title, canvas.width / 2, 126);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  sprite.scale.set(2.6, 0.68, 1);
  return sprite;
}

const heroes = [];      // { root, data, plate, baseY }
const heroRoots = [];

const RADIUS = 8;
HERO_CREATORS.forEach((create, i) => {
  const a = (i / HERO_CREATORS.length) * Math.PI * 2 - Math.PI / 2;
  const x = Math.cos(a) * RADIUS;
  const z = Math.sin(a) * RADIUS;
  const facing = Math.atan2(-x, -z); // heroj gleda ka centru

  scene.add(makePedestal(x, z, facing));

  const data = create();
  const root = new THREE.Group();
  root.add(data.group);
  root.position.set(x, pedestalTopY, z);
  root.rotation.y = facing;
  root.userData.heroIndex = i;
  scene.add(root);

  // visina heroja -> pozicija pločice sa imenom
  const bbox = new THREE.Box3().setFromObject(data.group);
  const plate = makeNameplate(data.name, data.title);
  plate.position.y = bbox.max.y + 0.55;
  root.add(plate);

  heroes.push({ root, data, plate, baseScale: plate.scale.clone() });
  heroRoots.push(root);
});

// ------------------------------------------------- interakcija (hover/klik) ---

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(-10, -10);
let hovered = -1;
let selected = -1;

const panel = document.getElementById('panel');
const panelIme = document.getElementById('panel-ime');
const panelTitula = document.getElementById('panel-titula');
const panelOpis = document.getElementById('panel-opis');

renderer.domElement.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

function findHeroIndex(obj) {
  while (obj) {
    if (obj.userData.heroIndex !== undefined) return obj.userData.heroIndex;
    obj = obj.parent;
  }
  return -1;
}

// glatko fokusiranje kamere na izabranog heroja
let tween = null; // { t0, dur, camFrom, camTo, tgtFrom, tgtTo }
function focusHero(i) {
  const { root } = heroes[i];
  const p = root.position;
  const dir = new THREE.Vector3(-p.x, 0, -p.z).normalize();
  const camTo = p.clone().addScaledVector(dir, 4.4).add(new THREE.Vector3(0, 2.0, 0));
  const tgtTo = p.clone().add(new THREE.Vector3(0, 1.35, 0));
  tween = {
    t0: performance.now(), dur: 1100,
    camFrom: camera.position.clone(), camTo,
    tgtFrom: controls.target.clone(), tgtTo,
  };
  controls.autoRotate = false;
}

function resetView() {
  selected = -1;
  panel.classList.remove('vidljiv');
  tween = {
    t0: performance.now(), dur: 1100,
    camFrom: camera.position.clone(), camTo: DEFAULT_CAM.clone(),
    tgtFrom: controls.target.clone(), tgtTo: DEFAULT_TARGET.clone(),
  };
  controls.autoRotate = true;
}

let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt) return;
  const moved = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (moved > 6) return; // bilo je prevlačenje, ne klik

  if (hovered >= 0) {
    selected = hovered;
    const d = heroes[selected].data;
    panelIme.textContent = d.name;
    panelTitula.textContent = d.title;
    panelOpis.textContent = d.blurb;
    panel.classList.add('vidljiv');
    focusHero(selected);
  } else if (selected >= 0) {
    resetView();
  }
});

document.getElementById('zatvori').addEventListener('click', resetView);

// ---------------------------------------------------------------- animacija ---

const clock = new THREE.Clock();
let frame = 0;

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();
  frame++;

  // heroji
  for (const h of heroes) h.data.update(t);

  // plamenovi
  for (const f of flames) {
    const s = 1 + Math.sin(t * f.speed + f.phase) * 0.16 + Math.sin(t * f.speed * 2.7 + f.phase) * 0.07;
    f.mesh.scale.set(s, 1 + (s - 1) * 1.6, s);
  }
  for (const fl of flickerLights) {
    fl.light.intensity = fl.base + Math.sin(t * fl.speed + fl.phase) * fl.amp * 0.6
      + Math.sin(t * fl.speed * 2.3 + fl.phase * 1.7) * fl.amp * 0.4;
  }

  // žar
  {
    const pos = embers.geometry.attributes.position;
    for (let i = 0; i < emberData.length; i++) {
      const d = emberData[i];
      const life = ((t * d.speed + d.offset) % 3) / 3;      // 0..1
      const y = 0.6 + life * 3.4;
      const r = d.r + life * 0.55;
      const a = d.a + life * d.swirl * 3;
      pos.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r);
    }
    pos.needsUpdate = true;
    embers.material.opacity = 0.85;
  }

  // hover (svaki drugi frejm, radi performansi)
  if (frame % 2 === 0) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(heroRoots, true);
    const idx = hits.length ? findHeroIndex(hits[0].object) : -1;
    if (idx !== hovered) {
      hovered = idx;
      renderer.domElement.style.cursor = idx >= 0 ? 'pointer' : 'default';
    }
  }
  for (let i = 0; i < heroes.length; i++) {
    const target = (i === hovered || i === selected) ? 1.18 : 1.0;
    const pl = heroes[i].plate;
    pl.scale.lerp(heroes[i].baseScale.clone().multiplyScalar(target), 0.15);
  }

  // tvin kamere
  if (tween) {
    const k = Math.min(1, (performance.now() - tween.t0) / tween.dur);
    const e = k * k * (3 - 2 * k); // smoothstep
    camera.position.lerpVectors(tween.camFrom, tween.camTo, e);
    controls.target.lerpVectors(tween.tgtFrom, tween.tgtTo, e);
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

animate();
