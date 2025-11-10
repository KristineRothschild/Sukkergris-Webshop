const templateURL = new URL("./product-details-view.html", import.meta.url);
async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Klarte ikke å laste template fra ${url}`);
  }
  const html = await response.text();
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

const productDetailsTemplate = await loadTemplate(templateURL);
const productDetailsStylesURL = new URL(
  "./product-details-view.css",
  import.meta.url
);

class ProductDetailsView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = productDetailsTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = productDetailsStylesURL.href;
    this.shadow.append(styleLink, fragment);

    this.wrapper = this.shadow.querySelector("[data-product-details]");

    const backButton = this.shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => this.handleBackClick());
    }
  }

  //------------------------------------------------

  refresh(product) {
    if (!this.wrapper) {
      return;
    }

    if (!product) {
      this.wrapper.innerHTML =
        '<p class="empty-state">Product information missing.</p>';
      return;
    }

    const imageFile = product.image ?? product.thumb ?? "";
    const imageUrl = imageFile
      ? `https://sukkergris.onrender.com/images/GFTPOE21/large/${imageFile}`
      : "";
    const description = product.description ?? product.descr ?? "-";

    this.wrapper.innerHTML = `
      ${
        imageUrl
          ? `<img src="${imageUrl}" alt="${product.name ?? "Product"}" />`
          : ""
      }
      <h2>${product.name ?? "Product"}</h2>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Price:</strong> ${product.price ?? "-"} kr</p>
    `;
  }

  //------------------------------------------------

  handleBackClick() {
    const productDetailsBack = new CustomEvent("productDetailsBack", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(productDetailsBack);
  }
}

customElements.define("product-details-view", ProductDetailsView);

export { ProductDetailsView };
