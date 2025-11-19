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
  
  if (section === "products") {
    try {
      app.innerHTML = "";
      
      const catView = new CategoryView();
      const categories = await getCategories();
      console.log("Categories loaded:", categories);
      catView.refresh(categories);
      app.appendChild(catView);
      
      catView.addEventListener("category-back", function () {
        app.innerHTML = "";
        app.appendChild(oversiktView);
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      showMessage("Feil ved lasting av kategorier");
    }
  }
  
  // Senere: håndter users, orders, comments her
});
