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
  //Výsledné pole sa vypíše do konzoly prehliadača (console.log)
  console.log(meals);
  renderMenu(meals);
}

function renderMenu(meals) {
  //<div id="menu"></div> загружаем сюда html элементы спаршенного сайта
    const menu = document.querySelector("#menu");

  for (const meal of meals) {
    const card = document.createElement("article"); 
    card.classList.add("meal-card");
    const title = document.createElement("h3"); //записываем это название внутрь <h3>
    const category = document.createElement("p"); //<p>	- Абзац текста
    category.classList.add("meal-category");
    const price = document.createElement("p");
    price.classList.add("meal-price");

    title.textContent = meal.name;
    category.textContent = meal.category;
    if (meal.price === null) {
      price.textContent = "cena neuvedená";
    } else {
      price.textContent = meal.price.toFixed(2) + " €"; //toFixed() возвращает строку, а не число. 2 - количество знаков после точки
    }

    card.appendChild(title); //помещаем <h3> внутрь <article>
    card.appendChild(category);
    card.appendChild(price);
    menu.appendChild(card); //помещаем готовый <article> в нашу страницу, внутрь #menu
  }
}


loadMenu();