[English](README.md) · [Slovenčina](README.sk.md) · [Русский](README.ru.md)

# Zadania z webových technológií

Univerzitné zadania z predmetu **WEBTE1 na FEI STU**, 2026/2027. Projekty zachytávajú moju prax s HTML, CSS, JavaScriptom, rozhraniami prehliadača a spracovaním štruktúrovaných údajov z HTML.

## Vybrané zadania

| Projekt | Hlavné funkcie | Podrobnosti |
| --- | --- | --- |
| **Na obed — jedálne lístky reštaurácií** | Fetch API, DOMParser, parsery pre jednotlivé reštaurácie, ukladanie do localStorage a výber dňa či reštaurácie. | [README projektu](Z2_Liubotin/README.md) · [Zdrojové súbory](Z2_Liubotin) |
| **Osobná webová stránka** | Viacstránkový web so životopisom, štýlmi pre tlač, rozvrhom, interaktívnym obrázkom pracoviska a mapou Leaflet. | [README projektu](Z1_Liubotin/README.md) · [Zdrojové súbory](Z1_Liubotin) |

Menšie cvičenia sú uložené v adresároch `zadanie*`. Texty webových stránok zostávajú v slovenčine podľa požiadaviek predmetu.

## Lokálne spustenie

Z koreňového adresára repozitára:

```bash
python3 -m http.server 8000
```

Potom otvorte:

- Jedálne lístky: <http://localhost:8000/Z2_Liubotin/>
- Osobnú stránku: <http://localhost:8000/Z1_Liubotin/>

Použite lokálny HTTP server namiesto priameho otvárania HTML súborov: prehliadač jedálnych lístkov načítava zdroje cez Fetch API.

## Dáta a závislosti

Prehliadač jedálnych lístkov číta **uložené HTML snímky** z priloženého adresára `source/`. Tlačidlo obnovenia opäť spracuje tieto súbory; nesťahuje aktuálne menu z reštaurácií. Po spustení lokálneho servera môže fungovať offline. Mapa na osobnej stránke potrebuje internetové pripojenie.

Knižnice a ich licencie sú zdokumentované v README jednotlivých projektov. Validačné správy v adresároch `docs/` opisujú kontroly vykonané pre príslušné zadania.

## Kontext

Ide o vzdelávacie projekty podľa požiadaviek predmetu a cvičebných materiálov. Pôvodné súbory zadaní, údaje o autorstve a odovzdané archívy sú zachované.
