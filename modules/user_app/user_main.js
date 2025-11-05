import { categoryView, productDetails, productListView } from "../productView.js";

const pageContainer = document.getElementById("app");

const homePage = new categoryView();
const catDetails = new productListView();
const candyDetails = new productDetails();

const viewMap = {
  homePage: homePage,
  catDetails: catDetails,
  candyDetails: candyDetails,
};

const categoryURL = "https://sukkergris.onrender.com/webshop/categories?key=HJINAS11";

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

pageContainer.addEventListener("categorySelected", async function (evt) {
  const categoryId = evt.detail.id;
  try {
    const response = await fetch(
      `https://sukkergris.onrender.com/webshop/products?key=HJINAS11&category=${categoryId}`
    );
    const data = await response.json();
    console.log("Products:", data);
    catDetails.refresh(data);
    navigateTo("catDetails", true);
  } catch (error) {
    console.log(error);
  }
});

//-----------------------------------------------

pageContainer.addEventListener("productListBack", function (evt) {
  navigateTo("homePage", true);
});

//-----------------------------------------------

pageContainer.addEventListener("productSelected", async function (evt) {
  const productId = evt.detail.id;
  try {
    const response = await fetch(`https://sukkergris.onrender.com/webshop/product?key=HJINAS11&id=${productId}`);
    const data = await response.json();
    console.log("Product details:", data);
    candyDetails.refresh(data);
    navigateTo("candyDetails", true);
  } catch (error) {
    console.log(error);
  }
});

//-----------------------------------------------

pageContainer.addEventListener("productDetailsBack", function (evt) {
  navigateTo("catDetails", true);
});