// global-settings.js
// Apply user settings across all pages
// Add this script to the <head> of app.html, prep.html, and capture.html

(function() {
  'use strict';

  // Apply saved theme
  const savedDarkMode = localStorage.getItem('loop-catcher-dark-mode');
  if (savedDarkMode === 'false') {
    document.documentElement.classList.add('light-mode');
  }

  // Apply saved font size
  const savedFontSize = localStorage.getItem('loop-catcher-font-size');
  if (savedFontSize) {
    document.documentElement.classList.add(`font-${savedFontSize}`);
  }

  // Apply saved layout density
  const savedLayoutDensity = localStorage.getItem('loop-catcher-layout-density');
  if (savedLayoutDensity && savedLayoutDensity !== 'normal') {
    document.documentElement.classList.add(`layout-${savedLayoutDensity}`);
  }
})();
