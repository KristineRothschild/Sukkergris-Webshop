const templateURL = new URL("./home-view.html", import.meta.url);
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

const homeViewTemplate = await loadTemplate(templateURL);
const homeViewStylesURL = new URL("./home-view.css", import.meta.url);

class HomeView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = homeViewTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = homeViewStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.categoryGrid = this.shadow.querySelector("[data-category-grid]");
    this.registerEventListeners();
  }

  //------------------------------------------------

  refresh(categories = []) {
    if (!this.categoryGrid) {
      return;
    }
    this.categoryGrid.innerHTML = "";

    if (!Array.isArray(categories) || categories.length === 0) {
      this.categoryGrid.innerHTML =
        '<p class="empty-state">No categories to show at the moment.</p>';
      return;
    }

    categories.forEach((category) => {
      const cardButton = document.createElement("button");
      cardButton.type = "button";
      cardButton.className = "category-pill";
      cardButton.textContent = this.resolveCategoryName(category);

      cardButton.addEventListener("click", () => {
        const categorySelected = new CustomEvent("categorySelected", {
          composed: true,
          bubbles: true,
          detail: category,
        });
        this.shadow.dispatchEvent(categorySelected);
      });

      this.categoryGrid.appendChild(cardButton);
    });
  }

  //------------------------------------------------

  registerEventListeners() {
    const searchForm = this.shadow.querySelector(".hero-search");
    if (searchForm) {
      searchForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const searchInput = this.shadow.querySelector(".hero-search-input");
        const searchTerm = searchInput?.value?.trim() ?? "";
        const searchSubmitted = new CustomEvent("searchSubmitted", {
          composed: true,
          bubbles: true,
          detail: { searchTerm },
        });
        this.shadow.dispatchEvent(searchSubmitted);
      });
    }

    const cartButton = this.shadow.querySelector(".cart-button");
    if (cartButton) {
      cartButton.addEventListener("click", () => {
        const cartRequested = new CustomEvent("cartRequested", {
          composed: true,
          bubbles: true,
        });
        this.shadow.dispatchEvent(cartRequested);
      });
    }
  }

  //------------------------------------------------

  resolveCategoryName(category) {
    return (
      category?.category_name || category?.name || category?.title || "Category"
    );
  }
}

customElements.define("home-view", HomeView);

export { HomeView };
