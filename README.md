# 🛡 Dvorana Barjaka

Three.js scena: razrušena kamena dvorana pod mesečinom, u kojoj **deset junaka
srednjovekovne fantazije** stoji u dva reda niz lađu — svaki na svom postamentu,
sa svojim barjakom iza leđa i uklesanim imenom ispred nogu.

Kroz probijen krov pada sneg. Kroz rozetu na začelju ulazi mesečina i seče lađu
po dužini, sve do postolja sa mačem zabijenim u napukli kamen. Jedina toplina
dolazi iz šest žeravnika uz stubove.

## Pokretanje

ES moduli traže server (ne rade preko `file://`). Iz foldera projekta:

```bash
python3 -m http.server 8080
# ili
npm start
```

pa otvori [http://localhost:8080](http://localhost:8080). Nema build koraka i
nema šta da se instalira — Three.js je u `vendor/`.

## Kontrole

| | |
|---|---|
| prevlačenje | obilazak dvorane |
| točkić | prilaz i udaljavanje |
| klik na junaka | kamera prilazi, otvara se njegova priča |
| traka pri dnu | skok na bilo kog junaka |
| ← → | prethodni / sledeći junak |
| Esc | povratak na pogled niz lađu |

## Junaci

Namerno izbegnut standardni komplet — nijedan običan vitez, mag ni patuljak.

| | Junak | Ko je | Grb |
|---|---|---|---|
| 01 | Ravna Vukodav | lovac na čudovišta | očnjak |
| 02 | Ser Kolm od Sivog Sokola | vitez sokolar | pero |
| 03 | Grimald Točkar | opsadni majstor | zupčanik |
| 04 | Brat Tihomir | monah Praznog Puta | prstenovi |
| 05 | Baba Zimoveja | zimska veštica | pahulja |
| 06 | Majstor Ilarion | alhemičar Kužne Kapije | bočica |
| 07 | Hilda Gvozdena Kosa | štitonoša severa | koplje |
| 08 | Lirien Sedmostruna | putujući pevač | lutnja |
| 09 | Inkvizitorka Vela | inkvizitorka Otvorenog Oka | fenjer |
| 10 | Dorijan Tri Uboda | dvobojac | ukršteni mačevi |

Tri junaka nose živo društvo: sokolar ima sokola pod kapuljačom, veštica vranu
na ramenu, a opsadni majstor mehaničku ruku koja se stvarno vrti.

## Struktura

```
index.html          – ulazna stranica, UI, importmap
main.js             – scena, svetlo, sneg, barjaci, postamenti, upravljanje
src/kit.js          – alatnica: paleta, primitivi, makeFace/makeHand, klasa Anim
src/hall.js         – arhitektura dvorane, žeravnici, snopovi mesečine
src/heroes/<ime>.js – po jedan fajl za svakog junaka
vendor/             – three.module.js + OrbitControls.js
```

### Kako je građen junak

Svaki modul izvozi jednu funkciju koja vraća:

```js
{
  name, title, blurb,              // ime, zvanje i priča
  heraldry: { color, sigil },      // boja barjaka i znak na njemu
  eyeY,                            // visina očiju — po njoj scena kadrira kameru
  group,                           // THREE.Group, stopala na y = 0, gleda u +Z
  update(t),                       // čista funkcija vremena, bez alokacija
}
```

Animacije se ne pišu ručno po kadru nego se **prijavljuju** klasi `Anim` pošto
junak zauzme mirnu pozu; svaki pokret pamti zatečenu vrednost kao osnovu i
osciluje oko nje:

```js
const anim = new Anim();
anim.breathe(grudi, 0.014, 1.15);
anim.scan(glava, 0.16, 9);
anim.wave(paneliOgrtaca, 'x', 0.05, 0.8, 0.4);
anim.blink(lice.lidL, 4.2, 0.3);
anim.pulse(kristal.material, 1.4, 0.5, 1.9);
// ...
return { /* ... */ update: (t) => anim.tick(t) };
```

Zato je `update(t)` čist u `t`: isto vreme uvek daje istu pozu, pa scena može
da se premota, pauzira ili snimi u bilo kom trenutku.
