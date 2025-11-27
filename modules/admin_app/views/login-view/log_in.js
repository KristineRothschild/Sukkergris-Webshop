const templateURL = new URL("./log_in.html", import.meta.url);
const stylesURL = new URL("./log_in.css", import.meta.url);
const iconStylesURL =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css";

//--------------------------------------------

async function loadTemplate(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Kunne ikke laste login-template fra ${url}`);
  }
  const html = await response.text();
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

const loginTemplate = await loadTemplate(templateURL);

class AdminLoginView extends HTMLElement {

//--------------------------------------------

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    const fragment = loginTemplate.content.cloneNode(true);

    const styleLink = document.createElement("link");
    styleLink.rel = "stylesheet";
    styleLink.href = stylesURL.href;

    const iconLink = document.createElement("link");
    iconLink.rel = "stylesheet";
    iconLink.href = iconStylesURL;

    this.shadow.append(styleLink, iconLink, fragment);
  }

//--------------------------------------------

  connectedCallback() {
    this.form = this.shadow.querySelector("#loginForm");
    if (this.form) {
      this.form.addEventListener("submit", this.handleSubmit);
    }
  }

//--------------------------------------------

  disconnectedCallback() {
    if (this.form) {
      this.form.removeEventListener("submit", this.handleSubmit);
    }
  }

//--------------------------------------------

  handleSubmit = (event) => {
    event.preventDefault();

    const usernameInput = this.shadow.querySelector("#username");
    const passwordInput = this.shadow.querySelector("#password");

    const username = usernameInput?.value.trim();
    const password = passwordInput?.value.trim();

    if (!username || !password) {
      alert("Please enter both username and password.");
      return;
    }

    const validUsername = "augustus.gloop@sukkergris.no";
    const validPassword = "laffytaffy";

    if (username === validUsername && password === validPassword) {
      document.dispatchEvent(

        new CustomEvent("admin-login-success", {
          bubbles: true,
          composed: true,
        })
      );
      return;
    }

    alert("Invalid username or password.");
  };
}

customElements.define("admin-login-view", AdminLoginView);

export { AdminLoginView };
