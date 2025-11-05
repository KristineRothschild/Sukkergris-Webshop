 export class categoryView extends HTMLElement {
 
 constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }

//-----------------------------------------------

  refresh(dataArr) {
    this.shadow.innerHTML = "";
    
    const heading = document.createElement("h2");
    heading.innerHTML = `Kategorier`;

    this.shadow.appendChild(heading);

    for (let value of dataArr) {
      const categoryCard = document.createElement("div");
      categoryCard.innerHTML = `  
      <h3>${value.category_name}</h3>
      <p>${value.description}</p><hr>`;
      categoryCard.style.cursor = "pointer";
      this.shadow.appendChild(categoryCard);

      categoryCard.addEventListener("click", () => {
        console.log("Category clicked:", value);
        const categorySelected = new CustomEvent("categorySelected", {
          composed: true,
          bubbles: true,
          detail: value,
        });
        this.shadow.dispatchEvent(categorySelected);
      });
    }
  }
}

//===============================================

export class productListView extends HTMLElement {

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    this.productListView = document.createElement("div");
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "views.css");
    this.shadow.appendChild(linkElem);
    const backBtn = document.createElement("button");
    backBtn.innerText = "Back";
    backBtn.addEventListener("click", this.backClick.bind(this));

    this.shadow.appendChild(this.productListView);
    this.shadow.appendChild(backBtn);
  }

//-----------------------------------------------

  refresh(dataArr) {
    this.productListView.innerHTML = "";

    dataArr.forEach((product) => {
      const productCard = document.createElement("div");
      productCard.innerHTML = `
          <img src="http://sukkergris.no/plantimages/small/${product.bildefil}" alt="${product.navn}" />
          <h3>${product.navn}</h3>
          <p>${product.beskrivelse}</p>
          <p>Pris: ${product.pris} kr</p><hr>
        `;
      productCard.addEventListener("click", () => {
        const productSelected = new CustomEvent("productSelected", {
          composed: true,
          bubbles: true,
          detail: { id: product.id },
        });
        this.shadow.dispatchEvent(productSelected);
      });
      this.productListView.appendChild(productCard);
    });
  }

//-----------------------------------------------

  backClick(evt) {
    const productListBack = new CustomEvent("productListBack", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(productListBack);
  }
}

//===============================================

export class productDetails extends HTMLElement {

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "views.css");
    this.shadow.appendChild(linkElem);

    this.wrapper = document.createElement("div");
    this.shadow.appendChild(this.wrapper);

    const backBtn = document.createElement("button");
    backBtn.innerText = "Back";
    backBtn.addEventListener("click", () => {
      const productDetailsBack = new CustomEvent("productDetailsBack", {
        composed: true,
        bubbles: true,
      });
      this.shadow.dispatchEvent(productDetailsBack);
    });
    this.shadow.appendChild(backBtn);
  }

//-----------------------------------------------

  refresh(data) {
    this.wrapper.innerHTML = `
        <img src="http://sukkergris.no/plantimages/large/${data.bildefil.replace(
          ".png",
          ".jpg"
        )}" alt="${data.navn}" />
        <h2>${data.navn}</h2>
        <p><strong>Kategori:</strong> ${data.kategori}</p>
        <p><strong>Beskrivelse:</strong> ${data.beskrivelse}</p>
        <p><strong>Høyde:</strong> ${data.hoyde}</p>
        <p><strong>Vekstsone:</strong> ${data.vekstsone}</p>
        <p><strong>Gjødselblanding:</strong> ${data.gjodselblanding}</p>
        <p><strong>Plante råd:</strong> ${data.planterad}</p>
        <p><strong>Pris:</strong> ${data.pris} kr</p>
      `;
  }
}

customElements.define("category-view", categoryView);
customElements.define("product-list-view", productListView);
customElements.define("product-details", productDetails);
