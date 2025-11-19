//denne siden kommer du til etter kategori i admin_produkt_view.js er valgt
//her kan du redigere produktet som er valgt, eller slette det
//du kan også gå tilbake til admin_produkt_view.js uten å gjøre endringer

const STORAGE_KEY = 'localProducts'; //nøkkel for localstorage

const CATEGORIES_API = 'https://your-api.example.com/categories'; 
let categories = [];

let products = [];
let editingId = null; // null = adde nye produkta 

function $(sel) {
	return document.querySelector(sel); //denne funksjonen henter elementer frå DOM
}

function saveToStorage() { //denne funksjonen lagrer produkta i localstorage
	localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function loadFromStorage() { //denne funksjonen hentar produkta frå localstorage
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		products = raw ? JSON.parse(raw) : [];
	} catch (e) {
		console.error('Failed to load products', e);
		products = [];
	}
}

function formatPrice(p) {   //denne funksjonen formaterer prisen
	if (p == null || p === '') return '';
	return Number(p).toFixed(2) + ' kr.';
}

function renderProducts() { //denne funksjonen viser produkta i lista
	const list = $('#productList');
	list.innerHTML = '';
	if (!products.length) {
		const empty = document.createElement('div');
		empty.className = 'empty-state';
		empty.textContent = 'No products yet — click "Add product" to create one.';
		list.appendChild(empty);
		return;
	}

	products.forEach((p) => { //lager kort for kvert produkt
		const card = document.createElement('article');
		card.className = 'product-card';

		const img = document.createElement('img');
		img.src = p.image || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23efe7de"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236a5b52" font-size="24">No image</text></svg>';
		img.alt = p.name || 'Product image';

		const h3 = document.createElement('h3');
		h3.textContent = p.name || 'Untitled';

		const desc = document.createElement('p');
		desc.textContent = p.description || '';

		const hr = document.createElement('hr');

		const price = document.createElement('div');
		price.style.fontWeight = '600';
		price.textContent = formatPrice(p.price);

		const actions = document.createElement('div');
		actions.style.display = 'flex';
		actions.style.gap = '0.5rem';
		actions.style.marginTop = '0.5rem';

		const editBtn = document.createElement('button');
		editBtn.textContent = 'Edit';
		editBtn.className = 'back-button';
		editBtn.style.padding = '0.35rem 0.8rem';
		editBtn.addEventListener('click', (e) => {
			e.stopPropagation();
			openModalForEdit(p.id);
		});

		actions.appendChild(editBtn);

		if (p.isLocal) { //slett knapp bare for lokale produkt
			const delBtn = document.createElement('button');
			delBtn.textContent = 'Delete';
			delBtn.className = 'back-button';
			delBtn.addEventListener('click', (e) => {
				e.stopPropagation();
				deleteProduct(p.id);
			});
			actions.appendChild(delBtn);
		}

		card.appendChild(img);
		card.appendChild(h3);
		card.appendChild(desc);
		card.appendChild(hr);
		card.appendChild(price);
		card.appendChild(actions);

		list.appendChild(card); //legg til kortet i lista^
	});
}

function openModalForEdit(id) { //denne funksjonen åpner modal for redigering - allerede eksisterende lokalt produkt
	editingId = id;
	const prod = products.find((x) => x.id === id);
	if (!prod) return;
	$('#modalTitle').textContent = 'Edit product';
	$('#prodName').value = prod.name || '';
	$('#prodDesc').value = prod.description || '';
	$('#prodPrice').value = prod.price ?? '';
	$('#prodImage').value = prod.image || '';
	updatePreview(prod.image || '');
	openModal();
}

function openModalForAdd() { //denne funksjonen åpner modal for "add product" - allerede eksisterende lokalt produkt
	editingId = null;
	$('#modalTitle').textContent = 'Add product';
	$('#productForm').reset();
	updatePreview('');
	openModal();
}

function openModal() { //denne funksjonen åpner modalen for både add og edit 
	const modal = $('#productModal');
	modal.classList.remove('hidden');
	modal.setAttribute('aria-hidden', 'false');
	$('#prodName').focus();
}

function closeModal() { //denne funksjonen lukker modalen
	const modal = $('#productModal');
	modal.classList.add('hidden');
	modal.setAttribute('aria-hidden', 'true');
}

function updatePreview(url) { //denne funksjonen oppdaterer bilde preview i modalen
	const img = $('#imagePreview');
	if (!url) {
		img.src = '';
		img.style.display = 'none';
		return;
	}
	img.src = url;
	img.style.display = 'block';
}

function addProduct(data) { //denne funksjonen legger til nye produkt
	const id = Date.now().toString();
	const p = { id, ...data, isLocal: true };
	products.unshift(p);
	saveToStorage();
	renderProducts();
}

function updateProduct(id, updates) { //denne funksjonen oppdaterer eksisterende produkt
	const idx = products.findIndex((p) => p.id === id);
	if (idx === -1) return;
	products[idx] = { ...products[idx], ...updates };
	saveToStorage();
	renderProducts();
}

function deleteProduct(id) { //denne funksjonen sletter eksisterende lokalt produkt
	const idx = products.findIndex((p) => p.id === id);
	if (idx === -1) return;
	if (!products[idx].isLocal) {
		alert('Only locally added products can be deleted.');
		return;
	}
	if (!confirm('Delete this product?')) return;
	products.splice(idx, 1);
	saveToStorage();
	renderProducts();
}

function wireUp() { //denne funksjonen kobler knappar og skjema til funksjonene 
	$('#addProductBtn').addEventListener('click', () => openModalForAdd());
	$('#cancelBtn').addEventListener('click', () => closeModal());
	$('#backBtn').addEventListener('click', () => {
		document.dispatchEvent(new CustomEvent('edit-product-back', {
			bubbles: true,
			composed: true
		}));
	});

	//lukker om du trykker utafor innhold
	$('#productModal').addEventListener('click', (e) => {
		if (e.target === e.currentTarget) closeModal();
	});

	$('#prodImage').addEventListener('input', (e) => updatePreview(e.target.value));

	$('#productForm').addEventListener('submit', (ev) => {
		ev.preventDefault();
		const name = $('#prodName').value.trim();
		const description = $('#prodDesc').value.trim();
		const priceRaw = $('#prodPrice').value;
		const price = priceRaw === '' ? '' : Number(priceRaw);
		const image = $('#prodImage').value.trim();

		if (!name) {
			alert('Name is required');
			return;
		}

		if (price !== '' && Number.isNaN(price)) {
			alert('Price must be a number');
			return;
		}

		const payload = { name, description, price, image };
		if (editingId) {
			updateProduct(editingId, payload);
		} else {
			addProduct(payload);
		}
		closeModal();
	});
}


document.addEventListener('DOMContentLoaded', () => {
	loadFromStorage();
	wireUp();
	renderProducts();
});


window.__productEditor = { renderProducts };

