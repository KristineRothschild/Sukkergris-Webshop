const templateURL = new URL("./admin-orders.html", import.meta.url);

import { getOrders, deleteOrder } from "../../../api_service.js";
import { showMessage } from "../../../msg_handler.js";

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

  async loadOrders() {
    try {
      const orders = await getOrders();
      this.displayOrders(orders || []);
    } catch (error) {
      console.error("Error loading orders:", error);
      this.showError("Failed to load orders. Please try again.");
    }
  }

  // ----------------------------------------------------------------

  showError(message) {
    if (this.ordersList) {
      this.ordersList.innerHTML = `<p class="empty-state">${message}</p>`;
    }
  }

  // ----------------------------------------------------------------

  displayOrders(orders) {
    if (!this.ordersList) return;

    if (this.orderCount) {
      this.orderCount.textContent = orders.length;
    }

    this.ordersList.innerHTML = "";

    if (!orders || orders.length === 0) {
      const emptyState = document.createElement("p");
      emptyState.className = "empty-state";
      emptyState.textContent = "No orders yet";
      this.ordersList.appendChild(emptyState);
      return;
    }

    const sortedOrders = [...orders].sort((a, b) => {
      return new Date(b.date || 0) - new Date(a.date || 0);
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
    orderNumber.textContent = `Order #${order.order_number || order.id || "N/A"}`;

    const orderDate = document.createElement("p");
    orderDate.className = "order-date";
    orderDate.textContent = order.date
      ? new Date(order.date).toLocaleString("no-NO")
      : "Date not available";

    orderInfo.appendChild(orderNumber);
    orderInfo.appendChild(orderDate);

    const actions = document.createElement("div");
    actions.className = "order-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-button";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => this.deleteOrderHandler(order.id));

    actions.appendChild(deleteBtn);
    header.appendChild(orderInfo);
    header.appendChild(actions);
    card.appendChild(header);

    const customerSection = document.createElement("div");
    customerSection.className = "customer-section";

    const customerTitle = document.createElement("h4");
    customerTitle.className = "section-title";
    customerTitle.textContent = "Customer Information";

    const customerDetails = document.createElement("div");
    customerDetails.className = "customer-details";
    customerDetails.innerHTML = `
      <div><strong>Name:</strong> ${order.customer_name || "N/A"}</div>
      <div><strong>Email:</strong> ${order.email || "N/A"}</div>
      <div><strong>Phone:</strong> ${order.phone || "N/A"}</div>
      <div><strong>Address:</strong> ${order.street || ""}, ${order.zipcode || ""} ${order.city || ""}, ${order.country || ""}</div>
    `;

    customerSection.appendChild(customerTitle);
    customerSection.appendChild(customerDetails);
    card.appendChild(customerSection);

    let orderContent = [];
    try {
      orderContent = order.content ? JSON.parse(order.content) : [];
    } catch (error) {
      console.error("Error parsing order content:", error);
    }

    if (orderContent.length > 0) {
      const itemsSection = document.createElement("div");
      itemsSection.className = "items-section";

      const itemsTitle = document.createElement("h4");
      itemsTitle.className = "section-title";
      itemsTitle.textContent = "Order Items";

      const itemsList = document.createElement("div");
      itemsList.className = "order-items";

      orderContent.forEach((item) => {
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
    
    let subtotal = 0;
    try {
      const content = order.content ? JSON.parse(order.content) : [];
      subtotal = content.reduce(
        (sum, item) => sum + (item.price || 0) * (item.quantity || 1),
        0
      );
    } catch (error) {
      console.error("Error calculating total:", error);
    }
    
    const shipping = order.shipping_cost || 0;
    totalAmount.textContent = `${(subtotal + shipping).toFixed(2)} kr`;

    totalDiv.appendChild(totalLabel);
    totalDiv.appendChild(totalAmount);
    card.appendChild(totalDiv);

    return card;
  }

  // ----------------------------------------------------------------

  async deleteOrderHandler(orderId) {
    if (!confirm(`Are you sure you want to delete order #${orderId}?`)) {
      return;
    }

    try {
      await deleteOrder(orderId);
      showMessage("Order deleted successfully");
      await this.loadOrders();
    } catch (error) {
      console.error("Error deleting order:", error);
      showMessage("Failed to delete order. Please try again.");
    }
  }
}

customElements.define("admin-orders-view", AdminOrdersView);
export { AdminOrdersView };