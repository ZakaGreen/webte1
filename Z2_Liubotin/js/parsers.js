const DAY_NAMES = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];

// Replace repeated whitespace and remove spaces at the beginning and end.
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Extract all seven days and meals from Eat & Meet into the shared menu structure.
// Return [{ day, meals: [{ type, name, price, discountPrice, allergens }] }].
function parseEatAndMeet(doc) {
  const menu = doc.querySelector(".weak-menu");
  if (!menu || !menu.querySelector(".tab-pane")) {
    throw new Error("Štruktúra stránky Eat & Meet sa zmenila. Menu sa nedá spracovať.");
  }

  const days = [];
  for (let index = 0; index < DAY_NAMES.length; index++) {
    const section = menu.querySelector("#day-" + (index + 1));
    const meals = [];
    if (section) {
      for (const item of section.querySelectorAll(".menu-body")) {
        const heading = item.querySelector("h4");
        const description = item.querySelector(".desc");
        const price = item.querySelector(".price");
        if (!heading || !description || !price) {
          throw new Error("Štruktúra jedla v Eat & Meet sa zmenila. Menu sa nedá spracovať.");
        }

        const nameElement = description.cloneNode(true);
        const allergenElement = nameElement.querySelector("span");
        const allergens = allergenElement ? cleanText(allergenElement.textContent) : "";
        if (allergenElement) {
          allergenElement.remove();
        }
        const name = cleanText(nameElement.textContent);
        if (!name) {
          continue;
        }
        let type = cleanText(heading.textContent);
        if (type.startsWith("Polievka")) {
          type = "Polievka";
        } else if (type.startsWith("MENU")) {
          type = "Hlavné jedlo";
        }
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
  return days;
}

// Extract dated daily offers from Fayn Food into the shared menu structure.
function parseFaynFood(doc) {
  const menu = doc.querySelector("#fayn-food .daily-offer");
  if (!menu || !menu.querySelector(".day-title")) {
    throw new Error("Štruktúra stránky Fayn Food sa zmenila. Menu sa nedá spracovať.");
  }

  const days = [];
  for (const day of DAY_NAMES.slice(0, 5)) {
    days.push({ day, meals: [] });
  }
  for (const section of menu.children) {
    const heading = section.querySelector(".day-title");
    const list = section.querySelector(".day-offer");
    if (!heading || !list) {
      throw new Error("Štruktúra dňa vo Fayn Food sa zmenila. Menu sa nedá spracovať.");
    }
    const title = cleanText(heading.textContent).split(",");
    // Match by weekday name so a missing day does not shift the other menus.
    const day = days.find((item) => item.day.toLowerCase() === title[0].toLowerCase());
    if (!day) {
      continue;
    }
    day.date = title[1] ? title[1].trim() : "";

    for (const item of list.children) {
      const nameElement = item.cloneNode(true);
      const label = nameElement.querySelector(".brand:not(.price)");
      const price = nameElement.querySelector(".price");
      if (!label || !price) {
        throw new Error("Štruktúra jedla vo Fayn Food sa zmenila. Menu sa nedá spracovať.");
      }
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
      if (allergens) {
        name = name.replace(allergens[0], "");
      }
      if (weight) {
        name = name.replace(weight[0], "");
      }
      day.meals.push({
        type,
        name: cleanText(name),
        price: cleanText(price.textContent),
        allergens: allergens ? allergens[1] : "",
        weight: weight ? weight[0] : "",
      });
    }
  }
  return days;
}
