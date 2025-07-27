/**
 * Utility functions for class name manipulation
 */

export const cn = (
  ...classes: (string | undefined | null | false)[]
): string => {
  return classes.filter(Boolean).join(' ');
};

export const conditionalClass = (
  condition: boolean,
  trueClass: string,
  falseClass?: string,
): string => {
  return condition ? trueClass : falseClass || '';
};

export const variantClass = <T extends string>(
  variant: T,
  variantMap: Record<T, string>,
  defaultClass = '',
): string => {
  return variantMap[variant] || defaultClass;
};
