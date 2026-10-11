# Moja online vizitka — WEBTE1, zadanie 1

Autor: Ilia Liubotin, FEI STU, Aplikovaná informatika (API), 3. ročník, 2026/2027.

Web na školskom serveri: https://webte1.fei.stuba.sk/~xliubotin/Z1_Liubotin/

Na webe predstavujem svoje štúdium, skúsenosti zo stáže Erasmus+ a záujmy: programovanie a AI, čínsky čaj a investovanie. Obsahuje profil, životopis s tlačovým štýlom, interaktívny obrázok môjho pracovného miesta, rozvrh a mapu domova a školy.

## Zdroje

- Fotografia, portréty a ilustrácie v `img/`: moje vlastné podklady dodané pre tento projekt; osobné údaje vychádzajú z môjho CV a certifikátu Erasmus+.
- Rozvrh: môj rozvrh v AIS a harmonogram semestra FEI STU.
- Mapa: príklad z cvičenia `zadanie3`, knižnica [Leaflet 1.9.4](https://leafletjs.com/) a mapové podklady [OpenStreetMap](https://www.openstreetmap.org/copyright). Domov predstavuje ŠD Mladosť, školu FEI STU.
- Font: [Noto Serif](https://github.com/notofonts/noto-fonts), licencia SIL Open Font License 1.1; lokálne súbory WOFF2 a licencia sú v `fonts/`.
- Monogram IL a favicon sú vytvorené pre tento web.

## Použitie AI

OpenAI Codex som použil na vysvetlenie kódu, pomoc s implementáciou mojich nápadov a úpravy a opravy častí HTML, CSS a JavaScriptu.

## Spustenie a validácia

Web nevyžaduje inštaláciu ani zostavenie. Dá sa spustiť na školskom serveri alebo lokálne príkazom `python3 -m http.server 8000` a otvorením `http://localhost:8000/`. Mapa potrebuje internet; pridané body sa ukladajú do localStorage daného prehliadača.

Výstupy validátorov W3C sú v `docs/validator-html.txt` a `docs/validator-css.txt`.
