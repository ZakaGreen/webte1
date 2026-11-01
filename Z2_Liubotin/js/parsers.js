// Keep the same day order in every parser and in the day selector.
const DAY_NAMES = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];

// Replace repeated whitespace and remove spaces at the beginning and end.
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Extract all seven days and meals from Eat & Meet into the shared menu structure.
// Return [{ day, meals: [{ type, name, price, discountPrice, allergens }] }].
function parseEatAndMeet(doc) {
  // Check that the source still contains its weekly menu.
  const menu = doc.querySelector(".weak-menu");
  if (!menu || !menu.querySelector(".tab-pane")) {
    throw new Error("Štruktúra stránky Eat & Meet sa zmenila. Menu sa nedá spracovať.");
  }

  // Read seven day sections and keep an empty meal list for missing days.
  const days = [];
  for (let index = 0; index < DAY_NAMES.length; index++) {
    const section = menu.querySelector("#day-" + (index + 1));
    const meals = [];
    // Read dishes only when this day exists in the source.
    if (section) {
      // Each menu-body contains one dish, its category and its prices.
      for (const item of section.querySelectorAll(".menu-body")) {
        const heading = item.querySelector("h4");
        const description = item.querySelector(".desc");
        const price = item.querySelector(".price");
        // Report changed markup instead of displaying incomplete dish data.
        if (!heading || !description || !price) {
          throw new Error("Štruktúra jedla v Eat & Meet sa zmenila. Menu sa nedá spracovať.");
        }

        // Separate the allergen span from the dish name in a copy of the node.
        const nameElement = description.cloneNode(true);
        const allergenElement = nameElement.querySelector("span");
        const allergens = allergenElement ? cleanText(allergenElement.textContent) : "";
        // Some dishes have no allergen span.
        if (allergenElement) {
          allergenElement.remove();
        }
        const name = cleanText(nameElement.textContent);
        // Ignore empty dish entries.
        if (!name) {
          continue;
        }
        // Convert numbered soup and menu labels to shared category names.
        let type = cleanText(heading.textContent);
        if (type.startsWith("Polievka")) {
          type = "Polievka";
        } else if (type.startsWith("MENU")) {
          type = "Hlavné jedlo";
        }
        // The source separates the regular and ISIC prices with a slash.
        const prices = cleanText(price.textContent).split("/");
        meals.push({
          type,
          name,
          price: prices[0].trim(),
          discountPrice: prices[1] ? prices[1].trim() : "",
          allergens,
        });
      }
    }
    // The source lists days, but no dates or weights for these meals.
    days.push({ day: DAY_NAMES[index], meals });
  }
  // Return the same day-and-meal structure used by the other restaurants.
  return days;
}

// Extract dated daily offers from Fayn Food into the shared menu structure.
function parseFaynFood(doc) {
  // Limit parsing to Fayn Food; this page also contains other canteens.
  const menu = doc.querySelector("#fayn-food .daily-offer");
  if (!menu || !menu.querySelector(".day-title")) {
    throw new Error("Štruktúra stránky Fayn Food sa zmenila. Menu sa nedá spracovať.");
  }

  // Prepare Monday to Friday, including days without a published menu.
  const days = [];
  for (const day of DAY_NAMES.slice(0, 5)) {
    days.push({ day, meals: [] });
  }
  // Each outer list item contains a day heading and an inner dish list.
  for (const section of menu.children) {
    const heading = section.querySelector(".day-title");
    const list = section.querySelector(".day-offer");
    // Stop with a readable error if the expected day markup changes.
    if (!heading || !list) {
      throw new Error("Štruktúra dňa vo Fayn Food sa zmenila. Menu sa nedá spracovať.");
    }
    // Split a heading such as "pondelok, 26.10.2026" into day and date.
    const title = cleanText(heading.textContent).split(",");
    // Match by weekday name so a missing day does not shift the other menus.
    const day = days.find((item) => item.day.toLowerCase() === title[0].toLowerCase());
    // Ignore headings outside the five supported weekdays.
    if (!day) {
      continue;
    }
    day.date = title[1] ? title[1].trim() : "";

    // Read the numbered dishes and the soup marked with P.
    for (const item of list.children) {
      const nameElement = item.cloneNode(true);
      const label = nameElement.querySelector(".brand:not(.price)");
      const price = nameElement.querySelector(".price");
      // Both spans are needed to separate the name from its label and price.
      if (!label || !price) {
        throw new Error("Štruktúra jedla vo Fayn Food sa zmenila. Menu sa nedá spracovať.");
      }
      // Remove the label and price from the copied node before reading its name.
      const type = cleanText(label.textContent) === "P." ? "Polievka" : "Hlavné jedlo";
      label.remove();
      price.remove();
      let name = cleanText(nameElement.textContent);
      // Closed days still contain prices and empty dish rows in the source.
      if (!name || name.toLowerCase() === "zatvorené") {
        continue;
      }

      // Read allergens and portions from the selected dish text, not from HTML.
      const allergens = name.match(/A:\s*([\d,]+)/);
      const weight = name.match(/\d+(?:,\d+)?[gl](?:,\d+[gl])*/);
      // Show allergens in their own field instead of repeating them in the name.
      if (allergens) {
        name = name.replace(allergens[0], "");
      }
      // Show grams or soup volume in a separate field when available.
      if (weight) {
        name = name.replace(weight[0], "");
      }
      // Store only values supplied by the source; no ISIC price is published here.
      day.meals.push({
        type,
        name: cleanText(name),
        price: cleanText(price.textContent),
        allergens: allergens ? allergens[1] : "",
        weight: weight ? weight[0] : "",
      });
    }
  }
  // Return the prepared weekdays in their original order.
  return days;
}

