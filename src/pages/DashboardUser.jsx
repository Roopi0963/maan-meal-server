import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";
import "../styles/DashboardUser.css";
import { Mail, Phone, MapPin, Truck, Shield, RefreshCw, Clock } from "lucide-react";
import Navbar1 from "./Navbar1";

const slideImages = [
  "https://i.pinimg.com/736x/f7/65/f3/f765f318aaa2660cb8ac6fb3cfa09b3a.jpg",
  "https://i.pinimg.com/originals/b3/50/47/b35047dc0cd424272cb500e53494f75a.jpg",
  "https://img.freepik.com/premium-photo/close-up-wheat_81048-38123.jpg",
  "https://img.freepik.com/premium-photo/vegetables-fruits-top-view-with-copy-space_79782-5581.jpg",
  "https://img.freepik.com/premium-photo/spring-grain-concept-agriculture-healthy-eating-organic-food-generative-ai_58409-32489.jpg",
];

const DashboardUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  // Check user authentication and role
  useEffect(() => {
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");

    if (!userId) {
      navigate("/");
    } else if (role !== "USER") {
      switch (role) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "ARTISAN":
          navigate("/artisan");
          break;
        default:
          navigate("/");
      }
    }

    if (role === "USER" && location.pathname !== "/user") {
      navigate("/user", { replace: true });
    }
  }, [navigate, location]);

  // Slideshow effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slideImages.length);
    }, 3000);
    return () => clearInterval(interval);
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
        setFilteredProducts(productsWithImages); // Initialize filteredProducts with all products
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Handler for category selection from Navbar1
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    
    if (!category) {
      // If no category selected (or "All" selected), show all products
      setFilteredProducts(products);
    } else {
      // Filter products by selected category
      const filtered = products.filter(product => product.category === category);
      setFilteredProducts(filtered);
    }
  };

  // Handler for search results from Navbar1
  const handleSearchResults = (results) => {
    // Update filtered products with search results
    setFilteredProducts(results);
  };

  const addToCart = async (productId, quantity) => {
    const userId = localStorage.getItem("user_id");
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

  return (
    <div className="artisan-dashboard-wrapper">
      <Navbar1 
        handleLogout={handleLogout} 
        onSelectCategory={handleCategorySelect} 
        onSearchResults={handleSearchResults}
      />

      {/* Slideshow */}
      <div className="artisan-slideshow">
        {slideImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Artisan Slideshow"
            className={`artisan-slideshow-image ${index === currentIndex ? "active" : ""}`}
          />
        ))}
        <div className="artisan-overlay"></div>
        <div className="artisan-slideshow-text">
        <h1>Fresh From the Fields</h1>
<p>Enjoy healthy, seasonal produce directly from local farms.</p>

          <Link to="/productsPage1" className="artisan-shop-now">Shop Now</Link>
        </div>
      </div>

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

      {/* Products */}
      <section className="shop-product-showcase">
        <h2 className="showcase-title">
          {selectedCategory ? `${selectedCategory} Products` : "Our Farm Produce"}
          {filteredProducts.length > 0 && (
            <span className="product-counter"> ({filteredProducts.length} items)</span>
          )}
        </h2>

        {loading ? (
          <div className="loading-state">Loading products...</div>
        ) : error ? (
          <div className="error-state">{error}</div>
        ) : (
          <div className="product-display-grid">
            {filteredProducts.length === 0 ? (
              <h2 className="empty-products-message">
                {selectedCategory
                  ? `No Products Available in ${selectedCategory} Category`
                  : "No Products Available"}
              </h2>
            ) : (
              filteredProducts.map((product) => (
                <div className="product-display-card" key={product.id}>
                  <Link to={`/product2/${product.id}`}>
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="product-display-image" 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/images/placeholder.png";
                      }}
                    />
                    <div className="product-display-details">
                      <h5 className="product-display-name">{product.name.toUpperCase()}</h5>
                      <p className="product-display-brand">~ {product.brand}</p>
                      <h5 className="product-display-price">₹{product.price}</h5>
                      {product.stockQuantity <= 0 ? (
                        <div className="inventory-status-badge">Out of Stock</div>
                      ) : (
                        <button
                          className="add-to-cart-button"
                          onClick={(e) => {
                            e.preventDefault();
                            addToCart(product.id, 1);
                          }}
                          disabled={!product.productAvailable || product.stockQuantity <= 0}
                        >
                          {product.productAvailable && product.stockQuantity > 0 ? "Add to Cart" : "Out of Stock"}
                        </button>
                      )}
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Contact */}
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
                <div className="contact-item-unique"><Mail className="contact-icon-unique" /><span>support@maanmeal.com</span></div>
                <div className="contact-item-unique"><Phone className="contact-icon-unique" /><span>+1 (555) 123-4567</span></div>
                <div className="contact-item-unique"><MapPin className="contact-icon-unique" /><span>123 Street,City</span></div>
              </div>
            </div>
            <form className="contact-form-unique">
              <div className="form-group-unique"><label>Name</label><input type="text" className="form-input-unique" /></div>
              <div className="form-group-unique"><label>Email</label><input type="email" className="form-input-unique" /></div>
              <div className="form-group-unique"><label>Message</label><textarea rows={4} className="form-textarea-unique"></textarea></div>
              <button type="submit" className="form-button-unique">Send Message</button>
            </form>
          </div>
        </div>
      </section>

      <div className="contact-footer">
        <p>© 2025 Maan Meal. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default DashboardUser;