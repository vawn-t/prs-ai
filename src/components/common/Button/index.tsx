import { ButtonProps } from '@types';
import { cn, variantClass } from '@utils';
import { SpinnerIcon } from '../../icons';

const buttonVariants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white border-primary-600',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-red-600',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-transparent',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export const Button = ({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  type = 'button',
}: ButtonProps) => {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md border font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
        variantClass(variant, buttonVariants),
        variantClass(size, buttonSizes),
        isDisabled && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {loading && (
        <SpinnerIcon
          size={16}
          className='animate-spin -ml-1 mr-2 h-4 w-4 text-current'
        />
      )}
      {children}
    </button>
  );
};
