// heroes/index.js — spisak svih heroja, redosled = raspored po krugu
import { createKnight } from './knight.js';
import { createWizard } from './wizard.js';
import { createRanger } from './ranger.js';
import { createDwarf } from './dwarf.js';
import { createCleric } from './cleric.js';
import { createBarbarian } from './barbarian.js';
import { createRogue } from './rogue.js';
import { createPaladin } from './paladin.js';
import { createDruid } from './druid.js';
import { createNecromancer } from './necromancer.js';

export const HERO_CREATORS = [
  createKnight,
  createWizard,
  createRanger,
  createDwarf,
  createCleric,
  createBarbarian,
  createRogue,
  createPaladin,
  createDruid,
  createNecromancer,
];
