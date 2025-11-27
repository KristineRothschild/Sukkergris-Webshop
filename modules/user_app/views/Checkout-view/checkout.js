const templateURL = new URL("./checkout.html", import.meta.url);
const stylesURL = new URL("./checkout.css", import.meta.url);
const SHIPPING_API_URL =
  "https://sukkergris.onrender.com/logistics/shippingtypes?key=HJINAS11";

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load checkout view");
  }
  const html = await response.text();
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  return tpl;
}

const checkoutTemplate = await loadTemplate(templateURL);

class CheckoutView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    const fragment = checkoutTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = stylesURL.href;
    this.shadowRoot.append(styleLink, fragment);
    this.cartItems = [];
    this.shippingMethods = [];
    this.registerRefs();
    this.registerEvents();
  }

  connectedCallback() {
    this.refresh();
    this.loadShipping();
  }

  refresh(items) {
    if (Array.isArray(items)) {
      this.cartItems = items;
    } else {
      this.cartItems = this.readCartFromStorage();
    }
    this.renderOrderList();
    this.updateSubtotal();
    this.updateTotals();
  }

  registerRefs() {
    const root = this.shadowRoot;
    this.orderList = root.querySelector("[data-order-list]");
    this.shippingList = root.querySelector("[data-shipping-list]");
    this.shippingLoading = root.querySelector("[data-shipping-loading]");
    this.subtotalEl = root.querySelector("[data-subtotal]");
    this.shippingCostEl = root.querySelector("[data-shipping-cost]");
    this.totalEl = root.querySelector("[data-total]");
    this.form = root.getElementById("customerForm");
    this.errorEl = root.querySelector("[data-error-message]");
    this.placeOrderBtn = root.querySelector("[data-place-order]");
  }

  registerEvents() {
    const root = this.shadowRoot;
    root.querySelector("[data-home]")?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("navigate-home", { bubbles: true, composed: true })
      );
    });

    root.querySelector("[data-back-cart]")?.addEventListener("click", () => {
      this.dispatchEvent(
        new CustomEvent("cartRequested", { bubbles: true, composed: true })
      );
    });

    this.placeOrderBtn?.addEventListener("click", () =>
      this.handlePlaceOrder()
    );

    this.shippingList?.addEventListener("change", () => this.updateTotals());
  }

  readCartFromStorage() {
    const raw = localStorage.getItem("sukkergrisCart");
    if (!raw) {
      return [];
    }
    try {
      const parsed = JSON.parse(raw);
      return parsed.map(([id, entry]) => ({
        productNumber: id,
        name: entry.product?.name ?? "Product",
        quantity: entry.quantity ?? 0,
        price: Number(entry.product?.price) || 0,
      }));
    } catch (error) {
      console.warn("Could not read cart", error);
      return [];
    }
  }

  renderOrderList() {
    if (!this.orderList) {
      return;
    }
    if (!this.cartItems.length) {
      this.orderList.innerHTML = "<li>Your cart is empty. Add products.</li>";
      return;
    }
    this.orderList.innerHTML = "";
    this.cartItems.forEach((item) => {
      const li = document.createElement("li");
      const total = (Number(item.price) || 0) * (Number(item.quantity) || 0);
      li.innerHTML = `
        <span>${item.quantity} x ${item.name}</span>
        <span>${this.formatCurrency(total)}</span>
      `;
      this.orderList.append(li);
    });
  }

  async loadShipping() {
    this.showShippingMessage("Loading shipping options...");
    try {
      const methods = await this.fetchShipping();
      this.shippingMethods = methods;
      this.renderShipping(methods);
      this.showShippingMessage("");
    } catch (error) {
      console.warn("Could not fetch shipping options", error);
      this.shippingMethods = [];
      this.renderShipping([]);
      this.showShippingMessage(
        "Couldn't fetch shipping options. Please try again later."
      );
    } finally {
      this.updateTotals();
    }
  }

  async fetchShipping() {
    const response = await fetch(SHIPPING_API_URL);
    if (!response.ok) {
      throw new Error("Shipping request failed");
    }
    const payload = await response.json();
    const list = Array.isArray(payload)
      ? payload
      : payload.shippingTypes || payload.shippingtypes || payload.data || [];
    if (!Array.isArray(list) || !list.length) {
      throw new Error("No shipping options available");
    }
    return list.map((item) => ({
      id: item.id ?? item.typeId ?? "shipping",
      name: item.name ?? item.title ?? "Shipping",
      price: Number(item.price ?? item.cost ?? 0) || 0,
    }));
  }

  renderShipping(methods) {
    if (!this.shippingList) {
      return;
    }
    this.shippingList.innerHTML = "";
    methods.forEach((method, index) => {
      const li = document.createElement("li");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "shipping";
      input.value = method.id;
      input.dataset.price = String(method.price);
      if (index === 0) {
        input.checked = true;
      }
      const label = document.createElement("label");
      label.textContent = `${method.name} – ${this.formatCurrency(
        method.price
      )}`;
      li.append(input, label);
      this.shippingList.append(li);
    });
  }

  showShippingMessage(message) {
    if (!this.shippingLoading) {
      return;
    }
    if (!message) {
      this.shippingLoading.textContent = "";
      this.shippingLoading.setAttribute("hidden", "hidden");
      return;
    }
    this.shippingLoading.textContent = message;
    this.shippingLoading.removeAttribute("hidden");
  }

  updateSubtotal() {
    const sum = this.cartItems.reduce((total, item) => {
      return total + (Number(item.price) || 0) * (Number(item.quantity) || 0);
    }, 0);
    this.subtotal = sum;
    if (this.subtotalEl) {
      this.subtotalEl.textContent = this.formatCurrency(sum);
    }
  }

  selectedShipping() {
    const selected = this.shadowRoot.querySelector(
      'input[name="shipping"]:checked'
    );
    if (!selected) {
      return { id: null, price: 0 };
    }
    return {
      id: selected.value,
      price: Number(selected.dataset.price) || 0,
    };
  }

  updateTotals() {
    const shipping = this.selectedShipping();
    const total = this.subtotal + (shipping.price || 0);
    if (this.shippingCostEl) {
      this.shippingCostEl.textContent = this.formatCurrency(shipping.price);
    }
    if (this.totalEl) {
      this.totalEl.textContent = this.formatCurrency(total);
    }
  }

  handlePlaceOrder() {
    this.hideError();
    const shipping = this.selectedShipping();
    const customer = this.readCustomerData();
    if (!customer.name || !customer.email) {
      this.showError("Name and email are required.");
      return;
    }
    if (!shipping.id) {
      this.showError("Select a shipping method.");
      return;
    }
    if (!this.cartItems.length) {
      this.showError("The cart is empty.");
      return;
    }
    const order = {
      orderNumber: String(Date.now()),
      customer,
      shipping,
      lines: this.cartItems,
      subtotal: this.subtotal,
      total: this.subtotal + shipping.price,
    };
    localStorage.setItem("lastOrder", JSON.stringify(order));
    this.dispatchEvent(
      new CustomEvent("orderPlaced", {
        bubbles: true,
        composed: true,
        detail: { order },
      })
    );
  }

  readCustomerData() {
    if (!this.form) {
      return {};
    }
    const data = new FormData(this.form);
    return {
      name: data.get("name")?.toString().trim() ?? "",
      email: data.get("email")?.toString().trim() ?? "",
      phone: data.get("phone")?.toString().trim() ?? "",
      address: data.get("address")?.toString().trim() ?? "",
      city: data.get("city")?.toString().trim() ?? "",
      zip: data.get("zip")?.toString().trim() ?? "",
    };
  }

  showError(message) {
    if (!this.errorEl) {
      return;
    }
    this.errorEl.textContent = message;
    this.errorEl.hidden = false;
  }

  hideError() {
    if (!this.errorEl) {
      return;
    }
    this.errorEl.hidden = true;
    this.errorEl.textContent = "";
  }

  formatCurrency(value) {
    const safe = Number.isFinite(value) ? value : 0;
    return new Intl.NumberFormat("no-NO", {
      style: "currency",
      currency: "NOK",
    }).format(safe);
  }
}

customElements.define("checkout-view", CheckoutView);
export { CheckoutView };
