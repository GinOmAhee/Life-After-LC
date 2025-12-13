// global-settings.js
// Apply user settings across all pages
// Add this script to the <head> of app.html, prep.html, and capture.html

(function() {
  'use strict';

  document.addEventListener("DOMContentLoaded", function() {

    // Apply saved theme
    const savedDarkMode = localStorage.getItem('loop-catcher-dark-mode');
    if (savedDarkMode === 'false') {
      document.documentElement.classList.add('light-mode');
      document.body.classList.add('light-mode');
    }

    // Apply saved font size
    const savedFontSize = localStorage.getItem('loop-catcher-font-size');
    if (savedFontSize) {
      document.documentElement.classList.add(`font-${savedFontSize}`);
      document.body.classList.add(`font-${savedFontSize}`);
    
      // Also apply direct font-size changes
      const multipliers = { small: 0.875, medium: 1, large: 1.125 };
      const baseSize = 16;
      const newSize = baseSize * (multipliers[savedFontSize] || 1);
      document.documentElement.style.fontSize = `${newSize}px`;
    }

    // Apply saved layout density
    const savedLayoutDensity = localStorage.getItem('loop-catcher-layout-density');
    if (savedLayoutDensity && savedLayoutDensity !== 'normal') {
      document.documentElement.classList.add(`layout-${savedLayoutDensity}`);
      document.body.classList.add(`layout-${savedLayoutDensity}`);
    }

    console.log('✅ Global settings applied:', {
      darkMode: savedDarkMode,
      fontSize: savedFontSize,
      layoutDensity: savedLayoutDensity
    });

  });
    
})();
