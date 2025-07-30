// Component Props Types
export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'password' | 'email' | 'url' | 'number';
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  multiline?: boolean;
  rows?: number;
  min?: number;
  max?: number;
}

export interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export interface StatusIndicatorProps {
  status: 'success' | 'error' | 'warning' | 'loading' | 'idle';
  message?: string;
  showIcon?: boolean;
  className?: string;
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'caption' | 'error' | 'success' | 'warning' | 'muted';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

export interface IconProps {
  size?: number;
  className?: string;
  [key: string]: any; // Allow additional SVG props
}
