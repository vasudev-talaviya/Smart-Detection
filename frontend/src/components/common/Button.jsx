import React from 'react';

export default function Button({
  children,
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  variant = '', // e.g., 'primary', 'secondary', 'accent', 'error', 'ghost'
  size = '',    // e.g., 'sm', 'lg', 'xs'
  loading = false,
  ...props
}) {
  const baseClass = "btn";
  const variantClass = variant ? `btn-${variant}` : "";
  const sizeClass = size ? `btn-${size}` : "";
  
  // Prevent duplicate btn classes if className already includes them
  const finalClassName = `${baseClass} ${variantClass} ${sizeClass} ${className}`
    .split(' ')
    .filter((value, index, self) => value && self.indexOf(value) === index)
    .join(' ');

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
}
