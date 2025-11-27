import {
  HomeView,
  ProductDetailsView,
  ProductListView,
  ShoppingCartView,
  CheckoutView,
  ConfirmationView,
} from "./views/index.js";
import { getCategories, getProductById } from "../api_service.js";

const pageContainer = document.getElementById("app");

const homePage = new HomeView();
const catDetails = new ProductListView();
const candyDetails = new ProductDetailsView();
const shoppingCartView = new ShoppingCartView();
const checkoutView = new CheckoutView();
const confirmationView = new ConfirmationView();

const viewMap = {
  homePage: homePage,
  catDetails: catDetails,
  candyDetails: candyDetails,
  shoppingCart: shoppingCartView,
  checkout: checkoutView,
  confirmation: confirmationView,
};

let cachedCategories = [];
const cartState = new Map();
const CART_STORAGE_KEY = "sukkergrisCart";
restoreCartFromStorage();

history.replaceState("homePage", "");
loadCategories();
navigateTo("homePage", false);

//-----------------------------------------------
window.addEventListener("popstate", function (event) {
  if (event.state && viewMap[event.state]) {
    navigateTo(event.state, false);
  }
});

//-----------------------------------------------

async function loadCategories() {
  try {
    let categories = [];
    const fetchedCategories = await getCategories();
    if (Array.isArray(fetchedCategories)) {
      categories = fetchedCategories;
    }

    cachedCategories = categories;

    homePage.refresh(categories);
  } catch (error) {
    console.log(error);
  }
}

//-----------------------------------------------

function navigateTo(view, push) {
  if (push) {
    history.pushState(view, "");
  }
  pageContainer.innerHTML = "";
  pageContainer.appendChild(viewMap[view]);
}

//-----------------------------------------------

pageContainer.addEventListener("categorySelected", function (evt) {
  handleCategorySelection(evt.detail);
});

//------------------------------------------------

async function handleCategorySelection(categoryDetail) {
  const categoryId = resolveCategoryId(categoryDetail);
  if (!categoryId) {
    console.warn("Could not find category id for:", categoryDetail);
    return;
  }

  try {
    const response = await fetch(
      `https://sukkergris.onrender.com/webshop/products?key=HJINAS11&category=${categoryId}`
    );
    const data = await response.json();
    console.log("Products:", data);
    catDetails.refresh(data, {
      emptyMessage: "No products in this category.",
    });
    navigateTo("catDetails", true);
  } catch (error) {
    console.log(error);
  }
}

//-----------------------------------------------

pageContainer.addEventListener("productListBack", function (evt) {
  navigateTo("homePage", true);
});

//-----------------------------------------------

pageContainer.addEventListener("productSelected", async function (evt) {
  const productId = evt.detail.id;
  try {
    const product = await getProductById(productId);
    const categoryName = getCategoryNameById(product?.catId);
    if (categoryName) {
      product.catName = categoryName;
    }
    console.log("Product details:", product);
    candyDetails.refresh(product);
    navigateTo("candyDetails", true);
  } catch (error) {
    console.log(error);
  }
});

//-----------------------------------------------

pageContainer.addEventListener("productDetailsBack", function (evt) {
  navigateTo("homePage", true);
});

//-----------------------------------------------

pageContainer.addEventListener("cartRequested", function () {
  showCartView(true);
});

pageContainer.addEventListener("checkoutRequested", function () {
  navigateTo("checkout", true);
});

pageContainer.addEventListener("navigate-confirmation", function () {
  navigateTo("confirmation", true);
});

pageContainer.addEventListener("navigate-home", function () {
  navigateTo("homePage", true);
});

pageContainer.addEventListener("addToCart", function (evt) {
  handleAddToCart(evt.detail?.product);
});

pageContainer.addEventListener("cartBack", function () {
  navigateTo("homePage", true);
});

pageContainer.addEventListener("cartQuantityChanged", function (evt) {
  const productId = evt.detail?.productId;
  const quantity = evt.detail?.quantity;
  if (productId == null) {
    return;
  }
  const productKey = String(productId);
  const entry = cartState.get(productKey);
  if (!entry) {
    return;
  }
  const normalized = Math.max(1, Math.floor(Number(quantity) || 1));
  cartState.set(productKey, {
    product: entry.product,
    quantity: normalized,
  });
  persistCart();
  refreshCartView();
});

