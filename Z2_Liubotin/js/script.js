const SOURCES = [
  {
    id: "eat-and-meet",
    name: "Eat & Meet",
    website: "https://eatandmeet.sk/tyzdenne-menu",
    localUrl: "source/eat-and-meet.html",
    parse: parseEatAndMeet,
  },
  {
    id: "fayn-food",
    name: "Fayn Food",
    website: "http://www.freefood.sk/menu/#fayn-food",
    localUrl: "source/fayn-food.html",
    parse: parseFaynFood,
  },
];

const results = {};

// Return the localStorage key for one restaurant's local menu.
function cacheKey(source) {
  return "webte1-z2-" + source.id + "-local";
}

// Create one dish row using text only, including its prices and allergens.
function createMeal(meal) {
  const item = $("<li>").addClass("dish");
  if (meal.type === "Polievka") {
    item.addClass("soup");
  }
  const description = $("<div>");
  description.append($("<div>").addClass("dish-type").text(meal.type));
  description.append($("<div>").text(meal.name));
  if (meal.allergens) {
    description.append($("<div>").addClass("allergens").text("Alergény: " + meal.allergens));
  }
  if (meal.weight) {
    description.append($("<div>").addClass("allergens").text(meal.weight));
  }
  const prices = $("<div>").addClass("prices");
  const regular = $("<div>").text(meal.price || "Neuvedená");
  regular.append($("<span>").text(" · Bežná cena"));
  prices.append(regular);
  if (meal.discountPrice) {
    const discount = $("<div>").text(meal.discountPrice);
    discount.append($("<span>").text(" · s ISIC"));
    prices.append(discount);
  }
  return item.append(description, prices);
}

// Create the menu section for one weekday or show that its menu is missing.
function createDay(day) {
  const section = $("<section>").addClass("menu-day");
  section.append($("<h4>").text(day.day + (day.date ? " · " + day.date : "")));
  if (day.meals.length === 0) {
    section.append($("<p>").text("Menu na tento deň nie je k dispozícii."));
  } else {
    const list = $("<ul>").addClass("dishes");
    for (const meal of day.meals) {
      list.append(createMeal(meal));
    }
    section.append(list);
  }
  return section;
}

// Show loading results and timestamps below the update buttons.
function renderUpdates() {
  const updates = $("#updates").empty();
  for (const source of SOURCES) {
    const result = results[source.id];
    const line = $("<p>").addClass("updated").text(source.name + ": ");
    if (!result || result.state === "loading") {
      line.append("Načítavam…");
    } else if (result.state === "ok") {
      const time = $("<time>").attr("datetime", result.updatedAt)
        .text(new Date(result.updatedAt).toLocaleString("sk-SK"));
      line.append("Posledná aktualizácia: ", time);
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
  const cards = $("#cards").empty();
  for (const source of SOURCES) {
    if (!$("#show-" + source.id).prop("checked")) {
      continue;
    }
    const card = $("<article>").addClass("restaurant");
    const link = $("<a>").attr("href", source.website).text(source.name);
    card.append($("<h3>").append(link));
    const result = results[source.id];
    if (!result || result.state === "loading") {
      card.append($("<p>").text("Načítavam menu…"));
    } else if (result.state === "error") {
      card.append($("<p>").addClass("error").text("Menu sa nepodarilo načítať."));
    } else if (result.state === "empty") {
      card.append($("<p>").text("Údaje boli vymazané. Kliknite na Aktualizovať menu."));
    } else {
      const selectedDay = $("#day").val();
      for (const day of result.days) {
        if (selectedDay === "all" || day.day === DAY_NAMES[selectedDay]) {
          card.append(createDay(day));
        }
      }
    }
    cards.append(card);
  }
}

// Reuse today's cache or fetch and parse the restaurant's local HTML copy.
async function loadOne(source, refresh) {
  const key = cacheKey(source);
  results[source.id] = { state: "loading" };
  renderUpdates();
  renderCards();
  try {
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(key));
    } catch {
      // A damaged or unavailable cache must not prevent loading the menu.
    }
    if (!refresh && saved && Array.isArray(saved.days)
        && new Date(saved.updatedAt).toDateString() === new Date().toDateString()) {
      results[source.id] = { state: "ok", days: saved.days, updatedAt: saved.updatedAt };
    } else {
      const response = await fetch(source.localUrl);
      if (!response.ok) {
        throw new Error("Menu sa nepodarilo načítať (HTTP " + response.status + "). Skúste aktualizáciu.");
      }
      const html = await response.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const days = source.parse(doc);
      const updatedAt = new Date().toISOString();
      results[source.id] = { state: "ok", days, updatedAt };
      try {
        localStorage.setItem(key, JSON.stringify({ days, updatedAt }));
      } catch {
        results[source.id].note = "Prehliadač nepovolil uloženie menu. Po otvorení sa načíta znova.";
      }
    }
  } catch (error) {
    let message = error.message;
    if (error instanceof TypeError) {
      message = "Lokálnu kópiu sa nepodarilo načítať. Skúste aktualizáciu.";
    }
    results[source.id] = { state: "error", message };
  }
  renderUpdates();
  renderCards();
}

// Update all restaurant data independently, without changing the selected menu.
async function loadAll(refresh) {
  $("#refresh, #clear").prop("disabled", true);
  $("#status").text("Načítavam menu…");
  // Each restaurant handles its own error, so other menus can still load.
  await Promise.all(SOURCES.map((source) => loadOne(source, refresh)));
  // Count restaurants whose data is ready to display.
  const loaded = SOURCES.filter((source) => results[source.id].state === "ok").length;
  $("#status").text("Načítané reštaurácie: " + loaded + " z " + SOURCES.length);
  $("#refresh, #clear").prop("disabled", false);
}

// Delete this project's local cache and clear its displayed menus and timestamps.
function clearData() {
  try {
    for (const source of SOURCES) {
      localStorage.removeItem(cacheKey(source));
      results[source.id] = { state: "empty" };
    }
    renderUpdates();
    renderCards();
    $("#status").text("Uložené údaje boli vymazané.");
  } catch {
    $("#status").text("Prehliadač nepovolil vymazanie uložených údajov.");
  }
}

for (const source of SOURCES) {
  const tab = $("<input>").attr({ type: "radio", name: "restaurant", id: "show-" + source.id })
    .prop("checked", source === SOURCES[0]).on("change", renderCards);
  $("#filters").append($("<label>").append(tab, $("<span>").text(source.name)));
}

const today = (new Date().getDay() + 6) % 7;
$("#day").val(today < 5 ? today : 0);
$("#day").on("change", renderCards);
// The update button forces a new read instead of reusing today's cache.
$("#refresh").on("click", () => loadAll(true));
$("#clear").on("click", clearData);
loadAll(false);
