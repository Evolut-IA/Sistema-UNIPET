// Hook para gerenciar estado de scroll personalizado
import { useEffect, useRef } from 'react';

export const useCustomScrollbar = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    let scrollTimeout: NodeJS.Timeout;
    let hoverTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      scrollElement.classList.add('scrolling');
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        scrollElement.classList.remove('scrolling');
      }, 300);
    };

    const handleMouseEnter = () => {
      clearTimeout(hoverTimeout);
      scrollElement.classList.add('hovering');
    };

    const handleMouseLeave = () => {
      hoverTimeout = setTimeout(() => {
        scrollElement.classList.remove('hovering');
      }, 300);
    };

    scrollElement.addEventListener('scroll', handleScroll);
    scrollElement.addEventListener('mouseenter', handleMouseEnter);
    scrollElement.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      scrollElement.removeEventListener('mouseenter', handleMouseEnter);
      scrollElement.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(scrollTimeout);
      clearTimeout(hoverTimeout);
    };
  }, []);

  return scrollRef;
};