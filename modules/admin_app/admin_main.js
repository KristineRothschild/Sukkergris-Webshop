import {
  getCategories,
  getAllProducts,
  addProduct,
  getProductsByCategory,
} from "../api_service.js";

import {
  CategoryView,
  ProductForm,
  ProductView,
} from "./views/category-view/admin_product_views.js";
import { showMessage } from "../msg_handler.js";



//init -------------------------------------------
const catView = new CategoryView();
const prodView = new ProductView();
const prodForm = new ProductForm();

const viewMap = {
  catview: catView,
  prodview: prodView,
  prodform: prodForm,
};
const viewContainer = document.getElementById("viewContainer");
const btnAddProd = document.getElementById("btnAddProd");
const btnHome = document.getElementById("btnHome");

//show categories at startup
const categories = await getCategories();
catView.refresh(categories);
navigateTo("catview");

//------------------------------------------------
function navigateTo(viewName) {
  viewContainer.innerHTML = "";
  viewContainer.appendChild(viewMap[viewName]);
}

//------------------------------------------------
btnHome.addEventListener("click", function (evt) {
  navigateTo("catview");
});

//------------------------------------------------
btnAddProd.addEventListener("click", function (evt) {
  navigateTo("prodform");
});

//------------------------------------------------
catView.addEventListener("categoryselect", async function (evt) {
  const categoryId = evt.categoryData.id;
  const products = await getProductsByCategory(categoryId);
  prodView.refresh(products);
  navigateTo("prodview");
});

//------------------------------------------------
prodForm.addEventListener("addproduct", async function (evt) {
  const result = await addProduct(evt.productForm);
  if (result) {
    showMessage("Insert OK!");
  }
});
