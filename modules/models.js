export class Product {

//--------------------------------------------

  setFromApiData(apiData) {
    this.id = apiData.id;
    this.catId = apiData.category_id;
    this.name = apiData.name;
    this.description = apiData.description;
    this.price = apiData.price;
    this.image = apiData.image;
    this.thumb = apiData.thumb;
    this.heading = apiData.heading;
    this.discount = apiData.discount;
    this.stock = apiData.stock;
    this.rating = apiData.rating;
    this.expected_shipped = apiData.expected_shipped;
  }
}
export class Category {

//--------------------------------------------

  setFromApiData(apiData) {
    this.id = apiData.id;
    this.catName = apiData.category_name;
    this.catDescr = apiData.description;
  }
}
