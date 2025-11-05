export class categoryView extends HTMLElement {
  //skal vise kategorier i kategori view

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
  }
  refresh(dataArr) {
    const heading = document.createElement("h2");
    heading.innerHTML = `Kategorier`;

    this.shadow.appendChild(heading);

    for (let value of dataArr) {
      const categoryView = document.createElement("div");
      categoryView.innerHTML = `  
      <h3>${value.kategori}</h3><hr>`;
      this.shadow.appendChild(categoryView);

      categoryView.addEventListener("click", () => {
        const plantSelected = new CustomEvent("plantSelected", {
          composed: true,
          bubbles: true,
          detail: value,
        });
        this.shadow.dispatchEvent(plantSelected);
      });
    }
  }
}
customElements.define("category-view", categoryView);

//-----------------------------------------------

export class plantView extends HTMLElement {
  //skal ta deg videre til plantview

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    this.plantView = document.createElement("div");
    const linkElem = document.createElement("link");
    linkElem.setAttribute("rel", "stylesheet");
    linkElem.setAttribute("href", "views.css");
    this.shadow.appendChild(linkElem);
    const backBtn = document.createElement("button");
    backBtn.innerText = "Back";
    backBtn.addEventListener("click", this.backClick.bind(this));

    this.shadow.appendChild(this.plantView);
    this.shadow.appendChild(backBtn);
  }
  //----------------------------------------------
  refresh(dataArr) {
    this.plantView.innerHTML = ""; // Clear previous content

    dataArr.forEach((plant) => {
      const plantCard = document.createElement("div");
      plantCard.innerHTML = `
          <img src="http://sukkergris.no/plantimages/small/${plant.bildefil}" alt="${plant.navn}" />
          <h3>${plant.navn}</h3>
          <p>${plant.beskrivelse}</p>
          <p>Pris: ${plant.pris} kr</p><hr>
        `;
      plantCard.addEventListener("click", () => {
        const plantDetailsEvent = new CustomEvent("plantDetails", {
          composed: true,
          bubbles: true,
          detail: { id: plant.id },
        });
        this.shadow.dispatchEvent(plantDetailsEvent);
      });
      this.plantView.appendChild(plantCard);
    });
  }

  //----------------------------------------------
  backClick(evt) {
    const plantBack = new CustomEvent("plantBack", {
      composed: true,
      bubbles: true,
    });
    this.shadow.dispatchEvent(plantBack);
  }
}

//----------------------------------------------- click funksjon i Kategori som tar deg videre til plantDetail
export class plantDetails extends HTMLElement {
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
      const detailsBack = new CustomEvent("detailsBack", {
        composed: true,
        bubbles: true,
      });
      this.shadow.dispatchEvent(detailsBack);
    });
    this.shadow.appendChild(backBtn);
  }

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
customElements.define("plant-details", plantDetails);

customElements.define("plant-view", plantView);
