import {
  HomeView,
  ProductDetailsView,
  ProductListView,
} from "./views/index.js";
import { getProductById } from "../api_service.js";

const pageContainer = document.getElementById("app");

const homePage = new HomeView();
const catDetails = new ProductListView();
const candyDetails = new ProductDetailsView();

const viewMap = {
  homePage: homePage,
  catDetails: catDetails,
  candyDetails: candyDetails,
};

const categoryURL =
  "https://sukkergris.onrender.com/webshop/categories?key=HJINAS11";

history.replaceState("homePage", "");
loadCategories();
navigateTo("homePage", false);

//-----------------------------------------------

async function loadCategories() {
  try {
    const response = await fetch(categoryURL);
    const data = await response.json();

    homePage.refresh(data);
    console.log(data);
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
    console.log("Product details:", product);
    candyDetails.refresh(product);
    navigateTo("candyDetails", true);
  } catch (error) {
    console.log(error);
  }
});

//-----------------------------------------------

pageContainer.addEventListener("productDetailsBack", function (evt) {
  navigateTo("catDetails", true);
});

//-----------------------------------------------

pageContainer.addEventListener("cartRequested", function () {
  console.log("Cart requested!");
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
