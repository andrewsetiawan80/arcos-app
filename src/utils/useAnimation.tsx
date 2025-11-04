import { useEffect, useRef, useState } from "react";

/**
 * Hook for scroll-triggered fade-in animations
 */
export function useFadeIn(options?: { delay?: number; threshold?: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: options?.threshold || 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options?.threshold]);

  return { ref, isVisible };
}

/**
 * Hook for staggered animations in lists/grids
 */
export function useStaggeredAnimation(count: number, delay = 100) {
  const [visibleCount, setVisibleCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Animate items one by one
          for (let i = 0; i < count; i++) {
            setTimeout(() => {
              setVisibleCount((prev) => Math.max(prev, i + 1));
            }, i * delay);
          }
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -100px 0px",
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [count, delay]);

  return { ref, visibleCount };
}


