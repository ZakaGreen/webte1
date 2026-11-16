const SOURCE_URL = "source/u-lipy.html";

async function loadRestuurantHtml() {
  const response = await fetch(SOURCE_URL); 
  if (!response.ok) {
    throw new Error(`Stránku u-lipy sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  return response.text();
}

async function loadMenu() {
  const html = await loadRestuurantHtml();
  const doc = new DOMParser().parseFromString(html, "text/html");

  const dishes = doc.querySelectorAll(".jedlo"); //fetched food nodes
  const meals = [];
  for (const dish of dishes) {
    const category = dish.querySelector(".kategoria").textContent.replace(/\s+/g, " ").trim();
    const name = dish.querySelector(".nazov").textContent.replace(/\s+/g, " ").trim();
    const priceElement = dish.querySelector(".cena");
    //Condition ? True : False. True: 2,5 text -> 2.5 float
    const price = priceElement ? parseFloat(priceElement.textContent.replace(",", ".")) : null; 

    if (!category || !name) {
        console.warn("Skipping incomplete screening:", dish);
        continue;
      }

    meals.push({
        category: category,
        name: name,
        price: price
    });
  }
}

loadMenu();