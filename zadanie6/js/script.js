const SOURCE_URL = "source/kino-hviezda.html";

async function loadCinemaHtml() {
  const response = await fetch(SOURCE_URL); // Fetch the file
   if (!response.ok) {
    throw new Error(`Stránku kina sa nepodarilo načítať (HTTP ${response.status}).`);
  }
  return response.text();
}

function parseHtml(html) {
  return new DOMParser().parseFromString(html, "text/html");
}

async function main() {
  const html = await loadCinemaHtml();
  const doc = parseHtml(html);
  for (const section of doc.querySelectorAll(".den")) {
    console.log(JSON.stringify(section.querySelector("h2").textContent));
  }
  console.log(doc.title, doc.querySelectorAll(".den").length);
}

main();