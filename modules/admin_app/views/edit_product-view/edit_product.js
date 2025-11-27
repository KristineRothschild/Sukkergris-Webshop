const templateURL = new URL("./edit_product.html", import.meta.url);
const stylesURL = new URL("./edit_product.css", import.meta.url);
const STORAGE_KEY = "localProducts";

//--------------------------------------------

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kunne ikke hente template fra ${url}`);
  }
  const html = await response.text();
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

const editProductTemplate = await loadTemplate(templateURL);

export class EditProductView extends HTMLElement {
  //--------------------------------------------

  constructor() {
    super();
    this.products = [];
    this.editingId = null;
    this.shadow = this.attachShadow({ mode: "open" });

    const fragment = editProductTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = stylesURL.href;

    this.shadow.append(styleLink, fragment);

    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
  }

  //--------------------------------------------

  connectedCallback() {
    this.cacheElements();
    this.bindEvents();
    this.loadFromStorage();
    this.renderProducts();
    document.addEventListener("keydown", this.handleDocumentKeyDown);
  }

  //--------------------------------------------

  disconnectedCallback() {
    this.unbindEvents();
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }

  //--------------------------------------------

  cacheElements() {
    this.productList = this.shadow.querySelector("#productList");
    this.modal = this.shadow.querySelector("#productModal");
    this.addProductBtn = this.shadow.querySelector("#addProductBtn");
    this.cancelBtn = this.shadow.querySelector("#cancelBtn");
    this.backBtn = this.shadow.querySelector("#backBtn");
    this.form = this.shadow.querySelector("#productForm");
    this.nameInput = this.shadow.querySelector("#prodName");
    this.descInput = this.shadow.querySelector("#prodDesc");
    this.priceInput = this.shadow.querySelector("#prodPrice");
    this.imageInput = this.shadow.querySelector("#prodImage");
    this.modalTitle = this.shadow.querySelector("#modalTitle");
    this.imagePreview = this.shadow.querySelector("#imagePreview");
  }

  //--------------------------------------------

  bindEvents() {
    this.addProductBtn?.addEventListener("click", this.openModalForAdd);
    this.cancelBtn?.addEventListener("click", this.closeModal);
    this.backBtn?.addEventListener("click", this.emitBackEvent);
    this.imageInput?.addEventListener("input", this.handlePreviewUpdate);
    this.modal?.addEventListener("click", this.handleModalBackdrop);
    this.form?.addEventListener("submit", this.handleSubmit);
  }

  //--------------------------------------------

  unbindEvents() {
    this.addProductBtn?.removeEventListener("click", this.openModalForAdd);
    this.cancelBtn?.removeEventListener("click", this.closeModal);
    this.backBtn?.removeEventListener("click", this.emitBackEvent);
    this.imageInput?.removeEventListener("input", this.handlePreviewUpdate);
    this.modal?.removeEventListener("click", this.handleModalBackdrop);
    this.form?.removeEventListener("submit", this.handleSubmit);
  }

  //--------------------------------------------

  loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.products = raw ? JSON.parse(raw) : [];
    } catch (err) {
      console.error("Failed to load products", err);
      this.products = [];
    }
  }

  //--------------------------------------------

  saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.products));
  }

  //--------------------------------------------

  formatPrice(value) {
    if (value == null || value === "") {
      return "";
    }

    return `${Number(value).toFixed(2)} kr.`;
  }

  //--------------------------------------------

  renderProducts() {
    if (!this.productList) return;
    this.productList.innerHTML = "";

    if (!this.products.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent =
        'No products yet — click "Add product" to create one.';
      this.productList.appendChild(empty);
      return;
    }

    this.products.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";

      const img = document.createElement("img");
      img.src =
        product.image ||
        'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="%23efe7de"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%236a5b52" font-size="24">No image</text></svg>';
      img.alt = product.name || "Product image";

      const title = document.createElement("h3");
      title.textContent = product.name || "Untitled";

      const description = document.createElement("p");
      description.textContent = product.description || "";

      const divider = document.createElement("hr");

      const price = document.createElement("div");
      price.style.fontWeight = "600";
      price.textContent = this.formatPrice(product.price);

      const actions = document.createElement("div");
      actions.style.display = "flex";
      actions.style.gap = "0.5rem";
      actions.style.marginTop = "0.5rem";

      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "back-button";
      editBtn.style.padding = "0.35rem 0.8rem";
      editBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.openModalForEdit(product.id);
      });
      actions.appendChild(editBtn);

      if (product.isLocal) {
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "back-button";
        deleteBtn.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this.deleteProduct(product.id);
        });
        actions.appendChild(deleteBtn);
      }

      card.append(img, title, description, divider, price, actions);
      this.productList.appendChild(card);
    });
  }

  //--------------------------------------------

  openModalForEdit = (id) => {
    this.editingId = id;
    const product = this.products.find((item) => item.id === id);
    if (!product) return;
    if (this.modalTitle) this.modalTitle.textContent = "Edit product";
    if (this.nameInput) this.nameInput.value = product.name || "";
    if (this.descInput) this.descInput.value = product.description || "";
    if (this.priceInput) this.priceInput.value = product.price ?? "";
    if (this.imageInput) this.imageInput.value = product.image || "";
    this.updatePreview(product.image || "");
    this.openModal();
  };

  //--------------------------------------------

  openModalForAdd = () => {
    this.editingId = null;
    if (this.modalTitle) this.modalTitle.textContent = "Add product";
    this.form?.reset();
    this.updatePreview("");
    this.openModal();
  };

  //--------------------------------------------

  openModal() {
    if (!this.modal) return;
    this.modal.classList.remove("hidden");
    this.modal.setAttribute("aria-hidden", "false");
    this.nameInput?.focus();
  }

  //--------------------------------------------

  closeModal = () => {
    if (!this.modal) return;
    this.modal.classList.add("hidden");
    this.modal.setAttribute("aria-hidden", "true");
  };

  //--------------------------------------------

  handleModalBackdrop = (event) => {
    if (event.target === this.modal) {
      this.closeModal();
    }
  };

  //--------------------------------------------

  handlePreviewUpdate = (event) => {
    this.updatePreview(event.target.value);
  };

  //--------------------------------------------

  updatePreview(url) {
    if (!this.imagePreview) return;
    if (!url) {
      this.imagePreview.src = "";
      this.imagePreview.style.display = "none";
      return;
    }
    this.imagePreview.src = url;
    this.imagePreview.style.display = "block";
  }

  //--------------------------------------------

  addProduct(payload) {
    const id = Date.now().toString();
    this.products.unshift({ id, ...payload, isLocal: true });
    this.saveToStorage();
    this.renderProducts();
  }

  //--------------------------------------------

  updateProduct(id, updates) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return;
    this.products[index] = { ...this.products[index], ...updates };
    this.saveToStorage();
    this.renderProducts();
  }

  //--------------------------------------------

  deleteProduct(id) {
    const index = this.products.findIndex((product) => product.id === id);
    if (index === -1) return;
    if (!this.products[index].isLocal) {
      alert("Only locally added products can be deleted.");
      return;
    }
    if (!confirm("Delete this product?")) return;
    this.products.splice(index, 1);
    this.saveToStorage();
    this.renderProducts();
  }

  //--------------------------------------------

  handleSubmit = (event) => {
    event.preventDefault();
    const name = this.nameInput?.value.trim();
    const description = this.descInput?.value.trim();
    const priceRaw = this.priceInput?.value ?? "";
    const price = priceRaw === "" ? "" : Number(priceRaw);
    const image = this.imageInput?.value.trim();

    if (!name) {
      alert("Name is required");
      return;
    }

    if (price !== "" && Number.isNaN(price)) {
      alert("Price must be a number");
      return;
    }

    const payload = { name, description, price, image };
    if (this.editingId) {
      this.updateProduct(this.editingId, payload);
    } else {
      this.addProduct(payload);
    }
    this.closeModal();
  };

  //--------------------------------------------

  emitBackEvent = () => {
    this.dispatchEvent(
      new CustomEvent("edit-product-back", {
        bubbles: true,
        composed: true,
      })
    );
  };

  //--------------------------------------------

  handleDocumentKeyDown(event) {
    if (
      event.key === "Escape" &&
      this.modal &&
      !this.modal.classList.contains("hidden")
    ) {
      this.closeModal();
    }
  }
}

customElements.define("edit-product-view", EditProductView);
