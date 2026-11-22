async function loadRestuurantHtml(url) {
  const response = await fetch(url); 
  if (!response.ok) {
    throw new Error(`Menu sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  return response.text();
}

async function loadMenu() {
  //==========LokalStorage=============
  const cachedMenu = localStorage.getItem("zapocet-A-answer-harder");

  if (cachedMenu !== null) {
    console.log("Menu načítané z localStorage");
    return JSON.parse(cachedMenu);
  }
  //======Загружает ресторан и выделяет из него бляда=====================
  const html = await loadRestuurantHtml("source/u-lipy.html");
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  const days = doc.querySelectorAll(".den");
  
  //======Создаём массив блюд=====================
  const meals = [];
  const weekMenu = [];
  
  for (const day of days) {
    const dishes = day.querySelectorAll(".jedlo"); 
    const dayMeals = [];

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

      const meal = {
        category: category,
        name: name,
        price: price
      };

      meals.push(meal);
      dayMeals.push(meal);
    }
    weekMenu.push({
      date: day.dataset.datum,
      day: day.querySelector("h3").textContent.trim(),
      meals: dayMeals
    });
  }
  //Výsledné pole sa vypíše do konzoly prehliadača (console.log)
  console.log(meals);
  localStorage.setItem("zapocet-A-answer-harder", JSON.stringify(weekMenu));
  return weekMenu;
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
  filters.replaceChildren();

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

function buildDays(weekMenu) {
    const daysContainer = document.querySelector("#days");

    for (const day of weekMenu) {
        const button = document.createElement("button");
        button.dataset.date = day.date;

        button.type = "button";
        button.textContent = day.day;

        button.addEventListener("click", () => selectDay(day));

        daysContainer.appendChild(button);
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

function selectDay(day) {
  buildMenu(day.meals);
  buildFilters(day.meals);

  const status = document.querySelector("#status");
  status.textContent = day.day + " — Načítaných " + day.meals.length + " jedál.";
  status.classList.remove("status-error");

  //=============окрашивает выбранный день жёлтым============
  const buttons = document.querySelectorAll("#days button");
  for (const button of buttons) {
    button.classList.toggle("active", button.dataset.date === day.date);
  }
}

async function main() {
  const status = document.querySelector("#status");
  const button404 = document.querySelector("#simulate-404");

  button404.addEventListener("click", simulate404); 

  try {
    const weekMenu = await loadMenu();

    buildDays(weekMenu);
    selectDay(weekMenu[0]);
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