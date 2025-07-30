interface CheckIconProps {
  className?: string;
  size?: number;
}

export const CheckIcon = ({ className = '', size = 16 }: CheckIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 16 16'
    fill='currentColor'
    className={className}
    aria-hidden='true'
  >
    <path
      fillRule='evenodd'
      d='M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z'
      clipRule='evenodd'
    />
  </svg>
);
