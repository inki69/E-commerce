import handleRemoteRequest from "../shares/api.js";

const categories = document.querySelector("#sideBarCategories");
const loadingElement = document.querySelector("#loading");
const mainElement = document.querySelector("#main-content");
const productsContainer = document.querySelector("#products");
const cartButton = document.querySelector("#cartButton");
const xButton = document.querySelector("#xButton");
const Cart = document.querySelector("#Cart");
const cartItems = document.querySelector("#cartItems");
const increaseButton = document.querySelector('#increaseQuantity');
const decreaseButton = document.querySelector('#decreaseQuantity');
const itemsCount = document.querySelector('#items-count');
const searchInput= document.querySelector('#searchInput');
const searchButton= document.querySelector('#searchButton');
 
const api_status = {
    loading: true,
    error: null
};

let productData = {}; // Object to store product data
let cartData = {}; // Object to store cart data

function fetchProductsByCategory(category) {
    handleRemoteRequest(
        `products/category/${category}`,
         function(data) { 
            productsContainer.innerHTML = ''; // Clear previous products
            productData = {}; // Reset product data
            data.products.forEach(product => {
                productData[product.id] = { ...product, quantity: 0 }; // Store product data with initial quantity 0
                productsContainer.innerHTML += createProductCard(product);
            });
        },
        function(error) {
            Swal.fire({
                icon: 'error',
                title: 'Error fetching products',
                text: error.message,
                confirmButtonText: 'OK'
            });
        },
        function() {
            loadingElement.classList.remove("d-none");
            loadingElement.classList.add("d-flex");
        },
        function() {
            loadingElement.classList.remove("d-flex");
            loadingElement.classList.add("d-none");
        }
    );
}

function createProductCard(product) {
    return `
        <div class="col-md-4">
            <div class="border shadow rounded-2 mb-2 p-1">
                <img src="${product.thumbnail}" class="w-100 mb-2" style="height: 200px" />
                <div class="p-1">
                    <div class="mb-3">
                        <h3 class="mb-1">${product.title}</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="d-flex gap-1 align-items-center">
                        <span>★</span>
                        <div class="px-2 py-1 bg-danger bg-opacity-75 rounded-2">${product.rating}</div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="fw-bold ds-3">$${product.price}</div>
                        <button class="btn btn-primary" onclick="addToCart(${product.id})">Add to cart</button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

window.addToCart = function(productId) {
    
    const product = productData[productId];

    if (product.stock > 0) {
        // Decrease quantity in product data
        product.stock -= 1;
        // Update cart
        if (cartData[productId]) {
            cartData[productId].quantity += 1; // Increment quantity if product already in cart
        } else {
            cartData[productId] = { ...product, quantity: 1 }; // Add new product to cart
        }
        console.log(`Stock after UI update for ${product.title}: ${productData[productId].stock}`);
        updateCartUI();

        Swal.fire({
            icon: 'success',
            title: 'Added to cart',
            text: `${product.title} has been added to your cart.`,
            timer: 1500,
            showConfirmButton: false
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Out of stock',
            text: `${product.title} is out of stock.`,
            timer: 1500,
            showConfirmButton: false
        });
    }
};

function updateCartUI() {
    cartItems.innerHTML = ''; // Clear the existing cart items
    let totalItems = 0;

    for (const productId in cartData) {
        const product = cartData[productId];
        noItems.classList.add('d-none');
        totalItems += product.quantity;
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            <div class="px-3 border py-3 mx-2">
                <div class="fw-bold">${product.title}</div>
                <div>Price: ${product.quantity} x $${product.price} : $${product.price * product.quantity}</div>
                <div class="quantity-control">
                   <i class="fa-solid fa-chevron-up" onclick="increaseCartItem(${product.id})" style="cursor: pointer;"></i>
                   <i class="fa-solid fa-chevron-down" onclick="decreaseCartItem(${product.id})" style="cursor: pointer;"></i>
                </div>
            </div>
        `;
        cartItems.appendChild(cartItem);
        console.log(`Stock after UI update for ${product.title}: ${productData[productId].stock}`);
    }
    if(totalItems<=0){
        noItems.classList.remove('d-none');
        itemsCount.classList.add('d-none');
    }else{
        itemsCount.classList.remove('d-none')
    }
    document.querySelector("#items-count").textContent = totalItems; // Update the cart button badge
}

