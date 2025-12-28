import React, { useEffect, useRef } from 'react';
import '../styles/Snowfall.css';

const Snowfall = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let snowflakes = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Snowflake class
    class Snowflake {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * -canvas.height;
        this.radius = Math.random() * 3 + 1; // Size between 1-4px
        this.speed = Math.random() * 1 + 0.5; // Fall speed
        this.wind = Math.random() * 0.5 - 0.25; // Horizontal drift
        this.opacity = Math.random() * 0.6 + 0.4; // Opacity between 0.4-1
      }

      update() {
        this.y += this.speed;
        this.x += this.wind;

        // Reset snowflake when it goes off screen
        if (this.y > canvas.height) {
          this.reset();
          this.y = -10;
        }

        if (this.x > canvas.width + 10) {
          this.x = -10;
        } else if (this.x < -10) {
          this.x = canvas.width + 10;
        }
      }

      draw() {
        // Add shadow for better visibility on white background
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Draw outer glow (light blue tint)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 220, 255, ${this.opacity * 0.4})`;
        ctx.fill();
        ctx.closePath();
        
        // Draw main snowflake (slightly off-white with blue tint)
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 248, 255, ${this.opacity})`;
        ctx.fill();
        ctx.closePath();
        
        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      }
    }

    // Create snowflakes (adjust number for performance)
    const createSnowflakes = () => {
      const numberOfSnowflakes = Math.min(150, Math.floor((canvas.width * canvas.height) / 10000));
      snowflakes = [];
      for (let i = 0; i < numberOfSnowflakes; i++) {
        snowflakes.push(new Snowflake());
      }
    };
    createSnowflakes();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      snowflakes.forEach(snowflake => {
        snowflake.update();
        snowflake.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="snowfall-canvas" />;
};

export default Snowfall;
