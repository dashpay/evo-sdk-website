/**
 * Theme management for Dash Platform Evo JS SDK website
 * Supports: light, dark, and system (auto) modes
 */

const THEME_KEY = 'evo-sdk-theme';
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// SVG icons for theme options
const ICONS = {
  sun: `<svg class="theme-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>`,
  moon: `<svg class="theme-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>`,
  system: `<svg class="theme-option-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
    <line x1="8" y1="21" x2="16" y2="21"></line>
    <line x1="12" y1="17" x2="12" y2="21"></line>
  </svg>`
};

/**
 * Get the system's preferred color scheme
 */
function getSystemTheme() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return THEMES.DARK;
  }
  return THEMES.LIGHT;
}

/**
 * Get the stored theme preference
 */
function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

/**
 * Store theme preference
 */
function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage not available
  }
}

/**
 * Get the effective theme to apply
 */
function getEffectiveTheme(preference) {
  if (preference === THEMES.SYSTEM || !preference) {
    return getSystemTheme();
  }
  return preference;
}

/**
 * Apply theme to document
 */
function applyTheme(theme) {
  const effectiveTheme = getEffectiveTheme(theme);
  document.documentElement.setAttribute('data-theme', effectiveTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', effectiveTheme === THEMES.DARK ? '#0f3460' : '#2c3e50');
  }
}

/**
 * Initialize theme on page load
 */
function initTheme() {
  const storedTheme = getStoredTheme() || THEMES.SYSTEM;
  applyTheme(storedTheme);
  return storedTheme;
}

/**
 * Set up system theme change listener
 */
function setupSystemThemeListener(callback) {
  if (window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      const storedTheme = getStoredTheme();
      if (storedTheme === THEMES.SYSTEM || !storedTheme) {
        applyTheme(THEMES.SYSTEM);
        if (callback) callback(THEMES.SYSTEM);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Legacy support
      mediaQuery.addListener(handler);
    }
  }
}

/**
 * Create and inject theme selector UI
 */
function createThemeSelector(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const currentTheme = getStoredTheme() || THEMES.SYSTEM;

  const selector = document.createElement('div');
  selector.className = 'theme-selector';
  selector.innerHTML = `
    <button class="theme-selector-btn" aria-label="Select theme" aria-haspopup="true" aria-expanded="false">
      <span class="theme-btn-icon">${getIconForTheme(currentTheme)}</span>
      <span class="theme-btn-label">${getLabelForTheme(currentTheme)}</span>
    </button>
    <div class="theme-dropdown" role="menu">
      <button class="theme-option ${currentTheme === THEMES.LIGHT ? 'active' : ''}" data-theme="${THEMES.LIGHT}" role="menuitem">
        ${ICONS.sun}
        <span>Light</span>
      </button>
      <button class="theme-option ${currentTheme === THEMES.DARK ? 'active' : ''}" data-theme="${THEMES.DARK}" role="menuitem">
        ${ICONS.moon}
        <span>Dark</span>
      </button>
      <button class="theme-option ${currentTheme === THEMES.SYSTEM ? 'active' : ''}" data-theme="${THEMES.SYSTEM}" role="menuitem">
        ${ICONS.system}
        <span>System</span>
      </button>
    </div>
  `;

  container.appendChild(selector);

  // Set up event listeners
  const btn = selector.querySelector('.theme-selector-btn');
  const dropdown = selector.querySelector('.theme-dropdown');
  const options = selector.querySelectorAll('.theme-option');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.contains('open');
    dropdown.classList.toggle('open');
    btn.setAttribute('aria-expanded', !isOpen);
  });

  options.forEach(option => {
    option.addEventListener('click', () => {
      const theme = option.dataset.theme;
      setTheme(theme, selector);
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    dropdown.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });

  // Keyboard navigation
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });

  return selector;
}

/**
 * Set theme and update UI
 */
function setTheme(theme, selectorElement) {
  storeTheme(theme);
  applyTheme(theme);

  if (selectorElement) {
    // Update button display
    const btnIcon = selectorElement.querySelector('.theme-btn-icon');
    const btnLabel = selectorElement.querySelector('.theme-btn-label');
    if (btnIcon) btnIcon.innerHTML = getIconForTheme(theme);
    if (btnLabel) btnLabel.textContent = getLabelForTheme(theme);

    // Update active state
    const options = selectorElement.querySelectorAll('.theme-option');
    options.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
  }
}

/**
 * Get icon for theme
 */
function getIconForTheme(theme) {
  switch (theme) {
    case THEMES.LIGHT:
      return ICONS.sun;
    case THEMES.DARK:
      return ICONS.moon;
    default:
      return ICONS.system;
  }
}

/**
 * Get label for theme
 */
function getLabelForTheme(theme) {
  switch (theme) {
    case THEMES.LIGHT:
      return 'Light';
    case THEMES.DARK:
      return 'Dark';
    default:
      return 'System';
  }
}

// Initialize theme immediately to prevent flash
initTheme();

// Export for use in modules
if (typeof window !== 'undefined') {
  window.ThemeManager = {
    THEMES,
    initTheme,
    applyTheme,
    setTheme,
    getStoredTheme,
    getSystemTheme,
    getEffectiveTheme,
    createThemeSelector,
    setupSystemThemeListener
  };
}

// Auto-initialize theme selector when DOM is ready
(function() {
  function initThemeUI() {
    const container = document.getElementById('themeToggle');
    if (container && window.ThemeManager) {
      window.ThemeManager.createThemeSelector('themeToggle');
      window.ThemeManager.setupSystemThemeListener();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeUI);
  } else {
    initThemeUI();
  }
})();
