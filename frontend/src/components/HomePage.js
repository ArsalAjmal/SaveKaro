import React from 'react';
import FeaturedBrandsCarousel from './FeaturedBrandsCarousel';
import AnimationSection from './AnimationSection';
import MindsetSection from './MindsetSection';
import TopCollections from './TopCollections';
import ProductCarousel from './ProductCarousel';
import ReviewScrollSection from './ReviewScrollSection';
import TrustedUsers from './TrustedUsers';

const HomePage = () => {
  // Brand carousel slides - clicking redirects to all products filtered by brand
  const brandSlides = [
    {
      id: 1,
      src: "/mylimelight.webp",
      alt: "Limelight",
      href: "/men?brand=limelight"
    },
    {
      id: 2,
      src: "/mybonanza.webp",
      alt: "Bonanza Satrangi",
      href: "/men?brand=bonanza"
    },
    {
      id: 3,
      src: "/foroutfitters.webp",
      alt: "Outfitters",
      href: "/men?brand=outfitters"
    },
    {
      id: 4,
      src: "/myJ.webp",
      alt: "J.",
      href: "/men?brand=j."
    },
    {
      id: 5,
      src: "/mycougar.webp",
      alt: "Cougar",
      href: "/men?brand=cougar"
    },
    {
      id: 6,
      src: "/sapphire.webp",
      alt: "Sapphire",
      href: "/women?brand=sapphire"
    },
    {
      id: 7,
      src: "/maria.webp",
      alt: "Maria.B",
      href: "/women?brand=maria.b"
    },
  ];

  return (
    <div className="homepage" style={{ position: 'relative' }}>
      <div className="hero-placeholder">
        {/* Hero section with background image */}
      </div>

      {/* 3D Brand Carousel - Shows 6 brands at once */}
      <section className="brands-carousel-section" style={{
        padding: '80px 0 80px',
        background: 'transparent',
        width: '100%',
        position: 'relative',
        zIndex: 1,
        isolation: 'isolate'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px', padding: '0 20px' }}>
          <h2 style={{
            fontSize: '2.25rem',
            fontWeight: '700',
            color: '#000',
            marginBottom: '6px'
          }}>
            Featured Brands
          </h2>
          <p style={{
            fontSize: '0.9rem',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover exclusive deals from Pakistan's top fashion brands
          </p>
        </div>

        <FeaturedBrandsCarousel
          slides={brandSlides}
          autoplay={true}
          delay={3}
          pauseOnHover={true}
          className="brands-carousel-wrapper"
        />
      </section>

      {/* Animation Section */}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <AnimationSection />
      </div>

      {/* Mindset Section */}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <MindsetSection />
      </div>

      {/* Top Collections Section */}
      <div style={{ position: 'relative', isolation: 'isolate' }}>
        <TopCollections />
      </div>

      {/* Best Deals Carousel */}
      <ProductCarousel title="Best Deals on Jeans & Pants" categories={["Jeans", "Pants"]} />

      {/* Men's Deals Carousel */}
      <ProductCarousel title="Best Deals for Men" categories={["Men"]} limit={7} gender="men" />

      {/* Women's Deals Carousel */}
      <ProductCarousel title="Best Deals for Women" categories={["Women"]} limit={7} gender="women" />

      {/* Review Scroll Section with 3D Scroll Trigger */}
      <ReviewScrollSection limit={20} />

      {/* Trusted Users - Compact */}
      <TrustedUsers
        count={15000}
        avatars={[
          'https://i.pravatar.cc/150?img=1',
          'https://i.pravatar.cc/150?img=5',
          'https://i.pravatar.cc/150?img=9',
          'https://i.pravatar.cc/150?img=14',
          'https://i.pravatar.cc/150?img=20'
        ]}
      />
    </div>
  );
}; export default HomePage;
