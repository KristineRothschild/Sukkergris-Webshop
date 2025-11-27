import { getCategories } from "../api_service.js";

import { CategoryView } from "./views/category-view/admin_product_views.js";
import { AdminOverviewView } from "./views/admin-oversikt-view/admin_oversikt.js";
import { AdminOrdersView } from "./views/admin-orders-view/admin-orders.js";
import { AdminLoginView } from "./views/login-view/log_in.js";
import { EditProductView } from "./views/edit_product-view/edit_product.js";
import { showMessage } from "../msg_handler.js";

const app = document.getElementById("app");

//------------------------------------------------

function showLoginView() {
  app.innerHTML = "";
  const loginView = new AdminLoginView();
  app.appendChild(loginView);
}

//------------------------------------------------

showLoginView();

const oversiktView = new AdminOverviewView();

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
      catView.refresh(categories);
      app.appendChild(catView);

      catView.addEventListener("category-back", function () {
        app.innerHTML = "";
        app.appendChild(oversiktView);
      });

      catView.addEventListener("category-edit", function (evt) {
        const categoryData = evt.categoryData;

        try {
          app.innerHTML = "";
          const editView = new EditProductView();
          if (categoryData) {
            editView.categoryData = categoryData;
          }
          app.appendChild(editView);
        } catch (error) {
          console.error("Error loading edit product view:", error);
          showMessage("Error loading edit product view");
        }
      });
    } catch (error) {
      console.error("Error loading categories:", error);
      showMessage("Error loading categories");
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
      showMessage("Error loading orders");
    }
  }
});

//------------------------------------------------

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

      try {
        app.innerHTML = "";
        const editView = new EditProductView();
        if (categoryData) {
          editView.categoryData = categoryData;
        }
        app.appendChild(editView);
      } catch (error) {
        console.error("Error loading edit product view:", error);
        showMessage("Error loading edit product view");
      }
    });
  } catch (error) {
    console.error("Error returning to categories:", error);
    showMessage("Error returning to categories");
  }
});
