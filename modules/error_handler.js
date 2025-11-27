import { showMessage } from "./msg_handler.js";

//--------------------------------------------

export function errorHandler(error) {
  showMessage("Something went wrong: " + error);

  if (typeof console !== "undefined" && typeof console.error === "function") {
    console.error("API-feil:", error);
  }
}
