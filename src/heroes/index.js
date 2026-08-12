// src/heroes/index.js — spisak junaka; redosled određuje mesto u dvorani
// (prvih pet zauzima desni red niz lađu, drugih pet levi)

import { createHunter } from './hunter.js';
import { createFalconer } from './falconer.js';
import { createEngineer } from './engineer.js';
import { createMonk } from './monk.js';
import { createFrostWitch } from './frostwitch.js';
import { createAlchemist } from './alchemist.js';
import { createShieldmaiden } from './shieldmaiden.js';
import { createBard } from './bard.js';
import { createInquisitor } from './inquisitor.js';
import { createDuelist } from './duelist.js';

export const HEROES = [
  createHunter,        // desni red, začelje
  createFalconer,
  createEngineer,
  createMonk,
  createFrostWitch,    // desni red, ulaz
  createAlchemist,     // levi red, začelje
  createShieldmaiden,
  createBard,
  createInquisitor,
  createDuelist,       // levi red, ulaz
];
