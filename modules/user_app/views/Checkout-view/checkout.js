// Load template and styles for Web Component
const templateURL = new URL("./checkout.html", import.meta.url);
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

const checkoutTemplate = await loadTemplate(templateURL);
const checkoutStylesURL = new URL("./checkout.css", import.meta.url);

// Import API service for placing orders
import { addOrder } from '../../../api_service.js';

// Web Component class for CheckoutView
class CheckoutView extends HTMLElement {
  constructor() {
    super();
    // Create Shadow DOM
    this.shadow = this.attachShadow({ mode: "open" });
    
    // Clone template and attach styles
    const fragment = checkoutTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = checkoutStylesURL.href;
    this.shadow.append(styleLink, fragment);
    
    // Constants for shipping
    this.SHIPPING_API_URL = '';
    this.SAMPLE_SHIPPING = [
      { id: 'standard', name: 'Standard (3-5 days)', price: 39.0 },
      { id: 'express', name: 'Express (1-2 days)', price: 79.0 },
      { id: 'pickup', name: 'Pickup (store)', price: 0.0 }
    ];
  }

  // Called when component is added to DOM
  connectedCallback() {
    this.init();
  }

  // Helper function to select elements from Shadow DOM
  $(sel) { 
    return this.shadow.querySelector(sel); 
  }

  // Format numbers to 2 decimal places
  format(n) { 
    return Number(n || 0).toFixed(2); 
  }

  // Render shipping options list
  renderShippingList(methods) {
    const list = this.$('#shippingList');
    list.innerHTML = methods.map(m =>
      `<li><input type="radio" name="shipping" value="${m.id}" data-price="${m.price}">` +
      `<label style="flex:1">${m.name} — ${this.format(m.price)} kr</label></li>`
    ).join('');
    list.addEventListener('change', () => this.updateTotals());
  }

  // Fetch shipping methods from API or use sample data
  async fetchShipping() {
    if (!this.SHIPPING_API_URL) {
      return this.SAMPLE_SHIPPING;
    }
    try {
      const res = await fetch(this.SHIPPING_API_URL);
      if (!res.ok) throw new Error('Network');
      const data = await res.json();
      return data;
    } catch (e) {
      console.warn('Failed to fetch shipping, using sample', e);
      return this.SAMPLE_SHIPPING;
    }
  }

  // Get selected shipping option
  selectedShipping() {
    const radio = this.shadow.querySelector('input[name="shipping"]:checked');
    if (!radio) return { id: null, price: 0 };
    return { id: radio.value, price: Number(radio.dataset.price) || 0 };
  }

  // Update total prices
  updateTotals() {
    const subtotal = Number(this.$('#subtotal').textContent) || 0;
    const ship = this.selectedShipping().price || 0;
    this.$('#shippingCost').textContent = this.format(ship);
    this.$('#total').textContent = this.format(subtotal + ship);
  }

  // Initialize checkout view
  init() {
    this.$('#subtotal').textContent = this.format(0.00);

    // Restrict phone input to numbers only
    const phoneInput = this.$('#phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^0-9]/g, '');
      });
    }

    // Load shipping methods
    this.fetchShipping().then(methods => {
      this.$('#shippingLoading').style.display = 'none';
      this.renderShippingList(methods);
    });

    // Handle place order button click
    this.$('#placeOrderBtn').addEventListener('click', async (e) => {
		
      const order = {
        customer: {
          name: this.$('#name').value,
          email: this.$('#email').value,
		  phone: this.$('#phone').value,
          address: this.$('#address').value,
          city: this.$('#city').value,
          zip: this.$('#zip').value
        },
        shipping: this.selectedShipping(),
        subtotal: Number(this.$('#subtotal').textContent) || 0,
        total: Number(this.$('#total').textContent) || 0,
        orderNumber: Date.now()
      };

      // Validation
      if (!order.customer.name || !order.customer.email) {
        alert('Please enter name and email.');
        return;
      }
      
      if (!order.shipping.id) {
        alert('Please choose a shipping method.');
        return;
      }

      // Save to localStorage for confirmation page
      localStorage.setItem('lastOrder', JSON.stringify(order));

      // Prepare order data for API
      const cartData = localStorage.getItem('sukkergrisCart');
      let cart = [];
      if (cartData) {
        try {
          cart = JSON.parse(cartData);
        } catch (e) {
          console.warn('Could not parse cart', e);
        }
      }

      // Build content array for API
      const content = cart.map(([key, { product, quantity }]) => ({
        product_id: product?.id || key,
        quantity: quantity
      }));

      // API order object
      const apiOrder = {
        customer_name: order.customer.name,
        street: order.customer.address,
        city: order.customer.city,
        zipcode: order.customer.zip,
        country: 'Norway',
        shipping_id: order.shipping.id,
        content: JSON.stringify(content),
        email: order.customer.email,
        phone: order.customer.phone 
      };

      // Send order to API
      try {
        const result = await addOrder(apiOrder);
        console.log('Order placed successfully:', result);
        
        // Navigate to confirmation view using CustomEvent
        this.dispatchEvent(new CustomEvent('navigate-confirmation', { 
          bubbles: true, 
          composed: true 
        }));
      } catch (error) {
        console.error('Failed to place order:', error);
        alert('Failed to place order. Please try again.');
      }
    });

    // Update totals on any change
    this.shadow.addEventListener('change', () => this.updateTotals());

    // Initial totals
    this.updateTotals();

    // Load and display cart items
    const cartData = localStorage.getItem('sukkergrisCart');
    if (cartData) {
      try {
        const cart = JSON.parse(cartData);
        const list = this.$('#orderList');
        let subtotalAmount = 0;
        list.innerHTML = cart.map(([key, { product, quantity }]) => {
          const itemTotal = (Number(product?.price) || 0) * quantity;
          subtotalAmount += itemTotal;
          return `<li>${quantity}x ${product?.name || 'Product'} = ${this.format(itemTotal)} kr</li>`;
        }).join('');
        this.$('#subtotal').textContent = this.format(subtotalAmount);
      } catch (e) {
        console.warn('Could not load cart', e);
      }
    }

    // Handle back to home button
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
customElements.define("checkout-view", CheckoutView);

// Export for use in user_main.js
export { CheckoutView };

