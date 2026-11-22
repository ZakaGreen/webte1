# WEBTE1 – Zápočet, skupina A

10 bodov · prístup na internet nie je povolený, okrem povolenej dokumentácie a knižníc na `webte.iolab.sk`

## Zadanie

Súbor `source/u-lipy.html` je webová stránka Reštaurácie U Lipy s denným menu. Vytvorte vlastnú stránku (`index.html`), ktorá túto stránku načíta, vyberie z nej všetky jedlá a zobrazí ich vo vlastnom rozložení s možnosťou filtrovania podľa kategórie.

Zdrojová stránka predstavuje cudzí web. Nemeňte ju, riešenie musí fungovať s ňou presne tak, ako je.

## Projekt, spustenie a nasadenie

### Štruktúra projektu

```
váš-priečinok/
├── ZADANIE.md          toto zadanie
├── index.html          kostra stránky, doplníte ju
├── css/
│   └── styles.css      vaše štýly (zatiaľ prázdny)
├── js/
│   └── script.js       váš JavaScript (zatiaľ prázdny)
├── source/
│   └── u-lipy.html     zdrojová stránka – cudzí web, nemeňte ju
├── spusti-server.bat   live server, spustíte dvojklikom
└── live-server.ps1
```

Všetky súbory projektu môžete ľubovoľne upravovať a pridávať nové (ďalšie CSS, JS, obrázky…). Výnimkou je priečinok `source/`, jeho obsah nemeňte.

### Live server

Stránku treba otvárať cez lokálny webový server. Pri otvorení súboru dvojklikom (`file://…`) prehliadač požiadavky `fetch` zablokuje a stavové kódy HTTP (napr. 404) by nefungovali. Na to slúži priložený live server (`spusti-server.bat` a `live-server.ps1`), náhrada za Live Server vo VS Code. Nič sa neinštaluje a po uložení súboru sa stránka v prehliadači sama obnoví.

Spustíte ho dvojklikom na `spusti-server.bat`, otvorí sa `http://localhost:5500/`. Server zastavíte zatvorením okna. Ak sa zobrazí okno „Systém Windows ochránil počítač“, kliknite na *Ďalšie informácie* → *Spustiť aj tak*.

### Nasadenie

Hodnotí sa iba riešenie nasadené na vašom webovom serveri. Nasaďte `index.html`, `css/`, `js/` a `source/` (súbory live servera nie) a odovzdajte funkčnú URL adresu stránky spolu so zdrojovými kódmi. Nasadená stránka musí fungovať rovnako ako lokálna verzia vrátane načítania zdroja a tlačidla `#simulate-404`.

## Pravidlá a knižnice

### Pravidlá

- Povolené sú HTML, CSS, JavaScript a knižnice z časti *Knižnice* nižšie. Iné knižnice nie sú povolené.
- Údaje zo zdroja sa na stránku nesmú dostať ako HTML (`innerHTML`, `insertAdjacentHTML`, jQuery `.html()` ani `.append()` s reťazcom obsahujúcim HTML).
- HTML zdroja sa nesmie spracovávať regulárnymi výrazmi ani hľadaním v reťazci.
- Udalosti sa registrujú v JavaScripte, nie atribútmi v HTML (`onclick` a pod.).
- Kostru `index.html` môžete rozšíriť, prvky s `id` `status`, `simulate-404`, `filters` a `menu` však musia zostať.

### Knižnice

Všetky povolené knižnice sú na `https://webte.iolab.sk/lib/` (zoznam súborov je viditeľný aj v prehliadači).

**jQuery 4.0.0**

```html
<script src="https://webte.iolab.sk/lib/jquery-4.0.0.min.js"></script>
```

**Bootstrap 5.3.8** – iba CSS, do `<head>`:

```html
<link rel="stylesheet" href="https://webte.iolab.sk/lib/bootstrap-5.3.8.min.css">
```

**Tailwind CSS 4.3.3** – verzia pre prehliadač, netreba nič buildovať, stačí vložiť skript do `<head>`:

```html
<script src="https://webte.iolab.sk/lib/tailwind-4.3.3.js"></script>
```

