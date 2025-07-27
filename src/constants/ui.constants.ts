// UI Constants
export const UI_CLASSES = {
  CONTAINER: 'prs-ai-container',
  BUTTON_GROUP: 'prs-ai-button-group',
  GENERATE_BTN: 'prs-ai-generate-btn',
  REGENERATE_BTN: 'prs-ai-regenerate-btn',
  SETTINGS_BTN: 'prs-ai-settings-btn',
  STATUS: 'prs-ai-status',
} as const;

// Status Types
export const STATUS_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  LOADING: 'loading',
  IDLE: 'idle',
} as const;

// Button Variants
export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  DANGER: 'danger',
  GHOST: 'ghost',
} as const;

// Component Sizes
export const SIZES = {
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
} as const;

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
