// Each restaurant supplies its local file, parser, available days and opening hours.
const SOURCES = [
  // Eat & Meet publishes menus for all seven days.
  {
    id: "eat-and-meet",
    name: "Eat & Meet",
    openingHours: "Po–Pi 7:00–20:30 · So–Ne 9:00–19:00",
    dayCount: 7,
    website: "https://eatandmeet.sk/tyzdenne-menu",
    localUrl: "source/eat-and-meet.html",
    parse: parseEatAndMeet,
  },
  // Fayn Food publishes a weekday menu on a page shared with other canteens.
  {
    id: "fayn-food",
    name: "Fayn Food",
    openingHours: "Po–Pi 8:00–15:00 (cez prázdniny do 14:00)",
    dayCount: 5,
    website: "http://www.freefood.sk/menu/#fayn-food",
    localUrl: "source/fayn-food.html",
    parse: parseFaynFood,
  },
  // DRAG is open at weekends, but publishes this daily menu only for weekdays.
  {
    id: "drag",
    name: "DRAG",
    openingHours: "Po–Pi 11:00–21:00 · So–Ne 12:00–21:00",
    dayCount: 5,
    website: "https://www.restauracia-drag.sk/denne-menu",
    localUrl: "source/drag.html",
    parse: parseDrag,
  },
];

// Keep each restaurant's loading state and parsed data in memory.
const results = {};

// Return the localStorage key for one restaurant's local menu.
function cacheKey(source) {
  return "webte1-z2-" + source.id + "-local";
}

// Create one dish row using text only, including its prices and allergens.
function createMeal(meal) {
  // Give soups a separate visual style.
  const item = $("<li>").addClass("dish");
  if (meal.type === "Polievka") {
    item.addClass("soup");
  }
  // Insert source data as text so downloaded HTML cannot become page content.
  const description = $("<div>");
  description.append($("<div>").addClass("dish-type").text(meal.type));
  description.append($("<div>").text(meal.name));
  // Add allergens only when the source provides them.
  if (meal.allergens) {
    description.append($("<div>").addClass("allergens").text("Alergény: " + meal.allergens));
  }
  // Add a portion size or soup volume when available.
  if (meal.weight) {
    description.append($("<div>").addClass("allergens").text(meal.weight));
  }
  // Display a regular price, or state that it was not provided.
  const prices = $("<div>").addClass("prices");
  const regular = $("<div>").text(meal.price || "Neuvedená");
  regular.append($("<span>").text(" · Bežná cena"));
  prices.append(regular);
  // Only Eat & Meet currently provides a separate ISIC price.
  if (meal.discountPrice) {
    const discount = $("<div>").text(meal.discountPrice);
    discount.append($("<span>").text(" · s ISIC"));
    prices.append(discount);
  }
  // Combine the description and price columns into one dish row.
  return item.append(description, prices);
}

// Create the menu section for one day or show that its menu is missing.
function createDay(day) {
  // Include the date beside the weekday only when it is present in the source.
  const section = $("<section>").addClass("menu-day");
  section.append($("<h4>").text(day.day + (day.date ? " · " + day.date : "")));
  // Show a missing-menu message or build a list of this day's dishes.
  if (day.meals.length === 0) {
    section.append($("<p>").text("Menu na tento deň nie je k dispozícii."));
  } else {
    const list = $("<ul>").addClass("dishes");
    // Reuse the same dish renderer for every restaurant.
    for (const meal of day.meals) {
      list.append(createMeal(meal));
    }
    section.append(list);
  }
  return section;
}

// Show loading results and timestamps below the update buttons.
function renderUpdates() {
  // Rebuild a separate status line for each source, above the menu controls.
  const updates = $("#updates").empty();
  for (const source of SOURCES) {
    const result = results[source.id];
    const line = $("<p>").addClass("updated").text(source.name + ": ");
    // Translate the loading, success, error or cleared state into visible text.
    if (!result || result.state === "loading") {
      line.append("Načítavam…");
    } else if (result.state === "ok") {
      // Keep a machine-readable timestamp and display its Slovak date format.
      const time = $("<time>").attr("datetime", result.updatedAt)
        .text(new Date(result.updatedAt).toLocaleString("sk-SK"));
      line.append("Posledná aktualizácia: ", time);
      // A storage warning does not prevent displaying successfully parsed meals.
      if (result.note) {
        line.append(" · " + result.note);
      }
    } else if (result.state === "error") {
      line.append(result.message);
    } else {
      line.append("Údaje boli vymazané.");
    }
    updates.append(line);
  }
}

