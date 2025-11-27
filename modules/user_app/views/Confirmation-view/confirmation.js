// Load template and styles for Web Component
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

// Web Component class for ConfirmationView
class ConfirmationView extends HTMLElement {
  constructor() {
    super();
    // Create Shadow DOM
    this.shadow = this.attachShadow({ mode: "open" });
    
    // Clone template and attach styles
    const fragment = confirmationTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = confirmationStylesURL.href;
    this.shadow.append(styleLink, fragment);
  }

  // Called when component is added to DOM
  connectedCallback() {
    this.init();
  }

  // Helper function to get element by ID from Shadow DOM
  el(id) { 
    return this.shadow.getElementById(id); 
  }

  // Initialize confirmation view
  init() {
    // Load order data from localStorage
    const raw = localStorage.getItem('lastOrder');
    let order = null;
    try { 
      order = raw ? JSON.parse(raw) : null; 
    } catch (e) { 
      order = null; 
    }

    // Display customer information
    if (order && order.customer) {
      this.el('custName').textContent = 'Name: ' + (order.customer.name || '-');
      this.el('custEmail').textContent = 'Email: ' + (order.customer.email || '-');
      this.el('custPhone').textContent = 'Phone: ' + (order.customer.phone || '-');
      this.el('custAddress').textContent = 'Address: ' + [order.customer.address, order.customer.city, order.customer.zip].filter(Boolean).join(', ') || '-';
    }

    // Display order number
    if (order && order.orderNumber) {
      this.el('orderNumber').textContent = '#' + order.orderNumber;
    }

    // Display shipping method
    if (order && order.shipping) {
      this.el('shippingMethod').textContent = order.shipping.id || '-';
    }

    // Calculate and display estimated shipping date
    if (order && order.orderNumber) {
      const orderDate = new Date(order.orderNumber);
      let daysToAdd = 3; // Default shipping time
      
      // Adjust days based on shipping method
      if (order.shipping && order.shipping.id) {
        const shippingId = order.shipping.id.toString().toLowerCase();
        if (shippingId.includes('express') || shippingId === '4') {
          daysToAdd = 1;
        } else if (shippingId.includes('pickup') || shippingId === '1') {
          daysToAdd = 0;
        } else if (shippingId === '2') {
          daysToAdd = 2;
        } else if (shippingId === '3') {
          daysToAdd = 3;
        }
      }
      
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(estimatedDate.getDate() + daysToAdd);
      
      const dateStr = estimatedDate.toLocaleDateString('nb-NO', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      
      this.el('shippingDate').textContent = daysToAdd === 0 ? 'Ready for pickup today' : dateStr;
    }

    // Display total amount
    if (order && typeof order.total !== 'undefined') {
      this.el('totalAmount').textContent = (Number(order.total) || 0).toFixed(2) + ' kr';
    }

    // Load and display cart items in table
    const cartRaw = localStorage.getItem('sukkergrisCart');
    let cart = null;
    try { 
      cart = cartRaw ? JSON.parse(cartRaw) : null; 
    } catch (e) { 
      cart = null; 
    }

    const tbody = this.shadow.querySelector('#items tbody');
    tbody.innerHTML = '';
    if (Array.isArray(cart)) {
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

    //---------------------------------
    const backBtn = this.shadow.querySelector('[data-back-home]');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.dispatchEvent(new CustomEvent('navigate-home', {
          bubbles: true,
          composed: true
        }));
      });
    }
  }
}

// Register Web Component
customElements.define("confirmation-view", ConfirmationView);

// Export for use in user_main.js
export { ConfirmationView };