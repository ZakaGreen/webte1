# Web Technologies Coursework

University assignments for **WEBTE1 at FEI STU**, 2026/2027. These projects document my practice with HTML, CSS, JavaScript, browser APIs and processing structured data from HTML.

## Selected assignments

| Project | Main features | Details |
| --- | --- | --- |
| **Na obed — restaurant menus** | Fetch API, DOMParser, restaurant-specific parsers, localStorage caching and day/restaurant selection. | [Project README](Z2_Liubotin/README.md) · [Source](Z2_Liubotin) |
| **Personal website** | A multi-page site with a CV, print styles, schedule, interactive workspace image and Leaflet map. | [Project README](Z1_Liubotin/README.md) · [Source](Z1_Liubotin) |

Smaller practice exercises are stored in the `zadanie*` directories. Website text remains in Slovak, as required by the course.

## Run locally

From the repository root:

```bash
python3 -m http.server 8000
```

Then open:

- Restaurant menus: <http://localhost:8000/Z2_Liubotin/>
- Personal website: <http://localhost:8000/Z1_Liubotin/>

Use a local HTTP server rather than opening HTML files directly: the menu viewer loads its sources with Fetch API.

## Data and dependencies

The menu viewer reads **saved HTML snapshots** included in its `source/` directory. Its refresh button reprocesses those files; it does not fetch the latest restaurant menus. It can run offline once the local server is started. The personal website's map needs an internet connection.

Libraries and their licenses are documented in each project's README. Validation reports are stored in the project `docs/` directories; they describe the checks performed for those assignments.

## Context

These are educational projects based on course requirements and practice materials. Original assignment files, attribution and submission archives are preserved.
