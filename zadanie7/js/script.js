// These .example addresses are placeholders; the local HTML copies work without a proxy.
const PROXY_URL = "https://proxy.example/?url=";

const useLocalCheckbox = document.getElementById("use-local");

// localStorage stores strings; a missing preference defaults to local copies.
useLocalCheckbox.checked = localStorage.getItem("use-local") !== "false";
// Save the selected loading mode and reload all cinema programs.
useLocalCheckbox.addEventListener("change", () => {
  localStorage.setItem("use-local", useLocalCheckbox.checked);
  loadAll();
});

// Choose the local HTML file or the configured proxy address for one cinema.
function buildUrl(source) {
  if (useLocalCheckbox.checked) {
    return source.localUrl;
  }
  // A real proxy also needs encodeURIComponent(source.website) to preserve its query parameters.
  return PROXY_URL + source.website;
}

const SOURCES = [
  {
    id: "hviezda",
    name: "Kino Hviezda",
    website: "https://www.kino-hviezda.example/program?tyzden=45&jazyk=sk",
    localUrl: "source/kino-hviezda.html",
    parse: parseHviezda,
  },
  {
    id: "mier",
    name: "Kino Mier",
    website: "https://kinomier.example/rozpis?mesto=ba&tyzden=45",
    localUrl: "source/kino-mier.html",
    parse: parseMier,
  },
  {
    id: "lumiere",
    name: "Kino Lumière",
    website: "https://lumiere.example/program/?od=2026-11-02&do=2026-11-08",
    localUrl: "source/kino-lumiere.html",
    parse: parseLumiere,
  },
  {
  id: "odeon",
  name: "Kino Odeon",
  website: "https://odeon.example/program",
  localUrl: "source/kino-odeon.html",
  // Odeon uses the same HTML structure as Hviezda, so it shares its parser.
  parse: parseHviezda,
},
];

// Simulated server delay (ms), so that we can see slow and fast sources. Not part of a real solution.
const DELAYS = { hviezda: 1500, mier: 500, lumiere: 1000 };

// Return a Promise that completes after the requested delay without blocking the page.
function wait(ms) {
  // Schedule resolve as the timer callback to complete this Promise.
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Fetch one cinema page, check its HTTP status and parse it with its assigned parser.
async function loadSource(source) {
  // ?? uses zero when this cinema has no simulated delay configured.
  await wait(DELAYS[source.id] ?? 0);
  const response = await fetch(buildUrl(source));
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return source.parse(parseHtml(await response.text()));
}

const statusText = document.getElementById("status");
const refreshButton = document.getElementById("refresh");
const cards = document.getElementById("cards");

const results = {};
// A Set stores each hidden cinema ID once and allows quick membership checks.
const hiddenSources = new Set();

// Build today's screening list, or a message when the cinema has no program today.
function createTodayList(days) {
  // Convert Sunday-based getDay() into the Monday-based DAY_NAMES index.
  const today = DAY_NAMES[(new Date().getDay() + 6) % 7];
  // Find the day by name because source pages may omit days or list them differently.
  const day = days.find((item) => item.day === today);
  if (!day || day.screenings.length === 0) {
    const empty = document.createElement("p");
    empty.className = "mb-0 text-body-secondary";
    empty.textContent = `${today}: dnes sa nehrá.`;
    return empty;
  }
  const list = document.createElement("ul");
  list.className = "list-unstyled mb-0";
  for (const screening of day.screenings) {
    const item = document.createElement("li");
    const price = screening.price === null ? "cena neuvedená" : `${screening.price.toFixed(2)} €`;
    item.textContent = `${screening.time} ${screening.title} (${price})`;
    list.append(item);
  }
  return list;
}

// Build one cinema card for its current loading, error or success state.
function createCard(source) {
  // Until the first result exists, display this source as loading.
  const result = results[source.id] ?? { state: "loading" };

  const column = document.createElement("div");
  column.className = "col-12 col-md-6 col-lg-4";
  column.dataset.source = source.id;

  const card = document.createElement("article");
  card.className = "card h-100";

  const header = document.createElement("div");
  header.className = "card-header d-flex justify-content-between align-items-center";
  const title = document.createElement("h2");
  title.className = "h5 mb-0";
  const link = document.createElement("a");
  link.href = source.website;
  link.textContent = source.name;
  title.append(link);
  header.append(title);

  const body = document.createElement("div");
  body.className = "card-body";

  if (result.state === "loading") {
    const spinner = document.createElement("div");
    spinner.className = "spinner-border spinner-border-sm";
    spinner.setAttribute("role", "status");
    const label = document.createElement("span");
    label.className = "visually-hidden";
    label.textContent = "Načítava sa…";
    spinner.append(label);
    header.append(spinner);
    body.textContent = "Načítavam program…";
  } else if (result.state === "error") {
    body.classList.add("text-danger");
    body.textContent = `Program sa nepodarilo načítať (${result.error.message}). `;
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "btn btn-sm btn-outline-danger";
    retry.textContent = "Skúsiť znova";
    // Retry only this cinema; the empty catch consumes the error already displayed by loadOne.
    retry.addEventListener("click", () => loadOne(source).catch(() => {}));
    body.append(retry);
  } else {
    body.append(createTodayList(result.days));
  }

  const footer = document.createElement("div");
  footer.className = "card-footer small text-body-secondary";
  footer.textContent = result.updatedAt
    ? `Aktualizované ${result.updatedAt.toLocaleString("sk-SK")}`
    : "Zatiaľ nenačítané";

  card.append(header, body, footer);
  column.append(card);
  return column;
}

// Rebuild the cards for cinemas that are currently visible.
function renderCards() {
  // Keep only sources whose IDs are absent from the hidden-source Set.
  const visible = SOURCES.filter((source) => !hiddenSources.has(source.id));
  // map builds the cards; ... passes each card separately to replaceChildren.
  cards.replaceChildren(...visible.map(createCard));
}

// Update one cinema's state and redraw the cards before and after its request.
async function loadOne(source) {
  const previous = results[source.id];
  results[source.id] = { state: "loading", updatedAt: previous?.updatedAt };
  renderCards();
  try {
    const days = await loadSource(source);
    results[source.id] = { state: "ok", days, updatedAt: new Date() };
  } catch (error) {
    results[source.id] = { state: "error", error, updatedAt: previous?.updatedAt };
    // Forward the failure so loadAll can count it, or the retry handler can consume it.
    throw error;
  } finally {
    renderCards();
  }
}

// Start all cinema requests together and display how many succeeded.
async function loadAll() {
  refreshButton.disabled = true;
  statusText.textContent = "Načítavam programy…";
  // allSettled waits for every request, even when one cinema fails.
  const outcomes = await Promise.allSettled(SOURCES.map(loadOne));
  // Count rejected requests while keeping successful cinema cards available.
  const failed = outcomes.filter((outcome) => outcome.status === "rejected").length;
  statusText.textContent = `Načítané ${SOURCES.length - failed} z ${SOURCES.length} kín.`;
  refreshButton.disabled = false;
}

refreshButton.addEventListener("click", loadAll);

const filters = document.getElementById("filters");

for (const source of SOURCES) {
  const label = document.createElement("label");
  label.className = "form-check form-check-inline";
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "form-check-input";
  checkbox.checked = true;
  // Show or hide this cinema using loaded results, without downloading its program again.
  checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    hiddenSources.delete(source.id);
  } else {
    hiddenSources.add(source.id);
  }
  renderCards();
});
  label.append(checkbox, ` ${source.name}`);
  filters.append(label);
}

loadAll();