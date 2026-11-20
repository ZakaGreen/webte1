# Môj TODO List

WEBTE1, zadanie 3 · Ilia Liubotin (xliubotin) · 2026/2027.

Aplikácia spravuje osobné úlohy cez školské REST API. Obsahuje zoznam,
vyhľadávanie, filtre, zoradenie, formulár a mesačný/týždenný/denný kalendár.
Úlohy sa ukladajú na serveri, nie do localStorage.

## Spustenie zdrojového projektu

Potrebujete Node.js 22.12+ (alebo 24 LTS) a npm.
V tomto priečinku spustite:

```sh
npm install
npm run dev
```

Otvorte adresu vypísanú vo vašom termináli. Predvolený identifikátor je
`xliubotin`; môžete zadať iný identifikátor povolený serverom.
Internetové pripojenie je potrebné pre API.

Súbor `pnpm-lock.yaml` zaznamenáva verzie použité pri overení cez pnpm.
Pri inštalácii cez novšie pnpm môže byť potrebné povoliť zostavenie esbuild
príkazom `pnpm approve-builds`. Bežný postup vyššie používa npm.

## Zostavenie a školský server

```sh
npm run build
npm run preview
```

Na školský server nahrajte **obsah priečinka dist/**. Relatívne cesty
umožňujú umiestnenie aj v podpriečinku. Na serveri netreba Node.js.
Neotvárajte aplikáciu cez `file://`, použite HTTP/HTTPS server.

Pripravený odovzdávací ZIP má zostavený `index.html`, `assets/`, favicon
a README v koreni. Zdrojový projekt je v jeho priečinku `source/`;
na vývoj po rozbalení preto najprv použite `cd source`.
Archív `Z3_Liubotin.zip` je v nadradenom priečinku vedľa priečinka projektu.
Obsahuje jeden stručný README, zostavenú stránku a zdrojový projekt.
Pomocné poznámky z `docs/`, lokálny README, `.gitignore` a `node_modules/`
sa do archívu nepridávajú.
Web: https://webte1.fei.stuba.sk/~xliubotin/Z3_Liubotin/

## Súbory a princíp

- `src/main.js`: pripojenie Vue k HTML.
- `src/App.vue`: spoločný zoznam úloh, volanie API, navigácia a podrobnosti.
- `src/api.js`: GET, POST, PUT, DELETE, PATCH a spracovanie HTTP chýb.
- `src/dates.js`: miestne zobrazenie dátumov a hodnota pre datetime-local.
- `src/components/TaskList.vue`: filtrovaný a zoradený zoznam.
- `src/components/TaskForm.vue`: spoločná forma pre vytvorenie a úpravu.
- `src/components/TaskCalendar.vue`: kalendár nad tým istým zoznamom.
- `src/style.css`: vlastné responzívne štýly.
- `docs/code-guide.md`: vysvetlenie kódu pre obhajobu (po rusky).
- `docs/browser-checks.md`: rozsah vykonaných kontrol.

Rodičovský komponent vlastní dáta. Deti dostávajú `props` a oznamujú
udalosti cez `emit`. Po úspešnej zmene sa zoznam znovu načíta z API.
Formulár pracuje s kópiou, takže zrušenie úprav nemení uloženú úlohu.
`computed` odvodzuje filtrovaný zoznam a dni zobrazeného obdobia.
Vlastný kalendár ukazuje každú úlohu v dňoch, do ktorých jej interval zasahuje.

Dátumy z formulára sa prevádzajú na UTC cez `toISOString()`. Zobrazenie
používa miestny čas prehliadača. API texty sa zobrazujú interpoláciou Vue.
Pri výbere celého dňa sa predvyplní 09:00–10:00; používateľ môže čas zmeniť.

API povoľuje iba pridelené identifikátory. Dokumentácia upozorňuje na
reset pri prekročení 50 úloh. Aplikácia preto pri 50 načítaných úlohách
zablokuje vytváranie. Súbežné zmeny z iného klienta sa načítajú tlačidlom
Obnoviť zoznam; nejde o spoluprácu v reálnom čase.

## Technológie a zdroje

- Vue 3 (MIT): https://vuejs.org/
- Vite (MIT): https://vite.dev/
- Kalendár: vlastný JavaScript a Vue, bez ďalšej knižnice.
- Fetch API, HTML, CSS; vlastný SVG favicon, systémové písmo.
- API: https://wt1zadanie.iolab.sk/docs
- Zadanie: `materials/zadanie3.pdf` v nadradenom repozitári.
- Prednáška 10 a dodané Vue príklady: komponenty, ref, props/emits, computed.
- Prednášky 5–8: objekty, DOM, asynchrónnosť, Fetch a JSON.
- Prednášky 2–3: CSS, prístupnosť a responzívny layout.

## Použitie AI

Pri tvorbe projektu boli použité nástroje umelej inteligencie.

## Rýchle otvorenie už zostavenej verzie

Ak máte priečinok `dist/` a Python 3, môžete bez Node.js spustiť:

```sh
python3 -m http.server 8000 --directory dist
```

Potom otvorte http://localhost:8000/. Pri rozbalenom odovzdávacom ZIP
spustite server priamo v jeho koreni bez `--directory dist`.
