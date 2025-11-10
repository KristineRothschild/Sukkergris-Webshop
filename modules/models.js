//======================================
export class Product {
  //----------------------
  setFromApiData(apiData) {
    this.id = apiData.id;
    this.catId = apiData.category_id;
    this.name = apiData.name;
    this.description = apiData.description;
    this.price = apiData.price;
    this.image = apiData.image;
    this.thumb = apiData.thumb;
    this.heading = apiData.heading;

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
