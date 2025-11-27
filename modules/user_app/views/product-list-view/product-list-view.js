const templateURL = new URL("./product-list-view.html", import.meta.url);

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

const productListTemplate = await loadTemplate(templateURL);
const productListStylesURL = new URL(
  "./product-list-view.css",
  import.meta.url
);

class ProductListView extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = productListTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = productListStylesURL.href;
    this.shadow.append(styleLink, fragment);

    this.productListContainer = this.shadow.querySelector(
      "[data-product-list]"
    );

    const backButton = this.shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => this.handleBackClick());
    }

    const cartButton = this.shadow.querySelector("[data-cart-button]");
    if (cartButton) {
      cartButton.addEventListener("click", () => this.handleCartClick());
    }
  }

//--------------------------------------------

  refresh(products = [], options = {}) {
    const { emptyMessage = "No products to show." } = options;

    if (!this.productListContainer) {
      return;
    }

    this.productListContainer.innerHTML = "";

    if (!Array.isArray(products) || products.length === 0) {
      this.productListContainer.innerHTML = `<p class="empty-state">${emptyMessage}</p>`;
      return;
    }

    products.forEach((product) => {
      const productCard = document.createElement("article");
      productCard.className = "product-card";
      productCard.innerHTML = `
        <img src="http://sukkergris.onrender.com/images/GFTPOE21/small/${product.thumb}" alt="${product.name}" />
        <h3>${product.name}</h3>
        <p>${product.heading}</p>
        <p>Pris: ${product.price} kr</p>
      `;

      productCard.addEventListener("click", () => {

        const productSelected = new CustomEvent("productSelected", {
          composed: true,
          bubbles: true,
          detail: { id: product.id },
        });
        this.shadow.dispatchEvent(productSelected);
      });

      this.productListContainer.appendChild(productCard);
    });
  }

//--------------------------------------------

  handleBackClick() {

    const productListBack = new CustomEvent("productListBack", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(productListBack);
  }

//--------------------------------------------

  handleCartClick() {

    const cartRequested = new CustomEvent("cartRequested", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(cartRequested);
  }
}

customElements.define("product-list-view", ProductListView);

export { ProductListView };