// Separate a DRAG dish's leading portion and numbered allergens from its name.
function parseDragMeal(text, type, price) {
  // These patterns inspect one selected dish's text, never the whole HTML page.
  let name = cleanText(text);
  const weight = name.match(/^(\d+(?:,\d+)?[gl](?:\/\d+[gl])*)\.?\s*/);
  const allergens = name.match(/\/(\d[\d, ]*)\//);

  // Remove the leading portion, including the optional dot after soup volume.
  if (weight) {
    name = name.replace(weight[0], "");
  }
  // Remove only numbered allergens; slashes in dish descriptions remain.
  if (allergens) {
    name = name.replace(allergens[0], "");
  }

  // A few source entries have an extra comma after the final allergen number.
  return {
    type,
    name: cleanText(name),
    price,
    allergens: allergens ? cleanText(allergens[1]).replace(/,$/, "") : "",
    weight: weight ? weight[1] : "",
  };
}

// Read DRAG's soup text and two-column tables for Monday to Friday.
function parseDrag(doc) {
  // Check for day headings inside the restaurant's menu tabs.
  const menu = doc.querySelector(".tab-content");
  if (!menu || !menu.querySelector(".menu_box_title h2")) {
    throw new Error("Štruktúra stránky DRAG sa zmenila. Menu sa nedá spracovať.");
  }

  // Source IDs omit accents; displayed day names come from DAY_NAMES.
  const ids = ["pondelok", "utorok", "streda", "stvrtok", "piatok"];
  const days = [];
  for (let index = 0; index < ids.length; index++) {
    const section = menu.querySelector("#" + ids[index]);
    const meals = [];

    // A missing day stays empty without shifting the following days.
    if (section) {
      const table = section.querySelector("table");
      // Each published day has category headings and a table of main dishes.
      if (!table || !section.querySelector("h3")) {
        throw new Error("Štruktúra dňa v DRAG sa zmenila. Menu sa nedá spracovať.");
      }

      // Only the soup text remains after removing headings, tables and scripts.
      const soupElement = section.cloneNode(true);
      for (const item of soupElement.querySelectorAll(".menu_box_title, table, script")) {
        item.remove();
      }
      const soup = cleanText(soupElement.textContent);
      // The source gives no separate soup price, so leave it empty.
      if (soup) {
        meals.push(parseDragMeal(soup, "Polievka", ""));
      }

      // The first cell is the dish description; the second cell is its price.
      for (const row of table.querySelectorAll("tr")) {
        const cells = row.querySelectorAll("td");
        // A different number of columns indicates changed source markup.
        if (cells.length !== 2) {
          throw new Error("Štruktúra jedla v DRAG sa zmenila. Menu sa nedá spracovať.");
        }
        const name = cleanText(cells[0].textContent);
        // The source includes empty table rows between or after dishes.
        if (!name) {
          continue;
        }
        meals.push(parseDragMeal(name, "Hlavné jedlo", cleanText(cells[1].textContent)));
      }
    }

    // No menu dates are published, so only the weekday and meals are stored.
    days.push({ day: DAY_NAMES[index], meals });
  }
  return days;
}
