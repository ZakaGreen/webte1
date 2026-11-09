// Ready-made parsers for the three cinema pages.
// Every parser takes a Document from DOMParser and returns the same structure:
// [{ day: "Pondelok", date: "2. 11.", screenings: [{ time, title, hall, price }] }]

const DAY_NAMES = ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"];

// Replace runs of whitespace (\s+) with one space and trim both ends.
function cleanText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Read and clean a descendant's text; ?. and ?? provide an empty string if it is missing.
function textOf(element, selector) {
  return cleanText(element.querySelector(selector)?.textContent ?? "");
}

// Convert a price label into a number; null means an unknown price, not a free ticket.
function parsePrice(text) {
  if (!text) {
    return null;
  }
  // Skip everything before the first digit ("Vstupné: 8,50 €" -> "8,50 €")
  const price = parseFloat(text.replace(/^\D*/, "").replace(",", "."));
  return Number.isNaN(price) ? null : price;
}

// Parse source HTML in a separate document without inserting its markup into our page.
function parseHtml(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

// Kino Hviezda: <section class="den"> with <h2>Day <small>date</small></h2> and li.film (cviko 6)
function parseHviezda(doc) {
  const days = [];
  for (const section of doc.querySelectorAll(".den")) {
    const heading = section.querySelector("h2");
    const screenings = [];
    for (const film of section.querySelectorAll(".film")) {
      const time = textOf(film, ".cas");
      const title = textOf(film, ".nazov");
      if (!time || !title) {
        // Skip only the incomplete screening and keep processing the rest of the day.
        continue;
      }
      screenings.push({ time, title, hall: textOf(film, ".sala"), price: parsePrice(textOf(film, ".cena")) });
    }
    days.push({
      // The first text node contains the day name without the date inside <small>.
      day: cleanText(heading.firstChild.textContent),
      date: textOf(section, "h2 small"),
      screenings,
    });
  }
  return days;
}

// Kino Mier: one table, a row tr.den starts a new day ("Pondelok 2. 11. 2026"),
// the following rows with three cells are screenings
function parseMier(doc) {
  const days = [];
  let current = null;
  for (const row of doc.querySelectorAll("table.rozpis tr")) {
    if (row.classList.contains("den")) {
      // Take the first word as the day and keep the remaining words as date parts.
      const [day, ...date] = cleanText(row.textContent).split(" ");
      // Keep the day and month; omit the year from the displayed date.
      current = { day, date: date.slice(0, 2).join(" "), screenings: [] };
      days.push(current);
      continue;
    }
    const cells = row.querySelectorAll("td");
    if (!current || cells.length !== 3) {
      // Ignore rows before a day heading and rows that do not describe a screening.
      continue;
    }
    current.screenings.push({
      time: cleanText(cells[0].textContent),
      title: cleanText(cells[1].textContent),
      hall: "",
      price: parsePrice(cleanText(cells[2].textContent)),
    });
  }
  return days;
}

// Kino Lumière: flat list of article.predstavenie, the day is in <time datetime="2026-11-02T19:00">
function parseLumiere(doc) {
  // Group screenings by day name, creating one entry for each day that appears.
  const byDay = new Map();
  for (const article of doc.querySelectorAll("article.predstavenie")) {
    const datetime = article.querySelector("time")?.getAttribute("datetime");
    const title = textOf(article, "h3");
    if (!datetime || !title) {
      continue;
    }
    const date = new Date(datetime);
    // getDay() starts with Sunday (0); DAY_NAMES starts with Monday (0).
    const day = DAY_NAMES[(date.getDay() + 6) % 7];
    if (!byDay.has(day)) {
      byDay.set(day, { day, date: `${date.getDate()}. ${date.getMonth() + 1}.`, screenings: [] });
    }
    byDay.get(day).screenings.push({
      // Extract HH:mm from the source format YYYY-MM-DDTHH:mm.
      time: datetime.slice(11, 16),
      title,
      hall: textOf(article, ".miesto"),
      price: parsePrice(textOf(article, ".vstupne")),
    });
  }
  // filter keeps days with screenings; map reads their objects in Monday-to-Sunday order.
  return DAY_NAMES.filter((day) => byDay.has(day)).map((day) => byDay.get(day));
}
