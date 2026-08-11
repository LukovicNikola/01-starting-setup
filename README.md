# ⚔ Krug Heroja

Prosta 3D scena (Three.js) sa **deset heroja srednjovekovne fantazije** — svaki
ručno modelovan iz stotina primitiva, svaki sa svojom idle animacijom.

Scena: kameni plato u sumrak, logorska vatra u sredini, baklje, zvezde, mesec,
planine u daljini. Heroji stoje na postamentima u krugu.

## Pokretanje

Potreban je bilo kakav lokalni server (zbog ES modula). Iz foldera projekta:

```bash
python3 -m http.server 8080
# ili
npm start
```

pa otvori [http://localhost:8080](http://localhost:8080).

Nema build koraka i nema zavisnosti za instalaciju — Three.js je uključen u
`vendor/`.

## Kontrole

- 🖱 **prevlačenje** — rotacija kamere
- **točkić** — zum
- **klik na heroja** — kamera se fokusira i otvara se opis
- **klik na prazno / ✕** — povratak na širi pogled

## Heroji

| Heroj | Klasa |
|---|---|
| Ser Aldrik | Vitez Zore |
| Maldrik Sivi | Arhimag Kule Zvezda |
| Silvara Listopad | Vilenjačka izvidnica |
| Borin Kamenobrad | Ratnik Gvozdene Dvorane |
| Sestra Lumina | Sveštenica Večne Svetlosti |
| Kragmar Krvavi Vuk | Varvarin severnih pustara |
| Vesper Senka | Majstorica noža |
| Dama Serafina | Paladinka Reda Sunca |
| Eldan Hrastov Sin | Čuvar Starog Gaja |
| Mordekai Bledi | Gospodar Tihe Legije |

## Struktura

```
index.html          – ulazna stranica, UI, importmap
main.js             – scena, osvetljenje, okolina, interakcija
heroes/common.js    – zajedničke pomoćne funkcije i paleta boja
heroes/<ime>.js     – po jedan fajl za svakog heroja
vendor/             – three.module.js + OrbitControls.js
```
