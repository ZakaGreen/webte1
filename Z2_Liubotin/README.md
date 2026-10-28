# Na obed — WEBTE1, zadanie 2

Autor: Ilia Liubotin, FEI STU, Aplikovaná informatika, 2026/2027.

Pracovná verzia obsahuje Eat & Meet. Ďalšie dve reštaurácie a odovzdanie celého zadania ešte nie sú dokončené.

## Spustenie

V priečinku `Z2_Liubotin` spustite `python3 -m http.server 8000` a otvorte `http://localhost:8000/`.
Súbor neotvárajte cez `file://`, pretože načítanie HTML pomocou Fetch API potrebuje webový server.
HTML zdroj, knižnice aj písmo sú priložené lokálne, takže stránka nepotrebuje internet.

## Funkcie

- Výber pondelka až piatka alebo celého týždňa bez obnovenia stránky.
- Predvolený aktuálny pracovný deň; cez víkend pondelok.
- Výber jednej reštaurácie pomocou záložiek; ostatné menu sa nezobrazujú.
- Načítanie iba z lokálnych HTML kópií.
- Denná cache v localStorage, čas aktualizácie, ručné obnovenie a vymazanie údajov.
- Aktualizačné tlačidlá, výsledky načítania a časy aktualizácií sú nad samostatným blokom menu.
- Správy pri načítavaní, chýbajúcom menu, chybe siete alebo zmene HTML štruktúry.
- Obe ceny s označením a alergény podľa zdroja.

## Zdroj údajov a obmedzenia

Zdroj: https://eatandmeet.sk/tyzdenne-menu

`source/eat-and-meet.html` je úplná HTML kópia stiahnutá 27. 10. 2026.
Na stránku sa vkladá iba spracovaný text, nie cudzí HTML kód, obrázky či skripty.
Zdroj uvádza dni, dve ceny a pri niektorých jedlách alergény. V týždennom menu neuvádza dátumy ani gramáže;
parser preto nepridáva prázdne polia `date` a `weight`. Zobrazenie ich podporuje, ak ich iný zdroj poskytne.
Ceny preberáme v poradí bežná cena / cena s dotáciou; znížená cena má na stránke označenie „s ISIC“.

Podľa dodatočného upresnenia vyučujúcich stačí načítanie lokálnych kópií.
Živé načítanie ani proxy sa nepoužívajú. Odkaz na pôvodnú stránku zostáva pri názve reštaurácie.

Aktualizácia znova spracuje uložený HTML súbor. Nestiahne novšie menu reštaurácie.
Čas aktualizácie je čas načítania údajov, nie dátum platnosti menu. Zdrojový súbor treba pri zmene menu nahradiť.
Vymazanie odstráni len kľúče tohto zadania a nespustí automatické nové načítanie.

## Súbory a postup spracovania

- `index.html`: obsah stránky, navigácia a ovládacie prvky.
- `about.html`: iba zdroj, spracovanie údajov a knižnice požadované bodom 7 zadania.
- `css/styles.css`: olivová paleta, miestne písmo a úpravy pre mobil.
- `js/parsers.js`: `parseEatAndMeet` vyhľadá dni a jedlá v DOM a vráti pole objektov.
- `js/script.js`: Fetch API, cache, udalosti a vykreslenie pomocou jQuery.
- `source/`: uložený HTML zdroj, ktorý sa len číta a parsuje.
- `vendor/`: nezmenené externé knižnice; nejde o vlastný kód projektu.
- `fonts/`: miestny font a jeho licencia.
- `docs/`: výsledky overenia.

Postup: Fetch API → DOMParser → parser reštaurácie → pole dní a jedál → localStorage → zobrazenie.
Pri zmene dňa alebo reštaurácie sa iba znovu vykreslia už načítané údaje.
Záložky používajú HTML radio vstupy s rovnakým názvom, preto môže byť vybraný iba jeden podnik.
Funkcia `renderUpdates` zobrazuje výsledky načítania a `renderCards` zobrazuje vybrané menu.
Ďalšia reštaurácia potrebuje vlastnú funkciu parsera a položku v poli `SOURCES`.

Nadväznosť na materiály: HTML/CSS a fonty (prednášky 1–3), objekty a polia (5), DOM a udalosti (6),
asynchrónne funkcie a Promise (7), Fetch API a jQuery (8), localStorage (9), Bootstrap (11).
Organizácia parserov a načítania vychádza z príkladov `zadanie6` a `zadanie7`.

## Overenie

W3C overenie zdrojového aj vykresleného HTML a vlastného CSS skončilo bez chýb.
Výstupy sú v `docs/validator-html.txt` a `docs/validator-css.txt`.
Funkcie a responzívnosť boli overené v Chrome 155 a Firefox 157; podrobnosti
sú v `docs/browser-checks.txt`.

## Knižnice a licencie

- Bootstrap 5.3.8, CSS: https://getbootstrap.com/ — MIT, `vendor/bootstrap-LICENSE.txt`.
- jQuery 3.7.1: https://jquery.com/ — MIT, `vendor/jquery-LICENSE.txt`.
- Noto Serif, miestny WOFF2: https://github.com/notofonts/noto-fonts — SIL Open Font License 1.1,
  licencia v `fonts/LICENSE.txt`.
- Favicon je jednoduchá vlastná SVG ikona taniera.

## Použitie AI

OpenAI Codex som použil na vysvetlenie kódu, pomoc s implementáciou mojich nápadov
a úpravy a opravy častí HTML, CSS a JavaScriptu.
