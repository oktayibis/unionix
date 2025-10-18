/**
 * Pokemon team builder example using discriminated unions for typings.
 *
 * Run with: npx ts-node example/pokemon.ts
 */

import { create } from '../src';

interface FirePokemon {
  readonly type: 'fire';
  readonly name: string;
  readonly attack: number;
  readonly speed: number;
}

interface WaterPokemon {
  readonly type: 'water';
  readonly name: string;
  readonly defense: number;
  readonly stamina: number;
}

interface ElectricPokemon {
  readonly type: 'electric';
  readonly name: string;
  readonly attack: number;
  readonly accuracy: number;
}

interface GrassPokemon {
  readonly type: 'grass';
  readonly name: string;
  readonly stamina: number;
  readonly regeneration: number;
}

type Pokemon = FirePokemon | WaterPokemon | ElectricPokemon | GrassPokemon;

const pokedex = create<Pokemon>();

const roster: Pokemon[] = [
  { type: 'fire', name: 'Charmander', attack: 52, speed: 65 },
  { type: 'grass', name: 'Bulbasaur', stamina: 45, regeneration: 30 },
  { type: 'water', name: 'Squirtle', defense: 65, stamina: 44 },
  { type: 'electric', name: 'Pikachu', attack: 55, accuracy: 95 },
];

console.log('=== Team summary ===');
roster.forEach((pokemon) => {
  console.log(
    pokedex.when(pokemon, {
      fire: (fire) => `${fire.name} the Fire-type (ATK ${fire.attack}, SPD ${fire.speed})`,
      water: (water) => `${water.name} the Water-type (DEF ${water.defense}, STA ${water.stamina})`,
      electric: (electric) => `${electric.name} the Electric-type (ATK ${electric.attack}, ACC ${electric.accuracy})`,
      grass: (grass) => `${grass.name} the Grass-type (STA ${grass.stamina}, REG ${grass.regeneration})`,
    })
  );
});

console.log('\n=== Lightning training ===');
const trainedRoster = roster.map((pokemon) =>
  pokedex.map(pokemon, {
    electric: (electric) => ({ ...electric, accuracy: electric.accuracy + 5 }),
    fire: (fire) => ({ ...fire, speed: fire.speed + 3 }),
  })
);
console.log(trainedRoster);

console.log('\n=== Fast attackers ===');
const fastAttackers = pokedex.filterBy(trainedRoster, {
  fire: (fire) => fire.speed > 60,
  electric: (electric) => electric.accuracy > 90,
});
fastAttackers.forEach((pokemon) => {
  console.log(`Fast attacker: ${pokemon.name} (${pokemon.type})`);
});

console.log('\n=== Type counts ===');
const partitioned = pokedex.partition(trainedRoster);
for (const key of Object.keys(partitioned)) {
  const amount = partitioned[key as keyof typeof partitioned].length;
  console.log(`${key}: ${amount}`);
}

console.log('\n=== Creating a new recruit ===');
const recruitBuilder = pokedex.constructor('grass');
const oddish = recruitBuilder({ name: 'Oddish', stamina: 45, regeneration: 55 });
console.log('Oddish created?', pokedex.isGrass(oddish));