window.increaseCartItem = function(productId) {
    const product = productData[productId];
    if (product.stock > 0) {
        cartData[productId].quantity += 1;
        product.stock -= 1;
        console.log(`Stock after increaseCartItem for ${product.title}: ${product.stock}`); // Log the updated stock
        updateCartUI();
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Out of stock',
            text: `${product.title} is out of stock.`,
            timer: 1500,
            showConfirmButton: false
        });
    }
};

window.decreaseCartItem = function(productId) {
    const product = cartData[productId];
    if (product.quantity > 1) {
        cartData[productId].quantity -= 1;
        productData[productId].stock += 1;
    } else {
        delete cartData[productId];
        productData[productId].stock += 1;
    }
    console.log(`Stock after decreaseCartItem for ${productData[productId].title}: ${productData[productId].stock}`); // Log the updated stock
    updateCartUI();
};

handleRemoteRequest("products/categories",
    function(data){
        categories.innerHTML = data
            .map((item) => `<li id="${item.slug}" class="category-item my-2">${item.name}</li>`)
            .join("");

        document.querySelectorAll(".category-item").forEach(item => {
            item.addEventListener("click", function() {
                const category = this.id;
                fetchProductsByCategory(category);
            });
        }); 
    },
    function(error){
        Swal.fire({
            icon: 'error',
            title: 'Error fetching categories',
            text: error.message,
            confirmButtonText: 'OK'
        });
    },
    function(){
        loadingElement.classList.remove("d-none")
        loadingElement.classList.add("d-flex")
        mainElement.classList.add("d-none")
        console.log("startLoading");
    },
    function(){
        loadingElement.classList.remove("d-flex")
        loadingElement.classList.add("d-none")
        mainElement.classList.remove("d-none")
        console.log("stopLoading");
    }
);

fetchProductsByCategory("smartphones");

cartButton.addEventListener('click', function() {
    console.log("Cart button clicked");
    Cart.classList.remove('d-none');
});

xButton.addEventListener('click', function() {
    console.log("Close button clicked");
    Cart.classList.add('d-none');
});

searchButton.addEventListener('click', (event) => {
    handleSearch();
    // Prevent the default form submission
    event.preventDefault();
});

// Handle Enter key press in search input
searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleSearch();
        // Prevent the default form submission
        event.preventDefault();
    }
});
function handleSearch() {
    const query = searchInput.value.trim();

    // Check if the search query is empty
    if (query === '') {
        Swal.fire({
            icon: 'warning',
            title: 'No Query Entered',
            text: 'Please enter a search query to find products.',
            confirmButtonText: 'OK'
        });
        return; // Exit the function to avoid making the API call
    }

    const searchEndpoint = `https://dummyjson.com/products/search?q=${query}`;

    fetch(searchEndpoint)
        .then(response => response.json())
        .then(data => {
            if (data.products.length === 0) {
                displayNoResults();
            } else {
                display(data.products);
            }
            // Clear the search bar
            searchInput.value = '';
        })
        .catch(error => {
            console.error('Error searching products:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'An error occurred while searching for products.',
                confirmButtonText: 'OK'
            });
        });
}
function display(products) {
    productsContainer.innerHTML = ''; // Clear previous products
    productData = {}; // Reset product data

    // Check if products is an array
    if (Array.isArray(products)) {
        products.forEach(product => {
            productData[product.id] = { ...product, quantity: 0 }; // Store product data with initial quantity 0
            productsContainer.innerHTML += createProductCard(product); // Add new product cards
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unexpected response format',
            confirmButtonText: 'OK'
        });
    }
}
function displayNoResults() {
    Swal.fire({
        icon: 'info',
        title: 'No Results Found',
        text: 'Sorry, but there are no products that match your search criteria. Please try again with different keywords.',
        confirmButtonText: 'OK'
    });
    
}