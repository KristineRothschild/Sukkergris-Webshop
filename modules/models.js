//======================================
export class Product {
  //----------------------
  setFromApiData(apiData) {
    this.id = apiData.id;
    this.catId = apiData.category_id;
    this.name = apiData.name;
    this.descr = apiData.description;
    this.price = apiData.price;

    //if needed, add more properties
  }
}

//======================================
export class Category {
  //----------------------
  setFromApiData(apiData) {
    this.id = apiData.id;
    this.catName = apiData.category_name;
    this.catDescr = apiData.description;

    //if needed, add more properties
  }
}

//======================================

// Add more model-classes below, e.g.:
// Order, User, Comment...
