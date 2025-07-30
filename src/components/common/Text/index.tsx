import { cn } from '@utils';

interface TextProps {
  children: React.ReactNode;
  variant?: 'body' | 'caption' | 'error' | 'success' | 'warning' | 'muted';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  className?: string;
  as?: 'p' | 'span' | 'div';
}

const variantClasses = {
  body: 'text-gray-900',
  caption: 'text-gray-600',
  error: 'text-red-600',
  success: 'text-green-600',
  warning: 'text-yellow-600',
  muted: 'text-gray-500',
};

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = ({
  children,
  variant = 'body',
  size = 'base',
  weight = 'normal',
  className = '',
  as: Component = 'p',
}: TextProps) => {
  const classes = cn(
    variantClasses[variant],
    sizeClasses[size],
    weightClasses[weight],
    className,
  );

  return <Component className={classes}>{children}</Component>;
};