pageContainer.addEventListener("cartItemRemoved", function (evt) {
  const productId = evt.detail?.productId;
  if (productId == null) {
    return;
  }
  removeProductFromCart(productId);
});

pageContainer.addEventListener("cartClearRequested", function () {
  if (cartState.size === 0) {
    return;
  }
  cartState.clear();
  persistCart();
  refreshCartView();
});

pageContainer.addEventListener("searchSubmitted", function (evt) {
  const searchTerm = evt.detail.searchTerm?.trim() ?? "";
  if (!searchTerm) {
    catDetails.refresh([], {
      emptyMessage: "Enter a search term to start a search.",
    });
    navigateTo("catDetails", true);
    return;
  }

  handleSearch(searchTerm);
});

//------------------------------------------------

function resolveCategoryId(category) {
  return (
    category?.id ??
    category?.category_id ??
    category?.categoryId ??
    category?.cat_id ??
    null
  );
}

//------------------------------------------------

async function handleSearch(searchTerm) {
  try {
    const searchParam = encodeURIComponent(searchTerm);
    const response = await fetch(
      `https://sukkergris.onrender.com/webshop/products?key=HJINAS11&search=${searchParam}`
    );
    const data = await response.json();
    console.log(`Search results for "${searchTerm}":`, data);

    catDetails.refresh(data, {
      emptyMessage: `No products found for «${searchTerm}».`,
    });
    navigateTo("catDetails", true);
  } catch (error) {
    console.log(error);
    catDetails.refresh([], {
      emptyMessage: "Unable to fetch search results. Please try again later.",
    });
    navigateTo("catDetails", true);
  }
}

//------------------------------------------------

function getCategoryNameById(catId) {
  if (catId == null) return null;
  const idToMatch = String(catId);
  const match = cachedCategories.find(
    (category) => String(resolveCategoryId(category)) === idToMatch
  );
  if (match && match.catName) return match.catName;
}

//------------------------------------------------

function handleAddToCart(product) {
  if (!product) {
    return;
  }
  addProductToCart(product);
  showCartView(true);
}

//------------------------------------------------

function addProductToCart(product) {
  const productId = resolveProductId(product);
  if (!productId) {
    return;
  }
  const productKey = String(productId);
  const existingEntry = cartState.get(productKey);
  if (existingEntry) {
    cartState.set(productKey, {
      product: { ...existingEntry.product, ...product },
      quantity: existingEntry.quantity + 1,
    });
  } else {
    cartState.set(productKey, {
      product,
      quantity: 1,
    });
  }
  persistCart();
}

//------------------------------------------------

function removeProductFromCart(productId) {
  const productKey = String(productId);
  if (!cartState.has(productKey)) {
    return;
  }
  cartState.delete(productKey);
  persistCart();
  refreshCartView();
}

//------------------------------------------------

function showCartView(push) {
  refreshCartView();
  navigateTo("shoppingCart", push);
}

//------------------------------------------------

function refreshCartView() {
  const cartItems = collectCartItems();
  shoppingCartView.refresh(cartItems);
}

//------------------------------------------------

function collectCartItems() {
  return Array.from(cartState.entries()).map(
    ([productKey, { product, quantity }]) => ({
      productNumber: productKey,
      name: product?.name ?? "Produkt",
      quantity: quantity ?? 0,
      price: resolvePrice(product?.price),
      stock: resolveStock(product?.stock),
      expectedShipping: resolveExpectedShipping(product),
    })
  );
}

//------------------------------------------------

function persistCart() {
  localStorage.setItem(
    CART_STORAGE_KEY,
    JSON.stringify([...cartState.entries()])
  );
}

//------------------------------------------------

function restoreCartFromStorage() {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  if (!raw) return;
  JSON.parse(raw).forEach(([key, entry]) => cartState.set(key, entry));
  refreshCartView();
}

//------------------------------------------------

function resolveProductId(product) {
  return (
    product?.id ??
    product?.productNumber ??
    product?.product_id ??
    product?.productId ??
    null
  );
}

//------------------------------------------------

function resolvePrice(value) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }
  return 0;
}

//------------------------------------------------

function resolveStock(value) {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue)) {
    return numericValue;
  }
  return 0;
}

//------------------------------------------------

function resolveExpectedShipping(product) {
  return (
    product?.expected_shipped ??
    product?.expectedShipped ??
    product?.expected_shipping ??
    null
  );
}
