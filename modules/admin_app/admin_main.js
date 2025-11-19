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

// Load login page HTML
async function loadLoginPage() {
  const loginURL = new URL("./views/login-view/log_in.html", import.meta.url);
  const response = await fetch(loginURL);
  const html = await response.text();
  
  // Extract only the body content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const loginContainer = doc.querySelector('.login-container');
  
  app.innerHTML = '';
  app.appendChild(loginContainer);
  
  // Load and inject the login script
  const script = document.createElement('script');
  script.type = 'module';
  script.src = new URL('./views/login-view/log_in.js', import.meta.url).href;
  document.head.appendChild(script);
  
  // Load login CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = new URL('./views/login-view/log_in.css', import.meta.url).href;
  document.head.appendChild(link);
}

// Start with login page
loadLoginPage();

const oversiktView = new AdminOverviewView();

// Listen for successful login
document.addEventListener("admin-login-success", function () {
  // Remove login CSS to prevent style conflicts
  const loginCSS = document.querySelector('link[href*="log_in.css"]');
  if (loginCSS) {
    loginCSS.remove();
  }
  
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
      catView.addEventListener("category-edit", async function (evt) {
        const categoryData = evt.categoryData;
        console.log("Edit category:", categoryData);
        
        try {
          app.innerHTML = "";
          
          // Load edit product page
          const editURL = new URL("./views/edit_product-view/edit_product.html", import.meta.url);
          const response = await fetch(editURL);
          const html = await response.text();
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          const mainContent = doc.querySelector('main');
          const modalContent = doc.querySelector('#productModal');
          
          app.appendChild(mainContent);
          if (modalContent) {
            app.appendChild(modalContent);
          }
          
          // Load edit product CSS
          const editCSS = document.createElement('link');
          editCSS.rel = 'stylesheet';
          editCSS.href = new URL('./views/edit_product-view/edit_product.css', import.meta.url).href;
          document.head.appendChild(editCSS);
          
          // Load edit product script and initialize when loaded
          const editScript = document.createElement('script');
          editScript.type = 'module';
          editScript.src = new URL('./views/edit_product-view/edit_product.js', import.meta.url).href;
          editScript.onload = () => {
            // Manually trigger the initialization since DOMContentLoaded already fired
            const initEvent = new Event('DOMContentLoaded');
            document.dispatchEvent(initEvent);
          };
          document.head.appendChild(editScript);
          
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
  
  // Senere: håndter users, orders, comments her
});

// Listen for back from edit product page
document.addEventListener("edit-product-back", async function () {
  try {
    // Remove edit product CSS
    const editCSS = document.querySelector('link[href*="edit_product.css"]');
    if (editCSS) {
      editCSS.remove();
    }
    
    app.innerHTML = "";
    
    const catView = new CategoryView();
    const categories = await getCategories();
    catView.refresh(categories);
    app.appendChild(catView);
    
    catView.addEventListener("category-back", function () {
      app.innerHTML = "";
      app.appendChild(oversiktView);
    });
    
    catView.addEventListener("category-edit", async function (evt) {
      const categoryData = evt.categoryData;
      console.log("Edit category:", categoryData);
      
      try {
        app.innerHTML = "";
        
        const editURL = new URL("./views/edit_product-view/edit_product.html", import.meta.url);
        const response = await fetch(editURL);
        const html = await response.text();
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const mainContent = doc.querySelector('main');
        const modalContent = doc.querySelector('#productModal');
        
        app.appendChild(mainContent);
        if (modalContent) {
          app.appendChild(modalContent);
        }
        
        const editCSS = document.createElement('link');
        editCSS.rel = 'stylesheet';
        editCSS.href = new URL('./views/edit_product-view/edit_product.css', import.meta.url).href;
        document.head.appendChild(editCSS);
        
        const editScript = document.createElement('script');
        editScript.type = 'module';
        editScript.src = new URL('./views/edit_product-view/edit_product.js', import.meta.url).href;
        editScript.onload = () => {
          const initEvent = new Event('DOMContentLoaded');
          document.dispatchEvent(initEvent);
        };
        document.head.appendChild(editScript);
        
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
