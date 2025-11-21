const templateURL = new URL("./confirmation.html", import.meta.url);

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

const confirmationTemplate = await loadTemplate(templateURL);
const confirmationStylesURL = new URL("./confirmation.css", import.meta.url);

class ConfirmationView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = confirmationTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = confirmationStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.registerEventListeners();
  }

  // -----------------------------------------------------
  
  saveOrderToStorage(orderData) {
    try {
      // Get existing orders from localStorage
      const existingOrders = localStorage.getItem("orders");
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      
      // Add the new order with timestamp
      const orderWithDate = {
        ...orderData,
        orderDate: new Date().toISOString()
      };
      
      orders.push(orderWithDate);
      
      // Save back to localStorage
      localStorage.setItem("orders", JSON.stringify(orders));
      console.log("Order saved to localStorage:", orderWithDate);
    } catch (error) {
      console.error("Error saving order to localStorage:", error);
    }
  }
  
  displayOrder(orderData) {
    if (!orderData) return;

    // Save order to localStorage for admin view
    this.saveOrderToStorage(orderData);

    // ---------------------------------------------------

    const orderNumberEl = this.shadow.querySelector("[data-order-number]");
    if (orderNumberEl && orderData.orderNumber) {
      orderNumberEl.textContent = `#${orderData.orderNumber}`;
    }

    // --------------------------------------------------

    if (orderData.customer) {
      const nameEl = this.shadow.querySelector("[data-customer-name]");
      const emailEl = this.shadow.querySelector("[data-customer-email]");
      const phoneEl = this.shadow.querySelector("[data-customer-phone]");
      const addressEl = this.shadow.querySelector("[data-customer-address]");

      if (nameEl) nameEl.textContent = orderData.customer.name || "-";
      if (emailEl) emailEl.textContent = orderData.customer.email || "-";
      if (phoneEl) phoneEl.textContent = orderData.customer.phone || "-";
      if (addressEl) addressEl.textContent = orderData.customer.address || "-";
    }

    // Set shipping information
    const shippingMethodEl = this.shadow.querySelector("[data-shipping-method]");
    const shippingDateEl = this.shadow.querySelector("[data-shipping-date]");
    
    if (shippingMethodEl && orderData.shippingMethod) {
      shippingMethodEl.textContent = orderData.shippingMethod;
    }
    if (shippingDateEl && orderData.estimatedShippingDate) {
      shippingDateEl.textContent = orderData.estimatedShippingDate;
    }

    //----------------------------------------------------

    const receiptItemsContainer = this.shadow.querySelector("[data-receipt-items]");
    const subtotalEl = this.shadow.querySelector("[data-subtotal]");
    const shippingCostEl = this.shadow.querySelector("[data-shipping-cost]");
    const totalAmountEl = this.shadow.querySelector("[data-total-amount]");
    
    if (!receiptItemsContainer || !Array.isArray(orderData.items)) {
      return;
    }

    receiptItemsContainer.innerHTML = "";
    let subtotal = 0;

    orderData.items.forEach((item) => {
      const itemDiv = document.createElement("div");
      itemDiv.className = "receipt-item";

      const itemInfo = document.createElement("div");
      itemInfo.className = "receipt-item-info";

      const itemName = document.createElement("p");
      itemName.className = "receipt-item-name";
      itemName.textContent = item.name || "Product";

      const itemNumber = document.createElement("p");
      itemNumber.className = "receipt-item-number";
      itemNumber.textContent = `Product #${item.productNumber || "N/A"}`;

      const itemQuantity = document.createElement("p");
      itemQuantity.className = "receipt-item-quantity";
      itemQuantity.textContent = `Quantity: ${item.quantity || 1}`;

      itemInfo.appendChild(itemName);
      itemInfo.appendChild(itemNumber);
      itemInfo.appendChild(itemQuantity);

      const itemPrices = document.createElement("div");
      itemPrices.className = "receipt-item-prices";

      const unitPrice = document.createElement("span");
      unitPrice.className = "receipt-item-unit-price";
      unitPrice.textContent = `${(item.price || 0).toFixed(2)} kr/unit`;

      const totalPrice = document.createElement("span");
      totalPrice.className = "receipt-item-total-price";
      const itemTotal = (item.price || 0) * (item.quantity || 1);
      totalPrice.textContent = `${itemTotal.toFixed(2)} kr`;
      subtotal += itemTotal;

      itemPrices.appendChild(unitPrice);
      itemPrices.appendChild(totalPrice);

      itemDiv.appendChild(itemInfo);
      itemDiv.appendChild(itemPrices);
      receiptItemsContainer.appendChild(itemDiv);
    });

    // -----------------------------------------------

    const shippingCost = orderData.shippingCost || 0;
    const total = subtotal + shippingCost;

    if (subtotalEl) {
      subtotalEl.textContent = `${subtotal.toFixed(2)} kr`;
    }
    if (shippingCostEl) {
      shippingCostEl.textContent = `${shippingCost.toFixed(2)} kr`;
    }
    if (totalAmountEl) {
      totalAmountEl.textContent = `${total.toFixed(2)} kr`;
    }
  }

  registerEventListeners() {
    const homeLink = this.shadow.querySelector(".nav-link");
    if (homeLink) {
      homeLink.addEventListener("click", (e) => {
        e.preventDefault();
        const homeEvent = new CustomEvent("navigate-home", {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(homeEvent);
      });
    }

    const cartButton = this.shadow.querySelector(".cart-button");
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        const cartEvent = new CustomEvent("navigate-cart", {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(cartEvent);
      });
    }
  }
}

customElements.define("confirmation-view", ConfirmationView);
export { ConfirmationView };