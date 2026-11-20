# Overenie – 18. 11. 2026

## Vlastný kalendár a upravené rozhranie

Produkčný build bol overený v Google Chrome cez Playwright. Požiadavky API
boli zachytené a dostali testové odpovede; skutočné úlohy sa nemenili.

- mesačná mriežka od pondelka do nedele, týždenný a denný pohľad;
- predchádzajúce/nasledujúce obdobie a návrat na dnešný deň;
- viacdňová úloha v každom zasiahnutom dni, správny čas za jednotlivé dni;
- koniec presne o polnoci, nulové trvanie a prechod na zimný čas;
- podrobnosti po kliknutí na úlohu a vytvorenie cez dátum 09:00–10:00;
- vytvorenie, úprava, dokončenie, opätovné otvorenie a vymazanie;
- povinný názov, poradie dátumov, HTTP 500 so zachovaním formulára a opakovanie;
- prevod miestneho času na UTC, bezpečné zobrazenie textu s HTML značkami;
- filtre, vyhľadávanie, prepnutie zoradenia, prázdny zoznam a limit 50 úloh;
- odmietnutie a potvrdenie vymazania, potvrdený reset testových údajov;
- O projekte vpravo v hlavičke na desktope aj mobile;
- všetky tri pohľady pri šírke 375 px bez vodorovného pretečenia stránky;
- žiadne nezachytené JavaScriptové chyby.

Všetky kontroly prešli. Snímky desktopu a mobilu boli vizuálne skontrolované.

## Predchádzajúce kontroly – 17. 11. 2026

### Skutočný server

- GET zoznamu xliubotin: päť úvodných úloh, načítanie aj v prehliadači.
- Jedna dočasná testovacia úloha: POST, PUT, PATCH done, PATCH undone,
  GET detailu, DELETE. Všetky kontroly prešli.
- Po teste sa pôvodných päť úloh porovnalo s pôvodným stavom: nezmenené.
- Reset skutočného zoznamu nebol vykonaný.

### Chromium a Google Chrome

Automatizované scenáre cez Playwright. Prvé načítanie využilo skutočný
server; ďalšie operácie využili zachytené HTTP požiadavky a testové odpovede:

- vytvorenie, úprava, dokončenie a opätovné otvorenie;
- prázdny názov a koniec pred začiatkom: odoslanie zablokované;
- HTTP 500 pri ukladaní: zobrazená chyba, vyplnená forma zachovaná,
  následné úspešné opakovanie;
- text s HTML značkami zostal textom;
- vyhľadávanie bez výsledkov;
- kalendár: mesiac, týždeň, deň, otvorenie detailu cez GET;
- klik na deň: predvyplnenie dátumu 09:00–10:00;
- odmietnutie a potvrdenie vymazania, odpoveď DELETE 204;
- potvrdený reset cez POST a následný GET (simulovaný server);
- prázdny zoznam;
- mobil 375 × 812: po prerátaní kalendára bez pretečenia dokumentu;
- žiadne nezachytené JavaScriptové chyby.

Snímky desktopu a mobilu boli vizuálne skontrolované.
Firefox 159: samostatná kontrola načítania a renderovania v headless režime;
celý interaktívny scenár v tomto prehliadači nebol automatizovaný.

## Zostavenie

Produkčný build cez Vite úspešný. Zostavenie používa relatívne cesty.
Zverejnenie na školskom serveri zatiaľ nebolo overené.

Doplnková kontrola produkčného buildu pod /dist/ v Google Chrome prešla:
načítanie zo skutočného API, sekcia O projekte, blokovanie vytvárania pri
50 úlohách, filtre dokončené/nedokončené, prepnutie zoradenia a všetky
tri kalendárové pohľady pri šírke 375 px bez pretečenia dokumentu.

## Tmavá téma – 20. 11. 2026

Produkčný build prešiel. V Google Chrome boli vizuálne overené zoznam,
formulár, chyba povinného názvu a mesačný kalendár s novými farbami.
Pri kontrole sa serverové úlohy nemenili.
