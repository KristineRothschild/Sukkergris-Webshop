import { errorHandler } from "./error_handler.js";
import { Category, Product } from "./models.js";
import { sendRequest } from "./utils.js";

const groupkey = "HJINAS11";

//--------------------------------------------

export async function getCategories() {
  const url = `https://sukkergris.onrender.com/webshop/categories?key=${groupkey}`;

  try {
    const data = await sendRequest(url);
    const modelData = data.map(function (value) {
      const cat = new Category();
      cat.setFromApiData(value);
      return cat;
    });

    return modelData;
  } catch (error) {
    errorHandler(error);
  }
}

//--------------------------------------------

export async function getProductById(id) {
  const url = `https://sukkergris.onrender.com/webshop/products?id=${id}&key=${groupkey}`;

  try {
    const data = await sendRequest(url);
    const modelData = new Product();
    modelData.setFromApiData(data[0]);
    return modelData;
  } catch (error) {
    errorHandler(error);
  }
}

//--------------------------------------------

export async function addProduct(product) {
  const url = `https://sukkergris.onrender.com/webshop/testdummy/products?key=${groupkey}`;

  const cfg = {
    method: "POST",
    body: product,
  };

  try {
    const data = await sendRequest(url, cfg);
    return data;
  } catch (error) {
    errorHandler(error);
  }
}
