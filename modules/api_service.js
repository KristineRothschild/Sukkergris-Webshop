import { errorHandler } from "./error_handler.js";
import { Category, Product } from "./models.js";
import { sendRequest } from "./utils.js";

const groupkey = "HJINAS11"; // your groupkey here

//--------------------------------------------------------
export async function getCategories() {
  const url = `https://sukkergris.onrender.com/webshop/categories?key=${groupkey}`;

  try {
    const data = await sendRequest(url);

    //convert from server API-data to app model-data
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

//--------------------------------------------------------
export async function getAllProducts() {
  const url = `https://sukkergris.onrender.com/webshop/products?key=${groupkey}`;

  try {
    const data = await sendRequest(url);

    //convert from server API-data to app model-data
    const modelData = data.map(function (value) {
      const prod = new Product();
      prod.setFromApiData(value);
      return prod;
    });

    return modelData;
  } catch (error) {
    errorHandler(error);
  }
}

//--------------------------------------------------------
export async function getProductsByCategory(catId) {
  const url = `https://sukkergris.onrender.com/webshop/products?category_id=${catId}&key=${groupkey}`;

  try {
    const data = await sendRequest(url);

    //convert from server API-data to app model-data
    const modelData = data.map(function (value) {
      const prod = new Product();
      prod.setFromApiData(value);
      return prod;
    });

    return modelData;
  } catch (error) {
    errorHandler(error);
  }
}

//--------------------------------------------------------
export async function getProductById(id) {
  const url = `https://sukkergris.onrender.com/webshop/products?id=${id}&key=${groupkey}`;

  try {
    const data = await sendRequest(url);

    //convert from server API-data to app model-data
    const modelData = new Product();
    modelData.setFromApiData(data[0]);
    return modelData;
  } catch (error) {
    errorHandler(error);
  }
}

//--------------------------------------------------------
export async function addProduct(product) {
  const url = `https://sukkergris.onrender.com/webshop/testdummy/products?key=${groupkey}`;

  const cfg = {
    method: "POST",
    body: product, //NB! product as formdata
  };

  try {
    const data = await sendRequest(url, cfg);
    return data;
  } catch (error) {
    errorHandler(error);
  }
}

//---------------------------------------------------------

export async function addOrder(orderData) {
  const url = `https://sukkergris.onrender.com/webshop/orders?key=${groupkey}`;
  const token = sessionStorage.getItem("token");

  const cfg = {
    method: "POST",
    headers: {
      "authorization": token || "",
      "content-type": "application/json"
    },
    body: JSON.stringify(orderData)
  };

  try {
    const data = await sendRequest(url, cfg);
    return data; // ← Dette inneholder { order_number: "12345", ... }
  } catch (error) {
    errorHandler(error);
  }
}

//add more functions below when needed

//--------------------------------------------------------
export async function getShippingMethods() {
  const url = `https://sukkergris.onrender.com/logistics/shippingtypes?key=${groupkey}`;

  try {
    const data = await sendRequest(url);
    return data;
  } catch (error) {
    errorHandler(error);
  }
}
