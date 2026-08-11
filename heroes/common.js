// heroes/common.js — zajednički alati za gradnju heroja
//
// KONVENCIJE ZA SVAKOG HEROJA:
//  - stopala na y = 0, heroj gleda u pravcu +Z
//  - ukupna visina ~1.2 do ~2.2 (u zavisnosti od heroja)
//  - horizontalni otisak unutar ±0.9 po x i z (oružje/barjak sme malo šire)
//  - orijentiri proporcija (za visinu ~1.8): kukovi ~0.85, grudi ~1.15,
//    ramena ~1.35, centar glave ~1.55, teme ~1.75
//  - bez svetala, tekstura, canvas-a i asinhronog koda unutar heroja;
//    sjaj se postiže emissive materijalima

import * as THREE from 'three';

// ---------------------------------------------------------------- paleta ---

export const COLORS = {
  // metali
  steel: 0x9fa8b2,
  steelDark: 0x6a737c,
  iron: 0x4d5157,
  gold: 0xd9a13b,
  goldLight: 0xf0c060,
  bronze: 0xa87438,
  silver: 0xc9d1d9,

  // koža i drvo
  leather: 0x7a5230,
  leatherDark: 0x4e3520,
  leatherLight: 0x9a7040,
  wood: 0x6e4a2a,
  woodDark: 0x46301a,

  // tkanine
  clothRed: 0x9e2b25,
  clothBlue: 0x2f4a8a,
  clothGreen: 0x3d6b35,
  clothWhite: 0xe8e2d0,
  clothPurple: 0x53386e,
  clothBlack: 0x2a2a33,
  clothBrown: 0x6b4a2e,

  // ten i kosa
  skin: 0xdca57f,
  skinPale: 0xe8c39e,
  skinTan: 0xb97f56,
  skinDark: 0x8a5a3b,
  hairBrown: 0x5a3a1e,
  hairBlond: 0xd9b45a,
  hairWhite: 0xdad5c8,
  hairGinger: 0xb4501e,
  hairBlack: 0x2a2320,

  // ostalo
  bone: 0xe6ddc4,
  glowGreen: 0x58ff9d,
  glowCyan: 0x6fd8ff,
  glowAmber: 0xffb347,
  glowGold: 0xffd76a,
};

// ------------------------------------------------------------- materijali ---

export function mat(color, opts = {}) {
  const {
    roughness = 0.8,
    metalness = 0.0,
    flat = true,
    emissive = 0x000000,
    emissiveIntensity = 1,
    transparent = false,
    opacity = 1,
    side = THREE.FrontSide,
  } = opts;
  return new THREE.MeshStandardMaterial({
    color, roughness, metalness, flatShading: flat,
    emissive, emissiveIntensity, transparent, opacity, side,
  });
}

// metal sa sjajem
export function metalMat(color, opts = {}) {
  return mat(color, { roughness: 0.35, metalness: 0.85, ...opts });
}

// materijal koji svetli sam od sebe
export function glowMat(color, intensity = 1.6) {
  return mat(color, { emissive: color, emissiveIntensity: intensity, roughness: 0.4 });
}

// -------------------------------------------------------------- geometrija ---

export function shaded(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  return shaded(m);
}

export function cyl(rTop, rBottom, h, material, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, seg), material);
  m.position.set(x, y, z);
  return shaded(m);
}

export function sphere(r, material, x = 0, y = 0, z = 0, wSeg = 12, hSeg = 10) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, wSeg, hSeg), material);
  m.position.set(x, y, z);
  return shaded(m);
}

export function cone(r, h, material, x = 0, y = 0, z = 0, seg = 10) {
  const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, seg), material);
  m.position.set(x, y, z);
  return shaded(m);
}

export function torus(r, tube, material, x = 0, y = 0, z = 0, seg = 10, tSeg = 20) {
  const m = new THREE.Mesh(new THREE.TorusGeometry(r, tube, seg, tSeg), material);
  m.position.set(x, y, z);
  return shaded(m);
}

// telo obrtanja — idealno za odore, suknje, šešire, pehare…
// points: niz [poluprečnik, y] od dna ka vrhu
export function lathe(points, material, seg = 14) {
  const pts = points.map(([r, y]) => new THREE.Vector2(r, y));
  const m = new THREE.Mesh(new THREE.LatheGeometry(pts, seg), material);
  return shaded(m);
}

// cilindar razapet između dve tačke — za kaiševe, lukove, motke pod uglom…
// a i b su nizovi [x, y, z]
export function bar(a, b, r, material, seg = 8) {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), material);
  m.position.copy(va).addScaledVector(dir, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return shaded(m);
}

// grupa sa decom i pozicijom
export function group(children = [], x = 0, y = 0, z = 0) {
  const g = new THREE.Group();
  for (const c of children) g.add(c);
  g.position.set(x, y, z);
  return g;
}
