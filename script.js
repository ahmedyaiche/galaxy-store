document.addEventListener('DOMContentLoaded', () => {
    const products = [
        { id: 1, name: 'Classic T-Shirt', price: 25.00, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8j4NDKIWRRwAlcuW0OBmqcKqGvsoUCDrRbw&s' },
        { id: 2, name: 'Modern Smartphone', price: 699.99, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTpKzBhoyLGkzI3mtHBLyB9wqKK_CIR2lcPiw&s' },
        { id: 3, name: 'Elegant Perfume', price: 120.00, image: 'https://lorisnicheparfum.com/cdn/shop/files/elegant-mavi-3_800x.webp?v=1709213574' },
        { id: 4, name: 'Stylish Sneakers', price: 85.50, image: 'https://5.imimg.com/data5/ECOM/Default/2023/5/305209298/IT/XN/QT/188540598/1680870764468-red0-edr-1-copy-originnm80prcnt-500x500.webp' },
        { id: 5, name: 'Luxury Watch', price: 450.00, image: 'https://gmtwatches.ae/wp-content/uploads/2024/09/rolex-1.webp' },
        { id: 6, name: 'DeJacketnim ', price: 75.00, image: 'https://images.squarespace-cdn.com/content/v1/637024e335aaac2541adfed8/1668637750712-XPVVO4722FELT6S8XWBZ/unisex-denim-jacket-black-denim-front-63756428bb9a0.png?format=1000w' },
        { id: 7, name: 'Smartphone Pro', price: 999.99, image :'https://techland.tn/uploads/media/91da12NjvO5D5S8kX83j48fBJW227l9JZZTPe65D.webp' },
        { id: 8, name: 'Ocean Breeze Perfume', price: 95.00, image: 'https://i.ebayimg.com/images/g/9FgAAOSwi9Nm2GJ-/s-l1200.jpg' },
    ];

    const productsGrid = document.getElementById('products-grid');
    const cartButton = document.getElementById('cart-button');
    const cartCount = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const closeModalButton = document.querySelector('.close-button');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutBtn = document.getElementById('checkout-btn');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let audioContext;
    let addToCartBuffer;

    // --- Audio Setup ---
    function initAudio() {
        if (audioContext) return;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        fetch('add-to-cart.mp3')
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(decodedData => {
                addToCartBuffer = decodedData;
            })
            .catch(error => console.error('Error loading sound:', error));
    }

    function playSound(buffer) {
        if (!audioContext || !buffer) return;
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        const source = audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(audioContext.destination);
        source.start(0);
    }
    
    // --- Product Rendering ---
    function renderProducts() {
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
                </div>
            `;
            productsGrid.appendChild(productCard);
        });
    }

    // --- Cart Logic ---
    function addToCart(productId) {
        const product = products.find(p => p.id === productId);
        const cartItem = cart.find(item => item.id === productId);

        if (cartItem) {
            cartItem.quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        playSound(addToCartBuffer);
        updateCart();
    }
    
    function updateCart() {
        renderCartItems();
        updateCartCount();
        updateCartTotal();
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
    }
    
    function updateCartTotal() {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        cartTotal.textContent = total.toFixed(2);
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            return;
        }

        cartItemsContainer.innerHTML = '';
        cart.forEach(item => {
            const cartItemElement = document.createElement('div');
            cartItemElement.className = 'cart-item';
            cartItemElement.innerHTML = `
                <div class="cart-item-info">
                    <img src="${item.image}" alt="${item.name}">
                    <div>
                        <strong>${item.name}</strong><br>
                        <span>$${item.price.toFixed(2)} x ${item.quantity}</span>
                    </div>
                </div>
                <span>$${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(cartItemElement);
        });
    }
    
    function clearCart() {
        cart = [];
        updateCart();
    }

    // --- Modal Logic ---
    function showCartModal() {
        cartModal.style.display = 'block';
    }

    function hideCartModal() {
        cartModal.style.display = 'none';
    }

    // --- Event Listeners ---
    productsGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn')) {
            if (!audioContext) initAudio(); // Init audio on first user interaction
            const productId = parseInt(e.target.dataset.id, 10);
            addToCart(productId);
        }
    });

    cartButton.addEventListener('click', showCartModal);
    closeModalButton.addEventListener('click', hideCartModal);
    window.addEventListener('click', (e) => {
        if (e.target === cartModal) {
            hideCartModal();
        }
    });
    
    clearCartBtn.addEventListener('click', () => {
        clearCart();
    });

    checkoutBtn.addEventListener('click', () => {
        if (cart.length > 0) {
            alert('Thank you for your purchase!');
            clearCart();
            hideCartModal();
        } else {
            alert('Your cart is empty.');
        }
    });


    // --- Initial Load ---
    renderProducts();
    updateCart();
});

