import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useSearchParams, useLocation, Link } from 'react-router-dom';
import ProductSkeleton from './ProductSkeleton';
import '../styles/CategoryPage.css';

const CategoryPage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // Filter states
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [minDiscount, setMinDiscount] = useState(0);
  const [sortBy, setSortBy] = useState('discount_percent');
  const [showFilters, setShowFilters] = useState(true);
  
  // Available brands
  const [availableBrands, setAvailableBrands] = useState([]);
  
  // Initialize brand filter from URL query parameter and reset when URL changes
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    if (brandParam) {
      // Convert brand name to match database format (e.g., "limelight" -> "Limelight")
      const brandName = brandParam.charAt(0).toUpperCase() + brandParam.slice(1).toLowerCase();
      setSelectedBrands([brandName]);
    } else {
      // Clear brand filter if no brand param in URL
      setSelectedBrands([]);
    }
  }, [searchParams, location.pathname]); // Re-run when URL changes
  
  // Intersection observer for infinite scroll
  const observer = useRef();
  const lastProductRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        if (page === 1) {
          setInitialLoading(true);
        }
        setLoading(true);
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        
        console.log('🔍 Starting fetch for URL:', location.pathname);
        
        // Fetch ALL products by making multiple requests if needed
        let allProducts = [];
        let skip = 0;
        const fetchLimit = 100; // API max limit
        let hasMoreToFetch = true;
        
        while (hasMoreToFetch) {
          console.log(`📡 Fetching batch: skip=${skip}, limit=${fetchLimit}`);
          const response = await axios.get(`${API_URL}/api/products?limit=${fetchLimit}&skip=${skip}`);
          const products = response.data.products || [];
          console.log(`✅ Received ${products.length} products in this batch`);
          allProducts = [...allProducts, ...products];
          
          if (products.length < fetchLimit) {
            hasMoreToFetch = false;
          } else {
            skip += fetchLimit;
          }
        }
        
        console.log(`📊 Total products fetched: ${allProducts.length}`);
        
        // Extract category from URL path
        // For /men/jeans -> gender=men, category=jeans
        // For /women/shirts -> gender=women, category=shirts
        // For /men -> gender=men, category=all
        // For /jeans -> category=jeans, gender=all
        
        const pathParts = location.pathname.split('/').filter(Boolean);
        let genderFilter = null;
        let categoryFilter = null;
        
        // Check if first part is men/women
        if (pathParts[0] === 'men' || pathParts[0] === 'women') {
          genderFilter = pathParts[0];
          categoryFilter = pathParts[1] || null; // second part is category if exists
        } else if (pathParts[0] === 'category' && pathParts[1]) {
          categoryFilter = pathParts[1];
        } else {
          categoryFilter = pathParts[0];
        }
        
        console.log('Gender filter:', genderFilter, 'Category filter:', categoryFilter);
        
        // Filter by category and gender
        let filteredProducts = allProducts;
        
        // Apply gender filter first
        if (genderFilter) {
          filteredProducts = filteredProducts.filter(p => {
            const gender = (p.gender || '').toLowerCase();
            return gender === genderFilter;
          });
          console.log('After gender filter:', filteredProducts.length);
        }
        
        // Apply category filter
        if (categoryFilter) {
          // Map category aliases to actual database categories
          const categoryMapping = {
            'jackets': 'jacket',
            'hoodies': 'hoodie',
            'jeans': 'jeans',
            'pants': 'jeans', // pants might be stored as jeans
            'shirts': 'shirt',
            'sweaters': 'sweater',
            'dresses': 'dress',
            'eastern': 'kurta|shalwar', // eastern includes kurta and shalwar
            'western': 'jacket|hoodie|shirt|jeans|sweater|t-shirt',
            't-shirts': 't-shirt',
            'tshirts': 't-shirt',
            'suits': 'suit',
            'kurtas': 'kurta'
          };
          
          // Get the mapped category or use the original
          const mappedCategory = categoryMapping[categoryFilter] || categoryFilter;
          const categoryPatterns = mappedCategory.split('|');
          
          filteredProducts = filteredProducts.filter(p => {
            const cat = (p.category || '').toLowerCase();
            const title = (p.title || '').toLowerCase();
            
            // Check if any pattern matches
            return categoryPatterns.some(pattern => 
              cat.includes(pattern) || 
              title.includes(pattern) ||
              cat === pattern
            );
          });
          console.log('After category filter:', filteredProducts.length);
        }
        
        console.log('Filtered products:', filteredProducts.length);
        
        // Apply brand filter
        if (selectedBrands.length > 0) {
          filteredProducts = filteredProducts.filter(p => 
            selectedBrands.includes(p.brand)
          );
        }
        
        // Apply price filter
        if (priceRange.min) {
          filteredProducts = filteredProducts.filter(p => 
            (p.price || 0) >= parseFloat(priceRange.min)
          );
        }
        if (priceRange.max) {
          filteredProducts = filteredProducts.filter(p => 
            (p.price || 0) <= parseFloat(priceRange.max)
          );
        }
        
        // Apply discount filter
        if (minDiscount > 0) {
          filteredProducts = filteredProducts.filter(p => 
            (p.discount_percent || 0) >= minDiscount
          );
        }
        
        // Sort products
        filteredProducts.sort((a, b) => {
          if (sortBy === 'discount_percent') return (b.discount_percent || 0) - (a.discount_percent || 0);
          if (sortBy === 'price_low') return (a.price || 0) - (b.price || 0);
          if (sortBy === 'price_high') return (b.price || 0) - (a.price || 0);
          return 0;
        });
        
        // Extract unique brands from ALL filtered products (before pagination)
        const brands = [...new Set(filteredProducts.map(p => p.brand).filter(Boolean))];
        setAvailableBrands(brands.sort());
        
        // Pagination: slice products for current page
        const startIndex = (page - 1) * 20;
        const endIndex = startIndex + 20;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
        
        // Update products list
        if (page === 1) {
          setProducts(paginatedProducts);
        } else {
          setProducts(prev => [...prev, ...paginatedProducts]);
        }
        
        setHasMore(endIndex < filteredProducts.length);
        setLoading(false);
        setInitialLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
        setInitialLoading(false);
      }
    };

    fetchProducts();
  }, [location.pathname, selectedBrands, priceRange, minDiscount, sortBy, page]); // Use location.pathname instead of category

  // Reset page when filters or category change
  useEffect(() => {
    setPage(1);
    setProducts([]);
    setInitialLoading(true);
    // Reset other filters when navigating to a new path (except when brand filter comes from URL)
    const brandParam = searchParams.get('brand');
    if (!brandParam) {
      setSelectedBrands([]);
    }
    setPriceRange({ min: '', max: '' });
    setMinDiscount(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Reset when path changes
  
  // Reset page when filters change
  useEffect(() => {
    if (initialLoading) return; // Don't trigger on initial load
    setPage(1);
    setProducts([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrands, priceRange, minDiscount, sortBy]);

  // Handle brand filter
  const toggleBrand = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  // Handle clear filters
  const clearFilters = () => {
    setSelectedBrands([]);
    setPriceRange({ min: '', max: '' });
    setMinDiscount(0);
    setSortBy('discount_percent');
  };

  // Format category name for display
  const formatCategoryName = (cat) => {
    if (!cat) return '';
    return cat.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };
  
  // Get display title based on URL path
  const getPageTitle = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    if (pathParts[0] === 'men' && pathParts[1]) {
      return `${formatCategoryName(pathParts[1])} for Men`;
    } else if (pathParts[0] === 'women' && pathParts[1]) {
      return `${formatCategoryName(pathParts[1])} for Women`;
    } else if (pathParts[0] === 'men') {
      return "Men's Collection";
    } else if (pathParts[0] === 'women') {
      return "Women's Collection";
    } else if (pathParts[0] === 'category' && pathParts[1]) {
      return `${formatCategoryName(pathParts[1])} Collection`;
    } else {
      return `${formatCategoryName(pathParts[0])} Collection`;
    }
  };

  return (
    <div className="category-page">
      {/* Full Page Loading Overlay */}
      {initialLoading && (
        <div className="page-loading-overlay">
          <div className="page-loading-spinner"></div>
        </div>
      )}
      
      {/* Breadcrumb Header */}
      <div className="category-header">
        <div className="category-header-content">
          <h1 className="category-title">{getPageTitle()}</h1>
          <div className="breadcrumb">
            <a href="/">Home</a>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-current">{getPageTitle()}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="category-content">
        {/* Filters Sidebar */}
        <aside className={`filters-sidebar ${showFilters ? 'show' : 'hide'}`}>
          <div className="filters-header">
            <h3>Filters</h3>
            <button className="clear-filters" onClick={clearFilters}>Clear All</button>
          </div>

          {/* Sort By */}
          <div className="filter-section">
            <h4>Sort By</h4>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="discount_percent">Highest Discount</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>

          {/* Brand Filter */}
          <div className="filter-section">
            <h4>Brand</h4>
            <div className="filter-options">
              {availableBrands.slice(0, 10).map(brand => (
                <label key={brand} className="filter-checkbox">
                  <input 
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => toggleBrand(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input 
                type="number" 
                placeholder="Min"
                value={priceRange.min}
                onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                className="price-input"
              />
              <span>-</span>
              <input 
                type="number" 
                placeholder="Max"
                value={priceRange.max}
                onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                className="price-input"
              />
            </div>
          </div>

          {/* Discount Filter */}
          <div className="filter-section">
            <h4>Minimum Discount</h4>
            <div className="discount-options">
              {[0, 20, 30, 40, 50].map(discount => (
                <button
                  key={discount}
                  className={`discount-btn ${minDiscount === discount ? 'active' : ''}`}
                  onClick={() => setMinDiscount(discount)}
                >
                  {discount === 0 ? 'All' : `${discount}% & above`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <main className="products-main">
          <div className="products-header">
            <button 
              className="toggle-filters-btn"
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <p className="products-count">{products.length} Products</p>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {initialLoading ? (
              // Show skeleton loading on initial load
              <ProductSkeleton count={12} />
            ) : (
              // Show actual products
              products.map((product, index) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="product-card"
                  ref={index === products.length - 1 ? lastProductRef : null}
                >
                  <div className="product-image-wrapper">
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
                  
                  <div className="product-info">
                    <div className="product-brand">{product.brand}</div>
                    <h3 className="product-name">{product.title || 'No title'}</h3>
                    <div className="product-pricing">
                      <span className="product-price">Rs.{product.price?.toLocaleString() || 'N/A'}</span>
                      {product.original_price && product.original_price > product.price && (
                        <span className="product-original-price">Rs.{product.original_price.toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Loading Indicator for infinite scroll */}
          {loading && !initialLoading && (
            <div className="loading-indicator">
              <div className="loading-spinner"></div>
              <p>Loading more products...</p>
            </div>
          )}

          {/* No More Products */}
          {!loading && !hasMore && products.length > 0 && (
            <div className="no-more-products">
              <p>You've reached the end!</p>
            </div>
          )}

          {/* No Products Found */}
          {!initialLoading && !loading && products.length === 0 && (
            <div className="no-products">
              <p>No products found matching your filters.</p>
              <button onClick={clearFilters} className="clear-filters-btn">Clear Filters</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default CategoryPage;
