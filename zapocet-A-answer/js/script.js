async function loadRestuurantHtml(url) {
  const response = await fetch(url); 
  if (!response.ok) {
    throw new Error(`Menu sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  return response.text();
}

async function loadMenu() {
    //======Загружает ресторан и выделяет из него бляда=====================
  const html = await loadRestuurantHtml("source/u-lipy.html");
  const doc = new DOMParser().parseFromString(html, "text/html");

  const dishes = doc.querySelectorAll(".jedlo"); //fetched food nodes

    //======Создаём массив блюд=====================
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
  return meals;
}

function buildMenu(meals) {
  //<div id="menu"></div> загружаем сюда html элементы спаршенного сайта
  const menu = document.querySelector("#menu");

  menu.replaceChildren(); //for filters. без аргументов удаляет всё содержимое #menu. После этого наш существующий цикл создаёт актуальные карточки.

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
      price.classList.add("price-missing"); //„Cena neuvedená“ je vizuálne odlíšená od ceny.
    } else {
      price.textContent = meal.price.toFixed(2) + " €"; //toFixed() возвращает строку, а не число. 2 - количество знаков после точки
    }

    card.appendChild(title); //помещаем <h3> внутрь <article>
    card.appendChild(category);
    card.appendChild(price);
    menu.appendChild(card); //помещаем готовый <article> в нашу страницу, внутрь #menu
  }
}

function buildFilters(meals) {
  //======создание уникальных категорий=======
  const categories = [];

  for (const meal of meals) {
      if (!categories.includes(meal.category)) {
          categories.push(meal.category);
      }
  }
  console.log(categories);

  //======создание надписей фильтров с боксами=====================
  const filters = document.querySelector("#filters");

  for (const category of categories) {
    const label = document.createElement("label");
    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";
    checkbox.value = category;
    checkbox.checked = true;
    //«Браузер, запомни эту функцию и вызови её, когда у данного checkbox произойдёт событие change».
    checkbox.addEventListener("change", () => updateFilters(meals));

    label.appendChild(checkbox);
    label.append(category + " ");

    filters.appendChild(label);
  }
}

function updateFilters(meals) {
  const filters = document.querySelector("#filters");
  const selectedCategories = [];

  for (const checkbox of filters.querySelectorAll("input")) { //находим все элементы <input> внутри него
    if (checkbox.checked) {
        selectedCategories.push(checkbox.value);
    }
  }

  const visibleMeals = [];

  for (const meal of meals) {
    if (selectedCategories.includes(meal.category)) {
        visibleMeals.push(meal);
    }
  }
  buildMenu(visibleMeals);
}

//Tlačidlo #simulate-404 pošle požiadavku na neexistujúci súbor source/neexistuje.html.
async function simulate404() {
    try {
        await loadRestuurantHtml("source/neexistuje.html");
    } catch (error) {
        const status = document.querySelector("#status");
        status.textContent = error.message;
        status.classList.add("status-error");
    }
}

async function main() {
  const status = document.querySelector("#status");
  const button404 = document.querySelector("#simulate-404");

  button404.addEventListener("click", simulate404); 

  try {
      const meals = await loadMenu();

      buildMenu(meals);
      status.textContent = "Načítaných " + meals.length + " jedál.";

      buildFilters(meals);
  } 
  catch (error) {
      status.textContent = error.message;
      status.classList.add("status-error");
  }
}

// async function main() {
//     const meals = await loadMenu();

//     buildMenu(meals);

//     const status = document.querySelector("#status");
//     status.textContent = "Načítaných " + meals.length + " jedál.";
// }

main();