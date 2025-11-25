const templateURL = new URL("./shopping-cart-view.html", import.meta.url);

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

const cartTemplate = await loadTemplate(templateURL);
const cartStylesURL = new URL("./shopping-cart-view.css", import.meta.url);

class ShoppingCartView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = cartTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = cartStylesURL.href;
    this.shadow.append(styleLink, fragment);

    this.contentTarget = this.shadow.querySelector("[data-cart-content]");
    const closeButton = this.shadow.querySelector("[data-close-cart]");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.emitBack());
    }
    this.shadow.addEventListener("change", (event) =>
      this.handleQuantityChange(event)
    );
    this.shadow.addEventListener("click", (event) => {
      this.handleRemoveClick(event);
      this.handleQuantityButtonClick(event);
    });
  }

  //------------------------------------------------

  refresh(items = []) {
    const hasItems = Array.isArray(items) && items.length > 0;
    if (!this.contentTarget) {
      return;
    }

    if (!hasItems) {
      this.contentTarget.innerHTML =
        '<p class="empty-state">Your shopping cart is empty.</p>';
      return;
    }

    const table = document.createElement("table");
    table.className = "cart-table";
    table.innerHTML = `
      <thead>
        <tr>
          <th>Product name & ID</th>
          <th>Price (per item)</th>
          <th>Total</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement("tbody");
    let grandTotal = 0;

    items.forEach((item) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = this.resolveNumber(item.price);
      const rowTotal = unitPrice * quantity;
      grandTotal += rowTotal;
      const stockValue = Number(item.stock) || 0;
      const shippingLabel = this.resolveShippingLabel(item.expectedShipping);
      const noteMarkup =
        stockValue > 0
          ? ""
          : shippingLabel
          ? `<div class="cart-line-note">Expected shipping: ${shippingLabel}</div>`
          : `<div class="cart-line-note cart-line-note--missing">Not in stock</div>`;
      const productId = item.productNumber ?? "";
      const displayNumber = productId || "-";
      const productName = item.name ?? "Product";

      const row = document.createElement("tr");
      row.innerHTML = `
        ${this.renderProductCell({
          displayNumber,
          productName,
          noteMarkup,
          productId,
          quantity,
        })}
        <td>${this.formatCurrency(unitPrice)}</td>
        <td>${this.formatCurrency(rowTotal)}</td>
      `;
      tbody.appendChild(row);
    });

    table.appendChild(tbody);

    const layout = document.createElement("div");
    layout.className = "cart-layout";

    const itemsColumn = document.createElement("div");
    itemsColumn.className = "cart-items";
    itemsColumn.appendChild(table);

    const summaryColumn = document.createElement("div");
    summaryColumn.className = "cart-summary";
    summaryColumn.innerHTML = `
      <div class="cart-summary__title">Total</div>
      <div class="cart-summary__amount">${this.formatCurrency(grandTotal)}</div>
    `;
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "cart-remove-button";
    clearButton.textContent = "Empty shopping cart";
    clearButton.addEventListener("click", () => this.emitClearCart());
    summaryColumn.appendChild(clearButton);

    const checkoutButton = document.createElement("button");
    checkoutButton.type = "button";
    checkoutButton.className = "cart-checkout-button";
    checkoutButton.textContent = "Proceed to checkout";
    summaryColumn.appendChild(checkoutButton);

    layout.append(itemsColumn, summaryColumn);

    this.contentTarget.innerHTML = "";
    this.contentTarget.append(layout);
  }

  //------------------------------------------------

  renderProductCell({
    displayNumber,
    productName,
    noteMarkup,
    productId,
    quantity,
  }) {
    return `
      <td class="cart-line-details">
        ${this.renderProductMeta(displayNumber, productName, noteMarkup)}
        ${this.renderLineFooter(productId, quantity)}
      </td>
    `;
  }

  //------------------------------------------------

  renderProductMeta(displayNumber, productName, noteMarkup) {
    return `
      <div class="cart-line-name">
        <span class="cart-line-number">${displayNumber}</span>
        <span>${productName}</span>
        ${noteMarkup}
      </div>
    `;
  }

  //------------------------------------------------

  renderLineFooter(productId, quantity) {
    return `
      <div class="cart-line-footer">
        ${this.renderQuantityControl(productId, quantity)}
        ${this.renderRemoveButton(productId)}
      </div>
    `;
  }

  //------------------------------------------------

  renderQuantityControl(productId, quantity) {
    return `
      <div class="cart-quantity-control" data-quantity-control>
        ${this.renderQuantityButton({
          action: "decrease",
          label: "–",
          aria: "Decrease quantity",
        })}
        <input
          type="number"
          min="1"
          step="1"
          value="${quantity}"
          class="cart-quantity-input"
          data-quantity-input
          data-product-id="${productId}"
          aria-label="Quantity"
          readonly
        />
        ${this.renderQuantityButton({
          action: "increase",
          label: "+",
          aria: "Increase quantity",
        })}
      </div>
    `;
  }

  //------------------------------------------------

  renderQuantityButton({ action, label, aria }) {
    return `
      <button
        type="button"
        class="cart-quantity-button"
        data-quantity-${action}
        aria-label="${aria}"
      >
        ${label}
      </button>
    `;
  }

  //------------------------------------------------

  renderRemoveButton(productId) {
    return `
      <button
        type="button"
        class="cart-remove-link"
        data-remove-item
        data-product-id="${productId}"
      >
        Remove item
      </button>
    `;
  }

  //------------------------------------------------

  handleQuantityChange(event) {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }
    if (!target.matches("[data-quantity-input]")) {
      return;
    }
    const productId = target.getAttribute("data-product-id");
    if (!productId) {
      return;
    }
    const normalized = Math.max(1, Math.floor(Number(target.value) || 1));
    target.value = String(normalized);
    this.emitQuantityUpdate(productId, normalized);
  }

  //------------------------------------------------

  handleRemoveClick(event) {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    const button = target.closest("[data-remove-item]");
    if (!button) {
      return;
    }
    const productId = button.getAttribute("data-product-id");
    if (!productId) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent("cartItemRemoved", {
        composed: true,
        bubbles: true,
        detail: { productId },
      })
    );
  }

  //------------------------------------------------

  emitBack() {
    const cartBack = new CustomEvent("cartBack", {
      composed: true,
      bubbles: true,
    });
    this.dispatchEvent(cartBack);
  }

  //------------------------------------------------

  handleQuantityButtonClick(event) {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    const control = target.closest("[data-quantity-control]");
    if (!control) {
      return;
    }
    const input = control.querySelector("[data-quantity-input]");
    if (!(input instanceof HTMLInputElement)) {
      return;
    }
    const productId = input.getAttribute("data-product-id");
    if (!productId) {
      return;
    }
    let current = Math.max(1, Math.floor(Number(input.value) || 1));
    if (target.matches("[data-quantity-decrease]")) {
      current = Math.max(1, current - 1);
    } else if (target.matches("[data-quantity-increase]")) {
      current += 1;
    } else {
      return;
    }
    input.value = String(current);
    this.emitQuantityUpdate(productId, current);
  }

  //------------------------------------------------

  emitQuantityUpdate(productId, quantity) {
    this.dispatchEvent(
      new CustomEvent("cartQuantityChanged", {
        composed: true,
        bubbles: true,
        detail: { productId, quantity },
      })
    );
  }

  //------------------------------------------------

  emitClearCart() {
    this.dispatchEvent(
      new CustomEvent("cartClearRequested", {
        composed: true,
        bubbles: true,
      })
    );
  }

  //------------------------------------------------

  resolveNumber(value) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
    return 0;
  }

  //------------------------------------------------

  formatCurrency(value) {
    const safeValue = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(safeValue);
  }

  //------------------------------------------------

  resolveShippingLabel(dateString) {
    if (!dateString) {
      return null;
    }
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date.toLocaleDateString("no-NO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
}

customElements.define("shopping-cart-view", ShoppingCartView);

export { ShoppingCartView };
