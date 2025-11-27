import { sanitizeString } from "../../../utils.js";

const templateURL = new URL("./admin_product_views.html", import.meta.url);

//--------------------------------------------

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Could not load template from ${url}`);
  }
  const html = await response.text();
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

const productViewTemplate = await loadTemplate(templateURL);
const productViewStylesURL = new URL("./admin_product_views.css", import.meta.url);
export class CategoryView extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = productViewTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = productViewStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.productList = this.shadow.querySelector("[data-product-list]");
    
    const backButton = this.shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => this.handleBackClick());
    }
  }

//--------------------------------------------

  refresh(data) {
    if (!data || !this.productList) {
      return;
    }

    this.productList.innerHTML = "";
    for (let value of data) {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `

                <h2>${sanitizeString(value.catName)}</h2>

                <p>${sanitizeString(value.catDescr)}</p>
                <button class="edit-button" data-category-id="${value.id}">Edit</button>
            `;
      this.productList.appendChild(div);

      const editButton = div.querySelector(".edit-button");
      editButton.addEventListener("click", (evt) => {
        evt.stopPropagation();

        const editEvt = new CustomEvent("category-edit", {
          composed: true,
          bubbles: true,
        });
        editEvt.categoryData = value;
        this.shadow.dispatchEvent(editEvt);
      });
    }
  }

//--------------------------------------------

  handleBackClick() {

    const backEvent = new CustomEvent("category-back", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(backEvent);
  }
}
export class ProductView extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = productViewTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = productViewStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.productList = this.shadow.querySelector("[data-product-list]");
    
    const backButton = this.shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => this.handleBackClick());
    }
  }

//--------------------------------------------

  refresh(data) {
    if (!data || !this.productList) {
      return;
    }

    this.productList.innerHTML = "";
    for (let value of data) {
      const div = document.createElement("div");
      div.className = "product-card";
      div.innerHTML = `

                <h2>${sanitizeString(value.name)}</h2>

                <p>${sanitizeString(value.descr)}</p><hr>

                <p>kr ${sanitizeString(value.price)},-</p>
            `;
      this.productList.appendChild(div);
    }
  }

//--------------------------------------------

  handleBackClick() {

    const backEvent = new CustomEvent("product-back", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(backEvent);
  }
}
export class ProductForm extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();

    this.shadow = this.attachShadow({ mode: "open" });
    this.shadow.innerHTML = `
            <h2>Add product</h2>
            <hr>
            <form id="theForm">
                <input name="name" placeholder="Product name"><br>
                <input name="description" placeholder="description"><br>
                <input name="category_id" placeholder="Category ID (1-7)"><br>
                <input name="details" placeholder="Details"><br>
                <input name="price" placeholder="Price"><br>
                <input name="thumb" type="file"><br><hr>
                
                <input type="submit" value="Add dummy product">
            </form>
        `;
    const theForm = this.shadow.querySelector("#theForm");

    theForm.addEventListener("submit", (evt) => {
      evt.preventDefault();

      const addProdEvent = new CustomEvent("addproduct", {
        composed: true,
        bubbles: true,
      });
      addProdEvent.productForm = new FormData(theForm);
      this.shadow.dispatchEvent(addProdEvent);
    });
  }
}
customElements.define("category-view", CategoryView);
customElements.define("product-view", ProductView);
customElements.define("product-form", ProductForm);
