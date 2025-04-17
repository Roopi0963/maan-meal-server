import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css"; // Ensure correct path for styles
import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { Truck, Shield, RefreshCw, Clock, Palette, PenTool as Tool, BookOpen, Users as UsersIcon } from 'lucide-react';

const images = [
  "https://i.pinimg.com/736x/f7/65/f3/f765f318aaa2660cb8ac6fb3cfa09b3a.jpg",
  "https://i.pinimg.com/originals/b3/50/47/b35047dc0cd424272cb500e53494f75a.jpg",
  "https://img.freepik.com/premium-photo/close-up-wheat_81048-38123.jpg",
  "https://img.freepik.com/premium-photo/vegetables-fruits-top-view-with-copy-space_79782-5581.jpg",
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  useEffect(() => {
    const autoSlide = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    return () => clearInterval(autoSlide);
  }, []);

  // Fetch products directly (similar to ProductsPage1)
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get("http://localhost:8080/api/products");
        
        // Process products to include image URLs
        const productsWithImages = await Promise.all(
          data.map(async (product, index) => {
            try {
              // Check if imageData is already available in the API response
              if (product.imageData) {
                const imageUrl = `data:${product.imageType || 'image/jpeg'};base64,${product.imageData}`;
                // Add animation delay for staggered effect
                const animationDelay = `${index * 0.1}s`;
                return { 
                  ...product, 
                  imageUrl, 
                  animationDelay, 
                  isNew: Math.random() > 0.7,
                  productAvailable: (product.stockQuantity > 0) && product.productAvailable
                };
              } else {
                // Fallback to fetching image if imageData is not in API response
                const { data: imageBlob } = await axios.get(
                  `http://localhost:8080/api/product/${product.id}/image`,
                  { responseType: "blob" }
                );
                const imageUrl = URL.createObjectURL(imageBlob);
                const animationDelay = `${index * 0.1}s`;
                return { 
                  ...product, 
                  imageUrl, 
                  animationDelay, 
                  isNew: Math.random() > 0.7,
                  productAvailable: (product.stockQuantity > 0) && product.productAvailable
                };
              }
            } catch (error) {
              console.error(`Error fetching image for product ID: ${product.id}`, error);
              return { 
                ...product, 
                imageUrl: "/images/placeholder.png", 
                animationDelay: `${index * 0.1}s`, 
                isNew: Math.random() > 0.7,
                productAvailable: (product.stockQuantity > 0) && product.productAvailable
              };
            }
          })
        );
        
        setProducts(productsWithImages);
        
        // Get trending/featured products (limit to 4 for the trending section)
        const featuredProducts = productsWithImages
          .filter(product => product.productAvailable)
          .slice(0, 4);
        setFilteredProducts(featuredProducts);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const addToCart = async (productId, quantity, e) => {
    e.preventDefault(); // Prevent navigation
    
    // Check if user is logged in
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      alert("Please login to add items to your cart");
      navigate("/login");
      return;
    }
    
    const cartId = 1;

    try {
      const product = products.find((p) => p.id === productId);

      if (!product || !product.productAvailable || product.stockQuantity <= 0) {
        alert("This product is out of stock.");
        return;
      }

      const totalPrice = product.price * quantity;

      await axios.post(
        `http://localhost:8080/api/cart/users/${userId}/cart/products/${productId}/quantity/${quantity}`,
        {
          cart_id: cartId,
          user_id: userId,
          total_price: totalPrice,
        }
      );

      alert("Product added to cart successfully!");

      const cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
      const existingItemIndex = cartItems.findIndex((item) => item.id === productId);

      if (existingItemIndex > -1) {
        cartItems[existingItemIndex].quantity += quantity;
        cartItems[existingItemIndex].total_price += totalPrice;
      } else {
        cartItems.push({
          id: productId,
          name: product.name,
          price: product.price,
          quantity,
          total_price: totalPrice,
          imageUrl: product.imageUrl,
        });
      }

      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    } catch (error) {
      console.error("Error adding product to cart:", error.response ? error.response.data : error.message);
      alert("Failed to add product to cart.");
    }
  };

  // New function to handle product click
  const handleProductClick = (productId, e) => {
    e.preventDefault(); // Prevent default link behavior
    
    // Check if user is logged in
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      // Save the intended product page in localStorage to redirect after login
      localStorage.setItem("redirectAfterLogin", `/product2/${productId}`);
      navigate("/login");
    } else {
      // User is logged in, proceed to product page
      navigate(`/product2/${productId}`);
    }
  };

  return (
    <div>
      <header>
        <nav className="navbarrr">
          <div className="logoooo">
            <img src="/images/logo.png" alt="Logo" className="logo-imgggg" />
            Maan Meal
          </div>
          <div className="nav-container">
          <ul className="nav-links">
  <li><button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>Home</button></li>
  <li><button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>About</button></li>
  <li><button onClick={() => document.getElementById('trending').scrollIntoView({ behavior: 'smooth' })}>Products</button></li>
  <li><button onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>Services</button></li>
  <li><button onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact</button></li>
  
</ul>
            <button className="artisan-btn" onClick={() => navigate("/signup1")}>
              Join as Farmer
            </button>
          </div>
        </nav>
      </header>

      {/* Background Slideshow */}
      <section className="slideshow">
        <div className="slides" style={{ transform: `translateX(-${currentIndex * 100}vw)`, transition: "transform 1s ease-in-out" }}>
          {images.map((src, index) => (
            <div className="slide" key={index}>
              <img src={src} alt={`Handicrafts ${index + 1}`} />
            </div>
          ))}
        </div>
      </section>

      {/* Dots for Image Indicators */}
      <div className="dots-container">
        {images.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(index)}
          ></div>
        ))}
      </div>

      {/* Overlay Section */}
      <div className="overlay">
        <h1>Bringing You Closer to the Hands That Feed You</h1>

        <div className="auth-buttons">
          <button className="login2" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="signup2" onClick={() => navigate("/signup")}>
            Signup
          </button>
        </div>
      </div>

      <div className="home-container">
        {/* About Section */}
        {/* About Section */}
        <section id="about" className="about-section">
          <div className="about-container">
            <h2 className="about-title">About Maan Meal</h2>
            <p className="about-description">
              We bridge the gap between farmers and consumers, promoting sustainability and ensuring fresh, local produce delivery.
            </p>
            <div className="about-cards">
              <div className="about-card">
                <div className="about-icon">
                  <span role="img" aria-label="Heart" className="emoji">🥗</span>
                </div>
                <h3 className="about-card-title">Fresh Produce</h3>
                <p className="about-card-description">Our platform connects you directly with local farmers for the freshest produce.</p>
              </div>
              <div className="about-card">
                <div className="about-icon">
                  <span role="img" aria-label="Award" className="emoji">🌱</span>
                </div>
                <h3 className="about-card-title">Sustainable Practices</h3>
                <p className="about-card-description">We promote eco-friendly farming practices that benefit both farmers and consumers.</p>
              </div>
              <div className="about-card">
                <div className="about-icon">
                  <span role="img" aria-label="Community" className="emoji">🤝</span>
                </div>
                <h3 className="about-card-title">Community Focused</h3>
                <p className="about-card-description">Supporting local farmers and fostering a community of conscious consumers.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
                <section id="features" className="features-section">
                  <div className="features-container">
                    <h2 className="features-title">Why Choose Maan Meal</h2>
                    <p className="features-description">Experience the benefits of direct farmer-to-consumer connections.</p>
                    <div className="features-grid">
                      <div className="feature-card">
                        <Truck className="feature-icon" />
                        <h3 className="feature-title">Reliable Delivery</h3>
                        <p className="feature-description">Fresh produce delivered directly to your doorstep.</p>
                      </div>
                      <div className="feature-card">
                        <Shield className="feature-icon" />
                        <h3 className="feature-title">Transparent Pricing</h3>
                        <p className="feature-description">Know the cost and origin of every item you purchase.</p>
                      </div>
                      <div className="feature-card">
                        <RefreshCw className="feature-icon" />
                        <h3 className="feature-title">Reduced Waste</h3>
                        <p className="feature-description">Better demand forecasting helps minimize food waste.</p>
                      </div>
                      <div className="feature-card">
                        <Clock className="feature-icon" />
                        <h3 className="feature-title">24/7 Support</h3>
                        <p className="feature-description">We're here to assist you anytime you need help.</p>
                      </div>
                    </div>
                  </div>
                </section>

        {/* Products Section */}
        <section id="trending" className="artisan-product-gallery22">
          <h2 className="textc">Popular Harvest</h2>
          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : error ? (
            <div className="error-state">{error}</div>
          ) : (
            <div className="artisan-product-grid">
              {filteredProducts.length === 0 ? (
                <h2 className="artisan-no-products">No Products Available</h2>
              ) : (
                filteredProducts.map((product) => (
                  <div 
                    className="artisan-product-card" 
                    key={product.id}
                    onClick={(e) => handleProductClick(product.id, e)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div>
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="artisan-product-img" 
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/images/placeholder.png";
                        }}
                      />
                      <div className="artisan-product-info">
                        <h5 className="artisan-product-titleeee">{product.name.toUpperCase()}</h5>
                        <p className="artisan-product-brandddd">~ {product.brand}</p>
                        <h5 className="artisan-product-priceeee">₹{product.price}</h5>
                        {product.stockQuantity <= 0 ? (
                          <div className="out-of-stock-badge">Out of Stock</div>
                        ) : (
                          <button
                            className="artisan-add-to-cart-btnn"
                            onClick={(e) => {
                              e.stopPropagation(); // Stop event from bubbling up to parent
                              addToCart(product.id, 1, e);
                            }}
                            disabled={!product.productAvailable || product.stockQuantity <= 0}
                          >
                            {product.productAvailable && product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          <div className="view-all-container">
            <button className="view-all-btn" onClick={() => navigate("/login")}>
         Explore the Market
            </button>
          </div>
        </section>

        {/* Services Section */}
                <section className="services-section">
                  <div className="services-container">
                    <h2 className="services-title">Our Services</h2>
                    <p className="services-description">Empowering farmers and enriching your meals</p>
                    <div className="services-grid">
                      <div className="service-card">
                        <Palette className="service-icon" />
                        <h3 className="service-title">Custom Orders</h3>
                        <p className="service-description">
                          Work directly with farmers to create custom orders tailored to your needs. 
                          From bulk purchases to specific varieties, we cater to your preferences.
                        </p>
                        <ul className="service-list">
                          <li>Personalized order consultations</li>
                          <li>Flexible delivery options</li>
                          <li>Seasonal produce availability</li>
                        </ul>
                      </div>
                      <div className="service-card">
                        <Tool className="service-icon" />
                        <h3 className="service-title">Sustainable Practices</h3>
                        <p className="service-description">
                          We promote eco-friendly farming practices that benefit both farmers and consumers. 
                          Join us in supporting sustainable agriculture.
                        </p>
                        <ul className="service-list">
                          <li>Organic farming methods</li>
                          <li>Waste reduction initiatives</li>
                          <li>Community-supported agriculture</li>
                        </ul>
                      </div>
                      <div className="service-card">
                        <BookOpen className="service-icon" />
                        <h3 className="service-title">Smart Logistics</h3>
            <p className="service-description">
              We handle the hassle of last-mile delivery using efficient, reliable, and fresh-preserving logistics so farmers can focus on farming, and you on eating well.
            </p>
            <ul className="service-list">
              <li>Cold chain-enabled transport</li>
              <li>Delivery tracking & notifications</li>
              <li>On-time, quality-assured service</li>
            </ul>
                      </div>
                      <div className="service-card">
                        <UsersIcon className="service-icon" />
                        <h3 className="service-title">Community & Support</h3>
            <p className="service-description">
              Be part of a movement that uplifts farmers, educates consumers, and builds sustainable food systems. Connect, share, and grow with the Maan-Meal family.
            </p>
            <ul className="service-list">
              <li>Farmer-consumer chat & feedback</li>
              <li>Support eco-farming initiatives</li>
              <li>Join events, workshops & more</li>
            </ul>
                      </div>
                    </div>
                  </div>
                </section>
        

        {/* Contact Section */}
        <section id="contact" className="contact-section-unique">
          <div className="contact-container-unique">
            <div className="text-center-unique">
              <h2 className="contact-title-unique">Contact Us</h2>
              <p className="contact-description-unique">We'd love to hear from you. Send us a message and we'll respond as soon as possible.</p>
            </div>

            <div className="contact-grid-unique">
              <div className="contact-info-unique">
                <h3 className="contact-info-title-unique">Contact Information</h3>
                <div className="contact-info-list-unique">
                  <div className="contact-item-unique">
                    <Mail className="contact-icon-unique" />
                    <span className="contact-text-unique">support@maanmeal.com</span>
                  </div>
                  <div className="contact-item-unique">
                    <Phone className="contact-icon-unique" />
                    <span className="contact-text-unique">+1 (555) 123-4567</span>
                  </div>
                  <div className="contact-item-unique">
                    <MapPin className="contact-icon-unique" />
                    <span className="contact-text-unique">123 Street, City, AC 12345</span>
                  </div>
                </div>
              </div>

              <form className="contact-form-unique">
                <div className="form-group-unique">
                  <label htmlFor="name" className="form-label-unique">Name</label>
                  <input
                    type="text"
                    id="name"
                    className="form-input-unique"
                    required
                  />
                </div>
                <div className="form-group-unique">
                  <label htmlFor="email" className="form-label-unique">Email</label>
                  <input
                    type="email"
                    id="email"
                    className="form-input-unique"
                    required
                  />
                </div>
                <div className="form-group-unique">
                  <label htmlFor="message" className="form-label-unique">Message</label>
                  <textarea
                    id="message"
                    rows={4}
                    className="form-textarea-unique"
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="form-button-unique"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
      <div className="contact-footer">
        <p>© 2025 Maan Meal. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default Home;