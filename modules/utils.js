//--------------------------------------------

export async function sendRequest(url, cfg) {
  try {
    const response = await fetch(url, cfg);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.msg);
    }

    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
}

//--------------------------------------------

export function createBasicAuthString(username, password) {
  let combinedStr = username + ":" + password;
  let b64Str = btoa(combinedStr);
  return "basic " + b64Str;
}

//--------------------------------------------

export function sanitizeString(str) {
  if (!str) {
    return;
  }
  str = str.replace(/[^a-zA-Z0-9 .,_-]/g, "");
  return str.trim();
}
