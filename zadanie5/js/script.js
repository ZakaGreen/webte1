const PRODUCTS = [
  { id: 1, name: "Zvonček na bicykel", price: 8.5, tags: ["bike"] },
  { id: 2, name: "Fľaša na vodu", price: 12, tags: ["sport"] },
  { id: 3, name: "Svetlá na bicykel", price: 24.9, tags: ["bike", "safety"] },
];

const list = document.getElementById("products");

// Build one product row with its name, formatted price and Add to cart button.
function createProductItem(product) {
  const item = document.createElement("li");

  const name = document.createElement("span");
  name.textContent = product.name;

  const price = document.createElement("span");
  price.textContent = `${product.price.toFixed(2)} €`;

  const button = document.createElement("button");
  button.type = "button";
  button.textContent = "Do košíka";

  // The callback remembers the product belonging to this button (a closure).
  button.addEventListener("click", () => addToCart(product));

  item.append(name, price, button);
  return item;
}

// Replace the displayed products with a new list.
function renderProducts(products) {
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }
  // Collect the rows outside the page, then insert them together.
  const fragment = document.createDocumentFragment();
  for (const product of products) {
    fragment.appendChild(createProductItem(product));
  }
  list.appendChild(fragment);
}

const cart = [];

// Add one product to the cart and update its count and total price.
function addToCart(product) {
  cart.push(product);
  renderCart();
}

// Display the cart count and total, applying the discount only when it is active.
function renderCart() {
  const items = discountActive ? applyDiscount(cart) : cart;
  // Add each price to the running sum, starting from 0 for an empty cart.
  const total = items.reduce((sum, item) => sum + item.price, 0);
  document.getElementById("cart-count").textContent = cart.length;
  document.getElementById("cart-total").textContent = total.toFixed(2);
}

const discountButton = document.getElementById("discount");
let discountActive = false;

// Return discounted copies so repeated rendering never changes the original prices.
function applyDiscount(items) {
  // Copy each item's properties, then override price; nested values such as tags stay shared.
  return items.map((item) => ({ ...item, price: item.price * 0.9 }));
}

// Toggle the discount, update the button label and recalculate the cart.
discountButton.addEventListener("click", () => {
  discountActive = !discountActive;
  discountButton.textContent = discountActive ? "Zrušiť zľavu" : "Zľava 10 %";
  renderCart();
});

const statusText = document.getElementById("status");
const reloadButton = document.getElementById("reload");


// Pass the function itself so it runs on a click, rather than immediately.
reloadButton.addEventListener("click", showProducts);

// Simulate a server request that takes 1.5 seconds and sometimes fails.
function loadProducts() {
  // Start the asynchronous operation; resolve succeeds and reject reports an error.
  return new Promise((resolve, reject) => {
    // Finish the simulated request after the delay, with a 30% chance of failure.
    setTimeout(() => {
      if (Math.random() < 0.3) {
        reject(new Error("Server neodpovedá"));
      } else {
        // Deep-copy the products, including tags, to keep the source data independent.
        resolve(structuredClone(PRODUCTS));
      }
    }, 1500);
  });
}

// Load and display products, showing progress or an error and restoring the button.
async function showProducts() {
  statusText.textContent = "Načítavam…";
  reloadButton.disabled = true;

  try {
    const products = await loadProducts();
    renderProducts(products);
    statusText.textContent = `Načítaných produktov: ${products.length}`;
  } catch (error) {
    statusText.textContent = `Chyba: ${error.message}. Skúste to znova.`;
  } finally {
    // This runs after both success and failure, so loading can always be tried again.
    reloadButton.disabled = false;
  }
}

showProducts();