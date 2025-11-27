
document.addEventListener('DOMContentLoaded', function () {
  function el(id){ return document.getElementById(id); }

  const raw = localStorage.getItem('lastOrder');
  let order = null;
  try { order = raw ? JSON.parse(raw) : null; } catch(e) { order = null; }

 
  if (order && order.customer) {
    el('custName').textContent = 'Name: ' + (order.customer.name || '-');
    el('custEmail').textContent = 'Email: ' + (order.customer.email || '-');
    el('custAddress').textContent = 'Address: ' + [order.customer.address, order.customer.city, order.customer.zip].filter(Boolean).join(', ') || '-';
    // phone (may be undefined if form has not been updated)
    if (el('custPhone')) el('custPhone').textContent = 'Phone: ' + (order.customer.phone || '-');
  }

  
  if (order && order.orderNumber) el('orderNumber').textContent = '#' + order.orderNumber;

  // Shipping
  if (order && order.shipping) {
    el('shippingMethod').textContent = order.shipping.id || '-'; //el means element by id 
  }

  // Total pris
  if (order && typeof order.total !== 'undefined') el('totalAmount').textContent = (Number(order.total) || 0).toFixed(2) + ' kr';

 
  const cartRaw = localStorage.getItem('sukkergrisCart');
  let cart = null;
  try { cart = cartRaw ? JSON.parse(cartRaw) : null; } catch(e){ cart = null; }

  const tbody = document.querySelector('#items tbody');
  tbody.innerHTML = '';
  if (Array.isArray(cart)) {
    cart.forEach(([key, entry]) => {
      const product = entry.product || {};
      const quantity = entry.quantity || 0;
      const unit = Number(product.price) || 0;
      const total = (unit * quantity).toFixed(2);

      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + key + '</td>' + //td means table data
                     '<td>' + (product.name || '-') + '</td>' +
                     '<td>' + quantity + '</td>' +
                     '<td>' + unit.toFixed(2) + ' kr</td>' +
                     '<td>' + total + ' kr</td>';
      tbody.appendChild(tr);
    });
  }
});