import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/TopCollections.css';

const TopCollections = () => {
  const collections = [
    {
      id: 1,
      name: "JACKETS & OVERLAY",
      image: "/jacket.webp",
      alt: "Jackets Collection",
      link: "/jackets",
      category: "jackets"
    },
    {
      id: 2,
      name: "BOTTOMS",
      image: "/bottoms.webp",
      alt: "Bottoms Collection",
      link: "/jeans",
      category: "jeans" // Bottoms = Jeans/Pants
    },
    {
      id: 3,
      name: "HOODIES COLLECTION",
      image: "/hoodie.webp",
      alt: "Hoodies Collection",
      link: "/hoodies",
      category: "hoodies"
    },
    {
      id: 4,
      name: "SHIRTS",
      image: "/shirt.webp",
      alt: "Shirts Collection",
      link: "/shirts",
      category: "shirts"
    }
  ];

  return (
    <section className="top-collections-section">
      <div className="collections-container">
        <h2 className="collections-title">Top Collections</h2>
        
        <div className="collections-grid">
          {collections.map((collection) => (
            <Link 
              key={collection.id} 
              to={collection.link} 
              className="collection-card"
            >
              <div className="collection-image-wrapper">
                <img 
                  src={collection.image} 
                  alt={collection.alt}
                  className="collection-image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="collection-overlay"></div>
              </div>
              <div className="collection-info">
                <h3 className="collection-name">{collection.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TopCollections;
