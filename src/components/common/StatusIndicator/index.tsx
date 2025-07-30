import { StatusIndicatorProps } from '@types';
import { cn, variantClass } from '@utils';
import { LoadingSpinner } from '../LoadingSpinner';
import { CheckIcon, ExclamationIcon, InfoIcon, XIcon } from '../../icons';

const statusVariants = {
  success: 'bg-green-50 text-green-800 border-green-200',
  error: 'bg-red-50 text-red-800 border-red-200',
  warning: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  loading: 'bg-blue-50 text-blue-800 border-blue-200',
  idle: 'bg-gray-50 text-gray-800 border-gray-200',
};

const iconMap = {
  success: <CheckIcon size={16} />,
  error: <XIcon size={16} />,
  warning: <ExclamationIcon size={16} />,
  loading: <LoadingSpinner size='sm' />,
  idle: <InfoIcon size={16} />,
};

export const StatusIndicator = ({
  status,
  message = '',
  showIcon = true,
  className = '',
}: StatusIndicatorProps) => {
  if (!message && status === 'idle') {
    return null;
  }

  const roleProps = status === 'error' ? { role: 'alert' as const } : {};

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium',
        variantClass(status, statusVariants),
        className,
      )}
      {...roleProps}
    >
      {showIcon && iconMap[status]}
      {message && <span>{message}</span>}
    </div>
  );
};
