import React from 'react';
import { InputProps } from '@types';
import { cn } from '@utils';

export const Input = ({
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error = '',
  label = '',
  required = false,
  className = '',
  multiline = false,
  rows = 3,
  min,
  max,
}: InputProps) => {
  const inputId = React.useId();

  const baseClasses = cn(
    'block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400',
    'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
    'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
    error && 'border-red-500 focus:border-red-500 focus:ring-red-500',
    'transition-colors duration-200',
  );

  return (
    <div className={cn('space-y-1', className)}>
      {label && (
        <label
          htmlFor={inputId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
          {required && <span className='text-red-500 ml-1'>*</span>}
        </label>
      )}

      {multiline ? (
        <textarea
          id={inputId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          rows={rows}
          className={baseClasses}
        />
      ) : (
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          min={min}
          max={max}
          className={baseClasses}
        />
      )}

      {error && (
        <p className='text-sm text-red-600' role='alert'>
          {error}
        </p>
      )}
    </div>
  );
};
