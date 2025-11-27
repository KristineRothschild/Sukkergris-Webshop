const templateURL = new URL("./confirmation.html", import.meta.url);

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Could not load template from ${url}`);
  const template = document.createElement("template");
  template.innerHTML = await response.text();
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

  async displayOrder() {
    const raw = localStorage.getItem('lastOrder');
    let order = null;
    try { order = raw ? JSON.parse(raw) : null; } catch(e) { order = null; }

    const el = (id) => this.shadow.getElementById(id);

    if (order && order.customer) {
      el('custName').textContent = 'Name: ' + (order.customer.name || '-');
      el('custEmail').textContent = 'Email: ' + (order.customer.email || '-');
      el('custAddress').textContent = 'Address: ' + ([order.customer.address, order.customer.city, order.customer.zip].filter(Boolean).join(', ') || '-');
      if (el('custPhone')) el('custPhone').textContent = 'Phone: ' + (order.customer.phone || '-');
    }

    if (order && order.orderNumber) el('orderNumber').innerHTML = '#' + order.orderNumber;

    if (order && order.shipping) {
      el('shippingMethod').textContent = (order.shipping.id || '-');
      if (el('shippingDate')) el('shippingDate').textContent = new Date().toLocaleDateString(); 
    }

    if (order && typeof order.total !== 'undefined') el('totalAmount').textContent = (Number(order.total) || 0).toFixed(2) + ' kr';

    const cartRaw = localStorage.getItem('sukkergrisCart');
    let cart = null;
    try { cart = cartRaw ? JSON.parse(cartRaw) : null; } catch(e){ cart = null; }

    const tbody = this.shadow.querySelector('#items tbody');
    if (tbody) tbody.innerHTML = '';
    if (Array.isArray(cart) && tbody) {
      cart.forEach(([key, entry]) => {
        const product = entry.product || {};
        const quantity = entry.quantity || 0;
        const unit = Number(product.price) || 0;
        const total = (unit * quantity).toFixed(2);

        const tr = document.createElement('tr');
        tr.innerHTML = '<td>' + key + '</td>' +
                       '<td>' + (product.name || '-') + '</td>' +
                       '<td>' + quantity + '</td>' +
                       '<td>' + unit.toFixed(2) + ' kr</td>' +
                       '<td>' + total + ' kr</td>';
        tbody.appendChild(tr);
      });
    }
  }

  registerEventListeners() {
    const homeButton = this.shadow.querySelector("[data-back-home]");
    if (homeButton) {
      homeButton.addEventListener("click", (e) => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent("navigate-home", { bubbles: true, composed: true }));
      });
    }

    const cartButton = this.shadow.querySelector(".cart-button");
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        this.dispatchEvent(new CustomEvent("navigate-cart", { bubbles: true, composed: true }));
      });
    }
  }
}

customElements.define("confirmation-view", ConfirmationView);
export { ConfirmationView };