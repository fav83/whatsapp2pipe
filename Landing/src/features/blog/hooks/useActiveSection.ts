import { useState, useEffect } from 'react';

/**
 * Hook that tracks which section heading is currently active in the viewport.
 * Uses IntersectionObserver to detect when headings enter/exit the viewport.
 *
 * @param headingIds - Array of heading element IDs to observe
 * @returns The currently active heading ID, or null if none visible
 */
export function useActiveSection(headingIds: string[]): string | null {
  // Default to first heading
  const [activeId, setActiveId] = useState<string | null>(
    headingIds.length > 0 ? headingIds[0] : null
  );

  useEffect(() => {
    if (headingIds.length === 0) return;

    const visibleHeadings = new Set<string>();

    const handleIntersect = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          visibleHeadings.add(id);
        } else {
          visibleHeadings.delete(id);
        }
      });

      // Find the first visible heading based on document order
      const firstVisible = headingIds.find((id) => visibleHeadings.has(id));
      // Keep current active if nothing visible, or default to first
      if (firstVisible) {
        setActiveId(firstVisible);
      } else if (visibleHeadings.size === 0) {
        // If scrolled past all headings or at top, use scroll position to determine
        const scrollY = window.scrollY;
        if (scrollY < 200) {
          setActiveId(headingIds[0]);
        }
      }
    };

    // Create observer with offset for fixed header
    const observer = new IntersectionObserver(handleIntersect, {
      rootMargin: '-80px 0px -60% 0px',
      threshold: 0,
    });

    // Observe all heading elements
    let foundElements = 0;
    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
        foundElements++;
      }
    });

    // If no elements found, IDs might not match - keep first as default
    if (foundElements === 0 && headingIds.length > 0) {
      setActiveId(headingIds[0]);
    }

    return () => {
      observer.disconnect();
    };
  }, [headingIds]);

  return activeId;
}
