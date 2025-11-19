
document.addEventListener('DOMContentLoaded', init);

function init(){
  const root = document.getElementById('checkout-root');
  root.innerHTML = template();
  renderCart();
  bind();
}

// minimal DOM
function template(){
  return `
    <div class="checkout-wrap">
      <section class="cart">
        <h3>Cart</h3>
        <div id="cart-list">Loading…</div>
      </section>
      <aside class="info">
        <h3>Customer info</h3>
        <input id="name" placeholder="Name" /><input id="email" placeholder="Email" />
        <input id="address" placeholder="Address" />
        <div class="button-row">
          <button id="btn-home">Home</button>
          <button id="btn-place" class="primary">Place order</button>
        </div>
        <div id="msg" style="margin-top:8px;color:#666;font-size:0.9rem"></div>
      </aside>
    </div>
  `;
}

// render cart from localStorage or demo
function getCart(){
  try{
    const raw = localStorage.getItem('cart');
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return [{ id:347,name:'Banana Bug Bonanza',price:32,quantity:2 }];
}

function renderCart(){
  const list = getCart();
  const el = document.getElementById('cart-list');
  if(!list || !list.length){ el.textContent = 'Cart is empty'; return; }
  el.innerHTML = list.map(i=>`<div style="display:flex;justify-content:space-between;padding:6px 0">
    <div>${escape(i.name)} x ${i.quantity}</div><div>${(i.price*i.quantity).toFixed(0)} kr</div></div>`).join('');
  const subtotal = list.reduce((s,i)=>s+i.price*i.quantity,0);
  el.insertAdjacentHTML('beforeend', `<div style="font-weight:700;margin-top:8px">Subtotal: ${subtotal.toFixed(0)} kr</div>`);
}

function bind(){
  document.getElementById('btn-home').addEventListener('click', ()=>document.dispatchEvent(new CustomEvent('navigate-home',{bubbles:true,composed:true})));
  document.getElementById('btn-place').addEventListener('click', placeOrder);
}

function placeOrder(){
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const address = document.getElementById('address').value.trim();
  if(!name||!email||!address){ showMsg('Please fill name, email and address.'); return; }
  const payload = { customer:{name,email,address}, items:getCart() };
  // TODO: replace with real API POST to create order
  console.log('PLACE ORDER (mock):', payload);
  showMsg('Order placed (mock).');
  document.dispatchEvent(new CustomEvent('order-placed',{detail:payload,bubbles:true,composed:true}));
}

function showMsg(txt){ const m = document.getElementById('msg'); if(m) m.textContent = txt; }
function escape(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
