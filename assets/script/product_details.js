console.log("hey Mahnoor")
// get the category and sub category id from url
let getUrlParams = function (url) {
  let params = {};
  (url + "?")
    .split("?")[1]
    .split("&")
    .forEach(function (pair) {
      pair = (pair + "=").split("=").map(decodeURIComponent);
      if (pair[0].length) {
        params[pair[0]] = pair[1];
      }
    });

  return params;
};

// asynchronous function to get fetch products from JSON
async function getProductDetails() {
  let products = true;

  // get the id's
  let params = getUrlParams(window.location.href);
  let pid = params.p_id; // product id url

  // fetch the data from local json file
  // ***NOTE: Live Server Extension should be
  // installed for fetching local JSON.
  const response = await fetch("../assets/JSON/exotic-parts.json");

  //convert the response in JSON format
  const categories = await response.json();

  categories.forEach((category) => {
    // get sub categories array from each category
    let sub_categories = category.autoSubPart;
    sub_categories.forEach((sub_cat) => {
      // get product array from each sub category
      let product_categories = sub_cat.products;
      let similar_products = []; //similar products array

      product_categories.forEach((product_detail) => {

        // console.log("subcat: " + sub_cat.c_id);
        if (product_detail.p_id == pid) {
          products = sub_cat.products;
          // console.log(products);
          // set the products information and product specs into the UI
          document.querySelector(".products-container").innerHTML = products
            .map((product) => {
              if (product.p_id == pid) {
                if (product.stock_amount == 0) {
                  product.stock_amount = "Out Of Stock";
                } else {
                  product.stock_amount = "In Stock";
                }

                return `
              <div class = "container">
              <div class="row">
              <div class="col-md-6">
                <div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel">
                    <ol class="carousel-indicators">
                        <li data-target="#carouselExampleIndicators" data-slide-to="0" class="active"></li>
                        <li data-target="#carouselExampleIndicators" data-slide-to="1"></li>
                    </ol>
                    <div class="carousel-inner">
                        <div class="carousel-item active">
                            <img src=${product.url1} class="d-block w-100" alt="...">
                        </div>
                        <div class="carousel-item">
                            <img src=${product.url2} class="d-block w-100"
                                alt="...">
                        </div>
                    </div>
                    <a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="sr-only">Previous</span>
                    </a>
                    <a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="sr-only">Next</span>
                    </a>
                </div>
            </div>

            <div class="col-md-6 product-det">
                <p><p><b> <a href="../index.html">Home</a> / <a href="../index.html#${category.id}"> ${category.autoPart}</a> / <a href="product.html?id=${category.id}&c_id=${sub_cat.c_id}"> ${sub_cat.name} </a> / ${product_detail.name}</b></p>
                <hr></p>
                <h1>${product.name}</h1>
                <p>Product Code: ${product.p_id}</p>
                <p>${product.description}</p>
                <h4 class="product-price">Rs: ${product.price}</h4>
                <p><b>Company:</b> Exotic Parts</p>
                <p><b>Warranty:</b> 30 Days</p>
                <p><b>Availability:</b> <span class="badge badge-pill badge-primary">${product.stock_amount}</span></p>

                <div>
                    <label>Quantity:</label>
                    <button class="sub-product">-</button>
                    <input type="number" name="quantity" value="1" disabled class="product-quantity">
                    <button class="add-product">+</button>
                    <button type="button" class="btn btn-default cart add-to-cart">Add to Cart</button>
                </div>
                <hr>
            </div>
            </div>
        </div>
        <div class="container">
        <div class="row">
            <div class="col-sm-12">
                <h3 class="title"> Product Specs</h3>
                <hr>
            </div>
        </div>

        <div class="row">
            <div class="col-sm-12">
                <p>${product.description}.</p>
            </div>
        </div>
    </div> `;
              }
              else {
                similar_products.push(product); //add other products into 

                // set first 3 similar products in the product details page
                document.querySelector(".similar-products").innerHTML = similar_products.map((similarProduct, index) => {
                  if (index < 3) {
                    return `<div class="col-md-4 text-center">
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><img src="${similarProduct.url1}" height="300" ></a>
                              <a href="product_detail.html?p_id=${similarProduct.p_id}"><h6 class="mt-2 similar-product-heading">${similarProduct.name}</h6></a>
                              <span class="badge badge-pill badge-primary py-2 px-3">${similarProduct.price} RS.</span>
                          </div>`;
                  }
                }).join("");
              }
            })
            .join("");

          // adding add to cart functionality using the product data
          function addToCart() {
            let quantity = 1;
            let totalPrice = product_detail.price; //set initial price w.r.t 1 product quantity

            // get elements
            let subtractProduct = document.querySelector(".sub-product");
            let addProduct = document.querySelector(".add-product");
            let productQuantity = document.querySelector(".product-quantity");
            let addToCart = document.querySelector(".add-to-cart");

            // add totalprice and quantity
            addProduct.onclick = function () {
              totalPrice += product_detail.price;
              quantity++;
              productQuantity.value = quantity;
            };
            // subtract totalprice and quantity
            subtractProduct.onclick = function () {
              if (quantity > 1) {
                totalPrice -= product_detail.price;
                quantity--;
                productQuantity.value = quantity;
              }
            };
            // Save the total price and quantiy from all the products
            addToCart.onclick = function () {
              // adding the selected products in local storage
              let productKey = product_detail.p_id; // generating unique key w.r.t to the product id for storing product in local storage

              // getting all selected product details
              let productJson = {
                product_id: product_detail.p_id,
                category_name: category.autoPart,
                product_name: product_detail.name,
                product_description: product_detail.description,
                product_image: product_detail.url1,
                product_quantity: productQuantity.value,
                product_price: product_detail.price,
                total_price: totalPrice
              };

              // storing purchased product detail in local storage with totalprice and quantity
              localStorage.setItem(productKey, JSON.stringify(productJson));
              setTimeout(location.reload(), 1000);

             
            };
           

          }

          // function call - add products into localStorage
          addToCart();
         
        }

      });
    });
  });
  // location.reload();

}
//function calling - get products

getProductDetails();
function showQuantity() {
  let cartProducts = []; //adding all localSctorage products into array
  let totalQuantity = 0; //set initial quantity to 0
  let hasQuantityShow = false;

   for (let i = 0; i < localStorage.length; i++) {
    //get product from local storage
    let product = localStorage.getItem(localStorage.key(i));

    //parse the string into JSON
     product = JSON.parse(product);
    //check the data is product not users
     if (product.product_id !== undefined) {
      // add the products into cart
       cartProducts.push(product);
    //   changing quantity type from string to integer
      let quantityInNumber = parseInt(product.product_quantity);
      //adding total quantity of all products
      totalQuantity += quantityInNumber;
    }
  }
  console.log(totalQuantity)
  document.querySelector(".total-quantity").innerHTML = cartProducts.map(
    (product) => {
      if (!hasQuantityShow) {
        hasQuantityShow = true;
        return `<span>${totalQuantity}</span>`;
      }
    }
  ).join('');
}
showQuantity();
