import { useEffect } from 'react';

export const useLoadBundle = () => {
  useEffect(() => {
    const loader: HTMLDivElement | null = document.querySelector('.bndloader');
    if (loader) {
      loader.style.display = 'none';
    }
  }, []);
};

export const loadFonts = () => {
  const link = document.createElement('link');
  link.href =
    'https://fonts.googleapis.com/css?family=Open+Sans:400,700|Inter:400,500,700&display=swap';
  link.rel = 'stylesheet';
  document.head.appendChild(link);
};

export const lazyLoadFonts = () => {
  if (document.readyState === 'loading') {
    //   // Loading hasn't finished yet
    document.addEventListener('DOMContentLoaded', loadFonts);
  } else {
    //   // `DOMContentLoaded` has already fired
    loadFonts();
  }
};
