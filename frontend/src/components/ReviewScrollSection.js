import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ThreeDScrollTriggerContainer, ThreeDScrollTriggerRow } from './ThreeDScrollTrigger';
import '../styles/ReviewScrollSection.css';

// Pakistani names for reviewers
const pakistaniNames = [
  { name: 'Ayesha Khan', city: 'Lahore' },
  { name: 'Fatima Ahmed', city: 'Karachi' },
  { name: 'Hira Ali', city: 'Islamabad' },
  { name: 'Zainab Malik', city: 'Rawalpindi' },
  { name: 'Sana Noor', city: 'Faisalabad' },
  { name: 'Maira Raza', city: 'Multan' },
  { name: 'Amina Yousaf', city: 'Peshawar' },
  { name: 'Rabiya Hassan', city: 'Lahore' },
  { name: 'Maryam Sheikh', city: 'Karachi' },
  { name: 'Bushra Iqbal', city: 'Sialkot' },
  { name: 'Nida Farooq', city: 'Gujranwala' },
  { name: 'Farah Saleem', city: 'Islamabad' },
  { name: 'Aliya Baig', city: 'Lahore' },
  { name: 'Khadija Aziz', city: 'Karachi' },
  { name: 'Samina Tariq', city: 'Rawalpindi' },
];

// Review templates
const reviewTemplates = [
  'Absolutely love this {product}! The quality is amazing and the fit is perfect. {brand} never disappoints!',
  'Best purchase ever! This {product} exceeded my expectations. Great quality from {brand}.',
  'Highly recommend this {product}! The fabric is so comfortable and the design is beautiful. Thank you {brand}!',
  'Amazing quality and fast delivery! This {product} is worth every penny. {brand} is my go-to brand now!',
  'I\'m obsessed with this {product}! Perfect for everyday wear. {brand} has the best collection!',
  'Such a beautiful {product}! The color and quality are exactly as shown. Love shopping from {brand}!',
  'Great value for money! This {product} looks expensive but it\'s so affordable. {brand} has won my heart!',
  'Can\'t stop wearing this {product}! So comfortable and stylish. {brand} is now my favorite!',
  'Excellent quality! This {product} fits like a dream. Will definitely buy more from {brand}!',
  'Love love love! This {product} is perfect for the season. {brand} always has the best pieces!',
  'Best online shopping experience! This {product} arrived quickly and looks amazing. {brand} rocks!',
  'So happy with my purchase! This {product} is exactly what I wanted. {brand} has the best designs!',
  'Amazing product! The {product} quality is top-notch. {brand} never compromises on quality!',
  'Perfect fit and finish! This {product} is a wardrobe essential. Thank you {brand}!',
  'Totally worth it! This {product} is my new favorite. {brand} has the best collection in Pakistan!',
];

// Rating generator (mostly 4-5 stars)
const generateRating = () => {
  const rand = Math.random();
  if (rand < 0.7) return 5; // 70% 5 stars
  if (rand < 0.95) return 4; // 25% 4 stars
  return 3; // 5% 3 stars
};

// Generate review from product
const generateReview = (product, index) => {
  const reviewer = pakistaniNames[index % pakistaniNames.length];
  const template = reviewTemplates[index % reviewTemplates.length];
  
  // Extract product type from category or title
  let productType = product.category || 'item';
  if (product.title) {
    const title = product.title.toLowerCase();
    if (title.includes('shirt')) productType = 'shirt';
    else if (title.includes('jean') || title.includes('pant')) productType = 'jeans';
    else if (title.includes('jacket')) productType = 'jacket';
    else if (title.includes('dress')) productType = 'dress';
    else if (title.includes('hoodie')) productType = 'hoodie';
    else if (title.includes('sweater')) productType = 'sweater';
    else if (title.includes('kurti')) productType = 'kurti';
  }
  
  const reviewText = template
    .replace('{product}', productType)
    .replace('{brand}', product.brand);
  
  return {
    id: product._id || index,
    reviewer: reviewer.name,
    city: reviewer.city,
    rating: generateRating(),
    text: reviewText,
    productImage: product.image_url,
    productName: product.title,
    brand: product.brand,
  };
};

const ReviewScrollSection = ({ limit = 20 }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        // Fetch random products from different brands and categories
        const response = await axios.get(`${API_URL}/api/products`, {
          params: {
            limit: limit,
            sort_by: 'discount_percent',
            min_discount: 20
          }
        });
        
        const products = response.data.products || [];
        const generatedReviews = products.map((product, index) => 
          generateReview(product, index)
        );
        
        setReviews(generatedReviews);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products for reviews:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [limit]);

  if (loading) {
    return (
      <section className="review-scroll-section">
        <div className="review-scroll-header">
          <h2 className="review-scroll-title">Customer Reviews</h2>
          <p className="review-scroll-subtitle">See what our customers are saying</p>
        </div>
        <div className="review-scroll-loading">
          <div className="loading-spinner"></div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  // Split reviews into two rows for alternating directions
  const midpoint = Math.ceil(reviews.length / 2);
  const row1Reviews = reviews.slice(0, midpoint);
  const row2Reviews = reviews.slice(midpoint);

  return (
    <section className="review-scroll-section">
      <div className="review-scroll-header">
        <h2 className="review-scroll-title">Customer Reviews</h2>
        <p className="review-scroll-subtitle">See what our customers are saying about their favorite products</p>
      </div>

      <ThreeDScrollTriggerContainer className="review-scroll-container">
        {/* First row - moves right when scrolling down */}
        <ThreeDScrollTriggerRow
          baseVelocity={2}
          direction={1}
          className="review-scroll-row"
        >
          {row1Reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ThreeDScrollTriggerRow>

        {/* Second row - moves left when scrolling down */}
        <ThreeDScrollTriggerRow
          baseVelocity={2}
          direction={-1}
          className="review-scroll-row"
        >
          {row2Reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </ThreeDScrollTriggerRow>
      </ThreeDScrollTriggerContainer>
    </section>
  );
};

// Individual Review Card Component
const ReviewCard = ({ review }) => {
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
  
  return (
    <div className="review-card">
      <div className="review-card-header">
        <div className="review-card-image-container">
          <img
            src={review.productImage}
            alt={review.productName}
            className="review-card-image"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="review-card-brand">{review.brand}</div>
      </div>
      
      <div className="review-card-rating">{stars}</div>
      
      <p className="review-card-text">{review.text}</p>
      
      <div className="review-card-footer">
        <div className="review-card-reviewer">
          <div className="review-card-name">{review.reviewer}</div>
          <div className="review-card-city">{review.city}</div>
        </div>
      </div>
    </div>
  );
};

export default ReviewScrollSection;
