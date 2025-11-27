const SHIPPING_API_URL = 'https://sukkergris.onrender.com/logistics/shippingtypes?key=HJINAS11'; // shipping API with group key


function $(sel){ return document.querySelector(sel); } //denne funksjonen henter elementer frå DOM - som betyr at du kan bruke den til å hente elementer frå HTML-dokumentet ved hjelp av CSS-selektorar.

function format(n){ return Number(n || 0).toFixed(2); } //denne funksjonen formaterer tal

function renderShippingList(methods){
	const list = $('#shippingList');
	// Build simple HTML for radios — shorter and still vanilla
	list.innerHTML = methods.map(m =>
		`<li><input type="radio" name="shipping" value="${m.id}" data-price="${m.price}">` +
		`<label style="flex:1">${m.name} — ${format(m.price)} kr</label></li>` //m står for metode
	).join('');
	// Single event listener for changes (delegation)
	list.addEventListener('change', updateTotals);
}

async function fetchShipping(){
	if (!SHIPPING_API_URL) return SAMPLE_SHIPPING;
	try {
		const res = await fetch(SHIPPING_API_URL);
		if (!res.ok) throw 0;
		const data = await res.json();
		let list = Array.isArray(data) ? data : data.shippingTypes || data.shippingtypes || data.data || Object.values(data).find(Array.isArray) || SAMPLE_SHIPPING;
		return (list || SAMPLE_SHIPPING).map(m => {
			const id = m.id ?? m.typeId ?? m.code ?? m.key ?? '';
			const name = m.name ?? m.title ?? m.type ?? m.description ?? id;
			let price = m.price ?? m.cost ?? m.amount ?? 0;
			if (typeof price === 'string') price = Number(price.replace(/[^0-9.-]/g, '')) || 0;
			if (!price && m.priceInCents) price = Number(m.priceInCents) / 100;
			return { id, name, price: Number(price) || 0 };
		});
	} catch (e) {
		console.warn('Failed to fetch shipping, using sample', e);
		return SAMPLE_SHIPPING;
	}
}

function selectedShipping(){
	const radio = document.querySelector('input[name="shipping"]:checked');
	if (!radio) return { id: null, price: 0 };
	return { id: radio.value, price: Number(radio.dataset.price) || 0 };
}

function updateTotals(){
	const subtotal = Number($('#subtotal').textContent) || 0;
	const ship = selectedShipping().price || 0;
	$('#shippingCost').textContent = format(ship);
	$('#total').textContent = format(subtotal + ship);
}

function init(){
	// set a simple subtotal placeholder (in real app you'll compute cart total)
	$('#subtotal').textContent = format(0.00); //her setter vi inn subtotalen for produktene senere

	fetchShipping().then(methods => {
		$('#shippingLoading').style.display = 'none';
		renderShippingList(methods);
	});

	// when place order clicked: gather data and redirect (placeholder)
	$('#placeOrderBtn').addEventListener('click', (e) => {
		// gather customer info
		const order = {
			orderNumber: Math.floor(Math.random() * 101),
			customer: {
				name: $('#name').value,
				email: $('#email').value,
				phone: $('#phone') ? $('#phone').value : '',
				address: $('#address').value,
				city: $('#city').value,
				zip: $('#zip').value
			},
			shipping: selectedShipping(),
			subtotal: Number($('#subtotal').textContent) || 0,
			total: Number($('#total').textContent) || 0
		};

		// Basic validation: require name and email and a shipping method
		if (!order.customer.name || !order.customer.email) {
			alert('Please enter name and email.');
			return;
		}
		if (!order.shipping.id){
			alert('Please choose a shipping method.');
			return;
		}

		// Here you would POST `order` to your server and handle response.
		// For now we just save to localStorage and redirect to confirmation
		localStorage.setItem('lastOrder', JSON.stringify(order));

		// Redirect to user_app.html with confirmation hash
		window.location.href = '../../../../user_app.html#confirmation';
	});

	// update totals when user changes any input that might affect total
	document.addEventListener('change', updateTotals);

	// initial totals
	updateTotals();

	// Load and display cart items
	const cartData = localStorage.getItem('sukkergrisCart');
	if (cartData) {
		try {
			const cart = JSON.parse(cartData);
			const list = $('#orderList');
			let subtotalAmount = 0;
			list.innerHTML = cart.map(([key, {product, quantity}]) => {
				const itemTotal = (Number(product?.price) || 0) * quantity;
				subtotalAmount += itemTotal;
				return `<li>${quantity}x ${product?.name || 'Product'} = ${format(itemTotal)} kr</li>`;
			}).join('');
			$('#subtotal').textContent = format(subtotalAmount);
		} catch(e) {
			console.warn('Could not load cart', e);
		}
	}
}

document.addEventListener('DOMContentLoaded', init);
