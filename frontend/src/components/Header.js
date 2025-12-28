import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown } from 'react-icons/fi';
import { IoSearch } from 'react-icons/io5';
import axios from 'axios';
import { categoryOverrides } from '../config/categoryOverrides';
import SearchSkeleton from './SearchSkeleton';
import UserMenu from './UserMenu';

const Header = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchTimerRef = useRef(null);
  
  const handleSearchClick = () => {
    setSearchOpen(true);
    setTimeout(() => {
      if (searchInputRef.current) searchInputRef.current.focus();
    }, 100);
  };
  
  const handleSearchClose = () => {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };
  
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timer
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    
    // If query is empty, clear results
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Debounce search
    searchTimerRef.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await axios.get(`http://localhost:8000/api/products/search?q=${encodeURIComponent(query)}`);
        setSearchResults(response.data.products || []);
      } catch (err) {
        console.error('Search error:', err);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };
  
  const [categories, setCategories] = useState([]);
  const [byGender, setByGender] = useState({ men: [], women: [], kids: [], other: [] });
  const [error, setError] = useState(null);
  const [openMenu, setOpenMenu] = useState(null); // 'men' | 'women' | null
  const hoverTimerRef = useRef(null);

  const handleEnter = (key) => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setOpenMenu(key), 120);
  };

  // ...existing code...

  const handleLeave = () => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => setOpenMenu(null), 120);
  };

  // Resolve API base URL with a safe fallback (works even if .env isn't loaded yet)
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Try grouped endpoint first
        const grouped = await axios.get(`${API_URL}/api/products/categories/by-gender`);
        if (grouped && grouped.data && (grouped.data.men || grouped.data.women || grouped.data.kids)) {
          setByGender({
            men: grouped.data.men || [],
            women: grouped.data.women || [],
            kids: grouped.data.kids || [],
            other: grouped.data.other || []
          });
          return;
        }

        // Fallback to flat list and organize locally
        const flat = await axios.get(`${API_URL}/api/products/categories/list`);
        setCategories(flat.data || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories');
      }
    };

    fetchCategories();
  }, [API_URL]);

  // Organize categories by gender
  const organizeCategories = () => {
    const organized = {
      men: [],
      women: [],
      kids: [],
      other: []
    };

    categories.forEach(cat => {
      const gender = cat.split(' - ')[0].toLowerCase();
      const category = cat.split(' - ')[1] || cat;
      
      if (gender === 'men') {
        organized.men.push(category);
      } else if (gender === 'women') {
        organized.women.push(category);
      } else if (gender === 'kids') {
        organized.kids.push(category);
      } else {
        organized.other.push(category);
      }
    });

    return organized;
  };

  const organizedCategories = {
    men: byGender.men && byGender.men.length ? byGender.men : organizeCategories().men,
    women: byGender.women && byGender.women.length ? byGender.women : organizeCategories().women,
    kids: byGender.kids && byGender.kids.length ? byGender.kids : organizeCategories().kids,
    other: byGender.other && byGender.other.length ? byGender.other : organizeCategories().other,
  };

  // Merge kids into men and women (boys -> men, girls -> women, unknown -> both)
  const partitionKids = (items = []) => {
    const boys = [];
    const girls = [];
    const unknown = [];
    items.forEach((c) => {
      const lc = String(c || '').toLowerCase();
      if (/(^|\b)(boy|boys|junior|youth)(\b|$)/.test(lc)) boys.push(c);
      else if (/(^|\b)(girl|girls)(\b|$)/.test(lc)) girls.push(c);
      else unknown.push(c);
    });
    return { boys, girls, unknown };
  };

  const uniq = (arr) => Array.from(new Set(arr.filter(Boolean)));

  const kidsParts = partitionKids(organizedCategories.kids);
  const mergedCategories = {
    men: uniq([...(organizedCategories.men || []), ...kidsParts.boys, ...kidsParts.unknown]),
    women: uniq([...(organizedCategories.women || []), ...kidsParts.girls, ...kidsParts.unknown])
  };

  const normalize = (s) => String(s || '').trim();
  const lower = (s) => normalize(s).toLowerCase();

  const applyOverrides = (items = [], gender) => {
    const ov = (categoryOverrides && categoryOverrides[gender]) || {};

    // If a full custom list is provided, use it directly.
    if (Array.isArray(ov.custom) && ov.custom.length) {
      return uniq(ov.custom.map((x) => normalize(x)));
    }

    let arr = [...(items || [])].map((x) => normalize(x));

    // Grouping: collapse multiple matching items into a single labeled bucket (e.g., "Eastern")
    if (Array.isArray(ov.groups) && ov.groups.length) {
      const lowerArr = arr.map((x) => lower(x));
      const toRemove = new Set();
      const toAdd = new Set();

      ov.groups.forEach((group) => {
        if (!group || !group.label || !Array.isArray(group.includes)) return;
        const label = normalize(group.label);
        const needles = group.includes.map((s) => lower(s));
        let matched = false;
        lowerArr.forEach((itemLower, idx) => {
          // match if any needle is contained in the item (case-insensitive substring)
          if (needles.some((needle) => itemLower.includes(needle))) {
            matched = true;
            toRemove.add(idx);
          }
        });
        if (matched) toAdd.add(label);
      });

      if (toRemove.size || toAdd.size) {
        arr = arr.filter((_, idx) => !toRemove.has(idx));
        toAdd.forEach((label) => arr.push(label));
        arr = uniq(arr);
      }
    }

    // Exclude (case-insensitive)
    if (Array.isArray(ov.exclude) && ov.exclude.length) {
      const excludeSet = new Set(ov.exclude.map((x) => lower(x)));
      arr = arr.filter((x) => !excludeSet.has(lower(x)));
    }

    // Rename (case-insensitive keys)
    if (ov.rename && typeof ov.rename === 'object') {
      const renameMap = Object.fromEntries(
        Object.entries(ov.rename).map(([k, v]) => [lower(k), normalize(v)])
      );
      arr = arr.map((x) => renameMap[lower(x)] || x);
      arr = uniq(arr);
    }

    // Order: defined items first in the given order, then the rest alphabetically
    if (Array.isArray(ov.order) && ov.order.length) {
      const orderIdx = new Map(ov.order.map((name, i) => [lower(name), i]));
      arr.sort((a, b) => {
        const ai = orderIdx.get(lower(a));
        const bi = orderIdx.get(lower(b));
        if (ai != null && bi != null) return ai - bi;
        if (ai != null) return -1;
        if (bi != null) return 1;
        return a.localeCompare(b);
      });
    }

    // Pin some items to the end (e.g., Others)
    if (Array.isArray(ov.last) && ov.last.length) {
      const lastOrder = ov.last.map((x) => lower(x));
      const lastSet = new Set(lastOrder);
      const tail = [];
      const head = [];
      arr.forEach((x) => {
        if (lastSet.has(lower(x))) tail.push(x);
        else head.push(x);
      });
      // preserve specified order in 'last'
      tail.sort((a, b) => lastOrder.indexOf(lower(a)) - lastOrder.indexOf(lower(b)));
      arr = [...head, ...tail];
    }

    return arr;
  };

  const DropdownList = ({ items = [], gender }) => {
    const adjusted = applyOverrides(items, gender);

    return (
      <div className="dropdown-menu">
        <ul className="dropdown-items single">
          {adjusted && adjusted.length > 0 ? (
            adjusted.map((cat, idx) => (
              <li key={idx} style={{ '--i': idx }}>
                <Link to={`/${gender}/${cat.toLowerCase().replace(/\s+/g, '-')}`}>{cat}</Link>
              </li>
            ))
          ) : null}
        </ul>
      </div>
    );
  };

  return (
    <header className="header">
      <div className="header-content">
        {error && (
          <div className="loading" style={{paddingTop: 0, color: '#e74c3c'}}>API error: {error}</div>
        )}
        {/* Top Section */}
        <div className="header-top">
          <div className="search-container">
            <IoSearch className="search-icon" onClick={handleSearchClick} />
          </div>
      {/* Search Popup Bar (reference structure) */}
      {searchOpen && (
        <>
          <div className="search-backdrop" onClick={handleSearchClose}></div>
          <div className="search-popup-bar">
          <form action="/search" method="get" role="search" className="search-popup-form" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="search-input" className="hidden-label">Search</label>
            <div className="search__input-wrap">
              <input
                ref={searchInputRef}
                id="search-input"
                type="text"
                name="q"
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-popup-bar-input"
                placeholder="Search"
                autoComplete="off"
              />
              <button className="search-popup-bar-btn" tabIndex={0} aria-label="Search" type="button">
                <IoSearch className="search-popup-bar-icon" />
              </button>
              <button className="btn--close-search" type="button" onClick={handleSearchClose} aria-label="Close search">
                &#10005;
              </button>
            </div>
            
            {/* Search Results Dropdown */}
            {searchQuery.trim() && (
              <div className="search__results">
                {searchLoading ? (
                  <SearchSkeleton />
                ) : searchResults.length > 0 ? (
                  <div className="search-results-grid">
                    <div className="search-results-section">
                      <h3 className="search-section-title">POPULAR SUGGESTIONS</h3>
                      <ul className="search-suggestions-list">
                        {Array.from(new Set(searchResults.filter(p => p.title).map(p => p.title.toLowerCase()))).slice(0, 5).map((suggestion, idx) => (
                          <li key={idx} className="search-suggestion-item">{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="search-results-section">
                      <h3 className="search-section-title">PRODUCTS</h3>
                      <div className="search-products-grid">
                        {searchResults.slice(0, 9).map((product) => (
                          <Link 
                            key={product._id} 
                            to={`/product/${product._id}`}
                            className="search-product-card"
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                              setSearchResults([]);
                            }}
                          >
                            <div className="search-product-image">
                              {product.image_url ? (
                                <img src={product.image_url} alt={product.title || 'Product'} />
                              ) : (
                                <div className="search-product-no-image">No Image</div>
                              )}
                              {product.discount_percent > 0 && (
                                <div className="search-product-discount-badge">
                                  -{product.discount_percent}%
                                </div>
                              )}
                            </div>
                            <div className="search-product-info">
                              <div className="search-product-code">{product.product_code || ''}</div>
                              <div className="search-product-gender">{product.gender?.toUpperCase() || ''}</div>
                              <div className="search-product-name">{product.title || 'No title'}</div>
                              <div className="search-product-pricing">
                                <div className="search-product-price">PKR {product.price?.toLocaleString() || 'N/A'}</div>
                                {product.original_price && product.original_price > product.price && (
                                  <div className="search-product-original-price">PKR {product.original_price.toLocaleString()}</div>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="search-no-results">No products found for "{searchQuery}"</div>
                )}
              </div>
            )}
          </form>
        </div>
        </>
      )}
          <div className="logo-container">
            <Link to="/">
              <img
                src="/NewLogo.webp"
                srcSet="/NewLogo.webp 140w, /NewLogo.webp 280w"
                sizes="(min-width: 1280px) 280px, (min-width: 768px) 220px, 160px"
                alt="SaveKaro"
                loading="eager"
                itemProp="logo"
                className="logo-image small--hide image-element"
              />
            </Link>
          </div>
          <div className="header-icons">
            <UserMenu />
          </div>
        </div>
        {/* Navigation */}
        <nav className="nav-container">
          <ul className="nav-menu">
            <li className={`nav-item ${openMenu === 'men' ? 'open' : ''}`}
                onMouseEnter={() => handleEnter('men')}
                onMouseLeave={handleLeave}>
              <Link to="/men" className="nav-link">
                MEN <FiChevronDown className="dropdown-icon" />
              </Link>
              <DropdownList items={mergedCategories.men} gender="men" />
            </li>
            <li className={`nav-item ${openMenu === 'women' ? 'open' : ''}`}
                onMouseEnter={() => handleEnter('women')}
                onMouseLeave={handleLeave}>
              <Link to="/women" className="nav-link">
                WOMEN <FiChevronDown className="dropdown-icon" />
              </Link>
              <DropdownList items={mergedCategories.women} gender="women" />
            </li>
            {/* Removed SPECIAL PRICES / BRANDS / ABOUT as requested */}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
