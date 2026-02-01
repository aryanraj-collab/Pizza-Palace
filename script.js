document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Theme Toggle & Persistence ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // --- 2. Scroll Animations (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    });

    const hiddenElements = document.querySelectorAll('.hidden');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- 3. Shopping Cart Logic ---
    let cart = JSON.parse(localStorage.getItem('pizzaCart')) || [];
    const cartCountEl = document.getElementById('cart-count');
    const cartItemsContainer = document.querySelector('.cart-items');
    const cartTotalEl = document.getElementById('cart-total');
    const cartSidebar = document.getElementById('cart-sidebar');
    
    // Open/Close Cart
    document.querySelector('.cart-icon-wrapper').addEventListener('click', () => {
        cartSidebar.classList.add('open');
        renderCart();
    });
    document.getElementById('close-cart').addEventListener('click', () => {
        cartSidebar.classList.remove('open');
    });

    // Add to Cart
    document.querySelectorAll('.btn-add').forEach(button => {
        button.addEventListener('click', (e) => {
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            addToCart(name, price);
            // Visual feedback
            const originalText = e.target.innerText;
            e.target.innerText = "Added!";
            setTimeout(() => e.target.innerText = originalText, 1000);
        });
    });

    function addToCart(name, price) {
        const existingItem = cart.find(item => item.name === name);
        if (existingItem) {
            existingItem.qty++;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        updateCart();
    }

    function updateCart() {
        localStorage.setItem('pizzaCart', JSON.stringify(cart));
        const totalCount = cart.reduce((acc, item) => acc + item.qty, 0);
        if(cartCountEl) cartCountEl.innerText = totalCount;
        renderCart();
    }

    function renderCart() {
        if (!cartItemsContainer) return; // Guard clause if not on page
        cartItemsContainer.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.qty;
            total += itemTotal;
            const div = document.createElement('div');
            div.classList.add('cart-item');
            div.innerHTML = `
                <div>
                    <strong>${item.name}</strong><br>
                    <small>$${item.price} x ${item.qty}</small>
                </div>
                <div>
                    <span>$${itemTotal.toFixed(2)}</span>
                    <button onclick="removeItem(${index})" style="color:red; background:none; border:none; cursor:pointer; margin-left:5px;">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(div);
        });

        if(cartTotalEl) cartTotalEl.innerText = total.toFixed(2);
    }

    // Expose removeItem to global scope for the onclick handler
    window.removeItem = (index) => {
        cart.splice(index, 1);
        updateCart();
    };

    // Initial Load
    updateCart();

    // --- 4. WhatsApp Checkout ---
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) return alert("Your cart is empty!");
            
            let message = "Hello Pizza Palace! I would like to order:%0A%0A";
            let total = 0;
            cart.forEach(item => {
                message += `- ${item.name} (x${item.qty}) - $${(item.price * item.qty).toFixed(2)}%0A`;
                total += item.price * item.qty;
            });
            message += `%0A*Total Price: $${total.toFixed(2)}*`;
            
            // Replace with actual phone number
            const phoneNumber = "919876543210"; 
            window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
        });
    }

    // --- 5. Particle Background (Canvas) ---
    const canvas = document.getElementById('particles-canvas');
    if(canvas) {
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        let particles = [];
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 1;
                this.speedX = Math.random() * 1 - 0.5;
                this.speedY = Math.random() * 1 - 0.5;
                this.color = 'rgba(200, 200, 200, 0.3)'; // Flour dust color
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                if (this.size > 0.2) this.size -= 0.01; // Fade out
                if (this.size <= 0.2) { // Reset
                    this.x = Math.random() * canvas.width;
                    this.y = Math.random() * canvas.height;
                    this.size = Math.random() * 3 + 1;
                }
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            for (let i = 0; i < 50; i++) {
                particles.push(new Particle());
            }
        }
        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update();
                p.draw();
            });
            requestAnimationFrame(animateParticles);
        }
        initParticles();
        animateParticles();
        
        window.addEventListener('resize', () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        });
    }
});