Vlastné nastavenia (farby a pod.) sa píšu do `<style type="text/tailwindcss">`:

```html
<style type="text/tailwindcss">
  @theme {
    --color-fei: #0b5394;
  }
</style>
```

Potom sa dá použiť napr. `class="bg-fei text-white"`.

**Poznámky**

- Bootstrap a Tailwind **nepoužívajte na tej istej stránke**, ich štýly sa bijú.
- Vždy používajte `https://`, inak prehliadač skripty zablokuje.

## Požiadavky

### 1. Načítanie zdroja

Stránka po otvorení automaticky načíta `source/u-lipy.html` asynchrónnou HTTP požiadavkou. Odpoveď so stavom mimo rozsahu 200–299 (napr. 404 alebo 500) je chyba a nespracúva sa ako menu.

### 2. Spracovanie údajov

Z načítaného HTML sa vytvorí pole objektov, jeden objekt pre každé jedlo v menu, v poradí ako na zdrojovej stránke:

```js
{ category: "Polievka", name: "Kurací vývar s rezancami", price: 2.5 }
```

- `category` a `name` sú reťazce bez úvodných a koncových bielych znakov, bez zalomení riadkov a bez viacnásobných medzier.
- `price` je číslo v eurách. Ak jedlo nemá uvedenú cenu, `price` je `null`.
- V poli nesmie chýbať žiadne jedlo a nesmú v ňom byť iné údaje zo stránky.
- Výsledné pole sa vypíše do konzoly prehliadača (`console.log`).

### 3. Zobrazenie

Každé jedlo sa v `#menu` zobrazí ako samostatná karta s názvom, kategóriou a cenou. Cena má dve desatinné miesta a znak eura (`2.50 €`), chýbajúca cena sa zobrazí ako „cena neuvedená“. Karty sú usporiadané v dvoch stĺpcoch. Pri šírke okna do 600 px (pri použití Bootstrapu alebo Tailwindu pod ich hranicou `md`) sú v jednom stĺpci.

### 4. Filter

V `#filters` sa pre každú kategóriu, ktorá sa v dátach vyskytuje, vytvorí jedno zaškrtávacie políčko s jej názvom, v poradí prvého výskytu. Kategórie nesmú byť v kóde napísané natvrdo. Na začiatku sú všetky políčka zaškrtnuté. Odškrtnutie skryje jedlá danej kategórie, opätovné zaškrtnutie ich zobrazí v pôvodnom poradí. Políčka sa dajú ľubovoľne kombinovať. Filter pracuje s už načítanými údajmi, zdroj sa znova nenačítava.

### 5. Stav a chyby

Po úspešnom načítaní je v `#status` počet načítaných jedál (napr. „Načítaných N jedál.“). Tlačidlo `#simulate-404` pošle požiadavku na neexistujúci súbor `source/neexistuje.html`. Chyba sa zobrazí v `#status` ako zrozumiteľná správa so stavovým kódom (napr. „Menu sa nepodarilo načítať (HTTP 404).“), nie iba v konzole. V konzole pri tom nesmie zostať nezachytená výnimka. Zobrazené menu a filter po chybe naďalej fungujú.

### 6. Dizajn

- Obsah stránky má obmedzenú šírku (max. 1200 px) a je vycentrovaný.
- Základná veľkosť textu je aspoň 16 px.
- Farby sú definované na jednom mieste, použité sú najviac 3 farby okrem odtieňov sivej.
- Karty sú vizuálne oddelené (okraj, tieň alebo pozadie) a majú jednotné vnútorné odsadenie aj medzery medzi sebou.
- V karte je zrejmá hierarchia: názov je výraznejší ako kategória, cena je zarovnaná alebo zvýraznená. „Cena neuvedená“ je vizuálne odlíšená od ceny.
- Filter a tlačidlo `#simulate-404` sú upravené (nie predvolený vzhľad prehliadača) a pri prechode myšou reagujú. Chybová správa v `#status` je vizuálne odlíšená od bežnej.
- Pri šírke okna 360 px sa nič neprekrýva a stránka sa nedá posúvať do strany.
