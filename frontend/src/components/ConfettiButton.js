import React, { useEffect, useState, useRef } from "react";

const ConfettiButton = React.forwardRef(
  (
    {
      className = "",
      children,
      loading = false,
      confettiOptions = {
        particleCount: 100,
        spread: 70,
      },
      onClick,
      shouldTriggerConfetti = true, // New prop
      ...props
    },
    ref
  ) => {
    const [scriptLoaded, setScriptLoaded] = useState(false);
    const buttonRef = useRef(null);

    // Load confetti script dynamically
    useEffect(() => {
      if (!window.confetti) {
        const script = document.createElement("script");
        script.src =
          "https://cdn.jsdelivr.net/npm/canvas-confetti@1.4.0/dist/confetti.browser.min.js";
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
          if (script.parentNode) {
            script.parentNode.removeChild(script);
          }
        };
      } else {
        setScriptLoaded(true);
      }
    }, []);

    const triggerConfetti = () => {
      if (scriptLoaded && window.confetti && buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        window.confetti({
          ...confettiOptions,
          origin: { x, y },
        });
      }
    };

    return (
      <button
        ref={(node) => {
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
          buttonRef.current = node;
        }}
        className={className}
        onClick={(e) => {
          const result = onClick?.(e);
          // Only trigger confetti if onClick returns true or if shouldTriggerConfetti is true
          if (scriptLoaded && (result === true || (result !== false && shouldTriggerConfetti))) {
            triggerConfetti();
          }
        }}
        disabled={loading || props.disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

ConfettiButton.displayName = "ConfettiButton";

export default ConfettiButton;
