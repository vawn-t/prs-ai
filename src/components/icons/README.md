# Icon Components Documentation

This folder contains reusable SVG icon components for the PRs-AI Chrome extension.

## Available Icons

### 🔵 Status & UI Icons
- **CheckIcon** - Success/completion indicator
- **XIcon** - Error/close indicator  
- **ExclamationIcon** - Warning indicator
- **InfoIcon** - Information indicator

### 🔄 Action Icons
- **SpinnerIcon** - Loading/progress indicator (animated)
- **LoadingIcon** - Alternative loading spinner
- **RefreshIcon** - Regenerate/reload action
- **StarIcon** - Generate/favorite action
- **SettingsIcon** - Configuration/settings

## Usage

### In React Components
```tsx
import { CheckIcon, SpinnerIcon, SettingsIcon } from '@components/icons';

// Basic usage
<CheckIcon />

// With custom size and styling
<SpinnerIcon size={24} className="text-blue-500" />

// With additional props (all SVG props are supported)
<SettingsIcon size={20} onClick={handleClick} />
```

### In Content Scripts (vanilla JS/DOM)
```typescript
import { createIconElement } from '@utils';

// Create icon HTML string
const iconHTML = createIconElement('star', 16, 'custom-class');

// Use in innerHTML
button.innerHTML = `${iconHTML} Generate with AI`;
```

## Icon Props Interface

All icon components use the shared `IconProps` interface:

```typescript
interface IconProps {
  size?: number;        // Icon size in pixels (default: 16)
  className?: string;   // Additional CSS classes
  [key: string]: any;   // Any additional SVG attributes
}
```

## Icon Categories

### Status Icons
- `CheckIcon` - ✅ Success states, completed actions
- `XIcon` - ❌ Error states, close/cancel actions  
- `ExclamationIcon` - ⚠️ Warning states, important notices
- `InfoIcon` - ℹ️ Information states, help content

### Action Icons
- `StarIcon` - ⭐ Primary actions, favorites, generate
- `RefreshIcon` - 🔄 Refresh, regenerate, retry actions
- `SettingsIcon` - ⚙️ Configuration, preferences, options
- `SpinnerIcon` - ⏳ Loading states, progress indicators
- `LoadingIcon` - ⏳ Alternative loading animation

## Design Guidelines

### Size Standards
- **Small**: 12-14px (compact UI elements)
- **Medium**: 16px (default, most common)  
- **Large**: 20-24px (prominent actions)

### Accessibility
- All icons include `aria-hidden="true"` by default
- Use alongside descriptive text for screen readers
- Ensure sufficient color contrast (4.5:1 minimum)

### Styling
- Icons inherit text color via `fill="currentColor"`
- Use CSS classes for custom colors and animations
- Maintain consistent visual weight across icon set

## File Organization

```
src/components/icons/
├── index.ts              # Export all icons
├── CheckIcon.tsx         # Success/check icon
├── XIcon.tsx            # Error/close icon  
├── ExclamationIcon.tsx   # Warning icon
├── InfoIcon.tsx         # Information icon
├── SpinnerIcon.tsx      # Animated loading spinner
├── LoadingIcon.tsx      # Alternative loading animation
├── RefreshIcon.tsx      # Refresh/regenerate icon
├── StarIcon.tsx         # Star/generate icon
├── SettingsIcon.tsx     # Settings/gear icon
└── README.md           # This documentation
```

## Migration from Inline SVGs

When replacing inline SVGs with icon components:

1. **Identify the icon type** from the SVG path
2. **Import the appropriate component**
3. **Replace the SVG element** with the component
4. **Transfer size and className props**
5. **Remove the old SVG code**

### Before (inline SVG):
```tsx
<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
  <path d="M12 2l3.09 6.26L22 9.27..."/>
</svg>
```

### After (icon component):
```tsx
<StarIcon size={16} />
```

## Adding New Icons

1. **Create the component file** (e.g., `NewIcon.tsx`)
2. **Use the IconProps interface** for consistency
3. **Include aria-hidden="true"** for accessibility
4. **Export from index.ts**
5. **Add to content script utils** if needed for DOM usage
6. **Update this documentation**

### Template:
```tsx
import { IconProps } from '@types';

export const NewIcon = ({ 
  size = 16, 
  className = '',
  ...props 
}: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
    {...props}
  >
    <path d="..." />
  </svg>
);
```

## Best Practices

- ✅ Use semantic icon names (CheckIcon vs TickIcon)
- ✅ Provide default size of 16px for consistency
- ✅ Support className for custom styling
- ✅ Include TypeScript types for all props
- ✅ Use `currentColor` for automatic color inheritance
- ❌ Don't hardcode colors in SVG paths
- ❌ Don't include unnecessary SVG attributes
- ❌ Don't forget to export new icons from index.ts
