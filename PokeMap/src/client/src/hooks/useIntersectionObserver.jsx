import { useEffect, useRef, useState } from 'react';

export default function useIntersectionObserver(options = {}) {
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [hasIntersected, setHasIntersected] = useState(false);
    const [direction, setDirection] = useState(null); // 'up', 'down', or null
    const ref = useRef(null);
    const previousTopRef = useRef(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                const currentTop = entry.boundingClientRect.top;
                const prevTop = previousTopRef.current;

                const wasIntersecting = isIntersecting;
                setIsIntersecting(entry.isIntersecting);

                if (entry.isIntersecting && !wasIntersecting) {
                    // Just entered viewport
                    if (prevTop !== null) {
                        if (currentTop > prevTop) {
                            // Scrolling up (element entering from above)
                            setDirection('up');
                        } else {
                            // Scrolling down (element entering from below)
                            setDirection('down');
                        }
                    } else {
                        setDirection('down'); // Default
                    }
                }

                if (entry.isIntersecting) {
                    setHasIntersected(true);
                }

                // Update previous top
                previousTopRef.current = currentTop;
            },
            {
                threshold: options.threshold || 0,
                root: options.root || null,
                rootMargin: options.rootMargin || '0px'
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [options.threshold, options.root, options.rootMargin, isIntersecting, hasIntersected]);

    return { ref, isIntersecting, hasIntersected, direction };
}