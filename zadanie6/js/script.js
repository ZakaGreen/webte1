const SOURCE_URL = "source/kino-hviezda.html";

// Fetch the cinema HTML as text and report unsuccessful HTTP responses.
async function loadCinemaHtml() {
  const response = await fetch(SOURCE_URL); // Requires a local HTTP server, not file://.
  // fetch rejects network failures, but HTTP 404/500 must be checked explicitly.
  if (!response.ok) {
    throw new Error(`Stránku kina sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  // The response body is HTML, so read it as text instead of JSON.
  return response.text();
}

// Load the same HTML with jQuery for comparison with the Fetch API version.
function loadCinemaHtmlJquery() {
  // The returned request supports await; HTTP errors reject with a request object.
  return $.ajax({ url: SOURCE_URL, dataType: "text" });
}

// Parse HTML in a separate document without inserting foreign styles or handlers into our page.
function parseHtml(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

// Replace runs of spaces, tabs and line breaks (\s+) with one space, then trim both ends.
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Read a descendant's cleaned text, or an empty string when the element is missing.
function textOf(element, selector) {
  // ?. stops at a missing element; ?? replaces the resulting undefined with an empty string.
  return cleanText(element.querySelector(selector)?.textContent ?? "");
}

// Convert a price such as "7,50 EUR" to a number; a missing price is null, not zero.
function parsePrice(text) {
  if (!text) {
    return null;
  }
  // parseFloat accepts a decimal dot and ignores trailing currency text.
  const price = parseFloat(text.replace(",", "."));
  return Number.isNaN(price) ? null : price;
}

// Convert the cinema's day sections into day objects with arrays of valid screenings.
function parseCinema(doc) {
  const days = [];
  for (const section of doc.querySelectorAll(".den")) {
    const heading = section.querySelector("h2");
    const screenings = [];
    for (const film of section.querySelectorAll(".film")) {
      const time = textOf(film, ".cas");
      const title = textOf(film, ".nazov");
      if (!time || !title) {
        // Skip only this incomplete screening; the remaining program stays usable.
        console.warn("Skipping incomplete screening:", film);
        continue;
      }
      screenings.push({ time, title, hall: textOf(film, ".sala"), price: parsePrice(textOf(film, ".cena")) });
    }
    days.push({
      // firstChild contains the day name without the date inside <small>.
      day: cleanText(heading.firstChild.textContent),
      date: textOf(section, "h2 small"),
      screenings,
    });
  }
  return days;
}

// Produce the same day objects as parseCinema, using jQuery selectors for comparison.
function parseCinemaJquery(doc) {
  const days = [];
  // Read each day from the callback parameter; arrow functions do not get jQuery's this.
  $(doc).find(".den").each((index, section) => {
    const $section = $(section);
    const screenings = [];
    // Convert each film element into a screening, skipping missing required values.
    $section.find(".film").each((index, film) => {
      const $film = $(film);
      const time = cleanText($film.find(".cas").text());
      const title = cleanText($film.find(".nazov").text());
      if (!time || !title) {
        console.warn("Skipping incomplete screening:", film);
        return; // Leave this callback only; jQuery continues with the next film.
      }
      screenings.push({
        time,
        title,
        hall: cleanText($film.find(".sala").text()),
        price: parsePrice($film.find(".cena").text()),
      });
    });
    days.push({
      // contents() includes text nodes; first() selects the day name before <small>.
      day: cleanText($section.find("h2").contents().first().text()),
      date: cleanText($section.find("h2 small").text()),
      screenings,
    });
  });
  return days;
}

const DAY_NAMES = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];
const STORAGE_KEY = "cinema-program";

const statusText = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const clearButton = document.getElementById("clear");
const tabs = document.getElementById("day-tabs");
const schedule = document.getElementById("schedule");

let program = [];
let selectedDay = 0;

// Rebuild the day buttons and mark the selected day for styling and screen readers.
function renderTabs() {
  tabs.replaceChildren();
  // Create one tab for each day in the loaded program.
  program.forEach((day, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = day.day;
    button.setAttribute("aria-pressed", index === selectedDay);
    // Switch the displayed day using data already in memory, without another request.
    button.addEventListener("click", () => {
      selectedDay = index;
      render();
    });
    tabs.append(button);
  });
}

// Display the selected day's screenings, or a message when that day has no program.
function renderDay() {
  schedule.replaceChildren();
  const day = program[selectedDay];
  if (!day) {
    return;
  }

  const heading = document.createElement("h2");
  heading.textContent = `${day.day} ${day.date}`;
  schedule.append(heading);

  if (day.screenings.length === 0) {
    const empty = document.createElement("p");
    empty.textContent = "Na tento deň nie je v programe žiadne predstavenie.";
    schedule.append(empty);
    return;
  }

  const list = document.createElement("ul");
  for (const screening of day.screenings) {
    const item = document.createElement("li");
    const price = screening.price === null ? "cena neuvedená" : `${screening.price.toFixed(2)} €`;
    // textContent displays source values as text, so they cannot become active HTML.
    item.textContent = `${screening.time} · ${screening.title} · ${screening.hall} · ${price}`;
    list.append(item);
  }
  schedule.append(list);
}

// Update the day tabs and the selected day's content together.
function render() {
  renderTabs();
  renderDay();
}

// Find today's day by name, falling back to the first available day when it is absent.
function getTodayIndex() {
  // getDay() starts with Sunday (0); adding 6 modulo 7 makes Monday index 0.
  const todayName = DAY_NAMES[(new Date().getDay() + 6) % 7];
  // Match by name instead of assuming the cinema lists every day in weekday order.
  const index = program.findIndex((day) => day.day === todayName);
  return index === -1 ? 0 : index;
}

// Store the parsed program and its save time as JSON, because localStorage accepts strings.
function saveProgram(days) {
  const data = { savedAt: new Date().toISOString(), days };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Return today's saved program, or null when the cache is missing, expired or unreadable.
function loadSavedProgram() {
  try {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!data || !Array.isArray(data.days) || data.days.length === 0) {
      return null;
    }
    // JSON restores the timestamp as a string; convert it back to a Date first.
    const savedAt = new Date(data.savedAt);
    // Compare local calendar dates, avoiding UTC date changes around midnight.
    if (savedAt.toDateString() !== new Date().toDateString()) {
      return null;
    }
    return { savedAt, days: data.days };
  } catch (error) {
    // Invalid stored JSON should trigger a fresh download instead of stopping the page.
    return null;
  }
}

// Use today's cache or fetch fresh data, then render the program and handle loading errors.
async function showProgram(forceRefresh = false) {
  refreshButton.disabled = true;
  clearButton.disabled = true;
  try {
    const saved = forceRefresh ? null : loadSavedProgram();
    if (saved) {
      program = saved.days;
      statusText.textContent = `Uložený program z ${saved.savedAt.toLocaleString("sk-SK")}.`;
    } else {
      statusText.textContent = "Načítavam program…";
      // The exercise also provides loadCinemaHtmlJquery and parseCinemaJquery for comparison.
      const html = await loadCinemaHtml();
      program = parseCinema(parseHtml(html));
      if (program.length === 0) {
        throw new Error("Na stránke kina sa nenašiel program. Možno sa zmenila jej štruktúra.");
      }
      saveProgram(program);
      statusText.textContent = `Program aktualizovaný ${new Date().toLocaleString("sk-SK")}.`;
    }
    selectedDay = getTodayIndex();
    render();
  } catch (error) {
    // jQuery rejects with a request object that has status but no Error.message.
    statusText.textContent = error.message ?? `Stránku kina sa nepodarilo načítať (HTTP ${error.status}).`;
  } finally {
    // Always restore the controls, even after a failed request or a parsing error.
    refreshButton.disabled = false;
    clearButton.disabled = false;
  }
}

// Bypass the cache when the user explicitly requests an update.
refreshButton.addEventListener("click", () => showProgram(true));

// Remove only this exercise's saved program; the currently displayed data stays visible.
clearButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  statusText.textContent = "Uložené dáta sú vymazané.";
});

showProgram();