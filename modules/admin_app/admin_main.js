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
import { AdminOrdersView } from "./views/admin-orders-view/admin-orders.js";
import { AdminLoginView } from "./views/login-view/log_in.js";
import { EditProductView } from "./views/edit_product-view/edit_product.js";
import { showMessage } from "../msg_handler.js";

const app = document.getElementById("app");

function showLoginView() {
  app.innerHTML = "";
  const loginView = new AdminLoginView();
  app.appendChild(loginView);
}

// Start with login page
showLoginView();

const oversiktView = new AdminOverviewView();

// Listen for successful login
document.addEventListener("admin-login-success", function () {
  app.innerHTML = "";
  app.appendChild(oversiktView);
});

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

      // Handle edit button clicks
      catView.addEventListener("category-edit", function (evt) {
        const categoryData = evt.categoryData;
        console.log("Edit category:", categoryData);

        try {
          app.innerHTML = "";
          const editView = new EditProductView();
          if (categoryData) {
            editView.categoryData = categoryData;
          }
          app.appendChild(editView);
        } catch (error) {
          console.error("Error loading edit product view:", error);
          showMessage("Feil ved lasting av redigeringsside");
        }
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      showMessage("Feil ved lasting av kategorier");
    }
  }

  if (section === "orders") {
    try {
      app.innerHTML = "";

      const ordersView = new AdminOrdersView();
      app.appendChild(ordersView);

      ordersView.addEventListener("orders-back", function () {
        app.innerHTML = "";
        app.appendChild(oversiktView);
      });
    } catch (error) {
      console.error("Error loading orders:", error);
      showMessage("Feil ved lasting av bestillinger");
    }
  }

  // Senere: håndter users, comments her
});

// Listen for back from edit product page
document.addEventListener("edit-product-back", async function () {
  try {
    app.innerHTML = "";

    const catView = new CategoryView();
    const categories = await getCategories();
    catView.refresh(categories);
    app.appendChild(catView);

    catView.addEventListener("category-back", function () {
      app.innerHTML = "";
      app.appendChild(oversiktView);
    });

    catView.addEventListener("category-edit", function (evt) {
      const categoryData = evt.categoryData;
      console.log("Edit category:", categoryData);

      try {
        app.innerHTML = "";
        const editView = new EditProductView();
        if (categoryData) {
          editView.categoryData = categoryData;
        }
        app.appendChild(editView);
      } catch (error) {
        console.error("Error loading edit product view:", error);
        showMessage("Feil ved lasting av redigeringsside");
      }
    });
  } catch (error) {
    console.error("Error returning to categories:", error);
    showMessage("Feil ved lasting av kategorier");
  }
});
