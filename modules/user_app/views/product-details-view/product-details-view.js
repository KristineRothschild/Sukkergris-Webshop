const stylesURL = new URL("./product-details-view.css", import.meta.url);
const templateHTML = `
  <link rel="stylesheet" href="${stylesURL.href}">
  <section class="product-details">
    <div class="product-details__header">
      <button class="back-button" type="button" data-back-button>Home</button>
    </div>
    <div class="product-details__content" data-product-details></div>
  </section>
`;

class ProductDetailsView extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = templateHTML;

    this.wrapper = shadow.querySelector("[data-product-details]");

    const backButton = shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => this.emitBack());
    }
  }

//--------------------------------------------

  refresh(product) {
    if (!this.wrapper) {
      return;
    }

    if (!product) {
      this.wrapper.innerHTML =
        '<p class="empty-state">Product information missing.</p>';
      return;
    }

    let imageUrl = "";
    if (product.image) {
      imageUrl = `https://sukkergris.onrender.com/images/GFTPOE21/large/${product.image}`;
    } else if (product.thumb) {
      imageUrl = `https://sukkergris.onrender.com/images/GFTPOE21/large/${product.thumb}`;
    }
    const productName = product.name || "Product";
    let imageBlock = "";
    if (imageUrl) {
      imageBlock = `
        <div class="product-details__media">
          <img src="${imageUrl}" alt="${productName}" />
        </div>
      `;
    }

    let priceText = "-";
    if (product.price || product.price === 0) {
      priceText = product.price;
    }

    let availabilityMarkup = "";
    const stockValue = Number(product.stock || 0);
    if (stockValue > 0) {
      availabilityMarkup = `<p class="product-details__stock"><strong>In stock:</strong> ${stockValue}</p>`;
    } else {
      let deliveryLabel = "<strong>Estimated delivery:</strong> Not available";
      const shipDate = product.expected_shipped;
      if (shipDate) {
        const shipDateObj = new Date(shipDate);
        const formattedShipDate = shipDateObj.toLocaleDateString("no-NO");
        deliveryLabel = `<strong>Estimated delivery:</strong> ${formattedShipDate}`;
      }
      availabilityMarkup = `<p class="product-details__stock">${deliveryLabel}</p>`;
    }

    let ratingMarkup = "";
    const ratingNumber = Number(product.rating || 0);
    if (!Number.isNaN(ratingNumber) && ratingNumber > 0) {
      let clampedRating = Math.round(ratingNumber);
      if (clampedRating < 1) {
        clampedRating = 1;
      }
      if (clampedRating > 5) {
        clampedRating = 5;
      }
      const filledStars = "★★★★★".slice(0, clampedRating);
      const emptyStars = "☆☆☆☆☆".slice(clampedRating);
      const starMarkup = `<span class="product-details__rating-stars">${filledStars}${emptyStars}</span>`;
      ratingMarkup = `<p class="product-details__rating" aria-label="Rating ${clampedRating} of 5"><strong>Rating:</strong> ${starMarkup}</p>`;
    }

    const actionsMarkup = `
      <div class="product-details__actions">
        <button class="buy-now-button" type="button" data-add-to-cart>
          Buy this item
        </button>
        <button class="buy-now-button" type="button" data-go-to-cart>
          Go to shopping cart
        </button>
      </div>
    `;

    this.wrapper.innerHTML = `
      ${imageBlock}
      <h2>${product.name}</h2>
      <p><strong>Category:</strong> ${product.catName}</p>
      <p><strong>${product.heading}</strong></p>
      <p><i>${product.description}</i></p>
      ${ratingMarkup}
      <p><strong>Price:</strong> ${priceText} kr</p>
      ${availabilityMarkup}
      ${actionsMarkup}
    `;

    const media = this.wrapper.querySelector(".product-details__media");
    const discountValue = Number(product.discount || 0);
    if (media && discountValue > 0) {
      const badge = document.createElement("span");
      badge.className = "discount-badge";
      badge.textContent = `-${discountValue}%`;
      media.appendChild(badge);
    }

    const addToCartButton = this.wrapper.querySelector("[data-add-to-cart]");
    if (addToCartButton) {
      addToCartButton.addEventListener("click", () =>
        this.emitAddToCart(product)
      );
    }

    const goToCartButton = this.wrapper.querySelector("[data-go-to-cart]");
    if (goToCartButton) {
      goToCartButton.addEventListener("click", () => this.emitCartRequested());
    }
  }

//--------------------------------------------

  emitBack() {

    const productDetailsBack = new CustomEvent("productDetailsBack", {
      composed: true,
      bubbles: true,
    });
    this.dispatchEvent(productDetailsBack);
  }

//--------------------------------------------

  emitAddToCart(product) {

    const addToCartEvent = new CustomEvent("addToCart", {
      composed: true,
      bubbles: true,
      detail: { product },
    });
    this.dispatchEvent(addToCartEvent);
  }

//--------------------------------------------

  emitCartRequested() {

    const cartRequested = new CustomEvent("cartRequested", {
      composed: true,
      bubbles: true,
    });
    this.dispatchEvent(cartRequested);
  }
}

customElements.define("product-details-view", ProductDetailsView);

export { ProductDetailsView };
