import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ProductCarouselSkeleton from './ProductCarouselSkeleton';
import '../styles/ProductCarousel.css';

const ProductCarousel = ({ title = "Hoodies & Jackets", categories = ["Hoodies", "Jackets"], limit = 10, gender = null }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        // Fetch products from all categories
        const response = await axios.get(`${API_URL}/api/products`);
        const allProducts = response.data.products || [];
        
        console.log(`[${title}] Total products fetched:`, allProducts.length);
        console.log(`[${title}] Filtering for categories:`, categories);
        
        // Debug: Check size fields in first few products
        console.log(`[${title}] Sample product size data:`, allProducts.slice(0, 3).map(p => ({
          title: p.title,
          available_sizes: p.available_sizes,
          sizes: p.sizes,
          size: p.size,
          variants: p.variants
        })));
        
        // Show ALL unique categories in database (only log once for first carousel)
        if (title.includes('Jeans')) {
          const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
          console.log('ALL CATEGORIES IN DATABASE:', uniqueCategories.sort());
          
          // Count sweater products
          const sweaterProducts = allProducts.filter(p => {
            const cat = (p.category || '').toLowerCase();
            const ttl = (p.title || '').toLowerCase();
            return cat.includes('sweater') || cat.includes('pullover') || 
                   cat.includes('cardigan') || ttl.includes('sweater') ||
                   ttl.includes('pullover') || ttl.includes('cardigan');
          });
          console.log('SWEATER COUNT:', sweaterProducts.length);
          console.log('Sample sweaters:', sweaterProducts.slice(0, 3).map(p => ({
            title: p.title,
            category: p.category,
            discount: p.discount_percent
          })));
          
          // Count eastern products
          const easternProducts = allProducts.filter(p => {
            const cat = (p.category || '').toLowerCase();
            const ttl = (p.title || '').toLowerCase();
            return cat.includes('kurta') || cat.includes('shalwar') || 
                   cat.includes('kameez') || cat.includes('waistcoat') ||
                   cat.includes('eastern') || ttl.includes('kurta') ||
                   ttl.includes('shalwar') || ttl.includes('waistcoat');
          });
          console.log('EASTERN COUNT:', easternProducts.length);
          console.log('Sample eastern:', easternProducts.slice(0, 3).map(p => ({
            title: p.title,
            category: p.category,
            discount: p.discount_percent
          })));
        }
        
        // Helper function to check if product has at least one size in stock
        const hasStockAvailable = (product) => {
          const variants = product.variants || [];
          
          // If no variants, assume product is available
          if (variants.length === 0) {
            return true;
          }
          
          // Check if any variant with a standard size is in stock
          return variants.some(variant => {
            if (!variant.in_stock) return false;
            
            // If it has a standard size and is in stock, product is available
            // If no standard size found, still consider it available if in_stock is true
            return variant.in_stock;
          });
        };
        
        // Filter based on specified categories or gender
        const filteredProducts = allProducts
          .filter(product => {
            // If filtering by gender, check gender field
            if (gender) {
              const productGender = (product.gender || '').toLowerCase();
              if (productGender !== gender.toLowerCase()) return false;
            } else {
              // Otherwise filter by category
              if (!product.category) return false;
              const categoryLower = product.category.toLowerCase();
              const titleLower = (product.title || '').toLowerCase();
              
              // Check if product matches any of the specified categories first
              const matchesCategory = categories.some(cat => {
                const catLower = cat.toLowerCase();
                return categoryLower.includes(catLower) || titleLower.includes(catLower);
              });
              
              if (!matchesCategory) return false;
            }
            
            // IMPORTANT: Only include products with at least one size in stock
            return hasStockAvailable(product);
          })
          .sort((a, b) => {
            // Primary sort: highest discount percentage for in-stock items
            const discountA = a.discount_percent || 0;
            const discountB = b.discount_percent || 0;
            
            // Sort by discount in descending order (highest discount first)
            if (discountB !== discountA) {
              return discountB - discountA;
            }
            
            // If discounts are equal, prefer lowest price
            const priceA = a.price || 999999;
            const priceB = b.price || 999999;
            
            return priceA - priceB;
          })
          .slice(0, limit);
        
        console.log(`[${title}] Filtered products (with stock):`, filteredProducts.length);
        if (filteredProducts.length === 0) {
          console.log(`[${title}] No products found! Checking all products for matches...`);
          const potentialMatches = allProducts.filter(p => {
            if (!p.category) return false;
            const cat = p.category.toLowerCase();
            const ttl = (p.title || '').toLowerCase();
            return categories.some(c => cat.includes(c.toLowerCase()) || ttl.includes(c.toLowerCase()));
          });
          console.log(`[${title}] Potential matches before exclusions:`, potentialMatches.length);
          console.log(`[${title}] Sample potential matches:`, potentialMatches.slice(0, 3).map(p => ({
            title: p.title,
            category: p.category
          })));
        }
        console.log(`[${title}] Filtered products details:`, filteredProducts.map(p => ({ 
          title: p.title, 
          category: p.category, 
          discount: p.discount_percent 
        })));
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, limit, gender, title]);

  const carouselRef = useRef(null);

  const scroll = (direction) => {
    if (!carouselRef.current) return;
    
    const scrollAmount = 320;
    
    if (direction === 'left') {
      carouselRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    } else {
      carouselRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <section className="product-carousel-section">
        <div className="product-carousel-header">
          <h2 className="product-carousel-title">{title}</h2>
          <button className="view-all-btn skeleton-view-all"></button>
        </div>
        <ProductCarouselSkeleton />
      </section>
    );
  }

  // Show section even if no products (for debugging)
  // if (products.length === 0) {
  //   return (
  //     <section className="product-carousel-section">
  //       <div className="product-carousel-header">
  //         <h2 className="product-carousel-title">{title}</h2>
  //       </div>
  //       <div className="product-carousel-loading">No products available at the moment.</div>
  //     </section>
  //   );
  // }

  return (
    <section className="product-carousel-section">
      <div className="product-carousel-header">
        <h2 className="product-carousel-title">{title}</h2>
        <button className="view-all-btn">View All</button>
      </div>
      
      <div className="product-carousel-wrapper">
        <button 
          className="carousel-nav-btn carousel-nav-left" 
          onClick={() => scroll('left')}
          aria-label="Previous products"
        >
          ‹
        </button>
        
        <div className="product-carousel-container" ref={carouselRef}>
          {products.map((product) => (
            <Link
              key={product._id}
              to={`/product/${product._id}`}
              className="product-carousel-card"
            >
              <div className="product-carousel-image">
                {product.image_url ? (
                  <img 
                    src={product.image_url} 
                    alt={product.title || 'Product'} 
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="product-no-image">No Image</div>
                )}
                {product.discount_percent > 0 && (
                  <div className="product-discount-badge">
                    -{product.discount_percent}%
                  </div>
                )}
              </div>
              
              <div className="product-carousel-info">
                <h3 className="product-name">{product.title || 'No title'}</h3>
                <div className="product-pricing">
                  <span className="product-price">Rs.{product.price?.toLocaleString() || 'N/A'}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="product-original-price">Rs.{product.original_price.toLocaleString()}</span>
                  )}
                </div>
                
                {/* Size chips - extract from variants data */}
                {(() => {
                  // Extract sizes from variants array
                  const variants = product.variants || [];
                  
                  if (!variants || variants.length === 0) {
                    return null;
                  }
                  
                  // Extract and parse sizes from variant data
                  const extractedSizes = new Set();
                  const sizeAvailability = {};
                  
                  variants.forEach(variant => {
                    if (!variant.size) return;
                    
                    // Size format can be: "Pale Yellow / XS / HS-25" or "Green" or "M"
                    const sizeStr = variant.size.toString();
                    
                    // Try to extract standard size (S, M, L, XL, etc.)
                    const sizeMatch = sizeStr.match(/\b(XXS|XS|S|M|L|XL|XXL|2XL|3XL)\b/i);
                    
                    if (sizeMatch) {
                      const size = sizeMatch[1].toUpperCase();
                      extractedSizes.add(size);
                      
                      // Track if this size is in stock
                      if (variant.in_stock) {
                        sizeAvailability[size] = true;
                      } else if (!sizeAvailability[size]) {
                        sizeAvailability[size] = false;
                      }
                    }
                  });
                  
                  // Convert to array and sort by standard size order
                  const sizeOrder = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL'];
                  const sortedSizes = Array.from(extractedSizes).sort((a, b) => {
                    return sizeOrder.indexOf(a) - sizeOrder.indexOf(b);
                  });
                  
                  // Don't show size section if no standard sizes found
                  if (sortedSizes.length === 0) {
                    return null;
                  }
                  
                  return (
                    <div className="product-sizes">
                      {sortedSizes.map((size) => {
                        const isInStock = sizeAvailability[size];
                        
                        return (
                          <span 
                            key={size} 
                            className={`size-chip ${!isInStock ? 'size-chip-unavailable' : ''}`}
                          >
                            {size}
                          </span>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </Link>
          ))}
        </div>
        
        <button 
          className="carousel-nav-btn carousel-nav-right" 
          onClick={() => scroll('right')}
          aria-label="Next products"
        >
          ›
        </button>
      </div>
    </section>
  );
};

export default ProductCarousel;
