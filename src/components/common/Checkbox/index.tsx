import React from 'react';
import { cn } from '@utils';
import { CheckIcon } from '../../icons';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
  className?: string;
  id?: string;
}

export const Checkbox = ({
  checked,
  onChange,
  label,
  disabled = false,
  error,
  className = '',
  id,
}: CheckboxProps) => {
  const checkboxId = id || React.useId();

  return (
    <div className={cn('flex items-start space-x-2', className)}>
      <div className='relative flex items-center'>
        <input
          type='checkbox'
          id={checkboxId}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className='sr-only'
        />
        <div
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded border cursor-pointer transition-colors',
            'border-gray-300 bg-white',
            'focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2',
            checked && 'bg-primary-600 border-primary-600',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'border-red-500',
          )}
          onClick={() => !disabled && onChange(!checked)}
        >
          {checked && <CheckIcon size={12} className='text-white' />}
        </div>
      </div>

      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            'text-sm text-gray-700 cursor-pointer select-none',
            disabled && 'cursor-not-allowed opacity-50',
            error && 'text-red-600',
          )}
        >
          {label}
        </label>
      )}

      {error && (
        <p className='text-sm text-red-600 mt-1' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};
