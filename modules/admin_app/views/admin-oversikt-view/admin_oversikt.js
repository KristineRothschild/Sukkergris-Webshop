const templateURL = new URL("./admin_oversikt.html", import.meta.url);

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

const adminOverviewTemplate = await loadTemplate(templateURL);
const adminOverviewStylesURL = new URL("./admin_oversikt.css", import.meta.url);

class AdminOverviewView extends HTMLElement {
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = adminOverviewTemplate.content.cloneNode(true);
    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = adminOverviewStylesURL.href;
    this.shadow.append(styleLink, fragment);
    this.renderAdminMenu();
  }

  renderAdminMenu() {
    const menuContainer = this.shadow.querySelector("[data-admin-menu]");
    if (!menuContainer) return;

    const adminSections = [
      { id: "products", label: "Products" },
      { id: "users", label: "Users" },
      { id: "orders", label: "Orders" },
      { id: "comments", label: "Comments" }
    ];

    adminSections.forEach(section => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "admin-menu-button";
      button.textContent = section.label;
      button.dataset.section = section.id;

      button.addEventListener("click", () => {
        const navigationEvent = new CustomEvent("admin-navigate", {
          composed: true,
          bubbles: true,
          detail: { section: section.id }
        });
        this.shadow.dispatchEvent(navigationEvent);
      });

      menuContainer.appendChild(button);
    });
  }
}

customElements.define("admin-overview-view", AdminOverviewView);

export { AdminOverviewView };