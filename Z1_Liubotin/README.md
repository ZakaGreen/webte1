# Moja online vizitka

Ilia Liubotin — WEBTE1, FEI STU, 2026/2027.

Web obsahuje profil, životopis, interaktívny obrázok môjho miesta na učenie pri okne, rozvrh s osobným režimom a mapu domova a školy. Predstavujem svoje štúdium, skúsenosti zo stáže Erasmus+ a záujmy: programovanie a AI, čajovú kultúru a investovanie. Životopis má aj štýl pre tlač na A4.

## Spustenie

Web používa iba HTML, CSS a JavaScript, nevyžaduje inštaláciu ani zostavenie. Pre celú stránku vrátane ukladania bodov mapy použite školský server alebo lokálny HTTP server: v tomto priečinku spustite `python3 -m http.server 8000` a otvorte `http://localhost:8000/`. Mapa potrebuje internet. Body sa ukladajú iba v danom prehliadači a na danej adrese webu.

## Zdroje

- Päť ilustrácií vrátane kresleného portrétu poskytol Ilia Liubotin ako podklady pre tento web. Sú uložené v priečinku `img/`.
- Životopis a údaje o stáži vychádzajú z poskytnutého CV, certifikátu Erasmus+ a osobných informácií autora. Súkromné PDF dokumenty nie sú súčasťou webu.
- Písmo Noto Serif: Google, licencia SIL Open Font License 1.1. Lokálne súbory WOFF2 vznikli konverziou nainštalovaných TTF súborov; licenčné oznámenie je v `fonts/LICENSE.txt`.
- Monogram IL a favicon boli vytvorené pre tento web.
- Rozvrh vychádza z osobného rozvrhu v AIS a poskytnutého kalendára semestra. Rozdelenie predmetov, osobný režim a dátumy potvrdil autor.
- Mapa vychádza z príkladu `zadanie3/`: [Leaflet 1.9.4](https://leafletjs.com/) a podklady [OpenStreetMap](https://www.openstreetmap.org/copyright). Súradnice FEI STU sú z príkladu; bod domova je [ŠD Mladosť](https://ubytovanieastravovanie.stuba.sk/sd-mladost). Vzdialenosť počíta vlastný Haversinov vzorec.

Pri tvorbe HTML, CSS, JavaScriptu, textov a vysvetlení som použil OpenAI Codex; obsah a kód kontrolujem a učím sa vysvetliť.

Staršie výsledky W3C validácie prvých dvoch stránok a CSS sú v `docs/validator-html.txt` a `docs/validator-css.txt`. Výklad kódu v ruštine je v `docs/code-guide.md`, `docs/workspace-guide.md`, `docs/schedule-guide.md` a `docs/map-guide.md`. Lokálne kontroly nových stránok sú v `docs/workspace-checks.txt`, `docs/schedule-checks.txt` a `docs/map-checks.txt`; externú validáciu treba aktualizovať.

Adresa na školskom serveri: [https://webte1.fei.stuba.sk/~xliubotin/Z1_Liubotin/](https://webte1.fei.stuba.sk/~xliubotin/Z1_Liubotin/). Nové stránky rozvrhu a mapy a zmenené súbory treba nahrať do `public_html/Z1_Liubotin/`. Pred odovzdaním doplním študijný krúžok.
