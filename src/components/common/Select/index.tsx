import { useId } from 'react';

import { SelectProps } from '@types';
import { cn } from '@utils';

export const Select = ({
  value,
  onChange,
  options,
  placeholder = '',
  disabled = false,
  error = '',
  label = '',
  required = false,
  className = '',
}: SelectProps) => {
  const selectId = useId();

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      <select
        id={selectId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className={cn(
          'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white',
          'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
          'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
          'transition-colors duration-200',
        )}
      >
        {placeholder && (
          <option value='' disabled>
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            disabled={option.disabled}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className='text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};
