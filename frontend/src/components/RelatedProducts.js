import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../styles/RelatedProducts.css';

const RelatedProducts = ({ category, brand, currentProductId, gender }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRelatedProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, brand, currentProductId]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      
      console.log('Fetching related products...');
      const response = await axios.get(`${API_URL}/api/products/?limit=100`);
      let allProducts = response.data.products || [];
      
      console.log('RelatedProducts - Current ID:', currentProductId);
      console.log('RelatedProducts - Total products fetched:', allProducts.length);
      
      if (allProducts.length === 0) {
        console.log('No products available at all');
        setLoading(false);
        return;
      }
      
      // Filter out current product
      let filtered = allProducts.filter(p => p._id !== currentProductId);
      console.log('After filtering current product:', filtered.length);
      
      // Try to get related products by category/brand
      let related = [];
      
      if (category && brand) {
        related = filtered.filter(p => p.category === category && p.brand === brand);
        console.log('Same category & brand:', related.length);
      }
      
      if (related.length < 8 && category) {
        const sameCategory = filtered.filter(p => p.category === category && !related.includes(p));
        related = [...related, ...sameCategory];
        console.log('After adding same category:', related.length);
      }
      
      if (related.length < 8 && brand) {
        const sameBrand = filtered.filter(p => p.brand === brand && !related.includes(p));
        related = [...related, ...sameBrand];
        console.log('After adding same brand:', related.length);
      }
      
      // If still not enough, just add random products
      if (related.length < 8) {
        const remaining = filtered.filter(p => !related.includes(p));
        related = [...related, ...remaining];
        console.log('After adding random products:', related.length);
      }
      
      // Limit to 8 products
      const finalProducts = related.slice(0, 8);
      console.log('Final products to display:', finalProducts.length);
      
      setRelatedProducts(finalProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching related products:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="related-products-section">
        <div className="related-products-loading">
          <div className="loading-spinner"></div>
        </div>
      </section>
    );
  }

  if (relatedProducts.length === 0 && !loading) {
    return (
      <section className="related-products-section">
        <div className="related-products-header">
          <h2 className="related-products-title">Related Products</h2>
        </div>
      </section>
    );
  }

  return (
    <section className="related-products-section">
      <div className="related-products-header">
        <h2 className="related-products-title">Explore More</h2>
        <p className="related-products-subtitle">You might also like these products</p>
      </div>
      <div className="related-products-grid">
      {relatedProducts.map((product) => (
        <Link
          key={product._id}
          to={`/product/${product._id}`}
          className="related-product-card"
        >
          <div className="related-product-image-container">
            <img 
              src={product.image_url} 
              alt={product.title}
              loading="lazy"
              className="related-product-image"
            />
            {product.discount_percent > 0 && (
              <div className="related-discount-badge">
                -{product.discount_percent}%
              </div>
            )}
          </div>
          <div className="related-product-info">
            <div className="related-product-brand">{product.brand}</div>
            <h4 className="related-product-name">{product.title}</h4>
            <div className="related-product-pricing">
              <span className="related-product-price">
                PKR {product.price?.toLocaleString() || 'N/A'}
              </span>
              {product.original_price && product.original_price > product.price && (
                <span className="related-product-original-price">
                  PKR {product.original_price.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
    </section>
  );
};

export default RelatedProducts;
