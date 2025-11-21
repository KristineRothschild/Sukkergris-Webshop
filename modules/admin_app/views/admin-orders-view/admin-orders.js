const templateURL = new URL("./admin-orders.html", import.meta.url);

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

const adminOrdersTemplate = await loadTemplate(templateURL);
const adminOrdersStylesURL = new URL("./admin-orders.css", import.meta.url);

class AdminOrdersView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = adminOrdersTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = adminOrdersStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.ordersList = this.shadow.querySelector("[data-orders-list]");
    this.orderCount = this.shadow.querySelector("[data-order-count]");
    this.setupEventListeners();
  }

  // ----------------------------------------------------------------

  connectedCallback() {
    this.loadOrders();
  }

  // ----------------------------------------------------------------

  setupEventListeners() {
    const backButton = this.shadow.querySelector("[data-back-button]");
    if (backButton) {
      backButton.addEventListener("click", () => {
        const backEvent = new CustomEvent("orders-back", {
          bubbles: true,
          composed: true,
        });
        this.dispatchEvent(backEvent);
      });
    }
  }

  // ----------------------------------------------------------------

  loadOrders() {
    const orders = this.getOrdersFromStorage();
    this.displayOrders(orders);
  }

  // ----------------------------------------------------------------

  getOrdersFromStorage() {
    try {
      const ordersData = localStorage.getItem("orders");
      return ordersData ? JSON.parse(ordersData) : [];
    } catch (error) {
      console.error("Error loading orders from localStorage:", error);
      return [];
    }
  }

  // ----------------------------------------------------------------

  saveOrdersToStorage(orders) {
    try {
      localStorage.setItem("orders", JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
    }
  }

  // ----------------------------------------------------------------

  displayOrders(orders) {
    if (!this.ordersList) return;

    if (this.orderCount) {
      this.orderCount.textContent = orders.length;
    }

    this.ordersList.innerHTML = "";

    if (orders.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No orders yet";
      this.ordersList.appendChild(emptyState);
      return;
    }

    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(b.orderDate || 0) - new Date(a.orderDate || 0);
    });

    sortedOrders.forEach((order) => {
      const orderCard = this.createOrderCard(order);
      this.ordersList.appendChild(orderCard);
    });
  }

  // ----------------------------------------------------------------

  createOrderCard(order) {
    const card = document.createElement("div");
    card.className = "order-card";

    const header = document.createElement("div");
    header.className = "order-header";

    const orderInfo = document.createElement("div");
    orderInfo.className = "order-info";

    const orderNumber = document.createElement("h3");
    orderNumber.className = "order-number";
    orderNumber.textContent = `Order #${order.orderNumber || "N/A"}`;

    const orderDate = document.createElement("p");
    orderDate.className = "order-date";
    orderDate.textContent = order.orderDate
      ? new Date(order.orderDate).toLocaleString("no-NO")
      : "Date not available";

    orderInfo.appendChild(orderNumber);
    orderInfo.appendChild(orderDate);

    const actions = document.createElement("div");
    actions.className = "order-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => this.deleteOrder(order.orderNumber));

    actions.appendChild(deleteBtn);
    header.appendChild(orderInfo);
    header.appendChild(actions);
    card.appendChild(header);

    if (order.customer) {
      const customerSection = document.createElement("div");
      customerSection.className = "customer-section";

      const customerTitle = document.createElement("h4");
      customerTitle.className = "section-title";
      customerTitle.textContent = "Customer Information";

      const customerDetails = document.createElement("div");
      customerDetails.className = "customer-details";
      customerDetails.innerHTML = `
        <div><strong>Name:</strong> ${order.customer.name || "N/A"}</div>
        <div><strong>Email:</strong> ${order.customer.email || "N/A"}</div>
        <div><strong>Phone:</strong> ${order.customer.phone || "N/A"}</div>
        <div><strong>Address:</strong> ${order.customer.address || "N/A"}</div>
      `;

      customerSection.appendChild(customerTitle);
      customerSection.appendChild(customerDetails);
      card.appendChild(customerSection);
    }

    if (order.items && order.items.length > 0) {
      const itemsSection = document.createElement("div");
      itemsSection.className = "items-section";

      const itemsTitle = document.createElement("h4");
      itemsTitle.className = "section-title";
      itemsTitle.textContent = "Order Items";

      const itemsList = document.createElement("div");
      itemsList.className = "order-items";

      order.items.forEach((item) => {
        const itemDiv = document.createElement("div");
        itemDiv.className = "order-item";

        const itemDetails = document.createElement("span");
        itemDetails.className = "item-details";
        itemDetails.textContent = `${item.name || "Product"} (x${item.quantity || 1})`;

        const itemPrice = document.createElement("span");
        itemPrice.className = "item-price";
        const total = (item.price || 0) * (item.quantity || 1);
        itemPrice.textContent = `${total.toFixed(2)} kr`;

        itemDiv.appendChild(itemDetails);
        itemDiv.appendChild(itemPrice);
        itemsList.appendChild(itemDiv);
      });

      itemsSection.appendChild(itemsTitle);
      itemsSection.appendChild(itemsList);
      card.appendChild(itemsSection);
    }

    const totalDiv = document.createElement("div");
    totalDiv.className = "order-total";

    const totalLabel = document.createElement("span");
    totalLabel.className = "total-label";
    totalLabel.textContent = "Total (incl. shipping):";

    const totalAmount = document.createElement("span");
    totalAmount.className = "total-amount";
    const subtotal = order.items?.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
      0
    ) || 0;
    const shipping = order.shippingCost || 0;
    totalAmount.textContent = `${(subtotal + shipping).toFixed(2)} kr`;

    totalDiv.appendChild(totalLabel);
    totalDiv.appendChild(totalAmount);
    card.appendChild(totalDiv);

    return card;
  }

  // ----------------------------------------------------------------

  deleteOrder(orderNumber) {
    if (!confirm(`Are you sure you want to delete order #${orderNumber}?`)) {
      return;
    }

    const orders = this.getOrdersFromStorage();
    const filteredOrders = orders.filter((order) => order.orderNumber !== orderNumber);
    this.saveOrdersToStorage(filteredOrders);
    this.displayOrders(filteredOrders);
  }
}

customElements.define("admin-orders-view", AdminOrdersView);
export { AdminOrdersView };