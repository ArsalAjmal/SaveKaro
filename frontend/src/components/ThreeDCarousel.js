import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { useIsMobile } from "../hooks/use-mobile";

/**
 * 3D Carousel Component - Shows 6 cards at oce with autoplay
 * Adapted for React from Next.js TypeScript version
 */
const ThreeDCarousel = ({
    items = [],
    autoRotate = true,
    rotateInterval = 4000,
    cardHeight = 500,
    title = "Featured Products",
    subtitle = "Customer Cases",
    tagline = "Explore our featured products and discover amazing deals",
    isMobileSwipe = true,
}) => {
    const [active, setActive] = useState(0);
    const carouselRef = useRef(null);
    const [isInView, setIsInView] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const isMobile = useIsMobile();
    const minSwipeDistance = 50;

    // Auto-rotate effect
    useEffect(() => {
        if (autoRotate && isInView && !isHovering) {
            const interval = setInterval(() => {
                setActive((prev) => (prev + 1) % items.length);
            }, rotateInterval);
            return () => clearInterval(interval);
        }
    }, [isInView, isHovering, autoRotate, rotateInterval, items.length]);

    // Intersection observer for auto-rotate when in view
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsInView(entry.isIntersecting),
            { threshold: 0.2 }
        );

        if (carouselRef.current) {
            observer.observe(carouselRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Touch handlers for mobile swipe
    const onTouchStart = (e) => {
        setTouchStart(e.targetTouches[0].clientX);
        setTouchEnd(null);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (distance > minSwipeDistance) {
            setActive((prev) => (prev + 1) % items.length);
        } else if (distance < -minSwipeDistance) {
            setActive((prev) => (prev - 1 + items.length) % items.length);
        }
    };

    // Get animation class for each card position (6 visible cards)
    const getCardAnimationClass = (index) => {
        const total = items.length;
        const diff = (index - active + total) % total;

        // Center card (active)
        if (diff === 0) return "translate-x-0 scale-100 opacity-100 z-[5]";

        // Right side cards
        if (diff === 1) return "translate-x-[35%] scale-95 opacity-90 z-[4]";
        if (diff === 2) return "translate-x-[70%] scale-90 opacity-70 z-[3]";
        if (diff === 3) return "translate-x-[105%] scale-85 opacity-50 z-[2]";

        // Left side cards
        if (diff === total - 1) return "translate-x-[-35%] scale-95 opacity-90 z-[4]";
        if (diff === total - 2) return "translate-x-[-70%] scale-90 opacity-70 z-[3]";
        if (diff === total - 3) return "translate-x-[-105%] scale-85 opacity-50 z-[2]";

        // Hidden cards
        return "scale-75 opacity-0 pointer-events-none z-[1]";
    };

    if (!items || items.length === 0) {
        return (
            <section className="w-full py-12 bg-transparent">
                <div className="text-center text-gray-500">No items to display</div>
            </section>
        );
    }

    return (
        <section
            id="ThreeDCarousel"
            className="w-full bg-transparent py-12 flex items-center justify-center overflow-hidden"
            style={{ position: 'relative', isolation: 'isolate', contain: 'layout' }}
        >
            <div className="w-full px-4 sm:px-6 lg:px-8 max-w-full" style={{ overflow: 'hidden' }}>
                {/* Optional Header */}
                {title && (
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                            {title}
                        </h2>
                        {subtitle && (
                            <p className="text-lg text-gray-600 mb-2">{subtitle}</p>
                        )}
                        {tagline && (
                            <p className="text-sm text-gray-500 max-w-3xl mx-auto">
                                {tagline}
                            </p>
                        )}
                    </div>
                )}

                <div
                    className="relative overflow-hidden h-[600px] md:h-[550px]"
                    onMouseEnter={() => setIsHovering(true)}
                    onMouseLeave={() => setIsHovering(false)}
                    onTouchStart={isMobileSwipe ? onTouchStart : undefined}
                    onTouchMove={isMobileSwipe ? onTouchMove : undefined}
                    onTouchEnd={isMobileSwipe ? onTouchEnd : undefined}
                    ref={carouselRef}
                    style={{ isolation: 'isolate', contain: 'layout style paint' }}
                >
                    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center" style={{ overflow: 'hidden' }}>
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className={`absolute top-0 w-full max-w-sm transform transition-all duration-700 ease-out ${getCardAnimationClass(
                                    index
                                )}`}
                                style={{
                                    transformStyle: 'preserve-3d',
                                    maxHeight: '100%',
                                }}
                            >
                                <Card
                                    className="overflow-hidden bg-white border border-gray-200 shadow-lg hover:shadow-xl flex flex-col transition-shadow duration-300"
                                    style={{ height: `${cardHeight}px` }}
                                >
                                    {/* Image Header */}
                                    <div
                                        className="relative bg-black p-6 flex items-center justify-center h-48 overflow-hidden"
                                        style={{
                                            backgroundImage: `url(${item.imageUrl})`,
                                            backgroundSize: "cover",
                                            backgroundPosition: "center",
                                        }}
                                    >
                                        <div className="absolute inset-0 bg-black/50" />
                                        <div className="relative z-10 text-center text-white">
                                            <h3 className="text-2xl font-bold mb-2">
                                                {item.brand?.toUpperCase() || 'BRAND'}
                                            </h3>
                                            <div className="w-12 h-1 bg-white mx-auto mb-2" />
                                            <p className="text-sm">{item.title}</p>
                                        </div>
                                    </div>

                                    {/* Card Content */}
                                    <CardContent className="p-6 flex flex-col flex-grow">
                                        <h3 className="text-xl font-bold mb-1 text-gray-900">
                                            {item.title}
                                        </h3>
                                        <p className="text-gray-500 text-sm font-medium mb-2">
                                            {item.brand}
                                        </p>
                                        <p className="text-gray-600 text-sm flex-grow line-clamp-3">
                                            {item.description}
                                        </p>

                                        <div className="mt-4">
                                            {/* Tags */}
                                            {item.tags && item.tags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {item.tags.map((tag, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                                                        >
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Learn More Link */}
                                            <a
                                                href={item.link}
                                                className="text-gray-700 flex items-center hover:text-gray-900 relative group font-medium"
                                                onClick={(e) => {
                                                    if (item.link?.startsWith("/")) {
                                                        window.scrollTo(0, 0);
                                                    }
                                                }}
                                            >
                                                <span className="relative z-10">Learn more</span>
                                                <ArrowRight className="ml-2 w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
                                                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-gray-700 transition-all duration-300 group-hover:w-full"></span>
                                            </a>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))}
                    </div>

                    {/* Navigation Arrows - Hidden on mobile */}
                    {!isMobile && items.length > 1 && (
                        <>
                            <button
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white z-40 shadow-lg transition-all hover:scale-110"
                                onClick={() =>
                                    setActive((prev) => (prev - 1 + items.length) % items.length)
                                }
                                aria-label="Previous"
                            >
                                <ChevronLeft className="w-6 h-6" />
                            </button>
                            <button
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-700 hover:bg-white z-40 shadow-lg transition-all hover:scale-110"
                                onClick={() => setActive((prev) => (prev + 1) % items.length)}
                                aria-label="Next"
                            >
                                <ChevronRight className="w-6 h-6" />
                            </button>
                        </>
                    )}

                    {/* Dot Indicators */}
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-40">
                        {items.map((_, idx) => (
                            <button
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-300 ${active === idx
                                        ? "bg-gray-700 w-8"
                                        : "bg-gray-300 hover:bg-gray-400 w-2"
                                    }`}
                                onClick={() => setActive(idx)}
                                aria-label={`Go to item ${idx + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ThreeDCarousel;
