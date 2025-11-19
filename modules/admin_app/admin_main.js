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
import { AdminOverviewView } from "./views/admin-oversikt-view/admin_oversikt.js";
import { showMessage } from "../msg_handler.js";

const app = document.getElementById("app");

const oversiktView = new AdminOverviewView();
app.appendChild(oversiktView);

app.addEventListener("admin-navigate", async function (evt) {
  const section = evt.detail.section;
  console.log("Navigerer til:", section);
  
  // Senere: håndter products, users, orders, comments her
});

// Gammel kode - beholdes for senere bruk med products
/*
const catView = new CategoryView();
const prodView = new ProductView();
const prodForm = new ProductForm();

catView.addEventListener("categoryselect", async function (evt) {
  const categoryId = evt.categoryData.id;
  const products = await getProductsByCategory(categoryId);
  prodView.refresh(products);
});

prodForm.addEventListener("addproduct", async function (evt) {
  const result = await addProduct(evt.productForm);
  if (result) {
    showMessage("Insert OK!");
  }
});
*/