// Display only the selected restaurant and the chosen day or whole week.
function renderCards() {
  // Clear the previous card and find the restaurant selected by its radio tab.
  const cards = $("#cards").empty();
  const source = SOURCES.find((source) => $("#show-" + source.id).prop("checked"));
  // Leave the menu empty if no restaurant is selected.
  if (!source) {
    return;
  }
  // Switch to Monday if this restaurant does not offer the selected day.
  if (Number($("#day").val()) >= source.dayCount) {
    $("#day").val("0");
  }
  // Hide and disable weekend choices for restaurants with weekday menus.
  $("#day option[value='5'], #day option[value='6']")
    .prop("hidden", source.dayCount === 5).prop("disabled", source.dayCount === 5);
  // Place the source link and usual opening hours above the dishes.
  const card = $("<article>").addClass("restaurant");
  const link = $("<a>").attr("href", source.website).text(source.name);
  card.append($("<h3>").append(link));
  card.append($("<p>").text("Bežné otváracie hodiny: " + source.openingHours));
  // Show a state message until this restaurant's menu is ready.
  const result = results[source.id];
  if (!result || result.state === "loading") {
    card.append($("<p>").text("Načítavam menu…"));
  } else if (result.state === "error") {
    card.append($("<p>").addClass("error").text("Menu sa nepodarilo načítať."));
  } else if (result.state === "empty") {
    card.append($("<p>").text("Údaje boli vymazané. Kliknite na Aktualizovať menu."));
  } else {
    // Render either the chosen day or all days already loaded in memory.
    const selectedDay = $("#day").val();
    for (const day of result.days) {
      // The select values match positions in DAY_NAMES; "all" accepts every day.
      if (selectedDay === "all" || day.day === DAY_NAMES[selectedDay]) {
        card.append(createDay(day));
      }
    }
  }
  cards.append(card);
}

// Reuse today's cache or fetch and parse the restaurant's local HTML copy.
async function loadOne(source, refresh) {
  // Immediately show that this restaurant is being loaded.
  const key = cacheKey(source);
  results[source.id] = { state: "loading" };
  renderUpdates();
  renderCards();
  // Handle a failure for this source without stopping other restaurants.
  try {
    let saved = null;
    // Read its cached JSON; damaged data or blocked storage can be skipped.
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch {
      // A damaged or unavailable cache must not prevent loading the menu.
    }
    // Reuse only today's data with the expected number of days unless forced.
    if (!refresh && saved && Array.isArray(saved.days)
        && saved.days.length === source.dayCount
        && new Date(saved.updatedAt).toDateString() === new Date().toDateString()) {
      results[source.id] = { state: "ok", days: saved.days, updatedAt: saved.updatedAt };
    } else {
      // Fetch the local HTML copy and check the HTTP result.
      const response = await fetch(source.localUrl);
      // HTTP errors do not automatically reject fetch, so check response.ok.
      if (!response.ok) {
        throw new Error("Menu sa nepodarilo načítať (HTTP " + response.status + "). Skúste aktualizáciu.");
      }
      // Parse a separate document and pass it to this restaurant's parser.
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const days = source.parse(doc);
      // Record when the local file was read, not when the restaurant published it.
      const updatedAt = new Date().toISOString();
      results[source.id] = { state: "ok", days, updatedAt };
      // Save parsed data for later visits on the same day.
      try {
        localStorage.setItem(key, JSON.stringify({ days, updatedAt }));
      } catch {
        // Meals remain usable in memory even when localStorage is unavailable.
        results[source.id].note = "Prehliadač nepovolil uloženie menu. Po otvorení sa načíta znova.";
      }
    }
  } catch (error) {
    // Replace fetch's technical failure with a short Slovak message.
    let message = error.message;
    if (error instanceof TypeError) {
      message = "Lokálnu kópiu sa nepodarilo načítať. Skúste aktualizáciu.";
    }
    results[source.id] = { state: "error", message };
  }
  // Display the final loading result in both the status area and selected card.
  renderUpdates();
  renderCards();
}

// Update all restaurant data independently, without changing the selected menu.
async function loadAll(refresh) {
  // Prevent another update or clear operation while requests are running.
  $("#refresh, #clear").prop("disabled", true);
  $("#status").text("Načítavam menu…");
  // Each restaurant handles its own error, so other menus can still load.
  await Promise.all(SOURCES.map((source) => loadOne(source, refresh)));
  // Count restaurants whose data is ready to display.
  const loaded = SOURCES.filter((source) => results[source.id].state === "ok").length;
  // Summarize successful sources and enable the buttons again.
  $("#status").text("Načítané reštaurácie: " + loaded + " z " + SOURCES.length);
  $("#refresh, #clear").prop("disabled", false);
}

// Delete this project's local cache and clear its displayed menus and timestamps.
function clearData() {
  // Remove only this project's restaurant keys, preserving other stored data.
  try {
    for (const source of SOURCES) {
      localStorage.removeItem(cacheKey(source));
      results[source.id] = { state: "empty" };
    }
    // Clear the displayed data without immediately fetching it again.
    renderUpdates();
    renderCards();
    $("#status").text("Uložené údaje boli vymazané.");
  } catch {
    // Report blocked storage access instead of hiding the failure.
    $("#status").text("Prehliadač nepovolil vymazanie uložených údajov.");
  }
}

// Build one radio tab per restaurant; the shared name allows one selection.
for (const source of SOURCES) {
  const tab = $("<input>").attr({ type: "radio", name: "restaurant", id: "show-" + source.id })
    .prop("checked", source === SOURCES[0]).on("change", renderCards);
  $("#filters").append($("<label>").append(tab, $("<span>").text(source.name)));
}

// Convert Sunday-first JavaScript day numbers to Monday-first menu indexes.
const today = (new Date().getDay() + 6) % 7;
// Start with today's weekday, or Monday at weekends as allowed by the assignment.
$("#day").val(today < 5 ? today : 0);
// Changing the day only redraws data already stored in memory.
$("#day").on("change", renderCards);
// The update button forces a new read instead of reusing today's cache.
$("#refresh").on("click", () => loadAll(true));
// Connect the clear button to deletion of this project's cached menus.
$("#clear").on("click", clearData);
// Load all menus once at startup, reusing a valid daily cache when possible.
loadAll(false);
