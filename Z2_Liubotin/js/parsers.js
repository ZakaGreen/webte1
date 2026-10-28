const DAY_NAMES = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok"];

// Replace repeated whitespace and remove spaces at the beginning and end.
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Extract weekdays and meals from Eat & Meet into the shared menu structure.
// Return [{ day, date, meals: [{ type, name, price, discountPrice, allergens, weight }] }].
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
        const category = cleanText(heading.textContent);
        let type = category;
        if (category.startsWith("Polievka")) {
          type = "Polievka";
        } else if (category.startsWith("MENU")) {
          type = "Hlavné jedlo";
        }
        const prices = cleanText(price.textContent).split("/");
        meals.push({
          type,
          name,
          price: prices[0].trim(),
          discountPrice: prices[1] ? prices[1].trim() : "",
          allergens,
          weight: "",
        });
      }
    }
    // The source lists weekdays, but no dates or weights for these meals.
    days.push({ day: DAY_NAMES[index], date: "", meals });
  }
  return days;
}
